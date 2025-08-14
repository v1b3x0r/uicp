/**
 * @uip/plugin-snap - Universal Snap Points Plugin
 * Smart sizing with snap points for all UI primitives
 */

/**
 * Snap configurations per primitive type
 */
const SNAP_CONFIGS = {
  drawer: {
    axis: 'x',
    points: ['25%', '50%', '75%', '100%'],
    supports: true
  },
  modal: {
    axis: 'both',
    points: ['320px', '480px', '640px', '90vw'],
    supports: true
  },
  popover: {
    axis: 'both', 
    points: ['200px', '300px', '400px'],
    supports: true
  },
  tooltip: {
    supports: false
  },
  menu: {
    axis: 'y',
    points: ['auto'],
    supports: false
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
 * @typedef {Object} SnapOptions
 * @property {string[]} [points] - Available snap points
 * @property {'x'|'y'|'both'} [axis] - Snap axis
 * @property {string} [initialPoint] - Initial snap point
 * @property {string} [transition='all 0.3s ease'] - CSS transition
 * @property {Function} [onSnapChange] - Callback when snap point changes
 */

/**
 * Register snap points for any primitive
 * @param {Object} primitive - Any UI primitive instance
 * @param {HTMLElement} element - Content element
 * @param {SnapOptions} options - Snap options
 * @returns {Function} Cleanup function
 */
export function registerSnap(primitive, element, options = {}) {
  if (!element?.style) {
    console.warn('registerSnap: Invalid element provided');
    return () => {};
  }
  
  if (!primitive?.open || typeof primitive.isOpen !== 'boolean') {
    console.warn('registerSnap: Invalid primitive instance');
    return () => {};
  }
  
  // Get primitive type and config
  const type = detectPrimitiveType(primitive);
  const config = SNAP_CONFIGS[type] || {};
  
  if (!config.supports) {
    console.info(`Snap: ${type} primitive does not support snap points`);
    return () => {};
  }
  
  const {
    points = config.points || ['50%', '100%'],
    axis = config.axis || 'x',
    initialPoint = points[0],
    transition = 'all 0.3s ease',
    onSnapChange
  } = options;
  
  let currentPoint = initialPoint;
  
  // Apply snap point
  function applySnapPoint(point) {
    if (!points.includes(point)) {
      console.warn(`Invalid snap point: ${point}. Available: ${points.join(', ')}`);
      return;
    }
    
    currentPoint = point;
    element.style.transition = transition;
    
    if (axis === 'x') {
      element.style.width = point;
    } else if (axis === 'y') {
      element.style.height = point;
    } else if (axis === 'both') {
      // Handle both width and height
      if (point.includes('x')) {
        const [width, height] = point.split('x');
        element.style.width = width;
        element.style.height = height;
      } else {
        element.style.width = point;
        element.style.height = point;
      }
    }
    
    // Add data attributes for CSS targeting
    element.setAttribute('data-snap-point', point);
    element.setAttribute('data-snap-axis', axis);
    element.setAttribute('data-snap-primitive', type);
    
    // Callback
    onSnapChange?.({
      point,
      axis,
      primitive: type,
      instance: primitive
    });
  }
  
  // Initialize
  applySnapPoint(currentPoint);
  
  // API methods (stored as property instead of mutation)
  const snapAPI = {
    getSnapPoint: () => currentPoint,
    setSnapPoint: applySnapPoint,
    getSnapPoints: () => [...points],
    snapToNext() {
      const currentIndex = points.indexOf(currentPoint);
      const nextIndex = (currentIndex + 1) % points.length;
      applySnapPoint(points[nextIndex]);
    },
    snapToPrevious() {
      const currentIndex = points.indexOf(currentPoint);
      const prevIndex = currentIndex === 0 ? points.length - 1 : currentIndex - 1;
      applySnapPoint(points[prevIndex]);
    }
  };
  
  // Store snap API as property (no mutation)
  primitive._snapAPI = snapAPI;
  
  // Handle resize on open/close
  const handleOpen = () => {
    applySnapPoint(currentPoint);
  };
  
  const unsubscribeOpen = primitive.onOpenStart?.(handleOpen);
  
  return () => {
    unsubscribeOpen?.();
    
    // Remove data attributes
    element.removeAttribute('data-snap-point');
    element.removeAttribute('data-snap-axis');
    element.removeAttribute('data-snap-primitive');
    
    // Reset styles
    element.style.transition = '';
    if (axis === 'x' || axis === 'both') {
      element.style.width = '';
    }
    if (axis === 'y' || axis === 'both') {
      element.style.height = '';
    }
    
    // Remove API
    delete primitive._snapAPI;
  };
}

// Backward compatibility
export const registerDrawerSnap = registerSnap;

/**
 * Return snap API instead of mutating
 * @param {Object} primitive
 * @returns {Object} Snap API methods
 */
export function getSnapAPI(primitive) {
  return primitive._snapAPI || {};
}

/**
 * Create snap plugin for initialization
 * @param {Object} options
 * @returns {Function} Plugin function
 */
export function createSnapPlugin(options = {}) {
  return (primitive) => {
    // Auto-register if element is available
    if (primitive._element) {
      return registerSnap(primitive, primitive._element, options);
    }
    
    // Store config for later registration
    primitive._snapOptions = options;
    return () => {};
  };
}

/**
 * Preset snap configurations
 */
export const SnapPresets = {
  // Drawer presets
  drawerWidthQuarters: () => createSnapPlugin({ 
    axis: 'x',
    points: ['25%', '50%', '75%', '100%']
  }),
  
  drawerWidthFixed: () => createSnapPlugin({ 
    axis: 'x',
    points: ['280px', '400px', '600px']
  }),
  
  drawerHeightHalves: () => createSnapPlugin({ 
    axis: 'y',
    points: ['50%', '75%', '100%']
  }),
  
  // Modal presets
  modalSizes: () => createSnapPlugin({ 
    axis: 'both',
    points: ['400px', '600px', '800px', '90vw']
  }),
  
  modalResponsive: () => createSnapPlugin({ 
    axis: 'both',
    points: ['320px', '480px', '768px', '1024px']
  }),
  
  // Popover presets
  popoverSizes: () => createSnapPlugin({ 
    axis: 'both',
    points: ['200px', '300px', '400px']
  })
};