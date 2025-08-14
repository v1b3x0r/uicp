/**
 * @uip/core - Modal Primitive
 * Overlay dialog with backdrop and focus management
 */

import { enableFocusTrap, disableFocusTrap, focusFirstElement } from '../utils/focus-trap.js';
import { lockBodyScroll, unlockBodyScroll } from '../utils/scroll-lock.js';
import { createEventSystem, createKeyboardHandler } from '../utils/events.js';

/**
 * Create modal instance
 * @param {Object} options - Modal options
 * @param {Array} plugins - Optional plugins
 * @returns {Object} Modal API
 */
export function createModal(options = {}, plugins = []) {
  const { 
    initialOpen = false,
    onStateChange,
    closeOnBackdrop = true,
    closeOnEscape = true
  } = options;
  
  let isOpen = initialOpen;
  const events = createEventSystem();
  
  // Add initial change listener
  if (onStateChange) {
    events.onChange(onStateChange);
  }
  
  const modal = {
    // Type identification for plugins
    _type: 'modal',
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
      events.emit('openStart', modal.getState());
      events.emit('change', modal.getState());
      events.emitAsync('openEnd', modal.getState());
    },
    
    close() {
      if (!isOpen) return;
      isOpen = false;
      events.emit('closeStart', modal.getState());
      events.emit('change', modal.getState());
      events.emitAsync('closeEnd', modal.getState());
    },
    
    toggle() {
      isOpen ? modal.close() : modal.open();
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
      
      const handleClick = () => modal.open();
      const handleKeydown = createKeyboardHandler({
        onEnter: (e) => {
          e.preventDefault();
          modal.open();
        },
        onSpace: (e) => {
          e.preventDefault();
          modal.open();
        }
      });
      
      element.addEventListener('click', handleClick);
      element.addEventListener('keydown', handleKeydown);
      element.setAttribute('aria-haspopup', 'dialog');
      
      return () => {
        element.removeEventListener('click', handleClick);
        element.removeEventListener('keydown', handleKeydown);
        element.removeAttribute('aria-haspopup');
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
        autoFocus = true,
        portal = false
      } = options;
      
      let focusTrapCleanup = null;
      let portalElement = null;
      
      const handleEscape = createKeyboardHandler({
        onEscape: () => closeOnEscape && modal.close()
      });
      
      const onOpen = () => {
        // Portal rendering
        if (portal && typeof document !== 'undefined') {
          portalElement = document.createElement('div');
          portalElement.className = 'uip-modal-portal';
          document.body.appendChild(portalElement);
          portalElement.appendChild(element);
        }
        
        if (lockScroll) lockBodyScroll();
        if (trapFocus) {
          focusTrapCleanup = enableFocusTrap(element, modal);
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
        
        // Clean up portal
        if (portalElement && portalElement.parentNode) {
          if (element.parentNode === portalElement) {
            document.body.appendChild(element);
          }
          portalElement.remove();
          portalElement = null;
        }
      };
      
      // Initial state
      element.setAttribute('aria-hidden', String(!isOpen));
      if (isOpen) onOpen();
      
      // Subscribe to lifecycle
      const unsubOpen = modal.onOpenStart(onOpen);
      const unsubClose = modal.onCloseEnd(onClose);
      
      return () => {
        unsubOpen();
        unsubClose();
        if (focusTrapCleanup) focusTrapCleanup();
        if (lockScroll && isOpen) unlockBodyScroll();
        document.removeEventListener('keydown', handleEscape);
        if (portalElement) portalElement.remove();
      };
    },
    
    /**
     * Register backdrop element
     * @param {HTMLElement} element
     * @param {Object} options
     * @returns {Function} Cleanup
     */
    registerBackdrop(element, options = {}) {
      if (!element?.addEventListener) {
        console.warn('Invalid backdrop element');
        return () => {};
      }
      
      const handleClick = (e) => {
        if (e.target === element && closeOnBackdrop) {
          modal.close();
        }
      };
      
      element.addEventListener('click', handleClick);
      element.setAttribute('aria-hidden', 'true');
      
      const updateVisibility = ({ isOpen }) => {
        element.style.display = isOpen ? '' : 'none';
      };
      
      // Initial state
      updateVisibility(modal.getState());
      
      const unsubscribe = modal.onChange(updateVisibility);
      
      return () => {
        element.removeEventListener('click', handleClick);
        unsubscribe();
      };
    }
  };
  
  // Apply plugins
  plugins.forEach(plugin => {
    if (typeof plugin === 'function') {
      plugin(modal);
    }
  });
  
  return modal;
}