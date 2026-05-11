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
    link: studies.jadaGuidelines2024.doiUrl
  },
  {
    percent: '69%',
    copy: 'In that same JADA endodontic study, the recorded treatment plan was changed, established, or corrected after CBCT review in 69% of evaluated cases overall.',
    link: studies.jadaGuidelines2024.doiUrl
  },
  {
    percent: '35%',
    copy: 'In a separate endodontic before-after study, CBCT information changed the selected endodontic diagnosis for 35% of evaluated teeth.',
    link: studies.endoDiagnosis2015.doiUrl
  }
];

const scenarios = [
  {
    name: 'Persistent or nonhealing endodontic symptoms',
    conceptWeights: { priorEndo: 2, postEndoSymptoms: 2, nonhealingLesion: 2, persistentSymptoms: 1, inconclusive2d: 1.5, periapicalFinding: 1, retreatment: 1, pulpNecrosis: 1, sinusTract: 1.5 },
    comboBonus: [['priorEndo', 'persistentSymptoms'], ['persistentSymptoms', 'inconclusive2d'], ['priorEndo', 'periapicalFinding'], ['pulpNecrosis', 'periapicalFinding'], ['sinusTract', 'inconclusive2d']],
    requiresAny: [['priorEndo'], ['retreatment'], ['postEndoSymptoms'], ['nonhealingLesion'], ['periapicalFinding']],
    reducers: { paWnl: 2, noApicalLesion: 2, stableFinding: 1.5, noCurrentSymptoms: 1.5, uncertaintyMarker: 0.5 },
    threshold: 3,
    title: 'This scenario matches published guidance for previously treated or nonhealing teeth.',
    text: 'AAE/AAOMR guidance discusses CBCT as a consideration for previously treated teeth that are not healing or remain symptomatic when 2D imaging does not answer the question. ADA/AAOMR guidance still starts with history, exam, and lower-exposure imaging when those provide enough information.',
    limitation: 'The evidence is more directly relevant when the note describes prior endodontic treatment, persistent symptoms, post-endodontic symptoms, or a persistent apical finding. Normal or noncontributory 2D findings make apical pathology evidence less direct.'
  },
  {
    name: 'Contradictory or nonspecific signs and symptoms',
    conceptWeights: { nonspecificSymptoms: 2, persistentSymptoms: 1, inconclusive2d: 1.5, pulpTesting: 0.75, percussionTenderness: 0.75 },
    comboBonus: [['nonspecificSymptoms', 'inconclusive2d'], ['nonspecificSymptoms', 'pulpTesting'], ['pulpTesting', 'percussionTenderness']],
    reducers: { paWnl: 1, uncertaintyMarker: 0.75 },
    threshold: 2.5,
    title: 'This scenario matches published guidance for unclear signs or symptoms.',
    text: 'AAE/AAOMR guidance discusses limited-FOV CBCT as a consideration when signs or symptoms are contradictory, hard to localize, or not answered by exam and 2D imaging. Field of view and exposure remain patient-specific clinical decisions.'
  },
  {
    name: 'Suspected vertical root fracture',
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
    conceptWeights: { resorption: 3, locationExtent: 1.5, trauma: 0.5, cervicalResorption: 1 },
    comboBonus: [['resorption', 'locationExtent']],
    threshold: 3,
    title: 'This scenario matches published guidance for mapping resorption.',
    text: 'AAE/AAOMR guidance discusses CBCT for locating and differentiating internal and external resorption and understanding its extent. ADA/AAOMR responsible-use principles still apply: use the field size and exposure that answer the clinical question without unnecessary exposure.'
  },
  {
    name: 'Missed anatomy or retreatment evaluation',
    conceptWeights: { priorEndo: 1.5, missedAnatomy: 2.5, retreatment: 2, complications: 1.5, calcifiedCanal: 1 },
    comboBonus: [['priorEndo', 'missedAnatomy'], ['missedAnatomy', 'inconclusive2d'], ['retreatment', 'missedAnatomy'], ['retreatment', 'complications']],
    reducers: { paWnl: 0.5, noCurrentSymptoms: 1.25, uncertaintyMarker: 0.25 },
    threshold: 3,
    title: 'This scenario matches published guidance for retreatment or anatomy clarification.',
    text: 'This wording suggests a retreatment or anatomy question, such as missed canal anatomy, calcification, perforation, or a separated instrument. CBCT information is framed here as educational context only and still requires clinical correlation and responsible-use selection.'
  },
  {
    name: 'Implant planning',
    conceptWeights: { implantPlanning: 2.5, anatomicRisk: 2, measurementNeed: 1.5, inconclusive2d: 0.5 },
    comboBonus: [['implantPlanning', 'anatomicRisk'], ['implantPlanning', 'measurementNeed']],
    reducers: { uncertaintyMarker: 0.25 },
    threshold: 3,
    title: 'This scenario matches published guidance for 3D anatomic assessment.',
    text: 'AAE/AAOMR endodontic guidance includes surgical implant placement as a CBCT consideration, and ADA/AAOMR patient-selection guidance discusses CBCT when 3D anatomy is needed and 2D imaging does not provide enough information.'
  },
  {
    name: 'Trauma',
    conceptWeights: { trauma: 2.5, rootFracture: 1.5, displacement: 1, resorption: 0.5 },
    comboBonus: [['trauma', 'rootFracture'], ['trauma', 'resorption']],
    threshold: 2.5,
    title: 'This scenario may match published guidance for localized dentoalveolar trauma.',
    text: 'AAE/AAOMR guidance discusses limited-FOV CBCT for localized dentoalveolar trauma, including root fractures, luxation, displacement, or localized alveolar fracture, when additional anatomy may help clarify the clinical question.'
  },
  {
    name: 'Sinus or odontogenic source',
    conceptWeights: { sinusQuestion: 2, periapicalFinding: 1.5, sinusTract: 1.5, priorEndo: 0.5 },
    comboBonus: [['sinusQuestion', 'periapicalFinding'], ['sinusQuestion', 'priorEndo']],
    reducers: { paWnl: 0.75, uncertaintyMarker: 0.25 },
    threshold: 2.5,
    title: 'This scenario matches published guidance for reviewing the tooth-sinus relationship.',
    text: 'When 2D imaging cannot show the relationship between maxillary roots, periapical findings, cortical boundaries, and the sinus floor, limited-FOV CBCT may help clarify the anatomy. Findings still require clinical history, full image interpretation, and referral when the pattern is not odontogenic.'
  },
  {
    name: 'Impacted or ectopic tooth position',
    conceptWeights: { impaction: 2.5, ectopicEruption: 2, anatomicRisk: 1.5, inconclusive2d: 1 },
    comboBonus: [['impaction', 'anatomicRisk'], ['ectopicEruption', 'inconclusive2d']],
    threshold: 2.5,
    title: 'This scenario matches published guidance for impacted or ectopic tooth localization.',
    text: 'This wording suggests an impacted or ectopic eruption localization question, such as root proximity or unclear position on 2D imaging. The guide frames this as evidence-informed context and does not determine whether imaging is required.'
  },
  {
    name: 'Airway screening',
    conceptWeights: { airway: 2.5, measurementNeed: 0.5 },
    comboBonus: [],
    threshold: 2.5,
    title: 'Airway language alone does not create a routine CBCT screening indication.',
    text: 'Airway volume can be viewed on CBCT, but ADA/AAOMR responsible-use guidance centers clinical benefit, radiation risk, and patient selection. CBCT context is strongest when 3D information is needed for a defined dental or airway-related clinical question.'
  }
];

const shorthandExpansions = [
  { pattern: /\bparl\b/, phrase: ' periapical radiolucency periapical finding ' },
  { pattern: /\bpa\b(?!\s*(wnl|normal|looks normal))/, phrase: ' periapical radiograph two dimensional imaging ' },
  { pattern: /\bpano\b|\bpan\b|\bpanoramic\b/, phrase: ' panoramic radiograph two dimensional imaging ' },
  { pattern: /\brct\b|\bnsrct\b|\bendo tx\b|\broot canal\b/, phrase: ' prior endodontic treatment root canal treatment ' },
  { pattern: /\bretreat\b|\bretx\b|\bretreatment\b/, phrase: ' retreatment evaluation previously treated tooth ' },
  { pattern: /\bvrf\b(?!\s*(not suspected|unlikely|ruled out))/, phrase: ' vertical root fracture concern ' },
  { pattern: /\bj[- ]?shape(d)?\b|\bj shaped lesion\b/, phrase: ' j shaped lesion vertical root fracture concern ' },
  { pattern: /\bpa wnl\b|\bpa (looks )?normal\b|\bperiapical wnl\b|\bperiapical normal\b/, phrase: ' periapical radiograph within normal limits ' },
  { pattern: /\bcbct vs monitor\b|\bmonitor\b|\bwatch\b|\bre-evaluate\b|\brecheck\b/, phrase: ' uncertainty marker monitor consideration ' },
  { pattern: /\bttp\b|\btender to percussion\b|\bpercussion\b/, phrase: ' tender to percussion persistent symptoms ' },
  { pattern: /\bbite test\b|\bpain on biting\b|\bpain chewing\b|\bpain on chewing\b|\bchewing pain\b|\bbite\b|\bhurts on (nuts|popcorn|hard foods?)\b/, phrase: ' pain on biting biting pain structural tooth pain ' },
  { pattern: /\bcrack suspected\b|\bsuspect crack\b|\bcracked\b|\bcrack line\b/, phrase: ' cracked tooth structural tooth pain ' },
  { pattern: /\bcold.{0,40}(inconsistent|sometimes|no response|lingers)\b|\b(inconsistent|contradictory).{0,40}cold\b/, phrase: ' contradictory nonspecific symptoms pulp testing ' },
  { pattern: /\bcold test\b|\bcold\b|\bept\b|\belectric pulp\b/, phrase: ' pulp testing sensibility testing ' },
  { pattern: /\bsap\b/, phrase: ' symptomatic apical periodontitis percussion tenderness periapical symptoms ' },
  { pattern: /\baap\b/, phrase: ' asymptomatic apical periodontitis periapical finding ' },
  { pattern: /\bsip\b/, phrase: ' symptomatic irreversible pulpitis pulp testing pain symptoms ' },
  { pattern: /\bnecrotic\b|\bnecrosis\b|\bnecrotic pulp\b/, phrase: ' necrotic pulp endodontic diagnosis context ' },
  { pattern: /\bmb2\b|\bmissed canal\b|\bmissed anatomy\b|\bextra canal\b|\buntreated canal\b/, phrase: ' missed canal missed anatomy endodontic anatomy context ' },
  { pattern: /\bcalcified canal\b|\bcalcification\b|\bcalcified\b/, phrase: ' calcified canal canal calcification endodontic anatomy context ' },
  { pattern: /\bperf\b|\bperforation\b|\bperforated\b/, phrase: ' perforation endodontic complication ' },
  { pattern: /\bseparated file\b|\bsep file\b|\bbroken file\b|\bseparated instrument\b/, phrase: ' separated file endodontic complication ' },
  { pattern: /\binternal resorption\b|\binternal resorp\b/, phrase: ' internal resorption resorption location extent ' },
  { pattern: /\bexternal resorption\b|\bexternal resorp\b/, phrase: ' external resorption resorption location extent ' },
  { pattern: /\bcervical resorption\b|\becr\b|\bexternal cervical\b/, phrase: ' cervical resorption external cervical resorption location extent ' },
  { pattern: /\b(?<!no )sinus tract\b|\bdraining sinus\b|\bparulis\b|\bfistula\b/, phrase: ' sinus tract draining sinus periapical finding ' },
  { pattern: /\bimplant site\b|\bimplant consult\b|\bimplant planning\b|\bimplant\b/, phrase: ' implant planning implant site assessment ' },
  { pattern: /\bimpacted tooth\b|\bimpacted canine\b|\bimpaction\b|\bimpacted\b/, phrase: ' impacted tooth impaction localization ' },
  { pattern: /\bectopic eruption\b|\bectopic\b/, phrase: ' ectopic eruption localization ' },
  { pattern: /\bian\b|\binferior alveolar nerve\b|\bmental foramen\b|\bnerve\b/, phrase: ' inferior alveolar nerve anatomic risk ' }
];

const conceptPatterns = {
  priorEndo: /\b(prior endodontic|previously treated|root canal treatment|after endodontic|following endodontic|rct)\b/,
  postEndoSymptoms: /\b(post endodontic symptoms|after endodontic|following endodontic|rct.{0,25}(pain|symptoms|ttp)|root canal treatment.{0,25}(pain|symptoms|ttp))\b/,
  nonhealingLesion: /\b(nonhealing lesion|persistent apical lesion|persistent lesion|non healing lesion|not healing)\b/,
  persistentSymptoms: /\b(persistent|still|nonhealing|not healing|failed|symptoms|pain|tender to percussion|periapical symptoms)\b/,
  inconclusive2d: /\b(inconclusive|unclear|not clear|cannot see|two dimensional imaging|2d inconclusive|pa inconclusive|pano unclear|pano inconclusive)\b/,
  periapicalFinding: /\b(periapical radiolucency|periapical finding|parl|lesion|radiolucency|apical periodontitis)\b/,
  nonspecificSymptoms: /\b(cannot localize|hard to localize|nonspecific|contradictory|unclear pain|referred pain)\b/,
  pulpTesting: /\b(pulp testing|sensibility testing|cold test|electric pulp|ept|irreversible pulpitis)\b/,
  percussionTenderness: /\b(tender to percussion|percussion tenderness|ttp|percussion)\b/,
  pulpNecrosis: /\b(necrotic pulp|necrotic|necrosis)\b/,
  verticalRootFracture: /\b(vertical root fracture|vrf|vertical fracture|root fracture concern)\b/,
  crackedToothPain: /\b(cracked cusp|cracked tooth|cusp fracture|fractured cusp|cracked restoration)\b/,
  structuralToothPain: /\b(structural tooth pain|pain chewing|pain on chewing|chewing pain)\b/,
  bitingPain: /\b(pain on biting|biting pain|bite test)\b/,
  localizedBitingPain: /\b(localized biting pain|localized pain on biting|pain on biting tooth|biting pain tooth)\b/,
  isolatedProbing: /\b(isolated probing|isolated pocket|narrow pocket|probing defect|9mm pocket|deep pocket|\d{1,2}mm isolated)\b/,
  crownOrPost: /\b(crown|post|core)\b/,
  postAssociatedConcern: /\b(post associated|post-associated|post fracture|fracture around post|post.{0,30}fracture|fracture.{0,30}post)\b/,
  largeRestoration: /\b(large restoration|large filling|big restoration|large amalgam|large composite|large mod|mod restoration|large mod restoration)\b/,
  jShapedLesion: /\b(j shaped lesion|j-shaped lesion)\b/,
  haloLesion: /\b(halo lesion|halo bone loss|halo)\b/,
  resorption: /\b(resorption|resorp|internal resorption|external resorption|cervical resorption|ecr)\b/,
  cervicalResorption: /\b(cervical resorption|external cervical|ecr)\b/,
  locationExtent: /\b(location|extent|localize|localization|determine|map|how far|size)\b/,
  missedAnatomy: /\b(missed canal|missed anatomy|mb2|extra canal|untreated canal|endodontic anatomy context)\b/,
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

const conceptExclusionPatterns = {
  priorEndo: /\b(no prior rct|no previous rct|no prior endodontic|no root canal|untreated tooth)\b/,
  persistentSymptoms: /\b(no symptoms|asymptomatic|no current pain|no pain)\b/,
  periapicalFinding: /\b(no parl|without parl|no periapical radiolucency|no apical lesion)\b/,
  isolatedProbing: /\b(no isolated probing|no isolated pocket|probing wnl|probing within normal limits|periodontal chart wnl|no narrow pocket|no deep pocket)\b/,
  sinusTract: /\b(no sinus tract|sinus tract absent|without sinus tract)\b/,
  sinusQuestion: /\b(no sinus tract|sinus tract absent|without sinus tract)\b/,
  verticalRootFracture: /\b(no vrf|vrf unlikely|vrf not suspected|no vertical root fracture)\b/,
  rootFracture: /\b(no root fracture|root fracture not suspected|vrf not suspected)\b/,
  retreatment: /\b(not retreatment|no retreatment|retreatment not planned)\b/,
  implantPlanning: /\b(no implant|no implant planning)\b/,
  anatomicRisk: /\b(no nerve|no sinus question|no root proximity|no root proximity issue)\b/,
  measurementNeed: /\b(already measured|no measurement needed)\b/,
  impaction: /\b(no impacted teeth|no impacted tooth|no impaction)\b/
};

const reducingConceptPatterns = {
  paWnl: /\b(pa wnl|pa normal|pa looks normal|periapical radiograph within normal limits|periapical wnl|periapical normal|radiograph wnl|xray wnl|x-ray wnl)\b/,
  noApicalLesion: /\b(no parl|without parl|no periapical radiolucency|no apical lesion)\b/,
  stableFinding: /\b(stable|unchanged)\b/,
  noCurrentSymptoms: /\b(no symptoms|asymptomatic|no current pain|no pain)\b/,
  uncertaintyMarker: /\b(cbct vs monitor|monitor\?|monitor consideration|watch|recheck|re-evaluate|uncertain)\b/
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
  paWnl: 'PA / periapical imaging described as WNL or normal',
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
  const base = ` ${text.toLowerCase().replace(/[?#,;:()/]/g, ' ')} `;
  const expansions = shorthandExpansions
    .filter(rule => rule.pattern.test(base))
    .map(rule => rule.phrase)
    .join(' ');

  return `${base} ${expansions}`.replace(/\s+/g, ' ').trim();
}

function conceptsFromText(normalizedText) {
  return Object.entries(conceptPatterns).reduce((found, [concept, pattern]) => {
    const exclusion = conceptExclusionPatterns[concept];
    if (pattern.test(normalizedText) && !(exclusion && exclusion.test(normalizedText))) {
      found.add(concept);
    }
    return found;
  }, new Set());
}

function reducingConceptsFromText(normalizedText) {
  return Object.entries(reducingConceptPatterns).reduce((found, [concept, pattern]) => {
    if (pattern.test(normalizedText)) {
      found.add(concept);
    }
    return found;
  }, new Set());
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

  scenario.comboBonus.forEach(combo => {
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
  const reducingConcepts = reducingConceptsFromText(normalizedText);
  const matches = scenarios
    .map(scenario => scoreScenario(scenario, concepts, reducingConcepts))
    .filter(match => match.score >= match.threshold)
    .sort((a, b) => b.score - a.score);

  return { matches, concepts, reducingConcepts };
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

function renderAlignmentDetails(target, topMatch, concepts, reducingConcepts) {
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

  target.innerHTML = `
    <section>
      <h4>Supporting features</h4>
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
    calculateDecisionImpact
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
    renderAlignmentDetails(details, null, scenarioAnalysis.concepts, scenarioAnalysis.reducingConcepts);
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
  renderAlignmentDetails(details, topMatch, scenarioAnalysis.concepts, scenarioAnalysis.reducingConcepts);

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
}

