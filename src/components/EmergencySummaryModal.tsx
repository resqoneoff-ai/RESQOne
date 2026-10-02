import React, { useState } from 'react';
import {
  ShieldAlert,
  MapPin,
  Building,
  CreditCard,
  User,
  HeartPulse,
  AlertTriangle,
  ArrowLeft,
  X,
  Radio,
  Clock,
  Sparkles
} from 'lucide-react';
import { emergencyAudio } from '../utils/audio';

export interface EmergencySummaryData {
  patientName: string;
  requesterName: string;
  relationship: string;
  patientAge?: string | number;
  location: {
    type: 'Live Location' | 'Map Pin' | 'Manual Address';
    address: string;
    lat: number;
    lng: number;
    details?: string;
  };
  emergencyType: string;
  severity: 'CRITICAL (Priority 1)' | 'URGENT (Priority 2)' | 'STANDARD (Priority 3)';
  notes: string;
  consciousness?: string;
  breathing?: string;
  knownMedicalInfo: {
    bloodGroup?: string;
    allergies?: string[] | string;
    conditions?: string[] | string;
    medications?: string[] | string;
    alerts?: string[];
    source: string;
    isFriendOrUnknown?: boolean;
  };
  hospitalPreference?: {
    name: string;
    distance: string;
    traumaTier: string;
  };
  insurance?: string;
}

interface EmergencySummaryModalProps {
  isOpen: boolean;
  data: EmergencySummaryData | null;
  onClose: () => void;
  onBackToEdit: () => void;
  onConfirmDispatch: () => void;
}

export const EmergencySummaryModal: React.FC<EmergencySummaryModalProps> = ({
  isOpen,
  data,
  onClose,
  onBackToEdit,
  onConfirmDispatch
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !data) return null;

  const handleConfirm = () => {
    setIsSubmitting(true);
    emergencyAudio.playDispatchAlert();
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirmDispatch();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0E1118] border-2 border-red-700/80 rounded-2xl shadow-[0_0_50px_rgba(255,43,68,0.25)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-gradient-to-r from-red-950 via-[#161B26] to-[#0E1118] border-b border-red-900/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF2B44] animate-ping" />
            <span className="text-xs font-mono font-bold tracking-widest text-[#FF2B44] uppercase">
              FINAL DISPATCH VERIFICATION
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            aria-label="Close summary modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <div className="px-6 pt-5 pb-3">
          <h2 className="text-2xl font-black text-white tracking-tight">
            EMERGENCY REQUEST SUMMARY
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Review authorized patient record & location before broadcasting to 911 / EMS CAD dispatch.
          </p>
        </div>

        {/* Summary Content Body */}
        <div className="px-6 py-3 space-y-4 overflow-y-auto">
          {/* Main 2-Column Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* PATIENT */}
            <div className="p-3.5 rounded-xl bg-[#131722] border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                PATIENT
              </span>
              <div className="text-base font-black text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#FF2B44]" />
                <span>{data.patientName}</span>
              </div>
              {data.patientAge && (
                <div className="text-xs text-slate-400 mt-0.5">
                  Age: {data.patientAge}
                </div>
              )}
            </div>

            {/* REQUESTED BY */}
            <div className="p-3.5 rounded-xl bg-[#131722] border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                REQUESTED BY
              </span>
              <div className="text-base font-bold text-slate-200">
                {data.requesterName}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Authorized User Account
              </div>
            </div>

            {/* RELATIONSHIP */}
            <div className="p-3.5 rounded-xl bg-[#131722] border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                RELATIONSHIP
              </span>
              <div className="text-sm font-black text-white flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-red-950/80 border border-red-800/80 text-[#FF2B44] text-xs font-mono font-bold uppercase">
                  {data.relationship}
                </span>
                <span className="text-xs text-slate-400">
                  {data.relationship === 'Self'
                    ? 'Account Owner'
                    : data.relationship === 'Father' || data.relationship === 'Mother' || data.relationship === 'Spouse' || data.relationship === 'Child' || data.relationship === 'Grandmother' || data.relationship === 'Sibling' || data.relationship === 'Other Relative'
                    ? 'Family Profile'
                    : 'Friend / Other Person'}
                </span>
              </div>
            </div>

            {/* EMERGENCY */}
            <div className="p-3.5 rounded-xl bg-[#131722] border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                EMERGENCY
              </span>
              <div className="text-sm font-bold text-red-300">
                {data.emergencyType}
              </div>
              <div className="text-[11px] font-mono font-bold text-red-500 mt-0.5">
                {data.severity}
              </div>
            </div>
          </div>

          {/* LOCATION */}
          <div className="p-3.5 rounded-xl bg-[#131722] border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
              LOCATION
            </span>
            <div className="flex items-start gap-2 text-sm font-semibold text-white">
              <MapPin className="w-4 h-4 text-[#FF2B44] shrink-0 mt-0.5" />
              <div>
                <div>{data.location.address}</div>
                <div className="text-xs text-slate-400 mt-0.5 font-normal">
                  Source: <strong className="text-slate-300">{data.location.type}</strong>
                  {data.location.details && ` · ${data.location.details}`}
                </div>
              </div>
            </div>
          </div>

          {/* KNOWN MEDICAL INFORMATION */}
          <div className="p-3.5 rounded-xl bg-[#131722] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                KNOWN MEDICAL INFORMATION
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                {data.knownMedicalInfo.source}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#0C0F17] border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Blood Group:</span>
                <span className={`font-mono font-bold ${data.knownMedicalInfo.bloodGroup === 'NOT PROVIDED' ? 'text-slate-400' : 'text-white'}`}>
                  {data.knownMedicalInfo.bloodGroup || 'NOT PROVIDED'}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[#0C0F17] border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Allergies:</span>
                <span className={Array.isArray(data.knownMedicalInfo.allergies) && data.knownMedicalInfo.allergies.length ? 'text-red-300 font-semibold' : 'text-slate-400 font-mono'}>
                  {Array.isArray(data.knownMedicalInfo.allergies)
                    ? data.knownMedicalInfo.allergies.join(', ')
                    : data.knownMedicalInfo.allergies || 'NOT PROVIDED'}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[#0C0F17] border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Medical Conditions:</span>
                <span className={Array.isArray(data.knownMedicalInfo.conditions) && data.knownMedicalInfo.conditions.length ? 'text-amber-200' : 'text-slate-400 font-mono'}>
                  {Array.isArray(data.knownMedicalInfo.conditions)
                    ? data.knownMedicalInfo.conditions.join(', ')
                    : data.knownMedicalInfo.conditions || 'NOT PROVIDED'}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[#0C0F17] border border-slate-800/80">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Medications:</span>
                <span className={Array.isArray(data.knownMedicalInfo.medications) && data.knownMedicalInfo.medications.length ? 'text-slate-200' : 'text-slate-400 font-mono'}>
                  {Array.isArray(data.knownMedicalInfo.medications)
                    ? data.knownMedicalInfo.medications.join(', ')
                    : data.knownMedicalInfo.medications || 'NOT PROVIDED'}
                </span>
              </div>
            </div>

            {data.knownMedicalInfo.alerts && data.knownMedicalInfo.alerts.length > 0 && (
              <div className="p-2 rounded-lg bg-red-950/40 border border-red-900/60 text-xs text-red-200">
                <strong className="text-red-400">Critical Medical Alert: </strong>
                {data.knownMedicalInfo.alerts.join(' · ')}
              </div>
            )}
          </div>

          {/* HOSPITAL PREFERENCE & INSURANCE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* HOSPITAL PREFERENCE */}
            <div className="p-3.5 rounded-xl bg-[#131722] border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                HOSPITAL PREFERENCE
              </span>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-400" />
                <span className="truncate">{data.hospitalPreference?.name || 'Nearest Level 1 Trauma Facility'}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {data.hospitalPreference?.traumaTier || 'Standard Emergency Dispatch Routing'}
              </div>
            </div>

            {/* INSURANCE */}
            <div className="p-3.5 rounded-xl bg-[#131722] border border-slate-800">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                INSURANCE
              </span>
              <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate">{data.insurance || 'NOT PROVIDED / EMERGENCY INDIGENT'}</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Status: {data.insurance && data.insurance !== 'NOT PROVIDED' ? 'Verified on File' : 'Emergency Triage First'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions: Back to Edit & CONFIRM EMERGENCY Primary CTA */}
        <div className="p-6 bg-[#0B0E14] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToEdit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Edit Information</span>
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#FF2B44] via-red-600 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-black text-sm tracking-widest uppercase shadow-[0_0_35px_rgba(255,43,68,0.5)] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/20"
          >
            {isSubmitting ? (
              <>
                <Radio className="w-5 h-5 animate-spin" />
                <span>DISPATCHING 911 / EMS CAD...</span>
              </>
            ) : (
              <>
                <span className="w-3 h-3 rounded-full bg-white animate-ping" />
                <span>CONFIRM EMERGENCY</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
