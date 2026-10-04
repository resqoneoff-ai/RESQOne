import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  User,
  Users,
  UserPlus,
  Ambulance,
  Stethoscope,
  Building2,
  FileCheck2,
  ShieldCheck,
  Zap,
  KeyRound,
  ArrowRight,
  Droplet,
  Radio,
  Lock
} from 'lucide-react';
import { ResqLogo } from '../ResqLogo';

interface PublicLandingScreenProps {
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  onOpenDoctorOnboarding?: () => void;
}

interface SlideItem {
  id: number;
  tag: string;
  headline: string;
  supportingText: string;
  ctaText: string;
  visual: React.ReactNode;
}

export const PublicLandingScreen: React.FC<PublicLandingScreenProps> = ({
  onOpenLogin,
  onOpenSignUp,
  onOpenDoctorOnboarding
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const totalSlides = 6;

  const slides: SlideItem[] = [
    // SLIDE 1: WHAT IS RESQ ONE?
    {
      id: 1,
      tag: 'RESQ ONE PLATFORM',
      headline: 'Emergency Help. One Place.',
      supportingText:
        'RESQ ONE connects emergency requests with the right response, from ambulance coordination to doctor and hospital handover.',
      ctaText: 'NEXT',
      visual: (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Ambient Pulse Ring */}
            <div className="absolute inset-0 rounded-full bg-red-600/10 border border-red-500/20 animate-ping" />
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-red-950/60 to-black/80 border border-red-600/30 shadow-2xl flex items-center justify-center" />

            {/* Central Node */}
            <div className="relative z-10 w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(255,43,68,0.6)] text-white">
              <HeartPulse className="w-9 h-9 animate-pulse" />
            </div>

            {/* Orbital Satellite Badges */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-[#121622] border border-slate-700 text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1 shadow-lg">
              <Ambulance className="w-3 h-3 text-red-400" />
              <span>ALS Fleet</span>
            </div>
            <div className="absolute bottom-1 -left-2 px-2.5 py-1 rounded-full bg-[#121622] border border-slate-700 text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1 shadow-lg">
              <Stethoscope className="w-3 h-3 text-blue-400" />
              <span>ER Doctor</span>
            </div>
            <div className="absolute bottom-1 -right-2 px-2.5 py-1 rounded-full bg-[#121622] border border-slate-700 text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1 shadow-lg">
              <Building2 className="w-3 h-3 text-emerald-400" />
              <span>Trauma Bay</span>
            </div>
          </div>
          <span className="mt-3 text-[11px] font-mono text-slate-400 font-semibold tracking-wider">
            UNIFIED CAD EMERGENCY DISPATCH NETWORK
          </span>
        </div>
      )
    },

    // SLIDE 2: ONE CLICK SOS
    {
      id: 2,
      tag: 'INSTANT ACTIVATION',
      headline: 'One Click to Start.',
      supportingText: 'Start an emergency request when you or someone else needs urgent help.',
      ctaText: 'NEXT',
      visual: (
        <div className="flex flex-col items-center justify-center p-6 text-center">
          {/* Non-interactive Mockup of the SOS button */}
          <div className="relative group">
            <div className="absolute -inset-3 rounded-full bg-red-600/20 blur-xl animate-pulse" />
            <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-[#FF2B44] via-red-600 to-[#8A0716] border-2 border-white/25 flex flex-col items-center justify-center text-white shadow-[0_0_40px_rgba(255,43,68,0.5)]">
              <HeartPulse className="w-7 h-7 text-white mb-1 animate-pulse" />
              <span className="text-sm font-black tracking-tight leading-tight">EMERGENCY</span>
              <span className="text-sm font-black tracking-tight leading-tight text-white/90">HELP</span>
              <span className="text-[8px] font-mono tracking-widest text-red-200 mt-1 uppercase bg-black/30 px-2 py-0.5 rounded-full">
                CONCEPT
              </span>
            </div>
          </div>
          <span className="mt-4 text-[11px] font-mono text-slate-400">
            One tap immediately coordinates GPS and first responder dispatch.
          </span>
        </div>
      )
    },

    // SLIDE 3: HELP FOR ANYONE
    {
      id: 3,
      tag: 'MULTI-RECIPIENT TRIAGE',
      headline: 'Help Anyone. Not Just Yourself.',
      supportingText:
        'Start an emergency for yourself, a family member, or someone else who needs help.',
      ctaText: 'NEXT',
      visual: (
        <div className="w-full max-w-md mx-auto p-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Visual Card 1: ME */}
          <div className="w-full sm:w-1/3 p-3.5 rounded-2xl bg-gradient-to-b from-[#1C1318] to-[#121620] border border-red-900/60 flex flex-col items-center text-center shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-red-600/20 text-[#FF2B44] flex items-center justify-center mb-1.5">
              <User className="w-5 h-5" />
            </div>
            <strong className="text-xs font-black text-white">[ ME ]</strong>
            <span className="text-[10px] text-slate-400 mt-0.5">Your Passport</span>
          </div>

          {/* Visual Card 2: FAMILY */}
          <div className="w-full sm:w-1/3 p-3.5 rounded-2xl bg-gradient-to-b from-[#101726] to-[#121620] border border-blue-900/60 flex flex-col items-center text-center shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-1.5">
              <Users className="w-5 h-5" />
            </div>
            <strong className="text-xs font-black text-white">[ FAMILY ]</strong>
            <span className="text-[10px] text-slate-400 mt-0.5">Linked Profiles</span>
          </div>

          {/* Visual Card 3: FRIEND / OTHER */}
          <div className="w-full sm:w-1/3 p-3.5 rounded-2xl bg-gradient-to-b from-[#1A1610] to-[#121620] border border-amber-900/60 flex flex-col items-center text-center shadow-lg">
            <div className="w-9 h-9 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-1.5">
              <UserPlus className="w-5 h-5" />
            </div>
            <strong className="text-xs font-black text-white">[ FRIEND / OTHER ]</strong>
            <span className="text-[10px] text-slate-400 mt-0.5">Bystander SOS</span>
          </div>
        </div>
      )
    },

    // SLIDE 4: FROM SOS TO CARE
    {
      id: 4,
      tag: 'END-TO-END JOURNEY',
      headline: 'From Emergency to Handover.',
      supportingText: 'Track the response as your case moves through the emergency-care journey.',
      ctaText: 'NEXT',
      visual: (
        <div className="w-full max-w-lg mx-auto p-4">
          {/* Simple Horizontal Emergency Journey Sequence */}
          <div className="grid grid-cols-6 gap-1.5 items-center text-center">
            {/* 1. SOS */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/40 text-[#FF2B44] flex items-center justify-center text-xs font-bold">
                <Radio className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-mono font-bold text-white mt-1.5">SOS</span>
            </div>

            {/* 2. TRIAGE */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">
                <HeartPulse className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-300 mt-1.5">TRIAGE</span>
            </div>

            {/* 3. AMBULANCE */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">
                <Ambulance className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-300 mt-1.5">ALS UNIT</span>
            </div>

            {/* 4. DOCTOR */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">
                <Stethoscope className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-300 mt-1.5">DOCTOR</span>
            </div>

            {/* 5. HOSPITAL */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">
                <Building2 className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-300 mt-1.5">HOSPITAL</span>
            </div>

            {/* 6. HANDOVER */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold">
                <FileCheck2 className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-[9px] font-mono font-bold text-slate-300 mt-1.5">HANDOVER</span>
            </div>
          </div>
          <div className="mt-3 text-center">
            <span className="text-[10px] font-mono text-slate-400">
              Live status progression and physician video telemetry throughout transit.
            </span>
          </div>
        </div>
      )
    },

    // SLIDE 5: YOUR EMERGENCY PROFILE
    {
      id: 5,
      tag: 'HEALTH PASSPORT',
      headline: 'Keep Critical Information Ready.',
      supportingText:
        'Store authorized emergency information such as blood group, allergies, medications, and emergency contacts so responders have what they need immediately.',
      ctaText: 'NEXT',
      visual: (
        <div className="w-full max-w-sm mx-auto p-4 rounded-2xl bg-black/60 border border-slate-800 shadow-xl space-y-2.5 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">Emergency Medical Passport</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
              VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">Blood Group</span>
              <strong className="text-white font-mono flex items-center gap-1 mt-0.5">
                <Droplet className="w-3 h-3 text-red-400" />
                <span>O Positive (O+)</span>
              </strong>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
              <span className="text-slate-400 text-[10px] block">Known Allergies</span>
              <strong className="text-white truncate block mt-0.5">Penicillin (NKDA)</strong>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px]">
            <span className="text-slate-400 text-[10px] block">Attending Hospital Routing</span>
            <strong className="text-white block mt-0.5">Metro Health Comprehensive Trauma Center</strong>
          </div>
        </div>
      )
    },

    // SLIDE 6: READY WHEN SECONDS COUNT
    {
      id: 6,
      tag: 'PROTECTION STANDBY',
      headline: 'Ready When Seconds Count.',
      supportingText:
        'Create your free account today and link your emergency health passport for immediate protection.',
      ctaText: 'CREATE ACCOUNT',
      visual: (
        <div className="flex flex-col items-center justify-center p-5 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-[0_0_35px_rgba(255,43,68,0.5)]">
            <ShieldCheck className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <span className="text-sm font-black text-white">Full Protection Ready</span>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Join thousands protected by RESQ ONE direct emergency dispatch.
            </p>
          </div>
        </div>
      )
    }
  ];

  // Auto-slide effect with reduced motion support
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused, totalSlides]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 45) {
      // Swiped Left -> Next
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    } else if (diff < -45) {
      // Swiped Right -> Prev
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    }
    touchStartX.current = null;
  };

  const activeSlideData = slides[currentSlide];

  const handleNextClick = () => {
    if (currentSlide === totalSlides - 1) {
      onOpenSignUp();
    } else {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between px-4 sm:px-6 py-8 sm:py-12 max-w-4xl w-full mx-auto select-none min-h-[90vh]">
      {/* 1. TOP / HERO AREA: Prominently centered existing RESQ ONE Logo */}
      <div className="flex flex-col items-center text-center space-y-3 pt-2 sm:pt-4">
        {/* Actual Existing RESQ ONE Logo (Pipeline hidden for clean breathing room) */}
        <ResqLogo variant="hero" showPipeline={false} />

        {/* Supporting short brand statement */}
        <p className="text-xs sm:text-sm font-medium text-slate-400 max-w-md mx-auto leading-relaxed">
          Emergency coordination for you and the people who matter.
        </p>
      </div>

      {/* 2. FEATURE SLIDER (Swipeable Onboarding Carousel) */}
      <div
        className="w-full max-w-2xl my-6 sm:my-8 relative"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* The Card Container */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#10141F] to-[#0A0D14] border border-slate-800 shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden p-6 sm:p-8 flex flex-col justify-between min-h-[360px] sm:min-h-[380px] transition-all duration-300">
          {/* Top Tag & Slide Counter */}
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800/80 text-red-300 uppercase tracking-wider">
              {activeSlideData.tag}
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {currentSlide + 1} / {totalSlides}
            </span>
          </div>

          {/* Visual Showcase Zone */}
          <div className="flex-1 flex items-center justify-center my-2">
            {activeSlideData.visual}
          </div>

          {/* Headline & Text Zone */}
          <div className="text-center space-y-1.5 mt-2">
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {activeSlideData.headline}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              {activeSlideData.supportingText}
            </p>
          </div>

          {/* Slide CTA Button */}
          <div className="mt-5 flex items-center justify-center">
            <button
              type="button"
              onClick={handleNextClick}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              <span>{activeSlideData.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel Navigation Arrows on Desktop */}
        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)}
          className="hidden sm:flex absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white items-center justify-center shadow-lg transition-all cursor-pointer active:scale-90"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % totalSlides)}
          className="hidden sm:flex absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white items-center justify-center shadow-lg transition-all cursor-pointer active:scale-90"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentSlide === idx ? 'w-7 bg-[#FF2B44]' : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 3. BOTTOM ACTIONS: [ LOGIN ] and [ CREATE ACCOUNT ] */}
      <div className="w-full max-w-md mx-auto space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          {/* LOGIN CTA */}
          <button
            type="button"
            onClick={onOpenLogin}
            className="w-full sm:w-1/2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(255,43,68,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <KeyRound className="w-4 h-4" />
            <span>LOGIN</span>
          </button>

          {/* CREATE ACCOUNT CTA */}
          <button
            type="button"
            onClick={onOpenSignUp}
            className="w-full sm:w-1/2 py-3.5 px-6 rounded-2xl bg-[#121622] hover:bg-slate-800 border-2 border-slate-700 hover:border-slate-500 text-white font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md"
          >
            <UserPlus className="w-4 h-4 text-red-400" />
            <span>CREATE ACCOUNT</span>
          </button>
        </div>

        {/* Doctor Onboarding Request Link */}
        {onOpenDoctorOnboarding && (
          <div className="text-center pt-0.5">
            <button
              type="button"
              onClick={onOpenDoctorOnboarding}
              className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
              <span>Are you a Physician? Apply for Network Onboarding →</span>
            </button>
          </div>
        )}

        {/* Discreet Security & Assurance Footer */}
        <div className="flex items-center justify-center gap-3 text-[11px] text-slate-500 text-center pt-2">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-slate-500" />
            <span>256-Bit Encrypted</span>
          </span>
          <span>·</span>
          <span>HIPAA Protected Data</span>
          <span>·</span>
          <span>Strict Role Isolation</span>
        </div>
      </div>
    </div>
  );
};
