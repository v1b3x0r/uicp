/**
 * @uip/core - Popover Primitive
 * Click-triggered floating content with auto-positioning
 */

import { createEventSystem, createKeyboardHandler } from '../utils/events.js';
import { enableFocusTrap, disableFocusTrap, focusFirstElement } from '../utils/focus-trap.js';

/**
 * Create popover instance
 * @param {Object} options - Popover options
 * @param {Array} plugins - Optional plugins
 * @returns {Object} Popover API
 */
export function createPopover(options = {}, plugins = []) {
  const { 
    initialOpen = false,
    onStateChange,
    closeOnClickOutside = true,
    closeOnEscape = true
  } = options;
  
  let isOpen = initialOpen;
  const events = createEventSystem();
  let currentTriggerElement = null;
  
  // Add initial change listener
  if (onStateChange) {
    events.onChange(onStateChange);
  }
  
  const popover = {
    // Type identification for plugins
    _type: 'popover',
    _instanceId: Math.random().toString(36).substring(2, 9),
    
    get isOpen() {
      return isOpen;
    },
    
    getState() {
      return { isOpen, triggerElement: currentTriggerElement };
    },
    
    open(triggerElement = null) {
      if (isOpen) return;
      currentTriggerElement = triggerElement;
      isOpen = true;
      events.emit('openStart', popover.getState());
      events.emit('change', popover.getState());
      events.emitAsync('openEnd', popover.getState());
    },
    
    close() {
      if (!isOpen) return;
      isOpen = false;
      events.emit('closeStart', popover.getState());
      events.emit('change', popover.getState());
      events.emitAsync('closeEnd', popover.getState());
      currentTriggerElement = null;
    },
    
    toggle(triggerElement = null) {
      isOpen ? popover.close() : popover.open(triggerElement);
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
      
      const handleClick = (e) => {
        e.stopPropagation();
        popover.toggle(element);
      };
      
      const handleKeydown = createKeyboardHandler({
        onEnter: (e) => {
          e.preventDefault();
          popover.toggle(element);
        },
        onSpace: (e) => {
          e.preventDefault();
          popover.toggle(element);
        }
      });
      
      element.addEventListener('click', handleClick);
      element.addEventListener('keydown', handleKeydown);
      element.setAttribute('aria-haspopup', 'true');
      element.setAttribute('aria-expanded', String(isOpen));
      
      const unsubscribe = popover.onChange(({ isOpen }) => {
        element.setAttribute('aria-expanded', String(isOpen));
      });
      
      return () => {
        element.removeEventListener('click', handleClick);
        element.removeEventListener('keydown', handleKeydown);
        element.removeAttribute('aria-haspopup');
        element.removeAttribute('aria-expanded');
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
        trapFocus = false,
        autoFocus = false,
        position = 'bottom'
      } = options;
      
      let focusTrapCleanup = null;
      let clickOutsideHandler = null;
      
      const handleEscape = createKeyboardHandler({
        onEscape: () => closeOnEscape && popover.close()
      });
      
      const handleClickOutside = (e) => {
        if (!element.contains(e.target) && 
            currentTriggerElement && 
            !currentTriggerElement.contains(e.target)) {
          popover.close();
        }
      };
      
      const onOpen = () => {
        if (trapFocus) {
          focusTrapCleanup = enableFocusTrap(element, popover);
        }
        if (autoFocus) {
          requestAnimationFrame(() => focusFirstElement(element));
        }
        
        document.addEventListener('keydown', handleEscape);
        
        if (closeOnClickOutside) {
          // Delay to prevent immediate close
          setTimeout(() => {
            clickOutsideHandler = handleClickOutside;
            document.addEventListener('click', clickOutsideHandler);
          }, 0);
        }
        
        element.setAttribute('aria-hidden', 'false');
        element.style.display = '';
      };
      
      const onClose = () => {
        if (focusTrapCleanup) {
          focusTrapCleanup();
          focusTrapCleanup = null;
        }
        
        document.removeEventListener('keydown', handleEscape);
        
        if (clickOutsideHandler) {
          document.removeEventListener('click', clickOutsideHandler);
          clickOutsideHandler = null;
        }
        
        element.setAttribute('aria-hidden', 'true');
        element.style.display = 'none';
      };
      
      // Prevent clicks inside from closing
      element.addEventListener('click', (e) => e.stopPropagation());
      
      // Initial state
      element.setAttribute('role', 'dialog');
      element.setAttribute('aria-hidden', String(!isOpen));
      element.style.display = isOpen ? '' : 'none';
      
      if (isOpen) onOpen();
      
      // Subscribe to lifecycle
      const unsubOpen = popover.onOpenStart(onOpen);
      const unsubClose = popover.onCloseStart(onClose);
      
      return () => {
        unsubOpen();
        unsubClose();
        if (focusTrapCleanup) focusTrapCleanup();
        document.removeEventListener('keydown', handleEscape);
        if (clickOutsideHandler) {
          document.removeEventListener('click', clickOutsideHandler);
        }
      };
    }
  };
  
  // Apply plugins
  plugins.forEach(plugin => {
    if (typeof plugin === 'function') {
      plugin(popover);
    }
  });
  
  return popover;
}