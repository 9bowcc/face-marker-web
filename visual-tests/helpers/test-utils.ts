/**
 * Helper utilities for visual regression tests
 */

import { Page } from '@playwright/test';
import path from 'path';

interface WindowWithMockData extends Window {
  __MOCK_FACE_DETECTION__?: boolean;
  __MOCK_FACES__?: Array<{
    id: string;
    box: { xMin: number; yMin: number; width: number; height: number };
    keypoints: unknown[];
    score: number;
  }>;
  __MOCK_LOADING__?: boolean;
  __MOCK_ERROR__?: string;
}

/**
 * Common viewport sizes for responsive testing
 */
export const VIEWPORTS = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  largeDesktop: { width: 1920, height: 1080 },
};

/**
 * Wait for all animations and transitions to complete
 */
export async function waitForStableUI(page: Page, timeout = 1000): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(timeout);
}

/**
 * Hide dynamic elements that change between test runs
 */
export async function hideDynamicElements(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      /* Hide elements with changing content */
      [data-testid="timestamp"],
      .timestamp,
      [class*="CircularProgress"] {
        visibility: hidden !important;
      }
    `,
  });
}

/**
 * Mock file upload for testing
 */
export async function mockFileUpload(
  page: Page,
  fileType: 'image' | 'video'
): Promise<void> {
  const filePath = path.join(
    __dirname,
    '..',
    'fixtures',
    fileType === 'image' ? 'test-image.jpg' : 'test-video.mp4'
  );

  // Set up file chooser handler
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.click('input[type="file"]', { force: true }),
  ]);

  await fileChooser.setFiles(filePath);
}

/**
 * Wait for face detection to complete
 */
export async function waitForFaceDetection(page: Page): Promise<void> {
  // Wait for the loading state to disappear
  await page.waitForSelector('text=Detecting faces...', { state: 'hidden', timeout: 30000 });
  await waitForStableUI(page);
}

/**
 * Inject mock face detection results for consistent screenshots
 */
export async function mockFaceDetection(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Mock the face detection service to return consistent results
    const win = window as unknown as WindowWithMockData;
    win.__MOCK_FACE_DETECTION__ = true;
    win.__MOCK_FACES__ = [
      {
        id: 'face-1',
        box: { xMin: 100, yMin: 100, width: 150, height: 150 },
        keypoints: [],
        score: 0.95,
      },
      {
        id: 'face-2',
        box: { xMin: 300, yMin: 150, width: 140, height: 140 },
        keypoints: [],
        score: 0.92,
      },
    ];
  });
}

/**
 * Take a full page screenshot with consistent settings
 */
export async function takeFullPageScreenshot(
  page: Page,
  name: string,
  options: {
    hideDynamic?: boolean;
    waitForStable?: boolean;
    fullPage?: boolean;
  } = {}
): Promise<void> {
  const {
    hideDynamic = true,
    waitForStable = true,
    fullPage = false,
  } = options;

  if (hideDynamic) {
    await hideDynamicElements(page);
  }

  if (waitForStable) {
    await waitForStableUI(page);
  }

  await page.screenshot({
    fullPage,
    animations: 'disabled',
  });
}

/**
 * Take a screenshot of a specific element
 */
export async function takeElementScreenshot(
  page: Page,
  selector: string
): Promise<void> {
  await waitForStableUI(page);
  const element = page.locator(selector);
  await element.screenshot();
}

/**
 * Set viewport size and wait for reflow
 */
export async function setViewport(
  page: Page,
  viewport: { width: number; height: number }
): Promise<void> {
  await page.setViewportSize(viewport);
  await page.waitForTimeout(500); // Wait for CSS transitions
}

/**
 * Mock loading state for consistent screenshots
 */
export async function mockLoadingState(page: Page, isLoading: boolean): Promise<void> {
  await page.evaluate((loading) => {
    (window as unknown as WindowWithMockData).__MOCK_LOADING__ = loading;
  }, isLoading);
}

/**
 * Mock error state for consistent screenshots
 */
export async function mockErrorState(page: Page, errorMessage: string): Promise<void> {
  await page.evaluate((message) => {
    (window as unknown as WindowWithMockData).__MOCK_ERROR__ = message;
  }, errorMessage);
}
