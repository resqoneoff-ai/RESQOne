import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Ambulance,
  Stethoscope,
  ShieldCheck,
  Activity,
  Layers,
  HeartPulse,
  Radio,
  FileCheck,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import { EmergencyCase } from '../../types/emergency';
import { HospitalRecord, AppUserSession } from '../../types/roles';
import { emergencyService } from '../../services/emergencyService';
import { CaseChatDrawer } from './CaseChatDrawer';

interface HospitalPortalProps {
  currentSession: AppUserSession;
  onBackToApp: () => void;
}

export const HospitalPortal: React.FC<HospitalPortalProps> = ({ currentSession, onBackToApp }) => {
  const [hospitals, setHospitals] = useState<HospitalRecord[]>([]);
  const [activeCases, setActiveCases] = useState<EmergencyCase[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isCommsOpen, setIsCommsOpen] = useState(false);

  const loadData = () => {
    const hosps = emergencyService.getHospitals();
    setHospitals(hosps);
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

  const currentHospital = hospitals[0] || {
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
  };

  const selectedCase = activeCases.find((c) => c.id === selectedCaseId) || activeCases[0] || null;

  // Hospital-assigned or incoming cases
  const incomingCases = activeCases.filter((c) => c.currentStage !== 'COMPLETED');
  const arrivedCases = activeCases.filter((c) => ['HOSPITAL', 'HANDOVER'].includes(c.currentStage));

  const handleAcceptCase = (bayName: string) => {
    if (!selectedCase) return;
    emergencyService.selectHospital(selectedCase.id, currentHospital.id, bayName, {
      id: currentSession.id,
      name: currentHospital.name,
      role: 'HOSPITAL'
    });
  };

  const handleConfirmArrival = () => {
    if (!selectedCase) return;
    emergencyService.updateCaseStatus(selectedCase.id, 'PATIENT_ARRIVED', {
      id: currentSession.id,
      name: currentHospital.name,
      role: 'HOSPITAL'
    });
  };

  const handleConfirmHandover = () => {
    if (!selectedCase) return;
    emergencyService.completeHandover(
      selectedCase.id,
      {
        paramedicSign: selectedCase.ambulance.driverParamedic || 'ALS Medic Team',
        receivingDoctor: 'ED Attending Physician',
        clinicalSummary: `Handover accepted and verified at ${currentHospital.name}. Patient stabilized in trauma bay.`
      },
      {
        id: currentSession.id,
        name: currentHospital.name,
        role: 'HOSPITAL'
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Hospital Intake Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0E121B] border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-white tracking-tight">{currentHospital.name}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-bold">
                {currentHospital.traumaLevel}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                ● ACCEPTING INCOMING EMS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Entrance: {currentHospital.bayEntrance} · Direct ED Phone: {currentHospital.emergencyPhone}
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

      {/* Bay Capacity Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Total Resuscitation Bays</div>
          <div className="text-xl font-mono font-bold text-white mt-0.5">{currentHospital.totalTraumaBays}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Occupied Bays</div>
          <div className="text-xl font-mono font-bold text-amber-400 mt-0.5">{currentHospital.occupiedBays}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Available Bays</div>
          <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
            {currentHospital.totalTraumaBays - currentHospital.occupiedBays}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase">Incoming Inbound EMS</div>
          <div className="text-xl font-mono font-bold text-red-400 mt-0.5">{incomingCases.length}</div>
        </div>
      </div>

      {/* Main Grid: Incoming Cases + Case Trauma View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Inbound Ambulances */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-[#0E121B] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>Inbound Trauma Pre-Alerts</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400">{incomingCases.length} Inbound</span>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {incomingCases.map((c) => {
                const isSelected = c.id === selectedCase?.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCaseId(c.id)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all space-y-2 ${
                      isSelected
                        ? 'bg-slate-800/90 border-purple-500 shadow-lg ring-1 ring-purple-500/30'
                        : 'bg-[#121622]/80 hover:bg-[#161C2C] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-white">{c.id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-red-400 border border-red-800 font-bold">
                        ETA: {c.ambulance.etaMinutes}m
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-slate-200">{c.patientName}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{c.emergency.type}</div>
                    </div>

                    <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                      <span>Unit: {c.ambulance.unitId}</span>
                      <span className="text-emerald-400 font-bold">{c.hospital.allocatedBay}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Trauma Bay Preparation & Handover */}
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
                    <span className="text-xs text-slate-400">ETA: {selectedCase.ambulance.etaMinutes} mins</span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    {selectedCase.patientName} ({selectedCase.patientAge || 'Adult'})
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCommsOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                    <span>ED Comms</span>
                  </button>

                  <button
                    onClick={() => handleAcceptCase('Trauma Bay 2 (Prepped)')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md"
                  >
                    Confirm & Prep Bay
                  </button>
                </div>
              </div>

              {/* Trauma Bay Allocation Control */}
              <div className="p-4 rounded-xl bg-[#141824] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Allocate ED Trauma Resuscitation Bay
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    Assigned: {selectedCase.hospital.allocatedBay}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Trauma Bay 1 (STEMI/Cardiac)', 'Trauma Bay 2 (Acute Resus)', 'Trauma Bay 3 (Neuro/Stroke)', 'Cath Lab Bay 2'].map(
                    (bay) => (
                      <button
                        key={bay}
                        onClick={() => handleAcceptCase(bay)}
                        className={`p-2 rounded-lg text-xs font-semibold border transition-colors ${
                          selectedCase.hospital.allocatedBay === bay
                            ? 'bg-purple-950/80 border-purple-600 text-white'
                            : 'bg-black/40 hover:bg-slate-800 border-slate-800 text-slate-300'
                        }`}
                      >
                        {bay}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Authorized Medical Passport (Protected View) */}
              <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Authorized Pre-Arrival Medical Payload</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    Source: {selectedCase.medicalInfo.sourceLabel}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-[#121622] border border-slate-800">
                    <strong className="text-slate-400 text-[10px] block uppercase">Blood Type</strong>
                    <span className="text-white font-mono font-bold">
                      {selectedCase.medicalInfo.bloodGroup || 'NOT PROVIDED'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#121622] border border-slate-800">
                    <strong className="text-red-400 text-[10px] block uppercase">Allergies</strong>
                    <span className="text-slate-200">
                      {selectedCase.medicalInfo.allergies.join(', ') || 'None reported'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#121622] border border-slate-800">
                    <strong className="text-amber-400 text-[10px] block uppercase">Medical Conditions</strong>
                    <span className="text-slate-200">
                      {selectedCase.medicalInfo.medicalConditions.join(', ') || 'None provided'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#121622] border border-slate-800">
                    <strong className="text-blue-400 text-[10px] block uppercase">Current Medications</strong>
                    <span className="text-slate-200">
                      {selectedCase.medicalInfo.medications.join(', ') || 'None provided'}
                    </span>
                  </div>
                </div>

                {selectedCase.medicalInfo.medicalAlerts && selectedCase.medicalInfo.medicalAlerts.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/60 text-xs text-red-200">
                    <strong className="text-[10px] font-bold uppercase text-red-300 block mb-1">
                      Critical Clinical Alerts:
                    </strong>
                    <ul className="list-disc list-inside space-y-0.5">
                      {selectedCase.medicalInfo.medicalAlerts.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Handover & Actions */}
              <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleConfirmArrival}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-md flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm Ambulance Bay Arrival</span>
                  </button>

                  <button
                    onClick={handleConfirmHandover}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-md flex items-center gap-1.5"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Certify Handover & Admit</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#0E121B] border border-slate-800 text-center text-slate-400">
              No emergency case selected.
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
