import {
  LocationPermissionState,
  PatientGpsCoordinates,
  PatientLocationData,
  PatientLocationRecord
} from '../types/emergency';

export interface PatientLocationResult {
  success: boolean;
  state: LocationPermissionState;
  coordinates?: PatientGpsCoordinates;
  error?: string;
  errorMessage?: string;
}

/**
 * Requests the current browser/device location for the patient using the Geolocation API.
 * Returns structured coordinates with accuracy, timestamp, and permission state.
 */
export async function getCurrentPatientLocation(
  options: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }
): Promise<PatientLocationResult> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    const errorMsg = 'Geolocation is not supported by your browser/device.';
    console.info('[RESQ LOCATION] Geolocation API unavailable on device.');
    return {
      success: false,
      state: 'LOCATION_UNAVAILABLE',
      error: errorMsg,
      errorMessage: errorMsg
    };
  }

  return new Promise<PatientLocationResult>((resolve) => {
    try {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy);
          const timestamp = position.timestamp || Date.now();
          const capturedAt = new Date(timestamp).toISOString();

          const gpsCoords: PatientGpsCoordinates = {
            latitude: lat,
            longitude: lng,
            accuracy,
            timestamp,
            capturedAt,
            source: 'GPS'
          };

          // Step 12 Development Diagnostics (no secret keys, no medical info)
          console.log(
            `[RESQ LOCATION]\nPermission: granted\nLatitude: ${lat}\nLongitude: ${lng}\nAccuracy: ±${accuracy} m\nCaptured at: ${capturedAt}`
          );

          resolve({
            success: true,
            state: 'LOCATION_RECEIVED',
            coordinates: gpsCoords
          });
        },
        (error: GeolocationPositionError) => {
          let state: LocationPermissionState = 'LOCATION_ERROR';
          let errorMessage = 'Unable to capture patient location.';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              state = 'LOCATION_PERMISSION_DENIED';
              errorMessage = 'Location permission was denied. Please allow location access to dispatch emergency responders to your position.';
              console.warn('[RESQ LOCATION] Permission: denied by user.');
              break;
            case error.POSITION_UNAVAILABLE:
              state = 'LOCATION_UNAVAILABLE';
              errorMessage = 'Current GPS position is unavailable on this device.';
              console.warn('[RESQ LOCATION] Position: unavailable.');
              break;
            case error.TIMEOUT:
              state = 'LOCATION_TIMEOUT';
              errorMessage = 'GPS request timed out. Please check device connectivity or enter address manually.';
              console.warn('[RESQ LOCATION] Position: timeout.');
              break;
            default:
              state = 'LOCATION_ERROR';
              errorMessage = error.message || 'An unknown location error occurred.';
              console.warn('[RESQ LOCATION] Error:', error.message);
              break;
          }

          resolve({
            success: false,
            state,
            error: errorMessage,
            errorMessage
          });
        },
        options
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to query geolocation.';
      resolve({
        success: false,
        state: 'LOCATION_ERROR',
        error: msg,
        errorMessage: msg
      });
    }
  });
}

/**
 * Converts captured GPS coordinates into patientLocation record for Firestore
 */
export function formatPatientLocationRecord(
  gps: PatientGpsCoordinates
): PatientLocationRecord {
  return {
    latitude: gps.latitude,
    longitude: gps.longitude,
    accuracy: gps.accuracy,
    capturedAt: gps.capturedAt,
    source: 'GPS'
  };
}

/**
 * Converts captured GPS coordinates into the patient emergency location object
 */
export function formatPatientLocationData(
  gps: PatientGpsCoordinates,
  addressHint?: string
): PatientLocationData {
  return {
    type: 'Live Location',
    address: addressHint || `GPS Location (Accuracy: ±${gps.accuracy} m)`,
    lat: gps.latitude,
    lng: gps.longitude,
    accuracy: gps.accuracy,
    capturedAt: gps.capturedAt,
    source: 'GPS',
    isVerifiedGps: true
  };
}
