/**
 * UIP Protocol Bundle for Vanilla Demo
 * Includes core primitives and gesture plugin
 */

// Base UIPrimitive class
function createReactiveState(initialState, emitChange) {
  const state = { ...initialState };
  const computedCache = new Map();
  
  return new Proxy(state, {
    set(target, path, value) {
      const oldValue = target[path];
      if (oldValue === value) return true;
      
      const oldState = { ...target };
      target[path] = value;
      
      computedCache.clear();
      
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

function createEventEmitter() {
  const listeners = new Map();
  
  return {
    on(event, handler) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event).add(handler);
      
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

class UIPrimitive {
  constructor(config = {}) {
    const {
      _type = 'unknown',
      value = {},
      status = 'idle',
      computed = {},
      meta = {},
      plugins = []
    } = config;
    
    this._type = _type;
    this._instanceId = `${_type}_${Math.random().toString(36).substring(2, 9)}`;
    
    this.plugins = new Set();
    this.cleanupFunctions = new Set();
    
    this.emitter = createEventEmitter();
    
    this.state = createReactiveState({
      value,
      status,
      interaction: null,
      transition: null,
      computed,
      meta
    }, (changeData) => this._handleStateChange(changeData));
    
    plugins.forEach(plugin => this.use(plugin));
  }
  
  get(path) {
    if (!path) return this.state;
    return path.split('.').reduce((obj, key) => obj?.[key], this.state);
  }
  
  set(path, value) {
    const keys = path.split('.');
    let current = this.state;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }
  
  on(event, handler) {
    return this.emitter.on(event, handler);
  }
  
  emit(event, data) {
    this.emitter.emit(event, data);
  }
  
  off(event, handler) {
    this.emitter.off(event, handler);
  }
  
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
    
    return this;
  }
  
  destroy() {
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
  
  _handleStateChange(changeData) {
    const { state, previous, path, value, oldValue } = changeData;
    
    this.emit('beforeChange', { 
      from: previous, 
      to: state, 
      primitive: this 
    });
    
    this.emit('change', { 
      state, 
      previous, 
      primitive: this 
    });
    
    // Enhanced valueChange detection
    if (path === 'value' || path.startsWith('value.')) {
      this.emit('valueChange', { 
        value: state.value, 
        previous: previous.value, 
        primitive: this 
      });
    }
    
    // Also emit valueChange for nested value changes
    if (path.includes('value.')) {
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

// DrawerPrimitive class
class DrawerPrimitive extends UIPrimitive {
  constructor(options = {}) {
    const {
      position = 'left',
      size = 320,
      initialOpen = false,
      closeOnOutsideClick = true,
      ...restOptions
    } = options;
    
    super({
      _type: 'drawer',
      value: {
        isOpen: initialOpen,
        position,
        size
      },
      computed: {
        cssTransform: (state) => {
          const { isOpen, position } = state.value;
          if (!isOpen) {
            switch (position) {
              case 'left': return 'translateX(-100%)';
              case 'right': return 'translateX(100%)';
              case 'top': return 'translateY(-100%)';
              case 'bottom': return 'translateY(100%)';
              default: return 'translateX(-100%)';
            }
          }
          return 'translateX(0)';
        },
        
        cssSize: (state) => {
          const { position, size } = state.value;
          const isHorizontal = ['left', 'right'].includes(position);
          return isHorizontal ? `${size}px` : `${size}px`;
        }
      },
      meta: {
        closeOnOutsideClick
      },
      ...restOptions
    });
  }
  
  get isOpen() {
    return this.get('value.isOpen');
  }
  
  open() {
    console.log('🔵 DrawerPrimitive.open() called, current state:', this.get('value.isOpen'));
    
    this.set('status', 'transitioning');
    this.emit('openStart', { state: this.state, primitive: this });
    
    this.set('value.isOpen', true);
    this.set('status', 'active');
    
    // Immediate event firing for reliable state sync
    this.emit('openEnd', { state: this.state, primitive: this });
    
    console.log('✅ DrawerPrimitive opened, new state:', this.get('value.isOpen'));
  }
  
  close() {
    console.log('🔴 DrawerPrimitive.close() called, current state:', this.get('value.isOpen'));
    
    // Remove the early return - allow closing from any state
    this.set('status', 'transitioning');
    this.emit('closeStart', { state: this.state, primitive: this });
    
    this.set('value.isOpen', false);
    this.set('status', 'idle');
    
    // Immediate event firing for reliable state sync
    this.emit('closeEnd', { state: this.state, primitive: this });
    
    console.log('✅ DrawerPrimitive closed, new state:', this.get('value.isOpen'));
  }
  
  toggle() {
    this.isOpen ? this.close() : this.open();
  }
  
  registerContent(element, options = {}) {
    if (!element) {
      console.warn('DrawerPrimitive: Invalid content element');
      return () => {};
    }
    
    const {
      closeOnEscape = true,
      closeOnOutsideClick = this.get('meta.closeOnOutsideClick')
    } = options;
    
    const handleEscape = (e) => {
      if (closeOnEscape && e.key === 'Escape') {
        this.close();
      }
    };
    
    const handleOutsideClick = (event) => {
      if (closeOnOutsideClick && !element.contains(event.target)) {
        this.close();
      }
    };
    
    const onOpen = () => {
      document.addEventListener('keydown', handleEscape);
      if (closeOnOutsideClick) {
        setTimeout(() => {
          document.addEventListener('click', handleOutsideClick);
        }, 0);
      }
      element.setAttribute('aria-modal', 'true');
      element.setAttribute('role', 'dialog');
      element.setAttribute('aria-hidden', 'false');
    };
    
    const onClose = () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleOutsideClick);
      element.setAttribute('aria-hidden', 'true');
    };
    
    element.setAttribute('aria-hidden', String(!this.isOpen));
    if (this.isOpen) onOpen();
    
    const unsubOpen = this.on('openStart', onOpen);
    const unsubClose = this.on('closeStart', onClose);
    
    return () => {
      unsubOpen();
      unsubClose();
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleOutsideClick);
    };
  }
}

// Create drawer function
function createDrawer(options = {}, plugins = []) {
  const drawer = new DrawerPrimitive(options);
  
  plugins.forEach(plugin => {
    if (typeof plugin === 'function') {
      drawer.use(plugin);
    }
  });
  
  return drawer;
}

// Gesture Plugin
const GESTURE_CONFIGS = {
  drawer: {
    defaultAxis: 'x',
    defaultThreshold: 0.3,
    supportsDrag: true
  },
  modal: {
    defaultAxis: 'y',
    defaultThreshold: 0.2,
    supportsDrag: true,
    pullToClose: true
  }
};

function registerGesture(primitive, element, options = {}) {
  if (!element?.addEventListener) {
    console.warn('registerGesture: Invalid element provided');
    return () => {};
  }
  
  if (!primitive?._type || typeof primitive.get !== 'function') {
    console.warn('registerGesture: Invalid UIPrimitive instance');
    return () => {};
  }
  
  const type = primitive._type;
  const config = GESTURE_CONFIGS[type] || {};
  
  if (!config.supportsDrag) {
    console.info(`Gesture: ${type} primitive does not support drag gestures`);
    return () => {};
  }
  
  const {
    axis = config.defaultAxis || 'x',
    threshold = config.defaultThreshold || 0.3,
    velocityThreshold = 0.5,
    onProgress,
    pullToClose = config.pullToClose || false,
    enableExpansion = true
  } = options;
  
  let startPos = 0;
  let currentPos = 0;
  let startTime = 0;
  let isDragging = false;
  let dragDistance = 0;
  let containerSize = 0;
  let startHeight = 0;
  let isExpanded = false;
  let animationFrame = null;
  
  const isHorizontal = axis === 'x';
  
  function getPosition(event) {
    if (event.touches?.length > 0) {
      return isHorizontal ? event.touches[0].clientX : event.touches[0].clientY;
    }
    return isHorizontal ? event.clientX : event.clientY;
  }
  
  function getContainerSize() {
    return isHorizontal ? element.offsetWidth : element.offsetHeight;
  }
  
  function handleStart(event) {
    const isOpen = primitive.get('value.isOpen') || false;
    if (!isOpen && !pullToClose) return;
    
    isDragging = true;
    startPos = getPosition(event);
    currentPos = startPos;
    startTime = Date.now();
    containerSize = getContainerSize();
    startHeight = element.offsetHeight;
    isExpanded = element.style.height === `${window.innerHeight}px`;
    
    element.style.transition = 'none';
    element.setAttribute('data-dragging', 'true');
    
    if (event.type === 'mousedown') {
      event.preventDefault();
    }
  }
  
  function handleMove(event) {
    if (!isDragging) return;
    
    currentPos = getPosition(event);
    dragDistance = currentPos - startPos;
    
    const progress = Math.abs(dragDistance) / containerSize;
    
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(() => {
      if (enableExpansion && axis === 'y' && type === 'drawer') {
        // Special handling for vertical drawer with expansion
        const viewportHeight = window.innerHeight;
        const baseHeight = 400;
        
        if (dragDistance > 0) {
          // Dragging down - closing motion
          const translateY = Math.min(baseHeight, dragDistance);
          element.style.transform = `translateY(${translateY}px)`;
          element.style.height = `${startHeight}px`;
          
          // Visual feedback for closing
          if (translateY > 50) {
            element.style.boxShadow = `0 -4px 20px rgba(255, 0, 0, ${0.2 + (translateY/baseHeight) * 0.3})`;
          }
        } else {
          // Dragging up - expanding motion  
          const expansionDelta = Math.abs(dragDistance);
          const newHeight = Math.min(viewportHeight, startHeight + expansionDelta);
          
          element.style.transform = 'translateY(0)';
          element.style.height = `${newHeight}px`;
          
          // Visual feedback for expansion
          const expandProgress = (newHeight - baseHeight) / (viewportHeight - baseHeight);
          if (expandProgress > 0.2) {
            element.style.boxShadow = `0 -4px 30px rgba(0, 100, 255, ${0.2 + expandProgress * 0.3})`;
          }
        }
      } else {
        // Standard transform-based dragging
        const transform = isHorizontal 
          ? `translateX(${dragDistance}px)`
          : `translateY(${dragDistance}px)`;
        
        element.style.transform = transform;
      }
      
      element.setAttribute('data-drag-progress', progress.toFixed(2));
      
      onProgress?.({
        distance: dragDistance,
        progress,
        axis,
        primitive: type,
        isExpanding: dragDistance < 0 && enableExpansion
      });
    });
    
    if (event.type === 'mousemove') {
      event.preventDefault();
    }
  }
  
  function handleEnd(event) {
    console.log('🎯 GESTURE: handleEnd called, isDragging:', isDragging);
    
    if (!isDragging) {
      console.log('❌ GESTURE: Not dragging, ignoring end event');
      return;
    }
    
    isDragging = false;
    const endTime = Date.now();
    const duration = endTime - startTime;
    const velocity = Math.abs(dragDistance) / duration;
    const progress = Math.abs(dragDistance) / containerSize;
    
    console.log('🎯 GESTURE: End data -', {
      dragDistance,
      progress: (progress * 100).toFixed(1) + '%',
      velocity: velocity.toFixed(3),
      duration: duration + 'ms'
    });
    
    element.removeAttribute('data-dragging');
    element.removeAttribute('data-drag-progress');
    element.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    const isOpen = primitive.get('value.isOpen') || false;
    console.log('🎯 GESTURE: Current state isOpen:', isOpen);
    
    if (enableExpansion && axis === 'y' && type === 'drawer' && isOpen) {
      // Special snapping for expandable vertical drawer
      const viewportHeight = window.innerHeight;
      const currentHeight = element.offsetHeight;
      
      let targetAction = 'normal';
      
      console.log('🎯 GESTURE: Decision making -', {
        velocityAbs: Math.abs(velocity).toFixed(3),
        velocityThreshold: 0.5,
        dragDistance,
        currentHeight,
        viewportHeight,
        closeThreshold: 120
      });
      
      if (Math.abs(velocity) > 0.5) {
        // Fast swipe
        console.log('🚀 GESTURE: Fast swipe detected');
        if (velocity > 0) {
          targetAction = dragDistance < 0 ? 'expand' : 'normal';
        } else {
          targetAction = dragDistance > 0 ? 'close' : 'normal';
        }
      } else {
        // Slow drag - position based
        console.log('🐌 GESTURE: Slow drag - checking position');
        if (dragDistance > 80) { // Lower threshold from 120 to 80
          targetAction = 'close';
          console.log('✅ GESTURE: dragDistance > 80, will close');
        } else if (currentHeight > viewportHeight * 0.7 || dragDistance < -100) {
          targetAction = 'expand';
        } else {
          targetAction = 'normal';
        }
      }
      
      // Fallback: If progress > 80% and dragging down, force close
      if (progress > 0.8 && dragDistance > 0 && targetAction === 'normal') {
        targetAction = 'close';
        console.log('🚨 GESTURE: Fallback - High progress (>80%) with drag down, forcing close');
      }
      
      console.log('🎯 GESTURE: Final target action:', targetAction);
      
      // Apply target action
      if (targetAction === 'close') {
        console.log('🔴 GESTURE: Executing close action...');
        element.style.transform = 'translateY(400px)';
        element.style.height = '400px';
        setTimeout(() => {
          primitive.close?.() || primitive.set('value.isOpen', false);
        }, 400);
      } else if (targetAction === 'expand') {
        element.style.transform = 'translateY(0)';
        element.style.height = `${viewportHeight}px`;
        element.setAttribute('data-expanded', 'true');
      } else {
        element.style.transform = 'translateY(0)';
        element.style.height = '400px';
        element.removeAttribute('data-expanded');
      }
    } else {
      // Standard gesture handling
      element.style.transform = '';
      
      const shouldToggle = progress > threshold || velocity > velocityThreshold;
      
      if (shouldToggle) {
        if (isOpen) {
          const isClosingDirection = (axis === 'x' && dragDistance < 0) || 
                                    (axis === 'y' && dragDistance > 0);
          if (isClosingDirection || pullToClose) {
            primitive.close?.() || primitive.set('value.isOpen', false);
          }
        } else if (pullToClose) {
          primitive.open?.() || primitive.set('value.isOpen', true);
        }
      }
    }
    
    // Clean up visual feedback
    setTimeout(() => {
      element.style.boxShadow = '0 -4px 20px rgba(0,0,0,0.1)';
      element.style.transition = '';
    }, 400);
    
    dragDistance = 0;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }
  
  function handleCancel() {
    if (!isDragging) return;
    
    isDragging = false;
    element.removeAttribute('data-dragging');
    element.removeAttribute('data-drag-progress');
    element.style.transition = '';
    element.style.transform = '';
    dragDistance = 0;
    
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }
  
  // Event listeners
  element.addEventListener('touchstart', handleStart, { passive: true });
  element.addEventListener('touchmove', handleMove, { passive: true });
  element.addEventListener('touchend', handleEnd, { passive: true });
  element.addEventListener('touchcancel', handleCancel, { passive: true });
  
  element.addEventListener('mousedown', handleStart);
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleEnd);
  
  return () => {
    element.removeEventListener('touchstart', handleStart);
    element.removeEventListener('touchmove', handleMove);
    element.removeEventListener('touchend', handleEnd);
    element.removeEventListener('touchcancel', handleCancel);
    element.removeEventListener('mousedown', handleStart);
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
    
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
}

// Export to window
window.UIP = {
  createDrawer,
  registerGesture,
  UIPrimitive,
  DrawerPrimitive
};

console.log('✅ UIP Protocol Bundle loaded');