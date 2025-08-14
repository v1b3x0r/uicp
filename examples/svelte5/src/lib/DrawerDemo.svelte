<script>
  import { drawerStore, createDrawerReactive, drawerContent, drawerDrag } from '../../../../packages/ui-svelte/dist/index.js';
  
  // Lean demo switcher
  let useRunes = $state(true);
  
  // Store pattern
  const storeDrawer = drawerStore();
  
  // Runes pattern - wrap with $state
  const reactiveDrawer = createDrawerReactive();
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
</div>

<!-- Drawer Element -->
<div 
  use:drawerContent={{ drawer: activeDrawer }}
  use:drawerDrag={{ drawer: activeDrawer, axis: 'x', threshold: 0.3 }}
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
    class="drawer-overlay" 
    onclick={activeDrawer.close}
    onkeydown={(e) => e.key === 'Escape' && activeDrawer.close()}
    role="button"
    tabindex="0"
    aria-label="Close drawer"
  ></div>
{/if}

<style>
  .demo-container {
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .mode-toggle {
    padding: 1rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid #e2e8f0;
  }
  
  .mode-status {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #64748b;
  }
  
  .controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
  }
  
  .btn:hover { background: #2563eb; }
  
  .btn-secondary {
    background: #6b7280;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
    margin-top: 1rem;
  }
  
  .btn-secondary:hover { background: #4b5563; }
  
  .state-info {
    background: #f1f5f9;
    padding: 1rem;
    border-radius: 0.375rem;
    font-family: 'SF Mono', monospace;
    font-size: 0.875rem;
  }
  
  .status {
    font-weight: 600;
    color: #dc2626;
  }
  
  .status.open { color: #16a34a; }
  
  .tech { 
    color: #7c3aed;
    font-weight: 500;
  }
  
  /* Drawer Styles */
  .drawer {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 320px;
    background: white;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1000;
  }
  
  .drawer-open { transform: translateX(0); }
  
  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .drawer-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0.25rem;
  }
  
  .drawer-body { 
    padding: 1rem; 
    line-height: 1.6;
  }
  
  .drawer-body ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }
  
  .drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
</style>