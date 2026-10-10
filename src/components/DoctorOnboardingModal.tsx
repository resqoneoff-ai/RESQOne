import React, { useState } from 'react';
import {
  Stethoscope,
  ShieldCheck,
  Building2,
  CheckCircle2,
  X,
  FileText,
  User,
  Mail,
  Phone,
  Award,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { supabaseDataService } from '../services/supabaseDataService';
import { emergencyService } from '../services/emergencyService';
import { DoctorOnboardingRequest } from '../types/roles';

interface DoctorOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (request: DoctorOnboardingRequest) => void;
}

const SPECIALTIES = [
  'Emergency Medicine & Acute Resuscitation',
  'Trauma Surgery & Critical Care',
  'Interventional Cardiology & STEMI',
  'Pediatric Emergency Medicine',
  'Neurology & Acute Stroke Protocol',
  'Anesthesiology & Airway Management',
  'Orthopedic Trauma Surgery',
  'Internal Medicine / Hospitalist'
];

export const DoctorOnboardingModal: React.FC<DoctorOnboardingModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState(SPECIALTIES[0]);
  const [experienceYears, setExperienceYears] = useState(10);
  const [hospitalAffiliation, setHospitalAffiliation] = useState('Metro Health System');
  const [qualifications, setQualifications] = useState('MD, Board Certified Emergency Medicine');
  const [telemetryPreference, setTelemetryPreference] = useState('CAD Live Video & Resuscitation Guidance');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<DoctorOnboardingRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !email.trim() || !licenseNumber.trim() || !hospitalAffiliation.trim()) {
      setErrorMessage('Please fill in all required physician credential fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await supabaseDataService.submitDoctorOnboardingRequest({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || '+1 (555) 019-4820',
        registrationNumber: licenseNumber.trim(),
        specialization,
        experienceYears: Number(experienceYears) || 5,
        hospitalAffiliation: hospitalAffiliation.trim(),
        qualifications: qualifications.trim(),
        telemetryPreference,
        notes: notes.trim()
      });

      if (result.success && result.request) {
        setSubmittedRequest(result.request);

        // Add audit log
        emergencyService.addAuditLog(
          { id: result.request.id, name: result.request.fullName, role: 'DOCTOR' },
          'DOCTOR_ONBOARDING_REQUESTED',
          'DOCTOR',
          result.request.registrationNumber,
          undefined,
          {
            specialization,
            hospital: hospitalAffiliation,
            license: licenseNumber
          }
        );

        if (onSuccess) onSuccess(result.request);
      } else {
        setErrorMessage(result.error || 'Failed to submit onboarding request.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmittedRequest(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0D111A] border border-[#DCE3EC] dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAFBFC] dark:bg-[#111726] border-b border-[#DCE3EC] dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EAF8F1] dark:bg-emerald-950/80 border border-[#18A66A]/30 flex items-center justify-center text-[#18A66A]">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#EAF8F1] border border-[#18A66A]/30 text-[#18A66A]">
                  CLINICAL NETWORK
                </span>
                <span className="text-[11px] text-[#596579] dark:text-slate-400">Physician Onboarding</span>
              </div>
              <h2 className="text-lg font-extrabold text-[#082B5C] dark:text-white tracking-tight mt-0.5">
                Join RESQ ONE Emergency Care Network
              </h2>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-[#596579] hover:text-[#082B5C] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {submittedRequest ? (
            /* Success confirmation screen */
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-[#EAF8F1] dark:bg-emerald-950 border border-[#18A66A]/40 flex items-center justify-center mx-auto text-[#18A66A] shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold text-[#18A66A] uppercase tracking-wider">
                  APPLICATION SUBMITTED SUCCESSFULLY
                </span>
                <h3 className="text-xl font-extrabold text-[#082B5C] dark:text-white mt-1">
                  Credentialing Review in Progress
                </h3>
                <p className="text-xs text-[#596579] dark:text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                  Thank you, <strong>{submittedRequest.fullName}</strong>. Your medical license (
                  <span className="font-mono text-[#082B5C] dark:text-emerald-300 font-bold">{submittedRequest.registrationNumber}</span>) has been queued for credential verification with the RESQ ONE Medical Command Board.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#FAFBFC] dark:bg-black/50 border border-[#DCE3EC] dark:border-slate-800 text-left text-xs space-y-2 shadow-xs">
                <div className="flex justify-between items-center text-[#596579] dark:text-slate-400 border-b border-[#DCE3EC] dark:border-slate-800/80 pb-1.5">
                  <span>Application Reference ID</span>
                  <span className="font-mono text-[#082B5C] dark:text-white font-bold">{submittedRequest.id}</span>
                </div>
                <div className="flex justify-between items-center text-[#596579] dark:text-slate-400 border-b border-[#DCE3EC] dark:border-slate-800/80 pb-1.5">
                  <span>Specialty</span>
                  <span className="text-[#082B5C] dark:text-white font-medium">{submittedRequest.specialization}</span>
                </div>
                <div className="flex justify-between items-center text-[#596579] dark:text-slate-400 border-b border-[#DCE3EC] dark:border-slate-800/80 pb-1.5">
                  <span>Hospital Affiliation</span>
                  <span className="text-[#082B5C] dark:text-white font-medium">{submittedRequest.hospitalAffiliation}</span>
                </div>
                <div className="flex justify-between items-center text-[#596579] dark:text-slate-400">
                  <span>Status</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/30">
                    PENDING VERIFICATION
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EAF4FF] dark:bg-slate-900/60 border border-[#2F80C9]/20 dark:border-slate-800 text-xs text-[#082B5C] dark:text-slate-400 flex items-start gap-2 max-w-md mx-auto text-left">
                <Clock className="w-4 h-4 text-[#2F80C9] shrink-0 mt-0.5" />
                <span>
                  Admin approval will unlock your <strong>Doctor Telemetry Portal</strong>, real-time triage queues, and direct ambulance video links.
                </span>
              </div>

              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#EAF8F1] dark:bg-emerald-950/40 border border-[#18A66A]/30 text-xs text-[#18A66A] dark:text-emerald-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#18A66A] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Physicians on RESQ ONE provide direct pre-hospital video triage, ECG telemetry interpretation, and trauma handover guidance. All applicants undergo state licensing validation.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-[#FFF0EF] border border-[#D92D20]/30 text-xs text-[#D92D20] flex items-start gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-[#D92D20] shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Physician Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#082B5C] dark:text-slate-300">
                    Full Legal Name & Title *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#596579] absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Julian Vance, MD"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-black/60 border border-[#DCE3EC] dark:border-slate-700 text-xs text-[#082B5C] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#082B5C] dark:text-slate-300">
                    Professional Medical Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#596579] absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. j.vance@hospital.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-black/60 border border-[#DCE3EC] dark:border-slate-700 text-xs text-[#082B5C] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & License # */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#082B5C] dark:text-slate-300">
                    Direct Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#596579] absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 019-4820"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-black/60 border border-[#DCE3EC] dark:border-slate-700 text-xs text-[#082B5C] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#082B5C] dark:text-slate-300">
                    State License / NPI / Registration # *
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-[#596579] absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. MD-98214-CAL or NPI #10928471"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-black/60 border border-[#DCE3EC] dark:border-slate-700 text-xs text-[#082B5C] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Specialty & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#082B5C] dark:text-slate-300">Primary Specialty</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/60 border border-[#DCE3EC] dark:border-slate-700 text-xs text-[#082B5C] dark:text-white focus:outline-hidden focus:border-[#DC2626] cursor-pointer"
                  >
                    {SPECIALTIES.map((spec) => (
                      <option key={spec} value={spec} className="bg-white dark:bg-slate-900 text-[#082B5C] dark:text-white">
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#082B5C] dark:text-slate-300">
                    Clinical Experience (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/60 border border-[#DCE3EC] dark:border-slate-700 text-xs text-[#082B5C] dark:text-white focus:outline-hidden focus:border-[#DC2626]"
                  />
                </div>
              </div>

              {/* Hospital Affiliation & Degrees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#082B5C] dark:text-slate-300">
                    Hospital / Health System Affiliation *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-[#596579] absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Metro Health Trauma Center"
                      value={hospitalAffiliation}
                      onChange={(e) => setHospitalAffiliation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-black/60 border border-[#DCE3EC] dark:border-slate-700 text-xs text-[#082B5C] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#DC2626]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#082B5C] dark:text-slate-300">
                    Degrees & Certifications
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MD, FACEP, ACLS/ATLS"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/60 border border-[#DCE3EC] dark:border-slate-700 text-xs text-[#082B5C] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#DC2626]"
                  />
                </div>
              </div>

              {/* Telemetry Preference */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#082B5C] dark:text-slate-300">
                  Preferred Emergency Telemetry Role
                </label>
                <select
                  value={telemetryPreference}
                  onChange={(e) => setTelemetryPreference(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/60 border border-[#DCE3EC] dark:border-slate-700 text-xs text-[#082B5C] dark:text-white focus:outline-hidden focus:border-[#DC2626] cursor-pointer"
                >
                  <option value="CAD Live Video & Resuscitation Guidance">
                    CAD Live Video & Resuscitation Guidance (Pre-hospital ALS)
                  </option>
                  <option value="Trauma Bay Receiving & Pre-Notification">
                    Trauma Bay Receiving & Surgical Team Coordination
                  </option>
                  <option value="Cardiac & Stroke Emergency Telemetry">
                    Cardiac & Stroke Emergency Telemetry Lead
                  </option>
                  <option value="General Acute Emergency Consult">
                    General Acute Emergency Consult & Remote Triage
                  </option>
                </select>
              </div>

              {/* Additional Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#082B5C] dark:text-slate-300">
                  Clinical Statement / Schedule Availability (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Available for weeknight ER on-call telemetry shifts..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-black/60 border border-[#DCE3EC] dark:border-slate-700 text-xs text-[#082B5C] dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-[#DC2626]"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-[#596579] dark:text-slate-300 border border-[#DCE3EC] dark:border-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Submit Credentialing Application</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
