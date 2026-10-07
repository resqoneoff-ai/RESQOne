import { useState, useCallback } from 'react';
import {
  LocationPermissionState,
  PatientGpsCoordinates,
  PatientLocationRecord,
  PatientLocationData
} from '../types/emergency';
import {
  getCurrentPatientLocation,
  formatPatientLocationRecord,
  formatPatientLocationData,
  PatientLocationResult
} from '../services/locationService';

export interface UsePatientLocationReturn {
  permissionState: LocationPermissionState;
  coordinates: PatientGpsCoordinates | null;
  error: string | null;
  isLoading: boolean;
  requestLocation: (options?: PositionOptions) => Promise<PatientLocationResult>;
  resetLocation: () => void;
  getFormattedRecord: () => PatientLocationRecord | null;
  getFormattedData: (addressHint?: string) => PatientLocationData | null;
}

/**
 * Reusable React hook for capturing real patient emergency location
 * using the browser/device Geolocation API with robust permission states.
 */
export function usePatientLocation(): UsePatientLocationReturn {
  const [permissionState, setPermissionState] = useState<LocationPermissionState>('IDLE');
  const [coordinates, setCoordinates] = useState<PatientGpsCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const requestLocation = useCallback(async (options?: PositionOptions): Promise<PatientLocationResult> => {
    setIsLoading(true);
    setPermissionState('REQUESTING_PERMISSION');
    setError(null);

    try {
      const result = await getCurrentPatientLocation(options);

      setPermissionState(result.state);
      setIsLoading(false);

      if (result.success && result.coordinates) {
        setCoordinates(result.coordinates);
        setError(null);
        return result;
      } else {
        setCoordinates(null);
        setError(result.errorMessage || 'Unable to get location');
        return result;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown location error';
      setPermissionState('LOCATION_ERROR');
      setIsLoading(false);
      setCoordinates(null);
      setError(msg);
      return {
        success: false,
        state: 'LOCATION_ERROR',
        error: msg,
        errorMessage: msg
      };
    }
  }, []);

  const resetLocation = useCallback(() => {
    setPermissionState('IDLE');
    setCoordinates(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const getFormattedRecord = useCallback((): PatientLocationRecord | null => {
    if (!coordinates) return null;
    return formatPatientLocationRecord(coordinates);
  }, [coordinates]);

  const getFormattedData = useCallback((addressHint?: string): PatientLocationData | null => {
    if (!coordinates) return null;
    return formatPatientLocationData(coordinates, addressHint);
  }, [coordinates]);

  return {
    permissionState,
    coordinates,
    error,
    isLoading,
    requestLocation,
    resetLocation,
    getFormattedRecord,
    getFormattedData
  };
}
