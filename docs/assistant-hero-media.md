> 历史开发记录（2026-08）。本次公开副本已排除权利未确认素材、私有配置和原型截图；当前功能/验证以根 README、CHANGELOG、THIRD_PARTY_NOTICES 为准。历史文件名仅用于来源追溯，不代表对应媒体已随仓库公开。

# 禅小荔精灵与 Hero 视频资产

## 已接入

- `apps/web/public/media/assistant/chan-xiaoli-assistant.png`：基于用户提供的禅小荔角色设定图生成的透明背景 3D 精灵，页面可拖拽、收起、唤醒并进入对话。
- `apps/web/public/media/hero/hero-user-upload.mp4`：用户提供的 Hero 视频，约 10 秒、1280×720、无声；桌面端作为首屏静音循环源。
- `apps/web/src/assistant/FloatingAssistant.tsx`：全站悬浮助手，不新增独立路由；单击打开小输入气泡、双击查看对话记录，记录会在最后一次对话后 1 小时清空。
- `apps/web/public/media/assistant/{waving,thinking,walking,meditating}.png`：基于用户 IP 设定图生成的独立动作资产，分别用于引导、思考、拖动与静修状态。
- `api/assistant-chat.js`：生产环境服务端代理；密钥仅从 `ZHIPUAI_API_KEY` 环境变量读取，浏览器端不会接触该值。

## 交互边界

- 移动端、低动效和省流量条件下 Hero 使用静态海报，避免自动播放造成流量和可用性问题。
- 精灵可用鼠标/触摸拖动，拖动时自动收起输入与记录，避免位置跳变；使用支持弹性手势的动画而非逐帧重算页面坐标。
- 聊天调用智谱模型，短气泡会自动淡出；完整记录只保存在当前浏览器，最后一次对话后 1 小时清空。
- 事实回答以网站已核验内容为准，开放时间、票价、路线坐标等动态信息仍显示待确认提示。
- 3D 精灵图属于 AI 视觉示意，正式比赛/运营发布前应补充 IP 形象授权与最终审稿记录。
