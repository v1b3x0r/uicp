/**
 * Snap Plugin TypeScript Definitions
 */

export interface SnapOptions {
  points?: string[];
  axis?: 'x' | 'y' | 'both';
  initialPoint?: string;
  transition?: string;
  onSnapChange?: (data: SnapChangeData) => void;
}

export interface SnapChangeData {
  point: string;
  axis: 'x' | 'y' | 'both';
  primitive: string;
  instance: any;
}

export interface SnapAPI {
  getSnapPoint(): string;
  setSnapPoint(point: string): void;
  getSnapPoints(): string[];
  snapToNext(): void;
  snapToPrevious(): void;
}

export interface SnapConfig {
  axis: 'x' | 'y' | 'both';
  points: string[];
  supports: boolean;
}

export function registerSnap(primitive: any, element: HTMLElement, options?: SnapOptions): () => void;
export function createSnapPlugin(options?: SnapOptions): (primitive: any) => () => void;
export function getSnapAPI(primitive: any): SnapAPI;

export namespace SnapPresets {
  export function drawerWidthQuarters(): (primitive: any) => () => void;
  export function drawerWidthFixed(): (primitive: any) => () => void;
  export function drawerHeightHalves(): (primitive: any) => () => void;
  export function modalSizes(): (primitive: any) => () => void;
  export function modalResponsive(): (primitive: any) => () => void;
  export function popoverSizes(): (primitive: any) => () => void;
}

// Backward compatibility
export const registerDrawerSnap: typeof registerSnap;