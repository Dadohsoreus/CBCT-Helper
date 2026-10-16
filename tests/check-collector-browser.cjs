// Explicit deployment probe. Serves local files in an isolated browser at the
// intended public origin; enables collection in that browser response only.
// Set CBCT_ANALYTICS_LIVE=1 to test the published site without replacing assets.
// Prints the exact synthetic visit ID so it can be removed after verification.
const { chromium } = require(process.env.CBCT_PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = process.cwd();
(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const page = await browser.newPage();
  const payloads = [], responses = [], errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.url().endsWith('/collect')) payloads.push(JSON.parse(request.postData())); });
  page.on('response', response => { if (response.url().endsWith('/collect')) responses.push(response.status()); });
  try {
    if (process.env.CBCT_ANALYTICS_LIVE !== '1') await page.route('https://cbcthelper.com/**', async route => {
      const pathname = decodeURIComponent(new URL(route.request().url()).pathname);
      const filename = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!filename.startsWith(root + path.sep)) return route.fulfill({status:403});
      try {
        let body = await fs.readFile(filename);
        if (pathname === '/analytics-config.js') body = Buffer.from(body.toString().replace('enabled: false','enabled: true'));
        const contentType = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg'}[path.extname(filename)] || 'application/octet-stream';
        await route.fulfill({body,contentType});
      } catch (_) { await route.fulfill({status:404}); }
    });
    await page.goto('https://cbcthelper.com/#clinical-scenarios');
    await page.bringToFront();
    await page.locator('[data-scenario-example="implant"]').click();
    await page.waitForTimeout(30000);
    await page.locator('a.tab[data-tab="estimator"]').click();
    await page.locator('[data-case="pain"]').fill('47');
    await page.waitForTimeout(5000);
    await page.locator('a.tab[data-tab="clinical"]').click();
    await page.waitForTimeout(3000);
    await page.locator('a.tab[data-tab="home"]').click();
    await page.waitForTimeout(2000);
    const last = payloads.at(-1);
    assert.ok(last, 'Browser must send measurements');
    assert.deepEqual(Object.keys(last).sort(), ['actions','device','durations','sessionId','version','views']);
    assert.ok(last.durations.clinical >= 31000 && last.durations.clinical < 40000);
    assert.ok(last.durations.estimator >= 4500 && last.durations.estimator < 10000);
    assert.equal(last.views.clinical, 2);
    assert.equal(last.actions.case_requested, 1);
    assert.equal(last.actions.planner_used, 1);
    assert.ok(responses.length > 0 && responses.every(status => status === 204));
    const beforeExclusion = payloads.length;
    await page.evaluate(() => window.CBCTAnalytics.exclude(true));
    await page.locator('a.tab[data-tab="estimator"]').click();
    await page.waitForTimeout(1000);
    assert.equal(payloads.length, beforeExclusion);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({status:'passed',sessionId:last.sessionId,durations:last.durations,views:last.views,actions:last.actions,responses:responses.length,excludedBrowserSentNoMoreRequests:true}));
  } finally {
    // Output all synthetic IDs even if a check fails; never delete other visits.
    if (payloads.length) console.log(JSON.stringify({syntheticSessionIds:[...new Set(payloads.map(payload => payload.sessionId))]}));
    await browser.close();
  }
})().catch(error => {console.error(error.message); process.exitCode = 1;});
