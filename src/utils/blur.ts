/**
 * Blur utilities for face blurring
 */

import type { BoundingBox } from '../types';
import { BLUR_PADDING, MIN_BLUR_RADIUS, THUMBNAIL_MAX_SIZE, THUMBNAIL_QUALITY } from '../constants';

/**
 * Configuration options for blur operations.
 */
export interface BlurOptions {
  /** Blur radius - higher values create stronger blur effect */
  intensity: number;
  /** Extra padding (in pixels) around face bounding box to ensure full coverage */
  padding?: number;
}

/**
 * Applies blur effect to specific rectangular regions on a canvas.
 * Uses the stack blur algorithm for efficient processing of face regions.
 *
 * @param canvas - Canvas element containing the image to blur
 * @param regions - Array of bounding boxes defining regions to blur
 * @param options - Blur configuration options
 * @param options.intensity - Blur radius (higher values = more blur)
 * @param options.padding - Extra padding around each region (default: from constants)
 * @throws Error if canvas context cannot be obtained
 *
 * @example
 * const regions = faces.map(face => face.box);
 * applyBlurToRegions(canvas, regions, { intensity: 20, padding: 10 });
 */
export const applyBlurToRegions = (
  canvas: HTMLCanvasElement,
  regions: BoundingBox[],
  options: BlurOptions
): void => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const padding = options.padding || BLUR_PADDING;
  const blurRadius = Math.max(MIN_BLUR_RADIUS, options.intensity);

  regions.forEach((box) => {
    // Calculate region with padding
    const x = Math.max(0, Math.floor(box.xMin - padding));
    const y = Math.max(0, Math.floor(box.yMin - padding));
    const width = Math.min(
      canvas.width - x,
      Math.ceil(box.width + padding * 2)
    );
    const height = Math.min(
      canvas.height - y,
      Math.ceil(box.height + padding * 2)
    );

    if (width <= 0 || height <= 0) return;

    // Extract the region
    const imageData = ctx.getImageData(x, y, width, height);

    // Apply blur effect using stack blur algorithm (efficient approximation of Gaussian blur)
    const blurred = stackBlur(imageData, blurRadius);

    // Put the blurred region back
    ctx.putImageData(blurred, x, y);
  });
};

/**
 * Stack Blur Algorithm - Fast blur approximation that gives results similar to Gaussian blur.
 *
 * This algorithm provides an efficient way to blur images with quality comparable to Gaussian blur
 * but with significantly better performance (O(n) instead of O(n*r²)).
 *
 * **Algorithm Overview:**
 *
 * Stack Blur works by performing two passes over the image data:
 * 1. Horizontal pass - blurs each row from left to right
 * 2. Vertical pass - blurs each column from top to bottom
 *
 * **Core Concept:**
 *
 * Instead of recalculating the entire blur kernel for each pixel (like Gaussian blur),
 * Stack Blur uses a sliding window approach with running sums:
 *
 * - Maintains three running sums for each color channel (r, g, b, a):
 *   - `sum`: Total sum of pixels in the current window
 *   - `inSum`: Sum of pixels entering the window
 *   - `outSum`: Sum of pixels leaving the window
 *
 * - For each pixel, it updates these sums incrementally rather than recalculating from scratch
 * - This reduces the complexity from O(n*r²) to O(n) where n is pixel count and r is radius
 *
 * **Mathematical Details:**
 *
 * - The algorithm uses a triangular (pyramid) kernel instead of a Gaussian kernel
 * - Kernel weight decreases linearly from center: [1, 2, 3, ..., radius+1, ..., 3, 2, 1]
 * - Total sum factor: (radius+1) * (radius+2) / 2
 * - Each pixel value: sum / (radius+1)²
 *
 * **Two-Pass Approach:**
 *
 * 1. **Horizontal Pass:**
 *    - Process each row independently
 *    - For each pixel, calculate weighted average of surrounding pixels horizontally
 *    - Update running sums as the window slides across the row
 *
 * 2. **Vertical Pass:**
 *    - Process each column independently
 *    - For each pixel, calculate weighted average of surrounding pixels vertically
 *    - Update running sums as the window slides down the column
 *
 * **Edge Handling:**
 *
 * - Near image edges, the algorithm clamps pixel coordinates to stay within bounds
 * - Uses Math.min/Math.max to ensure indices don't exceed image dimensions
 * - This creates a slight edge-repeat effect at image borders
 *
 * **Performance Characteristics:**
 *
 * - Time Complexity: O(width * height) - linear in number of pixels
 * - Space Complexity: O(1) - modifies image data in place
 * - Typically 7-10x faster than true Gaussian blur
 * - Quality is ~95% similar to Gaussian blur for most use cases
 *
 * **Trade-offs:**
 *
 * - Pros: Very fast, good quality, simple implementation
 * - Cons: Not a true Gaussian blur, slight quality difference at high radii
 *
 * @param imageData - Image data to blur (RGBA format from canvas context)
 * @param radius - Blur radius (larger values = more blur)
 * @returns Blurred image data (modified in place and returned)
 *
 * @example
 * const imageData = ctx.getImageData(0, 0, width, height);
 * const blurred = stackBlur(imageData, 20);
 * ctx.putImageData(blurred, 0, 0);
 */
function stackBlur(imageData: ImageData, radius: number): ImageData {
  const pixels = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  const radiusPlus1 = radius + 1;
  const sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;

  let r, g, b, a;
  let rSum, gSum, bSum, aSum;
  let rOutSum, gOutSum, bOutSum, aOutSum;
  let rInSum, gInSum, bInSum, aInSum;

  const widthMinus1 = width - 1;
  const heightMinus1 = height - 1;
  const radiusPlus1Squared = radiusPlus1 * radiusPlus1;

  let x, y, i, p, yi, yw;

  let p1, p2;

  // Horizontal blur
  yw = yi = 0;

  for (y = 0; y < height; y++) {
    rInSum = gInSum = bInSum = aInSum = rSum = gSum = bSum = aSum = 0;

    p = yi << 2;
    r = pixels[p];
    g = pixels[p + 1];
    b = pixels[p + 2];
    a = pixels[p + 3];

    rOutSum = radiusPlus1 * r;
    gOutSum = radiusPlus1 * g;
    bOutSum = radiusPlus1 * b;
    aOutSum = radiusPlus1 * a;

    rSum += sumFactor * r;
    gSum += sumFactor * g;
    bSum += sumFactor * b;
    aSum += sumFactor * a;

    for (i = 1; i <= radius; i++) {
      p = (yi + Math.min(widthMinus1, i)) << 2;
      r = pixels[p];
      g = pixels[p + 1];
      b = pixels[p + 2];
      a = pixels[p + 3];

      rSum += (r * (radiusPlus1 - i));
      gSum += (g * (radiusPlus1 - i));
      bSum += (b * (radiusPlus1 - i));
      aSum += (a * (radiusPlus1 - i));

      rInSum += r;
      gInSum += g;
      bInSum += b;
      aInSum += a;
    }

    for (x = 0; x < width; x++) {
      pixels[yi << 2] = (rSum / radiusPlus1Squared) | 0;
      pixels[(yi << 2) + 1] = (gSum / radiusPlus1Squared) | 0;
      pixels[(yi << 2) + 2] = (bSum / radiusPlus1Squared) | 0;
      pixels[(yi << 2) + 3] = (aSum / radiusPlus1Squared) | 0;

      rSum -= rOutSum;
      gSum -= gOutSum;
      bSum -= bOutSum;
      aSum -= aOutSum;

      p1 = (yi + radiusPlus1) | 0;
      p2 = (yi - radius) | 0;

      p = (yw + Math.min(widthMinus1, p1)) << 2;

      rInSum += pixels[p];
      gInSum += pixels[p + 1];
      bInSum += pixels[p + 2];
      aInSum += pixels[p + 3];

      rSum += rInSum;
      gSum += gInSum;
      bSum += bInSum;
      aSum += aInSum;

      p = (yw + Math.max(0, p2)) << 2;

      r = pixels[p];
      g = pixels[p + 1];
      b = pixels[p + 2];
      a = pixels[p + 3];

      rOutSum += r;
      gOutSum += g;
      bOutSum += b;
      aOutSum += a;

      rInSum -= r;
      gInSum -= g;
      bInSum -= b;
      aInSum -= a;

      yi++;
    }
    yw += width;
  }

  // Vertical blur
  for (x = 0; x < width; x++) {
    rInSum = gInSum = bInSum = aInSum = rSum = gSum = bSum = aSum = 0;

    yi = x << 2;
    r = pixels[yi];
    g = pixels[yi + 1];
    b = pixels[yi + 2];
    a = pixels[yi + 3];

    rOutSum = radiusPlus1 * r;
    gOutSum = radiusPlus1 * g;
    bOutSum = radiusPlus1 * b;
    aOutSum = radiusPlus1 * a;

    rSum += sumFactor * r;
    gSum += sumFactor * g;
    bSum += sumFactor * b;
    aSum += sumFactor * a;

    for (i = 1; i <= radius; i++) {
      yi = (x + Math.min(heightMinus1, i) * width) << 2;

      r = pixels[yi];
      g = pixels[yi + 1];
      b = pixels[yi + 2];
      a = pixels[yi + 3];

      rSum += (r * (radiusPlus1 - i));
      gSum += (g * (radiusPlus1 - i));
      bSum += (b * (radiusPlus1 - i));
      aSum += (a * (radiusPlus1 - i));

      rInSum += r;
      gInSum += g;
      bInSum += b;
      aInSum += a;
    }

    yi = x;

    for (y = 0; y < height; y++) {
      p = yi << 2;
      pixels[p] = (rSum / radiusPlus1Squared) | 0;
      pixels[p + 1] = (gSum / radiusPlus1Squared) | 0;
      pixels[p + 2] = (bSum / radiusPlus1Squared) | 0;
      pixels[p + 3] = (aSum / radiusPlus1Squared) | 0;

      rSum -= rOutSum;
      gSum -= gOutSum;
      bSum -= bOutSum;
      aSum -= aOutSum;

      p1 = y + radiusPlus1;
      p2 = y - radius;

      yi = (x + Math.min(heightMinus1, p1) * width) << 2;

      rInSum += pixels[yi];
      gInSum += pixels[yi + 1];
      bInSum += pixels[yi + 2];
      aInSum += pixels[yi + 3];

      rSum += rInSum;
      gSum += gInSum;
      bSum += bInSum;
      aSum += aInSum;

      yi = (x + Math.max(0, p2) * width) << 2;

      r = pixels[yi];
      g = pixels[yi + 1];
      b = pixels[yi + 2];
      a = pixels[yi + 3];

      rOutSum += r;
      gOutSum += g;
      bOutSum += b;
      aOutSum += a;

      rInSum -= r;
      gInSum -= g;
      bInSum -= b;
      aInSum -= a;

      yi += width;
    }
  }

  return imageData;
}

/**
 * Creates a preview thumbnail image of a face region from a canvas.
 * Extracts the specified bounding box area and scales it down to thumbnail size.
 *
 * @param canvas - Source canvas containing the full image
 * @param box - Bounding box defining the face region to extract
 * @param maxSize - Maximum dimension (width or height) of the thumbnail in pixels (default: from constants)
 * @returns Data URL string (base64-encoded JPEG) of the thumbnail, or empty string if creation fails
 *
 * @example
 * const thumbnail = createFaceThumbnail(canvas, faceBox, 100);
 * imageElement.src = thumbnail; // Display thumbnail
 */
export const createFaceThumbnail = (
  canvas: HTMLCanvasElement,
  box: BoundingBox,
  maxSize = THUMBNAIL_MAX_SIZE
): string => {
  const tempCanvas = document.createElement('canvas');
  const ctx = tempCanvas.getContext('2d');
  if (!ctx) return '';

  const sourceCanvas = canvas;
  const sourceCtx = sourceCanvas.getContext('2d');
  if (!sourceCtx) return '';

  // Calculate thumbnail dimensions
  const scale = Math.min(maxSize / box.width, maxSize / box.height);
  tempCanvas.width = box.width * scale;
  tempCanvas.height = box.height * scale;

  // Draw the face region
  ctx.drawImage(
    sourceCanvas,
    box.xMin, box.yMin, box.width, box.height,
    0, 0, tempCanvas.width, tempCanvas.height
  );

  return tempCanvas.toDataURL('image/jpeg', THUMBNAIL_QUALITY);
};
