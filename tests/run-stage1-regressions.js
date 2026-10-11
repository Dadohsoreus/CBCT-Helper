const assert = require('node:assert/strict');
const { analyzeScenarioText, calculatePracticePlan } = require('../script.js');
let checked = 0;
function check(name, test) { test(); checked++; }

check('Routine recall does not invert negative concerns', () => {
  const result = analyzeScenarioText('Asymptomatic adult attending routine recall. No pain, no fracture concern, no resorption, no implant planning. Examination and 2D imaging answer the clinical question.');
  assert.equal(result.matches.length, 0);
  ['resorption', 'persistentSymptoms', 'implantPlanning'].forEach(concept => assert.equal(result.concepts.has(concept), false));
  assert.equal(result.concepts.has('conclusive2d'), true);
  assert.equal(result.entities.missing_information.includes('Whether 2D imaging is normal, limited, or explanatory'), false);
});
check('Negative findings apply to pre- and post-mention wording', () => {
  ['No evidence of external cervical resorption.', 'Resorption is absent.', 'Denies trauma.', 'No perforation concern.', 'VRF not suspected.'].forEach(text => {
    const result = analyzeScenarioText(text);
    assert.equal(result.matches.length, 0, text);
  });
});
check('Unresolved exclusion remains a concern', () => {
  ['Cannot rule out resorption. Need to map extent.', 'Resorption not ruled out. Need to map extent.'].forEach(text => assert.equal(analyzeScenarioText(text).concepts.has('resorption'), true, text));
});
check('Positive wording in a different clause is preserved', () => {
  const result = analyzeScenarioText('No resorption at #14; suspected cervical resorption at #9. Need to map extent.');
  assert.equal(result.concepts.has('resorption'), true);
  assert.equal(result.negatedConcepts.has('resorption'), true);
  assert(result.entities.caution_notes.some(note => note.includes('Both positive and negative wording')));
});
check('Contrast ends negation scope', () => {
  assert.equal(analyzeScenarioText('No pain but suspected resorption. Need extent.').concepts.has('resorption'), true);
});
check('A new affirmative clause does not inherit the previous denial', () => {
  assert.equal(analyzeScenarioText('No pain, implant planning needed at #30. Need ridge width.').concepts.has('implantPlanning'), true);
});
check('Simple lists of denied findings remain negative', () => {
  const result = analyzeScenarioText('Routine recall. No pain, fracture, or resorption.');
  assert.equal(result.concepts.has('resorption'), false);
  assert.equal(result.matches.length, 0);
});
check('Negative test responses are not discarded', () => {
  const result = analyzeScenarioText('#30 cold test no response. PA inconclusive.');
  assert.equal(result.concepts.has('pulpNoResponse'), true);
});
check('Nonhealing wording remains available', () => {
  assert.equal(analyzeScenarioText('#19 prior RCT. Lesion not healing.').concepts.has('nonhealingLesion'), true);
});
check('Blank assumptions produce no forecast', () => {
  const plan = calculatePracticePlan([10], {});
  assert.equal(plan.cases, 10);
  assert.equal(plan.totalScans, null);
  assert.equal(plan.cbctRevenue, null);
});
check('Only scans performed in the practice generate practice revenue', () => {
  const plan = calculatePracticePlan([10], { scanShare: 50, referredCount: 3, cbctFee: 295, panCount: 0, panFee: 0 });
  assert.equal(plan.totalScans, 5);
  assert.equal(plan.officeScans, 2);
  assert.equal(plan.referredScans, 3);
  assert.equal(plan.cbctRevenue, 590);
  assert.equal(plan.totalRevenue, 590);
});
check('Explicit zero is different from a blank assumption', () => {
  const plan = calculatePracticePlan([10], { scanShare: 0, referredCount: 0, cbctFee: 295 });
  assert.equal(plan.totalScans, 0);
  assert.equal(plan.cbctRevenue, 0);
  assert.equal(plan.totalRevenue, null);
});
check('Missing referral count does not imply ownership of all scans', () => {
  const plan = calculatePracticePlan([10], { scanShare: 100, cbctFee: 295 });
  assert.equal(plan.totalScans, 10);
  assert.equal(plan.officeScans, null);
  assert.equal(plan.cbctRevenue, null);
});
check('Invalid percentages cannot generate a forecast', () => {
  [101, -1, Infinity, 'invalid'].forEach(scanShare => assert.equal(calculatePracticePlan([10], { scanShare }).totalScans, null));
});
check('Monthly averages retain precision for revenue', () => {
  const plan = calculatePracticePlan([3], { scanShare: 50, referredCount: 1, cbctFee: 200 });
  assert.equal(plan.totalScans, 1.5);
  assert.equal(plan.officeScans, 0.5);
  assert.equal(plan.cbctRevenue, 100);
});
check('Referral counts cannot exceed total estimated scans', () => {
  const plan = calculatePracticePlan([10], { scanShare: 50, referredCount: 6, cbctFee: 295 });
  assert.equal(plan.invalidReferral, true);
  assert.equal(plan.officeScans, null);
  assert.equal(plan.cbctRevenue, null);
});
check('Referred scans must be whole nonnegative counts', () => {
  [-1, 0.5, Infinity, 'invalid'].forEach(referredCount => {
    const plan = calculatePracticePlan([10], { scanShare: 100, referredCount, cbctFee: 295 });
    assert.equal(plan.invalidReferral, true);
    assert.equal(plan.officeScans, null);
    assert.equal(plan.cbctRevenue, null);
  });
});
check('All scans referred out produce no in-office revenue', () => {
  const plan = calculatePracticePlan([10], { scanShare: 50, referredCount: 5, cbctFee: 295 });
  assert.equal(plan.officeScans, 0);
  assert.equal(plan.referredScans, 5);
  assert.equal(plan.cbctRevenue, 0);
});
check('A lower case estimate cannot leave a negative in-office count', () => {
  const plan = calculatePracticePlan([4], { scanShare: 50, referredCount: 3, cbctFee: 295 });
  assert.equal(plan.totalScans, 2);
  assert.equal(plan.invalidReferral, true);
  assert.equal(plan.officeScans, null);
});
console.log(`Stage 1 regressions: ${checked}/${checked} passed`);
