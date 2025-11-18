/**
 * Image processing service
 */

import type { FaceDetection, ProcessingOptions, MediaFile } from '../types';
import { getFaceDetectionService } from './faceDetection';
import { applyBlurToRegions } from '../utils/blur';
import { BLUR_PADDING, DEFAULT_EXPORT_QUALITY } from '../constants';
import { ImageProcessingError } from '../utils/errorHandler';

/**
 * Service for processing images with face detection and blur effects.
 * Handles image loading, face detection, blur application, and export operations.
 *
 * @example
 * const service = new ImageProcessingService();
 * const { faces, canvas } = await service.processImage(imageFile);
 * service.applyBlur(canvas, faces, 20);
 */
export class ImageProcessingService {
  /**
   * Processes an image file by loading it, detecting faces, and preparing a canvas.
   * Creates a canvas with the image drawn on it and returns all detected faces.
   *
   * @param file - Image file to process (JPEG, PNG, etc.)
   * @param options - Processing configuration options
   * @param options.maxFaces - Maximum number of faces to detect
   * @param options.detectionConfidence - Minimum confidence threshold for detections
   * @returns Promise resolving to object containing detected faces, canvas, and media file metadata
   * @throws Error if image fails to load or canvas context cannot be created
   *
   * @example
   * const result = await service.processImage(file, { maxFaces: 5 });
   * console.log(`Found ${result.faces.length} faces`);
   */
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
            URL.revokeObjectURL(url);
            throw new ImageProcessingError(
              'Could not get canvas 2d context',
              'Failed to initialize image processing. Your browser may not support this feature.'
            );
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

          // Revoke URL after image is loaded and drawn to canvas
          URL.revokeObjectURL(url);

          resolve({ faces, canvas, mediaFile });
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new ImageProcessingError(
          'Failed to load image file',
          'Failed to load image. The file may be corrupted or in an unsupported format.'
        ));
      };

      img.src = url;
    });
  }

  /**
   * Applies blur effect to detected face regions on a canvas.
   * Uses stack blur algorithm for efficient processing.
   *
   * @param canvas - Canvas containing the image to blur
   * @param faces - Array of face detections with bounding boxes
   * @param blurIntensity - Blur radius intensity (higher values = more blur)
   *
   * @example
   * service.applyBlur(canvas, faces, 25);
   */
  applyBlur(
    canvas: HTMLCanvasElement,
    faces: FaceDetection[],
    blurIntensity: number
  ): void {
    const regions = faces.map((face) => face.box);
    applyBlurToRegions(canvas, regions, { intensity: blurIntensity, padding: BLUR_PADDING });
  }

  /**
   * Exports a canvas as an image blob in the specified format.
   * Converts the canvas content to a binary blob for download or further processing.
   *
   * @param canvas - Canvas to export
   * @param format - Output image format ('png' or 'jpeg', default: 'png')
   * @param quality - JPEG quality from 0 to 1 (default: 0.95, only applies to JPEG)
   * @returns Promise resolving to image blob
   * @throws Error if blob creation fails
   *
   * @example
   * const blob = await service.exportImage(canvas, 'jpeg', 0.9);
   */
  async exportImage(canvas: HTMLCanvasElement, format: 'png' | 'jpeg' = 'png', quality = DEFAULT_EXPORT_QUALITY): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new ImageProcessingError(
              'Failed to convert canvas to blob',
              'Failed to export image. Please try again.'
            ));
          }
        },
        format === 'png' ? 'image/png' : 'image/jpeg',
        quality
      );
    });
  }

  /**
   * Triggers a download of an image blob to the user's device.
   * Creates a temporary anchor element to initiate the browser download.
   *
   * @param blob - Image blob to download
   * @param filename - Desired filename for the downloaded file
   *
   * @example
   * const blob = await service.exportImage(canvas);
   * service.downloadImage(blob, 'blurred-photo.png');
   */
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
