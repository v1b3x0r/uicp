# API Reference — uicp v0.4.1

Public API for vanilla JS usage. Svelte adapter has a separate API surface; see `packages/adapters/svelte/src/` until its dedicated doc lands.

## Vanilla adapter — three entry points

```js
import { drawer, drawerWithGestures, drawerWithPlugins } from '@nature-labs/uicp-adapter-vanilla';
```

### `drawer(selector, options)`

Creates a drawer state machine and binds it to the DOM element. Returns a control handle.

```js
const sheet = drawer('#my-drawer', {
  position: 'bottom',
  initialOpen: false,
  size: 320,
  gestures: false,
  polling: true
});
```

**Parameters:**

| Name | Type | Default | Description |
|---|---|---|---|
| `selector` | `string \| HTMLElement` | required | CSS selector or element reference for the drawer container |
| `options.position` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'` | Which edge the drawer slides from. Used by gesture axis and exposed as `data-uip-position` for CSS |
| `options.size` | `number \| string` | `320` | Hint for gesture math (pixel distance to drag for full open/close). Does NOT set element size — your CSS does that |
| `options.initialOpen` | `boolean` | `false` | Initial state |
| `options.gestures` | `boolean` | `false` (use `drawerWithGestures` for `true`) | Enable touch/mouse drag-to-close |
| `options.polling` | `boolean` | `true` | Fallback state-sync polling if the event handler fails (shouldn't be needed in v0.4.0; kept for safety) |

**Returns:**

```js
{
  open(),       // Set isOpen=true; fires openStart, valueChange, openEnd
  close(),      // Set isOpen=false; fires closeStart, valueChange, closeEnd
  toggle(),     // Flip
  primitive,    // The underlying @nature-labs/uicp-core drawer primitive — for events
  adapter,      // The DOM binder — usually you don't need this
  destroy()     // Clean up all listeners
}
```

### `drawerWithGestures(selector, options)`

Convenience wrapper — same as `drawer(selector, { ...options, gestures: true })`.

### `drawerWithPlugins(selector, plugins, options)`

Full plugin API. Each plugin is a function that receives the primitive and returns an optional cleanup function:

```js
import { drawerWithPlugins } from '@nature-labs/uicp-adapter-vanilla';
import { snapPlugin } from '@nature-labs/uicp-plugin-snap';

const sheet = drawerWithPlugins('#my-drawer', [
  snapPlugin({ snapPoints: [0, 0.5, 1] })
], { position: 'bottom' });
```

## Events

Listen via the underlying primitive:

```js
const sheet = drawer('#my-drawer', { position: 'bottom' });

// Most useful event — fires on every state change
sheet.primitive.on('valueChange', ({ value, previous }) => {
  console.log(value.isOpen, value.position, value.size);
});

// Lifecycle (in order)
sheet.primitive.on('openStart',  ({ state, primitive }) => { /* about to open */ });
sheet.primitive.on('openEnd',    ({ state, primitive }) => { /* fully open */ });
sheet.primitive.on('closeStart', ({ state, primitive }) => { /* about to close */ });
sheet.primitive.on('closeEnd',   ({ state, primitive }) => { /* fully closed */ });

// Status changes (idle / transitioning / active)
sheet.primitive.on('statusChange', ({ status, previous }) => { /* ... */ });

// Generic catch-all
sheet.primitive.on('change', ({ state, previous, primitive }) => { /* ... */ });
```

All `.on()` calls return an unsubscribe function:

```js
const off = sheet.primitive.on('valueChange', handler);
off();  // detach
```

## State hooks (what the adapter sets on your DOM)

**On the drawer element:**

| Hook | Values | Purpose |
|---|---|---|
| `data-uip-type` | `"drawer"` | Identify primitive type for CSS targeting |
| `data-uip-position` | `"left" \| "right" \| "top" \| "bottom"` | Which direction it slides from |
| `data-uip-open` | `"true" \| "false"` | Open state |
| `aria-hidden` | `"true" \| "false"` | A11y mirror of open state |
| `class` | toggles `.uip-open` / `.uip-closed` | Style hook |

**On the backdrop element** (you provide it with `data-backdrop-for="<drawer-id>"`):

| Hook | Values |
|---|---|
| `data-uip-open` | `"true" \| "false"` |
| `class` | toggles `.uip-backdrop-open` |

## Direct core usage (skip the adapter)

If you don't need DOM binding (e.g., you're driving a custom renderer):

```js
import { createDrawer } from '@nature-labs/uicp-core';

const d = createDrawer({ initialOpen: false, position: 'bottom', size: 320 });

d.open();
console.log(d.isOpen);              // true
console.log(d.get('value.isOpen')); // true
console.log(d.get());               // full state object

d.on('valueChange', ({ value }) => console.log('changed:', value.isOpen));

d.close();
d.toggle();
d.destroy();
```

Same API for `createModal`, `createTooltip`, `createPopover`, `createMenu` — but the vanilla adapter currently only wraps `createDrawer`. The other core primitives work as headless state machines; you write your own DOM binding.

## State shape (full)

```ts
type DrawerState = {
  value: {
    isOpen: boolean,
    position: 'left' | 'right' | 'top' | 'bottom',
    size: number | string
  },
  status: 'idle' | 'transitioning' | 'active',
  interaction: null | {
    type: string,
    progress: number,
    position: { x: number, y: number },
    velocity: { x: number, y: number }
  },
  transition: null | {
    from: any,
    to: any,
    progress: number,
    duration: number
  },
  computed: {
    cssTransform: string,  // e.g. 'translateY(0)' or 'translateY(100%)'
    cssSize: string        // e.g. '320px'
  },
  meta: {
    closeOnOutsideClick: boolean
  }
};
```

Note: `computed.cssTransform` and `computed.cssSize` are exposed but **you should not need them** — write CSS against the state hooks instead. They exist for legacy/computed-property use cases.

## Plugin API (writing your own)

A plugin is a function that takes the primitive and returns optional cleanup:

```js
function myPlugin(options = {}) {
  return function(primitive) {
    const off = primitive.on('valueChange', ({ value }) => {
      // do something
    });
    return off;  // cleanup
  };
}

// Usage
drawerWithPlugins('#sheet', [myPlugin({ ... })], { position: 'bottom' });
```

For type-aware plugins, check `primitive._type` (string: `'drawer'`, `'modal'`, etc.) and gracefully skip if incompatible:

```js
function gesturePlugin(options) {
  return function(primitive) {
    if (primitive._type !== 'drawer') return; // only support drawer
    // ... wire up touch handlers
    return () => { /* cleanup */ };
  };
}
```

## Gestures (when `gestures: true` or via `drawerWithGestures`)

The basic gesture handler (built into vanilla adapter) supports:

- Touch drag on the drawer element → translates while dragging
- Release with velocity / past threshold → close
- Release back near origin → snap open

It auto-picks the axis from `position` (`x` for left/right, `y` for top/bottom).

To customize beyond defaults, use `@nature-labs/uicp-plugin-gesture` directly with `drawerWithPlugins`.

## Bundle size (v0.4.1, brotlied, measured)

| Package | Size |
|---|---|
| `@nature-labs/uicp-core` | 4.39 KB |
| `@nature-labs/uicp-adapter-vanilla` | 3.71 KB |
| `@nature-labs/uicp-plugin-gesture` | 1.13 KB |
| `@nature-labs/uicp-plugin-snap` | 982 B |
| **Drawer + gesture stack** | **~8.6 KB total** |
