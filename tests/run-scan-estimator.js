const assert = require('node:assert/strict');
const { evidenceMap, calculatePracticePlan, decisionStudyCategories, scanCategories } = require('../script.js');
let checked = 0;
function check(name, test) { test(); checked++; }

check('Figure 4 category mapping: R2 86, R7 88, R6 93, R12 52, R9 48', () => {
  // Chugal et al., JADA 2024, DOI 10.1016/j.adaj.2023.09.007, Figure 4D–H.
  const expected = { pain: 86, nonhealing: 88, fracture: 93, resorption: 52, surgery: 48 };
  assert.deepEqual([...decisionStudyCategories].sort(), Object.keys(expected).sort());
  for (const [key, percentage] of Object.entries(expected)) {
    assert.equal(evidenceMap[key].displayPercent, percentage + '%');
    assert.equal(calculatePracticePlan({ [key]: 100 }).studyIllustration, percentage);
    assert.equal(evidenceMap[key].doiUrl, 'https://doi.org/10.1016/j.adaj.2023.09.007');
  }
});
check('All entered cases count as scans without a share or referral assumption', () => {
  const result = calculatePracticePlan({ pain: 10, implant: 5, other: 2 });
  assert.equal(result.totalScans, 17);
  assert.equal(result.studyCases, 10);
  assert.equal(result.unestimatedCases, 7);
  assert.equal(result.studyIllustration, 8.6);
  assert.equal(result.cbctRevenue, null);
});
check('Different study outcomes and unknown categories have no invented percentage', () => {
  for (const key of ['retreatment', 'implant', 'sinus', 'impaction', 'other']) {
    const result = calculatePracticePlan({ [key]: 20 }, { cbctFee: 200 });
    assert.equal(result.totalScans, 20);
    assert.equal(result.studyCases, 0);
    assert.equal(result.studyIllustration, null);
    assert.equal(result.unestimatedCases, 20);
    assert.equal(result.cbctRevenue, 4000);
  }
});
check('Weighted illustration sums before rounding; does not add diagnosis or accuracy', () => {
  const result = calculatePracticePlan({ pain: 3, nonhealing: 2, fracture: 1, resorption: 1, surgery: 1, implant: 4 });
  assert.equal(result.totalScans, 12);
  assert.equal(result.studyCases, 8);
  assert.equal(result.studyIllustration, 6.27);
});
check('Zero and blank counts never create a benefit estimate', () => {
  for (const counts of [{}, { pain: '' }, { pain: '  ', implant: 0 }, { fracture: null }]) {
    const result = calculatePracticePlan(counts);
    assert.equal(result.totalScans, 0);
    assert.equal(result.studyIllustration, null);
    assert.equal(result.cbctRevenue, null);
    assert.deepEqual(result.invalidCounts, []);
  }
});
check('String inputs and integer numeric notation are accepted consistently', () => {
  const result = calculatePracticePlan({ pain: ' 10 ', implant: '002', other: '1e2' }, { cbctFee: '150.25' });
  assert.equal(result.totalScans, 112);
  assert.equal(result.cbctRevenue, 16828);
});
check('Invalid counts never silently round, disappear, or produce revenue', () => {
  for (const count of [-1, 0.5, NaN, Infinity, 'wrong', '1.2', 100001, Number.MAX_SAFE_INTEGER, true, {}, [1]]) {
    const result = calculatePracticePlan({ pain: count, implant: 2 }, { cbctFee: 200 });
    assert(result.invalidCounts.includes('pain'), String(count));
    assert.equal(result.totalScans, null);
    assert.equal(result.studyCases, null);
    assert.equal(result.cbctRevenue, null);
  }
});
check('Invalid count collections and unrecognized categories fail closed', () => {
  for (const counts of [null, undefined, [], [10], '10', { fake: 100 }, { airway: 1 }]) assert.equal(calculatePracticePlan(counts).totalScans, null);
});
check('Explicit free scans differ from no fee', () => {
  assert.equal(calculatePracticePlan({ pain: 10 }, { cbctFee: '' }).cbctRevenue, null);
  assert.equal(calculatePracticePlan({ pain: 10 }, { cbctFee: '0' }).cbctRevenue, 0);
});
check('Fee cents are preserved without floating-point money artifacts', () => {
  assert.equal(calculatePracticePlan({ pain: 3 }, { cbctFee: '199.99' }).cbctRevenue, 599.97);
  assert.equal(calculatePracticePlan({ pain: 3 }, { cbctFee: '0.10' }).cbctRevenue, 0.3);
});
check('Invalid fees suppress revenue without changing scans or study counts', () => {
  for (const cbctFee of [-1, Infinity, NaN, 'fee', '12.345', 1000001, true, {}]) {
    const result = calculatePracticePlan({ pain: 10 }, { cbctFee });
    assert.equal(result.invalidFee, true, String(cbctFee));
    assert.equal(result.totalScans, 10);
    assert.equal(result.studyIllustration, 8.6);
    assert.equal(result.cbctRevenue, null);
  }
});
check('Upper bounds retain safe integer cents and valid totals', () => {
  const result = calculatePracticePlan(Object.fromEntries(scanCategories.map(key => [key, 100000])), { cbctFee: 1000000 });
  assert.equal(result.totalScans, 1000000);
  assert.equal(result.cbctRevenue, 1000000000000);
  assert(Number.isSafeInteger(result.cbctRevenue * 100));
});
check('Changing counts recalculates scan and fee outputs together', () => {
  assert.equal(calculatePracticePlan({ pain: 10 }, { cbctFee: 200 }).cbctRevenue, 2000);
  assert.equal(calculatePracticePlan({ pain: 2 }, { cbctFee: 200 }).cbctRevenue, 400);
});
console.log(`Scan estimator calculations: ${checked}/${checked} groups passed`);
