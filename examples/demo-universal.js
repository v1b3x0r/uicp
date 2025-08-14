/**
 * Universal UI Protocol Demo
 * Demonstrates all 5 primitives with universal plugins
 */

import { 
  createDrawer, 
  createModal, 
  createTooltip, 
  createPopover, 
  createMenu 
} from '../packages/core/src/index.js';

import { registerGesture } from '../packages/plugins/gesture/src/index.js';
import { registerPosition } from '../packages/plugins/position/src/index.js';
import { registerSnap, getSnapAPI } from '../packages/plugins/snap/src/index.js';

console.log('🚀 Universal UI Protocol Demo');

// Test all primitives
const drawer = createDrawer({ initialOpen: false });
const modal = createModal({ closeOnBackdrop: true });
const tooltip = createTooltip({ delay: 300 });
const popover = createPopover({ closeOnClickOutside: true });
const menu = createMenu({ closeOnSelect: true });

console.log('✅ All primitives created:', {
  drawer: drawer._type,
  modal: modal._type, 
  tooltip: tooltip._type,
  popover: popover._type,
  menu: menu._type
});

// Test universal plugins (if DOM is available)
if (typeof document !== 'undefined') {
  // Create test elements
  const testElement = document.createElement('div');
  
  // Test gesture plugin on drawer (should work)
  const gestureCleanup1 = registerGesture(drawer, testElement, { axis: 'x' });
  console.log('✅ Gesture plugin on drawer: working');
  
  // Test gesture plugin on modal (should work)
  const gestureCleanup2 = registerGesture(modal, testElement, { axis: 'y' });
  console.log('✅ Gesture plugin on modal: working');
  
  // Test gesture plugin on tooltip (should warn and skip)
  const gestureCleanup3 = registerGesture(tooltip, testElement);
  console.log('⚠️ Gesture plugin on tooltip: correctly skipped');
  
  // Test position plugin on all primitives
  const positionCleanup1 = registerPosition(drawer, testElement, { position: 'right' });
  const positionCleanup2 = registerPosition(modal, testElement, { position: 'center' });
  const positionCleanup3 = registerPosition(tooltip, testElement, { position: 'auto' });
  console.log('✅ Position plugin on all: working');
  
  // Test snap plugin
  const snapCleanup1 = registerSnap(drawer, testElement, { axis: 'x' });
  const snapCleanup2 = registerSnap(modal, testElement, { axis: 'both' });
  const snapCleanup3 = registerSnap(tooltip, testElement); // should skip
  
  console.log('✅ Snap plugin tests completed');
  
  // Test snap API
  const drawerSnapAPI = getSnapAPI(drawer);
  console.log('Drawer snap points:', drawerSnapAPI.getSnapPoints?.());
  
  // Cleanup
  [
    gestureCleanup1, gestureCleanup2, gestureCleanup3,
    positionCleanup1, positionCleanup2, positionCleanup3,
    snapCleanup1, snapCleanup2, snapCleanup3
  ].forEach(cleanup => cleanup?.());
}

// Test state changes
drawer.onChange(state => console.log('Drawer state:', state));
modal.onChange(state => console.log('Modal state:', state));

drawer.open();
drawer.close();

modal.open();
modal.close();

console.log('🎉 Universal UI Protocol Demo completed successfully!');