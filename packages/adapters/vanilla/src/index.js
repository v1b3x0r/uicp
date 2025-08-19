/**
 * @uip/adapter-vanilla - Hybrid Universal UI Protocol
 * Zero-config, progressive enhancement, plugin-ready
 */

// Primary Hybrid API exports
export { 
  drawer,
  drawerWithGestures, 
  drawerWithPlugins,
  modal,
  popover
} from './hybrid.js';

// Minimal backward compatibility for legacy code
import { drawer } from './hybrid.js';

/**
 * Legacy createUniversalDrawer compatibility wrapper
 * @deprecated Use drawer() instead
 */
export const createUniversalDrawer = (options = {}) => {
  const elementSelector = options.element || '#drawer';
  return drawer(elementSelector, options);
};

/**
 * Legacy createDrawer compatibility wrapper  
 * @deprecated Use drawer() instead
 */
export const createDrawer = (options = {}) => {
  return createUniversalDrawer(options);
};