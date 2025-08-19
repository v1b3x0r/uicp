import { test, expect } from '@playwright/test';

test.describe('Apple-style Drawer Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the demo page correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Universal UI Protocol');
    await expect(page.locator('#vanilla-drawer-trigger')).toBeVisible();
    await expect(page.locator('#test-drawer')).toBeVisible();
  });

  test('drawer should be hidden initially', async ({ page }) => {
    const drawer = page.locator('#test-drawer');
    
    // Check initial CSS properties
    const initialTransform = await drawer.evaluate(el => 
      window.getComputedStyle(el).transform
    );
    const initialVisibility = await drawer.evaluate(el => 
      window.getComputedStyle(el).visibility
    );
    
    console.log('Initial transform:', initialTransform);
    console.log('Initial visibility:', initialVisibility);
    
    // Check if drawer is positioned at bottom (translateY should indicate hidden state)
    const boundingBox = await drawer.boundingBox();
    const viewportSize = await page.viewportSize();
    
    console.log('Drawer bounding box:', boundingBox);
    console.log('Viewport size:', viewportSize);
    
    // Drawer should be below viewport initially
    expect(boundingBox.y).toBeGreaterThan(viewportSize.height * 0.8);
  });

  test('clicking trigger should open drawer', async ({ page }) => {
    const trigger = page.locator('#vanilla-drawer-trigger');
    const drawer = page.locator('#test-drawer');
    const backdrop = page.locator('#drawer-backdrop');
    
    // Check initial state
    const initialTransform = await drawer.evaluate(el => 
      window.getComputedStyle(el).transform
    );
    console.log('Initial transform:', initialTransform);
    
    // Click trigger
    await trigger.click();
    
    // Wait for state change
    await page.waitForTimeout(500);
    
    // Check transform after click
    const openTransform = await drawer.evaluate(el => 
      window.getComputedStyle(el).transform
    );
    console.log('Transform after click:', openTransform);
    
    // Check inline styles
    const inlineTransform = await drawer.evaluate(el => el.style.transform);
    const inlineImportant = await drawer.evaluate(el => 
      el.style.getPropertyPriority('transform')
    );
    console.log('Inline transform:', inlineTransform);
    console.log('Inline important:', inlineImportant);
    
    // Check if backdrop is visible
    const backdropVisible = await backdrop.evaluate(el => 
      el.classList.contains('show')
    );
    console.log('Backdrop visible:', backdropVisible);
    
    // Check CSS classes
    const hasOpenClass = await drawer.evaluate(el => 
      el.classList.contains('drawer-open')
    );
    console.log('Has drawer-open class:', hasOpenClass);
    
    // The transform should change (either through CSS class or inline style)
    expect(openTransform).not.toBe(initialTransform);
  });

  test('CSS properties debugging', async ({ page }) => {
    const drawer = page.locator('#test-drawer');
    const trigger = page.locator('#vanilla-drawer-trigger');
    
    // Get comprehensive CSS info before click
    const beforeClick = await drawer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        transform: computed.transform,
        bottom: computed.bottom,
        position: computed.position,
        visibility: computed.visibility,
        display: computed.display,
        zIndex: computed.zIndex,
        transition: computed.transition,
        className: el.className,
        inlineTransform: el.style.transform,
        inlineImportant: el.style.getPropertyPriority('transform')
      };
    });
    
    console.log('Before click CSS:', beforeClick);
    
    // Click trigger
    await trigger.click();
    await page.waitForTimeout(500);
    
    // Get comprehensive CSS info after click
    const afterClick = await drawer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        transform: computed.transform,
        bottom: computed.bottom,
        position: computed.position,
        visibility: computed.visibility,
        display: computed.display,
        zIndex: computed.zIndex,
        transition: computed.transition,
        className: el.className,
        inlineTransform: el.style.transform,
        inlineImportant: el.style.getPropertyPriority('transform')
      };
    });
    
    console.log('After click CSS:', afterClick);
    
    // Assert that something changed
    const somethingChanged = 
      beforeClick.transform !== afterClick.transform ||
      beforeClick.className !== afterClick.className ||
      beforeClick.inlineTransform !== afterClick.inlineTransform;
    
    expect(somethingChanged).toBe(true);
  });

  test('backdrop click should close drawer', async ({ page }) => {
    const trigger = page.locator('#vanilla-drawer-trigger');
    const backdrop = page.locator('#drawer-backdrop');
    
    // Open drawer
    await trigger.click();
    await page.waitForTimeout(500);
    
    // Check backdrop is visible
    const backdropVisible = await backdrop.evaluate(el => 
      el.classList.contains('show')
    );
    expect(backdropVisible).toBe(true);
    
    // Click backdrop
    await backdrop.click();
    await page.waitForTimeout(500);
    
    // Check backdrop is hidden
    const backdropHidden = await backdrop.evaluate(el => 
      !el.classList.contains('show')
    );
    expect(backdropHidden).toBe(true);
  });

  test('close button should close drawer', async ({ page }) => {
    const trigger = page.locator('#vanilla-drawer-trigger');
    const closeButton = page.locator('#close-drawer');
    const drawer = page.locator('#test-drawer');
    
    // Open drawer
    await trigger.click();
    await page.waitForTimeout(500);
    
    // Click close button
    await closeButton.click();
    await page.waitForTimeout(500);
    
    // Check if drawer has closed
    const hasOpenClass = await drawer.evaluate(el => 
      el.classList.contains('drawer-open')
    );
    expect(hasOpenClass).toBe(false);
  });

  test('console errors should be minimal', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });
    
    // Interact with drawer
    await page.locator('#vanilla-drawer-trigger').click();
    await page.waitForTimeout(1000);
    await page.locator('#close-drawer').click();
    await page.waitForTimeout(1000);
    
    // Should have no critical console errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404')
    );
    
    console.log('Console errors:', criticalErrors);
    expect(criticalErrors).toHaveLength(0);
  });
});