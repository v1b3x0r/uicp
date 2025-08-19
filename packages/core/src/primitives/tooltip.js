/**
 * @uip/core - Tooltip Primitive (Protocol v0.x)
 * Contextual information implementing Universal UI Protocol
 */

import { UIPrimitive } from '../base/UIPrimitive.js';

/**
 * Tooltip Primitive Class
 * Extends UIPrimitive with tooltip-specific behavior
 */
class TooltipPrimitive extends UIPrimitive {
  constructor(options = {}) {
    const {
      initialOpen = false,
      delay = 200,
      hideDelay = 0,
      position = 'top',
      interactive = false,
      ...restOptions
    } = options;
    
    super({
      _type: 'tooltip',
      value: {
        isOpen: initialOpen,
        position
      },
      computed: {
        // Computed properties for tooltip state
        cssOpacity: (state) => state.value.isOpen ? '1' : '0',
        cssVisibility: (state) => state.value.isOpen ? 'visible' : 'hidden',
        cssPointerEvents: (state) => state.meta.interactive && state.value.isOpen ? 'auto' : 'none'
      },
      meta: {
        delay,
        hideDelay,
        interactive
      },
      ...restOptions
    });
    
    // Internal timeout management
    this._showTimeout = null;
    this._hideTimeout = null;
  }
  
  /**
   * Convenience getter for isOpen
   */
  get isOpen() {
    return this.get('value.isOpen');
  }
  
  /**
   * Open tooltip with delay
   */
  open() {
    if (this.isOpen) return;
    
    // Clear any pending hide
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = null;
    }
    
    const delay = this.get('meta.delay');
    
    if (delay > 0) {
      this._showTimeout = setTimeout(() => {
        this._doOpen();
        this._showTimeout = null;
      }, delay);
    } else {
      this._doOpen();
    }
  }
  
  /**
   * Close tooltip with delay
   */
  close() {
    if (!this.isOpen) return;
    
    // Clear any pending show
    if (this._showTimeout) {
      clearTimeout(this._showTimeout);
      this._showTimeout = null;
    }
    
    const hideDelay = this.get('meta.hideDelay');
    
    if (hideDelay > 0) {
      this._hideTimeout = setTimeout(() => {
        this._doClose();
        this._hideTimeout = null;
      }, hideDelay);
    } else {
      this._doClose();
    }
  }
  
  /**
   * Toggle tooltip state
   */
  toggle() {
    this.isOpen ? this.close() : this.open();
  }
  
  /**
   * Immediate open without delay
   * @private
   */
  _doOpen() {
    this.set('status', 'transitioning');
    this.emit('openStart', { state: this.state, primitive: this });
    
    this.set('value.isOpen', true);
    this.set('status', 'active');
    
    // Async completion event
    queueMicrotask(() => {
      this.emit('openEnd', { state: this.state, primitive: this });
    });
  }
  
  /**
   * Immediate close without delay
   * @private
   */
  _doClose() {
    this.set('status', 'transitioning');
    this.emit('closeStart', { state: this.state, primitive: this });
    
    this.set('value.isOpen', false);
    this.set('status', 'idle');
    
    // Async completion event
    queueMicrotask(() => {
      this.emit('closeEnd', { state: this.state, primitive: this });
    });
  }
  
  /**
   * Register trigger element with hover/focus behavior
   * @param {HTMLElement} element - Trigger element
   * @param {Object} options - Options
   * @returns {Function} Cleanup function
   */
  registerTrigger(element, options = {}) {
    if (!element?.addEventListener) {
      console.warn('TooltipPrimitive: Invalid trigger element');
      return () => {};
    }
    
    const {
      showOnHover = true,
      showOnFocus = true,
      interactive = this.get('meta.interactive')
    } = options;
    
    const showTooltip = () => this.open();
    const hideTooltip = () => this.close();
    
    const handleMouseEnter = showOnHover ? showTooltip : null;
    const handleMouseLeave = showOnHover && !interactive ? hideTooltip : null;
    const handleFocus = showOnFocus ? showTooltip : null;
    const handleBlur = showOnFocus ? hideTooltip : null;
    
    // Setup event listeners
    if (handleMouseEnter) {
      element.addEventListener('mouseenter', handleMouseEnter);
      if (handleMouseLeave) {
        element.addEventListener('mouseleave', handleMouseLeave);
      }
    }
    
    if (handleFocus) {
      element.addEventListener('focus', handleFocus);
      element.addEventListener('blur', handleBlur);
    }
    
    // Setup ARIA attributes
    element.setAttribute('aria-describedby', `tooltip-${this._instanceId}`);
    
    return () => {
      // Clear timeouts
      if (this._showTimeout) {
        clearTimeout(this._showTimeout);
        this._showTimeout = null;
      }
      if (this._hideTimeout) {
        clearTimeout(this._hideTimeout);
        this._hideTimeout = null;
      }
      
      // Remove event listeners
      if (handleMouseEnter) {
        element.removeEventListener('mouseenter', handleMouseEnter);
        if (handleMouseLeave) {
          element.removeEventListener('mouseleave', handleMouseLeave);
        }
      }
      
      if (handleFocus) {
        element.removeEventListener('focus', handleFocus);
        element.removeEventListener('blur', handleBlur);
      }
      
      element.removeAttribute('aria-describedby');
    };
  }
  
  /**
   * Register content element with accessibility and interactivity
   * @param {HTMLElement} element - Content element
   * @param {Object} options - Options
   * @returns {Function} Cleanup function
   */
  registerContent(element, options = {}) {
    if (!element) {
      console.warn('TooltipPrimitive: Invalid content element');
      return () => {};
    }
    
    const {
      interactive = this.get('meta.interactive'),
      position = this.get('value.position')
    } = options;
    
    // Set tooltip attributes
    element.id = `tooltip-${this._instanceId}`;
    element.setAttribute('role', 'tooltip');
    element.setAttribute('data-tooltip-position', position);
    
    // Handle interactive tooltips
    const handleContentMouseEnter = () => {
      if (interactive && this._hideTimeout) {
        clearTimeout(this._hideTimeout);
        this._hideTimeout = null;
      }
    };
    
    const handleContentMouseLeave = () => {
      if (interactive) {
        this.close();
      }
    };
    
    if (interactive) {
      element.addEventListener('mouseenter', handleContentMouseEnter);
      element.addEventListener('mouseleave', handleContentMouseLeave);
    }
    
    // Update visibility and ARIA
    const updateVisibility = () => {
      const isOpen = this.isOpen;
      element.setAttribute('aria-hidden', String(!isOpen));
      element.style.display = isOpen ? '' : 'none';
      element.setAttribute('data-tooltip-open', String(isOpen));
    };
    
    // Initial state
    updateVisibility();
    
    const unsubscribe = this.on('valueChange', updateVisibility);
    
    return () => {
      if (interactive) {
        element.removeEventListener('mouseenter', handleContentMouseEnter);
        element.removeEventListener('mouseleave', handleContentMouseLeave);
      }
      unsubscribe();
    };
  }
  
  /**
   * Clean up all timeouts on destroy
   */
  destroy() {
    if (this._showTimeout) {
      clearTimeout(this._showTimeout);
      this._showTimeout = null;
    }
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = null;
    }
    
    super.destroy();
  }
}

/**
 * Create tooltip primitive instance
 * @param {Object} options - Tooltip configuration
 * @param {Array} plugins - Plugins to apply
 * @returns {TooltipPrimitive} Tooltip instance
 */
export function createTooltip(options = {}, plugins = []) {
  const tooltip = new TooltipPrimitive(options);
  
  // Apply plugins
  plugins.forEach(plugin => {
    if (typeof plugin === 'function') {
      tooltip.use(plugin);
    }
  });
  
  return tooltip;
}