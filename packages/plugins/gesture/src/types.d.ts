/**
 * Gesture Plugin TypeScript Definitions
 */

export interface GestureOptions {
  axis?: 'x' | 'y';
  threshold?: number;
  velocityThreshold?: number;
  pullToClose?: boolean;
  onProgress?: (data: GestureProgressData) => void;
}

export interface GestureProgressData {
  distance: number;
  progress: number;
  axis: 'x' | 'y';
  primitive: string;
}

export interface GestureConfig {
  defaultAxis: 'x' | 'y';
  defaultThreshold: number;
  supportsDrag: boolean;
  pullToClose?: boolean;
}

export function registerGesture(primitive: any, element: HTMLElement, options?: GestureOptions): () => void;
export function createGesturePlugin(options?: GestureOptions): (primitive: any) => () => void;

// Backward compatibility
export const registerDrawerDrag: typeof registerGesture;