import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, LogIn } from 'lucide-react';
import { UserRole, AppUserSession } from '../../types/roles';

interface RoleAccessGateProps {
  requiredRole: UserRole | UserRole[];
  currentSession: AppUserSession;
  portalTitle: string;
  onOpenLogin: (reason?: string) => void;
  onReturnToHome: () => void;
  children: React.ReactNode;
}

export const RoleAccessGate: React.FC<RoleAccessGateProps> = ({
  requiredRole,
  currentSession,
  portalTitle,
  onOpenLogin,
  onReturnToHome,
  children
}) => {
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  // Super admin can access administrative views
  const isAuthorized =
    allowedRoles.includes(currentSession.role) ||
    (currentSession.role === 'SUPER_ADMIN' && allowedRoles.some((r) => ['RESQ_ADMIN', 'DOCTOR', 'AMBULANCE_OPERATOR', 'HOSPITAL'].includes(r)));

  if (isAuthorized) {
    return <>{children}</>;
  }

  const roleLabels = allowedRoles.map((r) => r.replace('_', ' ')).join(' or ');

  return (
    <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-[#0E121B] border border-red-900/60 shadow-2xl text-center space-y-5 animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-2xl bg-red-600/20 text-[#FF2B44] border border-red-500/30 flex items-center justify-center mx-auto">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase bg-red-950/60 px-3 py-1 rounded-full border border-red-900/80">
          STRICT DATA ISOLATION ENFORCED
        </span>
        <h2 className="text-xl font-black text-white">{portalTitle} Access Restricted</h2>
        <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
          You are currently logged in as <strong className="text-white">{currentSession.fullName}</strong> with role{' '}
          <strong className="text-red-400 font-mono">{currentSession.role}</strong>.
          <br />
          This portal requires <strong className="text-emerald-400">{roleLabels}</strong> authorization.
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 text-left text-xs space-y-1 text-slate-400">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Security & HIPAA Protocol:</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Patients, clinicians, ambulance crew, and hospital intake bays operate on strictly separated access tiers. Patient medical data and fleet operations are not exposed across unauthorized roles.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={onReturnToHome}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Emergency App</span>
        </button>

        <button
          onClick={() => onOpenLogin(`Portal "${portalTitle}" requires ${roleLabels} access.`)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FF2B44] hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
        >
          <LogIn className="w-4 h-4" />
          <span>Switch to {roleLabels} Login</span>
        </button>
      </div>
    </div>
  );
};
