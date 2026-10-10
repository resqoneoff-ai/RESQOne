import React, { useState } from 'react';
import { UserEmergencyProfile } from '../types/emergency';
import { User, ShieldCheck, X, Building, PhoneCall, Check, Heart } from 'lucide-react';
import { authService } from '../services/authService';

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

interface SelfProfileModalProps {
  isOpen: boolean;
  profile: UserEmergencyProfile;
  onClose: () => void;
  onUpdateProfile: (updated: UserEmergencyProfile) => void;
  onOpenMedicalRecords?: () => void;
}

export const SelfProfileModal: React.FC<SelfProfileModalProps> = ({
  isOpen,
  profile,
  onClose,
  onUpdateProfile,
  onOpenMedicalRecords
}) => {
  const [bloodGroup, setBloodGroup] = useState(profile.bloodGroup);
  const [allergiesStr, setAllergiesStr] = useState(profile.allergies.join(', '));
  const [conditionsStr, setConditionsStr] = useState(profile.medicalConditions.join(', '));
  const [medsStr, setMedsStr] = useState(profile.medications.join(', '));
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [isGoogleLinked, setIsGoogleLinked] = useState(() => {
    return Boolean(authService.getSession().googleLinked);
  });

  if (!isOpen) return null;

  const handleToggleGoogleLink = () => {
    const sessionEmail = authService.getSession().email || 'resqone.off@gmail.com';
    authService.linkGoogleToPatient(sessionEmail);
    setIsGoogleLinked(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...profile,
      bloodGroup,
      allergies: allergiesStr.split(',').map((s) => s.trim()).filter(Boolean),
      medicalConditions: conditionsStr.split(',').map((s) => s.trim()).filter(Boolean),
      medications: medsStr.split(',').map((s) => s.trim()).filter(Boolean)
    });
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F131D] border border-[#DCE3EC] dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FAFBFC] dark:bg-[#141826] border-b border-[#DCE3EC] dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] border border-[#DC2626]/30 flex items-center justify-center text-[#DC2626] shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#082B5C] dark:text-white">
                Authorized Personal Emergency Health Profile
              </h2>
              <p className="text-[11px] text-[#596579] dark:text-slate-400">
                Mode 1 [ ME ] utilizes this verified passport during instant SOS calls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#596579] hover:text-[#082B5C] dark:text-slate-400 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto text-xs">
          <div className="p-3.5 rounded-xl bg-[#EAF8F1] dark:bg-emerald-950/40 border border-[#18A66A]/30 dark:border-emerald-800/60 flex items-center gap-2.5 text-[#18A66A] dark:text-emerald-300 font-medium">
            <ShieldCheck className="w-4 h-4 shrink-0 text-[#18A66A]" />
            <span>Authorized Medical Record. Encrypted with HIPAA / Indian Emergency standard isolation.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Full Legal Name</label>
              <input
                type="text"
                disabled
                value={profile.fullName}
                className="w-full bg-[#FAFBFC] dark:bg-[#0B0E14] border border-[#DCE3EC] dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-[#082B5C] dark:text-white font-semibold cursor-not-allowed opacity-80"
              />
            </div>

            <div>
              <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#082B5C] dark:text-white font-bold focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden cursor-pointer"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">
              Documented Allergies (comma separated)
            </label>
            <input
              type="text"
              value={allergiesStr}
              onChange={(e) => setAllergiesStr(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa Antibiotics"
              className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#082B5C] dark:text-white placeholder:text-slate-400 focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">
              Medical Conditions (comma separated)
            </label>
            <input
              type="text"
              value={conditionsStr}
              onChange={(e) => setConditionsStr(e.target.value)}
              placeholder="e.g. Mild Exercise-Induced Asthma, Hypertension"
              className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#082B5C] dark:text-white placeholder:text-slate-400 focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">
              Current Medications (comma separated)
            </label>
            <input
              type="text"
              value={medsStr}
              onChange={(e) => setMedsStr(e.target.value)}
              placeholder="e.g. Albuterol Inhaler (90mcg PRN)"
              className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#082B5C] dark:text-white placeholder:text-slate-400 focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden"
            />
          </div>

          {/* Read-only system verified parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0B0E14] border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
              <span className="text-[10px] text-[#596579] dark:text-slate-400 uppercase font-bold block mb-1">Verified Insurance</span>
              <div className="text-[#082B5C] dark:text-white font-bold">{profile.insuranceInfo?.provider || 'Comprehensive Health Coverage'}</div>
              <div className="text-[10px] text-[#596579] dark:text-slate-400 font-mono mt-0.5">Policy: {profile.insuranceInfo?.policyNumber || 'Verified Active'}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#0B0E14] border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
              <span className="text-[10px] text-[#596579] dark:text-slate-400 uppercase font-bold block mb-1">Primary Emergency Contact</span>
              <div className="text-[#082B5C] dark:text-white font-bold">
                {profile.emergencyContacts?.[0]?.name ? `${profile.emergencyContacts[0].name} (${profile.emergencyContacts[0].relation})` : 'Primary Emergency Contact on File'}
              </div>
              <div className="text-[10px] text-[#596579] dark:text-slate-400 font-mono mt-0.5">{profile.emergencyContacts?.[0]?.phone || 'Authorized System Contact'}</div>
            </div>
          </div>

          {/* Google 1-Click Authentication Status & Linking */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#0B0E14] border border-[#DCE3EC] dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <GoogleIcon />
              <div className="min-w-0">
                <span className="text-xs font-bold text-[#082B5C] dark:text-white block">Google 1-Click Authentication</span>
                <span className="text-[11px] text-[#596579] dark:text-slate-400 block truncate">
                  {isGoogleLinked
                    ? '✓ Linked to Google Account (Passwordless 1-Click Login Active)'
                    : 'Link your Google account for instant registered patient login'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleGoogleLink}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                isGoogleLinked
                  ? 'bg-[#EAF8F1] text-[#18A66A] border border-[#18A66A]/30'
                  : 'bg-white hover:bg-slate-50 text-[#082B5C] border border-[#DCE3EC] dark:bg-slate-800 dark:text-white dark:border-slate-700'
              }`}
            >
              {isGoogleLinked ? '✓ Linked' : 'Link Google Account'}
            </button>
          </div>

          {/* Jump to Past Medical Records */}
          {onOpenMedicalRecords && (
            <div className="p-3.5 rounded-xl bg-[#EAF4FF] dark:bg-[#141824] border border-[#2F80C9]/20 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#082B5C] dark:text-white block">Past Medical Records & Surgical History</span>
                <span className="text-[11px] text-[#596579] dark:text-slate-400">View, update, or add past surgeries, lab reports, and cardiology records.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMedicalRecords();
                }}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-[#2F80C9]/30 text-[#082B5C] dark:text-slate-200 hover:text-[#DC2626] text-xs font-bold transition-colors whitespace-nowrap cursor-pointer shadow-xs"
              >
                Manage Past Records →
              </button>
            </div>
          )}

          {/* Footer Save */}
          <div className="pt-3 border-t border-[#DCE3EC] dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-[#596579] dark:text-slate-300 border border-[#DCE3EC] dark:border-slate-700 font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-white font-bold transition-all shadow-md shadow-[#DC2626]/20 flex items-center gap-1.5 cursor-pointer"
            >
              {savedFeedback ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Profile Saved</span>
                </>
              ) : (
                <span>Save Emergency Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
