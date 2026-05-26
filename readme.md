# Universal UI Context Protocol (uicp)

> Headless drawer / sheet / nav primitives for vanilla JS and Svelte. State + transitions + gestures only — you own all the CSS.

[![npm](https://img.shields.io/npm/v/@uicp/core?style=flat&colorA=000000&colorB=000000)](https://www.npmjs.com/package/@uicp/core)
[![License](https://img.shields.io/npm/l/@uicp/core?style=flat&colorA=000000&colorB=000000)](https://github.com/v1b3x0r/uicp/blob/main/LICENSE)

## Why uicp

Most headless UI libraries are framework-locked: Radix is React-only (~45 KB), Headless UI ships React/Vue forks (~35 KB), Vaul is fantastic but needs React or Svelte. If you're shipping a marketing page, a static site, or a tiny widget where pulling in a framework is too much, your options thin out.

uicp is for that niche:

- **Vanilla JS first.** ~8 KB brotlied total (core + adapter + gesture) — works without any framework runtime.
- **Truly headless.** The adapter sets `data-uip-open`, `aria-hidden`, and class hooks. You write every line of CSS. Edge-to-edge bottom sheet, iOS-17 floating inset sheet, side nav, whatever — it's just CSS.
- **Native gesture feel.** Touch drag-to-close, velocity-aware, focus trap, scroll lock, Escape to close — built in.

## Install

```bash
npm install @uicp/core @uicp/adapter-vanilla
# optional:
npm install @uicp/plugin-gesture
```

## Vanilla JS

```html
<button id="open">Open</button>

<div id="sheet" data-uip-type="drawer" data-uip-position="bottom">
  <p>Sheet content</p>
  <button data-close>Close</button>
</div>
<div data-backdrop-for="sheet"></div>

<style>
  [data-uip-type="drawer"][data-uip-position="bottom"] {
    position: fixed; left: 0; right: 0; bottom: 0;
    transform: translateY(100%);
    transition: transform 320ms cubic-bezier(.32, .72, 0, 1);
  }
  [data-uip-type="drawer"][data-uip-open="true"] {
    transform: translateY(0);
  }
  [data-backdrop-for] {
    position: fixed; inset: 0;
    background: rgb(0 0 0 / 0.5);
    opacity: 0; visibility: hidden;
    transition: opacity 320ms ease, visibility 320ms ease;
  }
  [data-backdrop-for].uip-backdrop-open {
    opacity: 1; visibility: visible;
  }
</style>

<script type="module">
  import { drawerWithGestures } from '@uicp/adapter-vanilla';

  const sheet = drawerWithGestures('#sheet', { position: 'bottom' });
  document.getElementById('open').onclick = () => sheet.open();
  document.querySelector('[data-close]').onclick = () => sheet.close();
  document.querySelector('[data-backdrop-for="sheet"]').onclick = () => sheet.close();
</script>
```

That's it. Three CSS rules per position, the adapter handles state.

### Floating iOS-17 style

Same JS. Different CSS:

```css
[data-uip-type="drawer"][data-uip-position="bottom"] {
  position: fixed;
  left: 8px; right: 8px;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 8px);
  border-radius: 24px;
  transform: translateY(calc(100% + 16px));
  transition: transform 380ms cubic-bezier(.32, .72, 0, 1);
}
```

See `examples/tiny-html/` (edge-to-edge) and `examples/homelog-gatepass/` (floating wallet-style).

## Svelte

```svelte
<script>
  import { createDrawerStore } from '@uicp/adapter-svelte';
  const drawer = createDrawerStore({ position: 'bottom' });
</script>

<button on:click={() => drawer.open()}>Open</button>

<div use:drawer.action data-uip-type="drawer" data-uip-position="bottom">
  <p>Content</p>
</div>
```

## State hooks

The adapter sets these on the drawer element:

| Hook | Values |
|---|---|
| `data-uip-type` | `"drawer"` |
| `data-uip-position` | `"left" / "right" / "top" / "bottom"` |
| `data-uip-open` | `"true" / "false"` |
| `aria-hidden` | `"true" / "false"` |
| class | `.uip-open` / `.uip-closed` |

On the backdrop element (`[data-backdrop-for="<drawer-id>"]`):

| Hook | Values |
|---|---|
| class | `.uip-backdrop-open` (added when drawer is open) |
| `data-uip-open` | `"true" / "false"` |

## API

```js
const drawer = drawerWithGestures('#my-drawer', {
  position: 'bottom',  // 'left' | 'right' | 'top' | 'bottom'
  size: 320,           // hint — only used by gesture math
  initialOpen: false,
  gestures: true       // default true
});

drawer.open();
drawer.close();
drawer.toggle();
drawer.primitive.on('valueChange', ({ value }) => console.log(value.isOpen));
drawer.destroy();
```

## Scope (honest)

**Shipped & tested:**
- `@uicp/core` — drawer, modal, tooltip, popover, menu primitives (state machines)
- `@uicp/adapter-vanilla` — drawer + gesture for vanilla JS
- `@uicp/adapter-svelte` — drawer + gesture for Svelte
- `@uicp/plugin-gesture` — touch drag-to-close
- `@uicp/plugin-snap` — snap points
- `@uicp/plugin-direction` — RTL/LTR

**Not yet:**
- React adapter (planned, not shipped)
- Vue adapter (planned, not shipped)
- Animation plugin with physics (in progress)
- Real modal/popover/tooltip/menu wrappers in vanilla adapter (currently only drawer is wired end-to-end)

## Bundle size

Measured against the vanilla adapter built dist (raw, brotlied):

| Package | Brotlied | Raw |
|---|---|---|
| `@uicp/core` | 4.35 KB | 49 KB |
| `@uicp/adapter-vanilla` | ~3.4 KB | 8.6 KB |
| `@uicp/plugin-gesture` | 1.13 KB | 7.5 KB |
| `@uicp/plugin-snap` | 982 B | 3.5 KB |

Total typical setup (core + vanilla + gesture): **~8.9 KB brotlied**.

## Status

v0.4.0 — first real npm release. Architecture is stable, drawer end-to-end works in vanilla + svelte. Modal/popover/tooltip/menu primitives exist in core but aren't wired in the vanilla adapter yet. Treat that as the "not for production" boundary until they ship dedicated adapter wrappers.

Breaking changes between v0.3.x and v0.4.0:
- Package scope renamed `@uip/*` → `@uicp/*`
- Adapter no longer auto-injects position styles. Drawers need CSS for position/transform/transition (one block per position direction, see usage above).
- Backdrop class changed: `.show` → `.uip-backdrop-open`
- Drawer class changed: `.open` / `.closed` → `.uip-open` / `.uip-closed`

## License

MIT — see LICENSE.
