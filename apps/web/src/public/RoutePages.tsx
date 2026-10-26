import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { MediaFrame } from './MediaFrame';
import { NotFoundState, PlanningNote, SectionHeading } from './PageElements';
import { Reveal } from './Reveal';
import { getRoute, publicRoutes } from './content';

export function RoutesPage() {
  const pageSize = 3;
  const [theme, setTheme] = useState('全部');
  const [duration, setDuration] = useState('全部');
  const [difficulty, setDifficulty] = useState('全部');
  const [page, setPage] = useState(1);

  const themes = [...new Set(publicRoutes.map((route) => route.theme))];
  const durations = [...new Set(publicRoutes.map((route) => route.duration))];
  const routes = useMemo(
    () =>
      publicRoutes.filter(
        (route) =>
          (theme === '全部' || route.theme === theme) &&
          (duration === '全部' || route.duration === duration) &&
          (difficulty === '全部' || route.difficulty === difficulty),
      ),
    [difficulty, duration, theme],
  );
  const pageCount = Math.max(1, Math.ceil(routes.length / pageSize));
  const visibleRoutes = routes.slice((page - 1) * pageSize, page * pageSize);
  const changeFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setTheme('全部');
    setDuration('全部');
    setDifficulty('全部');
    setPage(1);
  };

  return (
    <div className="catalog-page routes-page">
      <header className="page-banner page-banner--routes">
        <div className="page-container">
          <h1>主题路线</h1>
          <p>循文化足迹，赏山水风光，体验乡村风情。</p>
        </div>
      </header>

      <section className="catalog-content page-section page-container" aria-label="路线筛选与列表">
        <div className="filter-bar filter-bar--routes">
          <label>
            <span>主题</span>
            <select aria-label="按主题筛选" value={theme} onChange={(event) => changeFilter(setTheme, event.target.value)}>
              <option>全部</option>
              {themes.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label>
            <span>时长</span>
            <select aria-label="按时长筛选" value={duration} onChange={(event) => changeFilter(setDuration, event.target.value)}>
              <option>全部</option>
              {durations.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label>
            <span>难度</span>
            <select aria-label="按难度筛选" value={difficulty} onChange={(event) => changeFilter(setDifficulty, event.target.value)}>
              <option>全部</option>
              <option>轻度</option>
              <option>中度</option>
            </select>
          </label>
          <div className="filter-bar__result" aria-live="polite">共 {routes.length} 条路线</div>
          <button type="button" className="text-button" onClick={clearFilters}>清除筛选</button>
        </div>

        {routes.length === 0 ? (
          <div className="empty-state" role="status">
            <h2>暂无匹配路线</h2>
            <p>尝试调整主题、时长或难度。</p>
            <button type="button" onClick={clearFilters}>显示全部路线</button>
          </div>
        ) : (
          <div className="route-grid">
            {visibleRoutes.map((route) => (
              <Reveal key={route.id} className="route-card">
                <MediaFrame media={route.hero} />
                <div className="route-card__body">
                  <div className="card-title-row">
                    <h2>{route.name}</h2>
                    <span>{route.theme}</span>
                  </div>
                  <dl className="route-card__facts">
                    <div><dt>时长</dt><dd>{route.duration}</dd></div>
                    <div><dt>难度</dt><dd>{route.difficulty}</dd></div>
                  </dl>
                  <p>{route.summary}</p>
                  <ol className="route-stop-strip" aria-label={`${route.name}站点`}>
                    {route.stops.map((stop) => <li key={stop.id}>{stop.name}</li>)}
                  </ol>
                  <Link className="text-link text-link--gold" to={`/routes/${route.id}`}>查看路线</Link>
                </div>
              </Reveal>
            ))}
          </div>
        )}
        {routes.length > 0 ? (
          <nav className="catalog-pagination" aria-label="路线分页">
            <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>上一页</button>
            <span>显示第 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, routes.length)} 项，共 {routes.length} 项</span>
            <button type="button" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>下一页</button>
          </nav>
        ) : null}

        <aside className="travel-notes" aria-label="路线出行提示">
          {[
            ['交通', '交通方式、用时与可达性均待核验。'],
            ['食宿', '餐饮与住宿信息待可靠来源补充。'],
            ['注意事项', '请在出发前查询官方开放与天气信息。'],
          ].map(([title, text]) => (
            <div key={title}><h2>{title}</h2><p>{text}</p></div>
          ))}
        </aside>
      </section>
    </div>
  );
}

export function RouteDetailPage() {
  const { routeId } = useParams();
  const route = getRoute(routeId);

  if (!route) {
    return (
      <NotFoundState
        title="未找到这条路线"
        description="路线可能尚未发布，或当前链接已经失效。"
        to="/routes"
        linkLabel="返回路线列表"
      />
    );
  }

  const recommendations = publicRoutes.filter((item) => item.id !== route.id).slice(0, 3);

  return (
    <article className="detail-page route-detail">
      <header className="route-detail__hero">
        <MediaFrame media={route.hero} className="route-detail__hero-media" eager />
        <div className="route-detail__hero-content page-container">
          <Link className="back-link" to="/routes">返回路线列表</Link>
          <h1>{route.name}</h1>
          <dl className="hero-facts">
            <div><dt>时长</dt><dd>{route.duration}</dd></div>
            <div><dt>难度</dt><dd>{route.difficulty}</dd></div>
            <div><dt>主题</dt><dd>{route.theme}</dd></div>
          </dl>
        </div>
      </header>

      <div className="route-detail__content page-section page-container">
        <div className="route-overview">
          <section className="route-impression" aria-labelledby="route-impression-title">
            <h2 id="route-impression-title">主题印象</h2>
            <p>{route.summary}</p>
            <PlanningNote>路线时间、顺序、交通与可达性尚未完成来源核验。</PlanningNote>
            <div className="route-map-fallback" role="img" aria-label="路线示意素材待接入">
              <strong>路线示意素材待接入</strong>
              <span>规划中/待确认</span>
            </div>
          </section>

          <aside className="practical-panel" aria-label="路线实用信息">
            <h2>实用信息</h2>
            <dl>
              <div><dt>游览时长</dt><dd>{route.duration}</dd></div>
              <div><dt>难度等级</dt><dd>{route.difficulty}</dd></div>
              <div><dt>适合人群</dt><dd>{route.audience}</dd></div>
              <div><dt>交通建议</dt><dd>待后台补充</dd></div>
              <div><dt>注意事项</dt><dd>待后台补充</dd></div>
            </dl>
          </aside>
        </div>

        <Reveal>
          <section className="route-itinerary" aria-label="路线行程">
            <SectionHeading title="行程安排" description="以下站点用于展示模板结构，正式行程请以核验结果为准。" />
            <ol>
              {route.stops.map((stop, index) => (
                <li key={stop.id}>
                  <time>{String(9 + index * 2).padStart(2, '0')}:00</time>
                  <MediaFrame media={route.hero} />
                  <div>
                    <h3>{stop.name}</h3>
                    <p>{stop.note ?? '站点介绍、停留时间与交通建议待后台补充。'}</p>
                    <span>交通建议：待确认</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </Reveal>

        <Reveal className="route-records">
          <SectionHeading title="突击队足迹" description="团队记录素材将根据授权与核验情况持续接入。" />
          <div className="record-strip">
            {['走访记录', '现场观察', '团队协作', '乡村交流', '成果整理'].map((label) => (
              <div key={label}><strong>{label}</strong><span>素材整理中</span></div>
            ))}
          </div>
        </Reveal>

        <Reveal className="recommendations">
          <SectionHeading title="其他路线推荐" />
          <div className="recommendation-grid">
            {recommendations.map((item) => (
              <article key={item.id}>
                <span>{item.theme}</span>
                <h3>{item.name}</h3>
                <p>{item.duration}，{item.difficulty}</p>
                <Link className="text-link" to={`/routes/${item.id}`}>查看路线</Link>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </article>
  );
}
