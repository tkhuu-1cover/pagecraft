// A tiny proxy that lets the editor's assistant use the Anthropic API without exposing your key.
// Run it with `npm run ai-proxy` (reads .env), then start the editor with `npm run dev`.
import http from 'node:http';

const PORT = Number(process.env.AI_PROXY_PORT || 8787);
const KEY = process.env.ANTHROPIC_API_KEY;
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';
if (!KEY) { console.error('Set ANTHROPIC_API_KEY in .env first.'); process.exit(1); }

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

// The editor sends the rules as the first user turn and can send several user turns in a row; the
// Messages API wants alternating roles, so consecutive turns from the same role are merged.
function alternate(messages) {
  const out = [];
  for (const m of messages) {
    if (!m || !m.content) continue;
    const role = m.role === 'assistant' ? 'assistant' : 'user';
    const last = out[out.length - 1];
    if (last && last.role === role) last.content += '\n\n' + m.content;
    else out.push({ role, content: String(m.content) });
  }
  return out;
}

http.createServer(async (req, res) => {
  if (req.method !== 'POST' || !req.url.startsWith('/api/ai')) return send(res, 404, { error: 'not found' });
  let raw = '';
  for await (const chunk of req) raw += chunk;
  let messages;
  try { messages = alternate(JSON.parse(raw).messages || []); } catch { return send(res, 400, { error: 'bad request' }); }
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8000,
        system: 'Reply with only the JSON object the user asks for. No markdown fences, no commentary.',
        messages
      })
    });
    if (r.status === 429) return send(res, 429, { error: 'rate limited' });
    if (!r.ok) return send(res, 502, { error: 'upstream ' + r.status, detail: await r.text() });
    const data = await r.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    const json = text.replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/, '').trim();
    try { send(res, 200, JSON.parse(json)); } catch { send(res, 502, { error: 'model did not return JSON' }); }
  } catch (e) {
    send(res, 502, { error: String(e) });
  }
}).listen(PORT, () => console.log('Assistant proxy on http://localhost:' + PORT + '/api/ai'));
