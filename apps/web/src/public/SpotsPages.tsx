import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Gallery } from './Gallery';
import { MediaFrame } from './MediaFrame';
import { NotFoundState, PlanningNote, SectionHeading } from './PageElements';
import { Reveal } from './Reveal';
import { getSpot, publicSpots } from './content';

export function SpotsPage() {
  const pageSize = 6;
  const [category, setCategory] = useState('全部');
  const [town, setTown] = useState('全部');
  const [cloudState, setCloudState] = useState('全部');
  const [sort, setSort] = useState('默认');
  const [page, setPage] = useState(1);

  const categories = [...new Set(publicSpots.map((spot) => spot.category))];
  const towns = [...new Set(publicSpots.map((spot) => spot.town))];

  const spots = useMemo(() => {
    const next = publicSpots.filter(
      (spot) =>
        (category === '全部' || spot.category === category) &&
        (town === '全部' || spot.town === town) &&
        (cloudState === '全部' || (cloudState === '3D 规划中' && spot.supports3d)),
    );

    if (sort === '名称') {
      return [...next].sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'));
    }
    return next;
  }, [category, cloudState, sort, town]);
  const pageCount = Math.max(1, Math.ceil(spots.length / pageSize));
  const visibleSpots = spots.slice((page - 1) * pageSize, page * pageSize);
  const changeFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const resetFilters = () => {
    setCategory('全部');
    setTown('全部');
    setCloudState('全部');
    setSort('默认');
    setPage(1);
  };

  return (
    <div className="catalog-page">
      <header className="page-banner page-banner--spots">
        <div className="page-container">
          <h1>景点库</h1>
          <p>探寻禅意胜境，理解六祖文化与乡村新貌。</p>
        </div>
      </header>

      <section className="catalog-content page-section page-container" aria-label="景点筛选与列表">
        <div className="filter-bar">
          <label>
            <span>类别</span>
            <select aria-label="按类别筛选" value={category} onChange={(event) => changeFilter(setCategory, event.target.value)}>
              <option>全部</option>
              {categories.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label>
            <span>乡镇</span>
            <select aria-label="按乡镇筛选" value={town} onChange={(event) => changeFilter(setTown, event.target.value)}>
              <option>全部</option>
              {towns.map((value) => <option key={value}>{value}</option>)}
            </select>
          </label>
          <label>
            <span>3D 状态</span>
            <select aria-label="按 3D 规划状态筛选" value={cloudState} onChange={(event) => changeFilter(setCloudState, event.target.value)}>
              <option>全部</option>
              <option>3D 规划中</option>
            </select>
          </label>
          <label>
            <span>排序</span>
            <select aria-label="景点排序" value={sort} onChange={(event) => changeFilter(setSort, event.target.value)}>
              <option>默认</option>
              <option>名称</option>
            </select>
          </label>
          <div className="filter-bar__result" aria-live="polite">共 {spots.length} 个景点</div>
          <button type="button" className="text-button" onClick={resetFilters}>清除筛选</button>
        </div>

        {spots.length === 0 ? (
          <div className="empty-state" role="status">
            <h2>暂无匹配景点</h2>
            <p>尝试调整类别或乡镇，也可以清除全部筛选。</p>
            <button type="button" onClick={resetFilters}>显示全部景点</button>
          </div>
        ) : (
          <div className="spot-grid">
            {visibleSpots.map((spot, index) => (
              <Reveal key={spot.id} className={index === 0 ? 'spot-card spot-card--featured' : 'spot-card'}>
                <MediaFrame media={spot.hero} />
                <div className="spot-card__body">
                  <div className="card-title-row">
                    <h2>{spot.name}</h2>
                    <span>{spot.town}</span>
                  </div>
                  <ul className="tag-list" aria-label={`${spot.name}标签`}>
                    {spot.tags.map((tag) => <li key={tag}>{tag}</li>)}
                  </ul>
                  <p>{spot.summary}</p>
                  <div className="card-actions">
                    <span>{spot.supports3d ? '3D 云游规划中' : '图文导览'}</span>
                    <Link className="text-link" to={`/spots/${spot.id}`}>查看详情</Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
        {spots.length > 0 ? (
          <nav className="catalog-pagination" aria-label="景点分页">
            <button type="button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>上一页</button>
            <span>显示第 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, spots.length)} 项，共 {spots.length} 项</span>
            <button type="button" disabled={page === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>下一页</button>
          </nav>
        ) : null}
      </section>
    </div>
  );
}

export function SpotDetailPage() {
  const { spotId } = useParams();
  const spot = getSpot(spotId);

  if (!spot) {
    return (
      <NotFoundState
        title="未找到这个景点"
        description="景点可能尚未发布，或当前链接已经失效。"
        to="/spots"
        linkLabel="返回景点库"
      />
    );
  }

  return (
    <article className="detail-page spot-detail">
      <nav className="breadcrumbs page-container" aria-label="面包屑">
        <Link to="/">首页</Link><span>/</span><Link to="/spots">景点库</Link><span>/</span><span>{spot.name}</span>
      </nav>

      <header className="detail-hero">
        <MediaFrame media={spot.hero} className="detail-hero__media" eager />
        <div className="detail-hero__content page-container">
          <h1>{spot.name}</h1>
          <div className="detail-hero__meta">
            <span>{spot.category}</span><span>{spot.town}</span>
          </div>
          <p>{spot.summary}</p>
          {spot.supports3d ? (
            <Link className="cta-link cta-link--gold" to={`/spots/${spot.id}/3d`}>
              进入 3D 云游
            </Link>
          ) : null}
        </div>
      </header>

      <div className="detail-layout page-section page-container">
        <section className="detail-layout__main" aria-label="景点详情内容">
          <Reveal>
            <SectionHeading title="图文介绍" description="当前展示规划结构，详细史实与服务信息待权威来源补充。" />
            <PlanningNote>介绍、开放信息与联系方式尚未完成来源核验。</PlanningNote>
          </Reveal>

          <Reveal>
            <Gallery title={`${spot.name}图集`} items={spot.gallery} />
          </Reveal>

          <Reveal className="detail-section">
            <SectionHeading title="核心看点" />
            <div className="highlight-grid">
              {spot.highlights.map((highlight) => (
                <article key={highlight}>
                  <h3>{highlight}</h3>
                  <p>内容待项目方补充并完成事实核验。</p>
                </article>
              ))}
            </div>
          </Reveal>

          <Reveal className="detail-section field-records">
            <SectionHeading title="实地记录" description="现场照片、访谈节选、直播片段与问卷数据将按授权情况接入。" />
            <div className="record-grid">
              {['现场照片', '访谈节选', '直播片段', '问卷数据'].map((item) => (
                <article key={item}>
                  <h3>{item}</h3>
                  <p>素材整理中</p>
                </article>
              ))}
            </div>
          </Reveal>
        </section>

        <aside className="practical-panel" aria-label="实用信息">
          <h2>实用信息</h2>
          <dl>
            <div><dt>开放时间</dt><dd>待后台补充</dd></div>
            <div><dt>交通</dt><dd>待后台补充</dd></div>
            <div><dt>电话</dt><dd>待后台补充</dd></div>
            <div><dt>路线信息</dt><dd>待后台补充</dd></div>
          </dl>
          <PlanningNote>请勿依据当前展示内容安排出行。</PlanningNote>
        </aside>
      </div>

      <div className="detail-cta page-container">
        <Link className="cta-link cta-link--secondary" to="/stamps">查看印章册</Link>
      </div>
    </article>
  );
}
