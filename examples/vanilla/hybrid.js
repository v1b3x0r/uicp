/**
 * @uip/adapter-vanilla - Hybrid Universal UI Adapter
 * Zero-config, progressive enhancement, plugin-ready
 */

import { createDrawer, createModal, createTooltip, createPopover, createMenu } from '@uip/core';

/**
 * Position-based CSS injection system
 */
const POSITION_STYLES = {
  drawer: {
    left: {
      position: 'fixed',
      left: '0',
      top: '0',
      height: '100vh',
      transform: 'translateX(-100%)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    right: {
      position: 'fixed', 
      right: '0',
      top: '0',
      height: '100vh',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    top: {
      position: 'fixed',
      left: '0',
      right: '0', 
      top: '0',
      transform: 'translateY(-100%)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    bottom: {
      position: 'fixed',
      left: '0',
      right: '0',
      bottom: '0',
      transform: 'translateY(100%)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
};

const OPEN_TRANSFORMS = {
  left: 'translateX(0)',
  right: 'translateX(0)', 
  top: 'translateY(0)',
  bottom: 'translateY(0)'
};

/**
 * Auto-inject CSS styles for position-based layouts
 */
function injectPositionStyles(element, primitiveType, position) {
  if (!POSITION_STYLES[primitiveType] || !POSITION_STYLES[primitiveType][position]) {
    console.warn(`Position "${position}" not supported for ${primitiveType}`);
    return;
  }

  const styles = POSITION_STYLES[primitiveType][position];
  Object.assign(element.style, styles);
  
  // Add data attributes for CSS targeting
  element.setAttribute('data-uip-type', primitiveType);
  element.setAttribute('data-uip-position', position);
}

/**
 * Built-in basic gesture handler (fallback)
 */
class BasicGestures {
  constructor(element, primitive, options = {}) {
    this.element = element;
    this.primitive = primitive;
    this.options = {
      swipeThreshold: 50,
      axis: options.axis || 'x',
      ...options
    };
    
    this.startPos = null;
    this.isDragging = false;
    this.cleanup = [];
    
    this.init();
  }
  
  init() {
    // Touch events
    const touchStart = (e) => this.handleStart(e);
    const touchMove = (e) => this.handleMove(e);
    const touchEnd = (e) => this.handleEnd(e);
    
    this.element.addEventListener('touchstart', touchStart, { passive: true });
    this.element.addEventListener('touchmove', touchMove, { passive: false });
    this.element.addEventListener('touchend', touchEnd, { passive: true });
    
    this.cleanup.push(() => {
      this.element.removeEventListener('touchstart', touchStart);
      this.element.removeEventListener('touchmove', touchMove);
      this.element.removeEventListener('touchend', touchEnd);
    });
  }
  
  handleStart(event) {
    const touch = event.touches[0];
    this.startPos = {
      x: touch.clientX,
      y: touch.clientY
    };
    this.isDragging = true;
  }
  
  handleMove(event) {
    if (!this.isDragging || !this.startPos) return;
    
    const touch = event.touches[0];
    const deltaX = touch.clientX - this.startPos.x;
    const deltaY = touch.clientY - this.startPos.y;
    
    // Simple swipe detection
    const isHorizontal = this.options.axis === 'x';
    const delta = isHorizontal ? deltaX : deltaY;
    const threshold = this.options.swipeThreshold;
    
    if (Math.abs(delta) > threshold) {
      // Basic swipe detected
      event.preventDefault();
      
      const isOpen = this.primitive.get()?.value?.isOpen;
      if (isOpen) {
        // Close on swipe away
        const shouldClose = (isHorizontal && delta < 0) || (!isHorizontal && delta > 0);
        if (shouldClose) {
          this.primitive.close();
        }
      }
    }
  }
  
  handleEnd() {
    this.isDragging = false;
    this.startPos = null;
  }
  
  destroy() {
    this.cleanup.forEach(fn => fn());
    this.cleanup = [];
  }
}

/**
 * Plugin Detection & Auto-wire
 */
function detectAvailablePlugins() {
  const plugins = {};
  
  // Check for gesture plugin
  if (typeof window !== 'undefined') {
    if (window.UIPGesturePlugin || window.registerGesture) {
      plugins.gesture = window.UIPGesturePlugin || window.registerGesture;
    }
  }
  
  return plugins;
}

/**
 * Smart state polling system (as fallback)
 */
class StatePoller {
  constructor(primitive, onStateChange) {
    this.primitive = primitive;
    this.onStateChange = onStateChange;
    this.lastState = null;
    this.pollInterval = null;
    this.isActive = false;
  }
  
  start(intervalMs = 50) {
    if (this.isActive) return;
    
    this.isActive = true;
    this.lastState = this.primitive.get();
    
    this.pollInterval = setInterval(() => {
      const currentState = this.primitive.get();
      const currentOpen = currentState?.value?.isOpen;
      const lastOpen = this.lastState?.value?.isOpen;
      
      if (currentOpen !== lastOpen) {
        this.onStateChange(currentState);
        this.lastState = currentState;
      }
    }, intervalMs);
  }
  
  stop() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isActive = false;
  }
}

/**
 * Universal Hybrid Adapter
 */
class UniversalHybridAdapter {
  constructor(element, primitive, options = {}) {
    this.element = element;
    this.primitive = primitive;
    this.options = {
      position: 'left',
      autoCSS: true,
      gestures: true,
      polling: true,
      ...options
    };
    
    this.plugins = detectAvailablePlugins();
    this.gestureHandler = null;
    this.statePoller = null;
    this.cleanup = [];
    
    this.init();
  }
  
  init() {
    // Auto-inject CSS if enabled
    if (this.options.autoCSS) {
      this.injectCSS();
    }
    
    // Setup state synchronization
    this.setupStateSyncing();
    
    // Setup gestures
    if (this.options.gestures) {
      this.setupGestures();
    }
    
    // Initial sync
    this.syncDOMFromState();
  }
  
  injectCSS() {
    const primitiveType = this.primitive._type;
    const position = this.options.position;
    
    injectPositionStyles(this.element, primitiveType, position);
  }
  
  setupStateSyncing() {
    // Try event handler first
    let eventHandlerWorking = false;
    
    try {
      const unsubscribe = this.primitive.on('valueChange', (state) => {
        eventHandlerWorking = true;
        this.syncDOMFromState(state);
      });
      this.cleanup.push(unsubscribe);
    } catch (error) {
      console.warn('UIP event handler failed, using polling fallback:', error.message);
    }
    
    // Start polling fallback if events don't work
    if (this.options.polling) {
      setTimeout(() => {
        if (!eventHandlerWorking) {
          this.statePoller = new StatePoller(this.primitive, (state) => {
            this.syncDOMFromState(state);
          });
          this.statePoller.start();
          this.cleanup.push(() => this.statePoller.stop());
        }
      }, 100);
    }
  }
  
  setupGestures() {
    if (this.plugins.gesture && typeof this.plugins.gesture === 'function') {
      // Use advanced gesture plugin
      console.log('🚀 Using advanced gesture plugin');
      try {
        const gestureConfig = {
          axis: this.getAxisFromPosition(),
          threshold: 0.3,
          pullToClose: true
        };
        
        const cleanup = this.plugins.gesture(this.primitive, this.element, gestureConfig);
        this.cleanup.push(cleanup);
      } catch (error) {
        console.warn('Advanced gesture plugin failed, falling back to basic:', error.message);
        this.setupBasicGestures();
      }
    } else {
      // Use built-in basic gestures
      console.log('📱 Using built-in basic gestures');
      this.setupBasicGestures();
    }
  }
  
  setupBasicGestures() {
    this.gestureHandler = new BasicGestures(this.element, this.primitive, {
      axis: this.getAxisFromPosition()
    });
    this.cleanup.push(() => this.gestureHandler.destroy());
  }
  
  getAxisFromPosition() {
    return ['left', 'right'].includes(this.options.position) ? 'x' : 'y';
  }
  
  syncDOMFromState(state = null) {
    const currentState = state || this.primitive.get();
    const isOpen = currentState?.value?.isOpen || false;
    const position = this.options.position;
    
    // Toggle classes
    this.element.classList.toggle('open', isOpen);
    this.element.classList.toggle('closed', !isOpen);
    
    // Set transform (with !important to override)
    const transform = isOpen ? OPEN_TRANSFORMS[position] : '';
    this.element.style.setProperty('transform', transform, 'important');
    
    // Update attributes
    this.element.setAttribute('data-uip-open', isOpen);
    this.element.setAttribute('aria-hidden', !isOpen);
    
    // Handle backdrop if exists
    this.updateBackdrop(isOpen);
  }
  
  updateBackdrop(isOpen) {
    // Look for backdrop element
    const backdrop = document.querySelector(`[data-backdrop-for="${this.element.id}"]`) ||
                    this.element.parentElement?.querySelector('.backdrop');
    
    if (backdrop) {
      backdrop.classList.toggle('show', isOpen);
      backdrop.style.display = isOpen ? 'block' : 'none';
    }
  }
  
  destroy() {
    this.cleanup.forEach(fn => fn());
    this.cleanup = [];
    
    if (this.gestureHandler) {
      this.gestureHandler.destroy();
    }
    
    if (this.statePoller) {
      this.statePoller.stop();
    }
  }
}

/**
 * Level 1: Zero Config API
 */
export function drawer(selector, options = {}) {
  const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }
  
  // Create UIP primitive
  const primitive = createDrawer({
    defaultOpen: false,
    position: options.position || 'left',
    size: options.size || 320,
    ...options
  });
  
  // Create hybrid adapter
  const adapter = new UniversalHybridAdapter(element, primitive, options);
  
  // Return both primitive and adapter for advanced use cases
  return {
    // Simple API for common use cases
    open: () => primitive.open(),
    close: () => primitive.close(),
    toggle: () => primitive.toggle(),
    
    // Advanced API
    primitive,
    adapter,
    
    // Cleanup
    destroy: () => adapter.destroy()
  };
}

/**
 * Level 2: Simple Config API  
 */
export function drawerWithGestures(selector, options = {}) {
  return drawer(selector, {
    ...options,
    gestures: true,
    autoCSS: true
  });
}

/**
 * Level 3: Full Plugin API
 */
export function drawerWithPlugins(selector, plugins = [], options = {}) {
  const result = drawer(selector, options);
  
  // Apply plugins
  plugins.forEach(plugin => {
    if (typeof plugin === 'function') {
      const cleanup = plugin(result.primitive);
      if (typeof cleanup === 'function') {
        const originalDestroy = result.destroy;
        result.destroy = () => {
          cleanup();
          originalDestroy();
        };
      }
    }
  });
  
  return result;
}

// Universal exports for other primitives  
export { drawer as modal, drawer as popover };