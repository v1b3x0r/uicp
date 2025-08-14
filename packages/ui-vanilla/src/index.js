import { createDrawer, registerDrawerDrag } from '@uikit/core';

/**
 * Helper to setup drawer with DOM elements
 * @param {Object} options
 * @param {HTMLElement} [options.trigger] - Trigger element
 * @param {HTMLElement} [options.content] - Content element
 * @param {Object} [options.drawerOptions] - Options for createDrawer
 * @param {Object} [options.dragOptions] - Options for drag gesture
 * @returns {import('@uikit/core').DrawerInstance}
 */
export function setupDrawer(options = {}) {
  const {
    trigger,
    content,
    drawerOptions = {},
    dragOptions = {}
  } = options;
  
  const drawer = createDrawer(drawerOptions);
  const cleanups = [];
  
  if (trigger) {
    cleanups.push(drawer.registerTrigger(trigger));
  }
  
  if (content) {
    cleanups.push(drawer.registerContent(content));
    
    if (dragOptions.enabled !== false) {
      cleanups.push(registerDrawerDrag(drawer, content, dragOptions));
    }
  }
  
  drawer.cleanup = () => {
    cleanups.forEach(fn => fn());
  };
  
  return drawer;
}

/**
 * Auto-setup drawers from data attributes
 */
export function autoSetup() {
  if (typeof document === 'undefined') return;
  
  const drawers = [];
  
  document.querySelectorAll('[data-drawer-trigger]').forEach(trigger => {
    const targetId = trigger.getAttribute('data-drawer-trigger');
    const content = document.getElementById(targetId);
    
    if (content) {
      const drawer = setupDrawer({
        trigger,
        content,
        dragOptions: {
          enabled: content.hasAttribute('data-drawer-drag'),
          axis: content.getAttribute('data-drawer-axis') || 'x',
          threshold: parseFloat(content.getAttribute('data-drawer-threshold')) || 0.3
        }
      });
      
      drawers.push(drawer);
    }
  });
  
  return drawers;
}

export { createDrawer, registerDrawerDrag } from '@uikit/core';