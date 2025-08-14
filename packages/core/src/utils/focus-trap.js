/**
 * Focus management utilities - Universal for all primitives
 * Uses WeakMap to prevent memory leaks with multiple instances
 */

// Use WeakMap to store trap handlers per instance
const trapHandlers = new WeakMap();
const lastFocusedElements = new WeakMap();

/**
 * Enable focus trap within element
 * @param {HTMLElement} element - Element to trap focus within
 * @param {Object} instance - Primitive instance (drawer, modal, etc.)
 * @returns {Function} Cleanup function
 */
export function enableFocusTrap(element, instance) {
  if (typeof document === 'undefined' || !element || !instance) return () => {};
  
  // Store last focused element for this instance
  lastFocusedElements.set(instance, document.activeElement);
  
  const handler = (event) => {
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
  
  // Store handler for this instance
  trapHandlers.set(instance, handler);
  document.addEventListener('keydown', handler);
  
  // Return cleanup function
  return () => disableFocusTrap(instance);
}

/**
 * Disable focus trap
 * @param {Object} instance - Primitive instance
 */
export function disableFocusTrap(instance) {
  if (typeof document === 'undefined' || !instance) return;
  
  const handler = trapHandlers.get(instance);
  if (handler) {
    document.removeEventListener('keydown', handler);
    trapHandlers.delete(instance);
  }
  
  // Restore focus
  const lastFocused = lastFocusedElements.get(instance);
  if (lastFocused?.focus) {
    lastFocused.focus();
    lastFocusedElements.delete(instance);
  }
}

/**
 * Focus first focusable element
 * @param {HTMLElement} element 
 */
export function focusFirstElement(element) {
  if (!element) return;
  
  const firstFocusable = element.querySelector(
    'a[href], button:not([disabled]), textarea:not([disabled]), ' +
    'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  firstFocusable?.focus();
}

/**
 * Store current focused element for instance
 * @param {Object} instance - Primitive instance
 */
export function storeFocus(instance) {
  if (typeof document !== 'undefined' && instance) {
    lastFocusedElements.set(instance, document.activeElement);
  }
}

/**
 * Restore previously focused element for instance
 * @param {Object} instance - Primitive instance
 */
export function restoreFocus(instance) {
  if (!instance) return;
  
  const lastFocused = lastFocusedElements.get(instance);
  if (lastFocused?.focus) {
    lastFocused.focus();
    lastFocusedElements.delete(instance);
  }
}