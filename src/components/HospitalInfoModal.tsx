import React from 'react';
import { X, Building2, Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { EmergencyCase } from '../types/emergency';
import { useTheme } from '../context/ThemeContext';

interface HospitalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  emergencyCase: EmergencyCase;
  onCallHospital?: () => void;
}

export const HospitalInfoModal: React.FC<HospitalInfoModalProps> = ({
  isOpen,
  onClose,
  emergencyCase,
  onCallHospital
}) => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  if (!isOpen) return null;

  const { hospital } = emergencyCase;

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
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Receiving Emergency Hospital
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Department pre-notified & preparing
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
          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-sky-50/60 border-sky-100' : 'bg-sky-950/20 border-sky-900/40'}`}>
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
              Facility Name
            </span>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {hospital.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{hospital.address || 'Emergency Department Trauma Bay 1'}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#131929] border-slate-800'}`}>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                Assigned Bay
              </span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {hospital.allocatedBay || 'Bay 3 (Cardiac Ready)'}
              </p>
            </div>

            <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#131929] border-slate-800'}`}>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                Department
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-200 mt-0.5 truncate">
                {hospital.receivingDepartment || 'Trauma Triage'}
              </p>
            </div>
          </div>

          <div className={`p-3.5 rounded-2xl border flex items-center gap-3 ${isLight ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' : 'bg-emerald-950/20 border-emerald-900/50 text-emerald-200'}`}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <p className="text-xs font-medium leading-relaxed">
              Hospital has accepted the inbound dispatch. Trauma team has received preliminary vitals and is awaiting arrival.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          {onCallHospital ? (
            <button
              onClick={onCallHospital}
              className="px-4 py-2.5 rounded-xl border border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call ER Triage</span>
            </button>
          ) : <div />}

          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors ${
              isLight
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-white text-slate-900 hover:bg-slate-100'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
