# CLAUDE.md — uicp

## Project

**Universal UI Context Protocol** — headless drawer/modal/tooltip/popover/menu state primitives, with a vanilla JS adapter aimed at static sites / marketing pages / tiny widgets where pulling in React or Svelte is overkill.

Philosophy: `UI = State + Transitions + Interactions`. The adapter binds state to DOM signals (data-attrs, classes, ARIA); the user owns all CSS and presentation.

## Current Status (v0.4.0)

**Working end-to-end:**
- Core primitives (drawer, modal, tooltip, popover, menu) — state machine + event emitter
- Vanilla adapter — drawer + gesture (touch drag-to-close, focus trap, scroll lock, Escape)
- Svelte adapter — drawer with store binding (less polished than vanilla)
- Plugins: gesture, snap, direction
- 16/18 tests passing (2 skipped require real browser layout/focus behavior)

**Not yet shipped (don't claim otherwise in docs):**
- React adapter
- Vue / Solid / Web Components adapters
- Animation plugin with physics
- Modal/popover/tooltip/menu adapter wrappers in vanilla (core primitives exist; only drawer is wired through vanilla adapter)

## Architecture

```
@uicp/core
  ├─ UIPrimitive (base class — reactive state, event emitter, plugin system)
  ├─ primitives/ (drawer, modal, tooltip, popover, menu)
  └─ utils/ (focus-trap, scroll-lock, events)

@uicp/adapter-vanilla
  └─ State binder — toggles classes/data-attrs/aria, no inline styles

@uicp/adapter-svelte
  └─ Store binding + action

@uicp/plugin-* (gesture, snap, direction)
```

### State shape

```js
{
  value: { isOpen, position, size },
  status: 'idle' | 'transitioning' | 'active',
  interaction: null | { type, progress, position, velocity },
  transition: null | { from, to, progress, duration },
  computed: { /* derived */ },
  meta: { closeOnOutsideClick, ... }
}
```

### State change emission (subtle but important)

`UIPrimitive.set(path, value)` handles two cases:
- **Single-key path** (`'status'`): assigns through the outer Proxy → trap fires → `_handleStateChange` runs.
- **Nested path** (`'value.isOpen'`): navigates to the inner object and assigns there. The outer Proxy's set trap does NOT fire for inner mutations, so `set()` manually invokes `_handleStateChange` after the assignment.

This was a latent bug in v0.3 where `valueChange` events silently dropped for nested-path sets. Fixed in v0.4.0. If you change `set()`, preserve this manual emit for nested paths.

### Adapter contract (true headless)

The vanilla adapter only sets:
- `data-uip-type="drawer"`
- `data-uip-position="<dir>"`
- `data-uip-open="<bool>"`
- `aria-hidden="<bool>"`
- class `.uip-open` / `.uip-closed`

Backdrop element (provided by user with `[data-backdrop-for="<drawer-id>"]`):
- class `.uip-backdrop-open`
- `data-uip-open="<bool>"`

**No inline styles.** The user writes all CSS for position/transform/transition. This is the architectural change in v0.4.0 vs v0.3.

## Package structure

```
packages/
├─ core/                  @uicp/core
├─ adapters/
│  ├─ vanilla/            @uicp/adapter-vanilla
│  └─ svelte/             @uicp/adapter-svelte
└─ plugins/
   ├─ gesture/            @uicp/plugin-gesture
   ├─ snap/               @uicp/plugin-snap
   ├─ direction/          @uicp/plugin-direction
   ├─ animate/            @uicp/plugin-animate  (WIP, not in root build script yet)
   └─ position/           @uicp/plugin-position (WIP)
```

## Bundle targets

- `@uicp/core`: <5 KB brotlied (currently 4.35 KB)
- adapters: <4 KB brotlied each
- individual plugins: <2 KB brotlied each
- Typical "drawer + gesture" setup: ~8.9 KB brotlied

## Commands

```bash
npm install
npm run build        # builds core, plugins (gesture/direction/snap), adapters
npm test             # 16/18 passing
npm run size         # check brotlied sizes
# Demos (run a local server from repo root):
#   python3 -m http.server 8088
#   open http://localhost:8088/examples/tiny-html/
#   open http://localhost:8088/examples/homelog-gatepass/
```

## Notes for AI assistants

- **This is a small, opinionated library.** Don't add abstractions, plugin slots, or framework wrappers that weren't asked for.
- **The headless contract is load-bearing.** If you ever feel the urge to inline-set `style.transform` in the adapter, stop — that's the architecture lie that v0.4.0 removed.
- **Animate plugin and position plugin exist in source but are not in the root build pipeline.** Either wire them in deliberately or remove them; don't leave them orphaned.
- **Modal/popover/tooltip/menu primitives work in core but are not adapter-wrapped.** The previous version had `export { drawer as modal, drawer as popover }` which was misleading; v0.4.0 removed those aliases. Real wrappers are TODO.

## Roadmap

- v0.4.x — vanilla + svelte polish, real modal adapter
- v0.5.x — React adapter (hooks)
- v0.6.x — animation plugin
- v1.0 — API freeze
