/**
 * @uip/plugin-snap - Snap Points Plugin
 * Provides dynamic sizing with predefined snap points
 */

/**
 * @typedef {Object} SnapOptions
 * @property {string[]} [points=['25%', '50%', '75%', '100%']] - Available snap points
 * @property {'x'|'y'} [axis='x'] - Snap axis (x for width, y for height)
 * @property {string} [initialPoint='50%'] - Initial snap point
 * @property {string} [transition='all 0.3s ease'] - CSS transition
 * @property {Function} [onSnapChange] - Callback when snap point changes
 */

/**
 * Register snap points for drawer
 * @param {Object} drawer - Drawer instance from @uip/core
 * @param {HTMLElement} element - Drawer element
 * @param {SnapOptions} options - Snap options
 * @returns {Function} Cleanup function
 */
export function registerDrawerSnap(drawer, element, options = {}) {
  if (!element?.style) {
    console.warn('registerDrawerSnap: Invalid element provided');
    return () => {};
  }
  
  if (!drawer?.isOpen !== undefined) {
    console.warn('registerDrawerSnap: Invalid drawer instance');
    return () => {};
  }
  
  const {
    points = ['25%', '50%', '75%', '100%'],
    axis = 'x',
    initialPoint = '50%',
    transition = 'all 0.3s ease',
    onSnapChange
  } = options;
  
  let currentPoint = initialPoint;
  const property = axis === 'x' ? 'width' : 'height';
  
  // Validate initial point
  if (!points.includes(currentPoint)) {
    currentPoint = points[0] || '50%';
  }
  
  // Apply snap point
  function applySnapPoint(point) {
    if (!points.includes(point)) {
      console.warn(`Invalid snap point: ${point}. Available: ${points.join(', ')}`);
      return;
    }
    
    currentPoint = point;
    element.style[property] = point;
    element.style.transition = transition;
    
    // Add data attribute for CSS targeting
    element.setAttribute('data-snap-point', point);
    element.setAttribute('data-snap-axis', axis);
    
    // Callback
    if (onSnapChange) {
      onSnapChange({ point, axis, property, drawer });
    }
  }
  
  // Initialize
  applySnapPoint(currentPoint);
  
  // API methods to be added to drawer instance
  const snapAPI = {
    getSnapPoint: () => currentPoint,
    setSnapPoint: applySnapPoint,
    getSnapPoints: () => [...points],
    nextSnapPoint: () => {
      const currentIndex = points.indexOf(currentPoint);
      const nextIndex = (currentIndex + 1) % points.length;
      applySnapPoint(points[nextIndex]);
    },
    prevSnapPoint: () => {
      const currentIndex = points.indexOf(currentPoint);
      const prevIndex = currentIndex === 0 ? points.length - 1 : currentIndex - 1;
      applySnapPoint(points[prevIndex]);
    }
  };
  
  // Extend drawer instance with snap methods
  Object.assign(drawer, snapAPI);
  
  // Handle resize on open/close
  const handleOpen = () => {
    applySnapPoint(currentPoint);
  };
  
  const unsubscribeOpen = drawer.onOpenStart(handleOpen);
  
  return () => {
    unsubscribeOpen();
    
    // Remove snap API from drawer
    Object.keys(snapAPI).forEach(key => {
      delete drawer[key];
    });
    
    // Reset styles
    element.style[property] = '';
    element.style.transition = '';
    element.removeAttribute('data-snap-point');
    element.removeAttribute('data-snap-axis');
  };
}

/**
 * Plugin interface for composition
 * @param {SnapOptions} options - Snap options
 * @returns {Object} Plugin object
 */
export function createSnapPlugin(options = {}) {
  return {
    name: 'snap',
    register: (drawer, element) => registerDrawerSnap(drawer, element, options)
  };
}

/**
 * Preset snap configurations
 */
export const SnapPresets = {
  // Common width points
  widthQuarters: () => createSnapPlugin({ 
    points: ['25%', '50%', '75%', '100%'], 
    axis: 'x' 
  }),
  
  widthHalves: () => createSnapPlugin({ 
    points: ['50%', '100%'], 
    axis: 'x' 
  }),
  
  // Common height points
  heightQuarters: () => createSnapPlugin({ 
    points: ['25%', '50%', '75%', '100%'], 
    axis: 'y' 
  }),
  
  heightHalves: () => createSnapPlugin({ 
    points: ['50%', '100%'], 
    axis: 'y' 
  }),
  
  // Mobile-friendly
  mobileHeights: () => createSnapPlugin({ 
    points: ['30%', '60%', '90%'], 
    axis: 'y',
    initialPoint: '60%' 
  }),
  
  // Fixed sizes
  fixedWidths: () => createSnapPlugin({ 
    points: ['280px', '400px', '600px'], 
    axis: 'x',
    initialPoint: '400px' 
  }),
  
  // Custom viewport-based
  viewportWidth: () => createSnapPlugin({ 
    points: ['25vw', '50vw', '75vw', '90vw'], 
    axis: 'x',
    initialPoint: '50vw' 
  }),
  
  viewportHeight: () => createSnapPlugin({ 
    points: ['25vh', '50vh', '75vh', '90vh'], 
    axis: 'y',
    initialPoint: '50vh' 
  })
};