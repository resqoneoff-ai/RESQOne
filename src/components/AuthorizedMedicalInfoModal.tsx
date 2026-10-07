import React from 'react';
import { X, ShieldCheck, Heart, AlertTriangle, Pill, Activity, FileText } from 'lucide-react';
import { EmergencyCase } from '../types/emergency';
import { useTheme } from '../context/ThemeContext';

interface AuthorizedMedicalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergencyCase: EmergencyCase;
}

export const AuthorizedMedicalInfoModal: React.FC<AuthorizedMedicalInfoModalProps> = ({
  isOpen,
  onClose,
  emergencyCase
}) => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  if (!isOpen) return null;

  const { medicalInfo } = emergencyCase;
  const allergies = medicalInfo?.allergies?.length ? medicalInfo.allergies.join(', ') : 'No known drug allergies reported';
  const conditions = medicalInfo?.medicalConditions?.length ? medicalInfo.medicalConditions.join(', ') : 'None reported';
  const medications = medicalInfo?.medications?.length ? medicalInfo.medications.join(', ') : 'None reported';
  const bloodGroup = medicalInfo?.bloodGroup || 'Not specified';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-[#0E131F] border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Authorized Medical Information
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Patient: {emergencyCase.patientName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Critical Highlights */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-red-50/60 border-red-100 text-red-950' : 'bg-red-950/20 border-red-900/40 text-red-200'}`}>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                <Heart className="w-4 h-4" />
                <span>Blood Group</span>
              </div>
              <p className="text-lg font-black mt-1">{bloodGroup}</p>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-amber-50/60 border-amber-100 text-amber-950' : 'bg-amber-950/20 border-amber-900/40 text-amber-200'}`}>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Allergies</span>
              </div>
              <p className="text-sm font-bold mt-1 line-clamp-2">{allergies}</p>
            </div>
          </div>

          {/* Chronic / Critical Conditions */}
          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#131929] border-slate-800'}`}>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              <Activity className="w-4 h-4 text-blue-500" />
              <span>Critical & Chronic Conditions</span>
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
              {conditions}
            </p>
          </div>

          {/* Current Medications */}
          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#131929] border-slate-800'}`}>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              <Pill className="w-4 h-4 text-emerald-500" />
              <span>Current Medications</span>
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
              {medications}
            </p>
          </div>

          {/* Source Attribution */}
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-1">
            <span>Verified Source: {medicalInfo?.sourceLabel || 'RESQ ONE Emergency Passport'}</span>
            <span className="text-emerald-500 font-semibold flex items-center gap-1">
              ✓ Paramedics Authorized
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors ${
              isLight
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-white text-slate-900 hover:bg-slate-100'
            }`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
