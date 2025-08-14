# UIKit — Framework-Agnostic UI Primitives

> Tiny, framework-agnostic UX primitives you can drop into any frontend.

This repository demonstrates the UIKit philosophy with a production-grade **Drawer** component:

## Architecture

### 🔧 **Core**
Pure JavaScript logic (state, events, a11y). No framework, no styling dependencies.

### 🌉 **Adapters** 
Thin bridges connecting core state to framework reactivity systems.

### 🎨 **Presentation**
Optional styling, animations, and gestures — fully customizable.

### ⚡ **CLI**
Scaffold working examples in your app within seconds.

## Philosophy

**Problem**: Traditional UI libraries entangle DOM structure, styling, and interaction logic, making reuse difficult and customization painful.

**Solution**: Separation of concerns through layered architecture:

| Layer | Responsibility | Package |
|-------|---------------|---------|
| **Core** | State machine, events, accessibility | `@uikit/core` |
| **Adapter** | Framework reactivity integration | `@uikit/react`, `@uikit/svelte`, `@uikit/vanilla` |
| **Presentation** | Styling, animation, gestures | `skins/plugins` or your custom code |

**Result**: Lighter bundles, easier testing, zero vendor lock-in.

## 📦 Packages

| Package | Description | Size (min+gzip) |
|---------|-------------|-----------------|
| `@uikit/core` | Headless Drawer core (pure JS) | ~3-4 KB |
| `@uikit/vanilla` | Plain DOM usage helpers | ~1 KB |
| `@uikit/react` | `useDrawer(core)` hook | ~1 KB |
| `@uikit/svelte` | `drawerStore(core)` store | ~1 KB |
| `@uikit/skin-vanilla` | Minimal CSS variables skin (optional) | ~1-2 KB |
| `@uikit/cli` | Project scaffolder | - |

## 🚀 Installation

Choose the packages you need:

### React
```bash
npm i @uikit/core @uikit/react @uikit/skin-vanilla
```

### Svelte
```bash
npm i @uikit/core @uikit/svelte @uikit/skin-vanilla
```

### Vanilla JavaScript
```bash
npm i @uikit/core @uikit/vanilla @uikit/skin-vanilla
```

## 🎯 Quick Start

### Vanilla JavaScript

```html
<link rel="stylesheet" href="/node_modules/@uikit/skin-vanilla/dist/drawer.css" />
<button id="toggle">Toggle Drawer</button>
<div id="drawer" class="ui-drawer">Hello from Drawer!</div>

<script type="module">
  import { createDrawer } from '@uikit/core'
  import { registerDrawerDrag } from '@uikit/vanilla' // optional

  const drawer = createDrawer()
  const root = document.getElementById('drawer')

  // Basic toggle functionality
  document.getElementById('toggle').addEventListener('click', drawer.toggle)

  // Accessibility + focus management + body scroll lock
  const disposeContent = drawer.registerContent(root)

  // Optional mobile drag support
  registerDrawerDrag(drawer, root, { axis: 'x', threshold: 0.3 })

  // Reactive presentation updates
  drawer.onChange(({ isOpen }) => {
    root.classList.toggle('ui-open', isOpen)
  })
</script>
```

### React

```jsx
import '@uikit/skin-vanilla/dist/drawer.css'
import { createDrawer } from '@uikit/core'
import { useDrawer } from '@uikit/react'
import { useEffect, useRef } from 'react'
import { registerDrawerDrag } from '@uikit/vanilla'

const drawer = createDrawer()

export default function DrawerDemo() {
  const d = useDrawer(drawer)
  const ref = useRef(null)

  useEffect(() => {
    const disposeA11y = d.registerContent(ref.current)
    const disposeDrag = registerDrawerDrag(drawer, ref.current)
    return () => { 
      disposeA11y()
      disposeDrag && disposeDrag() 
    }
  }, [])

  return (
    <>
      <button onClick={d.toggle}>Toggle Drawer</button>
      <div 
        ref={ref} 
        className={`ui-drawer ${d.isOpen ? 'ui-open' : ''}`}
      >
        Hello from React Drawer!
      </div>
    </>
  )
}
```

### Svelte

```svelte
<script>
  import '@uikit/skin-vanilla/dist/drawer.css'
  import { createDrawer } from '@uikit/core'
  import { drawerStore } from '@uikit/svelte'
  import { onMount } from 'svelte'
  import { registerDrawerDrag } from '@uikit/vanilla'

  const drawer = createDrawer()
  const d = drawerStore(drawer)
  let el

  onMount(() => {
    const disposeA11y = drawer.registerContent(el)
    const disposeDrag = registerDrawerDrag(drawer, el, { axis: 'x' })
    return () => { 
      disposeA11y()
      disposeDrag && disposeDrag() 
    }
  })
</script>

<button on:click={() => d.toggle()}>Toggle Drawer</button>

<div bind:this={el} class:ui-open={$d.isOpen} class="ui-drawer">
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
drawer.registerTrigger(element) // adds aria-expanded + space/enter handlers

// Content element (drawer)
drawer.registerContent(element, { trap: true }) // focus trap, esc handler, body scroll lock
```

### Lifecycle Hooks (Optional)
```javascript
drawer.onOpenStart(fn)
drawer.onOpenEnd(fn) 
drawer.onCloseStart(fn)
drawer.onCloseEnd(fn)
```

> **Note**: The core never enforces DOM structure or styling. Use your own markup and CSS.

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
