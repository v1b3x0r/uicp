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
 * Creates a drawer instance with state management
 * @param {DrawerOptions} options
 * @returns {DrawerInstance}
 */
export function createDrawer(options = {}) {
  const { initialOpen = false, onStateChange } = options;
  
  let isOpen = initialOpen;
  const listeners = new Set();
  const lifecycle = {
    openStart: new Set(),
    openEnd: new Set(),
    closeStart: new Set(),
    closeEnd: new Set()
  };
  
  let lastFocused = null;
  let contentElement = null;
  let scrollLocked = false;
  
  onStateChange && listeners.add(onStateChange);
  
  const api = {
    get isOpen() {
      return isOpen;
    },
    
    getState() {
      return { isOpen };
    },
    
    open: () => {
      if (isOpen) return;
      isOpen = true;
      emit(lifecycle.openStart);
      notify();
      queueMicrotask(() => emit(lifecycle.openEnd));
    },
    
    close: () => {
      if (!isOpen) return;
      isOpen = false;
      emit(lifecycle.closeStart);
      notify();
      queueMicrotask(() => emit(lifecycle.closeEnd));
    },
    
    toggle: () => isOpen ? api.close() : api.open(),
    
    onChange: (fn) => (listeners.add(fn), () => listeners.delete(fn)),
    
    onOpenStart: (fn) => (lifecycle.openStart.add(fn), () => lifecycle.openStart.delete(fn)),
    
    onOpenEnd: (fn) => (lifecycle.openEnd.add(fn), () => lifecycle.openEnd.delete(fn)),
    
    onCloseStart: (fn) => (lifecycle.closeStart.add(fn), () => lifecycle.closeStart.delete(fn)),
    
    onCloseEnd: (fn) => (lifecycle.closeEnd.add(fn), () => lifecycle.closeEnd.delete(fn)),
    
    registerTrigger(element) {
      if (!element || typeof element.addEventListener !== 'function') {
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
      
      updateAria(api.getState());
      element.addEventListener('click', handleClick);
      element.addEventListener('keydown', handleKeyDown);
      
      element.hasAttribute('role') || element.setAttribute('role', 'button');
      element.hasAttribute('tabindex') || element.setAttribute('tabindex', '0');
      
      const unsubscribe = api.onChange(updateAria);
      
      return () => {
        unsubscribe();
        element.removeEventListener('click', handleClick);
        element.removeEventListener('keydown', handleKeyDown);
      };
    },
    
    registerContent: (element, options = {}) => {
      if (!element?.addEventListener) {
        console.warn('registerContent: Invalid element');
        return () => {};
      }
      
      const { trapFocus = true, closeOnEscape = true, lockBodyScroll = true } = options;
      contentElement = element;
      
      const handleEscape = (e) => e.key === 'Escape' && closeOnEscape && api.close();
      
      const onOpen = () => {
        if (typeof document !== 'undefined') {
          lastFocused = document.activeElement;
          
          if (lockBodyScroll) {
            lockScroll();
          }
          
          if (closeOnEscape) {
            document.addEventListener('keydown', handleEscape);
          }
          
          if (trapFocus) {
            requestAnimationFrame(() => {
              focusFirstElement(element);
              enableFocusTrap(element);
            });
          }
          
          element.setAttribute('aria-hidden', 'false');
        }
      };
      
      const onClose = () => {
        if (typeof document !== 'undefined') {
          if (lockBodyScroll) {
            unlockScroll();
          }
          
          if (closeOnEscape) {
            document.removeEventListener('keydown', handleEscape);
          }
          
          if (trapFocus) {
            disableFocusTrap();
          }
          
          element.setAttribute('aria-hidden', 'true');
          
          lastFocused?.focus?.();
        }
      };
      
      const unsubOpen = api.onOpenStart(onOpen);
      const unsubClose = api.onCloseEnd(onClose);
      
      element.setAttribute('aria-hidden', String(!isOpen));
      
      return () => {
        unsubOpen();
        unsubClose();
        if (isOpen) onClose();
      };
    }
  };
  
  function notify() {
    const state = api.getState();
    listeners.forEach(fn => fn(state));
  }
  
  function emit(set) {
    const state = api.getState();
    set.forEach(fn => fn(state));
  }
  
  let focusTrapHandler = null;
  
  function enableFocusTrap(element) {
    if (typeof document === 'undefined') return;
    
    focusTrapHandler = (event) => {
      if (event.key !== 'Tab') return;
      
      const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), ' +
        'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      const focusable = Array.from(focusableElements);
      if (focusable.length === 0) return;
      
      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];
      
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };
    
    document.addEventListener('keydown', focusTrapHandler);
  }
  
  const disableFocusTrap = () => {
    if (focusTrapHandler && typeof document !== 'undefined') {
      document.removeEventListener('keydown', focusTrapHandler);
      focusTrapHandler = null;
    }
  };
  
  const focusFirstElement = (element) => {
    element.querySelector('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')?.focus();
  };
  
  let scrollbarWidth = 0;
  let originalBodyPaddingRight = '';
  
  const lockScroll = () => {
    if (typeof document === 'undefined' || scrollLocked) return;
    
    const body = document.body;
    const hasScrollbar = window.innerHeight < body.scrollHeight;
    
    if (hasScrollbar) {
      scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      originalBodyPaddingRight = body.style.paddingRight;
      body.style.paddingRight = `${scrollbarWidth}px`;
    }
    
    body.style.overflow = 'hidden';
    scrollLocked = true;
  }
  
  const unlockScroll = () => {
    if (typeof document === 'undefined' || !scrollLocked) return;
    
    const body = document.body;
    body.style.overflow = '';
    body.style.paddingRight = originalBodyPaddingRight;
    scrollLocked = false;
  }
  
  return api;
}