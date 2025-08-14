/**
 * @typedef {Object} DragOptions
 * @property {'x'|'y'} [axis='x'] - Drag axis
 * @property {number} [threshold=0.3] - Threshold to trigger open/close (0-1)
 * @property {number} [velocityThreshold=0.5] - Velocity threshold for quick swipes
 * @property {Function} [onProgress] - Progress callback
 */

/**
 * Register drag gesture for drawer
 * @param {import('./drawer').DrawerInstance} drawer
 * @param {HTMLElement} element
 * @param {DragOptions} options
 * @returns {Function} Cleanup function
 */
export function registerDrawerDrag(drawer, element, options = {}) {
  if (!element || typeof element.addEventListener !== 'function') {
    console.warn('registerDrawerDrag: Invalid element provided');
    return () => {};
  }
  
  const {
    axis = 'x',
    threshold = 0.3,
    velocityThreshold = 0.5,
    onProgress
  } = options;
  
  let startPos = 0;
  let currentPos = 0;
  let startTime = 0;
  let isDragging = false;
  let dragDistance = 0;
  let containerSize = 0;
  
  const isHorizontal = axis === 'x';
  
  function getPosition(event) {
    if (event.touches && event.touches.length > 0) {
      return isHorizontal ? event.touches[0].clientX : event.touches[0].clientY;
    }
    return isHorizontal ? event.clientX : event.clientY;
  }
  
  function getContainerSize() {
    return isHorizontal ? element.offsetWidth : element.offsetHeight;
  }
  
  function handleStart(event) {
    if (isDragging) return;
    
    startPos = getPosition(event);
    currentPos = startPos;
    startTime = Date.now();
    isDragging = true;
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
    
    const progress = Math.abs(dragDistance) / containerSize;
    const clampedProgress = Math.min(1, Math.max(0, progress));
    
    element.setAttribute('data-drag-progress', String(clampedProgress));
    
    if (onProgress) {
      onProgress({
        progress: clampedProgress,
        distance: dragDistance,
        axis
      });
    }
    
    const transform = isHorizontal 
      ? `translateX(${dragDistance}px)`
      : `translateY(${dragDistance}px)`;
    
    element.style.transform = transform;
  }
  
  function handleEnd() {
    if (!isDragging) return;
    
    isDragging = false;
    const endTime = Date.now();
    const duration = endTime - startTime;
    const velocity = Math.abs(dragDistance) / duration;
    
    const progress = Math.abs(dragDistance) / containerSize;
    const shouldToggle = progress > threshold || velocity > velocityThreshold;
    
    element.style.transition = '';
    element.style.transform = '';
    element.removeAttribute('data-dragging');
    element.removeAttribute('data-drag-progress');
    
    if (shouldToggle) {
      const isOpening = drawer.isOpen 
        ? (isHorizontal ? dragDistance > 0 : dragDistance > 0)
        : (isHorizontal ? dragDistance < 0 : dragDistance < 0);
      
      if (drawer.isOpen && !isOpening) {
        drawer.close();
      } else if (!drawer.isOpen && isOpening) {
        drawer.open();
      }
    }
    
    dragDistance = 0;
  }
  
  function handleCancel() {
    if (!isDragging) return;
    
    isDragging = false;
    element.style.transition = '';
    element.style.transform = '';
    element.removeAttribute('data-dragging');
    element.removeAttribute('data-drag-progress');
    dragDistance = 0;
  }
  
  element.addEventListener('touchstart', handleStart, { passive: true });
  element.addEventListener('touchmove', handleMove, { passive: true });
  element.addEventListener('touchend', handleEnd);
  element.addEventListener('touchcancel', handleCancel);
  
  element.addEventListener('mousedown', handleStart);
  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', handleEnd);
  
  return () => {
    element.removeEventListener('touchstart', handleStart);
    element.removeEventListener('touchmove', handleMove);
    element.removeEventListener('touchend', handleEnd);
    element.removeEventListener('touchcancel', handleCancel);
    
    element.removeEventListener('mousedown', handleStart);
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
  };
}