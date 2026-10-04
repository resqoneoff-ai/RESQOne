import React, { useState } from 'react';
import {
  ShieldCheck,
  MapPin,
  AlertCircle,
  Activity,
  Heart,
  ChevronRight,
  Crosshair,
  Building,
  PhoneCall,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { UserEmergencyProfile, MedicalRecord } from '../types/emergency';
import { EMERGENCY_TYPE_OPTIONS } from '../data/mockInitialData';
import { LiveEmergencyMap } from './LiveEmergencyMap';

interface MeEmergencyFlowProps {
  userProfile: UserEmergencyProfile;
  pastMedicalRecords?: MedicalRecord[];
  onOpenMedicalRecords?: () => void;
  onBack: () => void;
  onContinueToSummary: (data: {
    selectedEmergency: string;
    severity: 'CRITICAL (Priority 1)' | 'URGENT (Priority 2)' | 'STANDARD (Priority 3)';
    symptomsNotes: string;
    consciousness: 'Conscious & Alert' | 'Drowsy / Confused' | 'Unconscious';
    breathing: 'Normal' | 'Labored / Struggling' | 'Gasping / Arrest';
    location: {
      type: 'Live Location' | 'Map Pin' | 'Manual Address';
      address: string;
      lat: number;
      lng: number;
    };
  }) => void;
}

export const MeEmergencyFlow: React.FC<MeEmergencyFlowProps> = ({
  userProfile,
  pastMedicalRecords = [],
  onOpenMedicalRecords,
  onBack,
  onContinueToSummary
}) => {
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string>('cardiac');
  const [symptomsNotes, setSymptomsNotes] = useState<string>('');
  const [consciousness, setConsciousness] = useState<'Conscious & Alert' | 'Drowsy / Confused' | 'Unconscious'>('Conscious & Alert');
  const [breathing, setBreathing] = useState<'Normal' | 'Labored / Struggling' | 'Gasping / Arrest'>('Labored / Struggling');
  const [locationType, setLocationType] = useState<'Live Location' | 'Map Pin' | 'Manual Address'>('Live Location');
  const [address, setAddress] = useState<string>('Current Verified Location (Detected via Device GPS)');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 37.7749, lng: -122.4194 });
  const [isSelectingOnMap, setIsSelectingOnMap] = useState<boolean>(false);

  const selectedEmergencyObj = EMERGENCY_TYPE_OPTIONS.find((e) => e.id === selectedEmergencyId) || EMERGENCY_TYPE_OPTIONS[0];

  const handleProceed = () => {
    onContinueToSummary({
      selectedEmergency: selectedEmergencyObj.label,
      severity: selectedEmergencyObj.severity,
      symptomsNotes,
      consciousness,
      breathing,
      location: {
        type: locationType,
        address,
        lat: coords.lat,
        lng: coords.lng
      }
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recipient Selection</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-[#FF2B44] font-bold">MODE: [ ME ]</span>
          <span>·</span>
          <span>EMERGENCY DISPATCH</span>
        </div>
      </div>

      {/* Hero Banner: Auto-Retrieved Authorized Emergency Passport */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#151A26] to-[#0E121B] border border-red-900/40 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Authorized Personal Emergency Profile Loaded</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Patient: {userProfile.fullName}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Age {userProfile.age} · Phone: {userProfile.phone} · Status: Verified Health Passport
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-red-950/70 border border-red-800/80 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-red-300 font-bold uppercase block tracking-wider">Blood Group</span>
              <span className="text-2xl font-black text-white">{userProfile.bloodGroup}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Affordability</span>
              <span className="text-xs font-bold text-slate-200">{userProfile.affordabilityPreference}</span>
            </div>
          </div>
        </div>

        {/* Retrieved Authorized Medical Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-1">
          {/* Allergies */}
          <div className="p-3 rounded-xl bg-[#0B0E14] border border-slate-800/80">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block mb-1">
              Documented Allergies
            </span>
            <div className="space-y-1">
              {userProfile.allergies.map((all, i) => (
                <div key={i} className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>{all}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Conditions */}
          <div className="p-3 rounded-xl bg-[#0B0E14] border border-slate-800/80">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
              Medical Conditions
            </span>
            <div className="space-y-1">
              {userProfile.medicalConditions.map((cond, i) => (
                <div key={i} className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{cond}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Medications & History */}
          <div className="p-3 rounded-xl bg-[#0B0E14] border border-slate-800/80">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
              Current Medications
            </span>
            <div className="space-y-1">
              {userProfile.medications.map((med, i) => (
                <div key={i} className="text-xs text-slate-300 truncate" title={med}>
                  {med}
                </div>
              ))}
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                History: {userProfile.medicalHistory[0]}
              </div>
            </div>
          </div>

          {/* Insurance & Preferred Hospital */}
          <div className="p-3 rounded-xl bg-[#0B0E14] border border-slate-800/80">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
              Insurance & Preference
            </span>
            <div className="text-xs text-slate-200 font-semibold truncate" title={userProfile.insuranceInfo.provider}>
              {userProfile.insuranceInfo.provider}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Policy: {userProfile.insuranceInfo.policyNumber}
            </div>
            <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
              <Building className="w-3 h-3 text-slate-400" />
              <span className="truncate">{userProfile.preferredHospitals[0].name}</span>
            </div>
          </div>
        </div>

        {/* Emergency Contacts Strip */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-3.5 h-3.5 text-red-400" />
            <span className="font-semibold text-slate-300">Auto-Notified Emergency Contacts:</span>
            <span>
              {userProfile.emergencyContacts[0].name} ({userProfile.emergencyContacts[0].relation}) · {userProfile.emergencyContacts[0].phone}
            </span>
          </div>
          <span className="text-emerald-400 text-[11px] font-mono">
            Direct SMS & SOS Broadcast Pre-Armed
          </span>
        </div>

        {/* Verified Past Medical Records Attached to Dispatch */}
        {pastMedicalRecords.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Past Medical & Surgical History ({pastMedicalRecords.length})</span>
              </span>
              {onOpenMedicalRecords && (
                <button
                  type="button"
                  onClick={onOpenMedicalRecords}
                  className="text-[11px] text-red-400 hover:text-white font-semibold underline underline-offset-2"
                >
                  Update / Add Records
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {pastMedicalRecords.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-2 rounded-lg bg-[#0A0D13] border border-slate-800 text-[11px]">
                  <span className="font-bold text-white block truncate">{rec.title}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{rec.date} · {rec.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* QUESTION 1: WHAT HAPPENED? */}
      <div className="p-6 rounded-2xl bg-[#0F131D] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-red-600/20 text-[#FF2B44] font-bold text-xs flex items-center justify-center border border-red-500/30">
              1
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">What happened?</h2>
              <p className="text-xs text-slate-400">Select the primary emergency category</p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-red-400">REQUIRED</span>
        </div>

        {/* Emergency Types Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {EMERGENCY_TYPE_OPTIONS.map((item) => {
            const isSelected = selectedEmergencyId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedEmergencyId(item.id)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-red-950/60 border-[#FF2B44] shadow-[0_0_15px_rgba(255,43,68,0.25)] ring-1 ring-[#FF2B44]'
                    : 'bg-[#141824] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {item.label}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-[#FF2B44]" />}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
                <div className="mt-2 text-[10px] font-mono font-bold text-red-400">
                  {item.severity}
                </div>
              </button>
            );
          })}
        </div>

        {/* Patient Status Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Consciousness */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Current Consciousness
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Conscious & Alert', 'Drowsy / Confused', 'Unconscious'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setConsciousness(status)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                    consciousness === status
                      ? 'bg-red-600 text-white border-red-500 shadow-sm'
                      : 'bg-[#141824] text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Breathing */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Breathing Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Normal', 'Labored / Struggling', 'Gasping / Arrest'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setBreathing(st)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                    breathing === st
                      ? 'bg-red-600 text-white border-red-500 shadow-sm'
                      : 'bg-[#141824] text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Symptoms / Notes Input */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Emergency Details / Specific Symptoms
          </label>
          <input
            type="text"
            value={symptomsNotes}
            onChange={(e) => setSymptomsNotes(e.target.value)}
            placeholder="e.g. Chest tightness radiating to left arm, severe shortness of breath, dizziness"
            className="w-full bg-[#141824] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2B44] focus:ring-1 focus:ring-[#FF2B44]"
          />
        </div>
      </div>

      {/* QUESTION 2: WHERE IS THE PATIENT? */}
      <div className="p-6 rounded-2xl bg-[#0F131D] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-red-600/20 text-[#FF2B44] font-bold text-xs flex items-center justify-center border border-red-500/30">
              2
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">Where is the patient?</h2>
              <p className="text-xs text-slate-400">Exact coordinates and address for CAD ambulance dispatch</p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-400">GPS ACTIVE</span>
        </div>

        {/* Location mode tabs */}
        <div className="flex flex-wrap gap-2">
          {(['Live Location', 'Map Pin', 'Manual Address'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setLocationType(t);
                if (t === 'Map Pin') setIsSelectingOnMap(true);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                locationType === t
                  ? 'bg-white text-slate-900 border-white font-bold'
                  : 'bg-[#141824] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {t === 'Live Location' && '📍 Use My Live GPS'}
              {t === 'Map Pin' && '🗺️ Select on Map'}
              {t === 'Manual Address' && '✏️ Enter Address Manually'}
            </button>
          ))}
        </div>

        {/* Address Input */}
        <div className="space-y-2">
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-[#FF2B44]" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter exact address or landmark..."
              className="w-full bg-[#141824] border border-slate-700 rounded-xl pl-10 pr-24 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2B44]"
            />
            <button
              type="button"
              onClick={() => {
                setAddress('742 Evergreen Terrace, North Ridge District');
                setLocationType('Live Location');
              }}
              className="absolute right-2 top-2 px-2.5 py-1 text-[11px] font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-lg"
            >
              Refresh GPS
            </button>
          </div>
        </div>

        {/* Interactive Map Visual */}
        <LiveEmergencyMap
          mode={isSelectingOnMap ? 'selectLocation' : 'view'}
          patientAddress={address}
          patientCoords={coords}
          onLocationSelect={(newCoords, newAddr) => {
            setCoords(newCoords);
            setAddress(newAddr);
            setLocationType('Map Pin');
          }}
          heightClass="h-56"
        />
      </div>

      {/* Primary Action Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          Next step: Emergency Request Summary & Dispatch Confirmation
        </div>
        <button
          onClick={handleProceed}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#FF2B44] to-red-600 hover:from-red-600 hover:to-red-700 text-white font-black text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(255,43,68,0.4)] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>REVIEW & CONFIRM DISPATCH</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
