/**
 * @uip/adapter-vanilla - Vanilla JavaScript helpers for Universal UI Protocol
 * Simple DOM utilities and auto-wiring for quick setup
 */

import { createDrawer } from '@uip/core';

/**
 * Auto-wire drawer with data attributes
 * @param {Object} [options] - Drawer options
 * @param {Array} [plugins] - Array of plugins to apply
 * @returns {Object} Drawer instance
 */
export function autoDrawer(options = {}, plugins = []) {
  const drawer = createDrawer(options);
  
  // Apply plugins
  plugins.forEach(plugin => {
    if (plugin?.register && plugin.element) {
      plugin.register(drawer, plugin.element, plugin.options);
    }
  });
  
  // Auto-wire elements with data attributes
  const triggers = document.querySelectorAll('[data-uip-drawer-trigger]');
  const contents = document.querySelectorAll('[data-uip-drawer-content]');
  
  const cleanups = [];
  
  triggers.forEach(trigger => {
    cleanups.push(drawer.registerTrigger(trigger));
  });
  
  contents.forEach(content => {
    const options = {
      trapFocus: content.dataset.uipTrapFocus !== 'false',
      closeOnEscape: content.dataset.uipCloseOnEscape !== 'false',
      lockBodyScroll: content.dataset.uipLockScroll !== 'false'
    };
    
    cleanups.push(drawer.registerContent(content, options));
  });
  
  // Return drawer with cleanup
  return {
    ...drawer,
    destroy: () => cleanups.forEach(cleanup => cleanup())
  };
}

/**
 * Create drawer with DOM query helpers
 * @param {string|HTMLElement} trigger - Trigger selector or element
 * @param {string|HTMLElement} content - Content selector or element
 * @param {Object} [options] - Drawer options
 * @param {Array} [plugins] - Array of plugins
 * @returns {Object} Drawer instance with cleanup
 */
export function createDOMDrawer(trigger, content, options = {}, plugins = []) {
  const drawer = createDrawer(options);
  
  const triggerEl = typeof trigger === 'string' 
    ? document.querySelector(trigger) 
    : trigger;
    
  const contentEl = typeof content === 'string'
    ? document.querySelector(content)
    : content;
  
  if (!triggerEl || !contentEl) {
    console.warn('createDOMDrawer: Could not find trigger or content elements');
    return drawer;
  }
  
  const cleanups = [
    drawer.registerTrigger(triggerEl),
    drawer.registerContent(contentEl)
  ];
  
  // Apply plugins
  plugins.forEach(plugin => {
    if (plugin?.register) {
      cleanups.push(plugin.register(drawer, contentEl, plugin.options));
    }
  });
  
  return {
    ...drawer,
    destroy: () => cleanups.forEach(cleanup => cleanup())
  };
}

/**
 * Simple state observer for vanilla JS
 * @param {Object} drawer - Drawer instance
 * @param {Function} callback - State change callback
 * @returns {Function} Unsubscribe function
 */
export function observeDrawer(drawer, callback) {
  return drawer.onChange(callback);
}

/**
 * CSS class toggler utility
 * @param {HTMLElement} element 
 * @param {Object} drawer
 * @param {string} [openClass='open']
 * @returns {Function} Cleanup function
 */
export function toggleClass(element, drawer, openClass = 'open') {
  const update = ({ isOpen }) => {
    element.classList.toggle(openClass, isOpen);
  };
  
  // Set initial state
  update(drawer.getState());
  
  return drawer.onChange(update);
}

/**
 * Attribute toggler utility
 * @param {HTMLElement} element
 * @param {Object} drawer
 * @param {string} [attribute='data-open']
 * @returns {Function} Cleanup function
 */
export function toggleAttribute(element, drawer, attribute = 'data-open') {
  const update = ({ isOpen }) => {
    if (isOpen) {
      element.setAttribute(attribute, '');
    } else {
      element.removeAttribute(attribute);
    }
  };
  
  // Set initial state
  update(drawer.getState());
  
  return drawer.onChange(update);
}

/**
 * Legacy setupDrawer with options object (for backwards compatibility)
 * @param {Object} config - Configuration object
 * @param {HTMLElement} config.trigger - Trigger element
 * @param {HTMLElement} config.content - Content element
 * @param {Object} [config.dragOptions] - Drag options
 * @returns {Object} Drawer instance
 */
export function setupDrawer({ trigger, content, dragOptions = {} }) {
  const plugins = [];
  
  // Create gesture plugin if dragOptions provided
  if (dragOptions && Object.keys(dragOptions).length > 0) {
    // For now, create a simple plugin-like structure
    // In real implementation, would use @uip/plugin-gesture
    plugins.push({
      register: (drawer, element) => {
        // Simple drag implementation would go here
        // For demo purposes, just return empty cleanup
        return () => {};
      }
    });
  }
  
  return createDOMDrawer(trigger, content, {}, plugins);
}

// Re-export core for convenience
export { createDrawer } from '@uip/core';