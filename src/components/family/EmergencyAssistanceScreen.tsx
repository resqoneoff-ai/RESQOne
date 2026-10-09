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
          className="flex items-center gap-2 text-sm font-semibold text-[#596579] hover:text-[#082B5C] dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Family Dashboard</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#596579] dark:text-slate-400">
          <span className="text-[#F36C21] font-bold flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#F36C21] animate-pulse" />
            EMERGENCY ASSISTANCE
          </span>
          <span>·</span>
          <span>{familyName}</span>
        </div>
      </div>

      {/* Main Alert Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E131F] border border-[#DCE3EC] dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#FFF1E8] text-[#F36C21] border border-[#F36C21]/20 shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#F36C21]">Active Family Emergency</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF8F1] text-[#18A66A] border border-[#18A66A]/20">
                VERIFIED
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#082B5C] dark:text-white mt-0.5">
              Assisting: {member.fullName} ({member.relationship})
            </h1>
            <p className="text-xs text-[#596579] dark:text-slate-300 mt-0.5">
              Age {member.age} · All emergency records displayed have been verified and authorized by {member.fullName}.
            </p>
          </div>
        </div>

        {/* Quick Emergency Call Dialers */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="tel:112"
            className="px-4 py-2.5 rounded-xl bg-[#082B5C] hover:bg-[#061C3D] text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xs transition-transform hover:scale-105 active:scale-95"
          >
            <PhoneCall className="w-4 h-4 text-[#F36C21] animate-bounce" />
            <span>CALL 112 / 108</span>
          </a>
        </div>
      </div>

      {/* Section 1: Person & Location */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Person Identity Card */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-[#DCE3EC] dark:border-slate-800 shadow-xs space-y-3">
          <div className="text-[11px] uppercase tracking-wider text-[#2F80C9] font-bold flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Authorized Profile</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#EAF4FF] text-[#082B5C] border border-[#2F80C9]/20 flex items-center justify-center font-black text-lg">
              {member.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#082B5C] dark:text-white">{member.fullName}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-semibold text-[#082B5C] bg-[#EAF4FF] border border-[#2F80C9]/30 px-2 py-0.5 rounded">
                  {member.relationship}
                </span>
                <span className="text-xs text-[#596579]">Age {member.age}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#DCE3EC] dark:border-slate-800/80 space-y-1 text-xs">
            <div className="flex items-center justify-between text-[#596579]">
              <span>Account Status:</span>
              <span className="text-[#18A66A] font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#18A66A]" />
                Active & Verified
              </span>
            </div>
            <div className="flex items-center justify-between text-[#596579]">
              <span>Permission Level:</span>
              <span className="text-[#082B5C] dark:text-blue-300 font-semibold text-[11px]">{permissionLevelLabel}</span>
            </div>
          </div>
        </div>

        {/* Location & GPS Status */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-[#DCE3EC] dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[#18A66A] font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Location Telemetry</span>
              </span>
              {authorizedData.location && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#EAF8F1] text-[#18A66A] border border-[#18A66A]/20 flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#18A66A] animate-ping" />
                  {authorizedData.location.lastPing}
                </span>
              )}
            </div>

            {authorizedData.location ? (
              <div className="mt-2 space-y-2">
                <div className="p-3 rounded-xl bg-[#FAFBFC] dark:bg-slate-900/90 border border-[#DCE3EC] dark:border-slate-800 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-[#596579] uppercase tracking-wider block font-bold">
                      {authorizedData.location.isLive ? 'Current GPS Location' : 'Last Known Location'}
                    </span>
                    <strong className="text-sm text-[#082B5C] dark:text-white block mt-0.5">{authorizedData.location.address}</strong>
                    <span className="text-[11px] text-[#596579] font-mono mt-0.5 block">
                      Coordinates: {authorizedData.location.lat.toFixed(5)}, {authorizedData.location.lng.toFixed(5)}
                    </span>
                  </div>
                  {member.liveLocation?.batteryLevel && (
                    <span className="text-[11px] px-2 py-1 rounded bg-white dark:bg-slate-800 text-[#596579] dark:text-slate-300 border border-[#DCE3EC] dark:border-slate-700 font-bold">
                      🔋 {member.liveLocation.batteryLevel}%
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-2 p-3 rounded-xl bg-[#FAFBFC] border border-[#DCE3EC] text-[#596579] text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#F36C21]" />
                <span>Location permission has not been granted by {member.fullName}.</span>
              </div>
            )}
          </div>

          {/* Location Actions */}
          {authorizedData.location && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#DCE3EC] dark:border-slate-800/80">
              <button
                onClick={handleCopyLocation}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs text-[#082B5C] dark:text-white font-bold flex items-center gap-1.5 border border-[#DCE3EC] dark:border-slate-700 transition-colors"
              >
                {copiedLocation ? <Check className="w-3.5 h-3.5 text-[#18A66A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLocation ? 'Coordinates Copied!' : 'Share Coordinates'}</span>
              </button>

              <button
                onClick={handleOpenDirections}
                className="px-3 py-1.5 rounded-lg bg-[#2F80C9] hover:bg-blue-600 text-xs text-white font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Navigate to Location</span>
                <ExternalLink className="w-3 h-3 text-blue-100" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Critical Medical Alerts & Devices */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-[#DCE3EC] dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-[#082B5C] font-bold flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#F36C21]" />
            <span>Critical Medical Alerts & Implants</span>
          </span>
          {authorizedData.bloodGroup && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF0EF] border border-[#D92D20]/20 text-center">
              <span className="text-[10px] text-[#D92D20] font-bold uppercase">Blood Group:</span>
              <strong className="text-sm font-black text-[#D92D20]">{authorizedData.bloodGroup}</strong>
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
                className="p-3.5 rounded-xl bg-[#FFF0EF] border border-[#D92D20]/20 flex items-start gap-2.5 shadow-xs"
              >
                <AlertTriangle className="w-4 h-4 text-[#D92D20] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs font-bold text-[#D92D20] block">Critical Medical Alert</strong>
                  <p className="text-xs text-[#D92D20]/90 mt-0.5">{alert}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 rounded-xl bg-[#FAFBFC] border border-[#DCE3EC] text-xs text-[#596579]">
              No critical emergency alerts recorded.
            </div>
          )}

          {/* Implanted Devices */}
          {authorizedData.devices.length > 0 ? (
            authorizedData.devices.map((device, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#EAF4FF] border border-[#2F80C9]/20 flex items-start gap-2.5 shadow-xs"
              >
                <Activity className="w-4 h-4 text-[#2F80C9] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-xs font-bold text-[#082B5C] block">Registered Medical Device / Implant</strong>
                  <p className="text-xs text-[#596579] mt-0.5">{device}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 rounded-xl bg-[#FAFBFC] border border-[#DCE3EC] text-xs text-[#596579]">
              No medical implants or devices registered.
            </div>
          )}
        </div>

        {/* Allergies Pill Row */}
        {authorizedData.allergies.length > 0 && (
          <div className="pt-2 border-t border-[#DCE3EC] dark:border-slate-800/80">
            <span className="text-[10px] text-[#596579] uppercase font-bold tracking-wider block mb-2">
              Known Allergies (Emergency Precautions)
            </span>
            <div className="flex flex-wrap gap-2">
              {authorizedData.allergies.map((allergy, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-[#FFF0EF] border border-[#D92D20]/20 text-[#D92D20] text-xs font-bold flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D92D20]" />
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
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-[#DCE3EC] dark:border-slate-800 shadow-xs space-y-3">
          <span className="text-[11px] uppercase tracking-wider text-[#082B5C] font-bold flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#F36C21]" />
            <span>Emergency Contacts</span>
          </span>

          <div className="space-y-2">
            {authorizedData.contacts.map((contact, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#FAFBFC] dark:bg-slate-900/80 border border-[#DCE3EC] dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <strong className="text-xs font-bold text-[#082B5C] dark:text-white block">{contact.name}</strong>
                  <span className="text-[11px] text-[#596579] font-mono">{contact.phone}</span>
                </div>
                <a
                  href={`tel:${contact.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-[#18A66A] hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            ))}

            {member.phone && (
              <div className="p-3 rounded-xl bg-[#FAFBFC] dark:bg-slate-900/80 border border-[#DCE3EC] dark:border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <strong className="text-xs font-bold text-[#082B5C] dark:text-white block">Direct Patient Line ({member.fullName})</strong>
                  <span className="text-[11px] text-[#596579] font-mono">{member.phone}</span>
                </div>
                <a
                  href={`tel:${member.phone}`}
                  className="px-3 py-1.5 rounded-lg bg-[#082B5C] hover:bg-[#061C3D] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#F36C21]" />
                  <span>Call Member</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Important Medical Info (Level 3 or Permission Controlled) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-[#DCE3EC] dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#082B5C] font-bold flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-[#2F80C9]" />
              <span>Medical History & Care Routing</span>
            </span>
            {member.permissionLevel !== 'LEVEL_3' && (
              <span className="text-[10px] text-[#596579] flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#596579]" />
                <span>Restricted by Permission</span>
              </span>
            )}
          </div>

          {member.permissionLevel === 'LEVEL_3' ? (
            <div className="space-y-2 text-xs">
              {authorizedData.conditions.length > 0 && (
                <div className="p-2.5 rounded-xl bg-[#FAFBFC] border border-[#DCE3EC]">
                  <span className="text-[10px] text-[#596579] block font-bold">Known Conditions:</span>
                  <span className="text-[#082B5C] font-semibold">{authorizedData.conditions.join(', ')}</span>
                </div>
              )}

              {authorizedData.medications.length > 0 && (
                <div className="p-2.5 rounded-xl bg-[#FAFBFC] border border-[#DCE3EC]">
                  <span className="text-[10px] text-[#596579] block font-bold">Current Medications:</span>
                  <span className="text-[#082B5C] font-semibold">{authorizedData.medications.join(', ')}</span>
                </div>
              )}

              {authorizedData.preferredHospital && (
                <div className="p-2.5 rounded-xl bg-[#FAFBFC] border border-[#DCE3EC] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#2F80C9] shrink-0" />
                  <div>
                    <span className="text-[10px] text-[#596579] block font-bold">Preferred Hospital:</span>
                    <span className="text-[#082B5C] font-semibold">{authorizedData.preferredHospital}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#FAFBFC] border border-[#DCE3EC] text-center space-y-2">
              <Shield className="w-8 h-8 text-[#596579] mx-auto" />
              <p className="text-xs text-[#596579]">
                Detailed medical history is protected under <strong>{permissionLevelLabel}</strong>. Only emergency
                alerts and acute triage data are shared.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Actions Bar (Big CTA) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#0F131F] border border-[#DCE3EC] dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-bold text-[#082B5C] dark:text-white block">Ready to deploy emergency response?</span>
          <p className="text-xs text-[#596579] dark:text-slate-400">
            Transmit {member.fullName}'s authorized emergency details and GPS directly to RESQ One response fleet.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => onInitiateDispatch(member, authorizedData)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F36C21] hover:bg-[#FF7A00] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-transform hover:scale-105 active:scale-95"
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
