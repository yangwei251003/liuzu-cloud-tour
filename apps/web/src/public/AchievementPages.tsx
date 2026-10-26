import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Gallery } from './Gallery';
import { MediaFrame } from './MediaFrame';
import { NotFoundState, PlanningNote, SectionHeading } from './PageElements';
import { Reveal } from './Reveal';
import {
  achievementFieldworkMedia,
  getAchievement,
  publicAchievements,
  publicSpots,
} from './content';

export function AchievementsPage() {
  return (
    <div className="achievements-page">
      <header className="achievement-banner">
        <MediaFrame media={achievementFieldworkMedia} className="achievement-banner__media" eager />
        <div className="achievement-banner__content page-container">
          <h1>突击队成果</h1>
          <p>记录团队走访、实践与创作，事实与数据仍按来源逐项核验。</p>
        </div>
      </header>

      <section className="achievement-catalog page-section page-container" aria-label="成果列表">
        <div className="achievement-grid">
          {publicAchievements.map((achievement, index) => (
            <Reveal
              key={achievement.type}
              className={index === 0 ? 'achievement-card achievement-card--featured' : 'achievement-card'}
            >
              <MediaFrame media={achievement.hero} />
              <div className="achievement-card__body">
                <span>{achievement.category}</span>
                <h2>{achievement.title}</h2>
                <p>{achievement.summary}</p>
                <Link className="text-link text-link--gold" to={`/achievements/${achievement.type}`}>
                  查看成果
                </Link>
              </div>
            </Reveal>
          ))}
        </div>

        <aside className="achievement-map-cta">
          <div>
            <h2>成果与景点实地记录</h2>
            <p>每类成果都与走访点位及路线关联，具体关系待资料核验后发布。</p>
          </div>
          <Link className="text-link text-link--framed" to="/map">前往地图查看</Link>
        </aside>
      </section>
    </div>
  );
}

function OutcomeSpecificContent({ type }: { type: string }) {
  if (type === 'survey') {
    return (
      <div className="survey-grid">
        {['回收问卷数', '有效问卷数', '有效率', '调研时间'].map((label) => (
          <article key={label}>
            <h3>{label}</h3>
            <strong>数据整理中</strong>
            <p>正式数据接入后展示</p>
          </article>
        ))}
      </div>
    );
  }

  if (type === 'interview') {
    return (
      <div className="interview-excerpt">
        <h3>听见乡土故事</h3>
        <p><strong>问：</strong>您最希望年轻人了解村里的什么？</p>
        <p><strong>答：</strong>访谈文字待取得授权并完成核验后公开。</p>
        <PlanningNote>当前不展示受访者姓名、原声或未经授权的个人信息。</PlanningNote>
      </div>
    );
  }

  if (type === 'party-building') {
    return (
      <ol className="event-timeline">
        {['开场致辞', '村民表演', '实践分享', '互动交流', '合唱与闭幕'].map((item) => (
          <li key={item}><strong>{item}</strong><span>流程与时间待确认</span></li>
        ))}
      </ol>
    );
  }

  if (type === 'aigc') {
    return (
      <Gallery
        title="AIGC 作品画廊"
        items={publicSpots.slice(0, 3).map((spot) => spot.hero)}
      />
    );
  }

  return (
    <div className="live-metrics">
      {['观看次数', '点赞数', '助农成果'].map((label) => (
        <article key={label}><h3>{label}</h3><strong>数据整理中</strong></article>
      ))}
    </div>
  );
}

export function AchievementDetailPage() {
  const { type } = useParams();
  const achievement = getAchievement(type);
  const [mediaMessage, setMediaMessage] = useState('');
  const [downloadMessage, setDownloadMessage] = useState('');

  if (!achievement) {
    return (
      <NotFoundState
        title="未找到这类成果"
        description="成果类型可能尚未发布，或当前链接已经失效。"
        to="/achievements"
        linkLabel="返回成果列表"
      />
    );
  }

  const downloadLabel = achievement.type === 'party-building' ? '下载策划方案' : '下载成果资料';

  return (
    <article className={`detail-page achievement-detail achievement-detail--${achievement.type}`}>
      <nav className="breadcrumbs page-container" aria-label="面包屑">
        <Link to="/achievements">返回成果列表</Link><span>/</span><span>{achievement.title}</span>
      </nav>

      <header className="achievement-detail__hero page-container">
        <MediaFrame media={achievement.hero} className="achievement-detail__hero-media" eager />
        <div>
          <span className="detail-category">{achievement.category}</span>
          <h1>{achievement.title}</h1>
          <p>{achievement.summary}</p>
          <PlanningNote>传播量、样本量、人物与结论均需逐项举证。</PlanningNote>
        </div>
      </header>

      <section className="achievement-detail__content page-section page-container" aria-label="成果内容">
        <Reveal className="achievement-primary">
          <SectionHeading title={achievement.sections[0]} />
          <OutcomeSpecificContent type={achievement.type} />
        </Reveal>

        <Reveal className="achievement-media-panel">
          <SectionHeading title={achievement.sections[1]} description="真实音视频与下载文件尚未接入，以下操作提供明确降级反馈。" />
          <div className="media-actions">
            <button type="button" onClick={() => setMediaMessage('媒体素材待接入，当前无法播放。')}>
              播放成果媒体
            </button>
            <button type="button" onClick={() => setDownloadMessage('下载素材待接入，请稍后再试。')}>
              {downloadLabel}
            </button>
          </div>
          {mediaMessage ? <p className="inline-message inline-message--error" role="alert">{mediaMessage}</p> : null}
          {downloadMessage ? <p className="inline-message" role="status">{downloadMessage}</p> : null}
        </Reveal>

        <Reveal className="achievement-record-grid">
          <SectionHeading title={achievement.sections[2]} />
          <div>
            {['现场记录', '团队协作', '内容整理', '成果发布'].map((label) => (
              <article key={label}>
                <MediaFrame media={achievement.hero} />
                <h3>{label}</h3>
              </article>
            ))}
          </div>
        </Reveal>
      </section>
    </article>
  );
}
