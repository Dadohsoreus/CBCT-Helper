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
    terms: ['persistent', 'nonhealing', 'not healing', 'failed root canal', 'following endodontic', 'after endodontic', 'retreatment'],
    title: 'This scenario aligns with published CBCT-use considerations after inconclusive 2D imaging.',
    text: 'This wording matches the AAE/AAOMR endodontic indication for evaluating nonhealing or previously treated teeth when three-dimensional information may clarify the clinical question. ADA/AAOMR patient-selection guidance still centers the clinical exam first and frames CBCT as a modality to consider when lower-exposure imaging will not provide the needed information.'
  },
  {
    name: 'Contradictory or nonspecific signs and symptoms',
    terms: ['cannot localize', 'hard to localize', 'nonspecific', 'contradictory', 'unclear pain', 'referred pain'],
    title: 'This scenario may align with limited-FOV CBCT considerations after initial imaging.',
    text: 'AAE/AAOMR guidance identifies contradictory or nonspecific clinical signs and symptoms associated with untreated or previously treated teeth as a context where limited-FOV CBCT may be considered. Field of view, exposure, and expected information gain remain clinician-specific decisions.'
  },
  {
    name: 'Suspected vertical root fracture',
    terms: ['vertical root fracture', 'vrf', 'crack', 'cracked', 'isolated probing', 'j shaped', 'halo'],
    title: 'This scenario aligns with published considerations for inconclusive fracture assessment.',
    text: 'AAE/AAOMR guidance discusses limited-FOV CBCT when the clinical exam and 2D radiography are inconclusive for suspected vertical root fracture. Interpretation calls for caution near posts, crowns, and root filling materials because artifacts can mimic or obscure fracture signs.'
  },
  {
    name: 'Resorption',
    terms: ['resorption', 'ecr', 'external cervical', 'internal resorption', 'external resorption'],
    title: 'This scenario aligns with CBCT literature for localization and extent assessment.',
    text: 'AAE/AAOMR guidance discusses CBCT for localizing and differentiating internal and external resorptive defects and for understanding treatment-planning context. ADA/AAOMR responsible-use principles still apply: use the smallest field and lowest exposure that answer the clinical question.'
  },
  {
    name: 'Implant planning',
    terms: ['implant', 'ridge', 'sinus lift', 'nerve', 'inferior alveolar', 'mental foramen'],
    title: 'This scenario aligns with three-dimensional anatomic assessment considerations.',
    text: 'AAE/AAOMR endodontic guidance includes surgical implant placement as an indication, and ADA/AAOMR patient-selection guidance addresses CBCT as a 3D modality when anatomy, risk awareness, and planning context call for information not available from 2D imaging.'
  },
  {
    name: 'Trauma',
    terms: ['trauma', 'luxation', 'avulsion', 'alveolar fracture', 'root fracture', 'displacement'],
    title: 'This scenario may align with localized dentoalveolar trauma imaging considerations.',
    text: 'AAE/AAOMR guidance discusses limited-FOV CBCT in localized dentoalveolar trauma contexts, including root fractures, luxation, displacement, or localized alveolar fracture, when additional anatomic information may affect patient-care context.'
  },
  {
    name: 'Sinus or odontogenic source',
    terms: ['sinus', 'mucosal thickening', 'odontogenic sinusitis', 'maxillary sinus'],
    title: 'This scenario aligns with tooth-sinus relationship review considerations.',
    text: 'When 2D imaging cannot show the relationship between maxillary roots, periapical findings, cortical boundaries, and the sinus floor, limited-FOV CBCT may provide localization context. Findings still require clinical history, full image interpretation, and referral when the pattern is not odontogenic.'
  },
  {
    name: 'Airway screening',
    terms: ['airway', 'sleep apnea', 'osa', 'snoring'],
    title: 'Airway language alone does not create a routine CBCT screening indication.',
    text: 'Airway volume can be viewed on CBCT, but ADA/AAOMR responsible-use guidance centers clinical benefit, radiation risk, and patient selection. CBCT context is strongest when the 3D information is needed for a defined dental or airway-related clinical question.'
  }
];

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
