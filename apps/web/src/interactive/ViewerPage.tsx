import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getSpot } from '../public/content';
import { NotFoundState } from '../public/PageElements';
import {
  createViewerAdapter,
  getSpotViewerMedia,
  getViewerMetadata,
  getViewerStatusCopy,
  type ViewerState,
} from './viewerAdapter';

export function ViewerPage() {
  const { spotId } = useParams();
  const spot = getSpot(spotId);
  const viewerMedia = useMemo(
    () =>
      getSpotViewerMedia(spotId, {
        guoEnTemplePly: import.meta.env.VITE_MODEL_GUO_EN_TEMPLE_PLY,
        cangFoPitSplat: import.meta.env.VITE_MODEL_CANG_FO_PIT_3DGS,
        taJiaoVillagePly: import.meta.env.VITE_MODEL_TA_JIAO_VILLAGE_PLY,
        zenCultureZoneSplat: import.meta.env.VITE_MODEL_ZEN_CULTURE_ZONE_3DGS,
      }),
    [spotId],
  );
  const viewer = useMemo(() => createViewerAdapter(viewerMedia), [viewerMedia]);
  const stageRef = useRef<HTMLDivElement>(null);
  const hintTimerRef = useRef<number | undefined>(undefined);
  const [message, setMessage] = useState(viewer.message);
  const [viewerState, setViewerState] = useState<ViewerState>(viewer.state);
  const [showHint, setShowHint] = useState(false);
  const statusCopy = getViewerStatusCopy(viewer.kind, viewerState);
  const viewerMetadata = getViewerMetadata(
    viewer.kind,
    viewerState,
    viewerMedia,
    viewer.capabilities,
  );

  function beginLoadingCycle() {
    if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
    setShowHint(false);
    setViewerState('loading');
    setMessage(getViewerStatusCopy(viewer.kind, 'loading').detail);
    hintTimerRef.current = window.setTimeout(() => setShowHint(true), 5_000);
  }

  function finishLoadingCycle(state: ViewerState) {
    if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
    hintTimerRef.current = undefined;
    setViewerState(state);
    setMessage(viewer.message);
  }

  useEffect(() => {
    if (!stageRef.current) return;
    beginLoadingCycle();
    void viewer.load(stageRef.current).then((state) => {
      finishLoadingCycle(state);
    });
    return () => {
      if (hintTimerRef.current) window.clearTimeout(hintTimerRef.current);
      viewer.dispose();
    };
  }, [viewer]);

  if (!spot) {
    return (
      <NotFoundState
        title="未找到这个景点"
        description="该景点不存在或仍未发布。"
        to="/spots"
        linkLabel="返回景点库"
      />
    );
  }

  function runControl(action: () => boolean) {
    action();
    setMessage(viewer.message);
  }

  async function retry() {
    beginLoadingCycle();
    const state = await viewer.retry();
    finishLoadingCycle(state);
  }

  async function saveScreenshot() {
    const blob = await viewer.screenshot();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${spot?.name ?? '六祖云游'}-3D截图.png`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section
      className="viewer-page page-container"
      aria-labelledby="viewer-title"
    >
      <header className="viewer-heading">
        <div>
          <p className="eyebrow">{spot.name} · 数字资产规划中</p>
          <h1 id="viewer-title">3D 云游</h1>
        </div>
        <Link className="text-link text-link--framed" to={`/spots/${spot.id}`}>
          返回景点详情
        </Link>
      </header>
      <div className="viewer-layout">
        <div
          className="viewer-stage"
          data-adapter={viewer.kind}
          aria-busy={viewerState === 'loading'}
        >
          <div ref={stageRef} className="viewer-stage__canvas" />
          {viewer.kind === 'unavailable' && spot.hero.src ? (
            <img src={spot.hero.src} alt={`${spot.name}的 AI 图文降级预览`} />
          ) : viewer.kind === 'unavailable' ? (
            <div
              className="viewer-stage__empty"
              aria-label={`${spot.name}预览图待接入`}
            />
          ) : null}
          {viewerState !== 'ready' ? (
            <div className="viewer-stage__notice">
              <p>
                {viewer.kind.toUpperCase()} · {viewerState.toUpperCase()}
              </p>
              <strong>{statusCopy.title}</strong>
              <span>{message || statusCopy.detail}</span>
              {viewer.kind === 'unavailable' && spot.hero.src ? (
                <small>AI 视觉示意｜非真实 3D 模型</small>
              ) : null}
            </div>
          ) : null}
          {showHint && viewerState === 'loading' ? (
            <p className="viewer-hint">
              加载已超过 5 秒，请检查模型文件或继续使用图文预览。
            </p>
          ) : null}
        </div>
        <aside className="viewer-controls" aria-label="3D 查看控制">
          <h2>查看控制</h2>
          <button
            type="button"
            disabled={!viewer.controlsEnabled}
            onClick={() => runControl(() => viewer.orbit(16, 0))}
          >
            旋转视角
          </button>
          <button
            type="button"
            disabled={!viewer.controlsEnabled}
            onClick={() => runControl(() => viewer.zoom(-0.25))}
          >
            放大 / 缩小
          </button>
          <button
            type="button"
            disabled={!viewer.controlsEnabled}
            onClick={() => runControl(() => viewer.reset())}
          >
            重置视角
          </button>
          <button
            type="button"
            disabled={!viewer.controlsEnabled}
            onClick={() => void saveScreenshot()}
          >
            保存截图
          </button>
          <button
            type="button"
            disabled={!viewer.controlsEnabled}
            onClick={() =>
              stageRef.current && void viewer.fullscreen(stageRef.current)
            }
          >
            全屏查看
          </button>
          <button type="button" onClick={retry}>
            重试加载
          </button>
          <p role="status">{message}</p>
          <dl>
            <div>
              <dt>适配器</dt>
              <dd>{viewerMetadata.adapter}</dd>
            </div>
            <div>
              <dt>格式</dt>
              <dd>{viewerMetadata.format}</dd>
            </div>
            <div>
              <dt>状态</dt>
              <dd>{viewerMetadata.state}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
