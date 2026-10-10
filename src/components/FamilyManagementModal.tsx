import React, { useState } from 'react';
import { FamilyMemberProfile } from '../types/emergency';
import { Users, UserPlus, ShieldCheck, X, Plus, AlertCircle, MapPin, Trash2 } from 'lucide-react';

interface FamilyManagementModalProps {
  isOpen: boolean;
  familyProfiles: FamilyMemberProfile[];
  onClose: () => void;
  onAddFamilyMember: (newMember: FamilyMemberProfile) => void;
  onDeleteMember: (id: string) => void;
}

export const FamilyManagementModal: React.FC<FamilyManagementModalProps> = ({
  isOpen,
  familyProfiles,
  onClose,
  onAddFamilyMember,
  onDeleteMember
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState<FamilyMemberProfile['relationship']>('Child');
  const [age, setAge] = useState(25);
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [alerts, setAlerts] = useState('');
  const [hospital, setHospital] = useState('St. Jude Comprehensive Medical Center');

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProfile: FamilyMemberProfile = {
      id: `fam-${Date.now()}`,
      name: name.trim(),
      relationship,
      age: Number(age) || 30,
      profileStatus: 'Active & Verified',
      emergencyProfileAvailability: 'Full Profile Authorized',
      avatarInitials: name.trim().slice(0, 2).toUpperCase(),
      authorizedInfo: {
        bloodGroup,
        allergies: allergies.trim() ? allergies.split(',').map((s) => s.trim()) : ['NKDA'],
        medicalConditions: conditions.trim() ? conditions.split(',').map((s) => s.trim()) : [],
        medicalAlerts: alerts.trim() ? [alerts.trim()] : [],
        preferredHospital: hospital,
        insuranceStatus: 'Active Family Plan Coverage',
        emergencyContact: 'Authorized Account Holder'
      },
      liveLocation: {
        address: 'Live Location GPS Active',
        lat: 37.7749,
        lng: -122.4194,
        lastPing: 'Live Now',
        deviceOnline: true,
        batteryLevel: 95
      }
    };

    onAddFamilyMember(newProfile);
    setShowAddForm(false);
    setName('');
    setAllergies('');
    setConditions('');
    setAlerts('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#0F131D] border border-[#DCE3EC] dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#FAFBFC] dark:bg-[#141826] border-b border-[#DCE3EC] dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF4FF] border border-[#2F80C9]/30 flex items-center justify-center text-[#2F80C9] shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#082B5C] dark:text-white">
                Family & Linked Emergency Profiles ({familyProfiles.length})
              </h2>
              <p className="text-[11px] text-[#596579] dark:text-slate-400">
                Authorized family contacts with independent emergency routing
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

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-[#596579] dark:text-slate-400">
              Profiles authorized for one-click emergency dispatch with independent patient location tracking.
            </p>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Relative</span>
              </button>
            )}
          </div>

          {/* Add form */}
          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="p-5 rounded-2xl bg-[#FAFBFC] dark:bg-[#141926] border border-[#DCE3EC] dark:border-slate-800 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#082B5C] dark:text-white">Add New Family Member</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-[#596579] hover:text-[#082B5C] dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Liam Vance"
                    className="w-full bg-white dark:bg-[#0D1017] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-[#082B5C] dark:text-white focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as any)}
                    className="w-full bg-white dark:bg-[#0D1017] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-[#082B5C] dark:text-white focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden cursor-pointer"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Grandmother">Grandmother</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Other Relative">Other Relative</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Age & Blood Group</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-20 bg-white dark:bg-[#0D1017] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-[#082B5C] dark:text-white focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden"
                    />
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="flex-1 bg-white dark:bg-[#0D1017] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs text-[#082B5C] dark:text-white focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden cursor-pointer"
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Known Allergies (comma separated)</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Peanuts"
                    className="w-full bg-white dark:bg-[#0D1017] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-[#082B5C] dark:text-white focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Medical Alerts (e.g. Pacemaker, Diabetic)</label>
                  <input
                    type="text"
                    value={alerts}
                    onChange={(e) => setAlerts(e.target.value)}
                    placeholder="e.g. Asthma Inhaler in backpack"
                    className="w-full bg-white dark:bg-[#0D1017] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-[#082B5C] dark:text-white focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#DC2626] hover:bg-[#EF4444] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Save Family Profile
              </button>
            </form>
          )}

          {/* List of profiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {familyProfiles.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#131722] border border-[#DCE3EC] dark:border-slate-800 flex items-start justify-between gap-3 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#082B5C] dark:text-white text-sm">{m.name}</span>
                    <span className="text-[10px] font-bold text-[#2F80C9] bg-[#EAF4FF] border border-[#2F80C9]/20 px-2 py-0.5 rounded-full">
                      {m.relationship}
                    </span>
                  </div>
                  <p className="text-xs text-[#596579] dark:text-slate-400">
                    Age {m.age} · Blood: <strong className="text-[#082B5C] dark:text-slate-200">{m.authorizedInfo.bloodGroup || 'O+'}</strong>
                  </p>
                  {m.authorizedInfo.medicalAlerts.length > 0 && (
                    <div className="text-[11px] text-[#D92D20] font-medium">
                      Alert: {m.authorizedInfo.medicalAlerts[0]}
                    </div>
                  )}
                  {m.liveLocation && (
                    <div className="text-[11px] text-[#596579] dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#18A66A]" />
                      <span className="truncate max-w-[200px]">{m.liveLocation.address}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onDeleteMember(m.id)}
                  className="text-slate-400 hover:text-[#D92D20] p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Remove family profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAFBFC] dark:bg-[#0A0D13] border-t border-[#DCE3EC] dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-[#082B5C] dark:text-slate-200 border border-[#DCE3EC] dark:border-slate-700 text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
