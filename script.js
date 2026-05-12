const studies = {
  jadaGuidelines2024: {
    studyTitle: 'Applying AAE/AAOMR guidelines for CBCT prescription: Impact on endodontic clinical decisions',
    studyUrl: '#cite-jada-guidelines',
    doiUrl: 'https://doi.org/10.1016/j.adaj.2023.09.007',
    populationContext: 'UCLA postgraduate endodontic clinic; 526 teeth evaluated by CBCT.',
    applicabilityWarning: 'Endodontic specialty setting; not a broad general-dentistry rate.'
  },
  impactedCanines2025: {
    studyTitle: 'The Influence of Three-Dimensional Cone Beam Computed Tomography (CBCT) Data on Decision-Making for Maxillary Impacted Canines',
    studyUrl: '#cite-impacted-canines',
    doiUrl: 'https://doi.org/10.3390/app152413061',
    populationContext: '31 orthodontists evaluating impacted maxillary canine cases.',
    applicabilityWarning: 'Orthodontic/specialty-specific; not a broad GP impaction rate.'
  },
  endoDiagnosis2015: {
    studyTitle: 'The impact of cone beam computed tomography on the choice of endodontic diagnosis',
    studyUrl: '#cite-endo-diagnosis',
    doiUrl: 'https://doi.org/10.1111/iej.12350',
    populationContext: 'Endodontic specialist clinics; 53 patients and 81 teeth.',
    applicabilityWarning: 'Broad endodontic diagnosis-change context, not indication-specific.'
  },
  adaAaomrGuidance: {
    studyTitle: 'ADA/AAOMR patient selection and ADA safety guidance',
    studyUrl: '#cite-ada-aaomr',
    doiUrl: '',
    populationContext: 'Guideline context only.',
    applicabilityWarning: 'No indication-specific decision-change percentage in the project sources.'
  },
  vrfDetection2009: {
    studyTitle: 'Detection of Vertical Root Fractures in Endodontically Treated Teeth by a Cone Beam Computed Tomography Scan',
    studyUrl: '#cite-vrf-detection',
    doiUrl: 'https://doi.org/10.1016/j.joen.2009.01.022',
    populationContext: 'Laboratory study of 80 endodontically prepared teeth evaluated by 4 observers.',
    applicabilityWarning: 'Diagnostic-accuracy context only; not a treatment-planning rate and not a general GP clinical-outcome study.'
  }
};

const appVersion = {
  version: 'clinical-scenario-2026-05-12-targeted-fixes',
  buildDate: '2026-05-12',
  source: 'local workspace'
};

// scanFactor stays at 1 because every entered indication is counted as an estimated scan,
// whether the case is treated in-office or referred. planRate and diagnosisRate values are
// study-derived only when metricType names a published treatment-planning or diagnosis-change metric.
const evidenceMap = {
  pain: {
    indicationId: 'pain',
    label: 'Nonspecific symptoms',
    displayPercent: '86%',
    calculatorRate: { scanFactor: 1, planRate: 0.86, diagnosisRate: 0.54 },
    metricType: 'Treatment-plan change / establishment / correction',
    services: ['endo'],
    group: 'endo',
    ...studies.jadaGuidelines2024,
    guidelineContext: 'Contradictory or nonspecific signs/symptoms after exam and 2D imaging.',
    confidence: 'medium-high',
    cardCopy: {
      headline: 'treatment plan changed or was clarified in similar unclear-symptom cases',
      detail: 'Enter how many cases you see with unclear or hard-to-localize symptoms per month, such as pain that does not match the exam, symptoms on more than one tooth, or 2D images that do not explain the complaint.'
    },
    notes: 'R2-specific JADA figure-derived treatment-planning impact; diagnosisRate uses R2 periapical diagnosis change.'
  },
  nonhealing: {
    indicationId: 'nonhealing',
    label: 'Nonhealing endodontic treatment',
    displayPercent: '93%',
    calculatorRate: { scanFactor: 1, planRate: 0.93, diagnosisRate: 0.21 },
    metricType: 'Treatment-plan change / establishment / correction',
    services: ['endo'],
    group: 'endo',
    ...studies.jadaGuidelines2024,
    guidelineContext: 'Nonhealing after previous endodontic treatment.',
    confidence: 'medium-high',
    cardCopy: {
      headline: 'treatment plan changed or was clarified in nonhealing endodontic cases',
      detail: 'Enter how many cases you see with nonhealing endodontic treatment per month, such as persistent symptoms, a sinus tract, or a lesion that remains after a prior root canal.'
    },
    notes: 'R7-specific JADA figure-derived treatment-planning impact.'
  },
  fracture: {
    indicationId: 'fracture',
    label: 'Suspected vertical root fracture',
    displayPercent: '88%',
    calculatorRate: { scanFactor: 1, planRate: 0.88, diagnosisRate: 0.23 },
    metricType: 'Treatment-plan change / establishment / correction',
    services: ['endo'],
    group: 'endo',
    ...studies.jadaGuidelines2024,
    guidelineContext: 'Suspected VRF with inconclusive exam and 2D imaging.',
    confidence: 'medium-high',
    cardCopy: {
      headline: 'treatment plan changed or was clarified when VRF was suspected',
      detail: 'Enter how many cases you see with suspected vertical root fracture per month, such as isolated deep probing, biting pain on a root-filled tooth, a J-shaped lesion, or a fracture concern that 2D images do not settle.'
    },
    accuracy: {
      studyId: 'vrfDetection2009',
      metricType: 'Overall diagnostic accuracy for VRF detection',
      twoDOnly: 0.66,
      cbctAssisted: 0.86,
      absoluteDifference: 0.2,
      note: 'Specialty/laboratory diagnostic-accuracy context; not a treatment recommendation.'
    },
    notes: 'Replaces broad referred-endodontic-case rate with R6-specific JADA figure-derived rate.'
  },
  resorption: {
    indicationId: 'resorption',
    label: 'Resorption',
    displayPercent: '52%',
    calculatorRate: { scanFactor: 1, planRate: 0.52, diagnosisRate: 0.08 },
    metricType: 'Treatment-plan change / establishment / correction',
    services: ['endo'],
    group: 'endo',
    ...studies.jadaGuidelines2024,
    guidelineContext: 'Internal/external resorption localization and differentiation.',
    confidence: 'medium',
    cardCopy: {
      headline: 'treatment plan changed or was clarified in resorption cases',
      detail: 'Enter how many cases you see with resorption concern per month, such as suspected internal resorption, external resorption, cervical resorption, or a case where the location and extent are unclear.'
    },
    notes: 'R12-specific JADA figure-derived treatment-planning impact.'
  },
  retreatment: {
    indicationId: 'retreatment',
    label: 'Retreatment complication',
    displayPercent: 'No direct % used',
    calculatorRate: { scanFactor: 1, planRate: 0, diagnosisRate: 0 },
    metricType: 'Guideline context only',
    services: ['endo'],
    group: 'endo',
    ...studies.jadaGuidelines2024,
    guidelineContext: 'Nonsurgical retreatment complications.',
    confidence: 'medium',
    cardCopy: {
      headline: 'retreatment or missed-anatomy question',
      detail: 'Enter how many cases you see with a retreatment or missed-anatomy question per month, such as a missed canal, separated instrument, blocked canal, ledge, perforation concern, or unusual root anatomy.'
    },
    notes: 'No clean indication-specific impact percentage found in project sources.'
  },
  surgery: {
    indicationId: 'surgery',
    label: 'Endodontic surgery planning',
    displayPercent: '48%',
    calculatorRate: { scanFactor: 1, planRate: 0.48, diagnosisRate: 0.12 },
    metricType: 'Treatment-plan change / establishment / correction',
    services: ['endo', 'surgery'],
    group: 'endo',
    ...studies.jadaGuidelines2024,
    guidelineContext: 'Presurgical endodontic treatment planning.',
    confidence: 'medium',
    cardCopy: {
      headline: 'treatment plan changed or was clarified in presurgical endodontic cases',
      detail: 'Enter how many cases you see for endodontic surgery planning per month, such as apical surgery, root-end planning, or checking the relationship to the sinus, nerve canal, cortical plate, or nearby roots.'
    },
    notes: 'R9-specific JADA figure-derived treatment-planning impact.'
  },
  implant: {
    indicationId: 'implant',
    label: 'Implant planning',
    displayPercent: 'No direct % used',
    calculatorRate: { scanFactor: 1, planRate: 0, diagnosisRate: 0 },
    metricType: 'Study-based use estimate',
    services: ['implants', 'surgery'],
    group: 'implants',
    ...studies.adaAaomrGuidance,
    guidelineContext: 'Use CBCT when 3D anatomy is needed and lower-exposure imaging is insufficient.',
    confidence: 'high',
    cardCopy: {
      headline: '3D anatomy planning',
      detail: 'Enter how many cases you see for implant site planning per month, such as checking ridge width, bone height, sinus proximity, nerve proximity, graft needs, or whether the case will be treated in-office or referred.'
    },
    notes: 'Do not display a forced percentage.'
  },
  airway: {
    indicationId: 'airway',
    label: 'Airway screening',
    displayPercent: 'No direct % used',
    calculatorRate: { scanFactor: 1, planRate: 0, diagnosisRate: 0 },
    metricType: 'Guideline context only',
    services: ['airway'],
    group: 'airway',
    ...studies.adaAaomrGuidance,
    guidelineContext: 'Defined clinical question and patient selection required.',
    confidence: 'high',
    cardCopy: {
      headline: 'selective use for a defined question',
      detail: 'Enter how many cases you see with an airway or sleep-disordered breathing question per month, such as airway volume review, nasal obstruction concern, skeletal anatomy review, or referral planning for a defined airway question.'
    },
    notes: 'Avoid routine screening implication.'
  },
  sinus: {
    indicationId: 'sinus',
    label: 'Odontogenic sinus question',
    displayPercent: 'No direct % used',
    calculatorRate: { scanFactor: 1, planRate: 0, diagnosisRate: 0 },
    metricType: 'Adjacent endodontic diagnostic context only',
    services: ['endo', 'surgery'],
    group: 'endo',
    ...studies.endoDiagnosis2015,
    guidelineContext: 'Tooth-sinus relationship may be reviewed when 2D imaging is insufficient.',
    confidence: 'medium',
    cardCopy: {
      headline: 'tooth-sinus relationship',
      detail: 'Enter how many cases you see with a possible tooth-sinus relationship per month, such as sinus mucosal thickening near a tooth, suspected odontogenic sinusitis, oroantral communication concern, or upper posterior infection near the sinus.'
    },
    notes: 'Do not use 35% as sinus-specific.'
  },
  impaction: {
    indicationId: 'impaction',
    label: 'Impacted tooth',
    displayPercent: '51.5%',
    calculatorRate: { scanFactor: 1, planRate: 0.515, diagnosisRate: 0 },
    metricType: 'Treatment decision / management change',
    services: ['ortho', 'surgery'],
    group: 'ortho',
    ...studies.impactedCanines2025,
    guidelineContext: 'Impacted or ectopic tooth localization when 2D position/proximity is unclear.',
    confidence: 'high',
    cardCopy: {
      headline: '2D extraction decisions changed to orthodontic traction after CBCT review',
      detail: 'Enter how many cases you see with impacted or ectopic teeth per month, such as impacted canines, unclear buccal or palatal position, root proximity or resorption risk, or deciding between exposure, traction, extraction, or referral.'
    },
    notes: 'Direct for impacted maxillary canines; specialty-specific warning required.'
  }
};

const indicationWeights = Object.fromEntries(
  Object.entries(evidenceMap).map(([key, evidence]) => [key, {
    label: evidence.label,
    scanFactor: evidence.calculatorRate.scanFactor,
    planRate: evidence.calculatorRate.planRate,
    diagnosisRate: evidence.calculatorRate.diagnosisRate,
    services: evidence.services,
    group: evidence.group
  }])
);

const evidenceHighlights = [
  {
    percent: '21%',
    copy: 'In a JADA guideline-application endodontic clinic study, periapical diagnosis differed after CBCT review for 21% of evaluated teeth overall.',
    link: studies.jadaGuidelines2024.doiUrl,
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h5"/><circle cx="11" cy="13" r="3"/><path d="m13.2 15.2 3.3 3.3"/></svg>'
  },
  {
    percent: '69%',
    copy: 'In that same JADA endodontic study, the recorded treatment plan was changed, established, or corrected after CBCT review in 69% of evaluated cases overall.',
    link: studies.jadaGuidelines2024.doiUrl,
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 4h8v3H8V4Z"/><path d="M6 6H5v15h14V6h-1"/><path d="m8 12 1.5 1.5L12 11"/><path d="M14 12h3"/><path d="m8 17 1.5 1.5L12 16"/><path d="M14 17h3"/></svg>'
  },
  {
    percent: '35%',
    copy: 'In a separate endodontic before-after study, CBCT information changed the selected endodontic diagnosis for 35% of evaluated teeth.',
    link: studies.endoDiagnosis2015.doiUrl,
    icon: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4c-2-2-6-1-7.5 1.8C2.4 9.7 4 16 7.3 20c1 .9 2 .4 2.2-.8l.6-3.2c.2-1.2 1.6-1.2 1.8 0l.6 3.2c.2 1.2 1.2 1.7 2.2.8C18 16 19.6 9.7 17.5 5.8 16 3 14 2.8 12 4Z"/></svg>'
  }
];

const guidanceScenarios = [
  {
    name: 'Persistent or nonhealing endodontic symptoms',
    guidanceCategory: 'Previously treated or nonhealing endodontic concern',
    conceptWeights: { priorEndo: 2, postEndoSymptoms: 2, nonhealingLesion: 2, persistentSymptoms: 1, inconclusive2d: 1.5, periapicalFinding: 1, retreatment: 1, sinusTract: 1.5, sourceUnclear: 1 },
    comboBonus: [['priorEndo', 'persistentSymptoms'], ['persistentSymptoms', 'inconclusive2d'], ['priorEndo', 'periapicalFinding'], ['pulpNecrosis', 'periapicalFinding'], ['sinusTract', 'inconclusive2d']],
    requiresAny: [['priorEndo'], ['retreatment'], ['postEndoSymptoms'], ['nonhealingLesion'], ['periapicalFinding']],
    reducers: { paWnl: 1.5, noApicalLesion: 1.5, stableFinding: 1.5, noCurrentSymptoms: 1.5, uncertaintyMarker: 0.5 },
    threshold: 3,
    title: 'This scenario matches published guidance for previously treated or nonhealing teeth.',
    text: 'AAE/AAOMR guidance discusses CBCT as a consideration for previously treated teeth that are not healing or remain symptomatic when 2D imaging does not answer the question. ADA/AAOMR guidance still starts with history, exam, and lower-exposure imaging when those provide enough information.',
    limitation: 'The evidence is more directly relevant when the note describes prior endodontic treatment, persistent symptoms, post-endodontic symptoms, or a persistent apical finding. Normal or noncontributory 2D findings make apical pathology evidence less direct.'
  },
  {
    name: 'Contradictory or nonspecific signs and symptoms',
    guidanceCategory: 'Contradictory, nonspecific, or hard-to-localize findings',
    conceptWeights: { nonspecificSymptoms: 2, sourceUnclear: 1.5, persistentSymptoms: 1, inconclusive2d: 1.5, pulpTesting: 0.75, conflictingPulpTests: 1, percussionTenderness: 0.75, bitingPain: 0.5 },
    comboBonus: [['nonspecificSymptoms', 'inconclusive2d'], ['sourceUnclear', 'inconclusive2d'], ['nonspecificSymptoms', 'pulpTesting'], ['conflictingPulpTests', 'percussionTenderness'], ['pulpTesting', 'percussionTenderness']],
    reducers: { paWnl: 1, uncertaintyMarker: 0.75 },
    threshold: 2.5,
    title: 'This scenario matches published guidance for unclear signs or symptoms.',
    text: 'AAE/AAOMR guidance discusses limited-FOV CBCT as a consideration when signs or symptoms are contradictory, hard to localize, or not answered by exam and 2D imaging. Field of view and exposure remain patient-specific clinical decisions.'
  },
  {
    name: 'Suspected vertical root fracture',
    guidanceCategory: 'Possible vertical root fracture pattern when exam and 2D imaging are inconclusive',
    conceptWeights: { verticalRootFracture: 3, bitingPain: 0.75, localizedBitingPain: 1.25, isolatedProbing: 2, crownOrPost: 0.25, postAssociatedConcern: 1.5, jShapedLesion: 2, haloLesion: 1.5, sinusTract: 1.5, priorEndo: 1, inconclusive2d: 0.75 },
    comboBonus: [['bitingPain', 'isolatedProbing'], ['verticalRootFracture', 'isolatedProbing'], ['verticalRootFracture', 'jShapedLesion'], ['priorEndo', 'localizedBitingPain'], ['postAssociatedConcern', 'bitingPain']],
    requiresAny: [['verticalRootFracture'], ['jShapedLesion'], ['haloLesion'], ['isolatedProbing'], ['sinusTract'], ['postAssociatedConcern'], ['priorEndo', 'bitingPain']],
    reducers: { crackedToothPain: 1.5, largeRestoration: 0.75, paWnl: 0.5, uncertaintyMarker: 0.5 },
    threshold: 3,
    title: 'This scenario matches published guidance for suspected VRF when 2D imaging is inconclusive.',
    text: 'AAE/AAOMR guidance discusses limited-FOV CBCT when clinical exam and 2D radiography are inconclusive for suspected vertical root fracture. Interpretation needs caution near posts, crowns, and root filling materials because artifacts can mimic or hide fracture signs.',
    limitation: 'The evidence is more directly relevant when structural pain is paired with VRF-specific language or supporting findings such as a J-shaped or halo lesion, isolated deep probing, sinus tract, prior RCT with localized biting pain, or post-related fracture concern. Cracked cusp or chewing pain alone is less specific.'
  },
  {
    name: 'Suspected cracked tooth / structural tooth pain',
    guidanceCategory: 'Cracked-tooth or structural tooth-pain question',
    conceptWeights: { crackedToothPain: 2.5, structuralToothPain: 1.25, bitingPain: 1.25, largeRestoration: 1, crownOrPost: 0.5, pulpTesting: 0.5, paWnl: 0.25 },
    comboBonus: [['crackedToothPain', 'bitingPain'], ['largeRestoration', 'bitingPain']],
    reducers: { uncertaintyMarker: 0.25 },
    threshold: 2.5,
    maxAlignment: 'moderate',
    title: 'This scenario suggests cracked-tooth or structural tooth pain, but not necessarily VRF.',
    text: 'The note suggests cracked-tooth or structural tooth-pain language rather than a specific vertical root fracture pattern. This can be clinically relevant, but the wording alone is less specific than VRF language, isolated deep probing, sinus tract, J-shaped/halo bone loss, or prior RCT with localized biting pain.',
    limitation: 'What CBCT may add depends on whether the clinical question is about a visible or restorative crack, pulpal status, periodontal support, surrounding bone pattern, or another localized anatomic uncertainty. The guide does not determine whether CBCT would add enough information for this patient.'
  },
  {
    name: 'Resorption',
    guidanceCategory: 'Resorption localization, type, and extent',
    conceptWeights: { resorption: 3, locationExtent: 1.5, trauma: 0.5, cervicalResorption: 1, perforationConcern: 1 },
    comboBonus: [['resorption', 'locationExtent']],
    threshold: 3,
    title: 'This scenario matches published guidance for mapping resorption.',
    text: 'AAE/AAOMR guidance discusses CBCT for locating and differentiating internal and external resorption and understanding its extent. ADA/AAOMR responsible-use principles still apply: use the field size and exposure that answer the clinical question without unnecessary exposure.'
  },
  {
    name: 'Missed anatomy or retreatment evaluation',
    guidanceCategory: 'Retreatment, missed anatomy, or endodontic complication evaluation',
    conceptWeights: { priorEndo: 1.5, missedAnatomy: 2.5, retreatment: 2, complications: 1.5, calcifiedCanal: 1 },
    comboBonus: [['priorEndo', 'missedAnatomy'], ['missedAnatomy', 'inconclusive2d'], ['retreatment', 'missedAnatomy'], ['retreatment', 'complications']],
    reducers: { paWnl: 0.5, noCurrentSymptoms: 1.25, uncertaintyMarker: 0.25 },
    threshold: 3,
    title: 'This scenario matches published guidance for retreatment or anatomy clarification.',
    text: 'This wording suggests a retreatment or anatomy question, such as missed canal anatomy, calcification, perforation, or a separated instrument. CBCT information is framed here as educational context only and still requires clinical correlation and responsible-use selection.'
  },
  {
    name: 'Endodontic surgery planning',
    guidanceCategory: 'Presurgical endodontic anatomic assessment',
    conceptWeights: { surgicalPlanningNeed: 2.5, anatomicRisk: 1.5, measurementNeed: 1, locationExtent: 1, priorEndo: 0.5, persistentSymptoms: 0.5, inconclusive2d: 1 },
    comboBonus: [['surgicalPlanningNeed', 'anatomicRisk'], ['surgicalPlanningNeed', 'inconclusive2d'], ['surgicalPlanningNeed', 'locationExtent']],
    requiresAny: [['surgicalPlanningNeed']],
    reducers: { uncertaintyMarker: 0.25 },
    threshold: 3,
    title: 'This scenario may align with presurgical endodontic anatomy guidance.',
    text: 'CBCT may help clarify root-end anatomy, cortical plate or sinus/nerve relationships, and other 3D relationships when endodontic surgery planning cannot be answered adequately with clinical findings and 2D imaging.'
  },
  {
    name: 'Implant planning',
    guidanceCategory: 'Implant or surgical guide 3D anatomic planning',
    conceptWeights: { implantPlanning: 2.5, anatomicRisk: 2, measurementNeed: 1.5, surgicalPlanningNeed: 1, inconclusive2d: 0.5 },
    comboBonus: [['implantPlanning', 'anatomicRisk'], ['implantPlanning', 'measurementNeed'], ['implantPlanning', 'surgicalPlanningNeed']],
    requiresAny: [['implantPlanning']],
    reducers: { uncertaintyMarker: 0.25 },
    threshold: 3,
    title: 'This scenario matches published guidance for 3D anatomic assessment.',
    text: 'AAE/AAOMR endodontic guidance includes surgical implant placement as a CBCT consideration, and ADA/AAOMR patient-selection guidance discusses CBCT when 3D anatomy is needed and 2D imaging does not provide enough information.'
  },
  {
    name: 'Trauma',
    guidanceCategory: 'Localized dentoalveolar trauma assessment',
    conceptWeights: { trauma: 2.5, rootFracture: 1.5, displacement: 1, alveolarFracture: 1.5, resorption: 0.5, inconclusive2d: 0.5 },
    comboBonus: [['trauma', 'rootFracture'], ['trauma', 'alveolarFracture'], ['trauma', 'resorption'], ['trauma', 'inconclusive2d']],
    threshold: 2.5,
    title: 'This scenario may match published guidance for localized dentoalveolar trauma.',
    text: 'AAE/AAOMR guidance discusses limited-FOV CBCT for localized dentoalveolar trauma, including root fractures, luxation, displacement, or localized alveolar fracture, when additional anatomy may help clarify the clinical question.'
  },
  {
    name: 'Sinus or odontogenic source',
    guidanceCategory: 'Tooth-sinus relationship when 2D imaging is limited',
    conceptWeights: { sinusQuestion: 2, periapicalFinding: 1.5, sinusTract: 1.5, priorEndo: 0.5 },
    comboBonus: [['sinusQuestion', 'periapicalFinding'], ['sinusQuestion', 'priorEndo']],
    reducers: { paWnl: 0.75, uncertaintyMarker: 0.25 },
    threshold: 2.5,
    title: 'This scenario matches published guidance for reviewing the tooth-sinus relationship.',
    text: 'When 2D imaging cannot show the relationship between maxillary roots, periapical findings, cortical boundaries, and the sinus floor, limited-FOV CBCT may help clarify the anatomy. Findings still require clinical history, full image interpretation, and referral when the pattern is not odontogenic.'
  },
  {
    name: 'Impacted or ectopic tooth position',
    guidanceCategory: 'Impacted, ectopic, or supernumerary tooth localization',
    conceptWeights: { impaction: 2.5, ectopicEruption: 2, supernumerary: 1.5, anatomicRisk: 1.5, rootResorptionRisk: 1.5, inconclusive2d: 1 },
    comboBonus: [['impaction', 'anatomicRisk'], ['impaction', 'rootResorptionRisk'], ['ectopicEruption', 'inconclusive2d']],
    threshold: 2.5,
    title: 'This scenario matches published guidance for impacted or ectopic tooth localization.',
    text: 'This wording suggests an impacted or ectopic eruption localization question, such as root proximity or unclear position on 2D imaging. The guide frames this as evidence-informed context and does not determine whether imaging is required.'
  },
  {
    name: 'Extraction or third molar anatomic risk',
    guidanceCategory: 'Extraction or third-molar relationship to vital anatomy',
    conceptWeights: { extractionPlanning: 2, thirdMolar: 2, anatomicRisk: 1.5, rootMorphologyUnclear: 1.5, inconclusive2d: 1, ankylosis: 1 },
    comboBonus: [['thirdMolar', 'anatomicRisk'], ['extractionPlanning', 'rootMorphologyUnclear'], ['thirdMolar', 'inconclusive2d']],
    reducers: { noCurrentSymptoms: 0.5, uncertaintyMarker: 0.25 },
    threshold: 3,
    title: 'This scenario may match guidance for extraction-related anatomic clarification.',
    text: 'CBCT may be considered when 2D imaging suggests proximity to vital anatomy or root/anatomic relationships are unclear. This does not imply that every extraction or third molar case needs CBCT.',
    limitation: 'The evidence is more direct when the note describes canal or sinus proximity, unclear root morphology, ankylosis, dilaceration, or another 3D relationship that 2D imaging does not settle.'
  },
  {
    name: 'Airway screening',
    guidanceCategory: 'Airway language without a defined dental 3D question',
    conceptWeights: { airway: 2.5, measurementNeed: 0.5 },
    comboBonus: [],
    threshold: 2.5,
    title: 'Airway language alone does not create a routine CBCT screening indication.',
    text: 'Airway volume can be viewed on CBCT, but ADA/AAOMR responsible-use guidance centers clinical benefit, radiation risk, and patient selection. CBCT context is strongest when 3D information is needed for a defined dental or airway-related clinical question.'
  }
];

const concepts = {
  priorEndo: {
    field: 'prior_treatment_status',
    label: 'Prior root canal or endodontic treatment',
    normalized: 'previous endodontic treatment',
    patterns: [/\b(rct|nsrct|endo tx|root canal|prior endo|prior endodontic|previous endo|previously treated)\b/],
    excludes: [/\b(no prior rct|no previous rct|no prior endo|no prior endodontic|no root canal|untreated tooth)\b/]
  },
  postEndoSymptoms: {
    field: 'prior_treatment_status',
    label: 'Symptoms reported after prior endodontic treatment',
    normalized: 'post-endodontic symptoms',
    patterns: [
      /\b(after|following).{0,35}\b(rct|root canal|endo)\b/,
      /\b(rct|root canal|endo).{0,35}\b(still|persistent|unchanged|sinus tract|swelling|ttp|tender|symptomatic)\b/,
      /\b(rct|root canal|endo).{0,20}\b(wks|weeks|mo|months|ago).{0,35}\b(still|persistent|ttp|tender|symptomatic)\b/
    ]
  },
  nonhealingLesion: {
    field: '2d_imaging_findings',
    label: 'Nonhealing or persistent apical finding language',
    normalized: 'persistent/nonhealing apical finding',
    patterns: [/\b(non[- ]?healing|not healing|persistent lesion|persistent apical|larger than prior|lesion remains|healing not evident)\b/]
  },
  persistentSymptoms: {
    field: 'symptoms',
    label: 'Persistent symptoms or pain',
    normalized: 'persistent symptoms',
    patterns: [/\b(persistent|still|unchanged symptoms|symptoms unchanged|dull ache|ache|pain|tender|ttp|swelling|sinus tract|symptomatic)\b/],
    excludes: [/\b(no symptoms|asymptomatic|no current pain|no pain|better overall)\b/]
  },
  sourceUnclear: {
    field: 'uncertainty_level',
    label: 'Source or localization unclear',
    normalized: 'unclear source/localization',
    patterns: [/\b(source unclear|unclear source|cannot localize|hard to localize|vague|points generally|diffuse|referred pain|which tooth|multi[- ]?tooth|multiple teeth|localization|periodontal\/endodontic source|endo-perio|endo perio)\b/]
  },
  inconclusive2d: {
    field: '2d_imaging_findings',
    label: '2D imaging described as limited, unclear, or inconclusive',
    normalized: '2D imaging limitation/inconclusive finding',
    patterns: [/\b(pa|bw|pano|pan|fmx|radiograph|2d|x[- ]?ray).{0,35}\b(inconclusive|unclear|equivocal|limited|hard to see|hard to interpret|obscured|overlap|superimposition|difficult angulation|cannot see|not clear)\b/, /\b(anatomy obscured|sinus superimposition|lesion extent unclear|unclear apex|pano unclear|pa inconclusive|pa equivocal|bw equivocal|scatter obscures|obscures apex)\b/],
    excludes: [/\b(no canal overlap|no overlap|roots straight and clear|clear of canal)\b/]
  },
  paWnl: {
    field: '2d_imaging_findings',
    label: '2D imaging reported as normal or WNL',
    normalized: '2D imaging WNL/normal',
    patterns: [/\b(pa|bw|fmx|radiograph|x[- ]?ray|periapical).{0,15}\b(wnl|normal|looks normal|current and wnl)\b/, /\b(no parl|no apical lesion|no obvious parl)\b/]
  },
  noApicalLesion: {
    field: '2d_imaging_findings',
    label: 'No apical radiolucency reported',
    normalized: 'no PARL/no apical lesion',
    patterns: [/\b(no parl|without parl|no periapical radiolucency|no apical lesion|no obvious parl)\b/]
  },
  periapicalFinding: {
    field: '2d_imaging_findings',
    label: 'Periapical radiolucency or apical finding language',
    normalized: 'periapical finding/PARL',
    patterns: [/\b(parl|pa rl|periapical radiolucency|apical radiolucency|radiolucency|apical lesion|apical finding|widened pdl|diffuse radiolucency)\b/],
    excludes: [/\b(no parl|without parl|no periapical radiolucency|no apical lesion|no obvious parl)\b/]
  },
  nonspecificSymptoms: {
    field: 'symptoms',
    label: 'Nonspecific or contradictory symptoms',
    normalized: 'nonspecific/contradictory symptoms',
    patterns: [/\b(nonspecific|contradictory|inconsistent|equivocal|vague|hard to localize|cannot localize|unclear pain|mixed)\b/]
  },
  pulpTesting: {
    field: 'clinical_tests_reported',
    label: 'Pulp sensibility or vitality testing reported',
    normalized: 'pulp/sensibility testing reported',
    patterns: [/\b(cold test|cold|endo ice|heat test|heat|ept|electric pulp|test cavity|selective anesthesia)\b/]
  },
  pulpNoResponse: {
    field: 'clinical_test_results',
    label: 'No response to pulp testing',
    normalized: 'no response to sensibility testing',
    patterns: [/\b(cold|endo ice|ept|heat).{0,12}\b(nr|no response|nonresponsive|negative|-)\b/, /\b(negative cold|cold negative|cold -|ept nr|ept negative|no response to cold)\b/]
  },
  pulpLingering: {
    field: 'clinical_test_results',
    label: 'Lingering, delayed, exaggerated, or heat/cold pain response',
    normalized: 'lingering/exaggerated pulp test response',
    patterns: [/\b(lingering|delayed response|exaggerated response|pain relieved by cold|pain to heat|heat pain|cold lingers|lingers)\b/]
  },
  conflictingPulpTests: {
    field: 'clinical_test_results',
    label: 'Inconsistent or equivocal pulp test response',
    normalized: 'inconsistent/equivocal pulp test response',
    patterns: [/\b(cold|ept|heat).{0,30}\b(inconsistent|equivocal|mixed|sometimes|cannot reproduce)\b/, /\b(inconsistent|equivocal|mixed).{0,30}\b(cold|ept|heat)\b/]
  },
  percussionTenderness: {
    field: 'clinical_tests_reported',
    label: 'Tenderness to percussion or palpation',
    normalized: 'percussion/palpation tenderness',
    patterns: [/\bttp\s*\+?|\btender to percussion\b|\bpercussion\s*\+|\bperc\s*\+|\bvertical percussion\b|\bpalpation\s*\+|\bpalp\s*\+|\bvestibular tenderness\b|\bapical tenderness\b|\bbuccal swelling\b/]
  },
  bitingPain: {
    field: 'clinical_tests_reported',
    label: 'Bite or chewing pain reported',
    normalized: 'bite/chewing pain',
    patterns: [/\bbite pain\b|\bbiting\s*\+|\bbiting pain\b|\bpain on biting\b|\bpain on release\b|\bchewing pain\b|\bpain chewing\b|\btooth slooth\s*\+?|\bhard foods\b|\bnuts\b|\bpopcorn\b|\bbite\s*\+/]
  },
  localizedBitingPain: {
    field: 'clinical_tests_reported',
    label: 'Localized biting pain',
    normalized: 'localized bite pain',
    patterns: [/\b(localized bite|localized biting|bite pain localized|pain on biting tooth|isolated bite pain)\b/]
  },
  crackedToothPain: {
    field: 'suspected_condition',
    label: 'Crack or fractured cusp language',
    normalized: 'crack/fracture concern stated by user',
    patterns: [/\b(crack|crack suspected|suspect crack|possible crack|cracked tooth|crack line|fractured cusp|cusp fracture|split tooth concern|cracked cusp)\b/],
    excludes: [/\b(no crack|crack not suspected)\b/]
  },
  verticalRootFracture: {
    field: 'suspected_condition',
    label: 'VRF or vertical root fracture concern stated by user',
    normalized: 'VRF concern stated by user',
    patterns: [/\b(vrf|vertical root fracture|vertical fracture|split root|root fracture concern)\b/],
    excludes: [/\b(no vrf|vrf unlikely|vrf not suspected|no vertical root fracture)\b/]
  },
  isolatedProbing: {
    field: 'periodontal_findings',
    label: 'Isolated deep or narrow periodontal probing defect',
    normalized: 'isolated/narrow deep probing defect',
    patterns: [/\b(isolated probing|isolated pocket|narrow pocket|narrow probing|deep distal pocket|probing defect|localized periodontal defect|\d{1,2}\s?mm.{0,20}\b(isolated|narrow|pocket|probing)|isolated.{0,20}\d{1,2}\s?mm)\b/],
    excludes: [/\b(no isolated probing|no isolated pocket|no probing defect|no .*probing defect|probing wnl|periodontal chart wnl|no narrow pocket|no deep pocket)\b/]
  },
  periodontalModifier: {
    field: 'periodontal_findings',
    label: 'Periodontal finding reported',
    normalized: 'periodontal finding',
    patterns: [/\b(furcation|vertical defect|mobility|class i mobility|class ii mobility|class iii mobility|localized periodontal defect)\b/]
  },
  jShapedLesion: {
    field: '2d_imaging_findings',
    label: 'J-shaped lesion language',
    normalized: 'J-shaped lesion pattern described',
    patterns: [/\bj[- ]?shaped?\b|\bj shape\b|\bj-shaped lesion\b/]
  },
  haloLesion: {
    field: '2d_imaging_findings',
    label: 'Halo lesion or halo bone-loss language',
    normalized: 'halo bone-loss pattern described',
    patterns: [/\b(halo lesion|halo bone loss|halo)\b/]
  },
  sinusTract: {
    field: 'symptoms',
    label: 'Sinus tract, draining sinus, parulis, or fistula',
    normalized: 'sinus tract/drainage',
    patterns: [/\b(sinus tract|draining sinus|parulis|fistula)\b/],
    excludes: [/\b(no sinus tract|sinus tract absent|without sinus tract)\b/]
  },
  crownOrPost: {
    field: 'artifact_or_restoration_risk',
    label: 'Crown, post, or core present',
    normalized: 'crown/post/core present',
    patterns: [/\b(crown|post\/core|post core|post|core)\b/]
  },
  largeRestoration: {
    field: 'artifact_or_restoration_risk',
    label: 'Large restoration present',
    normalized: 'large restoration present',
    patterns: [/\b(large restoration|large filling|big restoration|large amalgam|large composite|large mod|mod amalgam|mod restoration|deep recurrent decay|deep decay)\b/]
  },
  postAssociatedConcern: {
    field: 'suspected_condition',
    label: 'Fracture concern associated with a post',
    normalized: 'post-associated fracture concern',
    patterns: [/\b(post.{0,30}fracture|fracture.{0,30}post|post-associated|post associated)\b/]
  },
  resorption: {
    field: 'suspected_condition',
    label: 'Resorption concern',
    normalized: 'resorption concern stated by user',
    patterns: [/\b(resorption|resorp|internal resorption|external resorption|cervical resorption|invasive cervical|inflammatory resorption|replacement resorption|ecr)\b/]
  },
  cervicalResorption: {
    field: 'suspected_condition',
    label: 'Cervical or invasive cervical resorption concern',
    normalized: 'cervical/external cervical resorption concern',
    patterns: [/\b(cervical resorption|invasive cervical|external cervical|ecr)\b/]
  },
  locationExtent: {
    field: 'surgical_planning_need',
    label: 'Need to clarify location, extent, type, or perforation relationship',
    normalized: '3D location/extent question',
    patterns: [/\b(location|extent|localize|localization|determine|map|how far|size|buccal|lingual|palatal|perforation concern|restorability|proximity)\b/]
  },
  perforationConcern: {
    field: 'suspected_condition',
    label: 'Perforation concern',
    normalized: 'perforation concern',
    patterns: [/\b(perf|perforation|perforated|strip perf)\b/]
  },
  missedAnatomy: {
    field: 'procedure_context',
    label: 'Missed canal or anatomy question',
    normalized: 'missed canal/anatomy question',
    patterns: [/\b(mb2|missed canal|missed anatomy|extra canal|untreated canal|root morphology unclear|canal morphology)\b/]
  },
  retreatment: {
    field: 'procedure_context',
    label: 'Retreatment evaluation language',
    normalized: 'retreatment evaluation',
    patterns: [/\b(retreat|re-tx|retx|retreatment|re treatment|retreatment evaluation|failed endo)\b/],
    excludes: [/\b(not retreatment|no retreatment|retreatment not planned)\b/]
  },
  complications: {
    field: 'procedure_context',
    label: 'Endodontic complication language',
    normalized: 'endodontic complication/anatomy question',
    patterns: [/\b(separated file|sep file|broken file|separated instrument|ledge|blocked canal|calcified canal|calcification|perforation)\b/]
  },
  calcifiedCanal: {
    field: 'procedure_context',
    label: 'Calcified canal language',
    normalized: 'calcified canal',
    patterns: [/\b(calcified canal|canal calcification|calcified)\b/]
  },
  surgicalPlanningNeed: {
    field: 'surgical_planning_need',
    label: 'Surgical or guide-planning need',
    normalized: 'surgical/guide planning need',
    patterns: [/\b(apico|apicectomy|apicoectomy|presurgical|endo surgery|endodontic surgery|root[- ]?end|surgical guide|guide fabrication|guide planning|surgical extraction|surgery planning)\b/]
  },
  implantPlanning: {
    field: 'procedure_context',
    label: 'Implant planning or implant site assessment',
    normalized: 'implant planning/site assessment',
    patterns: [/\b(implant planning|implant site|implant consult|implant|surgical guide|guide fabrication)\b/],
    excludes: [/\b(no implant|no implant planning)\b/]
  },
  anatomicRisk: {
    field: 'anatomic_risk',
    label: 'Anatomic proximity or risk structure mentioned',
    normalized: 'anatomic risk/proximity',
    patterns: [/\b(ian|inferior alveolar|mandibular canal|mental foramen|max sinus|maxillary sinus|sinus floor|nasal floor|nerve|canal proximity|root proximity|canal overlap|ian overlap|mandibular canal overlap|panoramic overlap|close to canal|canal diversion|darkening of root|sinus proximity|dehiscence|fenestration)\b/],
    excludes: [/\b(no nerve|no .*nerve|no sinus question|no root proximity|no root proximity issue|clear of canal|no canal overlap)\b/]
  },
  measurementNeed: {
    field: 'surgical_planning_need',
    label: 'Ridge, bone, width, height, or measurement need',
    normalized: '3D measurement need',
    patterns: [/\b(ridge width|ridge height|available bone|bone width|bone height|width|height|measure|measurement|sinus floor|ridge)\b/],
    excludes: [/\b(already measured|no measurement needed)\b/]
  },
  trauma: {
    field: 'procedure_context',
    label: 'Trauma history or traumatic dental injury',
    normalized: 'trauma context',
    patterns: [/\b(trauma|trauma hx|trauma history|luxation|avulsion|intrusion|extrusion|displacement|alveolar fracture|immature apex)\b/]
  },
  rootFracture: {
    field: 'suspected_condition',
    label: 'Root or crown-root fracture concern',
    normalized: 'root/crown-root fracture concern',
    patterns: [/\b(root fracture|root fx|horizontal root fracture|crown-root fracture|crown root fracture)\b/],
    excludes: [/\b(no root fracture|root fracture not suspected)\b/]
  },
  alveolarFracture: {
    field: 'suspected_condition',
    label: 'Alveolar fracture concern',
    normalized: 'alveolar fracture concern',
    patterns: [/\b(alveolar fracture|alveolar segment)\b/]
  },
  displacement: {
    field: 'symptoms',
    label: 'Luxation, avulsion, intrusion, extrusion, or displacement',
    normalized: 'tooth displacement/luxation',
    patterns: [/\b(luxation|avulsion|intrusion|extrusion|displacement|displaced)\b/]
  },
  sinusQuestion: {
    field: 'anatomic_risk',
    label: 'Tooth-sinus relationship or sinus question',
    normalized: 'tooth-sinus question',
    patterns: [/\b(tooth sinus|odontogenic sinusitis|mucosal thickening|maxillary sinus|sinus floor|sinus pressure|sinus proximity)\b/],
    excludes: [/\b(no sinus question)\b/]
  },
  impaction: {
    field: 'procedure_context',
    label: 'Impacted tooth language',
    normalized: 'impacted tooth localization question',
    patterns: [/\b(impacted tooth|impacted canine|impaction|impacted third molar|impacted 3rd molar|impacted)\b/],
    excludes: [/\b(no impacted teeth|no impacted tooth|no impaction)\b/]
  },
  ectopicEruption: {
    field: 'procedure_context',
    label: 'Ectopic eruption or transposition language',
    normalized: 'ectopic eruption/transposition',
    patterns: [/\b(ectopic eruption|ectopic|transposition|eruption path unclear)\b/]
  },
  supernumerary: {
    field: 'procedure_context',
    label: 'Supernumerary tooth language',
    normalized: 'supernumerary tooth',
    patterns: [/\b(supernumerary|mesiodens)\b/]
  },
  rootResorptionRisk: {
    field: 'anatomic_risk',
    label: 'Root resorption risk from impacted or ectopic tooth',
    normalized: 'adjacent root resorption/proximity question',
    patterns: [/\b(root resorption from impacted|resorption risk|lateral incisor root|adjacent root|root proximity)\b/]
  },
  extractionPlanning: {
    field: 'procedure_context',
    label: 'Extraction or surgical extraction planning',
    normalized: 'extraction/surgical extraction context',
    patterns: [/\b(ext|exo|extraction|surgical extraction)\b/]
  },
  thirdMolar: {
    field: 'procedure_context',
    label: 'Third molar language',
    normalized: 'third molar relationship question',
    patterns: [/\b(third molar|3rd molar|wisdom tooth|wisdom teeth)\b|#\s*(1|16|17|32)\b/]
  },
  rootMorphologyUnclear: {
    field: '2d_imaging_findings',
    label: 'Root morphology or dilaceration unclear',
    normalized: 'root morphology unclear',
    patterns: [/\b(root morphology unclear|root anatomy unclear|dilaceration|curved roots|ankylosis|canal relationship unclear)\b/]
  },
  ankylosis: {
    field: 'suspected_condition',
    label: 'Ankylosis concern',
    normalized: 'ankylosis concern',
    patterns: [/\b(ankylosis|ankylosed)\b/]
  },
  airway: {
    field: 'procedure_context',
    label: 'Airway or sleep-disordered breathing language',
    normalized: 'airway language',
    patterns: [/\b(airway|sleep apnea|osa|snoring)\b/]
  },
  routineRequest: {
    field: 'caution_notes',
    label: 'Routine scan request or no defined clinical question',
    normalized: 'routine/no defined 3D clinical question',
    patterns: [/\b(routine|screen|check everything|patient wants|friend had one|3d model|ortho record|no unresolved clinical question|2d imaging answers|monitor only|review only)\b/]
  },
  noCurrentSymptoms: {
    field: 'caution_notes',
    label: 'Asymptomatic or no current symptoms',
    normalized: 'asymptomatic/no current symptoms',
    patterns: [/\b(asymptomatic|no symptoms|no current pain|no pain)\b/]
  },
  stableFinding: {
    field: 'caution_notes',
    label: 'Stable or improving finding',
    normalized: 'stable/improving finding',
    patterns: [/\b(stable|unchanged from|small parl unchanged|better overall|healing progressing normally)\b/]
  },
  uncertaintyMarker: {
    field: 'uncertainty_level',
    label: 'Monitor/recheck or uncertainty language',
    normalized: 'uncertainty/monitoring language',
    patterns: [/\b(cbct vs monitor|monitor\?|monitor|watch|recheck|re-evaluate|uncertain|question|periodontal\/endodontic source|endo-perio|endo perio)\b/]
  }
};

const conceptLabels = {
  priorEndo: 'Prior endodontic treatment',
  postEndoSymptoms: 'Post-endodontic symptoms',
  nonhealingLesion: 'Persistent or nonhealing apical lesion language',
  persistentSymptoms: 'Persistent symptoms',
  inconclusive2d: '2D imaging described as inconclusive or unclear',
  periapicalFinding: 'Periapical finding language',
  nonspecificSymptoms: 'Nonspecific or hard-to-localize symptoms',
  pulpTesting: 'Pulp testing language',
  percussionTenderness: 'Tenderness to percussion',
  pulpNecrosis: 'Necrotic pulp language',
  verticalRootFracture: 'VRF-specific language',
  crackedToothPain: 'Cracked cusp/tooth or structural tooth-pain language',
  structuralToothPain: 'Structural tooth-pain language',
  bitingPain: 'Pain on biting or chewing',
  localizedBitingPain: 'Localized biting pain',
  isolatedProbing: 'Isolated deep probing or narrow periodontal defect',
  crownOrPost: 'Crown, post, or core present',
  postAssociatedConcern: 'Post-associated fracture concern',
  largeRestoration: 'Large restoration language',
  jShapedLesion: 'J-shaped lesion language',
  haloLesion: 'Halo lesion language',
  sinusTract: 'Sinus tract or draining sinus',
  resorption: 'Resorption concern',
  cervicalResorption: 'Cervical resorption / ECR language',
  locationExtent: 'Need to determine location or extent',
  missedAnatomy: 'Missed canal/anatomy language',
  retreatment: 'Retreatment evaluation',
  complications: 'Endodontic complication language',
  calcifiedCanal: 'Calcified canal language',
  implantPlanning: 'Implant planning language',
  anatomicRisk: 'Anatomic risk or proximity language',
  measurementNeed: 'Measurement or width/height language',
  trauma: 'Trauma language',
  rootFracture: 'Root fracture language',
  displacement: 'Displacement/luxation language',
  sinusQuestion: 'Sinus or tooth-sinus question',
  impaction: 'Impacted tooth language',
  ectopicEruption: 'Ectopic eruption language',
  airway: 'Airway language',
  extractionPlanning: 'Extraction or surgical extraction planning',
  thirdMolar: 'Third molar language',
  rootMorphologyUnclear: 'Root morphology or dilaceration unclear',
  ankylosis: 'Ankylosis concern',
  supernumerary: 'Supernumerary tooth language',
  rootResorptionRisk: 'Root resorption risk or adjacent-root proximity',
  surgicalPlanningNeed: 'Surgical or guide-planning need',
  sourceUnclear: 'Source or localization unclear',
  conflictingPulpTests: 'Inconsistent or equivocal pulp test results',
  pulpNoResponse: 'No response to pulp testing',
  pulpLingering: 'Lingering, delayed, exaggerated, or heat pain response',
  periodontalModifier: 'Periodontal finding',
  alveolarFracture: 'Alveolar fracture concern',
  perforationConcern: 'Perforation concern',
  routineRequest: 'Routine scan request or no defined clinical question',
  paWnl: 'PA / periapical imaging described as WNL or normal',
  noApicalLesion: 'No apical radiolucency reported',
  noCurrentSymptoms: 'Asymptomatic or no current symptoms',
  stableFinding: 'Stable or improving finding',
  uncertaintyMarker: 'Uncertainty or monitoring language'
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
  return ` ${String(text || '')
    .toLowerCase()
    .replace(/endo\s*ice/g, 'endo ice')
    .replace(/\bre[-\s]?tx\b/g, 'retx')
    .replace(/\bnon[-\s]?responsive\b/g, 'nonresponsive')
    .replace(/\bj[-\s]?shape(d)?\b/g, 'j-shaped')
    .replace(/\bperc\s*\+/g, 'percussion +')
    .replace(/\bpalp\s*\+/g, 'palpation +')
    .replace(/\bbite\s*\+/g, 'bite +')
    .replace(/\bcold\s*-/g, 'cold -')
    .replace(/\bept\s*nr\b/g, 'ept nr')
    .replace(/[?,;:()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

function extractToothOrRegion(normalizedText) {
  const teeth = new Set();

  Array.from(normalizedText.matchAll(/#\s*([1-9]|[12][0-9]|3[0-2])\b/g)).forEach(match => {
    teeth.add(`#${match[1]}`);
  });

  Array.from(normalizedText.matchAll(/\b([1-9]|[12][0-9]|3[0-2])\s*\/\s*([1-9]|[12][0-9]|3[0-2])\b/g)).forEach(match => {
    const context = normalizedText.slice(Math.max(0, match.index - 18), Math.min(normalizedText.length, match.index + match[0].length + 18));
    if (/#|tooth|teeth|incisor|canine|premolar|molar|implant|rct|ext|exo|endo|trauma|root/.test(context)) {
      teeth.add(`#${match[1]}`);
      teeth.add(`#${match[2]}`);
    }
  });

  const toothMatches = normalizedText.matchAll(/\b([1-9]|[12][0-9]|3[0-2])\b/g);
  Array.from(toothMatches).forEach(match => {
    const before = normalizedText.slice(Math.max(0, match.index - 14), match.index);
        if (/\b(tooth|teeth|implant|ext|exo|#)\s*$/.test(before)) {
      teeth.add(`#${match[1]}`);
    }
  });

  const regions = [
    ['upper left', /\b(ul|upper left|maxillary left)\b/],
    ['upper right', /\b(ur|upper right|maxillary right)\b/],
    ['lower left', /\b(ll|lower left|mandibular left)\b/],
    ['lower right', /\b(lr|lower right|mandibular right)\b/],
    ['maxillary posterior', /\b(maxillary posterior|upper posterior)\b/],
    ['mandibular posterior', /\b(mandibular posterior|lower posterior)\b/],
    ['anterior', /\b(anterior|incisor|canine)\b/],
    ['posterior', /\b(posterior|molar|premolar)\b/]
  ]
    .filter(([, pattern]) => pattern.test(normalizedText))
    .map(([label]) => label);

  return [...teeth, ...regions];
}

function uniquePush(target, value) {
  if (value && !target.includes(value)) {
    target.push(value);
  }
}

function emptyClinicalEntities() {
  return {
    tooth_or_region: [],
    procedure_context: [],
    symptoms: [],
    clinical_tests_reported: [],
    clinical_test_results: [],
    periodontal_findings: [],
    '2d_imaging_findings': [],
    prior_treatment_status: [],
    suspected_condition: [],
    anatomic_risk: [],
    surgical_planning_need: [],
    uncertainty_level: [],
    artifact_or_restoration_risk: [],
    matched_guidance_categories: [],
    cbct_relevance: '',
    confidence_level: 'Low',
    input_completeness: {
      category: 'Minimal',
      score: 0,
      present: [],
      missing: [],
      note: 'Limited clinical information was provided.'
    },
    missing_information: [],
    caution_notes: []
  };
}

function conceptsFromText(normalizedText) {
  return Object.entries(concepts).reduce((found, [concept, rule]) => {
    const excluded = (rule.excludes || []).some(pattern => pattern.test(normalizedText));
    const matched = rule.patterns.some(pattern => pattern.test(normalizedText));
    if (matched && !excluded) {
      found.add(concept);
    }
    return found;
  }, new Set());
}

function reducingConceptsFromText(conceptSet) {
  return ['paWnl', 'noApicalLesion', 'stableFinding', 'noCurrentSymptoms', 'uncertaintyMarker', 'routineRequest']
    .reduce((found, concept) => {
      if (conceptSet.has(concept)) {
        found.add(concept);
      }
      return found;
    }, new Set());
}

function assessInputCompleteness(conceptSet, entities) {
  const planningContext = ['implantPlanning', 'extractionPlanning', 'impaction', 'thirdMolar', 'surgicalPlanningNeed'].some(concept => conceptSet.has(concept));
  const planningNeed = planningContext
    && ['anatomicRisk', 'measurementNeed', 'locationExtent', 'surgicalPlanningNeed', 'rootMorphologyUnclear', 'rootResorptionRisk'].some(concept => conceptSet.has(concept));
  const factors = [
    {
      key: 'symptoms',
      label: 'Symptoms described',
      missing: 'Symptoms',
      present: planningNeed || entities.symptoms.length > 0 || ['persistentSymptoms', 'bitingPain', 'sinusTract', 'sourceUnclear'].some(concept => conceptSet.has(concept))
    },
    {
      key: 'clinicalTesting',
      label: 'Clinical testing reported',
      missing: 'Clinical testing',
      present: planningNeed || entities.clinical_tests_reported.length > 0
    },
    {
      key: 'testResults',
      label: 'Test results included',
      missing: 'Test results',
      present: planningNeed || entities.clinical_test_results.length > 0
        || ['percussionTenderness', 'bitingPain', 'isolatedProbing', 'periodontalModifier'].some(concept => conceptSet.has(concept))
    },
    {
      key: 'twoDImaging',
      label: '2D imaging findings included',
      missing: '2D imaging findings',
      present: entities['2d_imaging_findings'].length > 0
    },
    {
      key: 'priorTreatment',
      label: 'Prior treatment status included',
      missing: 'Prior treatment status',
      present: planningNeed || entities.prior_treatment_status.length > 0
        || /\b(no prior rct|no prior endo|no previous rct|untreated tooth|no root canal)\b/.test(entities.normalized_text || '')
    },
    {
      key: 'localizationDifficulty',
      label: 'Localization difficulty described',
      missing: 'Localization or source clarity',
      present: ['sourceUnclear', 'conflictingPulpTests'].some(concept => conceptSet.has(concept))
    },
    {
      key: 'unresolvedQuestion',
      label: 'Unresolved clinical question described',
      missing: 'Unresolved clinical question',
      present: ['uncertaintyMarker', 'inconclusive2d', 'verticalRootFracture', 'crackedToothPain', 'resorption', 'missedAnatomy', 'retreatment', 'impaction', 'extractionPlanning'].some(concept => conceptSet.has(concept))
    },
    {
      key: 'anatomySurgicalConcern',
      label: 'Anatomy or surgical concern described',
      missing: 'Anatomy or surgical concern',
      present: ['anatomicRisk', 'measurementNeed', 'locationExtent', 'surgicalPlanningNeed', 'implantPlanning', 'rootMorphologyUnclear', 'rootResorptionRisk'].some(concept => conceptSet.has(concept))
    }
  ];

  const present = factors.filter(factor => factor.present).map(factor => factor.label);
  const missing = factors.filter(factor => !factor.present).map(factor => factor.missing);
  let category = 'Minimal';
  if (present.length >= 7) {
    category = 'Comprehensive';
  } else if (present.length >= 5) {
    category = 'Moderate';
  } else if (present.length >= 3) {
    category = 'Partial';
  }

  const missingSentence = missing.length
    ? ` Missing: ${missing.slice(0, 4).join(', ')}${missing.length > 4 ? ', and other details' : ''}.`
    : '';
  const note = category === 'Minimal'
    ? `Limited clinical information was provided.${missingSentence} Additional clinical and radiographic detail may change CBCT relevance.`
    : category === 'Partial'
      ? `Interpretation confidence is reduced because some clinical detail was not included.${missingSentence}`
      : category === 'Moderate'
        ? `The note includes several useful clinical details, but additional detail may still change CBCT relevance.${missingSentence}`
        : 'The note includes symptoms, testing/imaging context, and a defined clinical or anatomic question.';

  return { category, score: present.length, present, missing, note };
}

function extractClinicalEntities(normalizedText, conceptSet, matches = []) {
  const entities = emptyClinicalEntities();
  entities.normalized_text = normalizedText;
  entities.tooth_or_region = extractToothOrRegion(normalizedText);

  conceptSet.forEach(concept => {
    const rule = concepts[concept];
    if (rule?.field) {
      uniquePush(entities[rule.field], rule.label);
    }
  });

  matches.forEach(match => uniquePush(entities.matched_guidance_categories, match.guidanceCategory || match.name));

  const hasTesting = conceptSet.has('pulpTesting') || conceptSet.has('percussionTenderness') || conceptSet.has('bitingPain');
  const has2dContext = conceptSet.has('inconclusive2d') || conceptSet.has('paWnl') || conceptSet.has('periapicalFinding') || conceptSet.has('noApicalLesion');
  const has3dQuestion = ['anatomicRisk', 'measurementNeed', 'locationExtent', 'surgicalPlanningNeed', 'missedAnatomy', 'rootMorphologyUnclear', 'rootResorptionRisk'].some(concept => conceptSet.has(concept));
  const hasUncertainty = ['sourceUnclear', 'nonspecificSymptoms', 'conflictingPulpTests', 'uncertaintyMarker', 'inconclusive2d'].some(concept => conceptSet.has(concept));

  entities.uncertainty_level = [
    hasUncertainty ? (conceptSet.has('inconclusive2d') || conceptSet.has('sourceUnclear') ? 'Moderate to high uncertainty in the written note' : 'Some uncertainty in the written note') : '',
    hasTesting && !has2dContext ? 'Testing is reported without clear 2D imaging context' : ''
  ].filter(Boolean);

  if (!entities.tooth_or_region.length) uniquePush(entities.missing_information, 'Specific tooth number or region');
  if (!has2dContext && !conceptSet.has('implantPlanning')) uniquePush(entities.missing_information, 'Whether 2D imaging is normal, limited, or explanatory');
  if (!hasTesting && !conceptSet.has('implantPlanning') && !conceptSet.has('impaction') && !conceptSet.has('extractionPlanning')) uniquePush(entities.missing_information, 'Relevant clinical testing findings, if performed');
  if (!has3dQuestion && matches.some(match => match.alignmentLevel !== 'limited')) uniquePush(entities.missing_information, 'The specific 3D information needed from CBCT');

  if (conceptSet.has('pulpNoResponse') || conceptSet.has('pulpLingering')) {
    uniquePush(entities.caution_notes, 'Pulp test results are treated as reported clinical findings, not as a pulpal diagnosis.');
  }
  if (conceptSet.has('routineRequest') || conceptSet.has('noCurrentSymptoms')) {
    uniquePush(entities.caution_notes, 'Routine requests, asymptomatic notes, and cases already answered by 2D imaging reduce CBCT relevance.');
  }
  if (conceptSet.has('crownOrPost') || conceptSet.has('largeRestoration')) {
    uniquePush(entities.caution_notes, 'Posts, crowns, restorations, and root filling materials can create artifacts that complicate CBCT interpretation.');
  }
  if (!matches.length) {
    uniquePush(entities.caution_notes, 'No clear CBCT-alignment pattern was detected from the information provided.');
  }

  entities.input_completeness = assessInputCompleteness(conceptSet, entities);
  if (['Minimal', 'Partial'].includes(entities.input_completeness.category)) {
    uniquePush(entities.caution_notes, entities.input_completeness.note);
  }

  delete entities.normalized_text;
  return entities;
}

function hasRequiredConcepts(requirements = [], concepts) {
  if (!requirements.length) return true;
  return requirements.some(group => group.every(concept => concepts.has(concept)));
}

function scoreScenario(scenario, concepts, reducingConcepts) {
  let score = 0;
  const matchedConcepts = [];
  const reducingMatches = [];

  Object.entries(scenario.conceptWeights).forEach(([concept, weight]) => {
    if (concepts.has(concept)) {
      score += weight;
      matchedConcepts.push(concept);
    }
  });

  (scenario.comboBonus || []).forEach(combo => {
    if (combo.every(concept => concepts.has(concept))) {
      score += 1;
    }
  });

  Object.entries(scenario.reducers || {}).forEach(([concept, weight]) => {
    if (reducingConcepts.has(concept)) {
      score -= weight;
      reducingMatches.push(concept);
    }
  });

  const requirementsMet = hasRequiredConcepts(scenario.requiresAny, concepts);
  if (!requirementsMet && score >= scenario.threshold) {
    score = scenario.threshold - 0.25;
  }

  const margin = score - scenario.threshold;
  let alignmentLevel = 'limited';
  if (requirementsMet && margin >= 2.5 && reducingMatches.length === 0) {
    alignmentLevel = 'strong';
  } else if (requirementsMet && margin >= 0.75) {
    alignmentLevel = 'moderate';
  }

  if (scenario.maxAlignment === 'moderate' && alignmentLevel === 'strong') {
    alignmentLevel = 'moderate';
  }

  const clear3dNeed = [
    'inconclusive2d',
    'anatomicRisk',
    'measurementNeed',
    'locationExtent',
    'surgicalPlanningNeed',
    'missedAnatomy',
    'complications',
    'calcifiedCanal',
    'rootMorphologyUnclear',
    'rootResorptionRisk'
  ].some(concept => concepts.has(concept));
  const classicVrfCluster = (concepts.has('verticalRootFracture')
    && (concepts.has('isolatedProbing') || concepts.has('jShapedLesion') || concepts.has('haloLesion') || concepts.has('priorEndo')))
    || (scenario.name === 'Suspected vertical root fracture'
      && concepts.has('priorEndo')
      && concepts.has('isolatedProbing')
      && concepts.has('bitingPain'));
  const nonhealingEndoCluster = scenario.name === 'Persistent or nonhealing endodontic symptoms'
    && concepts.has('priorEndo')
    && (concepts.has('nonhealingLesion') || concepts.has('periapicalFinding') || concepts.has('sinusTract'))
    && concepts.has('persistentSymptoms');
  const implantAnatomyCluster = scenario.name === 'Implant planning'
    && concepts.has('implantPlanning')
    && (concepts.has('anatomicRisk') || concepts.has('measurementNeed') || concepts.has('surgicalPlanningNeed'));
  const retreatmentAnatomyCluster = scenario.name === 'Missed anatomy or retreatment evaluation'
    && concepts.has('priorEndo')
    && (concepts.has('missedAnatomy') || concepts.has('complications') || concepts.has('calcifiedCanal'))
    && (concepts.has('inconclusive2d') || concepts.has('retreatment') || concepts.has('missedAnatomy'));
  const surgeryAnatomyCluster = scenario.name === 'Endodontic surgery planning'
    && concepts.has('surgicalPlanningNeed')
    && (concepts.has('anatomicRisk') || concepts.has('inconclusive2d') || concepts.has('locationExtent'));

  const strongClusterMargin = (classicVrfCluster || retreatmentAnatomyCluster || surgeryAnatomyCluster) ? 0.75 : 2;
  if ((classicVrfCluster || nonhealingEndoCluster || implantAnatomyCluster || retreatmentAnatomyCluster || surgeryAnatomyCluster) && requirementsMet && score - scenario.threshold >= strongClusterMargin) {
    alignmentLevel = 'strong';
  }

  if (alignmentLevel === 'strong' && !clear3dNeed && !classicVrfCluster && !nonhealingEndoCluster && !surgeryAnatomyCluster) {
    alignmentLevel = 'moderate';
  }

  if (concepts.has('routineRequest') || (concepts.has('noCurrentSymptoms') && !clear3dNeed)) {
    score = Math.min(score, scenario.threshold + 0.25);
    alignmentLevel = requirementsMet && score >= scenario.threshold ? 'limited' : alignmentLevel;
  }

  if (scenario.name === 'Contradictory or nonspecific signs and symptoms'
    && concepts.has('paWnl')
    && concepts.has('noApicalLesion')
    && !concepts.has('inconclusive2d')
    && !concepts.has('priorEndo')) {
    alignmentLevel = 'limited';
  }

  if (scenario.name === 'Contradictory or nonspecific signs and symptoms'
    && alignmentLevel === 'strong'
    && !concepts.has('priorEndo')
    && !concepts.has('anatomicRisk')
    && !concepts.has('resorption')
    && !concepts.has('verticalRootFracture')) {
    alignmentLevel = 'moderate';
  }

  return {
    ...scenario,
    score,
    matchedConcepts,
    reducingMatches,
    requirementsMet,
    alignmentLevel
  };
}

function matchScenarioText(text) {
  return analyzeScenarioText(text).matches;
}

function analyzeScenarioText(text) {
  const normalizedText = normalizeScenarioText(text);
  const concepts = conceptsFromText(normalizedText);
  const reducingConcepts = reducingConceptsFromText(concepts);
  const matches = guidanceScenarios
    .map(scenario => scoreScenario(scenario, concepts, reducingConcepts))
    .filter(match => match.score >= match.threshold)
    .sort((a, b) => b.score - a.score);
  const entities = extractClinicalEntities(normalizedText, concepts, matches);
  const topAlignment = matches[0]?.alignmentLevel || 'weak';
  entities.confidence_level = confidenceLevelFor(topAlignment, entities.input_completeness.category);
  entities.cbct_relevance = cbctRelevanceSummary(matches, concepts, entities);

  return { matches, concepts, reducingConcepts, entities, normalizedText };
}

function confidenceLevelFor(alignmentLevel, completenessCategory) {
  const base = ({ strong: 'High', moderate: 'Moderate', limited: 'Low', weak: 'Low' })[alignmentLevel] || 'Low';
  const rank = { Low: 0, Moderate: 1, High: 2 };
  const labelForRank = ['Low', 'Moderate', 'High'];
  const maxByCompleteness = {
    Minimal: 'Low',
    Partial: 'Moderate',
    Moderate: 'High',
    Comprehensive: 'High'
  }[completenessCategory] || 'Low';

  return labelForRank[Math.min(rank[base], rank[maxByCompleteness])];
}

function cbctRelevanceSummary(matches, concepts, entities) {
  const completenessPrefix = ['Minimal', 'Partial'].includes(entities.input_completeness.category)
    ? `${entities.input_completeness.note} `
    : '';

  if (!matches.length) {
    return `${completenessPrefix}CBCT relevance appears limited based on the information provided.`.trim();
  }

  const topMatch = matches[0];
  const hasLimited2d = concepts.has('inconclusive2d');
  const has3dNeed = ['anatomicRisk', 'measurementNeed', 'locationExtent', 'surgicalPlanningNeed', 'missedAnatomy', 'rootMorphologyUnclear', 'rootResorptionRisk'].some(concept => concepts.has(concept));
  const hasUncertainty = ['sourceUnclear', 'nonspecificSymptoms', 'conflictingPulpTests', 'persistentSymptoms', 'verticalRootFracture', 'resorption'].some(concept => concepts.has(concept));

  if (topMatch.alignmentLevel === 'strong') {
    return `${completenessPrefix}The note describes a clearer unresolved clinical question with either limited 2D information or a specific 3D anatomy need. CBCT may be considered as a way to help clarify that question, while clinical judgment and lower-exposure alternatives still matter.`.trim();
  }

  if (topMatch.alignmentLevel === 'moderate' || (hasUncertainty && (hasLimited2d || has3dNeed))) {
    return `${completenessPrefix}CBCT may help clarify the clinical question if exam findings and 2D imaging remain inconclusive. The provided text does not make CBCT required.`.trim();
  }

  if (entities.caution_notes.length) {
    return `${completenessPrefix}CBCT relevance appears limited or indirect based on the conservative details in the note.`.trim();
  }

  return `${completenessPrefix}The scenario has some CBCT-related language, but the specific 3D question or 2D limitation is not fully established in the provided text.`.trim();
}

function labelsForConcepts(concepts) {
  return Array.from(concepts)
    .map(concept => conceptLabels[concept])
    .filter(Boolean);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPercent(value) {
  return `${Math.round(value * 100)}%`;
}

function evidenceLinkFor(evidence) {
  return evidence.doiUrl || evidence.studyUrl;
}

function renderEvidenceCards() {
  document.querySelectorAll('[data-evidence-card]').forEach(card => {
    const evidence = evidenceMap[card.dataset.evidenceCard];
    if (!evidence) return;

    const linkText = evidence.doiUrl ? 'Study detail' : 'Evidence basis';
    card.innerHTML = `
      <strong>${escapeHtml(evidence.displayPercent)}</strong>
      <span>${escapeHtml(evidence.cardCopy.headline)}</span>
      <small>${escapeHtml(evidence.cardCopy.detail)}</small>
      <a class="evidence-link" href="${escapeHtml(evidenceLinkFor(evidence))}">${linkText}</a>
    `;
  });
}

function renderEvidenceHighlights() {
  const target = document.getElementById('evidenceHighlights');
  if (!target) return;

  target.innerHTML = evidenceHighlights.map(item => `
    <div>
      <span class="evidence-icon">${item.icon}</span>
      <strong>${escapeHtml(item.percent)}</strong>
      <span>${escapeHtml(item.copy)}</span>
      <a class="evidence-link" href="${escapeHtml(item.link)}">Evidence basis</a>
    </div>
  `).join('');
}

function calculateDecisionImpact(entries) {
  return entries.reduce((totals, entry) => {
    const planImpact = entry.adjusted * entry.item.planRate;
    const diagnosisImpact = entry.adjusted * entry.item.diagnosisRate;

    totals.planImpact += planImpact;
    totals.diagnosisImpact += diagnosisImpact;
    // Primary estimated decisions changed avoids adding treatment-planning and diagnosis rates together
    // for the same case category, because those decisions may overlap within a study population.
    totals.primaryImpact += Math.max(planImpact, diagnosisImpact);
    return totals;
  }, { planImpact: 0, diagnosisImpact: 0, primaryImpact: 0 });
}

function renderAlignmentDetails(target, topMatch, concepts, reducingConcepts, entities = null) {
  const supporting = topMatch
    ? labelsForConcepts(topMatch.matchedConcepts)
    : labelsForConcepts(concepts);
  const reducing = labelsForConcepts(reducingConcepts);
  const limitation = topMatch?.limitation || 'What CBCT may add depends on the clinical question, patient context, image quality, and whether lower-exposure imaging or clinical testing can reasonably answer the question.';

  const supportingList = supporting.length
    ? supporting.map(item => `<li>${escapeHtml(item)}</li>`).join('')
    : '<li>No specific CBCT-related pattern was detected.</li>';
  const reducingList = reducing.length
    ? reducing.map(item => `<li>${escapeHtml(item)}</li>`).join('')
    : '<li>No limiting details were detected in the note text.</li>';
  const entitySections = entities ? [
    ['What was recognized from the text', [
      ...entities.tooth_or_region.map(item => `Tooth/region: ${item}`),
      ...entities.procedure_context,
      ...entities.symptoms,
      ...entities.clinical_tests_reported,
      ...entities.clinical_test_results,
      ...entities.periodontal_findings,
      ...entities['2d_imaging_findings'],
      ...entities.prior_treatment_status,
      ...entities.suspected_condition,
      ...entities.anatomic_risk,
      ...entities.surgical_planning_need,
      ...entities.artifact_or_restoration_risk
    ]],
    ['What was inferred', [
      ...entities.uncertainty_level,
      `Input completeness: ${entities.input_completeness.category} (${entities.input_completeness.score}/8 factors present)`,
      entities.input_completeness.note,
      `CBCT relevance: ${entities.cbct_relevance}`,
      `Confidence: ${entities.confidence_level}`
    ]],
    ['Missing information or caution notes', [
      ...entities.missing_information.map(item => `Missing: ${item}`),
      ...entities.caution_notes
    ]]
  ].map(([heading, items]) => `
    <section>
      <h4>${escapeHtml(heading)}</h4>
      <ul>${(items.length ? items : ['No additional details were extracted.']).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    </section>
  `).join('') : '';

  target.innerHTML = `
    ${entitySections}
    <section>
      <h4>Matched guidance features</h4>
      <ul>${supportingList}</ul>
    </section>
    <section>
      <h4>Details that make the evidence less direct</h4>
      <ul>${reducingList}</ul>
    </section>
    <section>
      <h4>What this may or may not add</h4>
      <p>${escapeHtml(limitation)}</p>
    </section>
  `;
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
      <span>${escapeHtml(match.label)}</span>
      <strong>${escapeHtml(match.codes.join(' or '))}</strong>
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

if (typeof module !== 'undefined') {
  module.exports = {
    analyzeScenarioText,
    matchScenarioText,
    normalizeScenarioText,
    labelsForConcepts,
    conceptLabels,
    evidenceMap,
    studies,
    calculateDecisionImpact,
    appVersion
  };
}

function updateCalculator() {
  const rows = Array.from(document.querySelectorAll('[data-case]'));
  const entries = [];
  let top = { label: '-', value: 0 };
  let projected = 0;

  rows.forEach(input => {
    const key = input.dataset.case;
    const count = Math.ceil(Math.max(0, Number(input.value) || 0));
    const item = indicationWeights[key];
    projected += count;
    entries.push({ item, count, adjusted: count });

    if (count > top.value) {
      top = { label: item.label, value: count };
    }
  });

  const impact = calculateDecisionImpact(entries);
  const monthly = projected;
  const panCount = Math.max(0, Number(document.getElementById('panCount').value) || 0);
  const panFee = Math.max(0, Number(document.getElementById('panFee').value) || 0);
  const cbctFee = Math.max(0, Number(document.getElementById('cbctFee').value) || 0);
  const cbctRevenue = Math.ceil(monthly * cbctFee);
  const panRevenue = Math.ceil(panCount * panFee);

  document.getElementById('monthlyScans').textContent = monthly;
  document.getElementById('quarterScans').textContent = monthly * 3;
  document.getElementById('planImpact').textContent = Math.ceil(impact.planImpact);
  document.getElementById('diagnosisImpact').textContent = Math.ceil(impact.diagnosisImpact);
  document.getElementById('decisionImpactMonthly').textContent = Math.ceil(impact.primaryImpact);
  document.getElementById('decisionImpactQuarterly').textContent = Math.ceil(impact.primaryImpact) * 3;
  document.getElementById('treatmentImpactMonthly').textContent = Math.ceil(impact.planImpact);
  document.getElementById('diagnosticImpactMonthly').textContent = Math.ceil(impact.diagnosisImpact);
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
  const scenarioAnalysis = analyzeScenarioText(text);
  const matches = scenarioAnalysis.matches;
  const title = document.getElementById('recommendationTitle');
  const body = document.getElementById('recommendationText');
  const details = document.getElementById('alignmentDetails');
  const chips = document.getElementById('matchedIndications');
  const responsible = document.getElementById('responsibleUse');
  const cdtReference = document.getElementById('cdtScenarioReference');

  chips.innerHTML = '';
  details.innerHTML = '';
  renderCdtScenarioReference(cdtReference, text);

  if (!text.trim()) {
    title.textContent = 'Enter a scenario to review';
    body.textContent = 'Describe the patient presentation, prior treatment, exam findings, and whether 2D imaging is conclusive.';
    responsible.textContent = '';
    cdtReference.hidden = true;
    cdtReference.innerHTML = '';
    return;
  }

  if (!matches.length) {
    title.textContent = 'No specific CBCT guidance pattern detected';
    body.textContent = 'No specific CBCT-related language was detected in the scenario text. ADA/AAOMR guidance frames imaging around clinical need, patient selection, and whether lower-exposure options can provide the needed information.';
    renderAlignmentDetails(details, null, scenarioAnalysis.concepts, scenarioAnalysis.reducingConcepts, scenarioAnalysis.entities);
    responsible.textContent = 'Add context such as nonhealing endodontic treatment, suspected fracture, resorption, trauma, implant planning, or inconclusive radiographs if those details apply.';
    return;
  }

  const topMatch = matches[0];
  const alignmentPrefix = {
    strong: 'Strong match to published CBCT scenarios',
    moderate: 'Moderate match to published CBCT scenarios',
    limited: 'Limited match to published CBCT scenarios'
  }[topMatch.alignmentLevel];

  title.textContent = `${alignmentPrefix}: ${topMatch.title}`;
  body.textContent = matches.map(match => match.text).join(' ');
  matches.forEach(match => {
    const chip = document.createElement('span');
    chip.textContent = `${match.name} (${match.alignmentLevel})`;
    chips.appendChild(chip);
  });
  renderAlignmentDetails(details, topMatch, scenarioAnalysis.concepts, scenarioAnalysis.reducingConcepts, scenarioAnalysis.entities);

  responsible.textContent = 'Responsible-use reminder: document the clinical question, use limited FOV when possible, optimize exposure for the patient and indication, and interpret findings within the complete clinical context.';
}

function tabForHash(hash) {
  if (!hash || hash === '#calculator' || hash === '#modality') {
    return 'home';
  }

  const id = hash.slice(1);
  if (id.startsWith('cite-')) {
    return 'citations';
  }

  const panel = document.getElementById(id);
  return panel?.dataset.tabPanel || 'home';
}

function setActiveTab(tabName, options = {}) {
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const panels = Array.from(document.querySelectorAll('[data-tab-panel]'));
  const activeTab = tabs.find(tab => tab.dataset.tab === tabName) || tabs[0];
  const activeName = activeTab?.dataset.tab || 'home';

  panels.forEach(panel => {
    panel.hidden = panel.dataset.tabPanel !== activeName;
  });

  tabs.forEach(tab => {
    const isActive = tab.dataset.tab === activeName;
    tab.classList.toggle('is-active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  if (options.scroll !== false) {
    const target = options.targetId ? document.getElementById(options.targetId) : document.querySelector(`[data-tab-panel="${activeName}"]`);
    target?.scrollIntoView({ behavior: options.instant ? 'auto' : 'smooth', block: 'start' });
  }
}

function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', event => {
      event.preventDefault();
      const tabName = tab.dataset.tab || tabForHash(tab.hash);
      const targetId = tabName === 'home' ? 'calculator' : tabName;
      history.pushState(null, '', `#${targetId}`);
      setActiveTab(tabName, { targetId });
    });
  });

  document.querySelectorAll('a[href^="#cite-"]').forEach(link => {
    link.addEventListener('click', event => {
      const targetId = link.hash.slice(1);
      setActiveTab('citations', { targetId });
    });
  });

  window.addEventListener('hashchange', () => {
    setActiveTab(tabForHash(window.location.hash), {
      targetId: window.location.hash.slice(1),
      instant: true
    });
  });

  setActiveTab(tabForHash(window.location.hash), {
    targetId: window.location.hash.slice(1),
    instant: true,
    scroll: Boolean(window.location.hash)
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
      return `<img src="${escapeHtml(img.getAttribute('src'))}" alt="${escapeHtml(img.getAttribute('alt'))}">`;
    }).join('');

    detail.innerHTML = `
      <div class="artifact-expanded-images">${images}</div>
      <div class="artifact-expanded-copy">
        <h3>${escapeHtml(pattern)}</h3>
        <p><strong>How common?</strong> ${escapeHtml(frequency)}</p>
        <p><strong>Typical appearance:</strong> ${escapeHtml(appearance)}</p>
        ${why ? `<p><strong>Why it happens:</strong> ${escapeHtml(why)}</p>` : ''}
        <p><strong>How to check it:</strong> ${escapeHtml(check)}</p>
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

function setupMobileNavBehavior() {
  const tabs = document.querySelector('.tabs');
  if (!tabs) return;

  const mobileQuery = window.matchMedia('(max-width: 700px)');
  let lastScrollY = window.scrollY;
  let ticking = false;

  function syncNav() {
    const currentScrollY = window.scrollY;

    if (!mobileQuery.matches || currentScrollY < 24) {
      tabs.classList.remove('is-mobile-hidden');
      lastScrollY = currentScrollY;
      ticking = false;
      return;
    }

    if (currentScrollY < lastScrollY - 6) {
      tabs.classList.add('is-mobile-hidden');
    } else if (currentScrollY > lastScrollY + 6) {
      tabs.classList.remove('is-mobile-hidden');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(syncNav);
  }, { passive: true });

  mobileQuery.addEventListener('change', syncNav);
  syncNav();
}

if (typeof window !== 'undefined') {
  window.cbctGuideSelfTestResults = runGuideSelfTests();
  renderEvidenceHighlights();
  renderEvidenceCards();

  document.querySelectorAll('[data-case], #panCount, #panFee, #cbctFee').forEach(input => {
    input.addEventListener('input', updateCalculator);
    input.addEventListener('change', updateCalculator);
  });

  document.getElementById('analyzeScenario').addEventListener('click', analyzeScenario);
  document.getElementById('clearScenario').addEventListener('click', () => {
    document.getElementById('scenarioInput').value = '';
    analyzeScenario();
  });

  updateCalculator();
  analyzeScenario();
  setupTabs();
  setupArtifactExpansion();
  setupMobileNavBehavior();
}

