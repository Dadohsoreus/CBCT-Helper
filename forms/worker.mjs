import { usCountries, usLocations } from './locations.mjs';

const origins = new Set(['https://cbcthelper.com', 'https://www.cbcthelper.com']);
const limits = { name: 100, email: 254, phone: 40, practice: 160, message: 4000, state: 2, website: 200 };
const fields = {
  feedback: ['email', 'message', 'name', 'phone', 'website'],
  lead: ['name', 'email', 'state', 'practice', 'phone', 'message', 'website']
};
const emailPattern = /^[^\s@<>(),;:"\\]+@[^\s@<>(),;:"\\]+\.[^\s@<>(),;:"\\]+$/u;

async function readSubmission(request) {
  // JSON escaping can expand a 4,000-character message considerably.
  const maxBytes = 30000;
  const reader = request.body?.getReader();
  if (!reader) throw 400;
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let text = '', size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw 413; }
    text += decoder.decode(value, { stream: true });
  }
  return JSON.parse(text + decoder.decode());
}

function validate(type, body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const data = {};
  for (const [key, value] of Object.entries(body)) {
    if (!fields[type].includes(key) || typeof value !== 'string' || value.length > limits[key]) return null;
    if (key !== 'message' && /[\u0000-\u001f\u007f]/u.test(value)) return null;
    data[key] = value.trim();
  }
  if (!data.email || !emailPattern.test(data.email) || data.website) return null;
  if (type === 'feedback' && !data.message) return null;
  if (type === 'lead' && (!data.name || !Object.hasOwn(usLocations, data.state))) return null;
  return data;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    if (!origins.has(origin)) return new Response(null, { status: 403 });
    const headers = {
      'Access-Control-Allow-Origin': origin, 'Vary': 'Origin', 'Cache-Control': 'no-store',
      'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'
    };
    const reply = status => new Response(null, { status, headers });
    const type = new URL(request.url).pathname.slice(1);
    if (!Object.hasOwn(fields, type)) return reply(404);
    if (request.method === 'OPTIONS') return reply(204);
    if (request.method !== 'POST') return reply(405);
    if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') return reply(415);
    if (type === 'lead' && !usCountries.has(request.cf?.country)) return reply(422);
    if (!env.NOTIFICATION_EMAIL || !env.FORM_LIMITER) return reply(503);
    const ip = request.headers.get('CF-Connecting-IP');
    if (!ip) return reply(400);
    try {
      if (!(await env.FORM_LIMITER.limit({ key: ip })).success) return reply(429);
    } catch { return reply(503); }
    let body;
    try { body = await readSubmission(request); } catch (error) { return reply(error === 413 ? 413 : 400); }
    const data = validate(type, body);
    if (!data) return reply(400);
    const mail = {
      _subject: type === 'feedback' ? 'CBCT Helper feedback' : 'CBCT Helper contact request (U.S.)',
      _url: 'https://cbcthelper.com/', email: data.email
    };
    if (data.name) mail.Name = data.name;
    if (data.practice) mail.Practice = data.practice;
    if (data.phone) mail.Phone = data.phone;
    if (data.state) mail.Location = usLocations[data.state] + ', United States';
    if (data.message) mail.Message = data.message;
    try {
      const sent = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(env.NOTIFICATION_EMAIL), {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json',
          Origin: 'https://cbcthelper.com', Referer: 'https://cbcthelper.com/' },
        body: JSON.stringify(mail), redirect: 'error', signal: AbortSignal.timeout(45000)
      });
      if (!sent.ok) return reply(503);
      const receipt = await sent.json();
      return reply(receipt.success === true || receipt.success === 'true' ? 204 : 503);
    } catch { return reply(503); }
  }
};
