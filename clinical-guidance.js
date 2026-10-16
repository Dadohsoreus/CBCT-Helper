/* Clinical guidance v1. Topic recognition proposes a pathway; it never authorizes imaging.
 * The ordered checks below, not the legacy text-match score, determine the displayed result.
 * Keep source locators, decision traces and clinical regression cases together when changing rules.
 */
(function (root) {
  'use strict';
  const version = '2026-10-14.4';
  const adaUrl = 'https://health.ri.gov/sites/g/files/xkgbur1006/files/2026-01/ADA-AAOMR-patient-selection.pdf';
  const sources = {
    selection: { label: 'ADA/AAOMR 2026 · Box 1, 1.2; introductory principles', url: adaUrl + '#page=5' },
    implant: { label: 'ADA/AAOMR 2026 · Box 2, 7.1.1 and 7.2.2–7.2.3', url: adaUrl + '#page=7' },
    endo: { label: 'ADA/AAOMR 2026 · Table 1, initial assessment', url: adaUrl + '#page=10' },
    retreatment: { label: 'ADA/AAOMR 2026 · Table 1, persistent disease and difficult treatment', url: adaUrl + '#page=10' },
    fracture: { label: 'ADA/AAOMR 2026 · Table 1, vertical and crown-to-root fractures', url: adaUrl + '#page=10' },
    trauma: { label: 'ADA/AAOMR 2026 · Table 1, dentoalveolar trauma; Box 1, 1.4', url: adaUrl + '#page=10' },
    impacted: { label: 'ADA/AAOMR 2026 · Box 3, 4.2; Box 2, 4.2–4.5', url: adaUrl + '#page=9' },
    extraction: { label: 'ADA/AAOMR 2026 · Box 2, 4.4–4.5 (third molars)', url: adaUrl + '#page=7' },
    sleep: { label: 'AASM 2017 · Adult OSA diagnostic testing, recommendations 1–2', url: 'https://aasm.org/resources/clinicalguidelines/diagnostic-testing-osa.pdf' },
    urgentDental: { label: 'SDCEP · Acute apical abscess, initial management', url: 'https://www.acutedentalproblems.sdcep.org.uk/guidance/management-of-oral-conditions/common-oral-conditions/acute-apical-abscess/' },
    headInjury: { label: 'NICE NG232 · Head injury, recommendations 1.2.3–1.2.4', url: 'https://www.nice.org.uk/guidance/ng232/chapter/recommendations#pre-hospital-assessment-advice-and-referral-to-hospital' }
  };
  // These short summaries describe recommendations, not individual study success rates.
  const topics = {
    implant: { label: 'Presurgical implant planning', source: 'implant', summary: 'CBCT is recommended for presurgical implant planning and assessment of bone and nearby structures.', question: 'What implant-site information is needed?', goal: ['measurementNeed', 'anatomicRisk', 'surgicalPlanningNeed'], family: 'implant' },
    resorption: { label: 'Tooth root resorption', source: 'endo', summary: 'Consider CBCT for root resorption after examination and review of 2D images.', question: 'What remains uncertain about the resorption?', goal: ['locationExtent', 'perforationConcern'], family: 'endo' },
    retreatment: { label: 'Missed canals or retreatment', source: 'retreatment', summary: 'CBCT can assess persistent disease, canal anatomy and treatment complications.', question: 'What canal, complication or retreatment question remains?', goal: ['missedAnatomy', 'complications', 'calcifiedCanal', 'perforationConcern', 'locationExtent'], family: 'endo' },
    nonhealing: { label: 'Persistent symptoms after endodontic treatment', source: 'retreatment', summary: 'Consider CBCT to investigate persistent disease after endodontic treatment.', question: 'What unresolved finding needs investigation?', goal: ['inconclusive2d', 'sourceUnclear', 'periapicalFinding', 'nonhealingLesion'], family: 'endo' },
    unclear: { label: 'Unclear tooth-related signs or symptoms', source: 'endo', summary: 'Consider CBCT for contradictory or nonspecific findings after initial assessment.', question: 'What remains unexplained after examination and 2D imaging?', goal: ['inconclusive2d', 'sourceUnclear', 'conflictingPulpTests'], family: 'endo' },
    fracture: { label: 'Suspected root fracture', source: 'fracture', summary: 'CBCT can help when examination and intraoral images leave suspected root fracture unresolved.', question: 'Which fracture question remains after examination and intraoral images?', goal: ['inconclusive2d', 'verticalRootFracture', 'rootFracture'], family: 'endo' },
    cracked: { label: 'Cracked tooth or structural tooth pain', source: 'fracture', summary: 'Cracked-tooth wording alone does not establish a root-fracture imaging indication.', question: 'Is the question about a crown crack, a root fracture, or surrounding bone?', goal: [], family: 'endo' },
    surgery: { label: 'Endodontic surgery planning', source: 'retreatment', summary: 'CBCT can clarify lesion extent and adjacent anatomy for endodontic surgery.', question: 'Which root-end or nearby anatomical relationship needs clarification?', goal: ['locationExtent', 'anatomicRisk', 'measurementNeed'], family: 'endo' },
    trauma: { label: 'Localized dental trauma', source: 'trauma', summary: 'CBCT can characterize dentoalveolar injury inadequately assessed on 2D images.', question: 'What current dental injury or anatomical uncertainty needs assessment?', goal: ['rootFracture', 'alveolarFracture', 'displacement', 'inconclusive2d'], family: 'endo' },
    sinus: { label: 'Possible endodontic source of sinusitis', source: 'endo', summary: 'Consider CBCT when sinusitis of endodontic origin is suspected.', question: 'What findings suggest a dental source for the sinus symptoms?', goal: ['periapicalFinding', 'priorEndo', 'inconclusive2d'], family: 'endo' },
    impacted: { label: 'Impacted or ectopic tooth localization', source: 'impacted', summary: 'Consider CBCT when 2D imaging does not adequately localize an impacted tooth.', question: 'Which tooth-position or adjacent-root relationship is unresolved?', goal: ['anatomicRisk', 'rootResorptionRisk', 'inconclusive2d', 'locationExtent'], family: 'extraction' },
    extraction: { label: 'Third-molar anatomical risk', source: 'extraction', summary: 'Consider CBCT for third-molar nerve risk when findings could affect care.', question: 'Which panoramic finding raises concern about the mandibular canal?', goal: ['anatomicRisk', 'inconclusive2d'], family: 'extraction' }
  };

  // Workflow purposes, not additional clinical indications. Labels also populate the form.
  const reasons = {
    diagnosis: { label: 'Understand the cause of symptoms or unclear findings', effect: 'benefit', help: 'Identify what remains unexplained after the examination and 2D X-rays. Needing more information alone does not establish a CBCT indication.' },
    extent: { label: 'Locate a problem or determine its extent', effect: 'benefit', help: 'Describe the suspected problem and the location or extent that remains uncertain.' },
    treatment: { label: 'Choose treatment or decide whether to keep a tooth', effect: 'benefit', help: 'Examples include treatment versus observation, retreatment versus surgery, or retaining versus extracting a tooth. The description must identify what information could change that decision.' },
    implant_planning: { label: 'Plan implant placement', effect: 'benefit', help: 'The description must identify implant planning and the site measurements or anatomical relationship needed. Unexplained tooth pain alone does not establish an implant-planning question.' },
    procedure_planning: { label: 'Plan another treatment procedure', effect: 'benefit', help: 'Name the proposed procedure, such as root canal treatment, retreatment, root-end surgery or extraction, and the specific information needed to plan it. A previous procedure or a generic wish for more information is not enough.' },
    risk: { label: 'Assess risk to nerves, roots or nearby structures', effect: 'benefit', help: 'Identify the structure at risk and how knowing its relationship could change the procedure or referral.' },
    complication: { label: 'Investigate a suspected treatment complication', effect: 'benefit', help: 'Describe the suspected complication and relevant findings. The case must fit a covered clinical pathway; this choice does not establish that a complication exists.' },
    referral: { label: 'Decide who to refer to or what the referral needs', effect: 'clarify', help: 'A CBCT is not automatically needed before referral. The receiving clinician may be best placed to select imaging and avoid duplicate scans.' },
    healing: { label: 'Investigate symptoms or concerns during healing', effect: 'benefit', help: 'Describe the persistent symptoms or abnormal healing findings and the question left by 2D images. Routine follow-up alone does not justify another CBCT.' },
    screening: { label: 'Routine screening or a baseline scan', effect: 'unsupported', help: 'Routine CBCT screening or baseline imaging without an individual clinical need does not support a scan.' },
    reassurance: { label: 'Patient request, reassurance or explaining findings', effect: 'unsupported', help: 'These reasons alone do not establish a clinical benefit that justifies radiation exposure. Use existing findings for discussion; assess a separate clinical question on its own.' },
    records: { label: 'Records, insurance or documentation only', effect: 'unsupported', help: 'An administrative request alone does not establish a clinical need for CBCT. Existing clinically justified images can be used for documentation.' },
    no_change: { label: 'No expected change in treatment or other care', effect: 'unsupported', help: 'If no additional diagnostic or planning information is needed and care would not change, the stated purpose does not support CBCT.' },
    other: { label: 'Another reason or not sure yet', effect: 'clarify', help: 'Add what you hope to learn and how it could change care to the case description. This option does not expand the tool’s clinical coverage.' }
  };

  // Presentation order is based on the description alone, never the selected answer.
  // All choices remain available; ordering is not a recommendation or preselection.
  function reasonOrder(topic) {
    const priority = {
      unclear: ['diagnosis', 'treatment', 'referral', 'extent', 'other'],
      cracked: ['diagnosis', 'treatment', 'referral', 'other'],
      fracture: ['diagnosis', 'extent', 'treatment', 'referral', 'other'],
      resorption: ['extent', 'treatment', 'risk', 'referral', 'other'],
      retreatment: ['complication', 'diagnosis', 'treatment', 'procedure_planning', 'referral', 'other'],
      nonhealing: ['healing', 'diagnosis', 'complication', 'treatment', 'referral', 'other'],
      sinus: ['diagnosis', 'referral', 'treatment', 'extent', 'other'],
      trauma: ['diagnosis', 'extent', 'treatment', 'referral', 'other'],
      implant: ['implant_planning', 'risk', 'extent', 'treatment', 'referral', 'other'],
      surgery: ['procedure_planning', 'risk', 'extent', 'treatment', 'referral', 'other'],
      extraction: ['procedure_planning', 'risk', 'referral', 'treatment', 'other'],
      impacted: ['extent', 'risk', 'treatment', 'referral', 'other']
    };
    const fallback = ['diagnosis', 'extent', 'treatment', 'referral', 'other', 'risk', 'complication', 'healing', 'screening', 'reassurance', 'records', 'no_change', 'procedure_planning', 'implant_planning'];
    return [...new Set([...(Object.hasOwn(priority, topic) ? priority[topic] : []), ...fallback])];
  }

  // Shared by recognition and decision checks so formatting does not change clinical meaning.
  function normalizeText(text) {
    const contractions = { "can't": 'cannot', "won't": 'will not', "wouldn't": 'would not', "couldn't": 'could not', "haven't": 'have not', "hasn't": 'has not', "hadn't": 'had not', "isn't": 'is not', "aren't": 'are not', "wasn't": 'was not', "weren't": 'were not', "don't": 'do not', "doesn't": 'does not', "didn't": 'did not' };
    return String(text || '').toLowerCase().replace(/[’‘]/g, "'").replace(/[‐‑–]/g, '-').replace(/\r\n?/g, '\n')
      .replace(/\b(?:can't|won't|wouldn't|couldn't|haven't|hasn't|hadn't|isn't|aren't|wasn't|weren't|don't|doesn't|didn't)\b/g, word => contractions[word])
      .replace(/[^\S\n]+/g, ' ').replace(/\b([23])-d\b/g, '$1d');
  }
  function prepareText(text) {
    const ignored = [];
    const value = normalizeText(text).split(/([.;\n]|\b(?:but|however|whereas)\b)/).map(clause => {
      // Only explicit family-history statements or explicitly unrelated remote history.
      // Do not discard a parent reporting a child's current symptoms or general medical history.
      if (/^\s*(?:family history(?: of|:)|(?:(?:my|their|his|her|the patient's) )?(?:mother|father|sister|brother|spouse) (?:had|has|underwent))\b/.test(clause)
          || (/\b(?:remote|past) history\b/.test(clause) && /\bunrelated to (?:this|the current)\b/.test(clause))) {
        ignored.push(clause.trim());
        return ' ';
      }
      return clause;
    }).join('');
    return { text:value, ignored };
  }

  function decide(text, analysis, answers = {}) {
    const context = prepareText(text);
    const raw = context.text;
    const c = analysis.concepts;
    const has = (...keys) => keys.some(key => c.has(key));
    const trace = [];
    const add = (label, value, origin = 'Case description') => trace.push({ label, value, origin });
    // Keep sentence boundaries and assertion checks: absent/denied terms must not create a purpose.
    const clauses = raw.split(/[.;\n]|\b(?:but|however|whereas)\b/).filter(Boolean);
    const affirmed = pattern => clauses.some(clause => [...clause.matchAll(new RegExp(pattern.source, 'g'))].some(match => {
      const before = clause.slice(0, match.index);
      const after = clause.slice(match.index + match[0].length);
      const unresolved = /\b(?:cannot|can't|not)\s+(?:rule|ruled)\s+out\s*$/.test(before);
      const negated = /\b(?:no|not|without|denies|denied|ruled out|negative for)\s+(?:[\w/-]+\s+){0,5}$/.test(before)
        || /^\s*(?:(?:is|was|are)\s+)?(?:absent|ruled out|not (?:suspected|planned|present|needed))\b/.test(after);
      return unresolved || !negated;
    }));
    const recognized = [...c].map(key => analysis.labels?.[key]).filter(Boolean);
    const denied = [...analysis.negatedConcepts].map(key => analysis.labels?.[key]).filter(Boolean);
    const reasonKey = Object.hasOwn(reasons, answers.reason) ? answers.reason : null;
    const reason = reasons[reasonKey];
    let topic = null;
    let existingCbct = false;
    const finish = (status, rule, title, explanation, options = {}) => ({
      version, status, rule, title, explanation, topic: topic ? { id: topic, ...topics[topic] } : null,
      sourceKeys: topic ? [topics[topic].source, 'selection'] : [],
      trace, recognized, denied, questions: [], clarifications: [], showFollowups: !!raw.trim(), existingCbct, reasonKey,
      ...options
    });
    if (!String(text || '').trim()) return finish('empty', 'empty', 'Add a case to begin', 'Describe one clinical question to see the guidance, the details used and anything still needed.');
    if (String(text).length > 6000) return finish('needs_details', 'length', 'Please shorten the case description', 'Use one clinical question and the relevant findings. The tool cannot reliably review a long record.', { showFollowups: false });
    if (context.ignored.length) add('Background context', 'Explicit family history or explicitly unrelated remote history was excluded from topic matching. The clinician must still consider relevant medical history.', 'Text interpretation');
    if (reason) add('Intended use of additional information', reason.label, 'Selected answer');

    // A few explicit urgent presentations stop ordinary scan guidance. This is not a triage system.
    const airwayConcern = affirmed(/\b(?:(?:difficulty|trouble) (?:breathing|swallowing)|cannot (?:breathe|swallow)|stridor|floor[- ]of[- ]mouth swelling)\b/);
    const headConcern = affirmed(/\b(?:lost consciousness|loss of consciousness|knocked out|vomiting)\b/)
      && affirmed(/\b(?:head injury|hit (?:the |his |her |their )?(?:head|face)|fall|fell|facial trauma)\b/);
    if (airwayConcern || headConcern) {
      add('Priority concern', airwayConcern ? 'Possible airway or severe infection symptoms were recognized.' : 'Possible significant head-injury symptoms were recognized.');
      return finish('outside_coverage', 'priority-assessment', 'Urgent assessment takes priority over CBCT guidance', 'The description includes symptoms that may need emergency medical assessment. Arrange appropriate urgent assessment using local emergency pathways; do not delay it to obtain a dental CBCT. This tool cannot assess urgency or choose emergency imaging.', { sourceKeys: [airwayConcern ? 'urgentDental' : 'headInjury'], showFollowups:false });
    }
    if (/\b(?:no actual patient|not (?:an? )?(?:actual |real )?patient|training example|hypothetical case)\b/.test(raw)) {
      return finish('needs_details', 'hypothetical-context', 'A patient-specific imaging question is needed', 'A hypothetical example does not establish findings in a patient. Describe the actual clinical question and relevant findings before applying the guidance.', { showFollowups:false });
    }
    if (/\b(?:fdi|palmer|primary tooth|primary teeth|baby tooth|deciduous)\b/.test(raw)) {
      return finish('needs_details', 'dentition-context', 'Confirm the tooth and dentition before applying this guidance', 'This version interprets numbered teeth using the Universal permanent-tooth system. Describe the tooth in words and confirm whether the cited guidance applies to this dentition; the tool does not convert other numbering systems or generalize permanent-tooth pathways to primary teeth.', { showFollowups:false });
    }

    const unsupported = [
      ['TMJ or non-dental facial pain', /\b(tmj|tmd|temporomandibular|condylar|condyle|trigeminal|neuralgia|migraine)\b/],
      ['Jaw lesions or broader pathology', /\b(tumou?r|cancer|malignan\w*|jaw lesion|jaw cyst|osteonecrosis|mronj|osteomyelitis)\b/],
      ['General orthodontic planning', /\b(orthodontic planning|ortho records?|cephalometric|malocclusion|facial asymmetry|mini[- ]?implant|mini[- ]?screw)\b/],
      ['Caries-specific assessment', /\b(caries detection|detect (?:decay|caries)|caries screening|cavity detection)\b/],
      ['General periodontal assessment', /\b((?<!apical )periodontitis|periodontal disease|generalized bone loss|periodontal planning)\b/],
      ['Implant follow-up or complications', /\b(peri[- ]?implantitis|implant maintenance|implant follow[- ]?up|implant complications?|existing implant|implant (?:was )?placed (?:last|yesterday|in \d|\d)|since implant placement|after implant (?:placement|surgery)|implant placement[^.;\n]{0,30}(?:last week|last month|yesterday|years? ago))\b/],
      ['Non-dental conditions', /\b(knee|elbow|abdomen|chest pain|lung|brain|hip joint)\b/]
    ].filter(([, pattern]) => affirmed(pattern)).map(([label]) => label);
    const implant = affirmed(/\b(implant planning|implant site|implant consult|presurgical implant|plan(?:ning)? (?:for |an? |dental )*implants?|implants? (?:placement|surgery|planned)|dental implant placement)\b/)
      || (has('implantPlanning') && has('measurementNeed') && !affirmed(/\b(implant maintenance|implant follow[- ]?up|peri[- ]?implantitis|existing implant)\b/));
    const surgery = affirmed(/\b(apicoectomy|apicectomy|apico|endodontic surgery|endo surgery|root[- ]?end surgery|surgery at the tip of the root)\b/);
    const extraction = has('thirdMolar') && (has('extractionPlanning', 'impaction') || affirmed(/\b(third molar|wisdom tooth|wisdom teeth)\b/));
    const impacted = has('impaction', 'ectopicEruption', 'supernumerary') && !extraction;
    const endo = has('resorption', 'cervicalResorption', 'missedAnatomy', 'retreatment', 'calcifiedCanal', 'perforationConcern', 'complications', 'verticalRootFracture', 'crackedToothPain') || surgery;
    const airway = has('airway');
    const teeth = analysis.entities.tooth_or_region.filter(item => item.startsWith('#'));
    const conflictConcepts = ['resorption', 'verticalRootFracture', 'implantPlanning', 'inconclusive2d', 'conclusive2d', 'trauma', 'retreatment', 'missedAnatomy', 'persistentSymptoms'];
    const contradictory = conflictConcepts.filter(key => c.has(key) && analysis.negatedConcepts.has(key));

    if (teeth.length > 1 || contradictory.length || (implant && (endo || extraction || impacted)) || (airway && (implant || endo || extraction || impacted))) {
      add('Unresolved context', teeth.length > 1 ? 'More than one tooth number was recognized.' : 'Conflicting statements or separate clinical purposes were recognized.');
      return finish('needs_details', 'separate-context', 'Clarify which findings belong to this question', 'The tool cannot safely combine these details into one result. Describe one question and identify its target tooth or area; distinguish past findings from current findings.', { questions: ['Which findings and imaging relate to the question being assessed?'] });
    }
    if (reason?.effect === 'unsupported') {
      const titles = { screening: 'Routine CBCT screening is not supported', reassurance: 'Patient request or reassurance alone does not support CBCT', records: 'Documentation alone does not support CBCT', no_change: 'The selected purpose does not establish an added benefit from CBCT' };
      return finish('not_supported', 'purpose-' + reasonKey, titles[reasonKey], reason.help + ' If you are assessing a separate diagnostic or treatment decision, describe it and select that purpose.', { sourceKeys: ['selection'] });
    }
    if (unsupported.length) {
      add('Coverage check', unsupported.join('; '));
      return finish('outside_coverage', 'outside-library', 'This clinical question is outside the current coverage', 'A gap in this tool’s coverage does not establish whether CBCT is appropriate. Review topic-specific guidance or seek specialist input.', { questions: ['If a separate covered dental question is intended, describe that question on its own.'] });
    }
    if (airway) {
      add('Purpose recognized', 'Airway or sleep-related question');
      if (affirmed(/\b(diagnos\w*|rule out|confirm|detect)\b/) && affirmed(/\b(sleep apn[eo]+a|osa)\b/)) {
        return finish('not_supported', 'sleep-diagnosis', 'CBCT does not diagnose obstructive sleep apnea', 'An airway image cannot establish or exclude OSA. Adult diagnostic guidance uses a sleep evaluation with polysomnography or appropriate home sleep apnea testing. A separate dental imaging question must be assessed separately.', { sourceKeys: ['sleep'], questions: ['Refer the sleep-related diagnostic question for an appropriate sleep evaluation.'] });
      }
      return finish('needs_details', 'airway-question', 'Define the dental question behind the airway request', 'Airway or snoring language alone does not establish a supported CBCT purpose in this tool. Sleep-apnea diagnosis and dental anatomical planning are different questions.', { sourceKeys: ['sleep', 'selection'], questions: ['What dental anatomical information is needed, and how would it affect care?'] });
    }

    if (implant) topic = 'implant';
    else if (surgery) topic = 'surgery';
    else if (extraction) topic = 'extraction';
    else if (impacted) topic = 'impacted';
    else if (has('resorption', 'cervicalResorption')) topic = 'resorption';
    else if (has('missedAnatomy', 'retreatment', 'calcifiedCanal', 'perforationConcern', 'complications')) topic = 'retreatment';
    else if (has('verticalRootFracture') || (has('rootFracture') && !has('trauma'))) topic = 'fracture';
    else if (has('crackedToothPain', 'structuralToothPain')) topic = 'cracked';
    else if (has('trauma')) topic = 'trauma';
    else if (has('sinusQuestion') && (has('priorEndo', 'periapicalFinding') || affirmed(/\b(odontogenic sinusitis|endodontic (?:source|origin))\b/))) topic = 'sinus';
    else if (has('nonhealingLesion', 'postEndoSymptoms') || (has('priorEndo') && has('persistentSymptoms', 'periapicalFinding', 'sinusTract'))) topic = 'nonhealing';
    else if ((has('nonspecificSymptoms', 'sourceUnclear', 'conflictingPulpTests', 'bitingPain') && (has('persistentSymptoms', 'bitingPain', 'conflictingPulpTests') || /\b(?:tooth|teeth|dental|pulp|cold|symptoms)\b/.test(raw))) || (has('persistentSymptoms') && analysis.entities.tooth_or_region.length)) topic = 'unclear';

    const routine = affirmed(/\b(routine|screening|screen|check everything|all new patients|all patients|annual cbct|yearly cbct)\b/);
    if (!topic && routine) {
      add('Purpose recognized', 'Routine screening without a separate recognized clinical question');
      return finish('not_supported', 'routine-screening', 'Routine CBCT screening is not supported', 'Patient selection should follow history, examination and an individual clinical question—not a fixed screening schedule.', { sourceKeys: ['selection'] });
    }
    if (!topic) {
      add('Coverage check', 'No covered clinical question was confidently identified.');
      return finish('needs_details', 'unrecognized', 'The clinical question is not clear enough', 'The tool could not distinguish missing details from a topic it does not cover. This is not evidence against CBCT.', { questions: ['State the tooth or area, the suspected problem and the question the images need to answer.'] });
    }
    add('Guidance topic', topics[topic].label);

    // Explicit answers can fill gaps, but contradictory text must be corrected rather than overridden.
    const imageLabels = { cbct_answers: 'Existing CBCT answers this question', cbct_unresolved: 'Existing CBCT was reviewed but leaves this question unresolved', two_d_answers: '2D images answer this question', two_d_unresolved: '2D images leave this question unresolved', cbct_review: 'Existing CBCT still needs review', none: 'No relevant 2D images are available', not_reviewed: '2D images have not yet been reviewed', reviewed: 'Relevant 2D X-rays assumed taken and reviewed; ability to answer this question is not established', unknown: '2D imaging status not established' };
    const cbctMention = /\b(cbct|cone[- ]?beam(?: ct)?(?: scan)?|3d scan)\b/;
    const cbctAdequate = clauses.some(clause => cbctMention.test(clause) && /\b(already|existing|recent|last week|from|available|prior)\b/.test(clause) && /\b(answers?|adequate|sufficient|provides? adequate)\b/.test(clause) && !/[?]|\b(not|inadequate|insufficient|cannot|can't|doesn't|does not|whether|if|would|could)\b/.test(clause));
    const cbctExists = clauses.some(clause => cbctMention.test(clause)
      && /\b(existing|recent|previous|prior|already (?:has|have|obtained)|last (?:week|month|year)|yesterday|from|on a (?:cd|disc)|available|(?:was|been) (?:obtained|taken|performed|completed))\b/.test(clause)
      && !/\b(?:no|without) (?:previous |prior |existing )?(?:cbct|cone[- ]?beam|3d scan)|\bnot (?:yet )?(?:had|have|obtained|taken|performed)|\b(?:will|would|going to)\b/.test(clause))
      || affirmed(/\b(?:had|underwent|obtained|received) (?:an? )?cbct\b/)
      || affirmed(/\bcbct (?:(?:was|has been) (?:already )?|already |previously )(?:taken|performed|obtained|completed)\b/)
      || affirmed(/\b(?:took|has|have|bringing|did) (?:their |an? |the )?(?:cbct|cone[- ]?beam(?: ct)?(?: scan)?|3d scan)\b/);
    const cbctOrdered = affirmed(/\b(?:cbct|cone[- ]?beam(?: ct)?|3d scan) (?:has |was |is )?(?:already )?(?:been )?(?:ordered|scheduled|booked)\b/);
    const cbctUnresolved = clauses.some(clause => cbctMention.test(clause) && /\b(reviewed|existing|previous|prior)\b/.test(clause) && /\b(inadequate|insufficient|does not answer|cannot answer|unresolved)\b/.test(clause));
    const twoAnswers = has('conclusive2d') || affirmed(/\b(?:pa|panoramic|periapical|(?:2d )?x[- ]?rays?|2d images?|2d imaging) (?:already |clearly )?(?:answers?|is sufficient|are sufficient|is adequate|are adequate|is conclusive|are conclusive|tell us everything we need|shows the full extent)\b/);
    const twoUnresolved = (affirmed(/\b(pa|pano|panoramic|periapical|radiographs?|(?:2d )?x[- ]?rays?|2d imag(?:e|es|ing))\b.{0,60}\b(inconclusive|unclear|equivocal|limited|obscured|overlap(?:ping)?|unresolved|cannot (?:answer|show|see)|does not (?:answer|show)|do not (?:answer|show)|hard to (?:see|interpret)|not clear)\b/)
      || affirmed(/\b(?:inconclusive|equivocal|unclear) (?:pa|pano|panoramic|periapical|radiographs?|2d images?|x[- ]?rays?)\b/))
      && !clauses.some(clause => /\b(?:would|could|if|whether)\b[^?]*\b(?:pa|x[- ]?ray|2d)\b[^?]*\binconclusive\b/.test(clause))
      && !/\bnot (?:inconclusive|unclear|equivocal|limited|obscured|unresolved)\b/.test(raw);
    const twoNone = /\b(?:no (?:relevant |prior |previous )?(?:2d (?:x[- ]?rays?|images?|imaging)|x[- ]?rays?|radiographs?|pas?)|(?:2d (?:x[- ]?rays?|images?|imaging)|radiographs?) (?:have |were |are )?(?:not (?:been )?(?:taken|available|obtained)|unavailable)|(?:have |has |did )?not (?:yet )?(?:taken|take|obtained) (?:any |the )?(?:x[- ]?rays?|radiographs?|pas?))\b/.test(raw);
    const twoNotReviewed = /\b(?:2d (?:x[- ]?rays?|images?|imaging)|radiographs?|x[- ]?rays?|pas?)\b[^.;\n]{0,60}\bnot (?:yet )?(?:been )?reviewed\b/.test(raw)
      || /\bnot (?:yet )?(?:reviewed|looked at|seen) (?:the |any )?(?:2d )?(?:x[- ]?rays?|images?|radiographs?|pas?)\b/.test(raw);
    const twoReviewed = affirmed(/\b(?:2d (?:x[- ]?rays?|images?|imaging)|radiographs?) (?:have been |were |are )?(?:taken and )?reviewed\b/);
    let imageStatus = cbctAdequate ? 'cbct_answers' : cbctUnresolved ? 'cbct_unresolved' : cbctExists ? 'cbct_review' : twoAnswers ? 'two_d_answers' : twoNone ? 'none' : twoNotReviewed ? 'not_reviewed' : twoUnresolved ? 'two_d_unresolved' : 'unknown';
    existingCbct = cbctAdequate || cbctUnresolved || cbctExists || /^cbct_/.test(answers.imaging || '');
    add('CBCT context', existingCbct ? 'A previous CBCT was reported for review.' : 'No previous CBCT assumed for this clinical question.', existingCbct ? (/^cbct_/.test(answers.imaging || '') ? 'Selected answer' : 'Case description') : 'Default assumption');
    const impactNo = affirmed(/\b(no change in (?:care|treatment|management)|(?:would|will|does) not (?:change|alter|affect) (?:care|treatment|management|what we do)|no (?:additional|further) (?:diagnostic )?(?:information|imaging) (?:is )?needed|no unanswered imaging question remains|can decide treatment without (?:any )?more images)\b/);
    const impactUnsure = /\bnot sure\b[^.;\n]{0,35}\b(?:change|affect|help|benefit)\b/.test(raw);
    const impactYes = !impactNo && affirmed(/\b(?:would|could|will|may) (?:change|alter|affect|guide) (?:the )?(?:care|treatment|management|surgical|approach|decision|risk)\b/);
    const examNo = /\b(no (?:clinical )?exam(?:ination)?|exam(?:ination)? (?:has |was |is )?not (?:yet )?(?:been )?(?:done|performed|completed)|before (?:the )?(?:clinical )?exam(?:ination)?|(?:patient |medical |dental )?history (?:has |was |is )?not (?:yet )?(?:been )?(?:taken|reviewed)|(?:cold|pulp|vitality) test(?:ing)? (?:to be performed|pending)|no (?:cold|pulp|vitality) test(?:ing)? performed)\b/.test(raw)
      || /\b(?:not (?:yet )?(?:examined|seen) (?:the )?patient|patient has not (?:yet )?been (?:seen|examined)|not (?:yet )?(?:done|performed|completed) (?:the |a )?(?:clinical )?exam|not (?:yet )?reviewed (?:the )?(?:medical |dental |patient )?history|(?:clinical )?exam(?:ination)? (?:is )?(?:scheduled|booked|pending)|phone call only|(?:cold|pulp|vitality) test(?:ing)? (?:has not (?:yet )?been done|will be done|is planned)|still need to (?:test|examine) (?:the )?(?:tooth|patient))\b/.test(raw);
    const examYes = !examNo && affirmed(/\b(?:clinical exam(?:ination)?|exam(?:ination)?|history and exam) (?:was |is |has been |have been )?(?:reviewed|completed|performed|inconclusive|done)\b/);
    const answerConflict = (answers.imaging && answers.imaging !== 'unknown' && imageStatus !== 'unknown' && answers.imaging !== imageStatus)
      || ((answers.impact === 'yes' || reason?.effect === 'benefit') && impactNo) || (answers.impact === 'no' && impactYes)
      || (answers.exam === 'yes' && examNo) || (answers.exam === 'no' && examYes);
    if (answerConflict || (twoAnswers && twoUnresolved) || (twoNone && (twoAnswers || twoUnresolved)) || (cbctAdequate && cbctUnresolved)) {
      add('Conflicting details', 'The text and selected answers, or two imaging statements, disagree.');
      return finish('needs_details', 'conflicting-answers', 'Resolve the conflicting details first', 'Edit the case description or the selected answer so they describe the same question, images and time point.', { showFollowups: true });
    }
    if (answers.imaging && answers.imaging !== 'unknown' && imageLabels[answers.imaging]) imageStatus = answers.imaging;
    if (imageStatus === 'unknown') imageStatus = 'reviewed';
    const exam = ['yes', 'no'].includes(answers.exam) ? answers.exam : examNo ? 'no' : 'yes';
    const impact = impactNo ? 'no' : impactUnsure ? 'unsure' : reason ? reason.effect === 'benefit' ? 'yes' : 'unsure' : ['yes', 'no', 'unsure'].includes(answers.impact) ? answers.impact : impactYes ? 'yes' : 'unknown';
    add('Existing imaging', imageStatus === 'reviewed' && twoReviewed ? '2D X-rays reported as reviewed; ability to answer this question is not established' : imageLabels[imageStatus], answers.imaging && answers.imaging !== 'unknown' ? 'Selected answer' : imageStatus === 'reviewed' && !twoReviewed ? 'Default assumption' : 'Case description');
    add('Clinical assessment', exam === 'no' ? 'History, examination or relevant testing is not yet complete' : examYes || answers.exam === 'yes' ? 'Clinical assessment reported as completed' : 'Patient history reviewed and examination completed are assumed', answers.exam && answers.exam !== 'unknown' ? 'Selected answer' : examYes || examNo ? 'Case description' : 'Default assumption');
    add('Effect on care', ({ yes: 'Additional information could affect care', no: 'No change in care or additional information needed', unsure: 'The intended benefit needs clarification', unknown: 'Not established' })[impact], !impactNo && !impactUnsure && (reason || (answers.impact && answers.impact !== 'unknown')) ? 'Selected answer' : 'Case description');
    const questionConcepts = topics[topic].goal.filter(key => c.has(key));
    const questionPresent = questionConcepts.length > 0;
    add('Question details', questionPresent ? questionConcepts.map(key => analysis.labels?.[key] || key).join('; ') : 'The relevant anatomical or diagnostic question needs clarification.');
    const base = { showFollowups: true };
    if (cbctOrdered && !existingCbct) return finish('needs_details', 'coordinate-order', 'Coordinate the CBCT already requested', 'A CBCT order or appointment was reported. Confirm its purpose and status with the requesting clinician before arranging another scan.', { showFollowups:false });
    if (imageStatus === 'cbct_answers') return finish('review_existing', 'adequate-cbct', 'Review the existing CBCT before considering another scan', 'You reported that existing CBCT answers this question. The description does not establish a need to repeat it.', base);
    if (imageStatus === 'cbct_review') return finish('review_existing', 'review-cbct', 'Review the existing CBCT first', 'Its ability to answer the current question has not been established. Clarify what is missing before assessing a repeat scan.', base);
    if (imageStatus === 'two_d_answers') return finish('not_supported', 'adequate-2d', 'An additional scan is not supported by the details entered', 'You reported that 2D images answer this question. If a separate planning question remains, describe it explicitly.', base);
    if (impact === 'no') return finish('not_supported', 'no-added-benefit', 'The description does not establish an added benefit from CBCT', 'You reported no additional information needed or no expected effect on care. Reassess the imaging purpose before proceeding.', base);
    const questions = [], clarifications = [];
    const clarify = question => { questions.push(question); clarifications.push(question); };
    const ageMatch = raw.match(/\b(\d{1,2})[- ](?:year[- ]old|years? old|yo|y\/o)\b|\b(?:aged?|age:) (\d{1,2})\b/);
    const reportedAge = ageMatch ? Number(ageMatch[1] || ageMatch[2]) : null;
    // Under 18 is a software coverage boundary, not a clinical age threshold for implant care.
    if (topic === 'implant' && ((reportedAge !== null && reportedAge < 18) || affirmed(/\b(?:child|pediatric|adolescent)\b/))) {
      add('Applicability check', 'Implant planning in a child or adolescent needs a source-specific clinical review.', 'Software coverage limit');
      clarify('Confirm that the implant guidance applies to this patient’s age and development. This pathway does not assess growth, treatment timing or pediatric implant exceptions.');
    }
    const historicalPattern = topic === 'implant' ? /\bimplant(?: planning| placement)?\b/ : topic === 'surgery' ? /\b(?:apicoectomy|apicectomy|root[- ]?end surgery)\b/ : topic === 'trauma' ? /\btrauma\b/ : topic === 'retreatment' ? /\bretreatment\b/ : null;
    const historicalOnly = historicalPattern && clauses.some(clause => historicalPattern.test(clause) && /\b(?:previous|previously|old|history|childhood|performed|completed|declined|years? ago|planned in \d{4})\b/.test(clause));
    if (historicalOnly) clarify('A past event, completed procedure or earlier plan was mentioned. Which current finding or proposed treatment requires additional imaging now? Separate that question from the history.');
    if (topic === 'extraction' && (!affirmed(/\b(?:inferior alveolar|mandibular canal|ian|nerve|canal overlap|canal diversion|darkening of (?:the )?roots?)\b/) || affirmed(/\b(?:upper|#1|#16)\b/))) clarify('This source pathway addresses mandibular third-molar nerve risk. Identify the relevant panoramic risk finding; other extraction questions need separate procedure-specific guidance.');
    if (imageStatus === 'cbct_unresolved') clarify('What is missing from the reviewed CBCT, and why would another acquisition resolve it? Review this before deciding on repeat imaging.');
    if (topic === 'impacted') clarify('Confirm age and development against the cited guidance. This pathway includes pediatric localization guidance; adult non-third-molar cases need an additional source-specific review.');
    if (exam !== 'yes') clarify('Your description indicates that history review, examination or relevant testing is incomplete. Complete the initial assessment before deciding on imaging.');
    if (imageStatus === 'reviewed' && topic !== 'implant') clarify('What information is still missing from the reviewed 2D X-rays? Add this to the description; the tool does not assume that 2D images are insufficient.');
    if (imageStatus === 'not_reviewed') clarify('Review the available 2D images before deciding what additional imaging is needed.');
    if (imageStatus === 'none' && topic !== 'implant') clarify('Could examination and lower-exposure imaging answer this question first?');
    if (!questionPresent || topic === 'cracked') clarify(topics[topic].question);
    // Require a named, proposed procedure. A historical or denied procedure cannot fill this gap.
    const proposed = pattern => clauses.some(clause => [...clause.matchAll(new RegExp(pattern.source, 'g'))].some(match => {
        const before = clause.slice(0, match.index);
        const after = clause.slice(match.index + match[0].length);
        const negativeOrPast = /\b(?:no|not|without|prior|previous|previously|past|after|had|underwent|completed|history of)\s+(?:[\w/-]+\s+){0,5}$/.test(before)
          || /^\s*(?:planning\s+)?(?:(?:is|was|has been)\s+)?(?:not\b|completed\b|performed\b|done\b|(?:in|from) \d{4}\b|\d+ years? ago\b)/.test(after);
        const intent = /\b(?:plan(?:ning|ned)?(?: for)?|consider(?:ing)?|scheduled for|proposed|recommended|candidate for|preoperative(?: for)?)\s+(?:(?:an?|the|nonsurgical|surgical|initial|repeat)\s+)*$/.test(before)
          || /^\s*(?:(?:at|on|for)\s+#?\d+\s*)?(?:(?:is|has been)\s+)?(?:planned|scheduled|proposed|recommended|being considered|planning)\b/.test(after);
        return !negativeOrPast && intent;
    }));
    if (reasonKey === 'implant_planning') {
      const currentPlan = topic === 'implant' && proposed(/\b(?:dental )?implants?(?: placement| surgery)?\b/);
      add('Planning purpose check', currentPlan ? 'Proposed implant placement is identified in the description.' : 'The description does not establish proposed implant placement for this question.');
      if (!currentPlan) clarify('The case does not establish proposed implant placement for this question. If you are investigating symptoms, choose that reason. If implant placement is being considered, describe the proposed plan and the site information needed.');
      else if (!has('measurementNeed', 'anatomicRisk')) clarify('Which site measurement or anatomical relationship is needed for implant placement? Planning wording alone does not supply this information.');
    }
    if (reasonKey === 'procedure_planning') {
      const procedures = [
        { label: 'Root canal treatment', pattern: /\b(?:root canal(?: treatment| therapy)?(?!\s+retreatment)|endodontic treatment|rct)\b/, applies: topics[topic].family === 'endo', information: has('missedAnatomy', 'calcifiedCanal', 'perforationConcern', 'complications') },
        { label: 'Endodontic retreatment', pattern: /\b(?:(?:root canal |endodontic )?retreatment|retx|re-tx)\b/, applies: topics[topic].family === 'endo', information: has('missedAnatomy', 'calcifiedCanal', 'perforationConcern', 'complications', 'locationExtent') },
        { label: 'Root-end surgery', pattern: /\b(?:apicoectomy|apicectomy|apico|endodontic surgery|endo surgery|root[- ]?end surgery|surgery at the tip of the root)\b/, applies: topic === 'surgery', information: has('locationExtent', 'anatomicRisk', 'measurementNeed') },
        { label: 'Extraction', pattern: /\b(?:(?:third[- ]molar |surgical )?extraction)\b/, applies: ['extraction', 'impacted'].includes(topic), information: has('anatomicRisk', 'rootResorptionRisk', 'rootMorphologyUnclear', 'locationExtent') }
      ].filter(procedure => proposed(procedure.pattern));
      add('Proposed procedure', procedures.length ? procedures.map(procedure => procedure.label).join('; ') : 'No named, proposed procedure was recognized.');
      if (topic === 'implant') clarify('The description concerns implant placement. Select “Plan implant placement” for that purpose, or describe the separate procedure you want to assess.');
      else if (!procedures.length) clarify('Which procedure is being considered now, and what information is needed to plan it? Add those details to the description. If the aim is to understand the symptoms first, select that reason instead.');
      else if (procedures.length > 1) clarify('More than one proposed procedure was recognized. Clarify which procedure this planning question concerns.');
      else if (!procedures[0].applies) clarify('The proposed procedure does not match the covered planning guidance for this question. Describe its specific imaging need and review procedure-specific guidance.');
      else {
        add('Procedure information check', procedures[0].information ? 'Relevant anatomical or treatment detail was recognized.' : 'The specific information needed for the proposed procedure is not established.');
        if (!procedures[0].information) clarify('What specific anatomy, measurements or treatment complication must be clarified to plan the proposed procedure? Inconclusive images or a need for more information alone do not identify that planning need.');
      }
    }
    if (reasonKey === 'diagnosis' && ['implant', 'surgery', 'extraction'].includes(topic)) clarify('Your description identifies a planning question. Which symptoms or findings remain unexplained, or is planning the procedure your main reason?');
    if (reasonKey === 'risk' && !has('anatomicRisk', 'rootResorptionRisk', 'perforationConcern')) clarify('Which nearby structure is at risk, and how would its relationship change the procedure or referral? Add this to the description.');
    if (reasonKey === 'complication' && !has('complications', 'perforationConcern', 'missedAnatomy', 'nonhealingLesion', 'postEndoSymptoms')) clarify('Which treatment complication is suspected, and what findings raise the concern? Choosing this reason does not establish a complication.');
    if (reasonKey === 'referral') clarify('What unanswered finding would change the referral? Consider whether the receiving clinician should select any further imaging.');
    if (reasonKey === 'healing' && topic !== 'nonhealing') clarify('Describe the symptoms or abnormal healing findings that need investigation. Routine follow-up alone is not a reason for CBCT.');
    if (reasonKey === 'other') clarify('Describe the decision that additional information could change, or why the expected benefit is still uncertain.');
    if (impact !== 'yes') questions.push('How could additional information affect the outcome? Choose the main reason below or explain it in the case description.');
    if (questions.length) {
      const incompleteAssessment = exam !== 'yes' || imageStatus === 'not_reviewed' || (imageStatus === 'none' && topic !== 'implant');
      const title = incompleteAssessment ? 'Complete the initial assessment before considering CBCT' : historicalOnly ? 'Clarify the current question before considering CBCT' : 'CBCT may be useful—confirm these details first';
      return finish('conditional', 'confirm-criteria', title, topics[topic].summary, { ...base, questions, clarifications });
    }
    return finish('supported', 'criteria-reported', 'Guidance supports CBCT for this question', topics[topic].summary + ' This uses the stated starting assumptions unless your description provides different details.', base);
  }
  const api = { version, sources, topics, reasons, reasonOrder, normalizeText, prepareText, decide };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CBCTClinicalGuidance = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
