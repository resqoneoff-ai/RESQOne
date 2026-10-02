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
        emergencyContact: 'Jake Vance (Requester)'
      },
      liveLocation: {
        address: '742 Evergreen Terrace, North Ridge District',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0F131D] border border-blue-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141826] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              Family & Linked Emergency Profiles ({familyProfiles.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Profiles authorized for one-click emergency dispatch with independent patient location tracking.
            </p>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Relative</span>
              </button>
            )}
          </div>

          {/* Add form */}
          {showAddForm && (
            <form onSubmit={handleAddSubmit} className="p-4 rounded-xl bg-[#141926] border border-blue-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300">Add New Family Member</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Liam Vance"
                    className="w-full bg-[#0D1017] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Relationship</label>
                  <select
                    value={relationship}
                    onChange={(e) => setRelationship(e.target.value as any)}
                    className="w-full bg-[#0D1017] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
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
                  <label className="text-[11px] text-slate-300 block mb-1">Age & Blood Group</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-20 bg-[#0D1017] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    />
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="flex-1 bg-[#0D1017] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                    >
                      {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Known Allergies (comma separated)</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Penicillin, Peanuts"
                    className="w-full bg-[#0D1017] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 block mb-1">Medical Alerts (e.g. Pacemaker, Diabetic)</label>
                  <input
                    type="text"
                    value={alerts}
                    onChange={(e) => setAlerts(e.target.value)}
                    placeholder="e.g. Asthma Inhaler in backpack"
                    className="w-full bg-[#0D1017] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors"
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
                className="p-3.5 rounded-xl bg-[#131722] border border-slate-800 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{m.name}</span>
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded">
                      {m.relationship}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Age {m.age} · Blood: <strong className="text-slate-200">{m.authorizedInfo.bloodGroup || 'O+'}</strong>
                  </p>
                  {m.authorizedInfo.medicalAlerts.length > 0 && (
                    <div className="text-[11px] text-red-300">
                      Alert: {m.authorizedInfo.medicalAlerts[0]}
                    </div>
                  )}
                  {m.liveLocation && (
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span className="truncate max-w-[200px]">{m.liveLocation.address}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onDeleteMember(m.id)}
                  className="text-slate-500 hover:text-red-400 p-1 rounded"
                  title="Remove family profile"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#0A0D13] border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
