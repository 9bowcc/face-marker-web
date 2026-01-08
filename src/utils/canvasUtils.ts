import { BoundingBox } from '../types';

export function applyBlur(
  ctx: CanvasRenderingContext2D,
  region: BoundingBox,
  intensity: number
): void {
  const { x, y, width, height } = region;
  
  const clampedIntensity = Math.max(1, Math.min(100, intensity));
  const INTENSITY_TO_PIXEL_SCALE = 0.5;
  const blurPx = Math.round(clampedIntensity * INTENSITY_TO_PIXEL_SCALE);
  
  ctx.save();
  
  ctx.beginPath();
  ctx.ellipse(
    x + width / 2,
    y + height / 2,
    width / 2,
    height / 2,
    0,
    0,
    Math.PI * 2
  );
  ctx.clip();
  
  ctx.filter = `blur(${blurPx}px)`;
  
  ctx.drawImage(
    ctx.canvas,
    x - blurPx,
    y - blurPx,
    width + blurPx * 2,
    height + blurPx * 2,
    x - blurPx,
    y - blurPx,
    width + blurPx * 2,
    height + blurPx * 2
  );
  
  ctx.restore();
}

export function applyEmoji(
  ctx: CanvasRenderingContext2D,
  region: BoundingBox,
  emoji: string
): void {
  const { x, y, width, height } = region;
  
  const FACE_SIZE_TO_FONT_SCALE = 0.9;
  const fontSize = Math.min(width, height) * FACE_SIZE_TO_FONT_SCALE;
  
  ctx.save();
  ctx.font = `${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  ctx.fillText(emoji, centerX, centerY);
  
  ctx.restore();
}

export function getImageData(
  canvas: HTMLCanvasElement,
  region?: BoundingBox
): ImageData {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  if (region) {
    return ctx.getImageData(region.x, region.y, region.width, region.height);
  }
  
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export function drawBoundingBox(
  ctx: CanvasRenderingContext2D,
  region: BoundingBox,
  options: {
    color?: string;
    lineWidth?: number;
    selected?: boolean;
  } = {}
): void {
  const { x, y, width, height } = region;
  const {
    color = options.selected ? '#4caf50' : '#2196f3',
    lineWidth = 3,
  } = options;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.strokeRect(x, y, width, height);
  ctx.restore();
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'jpeg' | 'png',
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const qualityValue = format === 'jpeg' ? quality / 100 : undefined;
    
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      mimeType,
      qualityValue
    );
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function clearCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
