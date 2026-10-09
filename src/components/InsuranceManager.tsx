import React, { useState } from 'react';
import { InsurancePolicy, FamilyMemberProfile, UserEmergencyProfile } from '../types/emergency';
import {
  CreditCard,
  ShieldCheck,
  Plus,
  FileText,
  Paperclip,
  CheckCircle2,
  PhoneCall,
  Edit3,
  Download,
  Printer,
  X,
  Upload,
  Trash2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface InsuranceManagerProps {
  policies: InsurancePolicy[];
  currentUser: UserEmergencyProfile;
  familyProfiles: FamilyMemberProfile[];
  onSavePolicy: (policy: InsurancePolicy) => void;
  onDeletePolicy?: (id: string) => void;
  onClose?: () => void;
}

export const InsuranceManager: React.FC<InsuranceManagerProps> = ({
  policies,
  currentUser,
  familyProfiles,
  onSavePolicy,
  onDeletePolicy,
  onClose
}) => {
  const currentUserName = currentUser?.fullName || 'Myself';
  const currentUserId = currentUser?.id || 'self-user';

  const patientOptions = [
    { id: currentUserId, name: `${currentUserName} (Self)`, relationship: 'Self', rawName: currentUserName },
    ...(familyProfiles || []).map((f) => ({
      id: f.id,
      name: `${f.name} (${f.relationship})`,
      relationship: f.relationship,
      rawName: f.name
    }))
  ];

  const [selectedPatientId, setSelectedPatientId] = useState<string>(currentUserId);
  const [activeCardSide, setActiveCardSide] = useState<'front' | 'back'>('front');
  const [isEditing, setIsEditing] = useState(false);

  // Current active policy for the selected patient
  const currentPolicy = policies.find((p) => p.patientId === selectedPatientId) || policies[0];

  // Edit form state
  const [provider, setProvider] = useState(currentPolicy?.provider || '');
  const [planType, setPlanType] = useState(currentPolicy?.planType || 'Comprehensive PPO');
  const [policyNumber, setPolicyNumber] = useState(currentPolicy?.policyNumber || '');
  const [groupNumber, setGroupNumber] = useState(currentPolicy?.groupNumber || '');
  const [subscriberId, setSubscriberId] = useState(currentPolicy?.subscriberId || '');
  const [subscriberName, setSubscriberName] = useState(currentPolicy?.subscriberName || '');
  const [emergencyCopay, setEmergencyCopay] = useState(currentPolicy?.emergencyCopay || '$150');
  const [deductibleMet, setDeductibleMet] = useState(currentPolicy?.deductibleMet || '$1,200 of $1,500');
  const [claimsPhone, setClaimsPhone] = useState(currentPolicy?.claimsPhone || '+1 (800) 555-0199');
  const [validThru, setValidThru] = useState(currentPolicy?.validThru || '12/2027');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<'Card Copy' | 'Policy Schedule' | 'Prior Auth Letter' | 'Claim Form'>('Card Copy');

  // When selected patient changes, sync edit form
  const handleSelectPatient = (pId: string) => {
    setSelectedPatientId(pId);
    setIsEditing(false);
    const pol = policies.find((p) => p.patientId === pId);
    if (pol) {
      setProvider(pol.provider);
      setPlanType(pol.planType);
      setPolicyNumber(pol.policyNumber);
      setGroupNumber(pol.groupNumber);
      setSubscriberId(pol.subscriberId);
      setSubscriberName(pol.subscriberName);
      setEmergencyCopay(pol.emergencyCopay);
      setDeductibleMet(pol.deductibleMet);
      setClaimsPhone(pol.claimsPhone);
      setValidThru(pol.validThru);
    }
  };

  const handleSavePolicySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPolicy) return;
    const updated: InsurancePolicy = {
      ...currentPolicy,
      provider: provider.trim(),
      planType,
      policyNumber: policyNumber.trim(),
      groupNumber: groupNumber.trim(),
      subscriberId: subscriberId.trim(),
      subscriberName: subscriberName.trim(),
      emergencyCopay: emergencyCopay.trim(),
      deductibleMet: deductibleMet.trim(),
      claimsPhone: claimsPhone.trim(),
      validThru: validThru.trim()
    };
    onSavePolicy(updated);
    setIsEditing(false);
  };

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !currentPolicy) return;
    const doc = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      title: newDocTitle.trim(),
      fileName: `${newDocTitle.trim().replace(/\s+/g, '_')}.pdf`,
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize: '1.2 MB',
      type: newDocType
    };
    const updated: InsurancePolicy = {
      ...currentPolicy,
      documents: [doc, ...currentPolicy.documents]
    };
    onSavePolicy(updated);
    setNewDocTitle('');
  };

  const handleRemoveDocument = (docId: string) => {
    if (!currentPolicy) return;
    const updated: InsurancePolicy = {
      ...currentPolicy,
      documents: currentPolicy.documents.filter((d) => d.id !== docId)
    };
    onSavePolicy(updated);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#0D111A] border border-[#DCE3EC] dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#F36C21] uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-[#F36C21]" />
            <span>VERIFIED EMERGENCY HEALTH INSURANCE & BENEFITS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B5C] dark:text-white mt-1">
            Insurance Documents & Digital Coverage Cards
          </h1>
          <p className="text-xs text-[#596579] dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage electronic insurance cards, policy schedules, and pre-authorization documents for yourself and family members. Automatically integrated into the RESQ ONE emergency dispatch packet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#EAF8F1] border border-[#18A66A]/30 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-[#18A66A] font-bold uppercase block tracking-wider">Network Status</span>
            <span className="text-sm font-bold text-[#082B5C] dark:text-white flex items-center gap-1.5 justify-center mt-0.5">
              <ShieldCheck className="w-4 h-4 text-[#18A66A]" />
              <span>In-Network Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Patient Selector Tabs */}
      <div className="p-2 bg-white dark:bg-[#0F131D] rounded-2xl border border-[#DCE3EC] dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto shadow-xs">
        {patientOptions.map((p) => {
          const isSelected = selectedPatientId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelectPatient(p.id)}
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

      {currentPolicy ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Realistic Digital Insurance Card View (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#596579] dark:text-slate-400 uppercase tracking-wider">
                DIGITAL HEALTH CARD
              </span>
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-900 rounded-xl border border-[#DCE3EC] dark:border-slate-800 text-xs">
                <button
                  onClick={() => setActiveCardSide('front')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    activeCardSide === 'front'
                      ? 'bg-white dark:bg-slate-800 text-[#082B5C] dark:text-white shadow-xs'
                      : 'text-[#596579] dark:text-slate-400 hover:text-[#082B5C]'
                  }`}
                >
                  Card Front
                </button>
                <button
                  onClick={() => setActiveCardSide('back')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    activeCardSide === 'back'
                      ? 'bg-white dark:bg-slate-800 text-[#082B5C] dark:text-white shadow-xs'
                      : 'text-[#596579] dark:text-slate-400 hover:text-[#082B5C]'
                  }`}
                >
                  Card Back
                </button>
              </div>
            </div>

            {/* Simulated Realistic Front of Card */}
            {activeCardSide === 'front' ? (
              <div className="relative aspect-[1.586/1] w-full rounded-2xl p-5 bg-gradient-to-br from-[#082B5C] via-[#061C3D] to-[#041228] border-2 border-[#2F80C9]/40 shadow-xl flex flex-col justify-between overflow-hidden select-none text-white">
                {/* Background holographic watermark */}
                <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-[#F36C21]/15 blur-2xl pointer-events-none" />
                <div className="absolute top-0 right-0 p-3 opacity-20 font-black text-4xl italic text-white pointer-events-none">
                  HEALTH PASS
                </div>

                {/* Card Top */}
                <div className="flex items-start justify-between z-10">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-[#FF7A00] uppercase block">
                      {currentPolicy.planType}
                    </span>
                    <h2 className="text-base font-extrabold tracking-tight text-white mt-0.5">
                      {currentPolicy.provider}
                    </h2>
                  </div>
                  {/* Smart chip graphic */}
                  <div className="w-9 h-7 rounded bg-amber-400/90 border border-amber-300 flex items-center justify-center shadow-inner">
                    <div className="w-5 h-4 border border-amber-600 rounded-xs opacity-60" />
                  </div>
                </div>

                {/* Card Middle: Member Name & Subscriber ID */}
                <div className="my-auto py-2 z-10">
                  <div className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">
                    MEMBER NAME
                  </div>
                  <div className="text-lg font-extrabold tracking-wide text-white uppercase truncate">
                    {currentPolicy.patientName}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-300 block text-[9px]">MEMBER / SUB ID</span>
                      <span className="font-bold text-white tracking-wider">{currentPolicy.subscriberId}</span>
                    </div>
                    <div>
                      <span className="text-slate-300 block text-[9px]">POLICY NUMBER</span>
                      <span className="font-bold text-white tracking-wider truncate block">{currentPolicy.policyNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Group & Rx Info */}
                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px] font-mono z-10 text-slate-300">
                  <div>
                    <span className="text-slate-400">GRP: </span>
                    <span className="font-bold text-white">{currentPolicy.groupNumber}</span>
                  </div>
                  {currentPolicy.rxBin && (
                    <div>
                      <span className="text-slate-400">RxBIN: </span>
                      <span className="font-bold text-white">{currentPolicy.rxBin}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400">VALID: </span>
                    <span className="font-bold text-[#18A66A]">{currentPolicy.validThru}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Simulated Back of Card */
              <div className="relative aspect-[1.586/1] w-full rounded-2xl p-5 bg-gradient-to-br from-[#061C3D] to-[#041228] border-2 border-slate-700 shadow-xl flex flex-col justify-between overflow-hidden select-none text-white text-xs">
                {/* Magnetic Strip */}
                <div className="absolute top-4 left-0 right-0 h-8 bg-black/90 border-y border-slate-800" />

                <div className="mt-10 space-y-1.5 text-[11px] text-slate-300 z-10">
                  <div className="flex justify-between border-b border-white/10 pb-1">
                    <span className="text-slate-300 font-bold">EMERGENCY ROOM COPAY:</span>
                    <span className="font-mono font-bold text-white">{currentPolicy.emergencyCopay}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-1">
                    <span className="text-slate-300 font-bold">ANNUAL DEDUCTIBLE:</span>
                    <span className="font-mono text-slate-200">{currentPolicy.deductibleMet}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-1">
                    <span className="text-slate-300 font-bold">24/7 CLAIMS / PRE-AUTH:</span>
                    <span className="font-mono font-bold text-[#FF7A00]">{currentPolicy.claimsPhone}</span>
                  </div>
                </div>

                {/* Simulated Barcode */}
                <div className="pt-2 z-10">
                  <div className="h-6 w-full bg-white/90 rounded flex items-center justify-around px-2 py-0.5">
                    {[...Array(38)].map((_, i) => (
                      <span
                        key={i}
                        className="h-full bg-black inline-block"
                        style={{ width: `${(i % 3) + 1}px` }}
                      />
                    ))}
                  </div>
                  <div className="text-[9px] font-mono text-center text-slate-400 mt-1">
                    RESQ ONE EMERGENCY TELEMETRY PARITY VALIDATED
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions for Card */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-[#082B5C] dark:text-slate-200 border border-[#DCE3EC] dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-[#596579]" />
                <span>Print Card Copy</span>
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="py-2 px-4 rounded-xl bg-[#FFF1E8] border border-[#F36C21]/30 text-[#F36C21] hover:bg-[#F36C21] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Policy Details'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Policy Details & Documents Vault (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {isEditing ? (
              /* Edit Policy Form */
              <form onSubmit={handleSavePolicySubmit} className="p-5 rounded-2xl bg-white dark:bg-[#0F131D] border border-[#DCE3EC] dark:border-slate-800 space-y-3.5 shadow-xs text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#DCE3EC] dark:border-slate-800">
                  <span className="font-extrabold text-[#082B5C] dark:text-white text-sm">Edit Insurance Coverage Details</span>
                  <span className="text-[11px] text-[#596579] dark:text-slate-400">{currentPolicy.patientName}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Insurance Provider</label>
                    <input
                      type="text"
                      required
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-[#082B5C] dark:text-white focus:border-[#F36C21] focus:ring-1 focus:ring-[#F36C21] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Plan Category</label>
                    <select
                      value={planType}
                      onChange={(e) => setPlanType(e.target.value as any)}
                      className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-[#082B5C] dark:text-white focus:border-[#F36C21] focus:ring-1 focus:ring-[#F36C21] outline-hidden cursor-pointer"
                    >
                      <option value="Comprehensive PPO">Comprehensive PPO</option>
                      <option value="Medicare Advantage">Medicare Advantage</option>
                      <option value="Medicare Part A & B + Medigap">Medicare Part A & B + Medigap</option>
                      <option value="HMO Network">HMO Network</option>
                      <option value="High Deductible HSA">High Deductible HSA</option>
                      <option value="State Medicaid / Emergency">State Medicaid / Emergency</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Policy Number</label>
                    <input
                      type="text"
                      required
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-[#082B5C] dark:text-white font-mono focus:border-[#F36C21] focus:ring-1 focus:ring-[#F36C21] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Group Number</label>
                    <input
                      type="text"
                      value={groupNumber}
                      onChange={(e) => setGroupNumber(e.target.value)}
                      className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-[#082B5C] dark:text-white font-mono focus:border-[#F36C21] focus:ring-1 focus:ring-[#F36C21] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Subscriber ID</label>
                    <input
                      type="text"
                      value={subscriberId}
                      onChange={(e) => setSubscriberId(e.target.value)}
                      className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-[#082B5C] dark:text-white font-mono focus:border-[#F36C21] focus:ring-1 focus:ring-[#F36C21] outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Emergency Copay</label>
                    <input
                      type="text"
                      value={emergencyCopay}
                      onChange={(e) => setEmergencyCopay(e.target.value)}
                      placeholder="e.g. $150 or $0"
                      className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-[#082B5C] dark:text-white focus:border-[#F36C21] focus:ring-1 focus:ring-[#F36C21] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Deductible Status</label>
                    <input
                      type="text"
                      value={deductibleMet}
                      onChange={(e) => setDeductibleMet(e.target.value)}
                      placeholder="e.g. $1,200 of $1,500"
                      className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-[#082B5C] dark:text-white focus:border-[#F36C21] focus:ring-1 focus:ring-[#F36C21] outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#082B5C] dark:text-slate-300 font-bold block mb-1">Claims Phone</label>
                    <input
                      type="text"
                      value={claimsPhone}
                      onChange={(e) => setClaimsPhone(e.target.value)}
                      className="w-full bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-[#082B5C] dark:text-white focus:border-[#F36C21] focus:ring-1 focus:ring-[#F36C21] outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE3EC] dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#DCE3EC] text-[#596579] font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#F36C21] hover:bg-[#FF7A00] text-white font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Save Policy Updates
                  </button>
                </div>
              </form>
            ) : (
              /* Policy Summary Card */
              <div className="p-5 rounded-2xl bg-white dark:bg-[#0F131D] border border-[#DCE3EC] dark:border-slate-800 space-y-3.5 shadow-xs text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#DCE3EC] dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-extrabold text-[#082B5C] dark:text-white">{currentPolicy.provider}</h3>
                    <p className="text-[11px] text-[#596579] dark:text-slate-400">
                      Subscriber: <strong className="text-[#082B5C] dark:text-slate-200">{currentPolicy.subscriberName}</strong> · Valid Thru: {currentPolicy.validThru}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#18A66A] bg-[#EAF8F1] border border-[#18A66A]/30 px-2.5 py-1 rounded-full">
                    {currentPolicy.networkStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#FAFBFC] dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-800 font-mono">
                    <span className="text-[9px] text-[#596579] uppercase block font-sans font-bold">POLICY NUMBER</span>
                    <span className="text-xs font-bold text-[#082B5C] dark:text-white truncate block">{currentPolicy.policyNumber}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAFBFC] dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-800 font-mono">
                    <span className="text-[9px] text-[#596579] uppercase block font-sans font-bold">GROUP NUMBER</span>
                    <span className="text-xs font-bold text-[#082B5C] dark:text-white truncate block">{currentPolicy.groupNumber}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAFBFC] dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-800 font-mono">
                    <span className="text-[9px] text-[#596579] uppercase block font-sans font-bold">EMERGENCY COPAY</span>
                    <span className="text-xs font-bold text-[#18A66A] truncate block">{currentPolicy.emergencyCopay}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAFBFC] dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-800 font-mono">
                    <span className="text-[9px] text-[#596579] uppercase block font-sans font-bold">24/7 CLAIMS TEL</span>
                    <span className="text-xs font-bold text-[#F36C21] truncate block">{currentPolicy.claimsPhone}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Insurance Documents Vault Section */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F131D] border border-[#DCE3EC] dark:border-slate-800 space-y-4 shadow-xs text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCE3EC] dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#F36C21]" />
                  <span className="font-extrabold text-[#082B5C] dark:text-white text-sm">
                    Insurance Documents Vault ({currentPolicy.documents.length})
                  </span>
                </div>
                <span className="text-[11px] text-[#596579] dark:text-slate-400">
                  Pre-Armed for Receiving Hospital Admitting
                </span>
              </div>

              {/* Upload Document Field */}
              <form onSubmit={handleAddDocument} className="p-3 bg-[#FAFBFC] dark:bg-[#141824] rounded-xl border border-[#DCE3EC] dark:border-slate-800 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="Document name (e.g. 2026_Schedule_of_Emergency_Benefits)"
                  className="flex-1 bg-white dark:bg-[#0A0D13] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-[#082B5C] dark:text-white placeholder:text-slate-400 focus:border-[#F36C21] focus:ring-1 focus:ring-[#F36C21] outline-hidden"
                />
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value as any)}
                  className="bg-white dark:bg-[#0A0D13] border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-[#082B5C] dark:text-white focus:border-[#F36C21] focus:ring-1 focus:ring-[#F36C21] outline-hidden cursor-pointer"
                >
                  <option value="Card Copy">Card Copy</option>
                  <option value="Policy Schedule">Policy Schedule</option>
                  <option value="Prior Auth Letter">Prior Auth Letter</option>
                  <option value="Claim Form">Claim Form</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F36C21] hover:bg-[#FF7A00] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>
              </form>

              {/* Documents List */}
              <div className="space-y-2">
                {currentPolicy.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl bg-white dark:bg-[#141824] border border-[#DCE3EC] dark:border-slate-800/80 hover:border-[#F36C21] flex items-center justify-between gap-3 transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-[#FFF1E8] border border-[#F36C21]/30 flex items-center justify-center text-[#F36C21] shrink-0 font-extrabold text-xs">
                        PDF
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-[#082B5C] dark:text-white block truncate">{doc.title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-[#596579] dark:text-slate-400 font-mono mt-0.5">
                          <span>{doc.fileName}</span>
                          <span>·</span>
                          <span>{doc.fileSize}</span>
                          <span>·</span>
                          <span>Uploaded: {doc.uploadDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => window.print()}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#082B5C] dark:text-slate-300 transition-colors cursor-pointer"
                        title="Download / View document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveDocument(doc.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#FFF0EF] dark:bg-slate-800 text-[#596579] hover:text-[#D92D20] transition-colors cursor-pointer"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-10 text-center rounded-2xl bg-white dark:bg-[#0F131D] border border-[#DCE3EC] dark:border-slate-800 shadow-xs">
          <p className="text-[#596579] dark:text-slate-400">No insurance policy configured for this patient.</p>
        </div>
      )}
    </div>
  );
};
