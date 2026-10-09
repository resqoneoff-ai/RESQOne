import React, { useEffect, useRef, useState, useId } from 'react';
import {
  loadMapplsSdk,
  isMapplsKeyConfigured,
  resetMapplsLoader,
  getCurrentOrigin,
  getCurrentHostname,
} from '../services/mapplsLoader';
import {
  MapplsCoordinates,
  MapplsMapInstance,
  MapplsError,
  MapplsErrorCode,
} from '../types/mappls';
import { useTheme } from '../context/ThemeContext';
import {
  MapPin,
  RefreshCw,
  Layers,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from 'lucide-react';

export interface MapplsMapProps {
  /**
   * Center coordinates [lat, lng] or { lat, lng }
   * Safe default: New Delhi [28.6139, 77.2090]
   */
  center?: MapplsCoordinates | [number, number];
  /**
   * Zoom level (1 - 22)
   * Default: 13
   */
  zoom?: number;
  /**
   * Enable/disable user interactions (pan, zoom)
   * Default: true
   */
  interactive?: boolean;
  /**
   * Optional custom CSS class for outer container
   */
  className?: string;
  /**
   * Real emergency patient marker coordinates and metadata
   */
  patientMarker?: {
    lat: number;
    lng: number;
    title?: string;
    accuracy?: number | null;
  } | null;
  /**
   * Callback fired once the Mappls map instance is initialized
   */
  onMapLoad?: (map: MapplsMapInstance) => void;
  /**
   * Callback fired if an error occurs while loading or initializing
   */
  onError?: (error: MapplsError) => void;
}

export const MapplsMap: React.FC<MapplsMapProps> = ({
  center,
  zoom = 14,
  interactive = true,
  className = 'w-full h-full min-h-[260px]',
  patientMarker,
  onMapLoad,
  onError,
}) => {
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === 'light';

  const rawId = useId();
  const containerId = useRef(
    `mappls-container-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}-${Math.random().toString(36).slice(2, 7)}`
  ).current;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapplsMapInstance | null>(null);
  const patientMarkerInstanceRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentError, setCurrentError] = useState<MapplsError | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [copiedOrigin, setCopiedOrigin] = useState<boolean>(false);
  const [copiedHost, setCopiedHost] = useState<boolean>(false);

  const hasKey = isMapplsKeyConfigured();
  const currentOrigin = getCurrentOrigin();
  const currentHostname = getCurrentHostname();

  const handleCopyOrigin = () => {
    if (navigator.clipboard && currentOrigin) {
      navigator.clipboard.writeText(currentOrigin).then(() => {
        setCopiedOrigin(true);
        setTimeout(() => setCopiedOrigin(false), 2500);
      });
    }
  };

  const handleCopyHost = () => {
    if (navigator.clipboard && currentHostname) {
      navigator.clipboard.writeText(currentHostname).then(() => {
        setCopiedHost(true);
        setTimeout(() => setCopiedHost(false), 2500);
      });
    }
  };

  const handleRetry = () => {
    resetMapplsLoader();
    setCurrentError(null);
    setIsLoading(true);
    setRetryCount((prev) => prev + 1);
  };

  useEffect(() => {
    // If no key is set, fail with MAPPLS_KEY_MISSING
    if (!hasKey) {
      const err = new MapplsError(
        'MAPPLS_KEY_MISSING',
        'Mappls Static Key is not configured.',
        'Please configure VITE_MAPPLS_STATIC_KEY in your .env or .env.local file.'
      );
      setCurrentError(err);
      setIsLoading(false);
      onError?.(err);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setCurrentError(null);

    // Clean up existing map instance before re-initializing
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove?.();
      } catch {
        // Safe disposal
      }
      mapInstanceRef.current = null;
    }

    // Verify container availability
    if (!containerRef.current) {
      const containerErr = new MapplsError(
        'MAPPLS_MAP_CONTAINER_INVALID',
        'Target DOM container is not mounted or available.',
        'The container element could not be found in the DOM.'
      );
      setCurrentError(containerErr);
      setIsLoading(false);
      onError?.(containerErr);
      return;
    }

    loadMapplsSdk()
      .then(() => {
        if (!isMounted || !containerRef.current) return;

        // Normalize center format
        const centerCoords: [number, number] = Array.isArray(center)
          ? center
          : center && typeof center.lat === 'number' && typeof center.lng === 'number'
          ? [center.lat, center.lng]
          : [28.6139, 77.209];

        try {
          const mapplsSdk = window.mappls || window.MapmyIndia;
          if (!mapplsSdk || typeof mapplsSdk.Map !== 'function') {
            throw new MapplsError(
              'MAPPLS_SDK_INITIALIZATION_FAILED',
              'Mappls SDK Map constructor not available on window object.',
              'Check whether Vector Tiles SDK is enabled in your Mappls console.'
            );
          }

          // Options for clean, patient-friendly map view
          const mapOptions = {
            center: centerCoords,
            zoom: zoom,
            zoomControl: interactive,
            fullscreenControl: false,
            location: false,
            traffic: false,
            clickableIcons: false,
          };

          let mapReadyTriggered = false;
          const markReady = (mapObj: MapplsMapInstance) => {
            if (mapReadyTriggered || !isMounted) return;
            mapReadyTriggered = true;
            setIsLoading(false);
            setCurrentError(null);

            // Trigger resize on container layout stabilization
            requestAnimationFrame(() => {
              if (mapObj && typeof mapObj.resize === 'function') {
                mapObj.resize();
              }
            });

            onMapLoad?.(mapObj);
          };

          // Initialize Map
          const map = new mapplsSdk.Map(containerId, mapOptions, (initializedMap: MapplsMapInstance) => {
            markReady(initializedMap || map);
          });

          mapInstanceRef.current = map;

          // Event listener hooks
          if (typeof map.addListener === 'function') {
            map.addListener('load', () => markReady(map));
          }
          if (typeof map.on === 'function') {
            map.on('load', () => markReady(map));
          }

          // Guaranteed resolution safeguard:
          // Once the map instance is constructed, ensure loading overlay clears even if
          // the SDK tile events are quiet.
          const readyFallbackTimer = setTimeout(() => {
            if (isMounted && mapInstanceRef.current) {
              markReady(mapInstanceRef.current);
            }
          }, 800);

          return () => clearTimeout(readyFallbackTimer);
        } catch (err) {
          const mapplsErr =
            err instanceof MapplsError
              ? err
              : new MapplsError(
                  'MAPPLS_SDK_INITIALIZATION_FAILED',
                  err instanceof Error ? err.message : 'Failed to initialize Mappls Map.'
                );

          if (isMounted) {
            setCurrentError(mapplsErr);
            setIsLoading(false);
            onError?.(mapplsErr);
          }
        }
      })
      .catch((err) => {
        const mapplsErr =
          err instanceof MapplsError
            ? err
            : new MapplsError(
                'MAPPLS_SDK_LOAD_FAILED',
                err instanceof Error ? err.message : 'Failed to load Mappls Web SDK.'
              );

        if (isMounted) {
          setCurrentError(mapplsErr);
          setIsLoading(false);
          onError?.(mapplsErr);
        }
      });

    // Resize listener for responsive mobile / desktop adaptation
    const handleResize = () => {
      if (mapInstanceRef.current?.resize) {
        mapInstanceRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove?.();
        } catch {
          // Safe disposal
        }
        mapInstanceRef.current = null;
      }
    };
  }, [hasKey, retryCount, containerId]);

  // Update center smoothly when props change dynamically
  useEffect(() => {
    if (mapInstanceRef.current && mapInstanceRef.current.setCenter) {
      if (patientMarker && typeof patientMarker.lat === 'number' && typeof patientMarker.lng === 'number') {
        try {
          mapInstanceRef.current.setCenter([patientMarker.lat, patientMarker.lng]);
        } catch {}
      } else if (center) {
        const centerCoords: [number, number] = Array.isArray(center)
          ? center
          : [center.lat, center.lng];
        try {
          mapInstanceRef.current.setCenter(centerCoords);
        } catch {}
      }
    }
  }, [center, patientMarker]);

  // Synchronize real patient marker on Mappls Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const mapplsSdk = typeof window !== 'undefined' ? (window.mappls || window.MapmyIndia) : null;
    if (!map || !mapplsSdk) return;

    // Clean up previous marker
    if (patientMarkerInstanceRef.current) {
      try {
        if (typeof patientMarkerInstanceRef.current.remove === 'function') {
          patientMarkerInstanceRef.current.remove();
        } else if (typeof mapplsSdk.remove === 'function') {
          mapplsSdk.remove({ map, layer: patientMarkerInstanceRef.current });
        }
      } catch {}
      patientMarkerInstanceRef.current = null;
    }

    // If real patient coordinates exist, create official Mappls marker
    if (
      patientMarker &&
      typeof patientMarker.lat === 'number' &&
      typeof patientMarker.lng === 'number' &&
      mapplsSdk.Marker
    ) {
      try {
        const marker = new mapplsSdk.Marker({
          map,
          position: { lat: patientMarker.lat, lng: patientMarker.lng },
          fitbounds: false,
          popupHtml: `
            <div style="padding: 6px 10px; font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #0F172A; min-width: 140px;">
              <div style="font-weight: 800; color: #DC2626; font-size: 13px; margin-bottom: 2px;">📍 Patient Location</div>
              <div style="font-size: 11px; color: #334155;">${patientMarker.title || 'Verified Emergency Position'}</div>
              ${patientMarker.accuracy ? `<div style="font-size: 10px; color: #64748B; margin-top: 3px;">Accuracy: ±${patientMarker.accuracy} m</div>` : ''}
            </div>
          `,
          popupOptions: { openPopup: true }
        });

        patientMarkerInstanceRef.current = marker;

        if (typeof map.setCenter === 'function') {
          map.setCenter([patientMarker.lat, patientMarker.lng]);
        }
      } catch (err) {
        console.warn('[RESQ MAP] Could not render patient marker:', err);
      }
    }

    return () => {
      if (patientMarkerInstanceRef.current) {
        try {
          if (typeof patientMarkerInstanceRef.current.remove === 'function') {
            patientMarkerInstanceRef.current.remove();
          } else if (typeof mapplsSdk.remove === 'function') {
            mapplsSdk.remove({ map, layer: patientMarkerInstanceRef.current });
          }
        } catch {}
        patientMarkerInstanceRef.current = null;
      }
    };
  }, [patientMarker, isLoading]);

  return (
    <div
      className={`relative w-full h-full min-h-[260px] overflow-hidden rounded-2xl select-none transition-colors border ${
        isLight
          ? 'bg-[#EBF3FB] border-sky-200/80 shadow-sm'
          : 'bg-[#090D15] border-slate-800'
      } ${className}`}
    >
      {/* Real Map Target DOM Container */}
      <div
        id={containerId}
        ref={containerRef}
        className="w-full h-full absolute inset-0 z-0"
        style={{ minHeight: '100%', width: '100%' }}
      />

      {/* Loading State Overlay */}
      {isLoading && !currentError && (
        <div
          className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-6 backdrop-blur-sm transition-opacity ${
            isLight ? 'bg-white/85 text-slate-800' : 'bg-[#090D15]/85 text-slate-100'
          }`}
        >
          <div className="relative flex items-center justify-center mb-3">
            <div className="w-10 h-10 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
            <MapPin className="w-5 h-5 text-red-500 absolute" />
          </div>
          <p className="text-xs font-bold tracking-tight">Connecting Mappls Live Map...</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Establishing secure connection to Mappls Vector Tiles
          </p>
        </div>
      )}

      {/* Error & Diagnostic State */}
      {currentError && (
        <div
          className={`absolute inset-0 z-20 flex flex-col items-center justify-center p-5 text-center backdrop-blur-md overflow-y-auto ${
            isLight ? 'bg-white/95 text-slate-800' : 'bg-[#0E131F]/95 text-slate-100'
          }`}
        >
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          </div>

          {/* Reassuring Patient-Facing Headline */}
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            {currentError.code === 'MAPPLS_DOMAIN_NOT_AUTHORIZED'
              ? 'Mappls Domain Authorization Pending'
              : 'Live Map Connection Notice'}
          </h4>

          {/* Patient Reassurance Summary */}
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mt-1 leading-relaxed">
            {currentError.code === 'MAPPLS_DOMAIN_NOT_AUTHORIZED'
              ? 'Your Mappls Static Key is registered, but requires this domain to be whitelisted in your Mappls Developer Console.'
              : currentError.message || 'Connecting to live emergency map service...'}
          </p>

          {/* Primary Action: Retry */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleRetry}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-800'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>

            {/* Developer Diagnostic Toggle */}
            <button
              onClick={() => setShowDiagnostics((prev) => !prev)}
              className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                isLight
                  ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  : 'border-slate-800 text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              <span>Diagnostics</span>
              {showDiagnostics ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          </div>

          {/* Actionable Developer Diagnostics (Zero Secret Key Leakage) */}
          {showDiagnostics && (
            <div
              className={`mt-3 w-full max-w-md p-3 rounded-xl border text-left text-xs font-mono transition-all ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                  : 'bg-[#0A0E17] border-slate-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800 mb-2">
                <span className="font-bold text-[10px] text-amber-500 uppercase tracking-wider">
                  Diagnostic State
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                  {currentError.code}
                </span>
              </div>

              {currentError.code === 'MAPPLS_DOMAIN_NOT_AUTHORIZED' && (
                <div className="space-y-2 text-[11px] font-sans">
                  <p className="text-slate-600 dark:text-slate-300">
                    In your Mappls Developer Console (Application: <strong>RESQONE</strong>), ensure your domain is added under <strong>Domain Whitelist</strong>:
                  </p>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Recommended format (without https://):</span>
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] border border-slate-800">
                      <span className="truncate flex-1">{currentHostname || 'Current domain'}</span>
                      <button
                        onClick={handleCopyHost}
                        className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                        title="Copy Hostname"
                      >
                        {copiedHost ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 space-y-1 pt-1">
                    <p>• Make sure to press <strong>Enter/Add</strong> so the domain appears as a tag, then click <strong>Save</strong>.</p>
                    <p>• Also add <code>localhost</code> if testing locally.</p>
                    <p>• Mappls CDN updates typically take 2-5 minutes to propagate.</p>
                  </div>
                </div>
              )}

              {currentError.code === 'MAPPLS_KEY_MISSING' && (
                <p className="text-[11px] font-sans text-slate-600 dark:text-slate-300">
                  Please define <code>VITE_MAPPLS_STATIC_KEY</code> in your <code>.env</code> file.
                </p>
              )}

              {currentError.code !== 'MAPPLS_DOMAIN_NOT_AUTHORIZED' &&
                currentError.code !== 'MAPPLS_KEY_MISSING' && (
                  <p className="text-[11px] font-sans text-slate-600 dark:text-slate-300">
                    {currentError.details || currentError.message}
                  </p>
                )}
            </div>
          )}
        </div>
      )}

      {/* Required Mappls Attribution / Branding Badge */}
      <div className="absolute bottom-2 right-2 z-20 pointer-events-auto">
        <a
          href="https://www.mappls.com"
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border backdrop-blur-md shadow-sm transition-opacity hover:opacity-100 ${
            isLight
              ? 'bg-white/90 border-slate-200 text-slate-700 opacity-90'
              : 'bg-[#0E1424]/90 border-slate-800 text-slate-300 opacity-85'
          }`}
          title="Powered by Mappls"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          <span>Powered by <strong>Mappls</strong></span>
        </a>
      </div>
    </div>
  );
};
