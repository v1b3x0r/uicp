#!/usr/bin/env node

import { Command } from 'commander';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import prompts from 'prompts';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const program = new Command();

program
  .name('uikit')
  .description('CLI tool for UIKit components')
  .version('1.0.0');

program
  .command('add <component>')
  .description('Add a UIKit component to your project')
  .option('-f, --framework <framework>', 'Framework to use (vanilla|react|svelte)')
  .option('-s, --skin <skin>', 'Skin to use (vanilla)')
  .option('-p, --path <path>', 'Path to install component', 'src/components')
  .option('--force', 'Force overwrite existing files')
  .action(async (component, options) => {
    if (component !== 'drawer') {
      console.error(chalk.red(`Component "${component}" not available yet. Only "drawer" is currently supported.`));
      process.exit(1);
    }
    
    let framework = options.framework;
    
    if (!framework) {
      const response = await prompts({
        type: 'select',
        name: 'framework',
        message: 'Which framework are you using?',
        choices: [
          { title: 'Vanilla JS', value: 'vanilla' },
          { title: 'React', value: 'react' },
          { title: 'Svelte', value: 'svelte' }
        ]
      });
      framework = response.framework;
    }
    
    if (!['vanilla', 'react', 'svelte'].includes(framework)) {
      console.error(chalk.red(`Invalid framework "${framework}". Use vanilla, react, or svelte.`));
      process.exit(1);
    }
    
    console.log(chalk.blue(`\nAdding ${component} component for ${framework}...`));
    
    const packages = ['@uikit/core'];
    if (framework !== 'vanilla') {
      packages.push(`@uikit/${framework}`);
    } else {
      packages.push('@uikit/vanilla');
    }
    
    if (options.skin === 'vanilla') {
      packages.push('@uikit/skin-vanilla');
    }
    
    console.log(chalk.gray(`Installing packages: ${packages.join(', ')}`));
    
    try {
      const packageManager = detectPackageManager();
      const installCmd = packageManager === 'yarn' 
        ? `yarn add ${packages.join(' ')}`
        : `${packageManager} install ${packages.join(' ')}`;
      
      execSync(installCmd, { stdio: 'inherit' });
    } catch (error) {
      console.warn(chalk.yellow('Could not install packages automatically. Please install manually:'));
      console.log(chalk.gray(`  ${packages.join(' ')}`));
    }
    
    const componentPath = join(process.cwd(), options.path);
    if (!existsSync(componentPath)) {
      mkdirSync(componentPath, { recursive: true });
    }
    
    const templates = getTemplates(component, framework, options.skin);
    
    for (const [filename, content] of Object.entries(templates)) {
      const filePath = join(componentPath, filename);
      
      if (existsSync(filePath) && !options.force) {
        console.warn(chalk.yellow(`File ${filename} already exists. Use --force to overwrite.`));
        continue;
      }
      
      writeFileSync(filePath, content);
      console.log(chalk.green(`✓ Created ${filename}`));
    }
    
    console.log(chalk.green(`\n✨ ${component} component added successfully!`));
    console.log(chalk.gray(`\nImport and use in your code:`));
    
    if (framework === 'react') {
      console.log(chalk.cyan(`  import DrawerDemo from './${options.path}/DrawerDemo';`));
    } else if (framework === 'svelte') {
      console.log(chalk.cyan(`  import DrawerDemo from './${options.path}/DrawerDemo.svelte';`));
    } else {
      console.log(chalk.cyan(`  Check ${options.path}/drawer-demo.html for usage`));
    }
  });

function detectPackageManager() {
  if (existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (existsSync('yarn.lock')) return 'yarn';
  return 'npm';
}

function getTemplates(component, framework, skin) {
  const templates = {};
  
  if (component === 'drawer') {
    if (framework === 'vanilla') {
      templates['drawer-demo.html'] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Drawer Demo</title>
  ${skin === 'vanilla' ? '<link rel="stylesheet" href="./drawer.css">' : ''}
  <style>
    .drawer {
      position: fixed;
      top: 0;
      left: 0;
      height: 100%;
      width: 300px;
      background: white;
      box-shadow: 2px 0 8px rgba(0,0,0,0.15);
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      z-index: 1000;
    }
    
    .drawer[aria-hidden="false"] {
      transform: translateX(0);
    }
    
    .drawer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      z-index: 999;
    }
    
    .drawer[aria-hidden="false"] ~ .drawer-overlay {
      opacity: 1;
      pointer-events: auto;
    }
  </style>
</head>
<body>
  <button data-drawer-trigger="main-drawer">Open Drawer</button>
  
  <div id="main-drawer" class="drawer" aria-hidden="true" data-drawer-drag>
    <div style="padding: 20px;">
      <h2>Drawer Content</h2>
      <p>This is a drawer component with gesture support!</p>
      <button onclick="drawer.close()">Close</button>
    </div>
  </div>
  
  <div class="drawer-overlay" onclick="drawer.close()"></div>
  
  <script type="module">
    import { setupDrawer } from '@uikit/vanilla';
    
    const drawer = setupDrawer({
      trigger: document.querySelector('[data-drawer-trigger]'),
      content: document.getElementById('main-drawer'),
      dragOptions: { axis: 'x', threshold: 0.3 }
    });
    
    window.drawer = drawer;
  </script>
</body>
</html>`;
    } else if (framework === 'react') {
      templates['DrawerDemo.jsx'] = `import React, { useRef } from 'react';
import { useDrawer, useDrawerTrigger, useDrawerContent, useDrawerDrag } from '@uikit/react';
${skin === 'vanilla' ? "import '@uikit/skin-vanilla/drawer.css';" : ''}

function DrawerDemo() {
  const drawer = useDrawer();
  const triggerRef = useDrawerTrigger(drawer);
  const contentRef = useDrawerContent(drawer);
  const dragRef = useDrawerDrag(drawer, { axis: 'x', threshold: 0.3 });
  
  return (
    <>
      <button ref={triggerRef}>
        Open Drawer
      </button>
      
      <div 
        ref={(el) => {
          contentRef.current = el;
          dragRef.current = el;
        }}
        className={\`drawer \${drawer.isOpen ? 'drawer--open' : ''}\`}
        aria-hidden={!drawer.isOpen}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          width: '300px',
          background: 'white',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
          transform: drawer.isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          zIndex: 1000
        }}
      >
        <div style={{ padding: '20px' }}>
          <h2>Drawer Content</h2>
          <p>This is a drawer component with gesture support!</p>
          <button onClick={drawer.close}>Close</button>
        </div>
      </div>
      
      {drawer.isOpen && (
        <div 
          onClick={drawer.close}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
        />
      )}
    </>
  );
}

export default DrawerDemo;`;
    } else if (framework === 'svelte') {
      templates['DrawerDemo.svelte'] = `<script>
  import { drawerStore, drawerTrigger, drawerContent, drawerDrag } from '@uikit/svelte';
  ${skin === 'vanilla' ? "import '@uikit/skin-vanilla/drawer.css';" : ''}
  
  const drawer = drawerStore();
</script>

<button use:drawerTrigger={drawer}>
  Open Drawer
</button>

<div 
  use:drawerContent={{ drawer }}
  use:drawerDrag={{ drawer, axis: 'x', threshold: 0.3 }}
  class="drawer"
  class:drawer--open={$drawer.isOpen}
  aria-hidden={!$drawer.isOpen}
>
  <div class="content">
    <h2>Drawer Content</h2>
    <p>This is a drawer component with gesture support!</p>
    <button on:click={drawer.close}>Close</button>
  </div>
</div>

{#if $drawer.isOpen}
  <div class="overlay" on:click={drawer.close}></div>
{/if}

<style>
  .drawer {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 300px;
    background: white;
    box-shadow: 2px 0 8px rgba(0,0,0,0.15);
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1000;
  }
  
  .drawer--open {
    transform: translateX(0);
  }
  
  .content {
    padding: 20px;
  }
  
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 999;
  }
</style>`;
    }
  }
  
  return templates;
}

program.parse();