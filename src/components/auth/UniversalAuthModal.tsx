import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Phone,
  HeartPulse,
  Droplet,
  Activity,
  Building2,
  Stethoscope,
  Ambulance,
  Zap,
  Shield,
  FileText,
  CreditCard,
  Sparkles,
  Info
} from 'lucide-react';
import { ResqLogo } from '../ResqLogo';
import { authService } from '../../services/authService';
import { AppUserSession } from '../../types/roles';
import { UserEmergencyProfile } from '../../types/emergency';
import { DoctorOnboardingModal } from '../DoctorOnboardingModal';

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

interface UniversalAuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onAuthSuccess: (session: AppUserSession, medicalProfile?: UserEmergencyProfile) => void;
  initialMode?: 'LOGIN' | 'SIGNUP';
  enforceModal?: boolean;
}

interface SliderFeature {
  id: string;
  category: 'OFFERS' | 'STEPS';
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  statOrStep: string;
  icon: React.ReactNode;
  bgGradient: string;
}

const SLIDES: SliderFeature[] = [
  {
    id: 'dispatch',
    category: 'OFFERS',
    badge: 'RAPID DISPATCH',
    badgeColor: 'bg-red-950/80 border-red-800 text-red-300',
    title: '1-Touch CAD Ambulance Dispatch',
    description: 'Bypasses 911 telephone queues. One tap auto-locks your exact live GPS coordinates and dispatches the nearest Advanced Life Support (ALS) mobile intensive care unit in under 4 minutes.',
    statOrStep: '⚡ < 4 Min Average CAD Response Time',
    icon: <Ambulance className="w-6 h-6 text-red-400" />,
    bgGradient: 'from-red-950/50 via-slate-900 to-black/80'
  },
  {
    id: 'physician',
    category: 'OFFERS',
    badge: 'LIVE TELEMETRY',
    badgeColor: 'bg-blue-950/80 border-blue-800 text-blue-300',
    title: '24/7 ER Physician Live Telemetry',
    description: 'Direct audio/video connection to board-certified emergency doctors while the ambulance navigates to your location for real-time stabilization directions and CPR guidance.',
    statOrStep: '🩺 100% Attending Physician Telemetry Link',
    icon: <Stethoscope className="w-6 h-6 text-blue-400" />,
    bgGradient: 'from-blue-950/50 via-slate-900 to-black/80'
  },
  {
    id: 'hospital',
    category: 'OFFERS',
    badge: 'TRAUMA PRE-NOTIFICATION',
    badgeColor: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
    title: 'Pre-Notified Hospital Trauma Bays',
    description: 'Receiving trauma centers are notified and surgical teams prepped before the ambulance even reaches the hospital, eliminating intake bay delays for cardiac and trauma events.',
    statOrStep: '🏥 Zero Arrival Triage Wait Time',
    icon: <Building2 className="w-6 h-6 text-emerald-400" />,
    bgGradient: 'from-emerald-950/50 via-slate-900 to-black/80'
  },
  {
    id: 'passport',
    category: 'OFFERS',
    badge: 'ENCRYPTED PASSPORT',
    badgeColor: 'bg-purple-950/80 border-purple-800 text-purple-300',
    title: 'Encrypted Emergency Medical Passport',
    description: 'Your blood group, critical drug allergies, chronic conditions, and insurance automatically attach to CAD dispatch so first responders never treat blind.',
    statOrStep: '🛡️ 100% HIPAA-Compliant Data Isolation',
    icon: <ShieldCheck className="w-6 h-6 text-purple-400" />,
    bgGradient: 'from-purple-950/50 via-slate-900 to-black/80'
  },
  {
    id: 'how-it-works',
    category: 'STEPS',
    badge: 'QUICK ONBOARDING',
    badgeColor: 'bg-amber-950/80 border-amber-800 text-amber-300',
    title: '3 Simple Steps to Lifelong Protection',
    description: '1. Create your account and enter your vital medical information.\n2. Verify your email to activate end-to-end encrypted passport protection.\n3. In any medical crisis, tap Emergency SOS for zero-delay rapid dispatch.',
    statOrStep: '🚀 Quick 60-Second Setup',
    icon: <Sparkles className="w-6 h-6 text-amber-400" />,
    bgGradient: 'from-amber-950/50 via-slate-900 to-black/80'
  }
];

const BLOOD_GROUPS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Unknown'];
const COMMON_ALLERGIES = ['Penicillin', 'Sulfa Drugs', 'Latex', 'Aspirin / NSAIDs', 'Peanuts / Nuts', 'None / NKDA'];
const COMMON_CONDITIONS = ['Asthma', 'Hypertension', 'Diabetes (Type 1/2)', 'Cardiac Condition', 'Epilepsy / Seizures', 'None'];

export const UniversalAuthModal: React.FC<UniversalAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'LOGIN',
  enforceModal = false
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'VERIFY_NOTICE'>(initialMode);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSliderHovered, setIsSliderHovered] = useState(false);

  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Signup Multi-Step Form States
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState<number>(32);
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [customCondition, setCustomCondition] = useState('');
  const [medications, setMedications] = useState('');
  const [medicalHistoryNotes, setMedicalHistoryNotes] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('Spouse');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('Comprehensive Health Plan');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState('');
  const [preferredHospital, setPreferredHospital] = useState('Metro Health Comprehensive Trauma Center');
  const [isDoctorOnboardingOpen, setIsDoctorOnboardingOpen] = useState(false);

  // Auto-advance slider
  useEffect(() => {
    if (!isOpen || isSliderHovered) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isOpen, isSliderHovered]);

  if (!isOpen) return null;

  const resetFormState = () => {
    setErrorMessage(null);
    setSuccessNotice(null);
    setIsLoading(false);
  };

  const handleGoogleLogin = async (role: 'DOCTOR' | 'SUPER_ADMIN' | 'PATIENT') => {
    resetFormState();
    setIsLoading(true);

    const enteredEmail = email.trim() || 'resqone.off@gmail.com';
    const result = await authService.loginWithGoogle(role, enteredEmail);
    setIsLoading(false);

    if (!result.success) {
      if (result.isNewPatientBlocked) {
        setErrorMessage(
          result.error ||
            'Google login is only available for patients who already created an account. New patients must first complete medical registration.'
        );
      } else {
        setErrorMessage(result.error || 'Google authentication failed.');
      }
      return;
    }

    if (result.session) {
      setSuccessNotice(`Signed in with Google as ${result.session.fullName}!`);
      setTimeout(() => {
        onAuthSuccess(result.session!, result.medicalProfile);
        if (onClose) onClose();
      }, 500);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    const result = await authService.login(email, password);
    setIsLoading(false);

    if (!result.success) {
      if (result.requiresEmailVerification) {
        setMode('VERIFY_NOTICE');
      } else {
        setErrorMessage(result.error || 'Invalid email or password.');
      }
      return;
    }

    if (result.session) {
      onAuthSuccess(result.session);
      if (onClose) onClose();
    }
  };

  const handleToggleAllergy = (allergy: string) => {
    if (allergy === 'None / NKDA') {
      setSelectedAllergies(['None / NKDA']);
      return;
    }
    const filtered = selectedAllergies.filter((a) => a !== 'None / NKDA');
    if (filtered.includes(allergy)) {
      setSelectedAllergies(filtered.filter((a) => a !== allergy));
    } else {
      setSelectedAllergies([...filtered, allergy]);
    }
  };

  const handleToggleCondition = (cond: string) => {
    if (cond === 'None') {
      setSelectedConditions(['None']);
      return;
    }
    const filtered = selectedConditions.filter((c) => c !== 'None');
    if (filtered.includes(cond)) {
      setSelectedConditions(filtered.filter((c) => c !== cond));
    } else {
      setSelectedConditions([...filtered, cond]);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMessage('Please complete all required account fields.');
      setSignupStep(1);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password.');
      setSignupStep(1);
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      setSignupStep(1);
      return;
    }

    // Compile allergies
    const allAllergies = [...selectedAllergies];
    if (customAllergy.trim() && !allAllergies.includes(customAllergy.trim())) {
      allAllergies.push(customAllergy.trim());
    }

    // Compile conditions
    const allConditions = [...selectedConditions];
    if (customCondition.trim() && !allConditions.includes(customCondition.trim())) {
      allConditions.push(customCondition.trim());
    }

    // Build the medical profile
    const medicalProfile: UserEmergencyProfile = {
      id: `usr-${Date.now()}`,
      fullName: fullName.trim(),
      age: Number(age) || 30,
      phone: phone.trim() || '+1 (555) 019-2000',
      bloodGroup: bloodGroup || 'O+',
      allergies: allAllergies.length > 0 ? allAllergies : ['NKDA'],
      medicalConditions: allConditions.length > 0 ? allConditions : [],
      medications: medications.trim() ? medications.split(',').map((m) => m.trim()) : [],
      medicalHistory: medicalHistoryNotes.trim() ? [medicalHistoryNotes.trim()] : [],
      preferredHospitals: [
        {
          name: preferredHospital || 'Metro Health Comprehensive Trauma Center',
          distance: '2.4 miles',
          traumaLevel: 'Level 1 Trauma'
        }
      ],
      insuranceInfo: {
        provider: insuranceProvider.trim() || 'Comprehensive Healthcare Plan',
        policyNumber: insurancePolicyNumber.trim() || `POL-${Math.floor(100000 + Math.random() * 900000)}`,
        groupNumber: 'GRP-9941',
        validThru: '12/2028',
        verified: true
      },
      affordabilityPreference: 'Standard / In-Network',
      emergencyContacts: [
        {
          name: emergencyContactName.trim() || 'Primary Emergency Contact',
          relation: emergencyContactRelation || 'Family Member',
          phone: emergencyContactPhone.trim() || '+1 (555) 019-9111',
          isPrimary: true
        }
      ],
      authorizationStatus: 'Full Authorized'
    };

    setIsLoading(true);
    const result = await authService.register(fullName, email, password, medicalProfile);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Registration could not be completed.');
      return;
    }

    if (result.requiresEmailVerification) {
      setMode('VERIFY_NOTICE');
    } else {
      setSuccessNotice('Account created with full Medical Passport! Redirecting...');
      setTimeout(() => {
        const session = authService.getSession();
        onAuthSuccess(session, medicalProfile);
        if (onClose) onClose();
      }, 1000);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetFormState();

    if (!email) {
      setErrorMessage('Please enter your account email address.');
      return;
    }

    setIsLoading(true);
    const result = await authService.sendPasswordReset(email);
    setIsLoading(false);

    if (result.success) {
      setSuccessNotice(`Password reset instructions have been sent to ${email}.`);
    } else {
      setErrorMessage(result.error || 'Unable to process reset request.');
    }
  };

  const currentSlide = SLIDES[activeSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#0D1017] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header & Attractive One-Liner Bar */}
        <div className="px-5 py-3.5 bg-[#121622] border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ResqLogo variant="compact" />
          </div>

          {/* Clean Attraction One-Liner on the Header */}
          <div className="hidden sm:block text-xs font-semibold text-red-200 bg-red-950/60 border border-red-800/60 px-3.5 py-1.5 rounded-full truncate max-w-md">
            ⚡ Seconds save lives. Complete your account to link your medical passport to 1-touch dispatch.
          </div>

          {!enforceModal && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Main Split Grid: Left Slider + Right Auth Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1">
          {/* LEFT COLUMN: Feature & How-to-Login Slider (5 cols on lg) */}
          <div
            className="lg:col-span-5 bg-gradient-to-b from-[#10141F] to-[#0A0D14] border-b lg:border-b-0 lg:border-r border-slate-800/80 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden"
            onMouseEnter={() => setIsSliderHovered(true)}
            onMouseLeave={() => setIsSliderHovered(false)}
          >
            {/* Background ambient glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Slider Content */}
            <div className="space-y-4 relative z-10">
              {/* Active Slide Card */}
              <div
                key={currentSlide.id}
                className={`p-5 rounded-2xl bg-gradient-to-br ${currentSlide.bgGradient} border border-slate-700/60 shadow-xl space-y-3.5 transition-all duration-300 animate-in fade-in zoom-in-95`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${currentSlide.badgeColor}`}>
                    {currentSlide.badge}
                  </span>
                  <div className="p-2 rounded-xl bg-black/50 border border-white/10">
                    {currentSlide.icon}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    {currentSlide.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                    {currentSlide.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-white">
                    {currentSlide.statOrStep}
                  </span>
                </div>
              </div>
            </div>

            {/* Slider Navigation & Trust Metrics */}
            <div className="pt-6 space-y-4 relative z-10">
              {/* Prev / Next & Indicators */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => setActiveSlide(idx)}
                      className={`h-2 rounded-full transition-all ${
                        activeSlide === idx ? 'w-6 bg-red-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
                    className="p-1.5 rounded-lg bg-black/60 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition-all cursor-pointer"
                    aria-label="Previous slide"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSlide((prev) => (prev + 1) % SLIDES.length)}
                    className="p-1.5 rounded-lg bg-black/60 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white transition-all cursor-pointer"
                    aria-label="Next slide"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>256-Bit Encrypted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Zero Dispatch Delay</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Authentication & Medical Account Creation (7 cols on lg) */}
          <div className="lg:col-span-7 p-6 sm:p-7 flex flex-col justify-between">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1 p-1 bg-black/50 border border-slate-800 rounded-xl w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => {
                    resetFormState();
                    setMode('LOGIN');
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'LOGIN'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  LOGIN
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetFormState();
                    setMode('SIGNUP');
                    setSignupStep(1);
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'SIGNUP'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  CREATE ACCOUNT
                </button>
              </div>

              {mode === 'SIGNUP' && (
                <span className="text-[11px] font-mono text-red-400 font-bold hidden sm:inline-block">
                  Step {signupStep} of 3
                </span>
              )}
            </div>

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-800 text-xs text-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successNotice && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successNotice}</span>
              </div>
            )}

            {/* VIEW 1: UNIVERSAL LOGIN */}
            {mode === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Sign In to RESQ ONE</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Universal access for Patients, Emergency Clinicians, Paramedic Fleets & Incident Commanders.
                  </p>
                </div>

                {/* Email Field */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="e.g. yourname@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2B44] transition-colors"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        resetFormState();
                        setMode('FORGOT_PASSWORD');
                      }}
                      className="text-[11px] font-semibold text-[#FF2B44] hover:underline"
                    >
                      FORGOT PASSWORD?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF2B44] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs tracking-wider uppercase shadow-[0_0_20px_rgba(255,43,68,0.35)] flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  {isLoading ? <span>Signing In...</span> : <><KeyRound className="w-4 h-4" /><span>LOGIN</span></>}
                </button>

                {/* Google Authentication Section */}
                <div className="pt-2 space-y-2.5">
                  <div className="relative my-3 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-800" />
                    </div>
                    <span className="relative px-3 bg-[#0D1017] text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">
                      OR SIGN IN WITH GOOGLE
                    </span>
                  </div>

                  {/* Doctor & Admin Google Sign-in Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Doctor Google Auth */}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleGoogleLogin('DOCTOR')}
                      className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-600/80 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GoogleIcon />
                        <span className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">
                          Doctor Sign-In
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0">
                        TELEMETRY
                      </span>
                    </button>

                    {/* Admin Google Auth */}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleGoogleLogin('SUPER_ADMIN')}
                      className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-600/80 text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GoogleIcon />
                        <span className="text-xs font-bold text-white group-hover:text-blue-300 truncate">
                          Admin Sign-In
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 shrink-0">
                        COMMAND
                      </span>
                    </button>
                  </div>

                  {/* Registered Patient Google Auth */}
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleGoogleLogin('PATIENT')}
                    className="w-full p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-700 hover:border-red-600/80 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                  >
                    <GoogleIcon />
                    <span>Sign in with Google (Registered Patients Only)</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center leading-normal px-2">
                    🔒 Google login is enabled for patients who already created an account. New patients must complete registration to record emergency medical vitals.
                  </p>
                </div>

                {/* Doctor Onboarding Request Link */}
                <div className="pt-3 pb-1 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Are you a Doctor / Specialist?</span>
                  <button
                    type="button"
                    onClick={() => setIsDoctorOnboardingOpen(true)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors cursor-pointer"
                  >
                    Apply for Network Onboarding →
                  </button>
                </div>

                <div className="pt-2 text-center border-t border-slate-800">
                  <span className="text-xs text-slate-400">New to RESQ ONE? </span>
                  <button
                    type="button"
                    onClick={() => {
                      resetFormState();
                      setMode('SIGNUP');
                      setSignupStep(1);
                    }}
                    className="text-xs font-bold text-white hover:text-red-400 transition-colors ml-1 cursor-pointer"
                  >
                    CREATE ACCOUNT & SET MEDICAL PASSPORT →
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 2: ACCOUNT CREATION WITH FULL MEDICAL PASSPORT */}
            {mode === 'SIGNUP' && (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-white tracking-tight">Create Patient Account</h2>
                    <span className="text-[11px] font-mono text-slate-400">
                      Step {signupStep} of 3
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {signupStep === 1 && 'Step 1: Account credentials and contact coordinates.'}
                    {signupStep === 2 && 'Step 2: Critical medical records and baseline emergency vitals.'}
                    {signupStep === 3 && 'Step 3: Primary emergency contact, hospital, and insurance.'}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-red-500 h-full transition-all duration-300"
                    style={{ width: `${(signupStep / 3) * 100}%` }}
                  />
                </div>

                {/* STEP 1: Account Credentials */}
                {signupStep === 1 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-300">Full Legal Name *</label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sarah Jenkins"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-300">Phone Number *</label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type="tel"
                            required
                            placeholder="+1 (555) 000-0000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300">Email Address *</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. sarah.jenkins@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-300">Password *</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Min. 6 chars"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-300">Confirm Password *</label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (!fullName || !email || !password) {
                            setErrorMessage('Please enter your full name, email, and password.');
                            return;
                          }
                          if (password !== confirmPassword) {
                            setErrorMessage('Passwords do not match.');
                            return;
                          }
                          setErrorMessage(null);
                          setSignupStep(2);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Continue to Medical Profile</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: Critical Medical Profile */}
                {signupStep === 2 && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Blood Group */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-300 flex items-center gap-1">
                          <Droplet className="w-3.5 h-3.5 text-red-400" />
                          <span>Blood Group *</span>
                        </label>
                        <select
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-500"
                        >
                          {BLOOD_GROUPS.map((bg) => (
                            <option key={bg} value={bg} className="bg-slate-900 text-white">
                              {bg}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Age */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-300">Age / Years *</label>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={age}
                          onChange={(e) => setAge(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    {/* Critical Allergies */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5 text-amber-400" />
                          <span>Known Allergies (Select all that apply)</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Critical for EMS Medication</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {COMMON_ALLERGIES.map((allergy) => {
                          const isSel = selectedAllergies.includes(allergy);
                          return (
                            <button
                              key={allergy}
                              type="button"
                              onClick={() => handleToggleAllergy(allergy)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                isSel
                                  ? 'bg-amber-600 text-white font-bold'
                                  : 'bg-black/60 border border-slate-700 text-slate-300 hover:text-white'
                              }`}
                            >
                              {allergy}
                            </button>
                          );
                        })}
                      </div>
                      <input
                        type="text"
                        placeholder="Other custom allergies (e.g. Iodine, Contrast dye, Shellfish)"
                        value={customAllergy}
                        onChange={(e) => setCustomAllergy(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Chronic Medical Conditions */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300 flex items-center gap-1">
                        <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                        <span>Pre-Existing Conditions & Chronic Illness</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {COMMON_CONDITIONS.map((cond) => {
                          const isSel = selectedConditions.includes(cond);
                          return (
                            <button
                              key={cond}
                              type="button"
                              onClick={() => handleToggleCondition(cond)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                isSel
                                  ? 'bg-rose-600 text-white font-bold'
                                  : 'bg-black/60 border border-slate-700 text-slate-300 hover:text-white'
                              }`}
                            >
                              {cond}
                            </button>
                          );
                        })}
                      </div>
                      <input
                        type="text"
                        placeholder="Other chronic conditions (e.g. Atrial Fibrillation, COPD, Renal)"
                        value={customCondition}
                        onChange={(e) => setCustomCondition(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    {/* Current Daily Medications */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300">Daily Medications & Dosages</label>
                      <input
                        type="text"
                        placeholder="e.g. Lisinopril 10mg, Metformin 500mg, Aspirin 81mg"
                        value={medications}
                        onChange={(e) => setMedications(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setSignupStep(1)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage(null);
                          setSignupStep(3);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Continue to Contacts & Hospital</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Emergency Contacts, Insurance & Hospital */}
                {signupStep === 3 && (
                  <div className="space-y-3">
                    {/* Emergency Contact */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                        Primary Emergency Contact
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Contact Name *"
                          value={emergencyContactName}
                          onChange={(e) => setEmergencyContactName(e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                        <select
                          value={emergencyContactRelation}
                          onChange={(e) => setEmergencyContactRelation(e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-500"
                        >
                          <option value="Spouse">Spouse</option>
                          <option value="Parent">Parent</option>
                          <option value="Child">Child</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Friend">Friend</option>
                          <option value="Relative">Other Relative</option>
                        </select>
                        <input
                          type="tel"
                          required
                          placeholder="Contact Phone *"
                          value={emergencyContactPhone}
                          onChange={(e) => setEmergencyContactPhone(e.target.value)}
                          className="px-3 py-1.5 rounded-lg bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    {/* Insurance Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-300 flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                          <span>Insurance Provider</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Anthem Blue Cross, Kaiser, Medicare"
                          value={insuranceProvider}
                          onChange={(e) => setInsuranceProvider(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-300">Policy / Member ID</label>
                        <input
                          type="text"
                          placeholder="e.g. XEA-89210-994"
                          value={insurancePolicyNumber}
                          onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>

                    {/* Preferred Trauma Center */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Preferred Emergency Trauma Facility</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Metro Health Comprehensive Trauma Center"
                        value={preferredHospital}
                        onChange={(e) => setPreferredHospital(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* Medical History Note */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-300 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-purple-400" />
                        <span>Past Surgeries / Medical Alerts (Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Coronary stent placed in 2022, Pacemaker, Organ donor"
                        value={medicalHistoryNotes}
                        onChange={(e) => setMedicalHistoryNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    {/* HIPAA Consent & Submit */}
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-[11px] text-slate-300 flex items-start gap-2">
                      <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        Your emergency health data is isolated and encrypted. It is shared strictly with dispatchers and attending physicians when you activate Emergency SOS.
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setSignupStep(2)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 disabled:opacity-50 text-white font-black text-xs tracking-wider uppercase shadow-[0_0_25px_rgba(255,43,68,0.4)] flex items-center gap-2 cursor-pointer"
                      >
                        {isLoading ? (
                          <span>Activating Account...</span>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>CREATE ACCOUNT & ACTIVATE PASSPORT</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-2 text-center border-t border-slate-800">
                  <span className="text-xs text-slate-400">Already registered? </span>
                  <button
                    type="button"
                    onClick={() => {
                      resetFormState();
                      setMode('LOGIN');
                    }}
                    className="text-xs font-bold text-white hover:text-red-400 transition-colors ml-1 cursor-pointer"
                  >
                    SIGN IN
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 3: FORGOT PASSWORD */}
            {mode === 'FORGOT_PASSWORD' && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Reset Password</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter your registered email address and we will dispatch a secure recovery link.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Account Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? <span>Processing...</span> : <span>SEND RESET LINK</span>}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetFormState();
                      setMode('LOGIN');
                    }}
                    className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Login</span>
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 4: EMAIL VERIFICATION REQUIRED NOTICE */}
            {mode === 'VERIFY_NOTICE' && (
              <div className="space-y-4 text-center py-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-600/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
                  <Mail className="w-7 h-7" />
                </div>

                <div className="space-y-1">
                  <h2 className="text-xl font-black text-white">Email Verification Required</h2>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                    A confirmation link has been sent to <strong className="text-white">{email}</strong>. Please verify your email before continuing to activate your emergency dispatch passport.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Unverified accounts cannot initiate emergency telemedicine.</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    resetFormState();
                    setMode('LOGIN');
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Onboarding Application Modal */}
      <DoctorOnboardingModal
        isOpen={isDoctorOnboardingOpen}
        onClose={() => setIsDoctorOnboardingOpen(false)}
        onSuccess={() => {
          setSuccessNotice('Doctor onboarding application submitted for review!');
        }}
      />
    </div>
  );
};
