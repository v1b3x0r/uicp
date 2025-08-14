/**
 * Simple Theme System - No runes, works everywhere
 * Auto-detects system preference, stores user choice
 */

// Simple theme state
let currentTheme = 'system';
let currentResolvedTheme = 'light';
const listeners = new Set();

// Detect system preference
function getSystemTheme() {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Update resolved theme
function updateResolvedTheme() {
  currentResolvedTheme = currentTheme === 'system' ? getSystemTheme() : currentTheme;
}

// Apply theme to document
function applyTheme() {
  if (typeof window === 'undefined') return;
  
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(currentResolvedTheme);
  document.documentElement.setAttribute('data-theme', currentResolvedTheme);
  
  // Notify listeners
  listeners.forEach(fn => fn({ theme: currentTheme, resolvedTheme: currentResolvedTheme }));
}

// Initialize theme
function initTheme() {
  if (typeof window === 'undefined') return;
  
  // Load from localStorage
  const stored = localStorage.getItem('uikit-theme');
  if (stored && ['light', 'dark', 'system'].includes(stored)) {
    currentTheme = stored;
  }
  
  updateResolvedTheme();
  applyTheme();
  
  // Listen for system changes
  window.matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', () => {
      if (currentTheme === 'system') {
        updateResolvedTheme();
        applyTheme();
      }
    });
}

// Set theme
function setTheme(newTheme) {
  currentTheme = newTheme;
  updateResolvedTheme();
  applyTheme();
  
  if (typeof window !== 'undefined') {
    localStorage.setItem('uikit-theme', newTheme);
  }
}

// Subscribe to theme changes
function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Export theme API
export const themeStore = {
  get theme() { return currentTheme; },
  get resolvedTheme() { return currentResolvedTheme; },
  setTheme,
  initTheme,
  subscribe
};