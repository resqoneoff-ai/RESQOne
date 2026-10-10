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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0E1118] border border-[#DCE3EC] dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FAFBFC] dark:bg-[#161B26] border-b border-[#DCE3EC] dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-ping" />
            <span className="text-xs font-bold tracking-wider text-[#DC2626] uppercase">
              FINAL DISPATCH VERIFICATION
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#596579] hover:text-[#082B5C] dark:text-slate-400 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close summary modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <div className="px-6 pt-5 pb-3">
          <h2 className="text-2xl font-black text-[#082B5C] dark:text-white tracking-tight">
            EMERGENCY REQUEST SUMMARY
          </h2>
          <p className="text-xs text-[#596579] dark:text-slate-400 mt-0.5">
            Review patient details and verified location before starting emergency dispatch.
          </p>
        </div>

        {/* Summary Content Body */}
        <div className="px-6 py-3 space-y-4 overflow-y-auto">
          {/* Main 2-Column Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* PATIENT */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131722] border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-[#596579] dark:text-slate-400 uppercase tracking-wider block mb-1">
                PATIENT
              </span>
              <div className="text-base font-extrabold text-[#082B5C] dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#DC2626]" />
                <span>{data.patientName}</span>
              </div>
              {data.patientAge && (
                <div className="text-xs text-[#596579] dark:text-slate-400 mt-0.5">
                  Age: {data.patientAge}
                </div>
              )}
            </div>

            {/* REQUESTED BY */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131722] border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-[#596579] dark:text-slate-400 uppercase tracking-wider block mb-1">
                REQUESTED BY
              </span>
              <div className="text-base font-bold text-[#082B5C] dark:text-slate-200">
                {data.requesterName}
              </div>
              <div className="text-xs text-[#596579] dark:text-slate-400 mt-0.5">
                Authorized User Account
              </div>
            </div>

            {/* RELATIONSHIP */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131722] border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-[#596579] dark:text-slate-400 uppercase tracking-wider block mb-1">
                RELATIONSHIP
              </span>
              <div className="text-sm font-bold text-[#082B5C] dark:text-white flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FEF2F2] border border-[#DC2626]/20 text-[#DC2626] text-xs font-bold uppercase">
                  {data.relationship}
                </span>
                <span className="text-xs text-[#596579] dark:text-slate-400">
                  {data.relationship === 'Self'
                    ? 'Account Owner'
                    : data.relationship === 'Father' || data.relationship === 'Mother' || data.relationship === 'Spouse' || data.relationship === 'Child' || data.relationship === 'Grandmother' || data.relationship === 'Sibling' || data.relationship === 'Other Relative'
                    ? 'Family Profile'
                    : 'Friend / Other Person'}
                </span>
              </div>
            </div>

            {/* EMERGENCY */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131722] border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-[#596579] dark:text-slate-400 uppercase tracking-wider block mb-1">
                EMERGENCY
              </span>
              <div className="text-sm font-bold text-[#DC2626]">
                {data.emergencyType}
              </div>
              <div className="text-[11px] font-bold text-[#D92D20] mt-0.5">
                {data.severity}
              </div>
            </div>
          </div>

          {/* LOCATION */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131722] border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
            <span className="text-[10px] font-bold text-[#596579] dark:text-slate-400 uppercase tracking-wider block mb-1">
              LOCATION
            </span>
            <div className="flex items-start gap-2 text-sm font-semibold text-[#082B5C] dark:text-white">
              <MapPin className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <div>
                <div>{data.location.address}</div>
                <div className="text-xs text-[#596579] dark:text-slate-400 mt-0.5 font-normal">
                  Source: <strong className="text-[#082B5C] dark:text-slate-300">{data.location.type}</strong>
                  {data.location.details && ` · ${data.location.details}`}
                </div>
              </div>
            </div>
          </div>

          {/* KNOWN MEDICAL INFORMATION */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131722] border border-[#DCE3EC] dark:border-slate-800 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#596579] dark:text-slate-400 uppercase tracking-wider">
                KNOWN MEDICAL INFORMATION
              </span>
              <span className="text-[10px] font-bold text-[#18A66A]">
                {data.knownMedicalInfo.source}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FAFBFC] dark:bg-[#0C0F17] border border-[#DCE3EC] dark:border-slate-800/80">
                <span className="text-[10px] text-[#596579] dark:text-slate-400 font-bold uppercase block">Blood Group:</span>
                <span className={`font-bold ${data.knownMedicalInfo.bloodGroup === 'NOT PROVIDED' ? 'text-slate-400' : 'text-[#082B5C] dark:text-white'}`}>
                  {data.knownMedicalInfo.bloodGroup || 'NOT PROVIDED'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAFBFC] dark:bg-[#0C0F17] border border-[#DCE3EC] dark:border-slate-800/80">
                <span className="text-[10px] text-[#596579] dark:text-slate-400 font-bold uppercase block">Allergies:</span>
                <span className={Array.isArray(data.knownMedicalInfo.allergies) && data.knownMedicalInfo.allergies.length ? 'text-[#D92D20] font-semibold' : 'text-slate-400'}>
                  {Array.isArray(data.knownMedicalInfo.allergies)
                    ? data.knownMedicalInfo.allergies.join(', ')
                    : data.knownMedicalInfo.allergies || 'NOT PROVIDED'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAFBFC] dark:bg-[#0C0F17] border border-[#DCE3EC] dark:border-slate-800/80">
                <span className="text-[10px] text-[#596579] dark:text-slate-400 font-bold uppercase block">Medical Conditions:</span>
                <span className={Array.isArray(data.knownMedicalInfo.conditions) && data.knownMedicalInfo.conditions.length ? 'text-[#DC2626] font-semibold' : 'text-slate-400'}>
                  {Array.isArray(data.knownMedicalInfo.conditions)
                    ? data.knownMedicalInfo.conditions.join(', ')
                    : data.knownMedicalInfo.conditions || 'NOT PROVIDED'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAFBFC] dark:bg-[#0C0F17] border border-[#DCE3EC] dark:border-slate-800/80">
                <span className="text-[10px] text-[#596579] dark:text-slate-400 font-bold uppercase block">Current Medications:</span>
                <span className={Array.isArray(data.knownMedicalInfo.medications) && data.knownMedicalInfo.medications.length ? 'text-[#082B5C] dark:text-slate-200 font-medium' : 'text-slate-400'}>
                  {Array.isArray(data.knownMedicalInfo.medications)
                    ? data.knownMedicalInfo.medications.join(', ')
                    : data.knownMedicalInfo.medications || 'NOT PROVIDED'}
                </span>
              </div>
            </div>

            {data.knownMedicalInfo.alerts && data.knownMedicalInfo.alerts.length > 0 && (
              <div className="p-2.5 rounded-xl bg-[#FFF0EF] border border-[#D92D20]/20 text-xs text-[#D92D20] font-medium">
                <strong className="text-[#D92D20]">Critical Medical Alert: </strong>
                {data.knownMedicalInfo.alerts.join(' · ')}
              </div>
            )}
          </div>

          {/* HOSPITAL PREFERENCE & INSURANCE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* HOSPITAL PREFERENCE */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131722] border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-[#596579] dark:text-slate-400 uppercase tracking-wider block mb-1">
                HOSPITAL PREFERENCE
              </span>
              <div className="text-xs font-bold text-[#082B5C] dark:text-white flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#2F80C9]" />
                <span className="truncate">{data.hospitalPreference?.name || 'Nearest Level 1 Trauma Facility'}</span>
              </div>
              <div className="text-[11px] text-[#596579] dark:text-slate-400 mt-0.5">
                {data.hospitalPreference?.traumaTier || 'Standard Emergency Dispatch Routing'}
              </div>
            </div>

            {/* INSURANCE */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#131722] border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
              <span className="text-[10px] font-bold text-[#596579] dark:text-slate-400 uppercase tracking-wider block mb-1">
                INSURANCE
              </span>
              <div className="text-xs font-bold text-[#082B5C] dark:text-slate-200 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#18A66A]" />
                <span className="truncate">{data.insurance || 'NOT PROVIDED / EMERGENCY INDIGENT'}</span>
              </div>
              <div className="text-[11px] text-[#596579] dark:text-slate-400 mt-0.5">
                Status: {data.insurance && data.insurance !== 'NOT PROVIDED' ? 'Verified on File' : 'Emergency Triage First'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions: Back to Edit & CONFIRM EMERGENCY Primary CTA */}
        <div className="p-6 bg-[#FAFBFC] dark:bg-[#0B0E14] border-t border-[#DCE3EC] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToEdit}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#DCE3EC] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#082B5C] dark:text-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Edit Information</span>
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-white font-extrabold text-sm tracking-wide shadow-md shadow-[#DC2626]/20 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Radio className="w-5 h-5 animate-spin" />
                <span>DISPATCHING EMERGENCY HELP...</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span>CONFIRM EMERGENCY</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
