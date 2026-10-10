import React, { useState } from 'react';
import {
  UserEmergencyProfile,
  MedicalRecord,
  InsurancePolicy,
  HospitalPreference
} from '../types/emergency';
import { ResqLogo } from './ResqLogo';
import {
  User,
  Heart,
  FileText,
  CreditCard,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Upload,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  PhoneCall,
  AlertCircle,
  Paperclip,
  Trash2,
  Lock,
  Building,
  Check,
  Star
} from 'lucide-react';

interface SignUpRegistrationPageProps {
  initialUser?: {
    fullName?: string;
    email?: string;
    phone?: string;
  };
  onCompleteRegistration: (data: {
    userProfile: UserEmergencyProfile;
    newMedicalRecord?: MedicalRecord;
    newInsurancePolicy?: InsurancePolicy;
    newHospitalPreference?: HospitalPreference;
  }) => void;
  onCancel?: () => void;
}

type StepKey = 'IDENTITY' | 'MEDICAL' | 'RECORDS' | 'INSURANCE' | 'HOSPITALS' | 'REVIEW';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const COMMON_CONDITIONS = [
  'Mild Exercise-Induced Asthma',
  'Hypertension (Stage 1 / 2)',
  'Type 2 Diabetes',
  'Coronary Artery Disease',
  'Atrial Fibrillation',
  'No Chronic Conditions'
];

const COMMON_ALLERGIES = [
  'Penicillin',
  'Sulfa Antibiotics',
  'Aspirin / NSAIDs',
  'Iodinated Radiocontrast Dye',
  'Peanuts / Tree Nuts',
  'Latex',
  'No Known Drug Allergies (NKDA)'
];

export const SignUpRegistrationPage: React.FC<SignUpRegistrationPageProps> = ({
  initialUser,
  onCompleteRegistration,
  onCancel
}) => {
  const [activeStep, setActiveStep] = useState<StepKey>('IDENTITY');

  // STEP 1: Personal & Contact Details
  const [fullName, setFullName] = useState(initialUser?.fullName || '');
  const [email, setEmail] = useState(initialUser?.email || '');
  const [phone, setPhone] = useState(initialUser?.phone || '');
  const [age, setAge] = useState<number | ''>('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [affordabilityPreference, setAffordabilityPreference] = useState<'Standard / In-Network' | 'Comprehensive Private' | 'Govt Subsidized / Emergency Only'>('Standard / In-Network');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('Family');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  // STEP 2: Medical Profile & Allergies
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [medicationsStr, setMedicationsStr] = useState('');
  const [medicalAlertNote, setMedicalAlertNote] = useState('');

  // STEP 3: Past Medical Records & Required Documents
  const [hasPastSurgery, setHasPastSurgery] = useState(false);
  const [pastSurgeryTitle, setPastSurgeryTitle] = useState('');
  const [pastSurgeryCategory, setPastSurgeryCategory] = useState<MedicalRecord['category']>('Surgical & Procedures');
  const [pastSurgeryDate, setPastSurgeryDate] = useState('');
  const [pastSurgeryFacility, setPastSurgeryFacility] = useState('');
  const [pastSurgeryDoctor, setPastSurgeryDoctor] = useState('');
  const [pastSurgeryDiagnosis, setPastSurgeryDiagnosis] = useState('');
  const [pastSurgerySummary, setPastSurgerySummary] = useState('');
  const [uploadedClinicalDocs, setUploadedClinicalDocs] = useState<Array<{ name: string; size: string; type: string }>>([]);
  const [newClinicalDocName, setNewClinicalDocName] = useState('');

  // STEP 4: Health Insurance & Cards
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [insurancePlanType, setInsurancePlanType] = useState<InsurancePolicy['planType']>('Comprehensive PPO');
  const [policyNumber, setPolicyNumber] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  const [subscriberId, setSubscriberId] = useState('');
  const [subscriberName, setSubscriberName] = useState('');
  const [emergencyCopay, setEmergencyCopay] = useState('');
  const [deductibleMet, setDeductibleMet] = useState('');
  const [claimsPhone, setClaimsPhone] = useState('');
  const [validThru, setValidThru] = useState('');
  const [uploadedInsuranceDocs, setUploadedInsuranceDocs] = useState<Array<{ name: string; size: string; type: string }>>([]);
  const [newInsuranceDocName, setNewInsuranceDocName] = useState('');

  // STEP 5: Hospital Preferences & Trauma Routing
  const [primaryHospitalName, setPrimaryHospitalName] = useState('St. Jude Comprehensive Trauma Center');
  const [primaryTraumaTier, setPrimaryTraumaTier] = useState<HospitalPreference['traumaLevel']>('Level 1 Trauma');
  const [primaryDistance, setPrimaryDistance] = useState(2.1);
  const [primaryDriveTime, setPrimaryDriveTime] = useState(4);
  const [primaryBayEntrance, setPrimaryBayEntrance] = useState('Ambulance Bay Bay 1-4 (North Entrance via 22nd St)');
  const [primaryHospitalPhone, setPrimaryHospitalPhone] = useState('+1 (555) 019-9111');
  const [primarySpecialties, setPrimarySpecialties] = useState('24/7 Adult & Pediatric Trauma, Cardiac Cath Lab, Helipad, Burn Service');
  const [hospitalRoutingNotes, setHospitalRoutingNotes] = useState('Primary emergency hospital preference.');

  // STEP 6: Review & Consent
  const [hipaaConsent, setHipaaConsent] = useState(true);
  const [telemetryConsent, setTelemetryConsent] = useState(true);

  // Toggle helpers
  const handleToggleCondition = (cond: string) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handleAddCustomCondition = () => {
    if (!customCondition.trim()) return;
    if (!selectedConditions.includes(customCondition.trim())) {
      setSelectedConditions((prev) => [...prev, customCondition.trim()]);
    }
    setCustomCondition('');
  };

  const handleToggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy]
    );
  };

  const handleAddCustomAllergy = () => {
    if (!customAllergy.trim()) return;
    if (!selectedAllergies.includes(customAllergy.trim())) {
      setSelectedAllergies((prev) => [...prev, customAllergy.trim()]);
    }
    setCustomAllergy('');
  };

  const handleAddClinicalDoc = () => {
    if (!newClinicalDocName.trim()) return;
    setUploadedClinicalDocs((prev) => [
      ...prev,
      { name: newClinicalDocName.trim(), size: '1.5 MB', type: 'Medical Report' }
    ]);
    setNewClinicalDocName('');
  };

  const handleRemoveClinicalDoc = (idx: number) => {
    setUploadedClinicalDocs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddInsuranceDoc = () => {
    if (!newInsuranceDocName.trim()) return;
    setUploadedInsuranceDocs((prev) => [
      ...prev,
      { name: newInsuranceDocName.trim(), size: '1.2 MB', type: 'Card Copy' }
    ]);
    setNewInsuranceDocName('');
  };

  const handleRemoveInsuranceDoc = (idx: number) => {
    setUploadedInsuranceDocs((prev) => prev.filter((_, i) => i !== idx));
  };

  // Final Registration Submission
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !insuranceProvider.trim()) return;

    const patientId = `usr-${fullName.toLowerCase().replace(/\s+/g, '')}-001`;

    const userProfile: UserEmergencyProfile = {
      id: patientId,
      fullName: fullName.trim(),
      age: Number(age) || 30,
      phone: phone.trim(),
      bloodGroup,
      allergies: selectedAllergies,
      medicalConditions: selectedConditions,
      medications: medicationsStr.split(',').map((s) => s.trim()).filter(Boolean),
      medicalHistory: [pastSurgeryTitle, medicalAlertNote],
      preferredHospitals: [
        {
          name: primaryHospitalName,
          distance: `${primaryDistance} miles`,
          traumaLevel: primaryTraumaTier
        }
      ],
      insuranceInfo: {
        provider: insuranceProvider.trim(),
        policyNumber: policyNumber.trim(),
        groupNumber: groupNumber.trim(),
        validThru,
        verified: true
      },
      affordabilityPreference,
      emergencyContacts: [
        {
          name: emergencyContactName.trim(),
          relation: emergencyContactRelation.trim(),
          phone: emergencyContactPhone.trim(),
          isPrimary: true
        }
      ],
      authorizationStatus: 'Full Authorized'
    };

    const newMedicalRecord: MedicalRecord = {
      id: `REC-${Date.now().toString().slice(-4)}`,
      patientId,
      patientName: fullName.trim(),
      relationship: 'Self',
      title: pastSurgeryTitle.trim(),
      category: pastSurgeryCategory,
      date: pastSurgeryDate,
      facility: pastSurgeryFacility.trim(),
      attendingDoctor: pastSurgeryDoctor.trim(),
      diagnosis: pastSurgeryDiagnosis.trim(),
      clinicalSummary: pastSurgerySummary.trim(),
      medicationsPrescribed: medicationsStr.split(',').map((s) => s.trim()).filter(Boolean),
      findingsOrResults: 'Operative summary verified at registration.',
      relevantForEmergency: true,
      lastUpdated: new Date().toISOString().split('T')[0],
      attachments: uploadedClinicalDocs.map((d) => ({ name: d.name, size: d.size, type: 'PDF' }))
    };

    const newInsurancePolicy: InsurancePolicy = {
      id: `INS-${Date.now().toString().slice(-4)}`,
      patientId,
      patientName: fullName.trim(),
      relationship: 'Self',
      isPrimary: true,
      provider: insuranceProvider.trim(),
      planType: insurancePlanType,
      policyNumber: policyNumber.trim(),
      groupNumber: groupNumber.trim(),
      subscriberId: subscriberId.trim() || 'SUB-001',
      subscriberName: subscriberName.trim() || fullName.trim(),
      emergencyCopay: emergencyCopay.trim(),
      deductibleMet: deductibleMet.trim(),
      networkStatus: 'In-Network Guaranteed',
      claimsPhone: claimsPhone.trim(),
      validThru,
      documents: uploadedInsuranceDocs.map((d, i) => ({
        id: `DOC-REG-${i}`,
        title: d.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        fileName: d.name,
        uploadDate: new Date().toISOString().split('T')[0],
        fileSize: d.size,
        type: d.type as any
      }))
    };

    const newHospitalPreference: HospitalPreference = {
      id: `HOSP-${Date.now().toString().slice(-4)}`,
      patientId,
      patientName: fullName.trim(),
      relationship: 'Self',
      rankOrder: 1,
      isDefault: true,
      name: primaryHospitalName.trim(),
      traumaLevel: primaryTraumaTier,
      specialties: primarySpecialties.split(',').map((s) => s.trim()).filter(Boolean),
      address: '1001 Potrero Avenue, Trauma Medical Hub',
      receivingBayEntrance: primaryBayEntrance.trim(),
      emergencyPhone: primaryHospitalPhone.trim(),
      distanceMiles: Number(primaryDistance) || 2.1,
      estimatedDriveTimeMin: Number(primaryDriveTime) || 4,
      inNetworkStatus: 'In-Network (Tier 1)',
      notes: hospitalRoutingNotes.trim()
    };

    onCompleteRegistration({
      userProfile,
      newMedicalRecord,
      newInsurancePolicy,
      newHospitalPreference
    });
  };

  const stepsList: Array<{ key: StepKey; label: string; icon: any }> = [
    { key: 'IDENTITY', label: '1. Identity & Contact', icon: User },
    { key: 'MEDICAL', label: '2. Medical & Allergies', icon: Heart },
    { key: 'RECORDS', label: '3. Records & Uploads', icon: FileText },
    { key: 'INSURANCE', label: '4. Insurance & Cards', icon: CreditCard },
    { key: 'HOSPITALS', label: '5. Hospital Routing', icon: Building2 },
    { key: 'REVIEW', label: '6. Review & Arm', icon: ShieldCheck }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-6 animate-in fade-in duration-200">
      {/* Registration Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0D111A] border border-[#DCE3EC] dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#DC2626] uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>RESQ ONE CLINICAL REGISTRATION & ONBOARDING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B5C] dark:text-white tracking-tight">
            Emergency Health Passport Registration
          </h1>
          <p className="text-xs text-[#596579] dark:text-slate-400 max-w-xl leading-relaxed">
            Register your verified emergency identity, past medical records, health insurance documents, and preferred trauma hospitals in one comprehensive onboarding flow.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#082B5C] dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Stepper Navigation Strip */}
      <div className="p-2 bg-white dark:bg-[#0F131D] rounded-2xl border border-[#DCE3EC] dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto shadow-xs">
        {stepsList.map((step) => {
          const isCurrent = activeStep === step.key;
          const Icon = step.icon;
          return (
            <button
              key={step.key}
              onClick={() => setActiveStep(step.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isCurrent
                  ? 'bg-[#DC2626] text-white shadow-xs'
                  : 'text-[#596579] dark:text-slate-400 hover:text-[#082B5C] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0F131D] border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
        {/* STEP 1: IDENTITY & EMERGENCY CONTACTS */}
        {activeStep === 'IDENTITY' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-[#DCE3EC] dark:border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-[#DC2626] uppercase tracking-wider block">
                STEP 1 OF 6
              </span>
              <h2 className="text-xl font-bold text-[#082B5C] dark:text-white mt-0.5">
                Personal Identity & Emergency Primary Contact
              </h2>
              <p className="text-xs text-[#596579] dark:text-slate-400 mt-1">
                Your legal identity and the family member to notify automatically during any SOS dispatch.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-[#172033] dark:text-slate-300 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#FAFBFC] dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#172033] dark:text-white font-medium focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#172033] dark:text-slate-300 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@example.com"
                  className="w-full bg-[#FAFBFC] dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#172033] dark:text-white font-medium focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#172033] dark:text-slate-300 block mb-1">Mobile Phone (Direct SMS / SOS) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 018-9921"
                  className="w-full bg-[#FAFBFC] dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#172033] dark:text-white font-mono focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#172033] dark:text-slate-300 block mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-[#FAFBFC] dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#172033] dark:text-white font-mono focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#172033] dark:text-slate-300 block mb-1">Blood Group *</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-[#FAFBFC] dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-[#172033] dark:text-white font-bold font-mono focus:outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Affordability preference */}
            <div className="p-4 rounded-2xl bg-[#FAFBFC] dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-[#082B5C] dark:text-white text-xs block">Emergency Care & Affordability Tier</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  'Standard / In-Network',
                  'Comprehensive Private',
                  'Govt Subsidized / Emergency Only'
                ].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setAffordabilityPreference(tier as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      affordabilityPreference === tier
                        ? 'bg-[#FEF2F2] dark:bg-red-950/40 border-[#DC2626] text-[#DC2626] font-bold'
                        : 'bg-white dark:bg-[#0F131D] border-[#DCE3EC] dark:border-slate-800 text-[#596579] dark:text-slate-400 hover:text-[#082B5C] dark:hover:text-white'
                    }`}
                  >
                    <span className="block text-[11px] font-bold">{tier}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Emergency Contact */}
            <div className="p-4 rounded-2xl bg-[#FAFBFC] dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#18A66A]" />
                <span className="font-bold text-[#082B5C] dark:text-white">Auto-Notified Emergency Contact (Primary Next-of-Kin)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-[#596579] dark:text-slate-400 block mb-1">Contact Name *</label>
                  <input
                    type="text"
                    required
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    placeholder="e.g. Claire Vance"
                    className="w-full bg-white dark:bg-[#0A0D14] border border-[#DCE3EC] dark:border-slate-700 rounded-lg px-3 py-2 text-[#172033] dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#596579] dark:text-slate-400 block mb-1">Relationship</label>
                  <input
                    type="text"
                    value={emergencyContactRelation}
                    onChange={(e) => setEmergencyContactRelation(e.target.value)}
                    placeholder="e.g. Spouse"
                    className="w-full bg-white dark:bg-[#0A0D14] border border-[#DCE3EC] dark:border-slate-700 rounded-lg px-3 py-2 text-[#172033] dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#596579] dark:text-slate-400 block mb-1">Contact Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={emergencyContactPhone}
                    onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 019-4821"
                    className="w-full bg-white dark:bg-[#0A0D14] border border-[#DCE3EC] dark:border-slate-700 rounded-lg px-3 py-2 text-[#172033] dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setActiveStep('MEDICAL')}
                className="px-6 py-3 rounded-xl bg-[#DC2626] hover:bg-[#EF4444] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs"
              >
                <span>Continue to Medical & Allergies</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MEDICAL PROFILE & ALLERGIES */}
        {activeStep === 'MEDICAL' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider block">
                STEP 2 OF 6
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Medical Conditions, Allergies & Current Regimen
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Paramedics and emergency doctors review this instantly before administering IV drugs or intubation.
              </p>
            </div>

            {/* Conditions Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 block">
                Known Medical Conditions (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_CONDITIONS.map((cond) => {
                  const isSel = selectedConditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => handleToggleCondition(cond)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSel
                          ? 'bg-amber-500/20 border border-amber-500/80 text-amber-200 font-bold'
                          : 'bg-[#141824] border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cond}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  placeholder="Add custom medical condition..."
                  className="flex-1 bg-[#141824] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomCondition}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Drug Allergies */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-300 block">
                Known Drug & Food Allergies (Critical Contraindication Safeguard)
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGIES.map((allergy) => {
                  const isSel = selectedAllergies.includes(allergy);
                  return (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => handleToggleAllergy(allergy)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isSel
                          ? 'bg-red-500/20 border border-red-500/80 text-red-200 font-bold'
                          : 'bg-[#141824] border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {allergy}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customAllergy}
                  onChange={(e) => setCustomAllergy(e.target.value)}
                  placeholder="Add custom allergy (e.g. Ciprofloxacin)..."
                  className="flex-1 bg-[#141824] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAllergy}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Current Medications & Alerts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Current Daily Medications & Dosages
                </label>
                <textarea
                  rows={3}
                  value={medicationsStr}
                  onChange={(e) => setMedicationsStr(e.target.value)}
                  placeholder="e.g. Albuterol Sulfate Inhaler 90mcg PRN, Lisinopril 10mg..."
                  className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Critical Medical Alerts / Surgical Implants
                </label>
                <textarea
                  rows={3}
                  value={medicalAlertNote}
                  onChange={(e) => setMedicalAlertNote(e.target.value)}
                  placeholder="e.g. Pacemaker fitted, coronary stent, high fall risk, anesthesia sensitivity..."
                  className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setActiveStep('IDENTITY')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStep('RECORDS')}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-[#FF2B44] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <span>Continue to Medical Records & Uploads</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PAST MEDICAL RECORDS & REQUIRED DOCUMENTS */}
        {activeStep === 'RECORDS' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider block">
                STEP 3 OF 6
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Past Medical Records & Required Clinical Documents
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload past operative notes, discharge summaries, and medical ID files required for hospital admitting.
              </p>
            </div>

            {/* Past Procedure Log Form */}
            <div className="p-4 rounded-2xl bg-[#141824] border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-red-400" />
                  <span>Primary Past Surgical / Hospitalization Record</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
                  Pre-Armed in Dispatch Dossier
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">Procedure / Record Title *</label>
                  <input
                    type="text"
                    required
                    value={pastSurgeryTitle}
                    onChange={(e) => setPastSurgeryTitle(e.target.value)}
                    placeholder="e.g. Left Knee Arthroscopic Meniscectomy"
                    className="w-full bg-[#0A0D14] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">Clinical Category</label>
                  <select
                    value={pastSurgeryCategory}
                    onChange={(e) => setPastSurgeryCategory(e.target.value as any)}
                    className="w-full bg-[#0A0D14] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="Surgical & Procedures">Surgical & Procedures</option>
                    <option value="Cardiology & ECG">Cardiology & ECG</option>
                    <option value="Hospitalization & Discharge">Hospitalization & Discharge</option>
                    <option value="Emergency Dispatch & Handover">Emergency Dispatch & Handover</option>
                    <option value="Diagnostic & Imaging">Diagnostic & Imaging</option>
                    <option value="Lab Pathology">Lab Pathology</option>
                    <option value="Prescription & Therapy">Prescription & Therapy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">Date of Procedure</label>
                  <input
                    type="date"
                    value={pastSurgeryDate}
                    onChange={(e) => setPastSurgeryDate(e.target.value)}
                    className="w-full bg-[#0A0D14] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">Hospital / Medical Center</label>
                  <input
                    type="text"
                    value={pastSurgeryFacility}
                    onChange={(e) => setPastSurgeryFacility(e.target.value)}
                    placeholder="e.g. St. Jude Comprehensive Orthopedic Center"
                    className="w-full bg-[#0A0D14] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">Attending Surgeon / Physician</label>
                  <input
                    type="text"
                    value={pastSurgeryDoctor}
                    onChange={(e) => setPastSurgeryDoctor(e.target.value)}
                    placeholder="e.g. Dr. Gregory Vance, MD"
                    className="w-full bg-[#0A0D14] border border-slate-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1">Diagnosis / Indication</label>
                <input
                  type="text"
                  value={pastSurgeryDiagnosis}
                  onChange={(e) => setPastSurgeryDiagnosis(e.target.value)}
                  placeholder="e.g. Complex Tear of Posterior Horn of Medial Meniscus"
                  className="w-full bg-[#0A0D14] border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 block mb-1">Operative Clinical Summary</label>
                <textarea
                  rows={2}
                  value={pastSurgerySummary}
                  onChange={(e) => setPastSurgerySummary(e.target.value)}
                  placeholder="Summary of surgical procedure, complications, or recovery notes..."
                  className="w-full bg-[#0A0D14] border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>

            {/* Required Clinical Documents Upload Section */}
            <div className="p-4 rounded-2xl bg-[#141824] border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>Required Clinical Documents & Lab Uploads ({uploadedClinicalDocs.length})</span>
                </span>
                <span className="text-[10px] text-slate-400">PDF / DICOM / Scans accepted</span>
              </div>

              <div className="space-y-1.5">
                {uploadedClinicalDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0D14] border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-900">
                        {doc.type}
                      </span>
                      <span className="text-white truncate font-medium">{doc.name}</span>
                      <span className="text-slate-500 font-mono text-[10px]">({doc.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveClinicalDoc(idx)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newClinicalDocName}
                  onChange={(e) => setNewClinicalDocName(e.target.value)}
                  placeholder="Document name (e.g. PostOp_Knee_MRI_Report.pdf)"
                  className="flex-1 bg-[#0A0D14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={handleAddClinicalDoc}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Attach Document</span>
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setActiveStep('MEDICAL')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStep('INSURANCE')}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-[#FF2B44] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <span>Continue to Insurance & Cards</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: HEALTH INSURANCE & CARDS */}
        {activeStep === 'INSURANCE' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider block">
                STEP 4 OF 6
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Health Insurance Policy & Required Digital Cards
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Ensures in-network billing parity and immediate emergency room admitting without financial interrogation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Insurance Carrier / Provider *</label>
                <input
                  type="text"
                  required
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  placeholder="e.g. Anthem Blue Cross Premier Gold PPO"
                  className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF2B44]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Plan Category</label>
                <select
                  value={insurancePlanType}
                  onChange={(e) => setInsurancePlanType(e.target.value as any)}
                  className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF2B44]"
                >
                  <option value="Comprehensive PPO">Comprehensive PPO</option>
                  <option value="Medicare Advantage">Medicare Advantage</option>
                  <option value="Medicare Part A & B + Medigap">Medicare Part A & B + Medigap</option>
                  <option value="HMO Network">HMO Network</option>
                  <option value="High Deductible HSA">High Deductible HSA</option>
                  <option value="State Medicaid / Emergency">State Medicaid / Emergency</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Policy / Member ID *</label>
                  <input
                    type="text"
                    required
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    placeholder="e.g. ANT-902-849201"
                    className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Group Number</label>
                  <input
                    type="text"
                    value={groupNumber}
                    onChange={(e) => setGroupNumber(e.target.value)}
                    placeholder="e.g. GRP-77218"
                    className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Subscriber ID</label>
                  <input
                    type="text"
                    value={subscriberId}
                    onChange={(e) => setSubscriberId(e.target.value)}
                    placeholder="e.g. SUB-881920"
                    className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Subscriber Full Name</label>
                  <input
                    type="text"
                    value={subscriberName}
                    onChange={(e) => setSubscriberName(e.target.value)}
                    placeholder="e.g. Jake Vance"
                    className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Emergency Copay</label>
                <input
                  type="text"
                  value={emergencyCopay}
                  onChange={(e) => setEmergencyCopay(e.target.value)}
                  placeholder="e.g. $150 or $0"
                  className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">24/7 Claims Hotline</label>
                  <input
                    type="text"
                    value={claimsPhone}
                    onChange={(e) => setClaimsPhone(e.target.value)}
                    placeholder="e.g. +1 (800) 555-0199"
                    className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Coverage Valid Thru</label>
                  <input
                    type="text"
                    value={validThru}
                    onChange={(e) => setValidThru(e.target.value)}
                    placeholder="e.g. 12/2027"
                    className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Insurance Documents & Card Copies Required */}
            <div className="p-4 rounded-2xl bg-[#141824] border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  <span>Required Insurance Card Copies & Policy Files ({uploadedInsuranceDocs.length})</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admitting Verification Ready</span>
                </span>
              </div>

              <div className="space-y-1.5">
                {uploadedInsuranceDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0D14] border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-900">
                        {doc.type}
                      </span>
                      <span className="text-white truncate font-medium">{doc.name}</span>
                      <span className="text-slate-500 font-mono text-[10px]">({doc.size})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveInsuranceDoc(idx)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newInsuranceDocName}
                  onChange={(e) => setNewInsuranceDocName(e.target.value)}
                  placeholder="Insurance doc name (e.g. Anthem_Supplemental_Card.pdf)"
                  className="flex-1 bg-[#0A0D14] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={handleAddInsuranceDoc}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Attach Card</span>
                </button>
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setActiveStep('RECORDS')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStep('HOSPITALS')}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-[#FF2B44] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <span>Continue to Hospital Preferences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: HOSPITAL PREFERENCES & ROUTING */}
        {activeStep === 'HOSPITALS' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider block">
                STEP 5 OF 6
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Hospital Preferences & Trauma Routing
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Specify your primary emergency receiving facility and ambulance bay entry point.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  1st Choice Preferred Hospital Name *
                </label>
                <input
                  type="text"
                  required
                  value={primaryHospitalName}
                  onChange={(e) => setPrimaryHospitalName(e.target.value)}
                  placeholder="e.g. St. Jude Comprehensive Trauma Center"
                  className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF2B44]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Trauma Certification Level
                </label>
                <select
                  value={primaryTraumaTier}
                  onChange={(e) => setPrimaryTraumaTier(e.target.value as any)}
                  className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-[#FF2B44]"
                >
                  <option value="Level 1 Trauma">Level 1 Trauma</option>
                  <option value="Level 2 Regional Trauma">Level 2 Regional Trauma</option>
                  <option value="Level 1 Pediatric Trauma">Level 1 Pediatric Trauma</option>
                  <option value="Comprehensive Stroke & Cardiac">Comprehensive Stroke & Cardiac</option>
                  <option value="Community Emergency">Community Emergency</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">Distance (miles)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={primaryDistance}
                    onChange={(e) => setPrimaryDistance(Number(e.target.value))}
                    className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">ETA (mins)</label>
                  <input
                    type="number"
                    value={primaryDriveTime}
                    onChange={(e) => setPrimaryDriveTime(Number(e.target.value))}
                    className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Ambulance Bay Entrance Address
                </label>
                <input
                  type="text"
                  value={primaryBayEntrance}
                  onChange={(e) => setPrimaryBayEntrance(e.target.value)}
                  placeholder="e.g. Ambulance Bay Bay 1-4 (North Entrance via 22nd St)"
                  className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Emergency Triage Direct Phone
                </label>
                <input
                  type="text"
                  value={primaryHospitalPhone}
                  onChange={(e) => setPrimaryHospitalPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 019-9111"
                  className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Emergency Facilities / Specialties
                </label>
                <input
                  type="text"
                  value={primarySpecialties}
                  onChange={(e) => setPrimarySpecialties(e.target.value)}
                  placeholder="e.g. 24/7 Cath Lab, Helipad, Burn Unit"
                  className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Clinical Routing Instructions for EMS Dispatches
              </label>
              <textarea
                rows={2}
                value={hospitalRoutingNotes}
                onChange={(e) => setHospitalRoutingNotes(e.target.value)}
                placeholder="Specific instructions for paramedic transport crew and receiving triage desk..."
                className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs"
              />
            </div>

            <div className="flex justify-between pt-3">
              <button
                type="button"
                onClick={() => setActiveStep('INSURANCE')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStep('REVIEW')}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-[#FF2B44] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <span>Continue to Review & Consent</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW & CONSENT */}
        {activeStep === 'REVIEW' && (
          <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in fade-in duration-150">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                STEP 6 OF 6 · FINAL VERIFICATION
              </span>
              <h2 className="text-xl font-bold text-white mt-0.5">
                Review Registered Dossier & Arm Emergency Passport
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Verify all registration inputs. Your health passport and digital cards will be instantly armed.
              </p>
            </div>

            {/* Summary Review Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Identity Box */}
              <div className="p-4 rounded-2xl bg-[#141824] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-red-400" />
                    <span>Patient Identity</span>
                  </span>
                  <span className="font-mono font-bold text-red-400 bg-red-950 px-2 py-0.5 rounded text-[10px]">
                    Blood: {bloodGroup}
                  </span>
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-400">Name: </span>
                    <strong className="text-white">{fullName}</strong> ({age} yrs)
                  </div>
                  <div>
                    <span className="text-slate-400">Phone: </span>
                    <span className="font-mono text-slate-200">{phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Emergency Contact: </span>
                    <span className="text-white">{emergencyContactName} ({emergencyContactRelation}) · {emergencyContactPhone}</span>
                  </div>
                </div>
              </div>

              {/* Medical Box */}
              <div className="p-4 rounded-2xl bg-[#141824] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-amber-400" />
                    <span>Medical Conditions & Allergies</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {selectedAllergies.length} Allergies
                  </span>
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-400">Conditions: </span>
                    <span className="text-slate-200">{selectedConditions.join(', ') || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Allergies: </span>
                    <span className="text-red-300 font-semibold">{selectedAllergies.join(', ') || 'NKDA'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Medications: </span>
                    <span className="text-slate-200">{medicationsStr || 'None'}</span>
                  </div>
                </div>
              </div>

              {/* Medical Record Box */}
              <div className="p-4 rounded-2xl bg-[#141824] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Past Medical Records Attached</span>
                  </span>
                  <span className="text-[10px] text-blue-400 font-mono">
                    {uploadedClinicalDocs.length} Docs
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-white truncate">{pastSurgeryTitle}</div>
                  <div className="text-[11px] text-slate-400">
                    {pastSurgeryDate} · {pastSurgeryFacility}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Attached: {uploadedClinicalDocs.map((d) => d.name).join(', ')}
                  </div>
                </div>
              </div>

              {/* Insurance & Hospital Box */}
              <div className="p-4 rounded-2xl bg-[#141824] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Insurance & Hospital Routing</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    {uploadedInsuranceDocs.length} Cards
                  </span>
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-400">Insurance: </span>
                    <span className="text-white font-semibold">{insuranceProvider}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Pol #{policyNumber} · Copay: {emergencyCopay}
                  </div>
                  <div>
                    <span className="text-slate-400">Hospital: </span>
                    <span className="text-white font-semibold">{primaryHospitalName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mandatory Consents */}
            <div className="space-y-3 p-4 rounded-2xl bg-[#141824] border border-slate-800 text-xs">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={hipaaConsent}
                  onChange={(e) => setHipaaConsent(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-red-600 focus:ring-0 bg-[#0A0D14]"
                />
                <span className="text-slate-300 leading-relaxed">
                  <strong>HIPAA & Medical Emergency Transmission Consent:</strong> I authorize RESQ ONE CAD dispatchers to relay my registered medical records, allergy alerts, blood type, and insurance cards directly to 911 dispatch, EMS paramedics, and receiving emergency department trauma teams during an active SOS call.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={telemetryConsent}
                  onChange={(e) => setTelemetryConsent(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-red-600 focus:ring-0 bg-[#0A0D14]"
                />
                <span className="text-slate-300 leading-relaxed">
                  <strong>Authorized Primary Hospital Routing:</strong> I confirm my preferred emergency receiving hospital and acknowledge that paramedic transit routing will prioritize this facility subject to field medical stability.
                </span>
              </label>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveStep('HOSPITALS')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF2B44] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-black text-sm tracking-wider uppercase transition-all shadow-[0_0_25px_rgba(255,43,68,0.5)] flex items-center gap-2 hover:scale-[1.02]"
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Complete Registration & Arm Emergency Passport</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
