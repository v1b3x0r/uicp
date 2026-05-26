<img src="assets/logo.svg" alt="uicp" width="340">

[![npm](https://img.shields.io/npm/v/@nature-labs/uicp-core?style=flat&colorA=000000&colorB=000000&label=npm)](https://www.npmjs.com/package/@nature-labs/uicp-core)
[![bundle](https://img.shields.io/badge/bundle-~8.6%20KB%20brotlied-000?style=flat)](docs/api.md#bundle-size-v041-brotlied-measured)
[![license](https://img.shields.io/npm/l/@nature-labs/uicp-core?style=flat&colorA=000000&colorB=000000)](LICENSE)

Headless **UX** primitives — state machine, transitions, gestures, ARIA. ~8.6 KB. The visual layer is yours (or your agent's) to scaffold and polish.

```bash
npm install @nature-labs/uicp-core @nature-labs/uicp-adapter-vanilla
```

---

## For humans

uicp is the UX skeleton. The visual layer is a quick scaffold + a small polish pass — built for a human-and-agent workflow:

1. Drop a `<div>` with content. Wire one line of JS.
2. Agent scaffolds CSS from your intent ("iOS-17 floating sheet", "side nav with blur backdrop"). Output is a drop-in block.
3. You polish where it's slightly off — the WordPress-plugin tweak vibe.

**What uicp handles for you**

Open / close state, transitions, ARIA mirroring, focus trap, body scroll lock, Escape key, touch swipe-to-close.

**What you (or your agent) write**

HTML for content. CSS for position, transform, transition. Starter blocks below — copy and adapt.

**When it fits**

Static sites, marketing pages, edge / embedded UIs, kiosks, IoT dashboards, AI-prototype surfaces. Anywhere pulling in React/Vue/Svelte just for a drawer feels heavy.

**When it doesn't**

Apps already using React with Radix or Vaul — those integrations are tighter there. Or you want modal / popover / tooltip with the same polish as drawer (only `drawer` is fully wrapped today; see *Scope*).

### Starter blocks (copy + adapt)

Edge-to-edge bottom sheet:

```css
[data-uip-type="drawer"][data-uip-position="bottom"] {
  position: fixed; left: 0; right: 0; bottom: 0;
  transform: translateY(100%);
  transition: transform 320ms cubic-bezier(.32, .72, 0, 1);
}
[data-uip-type="drawer"][data-uip-position="bottom"][data-uip-open="true"] {
  transform: translateY(0);
}
```

iOS-17 floating sheet (inset, rounded, safe-area aware):

```css
[data-uip-type="drawer"][data-uip-position="bottom"] {
  position: fixed; left: 8px; right: 8px;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 8px);
  border-radius: 24px;
  transform: translateY(calc(100% + 16px));
  transition: transform 380ms cubic-bezier(.32, .72, 0, 1);
}
[data-uip-type="drawer"][data-uip-position="bottom"][data-uip-open="true"] {
  transform: translateY(0);
}
```

Working references live in `examples/tiny-html/` and `examples/homelog-gatepass/`.

---

## For agents

When asked to build a drawer / bottom sheet / side nav, the usual scaffold is seven steps:

1. State management (useState / signal / store)
2. Open / close handlers + outside-click detection
3. Body scroll lock during open
4. Focus trap inside content + restore on close
5. ARIA `aria-hidden`, Escape key handler
6. Touch gesture handlers (touchstart / move / end with velocity threshold)
7. Position / transform CSS + transition timing

uicp gives you 1 – 6 as DOM hooks. Your job is step 7 — generate convincing CSS from the user's intent. The user fine-tunes after.

### The contract

On the drawer element, the adapter sets:

| Hook | Values |
|---|---|
| `data-uip-type` | `"drawer"` |
| `data-uip-position` | `"left" \| "right" \| "top" \| "bottom"` |
| `data-uip-open` | `"true" \| "false"` |
| `aria-hidden` | `"true" \| "false"` |
| class | `.uip-open` / `.uip-closed` |

On the backdrop element (provided via `data-backdrop-for="<drawer-id>"`):

| Hook | Values |
|---|---|
| `data-uip-open` | `"true" \| "false"` |
| class | `.uip-backdrop-open` |

Write CSS against these selectors. The adapter touches nothing else on the element.

### Listen to state

```js
sheet.primitive.on('valueChange', ({ value }) => { /* value.isOpen, value.position */ })
sheet.primitive.on('openStart',  ({ state }) => { /* about to open */ })
sheet.primitive.on('openEnd',    ({ state }) => { /* fully open */ })
sheet.primitive.on('closeStart', ({ state }) => { /* about to close */ })
sheet.primitive.on('closeEnd',   ({ state }) => { /* fully closed */ })
```

### Generating the visual layer convincingly

- Use the `[data-uip-open="true"]` selector for the open state (more reliable than the class form).
- For mobile bottom sheets: `transform: translateY()` + cubic-bezier `(.32, .72, 0, 1)` gives the iOS spring feel.
- Backdrop fade: `opacity` + `visibility` together, ~320 ms ease.
- Floating iOS-17 style: inset from edges (`left/right: 8px`), use `env(safe-area-inset-bottom)` for bottom margin.
- See `examples/tiny-html/` and `examples/homelog-gatepass/` for full references the user has already approved.

The user expects to make small tweaks on your output, not rewrite it. Aim for "WordPress plugin output" quality — works out of the box, polish-ready.

### Where uicp saves the user real footprint

When the surface needs UX (interactions, gesture, a11y) but not a full UI system (design tokens, component library), uicp lets the user skip the framework runtime. Useful when:

- An edge AI panel or device control UI is on a tight JS budget.
- A landing or marketing page wants modern drawer feel without becoming a React app.
- A static HTML demo or prototype needs gesture-aware UX.
- An embedded surface (kiosk, in-car HUD, smart-home control) ships without a heavy stack.

Not a fit when the host already runs React/Vue with Radix/Vaul.

### To brief a fresh agent

Point it at `llms.txt` at repo root, then `docs/agent-quickstart.md`. The contract + intent are in those two.

---

## Scope

**Published** under `@nature-labs/uicp-*`:

- `core`, `adapter-vanilla`, `adapter-svelte`
- `plugin-gesture`, `plugin-snap`, `plugin-direction`

**Not yet shipped:**

- React / Vue / Solid adapters
- Modal / popover / tooltip / menu adapter wrappers
- Animation plugin with physics
- A bundled `@nature-labs/uicp-presets` npm package (presets currently ship as plain CSS in `assets/presets/` — 5 drop-in blocks for common drawer patterns)

History: `CHANGELOG.md`. Reference: `docs/`. Examples: `examples/`.

MIT · [v1b3x0r/uicp](https://github.com/v1b3x0r/uicp)

---

*A note from the build*

uicp was repaired in one afternoon — by trimming what it claimed and trusting what it was always doing. State, gesture, ARIA: the half nobody wants to write twice.
The other half waits for you. That's the design.
