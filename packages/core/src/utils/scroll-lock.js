/**
 * Body scroll lock utility - Universal for all primitives
 * Handles multiple instances with reference counting
 */

let scrollLockCount = 0;
let scrollbarWidth = null;
let originalStyles = null;

/**
 * Get scrollbar width
 * @returns {number} Scrollbar width in pixels
 */
function getScrollbarWidth() {
  if (scrollbarWidth !== null) return scrollbarWidth;
  
  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.overflow = 'scroll';
  document.body.appendChild(outer);
  
  const inner = document.createElement('div');
  outer.appendChild(inner);
  
  scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
  outer.remove();
  
  return scrollbarWidth;
}

/**
 * Lock body scroll
 */
export function lockBodyScroll() {
  if (typeof document === 'undefined') return;
  
  scrollLockCount++;
  
  // Only lock on first call
  if (scrollLockCount === 1) {
    originalStyles = {
      overflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight
    };
    
    // Prevent layout shift by compensating for scrollbar
    const width = getScrollbarWidth();
    if (width > 0) {
      const currentPadding = parseInt(window.getComputedStyle(document.body).paddingRight, 10) || 0;
      document.body.style.paddingRight = `${currentPadding + width}px`;
    }
    
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Unlock body scroll
 */
export function unlockBodyScroll() {
  if (typeof document === 'undefined' || scrollLockCount === 0) return;
  
  scrollLockCount--;
  
  // Only unlock when all locks are released
  if (scrollLockCount === 0 && originalStyles) {
    document.body.style.overflow = originalStyles.overflow;
    document.body.style.paddingRight = originalStyles.paddingRight;
    originalStyles = null;
  }
}

/**
 * Check if scroll is currently locked
 * @returns {boolean}
 */
export function isScrollLocked() {
  return scrollLockCount > 0;
}

/**
 * Reset scroll lock (emergency cleanup)
 */
export function resetScrollLock() {
  scrollLockCount = 0;
  if (originalStyles && typeof document !== 'undefined') {
    document.body.style.overflow = originalStyles.overflow;
    document.body.style.paddingRight = originalStyles.paddingRight;
    originalStyles = null;
  }
}