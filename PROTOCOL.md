# Universal UI Protocol Specification

> **Version**: 0.x (Pre-Release)  
> **Status**: Experimental - Breaking changes expected

## Core Philosophy

**"Every UI is just State + Transitions + Interactions"**

The Universal UI Protocol (UIP) reduces all user interface patterns to three fundamental concepts:

1. **State** - Reactive data that defines the current condition of a UI element
2. **Transitions** - How state changes over time with animations and effects  
3. **Interactions** - How users manipulate state through gestures, input, and events

This protocol-first approach enables universal compatibility across frameworks while maintaining optimal performance and developer experience.

## State Protocol Specification

### Core State Interface

Every UIP primitive implements the following state structure:

```javascript
interface UIState {
  // Primary value (required)
  value: any;              // The main state (isOpen, selectedIndex, inputValue, etc.)
  
  // State machine status (required)  
  status: 'idle' | 'active' | 'transitioning' | 'interacting';
  
  // Live interaction data (optional)
  interaction?: {
    type: 'none' | 'hover' | 'focus' | 'drag' | 'pinch' | 'swipe';
    progress: number;        // 0.0 to 1.0
    position: { x: number, y: number };
    velocity: { x: number, y: number };
    startTime: number;       // Performance.now()
  };
  
  // Animation/transition state (optional)
  transition?: {
    from: any;              // Previous state value
    to: any;                // Target state value  
    progress: number;       // 0.0 to 1.0
    startTime: number;      // Performance.now()
    duration: number;       // Milliseconds
    easing: string;         // CSS easing function
  };
  
  // Computed properties (reactive)
  computed: Record<string, any>;
  
  // Custom metadata
  meta: Record<string, any>;
}
```

### State Management Rules

1. **Immutability**: State updates must create new objects, never mutate existing ones
2. **Reactive**: All state changes must trigger appropriate events  
3. **Serializable**: State must be JSON serializable for persistence and debugging
4. **Minimal**: Only store essential data, compute derived values on demand
5. **Typed**: Use TypeScript definitions for compile-time safety

### State Change Events

Every state change triggers events in this exact order:

```javascript
// Before state change
primitive.emit('beforeChange', { from: oldState, to: newState, primitive });

// During state change (for transitions)
primitive.emit('changing', { state: currentState, progress, primitive });

// After state change completes
primitive.emit('change', { state: newState, previous: oldState, primitive });

// Specific event based on the change
primitive.emit('valueChange', { value: newValue, previous: oldValue, primitive });
```

## Primitive Base Specification

### UIPrimitive Class Contract

All primitives must extend or implement this interface:

```javascript
class UIPrimitive {
  // Required properties
  _type: string;           // Primitive type identifier
  _instanceId: string;     // Unique instance ID
  state: UIState;          // Current state
  
  // Core state methods (required)
  get(path?: string): any;                    // Get state value
  set(path: string, value: any): void;        // Set state value
  update(updater: (state) => state): void;    // Update with function
  
  // Event system (required)
  on(event: string, handler: Function): Cleanup;
  emit(event: string, data: any): void;
  off(event: string, handler?: Function): void;
  
  // Plugin system (required)
  use(plugin: Plugin): UIPrimitive;           // Chainable plugin registration
  
  // Lifecycle (required)
  mount?(target: Element): Cleanup;           // Attach to DOM element
  destroy(): void;                            // Cleanup all resources
  
  // Optional state helpers
  computed?(computedProps: Record<string, Function>): void;
  persist?(key: string): void;
  
  // Optional DOM helpers  
  registerTrigger?(element: Element, options?: any): Cleanup;
  registerContent?(element: Element, options?: any): Cleanup;
}
```

### Required Primitive Events

Every primitive must emit these standard events:

- `beforeChange` - Before any state change
- `change` - After any state change  
- `valueChange` - When the primary value changes
- `statusChange` - When status changes
- `mount` - When attached to DOM element
- `unmount` - When detached from DOM
- `destroy` - When destroyed

### Primitive Type Registry

Standard primitive types and their value contracts:

```javascript
// Selection primitives
'tabs'     -> { activeIndex: number, items: Array }
'select'   -> { selected: any, options: Array, query?: string }
'radio'    -> { selected: any, options: Array }
'checkbox' -> { checked: boolean | Array }

// Overlay primitives
'drawer'   -> { isOpen: boolean, position?: string, size?: number }
'modal'    -> { isOpen: boolean, level?: number }
'popover'  -> { isOpen: boolean, anchor?: Element }
'tooltip'  -> { isVisible: boolean, content: string }

// Input primitives
'slider'   -> { value: number | Array, min: number, max: number }
'toggle'   -> { checked: boolean }
'input'    -> { value: string, focused: boolean }

// Display primitives
'toast'    -> { visible: boolean, message: string, type: string }
'progress' -> { value: number, max: number, indeterminate?: boolean }
```

## Plugin System Specification

### Plugin Interface

Plugins are pure functions that enhance primitive behavior:

```javascript
type Plugin = (primitive: UIPrimitive) => Cleanup;
type Cleanup = () => void;

// Example plugin
const gesturePlugin = (options = {}) => (primitive) => {
  // Plugin implementation
  const handlers = createGestureHandlers(primitive, options);
  
  // Setup
  primitive.element?.addEventListener('touchstart', handlers.start);
  primitive.element?.addEventListener('touchmove', handlers.move);
  primitive.element?.addEventListener('touchend', handlers.end);
  
  // Return cleanup function
  return () => {
    primitive.element?.removeEventListener('touchstart', handlers.start);
    primitive.element?.removeEventListener('touchmove', handlers.move);
    primitive.element?.removeEventListener('touchend', handlers.end);
  };
};
```

### Plugin Capabilities Detection

Plugins must detect primitive compatibility:

```javascript
const GESTURE_COMPATIBILITY = {
  drawer: { supports: ['drag'], defaultAxis: 'x' },
  modal: { supports: ['drag'], defaultAxis: 'y' },
  tooltip: { supports: [] },
  popover: { supports: ['tap'] },
  tabs: { supports: ['drag', 'swipe'], defaultAxis: 'x' }
};

function gesturePlugin(options = {}) {
  return (primitive) => {
    const type = primitive._type;
    const config = GESTURE_COMPATIBILITY[type];
    
    if (!config?.supports.length) {
      console.warn(`Gesture plugin: ${type} primitive does not support gestures`);
      return () => {}; // No-op cleanup
    }
    
    // Apply gesture handling...
  };
}
```

### Standard Plugin Types

#### Core Plugins (Framework Agnostic)

1. **Gesture Plugin** - Touch and mouse interactions
2. **Animation Plugin** - Smooth transitions and physics
3. **A11y Plugin** - Accessibility enhancements
4. **Persistence Plugin** - State preservation
5. **Focus Plugin** - Focus management and trapping
6. **Keyboard Plugin** - Keyboard navigation
7. **Position Plugin** - Smart positioning logic

#### Framework Plugins

1. **React Plugin** - Hooks integration
2. **Vue Plugin** - Composition API integration  
3. **Svelte Plugin** - Store integration
4. **Solid Plugin** - Signal integration

### Plugin Chain Execution

Plugins execute in registration order with proper cleanup:

```javascript
const primitive = createDrawer()
  .use(gesturePlugin())      // Plugin 1
  .use(animationPlugin())    // Plugin 2  
  .use(a11yPlugin());        // Plugin 3

// On destroy: cleanup in reverse order (Plugin 3, 2, 1)
```

## Framework Adapter Specification

### Adapter Interface

Framework adapters must implement this interface:

```javascript
interface FrameworkAdapter {
  // Required: Setup function for quick integration
  setup<T>(primitive: T, config: SetupConfig): T;
  
  // Optional: Framework-specific utilities
  createStore?(primitive: UIPrimitive): Store;
  createHook?(primitive: UIPrimitive): Hook; 
  createComposable?(primitive: UIPrimitive): Composable;
  createComponent?(primitive: UIPrimitive): Component;
  
  // Optional: DOM integration helpers
  mount?(primitive: UIPrimitive, target: Element): Cleanup;
  bindTrigger?(primitive: UIPrimitive, element: Element): Cleanup;
  bindContent?(primitive: UIPrimitive, element: Element): Cleanup;
  
  // Optional: Lifecycle integration
  onMount?(primitive: UIPrimitive, callback: Function): void;
  onUnmount?(primitive: UIPrimitive, callback: Function): void;
}

interface SetupConfig {
  trigger?: Element | string;    // Trigger element or selector
  content?: Element | string;    // Content element or selector
  options?: Record<string, any>; // Primitive options
  plugins?: Plugin[];            // Plugins to apply
}
```

### Adapter Requirements

1. **Re-export Core** - Must re-export all core primitives
2. **Setup Functions** - Must provide `setup<PrimitiveType>()` functions
3. **Cleanup** - Must handle proper resource cleanup
4. **Type Safety** - Must provide TypeScript definitions
5. **Bundle Size** - Must be ≤1KB gzipped per adapter

### Standard Adapter Patterns

#### Vanilla JavaScript
```javascript
// Simple imperative API
const drawer = setupDrawer({
  trigger: '#open-btn',
  content: '#drawer-panel',
  plugins: [gesturePlugin(), animatePlugin()]
});
```

#### React
```javascript
// Hooks-based integration
const [drawer, { open, close, toggle }] = useDrawer({
  plugins: [gesturePlugin()]
});
```

#### Svelte  
```javascript
// Store-based integration
const drawer = createDrawerStore({
  plugins: [gesturePlugin()]
});
```

#### Vue
```javascript
// Composables integration
const { drawer, open, close } = useDrawer({
  plugins: [gesturePlugin()]
});
```

## Animation and Transitions

### Transition State Management

Animations are first-class citizens in the protocol:

```javascript
// Automatic transition state tracking
primitive.set('value', newValue);

// Protocol automatically sets:
primitive.state.transition = {
  from: oldValue,
  to: newValue,
  progress: 0,
  startTime: performance.now(),
  duration: 300,
  easing: 'ease-out'
};

// Progress updates via requestAnimationFrame
primitive.emit('transitionProgress', { progress: 0.5 });

// Completion
primitive.emit('transitionComplete', { value: newValue });
```

### Physics Integration

Optional physics simulation for natural motion:

```javascript
const drawer = createDrawer()
  .use(physicsPlugin({
    spring: { tension: 300, friction: 40 },
    momentum: true,
    boundaries: { min: 0, max: 320 }
  }));
```

## Developer Experience Features

### Type Safety

Full TypeScript support with intelligent inference:

```javascript
// Types are automatically inferred
const drawer = createDrawer({ position: 'left' });
drawer.set('value.isOpen', true);      // ✓ Valid
drawer.set('value.invalidProp', true); // ✗ TypeScript error
```

### Development Tools

Protocol includes development enhancements:

1. **State Inspector** - Real-time state visualization
2. **Time Travel** - Undo/redo state changes
3. **Performance Profiler** - Interaction and animation metrics  
4. **Accessibility Auditor** - A11y compliance checking

### Error Handling

Helpful error messages with suggestions:

```javascript
// Instead of: "Invalid configuration"
// Provide: "Drawer position 'leftt' is invalid. Did you mean 'left'? 
//          Valid options: 'left', 'right', 'top', 'bottom'"
```

## Performance Specifications

### Bundle Size Targets

- **Core**: ≤3KB gzipped (protocol + 5 primitives)
- **Plugins**: ≤2KB gzipped each
- **Adapters**: ≤1KB gzipped each
- **Total Setup**: ≤8KB gzipped (full-featured)

### Runtime Performance

- **State Updates**: ≤1ms per update
- **Event Emission**: ≤0.1ms per event
- **Plugin Execution**: ≤2ms total per interaction
- **Memory Usage**: ≤100KB per primitive instance

### Animation Performance

- **60 FPS**: All animations must maintain 60fps on modern devices
- **GPU Acceleration**: Use CSS transforms when possible
- **RequestAnimationFrame**: All custom animations use RAF
- **Reduced Motion**: Respect `prefers-reduced-motion`

## Testing Requirements

### Unit Tests

- State transition correctness
- Event emission order and data
- Plugin compatibility matrix
- Error handling and edge cases

### Integration Tests  

- Plugin interactions and conflicts
- Framework adapter functionality
- Cross-primitive communication
- Performance benchmarks

### E2E Tests

- Real user interaction scenarios
- Accessibility compliance (WCAG 2.1 AA)
- Cross-browser compatibility
- Mobile device testing

## Versioning Strategy

### Pre-1.0 (v0.x)

- **Breaking changes allowed** in minor versions
- **Additive changes** preferred when possible
- **Deprecation warnings** before removal
- **Clear upgrade paths** documented

### Post-1.0 (v1.x+)

- **Semantic versioning** strictly followed
- **Breaking changes** only in major versions  
- **LTS support** for stable branches
- **Migration tools** for major upgrades

## Future Protocol Extensions

### Planned Enhancements

1. **Composition Primitives** - Complex UIs from simple primitives
2. **AI Enhancements** - Smart defaults and behavior prediction
3. **Collaboration** - Real-time multi-user state synchronization
4. **Accessibility++** - Advanced a11y features and auditing
5. **Performance Monitoring** - Built-in performance metrics

### Extensibility Points

The protocol is designed for future enhancement without breaking changes:

- Plugin API allows unlimited behavior extension
- State structure supports additional optional properties
- Event system supports custom event types
- Adapter pattern enables new framework support

---

## Implementation Checklist

For a primitive or plugin to be protocol-compliant:

- [ ] Implements UIState interface
- [ ] Emits all required events
- [ ] Provides TypeScript definitions
- [ ] Includes comprehensive tests
- [ ] Meets performance targets
- [ ] Follows naming conventions
- [ ] Includes proper cleanup
- [ ] Supports SSR/hydration
- [ ] Respects accessibility standards
- [ ] Maintains framework agnosticism

## Resources

- **Implementation Guide**: See `ARCHITECTURE.md` for detailed implementation patterns
- **Examples**: See `examples/` for reference implementations
- **Contributing**: See `CONTRIBUTING.md` for development guidelines
- **API Reference**: See individual package documentation for complete APIs