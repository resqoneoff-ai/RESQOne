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
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121824] to-[#0A0E17] border border-blue-900/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>EMERGENCY RECEIVING HOSPITAL PREFERENCES & ROUTING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Preferred Hospitals & Trauma Center Ranking
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Configure prioritized hospital destinations for yourself and each family member based on trauma level certification, specialized cardiac/stroke readiness, and network coverage.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="self-start md:self-auto px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-2 shrink-0 hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Preferred Hospital</span>
        </button>
      </div>

      {/* Patient Selector Tabs */}
      <div className="p-2 bg-[#0F131D] rounded-xl border border-slate-800 flex items-center gap-1.5 overflow-x-auto">
        {patientOptions.map((p) => {
          const isSelected = selectedPatientId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPatientId(p.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md font-bold'
                  : 'bg-[#141824] text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Hospital Preferences List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Ranked emergency destinations for <strong className="text-white">{selectedPatientObj.name}</strong>
          </span>
          <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Automatic CAD Ambulance Dispatch Routing</span>
          </span>
        </div>

        {patientPreferences.length === 0 ? (
          <div className="p-10 text-center rounded-2xl bg-[#0F131D] border border-slate-800">
            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-300 font-bold">No hospital preferences configured for this member</p>
            <p className="text-xs text-slate-500 mt-1">Dispatches default to the nearest accredited Level 1 Trauma Center.</p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold"
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
                className={`p-5 rounded-2xl border transition-all shadow-xl space-y-3.5 ${
                  isPrimary
                    ? 'bg-gradient-to-br from-[#121826] to-[#0A0E18] border-blue-500/80 ring-1 ring-blue-500/30'
                    : 'bg-[#0F131D] border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header: Rank, Name, Trauma Badge, Actions */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded flex items-center gap-1 ${
                          isPrimary
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isPrimary && <Star className="w-3 h-3 fill-white" />}
                        <span>{isPrimary ? '1ST CHOICE (PRIMARY)' : `#${idx + 1} ALTERNATE`}</span>
                      </span>

                      <span className="text-xs font-mono font-bold text-red-400 bg-red-950/80 border border-red-900/80 px-2 py-0.5 rounded">
                        {pref.traumaLevel}
                      </span>

                      <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-900/80 px-2 py-0.5 rounded flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{pref.inNetworkStatus}</span>
                      </span>
                    </div>

                    <h2 className="text-lg font-black text-white mt-1 leading-snug">
                      {pref.name}
                    </h2>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isPrimary && (
                      <button
                        onClick={() => onSetPrimary(pref.id, selectedPatientId)}
                        className="px-3 py-1.5 rounded-lg bg-blue-950/80 border border-blue-800 text-blue-300 hover:text-white hover:bg-blue-900 text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Set as 1st Choice primary hospital"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                        <span>Set as Primary</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(pref)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Edit hospital preference"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeletePreference(pref.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                      title="Remove preference"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Distance, ETA, Address, and Emergency Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#090C12] border border-slate-800/80 flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-red-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">DISTANCE & ETA</span>
                      <span className="font-bold text-white font-mono">
                        {pref.distanceMiles} miles · ~{pref.estimatedDriveTimeMin} mins (Lights & Sirens)
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#090C12] border border-slate-800/80 flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="truncate">
                      <span className="text-[10px] text-slate-400 font-mono block">AMBULANCE BAY ENTRANCE</span>
                      <span className="font-bold text-slate-200 truncate block">{pref.receivingBayEntrance}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#090C12] border border-slate-800/80 flex items-center gap-2.5">
                    <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">TRAUMA TRIAGE DIRECT TEL</span>
                      <span className="font-bold text-white font-mono">{pref.emergencyPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Specialties Badges */}
                {pref.specialties.length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                      Emergency Capabilities & Facilities
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {pref.specialties.map((spec, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded-md bg-[#141824] border border-slate-800 text-[11px] text-slate-300 font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Routing Notes */}
                {pref.notes && (
                  <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-900/50 text-[11px] text-blue-200">
                    <strong className="text-blue-400">Clinical Routing Note: </strong>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0F131D] border border-blue-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 bg-[#141826] border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">
                  {editingPref ? 'Edit Preferred Hospital' : 'Add Preferred Hospital'}
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 overflow-y-auto text-xs">
              <div>
                <label className="text-[11px] text-slate-300 font-bold block mb-1">Hospital / Trauma Center Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. St. Jude Comprehensive Trauma Center"
                  className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">Trauma Certification Tier</label>
                  <select
                    value={traumaLevel}
                    onChange={(e) => setTraumaLevel(e.target.value as any)}
                    className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Level 1 Trauma">Level 1 Trauma</option>
                    <option value="Level 2 Regional Trauma">Level 2 Regional Trauma</option>
                    <option value="Level 1 Pediatric Trauma">Level 1 Pediatric Trauma</option>
                    <option value="Comprehensive Stroke & Cardiac">Comprehensive Stroke & Cardiac</option>
                    <option value="Community Emergency">Community Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">In-Network Insurance Status</label>
                  <select
                    value={inNetworkStatus}
                    onChange={(e) => setInNetworkStatus(e.target.value as any)}
                    className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="In-Network (Tier 1)">In-Network (Tier 1)</option>
                    <option value="In-Network (Tier 2)">In-Network (Tier 2)</option>
                    <option value="Emergency In-Network Parity">Emergency In-Network Parity</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">Distance (miles)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={distanceMiles}
                    onChange={(e) => setDistanceMiles(Number(e.target.value))}
                    className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-300 font-bold block mb-1">Estimated Drive Time (mins)</label>
                  <input
                    type="number"
                    value={driveTimeMin}
                    onChange={(e) => setDriveTimeMin(Number(e.target.value))}
                    className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-bold block mb-1">Receiving Ambulance Bay Entrance Address</label>
                <input
                  type="text"
                  value={receivingBayEntrance}
                  onChange={(e) => setReceivingBayEntrance(e.target.value)}
                  placeholder="e.g. Ambulance Bay Bay 1-4 (North Entrance via 22nd St)"
                  className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-bold block mb-1">Emergency Triage Direct Phone</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 019-9111"
                  className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-bold block mb-1">Clinical Capabilities / Specialties (comma separated)</label>
                <input
                  type="text"
                  value={specialtiesStr}
                  onChange={(e) => setSpecialtiesStr(e.target.value)}
                  placeholder="e.g. 24/7 Cath Lab, Helipad, Burn Unit, ECMO"
                  className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-300 font-bold block mb-1">Clinical Routing Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Preferred for father due to pacemaker history with Dr. Chen"
                  className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold"
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
