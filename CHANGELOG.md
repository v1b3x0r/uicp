# Changelog

All notable changes to Universal UI Protocol will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Animation plugin with spring physics (in development)
- React adapter with hooks integration (in development)
- Comprehensive TypeScript definitions (in development)

## [0.3.0] - 2025-08-19

### 🎉 Major Release: Protocol v0.x Architecture

#### Added
- **UIPrimitive Base Class**: Universal base class implementing Protocol v0.x specification
- **Reactive State System**: Automatic computed property updates and change detection
- **Unified Event System**: Consistent event patterns across all primitives
- **Universal Plugin API**: Enhanced plugin system with capability detection
- **Protocol Documentation**: Complete specification in PROTOCOL.md

#### Changed
- **BREAKING**: All 5 primitives refactored to use UIPrimitive base class
- **BREAKING**: Event names standardized (openStart, openEnd, closeStart, closeEnd, valueChange)
- **BREAKING**: State structure now follows { value, status, computed, meta } pattern
- Core bundle size optimized: 44.92 KB → 48.97 KB (acceptable increase for major architecture upgrade)

#### Core Primitives Enhanced
- **Drawer**: Added computed CSS transforms and positioning
- **Modal**: Added portal rendering and backdrop handling improvements
- **Tooltip**: Added delay management and interactive tooltip support
- **Popover**: Enhanced click-outside detection and positioning
- **Menu**: Improved keyboard navigation and menu item management

#### Developer Experience
- Updated all documentation to reflect Protocol v0.x
- Added comprehensive examples in vanilla JS
- Improved error messages and warnings
- Enhanced build system with better tree-shaking

#### Technical
- Implemented reactive state proxy system
- Added event batching for performance
- Improved memory management with automatic cleanup
- Enhanced plugin composition patterns

### Fixed
- Vanilla adapter `setupDrawer` function missing
- Inconsistent API patterns across primitives
- Memory leaks in event listener cleanup
- State synchronization issues

### Removed
- Old event system utilities (replaced with unified system)
- Deprecated drawer utilities and legacy code

## [0.2.0] - 2025-08-15

### Added
- Core primitive implementations: Drawer, Modal, Tooltip, Popover, Menu
- Basic plugin system foundation
- Vanilla JS adapter (@uip/adapter-vanilla)
- Svelte adapter (@uip/adapter-svelte)
- Initial plugin implementations:
  - @uip/plugin-gesture - Touch/mouse gesture handling
  - @uip/plugin-direction - RTL/LTR support  
  - @uip/plugin-snap - Dynamic sizing with snap points
- Comprehensive documentation suite
- Working examples for vanilla JS and Svelte

### Technical
- Monorepo structure with NPM workspaces
- Build system with TypeScript and bundling
- Basic test coverage for core functionality
- Accessibility features: focus management, ARIA attributes, keyboard navigation

## [0.1.0] - 2025-08-10

### Added
- Initial project setup
- Basic drawer primitive implementation
- Core utilities: focus-trap, scroll-lock, event handlers
- Development environment and build tooling

---

## Release Strategy

### Version Numbering
- **0.x.x**: Pre-release development versions
- **1.0.0**: First stable release with API guarantees
- **Major.Minor.Patch**: Standard semantic versioning after 1.0.0

### Release Schedule
- **v0.3.x**: Protocol stabilization and core features (Current)
- **v0.4-0.6**: Framework expansion (React, Vue adapters)
- **v0.7-0.8**: Advanced primitives (Tabs, Slider, Select, DatePicker)
- **v0.9**: Production readiness and polish
- **v1.0**: API freeze and stability guarantees

### Breaking Changes Policy
During 0.x development, breaking changes may occur between minor versions. All breaking changes will be:
- Clearly documented in this changelog
- Explained with migration guides
- Announced in advance when possible
- Minimized to essential improvements only

### Migration Guides
Major version changes will include detailed migration guides in the documentation files.

---

## Upgrade Instructions

### From 0.2.x to 0.3.0

This is a **major breaking change** that introduces the new Protocol v0.x architecture.

#### Changed APIs

**Old (0.2.x)**:
```javascript
const drawer = createDrawer();
drawer.onChange(callback);
drawer.getState(); // Returns { isOpen }
```

**New (0.3.x)**:
```javascript
const drawer = createDrawer();
drawer.on('valueChange', callback);
drawer.get('value.isOpen'); // Access specific state paths
drawer.state; // Access full state object
```

#### Migration Steps

1. **Update Event Listeners**: Replace `onChange` with `on('valueChange')`
2. **Update State Access**: Use `get(path)` or `state` instead of `getState()`
3. **Update Plugin Usage**: Plugins now use new UIPrimitive base class
4. **Test Thoroughly**: New architecture may affect behavior

#### Benefits of Upgrade

- **Better Performance**: Reactive state system with computed properties
- **Enhanced Plugin System**: More powerful and flexible plugin architecture  
- **Improved TypeScript Support**: Better type inference and safety
- **Future-Proof**: Foundation for advanced features in upcoming versions

---

*For more information about releases, see the [Release Notes](https://github.com/universal-ui-protocol/uip/releases) on GitHub.*