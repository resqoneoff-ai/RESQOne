import {
  FamilyGroup,
  FamilyMemberRecord,
  FamilyJoinRequest,
  EmergencyAccessLog,
  PermissionLevel,
  LocationPermission,
  FamilyRelationshipType
} from '../types/family';
import { db } from '../lib/firebase';
import { doc, setDoc, addDoc, collection, updateDoc } from 'firebase/firestore';

// LocalStorage Keys
const STORAGE_FAMILIES = 'resqone_family_groups';
const STORAGE_MEMBERS = 'resqone_family_members';
const STORAGE_REQUESTS = 'resqone_family_requests';
const STORAGE_LOGS = 'resqone_family_access_logs';

export const INITIAL_FAMILIES: FamilyGroup[] = [
  {
    id: 'fam-jenkins-01',
    name: 'Jenkins Family Circle',
    familyCode: 'RESQ-FAM-7K42P',
    ownerUserId: 'usr-sarah-jenkins',
    ownerName: 'Sarah Jenkins',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'fam-care-02',
    name: 'Grandmother Care Group',
    familyCode: 'RESQ-FAM-4M89X',
    ownerUserId: 'usr-sarah-jenkins',
    ownerName: 'Sarah Jenkins',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_FAMILY_MEMBERS: FamilyMemberRecord[] = [
  {
    id: 'mem-robert-vance',
    familyId: 'fam-jenkins-01',
    userId: 'usr-robert-vance',
    fullName: 'Robert Vance',
    email: 'robert.vance@example.com',
    phone: '+1 (555) 234-8901',
    relationship: 'Father',
    age: 68,
    role: 'MEMBER',
    status: 'ACTIVE',
    permissionLevel: 'LEVEL_3',
    locationPermission: {
      canShareCurrentLocation: true,
      canShareLastKnownLocation: true,
      canShareLiveLocationDuringEmergency: true
    },
    authorizedInfo: {
      bloodGroup: 'O+',
      allergies: ['Latex', 'Sulfa Antibiotics'],
      medicalConditions: ['Cardiac Arrhythmia', 'Controlled Hypertension', 'Type 2 Diabetes'],
      medications: ['Metformin 500mg BID', 'Lisinopril 10mg QD', 'Aspirin 81mg QD'],
      medicalAlerts: ['Pacemaker registered (Medtronic CRT-P implant)'],
      medicalDevices: ['Medtronic CRT-P Pacemaker (Model Viva XT)'],
      preferredHospital: 'St. Jude Comprehensive Cardiac Center',
      insuranceStatus: 'Medicare Advantage Platinum + Blue Cross Supp',
      emergencyContactName: 'Sarah Jenkins (Daughter)',
      emergencyContactPhone: '+1 (555) 891-2345'
    },
    liveLocation: {
      address: '742 Evergreen Terrace, North Ridge District, CA 94102',
      lat: 37.7749,
      lng: -122.4194,
      lastPing: 'Updated 2 mins ago',
      lastUpdatedMinutesAgo: 2,
      deviceOnline: true,
      batteryLevel: 88
    },
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'Sarah Jenkins',
    lastUpdatedAt: new Date().toISOString()
  },
  {
    id: 'mem-elena-vance',
    familyId: 'fam-jenkins-01',
    userId: 'usr-elena-vance',
    fullName: 'Elena Vance',
    email: 'elena.vance@example.com',
    phone: '+1 (555) 432-7890',
    relationship: 'Mother',
    age: 65,
    role: 'MEMBER',
    status: 'ACTIVE',
    permissionLevel: 'LEVEL_2',
    locationPermission: {
      canShareCurrentLocation: true,
      canShareLastKnownLocation: true,
      canShareLiveLocationDuringEmergency: true
    },
    authorizedInfo: {
      bloodGroup: 'A+',
      allergies: ['Severe Penicillin (Anaphylaxis)', 'Tree Nuts'],
      medicalConditions: ['Asthma (Moderate Persistent)', 'Osteoarthritis'],
      medications: ['Albuterol Inhaler PRN', 'Fluticasone 110mcg BID'],
      medicalAlerts: ['Severe Penicillin Allergy (Requires Epinephrine)'],
      preferredHospital: 'Northwestern Memorial Hospital Trauma Care',
      insuranceStatus: 'Aetna Senior Premier Choice',
      emergencyContactName: 'Robert Vance (Spouse)',
      emergencyContactPhone: '+1 (555) 234-8901'
    },
    liveLocation: {
      address: '1084 Marina Blvd, Bayside District, CA 94123',
      lat: 37.8044,
      lng: -122.4381,
      lastPing: 'Updated 8 mins ago',
      lastUpdatedMinutesAgo: 8,
      deviceOnline: true,
      batteryLevel: 74
    },
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'Sarah Jenkins',
    lastUpdatedAt: new Date().toISOString()
  },
  {
    id: 'mem-liam-vance',
    familyId: 'fam-jenkins-01',
    userId: 'usr-liam-vance',
    fullName: 'Liam Vance',
    email: 'liam.vance@example.com',
    phone: '+1 (555) 678-1234',
    relationship: 'Brother',
    age: 29,
    role: 'MEMBER',
    status: 'ACTIVE',
    permissionLevel: 'LEVEL_1',
    locationPermission: {
      canShareCurrentLocation: false,
      canShareLastKnownLocation: true,
      canShareLiveLocationDuringEmergency: true
    },
    authorizedInfo: {
      bloodGroup: 'O+',
      allergies: ['NKDA'],
      medicalConditions: ['Mild Exercise-Induced Asthma'],
      medications: ['ProAir PRN'],
      medicalAlerts: ['Carries rescue inhaler during athletic activity'],
      preferredHospital: 'UCSF Medical Center at Mission Bay',
      insuranceStatus: 'Kaiser Permanente HMO Standard',
      emergencyContactName: 'Sarah Jenkins (Sister)',
      emergencyContactPhone: '+1 (555) 891-2345'
    },
    liveLocation: {
      address: 'Last known: 250 King St, Mission Bay, CA 94107',
      lat: 37.7766,
      lng: -122.3948,
      lastPing: 'Updated 45 mins ago',
      lastUpdatedMinutesAgo: 45,
      deviceOnline: true,
      batteryLevel: 62
    },
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    approvedBy: 'Sarah Jenkins',
    lastUpdatedAt: new Date().toISOString()
  }
];

export const INITIAL_REQUESTS: FamilyJoinRequest[] = [
  {
    id: 'req-aarav-sharma',
    familyId: 'fam-jenkins-01',
    familyName: 'Jenkins Family Circle',
    userId: 'usr-aarav-sharma',
    userFullName: 'Aarav Sharma',
    userEmail: 'aarav.sharma@example.com',
    userPhone: '+1 (555) 789-0123',
    userAge: 34,
    relationship: 'Cousin',
    status: 'PENDING',
    requestedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    initialPermissionLevel: 'LEVEL_2',
    initialLocationPermission: {
      canShareCurrentLocation: true,
      canShareLastKnownLocation: true,
      canShareLiveLocationDuringEmergency: true
    }
  }
];

export const INITIAL_ACCESS_LOGS: EmergencyAccessLog[] = [
  {
    id: 'log-001',
    sessionId: 'sess-emerg-8921',
    familyId: 'fam-jenkins-01',
    familyName: 'Jenkins Family Circle',
    viewerUserId: 'usr-sarah-jenkins',
    viewerName: 'Sarah Jenkins',
    viewerRole: 'Family Admin',
    profileOwnerUserId: 'usr-robert-vance',
    profileOwnerName: 'Robert Vance',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    accessReason: 'Emergency Assistance Screen & Telemetry Verification',
    informationAccessed: ['Blood Group', 'Pacemaker Alert', 'Medications', 'Live GPS Location'],
    permissionLevelApplied: 'LEVEL_3',
    locationAccessed: true
  },
  {
    id: 'log-002',
    sessionId: 'sess-emerg-5412',
    familyId: 'fam-jenkins-01',
    familyName: 'Jenkins Family Circle',
    viewerUserId: 'usr-sarah-jenkins',
    viewerName: 'Sarah Jenkins',
    viewerRole: 'Family Admin',
    profileOwnerUserId: 'usr-elena-vance',
    profileOwnerName: 'Elena Vance',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    accessReason: 'Emergency Triage Check',
    informationAccessed: ['Penicillin Anaphylaxis Alert', 'Emergency Contacts', 'Live Location'],
    permissionLevelApplied: 'LEVEL_2',
    locationAccessed: true
  }
];

export class FamilyService {
  private static instance: FamilyService;

  public static getInstance(): FamilyService {
    if (!FamilyService.instance) {
      FamilyService.instance = new FamilyService();
    }
    return FamilyService.instance;
  }

  // Generate unique RESQ-FAM code
  public generateFamilyCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = 'RESQ-FAM-';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Load from LocalStorage with defaults
  public getFamilies(): FamilyGroup[] {
    if (typeof window === 'undefined') return INITIAL_FAMILIES;
    try {
      const stored = localStorage.getItem(STORAGE_FAMILIES);
      if (stored) {
        return JSON.parse(stored);
      }
      this.saveFamilies(INITIAL_FAMILIES);
      return INITIAL_FAMILIES;
    } catch {
      return INITIAL_FAMILIES;
    }
  }

  public saveFamilies(families: FamilyGroup[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_FAMILIES, JSON.stringify(families));
    } catch {}
  }

  public getMembers(familyId?: string): FamilyMemberRecord[] {
    if (typeof window === 'undefined') return INITIAL_FAMILY_MEMBERS;
    try {
      const stored = localStorage.getItem(STORAGE_MEMBERS);
      const list: FamilyMemberRecord[] = stored ? JSON.parse(stored) : INITIAL_FAMILY_MEMBERS;
      if (!stored) {
        this.saveMembers(INITIAL_FAMILY_MEMBERS);
      }
      if (familyId) {
        return list.filter((m) => m.familyId === familyId);
      }
      return list;
    } catch {
      return INITIAL_FAMILY_MEMBERS;
    }
  }

  public saveMembers(members: FamilyMemberRecord[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_MEMBERS, JSON.stringify(members));
    } catch {}
  }

  public getRequests(familyId?: string): FamilyJoinRequest[] {
    if (typeof window === 'undefined') return INITIAL_REQUESTS;
    try {
      const stored = localStorage.getItem(STORAGE_REQUESTS);
      const list: FamilyJoinRequest[] = stored ? JSON.parse(stored) : INITIAL_REQUESTS;
      if (!stored) {
        this.saveRequests(INITIAL_REQUESTS);
      }
      if (familyId) {
        return list.filter((r) => r.familyId === familyId && r.status === 'PENDING');
      }
      return list.filter((r) => r.status === 'PENDING');
    } catch {
      return INITIAL_REQUESTS;
    }
  }

  public saveRequests(requests: FamilyJoinRequest[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_REQUESTS, JSON.stringify(requests));
    } catch {}
  }

  public getAccessLogs(profileOwnerUserId?: string): EmergencyAccessLog[] {
    if (typeof window === 'undefined') return INITIAL_ACCESS_LOGS;
    try {
      const stored = localStorage.getItem(STORAGE_LOGS);
      const list: EmergencyAccessLog[] = stored ? JSON.parse(stored) : INITIAL_ACCESS_LOGS;
      if (!stored) {
        this.saveAccessLogs(INITIAL_ACCESS_LOGS);
      }
      if (profileOwnerUserId) {
        return list.filter((l) => l.profileOwnerUserId === profileOwnerUserId);
      }
      return list;
    } catch {
      return INITIAL_ACCESS_LOGS;
    }
  }

  public saveAccessLogs(logs: EmergencyAccessLog[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_LOGS, JSON.stringify(logs));
    } catch {}
  }

  // 1. Create a Family
  public createFamily(name: string, ownerUser: { id: string; fullName: string; email: string }): FamilyGroup {
    const families = this.getFamilies();
    const newFamily: FamilyGroup = {
      id: `fam-${Date.now()}`,
      name: name.trim() || `${ownerUser.fullName}'s Family`,
      familyCode: this.generateFamilyCode(),
      ownerUserId: ownerUser.id,
      ownerName: ownerUser.fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newFamily, ...families];
    this.saveFamilies(updated);

    // Automatically add owner as ADMIN member
    const members = this.getMembers();
    const ownerMember: FamilyMemberRecord = {
      id: `mem-${Date.now()}`,
      familyId: newFamily.id,
      userId: ownerUser.id,
      fullName: ownerUser.fullName,
      email: ownerUser.email,
      relationship: 'Self',
      age: 32,
      role: 'ADMIN',
      status: 'ACTIVE',
      permissionLevel: 'LEVEL_3',
      locationPermission: {
        canShareCurrentLocation: true,
        canShareLastKnownLocation: true,
        canShareLiveLocationDuringEmergency: true
      },
      authorizedInfo: {
        bloodGroup: 'O+',
        allergies: ['NKDA'],
        medicalConditions: [],
        medications: [],
        medicalAlerts: [],
        insuranceStatus: 'Family Account Plan Verified',
        emergencyContactName: 'RESQ Emergency Services'
      },
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      approvedBy: 'System',
      lastUpdatedAt: new Date().toISOString()
    };

    this.saveMembers([ownerMember, ...members]);

    // Firestore cloud synchronization (non-blocking)
    try {
      setDoc(doc(db, 'families', newFamily.id), newFamily).catch(() => {});
      setDoc(doc(db, 'families', newFamily.id, 'members', ownerUser.id), ownerMember).catch(() => {});
    } catch {}

    return newFamily;
  }

  // 2. Regenerate Code
  public regenerateFamilyCode(familyId: string, _adminUserId: string): string {
    const families = this.getFamilies();
    const code = this.generateFamilyCode();
    const updated = families.map((f) => (f.id === familyId ? { ...f, familyCode: code, updatedAt: new Date().toISOString() } : f));
    this.saveFamilies(updated);
    return code;
  }

  // 3. Lookup family by code
  public findFamilyByCode(code: string): { family: FamilyGroup; memberCount: number } | null {
    const clean = code.trim().toUpperCase();
    const families = this.getFamilies();
    const family = families.find((f) => f.familyCode.toUpperCase() === clean);
    if (!family) return null;
    const members = this.getMembers(family.id);
    return {
      family,
      memberCount: members.length
    };
  }

  // 4. Request to Join Family
  public requestJoinFamily(params: {
    familyId: string;
    familyName: string;
    user: { id: string; fullName: string; email: string; phone?: string; age?: number };
    relationship: FamilyRelationshipType;
    initialPermissionLevel?: PermissionLevel;
    initialLocationPermission?: LocationPermission;
  }): { success: boolean; message: string; request?: FamilyJoinRequest } {
    const { familyId, familyName, user, relationship } = params;

    // Check if already an active member
    const members = this.getMembers(familyId);
    if (members.some((m) => m.userId === user.id && m.status === 'ACTIVE')) {
      return { success: false, message: 'You are already an active member of this family group.' };
    }

    // Check existing pending request
    const requests = this.getRequests(familyId);
    if (requests.some((r) => r.userId === user.id && r.status === 'PENDING')) {
      return { success: false, message: 'You already have a pending join request awaiting family admin approval.' };
    }

    const newRequest: FamilyJoinRequest = {
      id: `req-${Date.now()}`,
      familyId,
      familyName,
      userId: user.id,
      userFullName: user.fullName,
      userEmail: user.email,
      userPhone: user.phone || '+1 (555) 019-2831',
      userAge: user.age || 30,
      relationship,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      initialPermissionLevel: params.initialPermissionLevel || 'LEVEL_2',
      initialLocationPermission: params.initialLocationPermission || {
        canShareCurrentLocation: true,
        canShareLastKnownLocation: true,
        canShareLiveLocationDuringEmergency: true
      }
    };

    const updated = [newRequest, ...requests];
    this.saveRequests(updated);

    // Sync to Firestore
    try {
      setDoc(doc(db, 'familyInvitations', newRequest.id), newRequest).catch(() => {});
    } catch {}

    return {
      success: true,
      message: `Join request sent to ${familyName} admin! Approval required before accounts link.`,
      request: newRequest
    };
  }

  // 5. Approve Join Request
  public approveJoinRequest(
    requestId: string,
    adminUser: { id: string; fullName: string }
  ): { success: boolean; newMember?: FamilyMemberRecord } {
    const allRequests = this.getAllRequests();
    const req = allRequests.find((r) => r.id === requestId);
    if (!req) return { success: false };

    // Mark request as APPROVED
    const updatedRequests = allRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'APPROVED' as const,
            resolvedAt: new Date().toISOString(),
            resolvedBy: adminUser.fullName
          }
        : r
    );
    this.saveRequests(updatedRequests);

    // Create the active FamilyMemberRecord
    const newMember: FamilyMemberRecord = {
      id: `mem-${Date.now()}`,
      familyId: req.familyId,
      userId: req.userId,
      fullName: req.userFullName,
      email: req.userEmail,
      phone: req.userPhone,
      relationship: req.relationship,
      age: req.userAge,
      role: 'MEMBER',
      status: 'ACTIVE',
      permissionLevel: req.initialPermissionLevel,
      locationPermission: req.initialLocationPermission,
      authorizedInfo: {
        bloodGroup: 'A+',
        allergies: ['NKDA'],
        medicalConditions: [],
        medications: [],
        medicalAlerts: [],
        preferredHospital: 'Regional Emergency Medical Center',
        insuranceStatus: 'Active Personal Plan',
        emergencyContactName: adminUser.fullName,
        emergencyContactPhone: '+1 (555) 911-0000'
      },
      liveLocation: {
        address: 'Live Location GPS Initialized',
        lat: 37.7749,
        lng: -122.4194,
        lastPing: 'Just joined',
        lastUpdatedMinutesAgo: 0,
        deviceOnline: true,
        batteryLevel: 92
      },
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      approvedBy: adminUser.fullName,
      lastUpdatedAt: new Date().toISOString()
    };

    const members = this.getMembers();
    this.saveMembers([newMember, ...members]);

    // Sync to Firestore
    try {
      updateDoc(doc(db, 'familyInvitations', req.id), {
        status: 'APPROVED',
        resolvedAt: new Date().toISOString(),
        resolvedBy: adminUser.fullName
      }).catch(() => {});
      setDoc(doc(db, 'families', req.familyId, 'members', req.userId), newMember).catch(() => {});
    } catch {}

    return { success: true, newMember };
  }

  // 6. Reject Join Request
  public rejectJoinRequest(requestId: string, adminUser: { id: string; fullName: string }): boolean {
    const allRequests = this.getAllRequests();
    const req = allRequests.find((r) => r.id === requestId);
    if (!req) return false;

    const updated = allRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'REJECTED' as const,
            resolvedAt: new Date().toISOString(),
            resolvedBy: adminUser.fullName
          }
        : r
    );
    this.saveRequests(updated);
    return true;
  }

  private getAllRequests(): FamilyJoinRequest[] {
    if (typeof window === 'undefined') return INITIAL_REQUESTS;
    try {
      const stored = localStorage.getItem(STORAGE_REQUESTS);
      return stored ? JSON.parse(stored) : INITIAL_REQUESTS;
    } catch {
      return INITIAL_REQUESTS;
    }
  }

  // 7. Update Permissions
  public updatePermissions(
    memberId: string,
    permissionLevel: PermissionLevel,
    locationPermission: LocationPermission
  ): boolean {
    const members = this.getMembers();
    const updated = members.map((m) =>
      m.id === memberId
        ? {
            ...m,
            permissionLevel,
            locationPermission,
            lastUpdatedAt: new Date().toISOString()
          }
        : m
    );
    this.saveMembers(updated);
    return true;
  }

  // 8. Remove Member
  public removeMember(familyId: string, memberId: string): boolean {
    const members = this.getMembers(familyId);
    const remaining = members.filter((m) => m.id !== memberId);
    const otherFamiliesMembers = this.getMembers().filter((m) => m.familyId !== familyId);
    this.saveMembers([...otherFamiliesMembers, ...remaining]);
    return true;
  }

  // 9. Log Emergency Profile Access (Strict Audit Trail)
  public logEmergencyAccess(logData: {
    sessionId?: string;
    familyId: string;
    familyName: string;
    viewerUserId: string;
    viewerName: string;
    viewerRole: string;
    profileOwnerUserId: string;
    profileOwnerName: string;
    accessReason: string;
    informationAccessed: string[];
    permissionLevelApplied: PermissionLevel;
    locationAccessed: boolean;
  }): EmergencyAccessLog {
    const newLog: EmergencyAccessLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sessionId: logData.sessionId || `sess-emerg-${Math.floor(1000 + Math.random() * 9000)}`,
      familyId: logData.familyId,
      familyName: logData.familyName,
      viewerUserId: logData.viewerUserId,
      viewerName: logData.viewerName,
      viewerRole: logData.viewerRole,
      profileOwnerUserId: logData.profileOwnerUserId,
      profileOwnerName: logData.profileOwnerName,
      timestamp: new Date().toISOString(),
      accessReason: logData.accessReason,
      informationAccessed: logData.informationAccessed,
      permissionLevelApplied: logData.permissionLevelApplied,
      locationAccessed: logData.locationAccessed
    };

    const existingLogs = this.getAccessLogs();
    const updated = [newLog, ...existingLogs];
    this.saveAccessLogs(updated);

    // Sync immutable audit record to Firestore
    try {
      addDoc(collection(db, 'emergencyAccessLogs'), newLog).catch(() => {});
    } catch {}

    return newLog;
  }

  // 10. Filter Authorized Medical Fields based on Permission Level
  public getAuthorizedMedicalView(member: FamilyMemberRecord): {
    bloodGroup?: string;
    allergies: string[];
    alerts: string[];
    devices: string[];
    conditions: string[];
    medications: string[];
    preferredHospital?: string;
    insuranceStatus?: string;
    contacts: Array<{ name: string; phone: string }>;
    location?: {
      address: string;
      lat: number;
      lng: number;
      lastPing: string;
      isLive: boolean;
    };
  } {
    const info = member.authorizedInfo || {};
    const level = member.permissionLevel;
    const locPerm = member.locationPermission;

    // Contacts are accessible in all levels for emergency contact
    const contacts = [
      {
        name: info.emergencyContactName || 'Family Account Holder',
        phone: info.emergencyContactPhone || '+1 (555) 911-0000'
      }
    ];

    // Location
    let location: any = undefined;
    if (member.liveLocation) {
      if (locPerm.canShareCurrentLocation || locPerm.canShareLiveLocationDuringEmergency) {
        location = {
          address: member.liveLocation.address,
          lat: member.liveLocation.lat,
          lng: member.liveLocation.lng,
          lastPing: member.liveLocation.lastPing,
          isLive: locPerm.canShareLiveLocationDuringEmergency
        };
      } else if (locPerm.canShareLastKnownLocation) {
        location = {
          address: `Last Known Area: ${member.liveLocation.address.split(',')[0]}`,
          lat: member.liveLocation.lat,
          lng: member.liveLocation.lng,
          lastPing: `Historical: ${member.liveLocation.lastPing}`,
          isLive: false
        };
      }
    }

    if (level === 'LEVEL_1') {
      // Level 1: Emergency Access only. Basic triage & contact. No deep medical records.
      return {
        bloodGroup: undefined,
        allergies: [],
        alerts: ['Emergency baseline access authorized'],
        devices: [],
        conditions: [],
        medications: [],
        preferredHospital: info.preferredHospital || 'Nearest Level 1 Trauma Center',
        insuranceStatus: undefined,
        contacts,
        location
      };
    }

    if (level === 'LEVEL_2') {
      // Level 2: Critical Alerts. Allergies, blood group, critical alerts, devices/implants.
      return {
        bloodGroup: info.bloodGroup,
        allergies: info.allergies || [],
        alerts: info.medicalAlerts || [],
        devices: info.medicalDevices || [],
        conditions: [],
        medications: info.medications?.slice(0, 2) || [], // Only critical medications
        preferredHospital: info.preferredHospital,
        insuranceStatus: undefined,
        contacts,
        location
      };
    }

    // Level 3: Full Emergency Profile
    return {
      bloodGroup: info.bloodGroup,
      allergies: info.allergies || [],
      alerts: info.medicalAlerts || [],
      devices: info.medicalDevices || [],
      conditions: info.medicalConditions || [],
      medications: info.medications || [],
      preferredHospital: info.preferredHospital,
      insuranceStatus: info.insuranceStatus,
      contacts,
      location
    };
  }
}

export const familyService = FamilyService.getInstance();
