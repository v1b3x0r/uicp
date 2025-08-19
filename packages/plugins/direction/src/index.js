/**
 * @uip/plugin-direction - Directional Positioning Plugin
 * Handles drawer positioning (left, right, top, bottom) with smooth animations
 */

/**
 * @typedef {Object} DirectionOptions
 * @property {'left'|'right'|'top'|'bottom'} [direction='right'] - Drawer direction
 * @property {string} [size='320px'] - Drawer size (width for left/right, height for top/bottom)
 * @property {string} [transition='transform 0.3s ease'] - CSS transition
 * @property {boolean} [autoClose=true] - Auto close on outside click
 */

/**
 * Register direction positioning for UIP primitive
 * @param {Object} primitive - UIPrimitive instance
 * @param {HTMLElement} element - Content element
 * @param {DirectionOptions} options - Direction options
 * @returns {Function} Cleanup function
 */
export function registerDrawerDirection(primitive, element, options = {}) {
  if (!element?.style) {
    console.warn('registerDrawerDirection: Invalid element provided');
    return () => {};
  }
  
  if (!primitive?._type || typeof primitive.get !== 'function') {
    console.warn('registerDrawerDirection: Invalid UIPrimitive instance');
    return () => {};
  }
  
  const {
    direction = 'right',
    size = '320px',
    transition = 'transform 0.3s ease',
    autoClose = true
  } = options;
  
  const isHorizontal = direction === 'left' || direction === 'right';
  
  // Apply base styles
  function applyBaseStyles() {
    element.style.position = 'fixed';
    element.style.zIndex = '1000';
    element.style.transition = transition;
    
    // Direction-specific positioning
    switch (direction) {
      case 'left':
        element.style.top = '0';
        element.style.left = '0';
        element.style.bottom = '0';
        element.style.width = size;
        element.style.transform = 'translateX(-100%)';
        break;
      case 'right':
        element.style.top = '0';
        element.style.right = '0';
        element.style.bottom = '0';
        element.style.width = size;
        element.style.transform = 'translateX(100%)';
        break;
      case 'top':
        element.style.top = '0';
        element.style.left = '0';
        element.style.right = '0';
        element.style.height = size;
        element.style.transform = 'translateY(-100%)';
        break;
      case 'bottom':
        element.style.bottom = '0';
        element.style.left = '0';
        element.style.right = '0';
        element.style.height = size;
        element.style.transform = 'translateY(100%)';
        break;
    }
    
    // Add direction class for CSS targeting
    element.classList.add('uip-drawer');
    element.classList.add(`uip-drawer-${direction}`);
  }
  
  // Handle open/close animations
  function handleOpen() {
    element.style.transform = 'translate(0, 0)';
    element.setAttribute('data-state', 'open');
  }
  
  function handleClose() {
    switch (direction) {
      case 'left':
        element.style.transform = 'translateX(-100%)';
        break;
      case 'right':
        element.style.transform = 'translateX(100%)';
        break;
      case 'top':
        element.style.transform = 'translateY(-100%)';
        break;
      case 'bottom':
        element.style.transform = 'translateY(100%)';
        break;
    }
    element.setAttribute('data-state', 'closed');
  }
  
  // Outside click handler
  function handleOutsideClick(event) {
    const isOpen = primitive.get('value.isOpen') || false;
    if (autoClose && isOpen && !element.contains(event.target)) {
      primitive.close?.() || primitive.set('value.isOpen', false);
    }
  }
  
  // Initialize
  applyBaseStyles();
  
  // Set initial state
  const isOpen = primitive.get('value.isOpen') || false;
  if (isOpen) {
    handleOpen();
  } else {
    handleClose();
  }
  
  // Subscribe to state changes
  const unsubscribeChange = primitive.on('valueChange', ({ value }) => {
    if (value.isOpen) {
      handleOpen();
    } else {
      handleClose();
    }
  });
  
  // Outside click listener
  let clickCleanup = () => {};
  if (autoClose) {
    // Add delay to prevent immediate close on open
    const enableOutsideClick = () => {
      setTimeout(() => {
        document.addEventListener('click', handleOutsideClick);
        clickCleanup = () => document.removeEventListener('click', handleOutsideClick);
      }, 50);
    };
    
    const unsubscribeOpenEnd = primitive.on('transitionComplete', (data) => {
      if (data.to === true) enableOutsideClick();
    });
    const unsubscribeCloseEnd = primitive.on('transitionComplete', (data) => {
      if (data.to === false) clickCleanup();
    });
    
    clickCleanup = () => {
      unsubscribeOpenEnd();
      unsubscribeCloseEnd();
      document.removeEventListener('click', handleOutsideClick);
    };
  }
  
  return () => {
    unsubscribeChange();
    clickCleanup();
    
    // Reset styles
    element.style.position = '';
    element.style.zIndex = '';
    element.style.transition = '';
    element.style.transform = '';
    element.style.top = '';
    element.style.left = '';
    element.style.right = '';
    element.style.bottom = '';
    element.style.width = '';
    element.style.height = '';
    
    // Remove classes
    element.classList.remove('uip-drawer');
    element.classList.remove(`uip-drawer-${direction}`);
    element.removeAttribute('data-state');
  };
}

/**
 * Modern direction plugin for UIP primitives
 * @param {DirectionOptions} options - Direction options
 * @returns {Function} Plugin function
 */
export function directionPlugin(options = {}) {
  return function directionPluginHandler(primitive) {
    // Only works with drawer-like primitives
    if (primitive._type !== 'drawer') {
      // Return no-op cleanup for unsupported primitives
      return () => {};
    }
    
    const cleanupFunctions = [];
    
    // Register direction on content element
    if (primitive._contentElement) {
      cleanupFunctions.push(
        registerDrawerDirection(primitive, primitive._contentElement, options)
      );
    }
    
    // Listen for new element registrations
    const unsubscribeElementRegister = primitive.on('elementRegister', ({ element, role }) => {
      if (role === 'content') {
        cleanupFunctions.push(
          registerDrawerDirection(primitive, element, options)
        );
      }
    });
    
    cleanupFunctions.push(unsubscribeElementRegister);
    
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  };
}

/**
 * Legacy plugin interface (backward compatibility)
 * @deprecated Use directionPlugin() instead
 */
export function createDirectionPlugin(options = {}) {
  return {
    name: 'direction',
    register: (drawer, element) => registerDrawerDirection(drawer, element, options)
  };
}

/**
 * Preset plugins for common directions
 */
export const DirectionPresets = {
  leftDrawer: (size = '320px') => directionPlugin({ direction: 'left', size }),
  rightDrawer: (size = '320px') => directionPlugin({ direction: 'right', size }),
  topDrawer: (size = '40vh') => directionPlugin({ direction: 'top', size }),
  bottomDrawer: (size = '40vh') => directionPlugin({ direction: 'bottom', size }),
  
  // Mobile-friendly variants
  mobileSheet: () => directionPlugin({ 
    direction: 'bottom', 
    size: '60vh',
    transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
  }),
  
  sidebar: () => directionPlugin({ 
    direction: 'left', 
    size: '280px',
    transition: 'transform 0.25s ease-out'
  })
};