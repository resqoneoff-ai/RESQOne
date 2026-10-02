import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  Video,
  FileText,
  Clock,
  MapPin,
  Ambulance,
  Building2,
  CheckCircle,
  XCircle,
  Activity,
  Heart,
  User,
  Radio,
  Send,
  Sparkles,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { EmergencyCase } from '../../types/emergency';
import {
  DoctorRecord,
  DoctorAvailability,
  DoctorTriageAssessment,
  AppUserSession,
  EmergencyStatus
} from '../../types/roles';
import { emergencyService } from '../../services/emergencyService';
import { CaseChatDrawer } from './CaseChatDrawer';

interface DoctorPortalProps {
  currentSession: AppUserSession;
  onBackToApp: () => void;
}

export const DoctorPortal: React.FC<DoctorPortalProps> = ({ currentSession, onBackToApp }) => {
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [activeCases, setActiveCases] = useState<EmergencyCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PENDING' | 'COMPLETED'>('ACTIVE');
  const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);
  const [isCommsOpen, setIsCommsOpen] = useState(false);

  // Active Doctor record
  const currentDoctor = doctors.find((d) => d.id === currentSession.associatedDoctorId) || doctors[0] || {
    id: 'doc-aris-01',
    profileId: 'usr-doc-01',
    name: 'Dr. Katherine Aris, MD',
    registrationNumber: 'MD-88219-CAD',
    specialization: 'Attending Emergency Physician & Acute Resuscitation Lead',
    experienceYears: 14,
    hospitalAffiliation: 'Metro Health Trauma & Cardiac Center',
    phone: '+1 (555) 018-3829',
    verificationStatus: 'VERIFIED' as const,
    availability: 'AVAILABLE' as const,
    rating: 4.98,
    assignedCaseIds: []
  };

  // Structured Triage Form State
  const [triageForm, setTriageForm] = useState({
    chiefComplaint: '',
    symptoms: '',
    consciousness: 'Conscious & Alert' as 'Conscious & Alert' | 'Drowsy / Confused' | 'Unconscious',
    breathing: 'Normal' as 'Normal' | 'Labored / Struggling' | 'Gasping / Arrest',
    bleeding: 'None' as 'None' | 'Controlled / Minor' | 'Severe / Arterial',
    painSeverity: 6,
    heartRate: '98',
    bp: '135/88',
    spo2: '97',
    respRate: '18',
    temp: '98.6',
    clinicalNotes: '',
    severity: 'CRITICAL (Priority 1)' as 'CRITICAL (Priority 1)' | 'URGENT (Priority 2)' | 'STANDARD (Priority 3)',
    recommendedAction: ''
  });

  const loadData = () => {
    setDoctors(emergencyService.getDoctors());
    const cases = emergencyService.getAllCases();
    setActiveCases(cases);
    if (!selectedCaseId && cases.length > 0) {
      setSelectedCaseId(cases[0].id);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = emergencyService.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  const selectedCase = activeCases.find((c) => c.id === selectedCaseId) || activeCases[0] || null;

  const handleAvailabilityChange = (status: DoctorAvailability) => {
    emergencyService.updateDoctorAvailability(currentDoctor.id, status);
  };

  const handleOpenTriage = () => {
    if (!selectedCase) return;
    setTriageForm({
      chiefComplaint: selectedCase.emergency.type,
      symptoms: selectedCase.emergency.symptoms.join(', '),
      consciousness: selectedCase.emergency.consciousness || 'Conscious & Alert',
      breathing: selectedCase.emergency.breathing || 'Normal',
      bleeding: 'None',
      painSeverity: 7,
      heartRate: selectedCase.doctor.vitals?.heartRate?.toString() || '95',
      bp: selectedCase.doctor.vitals?.bp || '130/85',
      spo2: selectedCase.doctor.vitals?.spo2?.toString() || '98',
      respRate: selectedCase.doctor.vitals?.respRate?.toString() || '18',
      temp: '98.6',
      clinicalNotes: selectedCase.emergency.notes || '',
      severity: selectedCase.emergency.severity,
      recommendedAction: selectedCase.doctor.instructions[0] || 'Keep patient immobilized and oxygenated.'
    });
    setIsTriageModalOpen(true);
  };

  const handleSubmitTriage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    emergencyService.submitDoctorTriage(
      {
        caseId: selectedCase.id,
        assessedByDoctorId: currentDoctor.id,
        doctorName: currentDoctor.name,
        chiefComplaint: triageForm.chiefComplaint,
        symptoms: triageForm.symptoms.split(',').map((s) => s.trim()),
        consciousness: triageForm.consciousness,
        breathing: triageForm.breathing,
        bleeding: triageForm.bleeding,
        painSeverity: Number(triageForm.painSeverity),
        vitalSigns: {
          heartRate: Number(triageForm.heartRate) || undefined,
          bp: triageForm.bp,
          spo2: Number(triageForm.spo2) || undefined,
          respRate: Number(triageForm.respRate) || undefined,
          temp: triageForm.temp
        },
        clinicalNotes: triageForm.clinicalNotes,
        severity: triageForm.severity,
        recommendedAction: triageForm.recommendedAction
      },
      {
        id: currentSession.id,
        name: currentDoctor.name,
        role: 'DOCTOR'
      }
    );

    setIsTriageModalOpen(false);
  };

  const handleAcceptCase = () => {
    if (!selectedCase) return;
    emergencyService.assignDoctor(selectedCase.id, currentDoctor.id, {
      id: currentSession.id,
      name: currentDoctor.name,
      role: 'DOCTOR'
    });
  };

  const handleCompleteHandover = () => {
    if (!selectedCase) return;
    emergencyService.completeHandover(
      selectedCase.id,
      {
        paramedicSign: selectedCase.ambulance.driverParamedic || 'Paramedic Unit Lead',
        receivingDoctor: currentDoctor.name,
        clinicalSummary: `Handover certified by ${currentDoctor.name}. Patient transferred to acute care bay.`
      },
      {
        id: currentSession.id,
        name: currentDoctor.name,
        role: 'DOCTOR'
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Doctor Profile Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0E121B] border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-white tracking-tight">{currentDoctor.name}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>{currentDoctor.verificationStatus}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">{currentDoctor.registrationNumber}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentDoctor.specialization} · {currentDoctor.hospitalAffiliation} · {currentDoctor.experienceYears} yrs exp
            </p>
          </div>
        </div>

        {/* Availability Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-slate-800 text-xs font-semibold">
            {(['AVAILABLE', 'BUSY', 'OFFLINE'] as DoctorAvailability[]).map((status) => (
              <button
                key={status}
                onClick={() => handleAvailabilityChange(status)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentDoctor.availability === status
                    ? status === 'AVAILABLE'
                      ? 'bg-emerald-600 text-white font-bold shadow-md'
                      : status === 'BUSY'
                      ? 'bg-amber-600 text-white font-bold shadow-md'
                      : 'bg-slate-700 text-slate-200 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <button
            onClick={onBackToApp}
            className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            Switch Portal
          </button>
        </div>
      </div>

      {/* Main Grid: Cases List + Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Cases (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-[#0E121B] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Assigned Emergency Feed
                </h2>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 font-bold">
                {activeCases.length} Active
              </span>
            </div>

            {/* Cases List */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {activeCases.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No active emergency requests in CAD queue.
                </div>
              ) : (
                activeCases.map((c) => {
                  const isSelected = c.id === selectedCase?.id;
                  const isAssignedToThisDoctor = c.doctor.name === currentDoctor.name;

                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all space-y-2 ${
                        isSelected
                          ? 'bg-slate-800/90 border-[#FF2B44] shadow-lg ring-1 ring-[#FF2B44]/30'
                          : 'bg-[#121622]/80 hover:bg-[#161C2C] border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white">{c.id}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            c.emergency.severity.includes('Priority 1')
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {c.emergency.severity.split(' ')[0]}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-200">{c.patientName}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{c.emergency.type}</div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                        <span className="flex items-center gap-1">
                          <Ambulance className="w-3 h-3 text-amber-400" />
                          <span>{c.ambulance.status}</span>
                        </span>
                        {isAssignedToThisDoctor ? (
                          <span className="text-emerald-400 font-bold">Assigned to You</span>
                        ) : (
                          <span className="text-slate-500">Unassigned CAD</span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Case Clinical View & Directives (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {selectedCase ? (
            <div className="space-y-5">
              {/* Case Header Card */}
              <div className="p-5 rounded-2xl bg-[#0E121B] border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-extrabold text-white">{selectedCase.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 text-[10px] font-mono font-bold">
                        {selectedCase.emergency.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">Created: {selectedCase.createdAt}</span>
                    </div>
                    <h2 className="text-xl font-black text-white mt-1">
                      {selectedCase.patientName}{' '}
                      <span className="text-xs font-normal text-slate-400">
                        ({selectedCase.relationship} · Age: {selectedCase.patientAge || 'Unknown'})
                      </span>
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setIsCommsOpen(true)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                      <span>Comms Relay</span>
                    </button>

                    <button
                      onClick={handleOpenTriage}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Record Clinical Triage</span>
                    </button>

                    {selectedCase.doctor.name !== currentDoctor.name && (
                      <button
                        onClick={handleAcceptCase}
                        className="px-3.5 py-2 rounded-xl bg-[#FF2B44] hover:bg-red-600 text-white text-xs font-black uppercase tracking-wider transition-colors shadow-md"
                      >
                        Accept Case
                      </button>
                    )}
                  </div>
                </div>

                {/* Emergency Vitals Banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Heart Rate</div>
                    <div className="text-lg font-mono font-bold text-red-400 flex items-center gap-1.5 mt-0.5">
                      <Heart className="w-4 h-4 animate-pulse" />
                      <span>{selectedCase.doctor.vitals?.heartRate || '96'} BPM</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Blood Pressure</div>
                    <div className="text-lg font-mono font-bold text-slate-100 mt-0.5">
                      {selectedCase.doctor.vitals?.bp || '134/86'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">SpO2 Oxygen</div>
                    <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                      {selectedCase.doctor.vitals?.spo2 || '97'}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Resp Rate</div>
                    <div className="text-lg font-mono font-bold text-blue-400 mt-0.5">
                      {selectedCase.doctor.vitals?.respRate || '18'} /min
                    </div>
                  </div>
                </div>

                {/* Patient Authorized Medical Records (Strict Isolation) */}
                <div className="p-4 rounded-xl bg-[#141824] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Authorized Clinical Emergency Passport</span>
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      {selectedCase.medicalInfo.sourceLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80">
                      <strong className="text-slate-400 text-[10px] block uppercase">Blood Group</strong>
                      <span className="text-white font-mono font-bold">
                        {selectedCase.medicalInfo.bloodGroup || 'NOT PROVIDED'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80">
                      <strong className="text-red-400 text-[10px] block uppercase">Allergies</strong>
                      <span className="text-slate-200">
                        {selectedCase.medicalInfo.allergies.join(', ') || 'No known allergies reported'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80">
                      <strong className="text-amber-400 text-[10px] block uppercase">Known Conditions</strong>
                      <span className="text-slate-200">
                        {selectedCase.medicalInfo.medicalConditions.join(', ') || 'None provided'}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800/80">
                      <strong className="text-blue-400 text-[10px] block uppercase">Current Medications</strong>
                      <span className="text-slate-200">
                        {selectedCase.medicalInfo.medications.join(', ') || 'None provided'}
                      </span>
                    </div>
                  </div>

                  {selectedCase.medicalInfo.medicalAlerts && selectedCase.medicalInfo.medicalAlerts.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/60 text-xs text-red-200">
                      <strong className="text-[10px] font-bold uppercase text-red-300 block mb-1">
                        Critical Medical Alerts:
                      </strong>
                      <ul className="list-disc list-inside space-y-0.5">
                        {selectedCase.medicalInfo.medicalAlerts.map((alert, idx) => (
                          <li key={idx}>{alert}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Location & Routing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#FF2B44]" />
                      <span>Patient Emergency Location</span>
                    </span>
                    <p className="text-white font-semibold">{selectedCase.location.address}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Coordinates: {selectedCase.location.lat.toFixed(4)}, {selectedCase.location.lng.toFixed(4)}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-purple-400" />
                      <span>Target Receiving Center</span>
                    </span>
                    <p className="text-white font-semibold">{selectedCase.hospital.name}</p>
                    <p className="text-[10px] text-emerald-400 font-bold">
                      {selectedCase.hospital.allocatedBay} · {selectedCase.hospital.status}
                    </p>
                  </div>
                </div>

                {/* Doctor Directives & Instructions */}
                <div className="p-4 rounded-xl bg-[#141824] border border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Current Resuscitation & First-Responder Directives
                  </h3>
                  <div className="space-y-1.5">
                    {selectedCase.doctor.instructions.map((inst, idx) => (
                      <div key={idx} className="p-2 rounded-lg bg-black/40 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-emerald-600/30 text-emerald-400 text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{inst}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Bar */}
                <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCompleteHandover}
                      className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-md"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Complete ED Handover</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setIsCommsOpen(true)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
                  >
                    <span>View all case messages and relay transmissions</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#0E121B] border border-slate-800 text-center text-slate-400 space-y-2">
              <Stethoscope className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="font-bold text-white">No Emergency Selected</p>
              <p className="text-xs">Select an active emergency case from the feed on the left to begin review.</p>
            </div>
          )}
        </div>
      </div>

      {/* Structured Doctor Triage Modal */}
      {isTriageModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0E121B] border border-slate-800 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Record Structured Physician Triage</h3>
              </div>
              <button
                onClick={() => setIsTriageModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmitTriage} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Patient</span>
                  <strong className="text-white block">{selectedCase.patientName} ({selectedCase.relationship})</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">Case ID</span>
                  <strong className="text-white block font-mono">{selectedCase.id}</strong>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Chief Complaint</label>
                <input
                  type="text"
                  required
                  value={triageForm.chiefComplaint}
                  onChange={(e) => setTriageForm({ ...triageForm, chiefComplaint: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Consciousness</label>
                  <select
                    value={triageForm.consciousness}
                    onChange={(e: any) => setTriageForm({ ...triageForm, consciousness: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Conscious & Alert">Conscious & Alert</option>
                    <option value="Drowsy / Confused">Drowsy / Confused</option>
                    <option value="Unconscious">Unconscious</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Breathing</label>
                  <select
                    value={triageForm.breathing}
                    onChange={(e: any) => setTriageForm({ ...triageForm, breathing: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Labored / Struggling">Labored / Struggling</option>
                    <option value="Gasping / Arrest">Gasping / Arrest</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Bleeding</label>
                  <select
                    value={triageForm.bleeding}
                    onChange={(e: any) => setTriageForm({ ...triageForm, bleeding: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="None">None</option>
                    <option value="Controlled / Minor">Controlled / Minor</option>
                    <option value="Severe / Arterial">Severe / Arterial</option>
                  </select>
                </div>
              </div>

              {/* Vitals Input */}
              <div className="p-3 rounded-xl bg-[#141824] border border-slate-800 space-y-2">
                <span className="font-bold text-slate-200 block">Vital Signs Telemetry</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400">Heart Rate (BPM)</label>
                    <input
                      type="text"
                      value={triageForm.heartRate}
                      onChange={(e) => setTriageForm({ ...triageForm, heartRate: e.target.value })}
                      placeholder="e.g. 96"
                      className="w-full px-2 py-1.5 rounded-lg bg-black/50 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Blood Pressure</label>
                    <input
                      type="text"
                      value={triageForm.bp}
                      onChange={(e) => setTriageForm({ ...triageForm, bp: e.target.value })}
                      placeholder="e.g. 130/85"
                      className="w-full px-2 py-1.5 rounded-lg bg-black/50 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">SpO2 %</label>
                    <input
                      type="text"
                      value={triageForm.spo2}
                      onChange={(e) => setTriageForm({ ...triageForm, spo2: e.target.value })}
                      placeholder="e.g. 98"
                      className="w-full px-2 py-1.5 rounded-lg bg-black/50 border border-slate-700 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400">Resp Rate (/min)</label>
                    <input
                      type="text"
                      value={triageForm.respRate}
                      onChange={(e) => setTriageForm({ ...triageForm, respRate: e.target.value })}
                      placeholder="e.g. 18"
                      className="w-full px-2 py-1.5 rounded-lg bg-black/50 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Clinical Assessment Notes</label>
                <textarea
                  rows={3}
                  value={triageForm.clinicalNotes}
                  onChange={(e) => setTriageForm({ ...triageForm, clinicalNotes: e.target.value })}
                  placeholder="Document immediate clinical findings, suspected pathology, differential diagnosis..."
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Physician Recommended Action / EMS Orders</label>
                <input
                  type="text"
                  required
                  value={triageForm.recommendedAction}
                  onChange={(e) => setTriageForm({ ...triageForm, recommendedAction: e.target.value })}
                  placeholder="e.g. Administer high flow O2, prep 12-lead ECG, bypass to Cath Lab Bay 2"
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTriageModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-lg"
                >
                  Save & Broadcast Triage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Case Realtime Comms Relay Drawer */}
      {selectedCase && (
        <CaseChatDrawer
          isOpen={isCommsOpen}
          onClose={() => setIsCommsOpen(false)}
          caseId={selectedCase.id}
          patientName={selectedCase.patientName}
          currentSession={currentSession}
        />
      )}
    </div>
  );
};
