/**
 * Visual regression tests for FileUploader component
 */

import { test, expect } from '@playwright/test';
import { waitForStableUI, hideDynamicElements } from './helpers/test-utils';

test.describe('FileUploader Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for initialization to complete
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });
    await waitForStableUI(page);
  });

  test('should render file upload area in default state', async ({ page }) => {
    // Hide dynamic elements for consistent screenshots
    await hideDynamicElements(page);

    // Take screenshot of the entire upload component
    await expect(page.locator('[data-testid="file-uploader"], .MuiPaper-root:has-text("Drop your file here")')).toHaveScreenshot('file-uploader-default.png');
  });

  test('should show upload area with hover state simulation', async ({ page }) => {
    const uploadArea = page.locator('[data-testid="file-uploader"], .MuiPaper-root:has-text("Drop your file here")').first();

    // Hover over the upload area
    await uploadArea.hover();
    await page.waitForTimeout(500); // Wait for hover animation

    await hideDynamicElements(page);
    await expect(uploadArea).toHaveScreenshot('file-uploader-hover.png');
  });

  test('should display file format icons correctly', async ({ page }) => {
    await hideDynamicElements(page);

    // Screenshot the icon section
    const iconSection = page.locator('text=Images').locator('..');
    await expect(iconSection).toHaveScreenshot('file-uploader-icons.png');
  });

  test('should show complete upload interface with all elements', async ({ page }) => {
    await hideDynamicElements(page);

    // Full page screenshot showing the entire interface
    await expect(page).toHaveScreenshot('file-uploader-full-page.png', {
      fullPage: true,
    });
  });

  test('should render upload icon correctly', async ({ page }) => {
    const uploadIcon = page.locator('svg').first(); // CloudUploadIcon

    await expect(uploadIcon).toBeVisible();
    await hideDynamicElements(page);

    // Get the parent container to include the icon with some context
    const iconContainer = page.locator('[data-testid="file-uploader"], .MuiPaper-root:has-text("Drop your file here")').first();
    await expect(iconContainer).toHaveScreenshot('file-uploader-icon.png');
  });
});

test.describe('FileUploader - Drag and Drop States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });
    await waitForStableUI(page);
  });

  test('should show drag-over state', async ({ page }) => {
    const uploadArea = page.locator('[data-testid="file-uploader"], .MuiPaper-root:has-text("Drop your file here")').first();

    // Simulate drag over by adding the drag-over class
    await page.evaluate(() => {
      const uploadElement = document.querySelector('.MuiPaper-root');
      if (uploadElement) {
        uploadElement.classList.add('drag-over');
      }
    });

    await page.waitForTimeout(300); // Wait for CSS transition
    await hideDynamicElements(page);

    await expect(uploadArea).toHaveScreenshot('file-uploader-drag-over.png');
  });
});

test.describe('FileUploader - Layout and Typography', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Welcome to Face Marker Web', { timeout: 30000 });
    await waitForStableUI(page);
  });

  test('should render upload text correctly', async ({ page }) => {
    await hideDynamicElements(page);

    const uploadText = page.locator('text=Drop your file here or click to browse');
    await expect(uploadText).toBeVisible();

    // Screenshot the text with surrounding context
    const textContainer = page.locator('[data-testid="file-uploader"], .MuiPaper-root:has-text("Drop your file here")').first();
    await expect(textContainer).toHaveScreenshot('file-uploader-text.png');
  });

  test('should show supported formats message', async ({ page }) => {
    await hideDynamicElements(page);

    const formatsText = page.locator('text=Supported formats');
    await expect(formatsText).toBeVisible();
  });
});
