import React, { useState } from 'react';
import { User, Users, UserPlus, Shield, HeartPulse, ChevronRight, X, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { EmergencyMode, UserEmergencyProfile, FamilyMemberProfile } from '../types/emergency';

interface WhoNeedsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDirectDispatch: (
    mode: EmergencyMode,
    familyMember?: FamilyMemberProfile,
    friendName?: string
  ) => void;
  currentUser?: UserEmergencyProfile;
  familyMembers?: FamilyMemberProfile[];
  familyCount?: number;
}

export const WhoNeedsHelpModal: React.FC<WhoNeedsHelpModalProps> = ({
  isOpen,
  onClose,
  onDirectDispatch,
  currentUser,
  familyMembers = [],
  familyCount = familyMembers.length
}) => {
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string>(
    familyMembers.length > 0 ? familyMembers[0].id : ''
  );
  const [friendName, setFriendName] = useState<string>('Friend / Bystander');
  const [showFriendInput, setShowFriendInput] = useState<boolean>(false);
  const [showFamilyPicker, setShowFamilyPicker] = useState<boolean>(false);

  if (!isOpen) return null;

  const userDisplayName = currentUser?.fullName?.trim() || 'Myself';
  const bloodGroupDisplay =
    currentUser?.bloodGroup && currentUser.bloodGroup !== 'Not Specified'
      ? currentUser.bloodGroup
      : 'On File';
  const insuranceDisplay = currentUser?.insuranceInfo?.provider || 'Verified Emergency Passport';

  const handleDispatchMyself = () => {
    onDirectDispatch('ME');
  };

  const handleDispatchFamily = (member?: FamilyMemberProfile) => {
    const targetMember =
      member ||
      familyMembers.find((f) => f.id === selectedFamilyMemberId) ||
      familyMembers[0];
    onDirectDispatch('FAMILY', targetMember);
  };

  const handleDispatchFriend = () => {
    onDirectDispatch('FRIEND_OTHER', undefined, friendName.trim() || 'Friend / Bystander');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0F1219] border border-red-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#131722]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF2B44] animate-ping" />
            <span className="text-xs font-mono font-bold tracking-widest text-[#FF2B44] uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              DIRECT EMERGENCY SOS DISPATCH
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
        <div className="px-6 pt-5 pb-2 text-center sm:text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              WHO NEEDS HELP?
            </h2>
            <span className="hidden sm:inline-flex text-[11px] font-mono px-2.5 py-1 rounded-full bg-red-950/80 border border-red-800/60 text-red-300 font-bold uppercase">
              Instant 1-Click Submission
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-300">
            Select who requires urgent medical dispatch. Emergency cases submit immediately without symptom questionnaires.
          </p>
        </div>

        {/* The 3 Core Direct-Submit Options */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* OPTION 1: ME */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#1A1116] via-[#171D2B] to-[#121620] border-2 border-red-700/70 hover:border-[#FF2B44] shadow-lg transition-all group relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-[#FF2B44] shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-black text-white">
                      [ ME ]
                    </span>
                    <span className="text-sm font-bold text-slate-200">
                      Myself ({userDisplayName})
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Immediately activates emergency dispatch with your personal medical record (Blood: <strong className="text-white">{bloodGroupDisplay}</strong>), insurance, and verified GPS.
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium mt-1.5">
                    <Shield className="w-3.5 h-3.5 shrink-0" />
                    <span>Authorized Health Passport Attached</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">{insuranceDisplay}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDispatchMyself}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm tracking-wide shadow-[0_0_20px_rgba(255,43,68,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>DISPATCH FOR ME</span>
              </button>
            </div>
          </div>

          {/* OPTION 2: FAMILY */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#101726] to-[#121620] border-2 border-blue-900/60 hover:border-blue-500/80 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-black text-white">
                      [ FAMILY ]
                    </span>
                    <span className="text-sm font-semibold text-blue-300">
                      Family Member ({familyCount} Linked)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Direct dispatch for your linked family members with independent GPS and registered medical profiles.
                  </p>
                </div>
              </div>

              {familyMembers.length > 0 && !showFamilyPicker && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDispatchFamily(familyMembers[0])}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>DISPATCH ({familyMembers[0].name})</span>
                  </button>
                  {familyMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setShowFamilyPicker(true)}
                      className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      More
                    </button>
                  )}
                </div>
              )}

              {familyMembers.length === 0 && (
                <button
                  type="button"
                  onClick={() => handleDispatchFamily()}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>DISPATCH FOR FAMILY</span>
                </button>
              )}
            </div>

            {/* Quick 1-click pills for multiple family members */}
            {familyMembers.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <span className="text-[11px] font-mono text-slate-400 block mb-2">
                  Direct 1-Click Dispatch By Family Member:
                </span>
                <div className="flex flex-wrap gap-2">
                  {familyMembers.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleDispatchFamily(m)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-red-950/80 border border-slate-700 hover:border-red-600 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer group"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-400 group-hover:bg-red-500" />
                      <span>{m.name}</span>
                      <span className="text-slate-400 text-[10px]">({m.relationship})</span>
                      <Zap className="w-3 h-3 text-red-400 ml-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* OPTION 3: FRIEND / OTHER */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-[#1A1610] to-[#121620] border-2 border-amber-900/60 hover:border-amber-500/80 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-black text-white">
                      [ FRIEND / OTHER ]
                    </span>
                    <span className="text-sm font-semibold text-amber-300">
                      Bystander / Other Person
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Initiate urgent dispatch for a friend, colleague, or bystander. Missing records are marked <strong className="text-slate-200">NOT PROVIDED</strong> without delaying dispatch.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDispatchFriend}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-sm tracking-wide shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>DISPATCH FOR OTHER</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFriendInput(!showFriendInput)}
                  className="px-3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                  title="Optionally add person's name"
                >
                  {showFriendInput ? 'Hide' : 'Add Name'}
                </button>
              </div>
            </div>

            {showFriendInput && (
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <input
                  type="text"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  placeholder="e.g. John Doe, Passerby at Market St"
                  className="flex-1 bg-black/60 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleDispatchFriend}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer"
                >
                  Confirm & Submit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="px-6 py-3.5 bg-[#0A0D13] border-t border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
          <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-[11px] text-slate-300">
            <strong className="text-white">Direct Zero-Delay Guarantee:</strong> Tapping any button immediately sends CAD telemetry to the emergency operations command center. Live ambulance tracking and emergency physician video telemetry commence immediately.
          </p>
        </div>
      </div>
    </div>
  );
};
