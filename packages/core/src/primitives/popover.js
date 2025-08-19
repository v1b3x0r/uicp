/**
 * @uip/core - Popover Primitive (Protocol v0.x)
 * Click-triggered floating content implementing Universal UI Protocol
 */

import { UIPrimitive } from '../base/UIPrimitive.js';
import { enableFocusTrap, disableFocusTrap, focusFirstElement } from '../utils/focus-trap.js';
import { createKeyboardHandler } from '../utils/events.js';

/**
 * Popover Primitive Class
 * Extends UIPrimitive with popover-specific behavior
 */
class PopoverPrimitive extends UIPrimitive {
  constructor(options = {}) {
    const {
      initialOpen = false,
      closeOnClickOutside = true,
      closeOnEscape = true,
      position = 'bottom',
      ...restOptions
    } = options;
    
    super({
      _type: 'popover',
      value: {
        isOpen: initialOpen,
        position,
        triggerElement: null
      },
      computed: {
        // Computed properties for popover state
        cssOpacity: (state) => state.value.isOpen ? '1' : '0',
        cssVisibility: (state) => state.value.isOpen ? 'visible' : 'hidden',
        cssPointerEvents: (state) => state.value.isOpen ? 'auto' : 'none'
      },
      meta: {
        closeOnClickOutside,
        closeOnEscape
      },
      ...restOptions
    });
  }
  
  /**
   * Convenience getter for isOpen
   */
  get isOpen() {
    return this.get('value.isOpen');
  }
  
  /**
   * Open popover with optional trigger reference
   * @param {HTMLElement} triggerElement - Trigger element reference
   */
  open(triggerElement = null) {
    if (this.isOpen) return;
    
    this.set('status', 'transitioning');
    this.emit('openStart', { state: this.state, primitive: this, triggerElement });
    
    this.set('value.isOpen', true);
    this.set('value.triggerElement', triggerElement);
    this.set('status', 'active');
    
    // Async completion event
    queueMicrotask(() => {
      this.emit('openEnd', { state: this.state, primitive: this });
    });
  }
  
  /**
   * Close popover
   */
  close() {
    if (!this.isOpen) return;
    
    this.set('status', 'transitioning');
    this.emit('closeStart', { state: this.state, primitive: this });
    
    this.set('value.isOpen', false);
    this.set('value.triggerElement', null);
    this.set('status', 'idle');
    
    // Async completion event
    queueMicrotask(() => {
      this.emit('closeEnd', { state: this.state, primitive: this });
    });
  }
  
  /**
   * Toggle popover state
   * @param {HTMLElement} triggerElement - Trigger element reference
   */
  toggle(triggerElement = null) {
    this.isOpen ? this.close() : this.open(triggerElement);
  }
  
  /**
   * Register trigger element with click behavior
   * @param {HTMLElement} element - Trigger element
   * @param {Object} options - Options
   * @returns {Function} Cleanup function
   */
  registerTrigger(element, options = {}) {
    if (!element?.addEventListener) {
      console.warn('PopoverPrimitive: Invalid trigger element');
      return () => {};
    }
    
    const handleClick = (e) => {
      e.stopPropagation();
      this.toggle(element);
    };
    
    const handleKeydown = createKeyboardHandler({
      onEnter: (e) => {
        e.preventDefault();
        this.toggle(element);
      },
      onSpace: (e) => {
        e.preventDefault();
        this.toggle(element);
      }
    });
    
    // Setup event listeners
    element.addEventListener('click', handleClick);
    element.addEventListener('keydown', handleKeydown);
    
    // Setup ARIA attributes
    element.setAttribute('aria-haspopup', 'dialog');
    
    const updateAria = () => {
      element.setAttribute('aria-expanded', String(this.isOpen));
    };
    updateAria();
    
    // Listen to state changes
    const unsubscribe = this.on('valueChange', updateAria);
    
    return () => {
      element.removeEventListener('click', handleClick);
      element.removeEventListener('keydown', handleKeydown);
      element.removeAttribute('aria-haspopup');
      element.removeAttribute('aria-expanded');
      unsubscribe();
    };
  }
  
  /**
   * Register content element with accessibility and click outside
   * @param {HTMLElement} element - Content element
   * @param {Object} options - Options
   * @returns {Function} Cleanup function
   */
  registerContent(element, options = {}) {
    if (!element) {
      console.warn('PopoverPrimitive: Invalid content element');
      return () => {};
    }
    
    const {
      trapFocus = false,
      autoFocus = false,
      closeOnClickOutside = this.get('meta.closeOnClickOutside'),
      closeOnEscape = this.get('meta.closeOnEscape')
    } = options;
    
    let focusTrapCleanup = null;
    let clickOutsideHandler = null;
    
    const handleEscape = createKeyboardHandler({
      onEscape: () => closeOnEscape && this.close()
    });
    
    const handleClickOutside = (e) => {
      const triggerElement = this.get('value.triggerElement');
      if (!element.contains(e.target) && 
          (!triggerElement || !triggerElement.contains(e.target))) {
        this.close();
      }
    };
    
    const onOpen = () => {
      // Focus management
      if (trapFocus) {
        focusTrapCleanup = enableFocusTrap(element, this);
      }
      if (autoFocus) {
        requestAnimationFrame(() => focusFirstElement(element));
      }
      
      // Keyboard handling
      document.addEventListener('keydown', handleEscape);
      
      // Click outside handling
      if (closeOnClickOutside) {
        // Delay to prevent immediate close from trigger click
        setTimeout(() => {
          clickOutsideHandler = handleClickOutside;
          document.addEventListener('click', clickOutsideHandler);
        }, 0);
      }
      
      // ARIA and visibility
      element.setAttribute('aria-hidden', 'false');
      element.style.display = '';
    };
    
    const onClose = () => {
      // Clean up focus trap
      if (focusTrapCleanup) {
        focusTrapCleanup();
        focusTrapCleanup = null;
      }
      
      // Remove event listeners
      document.removeEventListener('keydown', handleEscape);
      
      if (clickOutsideHandler) {
        document.removeEventListener('click', clickOutsideHandler);
        clickOutsideHandler = null;
      }
      
      // Update visibility and ARIA
      element.setAttribute('aria-hidden', 'true');
      element.style.display = 'none';
    };
    
    // Prevent clicks inside from closing
    const handleStopPropagation = (e) => e.stopPropagation();
    element.addEventListener('click', handleStopPropagation);
    
    // Initial state
    element.setAttribute('role', 'dialog');
    element.setAttribute('aria-hidden', String(!this.isOpen));
    element.style.display = this.isOpen ? '' : 'none';
    
    if (this.isOpen) onOpen();
    
    // Subscribe to lifecycle events
    const unsubOpen = this.on('openStart', onOpen);
    const unsubClose = this.on('closeStart', onClose);
    
    return () => {
      unsubOpen();
      unsubClose();
      if (focusTrapCleanup) focusTrapCleanup();
      document.removeEventListener('keydown', handleEscape);
      if (clickOutsideHandler) {
        document.removeEventListener('click', clickOutsideHandler);
      }
      element.removeEventListener('click', handleStopPropagation);
    };
  }
}

/**
 * Create popover primitive instance
 * @param {Object} options - Popover configuration
 * @param {Array} plugins - Plugins to apply
 * @returns {PopoverPrimitive} Popover instance
 */
export function createPopover(options = {}, plugins = []) {
  const popover = new PopoverPrimitive(options);
  
  // Apply plugins
  plugins.forEach(plugin => {
    if (typeof plugin === 'function') {
      popover.use(plugin);
    }
  });
  
  return popover;
}