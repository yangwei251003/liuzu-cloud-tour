# 六祖云游视觉与动效约定

## Style Prompt

以原型为唯一视觉方向：岭南山水与秅文化的当代数字化表达。画面以米纸质感为底，墨绿建立信息层级，暗金只做分隔和重点，朱砂只做少量文化印记。图像保留清透的云雾层次、留白和自然的古建筑尺度，不增加原型之外的潮流视觉语汇。

## Colors

- 米纸 `#F5F2EA`：页面与浅色遮罩。
- 墨绿 `#2E5C4F`：品牌、标题与主操作。
- 深墨 `#0F1F1A`：深色页脚与高对比文字。
- 暗金 `#C8A45C`：边框、分隔线与少量光感。
- 朱砂 `#C44E3D`：印章与警示状态。

## Typography

- 标题：`Noto Serif SC`, `Songti SC`, `SimSun`, serif。
- 正文：`Noto Sans SC`, `PingFang SC`, `Microsoft YaHei`, system-ui, sans-serif。
- 数据：`Geist Mono`, `SFMono-Regular`, Consolas, monospace，使用等宽数字。

## Motion

- Hero 是 10 秒静音循环：山水只做约 3% 的缓慢推近，薄雾层水平漂移，金色暖光轻微呼吸。
- 循环首尾保持同一画面状态，不跳切、不闪烁、不添加文字。
- 移动端、`prefers-reduced-motion` 、省流量或 2G 网络只显示静态海报。

## What NOT to Do

- 不使用霍虹渐变、霓虹光、玻璃拟态或高频粒子。
- 不在视频或图片内生成 Logo、文字、古籍伪字或水印。
- 不以 CSS 绘制山水、印章、吉祥物或 Logo。
- 不放大动效幅度，不让动效压过标题和主操作。
- 不使用未授权第三方图像或将 AI 写实图冒充真实景点。
