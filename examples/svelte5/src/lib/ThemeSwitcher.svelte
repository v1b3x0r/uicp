<script>
  import { onMount } from 'svelte';
  import { themeStore } from './theme.js';
  
  let currentTheme = $state(themeStore.theme);
  
  onMount(() => {
    // Subscribe to theme changes
    const unsubscribe = themeStore.subscribe(({ theme }) => {
      currentTheme = theme;
    });
    
    return unsubscribe;
  });
  
  const themes = [
    { value: 'light', icon: '☀️', label: 'Light' },
    { value: 'dark', icon: '🌙', label: 'Dark' },
    { value: 'system', icon: '💻', label: 'System' }
  ];
</script>

<div class="theme-switcher">
  {#each themes as { value, icon, label }}
    <button
      class="theme-btn"
      class:active={currentTheme === value}
      onclick={() => themeStore.setTheme(value)}
      title={label}
    >
      <span class="theme-icon">{icon}</span>
      <span class="theme-label">{label}</span>
    </button>
  {/each}
</div>

<style>
  .theme-switcher {
    display: flex;
    background: var(--surface-2);
    border-radius: 12px;
    padding: 4px;
    gap: 2px;
    box-shadow: 0 1px 3px var(--shadow-1);
    border: 1px solid var(--border);
  }
  
  .theme-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--text-2);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 70px;
    justify-content: center;
  }
  
  .theme-btn:hover {
    background: var(--surface-3);
    color: var(--text-1);
  }
  
  .theme-btn.active {
    background: var(--accent);
    color: var(--accent-text);
    box-shadow: 0 1px 2px var(--shadow-2);
  }
  
  .theme-icon {
    font-size: 14px;
  }
  
  .theme-label {
    font-size: 12px;
  }
  
  @media (max-width: 640px) {
    .theme-label {
      display: none;
    }
    
    .theme-btn {
      min-width: 40px;
    }
  }
</style>