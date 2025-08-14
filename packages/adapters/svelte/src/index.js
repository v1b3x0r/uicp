/**
 * @uip/adapter-svelte - Svelte Integration for Universal UI Protocol
 * Supports both Svelte 4 stores and Svelte 5 runes patterns
 */

import { writable } from 'svelte/store';
import { createDrawer } from '@uip/core';

/**
 * Create Svelte store for drawer - works with Svelte 4 & 5
 * @param {Object} [options] - Drawer options
 * @param {Array} [plugins] - Array of plugins to apply
 * @returns {Object} Svelte store with drawer methods
 */
export function drawerStore(options = {}, plugins = []) {
  const drawer = createDrawer(options);
  const { subscribe, set } = writable(drawer.getState());
  
  // Sync store with drawer state
  drawer.onChange(set);
  
  // Apply plugins
  plugins.forEach(plugin => {
    if (plugin?.register) {
      plugin.register(drawer);
    }
  });
  
  return {
    subscribe,
    open: drawer.open,
    close: drawer.close,
    toggle: drawer.toggle,
    registerTrigger: drawer.registerTrigger,
    registerContent: drawer.registerContent,
    drawer
  };
}

/**
 * Create runes-friendly drawer helper for Svelte 5
 * Use with $state wrapper in components
 * @param {Object} [options] - Drawer options
 * @param {Array} [plugins] - Array of plugins to apply
 * @returns {Object} Plain object for runes wrapping
 */
export function createDrawerReactive(options = {}, plugins = []) {
  const drawer = createDrawer(options);
  
  // Apply plugins
  plugins.forEach(plugin => {
    if (plugin?.register) {
      plugin.register(drawer);
    }
  });
  
  return {
    // Core state getter (wrap with $state in component)
    getState: () => drawer.getState(),
    
    // Core methods
    open: drawer.open,
    close: drawer.close,
    toggle: drawer.toggle,
    
    // Registration methods
    registerTrigger: drawer.registerTrigger,
    registerContent: drawer.registerContent,
    
    // Change listener for reactivity
    onChange: drawer.onChange,
    
    // Direct access to core
    drawer
  };
}

/**
 * Svelte action for trigger elements
 * @param {HTMLElement} node
 * @param {Object} drawer - Drawer instance
 * @returns {Object} Action object
 */
export const drawerTrigger = (node, drawer) => {
  const cleanup = drawer?.registerTrigger?.(node) ?? (() => {});
  
  return {
    destroy: cleanup
  };
};

/**
 * Svelte action for content elements
 * @param {HTMLElement} node
 * @param {Object} params
 * @returns {Object} Action object
 */
export const drawerContent = (node, { drawer, ...options } = {}) => {
  let cleanup = drawer?.registerContent?.(node, options) ?? (() => {});
  
  return {
    update: ({ drawer: newDrawer, ...newOptions }) => {
      cleanup();
      cleanup = newDrawer?.registerContent?.(node, newOptions) ?? (() => {});
    },
    destroy: cleanup
  };
};

/**
 * Svelte action for drag gestures (requires @uip/plugin-gesture)
 * @param {HTMLElement} node
 * @param {Object} params
 * @returns {Object} Action object
 */
export const drawerDrag = (node, { drawer, plugin, ...options } = {}) => {
  const getInstance = (d) => d?.drawer ?? d;
  let cleanup = (() => {});
  
  if (plugin && getInstance(drawer)) {
    cleanup = plugin.register(getInstance(drawer), node, options);
  }
  
  return {
    update: ({ drawer: newDrawer, plugin: newPlugin, ...newOptions }) => {
      cleanup();
      const instance = getInstance(newDrawer);
      if (newPlugin && instance) {
        cleanup = newPlugin.register(instance, node, newOptions);
      }
    },
    destroy: cleanup
  };
};

// Legacy compatibility
export const createDrawerRunes = createDrawerReactive;

// Re-export core for convenience
export { createDrawer } from '@uip/core';