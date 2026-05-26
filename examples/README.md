# uicp examples

All examples run as static HTML with an importmap pointing at `/packages/*/dist/`. Start a server from the **repo root** (not the example folder), then open the example URL:

```bash
cd /path/to/uicp
python3 -m http.server 8088
# Then open one of:
#   http://localhost:8088/examples/tiny-html/
#   http://localhost:8088/examples/homelog-gatepass/
```

## Verified for v0.4.0

| Example | What it shows | Viewport |
|---|---|---|
| [tiny-html/](tiny-html/) | 3-direction drawer (bottom sheet / right drawer / left nav), edge-to-edge style, gesture + backdrop + Escape, bundle size display | Any |
| [homelog-gatepass/](homelog-gatepass/) | iOS-17 floating sheet pattern (inset from edges, rounded all sides, safe-area aware), Wallet-style Pass switcher with active card + bottom drawer + gate-open CTA | Mobile-first (390×844) |

Each example folder has a `_screenshots/` directory showing the rendered states (taken via Chrome DevTools MCP during development).

## Legacy (pre-v0.4.0)

These examples predate the true-headless refactor and may need CSS updates to position drawers correctly. Useful as historical reference, not current usage:

- `vanilla/` — original raw-CSS drawer demo (single file)
- `vanilla-protocol/` — earlier "UIP protocol integration" demo
- `svelte/` — Svelte adapter demo (status uncertain)

If you're picking up uicp today, start with `tiny-html/` for vanilla and the Svelte README/code for framework usage.

## Pattern: how a uicp demo is wired

1. **Import map** in `<head>` resolves `@uicp/*` bare specifiers to built dist files:
   ```html
   <script type="importmap">
   {"imports":{
     "@uicp/core": "/packages/core/dist/index.js",
     "@uicp/adapter-vanilla": "/packages/adapters/vanilla/dist/index.js"
   }}
   </script>
   ```

2. **Drawer element** with `id` + initial CSS classes (Tailwind in our demos, but anything works):
   ```html
   <div id="my-drawer" class="bg-white rounded-3xl shadow-2xl">…content…</div>
   <div data-backdrop-for="my-drawer" class="backdrop"></div>
   ```

3. **Your CSS** drives position + transform + transition. The adapter only toggles `data-uip-open` / `.uip-open` / `.uip-backdrop-open`:
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

4. **Script** wires up the adapter:
   ```js
   import { drawerWithGestures } from '@uicp/adapter-vanilla';
   const sheet = drawerWithGestures('#my-drawer', { position: 'bottom' });
   document.querySelector('#open-btn').onclick = () => sheet.open();
   ```

That's the whole pattern. Everything else is your design choices.
