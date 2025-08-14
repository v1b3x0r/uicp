/**
 * @uip/core/drawer - Universal Drawer Primitive
 * Lean, accessible, framework-agnostic drawer implementation
 */

import { enableFocusTrap, disableFocusTrap, focusFirstElement, storeFocus, restoreFocus } from './focus-trap.js';
import { lockBodyScroll, unlockBodyScroll } from './body-scroll-lock.js';
import { createEventSystem, createKeyboardHandler } from './events.js';

/**
 * @typedef {Object} DrawerState
 * @property {boolean} isOpen
 */

/**
 * @typedef {Object} DrawerOptions
 * @property {boolean} [initialOpen=false]
 * @property {Function} [onStateChange]
 */

/**
 * @typedef {Object} DrawerInstance
 * @property {boolean} isOpen
 * @property {Function} open
 * @property {Function} close
 * @property {Function} toggle
 * @property {Function} getState
 * @property {Function} onChange
 * @property {Function} onOpenStart
 * @property {Function} onOpenEnd
 * @property {Function} onCloseStart
 * @property {Function} onCloseEnd
 * @property {Function} registerTrigger
 * @property {Function} registerContent
 */

/**
 * Creates a drawer instance with state management and accessibility
 * @param {DrawerOptions} options
 * @returns {DrawerInstance}
 */
export function createDrawer(options = {}) {
  const { initialOpen = false, onStateChange } = options;
  
  let isOpen = initialOpen;
  let keyboardHandler = null;
  
  // Event system
  const events = createEventSystem();
  
  // Instance branding for debugging
  const instanceId = Math.random().toString(36).substring(2, 9);
  
  // Add initial change listener
  if (onStateChange) {
    events.onChange(onStateChange);
  }
  
  const api = {
    // Instance identification for debugging
    __uip_drawer__: true,
    __instanceId__: instanceId,
    
    get isOpen() {
      return isOpen;
    },
    
    getState() {
      return { isOpen };
    },
    
    open() {
      if (isOpen) return;
      
      isOpen = true;
      const state = api.getState();
      
      events.emitOpenStart(state);
      events.notifyChange(state);
      
      // Emit openEnd on next tick
      queueMicrotask(() => events.emitOpenEnd(state));
    },
    
    close() {
      if (!isOpen) return;
      
      isOpen = false;
      const state = api.getState();
      
      events.emitCloseStart(state);
      events.notifyChange(state);
      
      // Emit closeEnd on next tick
      queueMicrotask(() => events.emitCloseEnd(state));
    },
    
    toggle() {
      return isOpen ? api.close() : api.open();
    },
    
    // Event listeners
    onChange: events.onChange,
    onOpenStart: events.onOpenStart,
    onOpenEnd: events.onOpenEnd,
    onCloseStart: events.onCloseStart,
    onCloseEnd: events.onCloseEnd,
    
    /**
     * Register trigger element with accessibility
     * @param {HTMLElement} element 
     * @returns {Function} Cleanup function
     */
    registerTrigger(element) {
      if (!element?.addEventListener) {
        console.warn('registerTrigger: Invalid element provided');
        return () => {};
      }
      
      const handleClick = () => api.toggle();
      const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          api.toggle();
        }
      };
      
      const updateAria = (state) => {
        element.setAttribute('aria-expanded', String(state.isOpen));
      };
      
      // Setup accessibility
      updateAria(api.getState());
      element.hasAttribute('role') || element.setAttribute('role', 'button');
      element.hasAttribute('tabindex') || element.setAttribute('tabindex', '0');
      
      // Event listeners
      element.addEventListener('click', handleClick);
      element.addEventListener('keydown', handleKeyDown);
      const unsubscribe = api.onChange(updateAria);
      
      return () => {
        unsubscribe();
        element.removeEventListener('click', handleClick);
        element.removeEventListener('keydown', handleKeyDown);
      };
    },
    
    /**
     * Register content element with full accessibility features
     * @param {HTMLElement} element 
     * @param {Object} options
     * @returns {Function} Cleanup function
     */
    registerContent(element, options = {}) {
      if (!element?.addEventListener) {
        console.warn('registerContent: Invalid element');
        return () => {};
      }
      
      const { 
        trapFocus = true, 
        closeOnEscape = true, 
        lockBodyScroll: shouldLockScroll = true 
      } = options;
      
      // Create keyboard handler for escape
      if (closeOnEscape) {
        keyboardHandler = createKeyboardHandler(api.close);
      }
      
      const onOpen = () => {
        if (typeof document === 'undefined') return;
        
        // Store current focus
        storeFocus();
        
        // Lock body scroll
        if (shouldLockScroll) {
          lockBodyScroll();
        }
        
        // Enable keyboard shortcuts
        if (keyboardHandler) {
          keyboardHandler.enable();
        }
        
        // Setup focus trap
        if (trapFocus) {
          // Mark visible for a11y before focusing
          element.setAttribute('aria-hidden', 'false');
          enableFocusTrap(element);
          // Focus immediately to satisfy environments without RAF timing
          focusFirstElement(element);
        } else {
          element.setAttribute('aria-hidden', 'false');
        }
        
        // Update ARIA done above
      };
      
      const onClose = () => {
        if (typeof document === 'undefined') return;
        
        // Unlock body scroll
        if (shouldLockScroll) {
          unlockBodyScroll();
        }
        
        // Disable keyboard shortcuts
        if (keyboardHandler) {
          keyboardHandler.disable();
        }
        
        // Disable focus trap
        if (trapFocus) {
          disableFocusTrap();
        }
        
        // Update ARIA
        element.setAttribute('aria-hidden', 'true');
        
        // Restore focus
        restoreFocus();
      };
      
      // Subscribe to lifecycle events
      const unsubOpen = api.onOpenStart(onOpen);
      const unsubClose = api.onCloseStart(onClose);
      
      // Set initial ARIA state
      element.setAttribute('aria-hidden', String(!isOpen));
      
      return () => {
        unsubOpen();
        unsubClose();
        if (isOpen) onClose();
      };
    }
  };
  
  return api;
}

/**
 * Check if an object is a valid drawer instance
 * @param {any} drawer 
 * @returns {boolean}
 */
export function isValidDrawerInstance(drawer) {
  return drawer && 
         typeof drawer === 'object' &&
         drawer.__uip_drawer__ === true &&
         typeof drawer.__instanceId__ === 'string' &&
         typeof drawer.open === 'function' &&
         typeof drawer.close === 'function' &&
         typeof drawer.registerTrigger === 'function' &&
         typeof drawer.registerContent === 'function';
}