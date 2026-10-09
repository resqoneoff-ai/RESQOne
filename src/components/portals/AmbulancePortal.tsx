import React, { useState, useEffect } from 'react';
import {
  Ambulance,
  Radio,
  MapPin,
  Clock,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Building2,
  Stethoscope,
  ChevronRight,
  AlertTriangle,
  Compass,
  Navigation,
  Activity,
  Heart,
  Droplet,
  LogOut,
  User,
  CheckCircle2,
  XCircle,
  FileText,
  Send,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Sliders,
  Check,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react';
import { ResqLogo } from '../ResqLogo';
import { AppUserSession, AmbulanceStatus, EmergencyStatus } from '../../types/roles';
import { EmergencyCase } from '../../types/emergency';
import {
  ambulanceService,
  INITIAL_APPLICATIONS,
  REGISTERED_ORGANIZATIONS
} from '../../services/ambulanceService';
import { emergencyService } from '../../services/emergencyService';
import {
  AmbulanceOperationalStatus,
  ActiveEmergencyStage,
  AmbulanceAssignmentRecord,
  PreHospitalVitals
} from '../../types/ambulance';
import { CaseChatDrawer } from './CaseChatDrawer';
import { LiveEmergencyMap } from '../LiveEmergencyMap';

interface AmbulancePortalProps {
  currentSession: AppUserSession;
  onBackToApp: () => void;
  onLogout: () => void;
}

export const AmbulancePortal: React.FC<AmbulancePortalProps> = ({
  currentSession,
  onBackToApp,
  onLogout
}) => {
  // Operational Status: 'AVAILABLE' | 'BUSY' | 'OFFLINE'
  const [operationalStatus, setOperationalStatusState] = useState<AmbulanceOperationalStatus>(
    ambulanceService.getOperationalStatus()
  );
  const [activeCases, setActiveCases] = useState<EmergencyCase[]>([]);
  const [currentAssignment, setCurrentAssignment] = useState<AmbulanceAssignmentRecord | null>(
    ambulanceService.getCurrentAssignment()
  );
  const [activeCaseId, setActiveCaseId] = useState<string | null>(
    ambulanceService.getActiveCaseId()
  );

  // Decline Dialog Modal State
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineTargetCaseId, setDeclineTargetCaseId] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<
    'Too far' | 'Ambulance unavailable' | 'Medical capability mismatch' | 'Vehicle issue' | 'Already handling another case' | 'Other'
  >('Too far');
  const [declineNotes, setDeclineNotes] = useState('');

  // Audio chimes & alerts
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Vitals Entry Modal State
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [vitalsHr, setVitalsHr] = useState(88);
  const [vitalsBp, setVitalsBp] = useState('128/82');
  const [vitalsSpo2, setVitalsSpo2] = useState(98);
  const [vitalsResp, setVitalsResp] = useState(16);
  const [vitalsGlucose, setVitalsGlucose] = useState(105);
  const [vitalsGcs, setVitalsGcs] = useState(15);
  const [vitalsEcg, setVitalsEcg] = useState('Normal Sinus Rhythm');
  const [vitalsNotes, setVitalsNotes] = useState('Patient stabilized with oxygen and IV access.');

  // Comms Drawer
  const [isCommsOpen, setIsCommsOpen] = useState(false);

  // Geolocation & Simulation
  const [coords, setCoords] = useState(ambulanceService.getCurrentCoordinates());
  const [isGpsActive, setIsGpsActive] = useState(true);

  // Operator metadata
  const operatorApp =
    ambulanceService.getApplicationByUserId(currentSession.id) ||
    ambulanceService.getApplicationByEmail(currentSession.email) ||
    INITIAL_APPLICATIONS[0];

  const operatorCallsign = operatorApp?.ambulanceCallsign || 'MEDIC-42 (ALS)';
  const organizationName = operatorApp?.organizationName || 'Metro First Response CAD Fleet';

  // Load and subscribe to real-time events
  const refreshData = () => {
    setOperationalStatusState(ambulanceService.getOperationalStatus());
    setCurrentAssignment(ambulanceService.getCurrentAssignment());
    setActiveCaseId(ambulanceService.getActiveCaseId());
    setActiveCases(emergencyService.getAllCases());
    setCoords(ambulanceService.getCurrentCoordinates());
  };

  useEffect(() => {
    refreshData();
    const unsubAmb = ambulanceService.subscribe(() => {
      refreshData();
    });
    const unsubEmerg = emergencyService.subscribe(() => {
      refreshData();
    });

    if (isGpsActive) {
      ambulanceService.startLocationTracking((newCoords) => {
        setCoords((prev) => ({ ...prev, ...newCoords }));
      });
    }

    return () => {
      unsubAmb();
      unsubEmerg();
      ambulanceService.stopLocationTracking();
    };
  }, [isGpsActive]);

  // Handle Logout (Section 11: Auto switch to OFFLINE on logout)
  const handleOperatorLogout = async () => {
    try {
      await ambulanceService.setOperationalStatus('OFFLINE', currentSession.id);
    } catch (e) {}
    onLogout();
  };

  // Change Operational Status
  const handleChangeStatus = async (status: AmbulanceOperationalStatus) => {
    setActionError(null);
    try {
      await ambulanceService.setOperationalStatus(status, currentSession.id);
      setOperationalStatusState(status);
      setNotificationBanner(`Operational status updated to ${status}`);
      setTimeout(() => setNotificationBanner(null), 3000);
    } catch (e: any) {
      setActionError(e.message || 'Could not change operational status.');
    }
  };

  // Find active pending emergency request for this available unit
  const pendingIncomingCase = activeCases.find(
    (c) =>
      ['CREATED', 'TRIAGE', 'AMBULANCE_REQUESTED'].includes(c.status || '') &&
      !c.assignedAmbulanceId &&
      operationalStatus === 'AVAILABLE' &&
      !activeCaseId
  );

  // Active assigned case
  const activeCase = activeCaseId
    ? emergencyService.getCaseById(activeCaseId) || null
    : null;

  // Accept Emergency Handler (Section 14 & 16: Atomic Transaction & Prevent Double Acceptance)
  const handleAcceptEmergency = async (caseId: string) => {
    setIsProcessingAction(true);
    setActionError(null);

    const result = await ambulanceService.acceptEmergency(caseId, {
      id: currentSession.id || operatorApp.userId,
      name: currentSession.fullName || operatorApp.fullName,
      organizationName,
      callsign: operatorCallsign,
      ambulanceId: 'amb-unit-001'
    });

    setIsProcessingAction(false);

    if (result.success && result.assignment) {
      setCurrentAssignment(result.assignment);
      setActiveCaseId(caseId);
      setOperationalStatusState('BUSY');
      setNotificationBanner(`🚨 Emergency ${caseId} ACCEPTED. Commencing CAD dispatch.`);
      setTimeout(() => setNotificationBanner(null), 4000);
    } else {
      setActionError(result.error || 'Failed to accept emergency.');
    }
  };

  // Open Decline Dialog
  const handleOpenDeclineModal = (caseId: string) => {
    setDeclineTargetCaseId(caseId);
    setDeclineReason('Too far');
    setDeclineNotes('');
    setIsDeclineModalOpen(true);
  };

  // Confirm Decline Handler (Section 15: Decline Emergency Flow)
  const handleConfirmDecline = async () => {
    if (!declineTargetCaseId) return;
    setIsProcessingAction(true);
    setActionError(null);

    const result = await ambulanceService.declineEmergency(
      declineTargetCaseId,
      {
        id: currentSession.id || operatorApp.userId,
        name: currentSession.fullName || operatorApp.fullName,
        ambulanceId: 'amb-unit-001'
      },
      declineReason,
      declineNotes
    );

    setIsProcessingAction(false);
    setIsDeclineModalOpen(false);

    if (result.success) {
      setNotificationBanner('Emergency declined. Case forwarded to next available CAD unit.');
      setTimeout(() => setNotificationBanner(null), 3500);
    } else {
      setActionError(result.error || 'Decline failed.');
    }
  };

  // Advance Stage in State Machine (Section 18 & 19: State Machine & Progression)
  const handleAdvanceStage = async (nextStage: ActiveEmergencyStage) => {
    setIsProcessingAction(true);
    setActionError(null);

    const result = await ambulanceService.advanceEmergencyStage(
      nextStage,
      {
        id: currentSession.id || operatorApp.userId,
        name: currentSession.fullName || operatorApp.fullName
      }
    );

    setIsProcessingAction(false);

    if (result.success) {
      setNotificationBanner(`Ambulance status advanced to ${nextStage}`);
      setTimeout(() => setNotificationBanner(null), 3000);
    } else {
      setActionError(result.error || 'Invalid transition.');
    }
  };

  // Save Clinical Vitals (Section 21: Vitals & Handover)
  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    const vitals: PreHospitalVitals = {
      heartRate: Number(vitalsHr),
      bloodPressure: vitalsBp,
      spo2: Number(vitalsSpo2),
      respiratoryRate: Number(vitalsResp),
      bloodGlucose: Number(vitalsGlucose),
      gcs: Number(vitalsGcs),
      ecgRhythm: vitalsEcg,
      notes: vitalsNotes,
      recordedAt: new Date().toISOString()
    };

    await ambulanceService.recordPreHospitalVitals(vitals);
    setIsVitalsModalOpen(false);
    setNotificationBanner('Clinical vitals recorded and transmitted to Receiving Trauma Bay.');
    setTimeout(() => setNotificationBanner(null), 3500);
  };

  // Timeline Step Definitions
  const TIMELINE_STEPS: { stage: ActiveEmergencyStage; label: string; desc: string }[] = [
    { stage: 'ASSIGNED', label: 'Assigned', desc: 'Ambulance assigned by CAD' },
    { stage: 'EN_ROUTE', label: 'En Route', desc: 'Responding with lights & sirens' },
    { stage: 'ARRIVING', label: 'Arriving', desc: '< 300 meters from patient' },
    { stage: 'ON_SCENE', label: 'At Patient Location', desc: 'On scene performing assessment' },
    { stage: 'PATIENT_PICKED_UP', label: 'Patient Picked Up', desc: 'Loaded into unit; acute care underway' },
    { stage: 'AT_HOSPITAL', label: 'Arrived at Hospital', desc: 'Parked in receiving trauma bay' },
    { stage: 'HANDOVER', label: 'Patient Handover', desc: 'Clinical briefing with ER trauma team' },
    { stage: 'COMPLETED', label: 'Completed', desc: 'Case resolved; returning to service' }
  ];

  const currentStageIndex = currentAssignment
    ? TIMELINE_STEPS.findIndex((s) => s.stage === currentAssignment.status)
    : -1;

  const nextStep =
    currentStageIndex >= 0 && currentStageIndex < TIMELINE_STEPS.length - 1
      ? TIMELINE_STEPS[currentStageIndex + 1]
      : null;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* SECTION 9: AMBULANCE OPERATIONS HEADER */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#0D1017] border border-[#DCE3EC] dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-[#DCE3EC] dark:border-slate-800">
          {/* Logo & Operational Badge */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1E8] text-[#F36C21] border border-[#F36C21]/30 flex items-center justify-center shrink-0 shadow-xs">
              <Ambulance className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <ResqLogo variant="compact" />
                <span className="text-[#082B5C] dark:text-white text-base font-extrabold tracking-tight">
                  AMBULANCE OPERATIONS
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF8F1] text-[#18A66A] border border-[#18A66A]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#18A66A] animate-ping" />
                  <span>VERIFIED OPERATOR</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#596579] dark:text-slate-400 mt-0.5">
                <span className="text-[#082B5C] dark:text-slate-200 font-bold">{currentSession.fullName}</span>
                <span>·</span>
                <span className="text-[#F36C21] font-bold">{operatorCallsign}</span>
                <span>·</span>
                <span className="truncate max-w-xs">{organizationName}</span>
              </div>
            </div>
          </div>

          {/* Action Menu & Logout */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
            <button
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 border border-[#DCE3EC] dark:border-slate-800 text-[#596579] dark:text-slate-400 transition-colors"
              title={isSoundMuted ? 'Unmute Emergency Siren Audio' : 'Mute Emergency Audio'}
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#F36C21]" />}
            </button>

            <button
              onClick={() => setIsCommsOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 border border-[#DCE3EC] dark:border-slate-800 text-[#082B5C] dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Radio className="w-3.5 h-3.5 text-[#2F80C9]" />
              <span>CAD Comms</span>
            </button>

            <button
              onClick={onBackToApp}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 border border-[#DCE3EC] dark:border-slate-800 text-[#596579] dark:text-slate-400 font-semibold text-xs transition-colors"
            >
              Switch Portal
            </button>

            <button
              onClick={handleOperatorLogout}
              className="px-3.5 py-2 rounded-xl bg-[#FFF0EF] hover:bg-red-100 border border-[#D92D20]/30 text-[#D92D20] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout (Go Offline)</span>
            </button>
          </div>
        </div>

        {/* SECTION 10 & 11: AVAILABILITY STATUS CONTROLS (AVAILABLE / BUSY / OFFLINE) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          <div>
            <span className="text-[10px] text-[#596579] dark:text-slate-400 uppercase tracking-widest block font-bold">
              CURRENT CAD AVAILABILITY STATUS:
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                  operationalStatus === 'AVAILABLE'
                    ? 'bg-[#EAF8F1] text-[#18A66A] border-[#18A66A]/30 shadow-xs'
                    : operationalStatus === 'BUSY'
                    ? 'bg-[#FFF1E8] text-[#F36C21] border-[#F36C21]/30 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-[#596579] border-[#DCE3EC] dark:border-slate-700'
                }`}
              >
                <span>
                  {operationalStatus === 'AVAILABLE' && '🟢 AVAILABLE'}
                  {operationalStatus === 'BUSY' && '🟠 BUSY (ACTIVE CASE)'}
                  {operationalStatus === 'OFFLINE' && '⚫ OFFLINE'}
                </span>
              </span>

              {operationalStatus === 'AVAILABLE' && (
                <span className="text-xs text-[#18A66A] flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#18A66A] animate-ping" />
                  <span>Ready to receive emergency calls</span>
                </span>
              )}
              {operationalStatus === 'BUSY' && (
                <span className="text-xs text-[#F36C21] flex items-center gap-1 font-semibold">
                  <span>Assigned to active emergency case</span>
                </span>
              )}
            </div>
          </div>

          {/* Prominent Status Toggles */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-black/60 border border-[#DCE3EC] dark:border-slate-800 w-full sm:w-auto">
            <button
              onClick={() => handleChangeStatus('AVAILABLE')}
              disabled={Boolean(activeCaseId)}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                operationalStatus === 'AVAILABLE'
                  ? 'bg-[#18A66A] text-white shadow-xs'
                  : 'text-[#596579] hover:text-[#082B5C] hover:bg-slate-200 dark:hover:bg-slate-900'
              } ${activeCaseId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={activeCaseId ? 'Cannot go AVAILABLE during active case' : 'Set status to AVAILABLE'}
            >
              <span>🟢 Available</span>
            </button>

            <button
              onClick={() => handleChangeStatus('BUSY')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                operationalStatus === 'BUSY'
                  ? 'bg-[#F36C21] text-white shadow-xs'
                  : 'text-[#596579] hover:text-[#082B5C] hover:bg-slate-200 dark:hover:bg-slate-900'
              } cursor-pointer`}
            >
              <span>🟠 Busy</span>
            </button>

            <button
              onClick={() => handleChangeStatus('OFFLINE')}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                operationalStatus === 'OFFLINE'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-[#596579] hover:text-[#082B5C] hover:bg-slate-200 dark:hover:bg-slate-900'
              } cursor-pointer`}
            >
              <span>⚫ Offline</span>
            </button>
          </div>
        </div>

        {/* Live GPS Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#DCE3EC] dark:border-slate-800/80 text-[11px] font-mono text-[#596579] dark:text-slate-400">
          <div className="p-2 rounded-xl bg-black/40 border border-slate-800 flex items-center justify-between">
            <span>LIVE GPS COORDS:</span>
            <span className="text-white font-bold">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-slate-800 flex items-center justify-between">
            <span>UNIT SPEED:</span>
            <span className="text-amber-400 font-bold">{coords.speedMph} MPH</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-slate-800 flex items-center justify-between">
            <span>ALS TELEMETRY:</span>
            <span className="text-emerald-400 font-bold">100% LINKED</span>
          </div>
          <div className="p-2 rounded-xl bg-black/40 border border-slate-800 flex items-center justify-between">
            <span>HOSPITAL BAY LINK:</span>
            <span className="text-blue-400 font-bold">STANDBY</span>
          </div>
        </div>
      </div>

      {/* Action / Error Notification Alert */}
      {actionError && (
        <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-800 text-xs text-red-200 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-red-400 hover:text-white text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {notificationBanner && (
        <div className="p-3.5 rounded-2xl bg-amber-950/90 border border-amber-600 text-xs text-amber-200 flex items-center gap-2 shadow-xl animate-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{notificationBanner}</span>
        </div>
      )}

      {/* SECTION 12 & 13: HIGH-PRIORITY INCOMING EMERGENCY REQUEST CARD */}
      {pendingIncomingCase && !activeCaseId && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-red-950/90 via-[#180A0E] to-[#0E121B] border-2 border-red-500 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-red-900/60">
            <div className="flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping shrink-0" />
              <h2 className="text-lg font-black text-white tracking-wide uppercase flex items-center gap-2">
                <span>🚨 NEW EMERGENCY REQUEST</span>
              </h2>
            </div>
            <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-red-900/80 text-red-200 border border-red-700">
              PRIORITY 1 DISPATCH OFFER · CASE #{pendingIncomingCase.id}
            </span>
          </div>

          {/* Patient Details & Strict Emergency-Isolated Passport Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">PATIENT IDENTIFIER</span>
                <div className="text-xl font-black text-white">{pendingIncomingCase.patientName}</div>
                <div className="text-xs text-slate-300">
                  Age: {pendingIncomingCase.patientAge || 68} · Requester: {pendingIncomingCase.requesterName || 'Self'}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">CHIEF EMERGENCY COMPLAINT</span>
                <div className="text-base font-bold text-red-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  <span>{pendingIncomingCase.emergencyType || pendingIncomingCase.emergency?.type || 'Acute Medical Emergency'}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">INCIDENT LOCATION</span>
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{pendingIncomingCase.address || pendingIncomingCase.location?.address || 'Current Coordinates'}</span>
                  <span className="text-amber-400 font-mono font-bold">(~2.4 km away · 4 mins)</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">COORDINATED DESTINATION</span>
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{pendingIncomingCase.destinationHospital || pendingIncomingCase.hospitalPreference?.name || 'Metro Health Comprehensive Trauma Center'}</span>
                </div>
              </div>
            </div>

            {/* Critical Emergency Alerts (Only Authorized Emergency Data) */}
            <div className="p-4 rounded-2xl bg-black/60 border border-red-900/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-red-300 pb-2 border-b border-red-950">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>Authorized Pre-Hospital Medical Alerts:</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-red-400" />
                    <span>Blood Group:</span>
                  </span>
                  <span className="font-mono font-black text-white text-sm">
                    {pendingIncomingCase.bloodGroup || pendingIncomingCase.medicalInfo?.bloodGroup || 'B+'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    <span>Critical Allergies:</span>
                  </span>
                  <span className="font-bold text-amber-300">
                    {pendingIncomingCase.allergies?.join(', ') || pendingIncomingCase.medicalInfo?.allergies?.join(', ') || 'Penicillin (Severe)'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-red-400" />
                    <span>Cardiac History:</span>
                  </span>
                  <span className="font-bold text-slate-200">
                    {pendingIncomingCase.criticalConditions?.join(', ') || pendingIncomingCase.medicalInfo?.medicalConditions?.join(', ') || 'Cardiac history, Hypertension'}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 italic">
                🔒 Protected Health Information (PHI) isolated strictly to certified responding crew.
              </p>
            </div>
          </div>

          {/* SECTION 13: MAJOR ACTION BUTTONS (ACCEPT / DECLINE) */}
          <div className="pt-3 border-t border-red-900/60 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => handleAcceptEmergency(pendingIncomingCase.id)}
              disabled={isProcessingAction}
              className="w-full sm:flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/60 transition-all cursor-pointer"
            >
              {isProcessingAction ? (
                <span>Locking Dispatch...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>ACCEPT EMERGENCY (COMMENCE DISPATCH)</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleOpenDeclineModal(pendingIncomingCase.id)}
              disabled={isProcessingAction}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-red-500 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-red-400" />
              <span>DECLINE EMERGENCY</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 17: ACTIVE EMERGENCY SCREEN (WHEN AMBULANCE HAS ACCEPTED CASE) */}
      {currentAssignment && activeCase && (
        <div className="space-y-5 animate-in slide-in-from-bottom-2 duration-200">
          <div className="p-5 sm:p-6 rounded-3xl bg-[#0D1017] border border-amber-500/50 shadow-2xl space-y-5">
            {/* Header info bar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                      ACTIVE CASE #{currentAssignment.caseId}
                    </span>
                    <h2 className="text-lg font-black text-white">
                      {currentAssignment.patientName}
                    </h2>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Emergency: <strong className="text-amber-400">{currentAssignment.emergencyType}</strong> · Destination: <strong className="text-white">{currentAssignment.destinationHospital}</strong>
                  </div>
                </div>
              </div>

              {/* Status Badge & Rapid Action */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                <button
                  onClick={() => setIsVitalsModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-700 text-blue-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-blue-400" />
                  <span>Enter Acute Vitals</span>
                </button>

                <button
                  onClick={() => setIsCommsOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700 text-amber-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Radio / Comms</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-black/40 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Patient Coordinates</span>
                <span className="text-xs font-bold text-white block mt-0.5 truncate">{currentAssignment.patientLocation}</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Calculated Distance</span>
                <span className="text-xs font-bold text-amber-400 block mt-0.5">1.8 km (ETA ~3m)</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Ambulance Stage</span>
                <span className="text-xs font-bold text-emerald-400 block mt-0.5 font-mono">{currentAssignment.status}</span>
              </div>

              <div className="p-3 rounded-2xl bg-black/40 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Pre-Hospital Vitals</span>
                <span className="text-xs font-bold text-blue-300 block mt-0.5">
                  {currentAssignment.vitals ? `HR ${currentAssignment.vitals.heartRate} · SpO2 ${currentAssignment.vitals.spo2}%` : 'Pending entry'}
                </span>
              </div>
            </div>

            {/* SECTION 21: OPERATIONAL MAP (PATIENT 📍, AMBULANCE 🚑, HOSPITAL 🏥) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                    OPERATIONAL CAD DISPATCH MAP (PATIENT 📍 · AMBULANCE 🚑 · HOSPITAL 🏥)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Patient</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Ambulance</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Hospital</span>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-800">
                <LiveEmergencyMap
                  patientAddress={currentAssignment.patientLocation}
                  ambulanceUnit={operatorCallsign}
                  ambulanceEtaMin={3}
                  hospitalName={currentAssignment.destinationHospital}
                  heightClass="h-64 sm:h-80"
                  interactive={true}
                />
              </div>
            </div>

            {/* SECTION 18 & 19: EMERGENCY TIMELINE & STEPPER */}
            <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                    CLINICAL RESPONSE TIMELINE & STATE PROGRESSION
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Step {currentStageIndex + 1} of {TIMELINE_STEPS.length}
                </span>
              </div>

              {/* Interactive Timeline Step Track */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isCurrent = step.stage === currentAssignment.status;
                  const isPast = idx < currentStageIndex;
                  return (
                    <div
                      key={step.stage}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isCurrent
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                          : isPast
                          ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-400'
                          : 'bg-slate-900/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                        <span>#{idx + 1}</span>
                        {isPast && <Check className="w-3 h-3 text-emerald-400" />}
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
                      </div>
                      <div className="text-[11px] font-bold text-white mt-1 truncate">
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Advance Action Button */}
              {nextStep ? (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
                  <div className="text-xs text-slate-400">
                    Next authorized transition: <strong className="text-white font-mono">{nextStep.label}</strong> ({nextStep.desc})
                  </div>

                  <button
                    onClick={() => handleAdvanceStage(nextStep.stage)}
                    disabled={isProcessingAction}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                  >
                    <span>ADVANCE TO: {nextStep.label}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="pt-2 text-center text-xs text-emerald-400 font-bold font-mono">
                  ✅ CASE COMPLETED. Handover finalized with receiving hospital emergency bay.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 15: DECLINE REASON MODAL DIALOG */}
      {isDeclineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#0D1017] border border-red-500/60 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">Decline Emergency Call</h3>
              </div>
              <button
                onClick={() => setIsDeclineModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Please state the operational reason for declining. Central CAD dispatch will immediately reroute this emergency to the next closest response unit.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1.5">
                  OPERATIONAL REASON *
                </label>
                <select
                  value={declineReason}
                  onChange={(e: any) => setDeclineReason(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-red-500"
                >
                  <option value="Too far">Too far / Out of primary sector ETA radius</option>
                  <option value="Ambulance unavailable">Ambulance unavailable</option>
                  <option value="Medical capability mismatch">Medical capability mismatch (Requires specialized ICU unit)</option>
                  <option value="Vehicle issue">Vehicle mechanical / technical issue</option>
                  <option value="Already handling another case">Already handling another acute case</option>
                  <option value="Other">Other operational reason</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1.5">
                  OPTIONAL CAD NOTES
                </label>
                <textarea
                  value={declineNotes}
                  onChange={(e) => setDeclineNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Heavy traffic bottleneck on bridge; unit 204 has shorter ETA."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeclineModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecline}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
              >
                Confirm Decline & Re-Route
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 21: PRE-HOSPITAL CLINICAL VITALS MODAL */}
      {isVitalsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#0D1017] border border-blue-500/50 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Pre-Hospital Vitals & Handover</h3>
                  <span className="text-[10px] font-mono text-blue-400">TELEMETRY LINK TO TRAUMA BAY</span>
                </div>
              </div>
              <button
                onClick={() => setIsVitalsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVitals} className="space-y-3.5">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-300 mb-1">
                    HEART RATE (BPM)
                  </label>
                  <input
                    type="number"
                    value={vitalsHr}
                    onChange={(e) => setVitalsHr(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-300 mb-1">
                    BLOOD PRESSURE
                  </label>
                  <input
                    type="text"
                    value={vitalsBp}
                    onChange={(e) => setVitalsBp(e.target.value)}
                    placeholder="120/80"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-300 mb-1">
                    SpO2 (%)
                  </label>
                  <input
                    type="number"
                    value={vitalsSpo2}
                    onChange={(e) => setVitalsSpo2(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-300 mb-1">
                    RESP RATE (/min)
                  </label>
                  <input
                    type="number"
                    value={vitalsResp}
                    onChange={(e) => setVitalsResp(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-300 mb-1">
                    GLUCOSE (mg/dL)
                  </label>
                  <input
                    type="number"
                    value={vitalsGlucose}
                    onChange={(e) => setVitalsGlucose(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-300 mb-1">
                    GCS (3-15)
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={vitalsGcs}
                    onChange={(e) => setVitalsGcs(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-300 mb-1">
                  12-LEAD ECG RHYTHM / CARDIAC MONITOR
                </label>
                <input
                  type="text"
                  value={vitalsEcg}
                  onChange={(e) => setVitalsEcg(e.target.value)}
                  placeholder="e.g. Normal Sinus Rhythm, Sinus Tachycardia"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-300 mb-1">
                  INTERVENTIONS & CLINICAL NOTES
                </label>
                <textarea
                  value={vitalsNotes}
                  onChange={(e) => setVitalsNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsVitalsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Save & Broadcast to Receiving Hospital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Chat Drawer */}
      {isCommsOpen && (
        <CaseChatDrawer
          isOpen={isCommsOpen}
          onClose={() => setIsCommsOpen(false)}
          caseId={activeCaseId || 'CAD-GEN-01'}
          patientName={activeCase?.patientName || 'Emergency Patient'}
          currentSession={currentSession}
        />
      )}
    </div>
  );
};
