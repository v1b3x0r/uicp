/**
 * Event system utilities
 * Lightweight pub/sub for drawer lifecycle
 */

/**
 * Create event emitter system
 * @returns {Object}
 */
export function createEventSystem() {
  const listeners = new Set();
  const lifecycle = {
    openStart: new Set(),
    openEnd: new Set(),
    closeStart: new Set(),
    closeEnd: new Set()
  };
  
  return {
    // State change listeners
    onChange: (fn) => (listeners.add(fn), () => listeners.delete(fn)),
    
    // Lifecycle listeners
    onOpenStart: (fn) => (lifecycle.openStart.add(fn), () => lifecycle.openStart.delete(fn)),
    onOpenEnd: (fn) => (lifecycle.openEnd.add(fn), () => lifecycle.openEnd.delete(fn)),
    onCloseStart: (fn) => (lifecycle.closeStart.add(fn), () => lifecycle.closeStart.delete(fn)),
    onCloseEnd: (fn) => (lifecycle.closeEnd.add(fn), () => lifecycle.closeEnd.delete(fn)),
    
    // Internal emit functions
    notifyChange: (state) => listeners.forEach(fn => fn(state)),
    emitOpenStart: (state) => lifecycle.openStart.forEach(fn => fn(state)),
    emitOpenEnd: (state) => lifecycle.openEnd.forEach(fn => fn(state)),
    emitCloseStart: (state) => lifecycle.closeStart.forEach(fn => fn(state)),
    emitCloseEnd: (state) => lifecycle.closeEnd.forEach(fn => fn(state))
  };
}

/**
 * Create keyboard handler
 * @param {Function} onEscape - Callback for escape key
 * @returns {Object}
 */
export function createKeyboardHandler(onEscape) {
  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      onEscape();
    }
  };
  
  return {
    enable: () => {
      if (typeof document !== 'undefined') {
        document.addEventListener('keydown', handleKeyDown);
      }
    },
    disable: () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', handleKeyDown);
      }
    }
  };
}