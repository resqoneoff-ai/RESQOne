import React, { useState } from 'react';
import {
  Ambulance,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  KeyRound,
  ShieldCheck,
  Building2,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { ResqLogo } from '../ResqLogo';
import { authService } from '../../services/authService';
import { ambulanceService } from '../../services/ambulanceService';
import { AppUserSession } from '../../types/roles';
import { AmbulanceApplicationModal } from '../ambulance/AmbulanceApplicationModal';

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

interface AmbulanceLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: AppUserSession) => void;
}

export const AmbulanceLoginModal: React.FC<AmbulanceLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  if (!isOpen) return null;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!email || !password) {
      setErrorMessage('Please enter your official email and password.');
      return;
    }

    setIsLoading(true);
    const result = await authService.login(email, password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
      return;
    }

    if (result.session) {
      if (result.session.verificationStatus && result.session.verificationStatus !== 'APPROVED') {
        setErrorMessage(
          `Your application status is ${result.session.verificationStatus}. Operational dispatch access requires APPROVED status by central command.`
        );
        return;
      }

      setSuccessNotice(`Authenticated as ${result.session.fullName}!`);
      setTimeout(() => {
        onLoginSuccess(result.session!);
        onClose();
      }, 500);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setSuccessNotice(null);
    setIsLoading(true);

    const result = await authService.loginWithGoogle('AMBULANCE_OPERATOR');
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Google authentication failed.');
      return;
    }

    if (result.session) {
      const isApproved =
        result.session.role === 'SUPER_ADMIN' ||
        (result.session.role === 'AMBULANCE_OPERATOR' &&
          result.session.verificationStatus === 'APPROVED');

      if (!isApproved) {
        setErrorMessage(
          result.error ||
            `Authenticated as ${result.session.email}, but operational CAD dispatch requires an APPROVED Ambulance Operator credential. Please apply below or contact central administration.`
        );
        return;
      }

      setSuccessNotice(`Signed in with Google as ${result.session.fullName}!`);
      setTimeout(() => {
        onLoginSuccess(result.session!);
        onClose();
      }, 500);
    }
  };

  const handleQuickFill = (presetEmail: string, pass: string) => {
    setEmail(presetEmail);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0D1017] border border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#121622] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Ambulance className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">
                Ambulance Portal Login
              </h2>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                OPERATIONAL FLEET GATEWAY
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-800/80 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Quick Preset Selector for Easy Testing */}
          <div className="p-3 rounded-2xl bg-black/50 border border-slate-800 text-[11px] space-y-2">
            <span className="text-slate-400 font-mono font-bold block">
              TESTING OPERATOR ACCOUNTS:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('marcus.paramedic@resqone.com', 'ParamedicSecure#2026')}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500 text-left transition-colors"
              >
                <div className="font-bold text-white truncate">Marcus Vance</div>
                <div className="text-[9px] text-emerald-400 font-mono">🟢 APPROVED ALS</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('elena.cross@resqone.org', 'EmtCross#2026')}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500 text-left transition-colors"
              >
                <div className="font-bold text-white truncate">Officer Elena Cross</div>
                <div className="text-[9px] text-amber-400 font-mono">🟡 PENDING EMT</div>
              </button>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-mono font-bold text-slate-300 mb-1">
                OPERATOR EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="marcus.paramedic@resqone.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono font-bold text-slate-300">
                  SECURE PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(!isForgotPasswordOpen)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold"
                >
                  FORGOT PASSWORD?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-500 text-white text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isForgotPasswordOpen && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                <p className="text-slate-300">
                  Password reset will be sent to: <strong className="text-white">{email || 'your email'}</strong>
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) {
                      setErrorMessage('Please enter your email above first.');
                      return;
                    }
                    await authService.sendPasswordReset(email);
                    setSuccessNotice(`Password reset instructions sent to ${email}`);
                    setIsForgotPasswordOpen(false);
                  }}
                  className="w-full py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                >
                  SEND RESET LINK
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>LOGIN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative px-3 bg-[#0D1017] text-[10px] font-mono text-slate-500 uppercase">
              OR CONTINUE WITH GOOGLE
            </span>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleLogin}
            className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500 text-xs font-bold text-white flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer"
          >
            <GoogleIcon />
            <span>CONTINUE WITH GOOGLE</span>
          </button>

          {/* Application Onboarding CTA */}
          <div className="pt-3 border-t border-slate-800 text-center space-y-1">
            <span className="text-xs text-slate-400 block">Not yet registered as an ambulance operator?</span>
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(true)}
              className="text-xs font-black text-amber-400 hover:text-amber-300 underline decoration-amber-500/50 hover:decoration-amber-300 transition-colors cursor-pointer"
            >
              Apply as Ambulance Operator →
            </button>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <AmbulanceApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        initialEmail={email}
      />
    </div>
  );
};
