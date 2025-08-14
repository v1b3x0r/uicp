import { createDrawer, registerDrawerDrag } from '@uikit/core';

/**
 * Lean drawer setup helper with modern DOM APIs
 */
export const setupDrawer = ({ trigger, content, drawerOptions = {}, dragOptions = {} } = {}) => {
  const drawer = createDrawer(drawerOptions);
  const cleanups = [
    trigger && drawer.registerTrigger(trigger),
    content && drawer.registerContent(content),
    content && dragOptions.enabled !== false && registerDrawerDrag(drawer, content, dragOptions)
  ].filter(Boolean);
  
  drawer.cleanup = () => cleanups.forEach(fn => fn());
  return drawer;
};

/**
 * Auto-setup with modern query selectors - lean version
 */
export const autoSetup = () => {
  if (typeof document === 'undefined') return [];
  
  return [...document.querySelectorAll('[data-drawer-trigger]')].map(trigger => {
    const content = document.getElementById(trigger.dataset.drawerTrigger);
    return content && setupDrawer({
      trigger,
      content,
      dragOptions: {
        enabled: content.hasAttribute('data-drawer-drag'),
        axis: content.dataset.drawerAxis ?? 'x',
        threshold: parseFloat(content.dataset.drawerThreshold) ?? 0.3
      }
    });
  }).filter(Boolean);
};

export { createDrawer, registerDrawerDrag } from '@uikit/core';