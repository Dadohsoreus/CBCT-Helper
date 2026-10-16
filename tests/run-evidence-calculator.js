const assert = require('assert');
const { evidenceMap, studies, calculatePracticePlan } = require('../script.js');

const evidenceEntries = Object.values(evidenceMap);
const percentEvidence = evidenceEntries.filter(item => item.displayPercent !== 'No direct % used');

percentEvidence.forEach(item => {
  assert(
    item.doiUrl && item.doiUrl.startsWith('https://doi.org/'),
    `${item.indicationId} should link percentage evidence to a direct DOI URL`
  );
});

['retreatment', 'implant', 'airway', 'sinus'].forEach(indicationId => {
  assert.strictEqual(
    evidenceMap[indicationId].displayPercent,
    'No direct % used',
    `${indicationId} should not force a percentage without indication-specific evidence`
  );
  assert.strictEqual(evidenceMap[indicationId].calculatorRate.planRate, 0);
  assert.strictEqual(evidenceMap[indicationId].calculatorRate.diagnosisRate, 0);
});

evidenceEntries.forEach(item => {
  assert.strictEqual(
    item.calculatorRate.scanFactor,
    1,
    `${item.indicationId} should count each entered indication as an estimated scan`
  );

  assert.notStrictEqual(
    item.calculatorRate.planRate,
    0.69,
    `${item.indicationId} should not reuse broad 69% plan rate as indication-specific`
  );
});

const impact = calculatePracticePlan({ pain: 10, implant: 4 });
assert.strictEqual(impact.totalScans, 14);
assert.strictEqual(impact.studyCases, 10);
assert.strictEqual(impact.unestimatedCases, 4);
assert.strictEqual(impact.studyIllustration, 8.6);

const accuracyItems = evidenceEntries.filter(item => item.accuracy);
assert.deepStrictEqual(
  accuracyItems.map(item => item.indicationId),
  ['fracture'],
  'Only direct diagnostic-accuracy evidence should remain in the evidence map'
);

accuracyItems.forEach(item => {
  const study = studies[item.accuracy.studyId];
  assert(study && study.doiUrl, `${item.indicationId} accuracy item needs a direct study DOI`);
  assert.strictEqual(typeof item.accuracy.twoDOnly, 'number');
  assert.strictEqual(typeof item.accuracy.cbctAssisted, 'number');
  assert.strictEqual(typeof item.accuracy.absoluteDifference, 'number');
});

console.log('Evidence calculator tests passed');
