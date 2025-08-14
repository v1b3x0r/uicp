<script>
  import { onMount } from 'svelte';
  import DrawerDemo from '$lib/DrawerDemo.svelte';
  import DrawerRunesDemo from '$lib/DrawerRunesDemo.svelte';
  import ThemeSwitcher from '$lib/ThemeSwitcher.svelte';
  import { themeStore } from '$lib/theme.js';
  
  let selectedDemo = $state('hybrid');
  
  onMount(() => {
    themeStore.initTheme();
  });
</script>

<div class="app">
  <header class="header">
    <div class="header-content">
      <div class="brand">
        <h1 class="title">UIKit</h1>
        <div class="badge">Svelte 5</div>
      </div>
      
      <div class="header-actions">
        <ThemeSwitcher />
      </div>
    </div>
    
    <div class="hero">
      <h2 class="hero-title">Cross-framework UI primitives</h2>
      <p class="hero-subtitle">
        Lean, accessible components with universal reactivity.
        Works with React, Svelte, Vanilla JS and more.
      </p>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-value">~3KB</div>
          <div class="stat-label">Core gzipped</div>
        </div>
        <div class="stat">
          <div class="stat-value">Zero</div>
          <div class="stat-label">Dependencies</div>
        </div>
        <div class="stat">
          <div class="stat-value">A11y</div>
          <div class="stat-label">Built-in</div>
        </div>
      </div>
    </div>
  </header>

  <!-- Demo selector -->
  <nav class="demo-nav">
    <div class="nav-container">
      <button 
        class="nav-btn" 
        class:active={selectedDemo === 'hybrid'}
        onclick={() => selectedDemo = 'hybrid'}
      >
        <span class="nav-icon">🎭</span>
        <div class="nav-content">
          <div class="nav-title">Hybrid Pattern</div>
          <div class="nav-desc">Stores + Runes</div>
        </div>
      </button>
      
      <button 
        class="nav-btn" 
        class:active={selectedDemo === 'runes'}
        onclick={() => selectedDemo = 'runes'}
      >
        <span class="nav-icon">⚡</span>
        <div class="nav-content">
          <div class="nav-title">Pure Runes</div>
          <div class="nav-desc">Universal reactivity</div>
        </div>
      </button>
    </div>
  </nav>

  <!-- Demo content -->
  <main class="main">
    <div class="demo-container">
      {#if selectedDemo === 'hybrid'}
        <DrawerDemo />
      {:else if selectedDemo === 'runes'}
        <DrawerRunesDemo />
      {/if}
    </div>
  </main>

  <footer class="footer">
    <div class="footer-content">
      <p class="footer-text">
        Built with ❤️ for the web platform. 
        <a href="https://github.com/yourusername/uikit" class="footer-link">View on GitHub</a>
      </p>
    </div>
  </footer>
</div>

<style>
  .app {
    min-height: 100vh;
    background: var(--surface-1);
  }
  
  /* Header */
  .header {
    position: relative;
    background: linear-gradient(135deg, var(--accent) 0%, #8b5cf6 100%);
    color: white;
    overflow: hidden;
  }
  
  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-6) var(--space-4);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .brand {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  
  .title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0;
    letter-spacing: -0.02em;
  }
  
  .badge {
    background: rgba(255, 255, 255, 0.2);
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .hero {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-12) var(--space-4) var(--space-16);
    text-align: center;
  }
  
  .hero-title {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    margin: 0 0 var(--space-4) 0;
    letter-spacing: -0.02em;
  }
  
  .hero-subtitle {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    opacity: 0.9;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto var(--space-8);
  }
  
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--space-6);
    max-width: 400px;
    margin: 0 auto;
  }
  
  .stat {
    text-align: center;
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: var(--space-1);
  }
  
  .stat-label {
    font-size: 0.875rem;
    opacity: 0.8;
  }
  
  /* Navigation */
  .demo-nav {
    background: var(--surface-2);
    border-bottom: 1px solid var(--border);
    padding: var(--space-4);
    position: sticky;
    top: 0;
    z-index: 10;
    backdrop-filter: blur(12px);
  }
  
  .nav-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    gap: var(--space-2);
    justify-content: center;
  }
  
  .nav-btn {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-5);
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius-3);
    cursor: pointer;
    transition: all var(--duration-normal) var(--ease-out);
    color: var(--text-2);
    font-size: 14px;
    min-width: 160px;
  }
  
  .nav-btn:hover {
    background: var(--surface-3);
    border-color: var(--border-2);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--shadow-2);
  }
  
  .nav-btn.active {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-text);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
  }
  
  .nav-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }
  
  .nav-content {
    text-align: left;
  }
  
  .nav-title {
    font-weight: 600;
    line-height: 1.2;
  }
  
  .nav-desc {
    font-size: 0.75rem;
    opacity: 0.7;
    line-height: 1.3;
  }
  
  .nav-btn.active .nav-desc {
    opacity: 0.9;
  }
  
  /* Main Content */
  .main {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-8) var(--space-4);
  }
  
  .demo-container {
    background: var(--surface-1);
    border-radius: var(--radius-4);
    box-shadow: 0 1px 3px var(--shadow-1);
    border: 1px solid var(--border);
    overflow: hidden;
  }
  
  /* Footer */
  .footer {
    background: var(--surface-2);
    border-top: 1px solid var(--border);
    margin-top: var(--space-20);
  }
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-6) var(--space-4);
    text-align: center;
  }
  
  .footer-text {
    color: var(--text-3);
    font-size: 0.875rem;
  }
  
  .footer-link {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
  }
  
  .footer-link:hover {
    text-decoration: underline;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      gap: var(--space-4);
    }
    
    .nav-container {
      flex-direction: column;
      align-items: center;
    }
    
    .nav-btn {
      width: 100%;
      max-width: 280px;
      justify-content: center;
    }
    
    .stats {
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-4);
    }
    
    .main {
      padding: var(--space-6) var(--space-3);
    }
  }
  
  @media (max-width: 480px) {
    .nav-btn {
      padding: var(--space-3) var(--space-4);
      min-width: 140px;
    }
    
    .nav-icon {
      font-size: 1.125rem;
    }
    
    .stats {
      gap: var(--space-3);
    }
    
    .stat-value {
      font-size: 1.25rem;
    }
  }
</style>
