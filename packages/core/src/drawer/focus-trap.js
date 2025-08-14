/**
 * Focus management utilities for drawers
 * Lean, efficient focus trapping and restoration
 */

let focusTrapHandler = null;
let lastFocused = null;

/**
 * Enable focus trap within element
 * @param {HTMLElement} element 
 */
export function enableFocusTrap(element) {
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

/**
 * Disable focus trap
 */
export function disableFocusTrap() {
  if (focusTrapHandler && typeof document !== 'undefined') {
    document.removeEventListener('keydown', focusTrapHandler);
    focusTrapHandler = null;
  }
}

/**
 * Focus first focusable element
 * @param {HTMLElement} element 
 */
export function focusFirstElement(element) {
  const firstFocusable = element.querySelector(
    'a[href], button:not([disabled]), textarea:not([disabled]), ' +
    'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  firstFocusable?.focus();
}

/**
 * Store current focused element
 */
export function storeFocus() {
  if (typeof document !== 'undefined') {
    lastFocused = document.activeElement;
  }
}

/**
 * Restore previously focused element
 */
export function restoreFocus() {
  lastFocused?.focus?.();
  lastFocused = null;
}