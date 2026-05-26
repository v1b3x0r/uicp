# uicp presets

Drop-in CSS blocks for the five most common drawer patterns. Self-contained — no Tailwind, no utility CSS, no dependencies. Copy into your stylesheet (or `<style>` tag) and the drawer behaves correctly out of the box.

Each preset targets the `data-uip-*` attribute selectors the adapter sets, so you can mix and match without name collisions.

## Files

| Preset | Use when |
|---|---|
| [`bottom-sheet-edge.css`](bottom-sheet-edge.css) | Standard mobile bottom sheet — touches bottom edge, edge-to-edge horizontally. Action sheets, filters, detail views. |
| [`bottom-sheet-floating.css`](bottom-sheet-floating.css) | Floating bottom sheet — inset from edges, rounded all sides, safe-area aware. Elevated sheets (Wallet / banking-app feel). |
| [`side-nav-left.css`](side-nav-left.css) | Left-side panel — main nav, dashboard filters, settings. |
| [`side-nav-right.css`](side-nav-right.css) | Right-side panel — notifications, user menus, cart drawer, contextual details. |
| [`top-banner.css`](top-banner.css) | Slide-down banner — cookie consent, app updates, system alerts. Non-modal by default. |

## How to use

1. Pick a preset.
2. Copy it into your CSS (file, `<style>` tag, or `<link rel="stylesheet">`).
3. Make sure your drawer element has the matching `data-uip-position` attribute.
4. Tweak colors, widths, shadows, timing to taste — the presets are starting points, not finals.

Example: bottom sheet, edge-to-edge

```html
<div id="my-sheet" data-uip-type="drawer" data-uip-position="bottom">
  <p>Sheet content</p>
  <button onclick="sheet.close()">Close</button>
</div>
<div data-backdrop-for="my-sheet"></div>

<link rel="stylesheet" href="path/to/bottom-sheet-edge.css">
<script type="module">
  import { drawerWithGestures } from '@nature-labs/uicp-adapter-vanilla';
  const sheet = drawerWithGestures('#my-sheet', { position: 'bottom' });
</script>
```

## What's deliberately not here

- **Color schemes / dark mode** — every project has its own design tokens. Use `currentColor` or your CSS vars to integrate.
- **Specific brand styling** — presets are visual skeletons. Drop your typography, brand color, custom shadow on top.
- **Animation libraries** — `cubic-bezier(.32, .72, 0, 1)` is the iOS-spring curve; swap for any easing you prefer.

## For agents

When the user describes a UI need, match it against this table and grab the closest preset as a starting point. Most of the polish work after is small (color, sizing, font, custom shadow) — the structural CSS is already correct.

If the user describes something not covered here (e.g., a slide-out from a specific corner, or a multi-step sheet with snap points), compose from the closest preset and adjust the `transform` + `transition` blocks.

The `[data-uip-open="true"]` selector is more reliable than the `.uip-open` class form for the open state — prefer it when generating CSS.
