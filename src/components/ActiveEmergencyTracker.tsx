import React, { useState, useEffect } from 'react';
import {
  EmergencyCase,
  EmergencyStage
} from '../types/emergency';
import {
  PhoneCall,
  Video,
  Hospital,
  MapPin,
  Clock,
  Radio,
  User,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
  FileText,
  Activity,
  Ambulance,
  Stethoscope,
  Building2,
  Share2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { ResqLogo } from './ResqLogo';
import { LiveEmergencyMap } from './LiveEmergencyMap';
import { DoctorConsultModal } from './DoctorConsultModal';
import { HandoverReportModal } from './HandoverReportModal';
import { emergencyAudio } from '../utils/audio';

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
  const [eta, setEta] = useState(emergencyCase.ambulance.etaMinutes);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [doctorConsultMode, setDoctorConsultMode] = useState<'video' | 'audio'>('video');
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [crewCallActive, setCrewCallActive] = useState(false);
  const [hospitalCallActive, setHospitalCallActive] = useState(false);

  const handleOpenDoctorConsult = (mode: 'video' | 'audio' = 'video') => {
    setDoctorConsultMode(mode);
    setIsDoctorModalOpen(true);
  };

  // Live countdown for ETA
  useEffect(() => {
    if (eta <= 1) return;
    const interval = setInterval(() => {
      setEta((prev) => (prev > 1 ? prev - 1 : 1));
    }, 20000); // decrement realistically
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

  const handleCrewCall = () => {
    setCrewCallActive(true);
    setTimeout(() => setCrewCallActive(false), 3500);
  };

  const handleHospitalCall = () => {
    setHospitalCallActive(true);
    setTimeout(() => setHospitalCallActive(false), 3500);
  };

  // Status timeline items as specified in user prompt:
  // ✓ Emergency received
  // ✓ Ambulance assigned
  // ● Ambulance arriving
  // ○ Doctor connected
  // ○ Hospital notified
  // ○ Patient handover
  const timelineSteps = [
    {
      id: 'step-rcvd',
      label: 'Emergency received',
      state: 'done', // Always done once case is active
      detail: `CAD Logged at ${emergencyCase.createdAt} · Priority 1 CAD`
    },
    {
      id: 'step-amb-assigned',
      label: 'Ambulance assigned',
      state: currentIdx >= 1 ? 'done' : 'current',
      detail: `${emergencyCase.ambulance.unitId} (${emergencyCase.ambulance.vehicleType || 'ALS Unit'})`
    },
    {
      id: 'step-amb-arriving',
      label: 'Ambulance arriving',
      state: currentIdx === 1 ? 'current' : currentIdx > 1 ? 'done' : 'pending',
      detail: `ETA ${eta} mins · Paramedic ${emergencyCase.ambulance.medic}`
    },
    {
      id: 'step-doc-conn',
      label: 'Doctor connected',
      state: currentIdx === 2 ? 'current' : currentIdx > 2 ? 'done' : 'pending',
      detail: `${emergencyCase.doctor.name} (${emergencyCase.doctor.specialty})`
    },
    {
      id: 'step-hosp-notified',
      label: 'Hospital notified',
      state: currentIdx === 3 ? 'current' : currentIdx > 3 ? 'done' : 'pending',
      detail: `${emergencyCase.hospital.name} · ${emergencyCase.hospital.allocatedBay}`
    },
    {
      id: 'step-handover',
      label: 'Patient handover',
      state: currentIdx >= 4 ? (emergencyCase.currentStage === 'COMPLETED' ? 'done' : 'current') : 'pending',
      detail: 'Trauma team clinical transfer & signed report'
    }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: RESQ ONE 5-Stage Visual Progression */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0F131D] border border-red-900/60 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-full bg-[#FF2B44] animate-ping" />
              <span className="absolute w-2 h-2 rounded-full bg-[#FF2B44]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white">ACTIVE EMERGENCY RESPONSE</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-950 text-[#FF2B44] border border-red-800">
                  CASE #{emergencyCase.id}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Initiated by {emergencyCase.requesterName} for {emergencyCase.patientName} ({emergencyCase.relationship})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNextStage}
              className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-[#FF2B44] text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(255,43,68,0.3)] flex items-center gap-1.5"
            >
              <span>Advance Stage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onCompleteCase(emergencyCase.id)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Resolve / Finish
            </button>
          </div>
        </div>

        {/* Brand 5-Step Connected Pipeline */}
        <div className="pt-2">
          <ResqLogo
            variant="pipelineOnly"
            activeStep={
              emergencyCase.currentStage === 'COMPLETED'
                ? 'COMPLETED'
                : emergencyCase.currentStage
            }
          />
        </div>
      </div>

      {/* STAGE FOCUS: AMBULANCE ARRIVING TO PATIENT — CALL DOCTOR & VIDEO CHAT ACTION CARD */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-red-950/90 via-[#131726] to-blue-950/90 border-2 border-red-500/80 shadow-[0_0_30px_rgba(255,43,68,0.25)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF2B44] to-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg">
            <Ambulance className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black animate-ping" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                <span>STAGE: AMBULANCE ARRIVING TO PATIENT · ETA ~{eta} MINS</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                PHYSICIAN ONLINE NOW
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              Call Doctor or Start Video Chat while Ambulance is Arriving
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              While Paramedic Unit <strong className="text-white">{emergencyCase.ambulance.unitId}</strong> is navigating to {emergencyCase.location.address}, you can initiate an immediate direct phone call or live encrypted video chat with <strong className="text-white">{emergencyCase.doctor.name}</strong> for real-time patient stabilization directions.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={() => handleOpenDoctorConsult('audio')}
            className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.02]"
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>Call Doctor (Voice)</span>
          </button>
          <button
            onClick={() => handleOpenDoctorConsult('video')}
            className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-[1.02]"
          >
            <Video className="w-4 h-4 text-white" />
            <span>Start Video Chat</span>
          </button>
        </div>
      </div>

      {/* Required Active Emergency Details Display Matrix:
          - PATIENT NAME
          - REQUESTER NAME
          - RELATIONSHIP
          - EMERGENCY TYPE
          - LOCATION
          - AMBULANCE ETA
          - DOCTOR STATUS
          - HOSPITAL STATUS
      */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0A0D14] border border-slate-800 shadow-2xl">
        <h2 className="text-xs font-mono font-bold text-slate-400 tracking-widest uppercase mb-4">
          EMERGENCY DISPATCH DOSSIER
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pb-5 border-b border-slate-800">
          {/* PATIENT NAME */}
          <div className="p-3.5 rounded-xl bg-[#0E121B] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              PATIENT NAME
            </span>
            <span className="text-base font-black text-white block mt-1 truncate">
              {emergencyCase.patientName}
            </span>
            <span className="text-[11px] text-slate-400">
              Age: {emergencyCase.patientAge || 'Reported'}
            </span>
          </div>

          {/* REQUESTER NAME */}
          <div className="p-3.5 rounded-xl bg-[#0E121B] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              REQUESTER NAME
            </span>
            <span className="text-base font-black text-slate-200 block mt-1 truncate">
              {emergencyCase.requesterName}
            </span>
            <span className="text-[11px] text-emerald-400">
              Account Verified
            </span>
          </div>

          {/* RELATIONSHIP */}
          <div className="p-3.5 rounded-xl bg-[#0E121B] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              RELATIONSHIP
            </span>
            <span className="text-base font-black text-[#FF2B44] block mt-1">
              {emergencyCase.relationship}
            </span>
            <span className="text-[11px] text-slate-400">
              {emergencyCase.targetMode === 'ME'
                ? 'Account Owner'
                : emergencyCase.targetMode === 'FAMILY'
                ? 'Saved Family Member'
                : 'Friend / Bystander'}
            </span>
          </div>

          {/* EMERGENCY TYPE */}
          <div className="p-3.5 rounded-xl bg-[#0E121B] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              EMERGENCY TYPE
            </span>
            <span className="text-sm font-bold text-red-300 block mt-1 truncate">
              {emergencyCase.emergency.type}
            </span>
            <span className="text-[10px] font-mono font-bold text-red-500">
              {emergencyCase.emergency.severity}
            </span>
          </div>
        </div>

        {/* 3 Operational Command Cards: AMBULANCE ETA, DOCTOR STATUS, HOSPITAL STATUS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          {/* 1. AMBULANCE ETA */}
          <div className="p-4 rounded-xl bg-[#141824] border border-red-900/50 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Ambulance className="w-4 h-4 text-[#FF2B44]" />
                  <span>AMBULANCE ETA</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 font-bold">
                  {emergencyCase.ambulance.unitId}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-white font-mono">{eta}</span>
                <span className="text-sm font-bold text-red-400">MINUTES</span>
              </div>

              <p className="text-xs text-slate-300 mt-2">
                Crew: <strong className="text-white">{emergencyCase.ambulance.medic}</strong> ({emergencyCase.ambulance.driverParamedic})
              </p>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Status: {emergencyCase.ambulance.status}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <button
                onClick={handleCrewCall}
                className="w-full py-2 px-3 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{crewCallActive ? 'Patching Cellular Crew Line...' : `Call Crew (${emergencyCase.ambulance.phone})`}</span>
              </button>
            </div>
          </div>

          {/* 2. DOCTOR STATUS */}
          <div className="p-4 rounded-xl bg-[#141824] border border-blue-900/50 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-blue-400" />
                  <span>DOCTOR STATUS</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">
                  {emergencyCase.doctor.status}
                </span>
              </div>

              <div className="text-base font-black text-white mt-1 truncate">
                {emergencyCase.doctor.name}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {emergencyCase.doctor.specialty}
              </p>
              <div className="mt-2 text-xs text-blue-300 bg-blue-950/40 border border-blue-900/40 p-2 rounded-lg">
                <span className="font-semibold block text-[10px] text-blue-400 uppercase">First Aid Direction:</span>
                <span className="text-[11px] line-clamp-2">{emergencyCase.doctor.instructions[0]}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleOpenDoctorConsult('audio')}
                className="py-2 px-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Doctor</span>
              </button>
              <button
                onClick={() => handleOpenDoctorConsult('video')}
                className="py-2 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Chat</span>
              </button>
            </div>
          </div>

          {/* 3. HOSPITAL STATUS */}
          <div className="p-4 rounded-xl bg-[#141824] border border-emerald-900/50 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>HOSPITAL STATUS</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">
                  {emergencyCase.hospital.status}
                </span>
              </div>

              <div className="text-base font-black text-white mt-1 truncate">
                {emergencyCase.hospital.name}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Department: {emergencyCase.hospital.receivingDepartment}
              </p>
              <div className="mt-2 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-900/40 p-2 rounded-lg">
                <span className="font-semibold block text-[10px] text-emerald-400 uppercase">Emergency Bay Reserved:</span>
                <span className="text-[11px] font-bold text-white">{emergencyCase.hospital.allocatedBay}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <button
                onClick={handleHospitalCall}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{hospitalCallActive ? 'Connected to ER Triage...' : 'Direct Line to Trauma Triage'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* LOCATION DISPLAY WITH LIVE MAP */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#FF2B44]" />
              <span>LOCATION & CAD ROUTE TELEMETRY</span>
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {emergencyCase.location.address}
            </span>
          </div>

          <LiveEmergencyMap
            mode="view"
            patientAddress={emergencyCase.location.address}
            patientCoords={emergencyCase.location}
            ambulanceUnit={emergencyCase.ambulance.unitId}
            ambulanceEtaMin={eta}
            hospitalName={emergencyCase.hospital.name}
            heightClass="h-64"
          />
        </div>
      </div>

      {/* STATUS TIMELINE as specifically defined in the prompt:
          ✓ Emergency received
          ✓ Ambulance assigned
          ● Ambulance arriving
          ○ Doctor connected
          ○ Hospital notified
          ○ Patient handover
      */}
      <div className="p-6 rounded-2xl bg-[#0F131D] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-white uppercase tracking-wider">
            STATUS TIMELINE
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Real-Time CAD Event Stream
          </span>
        </div>

        <div className="space-y-3">
          {timelineSteps.map((step, idx) => (
            <div
              key={step.id}
              className={`p-3.5 rounded-xl border flex items-start justify-between gap-4 transition-all ${
                step.state === 'current'
                  ? 'bg-red-950/40 border-[#FF2B44] ring-1 ring-[#FF2B44] shadow-md'
                  : step.state === 'done'
                  ? 'bg-[#121622] border-slate-800'
                  : 'bg-[#0B0E14] border-slate-800/60 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {step.state === 'done' ? (
                    <span className="text-emerald-400 font-bold text-base leading-none">✓</span>
                  ) : step.state === 'current' ? (
                    <span className="inline-block w-3 h-3 rounded-full bg-[#FF2B44] animate-ping" />
                  ) : (
                    <span className="text-slate-500 font-bold text-base leading-none">○</span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-bold ${
                        step.state === 'current'
                          ? 'text-white'
                          : step.state === 'done'
                          ? 'text-slate-200'
                          : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.state === 'current' && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FF2B44] text-white font-bold uppercase">
                        Active Stage
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {step.detail}
                  </p>
                </div>
              </div>

              {step.id === 'step-amb-arriving' && (
                <div className="flex items-center gap-1.5 shrink-0 mt-2 sm:mt-0">
                  <button
                    onClick={() => handleOpenDoctorConsult('audio')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                    title="Audio phone call with emergency physician"
                  >
                    <PhoneCall className="w-3 h-3 text-emerald-400" />
                    <span>Call Doctor</span>
                  </button>
                  <button
                    onClick={() => handleOpenDoctorConsult('video')}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                    title="Live encrypted telemedicine video chat"
                  >
                    <Video className="w-3 h-3" />
                    <span>Video Chat</span>
                  </button>
                </div>
              )}

              {step.id === 'step-doc-conn' && (
                <div className="flex items-center gap-1.5 shrink-0 mt-2 sm:mt-0">
                  <button
                    onClick={() => handleOpenDoctorConsult('audio')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
                  >
                    <PhoneCall className="w-3 h-3 text-emerald-400" />
                    <span>Audio Call</span>
                  </button>
                  <button
                    onClick={() => handleOpenDoctorConsult('video')}
                    className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                  >
                    <Video className="w-3 h-3" />
                    <span>Video Stream</span>
                  </button>
                </div>
              )}

              {step.id === 'step-handover' && (
                <button
                  onClick={() => setIsHandoverModalOpen(true)}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0"
                >
                  View Sign-off
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Dialogs */}
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
    </div>
  );
};
