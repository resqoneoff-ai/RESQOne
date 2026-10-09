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
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E121B] border border-[#DCE3EC] dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#EAF4FF] text-[#2F80C9] border border-[#2F80C9]/30 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-extrabold text-[#082B5C] dark:text-white tracking-tight">{currentHospital.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF4FF] text-[#082B5C] border border-[#2F80C9]/30">
                {currentHospital.traumaLevel}
              </span>
              <span className="text-[10px] text-[#18A66A] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#18A66A] animate-ping" />
                ACCEPTING INCOMING EMS
              </span>
            </div>
            <p className="text-xs text-[#596579] dark:text-slate-400 mt-0.5">
              Entrance: {currentHospital.bayEntrance} · Direct ED Phone: {currentHospital.emergencyPhone}
            </p>
          </div>
        </div>

        <button
          onClick={onBackToApp}
          className="text-xs text-[#596579] hover:text-[#082B5C] dark:text-slate-400 dark:hover:text-white px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700 border border-[#DCE3EC] dark:border-slate-700 transition-colors font-bold"
        >
          Switch Portal
        </button>
      </div>

      {/* Bay Capacity Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-black/40 border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
          <div className="text-[10px] text-[#596579] uppercase font-bold">Total Resuscitation Bays</div>
          <div className="text-xl font-bold text-[#082B5C] dark:text-white mt-0.5 font-mono">{currentHospital.totalTraumaBays}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-black/40 border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
          <div className="text-[10px] text-[#596579] uppercase font-bold">Occupied Bays</div>
          <div className="text-xl font-bold text-[#F36C21] mt-0.5 font-mono">{currentHospital.occupiedBays}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-black/40 border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
          <div className="text-[10px] text-[#596579] uppercase font-bold">Available Bays</div>
          <div className="text-xl font-bold text-[#18A66A] mt-0.5 font-mono">
            {currentHospital.totalTraumaBays - currentHospital.occupiedBays}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-black/40 border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
          <div className="text-[10px] text-[#596579] uppercase font-bold">Incoming Inbound EMS</div>
          <div className="text-xl font-bold text-[#D92D20] mt-0.5 font-mono">{incomingCases.length}</div>
        </div>
      </div>

      {/* Main Grid: Incoming Cases + Case Trauma View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Inbound Ambulances */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0E121B] border border-[#DCE3EC] dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#082B5C] dark:text-slate-200 flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#2F80C9] animate-pulse" />
                <span>Inbound Trauma Pre-Alerts</span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAF4FF] text-[#082B5C] font-bold">{incomingCases.length} Inbound</span>
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
                        ? 'bg-[#EAF4FF] dark:bg-slate-800/90 border-[#2F80C9] shadow-xs ring-1 ring-[#2F80C9]/30'
                        : 'bg-[#FAFBFC] dark:bg-[#121622]/80 hover:bg-slate-100 dark:hover:bg-[#161C2C] border-[#DCE3EC] dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#082B5C] dark:text-white">{c.id}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFF0EF] text-[#D92D20] border border-[#D92D20]/20 font-bold">
                        ETA: {c.ambulance.etaMinutes}m
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold text-[#082B5C] dark:text-slate-200">{c.patientName}</div>
                      <div className="text-[11px] text-[#596579] dark:text-slate-400 line-clamp-1">{c.emergency.type}</div>
                    </div>

                    <div className="text-[10px] text-[#596579] dark:text-slate-400 pt-1 border-t border-[#DCE3EC] dark:border-slate-800/80 flex items-center justify-between">
                      <span>Unit: {c.ambulance.unitId}</span>
                      <span className="text-[#18A66A] font-bold">{c.hospital.allocatedBay}</span>
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
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E121B] border border-[#DCE3EC] dark:border-slate-800 shadow-xs space-y-5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE3EC] dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-[#082B5C] dark:text-white">{selectedCase.id}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFF0EF] text-[#D92D20] border border-[#D92D20]/20 font-bold">
                      {selectedCase.emergency.severity}
                    </span>
                    <span className="text-xs text-[#596579] dark:text-slate-400">ETA: {selectedCase.ambulance.etaMinutes} mins</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-[#082B5C] dark:text-white mt-1">
                    {selectedCase.patientName} ({selectedCase.patientAge || 'Adult'})
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCommsOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#082B5C] dark:text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-[#DCE3EC] dark:border-slate-700 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#2F80C9]" />
                    <span>ED Comms</span>
                  </button>

                  <button
                    onClick={() => handleAcceptCase('Trauma Bay 2 (Prepped)')}
                    className="px-4 py-2 rounded-xl bg-[#F36C21] hover:bg-[#FF7A00] text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Confirm & Prep Bay
                  </button>
                </div>
              </div>

              {/* Trauma Bay Allocation Control */}
              <div className="p-4 rounded-xl bg-[#FAFBFC] dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#082B5C] dark:text-slate-200 uppercase tracking-wider">
                    Allocate ED Trauma Resuscitation Bay
                  </span>
                  <span className="text-[11px] font-bold text-[#18A66A]">
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
                            ? 'bg-[#082B5C] border-[#082B5C] text-white shadow-xs'
                            : 'bg-white hover:bg-slate-100 border-[#DCE3EC] dark:bg-black/40 dark:border-slate-800 text-[#596579] dark:text-slate-300'
                        }`}
                      >
                        {bay}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Authorized Medical Passport (Protected View) */}
              <div className="p-4 rounded-xl bg-[#FAFBFC] dark:bg-black/40 border border-[#DCE3EC] dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#082B5C] dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#18A66A]" />
                    <span>Authorized Pre-Arrival Medical Payload</span>
                  </h3>
                  <span className="text-[10px] text-[#596579] dark:text-slate-400 font-semibold">
                    Source: {selectedCase.medicalInfo.sourceLabel}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#121622] border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
                    <strong className="text-[#596579] text-[10px] block uppercase font-bold">Blood Type</strong>
                    <span className="text-[#082B5C] dark:text-white font-mono font-bold">
                      {selectedCase.medicalInfo.bloodGroup || 'NOT PROVIDED'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#121622] border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
                    <strong className="text-[#D92D20] text-[10px] block uppercase font-bold">Allergies</strong>
                    <span className="text-[#172033] dark:text-slate-200">
                      {selectedCase.medicalInfo.allergies.join(', ') || 'None reported'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#121622] border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
                    <strong className="text-[#F36C21] text-[10px] block uppercase font-bold">Medical Conditions</strong>
                    <span className="text-[#172033] dark:text-slate-200">
                      {selectedCase.medicalInfo.medicalConditions.join(', ') || 'None provided'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#121622] border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
                    <strong className="text-[#2F80C9] text-[10px] block uppercase font-bold">Current Medications</strong>
                    <span className="text-[#172033] dark:text-slate-200">
                      {selectedCase.medicalInfo.medications.join(', ') || 'None provided'}
                    </span>
                  </div>
                </div>

                {selectedCase.medicalInfo.medicalAlerts && selectedCase.medicalInfo.medicalAlerts.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-[#FFF0EF] border border-[#D92D20]/20 text-xs text-[#D92D20]">
                    <strong className="text-[10px] font-bold uppercase text-[#D92D20] block mb-1">
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
                    className="px-4 py-2.5 rounded-xl bg-[#082B5C] hover:bg-[#061C3D] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4 text-[#18A66A]" />
                    <span>Confirm Ambulance Bay Arrival</span>
                  </button>

                  <button
                    onClick={handleConfirmHandover}
                    className="px-4 py-2.5 rounded-xl bg-[#18A66A] hover:bg-emerald-600 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Certify Handover & Admit</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white dark:bg-[#0E121B] border border-[#DCE3EC] dark:border-slate-800 text-center text-[#596579] dark:text-slate-400">
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
