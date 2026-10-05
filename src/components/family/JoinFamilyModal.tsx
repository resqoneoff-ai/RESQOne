import React, { useState } from 'react';
import { Users, X, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { familyService } from '../../services/familyService';
import { FamilyRelationshipType, PermissionLevel } from '../../types/family';

interface JoinFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { id: string; fullName: string; email: string; age?: number; phone?: string };
  onSuccess: () => void;
  initialCode?: string;
}

const RELATIONSHIP_OPTIONS: FamilyRelationshipType[] = [
  'Father',
  'Mother',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Spouse',
  'Grandfather',
  'Grandmother',
  'Grandchild',
  'Uncle',
  'Aunt',
  'Cousin',
  'Caregiver',
  'Emergency Contact',
  'Other Relative'
];

export const JoinFamilyModal: React.FC<JoinFamilyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
  initialCode = ''
}) => {
  const [code, setCode] = useState(initialCode);
  const [relationship, setRelationship] = useState<FamilyRelationshipType>('Son');
  const [customRelationship, setCustomRelationship] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('LEVEL_2');
  const [shareLiveLocation, setShareLiveLocation] = useState(true);

  const [step, setStep] = useState<'ENTER_CODE' | 'CONFIRM' | 'SUCCESS'>('ENTER_CODE');
  const [foundFamilyInfo, setFoundFamilyInfo] = useState<{
    family: ReturnType<typeof familyService.findFamilyByCode> extends { family: infer F } ? F : any;
    memberCount: number;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLookupCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!code.trim()) {
      setErrorMsg('Please enter a valid family code.');
      return;
    }

    const result = familyService.findFamilyByCode(code.trim());
    if (!result) {
      setErrorMsg('Invalid family code. Please double-check with the family creator.');
      return;
    }

    // Check if user is the owner
    if (result.family.ownerUserId === currentUser.id) {
      setErrorMsg('You are already the owner and administrator of this family circle.');
      return;
    }

    // Check if already active
    const members = familyService.getMembers(result.family.id);
    if (members.some((m) => m.userId === currentUser.id && m.status === 'ACTIVE')) {
      setErrorMsg('You are already an active member of this family circle.');
      return;
    }

    setFoundFamilyInfo(result);
    setStep('CONFIRM');
  };

  const handleSendRequest = () => {
    if (!foundFamilyInfo) return;
    const finalRel = relationship === 'Other Relative' && customRelationship.trim() ? customRelationship.trim() : relationship;

    const res = familyService.requestJoinFamily({
      familyId: foundFamilyInfo.family.id,
      familyName: foundFamilyInfo.family.name,
      user: {
        id: currentUser.id,
        fullName: currentUser.fullName,
        email: currentUser.email,
        phone: currentUser.phone,
        age: currentUser.age || 30
      },
      relationship: finalRel,
      initialPermissionLevel: permissionLevel,
      initialLocationPermission: {
        canShareCurrentLocation: shareLiveLocation,
        canShareLastKnownLocation: true,
        canShareLiveLocationDuringEmergency: shareLiveLocation
      }
    });

    if (res.success) {
      setStep('SUCCESS');
      onSuccess();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleClose = () => {
    setStep('ENTER_CODE');
    setCode('');
    setErrorMsg(null);
    setFoundFamilyInfo(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F131D] border border-blue-900/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141826] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Join a Family Circle</h2>
              <span className="text-[10px] text-slate-400 font-mono">REQ #2 · Secure Account Linking</span>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-900/60 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 'ENTER_CODE' && (
            <form onSubmit={handleLookupCode} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-200 block">
                  Enter your family's RESQ Code
                </label>
                <p className="text-[11px] text-slate-400">
                  Ask your family admin for their 10-character code (e.g., <code className="text-blue-300">RESQ-FAM-7K42P</code>).
                </p>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="RESQ-FAM-XXXXX"
                  className="w-full mt-2 bg-[#0A0D14] border border-blue-900/60 rounded-xl px-4 py-3 text-sm font-mono font-bold text-white tracking-widest uppercase placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Privacy Preserved</span>
                </div>
                <p>
                  Entering a code does not grant immediate medical access. The family administrator must review and approve your request.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.01]"
              >
                <span>Verify Code</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'CONFIRM' && foundFamilyInfo && (
            <div className="space-y-4">
              {/* Family Card Preview */}
              <div className="p-4 rounded-2xl bg-[#141926] border border-blue-900/60 space-y-2">
                <span className="text-[10px] font-mono uppercase text-blue-400 font-bold block">Family Found</span>
                <h3 className="text-lg font-black text-white">{foundFamilyInfo.family.name}</h3>
                <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Family Owner / Admin:</span>
                    <strong className="text-white">{foundFamilyInfo.family.ownerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Members:</span>
                    <span className="text-blue-300 font-bold">{foundFamilyInfo.memberCount} members</span>
                  </div>
                </div>
              </div>

              {/* Relationship Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">
                  Your Relationship to this Family
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value as FamilyRelationshipType)}
                  className="w-full bg-[#0A0D14] border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white"
                >
                  {RELATIONSHIP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>

                {relationship === 'Other Relative' && (
                  <input
                    type="text"
                    value={customRelationship}
                    onChange={(e) => setCustomRelationship(e.target.value)}
                    placeholder="Specify custom relationship (e.g. Guardian, Neighbor)"
                    className="w-full mt-2 bg-[#0A0D14] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                )}
              </div>

              {/* Initial Permission Level Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">
                  What info will you authorize for emergency assistance?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPermissionLevel('LEVEL_1')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      permissionLevel === 'LEVEL_1'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <strong className="block text-[11px] font-bold">Level 1</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Emergency Access Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPermissionLevel('LEVEL_2')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      permissionLevel === 'LEVEL_2'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <strong className="block text-[11px] font-bold">Level 2</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Critical Alerts</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPermissionLevel('LEVEL_3')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      permissionLevel === 'LEVEL_3'
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <strong className="block text-[11px] font-bold">Level 3</strong>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Full Profile</span>
                  </button>
                </div>
              </div>

              {/* Location Toggle */}
              <label className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">Authorize Live GPS Telemetry</span>
                  <span className="text-[11px] text-slate-400">Share location with family during active emergencies</span>
                </div>
                <input
                  type="checkbox"
                  checked={shareLiveLocation}
                  onChange={(e) => setShareLiveLocation(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-800 border-slate-700"
                />
              </label>

              {/* Confirmation Disclaimer required by prompt */}
              <p className="text-[11px] text-slate-400 bg-blue-950/30 border border-blue-900/40 p-3 rounded-xl leading-relaxed">
                "You are requesting to join this family. Your profile will remain private unless you authorize specific information to be shared."
              </p>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('ENTER_CODE')}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSendRequest}
                  className="w-2/3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Send Request</span>
                </button>
              </div>
            </div>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Join Request Submitted</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Your request has been routed to the family administrator. Once approved, you will appear in the family emergency network.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider"
              >
                Close & Return
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
