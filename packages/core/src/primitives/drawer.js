/**
 * @uip/core - Drawer Primitive
 * Sliding panel UI with gestures and animations
 */

import { enableFocusTrap, disableFocusTrap, focusFirstElement } from '../utils/focus-trap.js';
import { lockBodyScroll, unlockBodyScroll } from '../utils/scroll-lock.js';
import { createEventSystem, createKeyboardHandler } from '../utils/events.js';

/**
 * Create drawer instance
 * @param {Object} options - Drawer options
 * @param {Array} plugins - Optional plugins
 * @returns {Object} Drawer API
 */
export function createDrawer(options = {}, plugins = []) {
  const { 
    initialOpen = false,
    onStateChange 
  } = options;
  
  let isOpen = initialOpen;
  const events = createEventSystem();
  
  // Add initial change listener
  if (onStateChange) {
    events.onChange(onStateChange);
  }
  
  const drawer = {
    // Type identification for plugins
    _type: 'drawer',
    _instanceId: Math.random().toString(36).substring(2, 9),
    
    get isOpen() {
      return isOpen;
    },
    
    getState() {
      return { isOpen };
    },
    
    open() {
      if (isOpen) return;
      isOpen = true;
      events.emit('openStart', drawer.getState());
      events.emit('change', drawer.getState());
      events.emitAsync('openEnd', drawer.getState());
    },
    
    close() {
      if (!isOpen) return;
      isOpen = false;
      events.emit('closeStart', drawer.getState());
      events.emit('change', drawer.getState());
      events.emitAsync('closeEnd', drawer.getState());
    },
    
    toggle() {
      isOpen ? drawer.close() : drawer.open();
    },
    
    // Event subscriptions
    onChange: events.onChange,
    onOpenStart: events.onOpenStart,
    onOpenEnd: events.onOpenEnd,
    onCloseStart: events.onCloseStart,
    onCloseEnd: events.onCloseEnd,
    
    /**
     * Register trigger element
     * @param {HTMLElement} element
     * @param {Object} options
     * @returns {Function} Cleanup
     */
    registerTrigger(element, options = {}) {
      if (!element?.addEventListener) {
        console.warn('Invalid trigger element');
        return () => {};
      }
      
      const handleClick = () => drawer.toggle();
      const handleKeydown = createKeyboardHandler({
        onEnter: (e) => {
          e.preventDefault();
          drawer.toggle();
        },
        onSpace: (e) => {
          e.preventDefault();
          drawer.toggle();
        }
      });
      
      element.addEventListener('click', handleClick);
      element.addEventListener('keydown', handleKeydown);
      element.setAttribute('aria-expanded', String(isOpen));
      element.setAttribute('aria-haspopup', 'dialog');
      
      const unsubscribe = drawer.onChange(({ isOpen }) => {
        element.setAttribute('aria-expanded', String(isOpen));
      });
      
      return () => {
        element.removeEventListener('click', handleClick);
        element.removeEventListener('keydown', handleKeydown);
        element.removeAttribute('aria-expanded');
        element.removeAttribute('aria-haspopup');
        unsubscribe();
      };
    },
    
    /**
     * Register content element
     * @param {HTMLElement} element
     * @param {Object} options
     * @returns {Function} Cleanup
     */
    registerContent(element, options = {}) {
      if (!element) {
        console.warn('Invalid content element');
        return () => {};
      }
      
      const {
        trapFocus = true,
        lockScroll = true,
        closeOnEscape = true,
        autoFocus = true
      } = options;
      
      let focusTrapCleanup = null;
      
      const handleEscape = createKeyboardHandler({
        onEscape: () => closeOnEscape && drawer.close()
      });
      
      const onOpen = () => {
        if (lockScroll) lockBodyScroll();
        if (trapFocus) {
          focusTrapCleanup = enableFocusTrap(element, drawer);
        }
        if (autoFocus) {
          requestAnimationFrame(() => focusFirstElement(element));
        }
        document.addEventListener('keydown', handleEscape);
        element.setAttribute('aria-modal', 'true');
        element.setAttribute('role', 'dialog');
        element.setAttribute('aria-hidden', 'false');
      };
      
      const onClose = () => {
        if (focusTrapCleanup) {
          focusTrapCleanup();
          focusTrapCleanup = null;
        }
        if (lockScroll) unlockBodyScroll();
        document.removeEventListener('keydown', handleEscape);
        element.setAttribute('aria-hidden', 'true');
      };
      
      // Initial state
      element.setAttribute('aria-hidden', String(!isOpen));
      if (isOpen) onOpen();
      
      // Subscribe to lifecycle
      const unsubOpen = drawer.onOpenStart(onOpen);
      const unsubClose = drawer.onCloseStart(onClose);
      
      return () => {
        unsubOpen();
        unsubClose();
        if (focusTrapCleanup) focusTrapCleanup();
        if (lockScroll && isOpen) unlockBodyScroll();
        document.removeEventListener('keydown', handleEscape);
      };
    }
  };
  
  // Apply plugins
  plugins.forEach(plugin => {
    if (typeof plugin === 'function') {
      plugin(drawer);
    }
  });
  
  return drawer;
}