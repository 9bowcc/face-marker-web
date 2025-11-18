/**
 * Image processing service
 */

import type { FaceDetection, ProcessingOptions, MediaFile } from '../types';
import { getFaceDetectionService } from './faceDetection';
import { applyBlurToRegions } from '../utils/blur';

export class ImageProcessingService {
  async processImage(
    file: File,
    options: Partial<ProcessingOptions> = {}
  ): Promise<{ faces: FaceDetection[]; canvas: HTMLCanvasElement; mediaFile: MediaFile }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = async () => {
        try {
          // Create canvas
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Could not get canvas context');
          }

          // Draw image
          ctx.drawImage(img, 0, 0);

          // Detect faces
          const faceDetectionService = getFaceDetectionService();
          const faces = await faceDetectionService.detectFaces(img, options);

          const mediaFile: MediaFile = {
            file,
            type: 'image',
            url,
            width: img.width,
            height: img.height,
          };

          resolve({ faces, canvas, mediaFile });
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  }

  applyBlur(
    canvas: HTMLCanvasElement,
    faces: FaceDetection[],
    blurIntensity: number
  ): void {
    const regions = faces.map((face) => face.box);
    applyBlurToRegions(canvas, regions, { intensity: blurIntensity, padding: 10 });
  }

  async exportImage(canvas: HTMLCanvasElement, format: 'png' | 'jpeg' = 'png', quality = 0.95): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to export image'));
          }
        },
        format === 'png' ? 'image/png' : 'image/jpeg',
        quality
      );
    });
  }

  downloadImage(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const imageProcessingService = new ImageProcessingService();
