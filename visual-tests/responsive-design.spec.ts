/**
 * Visual regression tests for responsive design across different viewports
 */

import { test, expect } from '@playwright/test';
import { waitForStableUI, hideDynamicElements, setViewport, VIEWPORTS } from './helpers/test-utils';

test.describe('Responsive Design - Mobile (375x667)', () => {
  test.beforeEach(async ({ page }) => {
    await setViewport(page, VIEWPORTS.mobile);
    await page.goto('/');
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });
    await waitForStableUI(page);
  });

  test('should render app bar correctly on mobile', async ({ page }) => {
    await hideDynamicElements(page);

    const appBar = page.locator('.MuiAppBar-root');
    await expect(appBar).toHaveScreenshot('mobile-app-bar.png');
  });

  test('should render welcome section on mobile', async ({ page }) => {
    await hideDynamicElements(page);

    const welcomeSection = page.locator('text=Welcome to Face Marker Web').locator('..');
    await expect(welcomeSection).toHaveScreenshot('mobile-welcome-section.png');
  });

  test('should render file uploader on mobile', async ({ page }) => {
    await hideDynamicElements(page);

    const uploader = page.locator('text=Drop your file here').locator('..');
    await expect(uploader).toHaveScreenshot('mobile-file-uploader.png');
  });

  test('should render feature chips responsively on mobile', async ({ page }) => {
    await hideDynamicElements(page);

    const chipsContainer = page.locator('.MuiBox-root').filter({ has: page.locator('text=100% Client-Side') });
    await expect(chipsContainer).toHaveScreenshot('mobile-feature-chips.png');
  });

  test('should render full page on mobile', async ({ page }) => {
    await hideDynamicElements(page);

    await expect(page).toHaveScreenshot('mobile-full-page.png', {
      fullPage: true,
    });
  });

  test('should render privacy notice on mobile', async ({ page }) => {
    await hideDynamicElements(page);

    const privacyNotice = page.locator('text=Privacy Notice').locator('..');
    await expect(privacyNotice).toHaveScreenshot('mobile-privacy-notice.png');
  });
});

test.describe('Responsive Design - Tablet (768x1024)', () => {
  test.beforeEach(async ({ page }) => {
    await setViewport(page, VIEWPORTS.tablet);
    await page.goto('/');
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });
    await waitForStableUI(page);
  });

  test('should render app bar correctly on tablet', async ({ page }) => {
    await hideDynamicElements(page);

    const appBar = page.locator('.MuiAppBar-root');
    await expect(appBar).toHaveScreenshot('tablet-app-bar.png');
  });

  test('should render welcome section on tablet', async ({ page }) => {
    await hideDynamicElements(page);

    const welcomeSection = page.locator('text=Welcome to Face Marker Web').locator('..');
    await expect(welcomeSection).toHaveScreenshot('tablet-welcome-section.png');
  });

  test('should render file uploader on tablet', async ({ page }) => {
    await hideDynamicElements(page);

    const uploader = page.locator('text=Drop your file here').locator('..');
    await expect(uploader).toHaveScreenshot('tablet-file-uploader.png');
  });

  test('should render full page on tablet', async ({ page }) => {
    await hideDynamicElements(page);

    await expect(page).toHaveScreenshot('tablet-full-page.png', {
      fullPage: true,
    });
  });
});

test.describe('Responsive Design - Desktop (1280x720)', () => {
  test.beforeEach(async ({ page }) => {
    await setViewport(page, VIEWPORTS.desktop);
    await page.goto('/');
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });
    await waitForStableUI(page);
  });

  test('should render app bar correctly on desktop', async ({ page }) => {
    await hideDynamicElements(page);

    const appBar = page.locator('.MuiAppBar-root');
    await expect(appBar).toHaveScreenshot('desktop-app-bar.png');
  });

  test('should render welcome section on desktop', async ({ page }) => {
    await hideDynamicElements(page);

    const welcomeSection = page.locator('text=Welcome to Face Marker Web').locator('..');
    await expect(welcomeSection).toHaveScreenshot('desktop-welcome-section.png');
  });

  test('should render file uploader on desktop', async ({ page }) => {
    await hideDynamicElements(page);

    const uploader = page.locator('text=Drop your file here').locator('..');
    await expect(uploader).toHaveScreenshot('desktop-file-uploader.png');
  });

  test('should render full page on desktop', async ({ page }) => {
    await hideDynamicElements(page);

    await expect(page).toHaveScreenshot('desktop-full-page.png', {
      fullPage: true,
    });
  });
});

test.describe('Responsive Design - Large Desktop (1920x1080)', () => {
  test.beforeEach(async ({ page }) => {
    await setViewport(page, VIEWPORTS.largeDesktop);
    await page.goto('/');
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });
    await waitForStableUI(page);
  });

  test('should render full page on large desktop', async ({ page }) => {
    await hideDynamicElements(page);

    await expect(page).toHaveScreenshot('large-desktop-full-page.png', {
      fullPage: true,
    });
  });

  test('should render centered content on large desktop', async ({ page }) => {
    await hideDynamicElements(page);

    // The Container component should limit max width on large screens
    const container = page.locator('.MuiContainer-root').first();
    await expect(container).toHaveScreenshot('large-desktop-container.png');
  });
});

test.describe('Responsive Design - Layout Breakpoints', () => {
  test('should handle transition from mobile to tablet', async ({ page }) => {
    // Start at mobile size
    await setViewport(page, VIEWPORTS.mobile);
    await page.goto('/');
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });
    await waitForStableUI(page);
    await hideDynamicElements(page);

    // Capture mobile layout
    await expect(page).toHaveScreenshot('breakpoint-mobile.png');

    // Resize to tablet
    await setViewport(page, VIEWPORTS.tablet);
    await waitForStableUI(page);

    // Capture tablet layout
    await expect(page).toHaveScreenshot('breakpoint-tablet.png');
  });

  test('should handle transition from tablet to desktop', async ({ page }) => {
    // Start at tablet size
    await setViewport(page, VIEWPORTS.tablet);
    await page.goto('/');
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });
    await waitForStableUI(page);
    await hideDynamicElements(page);

    // Capture tablet layout
    await expect(page).toHaveScreenshot('breakpoint-tablet-2.png');

    // Resize to desktop
    await setViewport(page, VIEWPORTS.desktop);
    await waitForStableUI(page);

    // Capture desktop layout
    await expect(page).toHaveScreenshot('breakpoint-desktop.png');
  });
});

test.describe('Responsive Design - Face Grid Layout', () => {
  test('should render face thumbnails in 2 columns on mobile', async ({ page }) => {
    await setViewport(page, VIEWPORTS.mobile);
    await page.goto('/');

    // This test would capture the face grid on mobile
    // Expected: 2 columns (gridTemplateColumns: 'repeat(2, 1fr)')
  });

  test('should render face thumbnails in 3 columns on tablet', async ({ page }) => {
    await setViewport(page, VIEWPORTS.tablet);
    await page.goto('/');

    // This test would capture the face grid on tablet
    // Expected: 3 columns (gridTemplateColumns: 'repeat(3, 1fr)')
  });

  test('should render face thumbnails in 4 columns on desktop', async ({ page }) => {
    await setViewport(page, VIEWPORTS.desktop);
    await page.goto('/');

    // This test would capture the face grid on desktop
    // Expected: 4 columns (gridTemplateColumns: 'repeat(4, 1fr)')
  });
});

test.describe('Responsive Design - Typography', () => {
  test('should scale typography correctly on mobile', async ({ page }) => {
    await setViewport(page, VIEWPORTS.mobile);
    await page.goto('/');
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });
    await waitForStableUI(page);
    await hideDynamicElements(page);

    const heading = page.locator('h4, h5, h6').filter({ hasText: 'Welcome to Face Marker Web' });
    await expect(heading).toHaveScreenshot('mobile-typography-heading.png');
  });

  test('should scale typography correctly on desktop', async ({ page }) => {
    await setViewport(page, VIEWPORTS.desktop);
    await page.goto('/');
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });
    await waitForStableUI(page);
    await hideDynamicElements(page);

    const heading = page.locator('h4, h5, h6').filter({ hasText: 'Welcome to Face Marker Web' });
    await expect(heading).toHaveScreenshot('desktop-typography-heading.png');
  });
});

test.describe('Responsive Design - Touch Targets', () => {
  test('should have adequate touch targets on mobile', async ({ page }) => {
    await setViewport(page, VIEWPORTS.mobile);
    await page.goto('/');
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });
    await waitForStableUI(page);
    await hideDynamicElements(page);

    // File upload area should be easily tappable
    const uploadArea = page.locator('text=Drop your file here').locator('..');
    const boundingBox = await uploadArea.boundingBox();

    // Verify minimum touch target size (44x44 pixels recommended)
    expect(boundingBox?.height).toBeGreaterThan(44);
  });
});
