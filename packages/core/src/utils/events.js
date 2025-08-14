/**
 * Event system utilities - Universal for all primitives
 * Minimal pub/sub and keyboard handling
 */

/**
 * Create event system for primitive
 * @returns {Object} Event system with lifecycle methods
 */
export function createEventSystem() {
  const listeners = {
    change: new Set(),
    openStart: new Set(),
    openEnd: new Set(),
    closeStart: new Set(),
    closeEnd: new Set()
  };
  
  return {
    // Subscribe methods
    onChange: (fn) => (listeners.change.add(fn), () => listeners.change.delete(fn)),
    onOpenStart: (fn) => (listeners.openStart.add(fn), () => listeners.openStart.delete(fn)),
    onOpenEnd: (fn) => (listeners.openEnd.add(fn), () => listeners.openEnd.delete(fn)),
    onCloseStart: (fn) => (listeners.closeStart.add(fn), () => listeners.closeStart.delete(fn)),
    onCloseEnd: (fn) => (listeners.closeEnd.add(fn), () => listeners.closeEnd.delete(fn)),
    
    // Emit methods
    emit(event, data) {
      listeners[event]?.forEach(fn => fn(data));
    },
    
    emitAsync(event, data) {
      queueMicrotask(() => this.emit(event, data));
    }
  };
}

/**
 * Create keyboard handler
 * @param {Object} config - Keyboard config
 * @returns {Function} Event handler
 */
export function createKeyboardHandler(config = {}) {
  const { onEscape, onEnter, onSpace, onArrowUp, onArrowDown, onArrowLeft, onArrowRight } = config;
  
  return (event) => {
    switch (event.key) {
      case 'Escape':
        onEscape?.(event);
        break;
      case 'Enter':
        onEnter?.(event);
        break;
      case ' ':
        onSpace?.(event);
        break;
      case 'ArrowUp':
        onArrowUp?.(event);
        break;
      case 'ArrowDown':
        onArrowDown?.(event);
        break;
      case 'ArrowLeft':
        onArrowLeft?.(event);
        break;
      case 'ArrowRight':
        onArrowRight?.(event);
        break;
    }
  };
}