import React, { useState } from 'react';
import {
  Ambulance,
  ShieldCheck,
  Building2,
  CheckCircle2,
  X,
  FileText,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Award,
  AlertCircle,
  Clock,
  Sparkles,
  UploadCloud,
  ChevronRight,
  ChevronLeft,
  FileCheck,
  Stethoscope,
  Radio,
  Truck,
  Check
} from 'lucide-react';
import { ambulanceService, REGISTERED_ORGANIZATIONS } from '../../services/ambulanceService';
import {
  AmbulanceApplicationRecord,
  AmbulanceOperatorRole,
  AmbulanceDocumentMetadata
} from '../../types/ambulance';

interface AmbulanceApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (app: AmbulanceApplicationRecord) => void;
  initialEmail?: string;
  initialName?: string;
}

const AMBULANCE_ROLES: { value: AmbulanceOperatorRole; label: string; desc: string }[] = [
  {
    value: 'PARAMEDIC',
    label: 'Paramedic (ALS Specialist)',
    desc: 'Authorized for advanced airway, ACLS cardiac arrest meds, and manual defibrillation'
  },
  {
    value: 'CRITICAL_CARE_PARAMEDIC',
    label: 'Critical Care Paramedic (CCEMT-P)',
    desc: 'Mobile ICU, mechanical ventilators, IV infusion pumps, and critical inter-facility transports'
  },
  {
    value: 'EMERGENCY_MEDICAL_TECHNICIAN',
    label: 'Emergency Medical Technician (EMT-B / EMT-A)',
    desc: 'Basic life support, oxygen administration, trauma immobilization, and rapid transport'
  },
  {
    value: 'AMBULANCE_DRIVER',
    label: 'Ambulance Emergency Vehicle Operator (EVOC)',
    desc: 'Certified high-speed emergency vehicle driver and tactical logistics specialist'
  }
];

const VEHICLE_TYPES = [
  'Type I (Heavy Duty Truck Chassis) — ALS Mobile Unit',
  'Type II (Commercial Van Chassis) — BLS Rapid Response',
  'Type III (Cutaway Van Cab) — Comprehensive Mobile ICU',
  'Critical Care Transport (CCT) — Specialized Resuscitation Unit'
];

const TRAINING_OPTIONS = ['BLS (Basic Life Support)', 'ACLS (Advanced Cardiac)', 'PALS (Pediatric Advanced)', 'PHTLS (Prehospital Trauma)', 'EVOC (Emergency Driving)', 'TCCC (Tactical Care)'];

const COMMON_EQUIPMENT = [
  'Cardiac Monitor / Defibrillator (12-Lead)',
  'Mechanical Transport Ventilator',
  'Portable High-Vacuum Suction Unit',
  'Automated CPR Device (Lucas / AutoPulse)',
  'Stryker Power-PRO Hydraulic Cot',
  'Intraosseous (EZ-IO) Vascular Access Kit',
  'Video Laryngoscope / Difficult Airway Kit',
  'Pulse Oximeter & Capnography (EtCO2)',
  'Trauma Spineboards & Pediatric Immobilizer'
];

export const AmbulanceApplicationModal: React.FC<AmbulanceApplicationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmail = '',
  initialName = ''
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<AmbulanceApplicationRecord | null>(null);

  // Step 1: Personal Information
  const [fullName, setFullName] = useState(initialName || '');
  const [email, setEmail] = useState(initialEmail || '');
  const [mobileNumber, setMobileNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1992-06-15');
  const [address, setAddress] = useState('');
  const [govIdType, setGovIdType] = useState<'DRIVERS_LICENSE' | 'NATIONAL_ID' | 'PASSPORT'>('DRIVERS_LICENSE');
  const [govIdNumber, setGovIdNumber] = useState('');
  const [govIdIssuingState, setGovIdIssuingState] = useState('California');

  // Step 2: Professional Information
  const [professionalRole, setProfessionalRole] = useState<AmbulanceOperatorRole>('PARAMEDIC');
  const [qualification, setQualification] = useState('Paramedic Associate Degree, NREMT-P');
  const [experienceYears, setExperienceYears] = useState(6);
  const [certificationDetails, setCertificationDetails] = useState('NREMT #P-994012, California State EMS License');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('2028-06-30');
  const [selectedTraining, setSelectedTraining] = useState<string[]>(['BLS (Basic Life Support)', 'ACLS (Advanced Cardiac)']);
  const [selectedOrgId, setSelectedOrgId] = useState(REGISTERED_ORGANIZATIONS[0].id);
  const [isCustomOrg, setIsCustomOrg] = useState(false);
  const [customOrgName, setCustomOrgName] = useState('');

  // Step 3: Ambulance & Vehicle Information
  const [callsign, setCallsign] = useState('MEDIC-55 (ALS)');
  const [vehicleType, setVehicleType] = useState(VEHICLE_TYPES[0]);
  const [vehicleModel, setVehicleModel] = useState('2024 Ford F-450 Super Duty / Wheeled Coach');
  const [vehicleRegistration, setVehicleRegistration] = useState('CA-EMS-5501');
  const [hasOxygen, setHasOxygen] = useState(true);
  const [hasVentilator, setHasVentilator] = useState(true);
  const [hasBLS, setHasBLS] = useState(true);
  const [hasALS, setHasALS] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([
    'Cardiac Monitor / Defibrillator (12-Lead)',
    'Mechanical Transport Ventilator',
    'Portable High-Vacuum Suction Unit',
    'Stryker Power-PRO Hydraulic Cot'
  ]);

  // Step 4: Documents
  const [uploadedDocs, setUploadedDocs] = useState<AmbulanceDocumentMetadata[]>([
    {
      id: 'doc-gov-id',
      name: 'Government ID & Driver License',
      category: 'DRIVING_LICENSE',
      fileName: 'gov_id_and_dl_endorsement.pdf',
      uploadedAt: new Date().toISOString(),
      fileSize: '2.1 MB',
      status: 'PENDING_REVIEW'
    },
    {
      id: 'doc-emt-cert',
      name: 'EMT / Paramedic State License',
      category: 'EMT_CERTIFICATION',
      fileName: 'state_paramedic_credential.pdf',
      uploadedAt: new Date().toISOString(),
      fileSize: '1.7 MB',
      status: 'PENDING_REVIEW'
    },
    {
      id: 'doc-veh-reg',
      name: 'Ambulance Vehicle Registration & Safety Certificate',
      category: 'VEHICLE_REGISTRATION',
      fileName: 'ambulance_dot_inspection_permit.pdf',
      uploadedAt: new Date().toISOString(),
      fileSize: '3.3 MB',
      status: 'PENDING_REVIEW'
    }
  ]);

  if (!isOpen) return null;

  const toggleTraining = (item: string) => {
    if (selectedTraining.includes(item)) {
      setSelectedTraining(selectedTraining.filter((t) => t !== item));
    } else {
      setSelectedTraining([...selectedTraining, item]);
    }
  };

  const toggleEquipment = (item: string) => {
    if (selectedEquipment.includes(item)) {
      setSelectedEquipment(selectedEquipment.filter((e) => e !== item));
    } else {
      setSelectedEquipment([...selectedEquipment, item]);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (currentStep === 1) {
      if (!fullName.trim() || !email.trim() || !mobileNumber.trim() || !address.trim() || !govIdNumber.trim()) {
        setErrorMessage('Please fill in all personal information and government ID fields.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!licenseNumber.trim() || (isCustomOrg && !customOrgName.trim())) {
        setErrorMessage('Please fill in your license registration number and select or specify an organization.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!callsign.trim() || !vehicleRegistration.trim() || !vehicleModel.trim()) {
        setErrorMessage('Please fill in the ambulance unit callsign, model, and vehicle registration number.');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const chosenOrg = isCustomOrg
      ? { id: `org-custom-${Date.now()}`, name: customOrgName.trim() }
      : REGISTERED_ORGANIZATIONS.find((o) => o.id === selectedOrgId) || REGISTERED_ORGANIZATIONS[0];

    const result = await ambulanceService.submitApplication({
      userId: `usr-amb-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      mobileNumber: mobileNumber.trim(),
      dateOfBirth,
      profilePhotoUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=256',
      address: address.trim(),
      govIdType,
      govIdNumber: govIdNumber.trim(),
      govIdIssuingState,
      professionalRole,
      qualification: qualification.trim(),
      experienceYears: Number(experienceYears) || 3,
      certificationDetails: certificationDetails.trim(),
      licenseNumber: licenseNumber.trim(),
      licenseExpiry,
      emergencyMedicalTraining: selectedTraining,
      organizationId: chosenOrg.id,
      organizationName: chosenOrg.name,
      isCustomOrganization: isCustomOrg,
      ambulanceCallsign: callsign.trim(),
      ambulanceType: vehicleType,
      vehicleModel: vehicleModel.trim(),
      vehicleRegistration: vehicleRegistration.trim(),
      hasOxygen,
      hasVentilator,
      hasBLS,
      hasALS,
      equipmentList: selectedEquipment,
      documents: uploadedDocs
    });

    setIsSubmitting(false);

    if (result.success && result.application) {
      setSubmittedApp(result.application);
      if (onSuccess) onSuccess(result.application);
    } else {
      setErrorMessage(result.error || 'Failed to submit application. Please check your data.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0D1017] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#121622] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Ambulance className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-tight">
                  Apply as Ambulance Operator
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
                  SECURE CAD NETWORK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official registration for certified ambulance units, paramedics & emergency operators
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Step Indicator (if not completed) */}
        {!submittedApp && (
          <div className="px-6 py-3 bg-[#0A0D14] border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-1">
              {[
                { step: 1, label: 'Personal & ID' },
                { step: 2, label: 'Credentials & Role' },
                { step: 3, label: 'Ambulance & Gear' },
                { step: 4, label: 'Documents & Submit' }
              ].map((s) => (
                <div
                  key={s.step}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors shrink-0 ${
                    currentStep === s.step
                      ? 'bg-amber-500 text-black font-bold'
                      : currentStep > s.step
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  <span>{currentStep > s.step ? '✓' : s.step}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </div>
            <span className="text-[11px] text-slate-400 hidden md:inline">
              Step {currentStep} of 4
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-800/80 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SUCCESS / PENDING STATE */}
          {submittedApp ? (
            <div className="py-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="text-[11px] font-mono font-bold tracking-widest text-amber-300 uppercase bg-amber-950/80 px-3 py-1 rounded-full border border-amber-800">
                  APPLICATION SUBMITTED · STATUS: PENDING
                </span>
                <h3 className="text-2xl font-black text-white">
                  Application Under Medical Review
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Thank you, <strong className="text-white">{submittedApp.fullName}</strong>. Your application to join the RESQ ONE emergency fleet as an authorized <strong className="text-amber-300">{submittedApp.professionalRole.replace('_', ' ')}</strong> with unit <strong className="text-white">{submittedApp.ambulanceCallsign}</strong> has been logged.
                </p>
              </div>

              {/* Security Isolation Notice */}
              <div className="p-4 rounded-2xl bg-black/60 border border-slate-800 text-left max-w-md mx-auto space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Verification Policy & Access Rules:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Per municipal CAD emergency standards, operational access to live patient dispatch and trauma communications is restricted until credentials and vehicle registration are verified by an authorized <strong className="text-slate-300">RESQ_ADMIN</strong> or <strong className="text-slate-300">SUPER_ADMIN</strong>.
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Application ID:</span>
                  <span className="text-white font-bold">{submittedApp.id}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleNextStep} className="space-y-5">
              {/* STEP 1: PERSONAL INFORMATION */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-amber-400" />
                      <span>Section 1: Personal & Legal Identification</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Enter the operator's primary legal identification details.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1">
                        FULL LEGAL NAME *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Marcus Vance"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1">
                        OFFICIAL EMAIL *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="marcus.paramedic@resqone.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1">
                        MOBILE PHONE NUMBER *
                      </label>
                      <input
                        type="tel"
                        required
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        placeholder="+1 (555) 019-4820"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1">
                        DATE OF BIRTH *
                      </label>
                      <input
                        type="date"
                        required
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1">
                        PRIMARY RESIDENCE / OPERATING BASE ADDRESS *
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="450 7th St, San Francisco, CA 94103"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1">
                        GOVERNMENT ID TYPE *
                      </label>
                      <select
                        value={govIdType}
                        onChange={(e: any) => setGovIdType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                      >
                        <option value="DRIVERS_LICENSE">Driver's License (Standard / Commercial)</option>
                        <option value="NATIONAL_ID">National Identity Card / State ID</option>
                        <option value="PASSPORT">Passport</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1">
                        GOV ID NUMBER *
                      </label>
                      <input
                        type="text"
                        required
                        value={govIdNumber}
                        onChange={(e) => setGovIdNumber(e.target.value)}
                        placeholder="CA-D8492019"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: PROFESSIONAL CREDENTIALS */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>Section 2: Professional Role & Certifications</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Emergency medicine qualifications, licenses, and organization affiliation.
                    </p>
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-300 mb-2">
                      OPERATIONAL ROLE DESIGNATION *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {AMBULANCE_ROLES.map((role) => (
                        <div
                          key={role.value}
                          onClick={() => setProfessionalRole(role.value)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                            professionalRole === role.value
                              ? 'bg-amber-950/40 border-amber-500 text-white'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{role.label}</span>
                            {professionalRole === role.value && (
                              <CheckCircle2 className="w-4 h-4 text-amber-400" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                            {role.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1">
                        PRIMARY QUALIFICATION *
                      </label>
                      <input
                        type="text"
                        required
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        placeholder="BS Emergency Health / Paramedic Diploma"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1">
                        EXPERIENCE IN EMERGENCY MEDICAL SERVICES (YEARS) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="40"
                        required
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1">
                        LICENSE / CERTIFICATION NUMBER *
                      </label>
                      <input
                        type="text"
                        required
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="EMT-P-90241-CA"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1">
                        LICENSE EXPIRATION DATE *
                      </label>
                      <input
                        type="date"
                        required
                        value={licenseExpiry}
                        onChange={(e) => setLicenseExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Training checklist */}
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-300 mb-2">
                      EMERGENCY MEDICAL TRAINING ACCREDITATIONS
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {TRAINING_OPTIONS.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleTraining(t)}
                          className={`p-2 rounded-xl text-[11px] text-left border flex items-center justify-between transition-colors ${
                            selectedTraining.includes(t)
                              ? 'bg-amber-950/60 border-amber-500 text-white font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="truncate">{t}</span>
                          {selectedTraining.includes(t) && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Organization Affiliation */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <label className="block text-[11px] font-mono font-bold text-slate-300">
                      AMBULANCE ORGANIZATION / EMPLOYER *
                    </label>
                    {!isCustomOrg ? (
                      <div className="space-y-2">
                        <select
                          value={selectedOrgId}
                          onChange={(e) => setSelectedOrgId(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                        >
                          {REGISTERED_ORGANIZATIONS.map((org) => (
                            <option key={org.id} value={org.id}>
                              {org.name} — {org.city} ({org.license})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setIsCustomOrg(true)}
                          className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                        >
                          + My organization is not listed here (Submit for Admin Review)
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          value={customOrgName}
                          onChange={(e) => setCustomOrgName(e.target.value)}
                          placeholder="e.g. Pacific Coast EMS & Critical Care Transport"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setIsCustomOrg(false)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          ← Select from registered organizations instead
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: AMBULANCE & EQUIPMENT */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Truck className="w-4 h-4 text-amber-400" />
                      <span>Section 3: Ambulance Vehicle & Equipment Capabilities</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Specify the responding ambulance vehicle type, callsign, and life-support assets.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1">
                        AMBULANCE CALLSIGN / UNIT ID *
                      </label>
                      <input
                        type="text"
                        required
                        value={callsign}
                        onChange={(e) => setCallsign(e.target.value)}
                        placeholder="MEDIC-42 (ALS)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1">
                        VEHICLE TYPE & CHASSIS *
                      </label>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                      >
                        {VEHICLE_TYPES.map((vt) => (
                          <option key={vt} value={vt}>
                            {vt}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1">
                        VEHICLE MAKE & MODEL *
                      </label>
                      <input
                        type="text"
                        required
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        placeholder="2024 Ford F-450 Super Duty"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1">
                        VEHICLE LICENSE PLATE / REGISTRATION *
                      </label>
                      <input
                        type="text"
                        required
                        value={vehicleRegistration}
                        onChange={(e) => setVehicleRegistration(e.target.value)}
                        placeholder="CA-EM-9921"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                      />
                    </div>
                  </div>

                  {/* Core Life-Support Badges */}
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-slate-800 space-y-2.5">
                    <label className="block text-[11px] font-mono font-bold text-slate-300">
                      ONBOARD CRITICAL CAPABILITIES (CHECK ALL THAT APPLY)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <label className="flex items-center gap-2 text-xs text-white p-2 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasOxygen}
                          onChange={(e) => setHasOxygen(e.target.checked)}
                          className="accent-amber-500 w-4 h-4 rounded"
                        />
                        <span>Medical Oxygen</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-white p-2 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasVentilator}
                          onChange={(e) => setHasVentilator(e.target.checked)}
                          className="accent-amber-500 w-4 h-4 rounded"
                        />
                        <span>Mechanical Ventilator</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-white p-2 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasBLS}
                          onChange={(e) => setHasBLS(e.target.checked)}
                          className="accent-amber-500 w-4 h-4 rounded"
                        />
                        <span>BLS Capable</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs text-white p-2 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasALS}
                          onChange={(e) => setHasALS(e.target.checked)}
                          className="accent-amber-500 w-4 h-4 rounded"
                        />
                        <span>ALS Capable</span>
                      </label>
                    </div>
                  </div>

                  {/* Equipment Checklist */}
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-slate-300 mb-2">
                      ONBOARD MEDICAL EQUIPMENT & DIAGNOSTICS
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {COMMON_EQUIPMENT.map((eq) => (
                        <button
                          key={eq}
                          type="button"
                          onClick={() => toggleEquipment(eq)}
                          className={`p-2.5 rounded-xl text-xs text-left border flex items-center justify-between transition-colors ${
                            selectedEquipment.includes(eq)
                              ? 'bg-amber-950/60 border-amber-500 text-white font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="truncate">{eq}</span>
                          {selectedEquipment.includes(eq) && <Check className="w-4 h-4 text-amber-400 shrink-0 ml-1.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: VERIFICATION DOCUMENTS & SUBMISSION */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-amber-400" />
                      <span>Section 4: Verification Documents & Review Submission</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Documents are stored securely and reviewed exclusively by authorized RESQ ONE medical administrators.
                    </p>
                  </div>

                  {/* Uploaded Documents List */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-mono font-bold text-slate-300">
                      ATTACHED VERIFICATION DOCUMENTS ({uploadedDocs.length})
                    </label>
                    {uploadedDocs.map((docItem) => (
                      <div
                        key={docItem.id}
                        className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white">{docItem.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {docItem.fileName} · {docItem.fileSize}
                            </div>
                          </div>
                        </div>

                        <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                          READY FOR REVIEW
                        </span>
                      </div>
                    ))}

                    <div className="p-4 border-2 border-dashed border-slate-800 hover:border-amber-500/60 rounded-2xl text-center space-y-1 transition-colors cursor-pointer">
                      <UploadCloud className="w-6 h-6 text-slate-500 mx-auto" />
                      <div className="text-xs font-bold text-slate-300">
                        Upload additional certification or authorization document
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Supports PDF, PNG, JPG up to 15MB
                      </p>
                    </div>
                  </div>

                  {/* Review Summary */}
                  <div className="p-4 rounded-2xl bg-black/60 border border-slate-800 text-xs space-y-2 text-slate-400">
                    <div className="font-bold text-slate-200">Application Summary Check:</div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        Operator: <strong className="text-white">{fullName}</strong>
                      </div>
                      <div>
                        Role: <strong className="text-amber-400">{professionalRole}</strong>
                      </div>
                      <div>
                        Callsign: <strong className="text-white">{callsign}</strong>
                      </div>
                      <div>
                        Org: <strong className="text-white">{isCustomOrg ? customOrgName : 'Selected Registered EMS'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                )}

                {currentStep < 4 ? (
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <span>Next Section</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleFinalSubmit}
                    className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20"
                  >
                    {isSubmitting ? (
                      <span>Submitting for Review...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>SUBMIT APPLICATION FOR ADMIN REVIEW</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
