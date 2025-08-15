# CLAUDE.md

## Project Overview

**Universal UI Protocol (UIP)** - A collection of 5 headless UI primitives with a universal plugin system. This project demonstrates a production-ready implementation of framework-agnostic UI components.

## Current Implementation Status

### ✅ Completed Features

1. **5 Core Primitives** (in `packages/core/src/primitives/`)
   - Drawer - Sliding panels with gesture support
   - Modal - Overlay dialogs with backdrop
   - Tooltip - Contextual information displays
   - Popover - Rich floating content containers
   - Menu - Context menus with keyboard navigation

2. **Universal Plugin System** (in `packages/plugins/`)
   - Gesture - Touch/mouse drag interactions
   - Position - Smart positioning and placement
   - Snap - Dynamic sizing with snap points
   - Direction - RTL/LTR support

3. **Framework Adapters** (in `packages/adapters/`)
   - Vanilla JS - DOM helpers and utilities
   - Svelte - Store-based reactive adapter

4. **Shared Utilities** (in `packages/core/src/utils/`)
   - Focus trap - Keyboard navigation and focus management
   - Scroll lock - Body scroll prevention without layout shift
   - Event system - Unified event handling

## Technical Architecture

```
@uip/core (5 primitives)
    ├── Consistent API pattern across all primitives
    ├── Zero runtime dependencies
    ├── Full TypeScript definitions
    └── Comprehensive a11y support

@uip/plugins/* (Universal plugins)
    ├── Work with any primitive type
    ├── Auto-detect primitive capabilities
    └── Tree-shakeable

@uip/adapter-* (Framework adapters)
    ├── Thin wrappers around core
    ├── Framework-specific reactivity
    └── Maintain core API consistency
```

## Package Structure

```
packages/
├── core/                    # @uip/core - All 5 primitives
│   ├── src/
│   │   ├── primitives/     # drawer, modal, tooltip, popover, menu
│   │   ├── utils/          # focus-trap, scroll-lock, events
│   │   └── types.d.ts
│   └── package.json
├── adapters/
│   ├── vanilla/            # @uip/adapter-vanilla
│   └── svelte/             # @uip/adapter-svelte
├── plugins/
│   ├── gesture/            # @uip/plugin-gesture
│   ├── position/           # @uip/plugin-position
│   ├── snap/               # @uip/plugin-snap
│   └── direction/          # @uip/plugin-direction
└── cli/                    # @uip/cli (scaffold tool)
```

## Development Guidelines

### Core Principles

1. **Separation of Concerns**
   - Core handles logic and state
   - Presentation layer is user's responsibility
   - Adapters provide framework integration

2. **Universal API Pattern**
   ```javascript
   // Every primitive follows this pattern
   const primitive = createPrimitive(options);
   primitive.open();
   primitive.close();
   primitive.toggle();
   primitive.onChange(callback);
   primitive.registerTrigger(element);
   primitive.registerContent(element);
   ```

3. **Plugin Compatibility**
   - Plugins detect primitive type via `_type` property
   - Gracefully handle unsupported primitives
   - Maintain immutability of core state

### Testing Requirements

- Unit tests for state management
- Integration tests for primitive interactions
- E2E tests for accessibility features
- Cross-browser testing (last 2 versions + iOS Safari 14+)

### Bundle Size Targets

- `@uip/core`: ~4-5 KB gzipped (all 5 primitives)
- Individual adapters: ~1 KB gzipped each
- Individual plugins: ~1-2 KB gzipped each
- Total for typical setup: ~7-8 KB gzipped

## Roadmap (from README.md)

### Next Phase - Framework Expansion
- [ ] React adapter (`@uip/adapter-react`)
- [ ] Qwik adapter
- [ ] Solid adapter
- [ ] Web Components adapter

### Advanced Primitives
- [ ] Command Palette
- [ ] Date Range Picker
- [ ] Virtualized List
- [ ] Combobox/Select

### Developer Experience
- [ ] Live playground with framework switching
- [ ] Storybook integration
- [ ] Design system templates
- [ ] Migration guides

## Commands

### Development
```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Development mode
npm run dev

# Run tests
npm test

# Check bundle sizes
npm run size
```

### Examples
```bash
# Vanilla example
npm run dev:vanilla

# Svelte example  
npm run dev:svelte
```

## Contributing

1. All primitives must follow the universal API pattern
2. New primitives go in `packages/core/src/primitives/`
3. Plugins must work universally across primitive types
4. Maintain zero runtime dependencies in core
5. Include TypeScript definitions
6. Add comprehensive tests
7. Update this document with implementation details

## Notes for AI Assistants

- **README.md** is the single source of truth for project vision and public API
- This file (CLAUDE.md) documents the actual implementation
- All 5 primitives are fully implemented and production-ready
- React adapter is planned but not yet implemented
- Focus on maintaining consistency across the universal API pattern
- When adding features, ensure they work with all existing primitives