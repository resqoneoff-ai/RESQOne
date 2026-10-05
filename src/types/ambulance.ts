import { UserRole, EmergencyStatus } from './roles';

export type AmbulanceVerificationStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'EXPIRED';

export type AmbulanceOperatorRole =
  | 'AMBULANCE_OPERATOR'
  | 'AMBULANCE_DRIVER'
  | 'EMERGENCY_MEDICAL_TECHNICIAN'
  | 'PARAMEDIC'
  | 'CRITICAL_CARE_PARAMEDIC';

export type AmbulanceOperationalStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export type ActiveEmergencyStage =
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'ARRIVING'
  | 'ON_SCENE'
  | 'PATIENT_PICKED_UP'
  | 'AT_HOSPITAL'
  | 'HANDOVER'
  | 'COMPLETED';

export interface AmbulanceDocumentMetadata {
  id: string;
  name: string;
  category: 'GOVERNMENT_ID' | 'DRIVING_LICENSE' | 'EMT_CERTIFICATION' | 'VEHICLE_REGISTRATION' | 'ORGANIZATION_AUTH' | 'OTHER';
  fileName: string;
  storageUrl?: string;
  uploadedAt: string;
  fileSize?: string;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
}

export interface AmbulanceApplicationRecord {
  id: string;
  userId: string;
  // Personal Information
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  profilePhotoUrl?: string;
  address: string;
  govIdType: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVERS_LICENSE';
  govIdNumber: string;
  govIdIssuingState: string;

  // Professional Information
  professionalRole: AmbulanceOperatorRole;
  qualification: string;
  experienceYears: number;
  certificationDetails: string;
  licenseNumber: string;
  licenseExpiry: string;
  emergencyMedicalTraining: string[];
  organizationId: string;
  organizationName: string;
  isCustomOrganization?: boolean;

  // Ambulance Information
  ambulanceCallsign: string;
  ambulanceType: string;
  vehicleModel: string;
  vehicleRegistration: string;
  hasOxygen: boolean;
  hasVentilator: boolean;
  hasBLS: boolean;
  hasALS: boolean;
  equipmentList: string[];

  // Documents
  documents: AmbulanceDocumentMetadata[];

  // Verification & Status
  verificationStatus: AmbulanceVerificationStatus;
  rejectionReason?: string;
  requestedInfoNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreHospitalVitals {
  heartRate?: number;
  bloodPressure?: string;
  spo2?: number;
  respiratoryRate?: number;
  bloodGlucose?: number;
  gcs?: number; // Glasgow Coma Scale (3-15)
  ecgRhythm?: string;
  notes?: string;
  medicationsAdministered?: string[];
  recordedAt: string;
}

export interface AmbulanceAssignmentRecord {
  id: string;
  caseId: string;
  ambulanceId: string;
  operatorId: string;
  operatorName: string;
  organizationName: string;
  assignedAt: string;
  acceptedAt: string;
  status: ActiveEmergencyStage;
  patientName: string;
  patientAge?: number;
  emergencyType: string;
  patientLocation: string;
  patientCoords: { lat: number; lng: number };
  destinationHospital: string;
  destinationCoords: { lat: number; lng: number };
  vitals?: PreHospitalVitals;
  timeline: Array<{
    stage: ActiveEmergencyStage;
    timestamp: string;
    note?: string;
  }>;
}

export interface EmergencyDeclineRecord {
  id: string;
  caseId: string;
  ambulanceId: string;
  operatorId: string;
  operatorName: string;
  reason:
    | 'Too far'
    | 'Ambulance unavailable'
    | 'Medical capability mismatch'
    | 'Vehicle issue'
    | 'Already handling another case'
    | 'Other';
  notes?: string;
  timestamp: string;
}
