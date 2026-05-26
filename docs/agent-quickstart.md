# Agent Quickstart — uicp

**60-second briefing for AI agents landing in this repo.** Read this before editing anything.

## What this is

A small headless UI library (~4K LOC) for vanilla JS / Svelte drawers. Published as `@nature-labs/uicp-core`, `@nature-labs/uicp-adapter-vanilla`, etc. on npm.

**Mental model:** `UI = State + Transitions + Interactions`. The core is a state machine. The adapter binds state to DOM. The user owns all CSS.

## What you must NOT do

1. **Do not inline-set styles in the adapter.** The whole point of v0.4.0 was ripping out auto-injected `style.transform = ...`. If you find yourself writing `element.style.* = ...` in the adapter, you're undoing the architecture. Use `classList.toggle()` and `setAttribute('data-uip-*', ...)` instead.

2. **Do not write `state.value.isOpen = X` directly.** Always go through `primitive.set('value.isOpen', X)`. There's a subtle Proxy gotcha — see [architecture.md § State change emission](architecture.md#state-change-emission).

3. **Do not export `drawer as modal` / `drawer as popover` aliases.** We removed those in v0.4.0 because they were misleading. Real modal/popover wrappers are TODO.

4. **Do not add aspirational claims** (React adapter, Vue adapter, animation physics) to README, CLAUDE.md, or docs unless they actually exist. The whole v0.4.0 honesty pass deleted those exact lies.

5. **Do not commit unless the user asks.** Project convention.

6. **Do not over-engineer.** This is a tiny library by design.

## What's where

| Need to... | Read this |
|---|---|
| Understand the public API | [api.md](api.md) |
| Understand the internals | [architecture.md](architecture.md) |
| See it work end-to-end | `examples/tiny-html/` and `examples/homelog-gatepass/` |
| Know the contract between core + adapter | [architecture.md § Adapter contract](architecture.md#adapter-contract) |
| Find a primitive's source | `packages/core/src/primitives/{drawer,modal,tooltip,popover,menu}.js` |
| Find adapter source | `packages/adapters/vanilla/src/hybrid.js` (the actual brain) and `index.js` (re-exports) |

## What's published vs not

**Published to npm (v0.4.0):**
- `@nature-labs/uicp-core`, `@nature-labs/uicp-adapter-vanilla`, `@nature-labs/uicp-adapter-svelte`, `@nature-labs/uicp-plugin-gesture`, `@nature-labs/uicp-plugin-snap`, `@nature-labs/uicp-plugin-direction`

**NOT published (marked `"private": true`):**
- `@nature-labs/uicp-cli` — internal scaffolding tool
- `@nature-labs/uicp-plugin-animate` — WIP
- `@nature-labs/uicp-plugin-position` — WIP

## The one weird trick

When `primitive.set('value.isOpen', true)` is called:
- The path has a dot → outer Proxy's `set` trap does NOT fire
- So `_handleStateChange` won't run automatically
- So `valueChange` event won't emit
- So adapter won't sync DOM
- So the drawer stays closed even though state says open

We patched `UIPrimitive.set()` to manually invoke `_handleStateChange` for nested paths. **If you refactor `set()`, preserve this manual emit.** See `packages/core/src/base/UIPrimitive.js:149-178`.

## Workflow

```bash
npm install
npm run build        # core + adapters + plugins (gesture, snap, direction)
npm test             # 16/18 passing — 2 skipped need real browser
npm run size         # check brotlied sizes against limits in package.json
```

Demos verify visually via `python3 -m http.server 8088` from repo root + open `examples/*/`.

## When in doubt

`claude.md` (case-insensitive: `CLAUDE.md`) has the most up-to-date internal notes — read that before making architectural changes.
