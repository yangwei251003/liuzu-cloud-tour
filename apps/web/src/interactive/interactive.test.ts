import { describe, expect, it, vi } from 'vitest';

import {
  createMapAdapter,
  createMockMapAdapter,
  loadAmapSdk,
} from './mapAdapter';
import {
  createStampRepository,
  createVisibilityStampTimer,
  getStampMilestone,
} from './stampProgress';
import {
  createViewerAdapter,
  getSpotViewerMedia,
  getViewerMetadata,
  getViewerStatusCopy,
} from './viewerAdapter';

describe('map adapters', () => {
  it('uses AMap only when a key exists and the browser is online', () => {
    expect(createMapAdapter({ key: 'demo-key', online: true }).kind).toBe(
      'amap',
    );
    expect(createMapAdapter({ key: '', online: true }).kind).toBe('mock');
    expect(createMapAdapter({ key: 'demo-key', online: false }).kind).toBe(
      'mock',
    );
  });

  it('keeps six routes searchable without inventing coordinates', () => {
    const adapter = createMockMapAdapter();
    expect(adapter.routes).toHaveLength(6);
    expect(
      adapter.spots.every(
        (spot) =>
          spot.location.latitude === undefined &&
          spot.location.longitude === undefined,
      ),
    ).toBe(true);
    expect(adapter.search('国恩寺').map((spot) => spot.id)).toEqual([
      'guo-en-temple',
    ]);
  });

  it('synchronizes visible records through the adapter contract', () => {
    const adapter = createMockMapAdapter();
    adapter.updateVisibleState(['guo-en-temple'], 'zen-one-day');
    expect(adapter.visibleSpotIds).toEqual(['guo-en-temple']);
    expect(adapter.visibleRouteId).toBe('zen-one-day');
  });

  it('removes a failed SDK script so retry can create a clean request', async () => {
    const first = loadAmapSdk('bad-key', undefined, 1_000);
    const failed = document.querySelector<HTMLScriptElement>(
      'script[data-liuzu-amap]',
    );
    expect(failed).not.toBeNull();
    failed?.dispatchEvent(new Event('error'));
    await expect(first).rejects.toThrow('网络或域名校验失败');
    expect(document.querySelector('script[data-liuzu-amap]')).toBeNull();
    const retry = loadAmapSdk('retry-key', undefined, 1_000);
    const replacement = document.querySelector<HTMLScriptElement>(
      'script[data-liuzu-amap]',
    );
    expect(replacement).not.toBe(failed);
    replacement?.dispatchEvent(new Event('error'));
    await expect(retry).rejects.toThrow();
  });
});

describe('viewer adapters', () => {
  it('selects the correct viewer and stays unavailable without a model', () => {
    expect(createViewerAdapter({ format: 'ply', src: '/model.ply' }).kind).toBe(
      'ply',
    );
    expect(
      createViewerAdapter({ format: '3dgs', src: '/model.splat' }).kind,
    ).toBe('gaussian-splat');
    expect(createViewerAdapter(undefined).kind).toBe('unavailable');
    expect(createViewerAdapter({ format: 'ply' }).controlsEnabled).toBe(false);
    expect(
      createViewerAdapter({ format: 'ply', src: '/model.ply' }).controlsEnabled,
    ).toBe(false);
  });

  it('keeps configured 3DGS assets unsupported without a dedicated renderer', async () => {
    const viewer = createViewerAdapter({ format: '3dgs', src: '/model.splat' });
    expect(viewer.kind).toBe('gaussian-splat');
    expect(viewer.capabilities).toEqual({
      supported: false,
      renderer: 'none',
      reason: '3DGS 专用渲染器未安装',
    });
    await expect(viewer.load(document.createElement('div'))).resolves.toBe(
      'unavailable',
    );
    expect(viewer.controlsEnabled).toBe(false);
  });

  it('selects an injected 3DGS renderer without rewriting the viewer page', () => {
    const injected = {
      kind: 'gaussian-splat' as const,
      controlsEnabled: false,
      state: 'idle' as const,
      message: '',
      capabilities: { supported: true, renderer: 'test-renderer' },
      load: vi.fn(),
      reset: vi.fn(),
      orbit: vi.fn(),
      zoom: vi.fn(),
      screenshot: vi.fn(),
      fullscreen: vi.fn(),
      retry: vi.fn(),
      dispose: vi.fn(),
    };
    const factory = vi.fn(() => injected);
    expect(
      createViewerAdapter(
        { format: '3dgs', src: '/model.splat' },
        { splatRendererFactory: factory },
      ),
    ).toBe(injected);
    expect(factory).toHaveBeenCalledWith('/model.splat');
  });

  it('resolves model descriptors from spot-specific configuration only', () => {
    expect(getSpotViewerMedia('guo-en-temple', {})).toBeUndefined();
    expect(
      getSpotViewerMedia('guo-en-temple', {
        guoEnTemplePly: '/models/temple.ply',
      }),
    ).toEqual({ format: 'ply', src: '/models/temple.ply' });
    expect(
      getSpotViewerMedia('cang-fo-pit', {
        cangFoPitSplat: '/models/pit.splat',
      }),
    ).toEqual({ format: '3dgs', src: '/models/pit.splat' });
  });

  it('derives viewer copy from adapter kind and state', () => {
    expect(getViewerStatusCopy('ply', 'loading')).toEqual({
      title: '正在加载 PLY 模型',
      detail: '加载期间查看控制暂不可用。',
    });
    expect(getViewerStatusCopy('gaussian-splat', 'error').title).toBe(
      '3DGS 查看暂不可用',
    );
    expect(getViewerStatusCopy('unavailable', 'unavailable').title).toBe(
      '真实 3D 模型待接入',
    );
  });

  it('derives sidebar metadata from the active descriptor and state', () => {
    expect(
      getViewerMetadata('ply', 'ready', { format: 'ply', src: '/model.ply' }),
    ).toEqual({ adapter: 'PLY 查看器', format: 'PLY', state: '已就绪' });
    expect(getViewerMetadata('unavailable', 'unavailable', undefined)).toEqual({
      adapter: '不可用降级',
      format: '未配置',
      state: '待接入',
    });
    expect(
      getViewerMetadata(
        'gaussian-splat',
        'unavailable',
        { format: '3dgs', src: '/model.splat' },
        {
          supported: false,
          renderer: 'none',
          reason: '3DGS 专用渲染器未安装',
        },
      ).adapter,
    ).toBe('3DGS 不支持（渲染器未安装）');
  });

  it('exposes a unified lifecycle and honest unavailable state', async () => {
    const viewer = createViewerAdapter(undefined);
    await expect(viewer.load(document.createElement('div'))).resolves.toBe(
      'unavailable',
    );
    expect(viewer.state).toBe('unavailable');
    expect(viewer.reset()).toBe(false);
    expect(viewer.orbit(1, 1)).toBe(false);
    expect(viewer.zoom(1)).toBe(false);
    await expect(viewer.screenshot()).resolves.toBeUndefined();
    await expect(
      viewer.fullscreen(document.createElement('div')),
    ).resolves.toBe(false);
    await expect(viewer.retry()).resolves.toBe('unavailable');
    expect(() => viewer.dispose()).not.toThrow();
  });
});

describe('stamp progress', () => {
  it('persists only valid stamp ids in a versioned envelope', () => {
    const storage = new Map<string, string>();
    const storageLike = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    };
    const repository = createStampRepository(storageLike);
    repository.write(['guo-en-temple', 'not-valid', 'guo-en-temple']);
    expect(repository.read()).toEqual(['guo-en-temple']);
    expect(storage.get('liuzu-cloud-tour:stamps')).toContain('"version":1');
  });

  it('unlocks the card at 4/7 and certificate at 7/7', () => {
    expect(getStampMilestone(3)).toEqual({ card: false, certificate: false });
    expect(getStampMilestone(4)).toEqual({ card: true, certificate: false });
    expect(getStampMilestone(7)).toEqual({ card: true, certificate: true });
  });

  it('requires 30 continuously visible seconds and resets after hiding', () => {
    vi.useFakeTimers();
    const onUnlock = vi.fn();
    let visible = true;
    const timer = createVisibilityStampTimer({
      durationMs: 30_000,
      isVisible: () => visible,
      onUnlock,
    });
    timer.start();
    vi.advanceTimersByTime(29_999);
    expect(onUnlock).not.toHaveBeenCalled();
    visible = false;
    timer.visibilityChanged();
    vi.advanceTimersByTime(10_000);
    visible = true;
    timer.visibilityChanged();
    vi.advanceTimersByTime(30_000);
    expect(onUnlock).toHaveBeenCalledTimes(1);
    timer.stop();
    vi.useRealTimers();
  });
});
