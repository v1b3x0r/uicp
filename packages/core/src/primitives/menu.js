/**
 * @uip/core - Menu Primitive
 * Context menu with keyboard navigation and submenus
 */

import { createEventSystem, createKeyboardHandler } from '../utils/events.js';
import { enableFocusTrap, disableFocusTrap, focusFirstElement } from '../utils/focus-trap.js';

/**
 * Create menu instance
 * @param {Object} options - Menu options
 * @param {Array} plugins - Optional plugins
 * @returns {Object} Menu API
 */
export function createMenu(options = {}, plugins = []) {
  const { 
    initialOpen = false,
    onStateChange,
    closeOnSelect = true,
    closeOnEscape = true,
    closeOnClickOutside = true
  } = options;
  
  let isOpen = initialOpen;
  let currentIndex = -1;
  let items = [];
  const events = createEventSystem();
  let currentTriggerElement = null;
  
  // Add initial change listener
  if (onStateChange) {
    events.onChange(onStateChange);
  }
  
  const menu = {
    // Type identification for plugins
    _type: 'menu',
    _instanceId: Math.random().toString(36).substring(2, 9),
    
    get isOpen() {
      return isOpen;
    },
    
    getState() {
      return { 
        isOpen, 
        currentIndex,
        triggerElement: currentTriggerElement 
      };
    },
    
    open(triggerElement = null, position = null) {
      if (isOpen) return;
      currentTriggerElement = triggerElement;
      isOpen = true;
      currentIndex = -1;
      events.emit('openStart', { ...menu.getState(), position });
      events.emit('change', menu.getState());
      events.emitAsync('openEnd', menu.getState());
    },
    
    close() {
      if (!isOpen) return;
      isOpen = false;
      currentIndex = -1;
      events.emit('closeStart', menu.getState());
      events.emit('change', menu.getState());
      events.emitAsync('closeEnd', menu.getState());
      currentTriggerElement = null;
    },
    
    toggle(triggerElement = null) {
      isOpen ? menu.close() : menu.open(triggerElement);
    },
    
    // Navigation methods
    focusNext() {
      if (!isOpen || items.length === 0) return;
      currentIndex = (currentIndex + 1) % items.length;
      items[currentIndex]?.focus();
      events.emit('change', menu.getState());
    },
    
    focusPrevious() {
      if (!isOpen || items.length === 0) return;
      currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
      items[currentIndex]?.focus();
      events.emit('change', menu.getState());
    },
    
    selectCurrent() {
      if (currentIndex >= 0 && items[currentIndex]) {
        const item = items[currentIndex];
        item.click();
        if (closeOnSelect) menu.close();
      }
    },
    
    // Event subscriptions
    onChange: events.onChange,
    onOpenStart: events.onOpenStart,
    onOpenEnd: events.onOpenEnd,
    onCloseStart: events.onCloseStart,
    onCloseEnd: events.onCloseEnd,
    
    /**
     * Register trigger element (button or context area)
     * @param {HTMLElement} element
     * @param {Object} options
     * @returns {Function} Cleanup
     */
    registerTrigger(element, options = {}) {
      if (!element?.addEventListener) {
        console.warn('Invalid trigger element');
        return () => {};
      }
      
      const {
        triggerOnClick = true,
        triggerOnContextMenu = false
      } = options;
      
      const handleClick = (e) => {
        if (triggerOnClick) {
          e.preventDefault();
          e.stopPropagation();
          menu.toggle(element);
        }
      };
      
      const handleContextMenu = (e) => {
        if (triggerOnContextMenu) {
          e.preventDefault();
          const position = { x: e.clientX, y: e.clientY };
          menu.open(element, position);
        }
      };
      
      const handleKeydown = createKeyboardHandler({
        onEnter: (e) => {
          e.preventDefault();
          menu.toggle(element);
        },
        onSpace: (e) => {
          e.preventDefault();
          menu.toggle(element);
        },
        onArrowDown: (e) => {
          e.preventDefault();
          if (!isOpen) {
            menu.open(element);
          }
        }
      });
      
      if (triggerOnClick) {
        element.addEventListener('click', handleClick);
      }
      
      if (triggerOnContextMenu) {
        element.addEventListener('contextmenu', handleContextMenu);
      }
      
      element.addEventListener('keydown', handleKeydown);
      element.setAttribute('aria-haspopup', 'menu');
      element.setAttribute('aria-expanded', String(isOpen));
      
      const unsubscribe = menu.onChange(({ isOpen }) => {
        element.setAttribute('aria-expanded', String(isOpen));
      });
      
      return () => {
        if (triggerOnClick) {
          element.removeEventListener('click', handleClick);
        }
        if (triggerOnContextMenu) {
          element.removeEventListener('contextmenu', handleContextMenu);
        }
        element.removeEventListener('keydown', handleKeydown);
        element.removeAttribute('aria-haspopup');
        element.removeAttribute('aria-expanded');
        unsubscribe();
      };
    },
    
    /**
     * Register menu content element
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
        autoFocus = true
      } = options;
      
      let focusTrapCleanup = null;
      let clickOutsideHandler = null;
      
      const updateItems = () => {
        items = Array.from(element.querySelectorAll(
          '[role="menuitem"]:not([disabled]), ' +
          '[role="menuitemcheckbox"]:not([disabled]), ' +
          '[role="menuitemradio"]:not([disabled])'
        ));
      };
      
      const handleKeydown = createKeyboardHandler({
        onEscape: () => closeOnEscape && menu.close(),
        onArrowDown: (e) => {
          e.preventDefault();
          menu.focusNext();
        },
        onArrowUp: (e) => {
          e.preventDefault();
          menu.focusPrevious();
        },
        onEnter: (e) => {
          e.preventDefault();
          menu.selectCurrent();
        },
        onSpace: (e) => {
          e.preventDefault();
          menu.selectCurrent();
        }
      });
      
      const handleClickOutside = (e) => {
        if (!element.contains(e.target) && 
            currentTriggerElement && 
            !currentTriggerElement.contains(e.target)) {
          menu.close();
        }
      };
      
      const onOpen = () => {
        updateItems();
        
        if (trapFocus) {
          focusTrapCleanup = enableFocusTrap(element, menu);
        }
        if (autoFocus && items.length > 0) {
          requestAnimationFrame(() => {
            currentIndex = 0;
            items[0].focus();
          });
        }
        
        element.addEventListener('keydown', handleKeydown);
        
        if (closeOnClickOutside) {
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
        
        element.removeEventListener('keydown', handleKeydown);
        
        if (clickOutsideHandler) {
          document.removeEventListener('click', clickOutsideHandler);
          clickOutsideHandler = null;
        }
        
        element.setAttribute('aria-hidden', 'true');
        element.style.display = 'none';
        
        // Return focus to trigger
        if (currentTriggerElement?.focus) {
          currentTriggerElement.focus();
        }
      };
      
      // Prevent clicks inside from closing (unless on menu item)
      element.addEventListener('click', (e) => {
        const isMenuItem = e.target.closest('[role^="menuitem"]');
        if (!isMenuItem) {
          e.stopPropagation();
        }
      });
      
      // Initial state
      element.setAttribute('role', 'menu');
      element.setAttribute('aria-hidden', String(!isOpen));
      element.style.display = isOpen ? '' : 'none';
      
      if (isOpen) onOpen();
      
      // Subscribe to lifecycle
      const unsubOpen = menu.onOpenStart(onOpen);
      const unsubClose = menu.onCloseStart(onClose);
      
      return () => {
        unsubOpen();
        unsubClose();
        if (focusTrapCleanup) focusTrapCleanup();
        element.removeEventListener('keydown', handleKeydown);
        if (clickOutsideHandler) {
          document.removeEventListener('click', clickOutsideHandler);
        }
      };
    },
    
    /**
     * Register menu item
     * @param {HTMLElement} element
     * @param {Object} options
     * @returns {Function} Cleanup
     */
    registerItem(element, options = {}) {
      if (!element) return () => {};
      
      const { onSelect } = options;
      
      element.setAttribute('role', 'menuitem');
      element.setAttribute('tabindex', '-1');
      
      const handleClick = () => {
        onSelect?.();
        if (closeOnSelect) menu.close();
      };
      
      const handleKeydown = createKeyboardHandler({
        onEnter: (e) => {
          e.preventDefault();
          handleClick();
        },
        onSpace: (e) => {
          e.preventDefault();
          handleClick();
        }
      });
      
      element.addEventListener('click', handleClick);
      element.addEventListener('keydown', handleKeydown);
      
      return () => {
        element.removeEventListener('click', handleClick);
        element.removeEventListener('keydown', handleKeydown);
        element.removeAttribute('role');
        element.removeAttribute('tabindex');
      };
    }
  };
  
  // Apply plugins
  plugins.forEach(plugin => {
    if (typeof plugin === 'function') {
      plugin(menu);
    }
  });
  
  return menu;
}