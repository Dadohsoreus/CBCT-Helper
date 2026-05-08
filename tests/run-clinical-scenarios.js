const cases = require('./clinical-scenarios.json');
const { analyzeScenarioText } = require('../script.js');

const conceptAliases = {
  'suspected cracked tooth / structural tooth pain': {
    scenarios: ['Suspected cracked tooth / structural tooth pain'],
    concepts: ['crackedToothPain', 'structuralToothPain']
  },
  'contradictory or nonspecific symptoms': {
    scenarios: ['Contradictory or nonspecific signs and symptoms'],
    concepts: ['nonspecificSymptoms']
  },
  'suspected vertical root fracture': {
    scenarios: ['Suspected vertical root fracture'],
    concepts: ['verticalRootFracture', 'isolatedProbing', 'jShapedLesion', 'haloLesion']
  },
  'persistent or nonhealing endodontic symptoms': {
    scenarios: ['Persistent or nonhealing endodontic symptoms'],
    concepts: ['postEndoSymptoms', 'nonhealingLesion']
  },
  'previously treated tooth': {
    concepts: ['priorEndo']
  },
  'apical pathology': {
    concepts: ['periapicalFinding', 'nonhealingLesion']
  },
  'retreatment evaluation': {
    scenarios: ['Missed anatomy or retreatment evaluation'],
    concepts: ['retreatment']
  },
  'missed anatomy': {
    scenarios: ['Missed anatomy or retreatment evaluation'],
    concepts: ['missedAnatomy']
  },
  'persistent symptoms': {
    concepts: ['persistentSymptoms', 'postEndoSymptoms']
  },
  'external cervical resorption': {
    scenarios: ['Resorption'],
    concepts: ['cervicalResorption', 'resorption']
  },
  'resorption localization': {
    scenarios: ['Resorption'],
    concepts: ['locationExtent']
  },
  'implant planning': {
    scenarios: ['Implant planning'],
    concepts: ['implantPlanning']
  },
  'anatomic measurement': {
    concepts: ['measurementNeed', 'anatomicRisk']
  },
  'impacted tooth localization': {
    scenarios: ['Impacted or ectopic tooth position'],
    concepts: ['impaction', 'ectopicEruption']
  },
  'strong CBCT indication': {
    special: 'strong-match'
  }
};

function summarize(analysis) {
  return {
    matches: analysis.matches.map(match => ({
      name: match.name,
      alignmentLevel: match.alignmentLevel,
      score: Number(match.score.toFixed(2))
    })),
    concepts: Array.from(analysis.concepts),
    reducingConcepts: Array.from(analysis.reducingConcepts),
    topAlignment: analysis.matches[0]?.alignmentLevel || 'weak'
  };
}

function hasExpected(summary, expected) {
  const alias = conceptAliases[expected];
  if (!alias) {
    return summary.matches.some(match => match.name.toLowerCase() === expected.toLowerCase())
      || summary.concepts.includes(expected);
  }

  if (alias.special === 'strong-match') {
    return summary.matches.some(match => match.alignmentLevel === 'strong');
  }

  const scenarioHit = (alias.scenarios || []).some(name => summary.matches.some(match => match.name === name));
  const conceptHit = (alias.concepts || []).some(concept => summary.concepts.includes(concept));
  return scenarioHit || conceptHit;
}

function confidenceMatches(actual, expected) {
  if (!expected) return true;
  if (expected === 'limited-to-moderate') return ['limited', 'moderate'].includes(actual);
  if (expected === 'weak-or-limited') return ['weak', 'limited'].includes(actual);
  return actual === expected;
}

function runCase(testCase) {
  const summary = summarize(analyzeScenarioText(testCase.input));
  const missedExpectedConcepts = (testCase.expectedInclude || []).filter(expected => !hasExpected(summary, expected));
  const incorrectlyIncludedConcepts = (testCase.expectedExclude || []).filter(expected => hasExpected(summary, expected));
  const expectedConfidence = testCase.expectedConfidence || testCase.expectedAlignmentLevel;
  const confidenceMismatch = confidenceMatches(summary.topAlignment, expectedConfidence)
    ? null
    : { expected: expectedConfidence, actual: summary.topAlignment };

  return {
    id: testCase.id,
    passed: missedExpectedConcepts.length === 0
      && incorrectlyIncludedConcepts.length === 0
      && !confidenceMismatch,
    missedExpectedConcepts,
    incorrectlyIncludedConcepts,
    confidenceMismatch,
    summary,
    notes: testCase.notes
  };
}

const results = cases.map(runCase);
const passed = results.filter(result => result.passed).length;
const failed = results.length - passed;

console.log(`Clinical scenario tests: ${passed}/${results.length} passed`);

results.forEach(result => {
  const status = result.passed ? 'PASS' : 'FAIL';
  console.log(`\n${status} ${result.id}`);
  console.log(`  top alignment: ${result.summary.topAlignment}`);
  console.log(`  matches: ${result.summary.matches.map(match => `${match.name} (${match.alignmentLevel}, ${match.score})`).join('; ') || 'none'}`);

  if (result.missedExpectedConcepts.length) {
    console.log(`  missed expected concepts: ${result.missedExpectedConcepts.join(', ')}`);
  }

  if (result.incorrectlyIncludedConcepts.length) {
    console.log(`  incorrectly included concepts: ${result.incorrectlyIncludedConcepts.join(', ')}`);
  }

  if (result.confidenceMismatch) {
    console.log(`  confidence/alignment mismatch: expected ${result.confidenceMismatch.expected}, got ${result.confidenceMismatch.actual}`);
  }

  console.log(`  detected concepts: ${result.summary.concepts.join(', ') || 'none'}`);
  console.log(`  nuance: ${result.notes}`);
});

if (failed > 0) {
  process.exitCode = 1;
}
