import { FamilyMemberProfile, UserEmergencyProfile, EmergencyCase, MedicalRecord, InsurancePolicy, HospitalPreference } from '../types/emergency';

export const CURRENT_LOGGED_IN_USER: UserEmergencyProfile = {
  id: 'usr-jake-001',
  fullName: 'Jake Vance',
  age: 32,
  phone: '+1 (555) 018-9921',
  bloodGroup: 'A+',
  allergies: ['Penicillin', 'Sulfa Antibiotics'],
  medicalConditions: ['Mild Exercise-Induced Asthma'],
  medications: ['Albuterol Sulfate Inhaler (90mcg PRN)'],
  medicalHistory: ['Arthroscopic Knee Repair (2022)', 'No Adverse Anesthesia Reactions'],
  preferredHospitals: [
    { name: 'St. Jude Comprehensive Trauma Center', distance: '3.2 miles', traumaLevel: 'Level 1 Trauma' },
    { name: 'Metro Health Academic Medical Pavilion', distance: '4.8 miles', traumaLevel: 'Level 1 Trauma & Cardiac Care' }
  ],
  insuranceInfo: {
    provider: 'Anthem Blue Cross Premier Gold PPO',
    policyNumber: 'ANT-902-849201',
    groupNumber: 'GRP-77218',
    validThru: '12/2027',
    verified: true
  },
  affordabilityPreference: 'Comprehensive Private',
  emergencyContacts: [
    { name: 'Claire Vance', relation: 'Spouse', phone: '+1 (555) 019-4821', isPrimary: true },
    { name: 'Robert Vance', relation: 'Father', phone: '+1 (555) 019-3382', isPrimary: false }
  ],
  authorizationStatus: 'Full Authorized'
};

export const INITIAL_FAMILY_PROFILES: FamilyMemberProfile[] = [
  {
    id: 'fam-father-01',
    name: 'Robert Vance',
    relationship: 'Father',
    age: 68,
    profileStatus: 'Active & Verified',
    emergencyProfileAvailability: 'Full Profile Authorized',
    avatarInitials: 'RV',
    authorizedInfo: {
      bloodGroup: 'O+',
      allergies: ['Aspirin (Mild Gastric Bleed)', 'Iodinated Radiocontrast Dye'],
      medicalConditions: ['Coronary Artery Disease', 'Stage 2 Hypertension'],
      medications: ['Lisinopril 20mg daily', 'Atorvastatin 40mg', 'Clopidogrel 75mg'],
      medicalAlerts: ['Pacemaker (Medtronic Azure Dual-Chamber fitted 2021)', 'Stent in LAD (2020)'],
      preferredHospital: 'Metro Health Cardiac & Vascular Institute',
      insuranceStatus: 'Medicare Part A & B + Mutual Medigap Plan F (Verified)',
      emergencyContact: 'Jake Vance (Son) · +1 (555) 018-9921'
    },
    liveLocation: {
      address: '742 Evergreen Terrace, North Ridge District',
      lat: 37.7749,
      lng: -122.4194,
      lastPing: '2 mins ago',
      deviceOnline: true,
      batteryLevel: 84
    }
  },
  {
    id: 'fam-mother-02',
    name: 'Elena Vance',
    relationship: 'Mother',
    age: 65,
    profileStatus: 'Active & Verified',
    emergencyProfileAvailability: 'Full Profile Authorized',
    avatarInitials: 'EV',
    authorizedInfo: {
      bloodGroup: 'A+',
      allergies: ['Cephalosporins (Hives)'],
      medicalConditions: ['Type 2 Diabetes Mellitus', 'Hypothyroidism'],
      medications: ['Metformin 850mg BID', 'Levothyroxine 75mcg'],
      medicalAlerts: ['Diabetic Alert — Carries Dextrose tablets in handbag'],
      preferredHospital: 'St. Jude Comprehensive Medical Center',
      insuranceStatus: 'Medicare Advantage Blue (Verified)',
      emergencyContact: 'Robert Vance (Spouse) · +1 (555) 019-3382'
    },
    liveLocation: {
      address: '742 Evergreen Terrace, North Ridge District',
      lat: 37.7749,
      lng: -122.4194,
      lastPing: '4 mins ago',
      deviceOnline: true,
      batteryLevel: 91
    }
  },
  {
    id: 'fam-grandma-03',
    name: 'Martha Vance',
    relationship: 'Grandmother',
    age: 89,
    profileStatus: 'Active & Verified',
    emergencyProfileAvailability: 'Full Profile Authorized',
    avatarInitials: 'MV',
    authorizedInfo: {
      bloodGroup: 'B+',
      allergies: ['Codeine (Extreme Nausea)', 'Latex Contact Dermatitis'],
      medicalConditions: ['Non-valvular Atrial Fibrillation', 'Osteoporosis', 'History of TIAs'],
      medications: ['Apixaban (Eliquis) 5mg BID', 'Alendronate weekly'],
      medicalAlerts: ['High Fall Risk', 'Anticoagulated with Eliquis (Bleed Precaution)'],
      preferredHospital: 'St. Jude Senior Acute Care Pavilion',
      insuranceStatus: 'AARP Medicare Complete Senior (Verified)',
      emergencyContact: 'Jake Vance (Grandson) · +1 (555) 018-9921'
    },
    liveLocation: {
      address: 'Oakridge Senior Residence, Suite 210, 412 Birch Way',
      lat: 37.7833,
      lng: -122.4167,
      lastPing: 'Live Now',
      deviceOnline: true,
      batteryLevel: 98
    }
  },
  {
    id: 'fam-spouse-04',
    name: 'Claire Vance',
    relationship: 'Spouse',
    age: 34,
    profileStatus: 'Linked Device',
    emergencyProfileAvailability: 'Full Profile Authorized',
    avatarInitials: 'CV',
    authorizedInfo: {
      bloodGroup: 'O-',
      allergies: ['Penicillin (Anaphylaxis risk)'],
      medicalConditions: ['No chronic conditions'],
      medications: ['Prenatal vitamins'],
      medicalAlerts: ['O- Negative Universal Donor', 'Severe Penicillin Allergy'],
      preferredHospital: 'Metro Memorial Women & Children Center',
      insuranceStatus: 'Anthem Blue Cross Premier Gold PPO (Verified)',
      emergencyContact: 'Jake Vance (Spouse) · +1 (555) 018-9921'
    },
    liveLocation: {
      address: 'Downtown Financial Center, Tower 3, 555 Market St',
      lat: 37.7897,
      lng: -122.4014,
      lastPing: '1 min ago',
      deviceOnline: true,
      batteryLevel: 72
    }
  },
  {
    id: 'fam-child-05',
    name: 'Leo Vance',
    relationship: 'Child',
    age: 7,
    profileStatus: 'Active & Verified',
    emergencyProfileAvailability: 'Full Profile Authorized',
    avatarInitials: 'LV',
    authorizedInfo: {
      bloodGroup: 'A+',
      allergies: ['Severe Peanut & Tree Nut Anaphylaxis'],
      medicalConditions: ['Childhood Asthma'],
      medications: ['EpiPen Jr 0.15mg Auto-Injector in backpack'],
      medicalAlerts: ['EpiPen Auto-Injector MUST be administered for nut exposure'],
      preferredHospital: 'Children’s Specialty Acute Pediatric ER',
      insuranceStatus: 'Anthem Dependent Coverage (Verified)',
      emergencyContact: 'Jake Vance (Father) · +1 (555) 018-9921'
    },
    liveLocation: {
      address: 'Lincoln Elementary Campus, 2800 18th St',
      lat: 37.7618,
      lng: -122.4109,
      lastPing: '5 mins ago',
      deviceOnline: true,
      batteryLevel: 65
    }
  },
  {
    id: 'fam-sibling-06',
    name: 'Marcus Vance',
    relationship: 'Sibling',
    age: 31,
    profileStatus: 'Linked Device',
    emergencyProfileAvailability: 'Critical Alerts Only',
    avatarInitials: 'MV',
    authorizedInfo: {
      bloodGroup: 'O+',
      allergies: ['No known drug allergies (NKDA)'],
      medicalConditions: ['None reported'],
      medications: ['None'],
      medicalAlerts: ['No critical medical alerts'],
      preferredHospital: 'St. Jude Comprehensive Medical Center',
      insuranceStatus: 'Kaiser Permanente HMO (Active)',
      emergencyContact: 'Jake Vance (Brother) · +1 (555) 018-9921'
    },
    liveLocation: {
      address: 'Mission Bay Technology Park, 450 16th St',
      lat: 37.7681,
      lng: -122.3922,
      lastPing: '12 mins ago',
      deviceOnline: true,
      batteryLevel: 45
    }
  },
  {
    id: 'fam-relative-07',
    name: 'Arthur Vance',
    relationship: 'Other Relative',
    age: 72,
    profileStatus: 'Emergency Access Granted',
    emergencyProfileAvailability: 'Critical Alerts Only',
    avatarInitials: 'AV',
    authorizedInfo: {
      bloodGroup: 'B+',
      allergies: ['Sulfa drugs'],
      medicalConditions: ['Hypertension', 'Arthritis'],
      medications: ['Amlodipine 5mg'],
      medicalAlerts: ['Limited mobility / cane user'],
      preferredHospital: 'Metro Health Academic Medical Pavilion',
      insuranceStatus: 'Medicare Blue Shield PPO',
      emergencyContact: 'Jake Vance (Nephew) · +1 (555) 018-9921'
    },
    liveLocation: {
      address: 'Sunset District, 1420 24th Ave',
      lat: 37.7592,
      lng: -122.4826,
      lastPing: '25 mins ago',
      deviceOnline: true,
      batteryLevel: 80
    }
  }
];

export const INITIAL_ACTIVE_CASES: EmergencyCase[] = [
  {
    id: 'RESQ-8492',
    targetMode: 'FAMILY',
    patientName: 'Robert Vance',
    requesterName: 'Jake Vance',
    relationship: 'Father',
    patientAge: 68,
    createdAt: '8 mins ago',
    location: {
      type: 'Live Location',
      address: '742 Evergreen Terrace, North Ridge District',
      lat: 37.7749,
      lng: -122.4194,
      details: 'Patient in living room couch. Front porch unlocked.'
    },
    emergency: {
      type: 'Chest Pain / Acute Cardiac Distress',
      severity: 'CRITICAL (Priority 1)',
      symptoms: ['Substernal crushing chest pain radiating to left arm', 'Diaphoresis (heavy sweating)', 'Shortness of breath'],
      notes: 'History of LAD stent. Patient took one sublingual nitroglycerin tablet 5 mins ago with minimal relief.',
      consciousness: 'Conscious & Alert',
      breathing: 'Labored / Struggling'
    },
    medicalInfo: {
      bloodGroup: 'O+',
      allergies: ['Aspirin (Mild Gastric Bleed)', 'Iodinated Radiocontrast Dye'],
      medicalConditions: ['Coronary Artery Disease', 'Stage 2 Hypertension'],
      medications: ['Lisinopril 20mg daily', 'Atorvastatin 40mg', 'Clopidogrel 75mg'],
      medicalAlerts: ['Pacemaker (Medtronic Azure Dual-Chamber fitted 2021)', 'Stent in LAD (2020)'],
      sourceLabel: 'Authorized Family Medical Record (Self-Authorized)'
    },
    hospitalPreference: {
      name: 'Metro Health Cardiac & Vascular Institute',
      distance: '2.4 miles',
      traumaTier: 'Level 1 Cardiac Catheterization Ready',
      etaMinutes: 6
    },
    insurance: 'Medicare Part A & B + Mutual Medigap Plan F (Verified)',
    currentStage: 'AMBULANCE',
    stageProgress: {
      emergencyClick: { time: '09:05 AM', done: true },
      ambulance: { time: '09:06 AM', done: true, unit: 'Medic Unit 14 (ALS)', etaMin: 3 },
      doctor: { time: '09:07 AM', done: true, doctorName: 'Dr. Katherine Aris, MD' },
      hospital: { time: '09:08 AM', done: false, bay: 'Cath Lab Bay 2' },
      handover: { done: false }
    },
    ambulance: {
      unitId: 'ALS Medic 14',
      driverParamedic: 'Sergeant M. Torres (Paramedic Specialist)',
      medic: 'C. Henderson (Critical Care Paramedic)',
      phone: '+1 (555) 019-9114',
      etaMinutes: 3,
      status: 'En Route',
      currentLocation: { lat: 37.7785, lng: -122.414 }
    },
    doctor: {
      name: 'Dr. Katherine Aris, MD',
      specialty: 'Attending Emergency Physician & Acute Cardiac Lead',
      hospitalAffiliation: 'Metro Health Trauma & Cardiac Center',
      status: 'Connected',
      phone: '+1 (555) 018-3829',
      instructions: [
        'Keep patient seated upright at 45 degrees to ease cardiac workload',
        'Do not give additional aspirin due to patient documented gastric allergy',
        'Loosen restrictive clothing around collar and chest',
        'Paramedic crew ALS 14 is equipped with 12-lead ECG and telemetry link'
      ],
      vitals: {
        heartRate: 104,
        bp: '154/92 mmHg',
        spo2: 95,
        respRate: 22
      }
    },
    hospital: {
      name: 'Metro Health Cardiac & Vascular Institute',
      address: '1001 Potrero Ave, Trauma Wing Entrance',
      receivingDepartment: 'Acute Cardiac & Emergency Resuscitation',
      allocatedBay: 'Cath Lab Bay 2 (Reserved)',
      leadSurgeonPhysician: 'Dr. M. Chen (Interventional Cardiologist on duty)',
      status: 'Bay Prepped'
    },
    handover: {
      clinicalSummary: 'Emergency CAD/anginal event. Pre-arrival 12-lead telemetry transmitted to hospital Cath team.'
    }
  },
  {
    id: 'RESQ-9104',
    targetMode: 'FRIEND_OTHER',
    patientName: 'Sarah Jenkins',
    requesterName: 'Jake Vance',
    relationship: 'Friend',
    patientAge: 29,
    createdAt: '14 mins ago',
    location: {
      type: 'Map Pin',
      address: 'Central Park West & 72nd St Crosswalk',
      lat: 37.7725,
      lng: -122.4289,
      details: 'On sidewalk near the pedestrian bench. Bicycle accident.'
    },
    emergency: {
      type: 'Trauma / Road & Bicycle Collision',
      severity: 'URGENT (Priority 2)',
      symptoms: ['Right shoulder deformity', 'Laceration on right forearm', 'Mild dizziness, no loss of consciousness'],
      notes: 'Colleague was riding bicycle, collided with turning vehicle at low speed. Helmet was worn.',
      consciousness: 'Conscious & Alert',
      breathing: 'Normal'
    },
    medicalInfo: {
      bloodGroup: 'NOT PROVIDED',
      allergies: ['NOT PROVIDED'],
      medicalConditions: ['NOT PROVIDED'],
      medications: ['NOT PROVIDED'],
      medicalAlerts: ['NOT PROVIDED — Third-party emergency privacy protection'],
      sourceLabel: 'Requester Input (Friend / Third Party)',
      isFriendOrUnknown: true
    },
    hospitalPreference: {
      name: 'St. Jude Comprehensive Trauma Center',
      distance: '1.9 miles',
      traumaTier: 'Level 1 Trauma & Orthopedic Service',
      etaMinutes: 5
    },
    insurance: 'NOT PROVIDED',
    currentStage: 'DOCTOR',
    stageProgress: {
      emergencyClick: { time: '08:59 AM', done: true },
      ambulance: { time: '09:01 AM', done: true, unit: 'Rescue Unit 08 (BLS)', etaMin: 1 },
      doctor: { time: '09:03 AM', done: true, doctorName: 'Dr. Tariq Al-Mansoor, MD' },
      hospital: { time: '09:04 AM', done: false, bay: 'Trauma Bay 4' },
      handover: { done: false }
    },
    ambulance: {
      unitId: 'Rescue 08',
      driverParamedic: 'Officer D. Wu',
      medic: 'J. Reynolds, EMT-P',
      phone: '+1 (555) 019-8808',
      etaMinutes: 1,
      status: 'Arrived at Patient',
      currentLocation: { lat: 37.7725, lng: -122.4289 }
    },
    doctor: {
      name: 'Dr. Tariq Al-Mansoor, MD',
      specialty: 'Trauma & Emergency Orthopedic Specialist',
      hospitalAffiliation: 'St. Jude Regional Trauma Center',
      status: 'Connected',
      phone: '+1 (555) 018-7711',
      instructions: [
        'Do not attempt to manipulate or push the right shoulder back into place',
        'Apply gentle sterile direct pressure on the forearm laceration with clean cloth',
        'Keep patient sitting calm on bench; avoid giving oral food or liquids in case imaging/sedation needed'
      ],
      vitals: {
        heartRate: 88,
        bp: '128/80 mmHg',
        spo2: 99,
        respRate: 16
      }
    },
    hospital: {
      name: 'St. Jude Comprehensive Trauma Center',
      address: '1001 Potrero Ave, North Entrance Bay 4',
      receivingDepartment: 'Acute Emergency & Orthopedic Trauma',
      allocatedBay: 'Trauma Bay 4',
      leadSurgeonPhysician: 'Dr. H. Rodriguez, MD (Trauma Surgeon)',
      status: 'Bay Prepped'
    },
    handover: {
      clinicalSummary: 'Right clavicular / AC joint trauma. Paramedic immobilizing arm in sling.'
    }
  }
];

export const EMERGENCY_TYPE_OPTIONS = [
  {
    id: 'cardiac',
    label: 'Chest Pain / Cardiac Arrest',
    desc: 'Severe chest pressure, radiating arm/jaw pain, suspected heart attack, sudden collapse',
    severity: 'CRITICAL (Priority 1)' as const,
    icon: 'Activity'
  },
  {
    id: 'breathing',
    label: 'Severe Difficulty Breathing',
    desc: 'Choking, severe asthma attack, anaphylaxis, turning blue, gasping',
    severity: 'CRITICAL (Priority 1)' as const,
    icon: 'Wind'
  },
  {
    id: 'trauma',
    label: 'Severe Trauma / Accident / Bleeding',
    desc: 'Car crash, major blood loss, deep wound, industrial injury, fracture',
    severity: 'CRITICAL (Priority 1)' as const,
    icon: 'AlertTriangle'
  },
  {
    id: 'stroke',
    label: 'Stroke Symptoms (FAST)',
    desc: 'Facial drooping, arm weakness, slurred speech, sudden confusion or vision loss',
    severity: 'CRITICAL (Priority 1)' as const,
    icon: 'Brain'
  },
  {
    id: 'unconscious',
    label: 'Unconscious / Unresponsive',
    desc: 'Fainted, cannot wake up, unresponsive to voice or pinch',
    severity: 'CRITICAL (Priority 1)' as const,
    icon: 'ZapOff'
  },
  {
    id: 'fall',
    label: 'Severe Fall / Head Injury',
    desc: 'Elderly fall, head trauma, spinal suspicion, unable to move',
    severity: 'URGENT (Priority 2)' as const,
    icon: 'ArrowDown'
  },
  {
    id: 'allergic',
    label: 'Severe Allergic Reaction',
    desc: 'Swelling of throat, lips, hives, food or insect venom anaphylaxis',
    severity: 'CRITICAL (Priority 1)' as const,
    icon: 'ShieldAlert'
  },
  {
    id: 'other',
    label: 'Other Acute Medical Emergency',
    desc: 'Acute abdominal pain, seizure, high fever seizure, poisoning, etc.',
    severity: 'URGENT (Priority 2)' as const,
    icon: 'Crosshair'
  }
];

export const INITIAL_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    id: 'REC-001',
    patientId: 'usr-jake-001',
    patientName: 'Jake Vance',
    relationship: 'Self',
    title: 'Left Knee Arthroscopic Meniscectomy & Cartilage Debridement',
    category: 'Surgical & Procedures',
    date: '2022-08-14',
    facility: 'St. Jude Comprehensive Orthopedic Center',
    attendingDoctor: 'Dr. Gregory Vance, MD (Orthopedic Surgery)',
    diagnosis: 'Complex Tear of Posterior Horn of Medial Meniscus',
    clinicalSummary: 'Outpatient arthroscopic partial medial meniscectomy. Uneventful recovery. Full weight-bearing restored at 4 weeks. No joint infection.',
    medicationsPrescribed: ['Acetaminophen 500mg PRN', 'Ibuprofen avoided due to mild gastritis'],
    findingsOrResults: 'Grade II chondromalacia patellae. Meniscal rim intact.',
    relevantForEmergency: true,
    lastUpdated: '2026-04-12',
    attachments: [
      { name: 'Surgical_Operative_Note_2022.pdf', size: '1.4 MB', type: 'PDF' },
      { name: 'PostOp_MRI_LeftKnee.dcm', size: '24 MB', type: 'DICOM' }
    ]
  },
  {
    id: 'REC-002',
    patientId: 'usr-jake-001',
    patientName: 'Jake Vance',
    relationship: 'Self',
    title: 'Acute Asthma Exacerbation & Pulmonary Function Spirometry',
    category: 'Hospitalization & Discharge',
    date: '2024-03-10',
    facility: 'Metro Health Emergency Pavilion',
    attendingDoctor: 'Dr. Katherine Aris, MD',
    diagnosis: 'Mild Persistent Asthma with Acute Exercise-Induced Bronchospasm',
    clinicalSummary: 'Presented with wheezing and chest tightness after cold weather run. FEV1 improved 22% post-bronchodilator. Discharged on updated inhaler regimen.',
    medicationsPrescribed: ['Albuterol Sulfate Inhaler 90mcg (2 puffs Q4H PRN)', 'Fluticasone 110mcg daily'],
    findingsOrResults: 'Pre-bronchodilator FEV1: 76% predicted. Post-bronchodilator FEV1: 94% predicted.',
    relevantForEmergency: true,
    lastUpdated: '2026-02-18',
    attachments: [
      { name: 'Spirometry_FlowVolume_Curve.pdf', size: '640 KB', type: 'PDF' }
    ]
  },
  {
    id: 'REC-003',
    patientId: 'usr-jake-001',
    patientName: 'Jake Vance',
    relationship: 'Self',
    title: 'Comprehensive Allergen IgE & Antibiotic Sensitivity Panel',
    category: 'Lab Pathology',
    date: '2023-05-19',
    facility: 'Quest Diagnostics Regional Reference Lab',
    attendingDoctor: 'Dr. Susan Lin, MD (Immunology)',
    diagnosis: 'Severe Penicillin & Sulfa Drug Hypersensitivity (Class 4 IgE)',
    clinicalSummary: 'Confirmed severe IgE mediated allergic response to Penicillin G, Ampicillin, and Trimethoprim-Sulfamethoxazole. Documented on medical alert bracelet.',
    medicationsPrescribed: ['Avoid all beta-lactam and sulfonamide classes. Use macrolides/quinolones if indicated.'],
    findingsOrResults: 'Penicilloyl G specific IgE > 15.2 kU/L (High Positive). Sulfa IgE > 8.4 kU/L.',
    relevantForEmergency: true,
    lastUpdated: '2026-01-05',
    attachments: [
      { name: 'ImmunoCAP_Allergy_Report.pdf', size: '420 KB', type: 'PDF' }
    ]
  },
  {
    id: 'REC-004',
    patientId: 'fam-father-01',
    patientName: 'Robert Vance',
    relationship: 'Father',
    title: 'Percutaneous Coronary Intervention with Drug-Eluting Stent (LAD)',
    category: 'Surgical & Procedures',
    date: '2020-04-18',
    facility: 'Metro Health Cardiac & Vascular Institute',
    attendingDoctor: 'Dr. Marcus Chen, MD (Interventional Cardiology)',
    diagnosis: '90% Proximal Left Anterior Descending (LAD) Stenosis · Unstable Angina',
    clinicalSummary: 'Successful transradial coronary catheterization and placement of 3.0 x 18mm Xience Sierra everolimus-eluting stent in proximal LAD. Residual stenosis 0%. TIMI 3 flow.',
    medicationsPrescribed: ['Aspirin 81mg (discontinued later due to GI bleed)', 'Clopidogrel 75mg daily', 'Atorvastatin 40mg', 'Lisinopril 20mg'],
    findingsOrResults: 'Post-dilation angiogram demonstrated excellent stent apposition and no dissection.',
    relevantForEmergency: true,
    lastUpdated: '2026-08-10',
    attachments: [
      { name: 'Cardiac_Cath_Report_Stent_LAD.pdf', size: '2.8 MB', type: 'PDF' },
      { name: 'Angiogram_CoronaryRun_Cine.mp4', size: '18 MB', type: 'Video' }
    ]
  },
  {
    id: 'REC-005',
    patientId: 'fam-father-01',
    patientName: 'Robert Vance',
    relationship: 'Father',
    title: 'Medtronic Azure Dual-Chamber Pacemaker Implantation',
    category: 'Cardiology & ECG',
    date: '2021-11-09',
    facility: 'Metro Health Cardiac Electrophysiology Lab',
    attendingDoctor: 'Dr. Rachel Sterling, MD (Cardiac Electrophysiologist)',
    diagnosis: 'Symptomatic Bradycardia with High-Grade Second-Degree AV Block',
    clinicalSummary: 'Transvenous implantation of Medtronic Azure XT DR MRI SureScan pacemaker with right atrial and right ventricular active fixation leads. Device interrogation nominal.',
    medicationsPrescribed: ['Maintain Clopidogrel 75mg', 'Lisinopril 20mg'],
    findingsOrResults: 'Pacing threshold RA 0.75V @ 0.4ms, RV 0.6V @ 0.4ms. R-wave amplitude 11.2mV. Battery longevity 11.4 years remaining.',
    relevantForEmergency: true,
    lastUpdated: '2026-07-22',
    attachments: [
      { name: 'Device_Implant_Registration_Card.pdf', size: '890 KB', type: 'PDF' },
      { name: 'CareLink_Remote_Interrogation_2026.pdf', size: '1.1 MB', type: 'PDF' }
    ]
  },
  {
    id: 'REC-006',
    patientId: 'fam-father-01',
    patientName: 'Robert Vance',
    relationship: 'Father',
    title: 'CAD Dispatched Emergency Handover: Angina Event & Nitroglycerin',
    category: 'Emergency Dispatch & Handover',
    date: '2025-06-22',
    facility: 'Metro Health Emergency Trauma Department',
    attendingDoctor: 'Dr. Tariq Al-Mansoor, MD (Attending EMS Physician)',
    diagnosis: 'Acute Coronary Syndrome Rule-Out · Exertional Angina',
    clinicalSummary: 'Paramedic Medic 14 dispatched for acute sub-sternal chest discomfort. Pre-hospital 12-lead transmitted without acute STEMI. Troponins negative x 3. Pacemaker interrogated and functioning normally.',
    medicationsPrescribed: ['Sublingual Nitroglycerin 0.4mg PRN', 'Avoid NSAIDs due to GI sensitivity'],
    findingsOrResults: 'Serial hs-cTnI < 3 ng/L. Normal sinus rhythm paced at 60 bpm.',
    relevantForEmergency: true,
    lastUpdated: '2026-06-23',
    attachments: [
      { name: 'EMS_Handover_Record_RESQ_Case6621.pdf', size: '750 KB', type: 'PDF' },
      { name: '12Lead_ECG_PreHospital.pdf', size: '510 KB', type: 'PDF' }
    ]
  },
  {
    id: 'REC-007',
    patientId: 'fam-grandma-03',
    patientName: 'Martha Vance',
    relationship: 'Grandmother',
    title: 'Non-Valvular Atrial Fibrillation Cardioversion & Anticoagulation',
    category: 'Cardiology & ECG',
    date: '2023-01-20',
    facility: 'St. Jude Senior Acute Care Pavilion',
    attendingDoctor: 'Dr. David Cho, MD (Geriatric Cardiology)',
    diagnosis: 'Paroxysmal Atrial Fibrillation with Rapid Ventricular Response (CHA2DS2-VASc = 5)',
    clinicalSummary: 'Elective direct-current synchronized cardioversion achieved normal sinus rhythm. Anticoagulated with Apixaban for high stroke prophylaxis.',
    medicationsPrescribed: ['Apixaban (Eliquis) 5mg BID', 'Metoprolol Succinate 25mg daily'],
    findingsOrResults: 'Echocardiogram: LVEF 55%, mild left atrial dilation (4.2cm), no mural thrombus.',
    relevantForEmergency: true,
    lastUpdated: '2026-03-01',
    attachments: [
      { name: 'Transthoracic_Echocardiogram_Report.pdf', size: '1.2 MB', type: 'PDF' }
    ]
  },
  {
    id: 'REC-008',
    patientId: 'fam-child-05',
    patientName: 'Leo Vance',
    relationship: 'Child',
    title: 'Pediatric Anaphylaxis Action Plan & Epinephrine Prescription',
    category: 'Prescription & Therapy',
    date: '2023-10-04',
    facility: 'Children’s Specialty Acute Pediatric Clinic',
    attendingDoctor: 'Dr. Anita Patel, MD (Pediatric Allergy & Immunology)',
    diagnosis: 'Severe Peanut & Tree Nut Anaphylaxis (Class 5 IgE > 50 kU/L)',
    clinicalSummary: 'Accidental ingestion of cookie containing trace peanut flour resulting in acute urticaria, lip angioedema, and wheeze. Responded immediately to IM epinephrine. School and caregiver action plan certified.',
    medicationsPrescribed: ['EpiPen Jr 0.15mg Auto-Injector (Twin Pack) - 1 in backpack, 1 in school infirmary', 'Cetirizine 5mg oral daily PRN'],
    findingsOrResults: 'Skin prick test positive (12mm wheal to peanut extract, 8mm to cashew).',
    relevantForEmergency: true,
    lastUpdated: '2026-05-14',
    attachments: [
      { name: 'Pediatric_Anaphylaxis_Emergency_Action_Plan.pdf', size: '1.8 MB', type: 'PDF' }
    ]
  }
];

export const INITIAL_INSURANCE_POLICIES: InsurancePolicy[] = [
  {
    id: 'INS-001',
    patientId: 'usr-jake-001',
    patientName: 'Jake Vance',
    relationship: 'Self',
    isPrimary: true,
    provider: 'Anthem Blue Cross Premier Gold PPO',
    planType: 'Comprehensive PPO',
    policyNumber: 'ANT-902-849201',
    groupNumber: 'GRP-77218',
    subscriberId: 'SUB-881920',
    subscriberName: 'Jake Vance',
    rxBin: '003858',
    rxPcn: 'A4',
    rxGroup: 'ANTHEM99',
    emergencyCopay: '$150 (Waived if Admitted)',
    deductibleMet: '$1,200 of $1,500 Individual',
    networkStatus: 'In-Network Guaranteed',
    claimsPhone: '+1 (800) 555-0199',
    validThru: '12/2027',
    documents: [
      {
        id: 'DOC-01',
        title: 'Anthem Gold PPO Digital Card (Front & Back)',
        fileName: 'Anthem_Card_Jake_2026.pdf',
        uploadDate: '2026-01-10',
        fileSize: '1.4 MB',
        type: 'Card Copy'
      },
      {
        id: 'DOC-02',
        title: 'Emergency Medical & Trauma Benefits Schedule',
        fileName: 'Anthem_Emergency_Coverage_Summary.pdf',
        uploadDate: '2026-01-10',
        fileSize: '2.1 MB',
        type: 'Policy Schedule'
      }
    ]
  },
  {
    id: 'INS-002',
    patientId: 'fam-father-01',
    patientName: 'Robert Vance',
    relationship: 'Father',
    isPrimary: true,
    provider: 'Medicare Part A & B + Mutual of Omaha Medigap Plan F',
    planType: 'Medicare Part A & B + Medigap',
    policyNumber: 'MED-682-19401-A',
    groupNumber: 'MUT-PLAN-F',
    subscriberId: 'MCR-1940182',
    subscriberName: 'Robert Vance',
    rxBin: '012114',
    rxPcn: 'MEDD',
    rxGroup: 'SILVERSCRIPT',
    emergencyCopay: '$0 (100% Covered after Part B Deductible by Plan F)',
    deductibleMet: 'Deductible 100% Satisfied',
    networkStatus: 'In-Network Guaranteed',
    claimsPhone: '+1 (800) 633-4227',
    validThru: 'Lifetime Senior Active',
    documents: [
      {
        id: 'DOC-03',
        title: 'Official Medicare Red, White & Blue Card',
        fileName: 'Medicare_Card_Robert_Vance.pdf',
        uploadDate: '2025-11-01',
        fileSize: '950 KB',
        type: 'Card Copy'
      },
      {
        id: 'DOC-04',
        title: 'Mutual of Omaha Medigap Plan F Coverage Policy',
        fileName: 'Medigap_Supplemental_PlanF.pdf',
        uploadDate: '2025-11-01',
        fileSize: '3.2 MB',
        type: 'Policy Schedule'
      }
    ]
  },
  {
    id: 'INS-003',
    patientId: 'fam-mother-02',
    patientName: 'Elena Vance',
    relationship: 'Mother',
    isPrimary: true,
    provider: 'Medicare Advantage Blue Enhanced (HMO-POS)',
    planType: 'Medicare Advantage',
    policyNumber: 'MAB-419-89214',
    groupNumber: 'GRP-SENIOR8',
    subscriberId: 'MAB-77491',
    subscriberName: 'Elena Vance',
    emergencyCopay: '$90 Copay',
    deductibleMet: '$0 Deductible Plan',
    networkStatus: 'In-Network Guaranteed',
    claimsPhone: '+1 (888) 555-0142',
    validThru: '12/2026',
    documents: [
      {
        id: 'DOC-05',
        title: 'Medicare Advantage Insurance Card',
        fileName: 'MedicareAdvantage_Card_Elena.pdf',
        uploadDate: '2026-01-02',
        fileSize: '1.1 MB',
        type: 'Card Copy'
      }
    ]
  },
  {
    id: 'INS-004',
    patientId: 'fam-child-05',
    patientName: 'Leo Vance',
    relationship: 'Child',
    isPrimary: true,
    provider: 'Anthem Blue Cross Pediatric Dependent Coverage',
    planType: 'Comprehensive PPO',
    policyNumber: 'ANT-902-849201-D1',
    groupNumber: 'GRP-77218',
    subscriberId: 'SUB-881920',
    subscriberName: 'Jake Vance (Parent)',
    emergencyCopay: '$100 Copay',
    deductibleMet: 'Covered under Family Cap',
    networkStatus: 'In-Network Guaranteed',
    claimsPhone: '+1 (800) 555-0199',
    validThru: '12/2027',
    documents: [
      {
        id: 'DOC-06',
        title: 'Anthem Dependent Pediatric Card',
        fileName: 'Leo_Anthem_Card.pdf',
        uploadDate: '2026-01-10',
        fileSize: '820 KB',
        type: 'Card Copy'
      },
      {
        id: 'DOC-07',
        title: 'EpiPen Auto-Injector Prior Authorization Letter',
        fileName: 'EpiPen_PriorAuth_Approved_2026.pdf',
        uploadDate: '2026-02-15',
        fileSize: '650 KB',
        type: 'Prior Auth Letter'
      }
    ]
  },
  {
    id: 'INS-005',
    patientId: 'fam-grandma-03',
    patientName: 'Martha Vance',
    relationship: 'Grandmother',
    isPrimary: true,
    provider: 'AARP Medicare Complete Senior Choice PPO',
    planType: 'Medicare Advantage',
    policyNumber: 'AARP-901-44192',
    groupNumber: 'GRP-AARP77',
    subscriberId: 'AARP-22194',
    subscriberName: 'Martha Vance',
    emergencyCopay: '$75 Copay',
    deductibleMet: '$250 Met',
    networkStatus: 'In-Network Guaranteed',
    claimsPhone: '+1 (800) 555-0188',
    validThru: '12/2026',
    documents: [
      {
        id: 'DOC-08',
        title: 'AARP Medicare Complete Card',
        fileName: 'AARP_Card_Martha_Vance.pdf',
        uploadDate: '2025-12-14',
        fileSize: '1.2 MB',
        type: 'Card Copy'
      }
    ]
  }
];

export const INITIAL_HOSPITAL_PREFERENCES: HospitalPreference[] = [
  {
    id: 'HOSP-001',
    patientId: 'usr-jake-001',
    patientName: 'Jake Vance',
    relationship: 'Self',
    rankOrder: 1,
    isDefault: true,
    name: 'St. Jude Comprehensive Trauma Center',
    traumaLevel: 'Level 1 Trauma',
    specialties: ['24/7 Adult & Pediatric Trauma', 'Cardiac Cath Lab', 'Helipad', 'Emergency Burn Service', 'Hyperbaric Chamber'],
    address: '1001 Potrero Avenue, Trauma Medical Hub',
    receivingBayEntrance: 'Ambulance Bay Bay 1-4 (North Entrance via 22nd St)',
    emergencyPhone: '+1 (555) 019-9111',
    distanceMiles: 2.1,
    estimatedDriveTimeMin: 4,
    inNetworkStatus: 'In-Network (Tier 1)',
    notes: 'Primary preferred Level 1 facility for acute respiratory or orthopedic emergencies.'
  },
  {
    id: 'HOSP-002',
    patientId: 'usr-jake-001',
    patientName: 'Jake Vance',
    relationship: 'Self',
    rankOrder: 2,
    isDefault: false,
    name: 'Metro Health Academic Medical Pavilion',
    traumaLevel: 'Level 1 Trauma',
    specialties: ['Cardiac Resuscitation Pavilion', 'Comprehensive Stroke Center', 'Interventional Radiology', 'ECMO Team On-Call'],
    address: '505 Parnassus Ave, Academic Campus',
    receivingBayEntrance: 'Emergency Ambulance Deck C',
    emergencyPhone: '+1 (555) 018-8400',
    distanceMiles: 3.4,
    estimatedDriveTimeMin: 7,
    inNetworkStatus: 'In-Network (Tier 1)',
    notes: 'Secondary backup with acute stroke team and interventional angiography.'
  },
  {
    id: 'HOSP-003',
    patientId: 'fam-father-01',
    patientName: 'Robert Vance',
    relationship: 'Father',
    rankOrder: 1,
    isDefault: true,
    name: 'Metro Health Cardiac & Vascular Institute',
    traumaLevel: 'Comprehensive Stroke & Cardiac',
    specialties: ['STEMI Rapid Cath Lab', 'Electrophysiology & Pacemaker Triage', 'Cardiothoracic Surgical Suite', 'Hypothermia Protocol'],
    address: '1001 Potrero Ave, Cardiac Center Wing',
    receivingBayEntrance: 'Direct Cath Lab Ambulance Ramp Bay 2',
    emergencyPhone: '+1 (555) 019-8822',
    distanceMiles: 2.4,
    estimatedDriveTimeMin: 5,
    inNetworkStatus: 'In-Network (Tier 1)',
    notes: 'PRIMARY CHOICE FOR FATHER: Contains patient pacemaker interrogation console and stent records on file with Dr. Marcus Chen.'
  },
  {
    id: 'HOSP-004',
    patientId: 'fam-child-05',
    patientName: 'Leo Vance',
    relationship: 'Child',
    rankOrder: 1,
    isDefault: true,
    name: 'Children’s Specialty Acute Pediatric ER',
    traumaLevel: 'Level 1 Pediatric Trauma',
    specialties: ['Dedicated Pediatric Emergency Physicians', 'Pediatric Anaphylaxis Resuscitation', 'Pediatric ICU', 'Child Life Specialists'],
    address: '1825 4th Street, Pediatric Medical Center',
    receivingBayEntrance: 'Pediatric Ambulance Emergency Driveway',
    emergencyPhone: '+1 (555) 019-7333',
    distanceMiles: 3.1,
    estimatedDriveTimeMin: 6,
    inNetworkStatus: 'In-Network (Tier 1)',
    notes: 'PRIMARY CHOICE FOR LEO: Equipped for pediatric airway emergencies and severe nut anaphylaxis.'
  },
  {
    id: 'HOSP-005',
    patientId: 'fam-grandma-03',
    patientName: 'Martha Vance',
    relationship: 'Grandmother',
    rankOrder: 1,
    isDefault: true,
    name: 'St. Jude Senior Acute Care Pavilion',
    traumaLevel: 'Level 2 Regional Trauma',
    specialties: ['GEDA Level 1 Accredited Geriatric ER', 'Acute Atrial Fibrillation Management', 'Fall & Hip Fracture Protocol', 'Pharmacology Team'],
    address: '412 Birch Way, Senior Medical Campus',
    receivingBayEntrance: 'Senior Pavilion Emergency Gate 3',
    emergencyPhone: '+1 (555) 019-5500',
    distanceMiles: 1.8,
    estimatedDriveTimeMin: 4,
    inNetworkStatus: 'In-Network (Tier 1)',
    notes: 'PRIMARY CHOICE FOR MARTHA: Specialized geriatric triage protocol for anticoagulated fall patients.'
  }
];


