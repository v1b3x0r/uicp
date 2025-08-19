/**
 * Universal UI Primitive - Base class for all primitives
 * Implements the Universal UI Protocol specification
 * 
 * @version 0.x (Pre-release)
 */

/**
 * Create reactive state object that emits change events
 * @param {Object} initialState - Initial state
 * @param {Function} emitChange - Change event emitter
 * @returns {Object} Reactive state proxy
 */
function createReactiveState(initialState, emitChange) {
  const state = { ...initialState };
  const computedCache = new Map();
  
  return new Proxy(state, {
    set(target, path, value) {
      const oldValue = target[path];
      if (oldValue === value) return true;
      
      const oldState = { ...target };
      target[path] = value;
      
      // Clear computed cache when base state changes
      computedCache.clear();
      
      // Emit change event
      emitChange({ 
        state: { ...target }, 
        previous: oldState, 
        path, 
        value, 
        oldValue 
      });
      
      return true;
    },
    
    get(target, path) {
      return target[path];
    }
  });
}

/**
 * Create event emitter system
 * @returns {Object} Event emitter with on/emit/off methods
 */
function createEventEmitter() {
  const listeners = new Map();
  
  return {
    on(event, handler) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event).add(handler);
      
      // Return cleanup function
      return () => listeners.get(event)?.delete(handler);
    },
    
    emit(event, data) {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach(handler => {
          try {
            handler(data);
          } catch (error) {
            console.error(`Error in ${event} handler:`, error);
          }
        });
      }
    },
    
    off(event, handler) {
      if (handler) {
        listeners.get(event)?.delete(handler);
      } else {
        listeners.delete(event);
      }
    },
    
    clear() {
      listeners.clear();
    }
  };
}

/**
 * Universal UI Primitive Base Class
 * Every primitive must extend this class
 */
export class UIPrimitive {
  constructor(config = {}) {
    const {
      _type = 'unknown',
      value = {},
      status = 'idle',
      computed = {},
      meta = {},
      plugins = []
    } = config;
    
    // Required properties
    this._type = _type;
    this._instanceId = `${_type}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Plugin management
    this.plugins = new Set();
    this.cleanupFunctions = new Set();
    
    // Event system
    this.emitter = createEventEmitter();
    
    // State management
    this.state = createReactiveState({
      value,
      status,
      interaction: null,
      transition: null,
      computed,
      meta
    }, (changeData) => this._handleStateChange(changeData));
    
    // Apply initial plugins
    plugins.forEach(plugin => this.use(plugin));
  }
  
  /**
   * Get state value by path or entire state
   * @param {string} [path] - Dot notation path to value
   * @returns {any} State value
   */
  get(path) {
    if (!path) return this.state;
    
    // Simple dot notation support
    return path.split('.').reduce((obj, key) => obj?.[key], this.state);
  }
  
  /**
   * Set state value by path
   * @param {string} path - Dot notation path
   * @param {any} value - New value
   */
  set(path, value) {
    const keys = path.split('.');
    let current = this.state;
    
    // Navigate to parent object
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    // Set final value
    current[keys[keys.length - 1]] = value;
  }
  
  /**
   * Update state with function
   * @param {Function} updater - Function that receives current state and returns new state
   */
  update(updater) {
    const newState = updater({ ...this.state });
    Object.assign(this.state, newState);
  }
  
  /**
   * Batch multiple state changes into single event
   * @param {Function} batchFn - Function that performs multiple state changes
   */
  batch(batchFn) {
    const oldEmit = this.emitter.emit;
    const batchedEvents = [];
    
    // Intercept events during batch
    this.emitter.emit = (event, data) => {
      batchedEvents.push({ event, data });
    };
    
    try {
      batchFn();
    } finally {
      // Restore original emit
      this.emitter.emit = oldEmit;
      
      // Emit single batched change event
      if (batchedEvents.length > 0) {
        this.emitter.emit('batchChange', {
          changes: batchedEvents,
          state: { ...this.state }
        });
      }
    }
  }
  
  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @returns {Function} Cleanup function
   */
  on(event, handler) {
    return this.emitter.on(event, handler);
  }
  
  /**
   * Emit event
   * @param {string} event - Event name  
   * @param {any} data - Event data
   */
  emit(event, data) {
    this.emitter.emit(event, data);
  }
  
  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} [handler] - Specific handler to remove
   */
  off(event, handler) {
    this.emitter.off(event, handler);
  }
  
  /**
   * Use plugin to enhance primitive
   * @param {Function} plugin - Plugin function
   * @returns {UIPrimitive} This instance for chaining
   */
  use(plugin) {
    if (typeof plugin !== 'function') {
      console.warn('Plugin must be a function');
      return this;
    }
    
    try {
      const cleanup = plugin(this);
      if (typeof cleanup === 'function') {
        this.cleanupFunctions.add(cleanup);
        this.plugins.add({ plugin, cleanup });
      }
    } catch (error) {
      console.error('Error applying plugin:', error);
    }
    
    return this; // Chainable
  }
  
  /**
   * Mount primitive to DOM element (optional override)
   * @param {Element} target - Target DOM element
   * @returns {Function} Cleanup function
   */
  mount(target) {
    if (!target) {
      console.warn('Mount target is required');
      return () => {};
    }
    
    this.element = target;
    this.emit('mount', { element: target, primitive: this });
    
    return () => {
      this.element = null;
      this.emit('unmount', { element: target, primitive: this });
    };
  }
  
  /**
   * Destroy primitive and cleanup all resources
   */
  destroy() {
    // Cleanup plugins in reverse order
    Array.from(this.cleanupFunctions).reverse().forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });
    
    this.emit('destroy', { primitive: this });
    this.emitter.clear();
    this.plugins.clear();
    this.cleanupFunctions.clear();
    this.element = null;
  }
  
  /**
   * Handle state changes and emit appropriate events
   * @private
   */
  _handleStateChange(changeData) {
    const { state, previous, path, value, oldValue } = changeData;
    
    // Emit beforeChange event
    this.emit('beforeChange', { 
      from: previous, 
      to: state, 
      primitive: this 
    });
    
    // Emit general change event
    this.emit('change', { 
      state, 
      previous, 
      primitive: this 
    });
    
    // Emit specific value change events
    if (path === 'value' || path.startsWith('value.')) {
      this.emit('valueChange', { 
        value: state.value, 
        previous: previous.value, 
        primitive: this 
      });
    }
    
    if (path === 'status') {
      this.emit('statusChange', { 
        status: value, 
        previous: oldValue, 
        primitive: this 
      });
    }
  }
}

/**
 * Helper function to create primitive with validation
 * @param {string} type - Primitive type
 * @param {Object} config - Configuration
 * @returns {UIPrimitive} Primitive instance
 */
export function createPrimitive(type, config = {}) {
  if (!type) {
    throw new Error('Primitive type is required');
  }
  
  return new UIPrimitive({
    _type: type,
    ...config
  });
}