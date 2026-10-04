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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0D111A] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#111726] to-[#0A0D15] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300">
                  CLINICAL NETWORK
                </span>
                <span className="text-[11px] text-slate-400">Physician Onboarding</span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight mt-0.5">
                Join RESQ ONE Emergency Care Network
              </h2>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-600/50 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                  APPLICATION SUBMITTED SUCCESSFULLY
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  Credentialing Review in Progress
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                  Thank you, <strong>{submittedRequest.fullName}</strong>. Your medical license (
                  <span className="font-mono text-emerald-300">{submittedRequest.registrationNumber}</span>) has been queued for credential verification with the RESQ ONE Medical Command Board.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 rounded-2xl bg-black/50 border border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-1.5">
                  <span>Application Reference ID</span>
                  <span className="font-mono text-white font-bold">{submittedRequest.id}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-1.5">
                  <span>Specialty</span>
                  <span className="text-white font-medium">{submittedRequest.specialization}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-1.5">
                  <span>Hospital Affiliation</span>
                  <span className="text-white font-medium">{submittedRequest.hospitalAffiliation}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Status</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-800">
                    PENDING VERIFICATION
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-2 max-w-md mx-auto text-left">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Admin approval will unlock your <strong>Doctor Telemetry Portal</strong>, real-time triage queues, and direct ambulance video links.
                </span>
              </div>

              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            /* Application Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Physicians on RESQ ONE provide direct pre-hospital video triage, ECG telemetry interpretation, and trauma handover guidance. All applicants undergo state licensing validation.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-800 text-xs text-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Physician Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Full Legal Name & Title *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Julian Vance, MD"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Professional Medical Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. j.vance@hospital.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Phone & License # */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Direct Contact Phone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="+1 (555) 019-4820"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    State License / NPI / Registration # *
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. MD-98214-CAL or NPI #10928471"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Specialty & Experience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Primary Specialty</label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {SPECIALTIES.map((spec) => (
                      <option key={spec} value={spec} className="bg-slate-900">
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Clinical Experience (Years)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Hospital Affiliation & Degrees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Hospital / Health System Affiliation *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Metro Health Trauma Center"
                      value={hospitalAffiliation}
                      onChange={(e) => setHospitalAffiliation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Degrees & Certifications
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MD, FACEP, ACLS/ATLS"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Telemetry Preference */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  Preferred Emergency Telemetry Role
                </label>
                <select
                  value={telemetryPreference}
                  onChange={(e) => setTelemetryPreference(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="CAD Live Video & Resuscitation Guidance" className="bg-slate-900">
                    CAD Live Video & Resuscitation Guidance (Pre-hospital ALS)
                  </option>
                  <option value="Trauma Bay Receiving & Pre-Notification" className="bg-slate-900">
                    Trauma Bay Receiving & Surgical Team Coordination
                  </option>
                  <option value="Cardiac & Stroke Emergency Telemetry" className="bg-slate-900">
                    Cardiac & Stroke Emergency Telemetry Lead
                  </option>
                  <option value="General Acute Emergency Consult" className="bg-slate-900">
                    General Acute Emergency Consult & Remote Triage
                  </option>
                </select>
              </div>

              {/* Additional Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  Clinical Statement / Schedule Availability (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Available for weeknight ER on-call telemetry shifts..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
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
