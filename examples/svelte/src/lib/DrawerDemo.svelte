<script>
  import { drawerStore, drawerContent, drawerDrag } from '@uikit/svelte';
  
  const leftDrawer = drawerStore();
  const rightDrawer = drawerStore();
</script>

<div class="demo-section">
  <h2>Basic Drawers</h2>
  <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
    <button class="btn" on:click={leftDrawer.open}>
      Open Left Drawer
    </button>
    <button class="btn" on:click={rightDrawer.open}>
      Open Right Drawer
    </button>
  </div>
</div>

<div class="demo-section">
  <h2>Features</h2>
  <ul>
    <li>✅ Svelte stores integration</li>
    <li>✅ Action directives</li>
    <li>✅ Keyboard navigation (Tab, Shift+Tab, ESC)</li>
    <li>✅ Focus trap when open</li>
    <li>✅ Body scroll lock</li>
    <li>✅ Touch/mouse drag support</li>
    <li>✅ ARIA attributes</li>
    <li>✅ Smooth animations</li>
    <li>✅ Reactive state updates</li>
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
    <button 
      class="drawer-close" 
      on:click={leftDrawer.close}
      aria-label="Close drawer"
    >
      ×
    </button>
  </div>
  <div class="drawer-body">
    <p>This is a Svelte drawer component with gesture support!</p>
    <p>Try dragging it to close.</p>
    <br />
    <button class="btn btn--secondary">Focusable Button 1</button>
    <button class="btn btn--secondary">Focusable Button 2</button>
    <br /><br />
    <input 
      type="text" 
      placeholder="Test input" 
      style="padding: 0.5rem; width: 100%; border: 1px solid #d1d5db; border-radius: 0.25rem;" 
    />
  </div>
</div>

{#if $leftDrawer.isOpen}
  <div 
    class="drawer-overlay" 
    role="button" 
    tabindex="0"
    on:click={leftDrawer.close}
    on:keydown={(e) => e.key === 'Enter' && leftDrawer.close()}
  ></div>
{/if}

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
    <button 
      class="drawer-close" 
      on:click={rightDrawer.close}
      aria-label="Close drawer"
    >
      ×
    </button>
  </div>
  <div class="drawer-body">
    <p>This is a right-side drawer.</p>
    <p>It also supports all the same features!</p>
    <br />
    <div>
      <p><strong>Current state:</strong> {$rightDrawer.isOpen ? 'Open' : 'Closed'}</p>
      <p><strong>Reactive updates:</strong> This text changes automatically!</p>
    </div>
  </div>
</div>

{#if $rightDrawer.isOpen}
  <div 
    class="drawer-overlay" 
    role="button" 
    tabindex="0"
    on:click={rightDrawer.close}
    on:keydown={(e) => e.key === 'Enter' && rightDrawer.close()}
  ></div>
{/if}