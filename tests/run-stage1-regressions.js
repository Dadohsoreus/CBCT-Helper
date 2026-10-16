const assert = require('node:assert/strict');
const { analyzeScenarioText } = require('../script.js');
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
console.log(`Stage 1 clinical regressions: ${checked}/${checked} passed`);
