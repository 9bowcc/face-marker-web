/**
 * Blur utilities for face blurring
 */

import type { BoundingBox } from '../types';

export interface BlurOptions {
  intensity: number; // Blur radius
  padding?: number; // Extra padding around face box
}

/**
 * Apply blur effect to specific regions on a canvas
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

  const padding = options.padding || 10;
  const blurRadius = Math.max(1, options.intensity);

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
 * Stack Blur Algorithm
 * Fast blur approximation that gives results similar to Gaussian blur
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
 * Create a preview thumbnail of a face region
 */
export const createFaceThumbnail = (
  canvas: HTMLCanvasElement,
  box: BoundingBox,
  maxSize = 100
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

  return tempCanvas.toDataURL('image/jpeg', 0.8);
};
