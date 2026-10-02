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
  const patientOptions = [
    { id: currentUser.id, name: `${currentUser.fullName} (Self)`, relationship: 'Self', rawName: currentUser.fullName },
    ...familyProfiles.map((f) => ({
      id: f.id,
      name: `${f.name} (${f.relationship})`,
      relationship: f.relationship,
      rawName: f.name
    }))
  ];

  const [selectedPatientId, setSelectedPatientId] = useState<string>(currentUser.id);
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
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121824] to-[#0A0E17] border border-red-900/40 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-[#FF2B44]" />
            <span>VERIFIED EMERGENCY HEALTH INSURANCE & BENEFITS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Insurance Documents & Digital Coverage Cards
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage electronic insurance cards, policy schedules, and pre-authorization documents for yourself and family members. Automatically integrated into the RESQ ONE emergency dispatch packet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-emerald-950/70 border border-emerald-800 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] text-emerald-300 font-bold uppercase block tracking-wider">Network Status</span>
            <span className="text-sm font-bold text-white flex items-center gap-1.5 justify-center mt-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>In-Network Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Patient Selector Tabs */}
      <div className="p-2 bg-[#0F131D] rounded-xl border border-slate-800 flex items-center gap-1.5 overflow-x-auto">
        {patientOptions.map((p) => {
          const isSelected = selectedPatientId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => handleSelectPatient(p.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-red-600 text-white shadow-md font-bold'
                  : 'bg-[#141824] text-slate-400 hover:text-white hover:bg-slate-800'
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
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                DIGITAL HEALTH CARD
              </span>
              <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveCardSide('front')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    activeCardSide === 'front'
                      ? 'bg-red-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Card Front
                </button>
                <button
                  onClick={() => setActiveCardSide('back')}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    activeCardSide === 'back'
                      ? 'bg-red-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Card Back
                </button>
              </div>
            </div>

            {/* Simulated Realistic Front of Card */}
            {activeCardSide === 'front' ? (
              <div className="relative aspect-[1.586/1] w-full rounded-2xl p-5 bg-gradient-to-br from-[#1A2333] via-[#0E1522] to-[#0A0D15] border-2 border-red-700/60 shadow-2xl flex flex-col justify-between overflow-hidden select-none text-white">
                {/* Background holographic watermark */}
                <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-red-600/10 blur-2xl pointer-events-none" />
                <div className="absolute top-0 right-0 p-3 opacity-20 font-black text-4xl italic text-white pointer-events-none">
                  HEALTH PASS
                </div>

                {/* Card Top */}
                <div className="flex items-start justify-between z-10">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase block">
                      {currentPolicy.planType}
                    </span>
                    <h2 className="text-base font-black tracking-tight text-white mt-0.5">
                      {currentPolicy.provider}
                    </h2>
                  </div>
                  {/* Smart chip graphic */}
                  <div className="w-9 h-7 rounded bg-amber-400/80 border border-amber-300 flex items-center justify-center shadow-inner">
                    <div className="w-5 h-4 border border-amber-600 rounded-sm opacity-60" />
                  </div>
                </div>

                {/* Card Middle: Member Name & Subscriber ID */}
                <div className="my-auto py-2 z-10">
                  <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                    MEMBER NAME
                  </div>
                  <div className="text-lg font-black tracking-wide text-white uppercase truncate">
                    {currentPolicy.patientName}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[9px]">MEMBER / SUB ID</span>
                      <span className="font-bold text-white tracking-wider">{currentPolicy.subscriberId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">POLICY NUMBER</span>
                      <span className="font-bold text-white tracking-wider truncate block">{currentPolicy.policyNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Card Bottom: Group & Rx Info */}
                <div className="pt-2 border-t border-slate-700/70 flex items-center justify-between text-[10px] font-mono z-10 text-slate-300">
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
                    <span className="font-bold text-emerald-400">{currentPolicy.validThru}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Simulated Back of Card */
              <div className="relative aspect-[1.586/1] w-full rounded-2xl p-5 bg-gradient-to-br from-[#121620] to-[#0A0D14] border-2 border-slate-700 shadow-2xl flex flex-col justify-between overflow-hidden select-none text-white text-xs">
                {/* Magnetic Strip */}
                <div className="absolute top-4 left-0 right-0 h-8 bg-black/90 border-y border-slate-800" />

                <div className="mt-10 space-y-1.5 text-[11px] text-slate-300 z-10">
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-400 font-bold">EMERGENCY ROOM COPAY:</span>
                    <span className="font-mono font-bold text-white">{currentPolicy.emergencyCopay}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-400 font-bold">ANNUAL DEDUCTIBLE:</span>
                    <span className="font-mono text-slate-200">{currentPolicy.deductibleMet}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span className="text-slate-400 font-bold">24/7 CLAIMS / PRE-AUTH:</span>
                    <span className="font-mono font-bold text-red-400">{currentPolicy.claimsPhone}</span>
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
                className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Print Card Copy</span>
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="py-2 px-4 rounded-lg bg-red-950/80 border border-red-800/80 text-red-300 hover:text-white hover:bg-red-900 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
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
              <form onSubmit={handleSavePolicySubmit} className="p-5 rounded-2xl bg-[#0F131D] border border-slate-800 space-y-3.5 shadow-xl text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-white text-sm">Edit Insurance Coverage Details</span>
                  <span className="text-[11px] text-slate-400">{currentPolicy.patientName}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">Insurance Provider</label>
                    <input
                      type="text"
                      required
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">Plan Category</label>
                    <select
                      value={planType}
                      onChange={(e) => setPlanType(e.target.value as any)}
                      className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white"
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
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">Policy Number</label>
                    <input
                      type="text"
                      required
                      value={policyNumber}
                      onChange={(e) => setPolicyNumber(e.target.value)}
                      className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">Group Number</label>
                    <input
                      type="text"
                      value={groupNumber}
                      onChange={(e) => setGroupNumber(e.target.value)}
                      className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">Subscriber ID</label>
                    <input
                      type="text"
                      value={subscriberId}
                      onChange={(e) => setSubscriberId(e.target.value)}
                      className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">Emergency Copay</label>
                    <input
                      type="text"
                      value={emergencyCopay}
                      onChange={(e) => setEmergencyCopay(e.target.value)}
                      placeholder="e.g. $150 or $0"
                      className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">Deductible Status</label>
                    <input
                      type="text"
                      value={deductibleMet}
                      onChange={(e) => setDeductibleMet(e.target.value)}
                      placeholder="e.g. $1,200 of $1,500"
                      className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 font-bold block mb-1">Claims Phone</label>
                    <input
                      type="text"
                      value={claimsPhone}
                      onChange={(e) => setClaimsPhone(e.target.value)}
                      className="w-full bg-[#141824] border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-[#FF2B44] text-white font-bold shadow-md hover:bg-red-600 transition-colors"
                  >
                    Save Policy Updates
                  </button>
                </div>
              </form>
            ) : (
              /* Policy Summary Card */
              <div className="p-5 rounded-2xl bg-[#0F131D] border border-slate-800 space-y-3.5 shadow-xl text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white">{currentPolicy.provider}</h3>
                    <p className="text-[11px] text-slate-400">
                      Subscriber: <strong className="text-slate-200">{currentPolicy.subscriberName}</strong> · Valid Thru: {currentPolicy.validThru}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded">
                    {currentPolicy.networkStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#141824] border border-slate-800 font-mono">
                    <span className="text-[9px] text-slate-400 uppercase block font-sans">POLICY NUMBER</span>
                    <span className="text-xs font-bold text-white truncate block">{currentPolicy.policyNumber}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#141824] border border-slate-800 font-mono">
                    <span className="text-[9px] text-slate-400 uppercase block font-sans">GROUP NUMBER</span>
                    <span className="text-xs font-bold text-white truncate block">{currentPolicy.groupNumber}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#141824] border border-slate-800 font-mono">
                    <span className="text-[9px] text-slate-400 uppercase block font-sans">EMERGENCY COPAY</span>
                    <span className="text-xs font-bold text-emerald-300 truncate block">{currentPolicy.emergencyCopay}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#141824] border border-slate-800 font-mono">
                    <span className="text-[9px] text-slate-400 uppercase block font-sans">24/7 CLAIMS TEL</span>
                    <span className="text-xs font-bold text-red-400 truncate block">{currentPolicy.claimsPhone}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Insurance Documents Vault Section */}
            <div className="p-5 rounded-2xl bg-[#0F131D] border border-slate-800 space-y-4 shadow-xl text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-400" />
                  <span className="font-bold text-white text-sm">
                    Insurance Documents Vault ({currentPolicy.documents.length})
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Pre-Armed for Receiving Hospital Admitting
                </span>
              </div>

              {/* Upload Document Field */}
              <form onSubmit={handleAddDocument} className="p-3 bg-[#141824] rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  required
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="Document name (e.g. 2026_Schedule_of_Emergency_Benefits)"
                  className="flex-1 bg-[#0A0D13] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500"
                />
                <select
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value as any)}
                  className="bg-[#0A0D13] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="Card Copy">Card Copy</option>
                  <option value="Policy Schedule">Policy Schedule</option>
                  <option value="Prior Auth Letter">Prior Auth Letter</option>
                  <option value="Claim Form">Claim Form</option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-red-600 hover:bg-[#FF2B44] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
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
                    className="p-3 rounded-xl bg-[#141824] border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-900/60 flex items-center justify-center text-[#FF2B44] shrink-0 font-black text-xs">
                        PDF
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-white block truncate">{doc.title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
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
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Download / View document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveDocument(doc.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-400 transition-colors"
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
        <div className="p-10 text-center rounded-2xl bg-[#0F131D] border border-slate-800">
          <p className="text-slate-400">No insurance policy configured for this patient.</p>
        </div>
      )}
    </div>
  );
};
