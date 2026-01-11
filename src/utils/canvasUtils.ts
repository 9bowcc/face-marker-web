import { BoundingBox } from '../types';

export function applyBlur(
  ctx: CanvasRenderingContext2D,
  region: BoundingBox,
  intensity: number
): void {
  const { x, y, width, height } = region;

  const clampedIntensity = Math.max(1, Math.min(100, intensity));

  // 강력한 blur 적용
  const BLUR_SCALE = 2.5;
  const blurPx = Math.round(Math.pow(clampedIntensity / 100, 1.5) * 100 * BLUR_SCALE);

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

  // Step 1: 강력한 blur 적용
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

  // Step 2: 픽셀화 (pixelation) 적용 - blur 효과와 결합
  // blur보다 더 작은 픽셀 블록으로 모자이크와 차별화
  const faceSize = Math.min(width, height);
  const PIXEL_BLOCK_SIZE = Math.max(3, Math.floor(faceSize / 16));

  // 임시 캔버스로 픽셀화 적용
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) {
    ctx.restore();
    return;
  }

  tempCanvas.width = width;
  tempCanvas.height = height;

  // 작은 크기로 다운샘플링
  tempCtx.drawImage(
    ctx.canvas,
    x,
    y,
    width,
    height,
    0,
    0,
    PIXEL_BLOCK_SIZE,
    PIXEL_BLOCK_SIZE
  );

  // 원래 크기로 업샘플링 (픽셀화 효과)
  ctx.filter = 'none';
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    tempCanvas,
    0,
    0,
    PIXEL_BLOCK_SIZE,
    PIXEL_BLOCK_SIZE,
    x,
    y,
    width,
    height
  );
  ctx.imageSmoothingEnabled = true;

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

export function applyMosaic(
  ctx: CanvasRenderingContext2D,
  region: BoundingBox,
  intensity: number
): void {
  const { x, y, width, height } = region;

  const clampedIntensity = Math.max(1, Math.min(100, intensity));

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

  // 픽셀 블록 크기 계산 (intensity에 비례)
  const faceSize = Math.min(width, height);
  const BASE_BLOCK_SIZE = Math.floor(faceSize / 10);
  const INTENSITY_MULTIPLIER = clampedIntensity / 50;
  const blockSize = Math.max(2, Math.floor(BASE_BLOCK_SIZE * INTENSITY_MULTIPLIER));

  // 임시 캔버스로 픽셀화 적용
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) {
    ctx.restore();
    return;
  }

  tempCanvas.width = width;
  tempCanvas.height = height;

  // 작은 크기로 다운샘플링
  const smallWidth = Math.max(1, Math.floor(width / blockSize));
  const smallHeight = Math.max(1, Math.floor(height / blockSize));

  tempCtx.drawImage(
    ctx.canvas,
    x,
    y,
    width,
    height,
    0,
    0,
    smallWidth,
    smallHeight
  );

  // 원래 크기로 업샘플링 (픽셀화 효과)
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    tempCanvas,
    0,
    0,
    smallWidth,
    smallHeight,
    x,
    y,
    width,
    height
  );
  ctx.imageSmoothingEnabled = true;

  ctx.restore();
}

export function clearCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

export function extractFaceThumbnail(
  sourceCanvas: HTMLCanvasElement,
  region: BoundingBox,
  thumbnailSize: number = 80
): string {
  const ctx = sourceCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  const { x, y, width, height } = region;

  const thumbnailCanvas = document.createElement('canvas');
  thumbnailCanvas.width = thumbnailSize;
  thumbnailCanvas.height = thumbnailSize;
  const thumbnailCtx = thumbnailCanvas.getContext('2d');

  if (!thumbnailCtx) {
    throw new Error('Failed to create thumbnail canvas context');
  }

  thumbnailCtx.drawImage(
    sourceCanvas,
    x,
    y,
    width,
    height,
    0,
    0,
    thumbnailSize,
    thumbnailSize
  );

  return thumbnailCanvas.toDataURL('image/jpeg', 0.8);
}
