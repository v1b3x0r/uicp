import { writable } from 'svelte/store';
import { createDrawer, registerDrawerDrag } from '@uikit/core';

/**
 * Creates a Svelte store for drawer
 * @param {Object} [options]
 * @returns {Object}
 */
export function drawerStore(options = {}) {
  const drawer = createDrawer(options);
  const { subscribe, set } = writable(drawer.getState());
  
  drawer.onChange((state) => set(state));
  
  return {
    subscribe,
    open: () => drawer.open(),
    close: () => drawer.close(),
    toggle: () => drawer.toggle(),
    registerTrigger: (element) => drawer.registerTrigger(element),
    registerContent: (element, opts) => drawer.registerContent(element, opts),
    registerDrag: (element, opts) => registerDrawerDrag(drawer, element, opts),
    drawer
  };
}

/**
 * Svelte action for trigger element
 * @param {HTMLElement} node
 * @param {Object} drawer
 */
export function drawerTrigger(node, drawer) {
  let cleanup;
  
  if (drawer && drawer.registerTrigger) {
    cleanup = drawer.registerTrigger(node);
  }
  
  return {
    destroy() {
      if (cleanup) cleanup();
    }
  };
}

/**
 * Svelte action for content element
 * @param {HTMLElement} node
 * @param {Object} params
 */
export function drawerContent(node, params = {}) {
  const { drawer, ...options } = params;
  let cleanup;
  
  if (drawer && drawer.registerContent) {
    cleanup = drawer.registerContent(node, options);
  }
  
  return {
    update(newParams) {
      if (cleanup) cleanup();
      const { drawer: newDrawer, ...newOptions } = newParams;
      if (newDrawer && newDrawer.registerContent) {
        cleanup = newDrawer.registerContent(node, newOptions);
      }
    },
    destroy() {
      if (cleanup) cleanup();
    }
  };
}

/**
 * Svelte action for drag gesture
 * @param {HTMLElement} node
 * @param {Object} params
 */
export function drawerDrag(node, params = {}) {
  const { drawer, ...options } = params;
  let cleanup;
  
  if (drawer) {
    const drawerInstance = drawer.drawer || drawer;
    cleanup = registerDrawerDrag(drawerInstance, node, options);
  }
  
  return {
    update(newParams) {
      if (cleanup) cleanup();
      const { drawer: newDrawer, ...newOptions } = newParams;
      if (newDrawer) {
        const drawerInstance = newDrawer.drawer || newDrawer;
        cleanup = registerDrawerDrag(drawerInstance, node, newOptions);
      }
    },
    destroy() {
      if (cleanup) cleanup();
    }
  };
}

export { createDrawer, registerDrawerDrag } from '@uikit/core';