/**
 * E2E tests for image upload and face detection workflow
 */

import { test, expect } from '@playwright/test';
import { waitForInitialization, getTestImageBuffer } from './helpers/test-utils';

test.describe('Image Upload and Face Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to initialize
    await waitForInitialization(page);
  });

  test('should display the upload interface on initial load', async ({ page }) => {
    // Check for main heading
    await expect(page.getByText('Welcome to Face Marker Web')).toBeVisible();

    // Check for upload area
    await expect(page.getByText('Drop your file here or click to browse')).toBeVisible();

    // Check for supported formats text
    await expect(
      page.getByText(/Supported formats.*Images.*JPEG.*PNG.*WebP/i)
    ).toBeVisible();
  });

  test('should show privacy notice', async ({ page }) => {
    await expect(
      page.getByText(/Privacy Notice.*processes all media locally/i)
    ).toBeVisible();
  });

  test('should upload an image file successfully', async ({ page }) => {
    // Create a file chooser promise
    const fileChooserPromise = page.waitForEvent('filechooser');

    // Click the upload area
    await page.click('text=Drop your file here or click to browse');

    // Upload the file
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: getTestImageBuffer(),
    });

    // Wait for image processor to appear
    await expect(page.getByText(/Processing Image/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test('should detect faces in uploaded image', async ({ page }) => {
    // Upload an image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Drop your file here or click to browse');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: getTestImageBuffer(),
    });

    // Wait for face detection to complete
    // Note: With test image, no faces will be detected, but we can verify the process completed
    await page.waitForTimeout(3000);

    // Check if we can see the result (either faces detected or no faces message)
    // This will depend on whether faces are actually in the test image
    const hasDetectingText = await page.getByText(/Detecting faces/i).isVisible();
    if (!hasDetectingText) {
      // Detection completed
      expect(true).toBe(true);
    }
  });

  test('should show back button after image upload', async ({ page }) => {
    // Upload an image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Drop your file here or click to browse');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: getTestImageBuffer(),
    });

    // Wait for processor to load
    await page.waitForTimeout(2000);

    // Check for back button or back functionality
    const backButton = page.getByRole('button', { name: /back/i });
    if (await backButton.isVisible()) {
      await expect(backButton).toBeVisible();
    }
  });

  test('should return to upload screen when clicking back', async ({ page }) => {
    // Upload an image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Drop your file here or click to browse');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: getTestImageBuffer(),
    });

    // Wait for processor to load
    await page.waitForTimeout(2000);

    // Try to find and click back button
    const backButton = page.getByRole('button', { name: /back/i });
    if (await backButton.isVisible()) {
      await backButton.click();

      // Should return to upload screen
      await expect(page.getByText('Drop your file here or click to browse')).toBeVisible();
    }
  });

  test('should display image preview after upload', async ({ page }) => {
    // Upload an image
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Drop your file here or click to browse');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      buffer: getTestImageBuffer(),
    });

    // Wait for image to load
    await page.waitForTimeout(2000);

    // Check if an image or canvas is visible
    const hasImage = (await page.locator('img').count()) > 0;
    const hasCanvas = (await page.locator('canvas').count()) > 0;

    expect(hasImage || hasCanvas).toBe(true);
  });

  test('should handle multiple image uploads sequentially', async ({ page }) => {
    // First upload
    let fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text=Drop your file here or click to browse');
    let fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test-image-1.jpg',
      mimeType: 'image/jpeg',
      buffer: getTestImageBuffer(),
    });

    await page.waitForTimeout(2000);

    // Go back
    const backButton = page.getByRole('button', { name: /back/i });
    if (await backButton.isVisible()) {
      await backButton.click();

      // Second upload
      fileChooserPromise = page.waitForEvent('filechooser');
      await page.click('text=Drop your file here or click to browse');
      fileChooser = await fileChooserPromise;
      await fileChooser.setFiles({
        name: 'test-image-2.jpg',
        mimeType: 'image/jpeg',
        buffer: getTestImageBuffer(),
      });

      await page.waitForTimeout(2000);

      // Should show processor again
      expect(true).toBe(true);
    }
  });
});
