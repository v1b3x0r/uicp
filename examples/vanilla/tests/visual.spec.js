import { test, expect } from '@playwright/test';

test.describe('Visual Testing', () => {
  test('drawer visual states', async ({ page }) => {
    await page.goto('/');
    
    // Screenshot initial state
    await expect(page).toHaveScreenshot('drawer-initial.png');
    
    // Open drawer
    await page.locator('#vanilla-drawer-trigger').click();
    await page.waitForTimeout(1000); // Wait for animation
    
    // Screenshot open state
    await expect(page).toHaveScreenshot('drawer-open.png');
    
    // Close via backdrop
    await page.locator('#drawer-backdrop').click();
    await page.waitForTimeout(1000); // Wait for animation
    
    // Screenshot closed state (should match initial)
    await expect(page).toHaveScreenshot('drawer-closed.png');
  });

  test('mobile viewport drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    
    // Screenshot mobile initial
    await expect(page).toHaveScreenshot('mobile-drawer-initial.png');
    
    // Open drawer on mobile
    await page.locator('#vanilla-drawer-trigger').click();
    await page.waitForTimeout(1000);
    
    // Screenshot mobile open
    await expect(page).toHaveScreenshot('mobile-drawer-open.png');
  });
});