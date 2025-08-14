/**
 * @uip/core - Universal UI Protocol Core
 * Framework-agnostic UI primitives with accessibility built-in
 */

export { createDrawer } from './drawer/index.js';

// Re-export utilities for advanced usage
export { 
  enableFocusTrap, 
  disableFocusTrap, 
  focusFirstElement 
} from './drawer/focus-trap.js';

export { 
  lockBodyScroll, 
  unlockBodyScroll,
  isScrollLocked 
} from './drawer/body-scroll-lock.js';

export { 
  createEventSystem,
  createKeyboardHandler 
} from './drawer/events.js';