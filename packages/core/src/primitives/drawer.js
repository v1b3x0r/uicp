/**
 * @uip/core - Drawer Primitive (Protocol v0.x)
 * Sliding panel UI implementing Universal UI Protocol
 */

import { UIPrimitive } from '../base/UIPrimitive.js';
import { enableFocusTrap, disableFocusTrap, focusFirstElement } from '../utils/focus-trap.js';
import { lockBodyScroll, unlockBodyScroll } from '../utils/scroll-lock.js';
import { createKeyboardHandler } from '../utils/events.js';

/**
 * Drawer Primitive Class
 * Extends UIPrimitive with drawer-specific behavior
 */
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
        // Computed properties for CSS/styling
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
  
  /**
   * Convenience getter for isOpen
   */
  get isOpen() {
    return this.get('value.isOpen');
  }
  
  /**
   * Open drawer
   */
  open() {
    if (this.isOpen) return;
    
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
   * Close drawer
   */
  close() {
    if (!this.isOpen) return;
    
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
   * Toggle drawer state
   */
  toggle() {
    this.isOpen ? this.close() : this.open();
  }
  
  /**
   * Register trigger element with keyboard support
   * @param {HTMLElement} element - Trigger element
   * @param {Object} options - Options
   * @returns {Function} Cleanup function
   */
  registerTrigger(element, options = {}) {
    if (!element?.addEventListener) {
      console.warn('DrawerPrimitive: Invalid trigger element');
      return () => {};
    }
    
    const handleClick = () => this.toggle();
    const handleKeydown = createKeyboardHandler({
      onEnter: (e) => {
        e.preventDefault();
        this.toggle();
      },
      onSpace: (e) => {
        e.preventDefault();
        this.toggle();
      }
    });
    
    // Setup event listeners
    element.addEventListener('click', handleClick);
    element.addEventListener('keydown', handleKeydown);
    
    // Setup ARIA attributes
    const updateAria = () => {
      element.setAttribute('aria-expanded', String(this.isOpen));
    };
    
    element.setAttribute('aria-haspopup', 'dialog');
    updateAria();
    
    // Listen to state changes
    const unsubscribe = this.on('valueChange', updateAria);
    
    return () => {
      element.removeEventListener('click', handleClick);
      element.removeEventListener('keydown', handleKeydown);
      element.removeAttribute('aria-expanded');
      element.removeAttribute('aria-haspopup');
      unsubscribe();
    };
  }
  
  /**
   * Register content element with accessibility features
   * @param {HTMLElement} element - Content element
   * @param {Object} options - Options
   * @returns {Function} Cleanup function
   */
  registerContent(element, options = {}) {
    if (!element) {
      console.warn('DrawerPrimitive: Invalid content element');
      return () => {};
    }
    
    const {
      trapFocus = true,
      lockScroll = true,
      closeOnEscape = true,
      autoFocus = true,
      closeOnOutsideClick = this.get('meta.closeOnOutsideClick')
    } = options;
    
    let focusTrapCleanup = null;
    let outsideClickCleanup = null;
    
    const handleEscape = createKeyboardHandler({
      onEscape: () => closeOnEscape && this.close()
    });
    
    const handleOutsideClick = (event) => {
      if (closeOnOutsideClick && !element.contains(event.target)) {
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
      
      // Scroll lock
      if (lockScroll) lockBodyScroll();
      
      // Keyboard handling
      document.addEventListener('keydown', handleEscape);
      
      // Outside click handling
      if (closeOnOutsideClick) {
        // Delay to prevent immediate close from trigger click
        setTimeout(() => {
          document.addEventListener('click', handleOutsideClick);
        }, 0);
      }
      
      // ARIA attributes
      element.setAttribute('aria-modal', 'true');
      element.setAttribute('role', 'dialog');
      element.setAttribute('aria-hidden', 'false');
    };
    
    const onClose = () => {
      // Clean up focus trap
      if (focusTrapCleanup) {
        focusTrapCleanup();
        focusTrapCleanup = null;
      }
      
      // Restore scroll
      if (lockScroll) unlockBodyScroll();
      
      // Remove event listeners
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleOutsideClick);
      
      // Update ARIA
      element.setAttribute('aria-hidden', 'true');
    };
    
    // Initial state
    element.setAttribute('aria-hidden', String(!this.isOpen));
    if (this.isOpen) onOpen();
    
    // Subscribe to lifecycle events
    const unsubOpen = this.on('openStart', onOpen);
    const unsubClose = this.on('closeStart', onClose);
    
    return () => {
      unsubOpen();
      unsubClose();
      if (focusTrapCleanup) focusTrapCleanup();
      if (lockScroll && this.isOpen) unlockBodyScroll();
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleOutsideClick);
    };
  }
}

/**
 * Create drawer primitive instance
 * @param {Object} options - Drawer configuration
 * @param {Array} plugins - Plugins to apply
 * @returns {DrawerPrimitive} Drawer instance
 */
export function createDrawer(options = {}, plugins = []) {
  const drawer = new DrawerPrimitive(options);
  
  // Apply plugins
  plugins.forEach(plugin => {
    if (typeof plugin === 'function') {
      drawer.use(plugin);
    }
  });
  
  return drawer;
}