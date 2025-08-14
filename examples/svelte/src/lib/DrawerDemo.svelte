<script>
  import { drawerStore, drawerContent, drawerDrag } from '@uikit/svelte';
  
  const leftDrawer = drawerStore();
  const rightDrawer = drawerStore();
</script>

<div class="demo-section">
  <h2>Svelte Drawer Demo - Modern Lean Version</h2>
  <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
    <button class="btn" on:click={leftDrawer.open}>Open Left</button>
    <button class="btn" on:click={rightDrawer.open}>Open Right</button>
  </div>
</div>

<div class="demo-section">
  <h2>Features</h2>
  <ul>
    <li>✅ Svelte 5+ stores & actions</li>
    <li>✅ Reactive state with modern patterns</li>
    <li>✅ Touch/drag with velocity detection</li>
    <li>✅ Focus trap & keyboard nav</li>
    <li>✅ ARIA accessibility</li>
    <li>✅ Body scroll lock</li>
  </ul>
</div>

<!-- Left Drawer -->
<div 
  use:drawerContent={{ drawer: leftDrawer }}
  use:drawerDrag={{ drawer: leftDrawer, axis: 'x', threshold: 0.3 }}
  class="drawer drawer--left"
  class:drawer--open={$leftDrawer.isOpen}
  aria-hidden={!$leftDrawer.isOpen}
>
  <div class="drawer-header">
    <h2>Left Drawer</h2>
    <button class="drawer-close" on:click={leftDrawer.close} aria-label="Close">×</button>
  </div>
  <div class="drawer-body">
    <p>Modern lean Svelte drawer!</p>
    <p>Drag to close or use ESC key.</p>
    <div style="display: flex; gap: 0.5rem; margin: 1rem 0;">
      <button class="btn btn--secondary">Button 1</button>
      <button class="btn btn--secondary">Button 2</button>
    </div>
    <input 
      type="text" 
      placeholder="Test focus trap"
      style="padding: 0.5rem; width: 100%; border: 1px solid #ddd; border-radius: 0.25rem;"
    />
  </div>
</div>

<!-- Right Drawer -->
<div 
  use:drawerContent={{ drawer: rightDrawer }}
  use:drawerDrag={{ drawer: rightDrawer, axis: 'x', threshold: 0.3 }}
  class="drawer drawer--right"
  class:drawer--open={$rightDrawer.isOpen}
  aria-hidden={!$rightDrawer.isOpen}
>
  <div class="drawer-header">
    <h2>Right Drawer</h2>
    <button class="drawer-close" on:click={rightDrawer.close} aria-label="Close">×</button>
  </div>
  <div class="drawer-body">
    <p>Right-side drawer with modern Svelte patterns.</p>
    <p><strong>State:</strong> {$rightDrawer.isOpen ? 'Open' : 'Closed'}</p>
    <button class="btn" on:click={rightDrawer.toggle}>Toggle</button>
  </div>
</div>

<!-- Overlays -->
{#if $leftDrawer.isOpen}
  <div class="drawer-overlay" on:click={leftDrawer.close} role="button" tabindex="-1"></div>
{/if}

{#if $rightDrawer.isOpen}
  <div class="drawer-overlay" on:click={rightDrawer.close} role="button" tabindex="-1"></div>
{/if}