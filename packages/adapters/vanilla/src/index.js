/**
 * @uip/adapter-vanilla - Pure JavaScript Universal UI Protocol
 * Lean DOM integration with event delegation and auto-scan
 */

import { createDrawer } from '@uip/core';

/**
 * Create drawer with enhanced DOM capabilities
 * @param {Object} [options] - Drawer options
 * @returns {Object} Enhanced drawer instance
 */
export function createUniversalDrawer(options = {}) {
  const drawer = createDrawer(options);
  
  /**
   * Auto-scan container for drawer elements
   * Uses data-drawer attributes for universal discovery
   */
  drawer.autoScan = function(container = document) {
    const triggers = container.querySelectorAll('[data-drawer="trigger"]');
    const contents = container.querySelectorAll('[data-drawer="content"]');
    const closers = container.querySelectorAll('[data-drawer="close"]');
    
    const cleanups = [];
    
    // Register triggers
    triggers.forEach(el => {
      cleanups.push(this.registerTrigger(el));
    });
    
    // Register contents with inline options
    contents.forEach(el => {
      const contentOptions = {
        trapFocus: el.dataset.trapFocus !== 'false',
        closeOnEscape: el.dataset.closeEscape !== 'false',
        lockBodyScroll: el.dataset.lockScroll !== 'false'
      };
      cleanups.push(this.registerContent(el, contentOptions));
    });
    
    // Register close buttons
    closers.forEach(el => {
      const handleClose = () => this.close();
      el.addEventListener('click', handleClose);
      cleanups.push(() => el.removeEventListener('click', handleClose));
    });
    
    return () => cleanups.forEach(cleanup => cleanup?.());
  };
  
  return drawer;
}

/**
 * Quick setup with selectors
 * @param {string} triggerSelector - CSS selector for trigger
 * @param {string} contentSelector - CSS selector for content
 * @param {Object} [options] - Drawer options
 * @returns {Object} Drawer with cleanup
 */
export function createDrawer(triggerSelector, contentSelector, options = {}) {
  const drawer = createUniversalDrawer(options);
  
  const trigger = document.querySelector(triggerSelector);
  const content = document.querySelector(contentSelector);
  
  if (!trigger || !content) {
    console.warn('createDrawer: Elements not found', { triggerSelector, contentSelector });
    return drawer;
  }
  
  const cleanups = [
    drawer.registerTrigger(trigger),
    drawer.registerContent(content)
  ];
  
  return {
    ...drawer,
    destroy: () => cleanups.forEach(cleanup => cleanup())
  };
}

/**
 * Global auto-initialization with event delegation
 * Scans document for data-drawer="container" elements
 */
export function autoInit(defaultOptions = {}) {
  if (typeof document === 'undefined') return;
  
  const initContainers = () => {
    document.querySelectorAll('[data-drawer="container"]:not([data-uip-init])').forEach(container => {
      const drawer = createUniversalDrawer(defaultOptions);
      const cleanup = drawer.autoScan(container);
      
      // Mark as initialized
      container.dataset.uipInit = 'true';
      container._uipDrawer = drawer;
      container._uipCleanup = cleanup;
    });
  };
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContainers);
  } else {
    initContainers();
  }
  
  // Re-scan on dynamic content (optional observer)
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      requestAnimationFrame(initContainers);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return () => observer.disconnect();
  }
}

/**
 * State utilities for vanilla JS
 */
export const drawerUtils = {
  /**
   * Toggle CSS class based on drawer state
   */
  toggleClass: (element, drawer, className = 'drawer-open') => {
    const updateClass = ({ isOpen }) => {
      element.classList.toggle(className, isOpen);
    };
    updateClass(drawer.getState());
    return drawer.onChange(updateClass);
  },
  
  /**
   * Toggle data attribute based on drawer state
   */
  toggleAttribute: (element, drawer, attribute = 'data-drawer-open') => {
    const updateAttr = ({ isOpen }) => {
      if (isOpen) {
        element.setAttribute(attribute, '');
      } else {
        element.removeAttribute(attribute);
      }
    };
    updateAttr(drawer.getState());
    return drawer.onChange(updateAttr);
  }
};

// Legacy exports for compatibility
export { createUniversalDrawer as autoDrawer };
export { createDrawer as createDOMDrawer };

// Re-export core
export { createDrawer as createCoreDrawer } from '@uip/core';