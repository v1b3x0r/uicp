/**
 * @nature-labs/uicp-adapter-vanilla — headless drawer adapter for vanilla JS
 *
 * Modal, popover, tooltip, and menu primitives exist in @nature-labs/uicp-core but are
 * not yet wrapped here. Use the core primitives directly until real adapter
 * wrappers ship (planned for v0.4.x).
 */

export {
  drawer,
  drawerWithGestures,
  drawerWithPlugins
} from './hybrid.js';
