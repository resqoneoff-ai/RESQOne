import React, { useState, useEffect, useRef } from 'react';
import {
  EmergencyCase,
  EmergencyStage
} from '../types/emergency';
import {
  PhoneCall,
  Video,
  MapPin,
  ChevronDown,
  ChevronUp,
  Share2,
  Users,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Stethoscope,
  Heart,
  AlertTriangle,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { LiveEmergencyMap } from './LiveEmergencyMap';
import { DoctorConsultModal } from './DoctorConsultModal';
import { HandoverReportModal } from './HandoverReportModal';
import { AuthorizedMedicalInfoModal } from './AuthorizedMedicalInfoModal';
import { HospitalInfoModal } from './HospitalInfoModal';
import { emergencyAudio } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';

interface ActiveEmergencyTrackerProps {
  emergencyCase: EmergencyCase;
  onUpdateStage: (caseId: string, nextStage: EmergencyStage) => void;
  onCompleteCase: (caseId: string) => void;
  onInitiateNewEmergency: () => void;
}

export const ActiveEmergencyTracker: React.FC<ActiveEmergencyTrackerProps> = ({
  emergencyCase,
  onUpdateStage,
  onCompleteCase,
  onInitiateNewEmergency
}) => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  const [eta, setEta] = useState(emergencyCase.ambulance?.etaMinutes || 2);
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [doctorConsultMode, setDoctorConsultMode] = useState<'video' | 'audio'>('video');
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);

  // Quick feedback states for calling / sharing
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const mapSectionRef = useRef<HTMLDivElement>(null);

  // Live countdown for ETA
  useEffect(() => {
    if (eta <= 1) return;
    const interval = setInterval(() => {
      setEta((prev) => (prev > 1 ? prev - 1 : 1));
    }, 25000);
    return () => clearInterval(interval);
  }, [eta]);

  const stages: EmergencyStage[] = [
    'EMERGENCY_CLICK',
    'AMBULANCE',
    'DOCTOR',
    'HOSPITAL',
    'HANDOVER',
    'COMPLETED'
  ];

  const currentIdx = stages.indexOf(emergencyCase.currentStage);

  const handleNextStage = () => {
    if (currentIdx < stages.length - 1) {
      const next = stages[currentIdx + 1];
      emergencyAudio.playStageUpdate();
      onUpdateStage(emergencyCase.id, next);
      if (next === 'HANDOVER' || next === 'COMPLETED') {
        setIsHandoverModalOpen(true);
      }
    }
  };

  const handleCallResqOne = () => {
    setFeedbackMessage('Connecting cellular priority line to RESQ ONE dispatch coordinator...');
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleOpenDoctorConsult = (mode: 'video' | 'audio' = 'video') => {
    setDoctorConsultMode(mode);
    setIsDoctorModalOpen(true);
  };

  const handleScrollToMap = () => {
    if (isMapCollapsed) {
      setIsMapCollapsed(false);
    }
    setTimeout(() => {
      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleShareLocation = () => {
    if (navigator.share) {
      navigator.share({
        title: 'RESQ ONE Live Emergency Status',
        text: `Live emergency tracking for ${emergencyCase.patientName}. Ambulance is en route.`,
        url: window.location.href
      }).catch(() => {
        setFeedbackMessage('Location link copied to clipboard.');
        setTimeout(() => setFeedbackMessage(null), 3000);
      });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setFeedbackMessage('Emergency live location copied to clipboard.');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const handleContactFamily = () => {
    setFeedbackMessage(`Emergency alert dispatched to emergency contacts for ${emergencyCase.patientName}.`);
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  // Reassurance message based on current stage (Item 18)
  const getReassuranceMessage = () => {
    switch (emergencyCase.currentStage) {
      case 'EMERGENCY_CLICK':
        return 'Your emergency request has been received. Help coordination has started.';
      case 'AMBULANCE':
        return `Your ambulance is close (approx. ${eta} min). Please stay where you are if it is safe to do so.`;
      case 'DOCTOR':
        return 'A doctor is available to guide you while help is arriving.';
      case 'HOSPITAL':
        return 'The hospital has been informed and is preparing for arrival.';
      case 'HANDOVER':
      case 'COMPLETED':
        return 'Patient handover completed. Care is transferring to hospital trauma staff.';
      default:
        return 'Stay calm. RESQ ONE is coordinating your emergency.';
    }
  };

  // 6 Visual Rescue Journey Infographic Steps (Item 4 & 16)
  // SOS -> TRIAGE -> AMBULANCE -> DOCTOR -> HOSPITAL -> HANDOVER
  const journeySteps = [
    {
      id: 'step-sos',
      code: 'SOS',
      icon: '🚨',
      title: 'SOS',
      sublabel: 'Emergency received',
      isCompleted: currentIdx >= 0,
      isCurrent: currentIdx === 0
    },
    {
      id: 'step-triage',
      code: 'TRIAGE',
      icon: '🩺',
      title: 'TRIAGE',
      sublabel: 'Emergency assessed',
      isCompleted: currentIdx >= 1,
      isCurrent: currentIdx === 0 && Boolean(emergencyCase.id)
    },
    {
      id: 'step-ambulance',
      code: 'AMBULANCE',
      icon: '🚑',
      title: 'AMBULANCE',
      sublabel: currentIdx === 1 ? 'Currently on the way' : currentIdx > 1 ? 'Ambulance arrived' : 'Coming next',
      isCompleted: currentIdx > 1,
      isCurrent: currentIdx === 1
    },
    {
      id: 'step-doctor',
      code: 'DOCTOR',
      icon: '👨‍⚕️',
      title: 'DOCTOR',
      sublabel: currentIdx === 2 ? 'Doctor connected' : currentIdx > 2 ? 'Doctor consulted' : 'Coming next',
      isCompleted: currentIdx > 2,
      isCurrent: currentIdx === 2
    },
    {
      id: 'step-hospital',
      code: 'HOSPITAL',
      icon: '🏥',
      title: 'HOSPITAL',
      sublabel: currentIdx === 3 ? 'Being prepared' : currentIdx > 3 ? 'Hospital ready' : 'Being prepared',
      isCompleted: currentIdx > 3,
      isCurrent: currentIdx === 3
    },
    {
      id: 'step-handover',
      code: 'HANDOVER',
      icon: '🤝',
      title: 'HANDOVER',
      sublabel: currentIdx >= 4 ? 'Care transferred' : 'Final step',
      isCompleted: currentIdx >= 5,
      isCurrent: currentIdx >= 4
    }
  ];

  // Critical Medical Information (Item 9)
  const bloodGroup = emergencyCase.medicalInfo?.bloodGroup || emergencyCase.bloodGroup || 'O+';
  const allergies = emergencyCase.medicalInfo?.allergies?.length
    ? emergencyCase.medicalInfo.allergies.join(', ')
    : 'No known allergies';
  const conditions = emergencyCase.medicalInfo?.medicalConditions?.length
    ? emergencyCase.medicalInfo.medicalConditions.join(', ')
    : emergencyCase.medicalInfo?.medicalAlerts?.length
    ? emergencyCase.medicalInfo.medicalAlerts.join(', ')
    : 'Cardiac history on file';

  const isForSelf = emergencyCase.targetMode === 'ME' || emergencyCase.relationship === 'Self';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 pb-16">
      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* =========================================================================
          SECTION 1 — EMERGENCY STATUS HERO (Item 3)
          Large visual status indicator, reassuring hierarchy, no excessive red glow
          ========================================================================= */}
      <section
        className={`p-6 sm:p-8 rounded-3xl border transition-all text-center relative overflow-hidden ${
          isLight
            ? 'bg-white border-sky-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
            : 'bg-[#0E131F] border-slate-800 shadow-2xl'
        }`}
      >
        {/* Soft background aura (calm, non-panicky) */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isLight ? 'bg-sky-300' : 'bg-red-600/30'
          }`}
        />

        <div className="relative z-10 space-y-3">
          {/* Visual Icon Badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 dark:bg-red-950/40 border border-red-500/20 text-3xl mx-auto">
            🚑
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              HELP IS ON THE WAY
            </h1>
            <p className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400 mt-1">
              Ambulance arriving in approximately {eta} {eta === 1 ? 'minute' : 'minutes'}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Stay calm. RESQ ONE is coordinating your emergency.
          </p>

          {/* Contextual Reassurance Message (Item 18) */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold mt-2 border ${
              isLight
                ? 'bg-sky-50 border-sky-100 text-sky-900'
                : 'bg-slate-900/80 border-slate-800 text-slate-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>{getReassuranceMessage()}</span>
          </div>

          {/* Hidden/Discreet Simulation Control for Advancement */}
          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              onClick={handleNextStage}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400'
              }`}
              title="Progress through the rescue lifecycle"
            >
              Advance Step →
            </button>
            <button
              onClick={() => onCompleteCase(emergencyCase.id)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400'
              }`}
            >
              Resolve Emergency
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2 — VISUAL RESCUE JOURNEY INFOGRAPHIC (Item 4 & 16)
          SOS -> TRIAGE -> AMBULANCE -> DOCTOR -> HOSPITAL -> HANDOVER
          Understand entire process in ~2 seconds
          ========================================================================= */}
      <section
        className={`p-5 sm:p-6 rounded-3xl border transition-all ${
          isLight
            ? 'bg-white border-sky-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]'
            : 'bg-[#0E131F] border-slate-800'
        }`}
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            LIVE RESCUE STATUS
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Stage {Math.min(currentIdx + 1, 6)} of 6
          </span>
        </div>

        {/* 6-Step Visual Progression Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          {journeySteps.map((step) => {
            return (
              <div
                key={step.id}
                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between text-left relative ${
                  step.isCurrent
                    ? isLight
                      ? 'bg-red-50/80 border-red-300 ring-2 ring-red-400/20'
                      : 'bg-red-950/30 border-red-500/80 ring-2 ring-red-500/20'
                    : step.isCompleted
                    ? isLight
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-[#121A2B] border-emerald-900/40'
                    : isLight
                    ? 'bg-slate-50 border-slate-200/70 opacity-60'
                    : 'bg-[#0A0D15] border-slate-800/60 opacity-50'
                }`}
              >
                {/* Step indicator dot & icon */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl" role="img" aria-label={step.title}>
                    {step.icon}
                  </span>
                  {step.isCompleted ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                  ) : step.isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
                  ) : (
                    <span className="text-xs text-slate-400">○</span>
                  )}
                </div>

                <div>
                  <span
                    className={`text-xs font-black block tracking-tight ${
                      step.isCurrent
                        ? 'text-red-600 dark:text-red-400'
                        : step.isCompleted
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span
                    className={`text-[11px] block mt-0.5 line-clamp-2 leading-tight ${
                      step.isCurrent
                        ? 'font-bold text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {step.sublabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 3 — CURRENT STEP CARD (Item 5)
          Show ONLY the current stage in detail
          ========================================================================= */}
      <section
        className={`p-6 rounded-3xl border transition-all ${
          isLight
            ? 'bg-sky-50/60 border-sky-100 shadow-sm'
            : 'bg-gradient-to-br from-[#121828] to-[#0D121F] border-slate-800'
        }`}
      >
        {/* Dynamic content depending on current stage */}
        {currentIdx <= 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🚑</span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  AMBULANCE ON THE WAY
                </h2>
              </div>
              <p className="text-2xl font-black text-red-600 dark:text-red-400">
                ETA: {eta} {eta === 1 ? 'minute' : 'minutes'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 pt-1">
                <span>
                  Ambulance: <strong className="text-slate-900 dark:text-white">{emergencyCase.ambulance?.unitId || 'ALS Medic 14'}</strong>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>En route</span>
                </span>
              </div>
            </div>

            {/* Stage Primary Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <button
                onClick={handleScrollToMap}
                className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 border-sky-200 text-sky-800 shadow-sm'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                <span>VIEW LIVE LOCATION</span>
              </button>
              <button
                onClick={handleCallResqOne}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>CALL RESQ ONE</span>
              </button>
            </div>
          </div>
        )}

        {currentIdx === 2 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">👨‍⚕️</span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  DOCTOR CONNECTED
                </h2>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {emergencyCase.doctor?.name || 'Dr. Tariq'}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                <span>{emergencyCase.doctor?.specialty || 'Emergency physician'}</span>
                <span>·</span>
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Available now</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
              <button
                onClick={() => handleOpenDoctorConsult('audio')}
                className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                  isLight
                    ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900 shadow-sm'
                    : 'bg-emerald-950/70 hover:bg-emerald-900 border-emerald-800 text-emerald-200'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                <span>CALL DOCTOR</span>
              </button>
              <button
                onClick={() => handleOpenDoctorConsult('video')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Video className="w-3.5 h-3.5" />
                <span>VIDEO CALL</span>
              </button>
            </div>
          </div>
        )}

        {currentIdx === 3 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏥</span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  HOSPITAL PREPARING
                </h2>
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {emergencyCase.hospital?.name || 'Metro Health'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Emergency department notified.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold pt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Emergency bay being prepared ({emergencyCase.hospital?.allocatedBay || 'Bay 3'})</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsHospitalModalOpen(true)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                  isLight
                    ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                    : 'bg-sky-600 hover:bg-sky-500 text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>VIEW HOSPITAL</span>
              </button>
            </div>
          </div>
        )}

        {currentIdx >= 4 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤝</span>
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  CARE HANDED OVER
                </h2>
              </div>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                Patient handover completed
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Clinical care handed over to hospital trauma triage team at {emergencyCase.hospital?.name || 'Metro Health'}.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsHandoverModalOpen(true)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors ${
                  isLight
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-white text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>VIEW HANDOVER SUMMARY</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 4 — LIVE MAP WITH COLLAPSE OPTION (Items 6 & 7)
          Simple route between ambulance and patient.
          Collapse option: ⌃ Hide map / ⌄ Show live map
          ========================================================================= */}
      <section
        ref={mapSectionRef}
        className={`rounded-3xl border overflow-hidden transition-all ${
          isLight
            ? 'bg-white border-sky-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]'
            : 'bg-[#0E131F] border-slate-800'
        }`}
      >
        {/* Map Header with Collapse Toggle */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>📍</span>
            <span>Ambulance is on the way</span>
          </div>

          <button
            onClick={() => setIsMapCollapsed((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            aria-expanded={!isMapCollapsed}
          >
            {isMapCollapsed ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Show live map</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Hide map</span>
              </>
            )}
          </button>
        </div>

        {/* Collapsible Map Content */}
        {!isMapCollapsed && (
          <div className="p-4 sm:p-5 pt-0">
            <LiveEmergencyMap
              mode="view"
              patientAddress={emergencyCase.location?.address || 'Current verified location'}
              patientCoords={emergencyCase.location}
              ambulanceUnit={emergencyCase.ambulance?.unitId || 'ALS Medic 14'}
              ambulanceEtaMin={eta}
              hospitalName={emergencyCase.hospital?.name || 'Metro Health'}
              heightClass="h-64 sm:h-72"
            />
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION 5 — SIMPLE EMERGENCY INFORMATION (Item 8)
          Clean summary: Patient, Emergency, Location
          ========================================================================= */}
      <section
        className={`p-6 rounded-3xl border transition-all ${
          isLight
            ? 'bg-white border-sky-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]'
            : 'bg-[#0E131F] border-slate-800'
        }`}
      >
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          YOUR EMERGENCY
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Patient */}
          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200/70' : 'bg-[#121828] border-slate-800'}`}>
            <span className="text-[11px] font-semibold text-slate-400 block">
              Patient
            </span>
            <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">
              {emergencyCase.patientName}
            </p>
            {!isForSelf && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                Requested by: {emergencyCase.requesterName} ({emergencyCase.relationship})
              </p>
            )}
          </div>

          {/* Emergency */}
          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200/70' : 'bg-[#121828] border-slate-800'}`}>
            <span className="text-[11px] font-semibold text-slate-400 block">
              Emergency
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {emergencyCase.emergency?.type || 'Medical emergency'}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>Priority Response Dispatched</span>
            </p>
          </div>

          {/* Location */}
          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200/70' : 'bg-[#121828] border-slate-800'}`}>
            <span className="text-[11px] font-semibold text-slate-400 block">
              Location
            </span>
            <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 truncate">
              {emergencyCase.location?.address || 'Current verified location'}
            </p>
            <p className="text-xs text-sky-600 dark:text-sky-400 mt-1 font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>GPS Coordinates Verified</span>
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6 — MEDICAL INFORMATION (Item 9)
          Compact section showing only critical info + secondary modal button
          ========================================================================= */}
      <section
        className={`p-6 rounded-3xl border transition-all ${
          isLight
            ? 'bg-white border-sky-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]'
            : 'bg-[#0E131F] border-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Important medical information
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Critical parameters transmitted to attending emergency crew
            </p>
          </div>

          <button
            onClick={() => setIsMedicalModalOpen(true)}
            className={`self-start sm:self-auto px-3.5 py-1.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>VIEW AUTHORIZED MEDICAL INFO</span>
          </button>
        </div>

        {/* 3 Compact Critical Items */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${isLight ? 'bg-red-50/50 border-red-100 text-red-950' : 'bg-red-950/20 border-red-900/40 text-red-200'}`}>
            <span className="text-xl">🩸</span>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                Blood group
              </span>
              <strong className="text-sm font-black">{bloodGroup}</strong>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${isLight ? 'bg-amber-50/50 border-amber-100 text-amber-950' : 'bg-amber-950/20 border-amber-900/40 text-amber-200'}`}>
            <span className="text-xl">⚠️</span>
            <div className="truncate">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                Allergy
              </span>
              <strong className="text-xs font-bold truncate block">{allergies}</strong>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${isLight ? 'bg-sky-50/50 border-sky-100 text-sky-950' : 'bg-sky-950/20 border-sky-900/40 text-sky-200'}`}>
            <span className="text-xl">❤️</span>
            <div className="truncate">
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                Critical condition
              </span>
              <strong className="text-xs font-bold truncate block">{conditions}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7 & 8 — DOCTOR & HOSPITAL EXPERIENCE CARDS (Items 10 & 11)
          When doctor or hospital is notified/connected
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Doctor Card */}
        <div
          className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
            isLight
              ? 'bg-white border-sky-100 shadow-sm'
              : 'bg-[#0E131F] border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">👨‍⚕️</span>
                <span className="text-xs font-bold uppercase text-slate-900 dark:text-white">
                  DOCTOR CONNECTED
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                🟢 Available now
              </span>
            </div>

            <p className="text-base font-black text-slate-900 dark:text-white">
              {emergencyCase.doctor?.name || 'Dr. Tariq'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {emergencyCase.doctor?.specialty || 'Emergency physician'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => handleOpenDoctorConsult('audio')}
              className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
              <span>CALL DOCTOR</span>
            </button>
            <button
              onClick={() => handleOpenDoctorConsult('video')}
              className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              <span>VIDEO CALL</span>
            </button>
          </div>
        </div>

        {/* Hospital Card */}
        <div
          className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
            isLight
              ? 'bg-white border-sky-100 shadow-sm'
              : 'bg-[#0E131F] border-slate-800'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏥</span>
                <span className="text-xs font-bold uppercase text-slate-900 dark:text-white">
                  HOSPITAL PREPARING
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                🟢 Bay ready
              </span>
            </div>

            <p className="text-base font-black text-slate-900 dark:text-white">
              {emergencyCase.hospital?.name || 'Metro Health'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Emergency department notified · {emergencyCase.hospital?.allocatedBay || 'Bay 3 prepared'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsHospitalModalOpen(true)}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                isLight
                  ? 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-800'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-sky-500" />
              <span>VIEW HOSPITAL</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 9 — PRIMARY ACTIONS & REASSURING CONTROLS (Item 12)
          Clear, structured actions without 8-10 cluttered buttons
          ========================================================================= */}
      <section
        className={`p-6 rounded-3xl border transition-all ${
          isLight
            ? 'bg-white border-sky-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]'
            : 'bg-[#0E131F] border-slate-800'
        }`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              EMERGENCY ACTIONS
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Immediate Assistance
            </span>
          </div>

          {/* 3 Prominent Primary Actions (Item 12) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleCallResqOne}
              className="py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 active:scale-[0.98] transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              <span>CALL RESQ ONE</span>
            </button>

            <button
              onClick={() => handleOpenDoctorConsult('audio')}
              className={`py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${
                isLight
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900 shadow-sm'
                  : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-800 text-emerald-200'
              }`}
            >
              <PhoneCall className="w-4 h-4 text-emerald-500" />
              <span>CALL DOCTOR</span>
            </button>

            <button
              onClick={handleScrollToMap}
              className={`py-3 px-4 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${
                isLight
                  ? 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-900 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4 text-sky-500" />
              <span>VIEW LIVE LOCATION</span>
            </button>
          </div>

          {/* Secondary Actions (Quiet, cleanly separated) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
            <button
              onClick={() => setIsMedicalModalOpen(true)}
              className={`px-3.5 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 font-semibold ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>VIEW DETAILS</span>
            </button>

            <button
              onClick={handleShareLocation}
              className={`px-3.5 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 font-semibold ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              <span>SHARE LOCATION</span>
            </button>

            <button
              onClick={handleContactFamily}
              className={`px-3.5 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 font-semibold ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>CONTACT FAMILY</span>
            </button>
          </div>
        </div>
      </section>

      {/* Modals & Dialogs */}
      <DoctorConsultModal
        isOpen={isDoctorModalOpen}
        emergencyCase={emergencyCase}
        initialMode={doctorConsultMode}
        onClose={() => setIsDoctorModalOpen(false)}
      />

      <HandoverReportModal
        isOpen={isHandoverModalOpen}
        emergencyCase={emergencyCase}
        onClose={() => setIsHandoverModalOpen(false)}
      />

      <AuthorizedMedicalInfoModal
        isOpen={isMedicalModalOpen}
        emergencyCase={emergencyCase}
        onClose={() => setIsMedicalModalOpen(false)}
      />

      <HospitalInfoModal
        isOpen={isHospitalModalOpen}
        emergencyCase={emergencyCase}
        onClose={() => setIsHospitalModalOpen(false)}
        onCallHospital={() => {
          setIsHospitalModalOpen(false);
          setFeedbackMessage(`Dialing ${emergencyCase.hospital?.name || 'Metro Health'} Trauma Triage...`);
          setTimeout(() => setFeedbackMessage(null), 4000);
        }}
      />
    </div>
  );
};
