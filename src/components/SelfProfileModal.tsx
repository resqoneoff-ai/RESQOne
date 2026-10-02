import React, { useState } from 'react';
import { UserEmergencyProfile } from '../types/emergency';
import { User, ShieldCheck, X, Building, PhoneCall, Check, Heart } from 'lucide-react';

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0F131D] border border-red-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141826] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-[#FF2B44]" />
            <div>
              <h2 className="text-base font-bold text-white">
                Authorized Personal Emergency Health Profile
              </h2>
              <p className="text-[11px] text-slate-400">
                Mode 1 [ ME ] utilizes this verified passport during instant SOS calls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-2 text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Authorized Medical Record. Encrypted with HIPAA / CAD 911 standard isolation.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-300 font-bold block mb-1">Full Legal Name</label>
              <input
                type="text"
                disabled
                value={profile.fullName}
                className="w-full bg-[#0B0E14] border border-slate-800 rounded-lg px-3 py-2 text-white font-semibold cursor-not-allowed opacity-80"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-bold block mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono font-bold"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-300 font-bold block mb-1">
              Documented Allergies (comma separated)
            </label>
            <input
              type="text"
              value={allergiesStr}
              onChange={(e) => setAllergiesStr(e.target.value)}
              placeholder="e.g. Penicillin, Sulfa Antibiotics"
              className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-300 font-bold block mb-1">
              Medical Conditions (comma separated)
            </label>
            <input
              type="text"
              value={conditionsStr}
              onChange={(e) => setConditionsStr(e.target.value)}
              placeholder="e.g. Mild Exercise-Induced Asthma, Hypertension"
              className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-300 font-bold block mb-1">
              Current Medications (comma separated)
            </label>
            <input
              type="text"
              value={medsStr}
              onChange={(e) => setMedsStr(e.target.value)}
              placeholder="e.g. Albuterol Inhaler (90mcg PRN)"
              className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white"
            />
          </div>

          {/* Read-only system verified parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-[#0B0E14] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Verified Insurance</span>
              <div className="text-white font-medium">{profile.insuranceInfo.provider}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Policy: {profile.insuranceInfo.policyNumber}</div>
            </div>

            <div className="p-3 rounded-lg bg-[#0B0E14] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Primary Emergency Contact</span>
              <div className="text-white font-medium">
                {profile.emergencyContacts[0].name} ({profile.emergencyContacts[0].relation})
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{profile.emergencyContacts[0].phone}</div>
            </div>
          </div>

          {/* Jump to Past Medical Records */}
          {onOpenMedicalRecords && (
            <div className="p-3.5 rounded-xl bg-[#141824] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Past Medical Records & Surgical History</span>
                <span className="text-[11px] text-slate-400">View, update, or add past surgeries, lab reports, and cardiology records.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMedicalRecords();
                }}
                className="px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-800/80 text-red-300 hover:text-white hover:bg-red-900 text-xs font-bold transition-colors whitespace-nowrap"
              >
                Manage Past Records →
              </button>
            </div>
          )}

          {/* Footer Save */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-red-600 hover:bg-[#FF2B44] text-white font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              {savedFeedback ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
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
