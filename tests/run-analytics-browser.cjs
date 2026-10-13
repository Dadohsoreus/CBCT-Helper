const { chromium } = require(process.env.CBCT_PLAYWRIGHT_MODULE || 'playwright');
const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = process.cwd();
const server = http.createServer(async (req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const filename=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    const bytes=await fs.readFile(filename);res.setHeader('Content-Type',({'html':'text/html','js':'text/javascript','css':'text/css','png':'image/png'})[path.extname(filename).slice(1)]||'application/octet-stream');res.end(bytes);
  }catch(_){res.writeHead(404);res.end();}
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1100}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  try {
    await page.goto(base+'/admin.html?demo=1');await page.locator('#reports').waitFor({state:'visible'});
    assert.match(await page.locator('#message').innerText(),/sample data/);assert.equal(await page.locator('#sections tr').count(),9);
    const thirty=await page.locator('#visits').innerText();await page.locator('#range').selectOption('7');assert.notEqual(await page.locator('#visits').innerText(),thirty);
    await page.locator('#range').selectOption('30');
    await page.screenshot({path:'out/analytics-dashboard-desktop.png',fullPage:true});
    await page.screenshot({path:'out/analytics-dashboard-preview.png',fullPage:false});
    await page.setViewportSize({width:390,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.screenshot({path:'out/analytics-dashboard-mobile.png',fullPage:true});
    const downloadPromise=page.waitForEvent('download');await page.locator('#export').click();const download=await downloadPromise;assert.match(download.suggestedFilename(),/^sample-cbct-usage/);
    await page.locator('#excludeBrowser').click();assert.match(await page.locator('#exclusionStatus').innerText(),/is excluded/);
    await page.locator('#leavePreview').click();assert.ok(await page.locator('#loginPanel').isVisible());assert.ok(await page.locator('#reports').isHidden());
    await page.goto(base+'/privacy.html');assert.match(await page.locator('#analyticsPreferenceStatus').innerText(),/not active/);assert.ok(await page.locator('#analyticsPreference').isDisabled());
    const measurement=[];page.on('request',request=>{if(request.url().includes('/collect'))measurement.push(request.url());});
    await page.goto(base+'/index.html#clinical-scenarios');await page.locator('[data-scenario-example="implant"]').click();assert.match(await page.locator('#recommendationTitle').innerText(),/Related topic/);
    await page.locator('#menuToggle').click();await page.locator('a.tab[data-tab="estimator"]').click();await page.locator('#scanShare').fill('50');assert.ok(await page.locator('#calculatorForm').isVisible());assert.equal(measurement.length,0);assert.deepEqual(errors,[]);
    console.log('Browser checks passed: responsive dashboard, date ranges, sample CSV, owner exclusion, disabled privacy control, unchanged tools, zero collection requests, zero page errors.');
  }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error.message);process.exitCode=1;server.close();});
