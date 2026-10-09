import React, { useState, useEffect } from 'react';
import {
  Ambulance,
  Radio,
  MapPin,
  Clock,
  PhoneCall,
  ShieldAlert,
  Building2,
  Stethoscope,
  ChevronRight,
  Send,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Navigation,
  Activity,
  Layers,
  MessageSquare
} from 'lucide-react';
import { EmergencyCase } from '../../types/emergency';
import {
  AmbulanceRecord,
  DoctorRecord,
  HospitalRecord,
  AmbulanceStatus,
  AppUserSession,
  EmergencyStatus
} from '../../types/roles';
import { emergencyService } from '../../services/emergencyService';
import { CaseChatDrawer } from './CaseChatDrawer';

interface OperationsPortalProps {
  currentSession: AppUserSession;
  onBackToApp: () => void;
}

export const OperationsPortal: React.FC<OperationsPortalProps> = ({ currentSession, onBackToApp }) => {
  const [activeCases, setActiveCases] = useState<EmergencyCase[]>([]);
  const [ambulances, setAmbulances] = useState<AmbulanceRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [hospitals, setHospitals] = useState<HospitalRecord[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isCommsOpen, setIsCommsOpen] = useState(false);

  const loadData = () => {
    setActiveCases(emergencyService.getAllCases());
    setAmbulances(emergencyService.getAmbulances());
    setDoctors(emergencyService.getDoctors());
    setHospitals(emergencyService.getHospitals());
    if (!selectedCaseId) {
      const cases = emergencyService.getAllCases();
      if (cases.length > 0) setSelectedCaseId(cases[0].id);
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

  const availableAmbulances = ambulances.filter((a) => a.status === 'AVAILABLE');
  const activeAmbulances = ambulances.filter((a) => a.status !== 'AVAILABLE' && a.status !== 'OFFLINE');
  const availableDoctors = doctors.filter((d) => d.availability === 'AVAILABLE');

  const handleAssignAmbulance = (ambulanceId: string) => {
    if (!selectedCase) return;
    emergencyService.assignAmbulance(selectedCase.id, ambulanceId, {
      id: currentSession.id,
      name: currentSession.fullName,
      role: 'AMBULANCE_OPERATOR'
    });
  };

  const handleUpdateAmbulanceStatus = (ambId: string, status: AmbulanceStatus) => {
    emergencyService.updateAmbulanceStatus(ambId, status);
  };

  const handleAssignDoctor = (doctorId: string) => {
    if (!selectedCase) return;
    emergencyService.assignDoctor(selectedCase.id, doctorId, {
      id: currentSession.id,
      name: currentSession.fullName,
      role: 'AMBULANCE_OPERATOR'
    });
  };

  const handleSelectHospital = (hospitalId: string, bay: string) => {
    if (!selectedCase) return;
    emergencyService.selectHospital(selectedCase.id, hospitalId, bay, {
      id: currentSession.id,
      name: currentSession.fullName,
      role: 'AMBULANCE_OPERATOR'
    });
  };

  const handleAdvanceStatus = (status: EmergencyStatus) => {
    if (!selectedCase) return;
    emergencyService.updateCaseStatus(selectedCase.id, status, {
      id: currentSession.id,
      name: currentSession.fullName,
      role: 'AMBULANCE_OPERATOR'
    });
  };

  return (
    <div className="space-y-6">
      {/* CAD Header & KPIs */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0E121B] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Ambulance className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  CAD Emergency Fleet & Operations
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 font-bold">
                  <Radio className="w-3 h-3 animate-pulse" />
                  <span>LIVE CAD DISPATCH</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as: {currentSession.fullName} · San Francisco Central CAD Hub
              </p>
            </div>
          </div>

          <button
            onClick={onBackToApp}
            className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            Switch Portal
          </button>
        </div>

        {/* Operational Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Active Emergencies</div>
            <div className="text-xl font-mono font-bold text-red-400 mt-0.5">{activeCases.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Available Units</div>
            <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
              {availableAmbulances.length}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">En Route / Scene</div>
            <div className="text-xl font-mono font-bold text-amber-400 mt-0.5">{activeAmbulances.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Available Doctors</div>
            <div className="text-xl font-mono font-bold text-blue-400 mt-0.5">{availableDoctors.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Trauma Centers Online</div>
            <div className="text-xl font-mono font-bold text-purple-400 mt-0.5">{hospitals.length}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Incidents (4 cols) & Dispatch Console (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Incidents */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-[#0E121B] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-400" />
                <span>Active CAD Incidents</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400">{activeCases.length} Cases</span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {activeCases.map((c) => {
                const isSelected = c.id === selectedCase?.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all space-y-2 ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-500 shadow-lg ring-1 ring-amber-500/30'
                        : 'bg-[#121622]/80 hover:bg-[#161C2C] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">{c.id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-amber-400 border border-amber-800 font-bold">
                        {c.ambulance.status}
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        {c.patientName}{' '}
                        <span className="text-[11px] font-normal text-slate-400">({c.relationship})</span>
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{c.emergency.type}</div>
                    </div>

                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                      <span>Unit: {c.ambulance.unitId}</span>
                      <span className="font-mono text-red-400">ETA: {c.ambulance.etaMinutes}m</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fleet Status Card */}
          <div className="p-4 rounded-2xl bg-[#0E121B] border border-slate-800 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Ambulance className="w-4 h-4 text-amber-400" />
              <span>Fleet Availability</span>
            </h2>

            <div className="space-y-2">
              {ambulances.map((amb) => (
                <div key={amb.id} className="p-2.5 rounded-xl bg-black/40 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-white font-mono">{amb.unitId}</strong>
                    <select
                      value={amb.status}
                      onChange={(e) => handleUpdateAmbulanceStatus(amb.id, e.target.value as AmbulanceStatus)}
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border bg-black ${
                        amb.status === 'AVAILABLE'
                          ? 'text-emerald-400 border-emerald-800'
                          : 'text-amber-400 border-amber-800'
                      }`}
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="EN_ROUTE">EN ROUTE</option>
                      <option value="ARRIVING">ARRIVING</option>
                      <option value="ON_SCENE">ON SCENE</option>
                      <option value="PATIENT_PICKED_UP">PICKED UP</option>
                      <option value="AT_HOSPITAL">AT HOSPITAL</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="OFFLINE">OFFLINE</option>
                    </select>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {amb.driverParamedic} & {amb.leadMedic} · {amb.vehicleType}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">{amb.currentAddress}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Case Dispatch Console & Routing Control */}
        <div className="lg:col-span-8 space-y-5">
          {selectedCase ? (
            <div className="p-5 rounded-2xl bg-[#0E121B] border border-slate-800 space-y-5 shadow-xl">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-white">{selectedCase.id}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 font-bold">
                      {selectedCase.emergency.severity}
                    </span>
                    <span className="text-xs text-slate-400">Stage: {selectedCase.currentStage}</span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    {selectedCase.patientName} — {selectedCase.emergency.type}
                  </h2>
                </div>

                <button
                  onClick={() => setIsCommsOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  <span>Open CAD Relay</span>
                </button>
              </div>

              {/* Patient Location & Ambulance Position */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#FF2B44]" />
                    <span>Patient Pickup Address</span>
                  </span>
                  <p className="text-sm font-semibold text-white">{selectedCase.location?.address || 'Pickup location on file'}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Lat: {selectedCase.location?.lat ? selectedCase.location.lat.toFixed(4) : 'N/A'}, Lng: {selectedCase.location?.lng ? selectedCase.location.lng.toFixed(4) : 'N/A'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-amber-400" />
                    <span>Assigned Ambulance Unit</span>
                  </span>
                  <p className="text-sm font-semibold text-white">
                    {selectedCase.ambulance.unitId} ({selectedCase.ambulance.status})
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Crew: {selectedCase.ambulance.driverParamedic} · {selectedCase.ambulance.medic}
                  </p>
                </div>
              </div>

              {/* Status Progression Bar */}
              <div className="p-4 rounded-xl bg-[#141824] border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                  Enforce Operational Status Transition
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleAdvanceStatus('AMBULANCE_EN_ROUTE')}
                    className="p-2 rounded-lg bg-black/40 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-700 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    1. En Route
                  </button>
                  <button
                    onClick={() => handleAdvanceStatus('AMBULANCE_ARRIVING')}
                    className="p-2 rounded-lg bg-black/40 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-700 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    2. Arrived Scene
                  </button>
                  <button
                    onClick={() => handleAdvanceStatus('PATIENT_PICKED_UP')}
                    className="p-2 rounded-lg bg-black/40 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-700 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    3. Patient Picked Up
                  </button>
                  <button
                    onClick={() => handleAdvanceStatus('PATIENT_ARRIVED')}
                    className="p-2 rounded-lg bg-black/40 hover:bg-purple-950/60 border border-slate-800 hover:border-purple-700 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    4. At Trauma Bay
                  </button>
                </div>
              </div>

              {/* Operational Control Tabs: Reassign Ambulance, Reassign Doctor, Select Hospital */}
              <div className="space-y-4">
                {/* Ambulance Dispatch Reassign */}
                <div className="p-4 rounded-xl bg-[#141824] border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Ambulance className="w-4 h-4 text-amber-400" />
                    <span>Assign / Reassign Ambulance Fleet Unit</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ambulances.map((amb) => (
                      <div
                        key={amb.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          selectedCase.ambulance.unitId === amb.unitId
                            ? 'bg-amber-950/40 border-amber-700'
                            : 'bg-black/40 border-slate-800'
                        }`}
                      >
                        <div>
                          <strong className="text-white block font-mono">{amb.unitId}</strong>
                          <span className="text-[11px] text-slate-400">{amb.driverParamedic} · {amb.status}</span>
                        </div>
                        {selectedCase.ambulance.unitId === amb.unitId ? (
                          <span className="text-amber-400 font-bold text-[10px]">CURRENT</span>
                        ) : (
                          <button
                            onClick={() => handleAssignAmbulance(amb.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px]"
                          >
                            Assign
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doctor Telemetry Reassign */}
                <div className="p-4 rounded-xl bg-[#141824] border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-emerald-400" />
                    <span>Emergency Physician Telemetry Assignment</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {doctors.map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          selectedCase.doctor.name === doc.name
                            ? 'bg-emerald-950/40 border-emerald-700'
                            : 'bg-black/40 border-slate-800'
                        }`}
                      >
                        <div>
                          <strong className="text-white block">{doc.name}</strong>
                          <span className="text-[11px] text-slate-400">{doc.specialization}</span>
                        </div>
                        {selectedCase.doctor.name === doc.name ? (
                          <span className="text-emerald-400 font-bold text-[10px]">CONNECTED</span>
                        ) : (
                          <button
                            onClick={() => handleAssignDoctor(doc.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px]"
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hospital Pre-notification & Routing */}
                <div className="p-4 rounded-xl bg-[#141824] border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-purple-400" />
                    <span>Pre-Notify Destination Trauma Hospital</span>
                  </h3>

                  <div className="space-y-2">
                    {hospitals.map((hosp) => (
                      <div
                        key={hosp.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                          selectedCase.hospital.name === hosp.name
                            ? 'bg-purple-950/40 border-purple-700'
                            : 'bg-black/40 border-slate-800'
                        }`}
                      >
                        <div>
                          <strong className="text-white block">{hosp.name}</strong>
                          <span className="text-[11px] text-slate-400">
                            {hosp.traumaLevel} · {hosp.totalTraumaBays - hosp.occupiedBays} Bays Open
                          </span>
                        </div>
                        {selectedCase.hospital.name === hosp.name ? (
                          <span className="text-purple-400 font-bold text-[10px]">PRE-NOTIFIED</span>
                        ) : (
                          <button
                            onClick={() => handleSelectHospital(hosp.id, 'Trauma Bay 1 (Pre-Allocated)')}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px]"
                          >
                            Pre-Notify Bay
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#0E121B] border border-slate-800 text-center text-slate-400">
              Select an incident from the CAD queue.
            </div>
          )}
        </div>
      </div>

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
