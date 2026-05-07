const indicationWeights = {
  pain: { label: 'Nonspecific symptoms', scanFactor: 0.75, services: ['endo'], group: 'endo', planRate: 0, diagnosisRate: 0.21 },
  nonhealing: { label: 'Nonhealing endodontic treatment', scanFactor: 0.9, services: ['endo'], group: 'endo', planRate: 0.69, diagnosisRate: 0.21 },
  fracture: { label: 'Suspected vertical root fracture', scanFactor: 0.65, services: ['endo'], group: 'endo', planRate: 0.6202, diagnosisRate: 0.3445 },
  resorption: { label: 'Resorption', scanFactor: 0.85, services: ['endo'], group: 'endo', planRate: 0.69, diagnosisRate: 0.21 },
  retreatment: { label: 'Retreatment complication', scanFactor: 0.75, services: ['endo'], group: 'endo', planRate: 0.69, diagnosisRate: 0.21 },
  surgery: { label: 'Endodontic surgery planning', scanFactor: 0.85, services: ['endo', 'surgery'], group: 'endo', planRate: 0.69, diagnosisRate: 0.21 },
  implant: { label: 'Implant planning', scanFactor: 0.85, services: ['implants', 'surgery'], group: 'implants', planRate: 0, diagnosisRate: 0 },
  airway: { label: 'Airway screening', scanFactor: 0.2, services: ['airway'], group: 'airway', planRate: 0, diagnosisRate: 0 },
  sinus: { label: 'Odontogenic sinus question', scanFactor: 0.55, services: ['endo', 'surgery'], group: 'endo', planRate: 0.35, diagnosisRate: 0.35 },
  impaction: { label: 'Impacted tooth', scanFactor: 0.65, services: ['ortho', 'surgery'], group: 'ortho', planRate: 0.515, diagnosisRate: 0 }
};

const scenarios = [
  {
    name: 'Persistent or nonhealing endodontic symptoms',
    conceptWeights: { priorEndo: 2, persistentSymptoms: 2, inconclusive2d: 1.5, periapicalFinding: 1, retreatment: 1, pulpNecrosis: 1, sinusTract: 1.5 },
    comboBonus: [['priorEndo', 'persistentSymptoms'], ['persistentSymptoms', 'inconclusive2d'], ['priorEndo', 'periapicalFinding'], ['pulpNecrosis', 'periapicalFinding'], ['sinusTract', 'inconclusive2d']],
    threshold: 3,
    title: 'This scenario aligns with published CBCT-use considerations after inconclusive 2D imaging.',
    text: 'This wording matches the AAE/AAOMR endodontic indication for evaluating nonhealing or previously treated teeth when three-dimensional information may clarify the clinical question. ADA/AAOMR patient-selection guidance still centers the clinical exam first and frames CBCT as a modality to consider when lower-exposure imaging will not provide the needed information.'
  },
  {
    name: 'Contradictory or nonspecific signs and symptoms',
    conceptWeights: { nonspecificSymptoms: 2, persistentSymptoms: 1, inconclusive2d: 1.5, pulpTesting: 0.75, percussionTenderness: 0.75 },
    comboBonus: [['nonspecificSymptoms', 'inconclusive2d'], ['pulpTesting', 'percussionTenderness']],
    threshold: 2.5,
    title: 'This scenario may align with limited-FOV CBCT considerations after initial imaging.',
    text: 'AAE/AAOMR guidance identifies contradictory or nonspecific clinical signs and symptoms associated with untreated or previously treated teeth as a context where limited-FOV CBCT may be considered. Field of view, exposure, and expected information gain remain clinician-specific decisions.'
  },
  {
    name: 'Suspected vertical root fracture',
    conceptWeights: { verticalRootFracture: 2.5, bitingPain: 1.5, isolatedProbing: 2, crownOrPost: 0.5, jShapedLesion: 1.5, inconclusive2d: 1 },
    comboBonus: [['bitingPain', 'isolatedProbing'], ['verticalRootFracture', 'isolatedProbing'], ['verticalRootFracture', 'jShapedLesion']],
    threshold: 3,
    title: 'This scenario aligns with published considerations for inconclusive fracture assessment.',
    text: 'AAE/AAOMR guidance discusses limited-FOV CBCT when the clinical exam and 2D radiography are inconclusive for suspected vertical root fracture. Interpretation calls for caution near posts, crowns, and root filling materials because artifacts can mimic or obscure fracture signs.'
  },
  {
    name: 'Resorption',
    conceptWeights: { resorption: 3, locationExtent: 1.5, trauma: 0.5, cervicalResorption: 1 },
    comboBonus: [['resorption', 'locationExtent']],
    threshold: 3,
    title: 'This scenario aligns with CBCT literature for localization and extent assessment.',
    text: 'AAE/AAOMR guidance discusses CBCT for localizing and differentiating internal and external resorptive defects and for understanding treatment-planning context. ADA/AAOMR responsible-use principles still apply: use the smallest field and lowest exposure that answer the clinical question.'
  },
  {
    name: 'Missed anatomy or retreatment evaluation',
    conceptWeights: { priorEndo: 1.5, missedAnatomy: 2.5, retreatment: 2, complications: 1.5, calcifiedCanal: 1 },
    comboBonus: [['priorEndo', 'missedAnatomy'], ['retreatment', 'missedAnatomy'], ['retreatment', 'complications']],
    threshold: 3,
    title: 'This scenario aligns with literature-supported context for retreatment or anatomy clarification.',
    text: 'This wording suggests a retreatment or anatomy-clarification question, such as missed canal anatomy, calcification, perforation, or separated instrument context. CBCT information is framed here as literature-alignment context only and still requires clinical correlation and responsible-use selection.'
  },
  {
    name: 'Implant planning',
    conceptWeights: { implantPlanning: 2.5, anatomicRisk: 2, measurementNeed: 1.5, inconclusive2d: 0.5 },
    comboBonus: [['implantPlanning', 'anatomicRisk'], ['implantPlanning', 'measurementNeed']],
    threshold: 3,
    title: 'This scenario aligns with three-dimensional anatomic assessment considerations.',
    text: 'AAE/AAOMR endodontic guidance includes surgical implant placement as an indication, and ADA/AAOMR patient-selection guidance addresses CBCT as a 3D modality when anatomy, risk awareness, and planning context call for information not available from 2D imaging.'
  },
  {
    name: 'Trauma',
    conceptWeights: { trauma: 2.5, rootFracture: 1.5, displacement: 1, resorption: 0.5 },
    comboBonus: [['trauma', 'rootFracture'], ['trauma', 'resorption']],
    threshold: 2.5,
    title: 'This scenario may align with localized dentoalveolar trauma imaging considerations.',
    text: 'AAE/AAOMR guidance discusses limited-FOV CBCT in localized dentoalveolar trauma contexts, including root fractures, luxation, displacement, or localized alveolar fracture, when additional anatomic information may affect patient-care context.'
  },
  {
    name: 'Sinus or odontogenic source',
    conceptWeights: { sinusQuestion: 2, periapicalFinding: 1.5, sinusTract: 1.5, priorEndo: 0.5 },
    comboBonus: [['sinusQuestion', 'periapicalFinding'], ['sinusQuestion', 'priorEndo']],
    threshold: 2.5,
    title: 'This scenario aligns with tooth-sinus relationship review considerations.',
    text: 'When 2D imaging cannot show the relationship between maxillary roots, periapical findings, cortical boundaries, and the sinus floor, limited-FOV CBCT may provide localization context. Findings still require clinical history, full image interpretation, and referral when the pattern is not odontogenic.'
  },
  {
    name: 'Impacted or ectopic tooth position',
    conceptWeights: { impaction: 2.5, ectopicEruption: 2, anatomicRisk: 1.5, inconclusive2d: 1 },
    comboBonus: [['impaction', 'anatomicRisk'], ['ectopicEruption', 'inconclusive2d']],
    threshold: 2.5,
    title: 'This scenario aligns with literature-supported context for impacted or ectopic tooth localization.',
    text: 'This wording suggests an impacted or ectopic eruption localization question, such as root proximity or unclear position on 2D imaging. The guide frames this as evidence-informed context and does not determine whether imaging is required.'
  },
  {
    name: 'Airway screening',
    conceptWeights: { airway: 2.5, measurementNeed: 0.5 },
    comboBonus: [],
    threshold: 2.5,
    title: 'Airway language alone does not create a routine CBCT screening indication.',
    text: 'Airway volume can be viewed on CBCT, but ADA/AAOMR responsible-use guidance centers clinical benefit, radiation risk, and patient selection. CBCT context is strongest when the 3D information is needed for a defined dental or airway-related clinical question.'
  }
];

const shorthandExpansions = [
  { pattern: /\bparl\b/, phrase: ' periapical radiolucency periapical finding ' },
  { pattern: /\bpa\b/, phrase: ' periapical radiograph two dimensional imaging ' },
  { pattern: /\bpano\b|\bpan\b|\bpanoramic\b/, phrase: ' panoramic radiograph two dimensional imaging ' },
  { pattern: /\brct\b|\bnsrct\b|\bendo tx\b|\broot canal\b/, phrase: ' prior endodontic treatment root canal treatment ' },
  { pattern: /\bretreat\b|\bretx\b|\bretreatment\b/, phrase: ' retreatment evaluation previously treated tooth ' },
  { pattern: /\bvrf\b/, phrase: ' vertical root fracture concern ' },
  { pattern: /\bj[- ]?shaped\b|\bj shaped lesion\b/, phrase: ' j shaped lesion vertical root fracture concern ' },
  { pattern: /\bttp\b|\btender to percussion\b|\bpercussion\b/, phrase: ' tender to percussion persistent symptoms ' },
  { pattern: /\bbite test\b|\bpain on biting\b|\bbite\b/, phrase: ' pain on biting biting pain ' },
  { pattern: /\bcold test\b|\bcold\b|\bept\b|\belectric pulp\b/, phrase: ' pulp testing sensibility testing ' },
  { pattern: /\bsap\b/, phrase: ' symptomatic apical periodontitis percussion tenderness periapical symptoms ' },
  { pattern: /\baap\b/, phrase: ' asymptomatic apical periodontitis periapical finding ' },
  { pattern: /\bsip\b/, phrase: ' symptomatic irreversible pulpitis pulp testing pain symptoms ' },
  { pattern: /\bnecrotic\b|\bnecrosis\b|\bnecrotic pulp\b/, phrase: ' necrotic pulp endodontic diagnosis context ' },
  { pattern: /\bmb2\b|\bmissed canal\b|\bmissed anatomy\b|\bextra canal\b/, phrase: ' missed canal missed anatomy endodontic anatomy question ' },
  { pattern: /\bcalcified canal\b|\bcalcification\b|\bcalcified\b/, phrase: ' calcified canal canal calcification endodontic anatomy question ' },
  { pattern: /\bperf\b|\bperforation\b|\bperforated\b/, phrase: ' perforation endodontic complication ' },
  { pattern: /\bseparated file\b|\bsep file\b|\bbroken file\b|\bseparated instrument\b/, phrase: ' separated file endodontic complication ' },
  { pattern: /\binternal resorption\b|\binternal resorp\b/, phrase: ' internal resorption resorption location extent ' },
  { pattern: /\bexternal resorption\b|\bexternal resorp\b/, phrase: ' external resorption resorption location extent ' },
  { pattern: /\bcervical resorption\b|\becr\b|\bexternal cervical\b/, phrase: ' cervical resorption external cervical resorption location extent ' },
  { pattern: /\bsinus tract\b|\bdraining sinus\b|\bparulis\b|\bfistula\b/, phrase: ' sinus tract draining sinus periapical finding ' },
  { pattern: /\bimplant site\b|\bimplant consult\b|\bimplant planning\b|\bimplant\b/, phrase: ' implant planning implant site assessment ' },
  { pattern: /\bimpacted tooth\b|\bimpacted canine\b|\bimpaction\b|\bimpacted\b/, phrase: ' impacted tooth impaction localization ' },
  { pattern: /\bectopic eruption\b|\bectopic\b/, phrase: ' ectopic eruption localization ' },
  { pattern: /\bian\b|\binferior alveolar nerve\b|\bmental foramen\b|\bnerve\b/, phrase: ' inferior alveolar nerve anatomic risk ' }
];

const conceptPatterns = {
  priorEndo: /\b(prior endodontic|previously treated|root canal treatment|after endodontic|following endodontic|rct)\b/,
  persistentSymptoms: /\b(persistent|still|nonhealing|not healing|failed|symptoms|pain|tender to percussion|periapical symptoms)\b/,
  inconclusive2d: /\b(inconclusive|unclear|not clear|cannot see|two dimensional imaging|periapical radiograph|panoramic radiograph|2d)\b/,
  periapicalFinding: /\b(periapical radiolucency|periapical finding|parl|lesion|radiolucency|apical periodontitis)\b/,
  nonspecificSymptoms: /\b(cannot localize|hard to localize|nonspecific|contradictory|unclear pain|referred pain)\b/,
  pulpTesting: /\b(pulp testing|sensibility testing|cold test|electric pulp|ept|irreversible pulpitis)\b/,
  percussionTenderness: /\b(tender to percussion|percussion tenderness|ttp|percussion)\b/,
  pulpNecrosis: /\b(necrotic pulp|necrotic|necrosis)\b/,
  verticalRootFracture: /\b(vertical root fracture|vrf|fracture concern|crack|cracked|root fracture)\b/,
  bitingPain: /\b(pain on biting|biting pain|bite test)\b/,
  isolatedProbing: /\b(isolated probing|isolated pocket|narrow pocket|probing defect|9mm pocket|deep pocket)\b/,
  crownOrPost: /\b(crown|post|core)\b/,
  jShapedLesion: /\b(j shaped lesion|j-shaped lesion|halo)\b/,
  resorption: /\b(resorption|resorp|internal resorption|external resorption|cervical resorption|ecr)\b/,
  cervicalResorption: /\b(cervical resorption|external cervical|ecr)\b/,
  locationExtent: /\b(location|extent|localize|localization|determine|map|how far|size)\b/,
  missedAnatomy: /\b(missed canal|missed anatomy|mb2|extra canal|endodontic anatomy question)\b/,
  retreatment: /\b(retreatment|retreat|retx|retreatment evaluation)\b/,
  complications: /\b(perforation|perforated|separated file|separated instrument|broken file|endodontic complication)\b/,
  calcifiedCanal: /\b(calcified canal|canal calcification|calcified)\b/,
  implantPlanning: /\b(implant planning|implant site|implant consult|implant)\b/,
  anatomicRisk: /\b(anatomic risk|inferior alveolar nerve|ian|mental foramen|nerve|sinus floor|root proximity|proximity)\b/,
  measurementNeed: /\b(measure|measurement|width|height|ridge width|ridge|location)\b/,
  trauma: /\b(trauma|trauma history|trauma hx|luxation|avulsion|alveolar fracture)\b/,
  rootFracture: /\b(root fracture|horizontal root fracture|alveolar fracture)\b/,
  displacement: /\b(displacement|luxation|avulsion)\b/,
  sinusQuestion: /\b(sinus|maxillary sinus|odontogenic sinusitis|mucosal thickening|tooth sinus)\b/,
  sinusTract: /\b(sinus tract|draining sinus|parulis|fistula)\b/,
  impaction: /\b(impacted tooth|impacted canine|impaction|impacted)\b/,
  ectopicEruption: /\b(ectopic eruption|ectopic)\b/,
  airway: /\b(airway|sleep apnea|osa|snoring)\b/
};

const guideTestExamples = [
  { note: '#14 RCT 4 wks ago, still TTP, PA inconclusive, PARL?', expected: ['Persistent or nonhealing endodontic symptoms'] },
  { note: '#30 crown, pain on biting, isolated 9mm pocket, VRF?', expected: ['Suspected vertical root fracture'] },
  { note: '#19 prior RCT, possible missed MB2, retreat eval', expected: ['Missed anatomy or retreatment evaluation'] },
  { note: '#8 trauma hx, ECR? need extent/location', expected: ['Resorption'] },
  { note: 'Implant consult #30, need ridge width and IAN location', expected: ['Implant planning'] },
  { note: '#11 impacted canine, root proximity unclear on pano', expected: ['Impacted or ectopic tooth position'] }
];

const cdtCodeReferences = {
  limited: {
    label: 'Limited or localized field of view',
    codes: ['D0364']
  },
  mandibular: {
    label: 'Mandibular arch field of view',
    codes: ['D0365', 'D0381']
  },
  maxillary: {
    label: 'Maxillary arch field of view',
    codes: ['D0366', 'D0382']
  },
  bothJaws: {
    label: 'Both jaws or large field of view',
    codes: ['D0367', 'D0383']
  },
  tmj: {
    label: 'TMJ series or two or more exposures',
    codes: ['D0368', 'D0384']
  }
};

const cdtFieldOfViewPatterns = [
  { key: 'tmj', pattern: /\b(tmj|temporomandibular|two or more exposures|2 exposures|series)\b/ },
  { key: 'bothJaws', pattern: /\b(both jaws|both arches|large fov|large field|full mouth|mandible and maxilla|maxilla and mandible|with cranium)\b/ },
  { key: 'mandibular', pattern: /\b(mandibular arch|mandible|mandibular|lower arch|lower jaw)\b/ },
  { key: 'maxillary', pattern: /\b(maxillary arch|maxilla|maxillary|upper arch|upper jaw|with or without cranium)\b/ },
  { key: 'limited', pattern: /\b(limited fov|limited field|localized|localised|small fov|small field|single tooth|focused field|less than one whole jaw|quadrant|localized area|local area)\b/ }
];

function normalizeScenarioText(text) {
  const base = ` ${text.toLowerCase().replace(/[?#,;:()/]/g, ' ')} `;
  const expansions = shorthandExpansions
    .filter(rule => rule.pattern.test(base))
    .map(rule => rule.phrase)
    .join(' ');

  return `${base} ${expansions}`.replace(/\s+/g, ' ').trim();
}

function conceptsFromText(normalizedText) {
  return Object.entries(conceptPatterns).reduce((found, [concept, pattern]) => {
    if (pattern.test(normalizedText)) {
      found.add(concept);
    }
    return found;
  }, new Set());
}

function scoreScenario(scenario, concepts) {
  let score = 0;
  const matchedConcepts = [];

  Object.entries(scenario.conceptWeights).forEach(([concept, weight]) => {
    if (concepts.has(concept)) {
      score += weight;
      matchedConcepts.push(concept);
    }
  });

  scenario.comboBonus.forEach(combo => {
    if (combo.every(concept => concepts.has(concept))) {
      score += 1;
    }
  });

  return { ...scenario, score, matchedConcepts };
}

function matchScenarioText(text) {
  const normalizedText = normalizeScenarioText(text);
  const concepts = conceptsFromText(normalizedText);

  return scenarios
    .map(scenario => scoreScenario(scenario, concepts))
    .filter(match => match.score >= match.threshold)
    .sort((a, b) => b.score - a.score);
}

function cdtReferencesForScenario(text) {
  const normalizedText = normalizeScenarioText(text);
  return cdtFieldOfViewPatterns
    .filter(item => item.pattern.test(normalizedText))
    .map(item => cdtCodeReferences[item.key]);
}

function renderCdtScenarioReference(target, text) {
  const cdtMatches = cdtReferencesForScenario(text);

  target.hidden = true;
  target.innerHTML = '';

  if (!cdtMatches.length) {
    return;
  }

  const codeGroups = cdtMatches.map(match => `
    <div>
      <span>${match.label}</span>
      <strong>${match.codes.join(' or ')}</strong>
    </div>
  `).join('');

  target.innerHTML = `
    <h4>CDT codes often reviewed for this scan type</h4>
    ${codeGroups}
    <p>Reference only. Confirm code selection using current CDT guidance, payer policy, documentation requirements, and the procedure actually performed.</p>
  `;
  target.hidden = false;
}

function runGuideSelfTests() {
  return guideTestExamples.map(test => {
    const matches = matchScenarioText(test.note).map(match => match.name);
    return {
      note: test.note,
      matches,
      passed: test.expected.every(expected => matches.includes(expected))
    };
  });
}

function activeServices() {
  return Array.from(document.querySelectorAll('[data-service]:checked')).map(input => input.dataset.service);
}

function serviceEnabled(item, services) {
  if (!item.services.length) return true;
  return item.services.some(service => services.includes(service));
}

function procedureCaps() {
  return {
    endo: Math.max(0, Number(document.querySelector('[data-procedure="endo"]').value) || 0),
    implants: Math.max(0, Number(document.querySelector('[data-procedure="implants"]').value) || 0),
    airway: Math.max(0, Number(document.querySelector('[data-procedure="airway"]').value) || 0),
    ortho: Math.max(0, Number(document.querySelector('[data-procedure="ortho"]').value) || 0)
  };
}

function updateCalculator() {
  const services = activeServices();
  const caps = procedureCaps();
  const rows = Array.from(document.querySelectorAll('[data-case]'));
  const entries = [];
  const groupRawTotals = {};
  const groupFinalTotals = {};
  let potentialProjected = 0;
  let planImpact = 0;
  let diagnosisImpact = 0;
  let top = { label: '-', value: 0 };

  rows.forEach(input => {
    const key = input.dataset.case;
    const count = Math.max(0, Number(input.value) || 0);
    const item = indicationWeights[key];
    const enabled = serviceEnabled(item, services);
    const potentialRaw = count * item.scanFactor;
    const raw = enabled ? count * item.scanFactor : 0;

    potentialProjected += potentialRaw;
    groupRawTotals[item.group] = (groupRawTotals[item.group] || 0) + raw;
    entries.push({ item, count, raw, enabled });
  });

  const groupScales = {};
  Object.keys(groupRawTotals).forEach(group => {
    const total = groupRawTotals[group];
    const cap = caps[group];
    const roundedGroupTotal = Math.ceil(total);
    const finalGroupTotal = cap > 0 ? Math.min(roundedGroupTotal, cap) : 0;

    groupFinalTotals[group] = finalGroupTotal;
    groupScales[group] = total > 0 ? finalGroupTotal / total : 0;
  });

  let projected = 0;
  entries.forEach(entry => {
    const adjusted = entry.raw * groupScales[entry.item.group];
    planImpact += adjusted * entry.item.planRate;
    diagnosisImpact += adjusted * entry.item.diagnosisRate;

    if (adjusted > top.value) {
      top = { label: entry.item.label, value: adjusted };
    }
  });

  projected = Object.values(groupFinalTotals).reduce((sum, value) => sum + value, 0);
  const monthly = projected;
  const reducedScans = Math.max(0, Math.ceil(potentialProjected) - monthly);
  const panCount = Math.max(0, Number(document.getElementById('panCount').value) || 0);
  const panFee = Math.max(0, Number(document.getElementById('panFee').value) || 0);
  const cbctFee = Math.max(0, Number(document.getElementById('cbctFee').value) || 0);
  const cbctRevenue = Math.ceil(monthly * cbctFee);
  const panRevenue = Math.ceil(panCount * panFee);

  document.getElementById('monthlyScans').textContent = monthly;
  document.getElementById('quarterScans').textContent = monthly * 3;
  document.getElementById('planImpact').textContent = Math.ceil(planImpact);
  document.getElementById('diagnosisImpact').textContent = Math.ceil(diagnosisImpact);
  document.getElementById('serviceScans').textContent = reducedScans;
  document.getElementById('topCategory').textContent = top.label;
  document.getElementById('cbctRevenue').textContent = formatCurrency(cbctRevenue);
  document.getElementById('panRevenue').textContent = formatCurrency(panRevenue);
  document.getElementById('totalRevenue').textContent = formatCurrency(cbctRevenue + panRevenue);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
}

function analyzeScenario() {
  const text = document.getElementById('scenarioInput').value;
  const matches = matchScenarioText(text);
  const title = document.getElementById('recommendationTitle');
  const body = document.getElementById('recommendationText');
  const chips = document.getElementById('matchedIndications');
  const responsible = document.getElementById('responsibleUse');
  const cdtReference = document.getElementById('cdtScenarioReference');

  chips.innerHTML = '';
  renderCdtScenarioReference(cdtReference, text);

  if (!text.trim()) {
    title.textContent = 'Enter a scenario to assess';
    body.textContent = 'Describe the patient presentation, prior treatment, exam findings, and whether 2D imaging is conclusive.';
    responsible.textContent = '';
    cdtReference.hidden = true;
    cdtReference.innerHTML = '';
    return;
  }

  if (!matches.length) {
    title.textContent = 'No specific literature-alignment signal detected';
    body.textContent = 'No specific CBCT indication language was detected in the scenario text. ADA/AAOMR guidance frames imaging around clinical need, patient selection, and whether lower-exposure options can provide the needed information.';
    responsible.textContent = 'Add context such as nonhealing endodontic treatment, suspected fracture, resorption, trauma, implant planning, or inconclusive radiographs if those details apply.';
    return;
  }

  title.textContent = matches[0].title;
  body.textContent = matches.map(match => match.text).join(' ');
  matches.forEach(match => {
    const chip = document.createElement('span');
    chip.textContent = match.name;
    chips.appendChild(chip);
  });

  responsible.textContent = 'Responsible-use reminder: document the clinical question, use limited FOV when possible, optimize exposure for the patient and indication, and interpret findings within the complete clinical context.';
}

function updateActiveTab() {
  const sections = Array.from(document.querySelectorAll('main section'));
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const current = sections.reduce((closest, section) => {
    const offset = Math.abs(section.getBoundingClientRect().top - 180);
    return offset < closest.offset ? { id: section.id, offset } : closest;
  }, { id: sections[0].id, offset: Number.POSITIVE_INFINITY });

  tabs.forEach(tab => {
    tab.classList.toggle('is-active', tab.getAttribute('href') === `#${current.id}`);
  });
}

function setupArtifactExpansion() {
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function closeAll() {
    document.querySelectorAll('.artifact-expanded').forEach(panel => {
      panel.hidden = true;
      panel.innerHTML = '';
    });
  }

  function openRow(row, detail, thumbs, pattern, frequency, appearance, check, why) {
    closeAll();
    const images = thumbs.map(thumb => {
      const img = thumb.querySelector('img');
      return `<img src="${img.getAttribute('src')}" alt="${img.getAttribute('alt')}">`;
    }).join('');

    detail.innerHTML = `
      <div class="artifact-expanded-images">${images}</div>
      <div class="artifact-expanded-copy">
        <h3>${pattern}</h3>
        <p><strong>How common?</strong> ${frequency}</p>
        <p><strong>Typical appearance:</strong> ${appearance}</p>
        ${why ? `<p><strong>Why it happens:</strong> ${why}</p>` : ''}
        <p><strong>How to check it:</strong> ${check}</p>
      </div>
    `;
    detail.hidden = false;
  }

  document.querySelectorAll('[data-artifact-row]').forEach(row => {
    const thumbs = Array.from(row.querySelectorAll('.artifact-thumb'));
    const detail = row.querySelector('.artifact-expanded');
    const cells = Array.from(row.children).filter(child => child.tagName === 'SPAN');
    const pattern = row.dataset.pattern || cells[1]?.textContent.trim() || 'Artifact';
    const frequency = row.dataset.frequency || 'Varies';
    const why = row.dataset.why || '';
    const appearance = cells[2]?.textContent.trim() || '';
    const check = cells[3]?.textContent.trim() || '';

    if (supportsHover) {
      thumbs.forEach(button => {
        button.addEventListener('mouseenter', () => {
          openRow(row, detail, thumbs, pattern, frequency, appearance, check, why);
        });
        button.addEventListener('mouseleave', () => {
          detail.hidden = true;
          detail.innerHTML = '';
        });
        button.addEventListener('click', event => {
          event.preventDefault();
        });
      });
    } else {
      thumbs.forEach(button => {
        button.addEventListener('click', () => {
        const alreadyOpen = !detail.hidden;
        closeAll();

        if (alreadyOpen) {
          return;
        }

          openRow(row, detail, thumbs, pattern, frequency, appearance, check, why);
        });
      });
    }
  });
}

if (typeof window !== 'undefined') {
  window.cbctGuideSelfTestResults = runGuideSelfTests();
}

document.querySelectorAll('[data-case], [data-service], [data-procedure], #panCount, #panFee, #cbctFee').forEach(input => {
  input.addEventListener('input', updateCalculator);
  input.addEventListener('change', updateCalculator);
});

document.getElementById('analyzeScenario').addEventListener('click', analyzeScenario);
document.getElementById('clearScenario').addEventListener('click', () => {
  document.getElementById('scenarioInput').value = '';
  analyzeScenario();
});

document.addEventListener('scroll', updateActiveTab, { passive: true });
window.addEventListener('resize', updateActiveTab);

updateCalculator();
analyzeScenario();
updateActiveTab();
setupArtifactExpansion();

