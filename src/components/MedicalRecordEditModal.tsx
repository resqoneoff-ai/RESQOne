import React, { useState, useEffect } from 'react';
import { MedicalRecord, MedicalRecordCategory, FamilyMemberProfile, UserEmergencyProfile } from '../types/emergency';
import { FileText, X, Check, Building, User, Calendar, ShieldCheck, AlertCircle, Paperclip, Plus, Trash2 } from 'lucide-react';

interface MedicalRecordEditModalProps {
  isOpen: boolean;
  recordToEdit: MedicalRecord | null;
  currentUser: UserEmergencyProfile;
  familyProfiles: FamilyMemberProfile[];
  onClose: () => void;
  onSaveRecord: (savedRecord: MedicalRecord) => void;
}

const CATEGORIES: MedicalRecordCategory[] = [
  'Surgical & Procedures',
  'Cardiology & ECG',
  'Hospitalization & Discharge',
  'Emergency Dispatch & Handover',
  'Diagnostic & Imaging',
  'Lab Pathology',
  'Prescription & Therapy'
];

export const MedicalRecordEditModal: React.FC<MedicalRecordEditModalProps> = ({
  isOpen,
  recordToEdit,
  currentUser,
  familyProfiles,
  onClose,
  onSaveRecord
}) => {
  const isEditing = Boolean(recordToEdit);

  const currentUserName = currentUser?.fullName || 'Myself';
  const currentUserId = currentUser?.id || 'self-user';

  // Available patients
  const patientOptions = [
    { id: currentUserId, name: `${currentUserName} (Self)`, relationship: 'Self', rawName: currentUserName },
    ...(familyProfiles || []).map((f) => ({
      id: f.id,
      name: `${f.name} (${f.relationship})`,
      relationship: f.relationship,
      rawName: f.name
    }))
  ];

  const [patientId, setPatientId] = useState<string>(currentUserId);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MedicalRecordCategory>('Surgical & Procedures');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [facility, setFacility] = useState('');
  const [attendingDoctor, setAttendingDoctor] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalSummary, setClinicalSummary] = useState('');
  const [medsStr, setMedsStr] = useState('');
  const [findings, setFindings] = useState('');
  const [relevantForEmergency, setRelevantForEmergency] = useState(true);
  const [attachments, setAttachments] = useState<Array<{ name: string; size: string; type: string }>>([]);
  const [newAttachmentName, setNewAttachmentName] = useState('');

  // Sync form when recordToEdit changes
  useEffect(() => {
    if (recordToEdit) {
      setPatientId(recordToEdit.patientId);
      setTitle(recordToEdit.title);
      setCategory(recordToEdit.category);
      setDate(recordToEdit.date);
      setFacility(recordToEdit.facility);
      setAttendingDoctor(recordToEdit.attendingDoctor);
      setDiagnosis(recordToEdit.diagnosis);
      setClinicalSummary(recordToEdit.clinicalSummary);
      setMedsStr(recordToEdit.medicationsPrescribed.join(', '));
      setFindings(recordToEdit.findingsOrResults || '');
      setRelevantForEmergency(recordToEdit.relevantForEmergency);
      setAttachments(recordToEdit.attachments || []);
    } else {
      // Reset for new record
      setPatientId(currentUser.id);
      setTitle('');
      setCategory('Surgical & Procedures');
      setDate(new Date().toISOString().split('T')[0]);
      setFacility('Metro Health Academic Medical Pavilion');
      setAttendingDoctor('');
      setDiagnosis('');
      setClinicalSummary('');
      setMedsStr('');
      setFindings('');
      setRelevantForEmergency(true);
      setAttachments([]);
    }
  }, [recordToEdit, currentUser, isOpen]);

  if (!isOpen) return null;

  const handleAddAttachment = () => {
    if (!newAttachmentName.trim()) return;
    const name = newAttachmentName.trim();
    const ext = name.split('.').pop()?.toUpperCase() || 'PDF';
    setAttachments((prev) => [...prev, { name, size: '1.2 MB', type: ext }]);
    setNewAttachmentName('');
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !diagnosis.trim() || !facility.trim()) return;

    const selectedPatient = patientOptions.find((p) => p.id === patientId) || patientOptions[0];

    const saved: MedicalRecord = {
      id: recordToEdit?.id || `REC-${Date.now().toString().slice(-4)}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.rawName,
      relationship: selectedPatient.relationship,
      title: title.trim(),
      category,
      date,
      facility: facility.trim(),
      attendingDoctor: attendingDoctor.trim() || 'Attending Physician',
      diagnosis: diagnosis.trim(),
      clinicalSummary: clinicalSummary.trim() || 'Clinical documentation recorded in verified patient health file.',
      medicationsPrescribed: medsStr.trim()
        ? medsStr.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      findingsOrResults: findings.trim() || undefined,
      relevantForEmergency,
      lastUpdated: new Date().toISOString().split('T')[0],
      attachments: attachments.length > 0 ? attachments : undefined
    };

    onSaveRecord(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0F131D] border border-red-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#141826] border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#FF2B44]" />
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? 'Update Past Medical Record' : 'Add Past Medical Record'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isEditing
                  ? `Editing record #${recordToEdit?.id} for ${recordToEdit?.patientName}`
                  : 'Log surgical, diagnostic, or emergency history for yourself or family'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          {/* Patient Selection & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-300 font-bold block mb-1">
                Patient / Profile
              </label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#FF2B44]"
              >
                {patientOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-bold block mb-1">
                Clinical Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MedicalRecordCategory)}
                className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FF2B44]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Record Title */}
          <div>
            <label className="text-[11px] text-slate-300 font-bold block mb-1">
              Record Title / Procedure Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Percutaneous Coronary Intervention with Drug-Eluting Stent (LAD)"
              className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2B44]"
            />
          </div>

          {/* Date, Facility & Doctor */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-300 font-bold block mb-1">
                Event / Procedure Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#FF2B44]"
              >
              </input>
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-bold block mb-1">
                Hospital / Facility *
              </label>
              <input
                type="text"
                required
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                placeholder="e.g. Metro Health Cardiac Institute"
                className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2B44]"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-300 font-bold block mb-1">
                Attending Physician / Surgeon
              </label>
              <input
                type="text"
                value={attendingDoctor}
                onChange={(e) => setAttendingDoctor(e.target.value)}
                placeholder="e.g. Dr. Marcus Chen, MD"
                className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2B44]"
              />
            </div>
          </div>

          {/* Official Diagnosis */}
          <div>
            <label className="text-[11px] text-slate-300 font-bold block mb-1">
              Primary Diagnosis / Clinical Indication *
            </label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. 90% Proximal LAD Stenosis · Unstable Angina"
              className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2B44]"
            />
          </div>

          {/* Clinical Summary */}
          <div>
            <label className="text-[11px] text-slate-300 font-bold block mb-1">
              Clinical Summary / Operative Notes
            </label>
            <textarea
              rows={3}
              value={clinicalSummary}
              onChange={(e) => setClinicalSummary(e.target.value)}
              placeholder="Details of surgical procedure, complications, recovery course, or discharge guidance..."
              className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2B44]"
            />
          </div>

          {/* Medications Prescribed */}
          <div>
            <label className="text-[11px] text-slate-300 font-bold block mb-1">
              Medications Prescribed / Dosage (comma separated)
            </label>
            <input
              type="text"
              value={medsStr}
              onChange={(e) => setMedsStr(e.target.value)}
              placeholder="e.g. Clopidogrel 75mg daily, Atorvastatin 40mg, Lisinopril 20mg"
              className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2B44]"
            />
          </div>

          {/* Diagnostic Findings */}
          <div>
            <label className="text-[11px] text-slate-300 font-bold block mb-1">
              Diagnostic Findings / Objective Test Results
            </label>
            <input
              type="text"
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              placeholder="e.g. Pacing threshold RA 0.75V, TIMI 3 flow, FEV1: 94% predicted"
              className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2B44]"
            />
          </div>

          {/* Emergency Dispatch Dossier Toggle */}
          <div className="p-3.5 rounded-xl bg-[#141824] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-bold text-white text-xs block">
                  Include in Emergency Dispatch Dossier
                </span>
                <span className="text-[11px] text-slate-400">
                  When enabled, paramedics and trauma doctors will receive this record in their pre-arrival telemetry packet.
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={relevantForEmergency}
                onChange={(e) => setRelevantForEmergency(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Attachments Section */}
          <div className="p-3.5 rounded-xl bg-[#141824] border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                <span>Clinical Documents & Lab Attachments</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {attachments.length} attached
              </span>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {attachments.map((att, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#0C0F17] border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                        {att.type}
                      </span>
                      <span className="text-slate-200 truncate">{att.name}</span>
                      <span className="text-slate-500 font-mono text-[10px]">({att.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(i)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newAttachmentName}
                onChange={(e) => setNewAttachmentName(e.target.value)}
                placeholder="e.g. Operative_Discharge_Summary_2024.pdf"
                className="flex-1 bg-[#0C0F17] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
              />
              <button
                type="button"
                onClick={handleAddAttachment}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Attach</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-[#FF2B44] hover:bg-red-600 text-white font-bold transition-all shadow-[0_0_15px_rgba(255,43,68,0.4)] flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Save Medical Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
