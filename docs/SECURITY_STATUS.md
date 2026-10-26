# 安全与演示范围

公开副本不附带 `.env.local`、地图/模型 Key、游客轨迹、账户信息、数据导出或私有工具配置。示例景点坐标留空，后台只写当前浏览器 LocalStorage；不要输入真实账号密码或私人信息。公开站的旅行纪念进度也仅在本机，使用者可清理站点数据重置。

Pages 没有云端 AI/API、用户账户或数据库。助手在静态构建中不发出模型请求。`api/assistant-chat.js` 和 Vite 开发代理是可选接入模板，不能视为完整生产后端；真实启用前须实现服务身份、速率/请求大小/超时限制、域名安全与运营监控。高德安全码不得作为公开构建内容。

## 本次有界依赖修补

- Vite 8.2.1 → 8.2.4，修补开发工具的编辑器入口/文件服务问题，见 [Vite advisory](https://github.com/advisories/GHSA-587h-7wmj-h5pm)。不把开发服务器暴露公网。
- Vitest 4.1.10 → 4.1.12，根与 tests 工作区统一，修补测试 mock 入口，见 [Vitest advisory](https://github.com/vitest-dev/vitest/security/advisories/GHSA-qxg6-89mg-rqv8)。
- Undici → 8.12.2，source-map-js → 1.2.2，brace-expansion → 5.0.12，保留在根 pnpm overrides 和锁文件中。它们位于测试/样式编译/代码检查链，修补未可信输入导致的拒绝服务等问题；应用未改为服务这些上游测试接口。

本次审计数据库未报告剩余依赖告警，并不保证未来无漏洞。实际功能验证与未验证部分见 [发布验证](release-validation.md)。原本地环境秘密没有迁移，原目录与未授权素材不能据此整目录删除。
