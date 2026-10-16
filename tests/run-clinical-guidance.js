const assert = require('node:assert/strict');
const { analyzeScenarioText } = require('../script.js');
const { decide, sources, topics, reasons, reasonOrder } = require('../clinical-guidance.js');
const complete = { imaging: 'two_d_unresolved', exam: 'yes', impact: 'yes' };
const unclearPain = '#14 lingering cold response and hard-to-localize pain. Periapical imaging is inconclusive. Need to clarify the source of symptoms.';
const cases = [
  ['empty', '', {}, 'empty', 'empty'],
  ['unrecognized text is not a negative recommendation', 'Please advise about this.', {}, 'needs_details', 'unrecognized'],
  ['unknown language is not automatically outside coverage', '¿Se necesita una tomografía?', {}, 'needs_details', 'unrecognized'],
  ['unsupported TMJ must not become dental resorption', 'Condylar resorption with TMJ pain. Need extent.', complete, 'outside_coverage', 'outside-library'],
  ['unsupported lesion must not become endodontics', 'Jaw cyst and radiolucency at #14. Need extent.', complete, 'outside_coverage', 'outside-library'],
  ['unsupported non-dental pain', 'Knee pain after trauma.', complete, 'outside_coverage', 'outside-library'],
  ['unsupported orthodontic miniscrew', 'Mini-implant planning for malocclusion. Need bone width.', complete, 'outside_coverage', 'outside-library'],
  ['negative TMJ mention does not block implant planning', 'No TMJ symptoms. Implant planning at #30. Need ridge width.', complete, 'supported', 'criteria-reported'],
  ['routine screening is a specific negative purpose', 'Routine CBCT screening for all new patients. No symptoms or abnormal findings.', {}, 'not_supported', 'routine-screening'],
  ['routine recall can contain a separate supported problem', 'Routine recall. Suspected resorption at #9. Need extent.', complete, 'supported', 'criteria-reported'],
  ['no routine screening is not a screening request', 'No routine CBCT screening planned.', {}, 'needs_details', 'unrecognized'],
  ['implant with missing criteria', 'Implant planning at #30. Need ridge width and height.', {}, 'conditional', 'confirm-criteria'],
  ['implant after assessment can use CBCT without failed 2D', 'Implant planning at #30. Need ridge width and height.', { ...complete, imaging: 'none' }, 'supported', 'criteria-reported'],
  ['implant with adequate existing CBCT', 'Implant planning at #30. A CBCT from last week already provides adequate ridge width, bone height and distance to the inferior alveolar canal. No additional imaging is needed.', {}, 'review_existing', 'adequate-cbct'],
  ['existing scan needing review', 'Implant planning at #30. Previous CBCT is available. Need ridge width.', {}, 'review_existing', 'review-cbct'],
  ['inadequate scan is not called adequate', 'Implant planning at #30. Existing CBCT is inadequate for ridge width.', {}, 'conditional', 'confirm-criteria'],
  ['repeat imaging needs its own justification', 'Implant planning at #30. Need ridge width.', { ...complete, imaging: 'cbct_unresolved' }, 'conditional', 'confirm-criteria'],
  ['sufficient 2D overrides text similarity', 'Suspected resorption at #9. Need extent. 2D imaging answers the question.', {}, 'not_supported', 'adequate-2d'],
  ['no benefit overrides a recognized indication', 'Resorption at #9. Need extent. Imaging would not change treatment.', {}, 'not_supported', 'no-added-benefit'],
  ['not examined cannot reach supported', 'Implant planning at #30. Need ridge width. No clinical exam performed.', { imaging: 'none', impact: 'yes' }, 'conditional', 'confirm-criteria'],
  ['simple resorption remains conditional', 'ECR #9.', {}, 'conditional', 'confirm-criteria'],
  ['resorption with explicit criteria', 'Suspected external cervical resorption at #9. Need location and extent.', complete, 'supported', 'criteria-reported'],
  ['negated resorption', 'No resorption at #9.', complete, 'needs_details', 'unrecognized'],
  ['unresolved exclusion is not a denial', 'Cannot rule out resorption at #9. Need extent.', complete, 'supported', 'criteria-reported'],
  ['mixed teeth cannot pool findings', 'Tooth #14 had root canal treatment and is asymptomatic. Tooth #19 has pain on biting. No suspected vertical root fracture.', complete, 'needs_details', 'separate-context'],
  ['same tooth contradictory findings require clarification', 'No resorption at #9. Suspected resorption at #9. Need extent.', complete, 'needs_details', 'separate-context'],
  ['implant and endodontics kept separate', 'Implant planning at #30. Possible missed MB2, retreatment evaluation.', complete, 'needs_details', 'separate-context'],
  ['dropdown cannot override adequate scan', 'Implant planning at #30. Existing CBCT already answers the question.', complete, 'needs_details', 'conflicting-answers'],
  ['dropdown cannot override adequate 2D', 'Resorption at #9. 2D imaging answers the question.', complete, 'needs_details', 'conflicting-answers'],
  ['dropdown cannot override lack of examination', 'Implant planning at #30. No exam performed. Need ridge width.', complete, 'needs_details', 'conflicting-answers'],
  ['dropdown cannot override no benefit', 'Resorption at #9. Need extent. Imaging would not change treatment.', complete, 'needs_details', 'conflicting-answers'],
  ['two incompatible 2D statements', 'Resorption #9. PA inconclusive. 2D imaging answers the question.', {}, 'needs_details', 'conflicting-answers'],
  ['adult OSA diagnostic request', 'Patient requests CBCT to diagnose obstructive sleep apnea. Snoring and suspected sleep apnea.', {}, 'not_supported', 'sleep-diagnosis'],
  ['airway request is not all outside coverage', 'Snoring and airway volume assessment.', {}, 'needs_details', 'airway-question'],
  ['separate airway and implant questions', 'Implant planning #30 and CBCT to diagnose sleep apnea.', complete, 'needs_details', 'separate-context'],
  ['VRF support still requires initial imaging context', 'VRF at #30. Isolated 9mm probing. Need bone pattern.', {}, 'conditional', 'confirm-criteria'],
  ['VRF after complete assessment', 'Suspected vertical root fracture at #30.', complete, 'supported', 'criteria-reported'],
  ['crack wording cannot become a definitive fracture pathway', 'Cracked cusp at #30 with bite pain.', complete, 'conditional', 'confirm-criteria'],
  ['retreatment specific question', 'Prior root canal at #19. Retreatment evaluation for missed MB2.', complete, 'supported', 'criteria-reported'],
  ['root-end surgery question', 'Apicoectomy at #14. Need relationship to sinus floor.', complete, 'supported', 'criteria-reported'],
  ['trauma specific question', 'Trauma at #8 with suspected horizontal root fracture.', complete, 'supported', 'criteria-reported'],
  ['historical trauma without current question', 'Trauma history at #8 years ago. No symptoms.', complete, 'conditional', 'confirm-criteria'],
  ['third molar specific risk', 'Third molar extraction #17. Pano inconclusive with inferior alveolar canal overlap.', complete, 'supported', 'criteria-reported'],
  ['generic extraction has no borrowed third-molar rule', 'Extraction planning #14.', complete, 'needs_details', 'unrecognized'],
  ['impacted canine needs source applicability check', 'Impacted canine #11. Need root proximity, pano inconclusive.', complete, 'conditional', 'confirm-criteria'],
  ['sinus not synonymous with odontogenic source', 'Sinus pressure and mucosal thickening.', complete, 'needs_details', 'unrecognized'],
  ['dental source sinusitis', 'Odontogenic sinusitis suspected at #14 with periapical radiolucency.', complete, 'supported', 'criteria-reported'],
  ['normal PA does not prove the question answered', 'Tooth #14 with hard-to-localize pain. PA normal. Source unclear.', { exam: 'yes', impact: 'yes' }, 'conditional', 'confirm-criteria'],
  ['exam and impact can be recognized in the description', 'Suspected resorption at #9. Need extent. Clinical examination completed. PA inconclusive. Results could change treatment.', {}, 'supported', 'criteria-reported'],
  ['a question about adequacy is not an adequacy assertion', 'Implant planning #30. Is the existing CBCT adequate for ridge width?', {}, 'review_existing', 'review-cbct'],
  ['a test name does not prove assessment was completed', 'Resorption #9. Need extent. Cold test to be performed. PA inconclusive. Results could change treatment.', {}, 'conditional', 'confirm-criteria'],
  ['denied test does not prove assessment was completed', 'Resorption #9. Need extent. No cold test performed. PA inconclusive. Results could change treatment.', {}, 'conditional', 'confirm-criteria'],
  ['uncertain effect on care remains conditional', 'Implant planning #30. Need ridge width.', { ...complete, impact: 'unsure' }, 'conditional', 'confirm-criteria'],
  ['no initial images for fracture prompts initial assessment', 'Suspected vertical root fracture #30.', { ...complete, imaging: 'none' }, 'conditional', 'confirm-criteria'],
  ['two opposing CBCT descriptions cannot become repeat advice', 'Implant planning #30. Existing CBCT is adequate. Previous CBCT is inadequate. Need ridge width.', {}, 'needs_details', 'conflicting-answers'],
  ['first CBCT assumption does not imply missing 2D images', 'Resorption at #9. Need extent. No CBCT has been taken. PA inconclusive.', complete, 'supported', 'criteria-reported'],
  ['first CBCT assumption does not establish adequacy of 2D', 'Resorption at #9. Need extent. No CBCT has been taken.', { exam: 'yes', impact: 'yes' }, 'conditional', 'confirm-criteria'],
  ['completed scan overrides the first-scan assumption', 'Implant planning at #30. Need ridge width. CBCT was performed yesterday.', {}, 'review_existing', 'review-cbct'],
  ['patient had a scan overrides the first-scan assumption', 'Implant planning at #30. Need ridge width. Patient had a CBCT yesterday.', {}, 'review_existing', 'review-cbct'],
  ['negated completed scan is not treated as existing', 'Implant planning at #30. Need ridge width. No CBCT was performed.', { ...complete, imaging: 'none' }, 'supported', 'criteria-reported'],
  ['very long text rejected before matching', 'Resorption. '.repeat(600), complete, 'needs_details', 'length'],
  ['assumptions and a planning purpose support an explicit implant question', 'Implant planning #30. Need ridge width.', { reason: 'implant_planning' }, 'supported', 'criteria-reported'],
  ['assumed 2D review does not establish inadequacy', 'Suspected resorption #9. Need extent.', { reason: 'extent' }, 'conditional', 'confirm-criteria'],
  ['reported 2D limitation plus purpose can support resorption', 'Suspected resorption #9. Need extent. 2D X-rays are inconclusive.', { reason: 'extent' }, 'supported', 'criteria-reported'],
  ['explicit no exam overrides default', 'Implant planning #30. Need ridge width. No clinical exam performed.', { reason: 'implant_planning' }, 'conditional', 'confirm-criteria'],
  ['incomplete exam variant overrides default', 'Implant planning #30. Need ridge width. Examination has not yet been completed.', { reason: 'implant_planning' }, 'conditional', 'confirm-criteria'],
  ['unreviewed history overrides default', 'Implant planning #30. Need ridge width. Medical history has not been reviewed.', { reason: 'implant_planning' }, 'conditional', 'confirm-criteria'],
  ['absent 2D overrides default', 'Suspected resorption #9. Need extent. No 2D X-rays have been taken.', { reason: 'extent' }, 'conditional', 'confirm-criteria'],
  ['unreviewed 2D overrides default even for implant planning', 'Implant planning #30. Need ridge width. 2D X-rays have not been reviewed.', { reason: 'implant_planning' }, 'conditional', 'confirm-criteria'],
  ['taken but unreviewed 2D overrides default', 'Implant planning #30. Need ridge width. 2D X-rays were taken but have not yet been reviewed.', { reason: 'implant_planning' }, 'conditional', 'confirm-criteria'],
  ['adequate 2D beats a reason', 'Suspected resorption #9. Need extent. 2D X-rays answer the question.', { reason: 'extent' }, 'not_supported', 'adequate-2d'],
  ['adequate CBCT beats a reason', 'Implant planning #30. Need ridge width. Existing CBCT already answers the question.', { reason: 'implant_planning' }, 'review_existing', 'adequate-cbct'],
  ['benefit selection cannot override no benefit in text', 'Implant planning #30. Need ridge width. Imaging would not change treatment.', { reason: 'implant_planning' }, 'needs_details', 'conflicting-answers'],
  ['referral selection cannot override no benefit in text', 'Implant planning #30. Need ridge width. Imaging would not change treatment.', { reason: 'referral' }, 'not_supported', 'no-added-benefit'],
  ['referral does not automatically require imaging', 'Suspected resorption #9. Need extent. PA inconclusive.', { reason: 'referral' }, 'conditional', 'confirm-criteria'],
  ['unexplained symptoms purpose with a covered question', 'Tooth #14 has hard-to-localize pain. Source unclear. PA inconclusive.', { reason: 'diagnosis' }, 'supported', 'criteria-reported'],
  ['treatment decision with a covered question', 'Suspected resorption #9. Need extent. PA inconclusive.', { reason: 'treatment' }, 'supported', 'criteria-reported'],
  ['risk assessment with an implant question', 'Implant planning #30. Need distance to mandibular canal.', { reason: 'risk' }, 'supported', 'criteria-reported'],
  ['complication investigation with a covered endodontic question', 'Retreatment evaluation #19 for suspected perforation. PA inconclusive. Need extent.', { reason: 'complication' }, 'supported', 'criteria-reported'],
  ['persistent endodontic disease can support a healing concern', 'Prior root canal #19. Persistent symptoms and nonhealing lesion. PA inconclusive.', { reason: 'healing' }, 'supported', 'criteria-reported'],
  ['healing choice cannot invent a complication', 'Implant planning #30. Need ridge width.', { reason: 'healing' }, 'conditional', 'confirm-criteria'],
  ['other reason cannot establish benefit', 'Implant planning #30. Need ridge width.', { reason: 'other' }, 'conditional', 'confirm-criteria'],
  ['routine choice remains negative with a recognized topic', 'Implant planning #30. Need ridge width.', { reason: 'screening' }, 'not_supported', 'purpose-screening'],
  ['patient request alone is not an indication', 'Suspected resorption #9. Need extent. PA inconclusive.', { reason: 'reassurance' }, 'not_supported', 'purpose-reassurance'],
  ['records alone is not an indication', 'Implant planning #30. Need ridge width.', { reason: 'records' }, 'not_supported', 'purpose-records'],
  ['no change purpose is negative', 'Implant planning #30. Need ridge width.', { reason: 'no_change' }, 'not_supported', 'purpose-no_change'],
  ['unrecognized purpose value is ignored', 'Implant planning #30. Need ridge width.', { reason: 'toString' }, 'conditional', 'confirm-criteria'],
  ['diagnostic purpose does not turn planning into unexplained symptoms', 'Implant planning #30. Need ridge width.', { reason: 'diagnosis' }, 'conditional', 'confirm-criteria'],
  ['complication purpose does not create a complication', 'Implant planning #30. Need ridge width.', { reason: 'complication' }, 'conditional', 'confirm-criteria'],
  ['risk purpose does not create an anatomical risk question', 'Implant planning #30. Need ridge width.', { reason: 'risk' }, 'conditional', 'confirm-criteria'],
  ['implant complication cannot borrow the endodontic complication pathway', 'Implant complications at #30 with pain. Need extent. PA inconclusive.', { reason: 'complication' }, 'outside_coverage', 'outside-library'],
  ['pain example remains a diagnostic question', unclearPain, { reason: 'diagnosis' }, 'supported', 'criteria-reported'],
  ['implant choice cannot create a plan in pain example', unclearPain, { reason: 'implant_planning' }, 'conditional', 'confirm-criteria'],
  ['other procedure choice cannot create a plan in pain example', unclearPain, { reason: 'procedure_planning' }, 'conditional', 'confirm-criteria'],
  ['generic procedure wording does not name a plan', unclearPain + ' Planning a procedure.', { reason: 'procedure_planning' }, 'conditional', 'confirm-criteria'],
  ['generic surgery wording does not name a plan', unclearPain + ' Surgery planned.', { reason: 'procedure_planning' }, 'conditional', 'confirm-criteria'],
  ['named procedure still needs its specific information', unclearPain + ' Root canal treatment planned.', { reason: 'procedure_planning' }, 'conditional', 'confirm-criteria'],
  ['initial root canal plan with a specific anatomy question', 'Root canal treatment planned #14. Need canal morphology. PA inconclusive.', { reason: 'procedure_planning' }, 'supported', 'criteria-reported'],
  ['proposed retreatment with a specific question', 'Planning retreatment #14. Need to locate missed MB2. PA inconclusive.', { reason: 'procedure_planning' }, 'supported', 'criteria-reported'],
  ['root canal retreatment phrase is one procedure', 'Planning root canal retreatment #14. Need to locate missed MB2. PA inconclusive.', { reason: 'procedure_planning' }, 'supported', 'criteria-reported'],
  ['past root canal is not a new treatment plan', 'Prior root canal treatment #14. Persistent pain. Need to locate missed MB2. PA inconclusive.', { reason: 'procedure_planning' }, 'conditional', 'confirm-criteria'],
  ['denied treatment plan cannot support procedure choice', 'No root canal treatment planned #14. Need canal morphology. PA inconclusive.', { reason: 'procedure_planning' }, 'conditional', 'confirm-criteria'],
  ['post-mention denial cannot support procedure choice', 'Root canal treatment is not planned #14. Need canal morphology. PA inconclusive.', { reason: 'procedure_planning' }, 'conditional', 'confirm-criteria'],
  ['named surgery with anatomical need', 'Apicoectomy planned #14. Need relationship to sinus floor. PA inconclusive.', { reason: 'procedure_planning' }, 'supported', 'criteria-reported'],
  ['past surgery is not a proposed procedure', 'Apicoectomy performed in 2020 at #14. Need relationship to sinus floor. PA inconclusive.', { reason: 'procedure_planning' }, 'conditional', 'confirm-criteria'],
  ['third molar extraction plan with nerve risk question', 'Third molar extraction planned #17. Pano inconclusive with inferior alveolar canal overlap.', { reason: 'procedure_planning' }, 'supported', 'criteria-reported'],
  ['extraction cannot borrow resorption planning coverage', 'Extraction planned #9. Suspected resorption. Need extent. PA inconclusive.', { reason: 'procedure_planning' }, 'conditional', 'confirm-criteria'],
  ['two proposed procedures need one planning question', 'Retreatment planned #14. Apicoectomy planned #14. Need relationship to sinus floor and missed MB2. PA inconclusive.', { reason: 'procedure_planning' }, 'conditional', 'confirm-criteria'],
  ['implant plan needs a concrete site question', 'Implant planning #30. Surgical guide planning.', { reason: 'implant_planning' }, 'conditional', 'confirm-criteria'],
  ['implant consultation alone is not a proposed placement', 'Implant consult #30. Need ridge width.', { reason: 'implant_planning' }, 'conditional', 'confirm-criteria'],
  ['completed implant planning does not establish a current plan', 'Implant planning was completed in 2020 at #30. Need ridge width.', { reason: 'implant_planning' }, 'conditional', 'confirm-criteria'],
  ['proposed implant placement with site detail', 'Implant placement planned #30. Need ridge width.', { reason: 'implant_planning' }, 'supported', 'criteria-reported'],
  ['other procedure choice does not silently stand in for implant placement', 'Implant planning #30. Need ridge width.', { reason: 'procedure_planning' }, 'conditional', 'confirm-criteria'],
];
// Every practical purpose is exercised against unsupported and ambiguous input.
// A broad purpose must never supply clinical coverage or invent an indication.
for (const [reason, entry] of Object.entries(reasons)) {
  if (entry.effect === 'unsupported') continue;
  cases.push(['purpose cannot expand coverage: ' + reason, 'TMJ condylar resorption. Need extent.', { reason }, 'outside_coverage', 'outside-library']);
  cases.push(['purpose cannot invent a question: ' + reason, 'More information is needed.', { reason }, 'needs_details', 'unrecognized']);
}
let failures = 0;
for (const [name, text, answers, status, rule] of cases) {
  try {
    const result = analyzeScenarioText(text, answers).guidance;
    assert.equal(result.status, status);
    assert.equal(result.rule, rule);
    result.sourceKeys.forEach(key => assert(sources[key], 'Unmapped source'));
    if (result.status === 'supported') {
      assert(result.topic);
      assert.equal(result.questions.length, 0);
      assert(result.trace.some(item => item.label === 'Existing imaging'));
    }
  } catch (error) { failures++; console.error('FAIL:', name, '\n ', error.message); }
}
const sample = analyzeScenarioText('Implant planning at #30. Need ridge width.');
const original = decide('Implant planning at #30. Need ridge width.', sample, complete);
sample.matches.forEach(match => { match.score = 100000; match.alignmentLevel = 'strong'; });
assert.deepEqual(decide('Implant planning at #30. Need ridge width.', sample, complete), original, 'Wording scores must not change guidance');
Object.values(topics).forEach(topic => assert(sources[topic.source]));
for (const topic of [...Object.keys(topics), undefined, 'unknown', 'toString']) {
  assert.deepEqual([...reasonOrder(topic)].sort(), Object.keys(reasons).sort(), 'Every choice must remain available exactly once');
}
assert.deepEqual(reasonOrder('unclear').slice(0, 3), ['diagnosis', 'treatment', 'referral']);
assert.equal(reasonOrder('implant')[0], 'implant_planning');
assert.equal(reasonOrder('surgery')[0], 'procedure_planning');
const painPlanning = analyzeScenarioText(unclearPain, { reason: 'procedure_planning' }).guidance;
assert.equal(painPlanning.topic.id, 'unclear', 'A purpose must not reroute the clinical question');
assert(painPlanning.clarifications.some(question => /Which procedure/.test(question)));
assert(painPlanning.trace.some(item => item.label === 'Proposed procedure' && /No named/.test(item.value)));
const firstScan = analyzeScenarioText('Implant planning #30. Need ridge width.').guidance;
assert.equal(firstScan.existingCbct, false);
assert(firstScan.trace.some(item => item.label === 'CBCT context' && item.origin === 'Default assumption'));
assert(firstScan.trace.some(item => item.label === 'Existing imaging' && item.origin === 'Default assumption' && /ability to answer.*not established/.test(item.value)));
assert(firstScan.trace.some(item => item.label === 'Clinical assessment' && item.origin === 'Default assumption'));
const reportedReview = analyzeScenarioText('Implant planning #30. Need ridge width. 2D X-rays reviewed. Clinical examination completed.', { reason: 'implant_planning' }).guidance;
assert(reportedReview.trace.some(item => item.label === 'Existing imaging' && item.origin === 'Case description'));
assert(reportedReview.trace.some(item => item.label === 'Clinical assessment' && item.origin === 'Case description'));
assert(reportedReview.trace.some(item => item.label === 'Intended use of additional information' && item.origin === 'Selected answer'));
const notReviewed = analyzeScenarioText('Implant planning #30. Need ridge width. 2D X-rays have not been reviewed.', { reason: 'implant_planning' }).guidance;
assert(notReviewed.clarifications.some(item => /Review the available 2D/.test(item)));
const previousScan = analyzeScenarioText('Implant planning #30. Need ridge width. CBCT was taken yesterday.').guidance;
assert.equal(previousScan.existingCbct, true);
assert(previousScan.trace.some(item => item.label === 'CBCT context' && item.origin === 'Case description'));
console.log(`Clinical guidance: ${cases.length - failures}/${cases.length} scenario checks passed; score independence and source mapping verified.`);
if (failures) process.exitCode = 1;
