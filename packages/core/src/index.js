/**
 * @uip/core - Universal UI Protocol Core
 * Framework-agnostic UI primitives with accessibility built-in
 */

// Export all primitives
export { createDrawer } from './primitives/drawer.js';
export { createModal } from './primitives/modal.js';
export { createTooltip } from './primitives/tooltip.js';
export { createPopover } from './primitives/popover.js';
export { createMenu } from './primitives/menu.js';

// Keep backward compatibility with old drawer location
export { createDrawer as createDrawerLegacy } from './drawer/index.js';

// Export utilities for advanced usage
export { 
  enableFocusTrap, 
  disableFocusTrap, 
  focusFirstElement,
  storeFocus,
  restoreFocus
} from './utils/focus-trap.js';

export { 
  lockBodyScroll, 
  unlockBodyScroll,
  isScrollLocked,
  resetScrollLock
} from './utils/scroll-lock.js';

export { 
  createEventSystem,
  createKeyboardHandler 
} from './utils/events.js';