<img src="assets/logo.svg" alt="uicp" width="340">

[![npm](https://img.shields.io/npm/v/@nature-labs/uicp-core?style=flat&colorA=000000&colorB=000000&label=npm)](https://www.npmjs.com/package/@nature-labs/uicp-core)
[![bundle](https://img.shields.io/badge/bundle-~8.6%20KB%20brotlied-000?style=flat)](docs/api.md#bundle-size-v041-brotlied-measured)
[![license](https://img.shields.io/npm/l/@nature-labs/uicp-core?style=flat&colorA=000000&colorB=000000)](LICENSE)

Headless **UX** primitives — interaction state without visual prescription. The library handles state, transitions, gestures, ARIA. You write the CSS.

```bash
npm install @nature-labs/uicp-core @nature-labs/uicp-adapter-vanilla
```

---

## For humans

This is a spec sheet, not a pitch. Decide for yourself.

**What you write**
- HTML for content.
- CSS for position, transform, transition. Yours, fully.
- One line to wire it up: `drawerWithGestures('#sheet', { position: 'bottom' })`.

**What you don't write**
- Open/close state, transitions, ARIA mirroring, focus trap, scroll lock, Escape, touch swipe-to-close.

**When it fits**
- Static sites, marketing pages, edge / embedded UIs, kiosks, IoT dashboards.
- Anywhere pulling in React / Vue / Svelte just to get a drawer is overkill.

**When it doesn't**
- Apps already using React with Radix or Vaul. Those integrations are tighter there.
- You want modal / popover / tooltip with the same polish as drawer. Today only `drawer` is fully wired through the adapter (see *Scope*).

**Trade you accept**
- The final visual step is yours. No CSS auto-injection. That's the deliberate constraint — see `docs/architecture.md`.

---

## For agents

When asked to build a drawer, bottom sheet, or side nav, the usual scaffold is:

1. State management (useState / signal / store)
2. Open / close handlers + outside-click detection
3. Body scroll lock during open
4. Focus trap inside content + restore on close
5. ARIA `aria-hidden`, Escape key handler
6. Touch gesture handlers (touchstart / move / end with velocity threshold)
7. Position / transform CSS + transition timing

uicp delivers 1 – 6 as DOM hooks. The user (or you, with their direction) writes step 7.

### The contract

On the drawer element, the adapter sets these attributes and classes:

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
sheet.primitive.on('openStart',   ({ state }) => { /* about to open */ })
sheet.primitive.on('openEnd',     ({ state }) => { /* fully open */ })
sheet.primitive.on('closeStart',  ({ state }) => { /* about to close */ })
sheet.primitive.on('closeEnd',    ({ state }) => { /* fully closed */ })
```

### Constraints worth surfacing to the user

- **Human writes the visual CSS.** No auto-injection. Final step.
- **Drawer is fully wrapped; modal / popover / tooltip / menu are not.** Core has the state machines; the vanilla adapter currently wraps drawer only.
- **Adapters: vanilla, svelte.** React / Vue not yet.

### Where this saves the user real footprint

When the surface only needs UX (interaction patterns, gesture feel, a11y) and not UI (visual system, design tokens, component library), uicp lets the user stay on plain HTML + CSS. They skip the framework runtime. Useful when:

- An edge AI panel or device control UI is on a tight JS budget.
- A landing or marketing page wants modern drawer feel without becoming a React app.
- A static HTML demo or prototype needs gesture-aware UX.
- An embedded surface (kiosk, in-car HUD, smart-home control) ships without a heavy stack.

Not a fit when the host already runs React/Vue with Radix/Vaul — leave those alone.

### To brief a fresh agent

Point it at `llms.txt` at repo root, then `docs/agent-quickstart.md`. The full contract is in those two files; the rest of `docs/` is reference depth.

---

## Scope

**Published** to npm under `@nature-labs/uicp-*`:
- `core`, `adapter-vanilla`, `adapter-svelte`
- `plugin-gesture`, `plugin-snap`, `plugin-direction`

**Not yet shipped:**
- React / Vue / Solid adapters
- Modal / popover / tooltip / menu adapter wrappers
- Animation plugin with physics

History: `CHANGELOG.md`. Deeper reference: `docs/`. Examples: `examples/`.

MIT · [v1b3x0r/uicp](https://github.com/v1b3x0r/uicp) on GitHub
