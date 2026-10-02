import React, { useState } from 'react';
import {
  UserPlus,
  ShieldAlert,
  MapPin,
  ChevronRight,
  ArrowLeft,
  HeartPulse,
  Info,
  CheckCircle2,
  HelpCircle,
  Zap
} from 'lucide-react';
import { FriendOtherEmergencyData } from '../types/emergency';
import { EMERGENCY_TYPE_OPTIONS } from '../data/mockInitialData';
import { LiveEmergencyMap } from './LiveEmergencyMap';

interface FriendEmergencyFlowProps {
  onBack: () => void;
  onContinueToSummary: (data: FriendOtherEmergencyData & {
    severity: 'CRITICAL (Priority 1)' | 'URGENT (Priority 2)' | 'STANDARD (Priority 3)';
    coords: { lat: number; lng: number };
  }) => void;
}

export const FriendEmergencyFlow: React.FC<FriendEmergencyFlowProps> = ({
  onBack,
  onContinueToSummary
}) => {
  // Required core fields
  const [patientName, setPatientName] = useState<string>('Sarah Jenkins');
  const [approximateAge, setApproximateAge] = useState<string>('Approx. 28-30');
  const [relationship, setRelationship] = useState<
    'Friend' | 'Colleague' | 'Neighbor' | 'Bystander / Passerby' | 'Other'
  >('Friend');

  // Location
  const [locationType, setLocationType] = useState<'Live Location' | 'Map Pin' | 'Manual Address'>('Map Pin');
  const [address, setAddress] = useState<string>('Central Park West & 72nd St Crosswalk (Sidewalk pedestrian bench)');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 37.7725, lng: -122.4289 });
  const [isSelectingOnMap, setIsSelectingOnMap] = useState<boolean>(false);

  // Emergency Type
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string>('trauma');
  const [notes, setNotes] = useState<string>('Bicycle collision with turning car. Patient conscious, complaints of right shoulder pain and bleeding.');

  // Medical info — STRICTLY default to "NOT PROVIDED" per requirements
  const [allergiesKnown, setAllergiesKnown] = useState<boolean>(false);
  const [allergiesValue, setAllergiesValue] = useState<string>('');

  const [conditionsKnown, setConditionsKnown] = useState<boolean>(false);
  const [conditionsValue, setConditionsValue] = useState<string>('');

  const [medsKnown, setMedsKnown] = useState<boolean>(false);
  const [medsValue, setMedsValue] = useState<string>('');

  const [contactKnown, setContactKnown] = useState<boolean>(false);
  const [contactValue, setContactValue] = useState<string>('');

  const selectedEmergencyObj = EMERGENCY_TYPE_OPTIONS.find((e) => e.id === selectedEmergencyId) || EMERGENCY_TYPE_OPTIONS[2];

  const handleProceed = () => {
    onContinueToSummary({
      patientName: patientName.trim() || 'Unknown Patient / Bystander',
      approximateAge: approximateAge.trim() || 'NOT PROVIDED',
      relationshipToRequester: relationship,
      patientLocation: {
        type: locationType,
        address: address.trim() || 'Current Device Coordinates',
        lat: coords.lat,
        lng: coords.lng
      },
      emergencyType: selectedEmergencyObj.label,
      severity: selectedEmergencyObj.severity,
      knownAllergies: allergiesKnown && allergiesValue.trim() ? allergiesValue.trim() : 'NOT PROVIDED',
      knownMedicalCondition: conditionsKnown && conditionsValue.trim() ? conditionsValue.trim() : 'NOT PROVIDED',
      currentMedication: medsKnown && medsValue.trim() ? medsValue.trim() : 'NOT PROVIDED',
      emergencyContact: contactKnown && contactValue.trim() ? contactValue.trim() : 'NOT PROVIDED',
      notes,
      coords
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Recipient Selection</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-amber-400 font-bold">MODE: [ FRIEND / OTHER ]</span>
          <span>·</span>
          <span>STEP 2 OF 3</span>
        </div>
      </div>

      {/* Screen Title & Fast Dispatch Callout */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1C1812] to-[#120F0B] border border-amber-900/50 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                EMERGENCY FOR SOMEONE ELSE
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Initiate emergency dispatch for a friend, colleague, or bystander who does not have a saved profile.
              </p>
            </div>
          </div>

          {/* Quick Immediate Dispatch Button (UX Rule: prioritize help over profile) */}
          <button
            type="button"
            onClick={handleProceed}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2 shrink-0 hover:scale-[1.02]"
          >
            <Zap className="w-4 h-4 text-black fill-black" />
            <span>DISPATCH NOW (SKIP DETAILS)</span>
          </button>
        </div>

        {/* Strict Medical Privacy & Non-Fabrication Rule Banner */}
        <div className="mt-4 p-3.5 bg-black/40 rounded-xl border border-amber-800/40 flex items-start gap-2.5 text-xs text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="font-bold text-amber-300">Strict Non-Fabrication Policy:</strong>
            <p className="text-[11px] text-slate-300 leading-normal">
              All unconfirmed medical fields are stamped <span className="font-mono font-bold text-amber-300">NOT PROVIDED</span>. RESQ ONE never infers, guesses, or fabricates medical history. Paramedics treat accordingly under blind-triage emergency protocols.
            </p>
          </div>
        </div>
      </div>

      {/* CORE FIELDS: Patient Identification */}
      <div className="p-6 rounded-2xl bg-[#0F131D] border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-amber-600/20 text-amber-400 text-xs flex items-center justify-center border border-amber-500/30">
            1
          </span>
          <span>Patient Identity & Relationship</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Patient Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Patient Name
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="e.g. Sarah Jenkins or 'Unknown Passerby'"
              className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Approximate Age */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Approximate Age
            </label>
            <input
              type="text"
              value={approximateAge}
              onChange={(e) => setApproximateAge(e.target.value)}
              placeholder="e.g. 25-30, Senior, Child"
              className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Relationship */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Relationship to Requester
            </label>
            <select
              value={relationship}
              onChange={(e) => setRelationship(e.target.value as any)}
              className="w-full bg-[#141824] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="Friend">Friend</option>
              <option value="Colleague">Colleague / Work Associate</option>
              <option value="Neighbor">Neighbor</option>
              <option value="Bystander / Passerby">Bystander / Passerby</option>
              <option value="Other">Other Person</option>
            </select>
          </div>
        </div>
      </div>

      {/* CORE FIELDS: Patient Location */}
      <div className="p-6 rounded-2xl bg-[#0F131D] border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-amber-600/20 text-amber-400 text-xs flex items-center justify-center border border-amber-500/30">
            2
          </span>
          <span>Patient Location</span>
        </h2>

        {/* Location selector mode */}
        <div className="flex flex-wrap gap-2">
          {(['Live Location', 'Map Pin', 'Manual Address'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setLocationType(t);
                if (t === 'Map Pin') setIsSelectingOnMap(true);
                else setIsSelectingOnMap(false);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                locationType === t
                  ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                  : 'bg-[#141824] text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              {t === 'Live Location' && '📍 Use Requester Current GPS'}
              {t === 'Map Pin' && '🗺️ Pin on Map'}
              {t === 'Manual Address' && '✏️ Manual Street Address'}
            </button>
          ))}
        </div>

        {/* Address Input */}
        <div className="relative">
          <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-amber-500" />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter street, intersection, or landmark where patient is located..."
            className="w-full bg-[#141824] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Map */}
        <LiveEmergencyMap
          mode={isSelectingOnMap ? 'selectLocation' : 'view'}
          patientAddress={address}
          patientCoords={coords}
          onLocationSelect={(newCoords, newAddr) => {
            setCoords(newCoords);
            setAddress(newAddr);
            setLocationType('Map Pin');
          }}
          heightClass="h-48"
        />
      </div>

      {/* CORE FIELDS: Emergency Type */}
      <div className="p-6 rounded-2xl bg-[#0F131D] border border-slate-800 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-amber-600/20 text-amber-400 text-xs flex items-center justify-center border border-amber-500/30">
            3
          </span>
          <span>Emergency Type</span>
        </h2>

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
                    ? 'bg-amber-950/60 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500'
                    : 'bg-[#141824] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {item.label}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-amber-500" />}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
                <div className="mt-2 text-[10px] font-mono font-bold text-amber-400">
                  {item.severity}
                </div>
              </button>
            );
          })}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Emergency Details / Patient Presentation
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Conscious, severe bleeding, or collapsed on ground"
            className="w-full bg-[#141824] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* OPTIONAL MEDICAL INFORMATION (Strictly marked as NOT PROVIDED if unknown) */}
      <div className="p-6 rounded-2xl bg-[#0F131D] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-amber-600/20 text-amber-400 text-xs flex items-center justify-center border border-amber-500/30">
              4
            </span>
            <span>Known Medical Information (Optional)</span>
          </h2>
          <span className="text-xs text-slate-400">
            Leave untouched if unknown — will display as <span className="font-mono text-amber-400 font-bold">NOT PROVIDED</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Field 1: Known allergies */}
          <div className="p-3.5 rounded-xl bg-[#141824] border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">Known Allergies</span>
              <button
                type="button"
                onClick={() => setAllergiesKnown(!allergiesKnown)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors ${
                  allergiesKnown ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {allergiesKnown ? 'Specified' : 'Mark NOT PROVIDED'}
              </button>
            </div>
            {allergiesKnown ? (
              <input
                type="text"
                value={allergiesValue}
                onChange={(e) => setAllergiesValue(e.target.value)}
                placeholder="e.g. Penicillin, Peanuts, Latex"
                className="w-full bg-[#0D1017] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            ) : (
              <div className="text-xs font-mono font-bold text-slate-400 bg-[#0D1017] p-2 rounded border border-slate-800">
                NOT PROVIDED
              </div>
            )}
          </div>

          {/* Field 2: Known medical condition */}
          <div className="p-3.5 rounded-xl bg-[#141824] border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">Known Medical Conditions</span>
              <button
                type="button"
                onClick={() => setConditionsKnown(!conditionsKnown)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors ${
                  conditionsKnown ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {conditionsKnown ? 'Specified' : 'Mark NOT PROVIDED'}
              </button>
            </div>
            {conditionsKnown ? (
              <input
                type="text"
                value={conditionsValue}
                onChange={(e) => setConditionsValue(e.target.value)}
                placeholder="e.g. Diabetic, Asthma, Epilepsy"
                className="w-full bg-[#0D1017] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            ) : (
              <div className="text-xs font-mono font-bold text-slate-400 bg-[#0D1017] p-2 rounded border border-slate-800">
                NOT PROVIDED
              </div>
            )}
          </div>

          {/* Field 3: Current medication */}
          <div className="p-3.5 rounded-xl bg-[#141824] border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">Current Medication</span>
              <button
                type="button"
                onClick={() => setMedsKnown(!medsKnown)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors ${
                  medsKnown ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {medsKnown ? 'Specified' : 'Mark NOT PROVIDED'}
              </button>
            </div>
            {medsKnown ? (
              <input
                type="text"
                value={medsValue}
                onChange={(e) => setMedsValue(e.target.value)}
                placeholder="e.g. Blood thinners, Insulin"
                className="w-full bg-[#0D1017] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            ) : (
              <div className="text-xs font-mono font-bold text-slate-400 bg-[#0D1017] p-2 rounded border border-slate-800">
                NOT PROVIDED
              </div>
            )}
          </div>

          {/* Field 4: Emergency contact */}
          <div className="p-3.5 rounded-xl bg-[#141824] border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">Emergency Contact</span>
              <button
                type="button"
                onClick={() => setContactKnown(!contactKnown)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors ${
                  contactKnown ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {contactKnown ? 'Specified' : 'Mark NOT PROVIDED'}
              </button>
            </div>
            {contactKnown ? (
              <input
                type="text"
                value={contactValue}
                onChange={(e) => setContactValue(e.target.value)}
                placeholder="e.g. Spouse John +1 555-012-9988"
                className="w-full bg-[#0D1017] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            ) : (
              <div className="text-xs font-mono font-bold text-slate-400 bg-[#0D1017] p-2 rounded border border-slate-800">
                NOT PROVIDED
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Primary CTA */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          Ready to generate Emergency Request Summary for <strong className="text-white">{patientName}</strong>
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
