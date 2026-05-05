const indicationWeights = {
  pain: { label: 'Nonspecific symptoms', weight: 0.85, services: ['endo'], impact: 0.21 },
  nonhealing: { label: 'Nonhealing endodontic treatment', weight: 0.95, services: ['endo'], impact: 0.69 },
  fracture: { label: 'Suspected vertical root fracture', weight: 0.75, services: ['endo'], impact: 0.62 },
  resorption: { label: 'Resorption', weight: 0.9, services: ['endo'], impact: 0.69 },
  retreatment: { label: 'Retreatment complication', weight: 0.8, services: ['endo'], impact: 0.69 },
  surgery: { label: 'Endodontic surgery planning', weight: 0.92, services: ['endo', 'surgery'], impact: 0.69 },
  implant: { label: 'Implant planning', weight: 0.95, services: ['implants', 'surgery'], impact: 0.69 },
  airway: { label: 'Airway screening', weight: 0.35, services: ['airway'], impact: 0.21 },
  sinus: { label: 'Odontogenic sinus question', weight: 0.7, services: ['endo', 'surgery'], impact: 0.35 },
  impaction: { label: 'Impacted tooth', weight: 0.75, services: ['ortho', 'surgery'], impact: 0.52 }
};

const procedureModel = {
  endo: { label: 'Endodontics', rate: 0.22, services: ['endo'], impact: 0.69 },
  implants: { label: 'Implants', rate: 0.7, services: ['implants'], impact: 0.69 },
  airway: { label: 'Airway', rate: 0.18, services: ['airway'], impact: 0.21 },
  ortho: { label: 'Ortho or surgery', rate: 0.28, services: ['ortho', 'surgery'], impact: 0.52 }
};

const scenarios = [
  {
    name: 'Persistent or nonhealing endodontic symptoms',
    terms: ['persistent', 'nonhealing', 'not healing', 'failed root canal', 'following endodontic', 'after endodontic', 'retreatment'],
    title: 'CBCT is strongly supported when 2D imaging and exam are inconclusive.',
    text: 'This scenario matches the AAE/AAOMR endodontic indication for evaluating nonhealing or previously treated teeth when the result will guide nonsurgical retreatment, surgery, or extraction. ADA/AAOMR patient-selection guidance still expects a clinical exam first and supports CBCT when lower-exposure imaging will not answer the diagnostic question.'
  },
  {
    name: 'Contradictory or nonspecific signs and symptoms',
    terms: ['cannot localize', 'hard to localize', 'nonspecific', 'contradictory', 'unclear pain', 'referred pain'],
    title: 'CBCT can be appropriate after the initial exam and 2D radiographs.',
    text: 'AAE/AAOMR guidance identifies limited-FOV CBCT as useful for contradictory or nonspecific clinical signs and symptoms associated with untreated or previously treated teeth. The scan should be limited to the region of interest and justified by the expected diagnostic benefit.'
  },
  {
    name: 'Suspected vertical root fracture',
    terms: ['vertical root fracture', 'vrf', 'crack', 'cracked', 'isolated probing', 'j shaped', 'halo'],
    title: 'CBCT is reasonable when conventional findings are inconclusive.',
    text: 'AAE/AAOMR guidance supports limited-FOV CBCT when exam and 2D radiography are inconclusive for vertical root fracture. Interpret cautiously near posts, crowns, and root filling materials because artifacts can mimic or obscure fracture signs.'
  },
  {
    name: 'Resorption',
    terms: ['resorption', 'ecr', 'external cervical', 'internal resorption', 'external resorption'],
    title: 'CBCT is commonly the modality of choice for localization and extent.',
    text: 'AAE/AAOMR guidance supports CBCT for localizing and differentiating internal and external resorptive defects and for determining treatment and prognosis. ADA/AAOMR responsible-use principles still apply: use the smallest field and lowest exposure that answer the question.'
  },
  {
    name: 'Implant planning',
    terms: ['implant', 'ridge', 'sinus lift', 'nerve', 'inferior alveolar', 'mental foramen'],
    title: 'CBCT is usually appropriate for implant site planning.',
    text: 'AAE/AAOMR endodontic recommendations include surgical implant placement as an indication, and ADA/AAOMR patient-selection guidance addresses CBCT as a 3D modality when anatomy, risk, and treatment planning require information not available from 2D imaging.'
  },
  {
    name: 'Trauma',
    terms: ['trauma', 'luxation', 'avulsion', 'alveolar fracture', 'root fracture', 'displacement'],
    title: 'CBCT may be indicated for localized dentoalveolar trauma.',
    text: 'AAE/AAOMR guidance supports limited-FOV CBCT for diagnosis and management of limited dentoalveolar trauma, including root fractures, luxation, displacement, or localized alveolar fracture, when it affects management.'
  },
  {
    name: 'Sinus or odontogenic source',
    terms: ['sinus', 'mucosal thickening', 'odontogenic sinusitis', 'maxillary sinus'],
    title: 'CBCT can help determine whether the sinus finding is dental in origin.',
    text: 'When 2D imaging cannot show the relationship between maxillary roots, periapical disease, cortical boundaries, and the sinus floor, limited-FOV CBCT may provide clinically necessary localization. Interpret with the clinical history and refer medical sinus disease when findings are not odontogenic.'
  },
  {
    name: 'Airway screening',
    terms: ['airway', 'sleep apnea', 'osa', 'snoring'],
    title: 'CBCT is not a routine screening test by itself.',
    text: 'Airway volume can be viewed on CBCT, but ADA/AAOMR responsible-use guidance requires a clear clinical benefit that outweighs radiation risk. Use CBCT only when the 3D information is needed for a defined dental or airway-related management question.'
  }
];

function activeServices() {
  return Array.from(document.querySelectorAll('[data-service]:checked')).map(input => input.dataset.service);
}

function serviceMultiplier(item, services) {
  if (!item.services.length) return 1;
  return item.services.some(service => services.includes(service)) ? 1 : 0.18;
}

function updateCalculator() {
  const services = activeServices();
  const rows = Array.from(document.querySelectorAll('[data-case]'));
  let projected = 0;
  let serviceProjected = 0;
  let planImpact = 0;
  let diagnosisImpact = 0;
  let top = { label: '-', value: 0 };

  rows.forEach(input => {
    const key = input.dataset.case;
    const count = Math.max(0, Number(input.value) || 0);
    const item = indicationWeights[key];
    const adjusted = count * item.weight * serviceMultiplier(item, services);
    projected += adjusted;
    planImpact += adjusted * item.impact;
    diagnosisImpact += adjusted * 0.35;

    if (adjusted > top.value) {
      top = { label: item.label, value: adjusted };
    }
  });

  Array.from(document.querySelectorAll('[data-procedure]')).forEach(input => {
    const key = input.dataset.procedure;
    const count = Math.max(0, Number(input.value) || 0);
    const item = procedureModel[key];
    const enabled = item.services.some(service => services.includes(service));
    const adjusted = enabled ? count * item.rate : 0;
    projected += adjusted;
    serviceProjected += adjusted;
    planImpact += adjusted * item.impact;
    diagnosisImpact += adjusted * 0.21;

    if (adjusted > top.value) {
      top = { label: `${item.label} volume`, value: adjusted };
    }
  });

  const monthly = Math.ceil(projected);
  const serviceMonthly = Math.ceil(serviceProjected);
  const panCount = Math.max(0, Number(document.getElementById('panCount').value) || 0);
  const panFee = Math.max(0, Number(document.getElementById('panFee').value) || 0);
  const cbctFee = Math.max(0, Number(document.getElementById('cbctFee').value) || 0);
  const cbctRevenue = Math.ceil(monthly * cbctFee);
  const panRevenue = Math.ceil(panCount * panFee);

  document.getElementById('monthlyScans').textContent = monthly;
  document.getElementById('quarterScans').textContent = Math.ceil(monthly * 3);
  document.getElementById('planImpact').textContent = Math.ceil(planImpact);
  document.getElementById('diagnosisImpact').textContent = Math.ceil(diagnosisImpact);
  document.getElementById('serviceScans').textContent = serviceMonthly;
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
  const text = document.getElementById('scenarioInput').value.toLowerCase();
  const matches = scenarios.filter(item => item.terms.some(term => text.includes(term)));
  const title = document.getElementById('recommendationTitle');
  const body = document.getElementById('recommendationText');
  const chips = document.getElementById('matchedIndications');
  const responsible = document.getElementById('responsibleUse');

  chips.innerHTML = '';

  if (!text.trim()) {
    title.textContent = 'Enter a scenario to assess';
    body.textContent = 'Describe the patient presentation, prior treatment, exam findings, and whether 2D imaging is conclusive.';
    responsible.textContent = '';
    return;
  }

  if (!matches.length) {
    title.textContent = 'Start with exam and appropriate 2D imaging';
    body.textContent = 'No specific CBCT indication was detected in the scenario text. ADA/AAOMR guidance favors imaging only when it is clinically necessary, and CBCT when lower-exposure options will not provide the diagnostic information needed.';
    responsible.textContent = 'Add details such as nonhealing endodontic treatment, suspected fracture, resorption, trauma, implant planning, or inconclusive radiographs if they apply.';
    return;
  }

  title.textContent = matches[0].title;
  body.textContent = matches.map(match => match.text).join(' ');
  matches.forEach(match => {
    const chip = document.createElement('span');
    chip.textContent = match.name;
    chips.appendChild(chip);
  });
  responsible.textContent = 'Responsible-use reminder: document the clinical question, use limited FOV when possible, optimize exposure for the patient and indication, and discuss benefits and risks with the patient.';
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
