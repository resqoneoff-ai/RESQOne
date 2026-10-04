export type UserRole =
  | 'PATIENT'
  | 'REQUESTER'
  | 'DOCTOR'
  | 'AMBULANCE_OPERATOR'
  | 'HOSPITAL'
  | 'RESQ_ADMIN'
  | 'SUPER_ADMIN';

export type EmergencyStatus =
  | 'CREATED'
  | 'TRIAGE'
  | 'AMBULANCE_REQUESTED'
  | 'AMBULANCE_ASSIGNED'
  | 'AMBULANCE_EN_ROUTE'
  | 'AMBULANCE_ARRIVING'
  | 'PATIENT_PICKED_UP'
  | 'DOCTOR_ASSIGNED'
  | 'DOCTOR_CONNECTED'
  | 'HOSPITAL_SEARCH'
  | 'HOSPITAL_NOTIFIED'
  | 'HOSPITAL_ACCEPTED'
  | 'PATIENT_ARRIVED'
  | 'HANDOVER'
  | 'COMPLETED'
  | 'CANCELLED';

export type DoctorAvailability = 'AVAILABLE' | 'BUSY' | 'OFFLINE';
export type DoctorVerification =
  | 'VERIFIED'
  | 'APPROVED'
  | 'INVITED'
  | 'PENDING'
  | 'PENDING_VERIFICATION'
  | 'REJECTED'
  | 'SUSPENDED';

export type AmbulanceStatus =
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'ARRIVING'
  | 'ON_SCENE'
  | 'PATIENT_PICKED_UP'
  | 'AT_HOSPITAL'
  | 'COMPLETED'
  | 'OFFLINE';

export interface DoctorRecord {
  id: string;
  profileId: string;
  name: string;
  registrationNumber: string;
  specialization: string;
  experienceYears: number;
  organizationId?: string;
  hospitalAffiliation: string;
  phone: string;
  verificationStatus: DoctorVerification;
  availability: DoctorAvailability;
  rating: number;
  assignedCaseIds: string[];
}

export interface AmbulanceRecord {
  id: string;
  unitId: string;
  vehicleType: string;
  registrationNumber: string;
  organizationId?: string;
  driverParamedic: string;
  leadMedic: string;
  phone: string;
  status: AmbulanceStatus;
  currentLat: number;
  currentLng: number;
  currentAddress: string;
  assignedCaseId?: string | null;
  speedMph?: number;
}

export interface HospitalRecord {
  id: string;
  name: string;
  code: string;
  traumaLevel: string;
  address: string;
  bayEntrance: string;
  lat: number;
  lng: number;
  emergencyPhone: string;
  totalTraumaBays: number;
  occupiedBays: number;
  isAcceptingEmergencies: boolean;
  specialties: string[];
}

export interface DoctorTriageAssessment {
  id: string;
  caseId: string;
  assessedByDoctorId: string;
  doctorName: string;
  chiefComplaint: string;
  symptoms: string[];
  consciousness: 'Conscious & Alert' | 'Drowsy / Confused' | 'Unconscious';
  breathing: 'Normal' | 'Labored / Struggling' | 'Gasping / Arrest';
  bleeding: 'None' | 'Controlled / Minor' | 'Severe / Arterial';
  painSeverity: number; // 0 to 10
  vitalSigns: {
    heartRate?: number;
    bp?: string;
    spo2?: number;
    respRate?: number;
    temp?: string;
  };
  clinicalNotes: string;
  severity: 'CRITICAL (Priority 1)' | 'URGENT (Priority 2)' | 'STANDARD (Priority 3)';
  recommendedAction: string;
  timestamp: string;
}

export interface CaseMessage {
  id: string;
  caseId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  isSystemEvent?: boolean;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  caseId?: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export type RoleStatus = 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REVOKED';

export type DoctorApprovalStatus = 'INVITED' | 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface UserRoleAssignment {
  id: string;
  userId: string;
  role: UserRole;
  status: RoleStatus;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface AppUserSession {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  approvedRoles: UserRole[];
  emailVerified: boolean;
  isDualRoleDoctorPatient?: boolean;
  organizationId?: string;
  associatedDoctorId?: string;
  associatedAmbulanceId?: string;
  associatedHospitalId?: string;
  googleLinked?: boolean;
}

export interface DoctorOnboardingRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  registrationNumber: string;
  specialization: string;
  experienceYears: number;
  hospitalAffiliation: string;
  qualifications?: string;
  telemetryPreference?: string;
  notes?: string;
  status: 'PENDING_VERIFICATION' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
