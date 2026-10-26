import type { Object3D, PerspectiveCamera, WebGLRenderer } from 'three';

export type ViewerKind = 'ply' | 'gaussian-splat' | 'unavailable';
export type ViewerState =
  'idle' | 'loading' | 'ready' | 'error' | 'unavailable';

export interface ViewerMedia {
  format: 'ply' | '3dgs';
  src?: string;
}

export interface ViewerMediaConfig {
  guoEnTemplePly?: string;
  cangFoPitSplat?: string;
  taJiaoVillagePly?: string;
  zenCultureZoneSplat?: string;
}

export function getSpotViewerMedia(
  spotId: string | undefined,
  config: ViewerMediaConfig,
): ViewerMedia | undefined {
  if (spotId === 'guo-en-temple' && config.guoEnTemplePly)
    return { format: 'ply', src: config.guoEnTemplePly };
  if (spotId === 'cang-fo-pit' && config.cangFoPitSplat)
    return { format: '3dgs', src: config.cangFoPitSplat };
  if (spotId === 'ta-jiao-village' && config.taJiaoVillagePly)
    return { format: 'ply', src: config.taJiaoVillagePly };
  if (spotId === 'zen-culture-zone' && config.zenCultureZoneSplat)
    return { format: '3dgs', src: config.zenCultureZoneSplat };
  return undefined;
}

export interface ViewerAdapter {
  readonly kind: ViewerKind;
  readonly controlsEnabled: boolean;
  readonly capabilities: ViewerCapabilities;
  state: ViewerState;
  message: string;
  load(container: HTMLElement): Promise<ViewerState>;
  reset(): boolean;
  orbit(deltaX: number, deltaY: number): boolean;
  zoom(delta: number): boolean;
  screenshot(): Promise<Blob | undefined>;
  fullscreen(container: HTMLElement): Promise<boolean>;
  retry(): Promise<ViewerState>;
  dispose(): void;
}

export interface ViewerCapabilities {
  supported: boolean;
  renderer: string;
  reason?: string;
}

export interface SplatRendererFactory {
  (src: string): ViewerAdapter;
}

export interface ViewerAdapterOptions {
  splatRendererFactory?: SplatRendererFactory;
}

export function getViewerStatusCopy(kind: ViewerKind, state: ViewerState) {
  if (state === 'loading') {
    if (kind === 'ply')
      return {
        title: '正在加载 PLY 模型',
        detail: '加载期间查看控制暂不可用。',
      };
    if (kind === 'gaussian-splat')
      return {
        title: '正在加载 3DGS 模型',
        detail: '加载期间查看控制暂不可用。',
      };
    return {
      title: '正在检查 3D 资源',
      detail: '正在确认当前景点是否配置可用模型。',
    };
  }
  if (kind === 'unavailable')
    return { title: '真实 3D 模型待接入', detail: '当前仅提供图文降级预览。' };
  if (kind === 'gaussian-splat') {
    if (state === 'ready')
      return { title: '3DGS 模型已就绪', detail: '可使用查看控制浏览模型。' };
    return {
      title: '3DGS 查看暂不可用',
      detail: '请检查专用渲染器与模型资源。',
    };
  }
  if (state === 'ready')
    return { title: 'PLY 模型已就绪', detail: '可使用查看控制浏览模型。' };
  return {
    title: 'PLY 模型加载失败',
    detail: '请检查模型路径、格式或网络状态。',
  };
}

export function getViewerMetadata(
  kind: ViewerKind,
  state: ViewerState,
  media?: ViewerMedia,
  capabilities?: ViewerCapabilities,
) {
  const stateLabels: Record<ViewerState, string> = {
    idle: '未开始',
    loading: '加载中',
    ready: '已就绪',
    error: '加载失败',
    unavailable: '待接入',
  };
  return {
    adapter:
      kind === 'ply'
        ? 'PLY 查看器'
        : kind === 'gaussian-splat'
          ? capabilities?.supported === false
            ? '3DGS 不支持（渲染器未安装）'
            : '3DGS 专用适配器'
          : '不可用降级',
    format:
      media?.format === '3dgs'
        ? '3DGS'
        : media?.format === 'ply'
          ? 'PLY'
          : '未配置',
    state: stateLabels[state],
  };
}

abstract class BaseViewer implements ViewerAdapter {
  abstract readonly kind: ViewerKind;
  abstract readonly controlsEnabled: boolean;
  abstract readonly capabilities: ViewerCapabilities;
  state: ViewerState = 'idle';
  message = '';
  protected container?: HTMLElement;
  abstract load(container: HTMLElement): Promise<ViewerState>;
  abstract reset(): boolean;
  abstract orbit(deltaX: number, deltaY: number): boolean;
  abstract zoom(delta: number): boolean;
  abstract screenshot(): Promise<Blob | undefined>;
  async fullscreen(container: HTMLElement) {
    if (!container.requestFullscreen) return false;
    await container.requestFullscreen();
    return true;
  }
  async retry() {
    return this.container ? this.load(this.container) : this.state;
  }
  abstract dispose(): void;
}

class UnavailableViewer extends BaseViewer {
  readonly kind: ViewerKind = 'unavailable';
  readonly controlsEnabled: boolean = false;
  readonly capabilities: ViewerCapabilities = {
    supported: false,
    renderer: 'none',
    reason: '未配置真实 3D 模型',
  };
  state: ViewerState = 'unavailable';
  message = '真实 3D 模型待接入';
  async load(container: HTMLElement) {
    this.container = container;
    return this.state;
  }
  reset() {
    return false;
  }
  orbit() {
    return false;
  }
  zoom() {
    return false;
  }
  async screenshot() {
    return undefined;
  }
  async retry() {
    this.message = '仍未检测到可用模型';
    return this.state;
  }
  dispose() {
    this.container = undefined;
  }
}

class PlyViewer extends BaseViewer {
  readonly kind = 'ply' as const;
  readonly capabilities: ViewerCapabilities = {
    supported: true,
    renderer: 'three-ply',
  };
  get controlsEnabled() {
    return this.state === 'ready';
  }
  private renderer?: WebGLRenderer;
  private camera?: PerspectiveCamera;
  private model?: Object3D;
  private animationFrame?: number;
  constructor(private readonly src: string) {
    super();
  }

  async load(container: HTMLElement) {
    this.dispose();
    this.container = container;
    this.state = 'loading';
    this.message = '正在加载 PLY 模型';
    try {
      const THREE = await import('three');
      const { PLYLoader } =
        await import('three/examples/jsm/loaders/PLYLoader.js');
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / Math.max(container.clientHeight, 1),
        0.01,
        1000,
      );
      camera.position.set(0, 0, 3);
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(container.clientWidth, container.clientHeight);
      container.replaceChildren(renderer.domElement);
      const geometry = await new PLYLoader().loadAsync(this.src);
      geometry.computeVertexNormals();
      const points = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
          size: 0.008,
          color: 0xd4b06a,
          vertexColors: geometry.hasAttribute('color'),
        }),
      );
      scene.add(points);
      this.renderer = renderer;
      this.camera = camera;
      this.model = points;
      const render = () => {
        renderer.render(scene, camera);
        this.animationFrame = requestAnimationFrame(render);
      };
      render();
      this.state = 'ready';
      this.message = 'PLY 模型已加载';
    } catch (error) {
      this.state = 'error';
      this.message =
        error instanceof Error ? error.message : 'PLY 模型加载失败';
    }
    return this.state;
  }
  reset() {
    if (!this.model || !this.camera) return false;
    this.model.rotation.set(0, 0, 0);
    this.camera.position.set(0, 0, 3);
    return true;
  }
  orbit(x: number, y: number) {
    if (!this.model) return false;
    this.model.rotation.y += x * 0.01;
    this.model.rotation.x += y * 0.01;
    return true;
  }
  zoom(delta: number) {
    if (!this.camera) return false;
    this.camera.position.z = Math.min(
      12,
      Math.max(0.5, this.camera.position.z + delta),
    );
    return true;
  }
  async screenshot() {
    if (!this.renderer) return undefined;
    return new Promise<Blob | undefined>((resolve) =>
      this.renderer?.domElement.toBlob(
        (blob: Blob | null) => resolve(blob ?? undefined),
        'image/png',
      ),
    );
  }
  dispose() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.renderer?.dispose();
    this.renderer?.domElement.remove();
    this.renderer = undefined;
    this.camera = undefined;
    this.model = undefined;
  }
}

class UnsupportedGaussianSplatViewer extends UnavailableViewer {
  readonly kind = 'gaussian-splat' as const;
  readonly controlsEnabled = false;
  readonly capabilities: ViewerCapabilities = {
    supported: false,
    renderer: 'none',
    reason: '3DGS 专用渲染器未安装',
  };
  constructor(private readonly src: string) {
    super();
  }
  async load(container: HTMLElement) {
    this.container = container;
    this.state = 'unavailable';
    this.message = `已配置 3DGS 资源，但专用渲染器未安装：${this.src.split('/').pop() ?? '模型'}`;
    return this.state;
  }
}

export function createViewerAdapter(
  media?: ViewerMedia,
  options: ViewerAdapterOptions = {},
): ViewerAdapter {
  if (!media?.src) return new UnavailableViewer();
  if (media.format === '3dgs') {
    return (
      options.splatRendererFactory?.(media.src) ??
      new UnsupportedGaussianSplatViewer(media.src)
    );
  }
  return new PlyViewer(media.src);
}
