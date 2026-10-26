import { Link } from 'react-router-dom';

import { Gallery } from './Gallery';
import { HeroMedia } from './HeroMedia';
import { MediaFrame } from './MediaFrame';
import { PlanningNote, SectionHeading } from './PageElements';
import { Reveal } from './Reveal';
import { publicRoutes, publicSpots } from './content';

const storySteps = [
  ['初心新兴', '以六祖文化为线索，开启云游体验'],
  ['弘法传道', '沿山水与古建，梳理文化脉络'],
  ['禅风远播', '连接景点、路线与乡村实践'],
  ['薪火长明', '以数字内容记录并持续更新'],
];

const seasonCards = [
  ['春', publicSpots[2].hero],
  ['夏', publicSpots[2].hero],
  ['秋', publicSpots[1].hero],
  ['冬', publicSpots[0].hero],
] as const;

export function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__media">
          <HeroMedia />
          <span className="home-hero__disclosure">用户提供视频 · 静音循环</span>
        </div>
        <div className="home-hero__scrim" aria-hidden="true" />
        <div className="home-hero__content page-container">
          <p className="hero-kicker">禅意故里，荔香新兴</p>
          <h1 id="home-title">六祖云游</h1>
          <p className="home-hero__summary">
            数字向导与文化记录，带您感受六祖文化与岭南山水。
          </p>
          <div className="hero-actions">
            <Link className="cta-link cta-link--primary" to="/map">
              开始云游
            </Link>
            <Link className="cta-link cta-link--secondary" to="/routes">
              查看主题路线
            </Link>
          </div>
        </div>
      </section>

      <Reveal className="home-story page-section page-container">
        <SectionHeading
          title="禅宗缘起"
          description="沿着山水与时间，认识新兴的文化脉络。"
        />
        <ol className="story-ribbon">
          {storySteps.map(([title, description]) => (
            <li key={title}>
              <strong>{title}</strong>
              <span>{description}</span>
            </li>
          ))}
        </ol>

        <div className="home-pathways">
          <article className="pathway-card pathway-card--wide">
            <div>
              <h3>禅踪地图</h3>
              <p>浏览景点关系与路线结构，真实地图将在后续接入。</p>
              <Link className="text-link" to="/map">
                前往地图
              </Link>
            </div>
            <MediaFrame media={publicSpots[1].hero} />
          </article>
          <article className="pathway-card">
            <h3>主题路线</h3>
            <p>六条模板路线连接文化、生态、乡村与实践主题。</p>
            <ol className="mini-route">
              {publicRoutes[0].stops.map((stop) => (
                <li key={stop.id}>{stop.name}</li>
              ))}
            </ol>
            <Link className="text-link" to="/routes">
              查看路线
            </Link>
          </article>
          <article className="pathway-card">
            <h3>七处胜境</h3>
            <p>从景点库进入详情页，查看图集与规划中的云游体验。</p>
            <MediaFrame media={publicSpots[0].hero} />
            <Link className="text-link" to="/spots">
              浏览景点
            </Link>
          </article>
        </div>
      </Reveal>

      <Reveal className="home-gallery page-section page-container">
        <div className="gallery-intro">
          <SectionHeading
            title="七处景点画廊"
            description="精选景点氛围视觉，图片内容均保留来源与核验说明。"
          />
          <Link className="text-link text-link--framed" to="/spots">
            查看景点库
          </Link>
        </div>
        <Gallery
          title="首页景点画廊"
          items={publicSpots.slice(0, 4).map((spot) => spot.hero)}
        />

        <div className="seasons-block">
          <h3>四时风物</h3>
          <div className="season-grid">
            {seasonCards.map(([season, media]) => (
              <article key={season} className="season-card">
                <MediaFrame media={media} />
                <strong>{season}</strong>
              </article>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal className="home-stamps page-section page-container">
        <div className="stamp-summary">
          <div>
            <SectionHeading title="集章云游" />
            <p className="stamp-progress"><strong>4</strong> / 7</p>
          </div>
          <PlanningNote>印章视觉将在原创素材任务完成后接入。</PlanningNote>
        </div>
        <div className="stamp-fallbacks" aria-label="七枚数字印章">
          {publicSpots.map((spot, index) => (
            <article key={spot.id} className={index < 4 ? 'is-unlocked' : ''}>
              <strong>{spot.name}</strong>
              <span>{index < 4 ? '示意解锁' : '尚未解锁'}</span>
            </article>
          ))}
        </div>

        <div className="visitor-guide">
          {[
            ['交通', '出行方式与可达性待权威来源补充'],
            ['美食', '本地饮食内容与经营信息待核验'],
            ['住宿', '住宿服务信息待项目方确认'],
          ].map(([title, description]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
