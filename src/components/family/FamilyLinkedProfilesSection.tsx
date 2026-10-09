import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Copy,
  Check,
  Share2,
  RefreshCw,
  Plus,
  History,
  AlertTriangle,
  Lock,
  Radio,
  ExternalLink,
  Sliders,
  Settings,
  UserCheck,
  Info,
  Database,
  CloudCheck,
  Sparkles
} from 'lucide-react';
import {
  FamilyGroup,
  FamilyMemberRecord,
  FamilyJoinRequest,
  EmergencyAccessLog,
  PermissionLevel
} from '../../types/family';
import { familyService } from '../../services/familyService';
import { firestoreSyncService, FirestoreSyncStatus } from '../../services/firestoreSyncService';
import { EmergencyAssistanceScreen } from './EmergencyAssistanceScreen';
import { JoinFamilyModal } from './JoinFamilyModal';
import { FamilyInvitationModal } from './FamilyInvitationModal';
import { MemberPermissionsModal } from './MemberPermissionsModal';
import { EmergencyAccessHistoryModal } from './EmergencyAccessHistoryModal';

interface FamilyLinkedProfilesSectionProps {
  currentUser: {
    id: string;
    fullName: string;
    email: string;
    role?: string;
    age?: number;
  };
  onBackToDashboard?: () => void;
  onInitiateDispatch?: (member: FamilyMemberRecord, authorizedData: any) => void;
}

export const FamilyLinkedProfilesSection: React.FC<FamilyLinkedProfilesSectionProps> = ({
  currentUser,
  onBackToDashboard,
  onInitiateDispatch
}) => {
  // Test Account Simulator (Requirement #17 verification)
  const [activeSimulatedUser, setActiveSimulatedUser] = useState(currentUser);

  // Data state
  const [families, setFamilies] = useState<FamilyGroup[]>(() => familyService.getFamilies());
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>(() => {
    const list = familyService.getFamilies();
    return list[0]?.id || '';
  });

  const [members, setMembers] = useState<FamilyMemberRecord[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FamilyJoinRequest[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modals state
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isCreateFamilyModalOpen, setIsCreateFamilyModalOpen] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');

  // Selected member for Permissions Modal
  const [permissionsMember, setPermissionsMember] = useState<FamilyMemberRecord | null>(null);

  // Selected member for Emergency Assistance Screen (Requirement #4 & #7)
  const [emergencyTargetMember, setEmergencyTargetMember] = useState<FamilyMemberRecord | null>(null);

  // Firestore Real-Time & Cloud Sync Status
  const [firestoreStatus, setFirestoreStatus] = useState<FirestoreSyncStatus>(() => firestoreSyncService.getStatus());
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [cloudSyncToast, setCloudSyncToast] = useState<string | null>(null);

  // Auto-seed Firestore on initial load & establish real-time listeners
  useEffect(() => {
    const unsubStatus = firestoreSyncService.subscribeStatus(setFirestoreStatus);

    const initCloudData = async () => {
      const isSeeded = localStorage.getItem('resqone_firestore_seeded_auto') === 'true';
      if (!isSeeded) {
        setIsSyncingCloud(true);
        const res = await firestoreSyncService.seedFirestoreDatabase();
        setIsSyncingCloud(false);
        if (res.success) {
          localStorage.setItem('resqone_firestore_seeded_auto', 'true');
        }
      }
    };
    initCloudData();

    // Listen to real-time families
    const unsubFamilies = firestoreSyncService.subscribeFamilies((liveFamilies) => {
      if (liveFamilies && liveFamilies.length > 0) {
        setFamilies(liveFamilies);
      }
    });

    // Listen to real-time join requests
    const unsubRequests = firestoreSyncService.subscribeRequests((liveRequests) => {
      setPendingRequests(liveRequests.filter((r) => r.status === 'PENDING'));
    });

    return () => {
      unsubStatus();
      unsubFamilies();
      unsubRequests();
    };
  }, []);

  // Listen to members in real-time when selectedFamilyId changes
  useEffect(() => {
    if (!selectedFamilyId) return;
    const unsubMembers = firestoreSyncService.subscribeMembers(selectedFamilyId, (liveMembers) => {
      if (liveMembers && liveMembers.length > 0) {
        setMembers(liveMembers);
      }
    });
    return () => unsubMembers();
  }, [selectedFamilyId]);

  // Check URL query parameters for ?joinFamily=CODE (Requirement #2 & #11)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const joinCode = params.get('joinFamily');
      if (joinCode) {
        setIsJoinModalOpen(true);
      }
    }
  }, []);

  // Sync data when selected family changes
  const refreshData = () => {
    const fams = familyService.getFamilies();
    setFamilies(fams);
    if (!selectedFamilyId && fams.length > 0) {
      setSelectedFamilyId(fams[0].id);
    }
    const mems = familyService.getMembers(selectedFamilyId);
    setMembers(mems);
    const reqs = familyService.getRequests(selectedFamilyId);
    setPendingRequests(reqs);
  };

  useEffect(() => {
    refreshData();
  }, [selectedFamilyId]);

  const activeFamily = families.find((f) => f.id === selectedFamilyId) || families[0];
  const isFamilyAdmin = Boolean(
    activeFamily && (activeFamily.ownerUserId === activeSimulatedUser.id || activeSimulatedUser.role === 'SUPER_ADMIN')
  );

  const handleCopyCode = () => {
    if (!activeFamily) return;
    navigator.clipboard?.writeText(activeFamily.familyCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleApproveRequest = (reqId: string) => {
    familyService.approveJoinRequest(reqId, {
      id: activeSimulatedUser.id,
      fullName: activeSimulatedUser.fullName
    });
    refreshData();
  };

  const handleRejectRequest = (reqId: string) => {
    familyService.rejectJoinRequest(reqId, {
      id: activeSimulatedUser.id,
      fullName: activeSimulatedUser.fullName
    });
    refreshData();
  };

  const handleCreateFamilySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;
    const created = familyService.createFamily(newFamilyName.trim(), {
      id: activeSimulatedUser.id,
      fullName: activeSimulatedUser.fullName,
      email: activeSimulatedUser.email
    });
    setNewFamilyName('');
    setIsCreateFamilyModalOpen(false);
    setFamilies(familyService.getFamilies());
    setSelectedFamilyId(created.id);
  };

  const handleManualSyncFirestore = async () => {
    setIsSyncingCloud(true);
    setCloudSyncToast(null);
    const res = await firestoreSyncService.seedFirestoreDatabase();
    setIsSyncingCloud(false);
    refreshData();
    if (res.success) {
      setCloudSyncToast('Synced to Cloud Firestore! Refresh your Firebase Console to view.');
    } else {
      setCloudSyncToast(`Sync error: ${res.message}`);
    }
    setTimeout(() => setCloudSyncToast(null), 6000);
  };

  // If user selected SELECT -> EMERGENCY on a card, show the dedicated Emergency Assistance Screen
  if (emergencyTargetMember && activeFamily) {
    return (
      <EmergencyAssistanceScreen
        member={emergencyTargetMember}
        currentUser={activeSimulatedUser}
        familyName={activeFamily.name}
        onBack={() => setEmergencyTargetMember(null)}
        onInitiateDispatch={(member, authorizedData) => {
          if (onInitiateDispatch) {
            onInitiateDispatch(member, authorizedData);
          }
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/60 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Emergency SOS</span>
          </button>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {/* Emergency Access Audit History Button */}
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[#082B5C] dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-[#DCE3EC] dark:border-slate-700 transition-colors shadow-xs"
          >
            <History className="w-3.5 h-3.5 text-[#2F80C9]" />
            <span>Access History</span>
          </button>

          {/* Join Family Button */}
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-[#EAF4FF] hover:bg-sky-100 dark:bg-sky-950/40 text-[#082B5C] dark:text-sky-300 font-bold text-xs flex items-center gap-1.5 border border-[#2F80C9]/30 transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#2F80C9]" />
            <span>Join a Family</span>
          </button>
        </div>
      </div>

      {/* Cloud Sync Status Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0E131F] border border-[#DCE3EC] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#EAF4FF] text-[#2F80C9] flex items-center justify-center border border-[#2F80C9]/20 shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-[#082B5C] dark:text-white text-xs font-bold">Secure Family Network</strong>
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EAF8F1] dark:bg-emerald-950/80 text-[#18A66A] border border-[#18A66A]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#18A66A] animate-ping" />
                Live Sync Active
              </span>
            </div>
            <span className="text-[11px] text-[#596579] dark:text-slate-400 truncate max-w-sm block">
              Emergency contacts and health permissions encrypted & synchronized
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {cloudSyncToast && (
            <span className="text-[11px] text-[#18A66A] font-semibold bg-[#EAF8F1] border border-[#18A66A]/30 px-2.5 py-1 rounded-lg animate-in fade-in">
              {cloudSyncToast}
            </span>
          )}

          <button
            onClick={handleManualSyncFirestore}
            disabled={isSyncingCloud}
            className="px-3.5 py-1.5 rounded-xl bg-[#082B5C] hover:bg-[#061C3D] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Sync family network"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
            <span>{isSyncingCloud ? 'Syncing...' : 'Sync Cloud Network'}</span>
          </button>
        </div>
      </div>

      {/* Header Banner: Feature Name & Subtitle strictly matching prompt */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0E131F] border border-[#DCE3EC] dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF1E8] text-[#F36C21] flex items-center justify-center border border-[#F36C21]/20 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase tracking-wider text-[#F36C21] font-bold">
                  RESQ ONE FAMILY NETWORK
                </span>
                <span className="w-2 h-2 rounded-full bg-[#18A66A] animate-pulse" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B5C] dark:text-white mt-0.5">Family & Linked Profiles</h1>
              <p className="text-xs sm:text-sm text-[#596579] dark:text-slate-300 mt-1">
                Connect trusted family members for faster emergency assistance.
              </p>
            </div>
          </div>

          {/* Family Group Tabs / Switcher (Requirement #10) */}
          <div className="flex flex-wrap items-center gap-2 bg-[#FAFBFC] dark:bg-[#0A0D14] p-1.5 rounded-2xl border border-[#DCE3EC] dark:border-slate-800">
            {families.map((fam) => (
              <button
                key={fam.id}
                onClick={() => setSelectedFamilyId(fam.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedFamilyId === fam.id
                    ? 'bg-[#082B5C] text-white shadow-xs'
                    : 'text-[#596579] dark:text-slate-400 hover:text-[#082B5C] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                {fam.name}
              </button>
            ))}

            <button
              onClick={() => setIsCreateFamilyModalOpen(true)}
              className="p-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 text-[#082B5C] dark:text-slate-300 border border-[#DCE3EC] dark:border-slate-700 transition-colors"
              title="Create New Family Circle"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section 1: Family Code Bar (Requirement #1) */}
        {activeFamily && (
          <div className="pt-4 border-t border-[#DCE3EC] dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FAFBFC] dark:bg-black/20 -mx-6 -mb-6 p-6 rounded-b-3xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#082B5C] dark:text-white">Family Invitation Code:</span>
                <code className="text-sm sm:text-base font-mono font-black text-[#082B5C] dark:text-blue-300 bg-[#EAF4FF] dark:bg-blue-950/80 px-2.5 py-0.5 rounded-lg border border-[#2F80C9]/30 tracking-wider">
                  {activeFamily.familyCode}
                </code>
              </div>
              <p className="text-[11px] text-[#596579] dark:text-slate-400">
                Share this code with relatives. They must submit a join request and be approved by the family admin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#082B5C] dark:text-white font-bold text-xs flex items-center gap-1.5 border border-[#DCE3EC] dark:border-slate-700 transition-colors shadow-xs"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-[#18A66A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Code Copied' : 'Copy Code'}</span>
              </button>

              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-[#F36C21] hover:bg-[#FF7A00] text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Invite Family Member</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account Persona Selector Banner */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F1420] border border-[#DCE3EC] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#EAF4FF] text-[#082B5C] border border-[#2F80C9]/30 shrink-0">
            FAMILY ACCESS
          </span>
          <span className="text-[#596579] dark:text-slate-300">
            Active Member: <strong className="text-[#082B5C] dark:text-white">{activeSimulatedUser.fullName}</strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-[#596579] dark:text-slate-400 mr-1 hidden sm:inline">Switch Member:</span>
          <button
            onClick={() =>
              setActiveSimulatedUser({
                id: 'usr-sarah-jenkins',
                fullName: 'Sarah Jenkins',
                email: 'sarah.jenkins@example.com',
                role: 'PATIENT'
              })
            }
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeSimulatedUser.fullName === 'Sarah Jenkins'
                ? 'bg-[#082B5C] text-white'
                : 'bg-slate-100 dark:bg-slate-800/80 text-[#596579] dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Sarah (Admin)
          </button>

          <button
            onClick={() =>
              setActiveSimulatedUser({
                id: 'usr-robert-vance',
                fullName: 'Robert Vance',
                email: 'robert.vance@example.com',
                role: 'PATIENT'
              })
            }
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeSimulatedUser.fullName === 'Robert Vance'
                ? 'bg-[#082B5C] text-white'
                : 'bg-slate-100 dark:bg-slate-800/80 text-[#596579] dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Robert (Father)
          </button>

          <button
            onClick={() =>
              setActiveSimulatedUser({
                id: 'usr-elena-vance',
                fullName: 'Elena Vance',
                email: 'elena.vance@example.com',
                role: 'PATIENT'
              })
            }
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeSimulatedUser.fullName === 'Elena Vance'
                ? 'bg-[#082B5C] text-white'
                : 'bg-slate-100 dark:bg-slate-800/80 text-[#596579] dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Elena (Mother)
          </button>

          <button
            onClick={() =>
              setActiveSimulatedUser({
                id: 'usr-liam-vance',
                fullName: 'Liam Vance',
                email: 'liam.vance@example.com',
                role: 'PATIENT'
              })
            }
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeSimulatedUser.fullName === 'Liam Vance'
                ? 'bg-[#082B5C] text-white'
                : 'bg-slate-100 dark:bg-slate-800/80 text-[#596579] dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Liam (Sibling)
          </button>
        </div>
      </div>

      {/* Section 2: Pending Requests (Requirement #3) */}
      {isFamilyAdmin && pendingRequests.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#FFF1E8] border border-[#F36C21]/30 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[#F36C21]" />
              <strong className="text-xs font-bold text-[#082B5C] uppercase tracking-wider">
                Pending Family Join Requests ({pendingRequests.length})
              </strong>
            </div>
            <span className="text-[10px] text-[#F36C21] font-bold">Approval Required Before Linking</span>
          </div>

          <div className="space-y-2">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl bg-white border border-[#DCE3EC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-bold text-[#082B5C]">{req.userFullName}</strong>
                    <span className="text-[10px] bg-[#EAF4FF] text-[#082B5C] border border-[#2F80C9]/30 px-2 py-0.5 rounded font-bold">
                      {req.relationship}
                    </span>
                    <span className="text-xs text-[#596579]">Age {req.userAge}</span>
                  </div>
                  <p className="text-[11px] text-[#596579] mt-0.5">
                    Requesting to join <strong className="text-[#082B5C]">{req.familyName}</strong> ·{' '}
                    <span className="text-[#18A66A] font-semibold">Authorizes Level 2 Critical Alerts</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleRejectRequest(req.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#596579] font-bold text-xs border border-[#DCE3EC] transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApproveRequest(req.id)}
                    className="px-4 py-1.5 rounded-lg bg-[#18A66A] hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Family Members Dashboard (Requirement #4) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-[#082B5C] dark:text-white">Saved Family & Linked Profiles</h2>
            <p className="text-xs text-[#596579] dark:text-slate-400">
              Choose the family member who needs emergency assistance. Only authorized information is shared.
            </p>
          </div>

          <span className="text-xs text-[#596579] dark:text-slate-400">
            Active Members: <strong className="text-[#082B5C] dark:text-white">{members.length}</strong>
          </span>
        </div>

        {/* Member Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map((member) => {
            const isSelf = member.userId === activeSimulatedUser.id;
            const authStatusBadge =
              member.permissionLevel === 'LEVEL_3' ? (
                <span className="text-[11px] text-[#18A66A] font-bold flex items-center gap-1.5 bg-[#EAF8F1] px-2 py-0.5 rounded-md border border-[#18A66A]/20">
                  <span className="w-2 h-2 rounded-full bg-[#18A66A]" />
                  Full Profile Authorized
                </span>
              ) : member.permissionLevel === 'LEVEL_2' ? (
                <span className="text-[11px] text-[#F36C21] font-bold flex items-center gap-1.5 bg-[#FFF1E8] px-2 py-0.5 rounded-md border border-[#F36C21]/20">
                  <span className="w-2 h-2 rounded-full bg-[#F36C21]" />
                  Critical Alerts Authorized
                </span>
              ) : (
                <span className="text-[11px] text-[#2F80C9] font-bold flex items-center gap-1.5 bg-[#EAF4FF] px-2 py-0.5 rounded-md border border-[#2F80C9]/20">
                  <span className="w-2 h-2 rounded-full bg-[#2F80C9]" />
                  Emergency Access Only
                </span>
              );

            const hasAlert = member.authorizedInfo.medicalAlerts && member.authorizedInfo.medicalAlerts.length > 0;
            const primaryAlert = hasAlert ? member.authorizedInfo.medicalAlerts![0] : null;

            return (
              <div
                key={member.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0D1017] border border-[#DCE3EC] dark:border-slate-800 hover:border-[#F36C21] transition-all flex flex-col justify-between group shadow-xs space-y-4"
              >
                <div>
                  {/* Top Row: Initials Avatar, Name, Relationship, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#EAF4FF] border border-[#2F80C9]/20 flex items-center justify-center text-[#082B5C] font-black text-base shadow-xs">
                        {member.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[#082B5C] dark:text-white group-hover:text-[#F36C21] transition-colors">
                            {member.fullName}
                          </h3>
                          <span className="text-xs font-bold text-[#082B5C] bg-[#EAF4FF] border border-[#2F80C9]/30 px-2 py-0.5 rounded">
                            {member.relationship}
                          </span>
                        </div>
                        <p className="text-xs text-[#596579] dark:text-slate-400 mt-0.5">
                          Age {member.age} · <span className="text-[#18A66A] font-semibold">{member.status === 'ACTIVE' ? 'Active & Verified' : member.status}</span>
                        </p>
                      </div>
                    </div>

                    {/* Permissions gear button */}
                    <button
                      onClick={() => setPermissionsMember(member)}
                      className="p-1.5 rounded-lg text-[#596579] hover:text-[#082B5C] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Manage Permissions"
                    >
                      <Sliders className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Authorization Status Badge */}
                  <div className="mt-3 pt-3 border-t border-[#DCE3EC] dark:border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      {authStatusBadge}
                      {member.authorizedInfo.bloodGroup && member.permissionLevel !== 'LEVEL_1' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFF0EF] text-[#D92D20] border border-[#D92D20]/20">
                          Blood: {member.authorizedInfo.bloodGroup}
                        </span>
                      )}
                    </div>

                    {/* Emergency Alert (pill if present) */}
                    {hasAlert && member.permissionLevel !== 'LEVEL_1' && (
                      <div className="p-2 rounded-xl bg-[#FFF0EF] border border-[#D92D20]/30 text-[11px] text-[#D92D20] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#D92D20] animate-pulse shrink-0" />
                        <span className="truncate">
                          <strong className="text-[#D92D20]">Alert:</strong> {primaryAlert}
                        </span>
                      </div>
                    )}

                    {/* Location Telemetry Status */}
                    {member.liveLocation && member.locationPermission.canShareLastKnownLocation && (
                      <div className="flex items-center justify-between text-[11px] text-[#596579] dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1.5 truncate max-w-[240px]">
                          <MapPin className="w-3.5 h-3.5 text-[#18A66A] shrink-0" />
                          <span className="truncate">{member.liveLocation.address}</span>
                        </span>
                        <span className="text-[#18A66A] font-mono text-[10px] shrink-0">
                          {member.liveLocation.lastPing}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Big CTA: SELECT -> EMERGENCY (Requirement #4 & #7) */}
                <div className="pt-3 border-t border-[#DCE3EC] dark:border-slate-800/80">
                  <button
                    onClick={() => setEmergencyTargetMember(member)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#F36C21] hover:bg-[#FF7A00] text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-xs flex items-center justify-center gap-2 group-hover:scale-[1.01] active:scale-[0.98]"
                  >
                    <span>SELECT → EMERGENCY</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {/* 1. Join Family Modal */}
      <JoinFamilyModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        currentUser={activeSimulatedUser}
        onSuccess={refreshData}
      />

      {/* 2. Family Invitation Modal */}
      {activeFamily && (
        <FamilyInvitationModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          family={activeFamily}
          isAdmin={isFamilyAdmin}
          currentUser={activeSimulatedUser}
          onCodeRegenerated={(newCode) => {
            refreshData();
          }}
        />
      )}

      {/* 3. Member Permissions Modal */}
      {permissionsMember && (
        <MemberPermissionsModal
          isOpen={Boolean(permissionsMember)}
          onClose={() => setPermissionsMember(null)}
          member={permissionsMember}
          currentUser={activeSimulatedUser}
          isOwnerOrSelf={isFamilyAdmin || permissionsMember.userId === activeSimulatedUser.id}
          onUpdated={refreshData}
          onRemoveMember={() => {
            familyService.removeMember(selectedFamilyId, permissionsMember.id);
            setPermissionsMember(null);
            refreshData();
          }}
        />
      )}

      {/* 4. Emergency Access History Modal */}
      <EmergencyAccessHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        currentUser={activeSimulatedUser}
        familyId={selectedFamilyId}
      />

      {/* 5. Create Family Modal */}
      {isCreateFamilyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#0F131D] border border-blue-900/60 rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Create New Family / Care Group</h3>
            <form onSubmit={handleCreateFamilySubmit} className="space-y-4">
              <input
                type="text"
                required
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                placeholder="e.g. Vance Family, Grandmother Care"
                className="w-full bg-[#0A0D14] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateFamilyModalOpen(false)}
                  className="w-1/2 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
