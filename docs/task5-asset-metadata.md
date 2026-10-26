> 历史开发记录（2026-08）。本次公开副本已排除权利未确认素材、私有配置和原型截图；当前功能/验证以根 README、CHANGELOG、THIRD_PARTY_NOTICES 为准。历史文件名仅用于来源追溯，不代表对应媒体已随仓库公开。

# Task 5 素材与生成元数据

> 本文件是 Task 5 独立台账，由总任务在并行开发结束后合并到全站素材/版权台账。素材日期为 2026-08-09 至 2026-08-11。

## 用户提供的品牌素材

| 项目内文件 | 原始文件 | 尺寸 | SHA-256 | 状态 |
|---|---|---:|---|---|
| `apps/web/public/media/brand/liuzu-cloud-tour-logo-source.jpg` | `[本地项目资料]/logo.jpg` | 1280×1280 | `A1D8B0C85A910C0704006B093413D178ED5A676AE092C1ECA5F06710B7C64F25` | 用户提供；原样复制；正式商用授权待用户确认 |
| `apps/web/public/media/brand/liuzu-cloud-tour-logo.jpg` | 由上述源文件去除四周纯白留白，不改变 Logo 图形 | 718×697 | `AD201CA10FE4F73DD26651AD4CA60AFA9FACA5C7F9FA8DFF7ACF3FF09BAE36A0` | 网页展示裁切版；JPEG quality 92；授权同源文件 |
| `apps/web/public/media/brand/chan-xiaoli-mascot.png` | `.../04_视觉资产/禅小荔_标准立绘_v2.png` | 1254×1254 | `E1713AB2C06AE749F80916AAC2F41D1D52550BB876D863A5B2E2127E1D9339C9` | 用户提供；透明 PNG 原样复制；IP/商用授权待确认 |

吉祥物同时保存 512w/1024w 的 WebP 与 AVIF 透明压缩版（WebP quality 82，AVIF quality 58），供后续组件按展示尺寸接入；本任务不在原型未出现的位置强行添加吉祥物。

## ImageGen 原创素材

工具：OpenAI ImageGen。所有写实型素材在网页显示“AI 视觉示意（规划中/待确认）”，不作为景点真实现状或地理事实。原 PNG 均保留；压缩版由 Pillow 11 + pillow-avif-plugin 生成，WebP quality 82/method 6，AVIF quality 58/speed 6，按 768w/1536w 输出（原图不足 1536w 时不放大）。

| 原文件 | 尺寸 | SHA-256 | 生成提示词（完整语义记录） |
|---|---:|---|---|
| `hero-shanshui-ai-v1.png` | 1536×1024 | `1E264CC510AE0EED0EAE637EECF52C7C9A454D07C0501A1DBF4932D801C1CA70` | 原创岭南山水首页背景，横向构图，远山云雾、古塔、荔枝枝叶和少量朱砂院墙，米纸、墨绿、暗金色调，保留左侧标题留白，纸本质感与现代摄影细节融合，无文字、无 Logo、无水印、无人物。 |
| `spot-tea-mountains-ai-v1.png` | 1536×1024 | `617A4D2873C1B892FB24FCE9ECC92850F0E9AF41361DB1EB14ED9B1B5413AB22` | 原创云浮山地茶园氛围图，云雾、层叠茶垄和远山，青绿低饱和、自然早光、安静广角纪实感，不指称具体真实景点，无文字、无人物、无水印。 |
| `spot-lychee-orchard-ai-v1.png` | 1536×1024 | `03DD4AAA9402E29B7847F250923E4BE3B75CF00D884CF0786336185B8452AD7C` | 原创岭南荔枝果园氛围图，成熟红荔枝、枝叶间的柔和日光和纵深果园小径，自然、清透、不商业摆拍，无文字、无 Logo、无水印。 |
| `spot-temple-tower-ai-v1.png` | 1536×1024 | `70FCC80D358BFAE1ED3D4927A5CF5E5D09B5DD0252D0A1DDF151A1E106494A7B` | 原创岭南山林寺院与古塔氛围图，建筑位于茂密山林和薄雾中，米白墙面、暗红局部与墨绿山色，克制、庄重、非具体史实复原，无文字、无僧人、无水印。 |
| `achievement-fieldwork-ai-v1.png` | 1536×1024 | `39C69215679489E40E067EB52856B517166958A209EB8B99988F76D452A7DFF4` | 原创乡村调研纪实氛围图，青年团队在户外访谈与记录，自然日光、真实互动、不对应任何真实团队或人物，二次编辑去除衣物上类 Logo 图形，无文字、无水印。 |
| `offline-map-ai-v1.png` | 1536×1024 | `86A9004D36A5F5622AC9BE8BB11C7F0D4AE06CB658BB94C33723F1C5BF1E0F65` | 原创离线山水示意底图，米纸、青绿山形、河流和道路纹理，为地图 UI 预留标记对比度，不表示真实地理边界或精确路线，无文字、无图标、无水印。 |
| `stamp-medallions-ai-v1.png` | 1536×1024 | `037D1A96C5E3DAAC6FDDE5B0C9937BF0A773C10D26A9DEE29A6BD592713D20DE` | 七枚原创中式纪念印章组图，朱砂与暗金、纸本雕刻质感，以山、塔、茶叶、荔枝等无文字图形区分，不使用真实宗教符号或法印，无文字、无 Logo、无水印。 |
| `texture-rice-paper-ai-v1.png` | 1024×1024 | `F689ABCDFABB27376963A3E1CEF2D3E4E7B891D12108DA8C5BFF475F0D443F4B` | 可平铺的浅米色手工米纸微纹理，颗粒弱、无折痕、无污渍、无文字、无图案、无边缘阴影，用于低对比背景。 |

## 动效视频

| 文件 | 参数 | 大小 | SHA-256 |
|---|---|---:|---|
| `apps/web/public/media/hero/hero-cloud-loop.webm` | VP9，1536×1024，30fps，10.00s，无音频 | 631,893 B | `71AA156342A3C95384C33FAA4F85172D13398A4D4658A612E0123780F0F2D454` |
| `apps/web/public/media/hero/hero-cloud-loop.mp4` | H.264 High，yuv420p，1536×1024，30fps，10.00s，无音频 | 793,723 B | `AC410C891C1FE08AE13C38DB13C5C117208BC87BF22D033439DABEBEC8F53EE1` |

动效源文件位于 `media/hero-motion/index.html`，时间线为确定性 10 秒往返，无 `repeat: -1`、无随机数、无音频。HyperFrames CLI 在当前环境因 npm 连接超时未能执行 lint/render；交付视频依照同一往返时间线由 FFmpeg 7.1 编码，已用媒体探测复核时长、分辨率、编码和无音频流。
