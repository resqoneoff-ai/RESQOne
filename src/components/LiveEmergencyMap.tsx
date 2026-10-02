import React, { useEffect, useState } from 'react';
import { Navigation, Hospital, MapPin, Radio, Compass } from 'lucide-react';

interface LiveEmergencyMapProps {
  mode?: 'view' | 'selectLocation';
  patientCoords?: { lat: number; lng: number };
  patientAddress?: string;
  ambulanceCoords?: { lat: number; lng: number };
  ambulanceUnit?: string;
  ambulanceEtaMin?: number;
  hospitalName?: string;
  hospitalCoords?: { lat: number; lng: number };
  onLocationSelect?: (coords: { lat: number; lng: number }, address: string) => void;
  heightClass?: string;
  interactive?: boolean;
}

export const LiveEmergencyMap: React.FC<LiveEmergencyMapProps> = ({
  mode = 'view',
  patientCoords = { lat: 37.7749, lng: -122.4194 },
  patientAddress = '742 Evergreen Terrace, North Ridge District',
  ambulanceCoords,
  ambulanceUnit = 'Medic Unit 14 (ALS)',
  ambulanceEtaMin = 3,
  hospitalName = 'Metro Health Cardiac & Vascular Institute',
  hospitalCoords = { lat: 37.7600, lng: -122.4050 },
  onLocationSelect,
  heightClass = 'h-72',
  interactive = true
}) => {
  // Animated ambulance position along line towards patient
  const [progress, setProgress] = useState(0.4);
  const [selectedPin, setSelectedPin] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (mode === 'selectLocation') return;
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 0.95 ? 0.95 : prev + 0.02));
    }, 2500);
    return () => clearInterval(interval);
  }, [mode]);

  // Coordinate mapping to SVG canvas (500x300 viewBox)
  const patientPos = { x: 260, y: 140 };
  const hospitalPos = { x: 420, y: 220 };
  const ambulanceStart = { x: 70, y: 70 };

  // Current ambulance interpolated position
  const currentAmbX = ambulanceCoords
    ? 150
    : ambulanceStart.x + (patientPos.x - ambulanceStart.x) * progress;
  const currentAmbY = ambulanceCoords
    ? 100
    : ambulanceStart.y + (patientPos.y - ambulanceStart.y) * progress;

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== 'selectLocation' || !interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 500;
    const y = ((e.clientY - rect.top) / rect.height) * 300;
    setSelectedPin({ x, y });

    // Generate address based on quadrant
    const streets = [
      '2400 Mission Street, Suite 4B',
      '850 Market Street, Near Powell Station',
      '1200 California Ave & Mason St',
      '450 Townsend St, SOMA Tech Hub',
      '710 Ashbury Street, Haight District',
      '350 Bay Street, Fisherman’s Wharf'
    ];
    const picked = streets[Math.floor(Math.random() * streets.length)];
    onLocationSelect?.({ lat: 37.77 + (y / 300) * 0.02, lng: -122.42 + (x / 500) * 0.02 }, picked);
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden bg-[#0A0D14] border border-slate-800 shadow-inner select-none`}>
      {/* Top telemetry pill */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-[#0C101A]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-300 font-medium text-[11px] truncate max-w-[200px] sm:max-w-none">
            {mode === 'selectLocation'
              ? 'Click map grid or tap location presets to pin exact position'
              : `Live GPS: ${patientAddress}`}
          </span>
        </div>

        {mode !== 'selectLocation' && (
          <div className="flex items-center gap-1.5 bg-red-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-red-800/80 text-[11px] text-red-300 font-mono font-bold shadow-md">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-spin" style={{ animationDuration: '3s' }} />
            <span>ETA {ambulanceEtaMin} MINS</span>
          </div>
        )}
      </div>

      {/* SVG City Matrix Grid */}
      <svg
        className={`w-full h-full ${mode === 'selectLocation' ? 'cursor-crosshair' : 'cursor-grab'}`}
        viewBox="0 0 500 300"
        preserveAspectRatio="xMidYMid slice"
        onClick={handleSvgClick}
      >
        {/* Background Grid Pattern */}
        <defs>
          <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#161E2E" strokeWidth="0.8" />
          </pattern>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#FF2B44" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Base Grid */}
        <rect width="100%" height="100%" fill="#080B10" />
        <rect width="100%" height="100%" fill="url(#gridPattern)" />

        {/* City Blocks & Roads */}
        {/* Major thoroughfares */}
        <line x1="0" y1="140" x2="500" y2="140" stroke="#1E293B" strokeWidth="12" />
        <line x1="0" y1="140" x2="500" y2="140" stroke="#334155" strokeWidth="1" strokeDasharray="6 6" />

        <line x1="260" y1="0" x2="260" y2="300" stroke="#1E293B" strokeWidth="12" />
        <line x1="260" y1="0" x2="260" y2="300" stroke="#334155" strokeWidth="1" strokeDasharray="6 6" />

        <line x1="70" y1="0" x2="70" y2="300" stroke="#172033" strokeWidth="8" />
        <line x1="420" y1="0" x2="420" y2="300" stroke="#172033" strokeWidth="8" />
        <line x1="0" y1="70" x2="500" y2="70" stroke="#172033" strokeWidth="8" />
        <line x1="0" y1="220" x2="500" y2="220" stroke="#172033" strokeWidth="8" />

        {/* Diagonal Arterial Boulevard */}
        <line x1="40" y1="40" x2="460" y2="260" stroke="#1E293B" strokeWidth="10" />
        <line x1="40" y1="40" x2="460" y2="260" stroke="#475569" strokeWidth="0.8" strokeDasharray="4 4" />

        {/* City district labels */}
        <text x="20" y="25" fill="#475569" fontSize="9" fontWeight="700" letterSpacing="1">NORTH RIDGE METRO</text>
        <text x="330" y="25" fill="#475569" fontSize="9" fontWeight="700" letterSpacing="1">DOWNTOWN CORRIDOR</text>
        <text x="20" y="285" fill="#475569" fontSize="9" fontWeight="700" letterSpacing="1">BAY DISTRICT</text>
        <text x="340" y="285" fill="#475569" fontSize="9" fontWeight="700" letterSpacing="1">TRAUMA MEDICAL HUB</text>

        {/* Mode: Selection Pin */}
        {mode === 'selectLocation' && selectedPin && (
          <g transform={`translate(${selectedPin.x}, ${selectedPin.y})`}>
            <circle cx="0" cy="0" r="24" fill="#FF2B44" fillOpacity="0.2" className="animate-ping" />
            <circle cx="0" cy="0" r="8" fill="#FF2B44" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M0 0 L0 -14" stroke="#FF2B44" strokeWidth="2" />
            <circle cx="0" cy="-14" r="5" fill="#FF2B44" stroke="#FFFFFF" strokeWidth="1.5" />
          </g>
        )}

        {/* Mode: Live Tracking View */}
        {mode !== 'selectLocation' && (
          <>
            {/* Projected Ambulance Route Line */}
            <path
              d={`M ${ambulanceStart.x} ${ambulanceStart.y} L ${patientPos.x} ${patientPos.y} L ${hospitalPos.x} ${hospitalPos.y}`}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="6 4"
              className="opacity-80"
            />

            {/* Hospital Destination Marker */}
            <g transform={`translate(${hospitalPos.x}, ${hospitalPos.y})`}>
              <circle cx="0" cy="0" r="18" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
              <rect x="-8" y="-8" width="16" height="16" rx="2" fill="#0284C7" />
              {/* White Cross */}
              <path d="M0 -5 V5 M-5 0 H5" stroke="white" strokeWidth="2" strokeLinecap="square" />
              <text x="0" y="26" fill="#38BDF8" fontSize="8" fontWeight="bold" textAnchor="middle">
                LEVEL 1 ER
              </text>
            </g>

            {/* Patient Location Beacon */}
            <g transform={`translate(${patientPos.x}, ${patientPos.y})`}>
              {/* Radar pulse rings */}
              <circle cx="0" cy="0" r="28" fill="#FF2B44" fillOpacity="0.15" className="animate-ping" style={{ animationDuration: '2s' }} />
              <circle cx="0" cy="0" r="16" fill="#FF2B44" fillOpacity="0.3" />
              <circle cx="0" cy="0" r="8" fill="#FF2B44" stroke="white" strokeWidth="2.5" />
              <text x="0" y="-18" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.8))">
                PATIENT LOCATION
              </text>
            </g>

            {/* Moving Dispatched Ambulance */}
            <g transform={`translate(${currentAmbX}, ${currentAmbY})`} className="transition-all duration-1000 ease-out">
              {/* Siren burst */}
              <circle cx="0" cy="0" r="16" fill="#EF4444" fillOpacity="0.25" className="animate-ping" style={{ animationDuration: '1.2s' }} />
              {/* Vehicle chassis */}
              <rect x="-14" y="-9" width="28" height="18" rx="4" fill="#FFFFFF" stroke="#FF2B44" strokeWidth="2" />
              {/* Red Cross */}
              <path d="M-3 -4 V4 M-7 0 H1" stroke="#FF2B44" strokeWidth="2" />
              {/* Flashing light bar */}
              <rect x="5" y="-5" width="4" height="10" rx="1" fill="#EF4444" className="animate-pulse" />
              <text x="0" y="-14" fill="#F87171" fontSize="8" fontWeight="bold" textAnchor="middle">
                {ambulanceUnit}
              </text>
            </g>
          </>
        )}
      </svg>

      {/* Map Control HUD Overlay */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 bg-[#0C101A]/90 backdrop-blur-md px-2.5 py-1 rounded border border-slate-800 text-[10px] text-slate-400">
          <Compass className="w-3 h-3 text-slate-400" />
          <span>REAL-TIME CAD DISPATCH GRID</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          {mode === 'selectLocation' && (
            <span className="text-[10px] font-semibold text-slate-400 bg-black/60 px-2 py-0.5 rounded">
              Tap anywhere to relocate pin
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
