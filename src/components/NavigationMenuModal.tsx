import React from 'react';
import {
  X,
  Users,
  User,
  FileText,
  CreditCard,
  Building2,
  Volume2,
  VolumeX,
  ShieldCheck,
  ChevronRight,
  HeartPulse,
  Activity,
  Clock,
  LogOut,
  Stethoscope,
  Ambulance,
  Radio,
  Sliders,
  AlertTriangle,
  Hospital,
  ShieldAlert,
  ArrowRight,
  Database
} from 'lucide-react';
import { ResqLogo } from './ResqLogo';
import { ThemeSelector } from './ThemeSelector';
import { UserEmergencyProfile } from '../types/emergency';
import { AppUserSession } from '../types/roles';

interface NavigationMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserEmergencyProfile;
  currentSession: AppUserSession;
  familyCount: number;
  recordsCount: number;
  insuranceCount: number;
  hospitalsCount: number;
  activeCasesCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNavigate: (view: 'DASHBOARD' | 'ACTIVE_TRACKER' | 'MEDICAL_RECORDS' | 'INSURANCE' | 'HOSPITAL_PREFERENCES' | 'SIGN_UP' | 'DOCTOR_PORTAL' | 'OPERATIONS_PORTAL' | 'AMBULANCE_PORTAL' | 'HOSPITAL_PORTAL' | 'ADMIN_PORTAL' | 'FAMILY_PROFILES') => void;
  onOpenSelfProfile: () => void;
  onOpenFamilyManagement: () => void;
  onTriggerSOS: () => void;
  onLogout: () => void;
  onSwitchToPatientApp?: () => void;
  onSwitchToDoctorPortal?: () => void;
  onOpenDoctorOnboarding?: () => void;
  onOpenApplyAmbulance?: () => void;
  onOpenSupabaseInspector?: () => void;
}

export const NavigationMenuModal: React.FC<NavigationMenuModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentSession,
  familyCount,
  recordsCount,
  insuranceCount,
  hospitalsCount,
  activeCasesCount,
  soundEnabled,
  onToggleSound,
  onNavigate,
  onOpenSelfProfile,
  onOpenFamilyManagement,
  onTriggerSOS,
  onLogout,
  onSwitchToPatientApp,
  onSwitchToDoctorPortal,
  onOpenDoctorOnboarding,
  onOpenApplyAmbulance,
  onOpenSupabaseInspector
}) => {
  if (!isOpen) return null;

  const role = currentSession.role;
  const isDoctor = role === 'DOCTOR';
  const isAdmin = role === 'SUPER_ADMIN' || role === 'RESQ_ADMIN';
  const isAmbulance = role === 'AMBULANCE_OPERATOR';
  const isHospital = role === 'HOSPITAL';
  const isDualRole = Boolean(currentSession.isDualRoleDoctorPatient || (currentSession.approvedRoles?.includes('PATIENT') && currentSession.approvedRoles?.includes('DOCTOR')));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0D1017] border border-[#DCE3EC] dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAFBFC] dark:bg-[#121622] border-b border-[#DCE3EC] dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ResqLogo variant="compact" />
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#EAF4FF] text-[#082B5C] border border-[#2F80C9]/30 font-bold">
              Account Menu
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#596579] hover:text-[#082B5C] dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-6 py-3.5 bg-white dark:bg-black/40 border-b border-[#DCE3EC] dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/30 flex items-center justify-center font-bold text-xs">
              {currentSession.fullName.slice(0, 2).toUpperCase() || 'RQ'}
            </div>
            <div>
              <div className="text-xs font-bold text-[#082B5C] dark:text-white truncate max-w-[200px]">
                {currentSession.fullName || 'RESQ Account'}
              </div>
              <div className="text-[11px] text-[#596579] dark:text-slate-400 truncate max-w-[200px]">
                {currentSession.email}
              </div>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#082B5C] dark:text-slate-300 border border-[#DCE3EC] dark:border-slate-700">
            {role.replace('_', ' ')}
          </span>
        </div>

        {/* Menu Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* 1. DUAL ROLE: PATIENT + DOCTOR */}
          {isDualRole ? (
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#2F80C9] px-1">
                Authorized Dual-Role Access
              </span>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    onClose();
                    if (onSwitchToDoctorPortal) onSwitchToDoctorPortal();
                    else onNavigate('DOCTOR_PORTAL');
                  }}
                  className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#121622] hover:bg-[#FAFBFC] dark:hover:bg-[#161C2C] border border-[#DCE3EC] dark:border-slate-800 text-left flex items-center justify-between transition-all group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#EAF8F1] text-[#18A66A] border border-[#18A66A]/20">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-sm font-bold text-[#082B5C] dark:text-white block">Doctor Portal</strong>
                      <span className="text-xs text-[#596579] dark:text-slate-400">Clinical telemetry, acute triage queue & hospital handover</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#596579] group-hover:text-[#DC2626] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    if (onSwitchToPatientApp) onSwitchToPatientApp();
                    else onNavigate('DASHBOARD');
                  }}
                  className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#121622] hover:bg-[#FAFBFC] dark:hover:bg-[#161C2C] border border-[#DCE3EC] dark:border-slate-800 text-left flex items-center justify-between transition-all group shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[#EAF4FF] text-[#2F80C9] border border-[#2F80C9]/20">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-sm font-bold text-[#082B5C] dark:text-white block">My Patient App</strong>
                      <span className="text-xs text-[#596579] dark:text-slate-400">Personal Health Passport & emergency family SOS</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#596579] group-hover:text-[#DC2626] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ) : isDoctor ? (
            /* 2. NORMAL DOCTOR */
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#18A66A] px-1">
                Clinician Portal
              </span>
              <button
                onClick={() => {
                  onClose();
                  onNavigate('DOCTOR_PORTAL');
                }}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#121622] hover:bg-[#FAFBFC] dark:hover:bg-[#161C2C] border border-[#DCE3EC] dark:border-slate-800 text-left flex items-center justify-between transition-all group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#EAF8F1] text-[#18A66A] border border-[#18A66A]/20">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-[#082B5C] dark:text-white block">Doctor Portal</strong>
                    <span className="text-xs text-[#596579] dark:text-slate-400">Clinical triage and active incident telemetry</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#596579] group-hover:text-[#DC2626] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : isAdmin ? (
            /* 3. RESQ_ADMIN or SUPER_ADMIN */
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#082B5C] dark:text-blue-400 px-1">
                Administrative Control
              </span>
              <button
                onClick={() => {
                  onClose();
                  onNavigate('ADMIN_PORTAL');
                }}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#121622] hover:bg-[#FAFBFC] dark:hover:bg-[#161C2C] border border-[#DCE3EC] dark:border-slate-800 text-left flex items-center justify-between transition-all group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#EAF4FF] text-[#082B5C] dark:text-blue-400 border border-[#2F80C9]/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-[#082B5C] dark:text-white block">Command Center</strong>
                    <span className="text-xs text-[#596579] dark:text-slate-400">Global fleet dispatch, doctor approvals & audit logs</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#596579] group-hover:text-[#DC2626] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : isAmbulance ? (
            /* 4. AMBULANCE OPERATOR */
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#DC2626] px-1">
                Fleet Operations
              </span>
              <button
                onClick={() => {
                  onClose();
                  onNavigate('AMBULANCE_PORTAL');
                }}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#121622] hover:bg-[#FAFBFC] dark:hover:bg-[#161C2C] border border-[#DCE3EC] dark:border-slate-800 text-left flex items-center justify-between transition-all group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20">
                    <Ambulance className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-[#082B5C] dark:text-white block">Ambulance Operations Portal</strong>
                    <span className="text-xs text-[#596579] dark:text-slate-400">Live CAD dispatch, pre-hospital vitals & trauma handover</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#596579] group-hover:text-[#DC2626] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : isHospital ? (
            /* 5. HOSPITAL */
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#2F80C9] px-1">
                Hospital Bay
              </span>
              <button
                onClick={() => {
                  onClose();
                  onNavigate('HOSPITAL_PORTAL');
                }}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#121622] hover:bg-[#FAFBFC] dark:hover:bg-[#161C2C] border border-[#DCE3EC] dark:border-slate-800 text-left flex items-center justify-between transition-all group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#EAF4FF] text-[#2F80C9] border border-[#2F80C9]/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-[#082B5C] dark:text-white block">Trauma Bay Pre-Intake</strong>
                    <span className="text-xs text-[#596579] dark:text-slate-400">Inbound ambulance notifications & bed preparation</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#596579] group-hover:text-[#DC2626] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            /* 6. NORMAL PATIENT */
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#596579] dark:text-slate-400 px-1">
                Patient Account
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenSelfProfile();
                }}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#121622] hover:bg-[#FAFBFC] dark:hover:bg-[#161C2C] border border-[#DCE3EC] dark:border-slate-800 text-left flex items-center justify-between transition-all group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-[#082B5C] dark:text-white block">My Account</strong>
                    <span className="text-xs text-[#596579] dark:text-slate-400">Personal Health Passport, medical records & emergency contacts</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#596579] group-hover:text-[#DC2626] group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Family & Linked Profiles */}
              <button
                onClick={() => {
                  onClose();
                  onNavigate('FAMILY_PROFILES');
                }}
                className="w-full p-3.5 rounded-2xl bg-white dark:bg-[#121622] hover:bg-[#FAFBFC] dark:hover:bg-[#161C2C] border border-[#DCE3EC] dark:border-slate-800 text-left flex items-center justify-between transition-all group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#EAF4FF] text-[#2F80C9] border border-[#2F80C9]/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-sm font-bold text-[#082B5C] dark:text-white block">Family & Linked Profiles</strong>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAF4FF] text-[#082B5C] border border-[#2F80C9]/30 font-bold">
                        {familyCount || 3} Active
                      </span>
                    </div>
                    <span className="text-xs text-[#596579] dark:text-slate-400">Connect trusted family members for faster emergency assistance</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#596579] group-hover:text-[#DC2626] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* Clinical Network & Database Tools */}
          <div className="pt-2 border-t border-[#DCE3EC] dark:border-slate-800/80 space-y-2">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#596579] dark:text-slate-400 px-1">
              Network & Telemetry Tools
            </span>

            {onOpenDoctorOnboarding && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDoctorOnboarding();
                }}
                className="w-full p-3 rounded-2xl bg-white dark:bg-[#121622] hover:bg-[#FAFBFC] dark:hover:bg-[#161C2C] border border-[#DCE3EC] dark:border-slate-800 text-left flex items-center justify-between transition-all group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#EAF8F1] text-[#18A66A] border border-[#18A66A]/20">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#082B5C] dark:text-white block">Doctor Onboarding Application</strong>
                    <span className="text-[11px] text-[#596579] dark:text-slate-400">Join the RESQ ONE clinician & ER telemetry network</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#596579] group-hover:text-[#18A66A] group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {onOpenApplyAmbulance && (
              <button
                onClick={() => {
                  onClose();
                  onOpenApplyAmbulance();
                }}
                className="w-full p-3 rounded-2xl bg-white dark:bg-[#121622] hover:bg-[#FAFBFC] dark:hover:bg-[#161C2C] border border-[#DCE3EC] dark:border-slate-800 text-left flex items-center justify-between transition-all group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20">
                    <Ambulance className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#082B5C] dark:text-white block">Apply as Ambulance Operator</strong>
                    <span className="text-[11px] text-[#596579] dark:text-slate-400">Register certified ambulance unit, EMT credentials & vehicle</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#596579] group-hover:text-[#DC2626] group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {!isAmbulance && (
              <button
                onClick={() => {
                  onClose();
                  onNavigate('AMBULANCE_PORTAL');
                }}
                className="w-full p-3 rounded-2xl bg-white dark:bg-[#121622] hover:bg-[#FAFBFC] dark:hover:bg-[#161C2C] border border-[#DCE3EC] dark:border-slate-800 text-left flex items-center justify-between transition-all group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20">
                    <Ambulance className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#082B5C] dark:text-white block">Ambulance Operations Portal</strong>
                    <span className="text-[11px] text-[#596579] dark:text-slate-400">Authorized CAD emergency response & dispatch gateway</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#596579] group-hover:text-[#DC2626] group-hover:translate-x-1 transition-transform" />
              </button>
            )}

            {onOpenSupabaseInspector && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSupabaseInspector();
                }}
                className="w-full p-3 rounded-2xl bg-white dark:bg-[#121622] hover:bg-[#FAFBFC] dark:hover:bg-[#161C2C] border border-[#DCE3EC] dark:border-slate-800 text-left flex items-center justify-between transition-all group shadow-xs cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#EAF4FF] text-[#2F80C9] border border-[#2F80C9]/20">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#082B5C] dark:text-white block">Supabase Telemetry Inspector</strong>
                    <span className="text-[11px] text-[#596579] dark:text-slate-400">View stored medical records, SQL tables & live cloud sync</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#596579] group-hover:text-[#2F80C9] group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {/* Theme Display Settings */}
          <div className="pt-2 border-t border-[#DCE3EC] dark:border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#596579] dark:text-slate-400 px-1">
              Theme Display
            </span>
            <div className="w-full p-2.5 rounded-2xl bg-white dark:bg-[#121622] border border-[#DCE3EC] dark:border-slate-800 flex items-center justify-between shadow-xs">
              <span className="text-xs font-semibold text-[#082B5C] dark:text-slate-300">Display Theme</span>
              <ThemeSelector />
            </div>
          </div>

          {/* Common Sound & Audio Settings */}
          <div className="pt-2 border-t border-[#DCE3EC] dark:border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#596579] dark:text-slate-400 px-1">
              Audio Cues
            </span>

            <button
              onClick={onToggleSound}
              className="w-full p-3 rounded-2xl bg-white dark:bg-[#121622] hover:bg-[#FAFBFC] dark:hover:bg-[#161C2C] border border-[#DCE3EC] dark:border-slate-800 text-left flex items-center justify-between transition-all shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#082B5C] dark:text-slate-300">
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-[#18A66A]" /> : <VolumeX className="w-4 h-4 text-[#596579]" />}
                </div>
                <div>
                  <strong className="text-xs font-bold text-[#082B5C] dark:text-white block">Emergency Audio</strong>
                  <span className="text-[11px] text-[#596579] dark:text-slate-400">{soundEnabled ? 'Enabled (Heartbeat & alert sound active)' : 'Muted'}</span>
                </div>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${soundEnabled ? 'bg-[#EAF8F1] text-[#18A66A]' : 'bg-slate-100 dark:bg-slate-800 text-[#596579] dark:text-slate-400'}`}>
                {soundEnabled ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer: Single Logout Option */}
        <div className="p-4 bg-[#FAFBFC] dark:bg-[#0A0D14] border-t border-[#DCE3EC] dark:border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#FFF0EF] hover:bg-[#D92D20] text-[#D92D20] hover:text-white border border-[#D92D20]/20 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};
