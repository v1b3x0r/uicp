/**
 * Position Plugin TypeScript Definitions
 */

export interface PositionOptions {
  position?: string;
  size?: string;
  offset?: number;
  autoClose?: boolean;
  transition?: string;
}

export interface PositionConfig {
  positions: string[];
  defaultPosition: string;
  defaultSize: string;
  fullscreen?: boolean;
  backdrop?: boolean;
  offset?: number;
}

export interface AutoPositionResult {
  position: string;
  x: number;
  y: number;
}

export function registerPosition(primitive: any, element: HTMLElement, options?: PositionOptions): () => void;
export function createPositionPlugin(options?: PositionOptions): (primitive: any) => () => void;

export namespace PositionPresets {
  export function drawerLeft(): (primitive: any) => () => void;
  export function drawerRight(): (primitive: any) => () => void;
  export function drawerBottom(): (primitive: any) => () => void;
  export function modalCenter(): (primitive: any) => () => void;
  export function modalFullscreen(): (primitive: any) => () => void;
  export function tooltipAuto(): (primitive: any) => () => void;
  export function popoverBottom(): (primitive: any) => () => void;
  export function menuContextual(): (primitive: any) => () => void;
}

// Backward compatibility
export const registerDrawerDirection: typeof registerPosition;