import { test, expect } from '@playwright/test';

test.describe('Hybrid API Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the demo page
    await page.goto('/');
    
    // Wait for demo to initialize
    await page.waitForFunction(() => window.demoAPI, { timeout: 5000 });
    
    // Verify drawer exists
    await expect(page.locator('#test-drawer')).toBeVisible();
  });

  test('should initialize hybrid API successfully', async ({ page }) => {
    // Check if demo API is available
    const hasAPI = await page.evaluate(() => !!window.demoAPI);
    expect(hasAPI).toBe(true);
    
    // Check status indicator
    const status = await page.locator('#drawer-status').textContent();
    expect(status).toBe('Ready');
    
    // Check logs show initialization
    const logs = await page.locator('#logs').textContent();
    expect(logs).toContain('Hybrid drawer initialized successfully');
  });

  test('should open drawer on button click', async ({ page }) => {
    // Get initial state
    const initialTransform = await page.locator('#test-drawer').evaluate(el => 
      getComputedStyle(el).transform
    );
    
    // Click the trigger button
    await page.click('#vanilla-drawer-trigger');
    
    // Wait for animation to start
    await page.waitForTimeout(100);
    
    // Check CSS class was added
    await expect(page.locator('#test-drawer')).toHaveClass(/drawer-open/);
    
    // Check backdrop is visible
    await expect(page.locator('#drawer-backdrop')).toHaveClass(/show/);
    
    // Check transform changed (should be translateY(0) or matrix equivalent)
    const openTransform = await page.locator('#test-drawer').evaluate(el => 
      getComputedStyle(el).transform
    );
    
    expect(openTransform).not.toBe(initialTransform);
    
    // For translateY(0), transform should be 'none' or identity matrix
    const isOpen = openTransform === 'none' || 
                   openTransform.includes('matrix(1, 0, 0, 1, 0, 0)');
    expect(isOpen).toBe(true);
  });

  test('should close drawer on close button click', async ({ page }) => {
    // First open the drawer
    await page.click('#vanilla-drawer-trigger');
    await page.waitForTimeout(300);
    
    // Verify it's open
    await expect(page.locator('#test-drawer')).toHaveClass(/drawer-open/);
    
    // Click close button
    await page.click('#close-drawer');
    await page.waitForTimeout(300);
    
    // Check it's closed
    await expect(page.locator('#test-drawer')).not.toHaveClass(/drawer-open/);
    await expect(page.locator('#drawer-backdrop')).not.toHaveClass(/show/);
  });

  test('should close drawer on backdrop click', async ({ page }) => {
    // Open drawer
    await page.click('#vanilla-drawer-trigger');
    await page.waitForTimeout(300);
    
    // Verify it's open
    await expect(page.locator('#test-drawer')).toHaveClass(/drawer-open/);
    
    // Click backdrop
    await page.click('#drawer-backdrop');
    await page.waitForTimeout(300);
    
    // Check it's closed
    await expect(page.locator('#test-drawer')).not.toHaveClass(/drawer-open/);
  });

  test('should handle force open/close correctly', async ({ page }) => {
    // Test force open
    await page.click('#force-open');
    await page.waitForTimeout(100);
    
    // Should have CSS class and transform
    await expect(page.locator('#test-drawer')).toHaveClass(/drawer-open/);
    
    const openTransform = await page.locator('#test-drawer').evaluate(el => 
      getComputedStyle(el).transform
    );
    const isOpen = openTransform === 'none' || 
                   openTransform.includes('matrix(1, 0, 0, 1, 0, 0)');
    expect(isOpen).toBe(true);
    
    // Test force close
    await page.click('#force-close');
    await page.waitForTimeout(100);
    
    // Should be closed
    await expect(page.locator('#test-drawer')).not.toHaveClass(/drawer-open/);
  });

  test('should log events correctly', async ({ page }) => {
    // Clear logs first
    await page.click('#clear-logs');
    await page.waitForTimeout(100);
    
    // Click trigger and check logs
    await page.click('#vanilla-drawer-trigger');
    await page.waitForTimeout(300);
    
    const logs = await page.locator('#logs').textContent();
    expect(logs).toContain('Toggle button clicked');
  });

  test('should debug state correctly', async ({ page }) => {
    // Open drawer
    await page.click('#vanilla-drawer-trigger');
    await page.waitForTimeout(300);
    
    // Clear logs and click debug
    await page.click('#clear-logs');
    await page.click('#debug-state');
    
    // Check debug output
    const logs = await page.locator('#logs').textContent();
    expect(logs).toContain('State:');
    expect(logs).toContain('isOpen');
  });

  test('should handle multiple open/close cycles', async ({ page }) => {
    // Test multiple cycles
    for (let i = 0; i < 3; i++) {
      // Open
      await page.click('#vanilla-drawer-trigger');
      await page.waitForTimeout(200);
      await expect(page.locator('#test-drawer')).toHaveClass(/drawer-open/);
      
      // Close
      await page.click('#close-drawer');
      await page.waitForTimeout(200);
      await expect(page.locator('#test-drawer')).not.toHaveClass(/drawer-open/);
    }
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check initial aria-hidden
    const initialHidden = await page.locator('#test-drawer').getAttribute('aria-hidden');
    // Note: hybrid API should set this
    
    // Open drawer
    await page.click('#vanilla-drawer-trigger');
    await page.waitForTimeout(300);
    
    // Check drawer has proper attributes
    const drawer = page.locator('#test-drawer');
    await expect(drawer).toHaveAttribute('data-uip-type', 'drawer');
    await expect(drawer).toHaveAttribute('data-uip-position', 'bottom');
  });

  test('should not have console errors', async ({ page }) => {
    const errors = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        errors.push(message.text());
      }
    });
    
    // Perform typical interactions
    await page.click('#vanilla-drawer-trigger');
    await page.waitForTimeout(300);
    await page.click('#close-drawer');
    await page.waitForTimeout(300);
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('Failed to load resource')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});