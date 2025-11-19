/**
 * Test utilities for E2E tests
 */

import { Page } from '@playwright/test';

/**
 * Creates a simple test image as a data URL
 * This creates a small colored rectangle that can be used for testing
 */
export function createTestImage(): string {
  // Return a minimal valid JPEG data URL
  // TODO: Add width, height, and color parameters for future extensibility
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlbaWmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//2Q==';
}

/**
 * Creates a test file from a data URL
 */
export async function createTestFile(
  dataUrl: string,
  fileName: string,
  mimeType: string
): Promise<File> {
  // Convert data URL to blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: mimeType });
}

/**
 * Waits for the face detection to initialize
 */
export async function waitForInitialization(page: Page) {
  // Wait for the initialization message to disappear
  await page.waitForSelector('text=Initializing face detection model', {
    state: 'hidden',
    timeout: 30000,
  });
}

/**
 * Uploads a file using the file input
 */
export async function uploadFile(page: Page, filePath: string) {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(filePath);
}

/**
 * Creates a temporary test image file
 */
export function createTempImagePath(): string {
  // In a real test environment, you would create an actual file
  // For now, we'll use a path that the test will need to provide
  return './e2e/fixtures/test-image.jpg';
}

/**
 * Creates a temporary test video file path
 */
export function createTempVideoPath(): string {
  return './e2e/fixtures/test-video.mp4';
}

/**
 * Waits for face detection to complete
 */
export async function waitForFaceDetection(page: Page) {
  // Wait for face detection to complete
  // This could be indicated by the presence of detected faces or a success message
  await page.waitForTimeout(2000); // Give it time to process
}

/**
 * Mocks the file input for testing
 */
export async function mockFileUpload(
  page: Page,
  fileContent: Buffer,
  fileName: string,
  mimeType: string
) {
  // Create a file chooser promise before clicking
  const fileChooserPromise = page.waitForEvent('filechooser');

  // Click the upload area to trigger file input
  await page.click('text=Drop your file here or click to browse');

  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: fileName,
    mimeType: mimeType,
    buffer: fileContent,
  });
}

/**
 * Gets a simple test JPEG buffer
 */
export function getTestImageBuffer(): Buffer {
  // Minimal valid JPEG
  const base64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABkAGQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlbaWmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//2Q==';
  return Buffer.from(base64, 'base64');
}

/**
 * Gets a simple test video buffer (minimal MP4)
 */
export function getTestVideoBuffer(): Buffer {
  // This is a minimal valid MP4 file (essentially empty)
  // In real tests, you'd want a proper video file
  const hex = '000000206674797069736f6d00000200697361766d70343200000000';
  return Buffer.from(hex, 'hex');
}
