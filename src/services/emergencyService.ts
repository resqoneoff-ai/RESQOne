import {
  EmergencyStatus,
  UserRole,
  DoctorRecord,
  AmbulanceRecord,
  HospitalRecord,
  CaseMessage,
  AuditLogEntry,
  DoctorTriageAssessment,
  DoctorAvailability
} from '../types/roles';
import { EmergencyCase, EmergencyStage } from '../types/emergency';
import {
  supabase,
  isSupabaseConfigured,
  SEED_DOCTORS,
  SEED_AMBULANCES,
  SEED_HOSPITALS,
  SEED_MESSAGES,
  SEED_AUDIT_LOGS
} from '../lib/supabase';
import { INITIAL_ACTIVE_CASES } from '../data/mockInitialData';

const STORAGE_KEYS = {
  CASES: 'resqone_active_cases_v2',
  DOCTORS: 'resqone_doctors_v2',
  AMBULANCES: 'resqone_ambulances_v2',
  HOSPITALS: 'resqone_hospitals_v2',
  MESSAGES: 'resqone_messages_v2',
  AUDIT_LOGS: 'resqone_audit_logs_v2',
  TRIAGE: 'resqone_triage_v2'
};

// Cross-tab broadcast channel for real-time synchronization
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('resqone_realtime_events');
  }
} catch {
  // ignore if unsupported
}

class EmergencyService {
  private cases: EmergencyCase[] = [];
  private doctors: DoctorRecord[] = [];
  private ambulances: AmbulanceRecord[] = [];
  private hospitals: HospitalRecord[] = [];
  private messages: CaseMessage[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private triageAssessments: Record<string, DoctorTriageAssessment> = {};
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initData();

    if (broadcastChannel) {
      broadcastChannel.onmessage = (event) => {
        if (event.data?.type === 'RESQ_STATE_UPDATE') {
          this.loadFromStorage();
          this.notifyListeners();
        }
      };
    }
  }

  private initData() {
    if (typeof window === 'undefined') return;

    try {
      const storedCases = localStorage.getItem(STORAGE_KEYS.CASES);
      this.cases = storedCases ? JSON.parse(storedCases) : [...INITIAL_ACTIVE_CASES];

      const storedDocs = localStorage.getItem(STORAGE_KEYS.DOCTORS);
      this.doctors = storedDocs ? JSON.parse(storedDocs) : [...SEED_DOCTORS];

      const storedAmbs = localStorage.getItem(STORAGE_KEYS.AMBULANCES);
      this.ambulances = storedAmbs ? JSON.parse(storedAmbs) : [...SEED_AMBULANCES];

      const storedHosps = localStorage.getItem(STORAGE_KEYS.HOSPITALS);
      this.hospitals = storedHosps ? JSON.parse(storedHosps) : [...SEED_HOSPITALS];

      const storedMsgs = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      this.messages = storedMsgs ? JSON.parse(storedMsgs) : [...SEED_MESSAGES];

      const storedAudits = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = storedAudits ? JSON.parse(storedAudits) : [...SEED_AUDIT_LOGS];

      const storedTriage = localStorage.getItem(STORAGE_KEYS.TRIAGE);
      this.triageAssessments = storedTriage ? JSON.parse(storedTriage) : {};

      this.saveToStorage();
    } catch (e) {
      console.warn('RESQ ONE storage initialization fallback', e);
      this.cases = [...INITIAL_ACTIVE_CASES];
      this.doctors = [...SEED_DOCTORS];
      this.ambulances = [...SEED_AMBULANCES];
      this.hospitals = [...SEED_HOSPITALS];
      this.messages = [...SEED_MESSAGES];
      this.auditLogs = [...SEED_AUDIT_LOGS];
    }
  }

  private loadFromStorage() {
    try {
      const storedCases = localStorage.getItem(STORAGE_KEYS.CASES);
      if (storedCases) this.cases = JSON.parse(storedCases);

      const storedDocs = localStorage.getItem(STORAGE_KEYS.DOCTORS);
      if (storedDocs) this.doctors = JSON.parse(storedDocs);

      const storedAmbs = localStorage.getItem(STORAGE_KEYS.AMBULANCES);
      if (storedAmbs) this.ambulances = JSON.parse(storedAmbs);

      const storedHosps = localStorage.getItem(STORAGE_KEYS.HOSPITALS);
      if (storedHosps) this.hospitals = JSON.parse(storedHosps);

      const storedMsgs = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      if (storedMsgs) this.messages = JSON.parse(storedMsgs);

      const storedAudits = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (storedAudits) this.auditLogs = JSON.parse(storedAudits);

      const storedTriage = localStorage.getItem(STORAGE_KEYS.TRIAGE);
      if (storedTriage) this.triageAssessments = JSON.parse(storedTriage);
    } catch {
      // ignore
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(this.cases));
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(this.doctors));
      localStorage.setItem(STORAGE_KEYS.AMBULANCES, JSON.stringify(this.ambulances));
      localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(this.hospitals));
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(this.messages));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
      localStorage.setItem(STORAGE_KEYS.TRIAGE, JSON.stringify(this.triageAssessments));

      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'RESQ_STATE_UPDATE', timestamp: Date.now() });
      }
    } catch (e) {
      console.warn('Failed saving to storage', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error(err);
      }
    });
  }

  // --- Audit Log Utility ---
  public addAuditLog(
    actor: { id: string; name: string; role: UserRole },
    action: string,
    targetType: string,
    targetId?: string,
    caseId?: string,
    metadata?: Record<string, any>
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action,
      caseId,
      targetType,
      targetId,
      metadata,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    this.auditLogs.unshift(entry);
    this.saveToStorage();
    this.notifyListeners();
    return entry;
  }

  // --- Case Queries ---
  public getAllCases(): EmergencyCase[] {
    return this.cases;
  }

  public getCaseById(id: string): EmergencyCase | null {
    return this.cases.find((c) => c.id === id) || null;
  }

  // Helper to map DB/operational status to visual Stage
  public mapStatusToStage(status: EmergencyStatus): EmergencyStage {
    switch (status) {
      case 'CREATED':
      case 'TRIAGE':
      case 'AMBULANCE_REQUESTED':
        return 'EMERGENCY_CLICK';
      case 'AMBULANCE_ASSIGNED':
      case 'AMBULANCE_EN_ROUTE':
      case 'AMBULANCE_ARRIVING':
        return 'AMBULANCE';
      case 'PATIENT_PICKED_UP':
      case 'DOCTOR_ASSIGNED':
      case 'DOCTOR_CONNECTED':
        return 'DOCTOR';
      case 'HOSPITAL_SEARCH':
      case 'HOSPITAL_NOTIFIED':
      case 'HOSPITAL_ACCEPTED':
      case 'PATIENT_ARRIVED':
        return 'HOSPITAL';
      case 'HANDOVER':
        return 'HANDOVER';
      case 'COMPLETED':
      case 'CANCELLED':
        return 'COMPLETED';
      default:
        return 'AMBULANCE';
    }
  }

  // --- Case Creation ---
  public createEmergencyCase(
    draft: Partial<EmergencyCase>,
    actor: { id: string; name: string; role: UserRole }
  ): EmergencyCase {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const caseId = `RX1-${dateStr}-${randomSeq}`;

    // Auto-select nearest available ambulance
    const availableAmb = this.ambulances.find((a) => a.status === 'AVAILABLE') || this.ambulances[0];
    const assignedDoc = this.doctors.find((d) => d.availability === 'AVAILABLE') || this.doctors[0];
    const defaultHosp = this.hospitals[0];

    const newCase: EmergencyCase = {
      id: caseId,
      targetMode: draft.targetMode || 'ME',
      patientName: draft.patientName || 'Emergency Patient',
      requesterName: actor.name || 'Jake Vance',
      relationship: draft.relationship || 'Self',
      patientAge: draft.patientAge,
      createdAt: 'Just now',
      location: draft.location || {
        type: 'Live Location',
        address: 'Current Verified Location',
        lat: 37.7749,
        lng: -122.4194
      },
      emergency: draft.emergency || {
        type: 'Acute Medical Distress',
        severity: 'CRITICAL (Priority 1)',
        symptoms: ['Acute emergency reported'],
        notes: ''
      },
      medicalInfo: draft.medicalInfo || {
        bloodGroup: 'NOT PROVIDED',
        allergies: ['NOT PROVIDED'],
        medicalConditions: ['NOT PROVIDED'],
        medications: ['NOT PROVIDED'],
        sourceLabel: 'Not Provided'
      },
      hospitalPreference: draft.hospitalPreference || {
        name: defaultHosp.name,
        distance: '2.4 miles',
        traumaTier: defaultHosp.traumaLevel,
        etaMinutes: 5
      },
      insurance: draft.insurance || 'NOT PROVIDED',
      currentStage: 'AMBULANCE',
      stageProgress: {
        emergencyClick: { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), done: true },
        ambulance: {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          done: true,
          unit: availableAmb ? availableAmb.unitId : 'CAD Unit Assigned',
          etaMin: 4
        },
        doctor: { done: false, doctorName: assignedDoc.name },
        hospital: { done: false, bay: 'Trauma Bay 1 (Pre-notified)' },
        handover: { done: false }
      },
      ambulance: {
        unitId: availableAmb ? availableAmb.unitId : 'ALS Medic 14',
        vehicleType: availableAmb?.vehicleType,
        driverParamedic: availableAmb?.driverParamedic || 'Paramedic Unit',
        medic: availableAmb?.leadMedic || 'EMS Specialist',
        phone: availableAmb?.phone || '+1 (555) 019-9114',
        etaMinutes: 4,
        status: 'En Route',
        currentLocation: {
          lat: availableAmb?.currentLat || 37.7785,
          lng: availableAmb?.currentLng || -122.414
        }
      },
      doctor: {
        name: assignedDoc.name,
        specialty: assignedDoc.specialization,
        hospitalAffiliation: assignedDoc.hospitalAffiliation,
        status: 'Connected',
        phone: assignedDoc.phone,
        instructions: [
          'Keep patient seated calmly with clear airway',
          'Do not administer oral liquids or solid food',
          'ALS paramedic team equipped with live telemetry and defibrillator'
        ],
        vitals: {
          heartRate: 92,
          bp: '130/84 mmHg',
          spo2: 98,
          respRate: 18
        }
      },
      hospital: {
        name: defaultHosp.name,
        address: defaultHosp.address,
        receivingDepartment: 'Acute Emergency Resuscitation',
        allocatedBay: 'Trauma Bay 1',
        leadSurgeonPhysician: 'Attending Emergency Surgeon on duty',
        status: 'Bay Prepped'
      },
      handover: {
        clinicalSummary: 'Rapid CAD emergency dispatch initiated via RESQ ONE.'
      }
    };

    // Update assigned ambulance status
    if (availableAmb) {
      availableAmb.status = 'EN_ROUTE';
      availableAmb.assignedCaseId = caseId;
    }

    this.cases = [newCase, ...this.cases];

    // Add initial system message & audit log
    this.sendMessage(
      caseId,
      `EMERGENCY INITIATED for ${newCase.patientName} (${newCase.relationship}) by ${actor.name}. Type: ${newCase.emergency.type}. Severity: ${newCase.emergency.severity}.`,
      actor,
      true
    );

    this.addAuditLog(
      actor,
      'EMERGENCY_CREATED',
      'EMERGENCY_CASE',
      caseId,
      caseId,
      {
        patient: newCase.patientName,
        relationship: newCase.relationship,
        severity: newCase.emergency.severity,
        assignedAmbulance: availableAmb?.unitId,
        assignedDoctor: assignedDoc.name
      }
    );

    this.saveToStorage();
    this.notifyListeners();
    return newCase;
  }

  // --- Status Transitions ---
  public updateCaseStatus(
    caseId: string,
    nextStatus: EmergencyStatus,
    actor: { id: string; name: string; role: UserRole },
    details?: string
  ): EmergencyCase | null {
    const caseIndex = this.cases.findIndex((c) => c.id === caseId);
    if (caseIndex === -1) return null;

    const existingCase = this.cases[caseIndex];
    const nextStage = this.mapStatusToStage(nextStatus);

    let ambStatus: 'Dispatched' | 'En Route' | 'Arrived at Patient' | 'En Route to Hospital' | 'Arrived at Hospital' = existingCase.ambulance.status;
    if (nextStatus === 'AMBULANCE_EN_ROUTE') ambStatus = 'En Route';
    if (nextStatus === 'AMBULANCE_ARRIVING') ambStatus = 'Arrived at Patient';
    if (nextStatus === 'PATIENT_PICKED_UP') ambStatus = 'En Route to Hospital';
    if (nextStatus === 'PATIENT_ARRIVED') ambStatus = 'Arrived at Hospital';

    const updatedCase: EmergencyCase = {
      ...existingCase,
      currentStage: nextStage,
      ambulance: {
        ...existingCase.ambulance,
        status: ambStatus
      },
      stageProgress: {
        ...existingCase.stageProgress,
        ambulance: {
          ...existingCase.stageProgress.ambulance,
          done: ['AMBULANCE', 'DOCTOR', 'HOSPITAL', 'HANDOVER', 'COMPLETED'].includes(nextStage)
        },
        doctor: {
          ...existingCase.stageProgress.doctor,
          done: ['DOCTOR', 'HOSPITAL', 'HANDOVER', 'COMPLETED'].includes(nextStage)
        },
        hospital: {
          ...existingCase.stageProgress.hospital,
          done: ['HOSPITAL', 'HANDOVER', 'COMPLETED'].includes(nextStage)
        },
        handover: {
          ...existingCase.stageProgress.handover,
          done: ['HANDOVER', 'COMPLETED'].includes(nextStage)
        }
      }
    };

    this.cases[caseIndex] = updatedCase;

    // Record system message
    this.sendMessage(
      caseId,
      `Status updated to: ${nextStatus.replace(/_/g, ' ')}${details ? ` (${details})` : ''}`,
      actor,
      true
    );

    // Record audit log
    this.addAuditLog(
      actor,
      'STATUS_CHANGED',
      'EMERGENCY_CASE',
      caseId,
      caseId,
      { nextStatus, nextStage, details }
    );

    this.saveToStorage();
    this.notifyListeners();
    return updatedCase;
  }

  // --- Assign Ambulance ---
  public assignAmbulance(
    caseId: string,
    ambulanceId: string,
    actor: { id: string; name: string; role: UserRole }
  ): void {
    const c = this.cases.find((x) => x.id === caseId);
    const amb = this.ambulances.find((a) => a.id === ambulanceId || a.unitId === ambulanceId);
    if (!c || !amb) return;

    amb.status = 'ASSIGNED';
    amb.assignedCaseId = caseId;

    c.ambulance = {
      unitId: amb.unitId,
      vehicleType: amb.vehicleType,
      driverParamedic: amb.driverParamedic,
      medic: amb.leadMedic,
      phone: amb.phone,
      etaMinutes: 3,
      status: 'En Route',
      currentLocation: { lat: amb.currentLat, lng: amb.currentLng }
    };
    c.stageProgress.ambulance = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      done: true,
      unit: amb.unitId,
      etaMin: 3
    };

    this.sendMessage(caseId, `Ambulance unit ${amb.unitId} (${amb.vehicleType}) assigned. Paramedic: ${amb.driverParamedic}`, actor, true);
    this.addAuditLog(actor, 'AMBULANCE_ASSIGNED', 'AMBULANCE', amb.unitId, caseId, {
      ambulanceId: amb.id,
      unitId: amb.unitId
    });

    this.saveToStorage();
    this.notifyListeners();
  }

  // --- Assign Doctor ---
  public assignDoctor(
    caseId: string,
    doctorId: string,
    actor: { id: string; name: string; role: UserRole }
  ): void {
    const c = this.cases.find((x) => x.id === caseId);
    const doc = this.doctors.find((d) => d.id === doctorId || d.name === doctorId);
    if (!c || !doc) return;

    if (!doc.assignedCaseIds.includes(caseId)) {
      doc.assignedCaseIds.push(caseId);
    }
    doc.availability = 'BUSY';

    c.doctor = {
      ...c.doctor,
      name: doc.name,
      specialty: doc.specialization,
      hospitalAffiliation: doc.hospitalAffiliation,
      phone: doc.phone,
      status: 'Connected'
    };
    c.stageProgress.doctor = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      done: true,
      doctorName: doc.name
    };

    this.sendMessage(caseId, `Doctor assigned: ${doc.name} (${doc.specialization}). Video telemetry live link established.`, actor, true);
    this.addAuditLog(actor, 'DOCTOR_ASSIGNED', 'DOCTOR', doc.name, caseId, {
      doctorId: doc.id,
      regNumber: doc.registrationNumber
    });

    this.saveToStorage();
    this.notifyListeners();
  }

  // --- Assign / Notify Hospital ---
  public selectHospital(
    caseId: string,
    hospitalId: string,
    bayName: string = 'Trauma Bay 2 (Prepped)',
    actor: { id: string; name: string; role: UserRole }
  ): void {
    const c = this.cases.find((x) => x.id === caseId);
    const hosp = this.hospitals.find((h) => h.id === hospitalId || h.name === hospitalId);
    if (!c || !hosp) return;

    c.hospital = {
      name: hosp.name,
      address: hosp.address,
      receivingDepartment: 'Acute Emergency Trauma & Resuscitation',
      allocatedBay: bayName,
      leadSurgeonPhysician: 'Chief of Trauma / Resuscitation',
      status: 'Bay Prepped'
    };
    c.stageProgress.hospital = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      done: true,
      bay: bayName
    };

    this.sendMessage(caseId, `Hospital pre-notification accepted by ${hosp.name}. Reserved: ${bayName}`, actor, true);
    this.addAuditLog(actor, 'HOSPITAL_ACCEPTED', 'HOSPITAL', hosp.name, caseId, {
      hospitalId: hosp.id,
      bayAllocated: bayName
    });

    this.saveToStorage();
    this.notifyListeners();
  }

  // --- Doctor Triage Submission ---
  public submitDoctorTriage(
    assessment: Omit<DoctorTriageAssessment, 'id' | 'timestamp'>,
    actor: { id: string; name: string; role: UserRole }
  ): DoctorTriageAssessment {
    const newAssessment: DoctorTriageAssessment = {
      ...assessment,
      id: `triage-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.triageAssessments[assessment.caseId] = newAssessment;

    const c = this.cases.find((x) => x.id === assessment.caseId);
    if (c) {
      c.emergency.severity = assessment.severity;
      c.emergency.notes = `${c.emergency.notes ? c.emergency.notes + '\n\n' : ''}[PHYSICIAN TRIAGE]: ${assessment.clinicalNotes}`;
      if (assessment.vitalSigns) {
        c.doctor.vitals = {
          heartRate: assessment.vitalSigns.heartRate || 95,
          bp: assessment.vitalSigns.bp || '130/85 mmHg',
          spo2: assessment.vitalSigns.spo2 || 98,
          respRate: assessment.vitalSigns.respRate || 18
        };
      }
      if (assessment.recommendedAction) {
        c.doctor.instructions = [assessment.recommendedAction, ...c.doctor.instructions];
      }
    }

    this.sendMessage(
      assessment.caseId,
      `CLINICAL TRIAGE RECORDED by ${assessment.doctorName}: Chief Complaint: ${assessment.chiefComplaint}. Severity: ${assessment.severity}. Instructions: ${assessment.recommendedAction}`,
      actor,
      true
    );

    this.addAuditLog(
      actor,
      'TRIAGE_ASSESSMENT_RECORDED',
      'TRIAGE',
      newAssessment.id,
      assessment.caseId,
      {
        severity: assessment.severity,
        pain: assessment.painSeverity,
        consciousness: assessment.consciousness
      }
    );

    this.saveToStorage();
    this.notifyListeners();
    return newAssessment;
  }

  public getTriageForCase(caseId: string): DoctorTriageAssessment | null {
    return this.triageAssessments[caseId] || null;
  }

  // --- Complete Handover ---
  public completeHandover(
    caseId: string,
    handoverData: {
      paramedicSign: string;
      receivingDoctor: string;
      clinicalSummary: string;
    },
    actor: { id: string; name: string; role: UserRole }
  ): void {
    const c = this.cases.find((x) => x.id === caseId);
    if (!c) return;

    c.currentStage = 'HANDOVER';
    c.handover = {
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      receivingDoctor: handoverData.receivingDoctor,
      paramedicSignOff: handoverData.paramedicSign,
      clinicalSummary: handoverData.clinicalSummary
    };
    c.stageProgress.handover = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      done: true,
      paramedicSign: handoverData.paramedicSign
    };

    // Free up assigned ambulance
    const assignedAmb = this.ambulances.find((a) => a.assignedCaseId === caseId);
    if (assignedAmb) {
      assignedAmb.status = 'COMPLETED';
      assignedAmb.assignedCaseId = null;
    }

    this.sendMessage(
      caseId,
      `PATIENT HANDOVER CERTIFIED. Transferred from Paramedic ${handoverData.paramedicSign} to Attending Physician ${handoverData.receivingDoctor}. Summary: ${handoverData.clinicalSummary}`,
      actor,
      true
    );

    this.addAuditLog(actor, 'PATIENT_HANDOVER_COMPLETED', 'HANDOVER', caseId, caseId, {
      paramedic: handoverData.paramedicSign,
      receivingDoctor: handoverData.receivingDoctor
    });

    this.saveToStorage();
    this.notifyListeners();
  }

  // --- Close / Cancel Case ---
  public closeCase(
    caseId: string,
    reason: string,
    actor: { id: string; name: string; role: UserRole }
  ): void {
    const c = this.cases.find((x) => x.id === caseId);
    if (!c) return;

    c.currentStage = 'COMPLETED';
    this.cases = this.cases.filter((x) => x.id !== caseId);

    // Free ambulance
    const assignedAmb = this.ambulances.find((a) => a.assignedCaseId === caseId);
    if (assignedAmb) {
      assignedAmb.status = 'AVAILABLE';
      assignedAmb.assignedCaseId = null;
    }

    this.addAuditLog(actor, 'CASE_CLOSED', 'EMERGENCY_CASE', caseId, caseId, { reason });
    this.saveToStorage();
    this.notifyListeners();
  }

  // --- Fleet & Provider State ---
  public getDoctors(): DoctorRecord[] {
    return this.doctors;
  }

  public updateDoctorAvailability(doctorId: string, availability: DoctorAvailability): void {
    const doc = this.doctors.find((d) => d.id === doctorId);
    if (doc) {
      doc.availability = availability;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  public getAmbulances(): AmbulanceRecord[] {
    return this.ambulances;
  }

  public updateAmbulanceStatus(ambulanceId: string, status: AmbulanceRecord['status']): void {
    const amb = this.ambulances.find((a) => a.id === ambulanceId);
    if (amb) {
      amb.status = status;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  public getHospitals(): HospitalRecord[] {
    return this.hospitals;
  }

  public updateHospitalBays(hospitalId: string, occupiedBays: number, isAccepting: boolean): void {
    const hosp = this.hospitals.find((h) => h.id === hospitalId);
    if (hosp) {
      hosp.occupiedBays = occupiedBays;
      hosp.isAcceptingEmergencies = isAccepting;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  // --- Case Messages ---
  public getMessages(caseId: string): CaseMessage[] {
    return this.messages.filter((m) => m.caseId === caseId);
  }

  public sendMessage(
    caseId: string,
    messageText: string,
    actor: { id: string; name: string; role: UserRole },
    isSystem: boolean = false
  ): CaseMessage {
    const msg: CaseMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      caseId,
      senderId: actor.id,
      senderName: actor.name,
      senderRole: actor.role,
      message: messageText,
      isSystemEvent: isSystem,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.messages.push(msg);
    this.saveToStorage();
    this.notifyListeners();
    return msg;
  }

  // --- Audit Logs ---
  public getAuditLogs(caseIdFilter?: string): AuditLogEntry[] {
    if (caseIdFilter) {
      return this.auditLogs.filter((a) => a.caseId === caseIdFilter);
    }
    return this.auditLogs;
  }
}

export const emergencyService = new EmergencyService();
