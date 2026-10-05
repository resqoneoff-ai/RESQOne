import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Phone,
  PhoneCall,
  MapPin,
  Navigation,
  Share2,
  Copy,
  Check,
  Activity,
  Heart,
  Pill,
  Clock,
  Building2,
  UserCheck,
  Lock,
  Eye,
  Radio,
  ExternalLink
} from 'lucide-react';
import { FamilyMemberRecord, PermissionLevel } from '../../types/family';
import { familyService } from '../../services/familyService';

interface EmergencyAssistanceScreenProps {
  member: FamilyMemberRecord;
  currentUser: { id: string; fullName: string; role?: string };
  familyName: string;
  onBack: () => void;
  onInitiateDispatch: (member: FamilyMemberRecord, authorizedData: ReturnType<typeof familyService.getAuthorizedMedicalView>) => void;
}

export const EmergencyAssistanceScreen: React.FC<EmergencyAssistanceScreenProps> = ({
  member,
  currentUser,
  familyName,
  onBack,
  onInitiateDispatch
}) => {
  const [copiedLocation, setCopiedLocation] = useState(false);
  const [accessLogged, setAccessLogged] = useState(false);

  // Retrieve authorized fields based on granular permissions
  const authorizedData = familyService.getAuthorizedMedicalView(member);

  // Write Audit Log on Mount
  useEffect(() => {
    if (!accessLogged) {
      const accessedFields: string[] = ['Baseline Emergency Contacts'];
      if (authorizedData.location) accessedFields.push('Live / Last Known GPS Location');
      if (authorizedData.alerts.length > 0) accessedFields.push('Critical Medical Alerts');
      if (authorizedData.devices.length > 0) accessedFields.push('Implanted Medical Devices');
      if (authorizedData.bloodGroup) accessedFields.push('Blood Group');
      if (authorizedData.conditions.length > 0) accessedFields.push('Medical Conditions');
      if (authorizedData.medications.length > 0) accessedFields.push('Medications');
      if (authorizedData.preferredHospital) accessedFields.push('Preferred Hospital');

      familyService.logEmergencyAccess({
        familyId: member.familyId,
        familyName,
        viewerUserId: currentUser.id,
        viewerName: currentUser.fullName,
        viewerRole: currentUser.role || 'Family Member',
        profileOwnerUserId: member.userId,
        profileOwnerName: member.fullName,
        accessReason: 'Emergency Assistance Screen Initiated via RESQ One',
        informationAccessed: accessedFields,
        permissionLevelApplied: member.permissionLevel,
        locationAccessed: Boolean(authorizedData.location)
      });
      setAccessLogged(true);
    }
  }, [member, currentUser, familyName, authorizedData, accessLogged]);

  const handleCopyLocation = () => {
    if (!authorizedData.location) return;
    const text = `RESQ ONE EMERGENCY: ${member.fullName} (${member.relationship}) location: ${authorizedData.location.address} (GPS: ${authorizedData.location.lat}, ${authorizedData.location.lng})`;
    navigator.clipboard?.writeText(text);
    setCopiedLocation(true);
    setTimeout(() => setCopiedLocation(false), 2500);
  };

  const handleOpenDirections = () => {
    if (!authorizedData.location) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${authorizedData.location.lat},${authorizedData.location.lng}`;
    window.open(url, '_blank');
  };

  const permissionLevelLabel =
    member.permissionLevel === 'LEVEL_3'
      ? 'Level 3: Full Emergency Profile'
      : member.permissionLevel === 'LEVEL_2'
      ? 'Level 2: Critical Alerts Authorized'
      : 'Level 1: Emergency Access Only';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Family Dashboard</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="text-[#FF2B44] font-bold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            EMERGENCY ASSISTANCE SCREEN
          </span>
          <span>·</span>
          <span className="text-slate-500">{familyName}</span>
        </div>
      </div>

      {/* Main Alert Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/70 via-rose-950/40 to-slate-900 border border-red-800/80 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-red-600/20 text-[#FF2B44] border border-red-500/30 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400">Active Emergency Session</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-900/60 text-red-200 border border-red-700/60">
                AUDITED
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-0.5">
              Assisting: {member.fullName} ({member.relationship})
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Age {member.age} · All emergency records displayed have been verified and authorized by {member.fullName}.
            </p>
          </div>
        </div>

        {/* Quick Emergency Call Dialers */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:911"
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-transform hover:scale-105"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>CALL 911 / 112</span>
          </a>
        </div>
      </div>

      {/* Section 1: Person & Location */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Person Identity Card */}
        <div className="p-5 rounded-2xl bg-[#0D1017] border border-slate-800 space-y-3">
          <div className="text-[11px] font-mono uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Authorized Profile</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-black text-lg">
              {member.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">{member.fullName}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-blue-400 bg-blue-950/70 border border-blue-800/80 px-2 py-0.5 rounded">
                  {member.relationship}
                </span>
                <span className="text-xs text-slate-400">Age {member.age}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-1 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Account Status:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Active & Verified
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Permission Level:</span>
              <span className="text-blue-300 font-mono text-[11px]">{permissionLevelLabel}</span>
            </div>
          </div>
        </div>

        {/* Location & GPS Status */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-[#0D1017] border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Location Telemetry</span>
              </span>
              {authorizedData.location && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {authorizedData.location.lastPing}
                </span>
              )}
            </div>

            {authorizedData.location ? (
              <div className="mt-2 space-y-2">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
                      {authorizedData.location.isLive ? 'Current GPS Telemetry' : 'Last Known Location'}
                    </span>
                    <strong className="text-sm text-white block mt-0.5">{authorizedData.location.address}</strong>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                      Coordinates: {authorizedData.location.lat.toFixed(5)}, {authorizedData.location.lng.toFixed(5)}
                    </span>
                  </div>
                  {member.liveLocation?.batteryLevel && (
                    <span className="text-[11px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      🔋 {member.liveLocation.batteryLevel}%
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-2 p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Location permission has not been granted by {member.fullName}.</span>
              </div>
            )}
          </div>

          {/* Location Actions */}
          {authorizedData.location && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={handleCopyLocation}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                {copiedLocation ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLocation ? 'Coordinates Copied!' : 'Share Coordinates'}</span>
              </button>

              <button
                onClick={handleOpenDirections}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Navigate to Location</span>
                <ExternalLink className="w-3 h-3 text-blue-200" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Critical Medical Alerts & Devices */}
      <div className="p-5 rounded-2xl bg-[#0D1017] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-wider text-red-400 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5" />
            <span>Critical Medical Alerts & Implants</span>
          </span>
          {authorizedData.bloodGroup && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-950/80 border border-red-800/80 text-center">
              <span className="text-[10px] text-red-300 font-bold uppercase font-mono">Blood Group:</span>
              <strong className="text-sm font-black text-white">{authorizedData.bloodGroup}</strong>
            </div>
          )}
        </div>

        {/* Alerts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Medical Alerts */}
          {authorizedData.alerts.length > 0 ? (
            authorizedData.alerts.map((alert, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/60 flex items-start gap-2.5 shadow-sm"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs font-bold text-red-200 block">Critical Medical Alert</strong>
                  <p className="text-xs text-red-300/90 mt-0.5">{alert}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
              No critical emergency alerts recorded.
            </div>
          )}

          {/* Implanted Devices */}
          {authorizedData.devices.length > 0 ? (
            authorizedData.devices.map((device, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/60 flex items-start gap-2.5 shadow-sm"
              >
                <Activity className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs font-bold text-blue-200 block">Registered Medical Device / Implant</strong>
                  <p className="text-xs text-blue-300/90 mt-0.5">{device}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
              No medical implants or devices registered.
            </div>
          )}
        </div>

        {/* Allergies Pill Row */}
        {authorizedData.allergies.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider block mb-2">
              Known Allergies (Emergency Precautions)
            </span>
            <div className="flex flex-wrap gap-2">
              {authorizedData.allergies.map((allergy, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-800/70 text-red-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {allergy}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Emergency Contacts & Important Medical Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Emergency Contacts */}
        <div className="p-5 rounded-2xl bg-[#0D1017] border border-slate-800 space-y-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5" />
            <span>Emergency Contacts</span>
          </span>

          <div className="space-y-2">
            {authorizedData.contacts.map((contact, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <strong className="text-xs font-bold text-white block">{contact.name}</strong>
                  <span className="text-[11px] text-slate-400 font-mono">{contact.phone}</span>
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            ))}

            {member.phone && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <strong className="text-xs font-bold text-white block">Direct Patient Line ({member.fullName})</strong>
                  <span className="text-[11px] text-slate-400 font-mono">{member.phone}</span>
                </div>
                <a
                  href={`tel:${member.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Member</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Important Medical Info (Level 3 or Permission Controlled) */}
        <div className="p-5 rounded-2xl bg-[#0D1017] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5" />
              <span>Medical History & Care Routing</span>
            </span>
            {member.permissionLevel !== 'LEVEL_3' && (
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                <span>Restricted by Permission</span>
              </span>
            )}
          </div>

          {member.permissionLevel === 'LEVEL_3' ? (
            <div className="space-y-2 text-xs">
              {authorizedData.conditions.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Known Conditions:</span>
                  <span className="text-slate-200 font-semibold">{authorizedData.conditions.join(', ')}</span>
                </div>
              )}

              {authorizedData.medications.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Current Medications:</span>
                  <span className="text-slate-200 font-semibold">{authorizedData.medications.join(', ')}</span>
                </div>
              )}

              {authorizedData.preferredHospital && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Preferred Hospital:</span>
                    <span className="text-slate-200 font-semibold">{authorizedData.preferredHospital}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
              <Shield className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                Detailed medical history is protected under <strong>{permissionLevelLabel}</strong>. Only emergency
                alerts and acute triage data are shared.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Actions Bar (Big CTA) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#141826] to-[#0F131F] border border-blue-900/50 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold text-white block">Ready to deploy emergency response?</span>
          <p className="text-xs text-slate-400">
            Transmit {member.fullName}'s authorized telemetry and GPS directly to RESQ One CAD and ambulance fleet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => onInitiateDispatch(member, authorizedData)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-transform hover:scale-105"
          >
            <Activity className="w-4 h-4 animate-pulse" />
            <span>DISPATCH EMERGENCY RESPONSE</span>
          </button>
        </div>
      </div>

      {/* Audit Log Transparency Footnote */}
      <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>
            <strong>Transparency Notice:</strong> This emergency access has been logged with immutable audit record ID{' '}
            <code className="text-blue-300 font-mono text-[10px]">sess-emerg-{member.id.slice(-4)}</code>.
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono shrink-0">HIPAA Protected</span>
      </div>
    </div>
  );
};
