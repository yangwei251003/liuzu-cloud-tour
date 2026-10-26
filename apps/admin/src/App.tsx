import { publicAssetPath } from '@liuzu/domain';
import type { Achievement, AchievementType, Attraction } from '@liuzu/domain';
import {
  createCatalogRepositories,
  createVersionedRepository,
  sampleAchievements,
  sampleAttractions,
} from '@liuzu/domain';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import './admin.css';

type AdminAppProps = { initialPath?: string; authenticated?: boolean };
type ManagedSpot = Attraction & {
  published?: boolean;
  category?: string;
  has3d?: boolean;
  mapPosition?: string;
  tickets?: string;
  hours?: string;
  plyUrl?: string;
  sort?: number;
  updatedAt?: string;
};
type ManagedAchievement = Achievement & {
  published?: boolean;
  relatedSpotId?: string;
  body?: string;
  videoUrl?: string;
  localMediaName?: string;
};

const storage = () => createCatalogRepositories(window.localStorage);
const readSpots = (): ManagedSpot[] =>
  (storage().attractions.read() as ManagedSpot[]).map((spot, index) => ({
    ...spot,
    category: spot.category ?? spot.tags[0],
    has3d: spot.has3d ?? false,
    published: spot.published ?? false,
    sort: spot.sort ?? index + 1,
  }));
const readRoutes = () => storage().routes.read();
const readAchievements = () =>
  storage().achievements.read() as ManagedAchievement[];
type RouteStatus = 'draft' | 'published';
const routeStatusRepository = () =>
  createVersionedRepository<Record<string, RouteStatus>>({
    key: 'liuzu-admin:route-status',
    version: 1,
    seed: {},
    storage: window.localStorage,
  });

function usePath(initialPath?: string) {
  const readPath = () => import.meta.env.VITE_PAGES === 'true' ? window.location.hash.slice(1) || '/admin' : window.location.pathname;
  const [path, setPath] = useState(initialPath ?? readPath());
  const go = (next: string) => {
    if (!initialPath) {
      if (import.meta.env.VITE_PAGES === 'true') window.location.hash = next;
      else window.history.pushState({}, '', next);
    }
    setPath(next);
  };
  useEffect(() => {
    if (initialPath) return;
    const sync = () => setPath(readPath());
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => { window.removeEventListener('popstate', sync); window.removeEventListener('hashchange', sync); };
  }, [initialPath]);
  return [path, go] as const;
}

function containDialogFocus(
  event: React.KeyboardEvent<HTMLElement>,
  onEscape: () => void,
) {
  if (event.key === 'Escape') {
    onEscape();
    return;
  }
  if (event.key !== 'Tab') return;
  const controls = Array.from(
    event.currentTarget.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
  if (!controls.length) return;
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function useModalIsolation() {
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const shell = document.querySelector<HTMLElement>('.admin-shell');
    shell?.setAttribute('inert', '');
    return () => {
      shell?.removeAttribute('inert');
      opener?.focus();
    };
  }, []);
}

export function App({ initialPath, authenticated }: AdminAppProps) {
  const [path, go] = usePath(initialPath);
  const [loggedIn, setLoggedIn] = useState(
    authenticated ?? localStorage.getItem('liuzu-admin:session') === 'true',
  );
  if (!loggedIn || path === '/admin') {
    return (
      <Login
        onLogin={() => {
          localStorage.setItem('liuzu-admin:session', 'true');
          setLoggedIn(true);
          go('/admin/stats');
        }}
      />
    );
  }
  return (
    <AdminShell
      path={path}
      go={go}
      onLogout={() => {
        localStorage.removeItem('liuzu-admin:session');
        setLoggedIn(false);
        go('/admin');
      }}
    >
      {path === '/admin/stats' && <StatsPage />}
      {path === '/admin/spots' && <SpotsPage go={go} />}
      {(path === '/admin/spots/new' || path.startsWith('/admin/spots/')) &&
        path !== '/admin/spots' && <SpotEditor path={path} go={go} />}
      {path === '/admin/routes' && <RoutesPage />}
      {path === '/admin/achievements' && <AchievementsPage />}
    </AdminShell>
  );
}

function Login({ onLogin }: { onLogin: () => void }) {
  const [error, setError] = useState('');
  return (
    <main className="login-page">
      <section className="login-brand" aria-label="品牌介绍">
        <strong className="brand__text">六祖云游</strong>
        <div>
          <strong>云启新兴</strong>
          <span>六祖云游管理后台</span>
        </div>
        <p>文化数字资源平台</p>
        <small className="ai-login-disclosure">背景为 AI 视觉示意</small>
      </section>
      <section className="login-panel">
        <form
          className="login-card"
          onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            if (!data.get('account') || !data.get('password'))
              setError('请输入账号和密码');
            else onLogin();
          }}
        >
          <p className="eyebrow">LOCAL DEMO</p>
          <h1>欢迎登录</h1>
          <div className="demo-notice" role="status">
            本地演示模式：不具备生产安全性；数据仅保存在当前浏览器。
          </div>
          <label>
            账号
            <input name="account" autoComplete="username" />
          </label>
          <label>
            密码
            <input
              name="password"
              type="password"
              autoComplete="current-password"
            />
          </label>
          <label className="check">
            <input type="checkbox" /> 记住本地演示状态
          </label>
          {error && <p className="error">{error}</p>}
          <button className="button primary" type="submit">
            登录演示后台
          </button>
        </form>
      </section>
    </main>
  );
}

const nav = [
  ['/admin/stats', '数据概览'],
  ['/admin/spots', '景点管理'],
  ['/admin/routes', '路线管理'],
  ['/admin/achievements', '内容成果'],
] as const;
function AdminShell({
  path,
  go,
  onLogout,
  children,
}: {
  path: string;
  go: (p: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <strong className="brand__text">六祖云游</strong>
        <strong>六祖云游管理后台</strong>
        <nav aria-label="后台导航">
          {nav.map(([href, label]) => (
            <button
              className={path.startsWith(href) ? 'active' : ''}
              key={href}
              onClick={() => go(href)}
            >
              {label}
            </button>
          ))}
        </nav>
        <p>本地演示 · 浏览器持久化</p>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <span>内容以后台最终发布为准</span>
          <button className="text-button" onClick={onLogout}>
            退出演示
          </button>
        </header>
        {children}
      </main>
    </div>
  );
}

function StatsPage() {
  return (
    <section>
      <PageTitle
        title="数据概览"
        actions={
          <>
            <button className="button">近 30 天</button>
            <button className="button">刷新</button>
            <button
              className="button gold"
              onClick={() =>
                downloadText(
                  'liuzu-demo-stats.csv',
                  '指标,状态\nPV,待接入\nUV,待接入',
                )
              }
            >
              导出 CSV
            </button>
          </>
        }
      />
      <div className="metric-grid">
        {['PV', 'UV', '平均访问时长', '跳出率'].map((item) => (
          <article className="metric" key={item}>
            <strong>{item}</strong>
            <b>—</b>
            <span>演示数据 · 待接入</span>
          </article>
        ))}
      </div>
      <EChartPanel />
      <div className="summary-grid">
        {[
          '景点热度排行',
          '路线点击排行',
          '3D 展示使用情况',
          '印记完成情况',
        ].map((x) => (
          <article className="summary" key={x}>
            <h2>{x}</h2>
            <p>—</p>
            <span>数据待接入</span>
          </article>
        ))}
      </div>
      <p className="source-note">指标口径以后端实际数据为准</p>
    </section>
  );
}

function EChartPanel() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      !ref.current ||
      typeof ResizeObserver === 'undefined' ||
      navigator.userAgent.includes('jsdom')
    )
      return;
    let chart:
      | {
          resize: () => void;
          dispose: () => void;
          setOption: (v: unknown) => void;
        }
      | undefined;
    let observer: ResizeObserver | undefined;
    void import('echarts').then((echarts) => {
      if (!ref.current) return;
      chart = echarts.init(ref.current);
      chart.setOption({
        grid: { left: 40, right: 20, top: 30, bottom: 30 },
        xAxis: {
          type: 'category',
          data: ['一', '二', '三', '四', '五', '六', '日'],
        },
        yAxis: { type: 'value' },
        series: [
          {
            type: 'line',
            smooth: true,
            data: [12, 18, 15, 24, 20, 27, 23],
            lineStyle: { color: '#2E5C4F' },
            areaStyle: { color: 'rgba(111,163,143,.16)' },
          },
        ],
      });
      observer = new ResizeObserver(() => chart?.resize());
      observer.observe(ref.current);
    });
    return () => {
      observer?.disconnect();
      chart?.dispose();
    };
  }, []);
  return (
    <article className="chart-card">
      <h2>访问趋势</h2>
      <div ref={ref} className="chart" aria-label="近七日访问趋势演示图表" />
      <p>演示数据，仅用于界面与图表生命周期验证</p>
    </article>
  );
}

function PageTitle({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <p className="eyebrow">LOCAL CONTENT</p>
        <h1>{title}</h1>
      </div>
      <div className="actions">{actions}</div>
    </div>
  );
}

function SpotsPage({ go }: { go: (p: string) => void }) {
  const [items, setItems] = useState<ManagedSpot[]>(readSpots);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [area, setArea] = useState('all');
  const [model, setModel] = useState('all');
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState('');
  const [deleting, setDeleting] = useState<ManagedSpot | null>(null);
  const filtered = items.filter(
    (x) =>
      x.name.includes(query) &&
      (status === 'all' || String(Boolean(x.published)) === status) &&
      (category === 'all' || x.category === category) &&
      (area === 'all' || x.area === area) &&
      (model === 'all' || String(Boolean(x.has3d)) === model),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 3));
  const shown = filtered.slice((page - 1) * 3, page * 3);
  const persist = (next: ManagedSpot[], message: string) => {
    setItems(next);
    storage().attractions.write(next);
    setNotice(message);
  };
  return (
    <section>
      <PageTitle
        title="景点管理"
        actions={
          <button
            className="button gold"
            onClick={() => go('/admin/spots/new')}
          >
            新增景点
          </button>
        }
      />
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      <div className="filters">
        <label>
          搜索景点
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="搜索景点名称"
          />
        </label>
        <label>
          景点分类
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">全部分类</option>
            {Array.from(new Set(items.map((x) => x.category))).map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>
        <label>
          所属区域
          <select
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">全部区域</option>
            {Array.from(new Set(items.map((x) => x.area))).map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        </label>
        <label>
          3D 状态
          <select
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">全部 3D</option>
            <option value="true">已配置</option>
            <option value="false">规划中</option>
          </select>
        </label>
        <label>
          上架状态
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">全部状态</option>
            <option value="true">已上架</option>
            <option value="false">草稿</option>
          </select>
        </label>
        <button
          className="button"
          onClick={() => {
            setQuery('');
            setStatus('all');
            setCategory('all');
            setArea('all');
            setModel('all');
          }}
        >
          重置
        </button>
      </div>
      {shown.length ? (
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>景点名称</th>
                <th>分类</th>
                <th>所属村镇</th>
                <th>3D</th>
                <th>状态</th>
                <th>排序</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((spot) => (
                <tr key={spot.id}>
                  <td data-label="景点">
                    <strong>{spot.name}</strong>
                  </td>
                  <td data-label="分类">{spot.category ?? '待分类'}</td>
                  <td data-label="村镇">{spot.area}</td>
                  <td data-label="3D">{spot.has3d ? '已配置' : '规划中'}</td>
                  <td data-label="状态">
                    <span className="pill">
                      {spot.published ? '已上架' : '草稿'}
                    </span>
                  </td>
                  <td data-label="排序">{spot.sort}</td>
                  <td data-label="更新时间">
                    {spot.updatedAt ?? '本地初始数据'}
                  </td>
                  <td data-label="操作" className="row-actions">
                    <button onClick={() => go(`/admin/spots/${spot.id}`)}>
                      编辑
                    </button>
                    <button
                      aria-label={`切换${spot.name}上下线状态`}
                      onClick={() =>
                        persist(
                          items.map((x) =>
                            x.id === spot.id
                              ? {
                                  ...x,
                                  published: !x.published,
                                  updatedAt: new Date().toLocaleDateString(
                                    'zh-CN',
                                  ),
                                }
                              : x,
                          ),
                          '状态已保存到当前浏览器',
                        )
                      }
                    >
                      {spot.published ? '下线' : '上架'}
                    </button>
                    <button
                      aria-label={`删除${spot.name}`}
                      onClick={() => setDeleting(spot)}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty text="没有符合筛选条件的景点" />
      )}
      <div className="pagination">
        <span>
          共 {filtered.length} 条 · {page} / {pages}
        </span>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          上一页
        </button>
        <button disabled={page >= pages} onClick={() => setPage(page + 1)}>
          下一页
        </button>
      </div>
      {deleting && (
        <ConfirmDialog
          title="确认删除景点"
          text={`删除“${deleting.name}”后仅会从当前浏览器演示数据移除。`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            persist(
              items.filter((x) => x.id !== deleting.id),
              '景点已从本地演示数据删除',
            );
            setDeleting(null);
          }}
        />
      )}
    </section>
  );
}

function SpotEditor({ path, go }: { path: string; go: (p: string) => void }) {
  const id = path.split('/').pop();
  const existing = readSpots().find((x) => x.id === id);
  const [name, setName] = useState(existing?.name ?? '');
  const [area, setArea] = useState(existing?.area ?? '');
  const [summary, setSummary] = useState(existing?.summary ?? '');
  const [category, setCategory] = useState(
    existing?.category ?? existing?.tags[0] ?? '禅文化',
  );
  const [mapPosition, setMapPosition] = useState(existing?.mapPosition ?? '');
  const [tickets, setTickets] = useState(existing?.tickets ?? '');
  const [hours, setHours] = useState(existing?.hours ?? '');
  const [plyUrl, setPlyUrl] = useState(existing?.plyUrl ?? '');
  const [has3d, setHas3d] = useState(Boolean(existing?.has3d));
  const [sort, setSort] = useState(existing?.sort ?? readSpots().length + 1);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const save = (published: boolean) => {
    if (!name.trim()) {
      setError('请填写景点名称');
      return;
    }
    if (!area.trim()) {
      setError('请填写所属村镇');
      return;
    }
    const items = readSpots();
    const item: ManagedSpot = {
      ...(existing ?? sampleAttractions[0]),
      id: existing?.id ?? `local-${Date.now()}`,
      name,
      area,
      summary: summary || '本地演示内容，待确认。',
      tags: [category],
      category,
      mapPosition,
      tickets,
      hours,
      plyUrl,
      has3d,
      sort,
      published,
      updatedAt: new Date().toLocaleDateString('zh-CN'),
      source: {
        sourceKind: 'local-demo',
        verificationStatus: 'unverified',
        sourceLabel: '当前浏览器本地演示',
      },
    };
    storage().attractions.write(
      existing
        ? items.map((x) => (x.id === existing.id ? item : x))
        : [item, ...items],
    );
    setError('');
    setNotice('已保存到当前浏览器；未上传云端。');
  };
  return (
    <section>
      <PageTitle
        title={existing ? '编辑景点' : '新增景点'}
        actions={
          <>
            <button className="button" onClick={() => go('/admin/spots')}>
              取消
            </button>
            <button className="button gold" onClick={() => save(true)}>
              保存并发布
            </button>
          </>
        }
      />
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      {error && <p className="error">{error}</p>}
      <div className="editor-layout">
        <form className="form-stack" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend>基础信息</legend>
            <div className="form-grid">
              <label>
                景点名称
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label>
                所属村镇
                <input value={area} onChange={(e) => setArea(e.target.value)} />
              </label>
              <label>
                分类
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>禅文化</option>
                  <option>自然风光</option>
                  <option>乡村体验</option>
                </select>
              </label>
              <label>
                地图位置
                <input
                  value={mapPosition}
                  onChange={(e) => setMapPosition(e.target.value)}
                  placeholder="GCJ-02 坐标待确认"
                />
              </label>
              <label className="span-2">
                简介
                <textarea
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                />
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>图片与图集</legend>
            <label className="upload">
              上传封面
              <input
                aria-label="上传封面"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <span>
                {file
                  ? `${file.name}（仅本地预览）`
                  : '选择本地图片，仅在本页预览'}
              </span>
            </label>
          </fieldset>
          <fieldset>
            <legend>服务与 3D 配置</legend>
            <div className="form-grid">
              <label>
                门票信息
                <input
                  value={tickets}
                  onChange={(e) => setTickets(e.target.value)}
                  placeholder="待确认"
                />
              </label>
              <label>
                开放时间
                <input
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="待确认"
                />
              </label>
              <label>
                PLY 地址
                <input
                  value={plyUrl}
                  onChange={(e) => setPlyUrl(e.target.value)}
                  placeholder="真实模型到位后配置"
                />
              </label>
              <label className="check">
                <input
                  aria-label="启用真实 3D 模型"
                  type="checkbox"
                  checked={has3d}
                  onChange={(e) => setHas3d(e.target.checked)}
                />{' '}
                启用真实 3D 模型
              </label>
              <label>
                排序
                <input
                  type="number"
                  min="1"
                  value={sort}
                  onChange={(e) => setSort(Number(e.target.value))}
                />
              </label>
            </div>
          </fieldset>
          <button
            className="button primary"
            type="button"
            onClick={() => save(false)}
          >
            保存草稿
          </button>
        </form>
        <aside className="preview-card">
          <h2>前台预览摘要</h2>
          {file ? (
            <img src={URL.createObjectURL(file)} alt="所选景点封面本地预览" />
          ) : (
            <picture>
              <source
                type="image/avif"
                srcSet={publicAssetPath('/media/generated/spot-temple-tower-ai-v1-768.avif 768w, /media/generated/spot-temple-tower-ai-v1-1536.avif 1536w')}
              />
              <source
                type="image/webp"
                srcSet={publicAssetPath('/media/generated/spot-temple-tower-ai-v1-768.webp 768w, /media/generated/spot-temple-tower-ai-v1-1536.webp 1536w')}
              />
              <img
                src={publicAssetPath('/media/generated/spot-temple-tower-ai-v1.png')}
                alt="AI 视觉示意：山水寺塔"
              />
            </picture>
          )}
          <strong>{name || '景点名称待填写'}</strong>
          <p>{summary || '内容以保存后展示为准'}</p>
          <span>AI 视觉示意 / 本地预览</span>
        </aside>
      </div>
    </section>
  );
}

function RoutesPage() {
  const [routes, setRoutes] = useState(readRoutes);
  const [routeStatuses, setRouteStatuses] = useState(
    routeStatusRepository().read,
  );
  const [routeId, setRouteId] = useState(routes[0]?.id ?? '');
  const [notice, setNotice] = useState('');
  const route = routes.find((x) => x.id === routeId) ?? routes[0];
  const stops = route?.stops ?? [];
  const reorder = (from: number, to: number) => {
    if (!route || to < 0 || to >= stops.length) return;
    const next = [...stops];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const normalized = next.map((x, i) => ({ ...x, order: i + 1 }));
    setRoutes(
      routes.map((x) =>
        x.id === route.id
          ? {
              ...x,
              stops: normalized,
              stopIds: normalized.map((s) => s.spotId),
            }
          : x,
      ),
    );
  };
  const updateStops = (next: typeof stops) => {
    if (!route) return;
    const normalized = next.map((x, i) => ({ ...x, order: i + 1 }));
    setRoutes(
      routes.map((x) =>
        x.id === route.id
          ? {
              ...x,
              stops: normalized,
              stopIds: normalized.map((s) => s.spotId),
            }
          : x,
      ),
    );
  };
  const addSpot = (spot: ManagedSpot) => {
    if (stops.some((x) => x.spotId === spot.id)) return;
    updateStops([
      ...stops,
      {
        id: `${route.id}-${spot.id}-${Date.now()}`,
        spotId: spot.id,
        name: spot.name,
        order: stops.length + 1,
      },
    ]);
  };
  const save = (published: boolean) => {
    storage().routes.write(routes);
    const next = {
      ...routeStatuses,
      [routeId]: (published ? 'published' : 'draft') as RouteStatus,
    };
    routeStatusRepository().write(next);
    setRouteStatuses(next);
    setNotice(
      published
        ? '路线已发布到当前浏览器演示数据'
        : '路线草稿已保存到当前浏览器',
    );
  };
  return (
    <section>
      <PageTitle
        title="路线管理 / 可视化编排"
        actions={
          <>
            <button className="button" onClick={() => save(false)}>
              保存草稿
            </button>
            <button className="button gold" onClick={() => save(true)}>
              保存并发布
            </button>
          </>
        }
      />
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      <div className="route-toolbar">
        <label>
          选择路线
          <select value={routeId} onChange={(e) => setRouteId(e.target.value)}>
            {routes.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          路线名称
          <input
            value={route?.name ?? ''}
            onChange={(e) =>
              setRoutes(
                routes.map((x) =>
                  x.id === route?.id ? { ...x, name: e.target.value } : x,
                ),
              )
            }
          />
        </label>
        <p className="route-status">
          当前状态：{routeStatuses[routeId] === 'published' ? '已发布' : '草稿'}
        </p>
      </div>
      <div className="route-layout">
        <aside className="spot-pool">
          <h2>景点池</h2>
          {readSpots().map((s) => (
            <button
              key={s.id}
              aria-label={`添加${s.name}到路线`}
              disabled={stops.some((x) => x.spotId === s.id)}
              onClick={() => addSpot(s)}
            >
              {s.name}
              <span>
                {stops.some((x) => x.spotId === s.id) ? '已添加' : '添加'}
              </span>
            </button>
          ))}
        </aside>
        <section className="itinerary">
          <h2>行程编排</h2>
          {stops.map((stop, index) => (
            <article className="stop-row" key={stop.id}>
              <button
                className="stop-card"
                aria-label={`${stop.name}，当前第 ${index + 1} 站；使用上下方向键排序`}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') reorder(index, index + 1);
                  if (e.key === 'ArrowUp') reorder(index, index - 1);
                }}
                draggable
                onDragStart={(e) =>
                  e.dataTransfer.setData('text/plain', String(index))
                }
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) =>
                  reorder(Number(e.dataTransfer.getData('text/plain')), index)
                }
              >
                <b>第 {index + 1} 站</b>
                <span>{stop.name}</span>
                <small>拖拽或使用上下方向键排序</small>
              </button>
              <button
                className="remove-stop"
                aria-label={`移除${stop.name}`}
                onClick={() =>
                  updateStops(stops.filter((x) => x.id !== stop.id))
                }
              >
                移除
              </button>
            </article>
          ))}
        </section>
        <aside className="map-preview">
          <h2>路线地图预览</h2>
          <picture>
            <source
              type="image/avif"
              srcSet={publicAssetPath('/media/generated/offline-map-ai-v1-768.avif 768w, /media/generated/offline-map-ai-v1-1536.avif 1536w')}
            />
            <source
              type="image/webp"
              srcSet={publicAssetPath('/media/generated/offline-map-ai-v1-768.webp 768w, /media/generated/offline-map-ai-v1-1536.webp 1536w')}
            />
            <img
              src={publicAssetPath('/media/generated/offline-map-ai-v1.png')}
              alt="AI 视觉示意：离线路线底图"
            />
          </picture>
          <p>地图数据待接入 · 路线仅为编排示意</p>
        </aside>
      </div>
    </section>
  );
}

const achievementLabels: Record<AchievementType, string> = {
  'party-building': '党建',
  livestream: '直播',
  interview: '访谈',
  survey: '问卷',
  aigc: 'AIGC',
};
function AchievementsPage() {
  const [items, setItems] = useState(readAchievements);
  const [type, setType] = useState<'all' | AchievementType>('all');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<ManagedAchievement | null>(null);
  const [deleting, setDeleting] = useState<ManagedAchievement | null>(null);
  const [notice, setNotice] = useState('');
  const filtered = items.filter(
    (x) => (type === 'all' || x.type === type) && x.title.includes(query),
  );
  const persist = (next: ManagedAchievement[], msg: string) => {
    setItems(next);
    storage().achievements.write(next);
    setNotice(msg);
  };
  return (
    <section>
      <PageTitle
        title="成果管理"
        actions={
          <button
            className="button gold"
            onClick={() =>
              setEditing({
                ...sampleAchievements[0],
                id: `local-${Date.now()}`,
                title: '',
                summary: '',
                source: {
                  sourceKind: 'local-demo',
                  verificationStatus: 'unverified',
                },
              })
            }
          >
            新增成果
          </button>
        }
      />
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      <div className="tabs" aria-label="成果分类筛选">
        <button
          className={type === 'all' ? 'active' : ''}
          onClick={() => setType('all')}
        >
          全部
        </button>
        {Object.entries(achievementLabels).map(([key, label]) => (
          <button
            className={type === key ? 'active' : ''}
            key={key}
            onClick={() => setType(key as AchievementType)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="filters">
        <label>
          搜索标题
          <input value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>
      {filtered.length ? (
        <div className="achievement-list">
          {filtered.map((item) => (
            <article key={item.id}>
              <div>
                <span className="pill">{achievementLabels[item.type]}</span>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <small>
                  {item.published ? '已发布' : '草稿'} ·{' '}
                  {item.relatedSpotId ? '已关联景点' : '待关联景点'}
                </small>
              </div>
              <div className="row-actions">
                <button
                  aria-label={`编辑${item.title}`}
                  onClick={() => setEditing(item)}
                >
                  编辑
                </button>
                <button
                  onClick={() =>
                    persist(
                      items.map((x) =>
                        x.id === item.id
                          ? { ...x, published: !x.published }
                          : x,
                      ),
                      '成果状态已保存到当前浏览器',
                    )
                  }
                >
                  {item.published ? '下线' : '发布'}
                </button>
                <button
                  aria-label={`删除${item.title}`}
                  onClick={() => setDeleting(item)}
                >
                  删除
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty text="没有符合条件的成果" />
      )}
      {editing && (
        <AchievementDrawer
          item={editing}
          onClose={() => setEditing(null)}
          onSave={(item) => {
            const exists = items.some((x) => x.id === item.id);
            persist(
              exists
                ? items.map((x) => (x.id === item.id ? item : x))
                : [item, ...items],
              '成果已保存到当前浏览器；未上传云端',
            );
            setEditing(null);
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="确认删除成果"
          text={`删除“${deleting.title}”后仅影响当前浏览器。`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            persist(
              items.filter((x) => x.id !== deleting.id),
              '成果已删除',
            );
            setDeleting(null);
          }}
        />
      )}
    </section>
  );
}

function AchievementDrawer({
  item,
  onClose,
  onSave,
}: {
  item: ManagedAchievement;
  onClose: () => void;
  onSave: (i: ManagedAchievement) => void;
}) {
  useModalIsolation();
  const ref = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(item.title);
  const [summary, setSummary] = useState(item.summary);
  const [type, setType] = useState(item.type);
  const [body, setBody] = useState(item.body ?? '');
  const [videoUrl, setVideoUrl] = useState(item.videoUrl ?? '');
  const [relatedSpotId, setRelatedSpotId] = useState(item.relatedSpotId ?? '');
  const [published, setPublished] = useState(Boolean(item.published));
  const [localMediaName, setLocalMediaName] = useState(
    item.localMediaName ?? '',
  );
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  useEffect(() => ref.current?.focus(), []);
  useEffect(() => {
    if (!localFile) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(localFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [localFile]);
  return createPortal(
    <div
      className="drawer-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievement-drawer-title"
        onKeyDown={(e) => containDialogFocus(e, onClose)}
      >
        <header>
          <h2 id="achievement-drawer-title">编辑成果</h2>
          <button onClick={onClose}>关闭</button>
        </header>
        <label>
          标题
          <input
            ref={ref}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label>
          成果类型
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AchievementType)}
          >
            {Object.entries(achievementLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          摘要
          <textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
        </label>
        <label>
          正文内容
          <textarea
            rows={6}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </label>
        <label>
          视频 URL
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="待提供正式视频地址"
          />
        </label>
        <label>
          关联景点
          <select
            value={relatedSpotId}
            onChange={(e) => setRelatedSpotId(e.target.value)}
          >
            <option value="">待关联</option>
            {readSpots().map((spot) => (
              <option key={spot.id} value={spot.id}>
                {spot.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          图集
          <input
            aria-label="图集"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setLocalFile(file);
              setLocalMediaName(file?.name ?? '');
            }}
          />
          <span>
            {localMediaName
              ? `${localMediaName}（仅本地预览元数据）`
              : '仅本地预览，不上传云端'}
          </span>
        </label>
        {previewUrl && localFile && (
          <img
            className="local-media-preview"
            src={previewUrl}
            alt={`${localFile.name} 本地预览`}
          />
        )}
        <label className="check">
          <input
            aria-label="发布状态"
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />{' '}
          保存后发布
        </label>
        <footer>
          <button className="button" onClick={onClose}>
            取消
          </button>
          <button
            className="button gold"
            onClick={() =>
              onSave({
                ...item,
                title: title || '未命名成果',
                summary,
                type,
                body,
                videoUrl,
                relatedSpotId,
                published,
                localMediaName,
              })
            }
          >
            保存
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
function ConfirmDialog({
  title,
  text,
  onCancel,
  onConfirm,
}: {
  title: string;
  text: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useModalIsolation();
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return createPortal(
    <div className="dialog-backdrop">
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="confirm-dialog"
        onKeyDown={(e) => containDialogFocus(e, onCancel)}
      >
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="actions">
          <button ref={ref} className="button" onClick={onCancel}>
            取消
          </button>
          <button className="button danger" onClick={onConfirm}>
            确认删除
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <h2>{text}</h2>
      <p>调整筛选条件，或新建本地演示内容。</p>
    </div>
  );
}
function downloadText(name: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
