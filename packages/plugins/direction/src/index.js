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
 * Register direction positioning for drawer
 * @param {Object} drawer - Drawer instance from @uip/core
 * @param {HTMLElement} element - Drawer element
 * @param {DirectionOptions} options - Direction options
 * @returns {Function} Cleanup function
 */
export function registerDrawerDirection(drawer, element, options = {}) {
  if (!element?.style) {
    console.warn('registerDrawerDirection: Invalid element provided');
    return () => {};
  }
  
  if (!drawer?.isOpen !== undefined) {
    console.warn('registerDrawerDirection: Invalid drawer instance');
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
    if (autoClose && drawer.isOpen && !element.contains(event.target)) {
      drawer.close();
    }
  }
  
  // Initialize
  applyBaseStyles();
  
  // Set initial state
  if (drawer.isOpen) {
    handleOpen();
  } else {
    handleClose();
  }
  
  // Subscribe to state changes
  const unsubscribeOpen = drawer.onOpenStart(handleOpen);
  const unsubscribeClose = drawer.onCloseStart(handleClose);
  
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
    
    const unsubscribeOpenEnd = drawer.onOpenEnd(enableOutsideClick);
    const unsubscribeCloseEnd = drawer.onCloseEnd(() => clickCleanup());
    
    clickCleanup = () => {
      unsubscribeOpenEnd();
      unsubscribeCloseEnd();
      document.removeEventListener('click', handleOutsideClick);
    };
  }
  
  return () => {
    unsubscribeOpen();
    unsubscribeClose();
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
 * Plugin interface for composition
 * @param {DirectionOptions} options - Direction options
 * @returns {Object} Plugin object
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
  leftDrawer: (size = '320px') => createDirectionPlugin({ direction: 'left', size }),
  rightDrawer: (size = '320px') => createDirectionPlugin({ direction: 'right', size }),
  topDrawer: (size = '40vh') => createDirectionPlugin({ direction: 'top', size }),
  bottomDrawer: (size = '40vh') => createDirectionPlugin({ direction: 'bottom', size }),
  
  // Mobile-friendly variants
  mobileSheet: () => createDirectionPlugin({ 
    direction: 'bottom', 
    size: '60vh',
    transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
  }),
  
  sidebar: () => createDirectionPlugin({ 
    direction: 'left', 
    size: '280px',
    transition: 'transform 0.25s ease-out'
  })
};