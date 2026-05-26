/**
 * @uicp/adapter-vanilla — Headless UI Protocol adapter for vanilla JS
 *
 * State machine binder only. Sets data-attrs + classes; never inline styles.
 * You provide all CSS (position, transform, transition, layout).
 *
 * Data hooks on the element:
 *   data-uip-type="drawer"
 *   data-uip-position="left|right|top|bottom"
 *   data-uip-open="true|false"
 *   aria-hidden="true|false"
 *   class .uip-open / .uip-closed
 *
 * Backdrop (optional): provide an element with [data-backdrop-for="<drawer-id>"];
 * adapter toggles .uip-backdrop-open on it.
 */

import { createDrawer } from '@uicp/core';

/**
 * Tag element with type + position for CSS targeting. No inline styles.
 */
function tagElement(element, primitiveType, position) {
  element.setAttribute('data-uip-type', primitiveType);
  if (position) element.setAttribute('data-uip-position', position);
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
    // True headless: no inline styles. Just tag element for CSS targeting.
    tagElement(this.element, this.primitive._type, this.options.position);
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

    // State hooks for user CSS. No inline styles, no !important.
    this.element.classList.toggle('uip-open', isOpen);
    this.element.classList.toggle('uip-closed', !isOpen);
    this.element.setAttribute('data-uip-open', String(isOpen));
    this.element.setAttribute('aria-hidden', String(!isOpen));

    this.updateBackdrop(isOpen);
  }
  
  updateBackdrop(isOpen) {
    const backdrop = document.querySelector(`[data-backdrop-for="${this.element.id}"]`);
    if (!backdrop) return;
    // State hook for user CSS. No inline display toggling.
    backdrop.classList.toggle('uip-backdrop-open', isOpen);
    backdrop.setAttribute('data-uip-open', String(isOpen));
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

// Note: real modal/popover/tooltip/menu adapter wrappers are TODO for v0.4.x.
// Don't add `export { drawer as modal }` aliases — that pattern was misleading.