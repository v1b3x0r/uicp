<script>
  import DrawerDemo from '$lib/DrawerDemo.svelte';
  import DrawerRunesDemo from '$lib/DrawerRunesDemo.svelte';
  
  let selectedDemo = $state('hybrid');
</script>

<div class="app">
  <header>
    <h1>UIKit Svelte 5 Demo</h1>
    <p>Cross-framework UI components with lean architecture</p>
  </header>

  <!-- Demo selector -->
  <nav class="demo-nav">
    <button 
      class="nav-btn" 
      class:active={selectedDemo === 'hybrid'}
      onclick={() => selectedDemo = 'hybrid'}
    >
      Hybrid (Stores + Runes)
    </button>
    <button 
      class="nav-btn" 
      class:active={selectedDemo === 'runes'}
      onclick={() => selectedDemo = 'runes'}
    >
      Pure Runes
    </button>
  </nav>

  <!-- Demo content -->
  <main>
    {#if selectedDemo === 'hybrid'}
      <DrawerDemo />
    {:else if selectedDemo === 'runes'}
      <DrawerRunesDemo />
    {/if}
  </main>

  <footer>
    <p>Built with UIKit core (~3KB) + Svelte 5 adapters</p>
  </footer>
</div>

<style>
  .app {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  header {
    text-align: center;
    padding: 2rem 1rem;
    color: white;
  }
  
  header h1 {
    font-size: 2.5rem;
    margin: 0 0 0.5rem 0;
    font-weight: 700;
  }
  
  header p {
    opacity: 0.9;
    font-size: 1.125rem;
  }
  
  .demo-nav {
    display: flex;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }
  
  .nav-btn {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    backdrop-filter: blur(5px);
  }
  
  .nav-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
  
  .nav-btn.active {
    background: white;
    color: #667eea;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  main {
    background: white;
    min-height: calc(100vh - 200px);
    margin: 0 1rem;
    border-radius: 1rem 1rem 0 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  }
  
  footer {
    text-align: center;
    padding: 1rem;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
  }
  
  @media (max-width: 768px) {
    .demo-nav {
      flex-direction: column;
      align-items: center;
    }
    
    main {
      margin: 0;
      border-radius: 0;
    }
    
    header h1 {
      font-size: 2rem;
    }
  }
</style>
