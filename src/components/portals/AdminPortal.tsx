import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Radio,
  Activity,
  Ambulance,
  Stethoscope,
  Building2,
  Users,
  Search,
  Filter,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  FileCheck,
  RotateCcw,
  BarChart3,
  ListFilter,
  Lock,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Database,
  ExternalLink,
  Award,
  Check
} from 'lucide-react';
import { EmergencyCase } from '../../types/emergency';
import {
  DoctorRecord,
  AmbulanceRecord,
  HospitalRecord,
  AuditLogEntry,
  AppUserSession,
  EmergencyStatus,
  DoctorOnboardingRequest
} from '../../types/roles';
import { emergencyService } from '../../services/emergencyService';
import { supabaseDataService } from '../../services/supabaseDataService';
import { ambulanceService } from '../../services/ambulanceService';
import { AmbulanceApplicationRecord, AmbulanceVerificationStatus } from '../../types/ambulance';
import { SupabaseInspectorModal } from '../SupabaseInspectorModal';
import { CaseChatDrawer } from './CaseChatDrawer';

interface AdminPortalProps {
  currentSession: AppUserSession;
  onBackToApp: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ currentSession, onBackToApp }) => {
  const [activeCases, setActiveCases] = useState<EmergencyCase[]>([]);
  const [ambulances, setAmbulances] = useState<AmbulanceRecord[]>([]);
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [hospitals, setHospitals] = useState<HospitalRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [onboardingRequests, setOnboardingRequests] = useState<DoctorOnboardingRequest[]>([]);
  const [ambulanceApps, setAmbulanceApps] = useState<AmbulanceApplicationRecord[]>([]);
  const [selectedAmbApp, setSelectedAmbApp] = useState<AmbulanceApplicationRecord | null>(null);
  const [ambFilterStatus, setAmbFilterStatus] = useState<string>('ALL');
  const [ambReasonModal, setAmbReasonModal] = useState<{
    isOpen: boolean;
    appId: string;
    action: 'REJECT' | 'REQUEST_MORE_INFO';
    title: string;
  }>({ isOpen: false, appId: '', action: 'REJECT', title: '' });
  const [ambReasonText, setAmbReasonText] = useState('');
  const [isSupabaseInspectorOpen, setIsSupabaseInspectorOpen] = useState(false);

  // Active Admin View Tab: 'COMMAND_CENTER' | 'INCIDENTS' | 'FLEET' | 'DOCTORS' | 'HOSPITALS' | 'USERS' | 'AUDIT_LOGS' | 'ANALYTICS' | 'AMBULANCE_APPLICATIONS'
  const [activeTab, setActiveTab] = useState<
    'COMMAND_CENTER' | 'INCIDENTS' | 'FLEET' | 'DOCTORS' | 'HOSPITALS' | 'USERS' | 'AUDIT_LOGS' | 'ANALYTICS' | 'AMBULANCE_APPLICATIONS'
  >('COMMAND_CENTER');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [isCommsOpen, setIsCommsOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Doctor Creation Modal state (Section 7: Doctor Creation by Admin)
  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docPhone, setDocPhone] = useState('');
  const [docLicense, setDocLicense] = useState('');
  const [docSpecialty, setDocSpecialty] = useState('Attending Emergency Physician');
  const [docExperience, setDocExperience] = useState(10);
  const [docHospital, setDocHospital] = useState('Metro Health Emergency Network');

  const handleApproveDoctorOnboarding = async (req: DoctorOnboardingRequest) => {
    await supabaseDataService.updateDoctorOnboardingStatus(req.id, 'APPROVED', currentSession.fullName);

    emergencyService.addDoctor({
      name: req.fullName,
      registrationNumber: req.registrationNumber,
      specialization: req.specialization,
      experienceYears: req.experienceYears,
      hospitalAffiliation: req.hospitalAffiliation,
      phone: req.phone || '+1 (555) 019-9000',
      verificationStatus: 'APPROVED',
      availability: 'AVAILABLE'
    });

    emergencyService.addAuditLog(
      { id: currentSession.id, name: currentSession.fullName, role: currentSession.role },
      'DOCTOR_ONBOARDING_APPROVED',
      'DOCTOR',
      req.registrationNumber,
      undefined,
      { doctorName: req.fullName, license: req.registrationNumber, approvedBy: currentSession.fullName }
    );

    loadData();
  };

  const handleRejectDoctorOnboarding = async (reqId: string) => {
    await supabaseDataService.updateDoctorOnboardingStatus(reqId, 'REJECTED', currentSession.fullName);
    loadData();
  };

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName || !docLicense) return;

    emergencyService.addDoctor({
      name: docName,
      registrationNumber: docLicense,
      specialization: docSpecialty,
      experienceYears: docExperience,
      hospitalAffiliation: docHospital,
      phone: docPhone || '+1 (555) 019-9000',
      verificationStatus: 'APPROVED',
      availability: 'AVAILABLE'
    });

    emergencyService.addAuditLog(
      { id: currentSession.id, name: currentSession.fullName, role: currentSession.role },
      'DOCTOR_INVITED_AND_APPROVED',
      'DOCTOR',
      docLicense,
      undefined,
      { docName, docEmail, docLicense, specialization: docSpecialty }
    );

    setIsAddDoctorModalOpen(false);
    setDocName('');
    setDocEmail('');
    setDocPhone('');
    setDocLicense('');
    loadData();
  };

  const handleToggleDoctorApproval = (docId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'VERIFIED' || currentStatus === 'APPROVED' ? 'SUSPENDED' : 'APPROVED';
    emergencyService.updateDoctorStatus(docId, nextStatus as any);
    emergencyService.addAuditLog(
      { id: currentSession.id, name: currentSession.fullName, role: currentSession.role },
      nextStatus === 'APPROVED' ? 'DOCTOR_APPROVED' : 'DOCTOR_SUSPENDED',
      'DOCTOR',
      docId
    );
    loadData();
  };

  const handleReviewAmbulanceAction = async (
    appId: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_MORE_INFO' | 'SUSPEND',
    notes?: string
  ) => {
    await ambulanceService.reviewApplication(appId, action, currentSession.fullName, notes);
    setAmbulanceApps(ambulanceService.getApplications());
    if (selectedAmbApp && selectedAmbApp.id === appId) {
      setSelectedAmbApp(ambulanceService.getApplicationById(appId) || null);
    }
    loadData();
  };

  const loadData = async () => {
    setActiveCases(emergencyService.getAllCases());
    setAmbulances(emergencyService.getAmbulances());
    setDoctors(emergencyService.getDoctors());
    setHospitals(emergencyService.getHospitals());
    setAuditLogs(emergencyService.getAuditLogs());
    setAmbulanceApps(ambulanceService.getApplications());
    try {
      const requests = await supabaseDataService.getDoctorOnboardingRequests();
      setOnboardingRequests(requests);
    } catch {}
    if (!selectedCaseId) {
      const cases = emergencyService.getAllCases();
      if (cases.length > 0) setSelectedCaseId(cases[0].id);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribeEmerg = emergencyService.subscribe(() => {
      loadData();
    });
    const unsubscribeAmb = ambulanceService.subscribe(() => {
      setAmbulanceApps(ambulanceService.getApplications());
    });
    return () => {
      unsubscribeEmerg();
      unsubscribeAmb();
    };
  }, []);

  const isAuthorizedAdmin =
    Boolean(currentSession.id && currentSession.email) &&
    (currentSession.role === 'SUPER_ADMIN' || currentSession.role === 'RESQ_ADMIN');

  if (!isAuthorizedAdmin) {
    return (
      <div className="p-8 max-w-xl mx-auto rounded-2xl bg-[#0E121B] border border-red-900/60 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-600/20 text-[#FF2B44] border border-red-500/30 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">Access Denied: Super Admin Authority Required</h2>
        <p className="text-xs text-slate-400">
          Your current active role is <strong className="text-white">{currentSession.role}</strong>. Only verified
          RESQ_ADMIN or SUPER_ADMIN commanders can access the Global Emergency Incident Center.
        </p>
        <button
          onClick={onBackToApp}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
        >
          Return to Patient App or Switch Role
        </button>
      </div>
    );
  }

  const selectedCase = activeCases.find((c) => c.id === selectedCaseId) || activeCases[0] || null;

  // Filtered Cases
  const filteredCases = activeCases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.emergency.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity === 'ALL' || c.emergency.severity.includes(filterSeverity);
    return matchesSearch && matchesSeverity;
  });

  const handleCloseCase = () => {
    if (!selectedCase) return;
    emergencyService.closeCase(selectedCase.id, cancelReason || 'Resolved by Super Admin', {
      id: currentSession.id,
      name: currentSession.fullName,
      role: currentSession.role
    });
    setCancelModalOpen(false);
    setCancelReason('');
  };

  const handleReassignAmbulance = (ambId: string) => {
    if (!selectedCase) return;
    emergencyService.assignAmbulance(selectedCase.id, ambId, {
      id: currentSession.id,
      name: currentSession.fullName,
      role: currentSession.role
    });
  };

  const handleReassignDoctor = (docId: string) => {
    if (!selectedCase) return;
    emergencyService.assignDoctor(selectedCase.id, docId, {
      id: currentSession.id,
      name: currentSession.fullName,
      role: currentSession.role
    });
  };

  const handleAdvanceStatus = (nextStatus: EmergencyStatus) => {
    if (!selectedCase) return;
    emergencyService.updateCaseStatus(selectedCase.id, nextStatus, {
      id: currentSession.id,
      name: currentSession.fullName,
      role: currentSession.role
    });
  };

  return (
    <div className="space-y-6">
      {/* Super Admin Command Top Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0E121B] border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  RESQ ONE Super Admin Command Center
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                  LEVEL 1 GLOBAL CAD OVERWATCH
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Commander: {currentSession.fullName} · Role: {currentSession.role} · Database: PostgreSQL / Supabase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSupabaseInspectorOpen(true)}
              className="text-xs text-emerald-300 font-bold hover:text-white px-3.5 py-2 rounded-xl bg-emerald-950/90 border border-emerald-700/80 hover:bg-emerald-900 transition-colors flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Inspect Supabase Database</span>
            </button>
            <button
              onClick={onBackToApp}
              className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Switch Portal
            </button>
          </div>
        </div>

        {/* Command Center Primary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-center">
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Active Cases</div>
            <div className="text-xl font-mono font-bold text-red-400 mt-0.5">{activeCases.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Cases Today</div>
            <div className="text-xl font-mono font-bold text-white mt-0.5">24</div>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Ambulances</div>
            <div className="text-xl font-mono font-bold text-amber-400 mt-0.5">{ambulances.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Doctors Active</div>
            <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">{doctors.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Hospitals Online</div>
            <div className="text-xl font-mono font-bold text-purple-400 mt-0.5">{hospitals.length}</div>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Avg Response</div>
            <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">4.2 min</div>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Completed</div>
            <div className="text-xl font-mono font-bold text-slate-300 mt-0.5">18</div>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Audit Events</div>
            <div className="text-xl font-mono font-bold text-blue-400 mt-0.5">{auditLogs.length}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold pt-1 border-t border-slate-800/80">
          {[
            { id: 'COMMAND_CENTER', label: 'Command Center' },
            {
              id: 'AMBULANCE_APPLICATIONS',
              label: `Ambulance Applications (${ambulanceApps.filter((a) => a.verificationStatus === 'PENDING' || a.verificationStatus === 'UNDER_REVIEW').length})`
            },
            { id: 'INCIDENTS', label: 'Incident Registry' },
            { id: 'FLEET', label: 'Fleet & Dispatch' },
            { id: 'DOCTORS', label: 'Physicians On-Call' },
            { id: 'HOSPITALS', label: 'Hospital Bays' },
            { id: 'AUDIT_LOGS', label: 'Audit Logs (Immutable)' },
            { id: 'ANALYTICS', label: 'CAD Analytics' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.id === 'AMBULANCE_APPLICATIONS' &&
                ambulanceApps.filter((a) => a.verificationStatus === 'PENDING').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: COMMAND CENTER (Split Overview + Drill-down) */}
      {activeTab === 'COMMAND_CENTER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Emergencies Feed (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0E121B] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-red-400" />
                  <span>Realtime Incident Stream</span>
                </h2>
                <span className="text-[10px] font-mono text-slate-400">{filteredCases.length} Emergencies</span>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by ID, Patient, Emergency..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/50 border border-slate-700 text-xs text-white placeholder-slate-500"
                  />
                </div>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl bg-black/50 border border-slate-700 text-xs text-white"
                >
                  <option value="ALL">All Priority</option>
                  <option value="Priority 1">Priority 1 (Critical)</option>
                  <option value="Priority 2">Priority 2 (Urgent)</option>
                </select>
              </div>

              {/* Feed List */}
              <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
                {filteredCases.map((c) => {
                  const isSelected = c.id === selectedCase?.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCaseId(c.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all space-y-2 ${
                        isSelected
                          ? 'bg-slate-800/90 border-blue-500 shadow-lg ring-1 ring-blue-500/30'
                          : 'bg-[#121622]/80 hover:bg-[#161C2C] border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white">{c.id}</span>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            c.emergency.severity.includes('Priority 1')
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {c.emergency.severity.split(' ')[0]}
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-slate-200">
                          {c.patientName}{' '}
                          <span className="text-[11px] font-normal text-slate-400">({c.relationship})</span>
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{c.emergency.type}</div>
                      </div>

                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                        <span>Ambulance: {c.ambulance.unitId}</span>
                        <span className="font-mono text-emerald-400 font-bold">{c.currentStage}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Incident Drill-down & Command Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedCase ? (
              <div className="p-5 rounded-2xl bg-[#0E121B] border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-extrabold text-white">{selectedCase.id}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 font-bold">
                        {selectedCase.emergency.severity}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Stage: {selectedCase.currentStage}</span>
                    </div>
                    <h2 className="text-xl font-black text-white mt-1">
                      {selectedCase.patientName}{' '}
                      <span className="text-xs font-normal text-slate-400">
                        (Requested by {selectedCase.requesterName} · {selectedCase.relationship})
                      </span>
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCommsOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                      <span>Comms</span>
                    </button>

                    <button
                      onClick={() => setCancelModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold transition-colors"
                    >
                      Close / Resolve Case
                    </button>
                  </div>
                </div>

                {/* Patient Location & Assigned Providers */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Location</span>
                    <p className="text-white font-semibold truncate">{selectedCase.location.address}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{selectedCase.location.type}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Ambulance</span>
                    <p className="text-white font-semibold">{selectedCase.ambulance.unitId}</p>
                    <p className="text-[10px] text-amber-400 font-mono">{selectedCase.ambulance.status}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Hospital</span>
                    <p className="text-white font-semibold truncate">{selectedCase.hospital.name}</p>
                    <p className="text-[10px] text-purple-400 font-mono">{selectedCase.hospital.allocatedBay}</p>
                  </div>
                </div>

                {/* Status Transitions */}
                <div className="p-3.5 rounded-xl bg-[#141824] border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider block">
                    Admin Status Override
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {(['AMBULANCE_EN_ROUTE', 'DOCTOR_CONNECTED', 'HOSPITAL_ACCEPTED', 'HANDOVER'] as EmergencyStatus[]).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => handleAdvanceStatus(st)}
                          className="p-2 rounded-lg bg-black/50 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-center text-[11px]"
                        >
                          {st.replace(/_/g, ' ')}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Reassignment Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-2">
                    <strong className="text-slate-200 block text-[11px] uppercase">Reassign Ambulance</strong>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {ambulances.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => handleReassignAmbulance(a.id)}
                          className={`w-full p-2 rounded-lg border text-left flex items-center justify-between ${
                            selectedCase.ambulance.unitId === a.unitId
                              ? 'bg-amber-950/60 border-amber-800 text-amber-200'
                              : 'bg-[#121622] hover:bg-slate-800 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="font-mono">{a.unitId}</span>
                          <span className="text-[10px] text-slate-500">{a.status}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-slate-800 space-y-2">
                    <strong className="text-slate-200 block text-[11px] uppercase">Reassign Doctor</strong>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {doctors.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => handleReassignDoctor(d.id)}
                          className={`w-full p-2 rounded-lg border text-left flex items-center justify-between ${
                            selectedCase.doctor.name === d.name
                              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                              : 'bg-[#121622] hover:bg-slate-800 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span className="truncate max-w-[150px]">{d.name}</span>
                          <span className="text-[10px] text-slate-500">{d.availability}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Audit Trail for this case */}
                <div className="p-3.5 rounded-xl bg-[#141824] border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider block">
                    Case Audit Trail (Recorded Events)
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 text-[11px]">
                    {auditLogs
                      .filter((a) => a.caseId === selectedCase.id)
                      .map((log) => (
                        <div
                          key={log.id}
                          className="p-2 rounded-lg bg-black/40 border border-slate-800 flex items-center justify-between gap-2 text-slate-300"
                        >
                          <div>
                            <strong className="text-white font-mono">{log.action}</strong> by{' '}
                            <span className="text-blue-400">{log.actorName}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">{log.timestamp}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 rounded-2xl bg-[#0E121B] border border-slate-800 text-center text-slate-400">
                Select an incident from the feed.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: AUDIT LOGS (Immutable System-wide) */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="p-5 rounded-2xl bg-[#0E121B] border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Immutable HIPAA Audit Log Registry</h2>
              <p className="text-xs text-slate-400">
                Cryptographically tracked record access, operational transitions, and administrative actions.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">{auditLogs.length} Total Logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-black/50 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Timestamp</th>
                  <th className="p-2.5">Actor</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Action</th>
                  <th className="p-2.5">Target Case / ID</th>
                  <th className="p-2.5">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40">
                    <td className="p-2.5 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-2.5 text-white font-sans font-bold">{log.actorName}</td>
                    <td className="p-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-black text-slate-300 border border-slate-800">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="p-2.5 text-emerald-400 font-bold">{log.action}</td>
                    <td className="p-2.5 text-slate-300">{log.caseId || log.targetId || '-'}</td>
                    <td className="p-2.5 text-slate-400 max-w-xs truncate font-mono text-[10px]">
                      {log.metadata ? JSON.stringify(log.metadata) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: FLEET & DOCTORS & HOSPITALS */}
      {['FLEET', 'DOCTORS', 'HOSPITALS'].includes(activeTab) && (
        <div className="p-5 rounded-2xl bg-[#0E121B] border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-bold text-white capitalize">
              {activeTab === 'DOCTORS' ? 'Doctor Management & Clinical Approvals' : `${activeTab.toLowerCase()} Overview`}
            </h2>
            {activeTab === 'DOCTORS' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddDoctorModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>+ Invite Doctor</span>
                </button>
              </div>
            )}
          </div>

          {/* Pending Doctor Onboarding Requests Section */}
          {activeTab === 'DOCTORS' && (
            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Physician Onboarding Applications ({onboardingRequests.filter((r) => r.status === 'PENDING_VERIFICATION').length} Pending)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Credential Verification Queue
                </span>
              </div>

              {onboardingRequests.filter((r) => r.status === 'PENDING_VERIFICATION').length === 0 ? (
                <p className="text-xs text-slate-400 py-1">
                  ✓ All physician network onboarding applications have been reviewed.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {onboardingRequests
                    .filter((r) => r.status === 'PENDING_VERIFICATION')
                    .map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-xl bg-black/60 border border-slate-700/80 space-y-2 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <strong className="text-white font-bold text-sm block">
                              {req.fullName}
                            </strong>
                            <span className="text-[11px] text-emerald-400 font-medium">
                              {req.specialization}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            PENDING
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
                          <div>License: <strong className="text-white font-mono">{req.registrationNumber}</strong></div>
                          <div>Exp: <strong className="text-white">{req.experienceYears} Years</strong></div>
                          <div className="col-span-2">Affiliation: <strong className="text-slate-200">{req.hospitalAffiliation}</strong></div>
                          <div className="col-span-2 truncate">Email: <span className="text-slate-300 font-mono">{req.email}</span></div>
                        </div>

                        {req.qualifications && (
                          <div className="text-[10px] text-slate-400 bg-slate-900/80 p-1.5 rounded border border-slate-800">
                            Certifications: {req.qualifications}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRejectDoctorOnboarding(req.id)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-400 hover:text-red-300 hover:bg-red-950/60 transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproveDoctorOnboarding(req)}
                            className="px-3 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Verify & Approve Doctor</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeTab === 'FLEET' &&
              ambulances.map((a) => (
                <div key={a.id} className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-white font-mono text-sm">{a.unitId}</strong>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                      {a.status}
                    </span>
                  </div>
                  <p className="text-slate-300">{a.vehicleType}</p>
                  <p className="text-[11px] text-slate-400">Crew: {a.driverParamedic} · {a.leadMedic}</p>
                  <p className="text-[10px] font-mono text-slate-500">{a.currentAddress}</p>
                </div>
              ))}

            {activeTab === 'DOCTORS' &&
              doctors.map((d) => {
                const isApproved = d.verificationStatus === 'VERIFIED' || d.verificationStatus === 'APPROVED';
                return (
                  <div key={d.id} className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2.5 text-xs flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-white text-sm">{d.name}</strong>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                            isApproved
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : 'bg-red-950 text-red-400 border-red-800'
                          }`}
                        >
                          {isApproved ? 'APPROVED' : d.verificationStatus}
                        </span>
                      </div>
                      <p className="text-slate-300">{d.specialization}</p>
                      <p className="text-[11px] text-slate-400">{d.hospitalAffiliation} · {d.experienceYears}y exp</p>
                      <p className="text-[10px] font-mono text-slate-500">License: {d.registrationNumber}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-400">
                        Status: <strong className="text-white">{d.availability}</strong>
                      </span>
                      <button
                        onClick={() => handleToggleDoctorApproval(d.id, d.verificationStatus)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                          isApproved
                            ? 'bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 border border-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        }`}
                      >
                        {isApproved ? 'Suspend Access' : 'Approve Doctor'}
                      </button>
                    </div>
                  </div>
                );
              })}

            {activeTab === 'HOSPITALS' &&
              hospitals.map((h) => (
                <div key={h.id} className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-white text-sm">{h.name}</strong>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                      {h.traumaLevel}
                    </span>
                  </div>
                  <p className="text-slate-300">Entrance: {h.bayEntrance}</p>
                  <p className="text-[11px] text-emerald-400">
                    Bays: {h.totalTraumaBays - h.occupiedBays} Available of {h.totalTraumaBays}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">Direct: {h.emergencyPhone}</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / INVITE DOCTOR (Section 7) */}
      {isAddDoctorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#0D1017] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Add & Invite Emergency Doctor</h3>
              </div>
              <button
                onClick={() => setIsAddDoctorModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDoctor} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Legal Name & Credentials</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Robert Vance, MD"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Doctor Email</label>
                <input
                  type="email"
                  required
                  placeholder="doctor.email@healthnetwork.com"
                  value={docEmail}
                  onChange={(e) => setDocEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 018-0000"
                    value={docPhone}
                    onChange={(e) => setDocPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Medical License / Reg No</label>
                  <input
                    type="text"
                    required
                    placeholder="MD-88219-CAD"
                    value={docLicense}
                    onChange={(e) => setDocLicense(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Specialization</label>
                <input
                  type="text"
                  value={docSpecialty}
                  onChange={(e) => setDocSpecialty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min={1}
                    value={docExperience}
                    onChange={(e) => setDocExperience(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Hospital Affiliation</label>
                  <input
                    type="text"
                    value={docHospital}
                    onChange={(e) => setDocHospital(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-[11px]">
                Upon creation by Super Admin, this physician account will receive an invitation to set credentials and will be marked <strong>APPROVED</strong> for the Doctor Telemetry Portal.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDoctorModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                >
                  Send Invitation & Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW: CAD ANALYTICS */}
      {activeTab === 'ANALYTICS' && (
        <div className="p-5 rounded-2xl bg-[#0E121B] border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white">System Response Time Analytics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2">
              <span className="text-slate-400 uppercase font-mono text-[10px]">Average Dispatch Time</span>
              <div className="text-2xl font-mono font-bold text-emerald-400">38 seconds</div>
              <p className="text-[11px] text-slate-400">Time from SOS trigger to CAD unit assignment</p>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2">
              <span className="text-slate-400 uppercase font-mono text-[10px]">On-Scene Arrival Time</span>
              <div className="text-2xl font-mono font-bold text-amber-400">4.2 minutes</div>
              <p className="text-[11px] text-slate-400">Metro area paramedic transit time</p>
            </div>
            <div className="p-4 rounded-xl bg-black/40 border border-slate-800 space-y-2">
              <span className="text-slate-400 uppercase font-mono text-[10px]">ED Handover Completion</span>
              <div className="text-2xl font-mono font-bold text-purple-400">6.1 minutes</div>
              <p className="text-[11px] text-slate-400">Ambulance bay to trauma bed certificate transfer</p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: AMBULANCE APPLICATIONS (SECTION 5 & 6) */}
      {activeTab === 'AMBULANCE_APPLICATIONS' && (
        <div className="p-5 rounded-3xl bg-[#0E121B] border border-amber-500/40 space-y-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Ambulance className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-black text-white tracking-tight">
                  Ambulance Operator Applications & Credential Verification
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Review and authorize emergency response personnel, certified paramedics, vehicle registrations, and life-support assets.
              </p>
            </div>

            {/* Filter by Verification Status */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/50 border border-slate-800 text-xs">
              {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setAmbFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-bold transition-colors ${
                    ambFilterStatus === st
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Registry Table */}
          <div className="space-y-3">
            {ambulanceApps
              .filter((app) => ambFilterStatus === 'ALL' || app.verificationStatus === ambFilterStatus)
              .map((app) => {
                const isApproved = app.verificationStatus === 'APPROVED';
                const isPending = app.verificationStatus === 'PENDING';
                const isUnderReview = app.verificationStatus === 'UNDER_REVIEW';
                const isRejected = app.verificationStatus === 'REJECTED';
                const isSuspended = app.verificationStatus === 'SUSPENDED';

                return (
                  <div
                    key={app.id}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      isPending
                        ? 'bg-amber-950/20 border-amber-500/50'
                        : isApproved
                        ? 'bg-[#121622] border-slate-800'
                        : 'bg-[#10131C] border-slate-800/80 opacity-90'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      {/* Left: Applicant details */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center shrink-0">
                          <Ambulance className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-black text-white truncate">{app.fullName}</span>
                            <span
                              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                isApproved
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                  : isPending
                                  ? 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse'
                                  : isUnderReview
                                  ? 'bg-blue-950 text-blue-300 border-blue-700'
                                  : isRejected
                                  ? 'bg-red-950 text-red-300 border-red-700'
                                  : 'bg-slate-900 text-slate-400 border-slate-700'
                              }`}
                            >
                              {app.verificationStatus}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                              {app.professionalRole}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                            <span>{app.email}</span>
                            <span>·</span>
                            <span>{app.mobileNumber}</span>
                            <span>·</span>
                            <span className="text-amber-300 font-semibold">{app.organizationName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Buttons (Section 5: VIEW DETAILS, APPROVE, REJECT, REQUEST MORE INFO, SUSPEND) */}
                      <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
                        <button
                          onClick={() => setSelectedAmbApp(app)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>VIEW DETAILS</span>
                        </button>

                        {!isApproved && (
                          <button
                            onClick={() => handleReviewAmbulanceAction(app.id, 'APPROVE')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-md"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>APPROVE</span>
                          </button>
                        )}

                        {isApproved && (
                          <button
                            onClick={() => handleReviewAmbulanceAction(app.id, 'SUSPEND')}
                            className="px-3 py-1.5 rounded-xl bg-amber-600/30 hover:bg-amber-600 border border-amber-600/60 text-amber-200 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>SUSPEND</span>
                          </button>
                        )}

                        {!isRejected && (
                          <button
                            onClick={() =>
                              setAmbReasonModal({
                                isOpen: true,
                                appId: app.id,
                                action: 'REJECT',
                                title: `Reject Application for ${app.fullName}`
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/80 text-red-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>REJECT</span>
                          </button>
                        )}

                        {!isApproved && (
                          <button
                            onClick={() =>
                              setAmbReasonModal({
                                isOpen: true,
                                appId: app.id,
                                action: 'REQUEST_MORE_INFO',
                                title: `Request More Information from ${app.fullName}`
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900 border border-blue-800 text-blue-300 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>REQUEST MORE INFO</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Specs summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                      <div>
                        CALLSIGN: <span className="text-white font-bold">{app.ambulanceCallsign}</span>
                      </div>
                      <div>
                        LICENSE: <span className="text-white font-bold">{app.licenseNumber}</span>
                      </div>
                      <div>
                        EQUIPMENT: <span className="text-emerald-400 font-bold">{app.hasALS ? 'ALS + O2' : 'BLS'} ({app.equipmentList.length} items)</span>
                      </div>
                      <div>
                        DOCUMENTS: <span className="text-amber-400 font-bold">{app.documents.length} verified/pending</span>
                      </div>
                    </div>

                    {app.rejectionReason && (
                      <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-900/60 text-xs text-red-300">
                        <strong>Rejection Reason:</strong> {app.rejectionReason}
                      </div>
                    )}
                    {app.requestedInfoNote && (
                      <div className="p-2.5 rounded-xl bg-blue-950/50 border border-blue-900/60 text-xs text-blue-300">
                        <strong>Note to Applicant:</strong> {app.requestedInfoNote}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* AMBULANCE APPLICATION DETAILS & DOCUMENT REVIEW MODAL (SECTION 6) */}
      {selectedAmbApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-[#0D1017] border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#121622] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Ambulance className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Ambulance Application Dossier</h3>
                  <span className="text-[10px] font-mono text-slate-400">ID: {selectedAmbApp.id}</span>
                </div>
              </div>
              <button onClick={() => setSelectedAmbApp(null)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Personal Details */}
              <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  1. PERSONAL & GOVERNMENT IDENTIFICATION
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>Full Name: <strong className="text-white">{selectedAmbApp.fullName}</strong></div>
                  <div>Email: <strong className="text-white">{selectedAmbApp.email}</strong></div>
                  <div>Phone: <strong className="text-white">{selectedAmbApp.mobileNumber}</strong></div>
                  <div>DOB: <strong className="text-white">{selectedAmbApp.dateOfBirth}</strong></div>
                  <div className="col-span-2">Address: <strong className="text-white">{selectedAmbApp.address}</strong></div>
                  <div>Gov ID Type: <strong className="text-white">{selectedAmbApp.govIdType}</strong></div>
                  <div>Gov ID Number: <strong className="text-white">{selectedAmbApp.govIdNumber}</strong></div>
                </div>
              </div>

              {/* Professional Qualifications */}
              <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  2. PROFESSIONAL QUALIFICATIONS & LICENSURE
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>Designation: <strong className="text-amber-400 font-bold">{selectedAmbApp.professionalRole}</strong></div>
                  <div>Experience: <strong className="text-white">{selectedAmbApp.experienceYears} Years</strong></div>
                  <div>License Number: <strong className="text-white font-mono">{selectedAmbApp.licenseNumber}</strong></div>
                  <div>Expires: <strong className="text-white font-mono">{selectedAmbApp.licenseExpiry}</strong></div>
                  <div className="col-span-2">Accreditations: <strong className="text-emerald-400">{selectedAmbApp.emergencyMedicalTraining?.join(', ') || 'N/A'}</strong></div>
                  <div className="col-span-2">Organization: <strong className="text-white">{selectedAmbApp.organizationName}</strong></div>
                </div>
              </div>

              {/* Ambulance Vehicle & Equipment */}
              <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  3. AMBULANCE UNIT & LIFE-SUPPORT ASSETS
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>Callsign: <strong className="text-amber-300 font-bold">{selectedAmbApp.ambulanceCallsign}</strong></div>
                  <div>Type: <strong className="text-white">{selectedAmbApp.ambulanceType}</strong></div>
                  <div>Make/Model: <strong className="text-white">{selectedAmbApp.vehicleModel}</strong></div>
                  <div>Vehicle Plate: <strong className="text-white font-mono">{selectedAmbApp.vehicleRegistration}</strong></div>
                  <div className="col-span-2 flex items-center gap-2 pt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${selectedAmbApp.hasOxygen ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-500'}`}>
                      {selectedAmbApp.hasOxygen ? '✓ OXYGEN ONBOARD' : 'NO O2'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${selectedAmbApp.hasVentilator ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-500'}`}>
                      {selectedAmbApp.hasVentilator ? '✓ VENTILATOR' : 'NO VENT'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${selectedAmbApp.hasALS ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-900 text-slate-500'}`}>
                      {selectedAmbApp.hasALS ? '✓ ALS CAPABLE' : 'BLS ONLY'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification Documents List (Section 6) */}
              <div className="p-4 rounded-2xl bg-black/40 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  4. ATTACHED VERIFICATION DOCUMENTS ({selectedAmbApp.documents?.length || 0})
                </span>
                <div className="space-y-2">
                  {selectedAmbApp.documents?.map((d) => (
                    <div key={d.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <div>
                          <div className="font-bold text-white">{d.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{d.fileName} · {d.fileSize || '2 MB'}</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {d.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Bottom Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  onClick={() => setSelectedAmbApp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
                >
                  Close Dossier
                </button>

                {selectedAmbApp.verificationStatus !== 'APPROVED' && (
                  <button
                    onClick={() => {
                      handleReviewAmbulanceAction(selectedAmbApp.id, 'APPROVE');
                      setSelectedAmbApp(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
                  >
                    Authorize & Approve Operator
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION / REQUEST MORE INFO REASON PROMPT MODAL */}
      {ambReasonModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#0D1017] border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-white">{ambReasonModal.title}</h3>
            <p className="text-xs text-slate-400">
              Provide specific administrative notes. This will be transmitted to the applicant and recorded in the audit log.
            </p>
            <textarea
              required
              rows={3}
              value={ambReasonText}
              onChange={(e) => setAmbReasonText(e.target.value)}
              placeholder="e.g. Expired driving endorsement or missing paramedic state license copy."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-amber-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAmbReasonModal({ isOpen: false, appId: '', action: 'REJECT', title: '' })}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await handleReviewAmbulanceAction(ambReasonModal.appId, ambReasonModal.action, ambReasonText);
                  setAmbReasonModal({ isOpen: false, appId: '', action: 'REJECT', title: '' });
                  setAmbReasonText('');
                }}
                className={`px-5 py-2 rounded-xl text-white font-bold text-xs ${
                  ambReasonModal.action === 'REJECT' ? 'bg-red-600 hover:bg-red-500' : 'bg-blue-600 hover:bg-blue-500'
                }`}
              >
                Confirm {ambReasonModal.action === 'REJECT' ? 'Rejection' : 'Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close / Cancel Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0E121B] border border-slate-800 p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Resolve / Close Emergency Case</h3>
            <p className="text-xs text-slate-400">
              Provide an administrative closure reason. This action will be permanently recorded in the immutable audit
              log.
            </p>
            <input
              type="text"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Patient successfully stabilized and admitted into Cath Lab Bay 2"
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-slate-700 text-xs text-white"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseCase}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Realtime Case Comms Relay */}
      {selectedCase && (
        <CaseChatDrawer
          isOpen={isCommsOpen}
          onClose={() => setIsCommsOpen(false)}
          caseId={selectedCase.id}
          patientName={selectedCase.patientName}
          currentSession={currentSession}
        />
      )}

      {/* Supabase Database & Records Inspector Modal */}
      <SupabaseInspectorModal
        isOpen={isSupabaseInspectorOpen}
        onClose={() => setIsSupabaseInspectorOpen(false)}
      />
    </div>
  );
};
