import React, { useState } from 'react';
import { HospitalPreference, FamilyMemberProfile, UserEmergencyProfile } from '../types/emergency';
import {
  Building2,
  MapPin,
  Clock,
  PhoneCall,
  Plus,
  Star,
  CheckCircle2,
  Navigation,
  Edit3,
  Trash2,
  ShieldCheck,
  Radio,
  ArrowUp,
  X
} from 'lucide-react';

interface HospitalPreferencesManagerProps {
  preferences: HospitalPreference[];
  currentUser: UserEmergencyProfile;
  familyProfiles: FamilyMemberProfile[];
  onSavePreference: (pref: HospitalPreference) => void;
  onSetPrimary: (id: string, patientId: string) => void;
  onDeletePreference: (id: string) => void;
  onClose?: () => void;
}

export const HospitalPreferencesManager: React.FC<HospitalPreferencesManagerProps> = ({
  preferences,
  currentUser,
  familyProfiles,
  onSavePreference,
  onSetPrimary,
  onDeletePreference,
  onClose
}) => {
  const currentUserName = currentUser?.fullName || 'Myself';
  const currentUserId = currentUser?.id || 'self-user';

  const patientOptions = [
    { id: currentUserId, name: `${currentUserName} (Self)`, relationship: 'Self' },
    ...(familyProfiles || []).map((f) => ({
      id: f.id,
      name: `${f.name} (${f.relationship})`,
      relationship: f.relationship
    }))
  ];

  const [selectedPatientId, setSelectedPatientId] = useState<string>(currentUserId);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPref, setEditingPref] = useState<HospitalPreference | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [traumaLevel, setTraumaLevel] = useState<HospitalPreference['traumaLevel']>('Level 1 Trauma');
  const [address, setAddress] = useState('');
  const [receivingBayEntrance, setReceivingBayEntrance] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [distanceMiles, setDistanceMiles] = useState(2.5);
  const [driveTimeMin, setDriveTimeMin] = useState(5);
  const [inNetworkStatus, setInNetworkStatus] = useState<HospitalPreference['inNetworkStatus']>('In-Network (Tier 1)');
  const [specialtiesStr, setSpecialtiesStr] = useState('24/7 Cath Lab, Helipad, Level 1 Trauma');
  const [notes, setNotes] = useState('');

  // Filter preferences for selected patient
  const patientPreferences = preferences
    .filter((p) => p.patientId === selectedPatientId)
    .sort((a, b) => a.rankOrder - b.rankOrder);

  const selectedPatientObj = patientOptions.find((p) => p.id === selectedPatientId) || patientOptions[0] || {
    id: currentUserId,
    name: `${currentUserName} (Self)`,
    relationship: 'Self'
  };

  const handleOpenAdd = () => {
    setEditingPref(null);
    setName('');
    setTraumaLevel('Level 1 Trauma');
    setAddress('1001 Potrero Avenue, Trauma Medical Hub');
    setReceivingBayEntrance('Ambulance Bay Bay 1-4 (North Entrance)');
    setEmergencyPhone('+1 (555) 019-9111');
    setDistanceMiles(2.5);
    setDriveTimeMin(5);
    setInNetworkStatus('In-Network (Tier 1)');
    setSpecialtiesStr('24/7 Cath Lab, Helipad, Acute Resuscitation');
    setNotes('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (pref: HospitalPreference) => {
    setEditingPref(pref);
    setName(pref.name);
    setTraumaLevel(pref.traumaLevel);
    setAddress(pref.address);
    setReceivingBayEntrance(pref.receivingBayEntrance);
    setEmergencyPhone(pref.emergencyPhone);
    setDistanceMiles(pref.distanceMiles);
    setDriveTimeMin(pref.estimatedDriveTimeMin);
    setInNetworkStatus(pref.inNetworkStatus);
    setSpecialtiesStr(pref.specialties.join(', '));
    setNotes(pref.notes || '');
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRank = editingPref ? editingPref.rankOrder : patientPreferences.length + 1;
    const isFirst = patientPreferences.length === 0;

    const saved: HospitalPreference = {
      id: editingPref?.id || `HOSP-${Date.now().toString().slice(-4)}`,
      patientId: selectedPatientId,
      patientName: selectedPatientObj.name.split(' (')[0],
      relationship: selectedPatientObj.relationship,
      rankOrder: editingPref?.rankOrder || newRank,
      isDefault: editingPref?.isDefault || isFirst,
      name: name.trim(),
      traumaLevel,
      address: address.trim(),
      receivingBayEntrance: receivingBayEntrance.trim() || 'Main Emergency Entrance',
      emergencyPhone: emergencyPhone.trim() || '+1 (555) 019-9111',
      distanceMiles: Number(distanceMiles) || 2.5,
      estimatedDriveTimeMin: Number(driveTimeMin) || 5,
      inNetworkStatus,
      specialties: specialtiesStr.split(',').map((s) => s.trim()).filter(Boolean),
      notes: notes.trim() || undefined
    };

    onSavePreference(saved);
    setShowAddModal(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0D111A] border border-[#DCE3EC] dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#DC2626] uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-[#DC2626]" />
            <span>EMERGENCY RECEIVING HOSPITAL PREFERENCES & ROUTING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B5C] dark:text-white mt-1">
            Preferred Hospitals & Trauma Center Ranking
          </h1>
          <p className="text-xs text-[#596579] dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Configure prioritized hospital destinations for yourself and each family member based on trauma level certification, specialized cardiac/stroke readiness, and network coverage.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="self-start md:self-auto px-5 py-3 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-xs flex items-center gap-2 shrink-0 hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Preferred Hospital</span>
        </button>
      </div>

      {/* Patient Selector Tabs */}
      <div className="p-2 bg-white dark:bg-[#0F131D] rounded-2xl border border-[#DCE3EC] dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto shadow-xs">
        {patientOptions.map((p) => {
          const isSelected = selectedPatientId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPatientId(p.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#082B5C] text-white shadow-xs'
                  : 'bg-[#FAFBFC] dark:bg-[#141824] text-[#596579] hover:text-[#082B5C] dark:hover:text-white border border-[#DCE3EC] dark:border-slate-800'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Hospital Preferences List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-[#596579] px-1">
          <span>
            Ranked emergency destinations for <strong className="text-[#082B5C] dark:text-white">{selectedPatientObj.name}</strong>
          </span>
          <span className="text-[#18A66A] font-bold text-[11px] flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#18A66A]" />
            <span>Automatic CAD Ambulance Dispatch Routing</span>
          </span>
        </div>

        {patientPreferences.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#0F131D] border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
            <Building2 className="w-10 h-10 text-[#596579] mx-auto mb-2" />
            <p className="text-[#082B5C] dark:text-slate-300 font-bold">No hospital preferences configured for this member</p>
            <p className="text-xs text-[#596579] dark:text-slate-500 mt-1">Dispatches default to the nearest accredited Level 1 Trauma Center.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs font-bold cursor-pointer shadow-xs"
            >
              Add 1st Choice Hospital
            </button>
          </div>
        ) : (
          patientPreferences.map((pref, idx) => {
            const isPrimary = pref.isDefault || idx === 0;

            return (
              <div
                key={pref.id}
                className={`p-5 rounded-2xl border transition-all shadow-xs space-y-3.5 ${
                  isPrimary
                    ? 'bg-white dark:bg-[#0E131E] border-[#DC2626] ring-1 ring-[#DC2626]/20'
                    : 'bg-white dark:bg-[#0F131D] border-[#DCE3EC] dark:border-slate-800 hover:border-[#DC2626]'
                }`}
              >
                {/* Header: Rank, Name, Trauma Badge, Actions */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                          isPrimary
                            ? 'bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/30'
                            : 'bg-slate-100 text-[#596579]'
                        }`}
                      >
                        {isPrimary && <Star className="w-3 h-3 fill-[#DC2626]" />}
                        <span>{isPrimary ? '1ST CHOICE (PRIMARY)' : `#${idx + 1} ALTERNATE`}</span>
                      </span>

                      <span className="text-xs font-bold text-[#D92D20] bg-[#FFF0EF] border border-[#D92D20]/20 px-2.5 py-0.5 rounded-full">
                        {pref.traumaLevel}
                      </span>

                      <span className="text-xs font-bold text-[#18A66A] bg-[#EAF8F1] border border-[#18A66A]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{pref.inNetworkStatus}</span>
                      </span>
                    </div>

                    <h2 className="text-lg font-extrabold text-[#082B5C] dark:text-white mt-1 leading-snug">
                      {pref.name}
                    </h2>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isPrimary && (
                      <button
                        onClick={() => onSetPrimary(pref.id, selectedPatientId)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-[#DCE3EC] text-[#082B5C] hover:text-[#DC2626] hover:border-[#DC2626] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                        title="Set as 1st Choice primary hospital"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                        <span>Set as Primary</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(pref)}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-[#596579] hover:text-[#082B5C] dark:text-slate-300 transition-colors cursor-pointer border border-[#DCE3EC]"
                      title="Edit hospital preference"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePreference(pref.id)}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-[#FFF0EF] text-[#596579] hover:text-[#D92D20] transition-colors cursor-pointer border border-[#DCE3EC]"
                      title="Remove preference"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Distance, ETA, Address, and Emergency Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAFBFC] dark:bg-[#090C12] border border-[#DCE3EC] dark:border-slate-800/80 flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#DC2626] shrink-0" />
                    <div>
                      <span className="text-[10px] text-[#596579] uppercase font-bold block">DISTANCE & ETA</span>
                      <span className="font-bold text-[#082B5C] dark:text-white font-mono">
                        {pref.distanceMiles} miles · ~{pref.estimatedDriveTimeMin} mins (Lights & Sirens)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAFBFC] dark:bg-[#090C12] border border-[#DCE3EC] dark:border-slate-800/80 flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-[#2F80C9] shrink-0" />
                    <div className="truncate">
                      <span className="text-[10px] text-[#596579] uppercase font-bold block">AMBULANCE BAY ENTRANCE</span>
                      <span className="font-bold text-[#082B5C] dark:text-slate-200 truncate block">{pref.receivingBayEntrance}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAFBFC] dark:bg-[#090C12] border border-[#DCE3EC] dark:border-slate-800/80 flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-[#18A66A] shrink-0" />
                    <div>
                      <span className="text-[10px] text-[#596579] uppercase font-bold block">TRAUMA TRIAGE DIRECT TEL</span>
                      <span className="font-bold text-[#082B5C] dark:text-white font-mono">{pref.emergencyPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Specialties Badges */}
                {pref.specialties.length > 0 && (
                  <div>
                    <span className="text-[10px] text-[#596579] font-bold uppercase tracking-wider block mb-1">
                      Emergency Capabilities & Facilities
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {pref.specialties.map((spec, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded-full bg-[#EAF4FF] border border-[#2F80C9]/20 text-[11px] text-[#082B5C] font-semibold"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Routing Notes */}
                {pref.notes && (
                  <div className="p-2.5 rounded-xl bg-[#EAF4FF] border border-[#2F80C9]/20 text-[11px] text-[#082B5C]">
                    <strong className="text-[#2F80C9]">Clinical Routing Note: </strong>
                    {pref.notes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F131D] border border-[#DCE3EC] dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 bg-[#FAFBFC] dark:bg-[#141826] border-b border-[#DCE3EC] dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF4FF] border border-[#2F80C9]/30 flex items-center justify-center text-[#2F80C9]">
                  <Building2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-[#082B5C] dark:text-white">
                  {editingPref ? 'Edit Preferred Hospital' : 'Add Preferred Hospital'}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-[#596579] hover:text-[#082B5C] dark:text-slate-400 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 overflow-y-auto text-xs">
              <div>
                <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Hospital / Trauma Center Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. St. Jude Comprehensive Trauma Center"
                  className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-[#082B5C] dark:text-white focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Trauma Certification Tier</label>
                  <select
                    value={traumaLevel}
                    onChange={(e) => setTraumaLevel(e.target.value as any)}
                    className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-[#082B5C] dark:text-white focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden cursor-pointer"
                  >
                    <option value="Level 1 Trauma">Level 1 Trauma</option>
                    <option value="Level 2 Regional Trauma">Level 2 Regional Trauma</option>
                    <option value="Level 1 Pediatric Trauma">Level 1 Pediatric Trauma</option>
                    <option value="Comprehensive Stroke & Cardiac">Comprehensive Stroke & Cardiac</option>
                    <option value="Community Emergency">Community Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">In-Network Insurance Status</label>
                  <select
                    value={inNetworkStatus}
                    onChange={(e) => setInNetworkStatus(e.target.value as any)}
                    className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-[#082B5C] dark:text-white focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden cursor-pointer"
                  >
                    <option value="In-Network (Tier 1)">In-Network (Tier 1)</option>
                    <option value="In-Network (Tier 2)">In-Network (Tier 2)</option>
                    <option value="Emergency In-Network Parity">Emergency In-Network Parity</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Distance (miles)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={distanceMiles}
                    onChange={(e) => setDistanceMiles(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-[#082B5C] dark:text-white focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Estimated Drive Time (mins)</label>
                  <input
                    type="number"
                    value={driveTimeMin}
                    onChange={(e) => setDriveTimeMin(Number(e.target.value))}
                    className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-[#082B5C] dark:text-white focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Receiving Ambulance Bay Entrance Address</label>
                <input
                  type="text"
                  value={receivingBayEntrance}
                  onChange={(e) => setReceivingBayEntrance(e.target.value)}
                  placeholder="e.g. Ambulance Bay Bay 1-4 (North Entrance via 22nd St)"
                  className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-[#082B5C] dark:text-white focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Emergency Triage Direct Phone</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 019-9111"
                  className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-[#082B5C] dark:text-white focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Clinical Capabilities / Specialties (comma separated)</label>
                <input
                  type="text"
                  value={specialtiesStr}
                  onChange={(e) => setSpecialtiesStr(e.target.value)}
                  placeholder="e.g. 24/7 Cath Lab, Helipad, Burn Unit, ECMO"
                  className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-[#082B5C] dark:text-white focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Clinical Routing Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Preferred for father due to pacemaker history with Dr. Chen"
                  className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-[#082B5C] dark:text-white focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] outline-hidden"
                />
              </div>

              <div className="pt-2 border-t border-[#DCE3EC] dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#DCE3EC] text-[#596579] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-white font-bold shadow-xs cursor-pointer"
                >
                  Save Hospital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
