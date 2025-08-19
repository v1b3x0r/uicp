# CLAUDE.md

## Project Overview

**Universal UI Protocol (UIP)** - A revolutionary approach to UI development that treats interfaces as standardized protocols rather than components. Build universal primitives once, use everywhere.

## Current Status: v0.x (Pre-Release)

### 🎯 Core Philosophy
"Every UI is just **State + Transitions + Interactions**"

UIP reduces all UI patterns to three fundamental concepts:
- **State**: Reactive data that defines the current condition
- **Transitions**: How state changes over time with animations
- **Interactions**: How users manipulate state through gestures and input

### ✅ Implementation Status

#### Core Protocol (Experimental)
- **State Management System** ✅ - Reactive state with computed properties  
- **Event System** ✅ - Universal event emitters for all primitives
- **Plugin Architecture** ✅ - Extensible system for behavior enhancement
- **5 Base Primitives** ✅ - Drawer, Modal, Tooltip, Popover, Menu

#### Universal Plugin System
- **Gesture Plugin** ✅ - Touch/mouse drag interactions across all primitives
- **Animation Plugin** 🚧 - Smooth transitions and physics (in development)
- **Accessibility Plugin** ✅ - ARIA, focus management, keyboard navigation
- **Persistence Plugin** 🚧 - State preservation across sessions

#### Framework Adapters (0.x Compatible)
- **Vanilla JS Adapter** ✅ - Direct DOM manipulation helpers
- **Svelte Adapter** ✅ - Store-based reactive integration
- **React Adapter** ⏳ - Hooks-based integration (planned)
- **Vue Adapter** ⏳ - Composables integration (planned)

#### Shared Infrastructure
- **Focus Management** ✅ - Smart focus trapping and restoration
- **Scroll Lock** ✅ - Body scroll prevention without layout shift
- **Smart Positioning** 🚧 - Viewport-aware auto-positioning

## Technical Architecture

### Protocol-First Design
```
User Interface = State + Transitions + Interactions

    ┌─────────────────┐
    │  Presentation   │  ← Your Framework/CSS
    │     Layer       │
    └─────────┬───────┘
              │
    ┌─────────▼───────┐
    │   UIP Protocol  │  ← Universal State Management
    │   Primitives    │     (Framework Agnostic)
    └─────────┬───────┘
              │
    ┌─────────▼───────┐
    │  Plugin Layer   │  ← Behavior Enhancement
    │  Gestures, A11y │     (Optional & Composable)
    └─────────────────┘
```

### State Protocol
Every primitive follows the same state pattern:
```javascript
{
  value: any,              // Primary state (isOpen, selectedIndex, etc.)
  status: string,          // State machine status
  interaction?: {          // Live interaction data
    type: string,
    progress: number,
    position: {x, y},
    velocity: {x, y}
  },
  transition?: {           // Animation state
    from: any,
    to: any,
    progress: number,
    duration: number
  },
  computed: {},            // Derived properties
  meta: {}                 // Custom metadata
}
```

### Universal Plugin System
Plugins auto-detect primitive types and apply appropriate behavior:
```javascript
// Same plugin works across all compatible primitives
registerGesture(drawer, element, { axis: 'x' });    // Horizontal swipe
registerGesture(modal, element, { axis: 'y' });     // Vertical pull-to-close
registerGesture(tooltip, element);                  // Auto-skipped (unsupported)
```

## Package Structure (v0.x)

```
packages/
├── core/                    # @uip/core v0.x - Protocol implementation
│   ├── src/
│   │   ├── primitives/     # drawer, modal, tooltip, popover, menu
│   │   ├── base/           # UIPrimitive base class
│   │   ├── state/          # Reactive state management
│   │   ├── events/         # Universal event system
│   │   └── types.d.ts      # Core type definitions
│   └── package.json
├── plugins/
│   ├── gesture/            # @uip/plugin-gesture v0.x
│   ├── animate/            # @uip/plugin-animate v0.x (WIP)
│   ├── a11y/               # @uip/plugin-a11y v0.x
│   └── persist/            # @uip/plugin-persist v0.x (planned)
├── adapters/
│   ├── vanilla/            # @uip/adapter-vanilla v0.x
│   ├── svelte/             # @uip/adapter-svelte v0.x
│   ├── react/              # @uip/adapter-react v0.x (planned)
│   └── vue/                # @uip/adapter-vue v0.x (planned)
└── examples/
    ├── vanilla/            # Vanilla JS demos
    └── svelte/             # Svelte demos
```

## Development Guidelines

### Core Principles (v0.x)

1. **Protocol Over Components**
   - Focus on state management contracts
   - Presentation is always user-controlled
   - Framework adapters provide integration only

2. **Universal API Consistency**
   ```javascript
   // Every primitive follows this exact pattern
   const primitive = createPrimitive(options);
   primitive.set('value', newValue);
   primitive.get('value');
   primitive.on('change', callback);
   primitive.use(plugin);
   ```

3. **Plugin Universality**
   - Plugins work across compatible primitive types
   - Auto-detection of primitive capabilities
   - Graceful degradation for unsupported features

4. **Zero Breaking Changes Policy (Pre-v1.0)**
   - All v0.x changes are additive only
   - Deprecated features get clear migration paths
   - Semantic versioning strictly followed

### Implementation Standards

#### State Management
- Use reactive state with computed properties
- Emit events on all state changes
- Support time-travel debugging in dev mode
- Maintain immutable state updates

#### Plugin Development
- Plugins must be pure functions returning cleanup
- Auto-detect primitive type via `primitive._type`
- Handle unsupported primitives gracefully
- Provide TypeScript definitions

#### Testing Requirements
- Unit tests for all state transitions
- Integration tests for plugin interactions
- E2E tests for accessibility compliance
- Cross-browser testing (last 2 versions + iOS Safari 14+)

### Bundle Size Targets (v0.x)

- `@uip/core`: ~3 KB gzipped (base protocol + 5 primitives)
- Individual plugins: ~1-2 KB gzipped each
- Framework adapters: ~1 KB gzipped each
- **Total typical setup**: ~6-8 KB gzipped

Compare to existing solutions:
- Radix UI: ~45 KB
- Headless UI: ~35 KB
- Arco Design: ~200 KB

## Roadmap to v1.0

### Phase 1: Protocol Stabilization (Current - v0.3)
- [ ] Finalize State Protocol specification
- [ ] Complete Animation Plugin with physics
- [ ] Add comprehensive TypeScript definitions
- [ ] Stabilize Plugin API contracts

### Phase 2: Framework Expansion (v0.4-v0.6)
- [ ] React adapter with hooks integration
- [ ] Vue adapter with composables
- [ ] Solid adapter with signals
- [ ] Web Components adapter

### Phase 3: Advanced Primitives (v0.7-v0.8)
- [ ] Tabs with drag-to-select support
- [ ] Slider with multi-handle support
- [ ] Select with virtual scrolling
- [ ] Date picker with calendar navigation

### Phase 4: Production Readiness (v0.9)
- [ ] Performance optimizations
- [ ] Developer tools and debugging
- [ ] Comprehensive documentation
- [ ] Real-world testing and feedback

### v1.0: Stable Protocol Release
- [ ] Locked API with semantic versioning
- [ ] Production-ready performance
- [ ] Full framework ecosystem support
- [ ] Enterprise support and migration tools

## Commands

### Development
```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Development mode with watch
npm run dev

# Run comprehensive test suite
npm test

# Check bundle sizes
npm run size

# Protocol compliance check
npm run lint:protocol
```

### Examples
```bash
# Vanilla example
npm run dev:vanilla

# Svelte example  
npm run dev:svelte
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on:
- Protocol compliance requirements
- Plugin development standards
- Testing strategies and requirements
- Documentation standards

## Notes for AI Assistants

- **This is v0.x** - Breaking changes are expected and encouraged
- **Protocol-first approach** - State management is more important than components
- **README.md** contains public API and marketing content
- **This file** contains implementation details and development guidelines
- Focus on universal compatibility rather than framework-specific optimizations
- Prioritize developer experience over feature completeness in v0.x phase

## Architecture References

- **PROTOCOL.md** - Detailed protocol specifications and contracts
- **ARCHITECTURE.md** - System design and component relationships
- **examples/** - Reference implementations and best practices

## Version Strategy

- **0.1.x** - Core protocol development
- **0.2.x** - Plugin system stabilization  
- **0.3.x** - Framework adapter expansion
- **0.4.x** - Advanced primitive development
- **0.9.x** - Production readiness testing
- **1.0.0** - Stable protocol release with LTS support