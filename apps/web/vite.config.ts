import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv, type Plugin } from 'vite';

const zhipuEndpoint = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const assistantInstruction = `你是“禅小荔”，六祖云游网站的智能助手。语气温暖、清澈、自然，像乐于帮助的文化小向导；每次回答简洁、有用，通常不超过180个中文字符。
你熟悉本站的栏目：禅踪地图、景点巡礼、主题路线、数字集章、实践成果、关于项目。已核验信息包括：国恩寺在新兴县六祖镇，2019年列入第八批全国重点文物保护单位；六祖传说为国家级非物质文化遗产相关项目。对于景点开放时间、票价、路线距离、精确坐标等动态或未核验信息，明确说“请以管理方公告为准”，不要编造。
当用户询问网站操作时，优先给出清晰步骤。不要声称自己有实时定位、订票、预约或官方身份。`;

function zhipuDevProxy(apiKey: string | undefined): Plugin {
  return {
    name: 'liuzu-zhipu-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/assistant-chat', async (request, response) => {
        if (request.method !== 'POST') {
          response.statusCode = 405;
          response.setHeader('content-type', 'application/json');
          response.end(JSON.stringify({ error: 'Only POST is supported.' }));
          return;
        }
        if (!apiKey) {
          response.statusCode = 503;
          response.setHeader('content-type', 'application/json');
          response.end(JSON.stringify({ error: 'Assistant service is not configured.' }));
          return;
        }

        const chunks: Buffer[] = [];
        request.on('data', (chunk: Buffer) => chunks.push(chunk));
        request.on('end', async () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as {
              messages?: Array<{ role?: string; content?: string }>;
            };
            const messages = (body.messages ?? [])
              .filter(
                (message) =>
                  (message.role === 'user' || message.role === 'assistant') &&
                  typeof message.content === 'string' &&
                  message.content.trim().length > 0,
              )
              .slice(-12)
              .map((message) => ({ role: message.role as 'user' | 'assistant', content: message.content!.trim().slice(0, 1000) }));
            if (!messages.some((message) => message.role === 'user')) throw new Error('Message is required.');

            const upstream = await fetch(zhipuEndpoint, {
              method: 'POST',
              headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: process.env.ZHIPUAI_MODEL ?? 'glm-4.5-flash',
                temperature: 0.6,
                max_tokens: 360,
                stream: false,
                messages: [{ role: 'system', content: assistantInstruction }, ...messages],
              }),
            });
            const payload = (await upstream.json()) as { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } };
            const content = payload.choices?.[0]?.message?.content?.trim();
            if (!upstream.ok || !content) {
              throw new Error(
                payload.error?.message ?? `Upstream ${upstream.status} returned no assistant content.`,
              );
            }
            response.statusCode = 200;
            response.setHeader('content-type', 'application/json');
            response.end(JSON.stringify({ content }));
          } catch {
            response.statusCode = 502;
            response.setHeader('content-type', 'application/json');
            response.end(JSON.stringify({ error: 'Assistant service is temporarily unavailable.' }));
          }
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, fileURLToPath(new URL('../..', import.meta.url)), '');
  return {
    base: process.env.PAGES_BASE_PATH ?? '/',
    plugins: [react(), tailwindcss(), zhipuDevProxy(environment.ZHIPUAI_API_KEY)],
    server: { port: 5173 },
    preview: { port: 4173 },
  };
});
