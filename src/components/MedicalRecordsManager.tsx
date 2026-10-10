import React, { useState } from 'react';
import {
  MedicalRecord,
  MedicalRecordCategory,
  FamilyMemberProfile,
  UserEmergencyProfile
} from '../types/emergency';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  ShieldCheck,
  Building,
  User,
  Calendar,
  Paperclip,
  CheckCircle2,
  Clock,
  Printer,
  ChevronDown
} from 'lucide-react';
import { MedicalRecordEditModal } from './MedicalRecordEditModal';

interface MedicalRecordsManagerProps {
  records: MedicalRecord[];
  currentUser: UserEmergencyProfile;
  familyProfiles: FamilyMemberProfile[];
  onSaveRecord: (record: MedicalRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClose?: () => void;
}

const CATEGORIES: Array<'ALL' | MedicalRecordCategory> = [
  'ALL',
  'Surgical & Procedures',
  'Cardiology & ECG',
  'Hospitalization & Discharge',
  'Emergency Dispatch & Handover',
  'Diagnostic & Imaging',
  'Lab Pathology',
  'Prescription & Therapy'
];

export const MedicalRecordsManager: React.FC<MedicalRecordsManagerProps> = ({
  records,
  currentUser,
  familyProfiles,
  onSaveRecord,
  onDeleteRecord,
  onClose
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | MedicalRecordCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<MedicalRecord | null>(null);

  const currentUserName = currentUser?.fullName || 'Myself';
  const currentUserId = currentUser?.id || 'self-user';

  // Available patient filter options
  const patientsList = [
    { id: 'ALL', label: 'All Patients' },
    { id: currentUserId, label: `${currentUserName} (Self)` },
    ...(familyProfiles || []).map((f) => ({
      id: f.id,
      label: `${f.name} (${f.relationship})`
    }))
  ];

  // Filtering records
  const filteredRecords = records.filter((rec) => {
    if (selectedPatientId !== 'ALL' && rec.patientId !== selectedPatientId) return false;
    if (selectedCategory !== 'ALL' && rec.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = rec.title.toLowerCase().includes(q);
      const matchDiag = rec.diagnosis.toLowerCase().includes(q);
      const matchDoc = rec.attendingDoctor.toLowerCase().includes(q);
      const matchFac = rec.facility.toLowerCase().includes(q);
      const matchSum = rec.clinicalSummary.toLowerCase().includes(q);
      const matchPatient = rec.patientName.toLowerCase().includes(q);
      if (!matchTitle && !matchDiag && !matchDoc && !matchFac && !matchSum && !matchPatient) {
        return false;
      }
    }
    return true;
  });

  const handleOpenAdd = () => {
    setRecordToEdit(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (rec: MedicalRecord) => {
    setRecordToEdit(rec);
    setIsEditModalOpen(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0D111A] border border-[#DCE3EC] dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#DC2626] uppercase tracking-wider">
            <FileText className="w-4 h-4 text-[#DC2626]" />
            <span>PAST MEDICAL RECORDS & CLINICAL HISTORY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B5C] dark:text-white mt-1">
            Clinical Records & Emergency Handover Archive
          </h1>
          <p className="text-xs text-[#596579] dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage, update, and append verified medical records, past surgeries, cardiology diagnostics, and emergency CAD dispatch reports for yourself and family members.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="self-start md:self-auto px-5 py-3 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-xs flex items-center gap-2 shrink-0 hover:scale-[1.02] active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Medical Record</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#0F131D] border border-[#DCE3EC] dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Patient Selector Filter */}
          <div className="w-full md:w-64">
            <label className="text-[10px] font-bold text-[#596579] uppercase tracking-wider block mb-1">
              Filter by Patient
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-[#FAFBFC] dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-[#172033] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626]"
            >
              {patientsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Field */}
          <div className="flex-1">
            <label className="text-[10px] font-bold text-[#596579] uppercase tracking-wider block mb-1">
              Search Records
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#596579]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by diagnosis, procedure title, attending doctor, or hospital..."
                className="w-full bg-[#FAFBFC] dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-[#172033] dark:text-white placeholder-[#596579] focus:outline-none focus:ring-1 focus:ring-[#DC2626] focus:border-[#DC2626]"
              />
            </div>
          </div>
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="pt-2 border-t border-[#DCE3EC] dark:border-slate-800/70 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-bold text-[#596579] uppercase shrink-0 mr-1">
            Category:
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#082B5C] text-white shadow-xs'
                    : 'bg-[#FAFBFC] dark:bg-[#141824] text-[#596579] dark:text-slate-400 hover:text-[#082B5C] dark:hover:text-white border border-[#DCE3EC] dark:border-slate-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Records Count & Status */}
      <div className="flex items-center justify-between text-xs text-[#596579] px-1">
        <span>
          Showing <strong className="text-[#082B5C] dark:text-white">{filteredRecords.length}</strong> of{' '}
          <span>{records.length}</span> verified medical records
        </span>
        <span className="text-[#18A66A] flex items-center gap-1 font-bold text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active in Telemetry Dispatch Dossier</span>
        </span>
      </div>

      {/* Medical Records Cards List */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#0F131D] border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
            <FileText className="w-10 h-10 text-[#596579] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#082B5C] dark:text-white">No medical records found</h3>
            <p className="text-xs text-[#596579] dark:text-slate-400 mt-1 max-w-sm mx-auto">
              No clinical history matches your current filter criteria. You can add a new past record at any time.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 rounded-lg bg-[#DC2626] hover:bg-[#EF4444] text-white text-xs font-bold"
            >
              Add First Record
            </button>
          </div>
        ) : (
          filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#0F131D] border border-[#DCE3EC] dark:border-slate-800 hover:border-[#DC2626] transition-all shadow-xs space-y-3.5"
            >
              {/* Card Top: Title, Patient, Category, Actions */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#082B5C] bg-[#EAF4FF] border border-[#2F80C9]/30 px-2 py-0.5 rounded">
                      #{rec.id}
                    </span>
                    <span className="text-xs font-bold text-[#2F80C9] bg-[#EAF4FF] border border-[#2F80C9]/30 px-2 py-0.5 rounded">
                      {rec.patientName} ({rec.relationship})
                    </span>
                    <span className="text-xs text-[#596579] font-semibold">
                      {rec.category}
                    </span>
                    {rec.relevantForEmergency && (
                      <span className="text-[10px] font-bold text-[#18A66A] bg-[#EAF8F1] border border-[#18A66A]/30 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-[#18A66A]" />
                        <span>EMS Dossier Armed</span>
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg font-extrabold text-[#082B5C] dark:text-white mt-1 leading-snug">
                    {rec.title}
                  </h2>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(rec)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#082B5C] dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#DCE3EC] dark:border-slate-700"
                    title="Edit and update this medical record"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#2F80C9]" />
                    <span>Update Record</span>
                  </button>
                  <button
                    onClick={() => onDeleteRecord(rec.id)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#FFF0EF] text-[#596579] hover:text-[#D92D20] transition-colors border border-[#DCE3EC] dark:border-slate-700"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Facility, Doctor, and Date Strip */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#596579] pt-1 pb-2 border-b border-[#DCE3EC] dark:border-slate-800/80">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#DC2626]" />
                  <span className="font-bold text-[#082B5C] dark:text-slate-200">{rec.date}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#596579]" />
                  <span className="text-[#172033] dark:text-slate-300 font-medium">{rec.facility}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#596579]" />
                  <span className="text-[#172033] dark:text-slate-300">{rec.attendingDoctor}</span>
                </span>
              </div>

              {/* Diagnosis & Summary */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FAFBFC] dark:bg-[#090C12] border border-[#DCE3EC] dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-[#082B5C] uppercase tracking-wider block mb-0.5">
                    Official Clinical Diagnosis
                  </span>
                  <p className="font-bold text-[#082B5C] dark:text-slate-100 text-sm">{rec.diagnosis}</p>
                </div>

                <div className="text-[#172033] dark:text-slate-300 leading-relaxed text-xs">
                  <span className="font-semibold text-[#596579] block text-[11px] mb-0.5">Clinical Summary:</span>
                  <p>{rec.clinicalSummary}</p>
                </div>

                {rec.findingsOrResults && (
                  <div className="p-2 rounded-lg bg-[#FAFBFC] dark:bg-slate-900/60 border border-[#DCE3EC] dark:border-slate-800 text-[11px] text-[#596579] dark:text-slate-300">
                    <strong className="text-[#082B5C] dark:text-slate-400">Diagnostic Findings: </strong>
                    {rec.findingsOrResults}
                  </div>
                )}
              </div>

              {/* Prescribed Medications */}
              {rec.medicationsPrescribed.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-[#596579] uppercase tracking-wider block mb-1">
                    Documented Medications & Regimen
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.medicationsPrescribed.map((med, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-[#FAFBFC] dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700/80 text-xs text-[#082B5C] dark:text-slate-200 font-bold"
                      >
                        {med}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments & Last Updated Footer */}
              <div className="pt-3 border-t border-[#DCE3EC] dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#596579]">
                <div className="flex flex-wrap items-center gap-2">
                  {rec.attachments && rec.attachments.length > 0 ? (
                    rec.attachments.map((att, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAFBFC] dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-800 text-[11px] text-[#596579] hover:text-[#082B5C] transition-colors"
                      >
                        <Paperclip className="w-3 h-3 text-[#DC2626]" />
                        <span className="font-medium truncate max-w-[180px]">{att.name}</span>
                        <span className="text-[#596579] text-[9px]">({att.size})</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[#596579] text-[11px]">No external file attached</span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 text-[11px] text-[#596579]">
                  <span>Last Updated: {rec.lastUpdated}</span>
                  <button
                    onClick={() => window.print()}
                    className="hover:text-[#082B5C] flex items-center gap-1 transition-colors"
                    title="Print clinical summary"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Add Modal */}
      <MedicalRecordEditModal
        isOpen={isEditModalOpen}
        recordToEdit={recordToEdit}
        currentUser={currentUser}
        familyProfiles={familyProfiles}
        onClose={() => setIsEditModalOpen(false)}
        onSaveRecord={onSaveRecord}
      />
    </div>
  );
};
