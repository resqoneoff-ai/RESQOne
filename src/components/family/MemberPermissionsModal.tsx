import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  Lock,
  Unlock,
  AlertTriangle,
  X,
  Check,
  Heart,
  Activity,
  Trash2
} from 'lucide-react';
import { FamilyMemberRecord, PermissionLevel, LocationPermission } from '../../types/family';
import { familyService } from '../../services/familyService';

interface MemberPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMemberRecord;
  currentUser: { id: string; fullName: string };
  isOwnerOrSelf: boolean;
  onUpdated: () => void;
  onRemoveMember?: () => void;
}

export const MemberPermissionsModal: React.FC<MemberPermissionsModalProps> = ({
  isOpen,
  onClose,
  member,
  currentUser,
  isOwnerOrSelf,
  onUpdated,
  onRemoveMember
}) => {
  const [level, setLevel] = useState<PermissionLevel>(member.permissionLevel);
  const [locPerm, setLocPerm] = useState<LocationPermission>(member.locationPermission);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    familyService.updatePermissions(member.id, level, locPerm);
    setSaveSuccess(true);
    onUpdated();
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  const handleRevokeAll = () => {
    if (confirm(`Revoke all emergency medical data permissions for ${member.fullName}? They will only have Level 1 baseline access with location disabled.`)) {
      setLevel('LEVEL_1');
      setLocPerm({
        canShareCurrentLocation: false,
        canShareLastKnownLocation: false,
        canShareLiveLocationDuringEmergency: false
      });
      familyService.updatePermissions(member.id, 'LEVEL_1', {
        canShareCurrentLocation: false,
        canShareLastKnownLocation: false,
        canShareLiveLocationDuringEmergency: false
      });
      onUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0F131D] border border-blue-900/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141826] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Emergency Data Authorization</h2>
              <span className="text-[10px] text-slate-400 font-mono">
                {member.fullName} ({member.relationship})
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Permission Level Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Medical Information Sharing Tier</span>
              <span className="text-[10px] font-mono text-blue-400 uppercase">Requirement #6</span>
            </div>

            <div className="space-y-2">
              {/* Level 1 */}
              <label
                onClick={() => setLevel('LEVEL_1')}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 cursor-pointer transition-all ${
                  level === 'LEVEL_1'
                    ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-[#121622] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    level === 'LEVEL_1' ? 'border-blue-500 bg-blue-600 text-white' : 'border-slate-600'
                  }`}
                >
                  {level === 'LEVEL_1' && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <strong className="text-xs font-bold text-white block">Level 1: Emergency Access Only</strong>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Can access only information required during an acute emergency: baseline emergency contacts, rapid
                    dispatch trigger, and essential vitals verification. No complete medical history.
                  </p>
                </div>
              </label>

              {/* Level 2 */}
              <label
                onClick={() => setLevel('LEVEL_2')}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 cursor-pointer transition-all ${
                  level === 'LEVEL_2'
                    ? 'bg-amber-950/30 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-[#121622] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    level === 'LEVEL_2' ? 'border-amber-500 bg-amber-600 text-white' : 'border-slate-600'
                  }`}
                >
                  {level === 'LEVEL_2' && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <strong className="text-xs font-bold text-white block">Level 2: Critical Alerts Authorized</strong>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Can see critical emergency alerts: allergies, major medical alerts, implanted devices (e.g.
                    pacemakers), blood group, and critical emergency medications.
                  </p>
                </div>
              </label>

              {/* Level 3 */}
              <label
                onClick={() => setLevel('LEVEL_3')}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 cursor-pointer transition-all ${
                  level === 'LEVEL_3'
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-[#121622] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    level === 'LEVEL_3' ? 'border-emerald-500 bg-emerald-600 text-white' : 'border-slate-600'
                  }`}
                >
                  {level === 'LEVEL_3' && <Check className="w-3 h-3" />}
                </div>
                <div>
                  <strong className="text-xs font-bold text-white block">Level 3: Full Emergency Profile</strong>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    Can access the comprehensive authorized emergency profile: known conditions, past medical history,
                    preferred trauma hospital, insurance summary, and emergency telemetry.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Location Permissions */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <span className="text-xs font-bold text-white block">Location Permissions</span>

            <div className="space-y-2">
              <label className="p-3 rounded-xl bg-[#121622] border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <strong className="text-xs text-white block">Current GPS Location</strong>
                  <span className="text-[10px] text-slate-400">Periodic ambient coordinates for safety radar</span>
                </div>
                <input
                  type="checkbox"
                  checked={locPerm.canShareCurrentLocation}
                  onChange={(e) => setLocPerm((prev) => ({ ...prev, canShareCurrentLocation: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700"
                />
              </label>

              <label className="p-3 rounded-xl bg-[#121622] border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <strong className="text-xs text-white block">Last Known Location</strong>
                  <span className="text-[10px] text-slate-400">Display timestamped last seen area</span>
                </div>
                <input
                  type="checkbox"
                  checked={locPerm.canShareLastKnownLocation}
                  onChange={(e) => setLocPerm((prev) => ({ ...prev, canShareLastKnownLocation: e.target.checked }))}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700"
                />
              </label>

              <label className="p-3 rounded-xl bg-[#121622] border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <strong className="text-xs text-white block">Live Location During Emergency</strong>
                  <span className="text-[10px] text-slate-400">Stream real-time high frequency GPS to dispatcher</span>
                </div>
                <input
                  type="checkbox"
                  checked={locPerm.canShareLiveLocationDuringEmergency}
                  onChange={(e) =>
                    setLocPerm((prev) => ({ ...prev, canShareLiveLocationDuringEmergency: e.target.checked }))
                  }
                  className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <button
              onClick={handleSave}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.01]"
            >
              {saveSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{saveSuccess ? 'Permissions Updated!' : 'Save Permissions'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRevokeAll}
                className="w-1/2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-slate-700"
              >
                Revoke Permissions
              </button>

              {onRemoveMember && (
                <button
                  type="button"
                  onClick={onRemoveMember}
                  className="w-1/2 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 font-semibold text-xs border border-red-800/60"
                >
                  Remove Member
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
