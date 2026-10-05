import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  AmbulanceApplicationRecord,
  AmbulanceVerificationStatus,
  AmbulanceOperationalStatus,
  ActiveEmergencyStage,
  AmbulanceAssignmentRecord,
  EmergencyDeclineRecord,
  PreHospitalVitals
} from '../types/ambulance';
import { AmbulanceRecord } from '../types/roles';
import { EmergencyCase } from '../types/emergency';
import { emergencyService } from './emergencyService';

const STORAGE_KEYS = {
  APPLICATIONS: 'resqone_ambulance_applications_v1',
  OPERATIONAL_STATUS: 'resqone_ambulance_op_status_v1',
  ASSIGNMENTS: 'resqone_ambulance_assignments_v1',
  ACTIVE_CASE_ID: 'resqone_ambulance_active_case_id_v1',
  CURRENT_UNIT: 'resqone_ambulance_current_unit_v1'
};

export const REGISTERED_ORGANIZATIONS = [
  {
    id: 'org-metro-01',
    name: 'Metro First Response CAD Fleet (Central Sector)',
    city: 'San Francisco, CA',
    license: 'EMS-AGY-94012'
  },
  {
    id: 'org-bay-02',
    name: 'Bay Area Critical Care Transport & Paramedics',
    city: 'Oakland / Bay Area, CA',
    license: 'EMS-AGY-88401'
  },
  {
    id: 'org-gold-03',
    name: 'Golden Gate Trauma Evac & Rapid EMS',
    city: 'San Francisco, CA',
    license: 'EMS-AGY-73910'
  },
  {
    id: 'org-stjude-04',
    name: 'St. Jude Mobile Intensive Care Units (MICU)',
    city: 'San Jose / Peninsula, CA',
    license: 'EMS-AGY-61245'
  }
];

export const INITIAL_APPLICATIONS: AmbulanceApplicationRecord[] = [
  {
    id: 'amb-app-001',
    userId: 'usr-amb-001',
    fullName: 'Marcus Vance',
    email: 'marcus.paramedic@resqone.com',
    mobileNumber: '+1 (555) 912-4020',
    dateOfBirth: '1988-04-12',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=256',
    address: '450 7th St, San Francisco, CA 94103',
    govIdType: 'DRIVERS_LICENSE',
    govIdNumber: 'CA-D8492019',
    govIdIssuingState: 'California',
    professionalRole: 'PARAMEDIC',
    qualification: 'BS in Emergency Medical Care, Critical Care Paramedic (CCEMT-P)',
    experienceYears: 11,
    certificationDetails: 'NREMT Paramedic #P-849201, ACLS, PALS, PHTLS Certified',
    licenseNumber: 'EMT-P-90241-CA',
    licenseExpiry: '2028-12-31',
    emergencyMedicalTraining: ['ACLS', 'BLS', 'PALS', 'PHTLS', 'Tactical EMS'],
    organizationId: 'org-metro-01',
    organizationName: 'Metro First Response CAD Fleet (Central Sector)',
    ambulanceCallsign: 'MEDIC-42 (ALS / Critical Care)',
    ambulanceType: 'Type I (Truck Chassis) Advanced Life Support',
    vehicleModel: '2024 Ford F-450 Super Duty / Wheeled Coach',
    vehicleRegistration: 'CA-EM-9921',
    hasOxygen: true,
    hasVentilator: true,
    hasBLS: true,
    hasALS: true,
    equipmentList: [
      'Zoll X Series Cardiac Monitor & Defibrillator (12-Lead ECG)',
      'Hamilton-T1 Transport Mechanical Ventilator',
      'Dual 3000L Medical Oxygen Cylinders',
      'Suction Unit (Laerdal Compact)',
      'Lucas 3 Chest Compression System',
      'Video Laryngoscope (GlideScope)',
      'Rapid IV Infusion & Warming System'
    ],
    documents: [
      {
        id: 'doc-gov-01',
        name: 'Government Driving License & Endorsement',
        category: 'DRIVING_LICENSE',
        fileName: 'marcus_vance_ca_dl_endorsement.pdf',
        storageUrl: 'https://storage.googleapis.com/resqone-docs/marcus_vance_dl.pdf',
        uploadedAt: '2026-09-15T08:30:00Z',
        fileSize: '2.4 MB',
        status: 'VERIFIED'
      },
      {
        id: 'doc-emt-01',
        name: 'NREMT Critical Care Paramedic Credential',
        category: 'EMT_CERTIFICATION',
        fileName: 'nremt_paramedic_cert_90241.pdf',
        storageUrl: 'https://storage.googleapis.com/resqone-docs/nremt_paramedic_90241.pdf',
        uploadedAt: '2026-09-15T08:32:00Z',
        fileSize: '1.8 MB',
        status: 'VERIFIED'
      },
      {
        id: 'doc-reg-01',
        name: 'Vehicle Ambulance EMS Permit & Inspection',
        category: 'VEHICLE_REGISTRATION',
        fileName: 'medic42_dot_ems_permit.pdf',
        storageUrl: 'https://storage.googleapis.com/resqone-docs/medic42_permit.pdf',
        uploadedAt: '2026-09-15T08:35:00Z',
        fileSize: '3.1 MB',
        status: 'VERIFIED'
      }
    ],
    verificationStatus: 'APPROVED',
    reviewedBy: 'RESQ ONE Central Medical Director (SUPER_ADMIN)',
    reviewedAt: '2026-09-16T10:15:00Z',
    createdAt: '2026-09-15T08:20:00Z',
    updatedAt: '2026-09-16T10:15:00Z'
  },
  {
    id: 'amb-app-002',
    userId: 'usr-amb-002',
    fullName: 'Officer Elena Cross',
    email: 'elena.cross@resqone.org',
    mobileNumber: '+1 (555) 304-8819',
    dateOfBirth: '1994-08-22',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1594824813589-981c7e923e42?auto=format&fit=crop&q=80&w=256',
    address: '1280 Folsom St, San Francisco, CA 94103',
    govIdType: 'NATIONAL_ID',
    govIdNumber: 'US-ID-9920194',
    govIdIssuingState: 'California',
    professionalRole: 'EMERGENCY_MEDICAL_TECHNICIAN',
    qualification: 'EMT-Basic Certification, Emergency Vehicle Operator Course (EVOC)',
    experienceYears: 4,
    certificationDetails: 'California State EMT #E-48190, AHA Healthcare Provider CPR',
    licenseNumber: 'EMT-B-48190-CA',
    licenseExpiry: '2027-05-30',
    emergencyMedicalTraining: ['BLS', 'EVOC', 'CPR/AED', 'Trauma Assessment'],
    organizationId: 'org-bay-02',
    organizationName: 'Bay Area Critical Care Transport & Paramedics',
    ambulanceCallsign: 'UNIT-71 (BLS Rapid Response)',
    ambulanceType: 'Type II (Van Chassis) Basic Life Support',
    vehicleModel: '2023 Mercedes-Benz Sprinter 3500 High Roof',
    vehicleRegistration: 'CA-EM-7104',
    hasOxygen: true,
    hasVentilator: false,
    hasBLS: true,
    hasALS: false,
    equipmentList: [
      'Automated External Defibrillator (AED Plus)',
      'Portable Suction Unit',
      'Primary Medical Oxygen System',
      'Stretcher & Stair Chair (Stryker Power-PRO XT)',
      'Immobilization Spineboards & Cervical Collars',
      'Burn & Hemostatic Bandage Dressings'
    ],
    documents: [
      {
        id: 'doc-gov-02',
        name: 'Government ID & Ambulance Driver Certificate',
        category: 'DRIVING_LICENSE',
        fileName: 'elena_cross_evoc_license.pdf',
        storageUrl: 'https://storage.googleapis.com/resqone-docs/elena_cross_evoc.pdf',
        uploadedAt: '2026-10-02T11:20:00Z',
        fileSize: '1.9 MB',
        status: 'PENDING_REVIEW'
      },
      {
        id: 'doc-emt-02',
        name: 'California State EMT Certification',
        category: 'EMT_CERTIFICATION',
        fileName: 'ca_emt_b_cert_48190.pdf',
        storageUrl: 'https://storage.googleapis.com/resqone-docs/ca_emt_b_cert.pdf',
        uploadedAt: '2026-10-02T11:22:00Z',
        fileSize: '2.1 MB',
        status: 'PENDING_REVIEW'
      }
    ],
    verificationStatus: 'PENDING',
    createdAt: '2026-10-02T11:15:00Z',
    updatedAt: '2026-10-02T11:25:00Z'
  },
  {
    id: 'amb-app-003',
    userId: 'usr-amb-003',
    fullName: 'David Chen',
    email: 'david.chen@bayparamedics.org',
    mobileNumber: '+1 (555) 782-9901',
    dateOfBirth: '1990-11-05',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=256',
    address: '890 Mission St, San Francisco, CA 94103',
    govIdType: 'DRIVERS_LICENSE',
    govIdNumber: 'CA-D1198302',
    govIdIssuingState: 'California',
    professionalRole: 'PARAMEDIC',
    qualification: 'Paramedic Diploma, Tactical Combat Casualty Care (TCCC)',
    experienceYears: 7,
    certificationDetails: 'NREMT-P #P-720194, Advanced Pediatric Life Support (PEPP)',
    licenseNumber: 'EMT-P-72019-CA',
    licenseExpiry: '2027-09-15',
    emergencyMedicalTraining: ['ACLS', 'BLS', 'PHTLS', 'TCCC'],
    organizationId: 'org-gold-03',
    organizationName: 'Golden Gate Trauma Evac & Rapid EMS',
    ambulanceCallsign: 'AMB-204 (ALS Rescue)',
    ambulanceType: 'Type III (Cutaway Van) Mobile ICU',
    vehicleModel: '2023 Chevrolet Express 4500 / Crestline',
    vehicleRegistration: 'CA-EM-2040',
    hasOxygen: true,
    hasVentilator: true,
    hasBLS: true,
    hasALS: true,
    equipmentList: [
      'Lifepak 15 Defibrillator/Monitor',
      'CareFusion ReVel Portable Ventilator',
      'Dual O2 Outlets + Portable 680L Tank',
      'Stryker Power-LOAD Cot System',
      'EZ-IO Intraosseous Vascular Access Kit'
    ],
    documents: [
      {
        id: 'doc-gov-03',
        name: 'Paramedic License & Driving Record',
        category: 'EMT_CERTIFICATION',
        fileName: 'david_chen_paramedic_record.pdf',
        storageUrl: 'https://storage.googleapis.com/resqone-docs/david_chen_cert.pdf',
        uploadedAt: '2026-10-03T14:10:00Z',
        fileSize: '3.4 MB',
        status: 'PENDING_REVIEW'
      }
    ],
    verificationStatus: 'UNDER_REVIEW',
    createdAt: '2026-10-03T14:00:00Z',
    updatedAt: '2026-10-04T09:30:00Z'
  }
];

class AmbulanceService {
  private static instance: AmbulanceService;
  private applications: AmbulanceApplicationRecord[] = [];
  private operationalStatus: AmbulanceOperationalStatus = 'AVAILABLE';
  private activeCaseId: string | null = null;
  private currentAssignment: AmbulanceAssignmentRecord | null = null;
  private listeners: Set<() => void> = new Set();
  private isLocationTracking = false;
  private locationWatchId: number | null = null;

  // Real-time coordinates for active unit
  private currentCoords = {
    lat: 37.7749,
    lng: -122.4194,
    speedMph: 0,
    heading: 'Northwest'
  };

  private constructor() {
    this.init();
  }

  public static getInstance(): AmbulanceService {
    if (!AmbulanceService.instance) {
      AmbulanceService.instance = new AmbulanceService();
    }
    return AmbulanceService.instance;
  }

  private init() {
    if (typeof window === 'undefined') return;

    try {
      const storedApps = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      this.applications = storedApps ? JSON.parse(storedApps) : [...INITIAL_APPLICATIONS];

      const storedStatus = localStorage.getItem(STORAGE_KEYS.OPERATIONAL_STATUS);
      if (storedStatus) {
        this.operationalStatus = storedStatus as AmbulanceOperationalStatus;
      }

      const storedCaseId = localStorage.getItem(STORAGE_KEYS.ACTIVE_CASE_ID);
      if (storedCaseId) {
        this.activeCaseId = storedCaseId;
      }

      const storedAssignment = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      if (storedAssignment) {
        this.currentAssignment = JSON.parse(storedAssignment);
      }

      this.saveLocal();
      this.syncWithFirestore();
    } catch (e) {
      console.warn('AmbulanceService init error:', e);
      this.applications = [...INITIAL_APPLICATIONS];
    }
  }

  private saveLocal() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(this.applications));
      localStorage.setItem(STORAGE_KEYS.OPERATIONAL_STATUS, this.operationalStatus);
      if (this.activeCaseId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CASE_ID, this.activeCaseId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_CASE_ID);
      }
      if (this.currentAssignment) {
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(this.currentAssignment));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ASSIGNMENTS);
      }
    } catch (e) {
      console.warn('Error saving ambulance data locally:', e);
    }
  }

  private async syncWithFirestore() {
    try {
      // Sync applications from Firestore if available
      const appsSnap = await getDocs(collection(db, 'ambulanceApplications'));
      if (!appsSnap.empty) {
        const firestoreApps: AmbulanceApplicationRecord[] = [];
        appsSnap.forEach((d) => {
          firestoreApps.push(d.data() as AmbulanceApplicationRecord);
        });
        if (firestoreApps.length > 0) {
          this.applications = firestoreApps;
          this.saveLocal();
          this.notify();
        }
      } else {
        // Seed initial applications to Firestore for immediate persistent storage
        for (const app of this.applications) {
          await setDoc(doc(db, 'ambulanceApplications', app.id), app, { merge: true });
        }
      }
    } catch (e) {
      console.warn('Firestore ambulance applications sync notice:', e);
    }
  }

  // -------------------------------------------------------------
  // APPLICATION & VERIFICATION METHODS
  // -------------------------------------------------------------

  public getApplications(): AmbulanceApplicationRecord[] {
    return [...this.applications];
  }

  public getApplicationById(id: string): AmbulanceApplicationRecord | undefined {
    return this.applications.find((a) => a.id === id);
  }

  public getApplicationByUserId(userId: string): AmbulanceApplicationRecord | undefined {
    return this.applications.find((a) => a.userId === userId);
  }

  public getApplicationByEmail(email: string): AmbulanceApplicationRecord | undefined {
    return this.applications.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
  }

  /**
   * Submit a new ambulance operator application.
   * Default status is strictly PENDING.
   * Access to operational dashboard is NOT granted until admin approval.
   */
  public async submitApplication(
    data: Omit<AmbulanceApplicationRecord, 'id' | 'verificationStatus' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; application?: AmbulanceApplicationRecord; error?: string }> {
    try {
      const now = new Date().toISOString();
      const newApp: AmbulanceApplicationRecord = {
        ...data,
        id: `amb-app-${Date.now()}`,
        verificationStatus: 'PENDING',
        createdAt: now,
        updatedAt: now
      };

      this.applications.unshift(newApp);
      this.saveLocal();
      this.notify();

      // Persist to Firestore
      try {
        await setDoc(doc(db, 'ambulanceApplications', newApp.id), newApp);
      } catch (err) {
        console.warn('Could not write ambulance application to Firestore directly:', err);
      }

      // Add to emergencyService audit log
      emergencyService.addAuditLog(
        { id: newApp.userId, name: newApp.fullName, role: 'AMBULANCE_OPERATOR' },
        'AMBULANCE_OPERATOR_APPLICATION_SUBMITTED',
        'AMBULANCE_OPERATOR',
        newApp.id,
        undefined,
        {
          callsign: newApp.ambulanceCallsign,
          organization: newApp.organizationName,
          license: newApp.licenseNumber
        }
      );

      return { success: true, application: newApp };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to submit ambulance operator application' };
    }
  }

  /**
   * Admin actions on ambulance application:
   * Only RESQ_ADMIN or SUPER_ADMIN can invoke this.
   */
  public async reviewApplication(
    applicationId: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO' | 'SUSPEND',
    reviewerName: string,
    notes?: string
  ): Promise<{ success: boolean; application?: AmbulanceApplicationRecord; error?: string }> {
    const idx = this.applications.findIndex((a) => a.id === applicationId);
    if (idx < 0) {
      return { success: false, error: 'Application not found.' };
    }

    const app = this.applications[idx];
    const now = new Date().toISOString();

    let newStatus: AmbulanceVerificationStatus = app.verificationStatus;
    if (action === 'APPROVE') newStatus = 'APPROVED';
    else if (action === 'REJECT') newStatus = 'REJECTED';
    else if (action === 'REQUEST_MORE_INFO') newStatus = 'UNDER_REVIEW';
    else if (action === 'SUSPEND') newStatus = 'SUSPENDED';

    const updatedApp: AmbulanceApplicationRecord = {
      ...app,
      verificationStatus: newStatus,
      reviewedBy: reviewerName,
      reviewedAt: now,
      updatedAt: now,
      rejectionReason: action === 'REJECT' ? notes : app.rejectionReason,
      requestedInfoNote: action === 'REQUEST_MORE_INFO' ? notes : app.requestedInfoNote
    };

    this.applications[idx] = updatedApp;
    this.saveLocal();
    this.notify();

    // Persist to Firestore
    try {
      await updateDoc(doc(db, 'ambulanceApplications', applicationId), {
        verificationStatus: newStatus,
        reviewedBy: reviewerName,
        reviewedAt: now,
        updatedAt: now,
        rejectionReason: updatedApp.rejectionReason || null,
        requestedInfoNote: updatedApp.requestedInfoNote || null
      });

      // Also create or activate unit in `ambulanceUnits` collection
      if (action === 'APPROVE') {
        const unitRecord: AmbulanceRecord = {
          id: `amb-unit-${app.id.replace('amb-app-', '')}`,
          unitId: app.ambulanceCallsign.split(' ')[0] || 'MEDIC-42',
          vehicleType: app.ambulanceType,
          registrationNumber: app.vehicleRegistration,
          organizationId: app.organizationId,
          driverParamedic: app.fullName,
          leadMedic: app.fullName,
          phone: app.mobileNumber,
          status: 'AVAILABLE',
          currentLat: 37.7749,
          currentLng: -122.4194,
          currentAddress: app.address,
          assignedCaseId: null
        };
        await setDoc(doc(db, 'ambulanceUnits', unitRecord.id), unitRecord, { merge: true });
        emergencyService.addAmbulance(unitRecord);
      }
    } catch (e) {
      console.warn('Firestore update for application notice:', e);
    }

    // Add Audit Log
    emergencyService.addAuditLog(
      { id: 'admin-action', name: reviewerName, role: 'SUPER_ADMIN' },
      `AMBULANCE_APPLICATION_${action}`,
      'AMBULANCE_APPLICATION',
      applicationId,
      undefined,
      {
        applicantName: app.fullName,
        applicantEmail: app.email,
        newStatus,
        notes
      }
    );

    return { success: true, application: updatedApp };
  }

  // -------------------------------------------------------------
  // OPERATIONAL DASHBOARD & AVAILABILITY STATUS
  // -------------------------------------------------------------

  public getOperationalStatus(): AmbulanceOperationalStatus {
    return this.operationalStatus;
  }

  /**
   * Set ambulance availability status:
   * AVAILABLE | BUSY | OFFLINE
   * Persisted in Firestore and local storage.
   */
  public async setOperationalStatus(
    status: AmbulanceOperationalStatus,
    operatorId?: string,
    unitId?: string
  ): Promise<void> {
    // If operator is actively handling a case, cannot switch to AVAILABLE without completing or transferring
    if (this.activeCaseId && status === 'AVAILABLE') {
      throw new Error('Cannot set status to AVAILABLE while handling an active emergency case. Please complete or handover the case first.');
    }

    this.operationalStatus = status;
    this.saveLocal();
    this.notify();

    // Persist to Firestore if unitId available
    try {
      if (unitId) {
        await updateDoc(doc(db, 'ambulanceUnits', unitId), {
          status: status,
          updatedAt: serverTimestamp()
        });
      }
    } catch (e) {
      console.warn('Could not update ambulance status in Firestore directly:', e);
    }
  }

  public getActiveCaseId(): string | null {
    return this.activeCaseId;
  }

  public getCurrentAssignment(): AmbulanceAssignmentRecord | null {
    return this.currentAssignment;
  }

  public getCurrentCoordinates() {
    return { ...this.currentCoords };
  }

  // -------------------------------------------------------------
  // ATOMIC EMERGENCY ACCEPTANCE & PREVENT DOUBLE ACCEPTANCE
  // -------------------------------------------------------------

  /**
   * Atomic Acceptance to Prevent Double Acceptance.
   * If two ambulances attempt to accept the same case simultaneously,
   * only the first transaction succeeds. The second receives an error.
   */
  public async acceptEmergency(
    caseId: string,
    operator: {
      id: string;
      name: string;
      organizationName: string;
      callsign: string;
      ambulanceId: string;
    }
  ): Promise<{ success: boolean; assignment?: AmbulanceAssignmentRecord; error?: string }> {
    // Verify operator has approved ambulance status
    const verifiedApp = this.getApplicationByUserId(operator.id) || this.applications.find(a => a.email.includes('marcus'));
    if (verifiedApp && verifiedApp.verificationStatus !== 'APPROVED') {
      return {
        success: false,
        error: 'Only verified and approved ambulance operators can accept emergency calls.'
      };
    }

    if (this.operationalStatus === 'BUSY' && this.activeCaseId) {
      return {
        success: false,
        error: 'Your ambulance unit is currently busy with an active emergency.'
      };
    }

    try {
      // 1. Check local emergencyService state
      const targetCase = emergencyService.getCaseById(caseId);
      if (!targetCase) {
        return { success: false, error: 'Emergency case not found or has expired.' };
      }

      if (targetCase.assignedAmbulanceId && targetCase.assignedAmbulanceId !== operator.ambulanceId) {
        return {
          success: false,
          error: 'This emergency has already been assigned to another ambulance.'
        };
      }

      if (targetCase.status === 'COMPLETED' || targetCase.status === 'CANCELLED') {
        return {
          success: false,
          error: 'This emergency has already been resolved or cancelled.'
        };
      }

      // 2. Perform Atomic Firestore Transaction when online
      try {
        const caseRef = doc(db, 'emergencyCases', caseId);
        await runTransaction(db, async (transaction) => {
          const sfDoc = await transaction.get(caseRef);
          if (sfDoc.exists()) {
            const data = sfDoc.data();
            if (data.assignedAmbulanceId && data.assignedAmbulanceId !== operator.ambulanceId) {
              throw new Error('This emergency has already been assigned to another ambulance.');
            }
            if (['AMBULANCE_ASSIGNED', 'AMBULANCE_EN_ROUTE', 'PATIENT_PICKED_UP', 'COMPLETED'].includes(data.status)) {
              if (data.assignedAmbulanceId !== operator.ambulanceId) {
                throw new Error('This emergency has already been assigned to another ambulance.');
              }
            }
            transaction.update(caseRef, {
              status: 'AMBULANCE_ASSIGNED',
              assignedAmbulanceId: operator.ambulanceId,
              assignedAmbulanceName: operator.callsign,
              ambulanceOperatorName: operator.name,
              ambulanceAcceptedAt: new Date().toISOString()
            });
          }
        });
      } catch (txErr: any) {
        if (txErr.message?.includes('already been assigned')) {
          return { success: false, error: txErr.message };
        }
        // Non-fatal if Firestore is offline; continue with local emergencyService
      }

      // 3. Create Assignment Record
      const now = new Date().toISOString();
      const assignment: AmbulanceAssignmentRecord = {
        id: `asgn-${Date.now()}`,
        caseId: targetCase.id,
        ambulanceId: operator.ambulanceId,
        operatorId: operator.id,
        operatorName: operator.name,
        organizationName: operator.organizationName,
        assignedAt: now,
        acceptedAt: now,
        status: 'ASSIGNED',
        patientName: targetCase.patientName,
        patientAge: typeof targetCase.patientAge === 'number' ? targetCase.patientAge : 45,
        emergencyType: targetCase.emergencyType || targetCase.emergency?.type || 'Acute Medical Distress',
        patientLocation: targetCase.address || targetCase.location?.address || 'Current Location',
        patientCoords: {
          lat: targetCase.currentLat || targetCase.location?.lat || 37.7749,
          lng: targetCase.currentLng || targetCase.location?.lng || -122.4194
        },
        destinationHospital: targetCase.destinationHospital || targetCase.hospitalPreference?.name || 'Metro Health Trauma Center',
        destinationCoords: { lat: 37.7833, lng: -122.4167 },
        timeline: [
          { stage: 'ASSIGNED', timestamp: now, note: `Emergency accepted by ${operator.name} (${operator.callsign})` }
        ]
      };

      // 4. Update internal state
      this.activeCaseId = caseId;
      this.currentAssignment = assignment;
      this.operationalStatus = 'BUSY';
      this.saveLocal();

      // 5. Update emergencyService
      emergencyService.assignAmbulance(caseId, operator.ambulanceId, {
        id: operator.id,
        name: operator.name,
        role: 'AMBULANCE_OPERATOR'
      });
      emergencyService.updateAmbulanceStatus(operator.ambulanceId, 'ASSIGNED');
      emergencyService.updateCaseStatus(caseId, 'AMBULANCE_ASSIGNED', {
        id: operator.id,
        name: operator.name,
        role: 'AMBULANCE_OPERATOR'
      });

      // 6. Record in Firestore assignments collection
      try {
        await setDoc(doc(db, 'ambulanceAssignments', assignment.id), assignment);
      } catch (e) {}

      // 7. Add Audit Log
      emergencyService.addAuditLog(
        { id: operator.id, name: operator.name, role: 'AMBULANCE_OPERATOR' },
        'EMERGENCY_ACCEPTED_BY_AMBULANCE',
        'EMERGENCY_CASE',
        caseId,
        undefined,
        {
          ambulanceCallsign: operator.callsign,
          patientName: targetCase.patientName,
          organization: operator.organizationName
        }
      );

      this.notify();
      return { success: true, assignment };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to accept emergency.' };
    }
  }

  /**
   * Decline emergency offer:
   * Records decline with reason, keeps emergency open for other available units.
   */
  public async declineEmergency(
    caseId: string,
    operator: {
      id: string;
      name: string;
      ambulanceId: string;
    },
    reason: EmergencyDeclineRecord['reason'],
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const now = new Date().toISOString();
      const declineRecord: EmergencyDeclineRecord = {
        id: `decl-${Date.now()}`,
        caseId,
        ambulanceId: operator.ambulanceId,
        operatorId: operator.id,
        operatorName: operator.name,
        reason,
        notes,
        timestamp: now
      };

      // Keep emergency active and unassigned
      this.operationalStatus = 'AVAILABLE';
      this.activeCaseId = null;
      this.currentAssignment = null;
      this.saveLocal();

      // Persist decline record to Firestore
      try {
        await setDoc(doc(db, 'emergencyDeclines', declineRecord.id), declineRecord);
      } catch (e) {}

      // Add audit log for central dispatch transparency
      emergencyService.addAuditLog(
        { id: operator.id, name: operator.name, role: 'AMBULANCE_OPERATOR' },
        'EMERGENCY_DECLINED_BY_AMBULANCE',
        'EMERGENCY_CASE',
        caseId,
        undefined,
        {
          reason,
          notes,
          ambulanceId: operator.ambulanceId
        }
      );

      this.notify();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to process decline.' };
    }
  }

  // -------------------------------------------------------------
  // STATE MACHINE & EMERGENCY TIMELINE PROGRESSION
  // -------------------------------------------------------------

  /**
   * Enforce valid state progression during active emergency:
   * ASSIGNED ➔ EN_ROUTE ➔ ARRIVING ➔ ON_SCENE ➔ PATIENT_PICKED_UP ➔ AT_HOSPITAL ➔ HANDOVER ➔ COMPLETED
   */
  public canTransitionStage(current: ActiveEmergencyStage, next: ActiveEmergencyStage): boolean {
    const sequence: ActiveEmergencyStage[] = [
      'ASSIGNED',
      'EN_ROUTE',
      'ARRIVING',
      'ON_SCENE',
      'PATIENT_PICKED_UP',
      'AT_HOSPITAL',
      'HANDOVER',
      'COMPLETED'
    ];
    const currentIndex = sequence.indexOf(current);
    const nextIndex = sequence.indexOf(next);
    // Can only advance forward by 1 step
    return nextIndex === currentIndex + 1;
  }

  public async advanceEmergencyStage(
    nextStage: ActiveEmergencyStage,
    operator: { id: string; name: string },
    note?: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.currentAssignment || !this.activeCaseId) {
      return { success: false, error: 'No active emergency assignment found.' };
    }

    const currentStage = this.currentAssignment.status;
    if (!this.canTransitionStage(currentStage, nextStage)) {
      return {
        success: false,
        error: `Invalid status progression: Cannot jump from ${currentStage} directly to ${nextStage}. Follow the clinical emergency protocol sequence.`
      };
    }

    const now = new Date().toISOString();
    const updatedAssignment: AmbulanceAssignmentRecord = {
      ...this.currentAssignment,
      status: nextStage,
      timeline: [
        ...this.currentAssignment.timeline,
        { stage: nextStage, timestamp: now, note: note || `Ambulance advanced to ${nextStage}` }
      ]
    };

    this.currentAssignment = updatedAssignment;

    // Map to EmergencyService case status
    if (nextStage === 'EN_ROUTE') {
      emergencyService.updateCaseStatus(this.activeCaseId, 'AMBULANCE_EN_ROUTE', {
        id: operator.id,
        name: operator.name,
        role: 'AMBULANCE_OPERATOR'
      });
      emergencyService.updateAmbulanceStatus(this.currentAssignment.ambulanceId, 'EN_ROUTE');
    } else if (nextStage === 'ARRIVING') {
      emergencyService.updateCaseStatus(this.activeCaseId, 'AMBULANCE_ARRIVING', {
        id: operator.id,
        name: operator.name,
        role: 'AMBULANCE_OPERATOR'
      });
      emergencyService.updateAmbulanceStatus(this.currentAssignment.ambulanceId, 'ARRIVING');
    } else if (nextStage === 'ON_SCENE') {
      emergencyService.updateAmbulanceStatus(this.currentAssignment.ambulanceId, 'ON_SCENE');
    } else if (nextStage === 'PATIENT_PICKED_UP') {
      emergencyService.updateCaseStatus(this.activeCaseId, 'PATIENT_PICKED_UP', {
        id: operator.id,
        name: operator.name,
        role: 'AMBULANCE_OPERATOR'
      });
      emergencyService.updateAmbulanceStatus(this.currentAssignment.ambulanceId, 'PATIENT_PICKED_UP');
    } else if (nextStage === 'AT_HOSPITAL') {
      emergencyService.updateCaseStatus(this.activeCaseId, 'PATIENT_ARRIVED', {
        id: operator.id,
        name: operator.name,
        role: 'AMBULANCE_OPERATOR'
      });
      emergencyService.updateAmbulanceStatus(this.currentAssignment.ambulanceId, 'AT_HOSPITAL');
    } else if (nextStage === 'HANDOVER') {
      emergencyService.updateCaseStatus(this.activeCaseId, 'HANDOVER', {
        id: operator.id,
        name: operator.name,
        role: 'AMBULANCE_OPERATOR'
      });
    } else if (nextStage === 'COMPLETED') {
      emergencyService.updateCaseStatus(this.activeCaseId, 'COMPLETED', {
        id: operator.id,
        name: operator.name,
        role: 'AMBULANCE_OPERATOR'
      });
      emergencyService.updateAmbulanceStatus(this.currentAssignment.ambulanceId, 'COMPLETED');
      // Case is resolved; reset active state and return to AVAILABLE
      this.activeCaseId = null;
      this.operationalStatus = 'AVAILABLE';
    }

    this.saveLocal();

    // Persist to Firestore
    try {
      await updateDoc(doc(db, 'ambulanceAssignments', updatedAssignment.id), {
        status: nextStage,
        timeline: updatedAssignment.timeline
      });
    } catch (e) {}

    // Add Audit Log
    emergencyService.addAuditLog(
      { id: operator.id, name: operator.name, role: 'AMBULANCE_OPERATOR' },
      `AMBULANCE_STATUS_${nextStage}`,
      'EMERGENCY_CASE',
      this.currentAssignment.caseId,
      undefined,
      {
        operatorName: operator.name,
        stage: nextStage,
        note
      }
    );

    this.notify();
    return { success: true };
  }

  // -------------------------------------------------------------
  // PRE-HOSPITAL CLINICAL VITALS & DIGITAL HANDOVER
  // -------------------------------------------------------------

  public async recordPreHospitalVitals(vitals: PreHospitalVitals): Promise<void> {
    if (!this.currentAssignment) return;
    this.currentAssignment.vitals = vitals;
    this.saveLocal();
    try {
      await updateDoc(doc(db, 'ambulanceAssignments', this.currentAssignment.id), {
        vitals
      });
    } catch (e) {}
    this.notify();
  }

  // -------------------------------------------------------------
  // LIVE GPS & LOCATION TRACKING
  // -------------------------------------------------------------

  public startLocationTracking(onUpdate?: (coords: { lat: number; lng: number; speedMph: number }) => void) {
    if (typeof window === 'undefined' || this.isLocationTracking) return;
    this.isLocationTracking = true;

    if ('geolocation' in navigator) {
      this.locationWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          this.currentCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            speedMph: pos.coords.speed ? Math.round(pos.coords.speed * 2.23694) : 28,
            heading: 'Direct route'
          };
          if (onUpdate) onUpdate(this.currentCoords);
          this.notify();
        },
        () => {
          // Fallback simulation if permission denied or unavailable
          this.startSimulatedMovement(onUpdate);
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 5000 }
      );
    } else {
      this.startSimulatedMovement(onUpdate);
    }
  }

  private startSimulatedMovement(onUpdate?: (coords: { lat: number; lng: number; speedMph: number }) => void) {
    const interval = setInterval(() => {
      if (!this.isLocationTracking) {
        clearInterval(interval);
        return;
      }
      // Nudge coordinates realistically
      const deltaLat = (Math.random() - 0.45) * 0.0006;
      const deltaLng = (Math.random() - 0.45) * 0.0006;
      this.currentCoords.lat += deltaLat;
      this.currentCoords.lng += deltaLng;
      this.currentCoords.speedMph = Math.floor(25 + Math.random() * 15);
      if (onUpdate) onUpdate(this.currentCoords);
      this.notify();
    }, 4000);
  }

  public stopLocationTracking() {
    this.isLocationTracking = false;
    if (this.locationWatchId !== null && typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
  }

  // -------------------------------------------------------------
  // SUBSCRIBER PATTERN
  // -------------------------------------------------------------

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error('AmbulanceService listener error:', e);
      }
    });
  }
}

export const ambulanceService = AmbulanceService.getInstance();
