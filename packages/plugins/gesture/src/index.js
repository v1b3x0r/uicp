/**
 * @uip/plugin-gesture - Universal Touch & Mouse Gestures
 * Smooth drag interactions for all UI primitives
 */

/**
 * Primitive type configurations for gestures
 */
const GESTURE_CONFIGS = {
  drawer: {
    defaultAxis: 'x',
    defaultThreshold: 0.3,
    supportsDrag: true
  },
  modal: {
    defaultAxis: 'y',
    defaultThreshold: 0.2,
    supportsDrag: true,
    pullToClose: true
  },
  popover: {
    defaultAxis: 'y',
    defaultThreshold: 0.4,
    supportsDrag: false
  },
  tooltip: {
    supportsDrag: false
  },
  menu: {
    supportsDrag: false
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
 * Register gesture handling for any primitive
 * @param {Object} primitive - Any UI primitive instance
 * @param {HTMLElement} element
 * @param {Object} options
 * @returns {Function} Cleanup function
 */
export function registerGesture(primitive, element, options = {}) {
  if (!element?.addEventListener) {
    console.warn('registerGesture: Invalid element provided');
    return () => {};
  }
  
  if (!primitive?.open || typeof primitive.isOpen !== 'boolean') {
    console.warn('registerGesture: Invalid primitive instance');
    return () => {};
  }
  
  // Get primitive type and config
  const type = detectPrimitiveType(primitive);
  const config = GESTURE_CONFIGS[type] || {};
  
  if (!config.supportsDrag) {
    console.info(`Gesture: ${type} primitive does not support drag gestures`);
    return () => {};
  }
  
  const {
    axis = config.defaultAxis || 'x',
    threshold = config.defaultThreshold || 0.3,
    velocityThreshold = 0.5,
    onProgress,
    pullToClose = config.pullToClose || false
  } = options;
  
  let startPos = 0;
  let currentPos = 0;
  let startTime = 0;
  let isDragging = false;
  let dragDistance = 0;
  let containerSize = 0;
  let animationFrame = null;
  
  const isHorizontal = axis === 'x';
  
  function getPosition(event) {
    if (event.touches?.length > 0) {
      return isHorizontal ? event.touches[0].clientX : event.touches[0].clientY;
    }
    return isHorizontal ? event.clientX : event.clientY;
  }
  
  function getContainerSize() {
    return isHorizontal ? element.offsetWidth : element.offsetHeight;
  }
  
  function handleStart(event) {
    if (!primitive.isOpen && !pullToClose) return;
    
    isDragging = true;
    startPos = getPosition(event);
    currentPos = startPos;
    startTime = Date.now();
    containerSize = getContainerSize();
    
    element.style.transition = 'none';
    element.setAttribute('data-dragging', 'true');
    
    if (event.type === 'mousedown') {
      event.preventDefault();
    }
  }
  
  function handleMove(event) {
    if (!isDragging) return;
    
    currentPos = getPosition(event);
    dragDistance = currentPos - startPos;
    
    // Calculate progress (0-1)
    const progress = Math.abs(dragDistance) / containerSize;
    
    // Apply drag transform
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = requestAnimationFrame(() => {
      const transform = isHorizontal 
        ? `translateX(${dragDistance}px)`
        : `translateY(${dragDistance}px)`;
      
      element.style.transform = transform;
      element.setAttribute('data-drag-progress', progress.toFixed(2));
      
      onProgress?.({
        distance: dragDistance,
        progress,
        axis,
        primitive: type
      });
    });
    
    if (event.type === 'mousemove') {
      event.preventDefault();
    }
  }
  
  function handleEnd(event) {
    if (!isDragging) return;
    
    isDragging = false;
    const endTime = Date.now();
    const duration = endTime - startTime;
    const velocity = Math.abs(dragDistance) / duration;
    const progress = Math.abs(dragDistance) / containerSize;
    
    element.removeAttribute('data-dragging');
    element.removeAttribute('data-drag-progress');
    element.style.transition = '';
    element.style.transform = '';
    
    // Determine action based on threshold and velocity
    const shouldToggle = progress > threshold || velocity > velocityThreshold;
    
    if (shouldToggle) {
      if (primitive.isOpen) {
        // Closing gesture
        const isClosingDirection = (axis === 'x' && dragDistance < 0) || 
                                  (axis === 'y' && dragDistance > 0);
        if (isClosingDirection || pullToClose) {
          primitive.close();
        }
      } else if (pullToClose) {
        // Opening gesture (pull to open for modal)
        primitive.open();
      }
    }
    
    // Cleanup
    dragDistance = 0;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }
  
  function handleCancel() {
    if (!isDragging) return;
    
    isDragging = false;
    element.removeAttribute('data-dragging');
    element.removeAttribute('data-drag-progress');
    element.style.transition = '';
    element.style.transform = '';
    dragDistance = 0;
    
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }
  
  // Touch events
  element.addEventListener('touchstart', handleStart, { passive: true });
  element.addEventListener('touchmove', handleMove, { passive: true });
  element.addEventListener('touchend', handleEnd, { passive: true });
  element.addEventListener('touchcancel', handleCancel, { passive: true });
  
  // Mouse events
  element.addEventListener('mousedown', handleStart);
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleEnd);
  
  // Cleanup function
  return () => {
    element.removeEventListener('touchstart', handleStart);
    element.removeEventListener('touchmove', handleMove);
    element.removeEventListener('touchend', handleEnd);
    element.removeEventListener('touchcancel', handleCancel);
    element.removeEventListener('mousedown', handleStart);
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
    
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };
}

/**
 * Backward compatibility
 */
export const registerDrawerDrag = registerGesture;

/**
 * Create gesture plugin for initialization
 * @param {Object} options
 * @returns {Function} Plugin function
 */
export function createGesturePlugin(options = {}) {
  return (primitive) => {
    // Auto-register if element is available
    if (primitive._element) {
      return registerGesture(primitive, primitive._element, options);
    }
    
    // Store config for later registration
    primitive._gestureOptions = options;
    return () => {};
  };
}