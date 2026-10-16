const {chromium}=require(process.env.CBCT_PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
  const browser=await chromium.launch({channel:'msedge',headless:true});
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1100}});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../out/clinical-scenario-audit.html')).href);
    assert.equal(await page.locator('h1').innerText(),'Clinical scenario audit');
    assert.equal(await page.locator('.case').count(),200);
    await page.locator('#search').fill('clinical-apical-periodontitis');
    assert.equal(await page.locator('.case:visible').count(),1);
    await page.locator('.case:visible > summary').click();
    assert.match(await page.locator('.case:visible').innerText(),/Persistent symptoms|nonhealing/);
    await page.locator('#search').fill('');
    assert.equal(await page.locator('.case:visible').count(),200);
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:'out/clinical-audit-report-desktop.png'});
    await page.setViewportSize({width:390,height:844});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Report must fit a mobile screen');
    await page.screenshot({path:'out/clinical-audit-report-mobile.png'});
    assert.deepEqual(errors,[]);
    console.log('Audit report: 200 cases, interactive filtering, expansion and mobile layout passed.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
