import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  DoctorRecord,
  AmbulanceRecord,
  HospitalRecord,
  AuditLogEntry,
  CaseMessage,
  DoctorTriageAssessment,
  EmergencyStatus,
  UserRole
} from '../types/roles';
import { EmergencyCase } from '../types/emergency';
import { INITIAL_ACTIVE_CASES } from '../data/mockInitialData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your-anon-key')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

export const getSupabaseConfigStatus = () => {
  const configured = isSupabaseConfigured();
  return {
    isConfigured: configured,
    url: supabaseUrl || null,
    hasAnonKey: Boolean(supabaseAnonKey && !supabaseAnonKey.includes('your-anon-key')),
    missingSecrets: !configured
      ? [
          {
            name: 'VITE_SUPABASE_URL',
            description: 'Supabase project URL (e.g. https://your-app.supabase.co)',
            where: '.env or deployment environment variables'
          },
          {
            name: 'VITE_SUPABASE_ANON_KEY',
            description: 'Supabase public anon key for database and auth queries',
            where: '.env or deployment environment variables'
          },
          {
            name: 'SUPABASE_SERVICE_ROLE_KEY',
            description: 'Supabase privileged service-role key (server-side only, never client-side)',
            where: 'server environment variables only'
          }
        ]
      : []
  };
};

// -------------------------------------------------------------------
// INITIAL SEED STORES FOR UNIFIED REALTIME OPERATION
// -------------------------------------------------------------------

export const SEED_DOCTORS: DoctorRecord[] = [
  {
    id: 'doc-aris-01',
    profileId: 'usr-doc-01',
    name: 'Dr. Katherine Aris, MD',
    registrationNumber: 'MD-88219-CAD',
    specialization: 'Attending Emergency Physician & Acute Resuscitation Lead',
    experienceYears: 14,
    hospitalAffiliation: 'Metro Health Trauma & Cardiac Center',
    phone: '+1 (555) 018-3829',
    verificationStatus: 'VERIFIED',
    availability: 'AVAILABLE',
    rating: 4.98,
    assignedCaseIds: ['RESQ-8492']
  },
  {
    id: 'doc-mansoor-02',
    profileId: 'usr-doc-02',
    name: 'Dr. Tariq Al-Mansoor, MD',
    registrationNumber: 'MD-74391-TRA',
    specialization: 'Trauma & Emergency Orthopedic Specialist',
    experienceYears: 11,
    hospitalAffiliation: 'St. Jude Regional Trauma Center',
    phone: '+1 (555) 018-7711',
    verificationStatus: 'VERIFIED',
    availability: 'AVAILABLE',
    rating: 4.94,
    assignedCaseIds: ['RESQ-9104']
  },
  {
    id: 'doc-chen-03',
    profileId: 'usr-doc-03',
    name: 'Dr. Michael Chen, MD, FACC',
    registrationNumber: 'MD-91204-CAR',
    specialization: 'Interventional Cardiology & STEMI Lead',
    experienceYears: 16,
    hospitalAffiliation: 'Metro Health Cardiac & Vascular Institute',
    phone: '+1 (555) 018-4491',
    verificationStatus: 'VERIFIED',
    availability: 'AVAILABLE',
    rating: 4.99,
    assignedCaseIds: []
  }
];

export const SEED_AMBULANCES: AmbulanceRecord[] = [
  {
    id: 'amb-als-14',
    unitId: 'ALS Medic 14',
    vehicleType: 'ALS (Advanced Life Support)',
    registrationNumber: 'CAD-CA-9921',
    driverParamedic: 'Sergeant M. Torres',
    leadMedic: 'C. Henderson, EMT-P',
    phone: '+1 (555) 019-9114',
    status: 'EN_ROUTE',
    currentLat: 37.7785,
    currentLng: -122.414,
    currentAddress: 'Mission St & 16th St En Route',
    assignedCaseId: 'RESQ-8492',
    speedMph: 42
  },
  {
    id: 'amb-res-08',
    unitId: 'Rescue 08',
    vehicleType: 'BLS Rapid Response',
    registrationNumber: 'CAD-CA-8808',
    driverParamedic: 'Officer D. Wu',
    leadMedic: 'J. Reynolds, EMT-P',
    phone: '+1 (555) 019-8808',
    status: 'ON_SCENE',
    currentLat: 37.7725,
    currentLng: -122.4289,
    currentAddress: 'Central Park West & 72nd St Crosswalk',
    assignedCaseId: 'RESQ-9104',
    speedMph: 0
  },
  {
    id: 'amb-als-22',
    unitId: 'ALS Unit 22',
    vehicleType: 'ALS Mobile ICU',
    registrationNumber: 'CAD-CA-2201',
    driverParamedic: 'Paramedic S. Jackson',
    leadMedic: 'R. Patel, EMT-P',
    phone: '+1 (555) 019-2288',
    status: 'AVAILABLE',
    currentLat: 37.7749,
    currentLng: -122.4194,
    currentAddress: 'Station 4 CAD Bay Standby',
    assignedCaseId: null,
    speedMph: 0
  },
  {
    id: 'amb-cct-05',
    unitId: 'Medic Unit 05',
    vehicleType: 'Critical Care Transport (CCT)',
    registrationNumber: 'CAD-CA-0511',
    driverParamedic: 'Lt. A. Gomez',
    leadMedic: 'T. Evans, RN/EMT-P',
    phone: '+1 (555) 019-0511',
    status: 'AVAILABLE',
    currentLat: 37.7833,
    currentLng: -122.4167,
    currentAddress: 'Downtown Staging Post 2',
    assignedCaseId: null,
    speedMph: 0
  }
];

export const SEED_HOSPITALS: HospitalRecord[] = [
  {
    id: 'hosp-metro-01',
    name: 'Metro Health Cardiac & Vascular Institute',
    code: 'HOSP-METRO-01',
    traumaLevel: 'Level 1 Trauma & Cardiac Cath',
    address: '1001 Potrero Ave, San Francisco, CA',
    bayEntrance: 'North ER Trauma Wing Entrance',
    lat: 37.7558,
    lng: -122.4045,
    emergencyPhone: '+1 (555) 019-9114',
    totalTraumaBays: 12,
    occupiedBays: 4,
    isAcceptingEmergencies: true,
    specialties: ['Cardiac Catheterization', 'STEMI Fast-Track', 'Resuscitation', 'ECLS / ECMO']
  },
  {
    id: 'hosp-stjude-02',
    name: 'St. Jude Comprehensive Trauma Center',
    code: 'HOSP-STJUDE-02',
    traumaLevel: 'Level 1 Trauma & Comprehensive Stroke',
    address: '850 Bryant St, San Francisco, CA',
    bayEntrance: 'Ambulance Bay Entrance A',
    lat: 37.776,
    lng: -122.406,
    emergencyPhone: '+1 (555) 018-7711',
    totalTraumaBays: 10,
    occupiedBays: 3,
    isAcceptingEmergencies: true,
    specialties: ['Comprehensive Stroke Center', 'Neurotrauma', 'Orthopedic Surgery', 'Burn ICU']
  },
  {
    id: 'hosp-ped-03',
    name: 'Children’s Specialty Acute Pediatric ER',
    code: 'HOSP-PED-03',
    traumaLevel: 'Level 1 Pediatric Trauma',
    address: '505 Parnassus Ave, San Francisco, CA',
    bayEntrance: 'Pediatric Emergency Dedicated Bay',
    lat: 37.7632,
    lng: -122.4578,
    emergencyPhone: '+1 (555) 018-4422',
    totalTraumaBays: 8,
    occupiedBays: 2,
    isAcceptingEmergencies: true,
    specialties: ['Pediatric Resuscitation', 'Pediatric Surgery', 'Anaphylaxis Protocol']
  }
];

export const SEED_MESSAGES: CaseMessage[] = [
  {
    id: 'msg-01',
    caseId: 'RESQ-8492',
    senderId: 'sys-01',
    senderName: 'RESQ ONE Dispatch CAD',
    senderRole: 'RESQ_ADMIN',
    message: 'Emergency request initialized by Jake Vance for Robert Vance (Father). Priority 1 Cardiac.',
    isSystemEvent: true,
    timestamp: '09:05 AM'
  },
  {
    id: 'msg-02',
    caseId: 'RESQ-8492',
    senderId: 'doc-aris-01',
    senderName: 'Dr. Katherine Aris, MD',
    senderRole: 'DOCTOR',
    message: 'Connected to telemetry. Please do not give additional aspirin due to patient documented gastric allergy. Keep patient at 45 degree angle.',
    timestamp: '09:07 AM'
  },
  {
    id: 'msg-03',
    caseId: 'RESQ-8492',
    senderId: 'amb-als-14',
    senderName: 'Sergeant M. Torres (ALS Medic 14)',
    senderRole: 'AMBULANCE_OPERATOR',
    message: 'ALS 14 en route, sirens on, navigating Mission St. ETA 3 minutes.',
    timestamp: '09:08 AM'
  },
  {
    id: 'msg-04',
    caseId: 'RESQ-8492',
    senderId: 'hosp-metro-01',
    senderName: 'Metro Health Cardiac ER',
    senderRole: 'HOSPITAL',
    message: 'Cath Lab Bay 2 reserved. Interventional team notified and standing by.',
    timestamp: '09:09 AM'
  }
];

export const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-01',
    actorId: 'usr-jake-001',
    actorName: 'Jake Vance',
    actorRole: 'REQUESTER',
    action: 'EMERGENCY_CREATED',
    caseId: 'RESQ-8492',
    targetType: 'EMERGENCY_CASE',
    targetId: 'RESQ-8492',
    metadata: { patient: 'Robert Vance', relationship: 'Father', severity: 'CRITICAL (Priority 1)' },
    timestamp: '2026-10-02 09:05:12'
  },
  {
    id: 'aud-02',
    actorId: 'cad-auto-01',
    actorName: 'CAD Auto-Router',
    actorRole: 'RESQ_ADMIN',
    action: 'AMBULANCE_DISPATCHED',
    caseId: 'RESQ-8492',
    targetType: 'AMBULANCE',
    targetId: 'ALS Medic 14',
    metadata: { unit: 'ALS Medic 14', distance: '1.8 miles', eta: 4 },
    timestamp: '2026-10-02 09:06:01'
  },
  {
    id: 'aud-03',
    actorId: 'doc-aris-01',
    actorName: 'Dr. Katherine Aris, MD',
    actorRole: 'DOCTOR',
    action: 'DOCTOR_CONNECTED',
    caseId: 'RESQ-8492',
    targetType: 'EMERGENCY_CASE',
    targetId: 'RESQ-8492',
    metadata: { registration: 'MD-88219-CAD', specialty: 'Acute Resuscitation' },
    timestamp: '2026-10-02 09:07:34'
  },
  {
    id: 'aud-04',
    actorId: 'hosp-metro-01',
    actorName: 'Metro Health Intake',
    actorRole: 'HOSPITAL',
    action: 'HOSPITAL_ACCEPTED',
    caseId: 'RESQ-8492',
    targetType: 'HOSPITAL',
    targetId: 'Cath Lab Bay 2',
    metadata: { bayAllocated: 'Cath Lab Bay 2', surgeon: 'Dr. M. Chen' },
    timestamp: '2026-10-02 09:08:45'
  }
];
