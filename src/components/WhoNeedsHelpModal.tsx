import React from 'react';
import { User, Users, UserPlus, Shield, HeartPulse, ChevronRight, X } from 'lucide-react';
import { EmergencyMode } from '../types/emergency';
import { CURRENT_LOGGED_IN_USER, INITIAL_FAMILY_PROFILES } from '../data/mockInitialData';

interface WhoNeedsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: EmergencyMode) => void;
}

export const WhoNeedsHelpModal: React.FC<WhoNeedsHelpModalProps> = ({
  isOpen,
  onClose,
  onSelectMode
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0F1219] border border-red-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131722]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF2B44] animate-ping" />
            <span className="text-xs font-mono font-bold tracking-widest text-[#FF2B44] uppercase">
              TRIAGE STEP 1 OF 3
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title Zone */}
        <div className="px-6 pt-6 pb-3 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            WHO NEEDS HELP?
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Select who requires urgent medical dispatch. Every second counts.
          </p>
        </div>

        {/* The 3 Core Options */}
        <div className="p-6 space-y-3.5 overflow-y-auto">
          {/* OPTION 1: ME */}
          <button
            onClick={() => onSelectMode('ME')}
            className="w-full text-left p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#171D2B] to-[#121620] border-2 border-slate-700/80 hover:border-[#FF2B44] hover:shadow-[0_0_25px_rgba(255,43,68,0.25)] transition-all group relative overflow-hidden"
          >
            <div className="flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-[#FF2B44] group-hover:bg-[#FF2B44] group-hover:text-white transition-colors shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-black text-white group-hover:text-red-300 transition-colors">
                      [ ME ]
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Myself ({CURRENT_LOGGED_IN_USER.fullName})
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Uses your authorized emergency profile with pre-loaded blood group ({CURRENT_LOGGED_IN_USER.bloodGroup}), allergies, medications, and insurance.
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium mt-2">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Full Authorized Health Profile Ready</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">{CURRENT_LOGGED_IN_USER.insuranceInfo.provider}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-2 sm:mt-0" />
            </div>
          </button>

          {/* OPTION 2: FAMILY */}
          <button
            onClick={() => onSelectMode('FAMILY')}
            className="w-full text-left p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#171D2B] to-[#121620] border-2 border-slate-700/80 hover:border-[#FF2B44] hover:shadow-[0_0_25px_rgba(255,43,68,0.25)] transition-all group relative overflow-hidden"
          >
            <div className="flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-black text-white group-hover:text-red-300 transition-colors">
                      [ FAMILY ]
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      Saved & Linked Profiles ({INITIAL_FAMILY_PROFILES.length} Saved)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Father, Mother, Grandmother, Spouse, Child, Sibling, or Other Relative. Supports independent patient location tracking.
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px] text-slate-300">
                    <span className="text-slate-400">Quick Select:</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-200">Father</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-200">Mother</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-200">Spouse</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-200">Child</span>
                    <span className="text-slate-400">+3 more</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-2 sm:mt-0" />
            </div>
          </button>

          {/* OPTION 3: FRIEND / OTHER */}
          <button
            onClick={() => onSelectMode('FRIEND_OTHER')}
            className="w-full text-left p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#171D2B] to-[#121620] border-2 border-slate-700/80 hover:border-[#FF2B44] hover:shadow-[0_0_25px_rgba(255,43,68,0.25)] transition-all group relative overflow-hidden"
          >
            <div className="flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors shrink-0">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-black text-white group-hover:text-red-300 transition-colors">
                      [ FRIEND / OTHER ]
                    </span>
                    <span className="text-xs font-semibold text-amber-400">
                      Someone Else / Bystander
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Initiate an emergency for a friend, colleague, or bystander without a saved profile. Missing medical info is marked <strong className="text-slate-200">NOT PROVIDED</strong> without delaying dispatch.
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-amber-400 font-medium mt-2">
                    <HeartPulse className="w-3.5 h-3.5" />
                    <span>Immediate Dispatch Priority · No Mandatory Medical Form Required</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-2 sm:mt-0" />
            </div>
          </button>
        </div>

        {/* Privacy Shield Notice Footer */}
        <div className="px-6 py-3.5 bg-[#0A0D13] border-t border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-300">RESQ ONE Strict Privacy Guarantee:</span>
            <p className="text-[11px] text-slate-400 leading-normal">
              For Myself, we load your authorized profile. For Family, we only retrieve authorized family records. For Friend/Other, we strictly use what you provide and mark all unknown fields <span className="font-mono text-slate-300">NOT PROVIDED</span>. No medical records are ever inferred or fabricated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
