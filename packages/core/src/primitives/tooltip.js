/**
 * @uip/core - Tooltip Primitive
 * Contextual information on hover/focus
 */

import { createEventSystem } from '../utils/events.js';

/**
 * Create tooltip instance
 * @param {Object} options - Tooltip options
 * @param {Array} plugins - Optional plugins
 * @returns {Object} Tooltip API
 */
export function createTooltip(options = {}, plugins = []) {
  const { 
    initialOpen = false,
    onStateChange,
    delay = 200,
    hideDelay = 0
  } = options;
  
  let isOpen = initialOpen;
  let showTimeout = null;
  let hideTimeout = null;
  const events = createEventSystem();
  
  // Add initial change listener
  if (onStateChange) {
    events.onChange(onStateChange);
  }
  
  const tooltip = {
    // Type identification for plugins
    _type: 'tooltip',
    _instanceId: Math.random().toString(36).substring(2, 9),
    
    get isOpen() {
      return isOpen;
    },
    
    getState() {
      return { isOpen };
    },
    
    open() {
      if (isOpen) return;
      
      // Clear any pending hide
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      
      isOpen = true;
      events.emit('openStart', tooltip.getState());
      events.emit('change', tooltip.getState());
      events.emitAsync('openEnd', tooltip.getState());
    },
    
    close() {
      if (!isOpen) return;
      
      // Clear any pending show
      if (showTimeout) {
        clearTimeout(showTimeout);
        showTimeout = null;
      }
      
      isOpen = false;
      events.emit('closeStart', tooltip.getState());
      events.emit('change', tooltip.getState());
      events.emitAsync('closeEnd', tooltip.getState());
    },
    
    toggle() {
      isOpen ? tooltip.close() : tooltip.open();
    },
    
    // Event subscriptions
    onChange: events.onChange,
    onOpenStart: events.onOpenStart,
    onOpenEnd: events.onOpenEnd,
    onCloseStart: events.onCloseStart,
    onCloseEnd: events.onCloseEnd,
    
    /**
     * Register trigger element
     * @param {HTMLElement} element
     * @param {Object} options
     * @returns {Function} Cleanup
     */
    registerTrigger(element, options = {}) {
      if (!element?.addEventListener) {
        console.warn('Invalid trigger element');
        return () => {};
      }
      
      const {
        showOnHover = true,
        showOnFocus = true,
        interactive = false
      } = options;
      
      const showTooltip = () => {
        if (showTimeout) clearTimeout(showTimeout);
        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = null;
        
        if (delay > 0) {
          showTimeout = setTimeout(() => {
            tooltip.open();
            showTimeout = null;
          }, delay);
        } else {
          tooltip.open();
        }
      };
      
      const hideTooltip = () => {
        if (showTimeout) clearTimeout(showTimeout);
        showTimeout = null;
        
        if (hideDelay > 0) {
          hideTimeout = setTimeout(() => {
            tooltip.close();
            hideTimeout = null;
          }, hideDelay);
        } else {
          tooltip.close();
        }
      };
      
      const handleMouseEnter = showOnHover ? showTooltip : null;
      const handleMouseLeave = showOnHover ? hideTooltip : null;
      const handleFocus = showOnFocus ? showTooltip : null;
      const handleBlur = showOnFocus ? hideTooltip : null;
      
      if (handleMouseEnter) {
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
      }
      
      if (handleFocus) {
        element.addEventListener('focus', handleFocus);
        element.addEventListener('blur', handleBlur);
      }
      
      element.setAttribute('aria-describedby', `tooltip-${tooltip._instanceId}`);
      
      return () => {
        if (showTimeout) clearTimeout(showTimeout);
        if (hideTimeout) clearTimeout(hideTimeout);
        
        if (handleMouseEnter) {
          element.removeEventListener('mouseenter', handleMouseEnter);
          element.removeEventListener('mouseleave', handleMouseLeave);
        }
        
        if (handleFocus) {
          element.removeEventListener('focus', handleFocus);
          element.removeEventListener('blur', handleBlur);
        }
        
        element.removeAttribute('aria-describedby');
      };
    },
    
    /**
     * Register content element
     * @param {HTMLElement} element
     * @param {Object} options
     * @returns {Function} Cleanup
     */
    registerContent(element, options = {}) {
      if (!element) {
        console.warn('Invalid content element');
        return () => {};
      }
      
      const {
        interactive = false,
        position = 'top'
      } = options;
      
      // Set tooltip ID for aria-describedby
      element.id = `tooltip-${tooltip._instanceId}`;
      element.setAttribute('role', 'tooltip');
      element.setAttribute('aria-hidden', String(!isOpen));
      
      // Handle interactive tooltips
      let mouseInContent = false;
      
      const handleContentMouseEnter = () => {
        if (interactive) {
          mouseInContent = true;
          if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
          }
        }
      };
      
      const handleContentMouseLeave = () => {
        if (interactive) {
          mouseInContent = false;
          if (hideDelay > 0) {
            hideTimeout = setTimeout(() => {
              tooltip.close();
              hideTimeout = null;
            }, hideDelay);
          } else {
            tooltip.close();
          }
        }
      };
      
      if (interactive) {
        element.addEventListener('mouseenter', handleContentMouseEnter);
        element.addEventListener('mouseleave', handleContentMouseLeave);
      }
      
      const updateVisibility = ({ isOpen }) => {
        element.setAttribute('aria-hidden', String(!isOpen));
        element.style.display = isOpen ? '' : 'none';
      };
      
      // Initial state
      updateVisibility(tooltip.getState());
      
      const unsubscribe = tooltip.onChange(updateVisibility);
      
      return () => {
        if (interactive) {
          element.removeEventListener('mouseenter', handleContentMouseEnter);
          element.removeEventListener('mouseleave', handleContentMouseLeave);
        }
        unsubscribe();
      };
    }
  };
  
  // Apply plugins
  plugins.forEach(plugin => {
    if (typeof plugin === 'function') {
      plugin(tooltip);
    }
  });
  
  return tooltip;
}