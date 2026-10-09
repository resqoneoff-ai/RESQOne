import React from 'react';
import { MapplsMap } from './MapplsMap';
import { useTheme } from '../context/ThemeContext';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';

interface LiveEmergencyMapProps {
  mode?: 'view' | 'selectLocation';
  patientCoords?: { lat: number; lng: number } | null;
  patientAddress?: string;
  patientAccuracy?: number | null;
  isVerifiedGps?: boolean;
  onRequestLocation?: () => void;
  onLocationSelect?: (coords: { lat: number; lng: number }, address: string) => void;
  heightClass?: string;
  interactive?: boolean;
  ambulanceUnit?: string;
  ambulanceEtaMin?: number;
  hospitalName?: string;
}

export const LiveEmergencyMap: React.FC<LiveEmergencyMapProps> = ({
  mode = 'view',
  patientCoords,
  patientAddress,
  patientAccuracy,
  isVerifiedGps = false,
  onRequestLocation,
  onLocationSelect,
  heightClass = 'h-64 sm:h-72',
  interactive = true,
}) => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  const hasRealCoords = Boolean(
    patientCoords &&
      typeof patientCoords.lat === 'number' &&
      typeof patientCoords.lng === 'number' &&
      !isNaN(patientCoords.lat) &&
      !isNaN(patientCoords.lng) &&
      patientCoords.lat !== 0 &&
      patientCoords.lng !== 0
  );

  return (
    <div
      className={`relative w-full ${heightClass} rounded-2xl overflow-hidden transition-colors border select-none ${
        isLight
          ? 'bg-white border-[#DCE3EC] shadow-xs'
          : 'bg-[#090D15] border-slate-800/90 shadow-inner'
      }`}
    >
      {/* Top Reassurance Status Header */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none gap-2">
        <div
          className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 backdrop-blur-md shadow-xs text-xs font-semibold ${
            isLight
              ? 'bg-white/95 border-[#DCE3EC] text-[#082B5C]'
              : 'bg-[#0E1424]/90 border-slate-700 text-slate-100'
          }`}
        >
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              hasRealCoords ? 'bg-[#18A66A] animate-pulse' : 'bg-[#F36C21]'
            }`}
          />
          <span className="truncate max-w-[200px] sm:max-w-none">
            {mode === 'selectLocation'
              ? 'Select exact location on map'
              : hasRealCoords
              ? patientAddress || (isVerifiedGps ? 'Verified Patient GPS' : 'Patient Location')
              : 'Patient Location Needed'}
          </span>
        </div>

        {hasRealCoords && typeof patientAccuracy === 'number' && patientAccuracy > 0 && (
          <div
            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 backdrop-blur-md shadow-xs text-[11px] font-bold ${
              isLight
                ? 'bg-[#EAF4FF] border-[#2F80C9]/30 text-[#082B5C]'
                : 'bg-sky-950/80 border-sky-800 text-sky-200'
            }`}
          >
            <span>Accuracy: ±{patientAccuracy} m</span>
          </div>
        )}
      </div>

      {/* Real Interactive Mappls Web Map */}
      <div className="w-full h-full relative z-0">
        <MapplsMap
          center={hasRealCoords ? patientCoords! : { lat: 28.6139, lng: 77.209 }}
          zoom={hasRealCoords ? 15 : 12}
          interactive={interactive}
          patientMarker={
            hasRealCoords
              ? {
                  lat: patientCoords!.lat,
                  lng: patientCoords!.lng,
                  title: patientAddress || 'Verified Patient Position',
                  accuracy: patientAccuracy
                }
              : null
          }
          className="w-full h-full"
        />
      </div>

      {/* Empty State Overlay when No Real GPS Received (Step 7 & 10) */}
      {!hasRealCoords && mode !== 'selectLocation' && (
        <div
          className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center backdrop-blur-xs pointer-events-auto ${
            isLight ? 'bg-white/85 text-[#172033]' : 'bg-[#090D15]/85 text-slate-100'
          }`}
        >
          <div className="w-10 h-10 rounded-2xl bg-[#FFF1E8] border border-[#F36C21]/30 flex items-center justify-center mb-2.5">
            <AlertCircle className="w-5 h-5 text-[#F36C21]" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#F36C21]">
            Patient Location Required
          </h4>
          <p className="text-xs text-[#596579] dark:text-slate-400 max-w-xs mt-1 mb-3">
            Real GPS coordinates have not been received for this patient yet.
          </p>
          {onRequestLocation && (
            <button
              onClick={onRequestLocation}
              className="px-4 py-2 rounded-xl bg-[#F36C21] hover:bg-[#FF7A00] text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition-all pointer-events-auto"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Capture Patient GPS</span>
            </button>
          )}
        </div>
      )}

      {/* Bottom Status Banner */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center pointer-events-none text-[11px]">
        <div
          className={`px-3 py-1 rounded-xl border flex items-center gap-2 backdrop-blur-md font-medium shadow-xs ${
            isLight
              ? 'bg-white/95 border-[#DCE3EC] text-[#596579]'
              : 'bg-[#0E1424]/90 border-slate-800 text-slate-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              hasRealCoords ? 'bg-[#18A66A] animate-pulse' : 'bg-[#F36C21]'
            }`}
          />
          <span>
            {hasRealCoords
              ? 'Real Patient Location • Updated just now'
              : 'Awaiting patient GPS verification'}
          </span>
        </div>
      </div>
    </div>
  );
};
