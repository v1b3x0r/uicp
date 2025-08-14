<script>
  import { createDrawerReactive, drawerContent, drawerDrag } from '../../../../packages/ui-svelte/dist/index.js';
  
  // Pure runes approach
  const reactive = createDrawerReactive();
  let isOpen = $state(reactive.getState().isOpen);
  let dragCount = $state(0);
  
  // Sync state with core
  reactive.onChange(({ isOpen: newIsOpen }) => {
    const wasOpen = isOpen;
    isOpen = newIsOpen;
    
    // Count drag closes
    if (wasOpen && !newIsOpen) {
      dragCount++;
    }
  });
  
  // Create drawer object with reactive state
  const drawer = {
    ...reactive,
    get isOpen() { return isOpen; }
  };
</script>

<div class="runes-demo">
  <h2>Pure Runes Demo</h2>
  
  <!-- Controls -->
  <div class="controls">
    <button class="btn" onclick={drawer.open}>Open Drawer</button>
    <button class="btn" onclick={drawer.toggle}>Toggle</button>
    <button class="btn-outline" onclick={() => dragCount = 0}>Reset Count</button>
  </div>
  
  <!-- Live state -->
  <div class="state-panel">
    <p>Status: <span class="status" class:open={drawer.isOpen}>{drawer.isOpen ? 'Open' : 'Closed'}</span></p>
    <p>Drag closes: <span class="count">{dragCount}</span></p>
    <p class="note">✨ Universal reactivity - works everywhere!</p>
  </div>
</div>

<!-- Drawer -->
<div 
  use:drawerContent={{ drawer }}
  use:drawerDrag={{ drawer, axis: 'x', threshold: 0.25 }}
  class="drawer"
  class:drawer-open={drawer.isOpen}
  aria-hidden={!drawer.isOpen}
>
  <div class="drawer-header">
    <h3>Pure Runes Drawer</h3>
    <button class="drawer-close" onclick={drawer.close}>×</button>
  </div>
  <div class="drawer-body">
    <p><strong>This drawer uses pure runes!</strong></p>
    <ul>
      <li>✅ Universal reactivity ($state, $effect)</li>
      <li>✅ Works outside .svelte files</li>
      <li>✅ Lean and powerful</li>
      <li>✅ Gesture + focus trap</li>
    </ul>
    <p>Try dragging from the edge to close!</p>
  </div>
</div>

<!-- Overlay -->
{#if drawer.isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="drawer-overlay" onclick={drawer.close}></div>
{/if}

<style>
  .runes-demo {
    padding: 2rem;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .controls {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }
  
  .btn {
    background: #8b5cf6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
  }
  
  .btn:hover { background: #7c3aed; }
  
  .btn-outline {
    background: transparent;
    color: #8b5cf6;
    border: 1px solid #8b5cf6;
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    cursor: pointer;
    font-weight: 500;
  }
  
  .btn-outline:hover { 
    background: #8b5cf6; 
    color: white; 
  }
  
  .state-panel {
    background: #faf5ff;
    border: 1px solid #e9d5ff;
    padding: 1rem;
    border-radius: 0.5rem;
    font-family: 'SF Mono', monospace;
    font-size: 0.875rem;
  }
  
  .status {
    font-weight: 600;
    color: #dc2626;
  }
  
  .status.open { color: #059669; }
  
  .count {
    color: #8b5cf6;
    font-weight: 600;
  }
  
  .note {
    color: #7c3aed;
    font-style: italic;
    margin: 0.5rem 0 0 0;
  }
  
  /* Drawer styles */
  .drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 320px;
    background: white;
    box-shadow: -2px 0 10px rgba(139, 92, 246, 0.15);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 1000;
    border-left: 2px solid #e9d5ff;
  }
  
  .drawer-open { transform: translateX(0); }
  
  .drawer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e9d5ff;
    background: #faf5ff;
  }
  
  .drawer-header h3 {
    color: #7c3aed;
    margin: 0;
  }
  
  .drawer-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #8b5cf6;
    padding: 0.25rem;
  }
  
  .drawer-close:hover { color: #7c3aed; }
  
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
    background: rgba(139, 92, 246, 0.3);
    z-index: 999;
  }
</style>