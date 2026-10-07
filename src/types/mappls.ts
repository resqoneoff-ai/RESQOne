/**
 * Mappls Web Vector Map JS SDK v3.0 Type Definitions
 */

export type MapplsErrorCode =
  | 'MAPPLS_KEY_MISSING'
  | 'MAPPLS_SDK_LOAD_FAILED'
  | 'MAPPLS_SDK_TIMEOUT'
  | 'MAPPLS_SDK_INITIALIZATION_FAILED'
  | 'MAPPLS_DOMAIN_NOT_AUTHORIZED'
  | 'MAPPLS_MAP_CONTAINER_INVALID';

export class MapplsError extends Error {
  code: MapplsErrorCode;
  details?: string;

  constructor(code: MapplsErrorCode, message: string, details?: string) {
    super(message);
    this.name = 'MapplsError';
    this.code = code;
    this.details = details;
  }
}

export interface MapplsCoordinates {
  lat: number;
  lng: number;
}

export interface MapplsMapOptions {
  center?: [number, number] | MapplsCoordinates;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomControl?: boolean;
  fullscreenControl?: boolean;
  location?: boolean;
  traffic?: boolean;
  clickableIcons?: boolean;
  backgroundColor?: string;
  [key: string]: any;
}

export interface MapplsMapInstance {
  remove?: () => void;
  resize?: () => void;
  setCenter?: (center: [number, number] | MapplsCoordinates) => void;
  setZoom?: (zoom: number) => void;
  getCenter?: () => any;
  getZoom?: () => number;
  on?: (event: string, callback: (...args: any[]) => void) => void;
  off?: (event: string, callback: (...args: any[]) => void) => void;
  addListener?: (event: string, callback: (...args: any[]) => void) => void;
  removeListener?: (event: string, callback: (...args: any[]) => void) => void;
  [key: string]: any;
}

export interface MapplsSDK {
  Map: new (
    container: string | HTMLElement,
    options?: MapplsMapOptions,
    callback?: (map: MapplsMapInstance) => void
  ) => MapplsMapInstance;
  [key: string]: any;
}

declare global {
  interface Window {
    mappls?: MapplsSDK;
    MapmyIndia?: MapplsSDK;
  }
}
