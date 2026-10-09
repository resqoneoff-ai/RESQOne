import React from 'react';
import { EmergencyCase } from '../types/emergency';
import { FileText, CheckCircle2, ShieldCheck, Printer, Download, X, Building, User, Clock } from 'lucide-react';

interface HandoverReportModalProps {
  isOpen: boolean;
  emergencyCase: EmergencyCase;
  onClose: () => void;
}

export const HandoverReportModal: React.FC<HandoverReportModalProps> = ({
  isOpen,
  emergencyCase,
  onClose
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0F131D] border-2 border-emerald-600/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-950/40 border-b border-emerald-800/60">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="text-sm font-black text-white uppercase tracking-wider">
                OFFICIAL PATIENT HANDOVER REPORT
              </span>
              <span className="text-xs font-mono text-emerald-400 ml-2">
                #{emergencyCase.id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-slate-200 text-xs">
          {/* Top Lockup */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <h2 className="text-xl font-black text-white">RESQ ONE CLINICAL HANDOVER SUMMARY</h2>
              <p className="text-slate-400 mt-0.5">
                Timestamp: {new Date().toLocaleString()} · CAD Dispatch Unit: {emergencyCase.ambulance.unitId}
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-mono font-bold text-center">
              STATUS: HANDOVER COMPLETED
            </div>
          </div>

          {/* Patient & Incident Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#141824] border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">PATIENT</span>
              <div className="text-sm font-bold text-white">{emergencyCase.patientName}</div>
              <div className="text-slate-400 mt-0.5">
                Relation: {emergencyCase.relationship} · Age: {emergencyCase.patientAge || 'Reported'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#141824] border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">REQUESTED BY</span>
              <div className="text-sm font-bold text-white">{emergencyCase.requesterName}</div>
              <div className="text-slate-400 mt-0.5">Direct SOS Confirmation</div>
            </div>

            <div className="p-3 rounded-xl bg-[#141824] border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">EMERGENCY CLASSIFICATION</span>
              <div className="text-sm font-bold text-red-300">{emergencyCase.emergency.type}</div>
              <div className="text-red-400 font-mono mt-0.5">{emergencyCase.emergency.severity}</div>
            </div>
          </div>

          {/* Location & Transfer Logistics */}
          <div className="p-3.5 rounded-xl bg-[#141824] border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">TRANSFER LOGISTICS</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Scene Location:</span>
                <span className="text-white font-medium">{emergencyCase.location?.address || 'Incident Scene'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Receiving Facility:</span>
                <span className="text-emerald-300 font-medium">
                  {emergencyCase.hospital.name} ({emergencyCase.hospital.allocatedBay})
                </span>
              </div>
            </div>
          </div>

          {/* Medical Records Transferred */}
          <div className="p-3.5 rounded-xl bg-[#141824] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase">CONFIRMED MEDICAL DATA AT HANDOVER</span>
              <span className="text-[10px] text-emerald-400 font-mono">{emergencyCase.medicalInfo.sourceLabel}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
              <div className="p-2 bg-[#0C0F17] rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">BLOOD GROUP:</span>
                <span className="text-white font-bold">{emergencyCase.medicalInfo.bloodGroup}</span>
              </div>
              <div className="p-2 bg-[#0C0F17] rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">ALLERGIES:</span>
                <span className="text-red-300 font-bold truncate block">
                  {emergencyCase.medicalInfo.allergies.join(', ')}
                </span>
              </div>
              <div className="p-2 bg-[#0C0F17] rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">CONDITIONS:</span>
                <span className="text-amber-300 font-bold truncate block">
                  {emergencyCase.medicalInfo.medicalConditions.join(', ')}
                </span>
              </div>
              <div className="p-2 bg-[#0C0F17] rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">INSURANCE:</span>
                <span className="text-slate-200 font-bold truncate block">
                  {emergencyCase.insurance}
                </span>
              </div>
            </div>
          </div>

          {/* Paramedic & Receiving Physician Sign-off */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-[#141824] border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                DISPATCH PARAMEDIC CREW SIGN-OFF
              </span>
              <div className="font-semibold text-white">{emergencyCase.ambulance.medic}</div>
              <div className="text-slate-400 text-[11px]">{emergencyCase.ambulance.driverParamedic}</div>
              <div className="mt-2 text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Vitals Stabilized & Scene Secure</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141824] border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                RECEIVING HOSPITAL ATTENDING PHYSICIAN
              </span>
              <div className="font-semibold text-white">{emergencyCase.hospital.leadSurgeonPhysician}</div>
              <div className="text-slate-400 text-[11px]">{emergencyCase.hospital.receivingDepartment}</div>
              <div className="mt-2 text-emerald-400 text-[11px] font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Patient Admitted to Bay</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#0A0D13] border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Close Summary
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Handover Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
