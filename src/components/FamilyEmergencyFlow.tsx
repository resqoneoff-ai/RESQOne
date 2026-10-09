import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Navigation,
  Share2,
  Building,
  CheckCircle,
  Radio,
  Battery,
  AlertCircle
} from 'lucide-react';
import { FamilyMemberProfile, MedicalRecord } from '../types/emergency';
import { EMERGENCY_TYPE_OPTIONS } from '../data/mockInitialData';
import { LiveEmergencyMap } from './LiveEmergencyMap';
import { getCurrentPatientLocation } from '../services/locationService';

interface FamilyEmergencyFlowProps {
  familyProfiles: FamilyMemberProfile[];
  pastMedicalRecords?: MedicalRecord[];
  onOpenMedicalRecords?: () => void;
  onBack: () => void;
  onContinueToSummary: (data: {
    familyMember: FamilyMemberProfile;
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

export const FamilyEmergencyFlow: React.FC<FamilyEmergencyFlowProps> = ({
  familyProfiles,
  pastMedicalRecords = [],
  onOpenMedicalRecords,
  onBack,
  onContinueToSummary
}) => {
  const [selectedMember, setSelectedMember] = useState<FamilyMemberProfile | null>(null);
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string>('cardiac');
  const [symptomsNotes, setSymptomsNotes] = useState<string>('');
  const [consciousness, setConsciousness] = useState<'Conscious & Alert' | 'Drowsy / Confused' | 'Unconscious'>('Conscious & Alert');
  const [breathing, setBreathing] = useState<'Normal' | 'Labored / Struggling' | 'Gasping / Arrest'>('Labored / Struggling');

  // Location modes for family member
  const [locationMode, setLocationMode] = useState<'patientLive' | 'shareLocation' | 'mapPin' | 'manual'>('patientLive');
  const [address, setAddress] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isSelectingOnMap, setIsSelectingOnMap] = useState<boolean>(false);
  const [shareLinkSent, setShareLinkSent] = useState<boolean>(false);

  // Capture real GPS if patient is with requester
  const capturePatientGps = async () => {
    const res = await getCurrentPatientLocation();
    if (res.success && res.coordinates) {
      setCoords({ lat: res.coordinates.latitude, lng: res.coordinates.longitude });
      setAddress(`GPS Location (Accuracy: ±${res.coordinates.accuracy} m)`);
    }
  };

  // When a member is picked, prepopulate only if valid non-placeholder coordinates exist
  const handleSelectMember = (member: FamilyMemberProfile) => {
    setSelectedMember(member);
    if (member.liveLocation && member.liveLocation.lat !== 37.7749) {
      setAddress(member.liveLocation.address);
      setCoords({ lat: member.liveLocation.lat, lng: member.liveLocation.lng });
    } else {
      setAddress('');
      setCoords(null);
    }
  };

  const handleSharePatientLocation = () => {
    setShareLinkSent(true);
    setTimeout(() => {
      setShareLinkSent(false);
    }, 4000);
  };

  const selectedEmergencyObj = EMERGENCY_TYPE_OPTIONS.find((e) => e.id === selectedEmergencyId) || EMERGENCY_TYPE_OPTIONS[0];

  const handleProceed = () => {
    if (!selectedMember) return;
    onContinueToSummary({
      familyMember: selectedMember,
      selectedEmergency: selectedEmergencyObj.label,
      severity: selectedEmergencyObj.severity,
      symptomsNotes,
      consciousness,
      breathing,
      location: {
        type:
          locationMode === 'patientLive'
            ? 'Live Location'
            : locationMode === 'mapPin'
            ? 'Map Pin'
            : 'Manual Address',
        address: address.trim() || 'Patient location required',
        lat: coords ? coords.lat : 0,
        lng: coords ? coords.lng : 0
      }
    });
  };

  // STEP 1: Select Family Member Screen
  if (!selectedMember) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/60"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Recipient Selection</span>
          </button>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-blue-400 font-bold">MODE: [ FAMILY ]</span>
            <span>·</span>
            <span>SELECT MEMBER</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121824] to-[#0D111A] border border-blue-900/40 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Saved Family & Linked Profiles</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Choose the family member who needs emergency dispatch. Only authorized medical records are shared.
              </p>
            </div>
          </div>

          {/* Family Members List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-6">
            {familyProfiles.map((member) => (
              <div
                key={member.id}
                className="p-4 sm:p-5 rounded-xl bg-[#0B0E15] border border-slate-800 hover:border-blue-500/80 transition-all flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-black text-lg">
                        {member.avatarInitials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                            {member.name}
                          </h2>
                          <span className="text-xs font-bold text-blue-400 bg-blue-950/70 border border-blue-800/80 px-2 py-0.5 rounded">
                            {member.relationship}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Age {member.age} · {member.profileStatus}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Availability & Medical summary */}
                  <div className="mt-3 pt-3 border-t border-slate-800/70 space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{member.emergencyProfileAvailability}</span>
                    </div>

                    {member.authorizedInfo.medicalAlerts.length > 0 && (
                      <div className="text-[11px] text-red-300 bg-red-950/40 border border-red-900/50 px-2 py-1 rounded">
                        <strong className="text-red-400">Alert:</strong> {member.authorizedInfo.medicalAlerts[0]}
                      </div>
                    )}

                    {member.liveLocation && (
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{member.liveLocation.address}</span>
                        </span>
                        <span className="text-emerald-400 font-mono text-[10px] shrink-0">
                          {member.liveLocation.lastPing}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SELECT -> EMERGENCY button */}
                <div className="mt-4 pt-3 border-t border-slate-800/60">
                  <button
                    onClick={() => handleSelectMember(member)}
                    className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-[#FF2B44] text-white font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(255,43,68,0.3)] flex items-center justify-center gap-2 group-hover:scale-[1.01]"
                  >
                    <span>SELECT → EMERGENCY</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: Selected Family Member Emergency Screen
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSelectedMember(null)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Switch Family Member</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-[#FF2B44] font-bold">EMERGENCY FOR: {selectedMember.relationship.toUpperCase()}</span>
          <span>·</span>
          <span>STEP 2 OF 3</span>
        </div>
      </div>

      {/* Selected Member Authorized Information Panel */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#151A26] to-[#0E121B] border border-red-900/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
              <Users className="w-4 h-4" />
              <span>Family Member Emergency Record Loaded</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {selectedMember.name}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Relationship: <strong className="text-slate-200">{selectedMember.relationship}</strong> · Age {selectedMember.age} · Status: {selectedMember.profileStatus}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedMember.authorizedInfo.bloodGroup && (
              <div className="bg-red-950/70 border border-red-800/80 px-4 py-2 rounded-xl text-center">
                <span className="text-[10px] text-red-300 font-bold uppercase block tracking-wider">Blood</span>
                <span className="text-2xl font-black text-white">{selectedMember.authorizedInfo.bloodGroup}</span>
              </div>
            )}
            <div className="bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Access</span>
              <span className="text-xs font-bold text-emerald-400">Authorized Info</span>
            </div>
          </div>
        </div>

        {/* Authorized info display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Medical Alerts */}
          <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-900/60">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Relevant Medical Alerts</span>
            </span>
            <div className="space-y-1">
              {selectedMember.authorizedInfo.medicalAlerts.map((alert, i) => (
                <div key={i} className="text-xs font-bold text-red-200">
                  • {alert}
                </div>
              ))}
            </div>
          </div>

          {/* Conditions & Allergies */}
          <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-slate-800">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5">
              Known Conditions & Allergies
            </span>
            <div className="text-xs text-slate-200 space-y-1">
              <div>
                <span className="text-slate-400">Conditions: </span>
                {selectedMember.authorizedInfo.medicalConditions?.join(', ') || 'None reported'}
              </div>
              <div>
                <span className="text-slate-400">Allergies: </span>
                <span className="text-red-300">{selectedMember.authorizedInfo.allergies?.join(', ') || 'NKDA'}</span>
              </div>
            </div>
          </div>

          {/* Preferred Hospital & Insurance */}
          <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-slate-800">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              <span>Hospital & Insurance</span>
            </span>
            <div className="text-xs text-slate-200">
              <div className="font-semibold truncate">{selectedMember.authorizedInfo.preferredHospital || 'Nearest Trauma Center'}</div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">
                {selectedMember.authorizedInfo.insuranceStatus || 'Verified Health Plan'}
              </div>
            </div>
          </div>
        </div>

        {/* Member's Past Medical Records & Procedures */}
        {pastMedicalRecords.filter((r) => r.patientId === selectedMember.id).length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  Authorized Past Records & Surgical History ({pastMedicalRecords.filter((r) => r.patientId === selectedMember.id).length})
                </span>
              </span>
              {onOpenMedicalRecords && (
                <button
                  type="button"
                  onClick={onOpenMedicalRecords}
                  className="text-[11px] text-blue-400 hover:text-white font-semibold underline underline-offset-2"
                >
                  Update / Add Records
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {pastMedicalRecords
                .filter((r) => r.patientId === selectedMember.id)
                .slice(0, 3)
                .map((rec) => (
                  <div key={rec.id} className="p-2 rounded-lg bg-[#0A0D13] border border-slate-800 text-[11px]">
                    <span className="font-bold text-white block truncate">{rec.title}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{rec.date} · {rec.category}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* QUESTION: WHERE IS THE PATIENT? (CRITICAL: Requester may be in a different location!) */}
      <div className="p-6 rounded-2xl bg-[#0F131D] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center border border-blue-500/30">
              1
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">WHERE IS THE PATIENT?</h2>
              <p className="text-xs text-amber-400 font-medium">
                Important: You (the requester) may be in a different location from {selectedMember.name}.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Location Modes as explicitly requested by prompt:
            - Use patient's live location
            - Share patient location
            - Select location on map
            - Enter address manually
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Mode 1: Use patient's live location */}
          <button
            type="button"
            onClick={() => {
              setLocationMode('patientLive');
              setIsSelectingOnMap(false);
              if (selectedMember.liveLocation) {
                setAddress(selectedMember.liveLocation.address);
                setCoords({ lat: selectedMember.liveLocation.lat, lng: selectedMember.liveLocation.lng });
              }
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              locationMode === 'patientLive'
                ? 'bg-blue-950/70 border-blue-500 text-white ring-1 ring-blue-500 shadow-md'
                : 'bg-[#141824] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">Use Patient’s Live Location</span>
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Connected device live ping ({selectedMember.liveLocation?.lastPing || 'Active'})
            </p>
          </button>

          {/* Mode 2: Share patient location */}
          <button
            type="button"
            onClick={() => {
              setLocationMode('shareLocation');
              handleSharePatientLocation();
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              locationMode === 'shareLocation'
                ? 'bg-blue-950/70 border-blue-500 text-white ring-1 ring-blue-500 shadow-md'
                : 'bg-[#141824] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">Share Patient Location</span>
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Send instant GPS locator link via SMS / App ping
            </p>
          </button>

          {/* Mode 3: Select location on map */}
          <button
            type="button"
            onClick={() => {
              setLocationMode('mapPin');
              setIsSelectingOnMap(true);
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              locationMode === 'mapPin'
                ? 'bg-blue-950/70 border-blue-500 text-white ring-1 ring-blue-500 shadow-md'
                : 'bg-[#141824] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">Select on Map</span>
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Tap directly on city grid to pinpoint location
            </p>
          </button>

          {/* Mode 4: Enter address manually */}
          <button
            type="button"
            onClick={() => {
              setLocationMode('manual');
              setIsSelectingOnMap(false);
            }}
            className={`p-3 rounded-xl border text-left transition-all ${
              locationMode === 'manual'
                ? 'bg-blue-950/70 border-blue-500 text-white ring-1 ring-blue-500 shadow-md'
                : 'bg-[#141824] border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold">Enter Address Manually</span>
              <MapPin className="w-3.5 h-3.5 text-[#FF2B44]" />
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Type apartment, room number, or facility address
            </p>
          </button>
        </div>

        {/* Share patient location banner feedback */}
        {shareLinkSent && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Urgent GPS locator ping dispatched to {selectedMember.name}&apos;s mobile device. Location auto-locked to coordinates.
            </span>
          </div>
        )}

        {/* Address Input Field */}
        <div className="relative">
          <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-[#FF2B44]" />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Patient's exact current address / location..."
            className="w-full bg-[#141824] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Live Map */}
        <LiveEmergencyMap
          mode={isSelectingOnMap ? 'selectLocation' : 'view'}
          patientAddress={address}
          patientCoords={coords}
          onRequestLocation={capturePatientGps}
          onLocationSelect={(newCoords, newAddr) => {
            setCoords(newCoords);
            setAddress(newAddr);
            setLocationMode('mapPin');
          }}
          heightClass="h-56"
        />
      </div>

      {/* QUESTION: EMERGENCY TYPE */}
      <div className="p-6 rounded-2xl bg-[#0F131D] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-red-600/20 text-[#FF2B44] font-bold text-xs flex items-center justify-center border border-red-500/30">
              2
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">Emergency Type & Acute Symptoms</h2>
              <p className="text-xs text-slate-400">Select what {selectedMember.name} is experiencing</p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-red-400">REQUIRED</span>
        </div>

        {/* Emergency Type Grid */}
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

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
            Additional Emergency Observations
          </label>
          <input
            type="text"
            value={symptomsNotes}
            onChange={(e) => setSymptomsNotes(e.target.value)}
            placeholder="e.g. Complaining of sudden chest pressure, sweating, unable to walk"
            className="w-full bg-[#141824] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2B44]"
          />
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          Continuing to summary for {selectedMember.relationship} ({selectedMember.name})
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
