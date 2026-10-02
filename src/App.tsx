import React, { useState } from 'react';
import {
  CURRENT_LOGGED_IN_USER,
  INITIAL_FAMILY_PROFILES,
  INITIAL_ACTIVE_CASES,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_INSURANCE_POLICIES,
  INITIAL_HOSPITAL_PREFERENCES
} from './data/mockInitialData';
import {
  EmergencyMode,
  EmergencyCase,
  FamilyMemberProfile,
  UserEmergencyProfile,
  EmergencyStage,
  MedicalRecord,
  InsurancePolicy,
  HospitalPreference
} from './types/emergency';
import { ResqLogo } from './components/ResqLogo';
import { WhoNeedsHelpModal } from './components/WhoNeedsHelpModal';
import { MeEmergencyFlow } from './components/MeEmergencyFlow';
import { FamilyEmergencyFlow } from './components/FamilyEmergencyFlow';
import { FriendEmergencyFlow } from './components/FriendEmergencyFlow';
import { EmergencySummaryModal, EmergencySummaryData } from './components/EmergencySummaryModal';
import { ActiveCasesSwitcher } from './components/ActiveCasesSwitcher';
import { ActiveEmergencyTracker } from './components/ActiveEmergencyTracker';
import { FamilyManagementModal } from './components/FamilyManagementModal';
import { SelfProfileModal } from './components/SelfProfileModal';
import { MedicalRecordsManager } from './components/MedicalRecordsManager';
import { InsuranceManager } from './components/InsuranceManager';
import { HospitalPreferencesManager } from './components/HospitalPreferencesManager';
import { SignUpRegistrationPage } from './components/SignUpRegistrationPage';
import { NavigationMenuModal } from './components/NavigationMenuModal';
import { emergencyAudio } from './utils/audio';
import { RoleSwitcher, DEMO_USERS } from './components/auth/RoleSwitcher';
import { UnifiedLoginModal } from './components/auth/UnifiedLoginModal';
import { RoleAccessGate } from './components/auth/RoleAccessGate';
import { DoctorPortal } from './components/portals/DoctorPortal';
import { OperationsPortal } from './components/portals/OperationsPortal';
import { HospitalPortal } from './components/portals/HospitalPortal';
import { AdminPortal } from './components/portals/AdminPortal';
import { emergencyService } from './services/emergencyService';
import { AppUserSession, EmergencyStatus } from './types/roles';
import {
  Shield,
  HeartPulse,
  PhoneCall,
  User,
  Users,
  UserPlus,
  Volume2,
  VolumeX,
  Building,
  CheckCircle,
  AlertTriangle,
  Radio,
  Plus,
  FileText,
  CreditCard,
  Building2,
  MapPin,
  ShieldCheck,
  UserCheck,
  Menu,
  Stethoscope,
  Ambulance,
  KeyRound,
  LogOut,
  Lock
} from 'lucide-react';

export default function App() {
  // Application Data States
  const [currentSession, setCurrentSession] = useState<AppUserSession>(DEMO_USERS.PATIENT);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalNotice, setLoginModalNotice] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserEmergencyProfile>(CURRENT_LOGGED_IN_USER);
  const [familyProfiles, setFamilyProfiles] = useState<FamilyMemberProfile[]>(INITIAL_FAMILY_PROFILES);
  const [activeCases, setActiveCases] = useState<EmergencyCase[]>(emergencyService.getAllCases());
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(emergencyService.getAllCases()[0]?.id || null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>(INITIAL_MEDICAL_RECORDS);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>(INITIAL_INSURANCE_POLICIES);
  const [hospitalPreferences, setHospitalPreferences] = useState<HospitalPreference[]>(INITIAL_HOSPITAL_PREFERENCES);
  const [registrationBanner, setRegistrationBanner] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Flow Navigation States
  // 'DASHBOARD' | 'MODE_ME' | 'MODE_FAMILY' | 'MODE_FRIEND' | 'ACTIVE_TRACKER' | 'MEDICAL_RECORDS' | 'INSURANCE' | 'HOSPITAL_PREFERENCES' | 'SIGN_UP' | 'DOCTOR_PORTAL' | 'OPERATIONS_PORTAL' | 'HOSPITAL_PORTAL' | 'ADMIN_PORTAL'
  const [currentView, setCurrentView] = useState<
    | 'DASHBOARD'
    | 'MODE_ME'
    | 'MODE_FAMILY'
    | 'MODE_FRIEND'
    | 'ACTIVE_TRACKER'
    | 'MEDICAL_RECORDS'
    | 'INSURANCE'
    | 'HOSPITAL_PREFERENCES'
    | 'SIGN_UP'
    | 'DOCTOR_PORTAL'
    | 'OPERATIONS_PORTAL'
    | 'HOSPITAL_PORTAL'
    | 'ADMIN_PORTAL'
  >('DASHBOARD');

  // Synchronize state with real-time emergency service
  React.useEffect(() => {
    const handleSync = () => {
      const cases = emergencyService.getAllCases();
      setActiveCases([...cases]);
      if (!selectedCaseId && cases.length > 0) {
        setSelectedCaseId(cases[0].id);
      }
    };
    handleSync();
    const unsubscribe = emergencyService.subscribe(handleSync);
    return unsubscribe;
  }, [selectedCaseId]);

  // Modal dialog states
  const [isWhoNeedsHelpOpen, setIsWhoNeedsHelpOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<EmergencySummaryData | null>(null);
  const [pendingDraftCase, setPendingDraftCase] = useState<Partial<EmergencyCase> | null>(null);
  const [isFamilyMgmtOpen, setIsFamilyMgmtOpen] = useState(false);
  const [isSelfProfileOpen, setIsSelfProfileOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    emergencyAudio.setSoundEnabled(next);
    if (next) emergencyAudio.playClick();
  };

  // Main Emergency Button Handler: opens dedicated WHO NEEDS HELP? screen
  const handleMainEmergencyClick = () => {
    emergencyAudio.playClick();
    setIsWhoNeedsHelpOpen(true);
  };

  // Dedicated Screen Selection
  const handleSelectMode = (mode: EmergencyMode) => {
    setIsWhoNeedsHelpOpen(false);
    emergencyAudio.playClick();
    if (mode === 'ME') {
      setCurrentView('MODE_ME');
    } else if (mode === 'FAMILY') {
      setCurrentView('MODE_FAMILY');
    } else if (mode === 'FRIEND_OTHER') {
      setCurrentView('MODE_FRIEND');
    }
  };

  // Callback from Mode 1: ME
  const handleMeContinueToSummary = (data: {
    selectedEmergency: string;
    severity: 'CRITICAL (Priority 1)' | 'URGENT (Priority 2)' | 'STANDARD (Priority 3)';
    symptomsNotes: string;
    consciousness: 'Conscious & Alert' | 'Drowsy / Confused' | 'Unconscious';
    breathing: 'Normal' | 'Labored / Struggling' | 'Gasping / Arrest';
    location: {
      type: 'Live Location' | 'Map Pin' | 'Manual Address';
      address: string;
      lat: number;
      lng: number;
    };
  }) => {
    const draft: Partial<EmergencyCase> = {
      targetMode: 'ME',
      patientName: userProfile.fullName,
      requesterName: userProfile.fullName,
      relationship: 'Self',
      patientAge: userProfile.age,
      location: {
        type: data.location.type,
        address: data.location.address,
        lat: data.location.lat,
        lng: data.location.lng
      },
      emergency: {
        type: data.selectedEmergency,
        severity: data.severity,
        symptoms: [data.symptomsNotes],
        notes: data.symptomsNotes,
        consciousness: data.consciousness,
        breathing: data.breathing
      },
      medicalInfo: {
        bloodGroup: userProfile.bloodGroup,
        allergies: userProfile.allergies,
        medicalConditions: userProfile.medicalConditions,
        medications: userProfile.medications,
        medicalAlerts: userProfile.medicalHistory,
        sourceLabel: 'Authorized Personal Emergency Passport'
      },
      hospitalPreference: {
        name: userProfile.preferredHospitals[0]?.name || 'St. Jude Comprehensive Trauma Center',
        distance: userProfile.preferredHospitals[0]?.distance || '3.2 miles',
        traumaTier: userProfile.preferredHospitals[0]?.traumaLevel || 'Level 1 Trauma',
        etaMinutes: 5
      },
      insurance: `${userProfile.insuranceInfo.provider} (${userProfile.insuranceInfo.policyNumber})`
    };

    setPendingDraftCase(draft);
    setSummaryData({
      patientName: userProfile.fullName,
      requesterName: userProfile.fullName,
      relationship: 'Self',
      patientAge: userProfile.age,
      location: data.location,
      emergencyType: data.selectedEmergency,
      severity: data.severity,
      notes: data.symptomsNotes,
      consciousness: data.consciousness,
      breathing: data.breathing,
      knownMedicalInfo: {
        bloodGroup: userProfile.bloodGroup,
        allergies: userProfile.allergies,
        conditions: userProfile.medicalConditions,
        medications: userProfile.medications,
        source: 'Authorized User Profile'
      },
      hospitalPreference: {
        name: userProfile.preferredHospitals[0].name,
        distance: userProfile.preferredHospitals[0].distance,
        traumaTier: userProfile.preferredHospitals[0].traumaLevel
      },
      insurance: userProfile.insuranceInfo.provider
    });
    setIsSummaryModalOpen(true);
  };

  // Callback from Mode 2: FAMILY
  const handleFamilyContinueToSummary = (data: {
    familyMember: FamilyMemberProfile;
    selectedEmergency: string;
    severity: 'CRITICAL (Priority 1)' | 'URGENT (Priority 2)' | 'STANDARD (Priority 3)';
    symptomsNotes: string;
    consciousness: 'Conscious & Alert' | 'Drowsy / Confused' | 'Unconscious';
    breathing: 'Normal' | 'Labored / Struggling' | 'Gasping / Arrest';
    location: {
      type: 'Live Location' | 'Map Pin' | 'Manual Address';
      address: string;
      lat: number;
      lng: number;
    };
  }) => {
    const member = data.familyMember;
    const draft: Partial<EmergencyCase> = {
      targetMode: 'FAMILY',
      patientName: member.name,
      requesterName: userProfile.fullName,
      relationship: member.relationship,
      patientAge: member.age,
      location: {
        type: data.location.type,
        address: data.location.address,
        lat: data.location.lat,
        lng: data.location.lng
      },
      emergency: {
        type: data.selectedEmergency,
        severity: data.severity,
        symptoms: [data.symptomsNotes],
        notes: data.symptomsNotes,
        consciousness: data.consciousness,
        breathing: data.breathing
      },
      medicalInfo: {
        bloodGroup: member.authorizedInfo.bloodGroup || 'O+',
        allergies: member.authorizedInfo.allergies || ['NKDA'],
        medicalConditions: member.authorizedInfo.medicalConditions || [],
        medications: member.authorizedInfo.medications || [],
        medicalAlerts: member.authorizedInfo.medicalAlerts || [],
        sourceLabel: 'Authorized Family Health Record'
      },
      hospitalPreference: {
        name: member.authorizedInfo.preferredHospital || 'Metro Health Trauma Pavilion',
        distance: '2.8 miles',
        traumaTier: 'Level 1 Trauma & Cardiac Emergency',
        etaMinutes: 6
      },
      insurance: member.authorizedInfo.insuranceStatus || 'Family Plan Verified'
    };

    setPendingDraftCase(draft);
    setSummaryData({
      patientName: member.name,
      requesterName: userProfile.fullName,
      relationship: member.relationship,
      patientAge: member.age,
      location: data.location,
      emergencyType: data.selectedEmergency,
      severity: data.severity,
      notes: data.symptomsNotes,
      consciousness: data.consciousness,
      breathing: data.breathing,
      knownMedicalInfo: {
        bloodGroup: member.authorizedInfo.bloodGroup,
        allergies: member.authorizedInfo.allergies,
        conditions: member.authorizedInfo.medicalConditions,
        medications: member.authorizedInfo.medications,
        alerts: member.authorizedInfo.medicalAlerts,
        source: 'Authorized Family Record'
      },
      hospitalPreference: {
        name: member.authorizedInfo.preferredHospital || 'Metro Health Cardiac Center',
        distance: '2.8 miles',
        traumaTier: 'Level 1 Emergency Facility'
      },
      insurance: member.authorizedInfo.insuranceStatus
    });
    setIsSummaryModalOpen(true);
  };

  // Callback from Mode 3: FRIEND / OTHER
  const handleFriendContinueToSummary = (data: any) => {
    const draft: Partial<EmergencyCase> = {
      targetMode: 'FRIEND_OTHER',
      patientName: data.patientName,
      requesterName: userProfile.fullName,
      relationship: data.relationshipToRequester,
      patientAge: data.approximateAge,
      location: {
        type: data.patientLocation.type,
        address: data.patientLocation.address,
        lat: data.coords.lat,
        lng: data.coords.lng
      },
      emergency: {
        type: data.emergencyType,
        severity: data.severity,
        symptoms: [data.notes || 'Emergency dispatch initiated by bystander'],
        notes: data.notes || '',
        consciousness: 'Conscious & Alert',
        breathing: 'Normal'
      },
      medicalInfo: {
        bloodGroup: 'NOT PROVIDED',
        allergies: [data.knownAllergies],
        medicalConditions: [data.knownMedicalCondition],
        medications: [data.currentMedication],
        medicalAlerts: data.emergencyContact !== 'NOT PROVIDED' ? [`Emergency Contact: ${data.emergencyContact}`] : ['NOT PROVIDED'],
        sourceLabel: 'Requester Input (Friend / Bystander - No Medical Records Inferred)',
        isFriendOrUnknown: true
      },
      hospitalPreference: {
        name: 'St. Jude Comprehensive Trauma Center',
        distance: '2.1 miles',
        traumaTier: 'Nearest Accredited Level 1 Center',
        etaMinutes: 4
      },
      insurance: 'NOT PROVIDED'
    };

    setPendingDraftCase(draft);
    setSummaryData({
      patientName: data.patientName,
      requesterName: userProfile.fullName,
      relationship: data.relationshipToRequester,
      patientAge: data.approximateAge,
      location: {
        type: data.patientLocation.type,
        address: data.patientLocation.address,
        lat: data.coords.lat,
        lng: data.coords.lng
      },
      emergencyType: data.emergencyType,
      severity: data.severity,
      notes: data.notes,
      knownMedicalInfo: {
        bloodGroup: 'NOT PROVIDED',
        allergies: data.knownAllergies,
        conditions: data.knownMedicalCondition,
        medications: data.currentMedication,
        alerts: data.emergencyContact !== 'NOT PROVIDED' ? [`Contact: ${data.emergencyContact}`] : undefined,
        source: 'Explicit Requester Input (Non-Inferred)'
      },
      hospitalPreference: {
        name: 'Nearest Level 1 Trauma Hospital',
        distance: '2.1 miles',
        traumaTier: 'Standard Emergency EMS Routing'
      },
      insurance: 'NOT PROVIDED / INDIGENT CARE'
    });
    setIsSummaryModalOpen(true);
  };

  // Final Dispatch Confirmation from Summary Modal
  const handleConfirmFinalDispatch = () => {
    if (!pendingDraftCase) return;

    const newCase = emergencyService.createEmergencyCase(pendingDraftCase, {
      id: currentSession.id,
      name: currentSession.fullName,
      role: currentSession.role
    });

    setActiveCases(emergencyService.getAllCases());
    setSelectedCaseId(newCase.id);
    setIsSummaryModalOpen(false);
    setCurrentView('ACTIVE_TRACKER');
  };

  // Stage progression for active case
  const handleUpdateStage = (caseId: string, nextStage: EmergencyStage) => {
    let nextStatus: EmergencyStatus = 'AMBULANCE_EN_ROUTE';
    if (nextStage === 'DOCTOR') nextStatus = 'DOCTOR_CONNECTED';
    if (nextStage === 'HOSPITAL') nextStatus = 'HOSPITAL_ACCEPTED';
    if (nextStage === 'HANDOVER') nextStatus = 'HANDOVER';
    if (nextStage === 'COMPLETED') nextStatus = 'COMPLETED';

    emergencyService.updateCaseStatus(caseId, nextStatus, {
      id: currentSession.id,
      name: currentSession.fullName,
      role: currentSession.role
    });
    setActiveCases(emergencyService.getAllCases());
  };

  // Resolve/complete case
  const handleCompleteCase = (caseId: string) => {
    emergencyService.closeCase(caseId, 'Completed / Resolved', {
      id: currentSession.id,
      name: currentSession.fullName,
      role: currentSession.role
    });
    const remaining = emergencyService.getAllCases();
    setActiveCases(remaining);
    if (selectedCaseId === caseId) {
      setSelectedCaseId(remaining.length > 0 ? remaining[0].id : null);
      if (remaining.length === 0) {
        setCurrentView('DASHBOARD');
      }
    }
  };

  // Past Medical Records Handlers
  const handleSaveRecord = (saved: MedicalRecord) => {
    setMedicalRecords((prev) => {
      const exists = prev.some((r) => r.id === saved.id);
      if (exists) {
        return prev.map((r) => (r.id === saved.id ? saved : r));
      }
      return [saved, ...prev];
    });

    // If for current user, keep medical history updated
    if (saved.patientId === userProfile.id) {
      setUserProfile((prev) => {
        const updatedHistory = prev.medicalHistory.includes(saved.title)
          ? prev.medicalHistory
          : [saved.title, ...prev.medicalHistory];
        return { ...prev, medicalHistory: updatedHistory };
      });
    }
  };

  const handleDeleteRecord = (id: string) => {
    setMedicalRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Insurance Policies Handlers
  const handleSavePolicy = (saved: InsurancePolicy) => {
    setInsurancePolicies((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      if (exists) return prev.map((p) => (p.id === saved.id ? saved : p));
      return [saved, ...prev];
    });

    if (saved.patientId === userProfile.id) {
      setUserProfile((prev) => ({
        ...prev,
        insuranceInfo: {
          ...prev.insuranceInfo,
          provider: saved.provider,
          policyNumber: saved.policyNumber,
          groupNumber: saved.groupNumber,
          validThru: saved.validThru
        }
      }));
    }
  };

  // Hospital Preferences Handlers
  const handleSaveHospitalPreference = (saved: HospitalPreference) => {
    setHospitalPreferences((prev) => {
      const exists = prev.some((h) => h.id === saved.id);
      if (exists) return prev.map((h) => (h.id === saved.id ? saved : h));
      return [saved, ...prev];
    });

    if (saved.patientId === userProfile.id && saved.isDefault) {
      setUserProfile((prev) => ({
        ...prev,
        preferredHospitals: [
          { name: saved.name, distance: `${saved.distanceMiles} miles`, traumaLevel: saved.traumaLevel },
          ...prev.preferredHospitals.filter((h) => h.name !== saved.name)
        ]
      }));
    }
  };

  const handleSetPrimaryHospital = (id: string, patientId: string) => {
    setHospitalPreferences((prev) =>
      prev.map((h) => {
        if (h.patientId === patientId) {
          return {
            ...h,
            isDefault: h.id === id,
            rankOrder: h.id === id ? 1 : h.rankOrder + 1
          };
        }
        return h;
      })
    );
  };

  const handleDeleteHospitalPreference = (id: string) => {
    setHospitalPreferences((prev) => prev.filter((h) => h.id !== id));
  };

  // Open Portal Handler
  const handleOpenPortal = (portal: 'PATIENT' | 'DOCTOR' | 'OPERATIONS' | 'HOSPITAL' | 'ADMIN') => {
    if (portal === 'PATIENT') setCurrentView('DASHBOARD');
    else if (portal === 'DOCTOR') setCurrentView('DOCTOR_PORTAL');
    else if (portal === 'OPERATIONS') setCurrentView('OPERATIONS_PORTAL');
    else if (portal === 'HOSPITAL') setCurrentView('HOSPITAL_PORTAL');
    else if (portal === 'ADMIN') setCurrentView('ADMIN_PORTAL');
  };

  // Complete Registration Handler
  const handleCompleteRegistration = (data: {
    userProfile: UserEmergencyProfile;
    newMedicalRecord?: MedicalRecord;
    newInsurancePolicy?: InsurancePolicy;
    newHospitalPreference?: HospitalPreference;
  }) => {
    setUserProfile(data.userProfile);
    if (data.newMedicalRecord) {
      setMedicalRecords((prev) => [data.newMedicalRecord!, ...prev]);
    }
    if (data.newInsurancePolicy) {
      setInsurancePolicies((prev) => [data.newInsurancePolicy!, ...prev]);
    }
    if (data.newHospitalPreference) {
      setHospitalPreferences((prev) => [data.newHospitalPreference!, ...prev]);
    }
    setRegistrationBanner(
      `Registration Complete! Welcome ${data.userProfile.fullName}. Your emergency health profile, past medical records, insurance documents, and hospital preferences have been armed for instant one-click response.`
    );
    setCurrentView('DASHBOARD');
  };

  const currentSelectedCase = activeCases.find((c) => c.id === selectedCaseId) || activeCases[0] || null;

  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100 flex flex-col selection:bg-red-600 selection:text-white">
      {/* Top Bar adhering to the Top Bar Contract:
          Zone 1: Brand Wordmark (RESQ ONE)
          Zone 2: Clean nav links
          Zone 3: Sound toggle & Profile / Emergency SOS
      */}
      <header className="sticky top-0 z-40 w-full bg-[#0A0C11]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Zone 1: Brand Title */}
          <button
            onClick={() => setCurrentView('DASHBOARD')}
            className="flex items-center gap-2 group text-left focus:outline-none"
            aria-label="RESQ ONE Home"
          >
            <ResqLogo variant="compact" />
          </button>

          {/* Zone 2: Navigation Links (Strictly isolated by authenticated role) */}
          <nav className="hidden sm:flex items-center gap-4 text-xs font-semibold text-slate-400">
            {/* Patients & Requesters only see Emergency SOS and active tracking */}
            {(currentSession.role === 'PATIENT' || currentSession.role === 'REQUESTER' || currentSession.role === 'SUPER_ADMIN' || currentSession.role === 'RESQ_ADMIN') && (
              <button
                onClick={() => setCurrentView('DASHBOARD')}
                className={`hover:text-white transition-colors flex items-center gap-1.5 ${currentView === 'DASHBOARD' ? 'text-white font-bold' : ''}`}
              >
                <span>Emergency SOS</span>
              </button>
            )}

            {activeCases.length > 0 && (
              <button
                onClick={() => setCurrentView('ACTIVE_TRACKER')}
                className={`hover:text-white transition-colors flex items-center gap-1.5 ${currentView === 'ACTIVE_TRACKER' ? 'text-red-400 font-bold' : ''}`}
              >
                <span>Active Cases</span>
                <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-mono">
                  {activeCases.length}
                </span>
              </button>
            )}

            {/* Clinician Doctor Link: strictly for DOCTOR or ADMIN */}
            {(currentSession.role === 'DOCTOR' || currentSession.role === 'SUPER_ADMIN' || currentSession.role === 'RESQ_ADMIN') && (
              <button
                onClick={() => setCurrentView('DOCTOR_PORTAL')}
                className={`hover:text-emerald-300 transition-colors flex items-center gap-1.5 ${
                  currentView === 'DOCTOR_PORTAL' ? 'text-emerald-400 font-bold' : ''
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor Portal</span>
              </button>
            )}

            {/* Ambulance Dispatch Link: strictly for AMBULANCE_OPERATOR or ADMIN */}
            {(currentSession.role === 'AMBULANCE_OPERATOR' || currentSession.role === 'SUPER_ADMIN' || currentSession.role === 'RESQ_ADMIN') && (
              <button
                onClick={() => setCurrentView('OPERATIONS_PORTAL')}
                className={`hover:text-amber-300 transition-colors flex items-center gap-1.5 ${
                  currentView === 'OPERATIONS_PORTAL' ? 'text-amber-400 font-bold' : ''
                }`}
              >
                <Ambulance className="w-3.5 h-3.5" />
                <span>CAD Operations</span>
              </button>
            )}

            {/* Hospital Intake Link: strictly for HOSPITAL or ADMIN */}
            {(currentSession.role === 'HOSPITAL' || currentSession.role === 'SUPER_ADMIN' || currentSession.role === 'RESQ_ADMIN') && (
              <button
                onClick={() => setCurrentView('HOSPITAL_PORTAL')}
                className={`hover:text-purple-300 transition-colors flex items-center gap-1.5 ${
                  currentView === 'HOSPITAL_PORTAL' ? 'text-purple-400 font-bold' : ''
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Hospital Bay</span>
              </button>
            )}

            {/* Super Admin Overwatch: strictly for SUPER_ADMIN or RESQ_ADMIN */}
            {(currentSession.role === 'SUPER_ADMIN' || currentSession.role === 'RESQ_ADMIN') && (
              <button
                onClick={() => setCurrentView('ADMIN_PORTAL')}
                className={`hover:text-blue-300 transition-colors flex items-center gap-1.5 ${
                  currentView === 'ADMIN_PORTAL' ? 'text-blue-400 font-bold' : ''
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Admin Command</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Login & Role Credentials Modal Trigger */}
            <button
              onClick={() => {
                setLoginModalNotice(null);
                setIsLoginModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#121622] hover:bg-[#1A2030] border border-slate-700/80 text-xs font-bold text-slate-200 transition-all shadow-sm group"
              title="Open Role Login & Credentials"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-45 transition-transform" />
              <span>Login / Roles</span>
            </button>

            {/* Multi-role persona & Supabase status selector */}
            <RoleSwitcher
              currentSession={currentSession}
              onSwitchSession={(session) => {
                setCurrentSession(session);
                if (session.role === 'DOCTOR') setCurrentView('DOCTOR_PORTAL');
                else if (session.role === 'AMBULANCE_OPERATOR') setCurrentView('OPERATIONS_PORTAL');
                else if (session.role === 'HOSPITAL') setCurrentView('HOSPITAL_PORTAL');
                else if (session.role === 'SUPER_ADMIN' || session.role === 'RESQ_ADMIN') setCurrentView('ADMIN_PORTAL');
                else setCurrentView('DASHBOARD');
              }}
              onOpenPortal={handleOpenPortal}
            />

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 transition-colors"
              title={soundEnabled ? 'Mute emergency audio' : 'Unmute emergency audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* User Profile Pill */}
            <button
              onClick={() => setIsSelfProfileOpen(true)}
              className="hidden sm:flex items-center gap-2 p-1.5 pr-3 rounded-lg bg-[#141824] border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200"
              title="View Health Passport"
            >
              <div className="w-6 h-6 rounded bg-red-600 text-white flex items-center justify-center font-bold text-[11px]">
                JV
              </div>
              <span className="truncate max-w-[100px]">{userProfile.fullName}</span>
            </button>

            {/* SEPARATE MENU OPTION FOR ALL OTHER OPTIONS */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1A2030] border border-slate-700 text-xs font-bold text-white transition-all shadow-sm group"
              aria-label="Open Menu for all other options"
            >
              <Menu className="w-4 h-4 text-[#FF2B44] group-hover:scale-110 transition-transform" />
              <span>Menu</span>
            </button>

            {/* Quick SOS Trigger */}
            <button
              onClick={handleMainEmergencyClick}
              className="px-4 py-2 rounded-lg bg-[#FF2B44] hover:bg-red-600 text-white text-xs font-black tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(255,43,68,0.4)] flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>SOS DISPATCH</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* MULTI-PERSON EMERGENCIES SWITCHER:
            Always shows when there are active cases!
        */}
        {activeCases.length > 0 && (
          <ActiveCasesSwitcher
            cases={activeCases}
            activeCaseId={selectedCaseId}
            onSelectCase={(id) => {
              setSelectedCaseId(id);
              setCurrentView('ACTIVE_TRACKER');
            }}
            onNewEmergencyClick={handleMainEmergencyClick}
          />
        )}

        {/* VIEW 1: FIRST PAGE — EMERGENCY SOS OPTION ONLY */}
        {currentView === 'DASHBOARD' && (
          <div className="py-4 sm:py-8 flex flex-col items-center justify-center text-center animate-in fade-in duration-200 space-y-7">
            {/* Registration Success Alert Banner (if newly registered) */}
            {registrationBanner && (
              <div className="w-full max-w-xl p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 flex items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs font-semibold text-left">{registrationBanner}</span>
                </div>
                <button
                  onClick={() => setRegistrationBanner(null)}
                  className="text-emerald-400 hover:text-white text-xs font-bold px-2 py-1 shrink-0"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Exact ResqLogo */}
            <ResqLogo variant="hero" />

            {/* Core Principle Statement */}
            <div className="max-w-2xl space-y-1.5 px-4">
              <p className="text-xs sm:text-sm font-semibold text-slate-400">
                The emergency button is not simply &quot;Book an ambulance&quot;.
              </p>
              <p className="text-base sm:text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-red-200 to-[#FF2B44]">
                &quot;Get emergency help for any person I am responsible for right now.&quot;
              </p>
            </div>

            {/* GIANT CENTRAL EMERGENCY TRIGGER BUTTON */}
            <div className="relative group my-2">
              {/* Pulsing Aura Rings */}
              <div className="absolute -inset-6 rounded-full bg-red-600/25 blur-2xl group-hover:bg-red-600/40 transition-all duration-500 animate-pulse" />
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#FF2B44] to-red-600 opacity-80 group-hover:opacity-100 blur transition-all duration-300" />

              <button
                onClick={handleMainEmergencyClick}
                className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-br from-[#FF2B44] via-red-600 to-[#8A0716] text-white p-6 flex flex-col items-center justify-center text-center shadow-[0_0_60px_rgba(255,43,68,0.65)] border-4 border-white/20 active:scale-95 hover:scale-105 transition-all duration-300 cursor-pointer focus:outline-none"
                aria-label="Trigger Emergency Help SOS"
              >
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-2 shadow-inner">
                  <HeartPulse className="w-8 h-8 text-white animate-pulse" />
                </div>
                <span className="text-3xl sm:text-4xl font-black tracking-tight leading-none drop-shadow">
                  EMERGENCY
                </span>
                <span className="text-3xl sm:text-4xl font-black tracking-tight leading-none drop-shadow text-white/95">
                  HELP
                </span>
                <span className="mt-3 text-[11px] sm:text-xs font-bold tracking-widest text-red-200 uppercase bg-black/35 px-4 py-1 rounded-full border border-white/15">
                  ONE CLICK · ALL CARE
                </span>
              </button>
            </div>

            {/* Instant Mode Shortcuts directly beneath the Emergency SOS Button */}
            <div className="w-full max-w-xl px-4 space-y-3">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                WHO NEEDS HELP? SELECT TO START SOS
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => handleSelectMode('ME')}
                  className="px-4 py-3 rounded-2xl bg-[#121622] hover:bg-[#1A2030] border border-slate-800 hover:border-[#FF2B44] text-left transition-all group flex items-center gap-3 shadow-md"
                >
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 text-[#FF2B44] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                    1
                  </div>
                  <div>
                    <strong className="text-xs text-white block group-hover:text-red-300 transition-colors">
                      [ ME ]
                    </strong>
                    <span className="text-[10px] text-slate-400">Myself ({userProfile.fullName})</span>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectMode('FAMILY')}
                  className="px-4 py-3 rounded-2xl bg-[#121622] hover:bg-[#1A2030] border border-slate-800 hover:border-blue-500 text-left transition-all group flex items-center gap-3 shadow-md"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    2
                  </div>
                  <div>
                    <strong className="text-xs text-white block group-hover:text-blue-300 transition-colors">
                      [ FAMILY ]
                    </strong>
                    <span className="text-[10px] text-slate-400">{familyProfiles.length} Relatives</span>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectMode('FRIEND_OTHER')}
                  className="px-4 py-3 rounded-2xl bg-[#121622] hover:bg-[#1A2030] border border-slate-800 hover:border-amber-500 text-left transition-all group flex items-center gap-3 shadow-md"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    3
                  </div>
                  <div>
                    <strong className="text-xs text-white block group-hover:text-amber-300 transition-colors">
                      [ FRIEND / OTHER ]
                    </strong>
                    <span className="text-[10px] text-slate-400">Bystander / Other</span>
                  </div>
                </button>
              </div>

              <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 pt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Level 1 CAD Dispatch · Paramedic Unit Navigation · Hospital Pre-Notification</span>
              </p>
            </div>

            {/* Separate Menu Option Callout */}
            <div className="pt-3 border-t border-slate-800/80 w-full max-w-lg px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <span>Looking for Health Passport, Medical Records, Insurance, or Hospital Routing?</span>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all shrink-0 shadow-sm"
              >
                <Menu className="w-3.5 h-3.5 text-red-400" />
                <span>Open Menu ☰</span>
              </button>
            </div>
          </div>
        )}

        {/* VIEW 2: MODE 1 — ME FLOW */}
        {currentView === 'MODE_ME' && (
          <MeEmergencyFlow
            userProfile={userProfile}
            pastMedicalRecords={medicalRecords.filter((r) => r.patientId === userProfile.id)}
            onOpenMedicalRecords={() => setCurrentView('MEDICAL_RECORDS')}
            onBack={() => setCurrentView('DASHBOARD')}
            onContinueToSummary={handleMeContinueToSummary}
          />
        )}

        {/* VIEW 3: MODE 2 — FAMILY FLOW */}
        {currentView === 'MODE_FAMILY' && (
          <FamilyEmergencyFlow
            familyProfiles={familyProfiles}
            pastMedicalRecords={medicalRecords}
            onOpenMedicalRecords={() => setCurrentView('MEDICAL_RECORDS')}
            onBack={() => setCurrentView('DASHBOARD')}
            onContinueToSummary={handleFamilyContinueToSummary}
          />
        )}

        {/* VIEW 4: MODE 3 — FRIEND / OTHER FLOW */}
        {currentView === 'MODE_FRIEND' && (
          <FriendEmergencyFlow
            onBack={() => setCurrentView('DASHBOARD')}
            onContinueToSummary={handleFriendContinueToSummary}
          />
        )}

        {/* VIEW 5: ACTIVE EMERGENCY TRACKER */}
        {currentView === 'ACTIVE_TRACKER' && currentSelectedCase && (
          <ActiveEmergencyTracker
            emergencyCase={currentSelectedCase}
            onUpdateStage={handleUpdateStage}
            onCompleteCase={handleCompleteCase}
            onInitiateNewEmergency={handleMainEmergencyClick}
          />
        )}

        {/* VIEW 6: PAST MEDICAL RECORDS ARCHIVE */}
        {currentView === 'MEDICAL_RECORDS' && (
          <MedicalRecordsManager
            records={medicalRecords}
            currentUser={userProfile}
            familyProfiles={familyProfiles}
            onSaveRecord={handleSaveRecord}
            onDeleteRecord={handleDeleteRecord}
            onClose={() => setCurrentView('DASHBOARD')}
          />
        )}

        {/* VIEW 7: INSURANCE DOCUMENTS & DIGITAL CARDS */}
        {currentView === 'INSURANCE' && (
          <InsuranceManager
            policies={insurancePolicies}
            currentUser={userProfile}
            familyProfiles={familyProfiles}
            onSavePolicy={handleSavePolicy}
            onClose={() => setCurrentView('DASHBOARD')}
          />
        )}

        {/* VIEW 8: HOSPITAL PREFERENCES & TRAUMA ROUTING */}
        {currentView === 'HOSPITAL_PREFERENCES' && (
          <HospitalPreferencesManager
            preferences={hospitalPreferences}
            currentUser={userProfile}
            familyProfiles={familyProfiles}
            onSavePreference={handleSaveHospitalPreference}
            onSetPrimary={handleSetPrimaryHospital}
            onDeletePreference={handleDeleteHospitalPreference}
            onClose={() => setCurrentView('DASHBOARD')}
          />
        )}

        {/* VIEW 9: SIGN UP & REGISTRATION PAGE */}
        {currentView === 'SIGN_UP' && (
          <SignUpRegistrationPage
            onCompleteRegistration={handleCompleteRegistration}
            onCancel={() => setCurrentView('DASHBOARD')}
          />
        )}

        {/* VIEW 10: EMERGENCY DOCTOR PORTAL */}
        {currentView === 'DOCTOR_PORTAL' && (
          <RoleAccessGate
            requiredRole={['DOCTOR', 'SUPER_ADMIN']}
            currentSession={currentSession}
            portalTitle="Emergency Doctor Telemetry"
            onOpenLogin={(notice) => {
              setLoginModalNotice(notice || 'Doctor credentials required.');
              setIsLoginModalOpen(true);
            }}
            onReturnToHome={() => setCurrentView('DASHBOARD')}
          >
            <DoctorPortal
              currentSession={currentSession}
              onBackToApp={() => setCurrentView('DASHBOARD')}
            />
          </RoleAccessGate>
        )}

        {/* VIEW 11: AMBULANCE & CAD OPERATIONS PORTAL */}
        {currentView === 'OPERATIONS_PORTAL' && (
          <RoleAccessGate
            requiredRole={['AMBULANCE_OPERATOR', 'SUPER_ADMIN']}
            currentSession={currentSession}
            portalTitle="CAD Fleet Operations & Dispatch"
            onOpenLogin={(notice) => {
              setLoginModalNotice(notice || 'Ambulance Operator credentials required.');
              setIsLoginModalOpen(true);
            }}
            onReturnToHome={() => setCurrentView('DASHBOARD')}
          >
            <OperationsPortal
              currentSession={currentSession}
              onBackToApp={() => setCurrentView('DASHBOARD')}
            />
          </RoleAccessGate>
        )}

        {/* VIEW 12: HOSPITAL TRAUMA BAY PORTAL */}
        {currentView === 'HOSPITAL_PORTAL' && (
          <RoleAccessGate
            requiredRole={['HOSPITAL', 'SUPER_ADMIN']}
            currentSession={currentSession}
            portalTitle="Hospital Trauma Bay Pre-Intake"
            onOpenLogin={(notice) => {
              setLoginModalNotice(notice || 'Hospital ED Staff credentials required.');
              setIsLoginModalOpen(true);
            }}
            onReturnToHome={() => setCurrentView('DASHBOARD')}
          >
            <HospitalPortal
              currentSession={currentSession}
              onBackToApp={() => setCurrentView('DASHBOARD')}
            />
          </RoleAccessGate>
        )}

        {/* VIEW 13: SUPER ADMIN COMMAND CENTER */}
        {currentView === 'ADMIN_PORTAL' && (
          <RoleAccessGate
            requiredRole={['SUPER_ADMIN', 'RESQ_ADMIN']}
            currentSession={currentSession}
            portalTitle="Super Admin Central Command"
            onOpenLogin={(notice) => {
              setLoginModalNotice(notice || 'Super Admin authorization required.');
              setIsLoginModalOpen(true);
            }}
            onReturnToHome={() => setCurrentView('DASHBOARD')}
          >
            <AdminPortal
              currentSession={currentSession}
              onBackToApp={() => setCurrentView('DASHBOARD')}
            />
          </RoleAccessGate>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#06080C] border-t border-slate-900 px-6 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">RESQ ONE</span>
            <span>·</span>
            <span>ONE CLICK. ALL CARE.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Level 1 CAD Dispatch Network</span>
            <span>·</span>
            <span>HIPAA Compliant Record Isolation</span>
            <span>·</span>
            <span>24/7 Physician Telemetry Relay</span>
          </div>
        </div>
      </footer>

      {/* Dedicated Selection Screen: WHO NEEDS HELP? */}
      <WhoNeedsHelpModal
        isOpen={isWhoNeedsHelpOpen}
        onClose={() => setIsWhoNeedsHelpOpen(false)}
        onSelectMode={handleSelectMode}
      />

      {/* Emergency Request Summary Modal */}
      <EmergencySummaryModal
        isOpen={isSummaryModalOpen}
        data={summaryData}
        onClose={() => setIsSummaryModalOpen(false)}
        onBackToEdit={() => setIsSummaryModalOpen(false)}
        onConfirmDispatch={handleConfirmFinalDispatch}
      />

      {/* Family Profiles Manager Modal */}
      <FamilyManagementModal
        isOpen={isFamilyMgmtOpen}
        familyProfiles={familyProfiles}
        onClose={() => setIsFamilyMgmtOpen(false)}
        onAddFamilyMember={(newMem) => setFamilyProfiles((prev) => [...prev, newMem])}
        onDeleteMember={(id) => setFamilyProfiles((prev) => prev.filter((f) => f.id !== id))}
      />

      {/* Self Health Profile Modal */}
      <SelfProfileModal
        isOpen={isSelfProfileOpen}
        profile={userProfile}
        onClose={() => setIsSelfProfileOpen(false)}
        onUpdateProfile={(updated) => setUserProfile(updated)}
        onOpenMedicalRecords={() => {
          setIsSelfProfileOpen(false);
          setCurrentView('MEDICAL_RECORDS');
        }}
      />

      {/* SEPARATE MENU MODAL FOR ALL OTHER OPTIONS */}
      <NavigationMenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentUser={userProfile}
        familyCount={familyProfiles.length}
        recordsCount={medicalRecords.length}
        insuranceCount={insurancePolicies.length}
        hospitalsCount={hospitalPreferences.length}
        activeCasesCount={activeCases.length}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onNavigate={(view) => {
          setIsMenuOpen(false);
          setCurrentView(view);
        }}
        onOpenSelfProfile={() => {
          setIsMenuOpen(false);
          setIsSelfProfileOpen(true);
        }}
        onOpenFamilyManagement={() => {
          setIsMenuOpen(false);
          setIsFamilyMgmtOpen(true);
        }}
        onTriggerSOS={() => {
          setIsMenuOpen(false);
          handleMainEmergencyClick();
        }}
        onOpenPortal={(portal) => {
          setIsMenuOpen(false);
          handleOpenPortal(portal);
        }}
      />

      {/* UNIFIED MULTI-ROLE AUTHENTICATION & CREDENTIALS MODAL */}
      <UnifiedLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setLoginModalNotice(null);
        }}
        currentSession={currentSession}
        requiredPortalNotice={loginModalNotice}
        onLoginSuccess={(newSession, targetPortal) => {
          setCurrentSession(newSession);
          if (targetPortal === 'DOCTOR') setCurrentView('DOCTOR_PORTAL');
          else if (targetPortal === 'OPERATIONS') setCurrentView('OPERATIONS_PORTAL');
          else if (targetPortal === 'HOSPITAL') setCurrentView('HOSPITAL_PORTAL');
          else if (targetPortal === 'ADMIN') setCurrentView('ADMIN_PORTAL');
          else setCurrentView('DASHBOARD');
        }}
      />
    </div>
  );
}
