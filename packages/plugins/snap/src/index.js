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
 * Register snap points for any UIP primitive
 * @param {Object} primitive - UIPrimitive instance
 * @param {HTMLElement} element - Content element
 * @param {SnapOptions} options - Snap options
 * @returns {Function} Cleanup function
 */
export function registerSnap(primitive, element, options = {}) {
  if (!element?.style) {
    console.warn('registerSnap: Invalid element provided');
    return () => {};
  }
  
  if (!primitive?._type || typeof primitive.get !== 'function') {
    console.warn('registerSnap: Invalid UIPrimitive instance');
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
    
    // Update primitive state
    primitive.set('computed.snapPoint', point);
    primitive.set('computed.snapAxis', axis);
    
    // Emit snap change event
    primitive.emit('snapChange', {
      point,
      axis,
      primitive: type,
      instance: primitive
    });
    
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
  
  // Handle resize on state changes
  const unsubscribeChange = primitive.on('valueChange', ({ value }) => {
    if (value.isOpen) {
      // Reapply snap point when opening
      applySnapPoint(currentPoint);
    }
  });
  
  return () => {
    unsubscribeChange();
    
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
    
    // Clear computed state
    primitive.set('computed.snapPoint', null);
    primitive.set('computed.snapAxis', null);
    
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
 * Modern snap plugin for UIP primitives
 * @param {SnapOptions} options - Snap configuration
 * @returns {Function} Plugin function
 */
export function snapPlugin(options = {}) {
  return function snapPluginHandler(primitive) {
    // Get primitive type and verify support
    const type = primitive._type;
    const config = SNAP_CONFIGS[type];
    
    if (!config?.supports) {
      // Return no-op cleanup for unsupported primitives
      return () => {};
    }
    
    // Merge options with primitive defaults
    const finalOptions = {
      axis: config.axis || 'x',
      points: config.points || ['50%', '100%'],
      ...options
    };
    
    const cleanupFunctions = [];
    
    // Register snap on content element
    if (primitive._contentElement) {
      cleanupFunctions.push(
        registerSnap(primitive, primitive._contentElement, finalOptions)
      );
    }
    
    // Listen for new element registrations
    const unsubscribeElementRegister = primitive.on('elementRegister', ({ element, role }) => {
      if (role === 'content') {
        cleanupFunctions.push(
          registerSnap(primitive, element, finalOptions)
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
 * Legacy snap plugin (backward compatibility)
 * @deprecated Use snapPlugin() instead
 */
export function createSnapPlugin(options = {}) {
  return snapPlugin(options);
}

/**
 * Preset snap configurations
 */
export const SnapPresets = {
  // Drawer presets
  drawerWidthQuarters: () => snapPlugin({ 
    axis: 'x',
    points: ['25%', '50%', '75%', '100%']
  }),
  
  drawerWidthFixed: () => snapPlugin({ 
    axis: 'x',
    points: ['280px', '400px', '600px']
  }),
  
  drawerHeightHalves: () => snapPlugin({ 
    axis: 'y',
    points: ['50%', '75%', '100%']
  }),
  
  // Modal presets
  modalSizes: () => snapPlugin({ 
    axis: 'both',
    points: ['400px', '600px', '800px', '90vw']
  }),
  
  modalResponsive: () => snapPlugin({ 
    axis: 'both',
    points: ['320px', '480px', '768px', '1024px']
  }),
  
  // Popover presets
  popoverSizes: () => snapPlugin({ 
    axis: 'both',
    points: ['200px', '300px', '400px']
  })
};