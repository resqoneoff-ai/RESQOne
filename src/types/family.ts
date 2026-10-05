export type FamilyRole = 'ADMIN' | 'MEMBER';

export type FamilyMemberStatus = 'ACTIVE' | 'PENDING' | 'REJECTED';

export type FamilyRelationshipType =
  | 'Father'
  | 'Mother'
  | 'Son'
  | 'Daughter'
  | 'Brother'
  | 'Sister'
  | 'Spouse'
  | 'Grandfather'
  | 'Grandmother'
  | 'Grandchild'
  | 'Uncle'
  | 'Aunt'
  | 'Cousin'
  | 'Other Relative'
  | 'Caregiver'
  | 'Emergency Contact'
  | string;

export type PermissionLevel = 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3';
// LEVEL_1: Emergency Access (Basic contact & rapid triage dispatch)
// LEVEL_2: Critical Alerts (Allergies, alerts, devices/implants, blood group, critical meds)
// LEVEL_3: Full Emergency Profile (Comprehensive conditions, history, hospital preference, insurance)

export interface LocationPermission {
  canShareCurrentLocation: boolean;
  canShareLastKnownLocation: boolean;
  canShareLiveLocationDuringEmergency: boolean;
}

export interface FamilyGroup {
  id: string;
  name: string;
  familyCode: string; // e.g. "RESQ-FAM-7K42P"
  ownerUserId: string;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMemberAuthorizedInfo {
  bloodGroup?: string;
  allergies?: string[];
  medicalConditions?: string[];
  medications?: string[];
  medicalAlerts?: string[];
  medicalDevices?: string[];
  preferredHospital?: string;
  insuranceStatus?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface FamilyMemberLiveLocation {
  address: string;
  lat: number;
  lng: number;
  lastPing: string;
  lastUpdatedMinutesAgo: number;
  deviceOnline: boolean;
  batteryLevel?: number;
}

export interface FamilyMemberRecord {
  id: string; // membership record ID
  familyId: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  relationship: FamilyRelationshipType;
  age: number;
  role: FamilyRole;
  status: FamilyMemberStatus;
  permissionLevel: PermissionLevel;
  locationPermission: LocationPermission;
  authorizedInfo: FamilyMemberAuthorizedInfo;
  liveLocation?: FamilyMemberLiveLocation;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  lastUpdatedAt: string;
}

export interface FamilyJoinRequest {
  id: string;
  familyId: string;
  familyName: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  userPhone?: string;
  userAge: number;
  relationship: FamilyRelationshipType;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  initialPermissionLevel: PermissionLevel;
  initialLocationPermission: LocationPermission;
}

export interface EmergencyAccessLog {
  id: string;
  sessionId: string;
  familyId: string;
  familyName: string;
  viewerUserId: string;
  viewerName: string;
  viewerRole: string;
  profileOwnerUserId: string;
  profileOwnerName: string;
  timestamp: string;
  accessReason: string;
  informationAccessed: string[];
  permissionLevelApplied: PermissionLevel;
  locationAccessed: boolean;
}
