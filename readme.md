# UIKit - Cross-Framework UI Interaction Protocol

> Headless UI components that work everywhere. Build once, use with any framework.

UIKit เป็นชุดเครื่องมือสำหรับสร้าง UI components แบบ headless ที่ไม่ผูกติดกับเฟรมเวิร์คใดเฟรมเวิร์คหนึ่ง ด้วยการแยก core logic ออกจาก presentation layer ทำให้สามารถใช้ logic เดียวกันได้กับหลายเฟรมเวิร์ค

## 🎯 หลักการ

- **Headless**: แยก logic และ presentation ออกจากกัน
- **Framework Agnostic**: ทำงานได้กับ Vanilla JS, React, Svelte และอื่นๆ
- **Lightweight**: Core เพียง ~3-4KB gzipped
- **Accessible**: รองรับ WCAG และ screen readers
- **Modern**: ES2018+, Tree-shakeable, Zero runtime dependencies

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Presentation  │    │   Presentation  │    │   Presentation  │
│     (React)     │    │    (Svelte)     │    │   (Vanilla)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          ▼                      ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      @uikit/core                               │
│                   (Headless Logic)                             │
│                                                                │
│  • State Management    • Focus Trap     • Gesture Support     │
│  • Event Handling      • Scroll Lock    • Lifecycle Events    │
│  • Accessibility       • DOM Utilities  • TypeScript Types    │
└─────────────────────────────────────────────────────────────────┘
```

## Philosophy

**Problem**: Traditional UI libraries entangle DOM structure, styling, and interaction logic, making reuse difficult and customization painful.

**Solution**: Separation of concerns through layered architecture:

| Layer            | Responsibility                       | Package                                           |
| ---------------- | ------------------------------------ | ------------------------------------------------- |
| **Core**         | State machine, events, accessibility | `@uikit/core`                                     |
| **Adapter**      | Framework reactivity integration     | `@uikit/react`, `@uikit/svelte`, `@uikit/vanilla` |
| **Presentation** | Styling, animation, gestures         | `skins/plugins` or your custom code               |

**Result**: Lighter bundles, easier testing, zero vendor lock-in.

## 📦 Packages

| Package                | Description                    | Size (min+gzip) |
| ---------------------- | ------------------------------ | --------------- |
| `@uip/core`            | Headless Drawer core (pure JS) | ~3-4 KB         |
| `@uip/adapter-vanilla` | Plain DOM usage helpers        | ~1 KB           |
| `@uip/adapter-react`   | `useDrawer` hook               | ~1 KB           |
| `@uip/adapter-svelte`  | `drawerStore` store + actions  | ~1 KB           |
| `@uip/plugin-gesture`  | Touch/mouse drag support       | ~1 KB           |
| `@uikit/cli`           | Project scaffolder             | -               |

## 🚀 Installation

Choose the packages you need:

Note: Package scope is `@uip/*` for core/adapters/plugins. CLI remains `@uikit/cli`.

### React

```bash
npm i @uip/core @uip/adapter-react @uip/plugin-gesture
```

### Svelte

```bash
npm i @uip/core @uip/adapter-svelte @uip/plugin-gesture
```

### Vanilla JavaScript

```bash
npm i @uip/core @uip/adapter-vanilla @uip/plugin-gesture
```

## 🎯 Quick Start

### Vanilla JavaScript

```html
<!-- Optional skin (coming soon) -->
<!-- <link rel="stylesheet" href="/node_modules/@uip/skin-vanilla/dist/drawer.css" /> -->
<button id="toggle">Toggle Drawer</button>
<div id="drawer" class="ui-drawer">Hello from Drawer!</div>

<script type="module">
  import { createDrawer } from "@uip/core";
  import { registerDrawerDrag } from "@uip/plugin-gesture"; // optional

  const drawer = createDrawer();
  const root = document.getElementById("drawer");

  // Basic toggle functionality
  document.getElementById("toggle").addEventListener("click", drawer.toggle);

  // Accessibility + focus management + body scroll lock
  const disposeContent = drawer.registerContent(root);

  // Optional mobile/desktop drag support
  registerDrawerDrag(drawer, root, { axis: "x", threshold: 0.3 });

  // Reactive presentation updates
  drawer.onChange(({ isOpen }) => {
    root.classList.toggle("ui-open", isOpen);
  });
</script>
```

### React

```jsx
// Optional skin (coming soon)
// import '@uip/skin-vanilla/dist/drawer.css'
import { createDrawer } from "@uip/core";
import { useDrawerRefs } from "@uip/adapter-react";
import { useEffect, useRef } from "react";
import { createGesturePlugin } from "@uip/plugin-gesture";

const plugin = createGesturePlugin({ axis: "x", threshold: 0.3 });

export default function DrawerDemo() {
  const { triggerRef, contentRef, ...d } = useDrawerRefs({}, [plugin]);

  return (
    <>
      <button ref={triggerRef} onClick={d.toggle}>
        Toggle Drawer
      </button>
      <div
        ref={contentRef}
        className={`ui-drawer ${d.isOpen ? "ui-open" : ""}`}
      >
        Hello from React Drawer!
      </div>
    </>
  );
}
```

### Svelte

```svelte
<script>
  // Optional skin (coming soon)
  // import '@uip/skin-vanilla/dist/drawer.css'
  import { createDrawer } from '@uip/core'
  import { drawerStore, drawerContent, drawerTrigger, drawerDrag } from '@uip/adapter-svelte'
  import { onMount } from 'svelte'
  import { createGesturePlugin } from '@uip/plugin-gesture'

  const drawer = createDrawer()
  const d = drawerStore(drawer)
  let el
  const plugin = createGesturePlugin({ axis: 'x' })

  onMount(() => {
    // A11y handled by action below; no manual wiring needed here
  })
</script>

<button use:drawerTrigger={drawer} on:click={() => d.toggle()}>Toggle Drawer</button>

<div bind:this={el} use:drawerContent={{ drawer }} use:drawerDrag={{ drawer, plugin }} class:ui-open={$d.isOpen} class="ui-drawer">
  Hello from Svelte Drawer!
</div>
```

## 🔌 Core API Reference

### Basic Usage

```javascript
const drawer = createDrawer(options?)

// State
drawer.isOpen // boolean
drawer.getState() // { isOpen }

// Actions
drawer.open()
drawer.close()
drawer.toggle()

// Reactivity
drawer.onChange(fn) // subscribe to state changes; returns unsubscribe function
```

### Accessibility Helpers (Optional)

```javascript
// Trigger element (button)
drawer.registerTrigger(element); // adds aria-expanded + space/enter handlers

// Content element (drawer)
drawer.registerContent(element, { trap: true }); // focus trap, esc handler, body scroll lock
```

### Lifecycle Hooks (Optional)

```javascript
drawer.onOpenStart(fn);
drawer.onOpenEnd(fn);
drawer.onCloseStart(fn);
drawer.onCloseEnd(fn);
```

> Note: Core doesn’t enforce DOM structure or styling. Bring your own markup and CSS.

## 🛠️ CLI Scaffolding

Generate ready-to-use components in your project:

```bash
# React
npx uikit add drawer --framework react --skin vanilla

# Svelte
npx uikit add drawer --framework svelte --skin vanilla

# Vanilla JavaScript
npx uikit add drawer --framework vanilla --skin vanilla
```

### What it does:

- ✅ Installs required packages
- ✅ Generates a minimal, working demo component
- ✅ Idempotent (won't overwrite without `--force` flag)

## ♿ Accessibility Features

- **Focus Management**: Focus trap inside content; focus restored on close
- **Keyboard Navigation**: Escape to close; Enter/Space on trigger
- **ARIA Support**: Automatic `aria-expanded` updates
- **Scroll Management**: Body scroll lock without layout shift
- **Motion Preferences**: Respects `prefers-reduced-motion`
- **Flexible DOM**: Works with portals/shadow DOM; no enforced hierarchy

## ⚡ Performance

- **Zero Dependencies**: No framework in core, zero runtime dependencies
- **Optimized DOM**: Minimal DOM reads/writes
- **Efficient Events**: Optional drag plugin uses passive listeners with proper cleanup
- **Bundle Size**: React + core + skin typically ~7-8 KB gzipped

## 🛡️ Edge Cases Handled

- **Complex Scenarios**: Nested drawers and focus stacks
- **Mobile Support**: Orientation change during drag
- **Cross-Platform**: Scrollbar compensation and iOS safe areas
- **Accessibility**: Keyboard-only navigation flows
- **SSR Ready**: Guards for window/document access

## 🎨 What You Bring

- **Styling**: Your preferred approach (Tailwind, CSS vars, styled-components, etc.)
- **Animations**: Your animation stack (Framer Motion, Motion One, CSS transitions)
- **Structure**: Your app's markup and layout patterns

## 🗺️ Roadmap

### Core Primitives

- Modal, Context Menu, Tooltip, Focus Trap (standalone)

### Developer Experience

- Live playground: switch React/Svelte/Vanilla with one core
- One-click export (zip for chosen framework/skin)

### Advanced Components

- Command Palette, Date Range Picker, Virtualized List

### Framework Support

- Additional adapters: Solid, Qwik, Web Components

### Documentation

- RFC document for the interaction protocol

## 📝 License

MIT - Intended for broad reuse and embedding.

## ❓ FAQ

### Q: Does this replace UI libraries like shadcn?

**A**: Different layer. This is the interaction core you can skin or wrap with any design system.

### Q: Do I have to use the provided skin/drag plugin?

**A**: No. They're completely optional. Bring your own styles and animations.

### Q: Can I render content in a portal?

**A**: Yes. The core makes no assumptions about DOM hierarchy.

### Q: Is TypeScript required?

**A**: No. The core is JavaScript with JSDoc. TypeScript is available in framework adapters.

---

**That's it.** One core, many frontends. Use, fork, or embed. 🚀
