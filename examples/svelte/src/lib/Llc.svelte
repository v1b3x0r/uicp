<script>
  import { createDrawer } from "@uip/core";
  import { drawerTrigger, drawerContent } from "@uip/adapter-svelte";

  const drawer = createDrawer();
  let isOpen = $state(drawer.getState().isOpen);
  
  drawer.onChange(({ isOpen: open }) => {
    isOpen = open;
  });
</script>

<!-- Add Tailwind CDN -->
<svelte:head>
  <script src="https://cdn.tailwindcss.com"></script>
</svelte:head>

<button use:drawerTrigger={drawer} class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  Open
</button>

<div 
  use:drawerContent={drawer}
  class="fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 z-50
         {isOpen ? 'translate-x-0' : '-translate-x-full'}"
>
  <div class="p-4">
    <button onclick={() => drawer.close()} class="text-2xl hover:text-gray-600 float-right">✕</button>
    <h3 class="text-lg font-semibold mb-2">Drawer Content</h3>
    <p class="text-gray-600">Clean and simple with Tailwind!</p>
  </div>
</div>

{#if isOpen}
  <div onclick={() => drawer.close()} class="fixed inset-0 bg-black/50 z-40"></div>
{/if}