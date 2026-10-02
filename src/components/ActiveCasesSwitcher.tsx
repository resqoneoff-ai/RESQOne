import React from 'react';
import { EmergencyCase } from '../types/emergency';
import { AlertCircle, User, Users, UserPlus, Plus, ChevronRight, Activity } from 'lucide-react';

interface ActiveCasesSwitcherProps {
  cases: EmergencyCase[];
  activeCaseId: string | null;
  onSelectCase: (caseId: string) => void;
  onNewEmergencyClick: () => void;
}

export const ActiveCasesSwitcher: React.FC<ActiveCasesSwitcherProps> = ({
  cases,
  activeCaseId,
  onSelectCase,
  onNewEmergencyClick
}) => {
  if (cases.length === 0) return null;

  return (
    <div className="w-full bg-[#121622] border-y sm:border sm:rounded-2xl border-red-900/60 shadow-2xl p-3 sm:p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Active Emergencies Header */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-[#FF2B44] animate-ping" />
            <span className="absolute w-2 h-2 rounded-full bg-[#FF2B44]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF2B44]">
                ACTIVE EMERGENCIES ({cases.length})
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                · Multi-Person Concurrent Response Active
              </span>
            </div>
          </div>
        </div>

        {/* Right: + Emergency for Another Person button */}
        <button
          onClick={onNewEmergencyClick}
          className="self-start md:self-auto px-3.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Emergency for Another Person</span>
        </button>
      </div>

      {/* Case Tabs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3">
        {cases.map((c) => {
          const isSelected = c.id === activeCaseId;
          const getStageLabel = () => {
            switch (c.currentStage) {
              case 'EMERGENCY_CLICK':
                return 'Emergency Received';
              case 'AMBULANCE':
                return `Ambulance Arriving (${c.ambulance.etaMinutes}m)`;
              case 'DOCTOR':
                return 'Doctor Connected';
              case 'HOSPITAL':
                return 'Hospital Notified';
              case 'HANDOVER':
                return 'Patient Handover';
              case 'COMPLETED':
                return 'Handover Complete';
              default:
                return 'In Progress';
            }
          };

          return (
            <button
              key={c.id}
              onClick={() => onSelectCase(c.id)}
              className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-r from-red-950/80 to-[#171E2E] border-[#FF2B44] shadow-[0_0_15px_rgba(255,43,68,0.3)] ring-1 ring-[#FF2B44]'
                  : 'bg-[#0B0E15] border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {c.targetMode === 'ME' && <User className="w-3.5 h-3.5 text-[#FF2B44]" />}
                    {c.targetMode === 'FAMILY' && <Users className="w-3.5 h-3.5 text-blue-400" />}
                    {c.targetMode === 'FRIEND_OTHER' && <UserPlus className="w-3.5 h-3.5 text-amber-400" />}
                    <span className="text-xs font-mono font-bold text-slate-400">
                      #{c.id}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      isSelected
                        ? 'bg-[#FF2B44] text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {c.relationship}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-1">
                  <span className={`text-sm font-black truncate max-w-[160px] ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {c.patientName}
                  </span>
                  <span className="text-[11px] font-mono text-red-400 font-semibold shrink-0">
                    {getStageLabel()}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {c.emergency.type}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                <span className="truncate max-w-[170px]">{c.location.address}</span>
                <span className="font-semibold text-slate-300 flex items-center gap-0.5">
                  View Case <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
