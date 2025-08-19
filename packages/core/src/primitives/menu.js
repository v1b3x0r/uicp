/**
 * @uip/core - Menu Primitive (Protocol v0.x)
 * Context menu with keyboard navigation implementing Universal UI Protocol
 */

import { UIPrimitive } from '../base/UIPrimitive.js';
import { enableFocusTrap, disableFocusTrap, focusFirstElement } from '../utils/focus-trap.js';
import { createKeyboardHandler } from '../utils/events.js';

/**
 * Menu Primitive Class
 * Extends UIPrimitive with menu-specific behavior
 */
class MenuPrimitive extends UIPrimitive {
  constructor(options = {}) {
    const {
      initialOpen = false,
      closeOnSelect = true,
      closeOnEscape = true,
      closeOnClickOutside = true,
      ...restOptions
    } = options;
    
    super({
      _type: 'menu',
      value: {
        isOpen: initialOpen,
        currentIndex: -1,
        triggerElement: null,
        position: null
      },
      computed: {
        // Computed properties for menu state
        cssOpacity: (state) => state.value.isOpen ? '1' : '0',
        cssVisibility: (state) => state.value.isOpen ? 'visible' : 'hidden',
        cssPointerEvents: (state) => state.value.isOpen ? 'auto' : 'none'
      },
      meta: {
        closeOnSelect,
        closeOnEscape,
        closeOnClickOutside
      },
      ...restOptions
    });
    
    // Internal menu items tracking
    this._items = [];
  }
  
  /**
   * Convenience getter for isOpen
   */
  get isOpen() {
    return this.get('value.isOpen');
  }
  
  /**
   * Get current focused index
   */
  get currentIndex() {
    return this.get('value.currentIndex');
  }
  
  /**
   * Open menu with optional trigger and position
   * @param {HTMLElement} triggerElement - Trigger element reference
   * @param {Object} position - Position coordinates {x, y}
   */
  open(triggerElement = null, position = null) {
    if (this.isOpen) return;
    
    this.set('status', 'transitioning');
    this.emit('openStart', { state: this.state, primitive: this, position });
    
    this.batch(() => {
      this.set('value.isOpen', true);
      this.set('value.currentIndex', -1);
      this.set('value.triggerElement', triggerElement);
      this.set('value.position', position);
    });
    
    this.set('status', 'active');
    
    // Async completion event
    queueMicrotask(() => {
      this.emit('openEnd', { state: this.state, primitive: this });
    });
  }
  
  /**
   * Close menu
   */
  close() {
    if (!this.isOpen) return;
    
    this.set('status', 'transitioning');
    this.emit('closeStart', { state: this.state, primitive: this });
    
    this.batch(() => {
      this.set('value.isOpen', false);
      this.set('value.currentIndex', -1);
      this.set('value.triggerElement', null);
      this.set('value.position', null);
    });
    
    this.set('status', 'idle');
    
    // Async completion event
    queueMicrotask(() => {
      this.emit('closeEnd', { state: this.state, primitive: this });
    });
  }
  
  /**
   * Toggle menu state
   * @param {HTMLElement} triggerElement - Trigger element reference
   */
  toggle(triggerElement = null) {
    this.isOpen ? this.close() : this.open(triggerElement);
  }
  
  /**
   * Focus next menu item
   */
  focusNext() {
    if (!this.isOpen || this._items.length === 0) return;
    
    const currentIndex = this.currentIndex;
    const nextIndex = (currentIndex + 1) % this._items.length;
    
    this.set('value.currentIndex', nextIndex);
    this._items[nextIndex]?.focus();
  }
  
  /**
   * Focus previous menu item
   */
  focusPrevious() {
    if (!this.isOpen || this._items.length === 0) return;
    
    const currentIndex = this.currentIndex;
    const prevIndex = currentIndex <= 0 ? this._items.length - 1 : currentIndex - 1;
    
    this.set('value.currentIndex', prevIndex);
    this._items[prevIndex]?.focus();
  }
  
  /**
   * Select current focused item
   */
  selectCurrent() {
    const currentIndex = this.currentIndex;
    if (currentIndex >= 0 && this._items[currentIndex]) {
      const item = this._items[currentIndex];
      item.click();
      
      if (this.get('meta.closeOnSelect')) {
        this.close();
      }
    }
  }
  
  /**
   * Register trigger element (button or context area)
   * @param {HTMLElement} element - Trigger element
   * @param {Object} options - Options
   * @returns {Function} Cleanup function
   */
  registerTrigger(element, options = {}) {
    if (!element?.addEventListener) {
      console.warn('MenuPrimitive: Invalid trigger element');
      return () => {};
    }
    
    const {
      triggerOnClick = true,
      triggerOnContextMenu = false
    } = options;
    
    const handleClick = (e) => {
      if (triggerOnClick) {
        e.preventDefault();
        e.stopPropagation();
        this.toggle(element);
      }
    };
    
    const handleContextMenu = (e) => {
      if (triggerOnContextMenu) {
        e.preventDefault();
        const position = { x: e.clientX, y: e.clientY };
        this.open(element, position);
      }
    };
    
    const handleKeydown = createKeyboardHandler({
      onEnter: (e) => {
        e.preventDefault();
        this.toggle(element);
      },
      onSpace: (e) => {
        e.preventDefault();
        this.toggle(element);
      },
      onArrowDown: (e) => {
        e.preventDefault();
        if (!this.isOpen) {
          this.open(element);
        } else {
          this.focusNext();
        }
      }
    });
    
    // Setup event listeners
    if (triggerOnClick) {
      element.addEventListener('click', handleClick);
    }
    
    if (triggerOnContextMenu) {
      element.addEventListener('contextmenu', handleContextMenu);
    }
    
    element.addEventListener('keydown', handleKeydown);
    
    // Setup ARIA attributes
    element.setAttribute('aria-haspopup', 'menu');
    
    const updateAria = () => {
      element.setAttribute('aria-expanded', String(this.isOpen));
    };
    updateAria();
    
    // Listen to state changes
    const unsubscribe = this.on('valueChange', updateAria);
    
    return () => {
      if (triggerOnClick) {
        element.removeEventListener('click', handleClick);
      }
      if (triggerOnContextMenu) {
        element.removeEventListener('contextmenu', handleContextMenu);
      }
      element.removeEventListener('keydown', handleKeydown);
      element.removeAttribute('aria-haspopup');
      element.removeAttribute('aria-expanded');
      unsubscribe();
    };
  }
  
  /**
   * Register menu content element
   * @param {HTMLElement} element - Content element
   * @param {Object} options - Options
   * @returns {Function} Cleanup function
   */
  registerContent(element, options = {}) {
    if (!element) {
      console.warn('MenuPrimitive: Invalid content element');
      return () => {};
    }
    
    const {
      trapFocus = true,
      autoFocus = true,
      closeOnClickOutside = this.get('meta.closeOnClickOutside'),
      closeOnEscape = this.get('meta.closeOnEscape')
    } = options;
    
    let focusTrapCleanup = null;
    let clickOutsideHandler = null;
    
    const updateItems = () => {
      this._items = Array.from(element.querySelectorAll(
        '[role="menuitem"]:not([disabled]), ' +
        '[role="menuitemcheckbox"]:not([disabled]), ' +
        '[role="menuitemradio"]:not([disabled])'
      ));
    };
    
    const handleKeydown = createKeyboardHandler({
      onEscape: () => closeOnEscape && this.close(),
      onArrowDown: (e) => {
        e.preventDefault();
        this.focusNext();
      },
      onArrowUp: (e) => {
        e.preventDefault();
        this.focusPrevious();
      },
      onEnter: (e) => {
        e.preventDefault();
        this.selectCurrent();
      },
      onSpace: (e) => {
        e.preventDefault();
        this.selectCurrent();
      }
    });
    
    const handleClickOutside = (e) => {
      const triggerElement = this.get('value.triggerElement');
      if (!element.contains(e.target) && 
          (!triggerElement || !triggerElement.contains(e.target))) {
        this.close();
      }
    };
    
    const onOpen = () => {
      updateItems();
      
      // Focus management
      if (trapFocus) {
        focusTrapCleanup = enableFocusTrap(element, this);
      }
      if (autoFocus && this._items.length > 0) {
        requestAnimationFrame(() => {
          this.set('value.currentIndex', 0);
          this._items[0].focus();
        });
      }
      
      // Keyboard handling
      element.addEventListener('keydown', handleKeydown);
      
      // Click outside handling
      if (closeOnClickOutside) {
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
      element.removeEventListener('keydown', handleKeydown);
      
      if (clickOutsideHandler) {
        document.removeEventListener('click', clickOutsideHandler);
        clickOutsideHandler = null;
      }
      
      // Update visibility and ARIA
      element.setAttribute('aria-hidden', 'true');
      element.style.display = 'none';
      
      // Return focus to trigger
      const triggerElement = this.get('value.triggerElement');
      if (triggerElement?.focus) {
        triggerElement.focus();
      }
    };
    
    // Prevent clicks inside from closing (unless on menu item)
    const handleClick = (e) => {
      const isMenuItem = e.target.closest('[role^="menuitem"]');
      if (!isMenuItem) {
        e.stopPropagation();
      }
    };
    element.addEventListener('click', handleClick);
    
    // Initial state
    element.setAttribute('role', 'menu');
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
      element.removeEventListener('keydown', handleKeydown);
      if (clickOutsideHandler) {
        document.removeEventListener('click', clickOutsideHandler);
      }
      element.removeEventListener('click', handleClick);
    };
  }
  
  /**
   * Register menu item
   * @param {HTMLElement} element - Menu item element
   * @param {Object} options - Options
   * @returns {Function} Cleanup function
   */
  registerItem(element, options = {}) {
    if (!element) return () => {};
    
    const { onSelect } = options;
    
    element.setAttribute('role', 'menuitem');
    element.setAttribute('tabindex', '-1');
    
    const handleClick = () => {
      onSelect?.();
      if (this.get('meta.closeOnSelect')) {
        this.close();
      }
    };
    
    const handleKeydown = createKeyboardHandler({
      onEnter: (e) => {
        e.preventDefault();
        handleClick();
      },
      onSpace: (e) => {
        e.preventDefault();
        handleClick();
      }
    });
    
    element.addEventListener('click', handleClick);
    element.addEventListener('keydown', handleKeydown);
    
    return () => {
      element.removeEventListener('click', handleClick);
      element.removeEventListener('keydown', handleKeydown);
      element.removeAttribute('role');
      element.removeAttribute('tabindex');
    };
  }
}

/**
 * Create menu primitive instance
 * @param {Object} options - Menu configuration
 * @param {Array} plugins - Plugins to apply
 * @returns {MenuPrimitive} Menu instance
 */
export function createMenu(options = {}, plugins = []) {
  const menu = new MenuPrimitive(options);
  
  // Apply plugins
  plugins.forEach(plugin => {
    if (typeof plugin === 'function') {
      menu.use(plugin);
    }
  });
  
  return menu;
}