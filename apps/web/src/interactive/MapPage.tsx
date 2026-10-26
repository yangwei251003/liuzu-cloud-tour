import { publicAssetPath } from '@liuzu/domain';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { publicRoutes, type PublicSpot } from '../public/content';
import {
  createMapAdapter,
  createMockMapAdapter,
  type MapAdapter,
} from './mapAdapter';

export function MapPage() {
  const mockAdapter = useMemo(() => createMockMapAdapter(), []);
  const initialAdapter = useMemo(
    () =>
      createMapAdapter({
        key: import.meta.env.VITE_AMAP_KEY,
        securityCode: import.meta.env.VITE_AMAP_SECURITY_CODE,
        online: typeof navigator !== 'undefined' && navigator.onLine,
      }),
    [],
  );
  const adapterRef = useRef<MapAdapter>(initialAdapter);
  const onlineContainer = useRef<HTMLDivElement>(null);
  const [mapMode, setMapMode] = useState(initialAdapter.kind);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('全部');
  const [routeId, setRouteId] = useState('all');
  const [selected, setSelected] = useState<PublicSpot>();
  const [locationMessage, setLocationMessage] = useState('');
  const [retryMessage, setRetryMessage] = useState('');
  const categories = [
    ...new Set(mockAdapter.spots.map(({ category: value }) => value)),
  ];
  const results = mockAdapter.search(query).filter((spot) => {
    const categoryMatches = category === '全部' || spot.category === category;
    const route = publicRoutes.find(({ id }) => id === routeId);
    return categoryMatches && (!route || route.stopIds.includes(spot.id));
  });
  const activeRoute = publicRoutes.find(({ id }) => id === routeId);
  const visibleKey = results.map(({ id }) => id).join('|');

  useEffect(() => {
    adapterRef.current.updateVisibleState(
      visibleKey ? visibleKey.split('|') : [],
      activeRoute?.id,
    );
  }, [activeRoute?.id, visibleKey]);

  useEffect(() => {
    if (initialAdapter.kind !== 'amap' || !onlineContainer.current) return;
    const container = onlineContainer.current;
    void initialAdapter.mount(container).then((state) => {
      if (state === 'error') {
        setRetryMessage(
          `在线地图失败：${initialAdapter.error ?? '网络或域名校验错误'}，已切换离线示意。`,
        );
        setMapMode('mock');
      }
    });
    return () => adapterRef.current.dispose();
  }, [initialAdapter]);

  async function retryOnlineMap() {
    if (!import.meta.env.VITE_AMAP_KEY) {
      setRetryMessage('缺少高德 Web Key，继续使用离线示意地图。');
      return;
    }
    if (!navigator.onLine) {
      setRetryMessage('当前网络不可用，继续使用离线示意地图。');
      return;
    }
    setRetryMessage('正在重试高德 JS API 2.0…');
    setMapMode('amap');
    requestAnimationFrame(async () => {
      if (!onlineContainer.current) return;
      const adapter = createMapAdapter({
        key: import.meta.env.VITE_AMAP_KEY,
        securityCode: import.meta.env.VITE_AMAP_SECURITY_CODE,
        online: true,
      });
      adapterRef.current.dispose();
      adapterRef.current = adapter;
      adapter.updateVisibleState(
        results.map(({ id }) => id),
        activeRoute?.id,
      );
      const state = await adapter.retry(onlineContainer.current);
      if (state === 'error') {
        setRetryMessage(
          `高德 SDK/网络/域名校验失败：${adapter.error ?? '未知错误'}，已回退离线地图。`,
        );
        setMapMode('mock');
      } else
        setRetryMessage('高德地图已加载；无已核验坐标，因此不显示虚构点位。');
    });
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setLocationMessage('当前设备不支持定位，您仍可浏览离线地图。');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => setLocationMessage('定位已授权；演示地图不使用真实坐标导航。'),
      () => setLocationMessage('定位权限被拒绝，已继续使用离线地图。'),
    );
  }

  return (
    <section className="map-page" aria-labelledby="map-title">
      <header className="map-page__header page-container">
        <div>
          <p className="eyebrow">
            {mapMode === 'amap' ? '禅踪地图 · 高德在线' : '禅踪地图 · 离线可用'}
          </p>
          <h1 id="map-title">云游地图</h1>
          <p>浏览景点与六条规划路线；正式里程、坐标与导航信息待项目方确认。</p>
        </div>
        <div className="map-actions">
          <button type="button" onClick={requestLocation}>
            申请定位
          </button>
          <button type="button" onClick={retryOnlineMap}>
            重试在线地图
          </button>
        </div>
      </header>

      <div className="map-workspace page-container">
        <aside className="map-sidebar" aria-label="地图筛选与景点列表">
          <label>
            搜索景点
            <input
              type="search"
              aria-label="搜索地图景点"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label>
            景点类别
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>全部</option>
              {categories.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            规划路线
            <select
              value={routeId}
              onChange={(event) => setRouteId(event.target.value)}
            >
              <option value="all">全部六条路线</option>
              {mockAdapter.routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name}
                </option>
              ))}
            </select>
          </label>
          <p className="map-result">显示 {results.length} 个待核验点位</p>
          <h2 className="marker-index-title">Marker 站点索引（非地理顺序）</h2>
          <div className="map-spot-list">
            {results.map((spot, index) => (
              <button
                key={spot.id}
                type="button"
                aria-label={`查看${spot.name}详情`}
                onClick={() => setSelected(spot)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{spot.name}</strong>
                <small>
                  {spot.town} · {spot.category}
                </small>
              </button>
            ))}
          </div>
          {activeRoute ? (
            <section
              className="route-stop-sequence"
              aria-labelledby="route-stop-sequence-title"
            >
              <h2 id="route-stop-sequence-title">站点顺序（非地理示意）</h2>
              <ol>
                {activeRoute.stops.map((stop) => (
                  <li key={stop.id}>
                    <span>{stop.order}</span>
                    {stop.name}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </aside>
        {mapMode === 'amap' ? (
          <div
            ref={onlineContainer}
            className="online-map"
            aria-label="高德在线地图"
          />
        ) : (
          <figure className="offline-map">
            <picture>
              <source
                type="image/avif"
                srcSet={publicAssetPath('/media/generated/offline-map-ai-v1-768.avif 768w, /media/generated/offline-map-ai-v1-1536.avif 1536w')}
                sizes="(max-width: 52rem) 100vw, 75vw"
              />
              <source
                type="image/webp"
                srcSet={publicAssetPath('/media/generated/offline-map-ai-v1-768.webp 768w, /media/generated/offline-map-ai-v1-1536.webp 1536w')}
                sizes="(max-width: 52rem) 100vw, 75vw"
              />
              <img
                src={publicAssetPath('/media/generated/offline-map-ai-v1.png')}
                alt="青绿山水风格的新兴县域离线导览视觉示意"
                width="1536"
                height="1024"
                loading="eager"
                fetchPriority="high"
              />
            </picture>
            <figcaption>AI 视觉示意｜非导航地图</figcaption>
            <p className="offline-map__status">
              离线底画 · 未显示任何无坐标点位
            </p>
          </figure>
        )}
      </div>
      {(locationMessage || retryMessage) && (
        <p className="map-message page-container" role="status">
          {locationMessage || retryMessage}
        </p>
      )}
      {selected && (
        <div
          className="map-drawer"
          role="dialog"
          aria-modal="false"
          aria-label={`${selected.name}地图详情`}
        >
          <button
            type="button"
            className="map-drawer__close"
            onClick={() => setSelected(undefined)}
          >
            关闭
          </button>
          <p className="eyebrow">{selected.town} · 信息待确认</p>
          <h2>{selected.name}</h2>
          <p>{selected.summary}</p>
          <div className="map-drawer__links">
            <Link
              className="cta-link cta-link--primary"
              to={`/spots/${selected.id}`}
            >
              查看景点页
            </Link>
            <Link className="cta-link" to={`/spots/${selected.id}/3d`}>
              查看 3D 规划
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
