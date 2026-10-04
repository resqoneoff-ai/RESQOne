export type RelationshipType =
  | 'Self'
  | 'Father'
  | 'Mother'
  | 'Grandmother'
  | 'Grandfather'
  | 'Spouse'
  | 'Child'
  | 'Sibling'
  | 'Other Relative'
  | 'Friend'
  | 'Colleague'
  | 'Neighbor'
  | 'Bystander / Passerby'
  | 'Other';

export type EmergencyMode = 'ME' | 'FAMILY' | 'FRIEND_OTHER';

export type MedicalRecordCategory =
  | 'Emergency Dispatch & Handover'
  | 'Surgical & Procedures'
  | 'Hospitalization & Discharge'
  | 'Diagnostic & Imaging'
  | 'Lab Pathology'
  | 'Cardiology & ECG'
  | 'Prescription & Therapy';

export interface MedicalRecord {
  id: string;
  patientId: string; // 'usr-jake-001' or family member id
  patientName: string;
  relationship: string; // 'Self', 'Father', 'Mother', etc.
  title: string;
  category: MedicalRecordCategory;
  date: string; // YYYY-MM-DD
  facility: string;
  attendingDoctor: string;
  diagnosis: string;
  clinicalSummary: string;
  medicationsPrescribed: string[];
  findingsOrResults?: string;
  relevantForEmergency: boolean;
  lastUpdated: string;
  attachments?: Array<{ name: string; size: string; type: string }>;
}

export interface InsurancePolicy {
  id: string;
  patientId: string; // 'usr-jake-001' or family member id
  patientName: string;
  relationship: string;
  isPrimary: boolean;
  provider: string;
  planType: 'Comprehensive PPO' | 'Medicare Advantage' | 'Medicare Part A & B + Medigap' | 'HMO Network' | 'High Deductible HSA' | 'State Medicaid / Emergency';
  policyNumber: string;
  groupNumber: string;
  subscriberId: string;
  subscriberName: string;
  rxBin?: string;
  rxPcn?: string;
  rxGroup?: string;
  emergencyCopay: string;
  deductibleMet: string;
  networkStatus: 'In-Network Guaranteed' | 'Verified Active' | 'Emergency Only';
  claimsPhone: string;
  validThru: string;
  documents: Array<{
    id: string;
    title: string;
    fileName: string;
    uploadDate: string;
    fileSize: string;
    type: 'Card Copy' | 'Policy Schedule' | 'Prior Auth Letter' | 'Claim Form';
  }>;
}

export interface HospitalPreference {
  id: string;
  patientId: string; // 'usr-jake-001' or family member id or 'ALL'
  patientName: string;
  relationship: string;
  rankOrder: number;
  isDefault: boolean;
  name: string;
  traumaLevel: 'Level 1 Trauma' | 'Level 2 Regional Trauma' | 'Level 1 Pediatric Trauma' | 'Comprehensive Stroke & Cardiac' | 'Community Emergency';
  specialties: string[];
  address: string;
  receivingBayEntrance: string;
  emergencyPhone: string;
  distanceMiles: number;
  estimatedDriveTimeMin: number;
  inNetworkStatus: 'In-Network (Tier 1)' | 'In-Network (Tier 2)' | 'Emergency In-Network Parity';
  notes?: string;
}

export interface UserEmergencyProfile {
  id: string;
  fullName: string;
  age: number;
  phone: string;
  bloodGroup: string;
  allergies: string[];
  medicalConditions: string[];
  medications: string[];
  medicalHistory: string[];
  preferredHospitals: Array<{
    name: string;
    distance: string;
    traumaLevel: string;
  }>;
  insuranceInfo: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    validThru: string;
    verified: boolean;
  };
  affordabilityPreference: 'Standard / In-Network' | 'Comprehensive Private' | 'Govt Subsidized / Emergency Only';
  emergencyContacts: Array<{
    name: string;
    relation: string;
    phone: string;
    isPrimary: boolean;
  }>;
  authorizationStatus: 'Full Authorized';
}

export interface FamilyMemberProfile {
  id: string;
  name: string;
  relationship: 'Father' | 'Mother' | 'Grandmother' | 'Spouse' | 'Child' | 'Sibling' | 'Other Relative';
  age: number;
  profileStatus: 'Active & Verified' | 'Linked Device' | 'Emergency Access Granted';
  emergencyProfileAvailability: 'Full Profile Authorized' | 'Critical Alerts Only';
  avatarInitials: string;
  authorizedInfo: {
    bloodGroup?: string;
    allergies?: string[];
    medicalConditions?: string[];
    medications?: string[];
    medicalAlerts: string[];
    preferredHospital?: string;
    insuranceStatus?: string;
    emergencyContact?: string;
  };
  liveLocation?: {
    address: string;
    lat: number;
    lng: number;
    lastPing: string;
    deviceOnline: boolean;
    batteryLevel?: number;
  };
}

export interface FriendOtherEmergencyData {
  patientName: string;
  approximateAge: string;
  relationshipToRequester: 'Friend' | 'Colleague' | 'Neighbor' | 'Bystander / Passerby' | 'Other';
  patientLocation: {
    type: 'Live Location' | 'Map Pin' | 'Manual Address';
    address: string;
    lat?: number;
    lng?: number;
  };
  emergencyType: string;
  knownAllergies: string; // "NOT PROVIDED" or provided text
  knownMedicalCondition: string; // "NOT PROVIDED" or provided text
  currentMedication: string; // "NOT PROVIDED" or provided text
  emergencyContact: string; // "NOT PROVIDED" or provided text
  notes?: string;
}

export type EmergencyStage =
  | 'EMERGENCY_CLICK'
  | 'AMBULANCE'
  | 'DOCTOR'
  | 'HOSPITAL'
  | 'HANDOVER'
  | 'COMPLETED';

export interface EmergencyCase {
  id: string; // e.g. "RESQ-8492"
  targetMode: EmergencyMode;
  patientName: string;
  requesterName: string;
  requesterId?: string;
  relationship: string;
  patientAge?: number | string;
  createdAt: string;
  status?: string;
  notes?: string;
  location: {
    type: 'Live Location' | 'Map Pin' | 'Manual Address';
    address: string;
    lat: number;
    lng: number;
    details?: string;
  };
  emergency: {
    type: string;
    severity: 'CRITICAL (Priority 1)' | 'URGENT (Priority 2)' | 'STANDARD (Priority 3)';
    symptoms: string[];
    notes: string;
    consciousness?: 'Conscious & Alert' | 'Drowsy / Confused' | 'Unconscious';
    breathing?: 'Normal' | 'Labored / Struggling' | 'Gasping / Arrest';
  };
  medicalInfo: {
    bloodGroup: string;
    allergies: string[];
    medicalConditions: string[];
    medications: string[];
    medicalAlerts?: string[];
    sourceLabel: string;
    isFriendOrUnknown?: boolean;
  };
  hospitalPreference: {
    name: string;
    distance: string;
    traumaTier: string;
    etaMinutes: number;
  };
  insurance: string;
  currentStage: EmergencyStage;
  stageProgress: {
    emergencyClick: { time: string; done: boolean };
    ambulance: { time?: string; done: boolean; unit?: string; etaMin?: number };
    doctor: { time?: string; done: boolean; doctorName?: string };
    hospital: { time?: string; done: boolean; bay?: string };
    handover: { time?: string; done: boolean; paramedicSign?: string };
  };
  ambulance: {
    id?: string;
    unitId: string;
    vehicleType?: string;
    driverParamedic: string;
    medic: string;
    phone: string;
    etaMinutes: number;
    status: 'Dispatched' | 'En Route' | 'Arrived at Patient' | 'En Route to Hospital' | 'Arrived at Hospital';
    currentLocation: { lat: number; lng: number };
  };
  doctor: {
    id?: string;
    name: string;
    specialty: string;
    hospitalAffiliation: string;
    status: 'Connecting...' | 'Connected' | 'On Video Call' | 'Handover Certified';
    phone: string;
    instructions: string[];
    vitals?: {
      heartRate: number;
      bp: string;
      spo2: number;
      respRate: number;
    };
  };
  hospital: {
    id?: string;
    name: string;
    address: string;
    receivingDepartment: string;
    allocatedBay: string;
    leadSurgeonPhysician: string;
    status: 'Notified' | 'Trauma Team Assembled' | 'Bay Prepped' | 'Patient Received';
  };
  handover: {
    completedAt?: string;
    receivingDoctor?: string;
    paramedicSignOff?: string;
    clinicalSummary?: string;
  };
}
