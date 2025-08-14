import { writable } from 'svelte/store';
import { createDrawer, registerDrawerDrag } from '@uikit/core';

/**
 * Creates a Svelte store for drawer - modern lean version
 * @param {Object} [options]
 * @returns {Object}
 */
export function drawerStore(options = {}) {
  const drawer = createDrawer(options);
  const { subscribe, set } = writable(drawer.getState());
  
  drawer.onChange(set);
  
  return {
    subscribe,
    open: drawer.open,
    close: drawer.close,
    toggle: drawer.toggle,
    registerTrigger: drawer.registerTrigger,
    registerContent: drawer.registerContent,
    registerDrag: (el, opts) => registerDrawerDrag(drawer, el, opts),
    drawer
  };
}

/**
 * Creates a runes-friendly drawer helper - for use with Svelte 5 $state
 * @param {Object} [options]
 * @returns {Object}
 */
export function createDrawerReactive(options = {}) {
  const drawer = createDrawer(options);
  
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
    registerDrag: (el, opts) => registerDrawerDrag(drawer, el, opts),
    
    // Change listener for reactivity
    onChange: drawer.onChange,
    
    // Direct access to core
    drawer
  };
}

// Legacy alias for compatibility
export const createDrawerRunes = createDrawerReactive;

/**
 * Svelte action for trigger - lean modern version
 */
export const drawerTrigger = (node, drawer) => ({
  destroy: drawer?.registerTrigger?.(node) ?? (() => {})
});

/**
 * Svelte action for content - lean modern version  
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
 * Svelte action for drag gesture - lean modern version
 */
export const drawerDrag = (node, { drawer, ...options } = {}) => {
  const getInstance = (d) => d?.drawer ?? d;
  let cleanup = getInstance(drawer) ? registerDrawerDrag(getInstance(drawer), node, options) : (() => {});
  
  return {
    update: ({ drawer: newDrawer, ...newOptions }) => {
      cleanup();
      const instance = getInstance(newDrawer);
      cleanup = instance ? registerDrawerDrag(instance, node, newOptions) : (() => {});
    },
    destroy: cleanup
  };
};

export { createDrawer, registerDrawerDrag } from '@uikit/core';