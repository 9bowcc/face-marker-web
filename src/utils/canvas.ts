/**
 * Canvas utility functions for cleanup and management
 */

/**
 * Safely cleanup a canvas element by clearing its content and resetting dimensions
 * @param canvas - The canvas element to cleanup, or null
 */
export const cleanupCanvas = (canvas: HTMLCanvasElement | null): void => {
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  canvas.width = 0;
  canvas.height = 0;
};

/**
 * Get 2D rendering context from a canvas element
 * @param canvas - The canvas element
 * @returns The 2D rendering context or null if unavailable
 */
export const getCanvasContext = (
  canvas: HTMLCanvasElement | null
): CanvasRenderingContext2D | null => {
  if (!canvas) return null;
  return canvas.getContext('2d');
};

/**
 * Set canvas dimensions
 * @param canvas - The canvas element
 * @param width - The width to set
 * @param height - The height to set
 */
export const setCanvasDimensions = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): void => {
  canvas.width = width;
  canvas.height = height;
};

/**
 * Clear canvas content
 * @param canvas - The canvas element to clear
 */
export const clearCanvas = (canvas: HTMLCanvasElement | null): void => {
  if (!canvas) return;

  const ctx = getCanvasContext(canvas);
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};
