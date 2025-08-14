import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createDrawer } from '../packages/ui-core/src/drawer.js';

describe('DOM Manipulation', () => {
  let drawer;
  
  beforeEach(() => {
    drawer = createDrawer();
    document.body.innerHTML = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });
  
  afterEach(() => {
    document.body.innerHTML = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  describe('Body Scroll Lock', () => {
    it('should lock and unlock body scroll', () => {
      const contentElement = document.createElement('div');
      document.body.appendChild(contentElement);
      
      const cleanup = drawer.registerContent(contentElement);
      
      drawer.open();
      expect(document.body.style.overflow).toBe('hidden');
      
      drawer.close();
      expect(document.body.style.overflow).toBe('');
      
      cleanup();
    });
    
    it('should preserve scrollbar width with padding adjustment', () => {
      const contentElement = document.createElement('div');
      document.body.appendChild(contentElement);
      
      // Mock scrollbar width
      Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true });
      Object.defineProperty(document.documentElement, 'clientWidth', { value: 985, configurable: true });
      
      const cleanup = drawer.registerContent(contentElement);
      
      drawer.open();
      expect(document.body.style.paddingRight).toBe('15px');
      
      drawer.close();
      expect(document.body.style.paddingRight).toBe('');
      
      cleanup();
    });
  });

  describe('Focus Management', () => {
    it('should trap focus within drawer content', () => {
      const contentElement = document.createElement('div');
      contentElement.innerHTML = `
        <button id="first">First</button>
        <button id="second">Second</button>
      `;
      document.body.appendChild(contentElement);
      
      const cleanup = drawer.registerContent(contentElement);
      
      drawer.open();
      
      const firstBtn = document.getElementById('first');
      // const secondBtn = document.getElementById('second'); // unused
      
      expect(document.activeElement).toBe(firstBtn);
      
      cleanup();
    });
    
    it('should restore focus when drawer closes', () => {
      const externalButton = document.createElement('button');
      document.body.appendChild(externalButton);
      externalButton.focus();
      
      const contentElement = document.createElement('div');
      contentElement.innerHTML = '<button>Inside</button>';
      document.body.appendChild(contentElement);
      
      const cleanup = drawer.registerContent(contentElement);
      
      drawer.open();
      drawer.close();
      
      expect(document.activeElement).toBe(externalButton);
      
      cleanup();
    });
  });

  describe('Trigger Integration', () => {
    it('should update aria-expanded on trigger', () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      
      const cleanup = drawer.registerTrigger(trigger);
      
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      
      drawer.open();
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      
      drawer.close();
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      
      cleanup();
    });
  });
});