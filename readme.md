# Universal UI Protocol - 5 Headless Primitives

> Build once, use everywhere. 5 universal primitives that work with any framework.

Universal UI Protocol (UIP) is a collection of 5 headless UI primitives with a universal plugin system. Built on the principle of separation of concerns, UIP provides the interaction logic while you control the presentation layer.

**🎯 What makes it universal:**
- **5 Core Primitives**: Drawer, Modal, Tooltip, Popover, Menu - all working with the same API patterns
- **Universal Plugins**: Gesture, Position, and Snap plugins work with any primitive
- **Framework Agnostic**: Use with Vanilla JS, Svelte, React, or any framework
- **TypeScript First**: Full type safety with comprehensive definitions

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation  │    │   Presentation  │    │   Presentation  │
│     (React)     │    │    (Svelte)     │    │   (Vanilla)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    @uip/core - 5 Primitives                   │
│  Drawer │ Modal │ Tooltip │ Popover │ Menu                   │
└─────────┬───────────────────────────────────────────────┬─────┘
          │                                               │
          ▼                                               ▼
┌─────────────────────────┐                 ┌─────────────────────────┐
│   Universal Plugins     │                 │      Shared Utilities   │
│                         │                 │                         │
│ • Gesture (touch/drag)  │                 │ • Focus Management      │
│ • Position (auto-place) │                 │ • Scroll Lock          │
│ • Snap (dynamic sizing) │                 │ • Event System         │
└─────────────────────────┘                 └─────────────────────────┘
```

## 🧩 5 Universal Primitives

All primitives share the same consistent API pattern while being optimized for their specific use cases:

| Primitive | Description | Use Cases |
|-----------|-------------|-----------|
| **Drawer** | Sliding panels | Navigation, filters, settings |
| **Modal** | Overlay dialogs | Confirmations, forms, details |
| **Tooltip** | Contextual info | Help text, status indicators |
| **Popover** | Rich floating content | Dropdowns, pickers, menus |
| **Menu** | Context menus | Right-click, dropdown navigation |

### Consistent API Pattern

```javascript
// Same pattern for all primitives
const primitive = createDrawer() // or createModal, createTooltip, etc.

// State
primitive.isOpen        // boolean
primitive.getState()    // { isOpen, ...specific state }

// Actions  
primitive.open()        // Open primitive
primitive.close()       // Close primitive
primitive.toggle()      // Toggle state

// Events
primitive.onChange(fn)     // State changes
primitive.onOpenStart(fn)  // Before opening
primitive.onOpenEnd(fn)    // After opening
primitive.onCloseStart(fn) // Before closing  
primitive.onCloseEnd(fn)   // After closing

// Registration (accessibility & behavior)
primitive.registerTrigger(element, options)  // Button/trigger
primitive.registerContent(element, options)  // Content/panel
```

## 🔌 Universal Plugin System

Plugins automatically detect primitive types and apply appropriate behavior:

```javascript
// Universal gesture plugin - works with any primitive
registerGesture(drawer, element, { axis: 'x' })      // Horizontal swipe
registerGesture(modal, element, { axis: 'y' })       // Vertical pull-to-close
registerGesture(tooltip, element)                    // Auto-skipped (not supported)

// Universal positioning - smart placement for each type
registerPosition(drawer, element, { position: 'right' })     // Fixed positioning
registerPosition(tooltip, element, { position: 'auto' })     // Auto-placement
registerPosition(modal, element, { position: 'center' })     // Centered modal

// Universal sizing with snap points
registerSnap(drawer, element, { axis: 'x', points: ['25%', '50%', '100%'] })
registerSnap(modal, element, { axis: 'both', points: ['400px', '600px'] })
```

## 📦 Package Overview

| Package | Description | Size (gzipped) |
|---------|-------------|----------------|
| **`@uip/core`** | 5 primitives + shared utilities | ~4-5 KB |
| **`@uip/adapter-svelte`** | Svelte stores + actions | ~1 KB |
| **`@uip/adapter-vanilla`** | Plain DOM helpers | ~1 KB |
| **`@uip/plugin-gesture`** | Universal touch/mouse gestures | ~1.5 KB |
| **`@uip/plugin-position`** | Smart positioning system | ~1.5 KB |
| **`@uip/plugin-snap`** | Dynamic sizing with snap points | ~1 KB |

## 🚀 Installation

### Svelte (Full Featured)
```bash
npm i @uip/core @uip/adapter-svelte @uip/plugin-gesture @uip/plugin-position
```

### Vanilla JavaScript
```bash  
npm i @uip/core @uip/adapter-vanilla @uip/plugin-gesture
```

### Core Only (Framework Agnostic)
```bash
npm i @uip/core
```

## 🎯 Quick Start

### All Primitives - Core Usage

```javascript
import { 
  createDrawer, 
  createModal, 
  createTooltip, 
  createPopover, 
  createMenu 
} from '@uip/core';

// Create primitives
const drawer = createDrawer();
const modal = createModal({ closeOnBackdrop: true });
const tooltip = createTooltip({ delay: 200 });
const popover = createPopover();
const menu = createMenu();

// Universal API pattern
drawer.open();    // Opens drawer
modal.toggle();   // Toggles modal
tooltip.close();  // Closes tooltip

// Universal event handling
drawer.onChange(state => console.log('Drawer:', state));
modal.onChange(state => console.log('Modal:', state));
```

### Vanilla JavaScript with Plugins

```html
<button id="drawer-trigger">Open Drawer</button>
<div id="drawer" class="ui-drawer">
  <button id="modal-trigger">Open Modal</button>
  <p>Drawer content with nested modal!</p>
</div>

<div id="modal" class="ui-modal">
  <h2>Modal Content</h2>
  <button id="close-modal">Close</button>
</div>

<script type="module">
import { createDrawer, createModal } from '@uip/core';
import { registerGesture, registerPosition } from '@uip/plugins';

// Create primitives
const drawer = createDrawer();
const modal = createModal();

// Register elements
drawer.registerTrigger(document.getElementById('drawer-trigger'));
drawer.registerContent(document.getElementById('drawer'));

modal.registerTrigger(document.getElementById('modal-trigger'));
modal.registerContent(document.getElementById('modal'));
modal.registerBackdrop(document.getElementById('modal-backdrop'));

// Add universal plugins
registerGesture(drawer, document.getElementById('drawer'), { 
  axis: 'x', 
  threshold: 0.3 
});

registerPosition(drawer, document.getElementById('drawer'), { 
  position: 'right',
  size: '320px' 
});

registerPosition(modal, document.getElementById('modal'), { 
  position: 'center' 
});

// Reactive presentation
drawer.onChange(({ isOpen }) => {
  document.getElementById('drawer').classList.toggle('open', isOpen);
});

modal.onChange(({ isOpen }) => {
  document.getElementById('modal').classList.toggle('open', isOpen);
});
</script>
```

### Svelte with Full Universal System

```svelte
<script>
  import { 
    createDrawerStore, 
    createModalStore,
    createTooltipStore,
    drawerTrigger, 
    drawerContent,
    modalTrigger,
    modalContent,
    tooltipTrigger,
    tooltipContent
  } from '@uip/adapter-svelte';
  
  import { registerGesture, registerPosition } from '@uip/plugins';
  
  // Create stores for all primitives
  const drawer = createDrawerStore();
  const modal = createModalStore({ closeOnBackdrop: true });
  const tooltip = createTooltipStore({ delay: 200 });
  
  let drawerEl, modalEl;
  
  // Setup plugins after mount
  onMount(() => {
    registerGesture(drawer, drawerEl, { axis: 'x' });
    registerPosition(drawer, drawerEl, { position: 'right' });
    registerPosition(modal, modalEl, { position: 'center' });
  });
</script>

<!-- Drawer -->
<button use:drawerTrigger={drawer}>Open Drawer</button>
<div 
  bind:this={drawerEl}
  use:drawerContent={drawer} 
  class="drawer"
  class:open={$drawer.isOpen}
>
  <h2>Drawer Content</h2>
  
  <!-- Modal trigger inside drawer -->
  <button use:modalTrigger={modal}>Open Modal</button>
  
  <!-- Tooltip -->
  <span 
    use:tooltipTrigger={tooltip}
    use:tooltipContent={tooltip}
  >
    Hover for help
  </span>
</div>

<!-- Modal -->
<div 
  bind:this={modalEl}
  use:modalContent={modal}
  class="modal"
  class:open={$modal.isOpen}
>
  <h2>Modal Title</h2>
  <p>Modal content here</p>
  <button on:click={() => modal.close()}>Close</button>
</div>

<!-- Tooltip content -->
<div use:tooltipContent={tooltip} class="tooltip" class:show={$tooltip.isOpen}>
  This is helpful information!
</div>

<style>
  .drawer, .modal, .tooltip {
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateX(-100%);
  }
  
  .drawer.open, .modal.open, .tooltip.show {
    opacity: 1;
    transform: translateX(0);
  }
  
  .modal {
    transform: scale(0.9);
  }
  
  .modal.open {
    transform: scale(1);
  }
</style>
```

## 🔧 Universal Plugin API

### Gesture Plugin

```javascript
import { registerGesture } from '@uip/plugin-gesture';

// Drawer - horizontal swipe
registerGesture(drawer, element, {
  axis: 'x',                    // Horizontal
  threshold: 0.3,               // 30% to trigger
  onProgress: ({ progress }) => {
    element.style.opacity = 1 - progress;
  }
});

// Modal - vertical pull to dismiss  
registerGesture(modal, element, {
  axis: 'y',                    // Vertical
  pullToClose: true,            // Enable pull-to-close
  threshold: 0.2                // 20% to trigger
});
```

### Position Plugin

```javascript
import { registerPosition } from '@uip/plugin-position';

// Drawer positioning
registerPosition(drawer, element, {
  position: 'right',            // left, right, top, bottom
  size: '320px',                // Fixed size
  autoClose: true               // Click outside to close
});

// Tooltip auto-positioning
registerPosition(tooltip, element, {
  position: 'auto',             // Auto-detect best placement
  offset: 8,                    // Distance from trigger
});

// Modal centering
registerPosition(modal, element, {
  position: 'center',           // Centered in viewport
  // size: 'auto'               // Auto-size based on content
});
```

### Snap Plugin

```javascript
import { registerSnap, getSnapAPI } from '@uip/plugin-snap';

// Drawer with width snap points
registerSnap(drawer, element, {
  axis: 'x',
  points: ['25%', '50%', '75%', '100%'],
  initialPoint: '50%',
  onSnapChange: ({ point }) => {
    console.log('Snapped to:', point);
  }
});

// Modal with size presets
registerSnap(modal, element, {
  axis: 'both',
  points: ['400px', '600px', '800px', '90vw'],
  initialPoint: '600px'
});

// Use snap API
const snapAPI = getSnapAPI(drawer);
snapAPI.snapToNext();           // Go to next snap point
snapAPI.snapToPrevious();       // Go to previous snap point
snapAPI.setSnapPoint('75%');    // Set specific point
console.log(snapAPI.getSnapPoints()); // Get all available points
```

## 🎨 TypeScript Support

Full TypeScript definitions included for all primitives and plugins:

```typescript
import type { 
  DrawerInstance, 
  ModalInstance,
  TooltipInstance,
  PopoverInstance,
  MenuInstance 
} from '@uip/core';

import type { 
  GestureOptions,
  PositionOptions, 
  SnapOptions 
} from '@uip/plugins';

// Type-safe primitive creation
const drawer: DrawerInstance = createDrawer({
  initialOpen: false,
  onStateChange: (state) => console.log(state) // state is typed
});

// Type-safe plugin usage
registerGesture(drawer, element, {
  axis: 'x',                    // Type: 'x' | 'y'
  threshold: 0.3,               // Type: number
  onProgress: (data) => {       // data is typed as GestureProgressData
    console.log(data.progress);
  }
} satisfies GestureOptions);
```

## ♿ Accessibility Features

All primitives include comprehensive accessibility support:

- **Focus Management**: Automatic focus trapping and restoration
- **Keyboard Navigation**: Enter/Space on triggers, Escape to close, Arrow keys in menus
- **ARIA Support**: Automatic `aria-expanded`, `aria-hidden`, `role` attributes
- **Scroll Management**: Body scroll lock without layout shift (with scrollbar compensation)
- **Motion Preferences**: Respects `prefers-reduced-motion`
- **Screen Readers**: Proper announcements and semantic markup

## ⚡ Performance

- **Zero Runtime Dependencies**: Core is pure JavaScript
- **Tree-Shakeable**: Import only what you use
- **Optimized Events**: Passive touch listeners, RAF for animations
- **Memory Safe**: WeakMap prevents memory leaks with multiple instances
- **Bundle Size**: Complete setup typically 6-8 KB gzipped

## 🛡️ Production Ready

### Edge Cases Handled
- **Nested Primitives**: Multiple drawers, modals inside drawers
- **Mobile Support**: Orientation change, iOS safe areas, touch handling
- **Focus Management**: Complex focus stacks, keyboard-only navigation
- **SSR Compatible**: Guards for window/document access
- **Cross-Platform**: Scrollbar compensation, browser differences

### Browser Support
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (last 2 versions)
- **Mobile**: iOS Safari 14+, Chrome Mobile
- **ES Features**: ES2018+ (optional chaining, nullish coalescing)

## 🗺️ Roadmap

### Framework Adapters
- [ ] React adapter (`@uip/adapter-react`)
- [ ] Qwik adapter (`@uip/adapter-qwik`)
- [ ] Solid adapter (`@uip/adapter-solid`)
- [ ] Web Components adapter

### Advanced Primitives  
- [ ] Command Palette
- [ ] Date Range Picker
- [ ] Virtualized List
- [ ] Combobox/Select

### Developer Experience
- [ ] Live playground (switch frameworks with same core)
- [ ] Storybook integration
- [ ] Design system templates
- [ ] Migration guides from other UI libraries

### Documentation
- [ ] Interactive tutorials
- [ ] Video guides
- [ ] Component composition patterns
- [ ] Performance optimization guide

## 📝 Philosophy

**Problem**: UI libraries lock you into specific frameworks, bundle sizes, and design decisions.

**Solution**: Separate concerns through layered architecture:

| Layer | Responsibility | You Control |
|-------|----------------|-------------|
| **Logic** | State, events, accessibility | ❌ (UIP handles this) |
| **Presentation** | Styling, animation, layout | ✅ (Your CSS/framework) |
| **Integration** | Framework reactivity | ✅ (Choose your adapter) |

**Result**: Maximum flexibility, minimum lock-in, optimal bundle size.

## 🔍 Examples in the Wild

```javascript
// Netflix-style drawer
const drawer = createDrawer();
registerPosition(drawer, element, { position: 'left', size: '280px' });
registerGesture(drawer, element, { axis: 'x', threshold: 0.2 });

// Discord-style modal
const modal = createModal({ closeOnBackdrop: true });
registerPosition(modal, element, { position: 'center' });
registerSnap(modal, element, { axis: 'both', points: ['400px', '600px'] });

// GitHub-style tooltip
const tooltip = createTooltip({ delay: 100 });
registerPosition(tooltip, element, { position: 'auto', offset: 8 });

// Figma-style context menu
const menu = createMenu({ closeOnSelect: true });
registerPosition(menu, element, { position: 'contextual' });
```

## ❓ FAQ

### Q: How is this different from Headless UI or Radix?

**A**: Those are component libraries. UIP is a protocol - it provides the interaction logic only. You get maximum flexibility to build your own components with any styling approach.

### Q: Can I use this with existing UI libraries?

**A**: Yes! UIP primitives work alongside shadcn/ui, Chakra, or any component library. Use UIP for the parts you want full control over.

### Q: Do I need to use all 5 primitives?

**A**: No. Import only what you need. Each primitive is independent and tree-shakeable.

### Q: Can I extend primitives with custom behavior?

**A**: Yes. The plugin system lets you add any custom behavior. You can also compose primitives together.

### Q: Is this production ready?

**A**: Yes. The architecture handles complex edge cases, includes comprehensive a11y support, and has been tested across browsers and devices.

---

## 📄 License

MIT - Build amazing UIs without constraints. 🚀

**Universal UI Protocol**: One core, infinite possibilities.