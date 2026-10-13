const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');
const { pathToFileURL } = require('node:url');
const { createMeter, newSession, restoreSession } = require('../analytics-client.js');
const model = require('../analytics/dashboard-model.js');
let checks = 0;
function test(name, fn) { fn(); checks++; console.log('PASS ' + name); }
function browser(config = {}, excluded = false, privacy = false) {
  let mono = 0, wall = 100000, focused = true;
  const listeners = {}, stored = new Map(), sends = [], intervals = [];
  const storage = { getItem: k => stored.get(k) ?? null, setItem: (k, v) => stored.set(k, v), removeItem: k => stored.delete(k) };
  if (excluded) storage.setItem('cbct.analytics.excluded', '1');
  const document = { visibilityState: 'visible', hasFocus: () => focused, querySelector: () => ({}), getElementById: () => null, addEventListener: (name, fn) => { (listeners[name] ||= []).push(fn); } };
  const window = { document, CBCT_ANALYTICS_CONFIG: { enabled: true, endpoint: 'https://test.example/collect', allowedHosts: ['cbcthelper.com'], ...config },
    navigator: { globalPrivacyControl: privacy }, location: { hostname: 'cbcthelper.com' }, localStorage: storage, sessionStorage: storage,
    crypto: { randomUUID }, performance: { now: () => mono }, screen: { width: 1400, height: 900 }, matchMedia: () => ({ matches: false }),
    setInterval: fn => { intervals.push(fn); return intervals.length; }, clearInterval: () => {}, fetch: (_url, options) => { sends.push(JSON.parse(options.body)); return Promise.resolve({ ok: true }); },
    addEventListener: (name, fn) => { (listeners[name] ||= []).push(fn); } };
  class FakeDate extends Date { static now() { return wall; } }
  vm.runInNewContext(fs.readFileSync('analytics-client.js', 'utf8'), { window, Date: FakeDate, module: { exports: {} }, console });
  return { window, document, sends, stored, advance(ms) { mono += ms; wall += ms; }, event(name, event = {}) { for (const fn of listeners[name] || []) fn(event); }, tick() { for (const fn of intervals) fn(); }, focus(value) { focused = value; } };
}
(async () => {
  test('Section revisits accumulate within one visit; duplicate section selection does not add views', () => {
    let time = 0; const state = newSession(randomUUID(), 0), meter = createMeter(state, () => time);
    meter.section('clinical'); meter.visible(true); time += 20000; meter.section('estimator'); time += 10000; meter.section('clinical'); time += 15000; meter.section('clinical'); meter.visible(false);
    assert.equal(state.durations.clinical, 35000); assert.equal(state.durations.estimator, 10000); assert.equal(state.views.clinical, 2);
  });
  test('Hidden/unfocused intervals are excluded and computer sleep is discarded', () => {
    let time = 0; const state = newSession(randomUUID(), 0), meter = createMeter(state, () => time);
    meter.section('estimator'); meter.visible(true); time += 10000; meter.visible(false); time += 100000; meter.visible(true); time += 5000; meter.settle(); time += 3600000; meter.settle();
    assert.equal(state.durations.estimator, 15000);
  });
  test('Unknown section/action names never enter measurement payloads', () => {
    const meter = createMeter(newSession(randomUUID(), 0), () => 0); meter.section('patient name'); meter.action('case text');
    assert.deepEqual(meter.payload('desktop').views, {}); assert.deepEqual(meter.payload('desktop').actions, {});
  });
  test('Stored state is reconstructed with allowed fields only and expires after inactivity', () => {
    const input = { id: randomUUID(), lastActivity: 0, views: { clinical: 1, secret: 'patient' }, durations: { clinical: 1000, secret: 2000 }, actions: { case_requested: 1, text: 'patient' }, caseText: 'patient' };
    const restored = restoreSession(input, 1000); assert.deepEqual(Object.keys(restored.views), ['clinical']); assert.equal(restored.caseText, undefined); assert.equal(restoreSession(input, 1800000), null);
  });
  test('Averages/medians use visits to the section, rather than all site visits', () => {
    const rows = [10000, 20000, 90000].map(n => ({ day: '2026-10-12', views: { clinical: 1 }, durations: { clinical: n }, actions: { case_requested: 1 }, device: 'desktop' }));
    rows.push({ day: '2026-10-12', views: { home: 1 }, durations: { home: 9000 }, actions: {}, device: 'mobile' });
    const report = model.summarize(rows, 7, '2026-10-12'), clinical = report.sections.find(s => s.id === 'clinical');
    assert.equal(report.visits, 4); assert.equal(clinical.visits, 3); assert.equal(clinical.avgMs, 40000); assert.equal(clinical.medianMs, 20000); assert.equal(clinical.usedVisits, 3);
  });
  test('No visits and an even sample have correct median/empty report behaviour', () => { assert.equal(model.median([10000,30000]), 20000); assert.equal(model.summarize([],30,'2026-10-12').daily.length,30); });
  test('Disabled configuration, owner exclusion, privacy signals, and localhost send no requests', () => {
    assert.equal(browser({ enabled: false }).sends.length, 0); assert.equal(browser({}, true).sends.length, 0); assert.equal(browser({}, false, true).sends.length, 0); assert.equal(browser({ allowedHosts: ['other.example'] }).sends.length, 0);
  });
  test('Browser visibility pauses time and section switches post cumulative totals', () => {
    const b = browser(); b.window.CBCTAnalytics.section('clinical'); b.advance(10000); b.focus(false); b.event('blur'); b.advance(15000); b.tick(); b.focus(true); b.event('focus'); b.advance(5000); b.window.CBCTAnalytics.section('estimator');
    assert.equal(b.sends.at(-1).durations.clinical,15000); assert.equal(b.sends.at(-1).views.estimator,1);
  });
  test('Opt-out stops further sends immediately and removes stored visit', () => {
    const b=browser(); b.window.CBCTAnalytics.section('clinical'); b.window.CBCTAnalytics.exclude(true); const n=b.sends.length; b.advance(15000); b.tick(); b.window.CBCTAnalytics.action('case_requested'); assert.equal(b.sends.length,n); assert.equal(b.stored.get('cbct.analytics.session.v1'),undefined);
  });
  test('Scripted planner input is ignored; trusted edits count once and do not transmit values', () => {
    const b=browser(), target={ value:'123456 sensitive figure', closest:selector=>selector==='#calculatorForm' ? {} : null };
    b.event('input',{target,isTrusted:false}); b.event('input',{target,isTrusted:true}); b.event('input',{target,isTrusted:true}); assert.equal(b.sends.at(-1).actions.planner_used,1); assert.ok(!JSON.stringify(b.sends).includes('123456'));
  });
  const { validatePayload, default: worker } = await import(pathToFileURL(require('node:path').resolve('analytics/collector.mjs')).href);
  const payload = { version:1,sessionId:randomUUID(),device:'desktop',durations:{clinical:35000},views:{clinical:2},actions:{case_requested:1} };
  test('Collector accepts valid counters and rejects text, forged location, unknown counters, and impossible durations',()=>{
    assert.ok(validatePayload(payload));
    for(const invalid of [{...payload,text:'case description'},{...payload,country:'US'},{...payload,durations:{patient:10}},{...payload,durations:{clinical:-1}},{...payload,durations:{clinical:Infinity}},{...payload,actions:{planner_used:'100'}},{...payload,views:{}}]) assert.ok(!validatePayload(invalid));
  });
  let forwarded, forwardedHeaders;
  const originalFetch=global.fetch;
  global.fetch=async(_url,options)=>{forwarded=JSON.parse(options.body);forwardedHeaders=options.headers;return new Response(null,{status:204});};
  const env={ALLOWED_ORIGINS:'https://cbcthelper.com',SUPABASE_URL:'https://project.supabase.co',SUPABASE_SERVICE_ROLE_KEY:'test-key',RATE_SALT:'test-salt',RATE_LIMITER:{limit:async()=>({success:true})}};
  const request=(body=payload,origin='https://cbcthelper.com')=>{const r=new Request('https://test.example/collect',{method:'POST',headers:{Origin:origin,'Content-Type':'text/plain','CF-Connecting-IP':'192.0.2.1'},body:JSON.stringify(body)});r.cf={country:'US',regionCode:'TX'};return r;};
  assert.equal((await worker.fetch(request(),env)).status,204); assert.equal(forwarded.p_country,'US'); assert.equal(forwarded.p_state,'TX'); assert.ok(!JSON.stringify(forwarded).includes('192.0.2.1')); checks++; console.log('PASS Collector derives geography server-side and never forwards connection IP');
  assert.equal(forwardedHeaders.Authorization,'Bearer test-key');
  assert.equal((await worker.fetch(request(),{...env,SUPABASE_SECRET_KEY:'sb_secret_mock'})).status,204);assert.equal(forwardedHeaders.apikey,'sb_secret_mock');assert.equal(forwardedHeaders.Authorization,undefined);
  assert.equal((await worker.fetch(request(),{...env,SUPABASE_SECRET_KEY:'sb_publishable_mock'})).status,503);checks++;console.log('PASS Modern server keys use apikey only; legacy JWTs remain compatible; publishable keys are rejected');
  assert.equal((await worker.fetch(request(payload,'https://evil.example'),env)).status,403); assert.equal((await worker.fetch(request({...payload,text:'patient'}),env)).status,400); assert.equal((await worker.fetch(request(),{...env,RATE_LIMITER:{limit:async()=>({success:false})}})).status,429); assert.equal((await worker.fetch(request(),{...env,RATE_LIMITER:undefined})).status,503); checks++; console.log('PASS Collector rejects wrong origins, unknown fields, rate excess, and missing configuration');
  assert.equal((await worker.fetch(request({...payload,padding:'x'.repeat(6100)}),env)).status,413); checks++; console.log('PASS Streamed oversized bodies are rejected');
  global.fetch=originalFetch;
  console.log(`Analytics: ${checks}/${checks} checks passed.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
