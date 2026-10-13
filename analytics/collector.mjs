const sections = ['home', 'clinical', 'guides', 'estimator', 'fov-resolution', 'navigation', 'artifacts', 'cdt', 'citations'];
const actions = ['case_requested', 'planner_used', 'artifact_opened', 'source_opened'];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function record(value, allowed, max) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  return Object.entries(value).every(([key, number]) => allowed.includes(key) && Number.isInteger(number) && number >= 0 && number <= max);
}
export function validatePayload(payload) {
  return payload && typeof payload === 'object' && !Array.isArray(payload)
    && Object.keys(payload).length === 6 && Object.keys(payload).every(key => ['version', 'sessionId', 'device', 'durations', 'views', 'actions'].includes(key))
    && payload.version === 1 && uuid.test(payload.sessionId) && ['mobile', 'tablet', 'desktop'].includes(payload.device)
    && record(payload.durations, sections, 86400000) && record(payload.views, sections, 200)
    && record(payload.actions, actions, 2000)
    && Object.values(payload.durations).reduce((sum, n) => sum + n, 0) <= 86400000
    && Object.keys(payload.durations).every(key => payload.views[key] > 0);
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim());
    if (!origin || !allowed.includes(origin)) return new Response(null, { status: 403 });
    const headers = { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin', 'Cache-Control': 'no-store', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
    const respond = status => new Response(null, { status, headers });
    if (new URL(request.url).pathname !== '/collect') return respond(404);
    if (request.method === 'OPTIONS') return respond(204);
    if (request.method !== 'POST') return respond(405);
    const serverKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
    if (!env.SUPABASE_URL || !serverKey || !env.RATE_LIMITER || !env.RATE_SALT) return respond(503);
    if (env.SUPABASE_SECRET_KEY && !serverKey.startsWith('sb_secret_')) return respond(503);
    if (!request.headers.get('Content-Type')?.startsWith('text/plain')) return respond(415);
    if (Number(request.headers.get('Content-Length')) > 6000) return respond(413);
    // A daily salted address digest is used only by the short-lived rate limiter.
    // The analytics payload, database, and application logs never receive the address.
    const ip = request.headers.get('CF-Connecting-IP');
    if (!ip) return respond(400);
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(env.RATE_SALT + new Date().toISOString().slice(0, 10) + ip));
    const key = [...new Uint8Array(hash)].map(n => n.toString(16).padStart(2, '0')).join('');
    const { success } = await env.RATE_LIMITER.limit({ key });
    if (!success) return respond(429);
    let text, payload;
    try {
      // Bound streamed bodies as well as requests with Content-Length.
      const reader = request.body?.getReader();
      if (!reader) return respond(400);
      let size = 0; const chunks = [];
      while (true) { const next = await reader.read(); if (next.done) break; size += next.value.byteLength; if (size > 6000) { await reader.cancel(); return respond(413); } chunks.push(next.value); }
      const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
      text = new TextDecoder().decode(bytes); payload = JSON.parse(text);
    } catch (_) { return respond(400); }
    if (!validatePayload(payload)) return respond(400);
    const country = /^[A-Z]{2}$/.test(request.cf?.country || '') ? request.cf.country : null;
    const state = country === 'US' && /^[A-Z]{2}$/.test(request.cf?.regionCode || '') ? request.cf.regionCode : null;
    try {
      const databaseHeaders = { 'Content-Type': 'application/json', apikey: serverKey };
      // Modern secret keys authenticate through apikey; they are not Bearer JWTs.
      if (!serverKey.startsWith('sb_secret_')) databaseHeaders.Authorization = 'Bearer ' + serverKey;
      const response = await fetch(env.SUPABASE_URL + '/rest/v1/rpc/analytics_ingest', {
        method: 'POST', headers: databaseHeaders,
        body: JSON.stringify({ p_session: payload.sessionId, p_device: payload.device, p_country: country, p_state: state, p_durations: payload.durations, p_views: payload.views, p_actions: payload.actions }),
        signal: AbortSignal.timeout(5000)
      });
      return respond(response.ok ? 204 : 503);
    } catch (_) { return respond(503); }
  }
};
