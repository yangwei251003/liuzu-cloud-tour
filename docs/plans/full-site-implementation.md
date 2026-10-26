# 六祖云游全站前端复刻与增强实施计划

## Global Constraints

- 在独立工程内实现，不改动上级目录的文档、ZIP、原型和临时产物。
- ZIP 内 P01–P32 是桌面视觉真值，69 页 DOCX 是功能、交互和业务边界真值。
- 只实现六项主导航及原型覆盖页面；不新增会员、商城、预约、评论、收藏、AI 对话或系统设置。
- 所有页面使用语义化 DOM、真实控件和响应式布局，不得以整页截图充当页面。
- 使用“复刻基线 + 受控增强”；统一青绿、米白、鎏金、朱砂视觉令牌与 8px 栅格。
- 事实不确定时显示“规划中/待确认”；AI 写实素材显示“AI 视觉示意”。
- 高德、3D、真实视频和后端缺失时必须提供诚实、可操作的降级，不伪装成功。
- 新增业务行为遵循测试先行：先写失败测试，确认失败，再写最小实现并确认通过。
- Chrome 为浏览器验收基线；所有交付前运行单元测试、构建、Playwright 与设计 QA。

## Task 1: 工程基线、设计系统、数据与测试骨架

- 建立 pnpm workspace：`apps/web`、`apps/admin`、`packages/ui`、`packages/domain`、`tests`。
- 精确锁定计划中的 React、Vite、TypeScript、Tailwind、Motion、Zustand、Three、ECharts、Playwright 版本；Node engines 为 24.x。
- 配置 TypeScript、Vite、Vitest、Playwright、ESLint、生产构建脚本和 `.env.example`。
- 建立共享视觉令牌、基础样式、字体回退、无障碍焦点、低动效与响应式断点。
- 建立领域类型、来源/核验状态、示例景点/路线/成果数据及版本化 LocalStorage 仓储。
- 建立 AppShell、导航、页脚、按钮、状态面板、媒体元数据与路由清单测试。
- 将 32 张参考 PNG 复制到 `references/prototypes/`，生成 `docs/page-matrix.md` 与素材/事实台账初稿。

## Task 2: 公共端首页、景点、路线、成果与关于页面

- 公共端实现 `/`、`/spots`、`/spots/:spotId`、`/routes`、`/routes/:routeId`、`/achievements`、`/achievements/:type`、`/about`。
- P01–P04 合并为连续首页；P07–P08、P25–P26 分别合并成长页。
- 复刻桌面结构、信息密度、卡片比例、排版、筛选、分页、画廊、灯箱、播放器与下载状态。
- 六条路线复用一个详情模板；五类成果复用一个详情模板。
- 添加克制的滚动揭示、画廊切换、卡片悬停与 `prefers-reduced-motion` 适配。
- 为关键页面写组件/路由行为测试并完成首次同尺寸静态截图。

## Task 3: 地图、3D、集章与证书互动

- 实现 `/map`、`/spots/:spotId/3d`、`/stamps`、`/stamps/certificate`。
- `MapAdapter` 提供 `amap`/`mock`；无 Key/断网/失败时使用原创离线示意地图，保留搜索、筛选、Marker、路线、抽屉和重试。
- `ViewerAdapter` 提供普通 PLY、Gaussian Splat 接口与不可用降级；实现加载、重置、旋转/缩放、截图、全屏、5 秒提示、重试和图文状态。
- 页面可见且连续停留 30 秒才解锁印章；刷新后保留；4/7 卡片、7/7 证书、下载与系统分享降级可用；音效默认关闭且不超过 30%。
- 为适配器切换、可见性计时、持久化、阈值与降级写失败优先测试。

## Task 4: 管理后台完整演示流程

- 独立后台应用实现 `/admin`、`/admin/stats`、`/admin/spots`、`/admin/spots/new`、`/admin/spots/:spotId`、`/admin/routes`、`/admin/achievements`。
- 实现演示登录、统计图表、筛选分页、景点新增/编辑/删除确认/上下线、路线拖拽排序、成果编辑与上传本地预览。
- 使用共享本地仓储适配器；刷新后持久化；明确“本地演示模式”，不宣称生产安全或云端成功。
- 实现加载、空、失败、保存成功、表单错误和移动表格/卡片状态；补齐行为测试。

## Task 5: 原创视觉资产与 Hero 动效视频

- 按原型画面目录生成原创无文字 Hero、地图底画、青绿山水纹理、景点/路线氛围图、七枚印章与证书底图；项目内保存并登记提示词/AI 元数据。
- 品牌 Logo 使用现有高清文件，不重绘；图标使用匹配的开源图标库，不用 emoji 或手绘 SVG 替代。
- 用 HyperFrames 制作 8–12 秒无声、无缝、克制的云雾/墨染 Hero 循环，输出 WebM/MP4 与静态海报；移动端、省流量、低动效使用海报。
- 检查所有素材裁切、锐度、压缩、无文字伪影、版权标签和加载策略。

## Task 6: 全站 QA、性能、文档与交付

- 在 1487×1058、1440×1024、768×1024、390×844、1920×1080 做 Chrome/Playwright 截图和交互回归。
- 对同路由同状态做设计 QA；修复 P0/P1/P2，生成 `design-qa.md`，最终结果只能是 `passed` 或 `blocked`。
- 运行单元测试、类型检查、Lint、两应用生产构建、Playwright、可访问性和性能审计。
- 交付 README、运行说明、页面矩阵、资产/版权台账、事实来源表、测试报告、视觉差异报告与已知限制。
- 最终代码审查后修复所有 Critical/Important 问题，再进行新鲜的全量验证。
