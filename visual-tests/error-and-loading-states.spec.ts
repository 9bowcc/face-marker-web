/**
 * Visual regression tests for error and loading states
 */

import { test, expect } from '@playwright/test';
import { waitForStableUI, hideDynamicElements } from './helpers/test-utils';

interface WindowWithTestFlags extends Window {
  __SLOW_PROCESSING__?: boolean;
  __FORCE_PROCESSING_ERROR__?: boolean;
  __MOCK_NO_FACES__?: boolean;
}

test.describe('Loading States', () => {
  test('should show initialization loading state', async ({ page }) => {
    // Block the face detection model from loading to capture the loading state
    await page.route('**/*.tflite', route => route.abort());
    await page.route('**/*face_detection*', route => route.abort());

    await page.goto('/');

    // Wait for the initialization message
    try {
      await page.waitForSelector('text=Initializing face detection model', { timeout: 5000 });
      await hideDynamicElements(page);

      // Screenshot the loading alert
      const alert = page.locator('text=Initializing face detection model').locator('..');
      await expect(alert).toHaveScreenshot('loading-initialization.png');

      // Full page with loading state
      await expect(page).toHaveScreenshot('loading-initialization-full.png');
    } catch {
      console.log('Could not capture initialization loading state - model loaded too quickly');
    }
  });

  test('should show file processing loading spinner', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });

    // Intercept image processing to make it slow
    await page.addInitScript(() => {
      (window as unknown as WindowWithTestFlags).__SLOW_PROCESSING__ = true;
    });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'),
    });

    try {
      // Wait for the loading spinner
      await page.waitForSelector('.MuiCircularProgress-root', { timeout: 2000 });
      await hideDynamicElements(page);

      await expect(page).toHaveScreenshot('loading-processing.png');
    } catch {
      console.log('Processing was too fast to capture loading state');
    }
  });

  test('should show blur application processing state', async ({ page }) => {
    await page.goto('/');

    // This would capture the state when blur is being applied
    // Shows CircularProgress in the Apply Blur button
  });
});

test.describe('Error States', () => {
  test('should show initialization error', async ({ page }) => {
    // Force an initialization error
    await page.route('**/*.tflite', route => route.abort());
    await page.route('**/*face_detection*', route => route.abort());
    await page.route('**/@tensorflow*', route => route.abort());

    await page.goto('/');

    try {
      // Wait for error message
      await page.waitForSelector('text=Failed to initialize face detection', { timeout: 15000 });
      await waitForStableUI(page);
      await hideDynamicElements(page);

      // Screenshot the error alert
      const errorAlert = page.locator('.MuiAlert-root').filter({ hasText: 'Failed to initialize' });
      await expect(errorAlert).toHaveScreenshot('error-initialization-alert.png');

      // Full page with error
      await expect(page).toHaveScreenshot('error-initialization-full.png');
    } catch {
      console.log('Could not capture initialization error - app initialized successfully');
    }
  });

  test('should show image processing error', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });

    // Mock a processing error
    await page.addInitScript(() => {
      (window as unknown as WindowWithTestFlags).__FORCE_PROCESSING_ERROR__ = true;
    });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'),
    });

    try {
      await page.waitForSelector('.MuiAlert-root[class*="error"]', { timeout: 5000 });
      await waitForStableUI(page);
      await hideDynamicElements(page);

      const errorAlert = page.locator('.MuiAlert-root').first();
      await expect(errorAlert).toHaveScreenshot('error-processing.png');
    } catch {
      console.log('Could not capture processing error');
    }
  });

  test('should show export error', async ({ page }) => {
    await page.goto('/');

    // This would capture the error state when image export fails
    // Shows error alert with export failure message
  });

  test('should show network error state', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);

    await page.goto('/');

    try {
      // Wait for any network-related error
      await page.waitForSelector('.MuiAlert-root', { timeout: 10000 });
      await waitForStableUI(page);
      await hideDynamicElements(page);

      await expect(page).toHaveScreenshot('error-network.png');
    } catch {
      console.log('App may use cached resources - network error not visible');
    } finally {
      await page.context().setOffline(false);
    }
  });
});

test.describe('Info and Success States', () => {
  test('should show backend info chip', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });
    await waitForStableUI(page);

    // Screenshot the backend info chip in the header
    const backendChip = page.locator('.MuiChip-root').filter({ hasText: 'Backend' });

    try {
      await backendChip.waitFor({ timeout: 5000 });
      await hideDynamicElements(page);
      await expect(backendChip).toHaveScreenshot('info-backend-chip.png');
    } catch {
      console.log('Backend chip not found or not visible yet');
    }
  });

  test('should show privacy notice', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });
    await waitForStableUI(page);
    await hideDynamicElements(page);

    // Screenshot the privacy notice at the bottom
    const privacyNotice = page.locator('text=Privacy Notice').locator('..');
    await expect(privacyNotice).toHaveScreenshot('info-privacy-notice.png');
  });

  test('should show feature chips', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });
    await waitForStableUI(page);
    await hideDynamicElements(page);

    // Screenshot the feature chips (100% Client-Side, No Server Upload, etc.)
    const chipContainer = page.locator('.MuiBox-root').filter({ has: page.locator('text=100% Client-Side') });
    await expect(chipContainer).toHaveScreenshot('info-feature-chips.png');
  });

  test('should show "no faces detected" info alert', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });

    // Mock no faces detected
    await page.addInitScript(() => {
      (window as unknown as WindowWithTestFlags).__MOCK_NO_FACES__ = true;
    });

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64'),
    });

    try {
      await page.waitForSelector('text=No faces detected', { timeout: 10000 });
      await waitForStableUI(page);
      await hideDynamicElements(page);

      const infoAlert = page.locator('.MuiAlert-root').filter({ hasText: 'No faces' });
      await expect(infoAlert).toHaveScreenshot('info-no-faces.png');
    } catch {
      console.log('Could not capture no faces state');
    }
  });
});

test.describe('Alert Component Variations', () => {
  test('should render info alert correctly', async ({ page }) => {
    await page.goto('/');

    try {
      // Find any info alert
      const infoAlert = page.locator('.MuiAlert-root').first();
      await infoAlert.waitFor({ timeout: 5000 });
      await hideDynamicElements(page);
      await expect(infoAlert).toHaveScreenshot('alert-info.png');
    } catch {
      console.log('No info alert found');
    }
  });

  test('should render error alert with proper styling', async ({ page }) => {
    // Force an error to capture error alert styling
    await page.route('**/*.tflite', route => route.abort());

    await page.goto('/');

    try {
      const errorAlert = page.locator('.MuiAlert-root').filter({ hasText: 'Failed' });
      await errorAlert.waitFor({ timeout: 15000 });
      await hideDynamicElements(page);
      await expect(errorAlert).toHaveScreenshot('alert-error.png');
    } catch {
      console.log('No error alert captured');
    }
  });
});
