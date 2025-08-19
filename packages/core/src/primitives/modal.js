/**
 * @uip/core - Modal Primitive (Protocol v0.x)
 * Overlay dialog implementing Universal UI Protocol
 */

import { UIPrimitive } from '../base/UIPrimitive.js';
import { enableFocusTrap, disableFocusTrap, focusFirstElement } from '../utils/focus-trap.js';
import { lockBodyScroll, unlockBodyScroll } from '../utils/scroll-lock.js';
import { createKeyboardHandler } from '../utils/events.js';

/**
 * Modal Primitive Class
 * Extends UIPrimitive with modal-specific behavior
 */
class ModalPrimitive extends UIPrimitive {
  constructor(options = {}) {
    const {
      initialOpen = false,
      closeOnBackdrop = true,
      closeOnEscape = true,
      portal = false,
      ...restOptions
    } = options;
    
    super({
      _type: 'modal',
      value: {
        isOpen: initialOpen
      },
      computed: {
        // Computed properties for modal state
        cssOpacity: (state) => state.value.isOpen ? '1' : '0',
        cssVisibility: (state) => state.value.isOpen ? 'visible' : 'hidden',
        cssPointerEvents: (state) => state.value.isOpen ? 'auto' : 'none'
      },
      meta: {
        closeOnBackdrop,
        closeOnEscape,
        portal
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
   * Open modal
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
   * Close modal
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
   * Toggle modal state
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
      console.warn('ModalPrimitive: Invalid trigger element');
      return () => {};
    }
    
    const handleClick = () => this.open();
    const handleKeydown = createKeyboardHandler({
      onEnter: (e) => {
        e.preventDefault();
        this.open();
      },
      onSpace: (e) => {
        e.preventDefault();
        this.open();
      }
    });
    
    // Setup event listeners
    element.addEventListener('click', handleClick);
    element.addEventListener('keydown', handleKeydown);
    
    // Setup ARIA attributes
    element.setAttribute('aria-haspopup', 'dialog');
    
    return () => {
      element.removeEventListener('click', handleClick);
      element.removeEventListener('keydown', handleKeydown);
      element.removeAttribute('aria-haspopup');
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
      console.warn('ModalPrimitive: Invalid content element');
      return () => {};
    }
    
    const {
      trapFocus = true,
      lockScroll = true,
      autoFocus = true,
      portal = this.get('meta.portal'),
      closeOnEscape = this.get('meta.closeOnEscape')
    } = options;
    
    let focusTrapCleanup = null;
    let portalElement = null;
    let originalParent = null;
    
    const handleEscape = createKeyboardHandler({
      onEscape: () => closeOnEscape && this.close()
    });
    
    const onOpen = () => {
      // Portal rendering
      if (portal && typeof document !== 'undefined') {
        originalParent = element.parentNode;
        portalElement = document.createElement('div');
        portalElement.className = 'uip-modal-portal';
        portalElement.setAttribute('data-uip-portal', 'modal');
        document.body.appendChild(portalElement);
        portalElement.appendChild(element);
      }
      
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
      
      // Update ARIA
      element.setAttribute('aria-hidden', 'true');
      
      // Clean up portal
      if (portalElement && portalElement.parentNode) {
        if (originalParent) {
          originalParent.appendChild(element);
        } else {
          document.body.appendChild(element);
        }
        portalElement.remove();
        portalElement = null;
        originalParent = null;
      }
    };
    
    // Initial state
    element.setAttribute('aria-hidden', String(!this.isOpen));
    if (this.isOpen) onOpen();
    
    // Subscribe to lifecycle events
    const unsubOpen = this.on('openStart', onOpen);
    const unsubClose = this.on('closeEnd', onClose);
    
    return () => {
      unsubOpen();
      unsubClose();
      if (focusTrapCleanup) focusTrapCleanup();
      if (lockScroll && this.isOpen) unlockBodyScroll();
      document.removeEventListener('keydown', handleEscape);
      if (portalElement && portalElement.parentNode) {
        portalElement.remove();
      }
    };
  }
  
  /**
   * Register backdrop element with click handling
   * @param {HTMLElement} element - Backdrop element
   * @param {Object} options - Options
   * @returns {Function} Cleanup function
   */
  registerBackdrop(element, options = {}) {
    if (!element?.addEventListener) {
      console.warn('ModalPrimitive: Invalid backdrop element');
      return () => {};
    }
    
    const {
      closeOnClick = this.get('meta.closeOnBackdrop')
    } = options;
    
    const handleClick = (e) => {
      if (e.target === element && closeOnClick) {
        this.close();
      }
    };
    
    element.addEventListener('click', handleClick);
    element.setAttribute('aria-hidden', 'true');
    
    const updateVisibility = () => {
      const isOpen = this.isOpen;
      element.style.display = isOpen ? '' : 'none';
      element.setAttribute('data-modal-open', String(isOpen));
    };
    
    // Initial state
    updateVisibility();
    
    const unsubscribe = this.on('valueChange', updateVisibility);
    
    return () => {
      element.removeEventListener('click', handleClick);
      unsubscribe();
    };
  }
}

/**
 * Create modal primitive instance
 * @param {Object} options - Modal configuration
 * @param {Array} plugins - Plugins to apply
 * @returns {ModalPrimitive} Modal instance
 */
export function createModal(options = {}, plugins = []) {
  const modal = new ModalPrimitive(options);
  
  // Apply plugins
  plugins.forEach(plugin => {
    if (typeof plugin === 'function') {
      modal.use(plugin);
    }
  });
  
  return modal;
}