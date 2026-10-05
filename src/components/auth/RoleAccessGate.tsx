import React, { useState } from 'react';
import { ShieldAlert, Lock, ArrowLeft, LogIn, CheckCircle2 } from 'lucide-react';
import { UserRole, AppUserSession } from '../../types/roles';
import { authService } from '../../services/authService';

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

interface RoleAccessGateProps {
  requiredRole: UserRole | UserRole[];
  currentSession: AppUserSession;
  portalTitle: string;
  onOpenLogin: (reason?: string) => void;
  onReturnToHome: () => void;
  onOpenApplyAmbulance?: () => void;
  children: React.ReactNode;
}

export const RoleAccessGate: React.FC<RoleAccessGateProps> = ({
  requiredRole,
  currentSession,
  portalTitle,
  onOpenLogin,
  onReturnToHome,
  onOpenApplyAmbulance,
  children
}) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  // Section 8: Strict check - AMBULANCE_OPERATOR requires verificationStatus === 'APPROVED'
  const isAmbulanceCheck = allowedRoles.includes('AMBULANCE_OPERATOR');
  const isSuperAdmin = currentSession.role === 'SUPER_ADMIN';

  let isAuthorized = false;
  const isAuthenticated = Boolean(currentSession.id && currentSession.email);

  if (!isAuthenticated) {
    isAuthorized = false;
  } else if (isSuperAdmin) {
    isAuthorized = true;
  } else if (isAmbulanceCheck && currentSession.role === 'AMBULANCE_OPERATOR') {
    isAuthorized = currentSession.verificationStatus === 'APPROVED';
  } else {
    isAuthorized = allowedRoles.includes(currentSession.role);
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  const roleLabels = allowedRoles.map((r) => r.replace('_', ' ')).join(' or ');
  const isDoctorGate = allowedRoles.includes('DOCTOR');
  const isAdminGate = allowedRoles.includes('SUPER_ADMIN') || allowedRoles.includes('RESQ_ADMIN');
  const isAmbulanceGate = allowedRoles.includes('AMBULANCE_OPERATOR');

  const handleQuickGoogleAuth = async () => {
    setIsGoogleLoading(true);
    const targetRole = isDoctorGate ? 'DOCTOR' : isAmbulanceGate ? 'AMBULANCE_OPERATOR' : 'SUPER_ADMIN';
    await authService.loginWithGoogle(targetRole);
    setIsGoogleLoading(false);
  };

  // Dedicated notice if user has applied but is PENDING / UNDER_REVIEW / REJECTED / SUSPENDED
  const isPendingAmbulance = currentSession.role === 'AMBULANCE_OPERATOR' && currentSession.verificationStatus === 'PENDING';
  const isUnderReviewAmbulance = currentSession.role === 'AMBULANCE_OPERATOR' && currentSession.verificationStatus === 'UNDER_REVIEW';
  const isRejectedAmbulance = currentSession.role === 'AMBULANCE_OPERATOR' && currentSession.verificationStatus === 'REJECTED';
  const isSuspendedAmbulance = currentSession.role === 'AMBULANCE_OPERATOR' && currentSession.verificationStatus === 'SUSPENDED';

  return (
    <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 rounded-3xl bg-[#0E121B] border border-red-900/60 shadow-2xl text-center space-y-5 animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-2xl bg-red-600/20 text-[#FF2B44] border border-red-500/30 flex items-center justify-center mx-auto">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] font-mono font-bold tracking-widest text-red-400 uppercase bg-red-950/60 px-3 py-1 rounded-full border border-red-900/80">
          STRICT DATA ISOLATION & VERIFICATION ENFORCED
        </span>
        <h2 className="text-xl font-black text-white">{portalTitle} Access Restricted</h2>
        
        {isPendingAmbulance && (
          <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-800 text-xs text-amber-200 text-left space-y-1">
            <div className="font-bold text-amber-300">🟡 Application Status: PENDING REVIEW</div>
            <p className="text-[11px] leading-relaxed text-amber-200/90">
              Your application as an Ambulance Operator has been received and is currently waiting for central medical command review. Direct access to live CAD dispatch is restricted until credentials are fully authorized.
            </p>
          </div>
        )}

        {isUnderReviewAmbulance && (
          <div className="p-3.5 rounded-2xl bg-blue-950/60 border border-blue-800 text-xs text-blue-200 text-left space-y-1">
            <div className="font-bold text-blue-300">🔵 Application Status: UNDER REVIEW</div>
            <p className="text-[11px] leading-relaxed text-blue-200/90">
              Your application is under active review by the medical director. Please ensure any requested supplemental documents are submitted.
            </p>
          </div>
        )}

        {isRejectedAmbulance && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800 text-xs text-red-200 text-left space-y-1">
            <div className="font-bold text-red-300">🔴 Application Status: NOT APPROVED</div>
            <p className="text-[11px] leading-relaxed text-red-200/90">
              Your application was not approved. Please contact central administration if you believe this was an error.
            </p>
          </div>
        )}

        {isSuspendedAmbulance && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800 text-xs text-red-200 text-left space-y-1">
            <div className="font-bold text-red-300">⛔ Account Status: SUSPENDED</div>
            <p className="text-[11px] leading-relaxed text-red-200/90">
              This ambulance operator credential has been suspended. Operational dispatch access is blocked.
            </p>
          </div>
        )}

        {!isPendingAmbulance && !isUnderReviewAmbulance && !isRejectedAmbulance && !isSuspendedAmbulance && (
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
            You are currently logged in as <strong className="text-white">{currentSession.fullName}</strong> with role{' '}
            <strong className="text-red-400 font-mono">{currentSession.role}</strong>.
            <br />
            This portal requires <strong className="text-emerald-400">{roleLabels}</strong> with <strong className="text-emerald-400">APPROVED</strong> verification status.
          </p>
        )}
      </div>

      <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 text-left text-xs space-y-1 text-slate-400">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>Security & CAD Fleet Protocol:</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Only authenticated users with verified operator status can access live patient coordinates and ambulance operational CAD controls. Public patient signups cannot access ambulance dispatch.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 flex-wrap">
        <button
          onClick={onReturnToHome}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Emergency App</span>
        </button>

        {isAmbulanceGate && onOpenApplyAmbulance && (
          <button
            onClick={onOpenApplyAmbulance}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <span>Apply as Ambulance Operator →</span>
          </button>
        )}

        {(isDoctorGate || isAdminGate || isAmbulanceGate) && (
          <button
            onClick={handleQuickGoogleAuth}
            disabled={isGoogleLoading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <GoogleIcon />
            <span>Sign in with Google ({isDoctorGate ? 'Doctor' : isAmbulanceGate ? 'Ambulance' : 'Admin'})</span>
          </button>
        )}

        <button
          onClick={() => onOpenLogin(`Portal "${portalTitle}" requires ${roleLabels} access.`)}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#FF2B44] hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Switch to {roleLabels} Login</span>
        </button>
      </div>
    </div>
  );
};
