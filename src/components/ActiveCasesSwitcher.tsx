import React, { useState } from 'react';
import { EmergencyCase } from '../types/emergency';
import { Plus, ChevronRight, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (cases.length === 0) return null;

  const handleStartAnotherClick = () => {
    // Item 15: "Before starting another emergency, show:
    // 'You already have an active emergency. Are you sure you want to start another?'
    // Then allow: START NEW EMERGENCY"
    setShowConfirmModal(true);
  };

  const handleConfirmStartNew = () => {
    setShowConfirmModal(false);
    onNewEmergencyClick();
  };

  return (
    <section
      className={`w-full rounded-2xl border transition-all p-4 sm:p-5 mb-6 ${
        isLight
          ? 'bg-white border-[#DCE3EC] shadow-sm'
          : 'bg-[#0E131F] border-slate-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE3EC] dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F36C21] animate-ping" />
          <h2 className="text-xs font-black uppercase tracking-wider text-[#082B5C] dark:text-white">
            ACTIVE EMERGENCIES ({cases.length})
          </h2>
        </div>

        {/* Item 15: + Start another emergency as a secondary action */}
        <button
          onClick={handleStartAnotherClick}
          className={`self-start sm:self-auto px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
            isLight
              ? 'bg-slate-50 hover:bg-slate-100 border-[#DCE3EC] text-[#082B5C]'
              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700 text-slate-300'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Start another emergency</span>
        </button>
      </div>

      {/* Item 14: Simple Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {cases.map((c) => {
          const isSelected = c.id === activeCaseId;
          const isSelf = c.targetMode === 'ME' || c.relationship === 'Self';

          // Human friendly title and stage status (Item 14 & 17)
          let title = 'Your Emergency';
          if (!isSelf) {
            title = `${c.patientName}'s Emergency (${c.relationship})`;
          }

          let stageLabel = 'Ambulance is on the way';
          let icon = '🚑';
          if (c.currentStage === 'EMERGENCY_CLICK') {
            stageLabel = 'Emergency received';
            icon = '🚨';
          } else if (c.currentStage === 'AMBULANCE') {
            stageLabel = `Ambulance arriving in ${c.ambulance?.etaMinutes || 2} min`;
            icon = '🚑';
          } else if (c.currentStage === 'DOCTOR') {
            stageLabel = 'Doctor connected';
            icon = '👨‍⚕️';
          } else if (c.currentStage === 'HOSPITAL') {
            stageLabel = 'Hospital preparing';
            icon = '🏥';
          } else if (c.currentStage === 'HANDOVER' || c.currentStage === 'COMPLETED') {
            stageLabel = 'Patient handover completed';
            icon = '🤝';
          }

          return (
            <div
              key={c.id}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                isSelected
                  ? isLight
                    ? 'bg-[#FFF1E8] border-[#F36C21] ring-2 ring-[#F36C21]/20'
                    : 'bg-[#141C2E] border-orange-500/80 ring-2 ring-orange-500/20'
                  : isLight
                  ? 'bg-[#FAFBFC] border-[#DCE3EC] hover:border-slate-300'
                  : 'bg-[#0A0D15] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-[#082B5C] dark:text-white">
                    <span role="img" aria-label="emergency icon">
                      {icon}
                    </span>
                    <span className="truncate max-w-[150px]">{title}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F36C21] text-white">
                      Active
                    </span>
                  )}
                </div>

                <p className="text-xs font-semibold text-[#596579] dark:text-slate-300 mt-1">
                  {stageLabel}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {c.location?.address || 'Current location'}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#DCE3EC] dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => onSelectCase(c.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                    isSelected
                      ? 'bg-[#F36C21] text-white shadow-xs'
                      : isLight
                      ? 'bg-[#082B5C] hover:bg-[#061C3D] text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  <span>VIEW</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for Starting Another Emergency (Item 15) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
              isLight
                ? 'bg-white border-[#DCE3EC] text-[#172033]'
                : 'bg-[#0E131F] border-slate-800 text-slate-100'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF1E8] text-[#F36C21] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <h3 className="text-lg font-black text-[#082B5C] dark:text-white">
                Start another emergency?
              </h3>
              <p className="text-xs sm:text-sm text-[#596579] dark:text-slate-400 leading-relaxed">
                You already have an active emergency. Are you sure you want to start another?
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowConfirmModal(false)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                  isLight
                    ? 'border-[#DCE3EC] text-[#082B5C] hover:bg-slate-100'
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Keep Current Emergency
              </button>
              <button
                onClick={handleConfirmStartNew}
                className="px-5 py-2.5 rounded-xl bg-[#F36C21] hover:bg-[#FF7A00] text-white text-xs font-bold shadow-md transition-colors"
              >
                START NEW EMERGENCY
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
