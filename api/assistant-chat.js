const endpoint = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

const instruction = `你是“禅小荔”，六祖云游网站的智能助手。语气温暖、清澈、自然，像乐于帮助的文化小向导；每次回答简洁、有用，通常不超过180个中文字符。
你熟悉本站的栏目：禅踪地图、景点巡礼、主题路线、数字集章、实践成果、关于项目。已核验信息包括：国恩寺在新兴县六祖镇，2019年列入第八批全国重点文物保护单位；六祖传说为国家级非物质文化遗产相关项目。对于景点开放时间、票价、路线距离、精确坐标等动态或未核验信息，明确说“请以管理方公告为准”，不要编造。
当用户询问网站操作时，优先给出清晰步骤。不要声称自己有实时定位、订票、预约或官方身份。`;

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Only POST is supported.' });
  const apiKey = process.env.ZHIPUAI_API_KEY;
  if (!apiKey) return response.status(503).json({ error: 'Assistant service is not configured.' });

  const messages = (request.body?.messages ?? [])
    .filter((message) => (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string' && message.content.trim())
    .slice(-12)
    .map((message) => ({ role: message.role, content: message.content.trim().slice(0, 1000) }));
  if (!messages.some((message) => message.role === 'user')) return response.status(400).json({ error: 'Message is required.' });

  try {
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.ZHIPUAI_MODEL ?? 'glm-4.5-flash',
        temperature: 0.6,
        max_tokens: 360,
        stream: false,
        messages: [{ role: 'system', content: instruction }, ...messages],
      }),
    });
    const payload = await upstream.json();
    const content = payload?.choices?.[0]?.message?.content?.trim();
    if (!upstream.ok || !content) return response.status(502).json({ error: 'Assistant service is temporarily unavailable.' });
    return response.status(200).json({ content });
  } catch {
    return response.status(502).json({ error: 'Assistant service is temporarily unavailable.' });
  }
}
