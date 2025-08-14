<script>
  import { drawerStore, createDrawerReactive, drawerContent, drawerDrag } from '@uip/adapter-svelte';
  import { createGesturePlugin } from '@uip/plugin-gesture';
  import CodePreview from './CodePreview.svelte';
  
  // Lean demo switcher
  let useRunes = $state(true);
  
  // Create gesture plugin
  const gesturePlugin = createGesturePlugin({ axis: 'x', threshold: 0.3 });
  
  // Store pattern
  const storeDrawer = drawerStore({}, [gesturePlugin]);
  
  // Runes pattern - wrap with $state
  const reactiveDrawer = createDrawerReactive({}, [gesturePlugin]);
  let runesState = $state(reactiveDrawer.getState().isOpen);
  
  // Sync runes state
  reactiveDrawer.onChange(({ isOpen }) => {
    runesState = isOpen;
  });
  
  // Create runes drawer object
  const runesDrawer = {
    ...reactiveDrawer,
    get isOpen() { return runesState; }
  };
  
  // Reactive selection
  const activeDrawer = $derived(useRunes ? runesDrawer : storeDrawer);
  const isOpen = $derived(useRunes ? runesDrawer.isOpen : $storeDrawer.isOpen);
</script>

<div class="demo-container">
  <h2>UIKit Drawer - Hybrid Demo</h2>
  
  <!-- Mode Toggle -->
  <div class="mode-toggle">
    <label>
      <input type="checkbox" bind:checked={useRunes} />
      Use Svelte 5 Runes
    </label>
    <span class="mode-status">
      Mode: <strong>{useRunes ? 'Runes (Universal)' : 'Stores (Component)'}</strong>
    </span>
  </div>
  
  <!-- Controls -->
  <div class="controls">
    <button class="btn" onclick={activeDrawer.open}>Open Drawer</button>
    <button class="btn" onclick={activeDrawer.toggle}>Toggle</button>
  </div>
  
  <!-- State Display -->
  <div class="state-info">
    <p>Drawer Status: <span class="status" class:open={isOpen}>{isOpen ? 'Open' : 'Closed'}</span></p>
    <p>Reactivity: <span class="tech">{useRunes ? 'Universal (works everywhere)' : 'Component-scoped'}</span></p>
  </div>
  
  <!-- Code Examples -->
  <div class="code-section">
    <h3>Implementation</h3>
    
    {#if useRunes}
      <CodePreview 
        title="Svelte 5 Runes Pattern"
        code={`import { createDrawerReactive, drawerContent } from '@uip/adapter-svelte';
import { createGesturePlugin } from '@uip/plugin-gesture';

// Create gesture plugin
const gesturePlugin = createGesturePlugin({ axis: 'x', threshold: 0.3 });

// Runes pattern - wrap with $state
const reactive = createDrawerReactive({}, [gesturePlugin]);
let isOpen = $state(reactive.getState().isOpen);

// Sync state
reactive.onChange(({ isOpen: newIsOpen }) => {
  isOpen = newIsOpen;
});

// Create drawer object
const drawer = {
  ...reactive,
  get isOpen() { return isOpen; }
};`}
      />
    {:else}
      <CodePreview 
        title="Svelte Store Pattern"
        code={`import { drawerStore, drawerContent } from '@uip/adapter-svelte';
import { createGesturePlugin } from '@uip/plugin-gesture';

// Create gesture plugin
const gesturePlugin = createGesturePlugin({ axis: 'x', threshold: 0.3 });

// Classic store pattern with plugins
const drawer = drawerStore({}, [gesturePlugin]);

// Use in template
$: isOpen = $drawer.isOpen;`}
      />
    {/if}
    
    <CodePreview 
      title="HTML Template"
      language="html"
      code={`<!-- Drawer Element -->
<div 
  use:drawerContent={{ drawer }}
  use:drawerDrag={{ drawer, axis: 'x', threshold: 0.3 }}
  class="drawer"
  class:drawer-open={isOpen}
>
  <div class="drawer-header">
    <h3>My Drawer</h3>
    <button onclick={drawer.close}>×</button>
  </div>
  <div class="drawer-body">
    <p>Content here!</p>
  </div>
</div>

<!-- Overlay -->
{#if isOpen}
  <div class="overlay" onclick={drawer.close}></div>
{/if}`}
    />
  </div>
</div>

<!-- Drawer Element -->
<div 
  use:drawerContent={{ drawer: activeDrawer }}
  class="drawer"
  class:drawer-open={isOpen}
  aria-hidden={!isOpen}
>
  <div class="drawer-header">
    <h3>Demo Drawer ({useRunes ? 'Runes' : 'Store'})</h3>
    <button class="drawer-close" onclick={activeDrawer.close}>×</button>
  </div>
  <div class="drawer-body">
    <p>This is a lean {useRunes ? 'runes-based' : 'store-based'} drawer!</p>
    <p><strong>Features:</strong></p>
    <ul>
      <li>✅ Drag to close</li>
      <li>✅ ESC key support</li>
      <li>✅ Focus trap</li>
      <li>✅ Body scroll lock</li>
      <li>✅ ARIA accessible</li>
    </ul>
    <button class="btn-secondary" onclick={() => useRunes = !useRunes}>
      Switch to {useRunes ? 'Stores' : 'Runes'}
    </button>
  </div>
</div>

<!-- Overlay -->
{#if isOpen}
  <div 
    class="drawer-overlay show" 
    onclick={activeDrawer.close}
    onkeydown={(e) => e.key === 'Escape' && activeDrawer.close()}
    role="button"
    tabindex="0"
    aria-label="Close drawer"
  ></div>
{/if}

<style>
  .demo-container {
    padding: var(--space-8);
    max-width: 800px;
    margin: 0 auto;
  }
  
  .demo-container h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-1);
    margin-bottom: var(--space-6);
    text-align: center;
  }
  
  .mode-toggle {
    padding: var(--space-5);
    background: var(--surface-2);
    border-radius: var(--radius-3);
    margin-bottom: var(--space-6);
    border: 1px solid var(--border);
  }
  
  .mode-toggle label {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: 500;
    color: var(--text-1);
    cursor: pointer;
  }
  
  .mode-toggle input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--accent);
  }
  
  .mode-status {
    display: block;
    margin-top: var(--space-3);
    font-size: 0.875rem;
    color: var(--text-3);
  }
  
  .controls {
    display: flex;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
  }
  
  .btn {
    background: var(--accent);
    color: var(--accent-text);
    border: none;
    padding: var(--space-3) var(--space-5);
    border-radius: var(--radius-2);
    cursor: pointer;
    font-weight: 500;
    font-size: 14px;
    transition: all var(--duration-normal) var(--ease-out);
    box-shadow: 0 1px 2px var(--shadow-1);
  }
  
  .btn:hover { 
    background: var(--accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px var(--shadow-2);
  }
  
  .btn-secondary {
    background: var(--surface-3);
    color: var(--text-1);
    border: 1px solid var(--border);
    padding: var(--space-2) var(--space-4);
    border-radius: var(--radius-2);
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    margin-top: var(--space-4);
    transition: all var(--duration-normal) var(--ease-out);
  }
  
  .btn-secondary:hover { 
    background: var(--surface-4);
    border-color: var(--border-2);
  }
  
  .state-info {
    background: var(--surface-2);
    padding: var(--space-5);
    border-radius: var(--radius-3);
    font-family: var(--font-mono);
    font-size: 0.875rem;
    border: 1px solid var(--border);
  }
  
  .state-info p {
    margin-bottom: var(--space-2);
  }
  
  .state-info p:last-child {
    margin-bottom: 0;
  }
  
  .status {
    font-weight: 600;
    color: var(--danger);
  }
  
  .status.open { 
    color: var(--success);
  }
  
  .tech { 
    color: var(--accent);
    font-weight: 500;
  }
  
  .code-section {
    margin-top: var(--space-8);
    padding-top: var(--space-6);
    border-top: 1px solid var(--border);
  }
  
  .code-section h3 {
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text-1);
    margin-bottom: var(--space-4);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  
  .code-section h3:before {
    content: '⚡';
    font-size: 1.25rem;
  }
  
  /* Modern Drawer Styles */
  .drawer {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: min(380px, calc(100vw - 2rem));
    background: var(--surface-1);
    box-shadow: 
      0 25px 50px -12px var(--shadow-4),
      0 0 0 1px var(--border);
    transform: translateX(-100%);
    transition: transform var(--duration-slow) var(--spring);
    z-index: 1000;
    backdrop-filter: blur(12px);
    border-radius: 0 var(--radius-4) var(--radius-4) 0;
  }
  
  .drawer-open { 
    transform: translateX(0);
    transition: transform var(--duration-slow) var(--spring);
  }
  
  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-5) var(--space-6);
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
  }
  
  .drawer-header h3 {
    color: var(--text-1);
    font-weight: 600;
    font-size: 1.125rem;
    margin: 0;
  }
  
  .drawer-close {
    background: var(--surface-3);
    border: 1px solid var(--border);
    border-radius: var(--radius-2);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    cursor: pointer;
    color: var(--text-2);
    transition: all var(--duration-normal) var(--ease-out);
  }
  
  .drawer-close:hover {
    background: var(--surface-4);
    color: var(--text-1);
    transform: scale(1.05);
  }
  
  .drawer-body { 
    padding: var(--space-6); 
    line-height: 1.6;
    color: var(--text-1);
  }
  
  .drawer-body p {
    margin-bottom: var(--space-4);
  }
  
  .drawer-body ul {
    margin: var(--space-4) 0;
    padding-left: var(--space-5);
  }
  
  .drawer-body li {
    margin-bottom: var(--space-2);
    color: var(--text-2);
  }
  
  .drawer-overlay {
    position: fixed;
    inset: 0;
    background: var(--shadow-4);
    backdrop-filter: blur(4px);
    z-index: 999;
    opacity: 0;
    transition: opacity var(--duration-slow) var(--ease-out);
  }
  
  .drawer-overlay.show {
    opacity: 1;
  }
  
  /* Mobile optimizations */
  @media (max-width: 768px) {
    .drawer {
      width: calc(100vw - var(--space-4));
      max-width: none;
    }
    
    .demo-container {
      padding: var(--space-6);
    }
    
    .controls {
      gap: var(--space-2);
    }
    
    .btn {
      flex: 1;
      text-align: center;
      min-height: 44px;
    }
  }
  
  /* Touch improvements */
  @media (pointer: coarse) {
    .drawer-close {
      min-width: 44px;
      min-height: 44px;
    }
    
    .btn {
      min-height: 44px;
      padding: var(--space-4) var(--space-5);
    }
    
  }
</style>