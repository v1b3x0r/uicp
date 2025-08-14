<script>
  let { code, title = 'Code Example', language = 'javascript' } = $props();
  
  let copied = $state(false);
  
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => copied = false, 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  }
</script>

<div class="code-preview">
  <div class="code-header">
    <div class="code-title">
      <span class="code-icon">📝</span>
      {title}
    </div>
    <button class="copy-btn" onclick={copyCode} title="Copy code">
      {#if copied}
        <span class="copy-icon">✓</span>
        Copied!
      {:else}
        <span class="copy-icon">📋</span>
        Copy
      {/if}
    </button>
  </div>
  
  <div class="code-content">
    <pre><code>{code}</code></pre>
  </div>
</div>

<style>
  .code-preview {
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: var(--radius-3);
    overflow: hidden;
    margin: var(--space-4) 0;
    box-shadow: 0 1px 3px var(--shadow-1);
  }
  
  .code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) var(--space-4);
    background: var(--surface-2);
    border-bottom: 1px solid var(--border);
  }
  
  .code-title {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-1);
  }
  
  .code-icon {
    font-size: 1rem;
  }
  
  .copy-btn {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-3);
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius-1);
    color: var(--text-2);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--duration-normal) var(--ease-out);
  }
  
  .copy-btn:hover {
    background: var(--surface-3);
    border-color: var(--border-2);
    color: var(--text-1);
  }
  
  .copy-icon {
    font-size: 0.875rem;
  }
  
  .code-content {
    padding: var(--space-4);
    background: var(--surface-1);
    overflow-x: auto;
  }
  
  .code-content pre {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--text-1);
  }
  
  .code-content code {
    background: transparent;
    padding: 0;
    border-radius: 0;
    font-size: inherit;
  }
  
  /* Dark theme adjustments */
  :global([data-theme="dark"]) .code-preview {
    background: var(--surface-2);
  }
  
  :global([data-theme="dark"]) .code-content {
    background: var(--surface-1);
  }
  
  /* Scrollbar for code */
  .code-content::-webkit-scrollbar {
    height: 6px;
  }
  
  .code-content::-webkit-scrollbar-track {
    background: var(--surface-3);
  }
  
  .code-content::-webkit-scrollbar-thumb {
    background: var(--border-2);
    border-radius: var(--radius-full);
  }
</style>