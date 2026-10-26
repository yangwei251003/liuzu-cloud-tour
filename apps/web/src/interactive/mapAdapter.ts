import { publicRoutes, publicSpots } from '../public/content';

export type MapAdapterKind = 'amap' | 'mock';
export type MapAdapterState = 'idle' | 'loading' | 'ready' | 'error';

export interface MapAdapterOptions { key?: string; securityCode?: string; online: boolean; }

export interface MapAdapter {
  readonly kind: MapAdapterKind;
  state: MapAdapterState;
  error?: string;
  readonly spots: typeof publicSpots;
  readonly routes: typeof publicRoutes;
  visibleSpotIds: string[];
  visibleRouteId?: string;
  search(query: string): typeof publicSpots;
  updateVisibleState(spotIds: string[], routeId?: string): void;
  mount(container: HTMLElement): Promise<MapAdapterState>;
  retry(container: HTMLElement): Promise<MapAdapterState>;
  dispose(): void;
}

interface AMapInstance { destroy(): void; add(items: unknown[]): void; clearMap(): void; setFitView(): void; }
interface AMapGlobal {
  Map: new (container: HTMLElement, options: Record<string, unknown>) => AMapInstance;
  Marker: new (options: Record<string, unknown>) => unknown;
  Polyline: new (options: Record<string, unknown>) => unknown;
}

declare global {
  interface Window { AMap?: AMapGlobal; _AMapSecurityConfig?: { securityJsCode: string }; }
}

function searchSpots(query: string) {
  const normalized = query.trim().toLocaleLowerCase('zh-CN');
  if (!normalized) return publicSpots;
  return publicSpots.filter((spot) =>
    [spot.name, spot.town, spot.category, ...spot.tags].join(' ').toLocaleLowerCase('zh-CN').includes(normalized),
  );
}

export function loadAmapSdk(key: string, securityCode?: string, timeoutMs = 8_000): Promise<AMapGlobal> {
  if (window.AMap) return Promise.resolve(window.AMap);
  if (securityCode) window._AMapSecurityConfig = { securityJsCode: securityCode };
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-liuzu-amap]');
    const script = existing ?? document.createElement('script');
    const timeout = setTimeout(() => fail('SDK 加载超时'), timeoutMs);
    const cleanup = () => {
      clearTimeout(timeout);
      script.removeEventListener('load', onLoad);
      script.removeEventListener('error', onError);
    };
    const fail = (message: string) => { cleanup(); script.remove(); reject(new Error(message)); };
    const onLoad = () => { if (window.AMap) { cleanup(); resolve(window.AMap); } else fail('SDK 未返回地图对象'); };
    const onError = () => fail('SDK 网络或域名校验失败');
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    if (!existing) {
      script.dataset.liuzuAmap = 'true';
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}`;
      script.async = true;
      document.head.append(script);
    }
  });
}

class MockMapAdapter implements MapAdapter {
  readonly kind = 'mock' as const;
  state: MapAdapterState = 'ready';
  readonly spots = publicSpots;
  readonly routes = publicRoutes;
  visibleSpotIds = publicSpots.map(({ id }) => id);
  visibleRouteId?: string;
  search = searchSpots;
  updateVisibleState(ids: string[], routeId?: string) { this.visibleSpotIds = [...ids]; this.visibleRouteId = routeId; }
  async mount() { return this.state; }
  async retry() { return this.state; }
  dispose() { this.state = 'idle'; }
}

class AmapMapAdapter implements MapAdapter {
  readonly kind = 'amap' as const;
  state: MapAdapterState = 'idle';
  error?: string;
  readonly spots = publicSpots;
  readonly routes = publicRoutes;
  visibleSpotIds = publicSpots.map(({ id }) => id);
  visibleRouteId?: string;
  search = searchSpots;
  private map?: AMapInstance;
  private sdk?: AMapGlobal;

  constructor(private readonly options: Required<Pick<MapAdapterOptions, 'key'>> & MapAdapterOptions) {}

  async mount(container: HTMLElement) {
    this.state = 'loading';
    this.error = undefined;
    try {
      this.sdk = await loadAmapSdk(this.options.key, this.options.securityCode);
      this.map?.destroy();
      this.map = new this.sdk.Map(container, { viewMode: '2D', zoom: 10 });
      this.state = 'ready';
      this.renderVisibleState();
    } catch (error) {
      this.error = error instanceof Error ? error.message : '在线地图加载失败';
      this.state = 'error';
    }
    return this.state;
  }

  updateVisibleState(ids: string[], routeId?: string) {
    this.visibleSpotIds = [...ids];
    this.visibleRouteId = routeId;
    if (this.state === 'ready') this.renderVisibleState();
  }

  private renderVisibleState() {
    if (!this.map || !this.sdk) return;
    this.map.clearMap();
    const geocoded = this.spots.filter(
      (spot) => this.visibleSpotIds.includes(spot.id) && spot.location.longitude !== undefined && spot.location.latitude !== undefined,
    );
    const markers = geocoded.map((spot) => new this.sdk!.Marker({ position: [spot.location.longitude, spot.location.latitude], title: spot.name }));
    const routes = this.visibleRouteId ? this.routes.filter(({ id }) => id === this.visibleRouteId) : [];
    const lines = routes.flatMap((route) => {
      const path = route.stopIds.flatMap((spotId) => {
        const spot = geocoded.find(({ id }) => id === spotId);
        return spot ? [[spot.location.longitude, spot.location.latitude]] : [];
      });
      return path.length > 1 ? [new this.sdk!.Polyline({ path, strokeColor: '#a77c32', strokeWeight: 5 })] : [];
    });
    this.map.add([...markers, ...lines]);
    if (markers.length) this.map.setFitView();
  }

  retry(container: HTMLElement) { return this.mount(container); }
  dispose() { this.map?.destroy(); this.map = undefined; this.sdk = undefined; this.state = 'idle'; }
}

export function createMockMapAdapter(): MapAdapter { return new MockMapAdapter(); }
export function createMapAdapter(options: MapAdapterOptions): MapAdapter {
  return options.key?.trim() && options.online ? new AmapMapAdapter({ ...options, key: options.key.trim() }) : createMockMapAdapter();
}
