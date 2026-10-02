import React, { useState } from 'react';
import {
  ShieldAlert,
  User,
  Stethoscope,
  Ambulance,
  Building2,
  ShieldCheck,
  Check,
  ChevronDown,
  Database,
  ExternalLink,
  Info,
  LogOut
} from 'lucide-react';
import { UserRole, AppUserSession } from '../../types/roles';
import { getSupabaseConfigStatus } from '../../lib/supabase';

export const DEMO_USERS: Record<UserRole, AppUserSession> = {
  PATIENT: {
    id: 'usr-jake-001',
    email: 'jake.vance@example.com',
    fullName: 'Jake Vance',
    role: 'PATIENT'
  },
  REQUESTER: {
    id: 'usr-jake-001',
    email: 'jake.vance@example.com',
    fullName: 'Jake Vance',
    role: 'REQUESTER'
  },
  DOCTOR: {
    id: 'usr-doc-01',
    email: 'dr.aris@metrohealth.example',
    fullName: 'Dr. Katherine Aris, MD',
    role: 'DOCTOR',
    associatedDoctorId: 'doc-aris-01'
  },
  AMBULANCE_OPERATOR: {
    id: 'usr-ops-01',
    email: 'dispatch@resqone.example',
    fullName: 'Sergeant M. Torres (Ops Lead)',
    role: 'AMBULANCE_OPERATOR',
    associatedAmbulanceId: 'amb-als-14'
  },
  HOSPITAL: {
    id: 'usr-hosp-01',
    email: 'intake@metrohealth.example',
    fullName: 'Metro Trauma Intake Bay',
    role: 'HOSPITAL',
    associatedHospitalId: 'hosp-metro-01'
  },
  RESQ_ADMIN: {
    id: 'usr-adm-01',
    email: 'admin@resqone.example',
    fullName: 'Operations Commander Marcus',
    role: 'RESQ_ADMIN'
  },
  SUPER_ADMIN: {
    id: 'usr-adm-01',
    email: 'admin@resqone.example',
    fullName: 'Commander Marcus Sterling',
    role: 'SUPER_ADMIN'
  }
};

interface RoleSwitcherProps {
  currentSession: AppUserSession;
  onSwitchSession: (session: AppUserSession) => void;
  onOpenPortal: (portal: 'PATIENT' | 'DOCTOR' | 'OPERATIONS' | 'HOSPITAL' | 'ADMIN') => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentSession,
  onSwitchSession,
  onOpenPortal
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const configStatus = getSupabaseConfigStatus();

  const roleOptions: Array<{
    role: UserRole;
    label: string;
    portalName: 'PATIENT' | 'DOCTOR' | 'OPERATIONS' | 'HOSPITAL' | 'ADMIN';
    icon: any;
    desc: string;
    badge: string;
    color: string;
  }> = [
    {
      role: 'PATIENT',
      label: 'Patient & Requester App',
      portalName: 'PATIENT',
      icon: User,
      desc: 'One-click SOS, WHO NEEDS HELP?, Health Passport & Family',
      badge: 'Core App',
      color: 'text-red-400 bg-red-950/60 border-red-800'
    },
    {
      role: 'DOCTOR',
      label: 'Emergency Doctor Portal',
      portalName: 'DOCTOR',
      icon: Stethoscope,
      desc: 'Live Telemetry, Clinical Triage, Protocol Directives & Handover',
      badge: '/doctor',
      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800'
    },
    {
      role: 'AMBULANCE_OPERATOR',
      label: 'Ambulance & CAD Operations',
      portalName: 'OPERATIONS',
      icon: Ambulance,
      desc: 'Fleet Dispatch, Live GPS Tracking, Crew Coordination',
      badge: '/operations',
      color: 'text-amber-400 bg-amber-950/60 border-amber-800'
    },
    {
      role: 'HOSPITAL',
      label: 'Hospital Trauma Bay Portal',
      portalName: 'HOSPITAL',
      icon: Building2,
      desc: 'Incoming Pre-Notifications, Bay Allocation, ED Acceptance',
      badge: '/hospital',
      color: 'text-purple-400 bg-purple-950/60 border-purple-800'
    },
    {
      role: 'SUPER_ADMIN',
      label: 'Super Admin Command Center',
      portalName: 'ADMIN',
      icon: ShieldCheck,
      desc: 'Global Incident Control, Realtime Map, Audit Logs & Analytics',
      badge: '/admin',
      color: 'text-blue-400 bg-blue-950/60 border-blue-800'
    }
  ];

  const handleSelectRole = (opt: (typeof roleOptions)[0]) => {
    const session = DEMO_USERS[opt.role];
    onSwitchSession(session);
    onOpenPortal(opt.portalName);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141824] hover:bg-[#1A2030] border border-slate-700/80 text-xs font-semibold text-slate-200 transition-all shadow-sm"
          title="Switch Active Persona & Portal"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden md:inline text-slate-400 text-[11px] font-mono uppercase">Role:</span>
          <span className="font-bold text-white max-w-[120px] truncate">{currentSession.role.replace('_', ' ')}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0E121B] border border-slate-800 shadow-2xl z-50 p-3 space-y-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black tracking-wider uppercase text-slate-200">
                  Switch Portal & Persona
                </span>
              </div>
              <button
                onClick={() => setShowConfigModal(true)}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 border border-slate-700"
              >
                <span>Supabase</span>
                <span
                  className={`w-1.5 h-1.5 rounded-full ${configStatus.isConfigured ? 'bg-emerald-400' : 'bg-amber-400'}`}
                />
              </button>
            </div>

            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {roleOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isCurrent = currentSession.role === opt.role;

                return (
                  <button
                    key={opt.role}
                    onClick={() => handleSelectRole(opt)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      isCurrent
                        ? 'bg-slate-800/80 border-slate-600 shadow-md ring-1 ring-white/10'
                        : 'bg-[#121622]/60 hover:bg-[#161C2C] border-slate-800/80'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${opt.color}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <strong className="text-xs font-bold text-white truncate">{opt.label}</strong>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/40 text-slate-300 border border-slate-700/50">
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{opt.desc}</p>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800/80 px-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Logged in as:</span>
              <strong className="text-white truncate max-w-[170px]">{currentSession.fullName}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Supabase Status & Setup Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#0E121B] border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Supabase Backend Status</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                Close
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#141824] border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Connection Status:</span>
                {configStatus.isConfigured ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Live Supabase Connected</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                    Local Synced Store Mode
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Supabase URL:</span>
                <span className="font-mono text-emerald-300 truncate max-w-[240px]">
                  {configStatus.url || 'Not configured in .env'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">API Key Status:</span>
                <span className="font-mono text-slate-300">
                  {configStatus.hasAnonKey ? 'Verified & Injected' : 'Missing'}
                </span>
              </div>
            </div>

            {configStatus.isConfigured && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Database Schema & Tables</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black text-slate-400 border border-slate-800">
                    PostgreSQL
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your project is connected to <code className="text-white">vquzhjrizaqyjywyaozh.supabase.co</code>. If you haven&apos;t run the SQL schema migration in Supabase yet, open the SQL Editor to apply all 20+ tables and RLS security policies:
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href="https://supabase.com/dashboard/project/vquzhjrizaqyjywyaozh/sql/new"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Supabase SQL Editor</span>
                  </a>
                </div>
                <p className="text-[10px] font-mono text-slate-500 text-center">
                  Migration file: /supabase/migrations/20261002000001_resqone_schema.sql
                </p>
              </div>
            )}

            {!configStatus.isConfigured && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/60 text-blue-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info className="w-4 h-4 text-blue-400" />
                    <span>How to connect your live Supabase database:</span>
                  </div>
                  <p className="text-[11px] text-blue-300">
                    Add the following credentials to your environment variables or <code className="text-white">.env</code> file:
                  </p>
                </div>

                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800">
                    <div className="text-slate-400"># 1. Project URL</div>
                    <div className="text-emerald-400">VITE_SUPABASE_URL=&quot;https://your-project.supabase.co&quot;</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800">
                    <div className="text-slate-400"># 2. Public Anon Key</div>
                    <div className="text-emerald-400">VITE_SUPABASE_ANON_KEY=&quot;eyJh...&quot;</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/50 border border-slate-800">
                    <div className="text-slate-400"># 3. Privileged Service Role Key (Backend Only)</div>
                    <div className="text-purple-400">SUPABASE_SERVICE_ROLE_KEY=&quot;eyJh...&quot;</div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Migration script ready: <code className="text-slate-300 font-mono">/supabase/migrations/20261002000001_resqone_schema.sql</code>
                </p>
              </div>
            )}

            <button
              onClick={() => setShowConfigModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
            >
              Continue Working
            </button>
          </div>
        </div>
      )}
    </>
  );
};
