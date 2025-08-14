/**
 * @uip/adapter-svelte - Svelte Universal UI Protocol
 * Generic adapter for any UIP primitive with Svelte reactivity
 */

import { writable } from 'svelte/store';
import { createDrawer } from '@uip/core';

/**
 * Generic factory for any UIP primitive store
 * @param {Object} corePrimitive - Core primitive instance
 * @returns {Object} Svelte store with primitive methods
 */
export function createPrimitiveStore(corePrimitive) {
  if (!corePrimitive) throw new Error('core primitive instance required');
  
  const { subscribe, set } = writable(corePrimitive.getState());
  const unsubscribe = corePrimitive.onChange(set);
  
  return {
    subscribe,
    // Pass-through core methods
    ...corePrimitive,
    destroy: unsubscribe
  };
}

/**
 * Create drawer store (alias for drawer primitive)
 * @param {Object} [options] - Drawer options
 * @param {Array} [plugins] - Plugins to apply
 * @returns {Object} Drawer store
 */
export function createDrawerStore(options = {}, plugins = []) {
  return createPrimitiveStore(createDrawer(options, plugins));
}

/**
 * Svelte action for drawer triggers
 * @param {HTMLElement} node - Trigger element  
 * @param {Object} params - { drawer } or drawer instance
 * @returns {Object} Svelte action
 */
export function drawerTrigger(node, params) {
  let core = params?.drawer || params;
  if (!core?.registerTrigger) {
    console.warn('drawerTrigger: invalid drawer instance');
    return { destroy: () => {} };
  }
  
  let dispose = core.registerTrigger(node);
  
  return {
    update(newParams) {
      const next = newParams?.drawer || newParams;
      if (next === core) return; // Skip if same instance
      
      dispose();
      core = next;
      dispose = core.registerTrigger(node);
    },
    destroy() {
      dispose();
    }
  };
}

/**
 * Svelte action for drawer content
 * @param {HTMLElement} node - Content element
 * @param {Object} params - { drawer, options }
 * @returns {Object} Svelte action  
 */
export function drawerContent(node, params) {
  let core = params?.drawer || params;
  if (!core?.registerContent) {
    console.warn('drawerContent: invalid drawer instance');
    return { destroy: () => {} };
  }
  
  let dispose = core.registerContent(node, params.options || {});
  
  return {
    update(newParams) {
      const next = newParams?.drawer || newParams;
      if (next === core) return; // Skip if same instance
      
      dispose();
      core = next;
      dispose = core.registerContent(node, newParams.options || {});
    },
    destroy() {
      dispose();
    }
  };
}

/**
 * Svelte action for auto-scanning containers (opt-in)
 * @param {HTMLElement} node - Container element
 * @param {Object} params - { drawer } or drawer instance  
 * @returns {Object} Svelte action
 */
export function drawerScan(node, params) {
  let core = params?.drawer || params;
  if (!core?.autoScan) {
    console.warn('drawerScan: autoScan not available on this drawer instance');
    return { destroy: () => {} };
  }
  
  let dispose = core.autoScan(node);
  
  return {
    update(newParams) {
      const next = newParams?.drawer || newParams;
      if (next === core) return; // Skip if same instance
      
      dispose();
      core = next;
      dispose = core.autoScan(node);
    },
    destroy() {
      dispose();
    }
  };
}

// Re-export core for convenience
export { createDrawer } from '@uip/core';