/**
 * Body scroll lock utilities
 * Prevents layout shift by calculating scrollbar width
 * - Uses width-based detection (innerWidth - clientWidth)
 * - Reference-counted to support multiple locks
 */

let lockCount = 0;
let prevOverflow = '';
let prevPaddingRight = '';

function getScrollbarWidth() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0;
  return Math.max(0, (window.innerWidth || 0) - (document.documentElement?.clientWidth || 0));
}

/**
 * Lock body scroll and compensate for scrollbar width
 */
export function lockBodyScroll() {
  if (typeof document === 'undefined') return;
  
  lockCount += 1;
  if (lockCount !== 1) return; // only first lock applies styles

  const body = document.body;
  
  // Snapshot current inline styles to restore later
  prevOverflow = body.style.overflow || '';
  prevPaddingRight = body.style.paddingRight || '';

  const scrollbarWidth = getScrollbarWidth();
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }
  body.style.overflow = 'hidden';
}

/**
 * Unlock body scroll and restore original padding
 */
export function unlockBodyScroll() {
  if (typeof document === 'undefined') return;
  
  if (lockCount > 0) lockCount -= 1;
  if (lockCount !== 0) return; // still locked by others

  const body = document.body;
  
  // Restore previous inline styles (not just empty them)
  body.style.overflow = prevOverflow || '';
  body.style.paddingRight = prevPaddingRight || '';
  
  // Reset trackers
  prevOverflow = '';
  prevPaddingRight = '';
}

/**
 * Check if scroll is currently locked
 * @returns {boolean}
 */
export function isScrollLocked() {
  return lockCount > 0;
}