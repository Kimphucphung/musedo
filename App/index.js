const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
};

export default {
  async fetch(request, env, ctx) {
    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    const url = new URL(request.url);
    if (url.pathname !== '/ai') {
      return new Response('Not found', { status: 404, headers: cors });
    }

    try {
      const body = await request.json().catch(() => ({}));
      // nhận cả 2 kiểu payload
      const { messages, json, temperature, prompt, op } = body;

      // build request cho OpenAI (chat)
      const payload = {
        model: 'gpt-4o-mini',
        messages: messages ?? [
          { role: 'system', content: 'You are Muse AI.' },
          { role: 'user', content: prompt ?? '' }
        ],
        temperature: temperature ?? 0.5,
      };

      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await r.json();
      const text =
        data.choices?.[0]?.message?.content ||
        data.choices?.[0]?.text || '';

      return new Response(
        JSON.stringify({ ok: true, text }),
        { headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ ok: false, error: String(err) }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
      );
    }
  }
};
