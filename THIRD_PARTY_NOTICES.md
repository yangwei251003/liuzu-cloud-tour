# 许可与素材范围

自有代码、文档及本次公开演示修改采用根目录 MIT。依赖包各自保留原许可证，已安装包的许可文本及版本索引见 [third-party/licenses.json](third-party/licenses.json) 与 [third-party/licenses](third-party/licenses)。依赖包没有因此改为本项目 MIT。

## 可公开素材

`apps/*/public/media/generated/` 的 8 组插画及其压缩版本来自本项目 OpenAI ImageGen 生成记录。`media/hero-motion/` 是对应原创动效时间线；两个 `hero-cloud-loop` 视频为其无声编码。来源、提示词与原始哈希见 [生成记录](docs/task5-asset-metadata.md)；本次实际随仓库文件见 [媒体清单](docs/media-manifest.json)。AI 图仅作设计氛围示意，不构成实景照片、导航底图、调查结论或官方印鉴。本项目授权不保证 AI 输出在所有法域均具有排他版权。

## 未随仓库分发

品牌 Logo、吉祥物及衍生动作图、用户上传 Hero 视频、32 张设计原型的再分发权未得到本地台账证实，均不复制；只保留 [文件来源与哈希索引](docs/unpublished-media-sources.json)。公开界面改用文字品牌/助手及有生成记录的云雾视频。这些待确认材料不受本仓库 MIT 授权，也没有以截图方式绕过素材限制。

没有附带第三方实景照片、PLY/3DGS 模型、地图瓦片、轨迹数据或字体文件。字体使用系统回退。高德 JS API 仅保留可选接入代码；使用者须自行接受供应商条款，安全码不应公开注入静态页面。默认演示不加载高德。

## 事实资料

[云浮市政府：六祖故里旅游度假区](https://www.yunfu.gov.cn/zjyf/lyyf/msfj/content/post_1582810.html) 与 [中国非物质文化遗产网：六祖传说](https://www.ihchina.cn/project_details/23638.html) 作为文化背景来源链接，于 2026-10-26 访问核对。仅链接资料，未复制网站照片或整篇文字。七个景点/六条路线仍是待核验模板，未上传真实游客位置，也不公开未经核实的精确路线坐标。

## 仅动效创作源的外部依赖

`media/hero-motion/index.html` 保留原作对 GSAP 3.14.2 的 CDN 引用。GSAP 使用 [Standard no-charge license](https://gsap.com/standard-license)，并非本项目 MIT；作者工具的这一外部脚本没有复制到仓库或 Pages。网页使用已编码的无声视频，不依赖该 CDN。官方许可页本次重定向至维护提示，未把可访问或免费使用理解为完整开源许可。需要重渲染动效时请单独核对供应商许可与工具可用性。
