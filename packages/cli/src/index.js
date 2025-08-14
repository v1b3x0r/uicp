#!/usr/bin/env node

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Simple CLI for adding drawer component
const [,, command, component, ...args] = process.argv;

if (command !== 'add' || component !== 'drawer') {
  console.log('Usage: uikit add drawer [--react|--svelte]');
  process.exit(1);
}

const isReact = args.includes('--react');
const isSvelte = args.includes('--svelte');
const framework = isReact ? 'react' : isSvelte ? 'svelte' : 'vanilla';

console.log(`Creating ${framework} drawer component...`);

const dir = 'src/components';
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const templates = {
  vanilla: `import { createDrawer, registerDrawerDrag } from '@uikit/core';

export function DrawerDemo() {
  const drawer = createDrawer();
  
  return {
    mount(container) {
      container.innerHTML = \`
        <button id="trigger">Open Drawer</button>
        <div id="drawer" class="drawer">
          <div class="drawer-content">
            <button id="close">Close</button>
            <p>Drawer content here</p>
          </div>
        </div>
      \`;
      
      drawer.registerTrigger(container.querySelector('#trigger'));
      drawer.registerContent(container.querySelector('#drawer'));
      registerDrawerDrag(drawer, container.querySelector('#drawer'));
      
      return drawer;
    }
  };
}`,
  
  react: `import { useDrawer } from '@uikit/react';

export function DrawerDemo() {
  const { drawer, triggerRef, contentRef } = useDrawer();
  
  return (
    <>
      <button ref={triggerRef}>Open Drawer</button>
      <div ref={contentRef} className="drawer" style={{ 
        display: drawer.isOpen ? 'block' : 'none' 
      }}>
        <div className="drawer-content">
          <button onClick={drawer.close}>Close</button>
          <p>Drawer content here</p>
        </div>
      </div>
    </>
  );
}`,

  svelte: `<script>
  import { drawerStore } from '@uikit/svelte';
  
  const drawer = drawerStore();
  let triggerEl, contentEl;
  
  $: if (triggerEl) drawer.registerTrigger(triggerEl);
  $: if (contentEl) drawer.registerContent(contentEl);
</script>

<button bind:this={triggerEl}>Open Drawer</button>
<div bind:this={contentEl} class="drawer" style="display: {$drawer.isOpen ? 'block' : 'none'}">
  <div class="drawer-content">
    <button on:click={drawer.close}>Close</button>
    <p>Drawer content here</p>
  </div>
</div>`
};

const filename = framework === 'svelte' ? 'DrawerDemo.svelte' : `DrawerDemo.${framework === 'react' ? 'jsx' : 'js'}`;
const filepath = join(dir, filename);

writeFileSync(filepath, templates[framework]);
console.log(`✓ Created ${filepath}`);
console.log(`Install: npm i @uikit/core @uikit/${framework === 'vanilla' ? 'vanilla' : framework}`);