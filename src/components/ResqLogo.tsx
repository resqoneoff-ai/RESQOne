import React from 'react';

interface ResqLogoProps {
  variant?: 'hero' | 'compact' | 'iconOnly' | 'pipelineOnly';
  activeStep?: 'EMERGENCY_CLICK' | 'AMBULANCE' | 'DOCTOR' | 'HOSPITAL' | 'HANDOVER' | 'COMPLETED' | null;
  onStepClick?: (step: 'EMERGENCY_CLICK' | 'AMBULANCE' | 'DOCTOR' | 'HOSPITAL' | 'HANDOVER') => void;
  className?: string;
  showPipeline?: boolean;
}

export const ResqLogo: React.FC<ResqLogoProps> = ({
  variant = 'hero',
  activeStep = null,
  onStepClick,
  className = '',
  showPipeline = true
}) => {
  // SVG Icon definitions matching the user's uploaded logo
  const steps = [
    {
      id: 'EMERGENCY_CLICK' as const,
      label: 'EMERGENCY CLICK',
      icon: (
        <svg viewBox="0 0 48 48" className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Hand finger clicking */}
          <path d="M22 18V10a3 3 0 0 1 6 0v11" />
          <path d="M28 17a3 3 0 0 1 6 0v4" />
          <path d="M34 20a3 3 0 0 1 6 0v7a11 11 0 0 1-11 11H23a11 11 0 0 1-9.5-5.5L9.8 30a2 2 0 0 1 3.2-2.3L16 30v-16a3 3 0 0 1 6 0v4" />
          {/* Click pulse bursts */}
          <path d="M22 4V2" strokeWidth="2" />
          <path d="M15 7l-1.5-1.5" strokeWidth="2" />
          <path d="M29 7l1.5-1.5" strokeWidth="2" />
        </svg>
      )
    },
    {
      id: 'AMBULANCE' as const,
      label: 'AMBULANCE',
      icon: (
        <svg viewBox="0 0 48 48" className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Siren light */}
          <path d="M18 10h4v3h-4z" fill="currentColor" stroke="none" />
          <path d="M15 8l-2-2m14 2l2-2" strokeWidth="2" />
          {/* Ambulance Body */}
          <path d="M7 16h22v18H7z" />
          <path d="M29 20h8l5 6v8h-13V20z" />
          {/* Cross on ambulance */}
          <path d="M18 20v8M14 24h8" strokeWidth="2.5" />
          {/* Wheels */}
          <circle cx="15" cy="35" r="4" fill="#08090C" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="34" cy="35" r="4" fill="#08090C" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      )
    },
    {
      id: 'DOCTOR' as const,
      label: 'DOCTOR',
      icon: (
        <svg viewBox="0 0 48 48" className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Doctor head */}
          <circle cx="24" cy="14" r="7" />
          {/* Hair / cap line */}
          <path d="M18 14c1.5-4 10.5-4 12 0" />
          {/* Stethoscope & coat */}
          <path d="M12 39c0-6 5.5-11 12-11s12 5 12 11" />
          {/* Stethoscope loop */}
          <path d="M19 28v5a5 5 0 0 0 10 0v-5" />
          <circle cx="24" cy="35" r="1.8" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'HOSPITAL' as const,
      label: 'HOSPITAL',
      icon: (
        <svg viewBox="0 0 48 48" className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Hospital building */}
          <path d="M10 40V16h28v24" />
          {/* Red Cross above entrance */}
          <path d="M24 8v10M19 13h10" strokeWidth="2.5" />
          {/* Windows / Entrance */}
          <path d="M16 23h4v4h-4zm12 0h4v4h-4zM21 40v-8h6v8" />
        </svg>
      )
    },
    {
      id: 'HANDOVER' as const,
      label: 'HANDOVER',
      icon: (
        <svg viewBox="0 0 48 48" className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Medical document / clipboard */}
          <rect x="11" y="9" width="22" height="30" rx="3" />
          <path d="M17 9V6h10v3" />
          <path d="M16 18h12M16 24h12" />
          {/* Circular verified checkmark */}
          <circle cx="33" cy="33" r="7" fill="#08090C" stroke="currentColor" strokeWidth="2" />
          <path d="M30 33l2 2 4-4" strokeWidth="2.5" />
        </svg>
      )
    }
  ];

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        <div className="flex items-center tracking-tight font-black text-2xl leading-none">
          <span className="text-white">RES</span>
          <div className="relative inline-flex items-center justify-center text-[#FF2B44] ml-0.5">
            <span className="text-3xl font-black">Q</span>
            {/* ECG pulse crossing Q */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 32 32"
              fill="none"
            >
              <path
                d="M4 16h8l2-4 3 8 2.5-5 1.5 2.5 2-1.5h5"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-[#FF2B44] ml-2 tracking-widest uppercase border border-[#FF2B44]/40 px-1.5 py-0.5 rounded">
            ONE
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'iconOnly') {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <span className="text-white font-black text-2xl">RES</span>
        <div className="relative inline-flex items-center justify-center text-[#FF2B44]">
          <span className="text-3xl font-black">Q</span>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 32 32" fill="none">
            <path
              d="M4 16h8l2-4 3 8 2.5-5 1.5 2.5 2-1.5h5"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    );
  }

  const isPipelineOnly = variant === 'pipelineOnly';

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {!isPipelineOnly && (
        <div className="flex flex-col items-center mb-6 text-center">
          {/* RESQ Wordmark */}
          <div className="flex items-center justify-center font-black tracking-tighter text-5xl md:text-7xl leading-none">
            <span className="text-white drop-shadow-sm">RES</span>
            <div className="relative inline-flex items-center justify-center text-[#FF2B44] mx-0.5">
              <span className="text-6xl md:text-8xl font-black">Q</span>
              {/* ECG Pulse Line inside Q */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 64 64"
                fill="none"
              >
                <path
                  d="M8 32h16l4-10 6 18 5-11 3 5 3-2h15"
                  stroke="white"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="filter drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]"
                />
              </svg>
            </div>
          </div>

          {/* ― ONE ― */}
          <div className="flex items-center justify-center gap-3 mt-2 w-full max-w-xs">
            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#FF2B44] to-[#FF2B44]" />
            <span className="text-[#FF2B44] font-black tracking-[0.35em] text-xl md:text-2xl uppercase">
              ONE
            </span>
            <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-[#FF2B44] to-[#FF2B44]" />
          </div>

          {/* Tagline */}
          <p className="mt-2 text-white font-extrabold tracking-[0.3em] text-xs md:text-sm uppercase text-slate-200">
            ONE CLICK. ALL CARE.
          </p>
        </div>
      )}

      {/* 5-Step Connected Pipeline */}
      {showPipeline && (
        <div className="w-full max-w-3xl px-2 py-4">
        <div className="relative flex items-center justify-between">
          {/* Connecting Red Line */}
          <div className="absolute left-[8%] right-[8%] top-[24px] md:top-[28px] h-[2px] bg-red-900/60 -z-0">
            {activeStep && (
              <div
                className="h-full bg-gradient-to-r from-[#FF2B44] to-red-500 transition-all duration-700"
                style={{
                  width:
                    activeStep === 'EMERGENCY_CLICK'
                      ? '10%'
                      : activeStep === 'AMBULANCE'
                      ? '35%'
                      : activeStep === 'DOCTOR'
                      ? '60%'
                      : activeStep === 'HOSPITAL'
                      ? '85%'
                      : activeStep === 'HANDOVER' || activeStep === 'COMPLETED'
                      ? '100%'
                      : '0%'
                }}
              />
            )}
          </div>

          {/* 5 Step Icons */}
          {steps.map((st, idx) => {
            const stepIndexOrder = ['EMERGENCY_CLICK', 'AMBULANCE', 'DOCTOR', 'HOSPITAL', 'HANDOVER'];
            const currentIndex = activeStep ? stepIndexOrder.indexOf(activeStep) : -1;
            const thisIndex = idx;
            const isCompleted = activeStep === 'COMPLETED' || (currentIndex >= 0 && currentIndex > thisIndex);
            const isCurrent = activeStep === st.id;

            return (
              <div
                key={st.id}
                onClick={() => onStepClick?.(st.id)}
                className={`relative z-10 flex flex-col items-center group cursor-pointer transition-transform duration-200 ${
                  onStepClick ? 'hover:scale-105' : ''
                }`}
              >
                {/* Circular Step Badge */}
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                    isCurrent
                      ? 'bg-red-600 text-white border-white shadow-[0_0_20px_rgba(255,43,68,0.7)] ring-4 ring-red-500/30 scale-110'
                      : isCompleted
                      ? 'bg-red-950/80 text-[#FF2B44] border-[#FF2B44]'
                      : 'bg-[#0E1015] text-[#FF2B44]/90 border-[#FF2B44]/70 hover:border-[#FF2B44]'
                  }`}
                >
                  {st.icon}
                </div>

                {/* Step Label */}
                <span
                  className={`mt-2.5 text-[10px] md:text-xs font-bold tracking-wider uppercase text-center max-w-[80px] md:max-w-[100px] leading-tight ${
                    isCurrent
                      ? 'text-white'
                      : isCompleted
                      ? 'text-red-400'
                      : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {st.label}
                </span>

                {/* Active indicator dot */}
                {isCurrent && (
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#FF2B44] animate-ping" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}
    </div>
  );
};
