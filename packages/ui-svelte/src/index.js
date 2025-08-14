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