import { MediaFile, SUPPORTED_IMAGE_TYPES, SUPPORTED_VIDEO_TYPES, MAX_FILE_SIZE, MAX_FILE_SIZE_MB } from '../types';

export function generateId(): string {
  return crypto.randomUUID();
}

export function createBlobURL(file: File): string {
  return URL.createObjectURL(file);
}

export function revokeBlobURL(url: string): void {
  URL.revokeObjectURL(url);
}

export function isImageFile(file: File): boolean {
  return SUPPORTED_IMAGE_TYPES.includes(file.type);
}

export function isVideoFile(file: File): boolean {
  return SUPPORTED_VIDEO_TYPES.includes(file.type);
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit` };
  }
  
  if (!isImageFile(file) && !isVideoFile(file)) {
    return { valid: false, error: 'Unsupported file type. Please upload JPG, PNG, WebP, MP4, or WebM.' };
  }
  
  return { valid: true };
}

export async function loadImageToCanvas(
  imageSrc: string,
  canvas: HTMLCanvasElement
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(img);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
}

export async function fileToMediaFile(file: File): Promise<MediaFile> {
  const blobUrl = createBlobURL(file);
  const type = isImageFile(file) ? 'image' : 'video';
  
  const dimensions = await getMediaDimensions(blobUrl, type);
  
  return {
    id: generateId(),
    name: file.name,
    mimeType: file.type,
    size: file.size,
    width: dimensions.width,
    height: dimensions.height,
    blobUrl,
    uploadedAt: new Date(),
    type,
  };
}

async function getMediaDimensions(
  src: string,
  type: 'image' | 'video'
): Promise<{ width: number; height: number }> {
  if (type === 'image') {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = src;
    });
  } else {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.onloadedmetadata = () => resolve({ width: video.videoWidth, height: video.videoHeight });
      video.onerror = reject;
      video.src = src;
    });
  }
}
