<script>
  import DrawerDemo from "$lib/DrawerDemo.svelte";
</script>

<svelte:head>
  <title>UIP Svelte Demo</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
  <!-- Header -->
  <header class="bg-white shadow-sm border-b">
    <div class="max-w-6xl mx-auto px-4 py-6">
      <h1 class="text-3xl font-bold text-gray-900">Universal UI Protocol</h1>
      <p class="text-gray-600 mt-1">Svelte Adapter Demo</p>
    </div>
  </header>

  <!-- Main Content -->
  <main class="max-w-6xl mx-auto px-4 py-8">
    <div class="bg-white rounded-lg shadow-md">
      <DrawerDemo />
    </div>
    
    <!-- Info Section -->
    <div class="mt-8 grid md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="font-semibold text-lg mb-2">Quick Start</h3>
        <pre class="bg-gray-100 p-3 rounded text-sm overflow-x-auto"><code>npm i @uip/core @uip/adapter-svelte</code></pre>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="font-semibold text-lg mb-2">Features</h3>
        <ul class="text-sm space-y-1 text-gray-600">
          <li>✅ 5 Headless Primitives</li>
          <li>✅ Universal Plugin System</li>
          <li>✅ Full TypeScript Support</li>
          <li>✅ Zero Dependencies</li>
        </ul>
      </div>
    </div>
  </main>
</div>