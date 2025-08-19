# Contributing to Universal UI Protocol

> **Thank you for your interest in contributing to UIP!** We're building the future of universal UI development.

## Getting Started

### Prerequisites

- **Node.js**: v18+ (recommended: v20+)
- **npm**: v9+ (comes with Node.js)
- **Git**: Latest version
- **Editor**: VS Code recommended (with extensions)

### Development Setup

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/uip.git
cd uip

# Install dependencies for all packages
npm install

# Build all packages
npm run build

# Run development server
npm run dev

# Run tests to ensure everything works
npm test
```

### Project Structure

```
uip/
├── packages/
│   ├── core/                    # @uip/core - Protocol implementation
│   ├── plugins/                 # Universal plugins
│   │   ├── gesture/            # Touch/mouse interactions
│   │   ├── animate/            # Smooth transitions  
│   │   └── a11y/               # Accessibility enhancements
│   └── adapters/               # Framework integrations
│       ├── vanilla/            # Vanilla JS helpers
│       ├── svelte/             # Svelte stores/actions
│       ├── react/              # React hooks (planned)
│       └── vue/                # Vue composables (planned)
├── examples/                   # Demo applications
├── docs/                       # Documentation
└── scripts/                    # Build and dev tools
```

## Development Workflow

### 1. Pick an Issue

- Check [GitHub Issues](https://github.com/universal-ui-protocol/uip/issues)
- Look for `good first issue` or `help wanted` labels
- Comment on the issue to claim it

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 3. Development Process

```bash
# Work on your changes
npm run dev              # Start development server
npm test                 # Run tests frequently
npm run lint             # Check code style
npm run type-check       # TypeScript validation
```

### 4. Submit a Pull Request

- Push your branch to your fork
- Create a PR with clear description
- Link to related issues
- Ensure CI passes

## Protocol Compliance

### Core Principles

All contributions must adhere to the Universal UI Protocol:

1. **State-First Design** - Everything starts with state management
2. **Framework Agnostic** - Core must work everywhere  
3. **Plugin Architecture** - Behavior through composable plugins
4. **Universal APIs** - Same interface across all primitives
5. **Performance Focused** - Optimal for speed and memory

### Required Interfaces

#### Primitive Implementation
Every primitive must implement:

```javascript
class YourPrimitive extends UIPrimitive {
  constructor(options = {}) {
    super({
      _type: 'your-primitive',
      value: { /* your state shape */ },
      computed: { /* derived properties */ }
    });
  }
  
  // Required methods
  open() { /* implementation */ }
  close() { /* implementation */ }
  toggle() { /* implementation */ }
  
  // Required DOM integration
  registerTrigger(element, options) { /* implementation */ }
  registerContent(element, options) { /* implementation */ }
}
```

#### Plugin Implementation
Plugins must follow this pattern:

```javascript
const yourPlugin = (options = {}) => (primitive) => {
  // 1. Capability detection
  const type = primitive._type;
  const supported = COMPATIBILITY[type];
  
  if (!supported) {
    return () => {}; // No-op cleanup
  }
  
  // 2. Setup behavior
  const setup = createSetup(primitive, options);
  
  // 3. Return cleanup function
  return () => setup.cleanup();
};
```

## Code Standards

### TypeScript

We use TypeScript for type safety and better developer experience:

```typescript
// Required: Export all types
export interface DrawerOptions {
  position?: 'left' | 'right' | 'top' | 'bottom';
  size?: number | string;
  closeOnOutsideClick?: boolean;
}

// Required: Full type definitions for primitives
export interface DrawerInstance extends UIPrimitive {
  readonly isOpen: boolean;
  open(): void;
  close(): void;
  toggle(): void;
  registerTrigger(element: Element, options?: any): Cleanup;
  registerContent(element: Element, options?: any): Cleanup;
}
```

### JavaScript Style

We follow these conventions:

```javascript
// ✅ Good: Destructure options with defaults
function createDrawer({ position = 'left', size = 320 } = {}) {
  // Implementation
}

// ✅ Good: Use meaningful names
const drawerState = { isOpen: false, position: 'left' };

// ✅ Good: Early returns
function validatePrimitive(primitive) {
  if (!primitive) return false;
  if (!primitive._type) return false;
  return true;
}

// ❌ Bad: Nested conditions
function validatePrimitive(primitive) {
  if (primitive) {
    if (primitive._type) {
      return true;
    }
  }
  return false;
}
```

### Performance Requirements

#### Bundle Size Limits

- **Core package**: ≤3KB gzipped
- **Individual plugins**: ≤2KB gzipped each
- **Framework adapters**: ≤1KB gzipped each

#### Runtime Performance

- **State updates**: Must complete in <1ms
- **Event emission**: Must complete in <0.1ms  
- **Plugin execution**: Total overhead <2ms per interaction
- **Memory usage**: <100KB per primitive instance

Test your changes:

```bash
npm run size             # Check bundle sizes
npm run perf            # Run performance benchmarks
```

## Testing Standards

### Required Tests

Every contribution needs comprehensive testing:

#### 1. Unit Tests
```javascript
// Test state management
describe('Drawer State', () => {
  test('should initialize with closed state', () => {
    const drawer = createDrawer();
    expect(drawer.isOpen).toBe(false);
  });
  
  test('should emit change event on state update', () => {
    const drawer = createDrawer();
    const mockHandler = jest.fn();
    
    drawer.on('change', mockHandler);
    drawer.open();
    
    expect(mockHandler).toHaveBeenCalledWith({
      state: expect.objectContaining({ value: { isOpen: true } })
    });
  });
});
```

#### 2. Plugin Compatibility Tests
```javascript
// Test plugin works across compatible primitives  
describe('Gesture Plugin Compatibility', () => {
  const compatiblePrimitives = ['drawer', 'modal'];
  const incompatiblePrimitives = ['tooltip', 'menu'];
  
  compatiblePrimitives.forEach(type => {
    test(`should work with ${type}`, () => {
      const primitive = createPrimitive(type);
      const result = primitive.use(gesturePlugin());
      
      expect(result).toBe(primitive); // Chainable
      expect(typeof primitive.destroy).toBe('function');
    });
  });
});
```

#### 3. Integration Tests
```javascript
// Test real user scenarios
describe('Drawer Integration', () => {
  test('should handle click -> open -> escape -> close flow', async () => {
    const { trigger, content } = setupDrawerDom();
    const drawer = createDrawer();
    
    drawer.registerTrigger(trigger);
    drawer.registerContent(content);
    
    // Click trigger
    trigger.click();
    await waitFor(() => expect(drawer.isOpen).toBe(true));
    
    // Press escape
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(drawer.isOpen).toBe(false));
  });
});
```

#### 4. Accessibility Tests
```javascript
describe('Drawer A11y', () => {
  test('should manage ARIA attributes correctly', () => {
    const { trigger, content } = setupDrawerDom();
    const drawer = createDrawer();
    
    drawer.registerTrigger(trigger);
    drawer.registerContent(content);
    
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    
    drawer.open();
    
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(content.getAttribute('aria-hidden')).toBe('false');
  });
});
```

### Running Tests

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode during development
npm run test:coverage    # Generate coverage report
npm run test:e2e         # End-to-end tests
npm run test:a11y        # Accessibility compliance tests
```

## Documentation Standards

### JSDoc Comments

All public APIs must include comprehensive JSDoc:

```javascript
/**
 * Create a drawer primitive for sliding panel interfaces
 * 
 * @param {DrawerOptions} [options] - Configuration options
 * @param {('left'|'right'|'top'|'bottom')} [options.position='left'] - Drawer position
 * @param {number|string} [options.size=320] - Drawer size in pixels or CSS units
 * @param {boolean} [options.closeOnOutsideClick=true] - Close when clicking outside
 * @param {Array<Plugin>} [plugins=[]] - Plugins to apply
 * @returns {DrawerInstance} Drawer primitive instance
 * 
 * @example
 * // Basic drawer
 * const drawer = createDrawer();
 * drawer.open();
 * 
 * @example  
 * // Right-side drawer with plugins
 * const drawer = createDrawer({ 
 *   position: 'right', 
 *   size: 400 
 * }).use(gesturePlugin());
 */
export function createDrawer(options = {}, plugins = []) {
  // Implementation
}
```

### README Updates

When adding new features, update relevant README sections:

- Quick Start examples
- API documentation
- Plugin compatibility matrix
- Bundle size comparisons

## Plugin Development

### Creating a New Plugin

1. **Create plugin package**:
```bash
mkdir packages/plugins/your-plugin
cd packages/plugins/your-plugin
npm init -y
```

2. **Implement plugin interface**:
```javascript
// packages/plugins/your-plugin/src/index.js
const COMPATIBILITY = {
  drawer: { /* capabilities */ },
  modal: { /* capabilities */ },
  // etc.
};

export const yourPlugin = (options = {}) => (primitive) => {
  const type = primitive._type;
  const config = COMPATIBILITY[type];
  
  if (!config) {
    console.warn(`yourPlugin: ${type} primitive not supported`);
    return () => {}; // No-op cleanup
  }
  
  // Plugin implementation
  const handlers = createHandlers(primitive, options, config);
  setupEventListeners(primitive, handlers);
  
  return () => cleanupEventListeners(primitive, handlers);
};
```

3. **Add TypeScript definitions**:
```typescript
// packages/plugins/your-plugin/src/types.d.ts
export interface YourPluginOptions {
  enabled?: boolean;
  customOption?: string;
}

export function yourPlugin(options?: YourPluginOptions): Plugin;
```

4. **Create comprehensive tests**:
```javascript
// packages/plugins/your-plugin/__tests__/index.test.js
import { createDrawer } from '@uip/core';
import { yourPlugin } from '../src';

describe('Your Plugin', () => {
  test('should enhance compatible primitives', () => {
    const drawer = createDrawer().use(yourPlugin());
    // Test plugin behavior
  });
  
  test('should gracefully handle incompatible primitives', () => {
    const tooltip = createTooltip().use(yourPlugin());
    // Should not crash
  });
});
```

### Plugin Best Practices

1. **Capability Detection**: Always check primitive compatibility
2. **Graceful Degradation**: Handle unsupported primitives elegantly  
3. **Memory Management**: Provide proper cleanup functions
4. **Performance**: Minimize overhead and optimize for common cases
5. **Documentation**: Include usage examples and API documentation

## Framework Adapter Development

### Creating a New Adapter

1. **Set up adapter package**:
```bash
mkdir packages/adapters/your-framework
cd packages/adapters/your-framework
```

2. **Implement required interface**:
```javascript
// packages/adapters/your-framework/src/index.js

// Required: Setup functions for all primitives
export function setupDrawer(config) {
  const { trigger, content, options = {}, plugins = [] } = config;
  const drawer = createDrawer(options);
  
  // Apply plugins
  plugins.forEach(plugin => drawer.use(plugin));
  
  // Framework-specific integration
  integrateWithFramework(drawer);
  
  return drawer;
}

// Required: Re-export core
export * from '@uip/core';

// Optional: Framework-specific utilities
export function createDrawerHook(options) {
  // Framework hook implementation
}
```

3. **Framework Integration Patterns**:

#### React Adapter
```javascript
export function useDrawer(options = {}) {
  const [drawer] = useState(() => createDrawer(options));
  const [state, setState] = useState(drawer.getState());
  
  useEffect(() => {
    return drawer.on('change', setState);
  }, [drawer]);
  
  useEffect(() => {
    return () => drawer.destroy();
  }, [drawer]);
  
  return [state, drawer];
}
```

#### Vue Adapter  
```javascript
export function useDrawer(options = {}) {
  const drawer = createDrawer(options);
  const state = reactive(drawer.getState());
  
  drawer.on('change', (newState) => {
    Object.assign(state, newState);
  });
  
  onUnmounted(() => drawer.destroy());
  
  return { state, drawer };
}
```

## Performance Guidelines

### Bundle Optimization

1. **Tree Shaking**: Use ES modules and avoid side effects
```javascript
// ✅ Good: Named exports, no side effects
export { createDrawer } from './drawer.js';
export { createModal } from './modal.js';

// ❌ Bad: Default export with side effects  
import './global-styles.css'; // Side effect!
export default { createDrawer, createModal };
```

2. **Dynamic Imports**: Load plugins lazily when possible
```javascript
// Load heavy plugins only when needed
async function enableAdvancedGestures(primitive) {
  const { physicsPlugin } = await import('@uip/plugin-physics');
  primitive.use(physicsPlugin());
}
```

### Runtime Performance

1. **Event Batching**: Minimize DOM updates
```javascript
// Batch multiple state changes
primitive.batch(() => {
  primitive.set('value.x', newX);
  primitive.set('value.y', newY);
  primitive.set('status', 'active');
}); // Single DOM update
```

2. **Memory Management**: Clean up resources properly
```javascript
class YourPrimitive extends UIPrimitive {
  destroy() {
    // Clean up event listeners
    this.cleanupFunctions.forEach(cleanup => cleanup());
    
    // Clear object references
    this.plugins.clear();
    this.eventListeners.clear();
    
    // Call parent cleanup
    super.destroy();
  }
}
```

## Release Process

### Version Strategy

We follow semantic versioning for v1.0+:

- **v0.x.y**: Pre-release, breaking changes allowed
- **v1.x.y**: Stable API, breaking changes in major versions only

### Before Submitting PR

```bash
# Run full validation
npm run validate        # Runs all checks below

# Individual checks
npm run lint           # Code style
npm run type-check     # TypeScript  
npm test              # All tests
npm run size          # Bundle size check
npm run perf          # Performance benchmarks
```

### PR Requirements

- [ ] All tests pass
- [ ] Bundle size within limits  
- [ ] TypeScript definitions included
- [ ] Documentation updated
- [ ] Accessibility tested
- [ ] Performance benchmarks pass

## Getting Help

### Community

- **Discord**: [Join our community](https://discord.gg/uip) - Real-time help
- **GitHub Discussions**: Design discussions and Q&A
- **GitHub Issues**: Bug reports and feature requests

### Development Help

- **Code Review**: Core team reviews all PRs
- **Architecture Questions**: Tag `@core-team` in discussions
- **Performance Issues**: Use `perf` label on issues

### Mentorship

New to open source? We provide mentorship for:

- First-time contributors
- Complex feature development  
- Architecture decisions
- Performance optimization

Comment on issues with "looking for mentorship" and we'll help!

---

## Recognition

Contributors are recognized in:

- **README.md**: All contributors listed
- **CHANGELOG.md**: Feature/fix attribution  
- **GitHub Releases**: Contributor highlights
- **Annual Report**: Major contributor spotlights

Thank you for making Universal UI Protocol better for everyone! 🚀

## License

By contributing to UIP, you agree that your contributions will be licensed under the same [MIT License](./LICENSE) that covers the project.