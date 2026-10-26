import { MediaFrame } from './MediaFrame';
import { PlanningNote, SectionHeading } from './PageElements';
import { Reveal } from './Reveal';
import { achievementFieldworkMedia } from './content';

const teamGroups = [
  ['调研组', '走访村落与景点', '整理资料与访谈授权'],
  ['内容组', '梳理文化内容结构', '维护来源与核验状态'],
  ['技术组', '建设公共端交互', '保障性能与无障碍体验'],
  ['设计组', '延续青绿山水语言', '统一页面版式与媒体规范'],
];

export function AboutPage() {
  return (
    <article className="about-page">
      <header className="about-hero">
        <MediaFrame media={achievementFieldworkMedia} className="about-hero__media" eager />
        <div className="about-hero__content page-container">
          <h1>关于六祖云游</h1>
          <p>
            以数字技术连接禅宗文化与乡村发展，用镜头记录实践，用设计传递价值。
          </p>
        </div>
      </header>

      <div className="about-content page-section page-container">
        <Reveal className="about-intro">
          <section>
            <SectionHeading title="项目背景" />
            <p>
              六祖云游面向公众与游客，整合文化展示、资源导览、路线推荐与实践成果。
              项目事实、组织与合作信息仍待书面材料确认。
            </p>
            <p>
              当前版本以原型页面为视觉基线，以来源台账约束公开信息，避免将规划内容表述为已核验事实。
            </p>
          </section>
          <section>
            <SectionHeading title="核心价值" />
            <dl className="value-list">
              <div><dt>文化传承</dt><dd>梳理可核验的文化线索，连接当代乡村语境。</dd></div>
              <div><dt>数字赋能</dt><dd>提升资源的可见度、可达性与体验连续性。</dd></div>
              <div><dt>乡村共融</dt><dd>关注在地生活与产业实践，记录真实行动。</dd></div>
            </dl>
          </section>
        </Reveal>

        <Reveal className="team-section">
          <SectionHeading title="团队分工" />
          <div className="team-grid">
            {teamGroups.map(([title, first, second]) => (
              <article key={title}>
                <h3>{title}</h3>
                <ul><li>{first}</li><li>{second}</li><li>具体成员信息待确认</li></ul>
              </article>
            ))}
          </div>
        </Reveal>

        <PlanningNote>组织、指导单位、团队成员、项目时间与荣誉信息尚待项目方书面确认。</PlanningNote>

        <Reveal className="design-principles">
          <SectionHeading title="设计理念" />
          <div>
            {[
              ['文化可感知', '让历史与人文可看、可听、可感。'],
              ['体验可参与', '以真实控件连接路线、图集与成果内容。'],
              ['内容可持续', '以长期运营为目标，随核验进度持续更新。'],
            ].map(([title, body]) => (
              <article key={title}><h3>{title}</h3><p>{body}</p></article>
            ))}
          </div>
        </Reveal>

        <Reveal className="capabilities">
          <SectionHeading title="技术与服务能力" />
          <ul>
            {['React', 'Three.js', '高德地图', 'ECharts', 'Node.js', '内容管理'].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="project-progress">
          <SectionHeading title="项目推进" />
          <ol>
            {['调研梳理', '内容建设', '产品体验', '持续迭代'].map((item) => (
              <li key={item}><strong>{item}</strong><span>推进状态待项目方确认</span></li>
            ))}
          </ol>
          <aside>
            <h3>成果索引</h3>
            <p>数据整理中</p>
          </aside>
        </Reveal>

        <section className="contact-strip" aria-labelledby="contact-title">
          <h2 id="contact-title">联系我们</h2>
          <p>联系信息待后台补充</p>
        </section>
      </div>
    </article>
  );
}
