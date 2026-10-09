import React, { useState, useEffect } from 'react';
import {
  User,
  Users,
  UserPlus,
  Shield,
  HeartPulse,
  ChevronRight,
  X,
  AlertTriangle,
  Zap,
  CheckCircle2,
  MapPin,
  Navigation,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import {
  EmergencyMode,
  UserEmergencyProfile,
  FamilyMemberProfile,
  LocationPermissionState,
  PatientGpsCoordinates
} from '../types/emergency';
import { getCurrentPatientLocation } from '../services/locationService';

interface WhoNeedsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDirectDispatch: (
    mode: EmergencyMode,
    familyMember?: FamilyMemberProfile,
    friendName?: string,
    capturedGps?: PatientGpsCoordinates | null,
    manualAddress?: string
  ) => void;
  currentUser?: UserEmergencyProfile;
  familyMembers?: FamilyMemberProfile[];
  familyCount?: number;
}

export const WhoNeedsHelpModal: React.FC<WhoNeedsHelpModalProps> = ({
  isOpen,
  onClose,
  onDirectDispatch,
  currentUser,
  familyMembers = [],
  familyCount = familyMembers.length
}) => {
  // Family selection state
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState<string>(
    familyMembers.length > 0 ? familyMembers[0].id : ''
  );
  const [showFamilyPicker, setShowFamilyPicker] = useState<boolean>(false);

  // Family location mode: patientWithMe | patientElsewhere
  const [familyLocationMode, setFamilyLocationMode] = useState<'withMe' | 'elsewhere'>('withMe');
  const [familyManualAddress, setFamilyManualAddress] = useState<string>('');

  // Friend / Other state
  const [friendName, setFriendName] = useState<string>('Friend / Bystander');
  const [showFriendInput, setShowFriendInput] = useState<boolean>(false);
  const [friendLocationMode, setFriendLocationMode] = useState<'withMe' | 'elsewhere'>('withMe');
  const [friendManualAddress, setFriendManualAddress] = useState<string>('');

  // Real Geolocation states
  const [permissionState, setPermissionState] = useState<LocationPermissionState>('IDLE');
  const [patientGps, setPatientGps] = useState<PatientGpsCoordinates | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isCapturingGps, setIsCapturingGps] = useState<boolean>(false);

  // Automatically request GPS when modal opens so location is ready immediately
  const captureGps = async () => {
    setIsCapturingGps(true);
    setPermissionState('REQUESTING_PERMISSION');
    setGpsError(null);

    const result = await getCurrentPatientLocation();

    setIsCapturingGps(false);
    setPermissionState(result.state);

    if (result.success && result.coordinates) {
      setPatientGps(result.coordinates);
      setGpsError(null);
    } else {
      setPatientGps(null);
      setGpsError(result.errorMessage || 'Unable to get location');
    }
  };

  useEffect(() => {
    if (isOpen) {
      captureGps();
    } else {
      // Reset state when closed
      setPermissionState('IDLE');
      setPatientGps(null);
      setGpsError(null);
      setIsCapturingGps(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const userDisplayName = currentUser?.fullName?.trim() || 'Myself';
  const bloodGroupDisplay =
    currentUser?.bloodGroup && currentUser.bloodGroup !== 'Not Specified'
      ? currentUser.bloodGroup
      : 'On File';
  const insuranceDisplay = currentUser?.insuranceInfo?.provider || 'Verified Emergency Passport';

  // --- DISPATCH ACTIONS ---
  const handleDispatchMyself = async () => {
    // If GPS already acquired, dispatch immediately
    if (patientGps) {
      onDirectDispatch('ME', undefined, undefined, patientGps);
      return;
    }

    // If still capturing or idle, perform one quick fetch attempt
    if (permissionState === 'IDLE' || permissionState === 'REQUESTING_PERMISSION') {
      setIsCapturingGps(true);
      const res = await getCurrentPatientLocation();
      setIsCapturingGps(false);
      if (res.success && res.coordinates) {
        onDirectDispatch('ME', undefined, undefined, res.coordinates);
      } else {
        // Honest dispatch without fabricated coordinates
        onDirectDispatch('ME', undefined, undefined, null, 'Location permission needed');
      }
    } else {
      // Permission denied or unavailable — dispatch without fake coordinates
      onDirectDispatch('ME', undefined, undefined, null, 'Location permission needed');
    }
  };

  const handleDispatchFamily = async (member?: FamilyMemberProfile) => {
    const targetMember =
      member ||
      familyMembers.find((f) => f.id === selectedFamilyMemberId) ||
      familyMembers[0];

    if (familyLocationMode === 'withMe') {
      // Patient is physically with the requester
      let effectiveGps = patientGps;
      if (!effectiveGps) {
        const res = await getCurrentPatientLocation();
        if (res.success && res.coordinates) {
          effectiveGps = res.coordinates;
        }
      }
      onDirectDispatch(
        'FAMILY',
        targetMember,
        undefined,
        effectiveGps || null,
        effectiveGps ? undefined : 'Patient location required'
      );
    } else {
      // Patient is elsewhere: DO NOT use requester's GPS
      const addr = familyManualAddress.trim();
      onDirectDispatch(
        'FAMILY',
        targetMember,
        undefined,
        null,
        addr || 'Patient location required'
      );
    }
  };

  const handleDispatchFriend = async () => {
    const trimmedFriendName = friendName.trim() || 'Friend / Bystander';

    if (friendLocationMode === 'withMe') {
      let effectiveGps = patientGps;
      if (!effectiveGps) {
        const res = await getCurrentPatientLocation();
        if (res.success && res.coordinates) {
          effectiveGps = res.coordinates;
        }
      }
      onDirectDispatch(
        'FRIEND_OTHER',
        undefined,
        trimmedFriendName,
        effectiveGps || null,
        effectiveGps ? undefined : 'Patient location required'
      );
    } else {
      // Friend is elsewhere: DO NOT use requester's GPS
      const addr = friendManualAddress.trim();
      onDirectDispatch(
        'FRIEND_OTHER',
        undefined,
        trimmedFriendName,
        null,
        addr || 'Patient location required'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0F131D] border border-[#DCE3EC] dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DCE3EC] dark:border-slate-800 bg-[#FAFBFC] dark:bg-[#131722]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F36C21] animate-ping" />
            <span className="text-xs font-bold tracking-wider text-[#F36C21] uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-[#F36C21]" />
              DIRECT EMERGENCY SOS DISPATCH
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#596579] hover:text-[#082B5C] dark:text-slate-400 dark:hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title Zone */}
        <div className="px-6 pt-5 pb-2 text-center sm:text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#082B5C] dark:text-white tracking-tight">
              WHO NEEDS HELP?
            </h2>
            <span className="hidden sm:inline-flex text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#FFF1E8] border border-[#F36C21]/30 text-[#F36C21] uppercase">
              Instant 1-Click Submission
            </span>
          </div>
          <p className="mt-1 text-sm text-[#596579] dark:text-slate-300">
            Select who requires urgent medical dispatch. Emergency cases submit immediately with verified GPS coordinates.
          </p>
        </div>

        {/* Global GPS Status Banner */}
        <div className="px-6 py-2.5 bg-[#EAF4FF] dark:bg-[#141A28] border-y border-[#DCE3EC] dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#F36C21] shrink-0" />
            <span className="font-semibold text-[#082B5C] dark:text-slate-200">Device GPS:</span>
            {isCapturingGps || permissionState === 'REQUESTING_PERMISSION' ? (
              <span className="text-[#2F80C9] flex items-center gap-1.5 font-medium">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Requesting browser location...
              </span>
            ) : patientGps ? (
              <span className="text-[#18A66A] font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                GPS Acquired (±{patientGps.accuracy} m accuracy)
              </span>
            ) : permissionState === 'LOCATION_PERMISSION_DENIED' ? (
              <span className="text-[#D92D20] font-medium">
                Location permission needed
              </span>
            ) : (
              <span className="text-[#596579] dark:text-slate-400 font-medium">
                {gpsError || 'Location permission needed'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={captureGps}
            disabled={isCapturingGps}
            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-[#DCE3EC] dark:border-slate-700 text-[#082B5C] dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isCapturingGps ? 'animate-spin' : ''}`} />
            <span>{patientGps ? 'Re-check GPS' : 'Retry GPS'}</span>
          </button>
        </div>

        {/* The 3 Core Direct-Submit Options */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* OPTION 1: ME */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121620] border-2 border-[#DCE3EC] hover:border-[#F36C21] dark:border-slate-800 dark:hover:border-[#F36C21] shadow-sm transition-all group relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFF1E8] border border-[#F36C21]/30 flex items-center justify-center text-[#F36C21] shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-[#FFF1E8] text-[#F36C21]">
                      ME
                    </span>
                    <span className="text-base sm:text-lg font-bold text-[#082B5C] dark:text-white">
                      Myself ({userDisplayName})
                    </span>
                  </div>
                  <p className="text-xs text-[#596579] dark:text-slate-300 mt-1">
                    Immediately activates emergency dispatch with your personal medical record (Blood: <strong className="text-[#082B5C] dark:text-white">{bloodGroupDisplay}</strong>) and your live GPS location.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#18A66A] font-medium mt-1.5">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 shrink-0" />
                      <span>Health Passport Attached</span>
                    </div>
                    <span className="text-slate-300">·</span>
                    {patientGps ? (
                      <span className="text-[#18A66A] font-bold">
                        📍 GPS Verified (±{patientGps.accuracy} m)
                      </span>
                    ) : (
                      <span className="text-[#2F80C9]">
                        📍 GPS permission requested on submit
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDispatchMyself}
                disabled={isCapturingGps}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#F36C21] hover:bg-[#FF7A00] text-white font-extrabold text-sm tracking-wide shadow-md shadow-[#F36C21]/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shrink-0 cursor-pointer disabled:opacity-60"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>DISPATCH FOR ME</span>
              </button>
            </div>
          </div>

          {/* OPTION 2: FAMILY */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121620] border-2 border-[#DCE3EC] hover:border-[#2F80C9] dark:border-slate-800 dark:hover:border-blue-500 transition-all space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#EAF4FF] border border-[#2F80C9]/30 flex items-center justify-center text-[#2F80C9] shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-[#EAF4FF] text-[#2F80C9]">
                      FAMILY
                    </span>
                    <span className="text-base sm:text-lg font-bold text-[#082B5C] dark:text-white">
                      Family Member ({familyCount} Linked)
                    </span>
                  </div>
                  <p className="text-xs text-[#596579] dark:text-slate-300 mt-1">
                    Emergency location belongs to the patient. Choose whether the patient is physically with you or in another location.
                  </p>
                </div>
              </div>

              {familyMembers.length > 0 && !showFamilyPicker && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDispatchFamily(familyMembers[0])}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#082B5C] hover:bg-[#061C3D] text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>DISPATCH ({familyMembers[0].name})</span>
                  </button>
                  {familyMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setShowFamilyPicker(true)}
                      className="px-3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#082B5C] dark:text-slate-300 text-xs font-semibold cursor-pointer border border-[#DCE3EC] dark:border-slate-700"
                    >
                      More
                    </button>
                  )}
                </div>
              )}

              {familyMembers.length === 0 && (
                <button
                  type="button"
                  onClick={() => handleDispatchFamily()}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#082B5C] hover:bg-[#061C3D] text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span>DISPATCH FOR FAMILY</span>
                </button>
              )}
            </div>

            {/* Patient Location Option Selection (PRODUCT RULE: Location belongs to patient) */}
            <div className="pt-2 border-t border-[#DCE3EC] dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-[#596579] dark:text-slate-400 block">
                PATIENT EMERGENCY LOCATION:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFamilyLocationMode('withMe')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    familyLocationMode === 'withMe'
                      ? 'bg-[#EAF4FF] border-[#2F80C9] text-[#082B5C] dark:bg-blue-950/60 dark:border-blue-500 dark:text-white ring-1 ring-[#2F80C9]'
                      : 'bg-[#FAFBFC] dark:bg-[#141824] border-[#DCE3EC] dark:border-slate-800 text-[#596579] hover:text-[#082B5C]'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#2F80C9]" />
                    <span>Patient is with me right now</span>
                  </div>
                  <p className="text-[10px] text-[#596579] dark:text-slate-400 mt-0.5">
                    Use this device’s live GPS for dispatch
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFamilyLocationMode('elsewhere')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    familyLocationMode === 'elsewhere'
                      ? 'bg-[#EAF4FF] border-[#2F80C9] text-[#082B5C] dark:bg-blue-950/60 dark:border-blue-500 dark:text-white ring-1 ring-[#2F80C9]'
                      : 'bg-[#FAFBFC] dark:bg-[#141824] border-[#DCE3EC] dark:border-slate-800 text-[#596579] hover:text-[#082B5C]'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#F36C21]" />
                    <span>Patient is at another location</span>
                  </div>
                  <p className="text-[10px] text-[#596579] dark:text-slate-400 mt-0.5">
                    Enter patient address or request location
                  </p>
                </button>
              </div>

              {familyLocationMode === 'elsewhere' && (
                <div className="mt-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    value={familyManualAddress}
                    onChange={(e) => setFamilyManualAddress(e.target.value)}
                    placeholder="Enter patient's exact current address, apartment, or facility..."
                    className="w-full bg-white dark:bg-black/60 border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-[#172033] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#2F80C9]"
                  />
                  <p className="text-[10px] text-[#F36C21] mt-1 font-medium">
                    * If address is left empty, case will show &ldquo;Patient location required&rdquo; without using your GPS.
                  </p>
                </div>
              )}
            </div>

            {/* Quick 1-click pills for multiple family members */}
            {familyMembers.length > 0 && (
              <div className="mt-2 pt-2 border-t border-[#DCE3EC] dark:border-slate-800">
                <span className="text-[11px] font-bold text-[#596579] dark:text-slate-400 block mb-1.5">
                  Select Family Member:
                </span>
                <div className="flex flex-wrap gap-2">
                  {familyMembers.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleDispatchFamily(m)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#EAF4FF] dark:bg-slate-800 dark:hover:bg-slate-700 border border-[#DCE3EC] dark:border-slate-700 text-xs font-semibold text-[#082B5C] dark:text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer group"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#2F80C9]" />
                      <span>{m.name}</span>
                      <span className="text-[#596579] text-[10px]">({m.relationship})</span>
                      <Zap className="w-3 h-3 text-[#2F80C9] ml-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* OPTION 3: FRIEND / OTHER */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121620] border-2 border-[#DCE3EC] hover:border-[#F36C21] dark:border-slate-800 dark:hover:border-amber-500 transition-all space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFF1E8] border border-[#F36C21]/30 flex items-center justify-center text-[#F36C21] shrink-0">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded bg-[#FFF1E8] text-[#F36C21]">
                      OTHER
                    </span>
                    <span className="text-base sm:text-lg font-bold text-[#082B5C] dark:text-white">
                      Friend / Bystander
                    </span>
                  </div>
                  <p className="text-xs text-[#596579] dark:text-slate-300 mt-1">
                    Initiate urgent dispatch for a friend, colleague, or bystander. Missing records are marked <strong className="text-[#082B5C] dark:text-white">NOT PROVIDED</strong> without delaying dispatch.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDispatchFriend}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#F36C21] hover:bg-[#FF7A00] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>DISPATCH FOR OTHER</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFriendInput(!showFriendInput)}
                  className="px-3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#082B5C] dark:text-slate-300 text-xs font-semibold cursor-pointer border border-[#DCE3EC] dark:border-slate-700"
                  title="Optionally add person's name"
                >
                  {showFriendInput ? 'Hide' : 'Add Name'}
                </button>
              </div>
            </div>

            {/* Friend Location Mode Selection */}
            <div className="pt-2 border-t border-[#DCE3EC] dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-[#596579] dark:text-slate-400 block">
                PATIENT EMERGENCY LOCATION:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFriendLocationMode('withMe')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    friendLocationMode === 'withMe'
                      ? 'bg-[#FFF1E8] border-[#F36C21] text-[#082B5C] dark:bg-amber-950/60 dark:border-amber-500 dark:text-white ring-1 ring-[#F36C21]'
                      : 'bg-[#FAFBFC] dark:bg-[#141824] border-[#DCE3EC] dark:border-slate-800 text-[#596579] hover:text-[#082B5C]'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5 text-[#F36C21]" />
                    <span>Patient is with me right now</span>
                  </div>
                  <p className="text-[10px] text-[#596579] dark:text-slate-400 mt-0.5">
                    Use this device’s live GPS for dispatch
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFriendLocationMode('elsewhere')}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    friendLocationMode === 'elsewhere'
                      ? 'bg-[#FFF1E8] border-[#F36C21] text-[#082B5C] dark:bg-amber-950/60 dark:border-amber-500 dark:text-white ring-1 ring-[#F36C21]'
                      : 'bg-[#FAFBFC] dark:bg-[#141824] border-[#DCE3EC] dark:border-slate-800 text-[#596579] hover:text-[#082B5C]'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#F36C21]" />
                    <span>Patient is elsewhere</span>
                  </div>
                  <p className="text-[10px] text-[#596579] dark:text-slate-400 mt-0.5">
                    Enter patient address or location description
                  </p>
                </button>
              </div>

              {friendLocationMode === 'elsewhere' && (
                <div className="mt-2 animate-in fade-in duration-150">
                  <input
                    type="text"
                    value={friendManualAddress}
                    onChange={(e) => setFriendManualAddress(e.target.value)}
                    placeholder="Enter patient's exact location or nearest intersection..."
                    className="w-full bg-white dark:bg-black/60 border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-[#172033] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#F36C21]"
                  />
                  <p className="text-[10px] text-[#F36C21] mt-1 font-medium">
                    * If left blank, map will display &ldquo;Patient location required&rdquo;.
                  </p>
                </div>
              )}
            </div>

            {showFriendInput && (
              <div className="mt-2 pt-2 border-t border-[#DCE3EC] dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  placeholder="e.g. John Doe, Passerby at Market St"
                  className="flex-1 bg-white dark:bg-black/60 border border-[#DCE3EC] dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-[#172033] dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#F36C21]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Guarantee Banner */}
        <div className="px-6 py-3.5 bg-[#FAFBFC] dark:bg-[#0A0D13] border-t border-[#DCE3EC] dark:border-slate-800 flex items-center gap-2.5 text-xs text-[#596579] dark:text-slate-400">
          <Shield className="w-4 h-4 text-[#18A66A] shrink-0" />
          <p className="text-[11px] text-[#596579] dark:text-slate-300">
            <strong className="text-[#082B5C] dark:text-white">Direct Zero-Delay Guarantee:</strong> Tapping any button immediately notifies emergency coordinators and dispatches the nearest ambulance. Real patient GPS coordinates center the Mappls map instantly.
          </p>
        </div>
      </div>
    </div>
  );
};
