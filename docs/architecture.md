# Architecture — uicp internals

How the state machine + DOM binder + plugin system actually work. Read this before refactoring core or writing non-trivial plugins.

## Layer model

```
                  ┌────────────────────────────┐
  Your CSS  ────► │  Presentation              │  (You own everything visual)
                  └────────────┬───────────────┘
                               │ reads data-uip-* attrs + classes
                  ┌────────────▼───────────────┐
  Adapter   ────► │  DOM Binder                │  packages/adapters/vanilla/src/hybrid.js
                  │  - toggle classes          │
                  │  - set data-attrs / ARIA   │
                  │  - listen to gestures      │
                  └────────────┬───────────────┘
                               │ on('valueChange')
                  ┌────────────▼───────────────┐
  Core      ────► │  UIPrimitive (state)       │  packages/core/src/base/UIPrimitive.js
                  │  - reactive state proxy    │
                  │  - event emitter           │
                  │  - plugin system           │
                  └────────────────────────────┘
```

## State shape

Every primitive uses the same shape:

```js
{
  value: { /* primitive-specific — isOpen, position, etc. */ },
  status: 'idle' | 'transitioning' | 'active',
  interaction: null | { type, progress, position, velocity },
  transition: null | { from, to, progress, duration },
  computed: { /* derived properties */ },
  meta: { /* user-provided metadata */ }
}
```

State lives in a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) so that assignments to top-level keys (e.g. `state.status = 'active'`) trigger emit logic.

## State change emission (the load-bearing gotcha)

There's a subtle interaction between the Proxy and the `set(path, value)` method that's worth understanding before you touch core:

**The setup:** `this.state` is a Proxy. Its `set` trap calls an internal `emitChange` (which calls `_handleStateChange`, which emits `change`, `valueChange`, `statusChange` events).

**Single-key paths work:** When `primitive.set('status', 'active')` runs, the code does `this.state['status'] = 'active'`. The outer Proxy's `set` trap fires. `valueChange` emits. Adapter syncs DOM. Happy path.

**Nested paths used to silently fail:** When `primitive.set('value.isOpen', true)` runs, the code navigates: `current = this.state['value']` (the get trap returns the inner object — a raw object, NOT a proxy), then `current['isOpen'] = true`. The outer Proxy never sees this mutation. So `_handleStateChange` doesn't run. So `valueChange` never emits. So the adapter never syncs DOM.

**The fix in v0.4.0:** `UIPrimitive.set()` checks whether the path is nested. If yes, it manually invokes `_handleStateChange` after the assignment:

```js
set(path, value) {
  const keys = path.split('.');
  if (keys.length === 1) {
    this.state[path] = value;  // proxy fires automatically
    return;
  }
  // Nested path — assign manually, then emit manually
  const previous = { ...this.state };
  let current = this.state;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in current)) current[keys[i]] = {};
    current = current[keys[i]];
  }
  const finalKey = keys[keys.length - 1];
  const oldValue = current[finalKey];
  if (oldValue === value) return;
  current[finalKey] = value;

  this._handleStateChange({
    state: { ...this.state },
    previous,
    path,
    value,
    oldValue
  });
}
```

**Why this matters:** All primitive methods that change open-state (drawer.open, drawer.close, modal.show, etc.) use `set('value.isOpen', X)`. If the manual emit is removed, the entire library stops syncing DOM. This bug existed silently in v0.3 because tests called the v0.2 `onChange` API (which used a different code path) instead of the v0.3 `on('valueChange')` API the adapter relies on.

If you refactor `set()`, write a test specifically for the nested-path emit case before you touch the code.

## Event flow

When you call `drawer.open()`:

```
drawer.open()                                  // in primitives/drawer.js
  ↓
this.set('status', 'transitioning')            // single key — Proxy fires
  ↓ → emit('change'), emit('statusChange')
  ↓
this.emit('openStart', { state, primitive })   // direct emit (bypasses Proxy)
  ↓
this.set('value.isOpen', true)                 // nested — manual emit
  ↓ → emit('change'), emit('valueChange')      // ← adapter's listener fires here
  ↓
this.set('status', 'active')                   // single key — Proxy fires
  ↓ → emit('change'), emit('statusChange')
  ↓
queueMicrotask:
  this.emit('openEnd', { state, primitive })
```

The adapter listens specifically to `valueChange` and re-runs `syncDOMFromState` (which only touches `class`, `data-uip-*`, `aria-hidden`).

## Adapter contract

The vanilla adapter is intentionally minimal. It does:

1. **Tag element** on init with `data-uip-type` and `data-uip-position` (for CSS targeting only — no inline styles)
2. **Listen** to `primitive.on('valueChange')` and update DOM
3. **Sync DOM** via:
   ```js
   element.classList.toggle('uip-open',  isOpen)
   element.classList.toggle('uip-closed', !isOpen)
   element.setAttribute('data-uip-open',  String(isOpen))
   element.setAttribute('aria-hidden',    String(!isOpen))
   ```
4. **Backdrop sync** if a `[data-backdrop-for="<drawer-id>"]` element exists:
   ```js
   backdrop.classList.toggle('uip-backdrop-open', isOpen)
   backdrop.setAttribute('data-uip-open', String(isOpen))
   ```
5. **Gesture wiring** (when `gestures: true`) — `BasicGestures` class binds touch/mouse drag handlers on the element, translates progress to `primitive.close()` / no-op decisions based on threshold and velocity.

**Things the adapter explicitly does NOT do (and you shouldn't add them):**

- Inline `style.transform = ...` — that's the user's CSS responsibility (this was the architecture lie removed in v0.4.0)
- Manage element positioning (`position: fixed`, `left`, `top`, etc.)
- Animation timing / duration — controlled by user CSS `transition`
- Backdrop creation — user provides the element

## Plugin system

A plugin is `(primitive) => optionalCleanup`:

```js
function myPlugin(options) {
  return function(primitive) {
    const off = primitive.on('valueChange', ({ value }) => {
      // react to state changes
    });
    return off;  // called on primitive.destroy()
  };
}
```

`primitive._type` exposes the primitive kind for capability-aware plugins:

```js
function gesturePlugin(options) {
  return function(primitive) {
    if (primitive._type !== 'drawer') {
      console.warn('gesturePlugin only supports drawer');
      return;
    }
    // ... wire up
    return () => { /* cleanup */ };
  };
}
```

Plugins compose by being passed as an array to `drawerWithPlugins(selector, plugins, options)`.

## Bundle composition

Where the 4.39 KB of core go (rough breakdown, brotlied):

- UIPrimitive base class + reactive state proxy + event emitter: ~1.2 KB
- 5 primitives (drawer, modal, tooltip, popover, menu): ~2 KB
- Utils (focus trap, scroll lock, events): ~1 KB

The vanilla adapter (3.71 KB brotlied) is mostly the gesture handler + state-sync wiring.

## What lives where

```
packages/core/src/
├── base/
│   └── UIPrimitive.js          ← base class, reactive state, event emitter, plugin system
├── primitives/
│   ├── drawer.js
│   ├── modal.js
│   ├── tooltip.js
│   ├── popover.js
│   └── menu.js
├── utils/
│   ├── focus-trap.js
│   ├── scroll-lock.js
│   └── events.js
└── index.js                    ← exports

packages/adapters/vanilla/src/
├── hybrid.js                   ← the actual adapter implementation
└── index.js                    ← re-exports drawer / drawerWithGestures / drawerWithPlugins

packages/plugins/
├── gesture/src/index.js        ← advanced gesture with velocity / threshold tuning
├── snap/src/index.js           ← snap points
├── direction/src/index.js      ← RTL/LTR
├── animate/src/index.js        ← WIP, marked private
└── position/src/index.js       ← WIP, marked private
```

## Roadmap for the architecture (post v0.4.0)

- Wire `createModal` through a real `modal()` adapter wrapper (currently the alias `drawer as modal` was removed because misleading)
- Animation plugin needs to drive `interaction.progress` and `transition` state — those slots in the state shape exist but aren't wired
- React adapter is the next major surface — should follow the same headless contract (set hooks, never inline styles)
