/**
 * Body scroll lock utilities
 * Prevents layout shift by calculating scrollbar width
 */

let scrollLocked = false;
let scrollbarWidth = 0;
let originalBodyPaddingRight = '';

/**
 * Lock body scroll and compensate for scrollbar width
 */
export function lockBodyScroll() {
  if (typeof document === 'undefined' || scrollLocked) return;
  
  const body = document.body;
  const hasScrollbar = window.innerHeight < body.scrollHeight;
  
  // Calculate and compensate for scrollbar width
  if (hasScrollbar) {
    scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    originalBodyPaddingRight = body.style.paddingRight;
    body.style.paddingRight = `${scrollbarWidth}px`;
  }
  
  body.style.overflow = 'hidden';
  scrollLocked = true;
}

/**
 * Unlock body scroll and restore original padding
 */
export function unlockBodyScroll() {
  if (typeof document === 'undefined' || !scrollLocked) return;
  
  const body = document.body;
  body.style.overflow = '';
  body.style.paddingRight = originalBodyPaddingRight;
  scrollLocked = false;
}

/**
 * Check if scroll is currently locked
 * @returns {boolean}
 */
export function isScrollLocked() {
  return scrollLocked;
}