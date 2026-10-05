import React, { useState } from 'react';
import { ShieldCheck, History, X, Clock, User, AlertCircle, Eye, FileText, CheckCircle2 } from 'lucide-react';
import { EmergencyAccessLog } from '../../types/family';
import { familyService } from '../../services/familyService';

interface EmergencyAccessHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { id: string; fullName: string };
  familyId?: string;
}

export const EmergencyAccessHistoryModal: React.FC<EmergencyAccessHistoryModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  familyId
}) => {
  const [activeTab, setActiveTab] = useState<'MY_PROFILE' | 'ALL_LOGS'>('MY_PROFILE');

  if (!isOpen) return null;

  const myLogs = familyService.getAccessLogs(currentUser.id);
  const allLogs = familyService.getAccessLogs();

  const displayLogs = activeTab === 'MY_PROFILE' ? myLogs : allLogs;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0F131D] border border-blue-900/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141826] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Emergency Access History</h2>
              <span className="text-[10px] text-slate-400 font-mono">Immutable HIPAA Audit Log</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-slate-800/80 bg-[#121622]">
          <button
            onClick={() => setActiveTab('MY_PROFILE')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'MY_PROFILE'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Accessed My Profile ({myLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('ALL_LOGS')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'ALL_LOGS'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Family Access Activity ({allLogs.length})
          </button>
        </div>

        {/* Content Logs List */}
        <div className="p-6 space-y-3 overflow-y-auto flex-1">
          {displayLogs.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                No emergency access events recorded. Whenever an authorized family member accesses your emergency
                records, an audit log will appear here with full transparency.
              </p>
            </div>
          ) : (
            displayLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl bg-[#141926] border border-slate-800/80 hover:border-blue-900/60 transition-colors space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <strong className="text-xs text-white">
                      Profile accessed by{' '}
                      <span className="text-blue-400 font-bold">{log.viewerName}</span>
                    </strong>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{formatDate(log.timestamp)}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">Patient Profile:</span>
                    <span className="text-slate-200 font-semibold">{log.profileOwnerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block">Emergency Session ID:</span>
                    <span className="text-blue-300 font-mono text-[11px]">{log.sessionId}</span>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-[10px] text-slate-400 font-mono block">Reason:</span>
                  <span className="text-slate-300">{log.accessReason}</span>
                </div>

                {/* Accessed Information Pills */}
                {log.informationAccessed.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block mb-1">Information Accessed:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {log.informationAccessed.map((info, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-850 border border-slate-700/80 text-[10px] font-mono text-slate-300"
                        >
                          {info}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#121622] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Audit records cannot be altered or removed.</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
