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
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();
  const errors = [], outbound = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', req => { if (!req.url().startsWith(base)) outbound.push(req.url()); });
  const status = () => page.locator('#recommendationBox').getAttribute('data-guidance-status');
  const chooseReason = async reason => {
    const input = page.locator('#case-reason-' + reason);
    await input.focus();
    await input.check();
    await checkPanelPosition('recommendationBox', 'recommendationTitle');
  };
  const enter = async text => { await page.locator('#scenarioInput').fill(text); await page.locator('#analyzeScenario').click(); };
  const checkPanelPosition = async (panelId, focusId) => {
    assert.equal(await page.locator('#' + focusId).evaluate(el => document.activeElement === el), true);
    // Wait for the destination to settle; reaching it for one frame can precede scroll completion.
    await page.waitForFunction(id => {
      const panel = document.getElementById(id).getBoundingClientRect();
      const header = document.querySelector('.site-header').getBoundingClientRect();
      const previous = window.__caseScrollCheck;
      const position = id + ':' + scrollY + ':' + panel.top + ':' + header.bottom;
      const stableFrames = previous?.position === position ? previous.stableFrames + 1 : 0;
      window.__caseScrollCheck = { position, stableFrames };
      return Math.abs(panel.top - header.bottom - 20) < 3 && stableFrames >= 3;
    }, panelId);
  };
  const checkCaseOrder = async () => {
    assert(await page.evaluate(() => {
      const input = document.getElementById('caseInputPanel');
      const result = document.getElementById('recommendationBox');
      const a = input.getBoundingClientRect(), b = result.getBoundingClientRect();
      return input.nextElementSibling === result && b.top >= a.bottom && b.top - a.bottom < 40
        && Math.abs(a.left - b.left) < 1 && Math.abs(a.width - b.width) < 1;
    }), 'The result must immediately follow the input visually and in reading order');
  };
  const checkInlineQuestions = async () => {
    assert(await page.evaluate(() => {
      const summary = document.querySelector('.guidance-summary');
      const questions = document.getElementById('caseFollowups');
      const chip = document.getElementById('matchedIndications').getBoundingClientRect();
      const box = questions.getBoundingClientRect();
      return summary.nextElementSibling === questions && !questions.hidden
        && box.top >= chip.bottom && box.top - chip.bottom < 45;
    }), 'Questions must appear directly below the result label without another click');
    assert.equal(await page.locator('[data-case-followups], #viewCaseResult').count(), 0);
    assert.equal(await page.locator('#case-imaging, #case-exam, #case-impact').count(), 0);
    assert.equal(await page.getByRole('radiogroup').count(), 1);
    assert(await page.locator('#caseFollowups').evaluate(box => {
      const parent = box.getBoundingClientRect();
      return [...box.querySelectorAll('h3, h4, label, input, span, p, ul')].filter(el => el.getClientRects().length).every(el => {
        const bounds = el.getBoundingClientRect();
        return bounds.left >= parent.left && bounds.right <= parent.right + 1
          && bounds.top >= parent.top && bounds.bottom <= parent.bottom + 1;
      });
    }), 'All headings, labels, controls and text must stay inside the question box');
  };
  try {
    await page.goto(base + '/#clinical-scenarios');
    assert.equal(await status(), 'empty');
    assert.match(await page.locator('#caseAssumptions').innerText(), /history and exam are complete/);
    assert.match(await page.locator('#caseAssumptions').innerText(), /2D X-rays have been taken and reviewed/);
    assert.equal(await page.locator('input[name="case-reason"]:checked').count(), 0);
    const reasonValues = () => page.locator('#caseReasons input').evaluateAll(inputs => inputs.map(input => input.value));
    await page.getByRole('button', { name: 'Unclear pain', exact: true }).click();
    const painOrder = await reasonValues();
    assert.deepEqual(painOrder.slice(0, 3), ['diagnosis', 'treatment', 'referral']);
    assert.equal(painOrder.length, 14);
    assert.equal(painOrder.at(-1), 'implant_planning');
    assert(painOrder.includes('other'));
    assert.equal(await page.locator('input[name="case-reason"]:checked').count(), 0, 'Reordering must not choose an answer');
    await chooseReason('implant_planning');
    assert.equal(await status(), 'conditional');
    assert.match(await page.locator('.confirmation-details').innerText(), /does not establish proposed implant placement/);
    await chooseReason('procedure_planning');
    assert.equal(await status(), 'conditional');
    assert.match(await page.locator('.confirmation-details').innerText(), /Which procedure is being considered now/);
    assert.match(await page.locator('.result-topic').innerText(), /Unclear tooth-related/);
    assert.deepEqual(await reasonValues(), painOrder, 'Answer changes must not reorder the choices');
    await chooseReason('diagnosis');
    assert.equal(await status(), 'supported');
    await chooseReason('screening');
    assert.equal(await status(), 'not_supported');
    assert.deepEqual(await reasonValues(), painOrder, 'A negative purpose must not reset the case-specific order');
    await page.getByRole('button', { name: 'Unclear pain', exact: true }).click();
    await checkPanelPosition('recommendationBox', 'recommendationTitle');
    await page.screenshot({ path: 'out/clinical-case-planning-desktop.png', fullPage: false });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#caseFollowups').screenshot({ path: 'out/clinical-case-planning-mobile.png' });
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.getByRole('button', { name: 'Implant planning', exact: true }).click();
    assert.deepEqual((await reasonValues()).slice(0, 2), ['implant_planning', 'risk']);
    await checkCaseOrder();
    await checkPanelPosition('recommendationBox', 'recommendationTitle');
    assert.equal(await status(), 'conditional');
    assert(await page.locator('#caseFollowups').isVisible());
    await checkInlineQuestions();
    await chooseReason('implant_planning');
    assert.equal(await status(), 'supported');
    await page.locator('.decision-trace summary').click();
    assert.match(await page.locator('#alignmentDetails').innerText(), /Selected answer/);
    assert.match(await page.locator('#alignmentDetails').innerText(), /Default assumption/);
    await page.locator('.decision-trace summary').click();
    assert.match(await page.locator('#alignmentDetails .result-source a').first().getAttribute('href'), /#page=7/);
    await page.locator('#analyzeScenario').click();
    await checkPanelPosition('recommendationBox', 'recommendationTitle');
    await page.screenshot({ path: 'out/clinical-guidance-desktop.png', fullPage: true });
    await page.screenshot({ path: 'out/clinical-guidance-preview.png', fullPage: false });
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await checkCaseOrder();
    await page.locator('#analyzeScenario').click();
    await checkPanelPosition('recommendationBox', 'recommendationTitle');
    await page.screenshot({ path: 'out/clinical-guidance-mobile.png', fullPage: true });
    await page.screenshot({ path: 'out/clinical-result-mobile.png', fullPage: false });
    await page.locator('#scenarioInput').fill('Suspected resorption at #9. Need extent.');
    assert.equal(await page.locator('input[name="case-reason"]:checked').count(), 0);
    assert.equal(await page.locator('#alignmentDetails').innerText(), '');
    assert(await page.locator('#caseUpdateNotice').isVisible());
    await page.locator('#analyzeScenario').click();
    assert.equal(await page.locator('#recommendationTitle').evaluate(el => document.activeElement === el), true);
    assert(await page.locator('#caseFollowups').isVisible());
    await checkInlineQuestions();
    await chooseReason('screening');
    assert.equal(await status(), 'not_supported');
    assert.equal(await page.locator('#recommendationTitle').evaluate(el => document.activeElement === el), true, 'Selecting a reason must move focus to the updated result');
    assert.match(await page.locator('#caseReasonHelp').innerText(), /Routine CBCT screening/);
    await chooseReason('extent');
    assert.equal(await status(), 'conditional', 'A useful purpose does not prove the 2D images are insufficient');
    assert.match(await page.locator('#matchedIndications').innerText(), /^Detail to confirm:.*still missing from the reviewed 2D/);
    assert(await page.locator('#additionalCaseQuestions').isHidden(), 'Confirmation details must not be repeated below the choices');
    await page.locator('#analyzeScenario').click();
    assert.equal(await page.locator('#recommendationTitle').evaluate(el => document.activeElement === el), true);
    await enter('Implant planning at #30. Existing CBCT already answers this question. Need ridge width.');
    assert.equal(await status(), 'review_existing');
    assert(await page.locator('#caseFollowups').isHidden());
    await enter('Resorption at #9. Need extent. Imaging would not change treatment.');
    await chooseReason('treatment');
    assert.equal(await status(), 'needs_details');
    assert.match(await page.locator('#recommendationTitle').innerText(), /conflicting/);
    await enter('TMJ condylar resorption. Need extent.');
    assert.equal(await status(), 'outside_coverage');
    await chooseReason('diagnosis');
    assert.equal(await status(), 'outside_coverage');
    await checkInlineQuestions();
    assert.equal(await page.locator('#alignmentDetails .result-source a').count(), 0);
    await enter('Routine CBCT screening. No symptoms.');
    assert.equal(await status(), 'not_supported');
    await enter('<img src=x onerror="window.caseInjection=1">');
    assert.equal(await status(), 'needs_details');
    assert.equal(await page.evaluate(() => window.caseInjection), undefined);
    assert.equal(await page.locator('#alignmentDetails img').count(), 0);
    await page.locator('#clearScenario').click();
    assert.equal(await status(), 'empty');
    assert(await page.locator('#caseFollowups').isHidden());
    // Exercise the complete keyboard workflow at desktop, tablet, and narrow-phone widths.
    for (const width of [1440, 768, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: width === 320 ? 'reduce' : 'no-preference' });
      const caseText = 'Implant planning at #30. Need ridge width and distance to mandibular canal.';
      await page.locator('#scenarioInput').fill(caseText);
      await page.locator('#analyzeScenario').focus();
      await page.keyboard.press('Enter');
      await checkCaseOrder();
      await checkInlineQuestions();
      await checkPanelPosition('recommendationBox', 'recommendationTitle');
      await chooseReason('implant_planning');
      await page.locator('#case-reason-implant_planning').focus();
      await page.keyboard.press('ArrowDown');
      assert(await page.locator('#case-reason-risk').isChecked(), 'Native radio arrow-key navigation must work');
      await checkPanelPosition('recommendationBox', 'recommendationTitle');
      assert.equal(await status(), 'supported');
      await page.locator('#editScenario').focus();
      await page.keyboard.press('Enter');
      await checkPanelPosition('caseInputPanel', 'scenarioInput');
      assert.equal(await page.locator('#scenarioInput').inputValue(), caseText);
      assert(await page.locator('#case-reason-risk').isChecked(), 'Editing navigation must preserve answers');
      await page.locator('#analyzeScenario').focus();
      await page.keyboard.press('Enter');
      await checkPanelPosition('recommendationBox', 'recommendationTitle');
      await page.locator('#newScenario').focus();
      await page.keyboard.press('Enter');
      await checkPanelPosition('caseInputPanel', 'scenarioInput');
      assert.equal(await page.locator('#scenarioInput').inputValue(), '');
      assert.equal(await page.locator('input[name="case-reason"]:checked').count(), 0);
      assert.equal(await status(), 'empty');
      assert(await page.locator('#caseResultActions').isHidden());
      assert(await page.locator('#caseFollowups').isHidden());
      assert.equal(await page.locator('#alignmentDetails').innerText(), '');
      await page.locator('#analyzeScenario').focus();
      await page.keyboard.press('Enter');
      assert.equal(await page.locator('#scenarioInput').evaluate(el => document.activeElement === el), true);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    }
    await page.setViewportSize({ width: 320, height: 900 });
    const largerText = await page.addStyleTag({ content: 'html { font-size: 125%; }' });
    await enter('Suspected resorption at #9. Need extent.');
    await checkInlineQuestions();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert(await page.locator('#caseReasons').evaluate(box => {
      return [...box.querySelectorAll('label')].every(label => {
        const parent = label.getBoundingClientRect();
        const range = document.createRange(); range.selectNodeContents(label.querySelector('span'));
        return [...range.getClientRects()].every(rect => rect.left >= parent.left && rect.right <= parent.right + 1);
      });
    }), 'Every reason must wrap inside its label on a narrow screen with enlarged text');
    assert(await page.locator('.confirmation-details').evaluate(box => {
      const bounds = box.getBoundingClientRect();
      const range = document.createRange(); range.selectNodeContents(box);
      return [...range.getClientRects()].every(rect => rect.left >= bounds.left && rect.right <= bounds.right + 1);
    }), 'Confirmation details must wrap inside the highlighted box at enlarged text size');
    await page.locator('.guidance-summary').screenshot({ path: 'out/clinical-confirmation-mobile.png' });
    await largerText.evaluate(el => el.remove());
    await page.setViewportSize({ width: 1440, height: 1100 });
    await enter('Suspected resorption at #9. Need extent.');
    await checkPanelPosition('recommendationBox', 'recommendationTitle');
    await page.screenshot({ path: 'out/clinical-confirmation-desktop.png', fullPage: false });
    await enter('Implant planning at #30. Need ridge width.');
    for (const [reason, expected] of Object.entries({ diagnosis: 'conditional', extent: 'supported', treatment: 'supported', implant_planning: 'supported', procedure_planning: 'conditional', risk: 'conditional', complication: 'conditional', referral: 'conditional', healing: 'conditional', screening: 'not_supported', reassurance: 'not_supported', records: 'not_supported', no_change: 'not_supported', other: 'conditional' })) {
      await chooseReason(reason);
      assert.equal(await status(), expected, 'Purpose selection: ' + reason);
      assert(await page.locator('#caseReasonHelp').isVisible());
    }
    await enter('Implant planning #30. Need ridge width. No clinical exam performed.');
    await chooseReason('implant_planning');
    assert.equal(await status(), 'conditional');
    assert.match(await page.locator('#matchedIndications').innerText(), /^Detail to confirm:.*incomplete/);
    await enter('Suspected resorption #9. Need extent. No 2D X-rays taken.');
    await chooseReason('extent');
    assert.equal(await status(), 'conditional');
    await enter('Suspected resorption #9. Need extent. 2D X-rays are sufficient.');
    await chooseReason('extent');
    assert.equal(await status(), 'not_supported');
    await enter('Suspected resorption #9. Need extent. 2D X-rays are inconclusive.');
    await chooseReason('extent');
    assert.equal(await status(), 'supported');
    await enter('Apicoectomy planned #14. Need relationship to sinus floor. PA inconclusive.');
    assert.equal((await reasonValues())[0], 'procedure_planning');
    await chooseReason('procedure_planning');
    assert.equal(await status(), 'supported');
    await enter('Root canal treatment planned #14. Need canal morphology. PA inconclusive.');
    await chooseReason('procedure_planning');
    assert.equal(await status(), 'supported');
    await enter('Prior root canal treatment #14. Need canal morphology. PA inconclusive.');
    await chooseReason('procedure_planning');
    assert.equal(await status(), 'conditional');
    assert.match(await page.locator('.confirmation-details').innerText(), /Which procedure is being considered now/);
    // Render the independently authored language corpus through the real DOM update path.
    // Existing interaction tests above cover pointer/keyboard scrolling; use reduced motion here.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const { cases: auditCases } = require('./clinical-audit-cases.cjs');
    const { analyzeScenarioText } = require('../script.js');
    let renderedCases = 0;
    for (const item of auditCases.filter(item => item.text.length <= 6000)) {
      const rendered = await page.evaluate(item => {
        const input = document.getElementById('scenarioInput');
        input.value = item.text;
        input.dispatchEvent(new Event('input', { bubbles:true }));
        document.getElementById('analyzeScenario').click();
        const canAnswer = !document.getElementById('caseFollowups').hidden;
        if (item.reason && canAnswer) {
          const radio = document.getElementById('case-reason-' + item.reason);
          radio.checked = true;
          radio.dispatchEvent(new Event('change', { bubbles:true }));
        }
        return {
          answered: !!item.reason && canAnswer,
          status:document.getElementById('recommendationBox').dataset.guidanceStatus,
          title:document.getElementById('recommendationTitle').textContent,
          details:document.getElementById('matchedIndications').textContent,
          followupsHidden:document.getElementById('caseFollowups').hidden,
          injected:window.auditInjected || document.querySelector('#recommendationBox script, #recommendationBox img[onerror]') !== null
        };
      }, item);
      const expected = analyzeScenarioText(item.text, rendered.answered ? {reason:item.reason}:{}).guidance;
      assert.equal(rendered.status, expected.status, 'Rendered corpus status: '+item.id);
      assert.equal(rendered.title, expected.title, 'Rendered corpus title: '+item.id);
      assert.equal(rendered.injected, false, 'Input must remain data: '+item.id);
      if (expected.status === 'conditional') for (const question of expected.questions) assert(rendered.details.includes(question), 'Missing visible detail: '+item.id);
      if (!expected.showFollowups || expected.status === 'review_existing') assert(rendered.followupsHidden, 'Inapplicable questions remain hidden: '+item.id);
      renderedCases++;
    }
    await enter('Implant planning #30. Need ridge width. I have not examined the patient yet.');
    await chooseReason('implant_planning');
    assert.match(await page.locator('#recommendationTitle').innerText(), /Complete the initial assessment/);
    await page.screenshot({path:'out/clinical-audit-assessment.png',fullPage:false});
    await enter('#19 toothache. Rapidly spreading neck swelling, difficulty swallowing and trouble breathing. PA inconclusive.');
    assert.match(await page.locator('#recommendationTitle').innerText(), /Urgent assessment/);
    assert(await page.locator('#caseFollowups').isHidden());
    await page.screenshot({path:'out/clinical-audit-priority.png',fullPage:false});
    console.log('Audit corpus DOM rendering: '+renderedCases+' cases passed.');
    await page.goto(base + '/clinical-method.html');
    assert.match(await page.locator('h1').innerText(), /guidance result/);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: 'out/clinical-method-mobile.png', fullPage: true });
    await page.goto(base + '/#calculator');
    await page.locator('#showScanEstimate').click();
    assert.equal(await page.locator('#monthlyScans').innerText(), '0');
    await page.goto(base + '/#artifacts');
    assert(await page.locator('[data-tab-panel="artifacts"]').isVisible());
    assert.deepEqual(errors, []);
    assert.deepEqual(outbound, [], 'Case work must not trigger outgoing data requests on localhost');
    console.log('Browser checks passed: stable case-specific reason order, separate implant/procedure planning, missing and historical procedure checks, confirmation details above choices, responsive wrapping, automatic result focus/scroll after all 14 purposes and keyboard selection, reduced motion, explicit facts overriding assumptions, scope boundaries, edit/reset, source/assumption trace, injection escaping, method page, planner/artifacts, no page errors or outgoing requests.');
  } catch (error) {
    console.error('Browser state:', await page.evaluate(() => ({
      status: document.getElementById('recommendationBox')?.dataset.guidanceStatus,
      focus: document.activeElement?.id,
      panelTop: document.getElementById('recommendationBox')?.getBoundingClientRect().top,
      headerBottom: document.querySelector('.site-header')?.getBoundingClientRect().bottom,
      scrollY, maxScroll: document.documentElement.scrollHeight - innerHeight
    })));
    await page.screenshot({ path: 'out/clinical-browser-failure.png', fullPage: false });
    throw error;
  } finally { await browser.close(); server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
