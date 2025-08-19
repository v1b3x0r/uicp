<script>
  import { createDrawerStore, drawerTrigger, drawerContent } from '@uip/adapter-svelte';
  
  const drawer = createDrawerStore();
</script>

<!-- Add Tailwind CDN to head -->
<svelte:head>
  <script src="https://cdn.tailwindcss.com"></script>
</svelte:head>

<div class="p-8 max-w-4xl mx-auto">
  <h2 class="text-2xl font-bold mb-4">Drawer Demo</h2>
  
  <div class="flex gap-2 mb-4">
    <button use:drawerTrigger={drawer} class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition">
      Open Drawer
    </button>
    <button onclick={() => drawer.toggle()} class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition">
      Toggle
    </button>
  </div>
  
  <div class="bg-gray-100 p-3 rounded text-sm">
    Status: <span class="font-semibold {$drawer.isOpen ? 'text-green-600' : 'text-red-600'}">
      {$drawer.isOpen ? 'Open' : 'Closed'}
    </span>
  </div>
</div>

<!-- Drawer -->
<div 
  use:drawerContent={drawer}
  class="fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 z-50
         {$drawer.isOpen ? 'translate-x-0' : '-translate-x-full'}"
>
  <div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold">Drawer Content</h3>
      <button onclick={() => drawer.close()} class="text-2xl hover:text-gray-600">✕</button>
    </div>
    
    <p class="text-gray-600 mb-4">
      A simple drawer with Tailwind styling. Includes:
    </p>
    
    <ul class="space-y-2 text-sm text-gray-600">
      <li>✅ Touch/drag support</li>
      <li>✅ ESC to close</li>
      <li>✅ Focus trap</li>
      <li>✅ Body scroll lock</li>
      <li>✅ ARIA attributes</li>
    </ul>
  </div>
</div>

<!-- Backdrop -->
{#if $drawer.isOpen}
  <div 
    onclick={() => drawer.close()} 
    class="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
  ></div>
{/if}