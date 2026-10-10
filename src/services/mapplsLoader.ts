import { MapplsError } from '../types/mappls';

let loadPromise: Promise<void> | null = null;
let lastDetectedError: MapplsError | null = null;

/**
 * Retrieves the Mappls Static Key from environment variables without exposing it.
 * Also checks runtime window config and emergency session storage if Vercel build missed Vite env.
 */
export function getMapplsStaticKey(): string | null {
  const env = import.meta.env;
  const runtimeWindow = typeof window !== 'undefined' ? (window as any) : null;
  const runtimeKey =
    runtimeWindow?.__MAPPLS_STATIC_KEY__ ||
    runtimeWindow?.__RESQ_MAPPLS_KEY__ ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('resq_mappls_static_key') : null);

  const rawKey =
    env.VITE_MAPPLS_STATIC_KEY ||
    env.VITE_MAPPLS_KEY ||
    env.VITE_MAPPLS_API_KEY ||
    runtimeKey;

  if (!rawKey || typeof rawKey !== 'string') {
    return null;
  }

  const trimmed = rawKey.trim();
  if (
    trimmed.length === 0 ||
    trimmed === 'your-mappls-static-key' ||
    trimmed === 'YOUR_STATIC_KEY' ||
    trimmed === 'MY_MAPPLS_STATIC_KEY'
  ) {
    return null;
  }

  return trimmed;
}

/**
 * Checks whether a valid Mappls Static Key has been configured.
 */
export function isMapplsKeyConfigured(): boolean {
  return getMapplsStaticKey() !== null;
}

/**
 * Saves a manually provided Mappls Static Key to localStorage and resets loader cache.
 */
export function saveMapplsStaticKey(key: string): boolean {
  if (typeof window === 'undefined') return false;
  const trimmed = key.trim();
  if (!trimmed) return false;
  try {
    localStorage.setItem('resq_mappls_static_key', trimmed);
    (window as any).__MAPPLS_STATIC_KEY__ = trimmed;
    resetMapplsLoader();
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets the current window hostname (without protocol or port)
 * e.g. "ais-dev-ll5xsvlpymawxjekqekwm3-835172277171.asia-east1.run.app"
 */
export function getCurrentHostname(): string {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.hostname;
  }
  return '';
}

/**
 * Gets the full origin e.g. "https://ais-dev-..."
 */
export function getCurrentOrigin(): string {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }
  return '';
}

/**
 * Gets the last detected Mappls loader error, if any.
 */
export function getLastMapplsError(): MapplsError | null {
  return lastDetectedError;
}

/**
 * Resets the loader cache so retries can re-attempt SDK loading.
 */
export function resetMapplsLoader(): void {
  loadPromise = null;
  lastDetectedError = null;
  if (typeof document !== 'undefined') {
    const existing = document.getElementById('mappls-sdk-v3-script');
    if (existing) {
      existing.remove();
    }
    const legacy = document.getElementById('mappls-sdk-legacy-script');
    if (legacy) {
      legacy.remove();
    }
  }
}

function checkMapplsGlobal(): boolean {
  if (typeof window === 'undefined') return false;
  const hasMappls = Boolean(window.mappls && typeof window.mappls.Map === 'function');
  const hasMapmyIndia = Boolean(window.MapmyIndia && typeof window.MapmyIndia.Map === 'function');
  return hasMappls || hasMapmyIndia;
}

/**
 * Dynamically loads the Mappls Web Vector Map JS SDK v3.0 directly via HTML script tag.
 * Avoids blocking fetch() preflights that fail in cross-origin iframe environments.
 */
export function loadMapplsSdk(): Promise<void> {
  // If already loaded and Map constructor is present, return immediately
  if (checkMapplsGlobal()) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  const staticKey = getMapplsStaticKey();
  if (!staticKey) {
    const err = new MapplsError(
      'MAPPLS_KEY_MISSING',
      'Mappls Static Key is not configured.',
      'Please configure VITE_MAPPLS_STATIC_KEY in your .env or .env.local file.'
    );
    lastDetectedError = err;
    return Promise.reject(err);
  }

  loadPromise = new Promise<void>((resolve, reject) => {
    const scriptId = 'mappls-sdk-v3-script';
    const hostname = getCurrentHostname();

    // 1. Clean up any stale/failed script tag
    const existing = document.getElementById(scriptId);
    if (existing) {
      existing.remove();
    }

    // 2. Primary Modern Mappls Web Maps JS SDK v3.0 endpoint
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    // Set referrerPolicy to 'origin' so the browser reliably sends the domain even inside an iframe
    script.referrerPolicy = 'origin';
    script.src = `https://sdk.mappls.com/map/sdk/web?v=3.0&access_token=${encodeURIComponent(staticKey)}`;

    const timeoutMs = 12000;
    const timer = setTimeout(() => {
      // If primary timed out, check if global became available
      if (checkMapplsGlobal()) {
        resolve();
        return;
      }

      loadPromise = null;
      const timeoutErr = new MapplsError(
        'MAPPLS_SDK_TIMEOUT',
        'Mappls Web SDK script load timed out (12s).',
        `Mappls took too long to respond. If domain whitelisting was just updated, please allow 2-5 minutes for Mappls CDN propagation.`
      );
      lastDetectedError = timeoutErr;
      reject(timeoutErr);
    }, timeoutMs);

    script.onload = () => {
      clearTimeout(timer);
      pollForMapplsObject(
        () => {
          lastDetectedError = null;
          resolve();
        },
        (err) => {
          // If script tag loaded but window.mappls is missing, attempt secondary endpoint fallback
          trySecondaryEndpoint(staticKey, resolve, reject, err);
        }
      );
    };

    script.onerror = () => {
      clearTimeout(timer);
      // Attempt secondary endpoint fallback if primary fails
      const primaryErr = new MapplsError(
        'MAPPLS_DOMAIN_NOT_AUTHORIZED',
        'Mappls rejected connection for this domain.',
        `Domain "${hostname}" rejected by Mappls. Ensure "${hostname}" is added to Domain Whitelist in Mappls Console (without https://).`
      );
      trySecondaryEndpoint(staticKey, resolve, reject, primaryErr);
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}

function trySecondaryEndpoint(
  staticKey: string,
  resolve: () => void,
  reject: (err: MapplsError) => void,
  fallbackErr: MapplsError
): void {
  const secondaryId = 'mappls-sdk-legacy-script';
  const existingSec = document.getElementById(secondaryId);
  if (existingSec) {
    existingSec.remove();
  }

  const secScript = document.createElement('script');
  secScript.id = secondaryId;
  secScript.type = 'text/javascript';
  secScript.async = true;
  secScript.defer = true;
  secScript.referrerPolicy = 'origin';
  secScript.src = `https://apis.mappls.com/advancedmaps/api/${encodeURIComponent(staticKey)}/map_sdk?v=3.0&layer=vector`;

  secScript.onload = () => {
    pollForMapplsObject(
      () => {
        lastDetectedError = null;
        resolve();
      },
      () => {
        loadPromise = null;
        lastDetectedError = fallbackErr;
        reject(fallbackErr);
      }
    );
  };

  secScript.onerror = () => {
    loadPromise = null;
    lastDetectedError = fallbackErr;
    reject(fallbackErr);
  };

  document.head.appendChild(secScript);
}

function pollForMapplsObject(
  resolve: () => void,
  reject: (err: MapplsError) => void,
  attempts = 0
): void {
  if (checkMapplsGlobal()) {
    resolve();
    return;
  }

  // Poll for up to 3.5 seconds
  if (attempts >= 35) {
    const hostname = getCurrentHostname();
    const initErr = new MapplsError(
      'MAPPLS_DOMAIN_NOT_AUTHORIZED',
      'Mappls SDK returned an access denial or uninitialized map.',
      `Mappls authorization failed for domain "${hostname}". In Mappls Console, ensure "${hostname}" (no https://) is saved in the Domain Whitelist.`
    );
    reject(initErr);
    return;
  }

  setTimeout(() => {
    pollForMapplsObject(resolve, reject, attempts + 1);
  }, 100);
}
