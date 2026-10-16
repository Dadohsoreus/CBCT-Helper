const { chromium } = require(process.env.CBCT_PLAYWRIGHT_MODULE || 'playwright');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const filename = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!filename.startsWith(root + path.sep) || pathname.split('/').some(part => part.startsWith('.'))) { res.writeHead(403); res.end(); return; }
    const bytes = await fs.readFile(filename);
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' })[path.extname(filename)] || 'application/octet-stream');
    res.end(bytes);
  } catch (_) { res.writeHead(404); res.end(); }
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    const errors = [], outbound = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', req => { if (!req.url().startsWith(base)) outbound.push(req.url()); });
    const count = key => page.locator('[data-case="' + key + '"]');
    const show = async () => {
      await page.locator('#showScanEstimate').click();
      assert(await page.locator('#scanResults').isVisible());
      assert.equal(await page.evaluate(() => document.activeElement.id), 'scanResultsTitle');
      await page.waitForFunction(() => {
        const box = document.getElementById('scanResultsTitle').getBoundingClientRect();
        const header = document.querySelector('.site-header').getBoundingClientRect();
        return box.top >= header.bottom && box.bottom < innerHeight;
      });
    };
    const noOverflow = async () => assert(await page.evaluate(() => {
      const panel = document.getElementById('calculator');
      return document.documentElement.scrollWidth <= innerWidth && [...panel.querySelectorAll('input, summary, .estimate-metric, .scan-revenue-result')].filter(el => el.getClientRects().length).every(el => {
        const box = el.getBoundingClientRect();
        return box.left >= 0 && box.right <= innerWidth + 1 && el.scrollWidth <= el.clientWidth + 2;
      });
    }), 'Page, controls and result cards should fit the viewport');
    await page.goto(base + '/#calculator');
    assert.match(await page.locator('#calculator h1').innerText(), /monthly CBCT scans/);
    assert(await page.locator('#scanResults').isHidden());
    assert.equal(await page.locator('#scanShare, #referredCount, #panCount, #panFee').count(), 0);
    assert.equal(await page.locator('.case-evidence summary').count(), 10);
    await page.locator('.case-evidence summary').first().focus();
    await page.keyboard.press('Enter');
    assert(await page.locator('.case-evidence').first().getAttribute('open') !== null);
    assert.match(await page.locator('.case-evidence').first().innerText(), /2D images/);
    await page.keyboard.press('Enter');
    await count('pain').fill('3'); await count('nonhealing').fill('2'); await count('fracture').fill('1');
    await count('resorption').fill('1'); await count('surgery').fill('1'); await count('implant').fill('4');
    await show();
    assert.equal(await page.locator('#monthlyScans').innerText(), '12');
    assert.equal(await page.locator('#decisionEstimate').innerText(), 'About 6');
    assert.match(await page.locator('#decisionCoverage').innerText(), /8 of your 12/);
    assert.match(await page.locator('#decisionUnestimated').innerText(), /4 other cases/);
    assert.equal(await page.locator('#cbctRevenue').innerText(), '—');
    assert(await page.locator('#cbctFee').isVisible());
    await page.locator('.estimate-method summary').click();
    assert.equal(await page.locator('#decisionStudyRows tr').count(), 5);
    assert.match(await page.locator('#decisionStudyRows').innerText(), /Nonhealing[\s\S]*88%[\s\S]*fracture[\s\S]*93%/);
    await page.locator('.estimate-method summary').click();
    await page.locator('#cbctFee').fill('199.99');
    assert.equal(await page.locator('#cbctRevenue').innerText(), '$2,399.88');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'cbctFee');
    assert.match(await page.locator('#revenueFormula').innerText(), /12 scans/);
    await page.locator('#editScanCounts').click();
    assert.equal(await page.evaluate(() => document.activeElement.id), 'scanInputsTitle');
    assert.equal(await count('pain').inputValue(), '3');
    await count('pain').fill('4');
    assert(await page.locator('#scanResults').isHidden(), 'Do not display stale results after a count edit');
    await show();
    assert.equal(await page.locator('#monthlyScans').innerText(), '13');
    assert.equal(await page.locator('#cbctRevenue').innerText(), '$2,599.87');
    for (const bad of ['-1', '0.5', '100001']) {
      await count('pain').fill(bad);
      await page.locator('#showScanEstimate').click();
      assert(await page.locator('#scanResults').isHidden());
      assert.equal(await count('pain').getAttribute('aria-invalid'), 'true');
    }
    await count('pain').fill('4'); await show();
    for (const bad of ['-1', '12.345', '1000001']) {
      await page.locator('#cbctFee').fill(bad);
      assert(await page.locator('#feeError').isVisible());
      assert.equal(await page.locator('#cbctRevenue').innerText(), '—');
      assert.equal(await page.locator('#monthlyScans').innerText(), '13');
    }
    // A bad optional fee cannot trap users when revising their counts.
    await count('pain').fill('3'); await show();
    assert(await page.locator('#feeError').isVisible());
    await page.locator('#cbctFee').fill('0');
    assert.equal(await page.locator('#cbctRevenue').innerText(), '$0');
    assert(await page.locator('#feeError').isHidden());
    await page.locator('#cbctFee').fill('');
    assert.equal(await page.locator('#cbctRevenue').innerText(), '—');
    for (const input of await page.locator('[data-case]').all()) await input.fill('0');
    await count('implant').fill('10'); await show();
    assert.equal(await page.locator('#monthlyScans').innerText(), '10');
    assert.equal(await page.locator('#decisionEstimate').innerText(), 'No estimate');
    assert.match(await page.locator('#decisionCoverage').innerText(), /does not mean CBCT has no value/);
    await count('implant').fill(''); await show();
    assert.equal(await page.locator('#monthlyScans').innerText(), '0');
    await count('surgery').fill('1'); await show();
    assert.equal(await page.locator('#decisionEstimate').innerText(), 'Fewer than 1');
    // Browser sanitization of incomplete scientific notation must not silently mean zero.
    await count('pain').fill(''); await count('pain').pressSequentially('1e');
    await page.locator('#showScanEstimate').click();
    assert(await page.locator('#scanResults').isHidden());
    await count('pain').fill('10'); await count('implant').fill('5'); await count('surgery').fill('0');
    await show(); await page.locator('#cbctFee').fill('250');
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await show(); await noOverflow();
      await page.locator('.estimate-method summary').click(); await noOverflow();
      await page.locator('.estimate-method summary').click();
      if (width === 1440 || width === 390) {
        await page.screenshot({ path: 'out/scan-estimator-results-' + width + '.png', fullPage: false });
      }
      await page.locator('#editScanCounts').click();
      assert.equal(await page.evaluate(() => document.activeElement.id), 'scanInputsTitle');
      await page.locator('.case-evidence summary').first().click(); await noOverflow();
      await page.locator('.case-evidence summary').first().click();
    }
    await page.evaluate(() => { document.documentElement.style.fontSize = '125%'; });
    await show(); await noOverflow();
    await page.locator('#editScanCounts').click();
    await page.locator('#showScanEstimate').focus(); await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'scanResultsTitle');
    await page.locator('.estimate-revenue summary').click();
    assert(await page.locator('#cbctFee').isHidden());
    await page.locator('.estimate-revenue summary').click();
    assert(await page.locator('#cbctFee').isVisible());
    assert.deepEqual(errors, []); assert.deepEqual(outbound, []);
    console.log('Estimator browser checks passed: totals, evidence coverage, cents, validation, stale-result handling, edit/submit focus, keyboard, reduced motion, 320–1440px layouts, 125% text, optional revenue and no outbound requests.');
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
