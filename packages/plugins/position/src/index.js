/**
 * @uip/plugin-position - Universal Positioning Plugin
 * Smart positioning for all UI primitives with auto-placement
 */

/**
 * Position configurations per primitive type
 */
const POSITION_CONFIGS = {
  drawer: {
    positions: ['left', 'right', 'top', 'bottom'],
    defaultPosition: 'right',
    defaultSize: '320px',
    fullscreen: false
  },
  modal: {
    positions: ['center', 'top', 'bottom', 'fullscreen'],
    defaultPosition: 'center',
    defaultSize: 'auto',
    backdrop: true
  },
  tooltip: {
    positions: ['auto', 'top', 'bottom', 'left', 'right'],
    defaultPosition: 'auto',
    defaultSize: 'auto',
    offset: 8
  },
  popover: {
    positions: ['auto', 'top', 'bottom', 'left', 'right'],
    defaultPosition: 'bottom',
    defaultSize: 'auto',
    offset: 4
  },
  menu: {
    positions: ['auto', 'contextual', 'dropdown'],
    defaultPosition: 'auto',
    defaultSize: 'auto',
    offset: 0
  }
};

/**
 * Detect primitive type
 * @param {Object} primitive
 * @returns {string}
 */
function detectPrimitiveType(primitive) {
  return primitive._type || 'unknown';
}

/**
 * Calculate auto position based on viewport
 * @param {HTMLElement} trigger
 * @param {HTMLElement} content
 * @param {string} preferredPosition
 * @returns {Object} Position and coordinates
 */
function calculateAutoPosition(trigger, content, preferredPosition = 'bottom') {
  if (!trigger || !content) return { position: preferredPosition, x: 0, y: 0 };
  
  const triggerRect = trigger.getBoundingClientRect();
  const contentRect = content.getBoundingClientRect();
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };
  
  // Check available space
  const space = {
    top: triggerRect.top,
    bottom: viewport.height - triggerRect.bottom,
    left: triggerRect.left,
    right: viewport.width - triggerRect.right
  };
  
  // Determine best position
  let position = preferredPosition;
  if (position === 'auto') {
    // Find position with most space
    const positions = ['bottom', 'top', 'right', 'left'];
    position = positions.reduce((best, pos) => 
      space[pos] > space[best] ? pos : best
    , 'bottom');
  }
  
  // Calculate coordinates
  let x = 0, y = 0;
  
  switch (position) {
    case 'top':
      x = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
      y = triggerRect.top - contentRect.height;
      break;
    case 'bottom':
      x = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
      y = triggerRect.bottom;
      break;
    case 'left':
      x = triggerRect.left - contentRect.width;
      y = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
      break;
    case 'right':
      x = triggerRect.right;
      y = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
      break;
    case 'center':
      x = (viewport.width - contentRect.width) / 2;
      y = (viewport.height - contentRect.height) / 2;
      break;
  }
  
  // Constrain to viewport
  x = Math.max(0, Math.min(x, viewport.width - contentRect.width));
  y = Math.max(0, Math.min(y, viewport.height - contentRect.height));
  
  return { position, x, y };
}

/**
 * Apply position styles based on primitive type
 * @param {HTMLElement} element
 * @param {string} type
 * @param {string} position
 * @param {string} size
 */
function applyPositionStyles(element, type, position, size) {
  const styles = {
    position: 'fixed',
    zIndex: '1000'
  };
  
  if (type === 'drawer') {
    // Drawer positioning
    styles.transition = 'transform 0.3s ease';
    
    switch (position) {
      case 'left':
        Object.assign(styles, {
          left: '0',
          top: '0',
          bottom: '0',
          width: size,
          transform: 'translateX(-100%)'
        });
        break;
      case 'right':
        Object.assign(styles, {
          right: '0',
          top: '0',
          bottom: '0',
          width: size,
          transform: 'translateX(100%)'
        });
        break;
      case 'top':
        Object.assign(styles, {
          left: '0',
          right: '0',
          top: '0',
          height: size,
          transform: 'translateY(-100%)'
        });
        break;
      case 'bottom':
        Object.assign(styles, {
          left: '0',
          right: '0',
          bottom: '0',
          height: size,
          transform: 'translateY(100%)'
        });
        break;
    }
  } else if (type === 'modal') {
    // Modal positioning
    switch (position) {
      case 'center':
        Object.assign(styles, {
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        });
        break;
      case 'top':
        Object.assign(styles, {
          left: '50%',
          top: '20%',
          transform: 'translateX(-50%)'
        });
        break;
      case 'bottom':
        Object.assign(styles, {
          left: '50%',
          bottom: '20%',
          transform: 'translateX(-50%)'
        });
        break;
      case 'fullscreen':
        Object.assign(styles, {
          left: '0',
          right: '0',
          top: '0',
          bottom: '0'
        });
        break;
    }
  }
  
  // Apply styles
  Object.assign(element.style, styles);
}

/**
 * Register positioning for any primitive
 * @param {Object} primitive - Any UI primitive instance
 * @param {HTMLElement} element - Content element
 * @param {Object} options - Position options
 * @returns {Function} Cleanup function
 */
export function registerPosition(primitive, element, options = {}) {
  if (!element?.style) {
    console.warn('registerPosition: Invalid element provided');
    return () => {};
  }
  
  if (!primitive?.open || !primitive?.close) {
    console.warn('registerPosition: Invalid primitive instance');
    return () => {};
  }
  
  // Get primitive type and config
  const type = detectPrimitiveType(primitive);
  const config = POSITION_CONFIGS[type] || {};
  
  const {
    position = config.defaultPosition || 'bottom',
    size = config.defaultSize || 'auto',
    offset = config.offset || 0,
    autoClose = type === 'drawer',
    transition = 'transform 0.3s ease'
  } = options;
  
  let triggerElement = null;
  let clickOutsideHandler = null;
  
  // Apply initial styles
  applyPositionStyles(element, type, position, size);
  
  const handleOpen = (state) => {
    // Get trigger element if available
    triggerElement = state?.triggerElement;
    
    // Auto-position for tooltip/popover/menu
    if (type !== 'drawer' && type !== 'modal' && triggerElement) {
      const pos = calculateAutoPosition(triggerElement, element, position);
      element.style.left = `${pos.x}px`;
      element.style.top = `${pos.y + offset}px`;
    }
    
    // Animate open for drawer
    if (type === 'drawer') {
      requestAnimationFrame(() => {
        element.style.transform = 'translate(0, 0)';
      });
    }
    
    // Setup auto-close for drawer
    if (autoClose && type === 'drawer') {
      clickOutsideHandler = (e) => {
        if (!element.contains(e.target)) {
          primitive.close();
        }
      };
      setTimeout(() => {
        document.addEventListener('click', clickOutsideHandler);
      }, 100);
    }
  };
  
  const handleClose = () => {
    // Animate close for drawer
    if (type === 'drawer') {
      applyPositionStyles(element, type, position, size);
    }
    
    // Remove click outside handler
    if (clickOutsideHandler) {
      document.removeEventListener('click', clickOutsideHandler);
      clickOutsideHandler = null;
    }
  };
  
  // Subscribe to lifecycle
  const unsubOpen = primitive.onOpenStart?.(handleOpen);
  const unsubClose = primitive.onCloseStart?.(handleClose);
  
  // Handle window resize
  const handleResize = () => {
    if (primitive.isOpen && triggerElement) {
      const pos = calculateAutoPosition(triggerElement, element, position);
      element.style.left = `${pos.x}px`;
      element.style.top = `${pos.y + offset}px`;
    }
  };
  
  window.addEventListener('resize', handleResize);
  
  // Return cleanup
  return () => {
    unsubOpen?.();
    unsubClose?.();
    window.removeEventListener('resize', handleResize);
    if (clickOutsideHandler) {
      document.removeEventListener('click', clickOutsideHandler);
    }
    
    // Reset styles
    element.style.position = '';
    element.style.zIndex = '';
    element.style.transform = '';
    element.style.transition = '';
    element.style.left = '';
    element.style.right = '';
    element.style.top = '';
    element.style.bottom = '';
    element.style.width = '';
    element.style.height = '';
  };
}

/**
 * Backward compatibility
 */
export const registerDrawerDirection = registerPosition;

/**
 * Create position plugin for initialization
 * @param {Object} options
 * @returns {Function} Plugin function
 */
export function createPositionPlugin(options = {}) {
  return (primitive) => {
    // Auto-register if element is available
    if (primitive._element) {
      return registerPosition(primitive, primitive._element, options);
    }
    
    // Store config for later registration
    primitive._positionOptions = options;
    return () => {};
  };
}

/**
 * Position presets for common use cases
 */
export const PositionPresets = {
  drawerLeft: () => createPositionPlugin({ position: 'left', size: '280px' }),
  drawerRight: () => createPositionPlugin({ position: 'right', size: '320px' }),
  drawerBottom: () => createPositionPlugin({ position: 'bottom', size: '40vh' }),
  modalCenter: () => createPositionPlugin({ position: 'center' }),
  modalFullscreen: () => createPositionPlugin({ position: 'fullscreen' }),
  tooltipAuto: () => createPositionPlugin({ position: 'auto', offset: 8 }),
  popoverBottom: () => createPositionPlugin({ position: 'bottom', offset: 4 }),
  menuContextual: () => createPositionPlugin({ position: 'contextual' })
};