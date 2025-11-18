/**
 * Face detection service using TensorFlow.js and MediaPipe
 * Supports WebGPU acceleration for better performance
 */

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgpu';
import * as faceDetection from '@tensorflow-models/face-detection';
import type { FaceDetection, BoundingBox, ProcessingOptions, MediaPipeBox } from '../types';
import { DEFAULT_MAX_FACES, DEFAULT_CONFIDENCE_SCORE } from '../constants';
import { FaceDetectionError } from '../utils/errorHandler';

/**
 * Service for detecting faces in images and videos using TensorFlow.js and MediaPipe.
 * Provides hardware-accelerated face detection with WebGPU support and fallback to WebGL.
 *
 * @example
 * const service = getFaceDetectionService();
 * await service.initialize({ maxFaces: 5 });
 * const faces = await service.detectFaces(imageElement);
 */
export class FaceDetectionService {
  private detector: faceDetection.FaceDetector | null = null;
  private isInitialized = false;
  private useWebGPU = true;

  /**
   * Initializes the face detection service with TensorFlow.js backend and MediaPipe model.
   * Attempts to use WebGPU for hardware acceleration, falling back to WebGL if unavailable.
   *
   * @param options - Configuration options for face detection
   * @param options.useWebGPU - Whether to attempt WebGPU acceleration (default: true)
   * @param options.maxFaces - Maximum number of faces to detect (default: 10)
   * @returns Promise that resolves when initialization is complete
   * @throws Error if face detection model fails to load
   */
  async initialize(options: Partial<ProcessingOptions> = {}): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Try to use WebGPU backend first for acceleration
      if (options.useWebGPU !== false) {
        try {
          await tf.setBackend('webgpu');
          await tf.ready();
          this.useWebGPU = true;
          console.log('WebGPU backend initialized successfully');
        } catch (e) {
          console.warn('WebGPU not available, falling back to WebGL:', e);
          this.useWebGPU = false;
        }
      }

      // Fallback to WebGL if WebGPU is not available
      if (!this.useWebGPU) {
        await tf.setBackend('webgl');
        await tf.ready();
        console.log('WebGL backend initialized');
      }

      // Create MediaPipe Face Detector
      const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
      const detectorConfig: faceDetection.MediaPipeFaceDetectorTfjsModelConfig = {
        runtime: 'tfjs',
        maxFaces: options.maxFaces || DEFAULT_MAX_FACES,
        modelType: 'short', // 'short' for faster detection, 'full' for better accuracy
      };

      this.detector = await faceDetection.createDetector(model, detectorConfig);
      this.isInitialized = true;
      console.log('Face detector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize face detector:', error);
      throw new FaceDetectionError(
        `Failed to initialize face detection model: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'Failed to initialize face detection. Please refresh the page and try again.'
      );
    }
  }

  /**
   * Detects faces in the provided image, video frame, or canvas element.
   * Returns an array of face detections with bounding boxes, keypoints, and confidence scores.
   *
   * @param input - HTML element containing the image/video to analyze (img, video, or canvas)
   * @param options - Detection configuration options
   * @param options.detectionConfidence - Minimum confidence threshold for face detection (0-1)
   * @returns Promise resolving to array of detected faces with bounding boxes and keypoints
   * @throws Error if detector is not initialized
   *
   * @example
   * const faces = await service.detectFaces(imageElement, { detectionConfidence: 0.7 });
   * faces.forEach(face => console.log(face.box, face.score));
   */
  async detectFaces(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    options: Partial<ProcessingOptions> = {}
  ): Promise<FaceDetection[]> {
    if (!this.detector || !this.isInitialized) {
      throw new FaceDetectionError(
        'Face detector not initialized',
        'Face detection is not ready. Please wait for initialization to complete.'
      );
    }

    try {
      const faces = await this.detector.estimateFaces(input, {
        flipHorizontal: false,
      });

      const detections: FaceDetection[] = faces
        .filter((face) => {
          if (!face.box) return false;
          if (options.detectionConfidence === undefined) return true;
          const mediaPipeBox = face.box as MediaPipeBox;
          return mediaPipeBox.probability !== undefined &&
                 mediaPipeBox.probability >= options.detectionConfidence;
        })
        .map((face, index) => {
          const box = face.box as MediaPipeBox;
          const boundingBox: BoundingBox = {
            xMin: box.xMin,
            yMin: box.yMin,
            xMax: box.xMax,
            yMax: box.yMax,
            width: box.width,
            height: box.height,
          };

          return {
            id: `face-${Date.now()}-${index}`,
            box: boundingBox,
            keypoints: face.keypoints?.map((kp) => ({
              x: kp.x,
              y: kp.y,
              name: kp.name,
            })),
            score: box.probability || DEFAULT_CONFIDENCE_SCORE,
          };
        });

      return detections;
    } catch (error) {
      console.error('Error detecting faces:', error);
      return [];
    }
  }

  /**
   * Cleans up resources and disposes of the face detector model.
   * Should be called when the service is no longer needed to free memory.
   *
   * @returns Promise that resolves when cleanup is complete
   */
  async dispose(): Promise<void> {
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
    }
    this.isInitialized = false;
  }

  /**
   * Checks if WebGPU acceleration is currently enabled.
   *
   * @returns True if WebGPU backend is being used, false if using WebGL fallback
   */
  isWebGPUEnabled(): boolean {
    return this.useWebGPU;
  }

  /**
   * Gets the currently active TensorFlow.js backend name.
   *
   * @returns Backend name (e.g., 'webgpu', 'webgl', 'cpu')
   */
  getBackend(): string {
    return tf.getBackend();
  }
}

// Singleton instance
let instance: FaceDetectionService | null = null;

/**
 * Gets or creates a singleton instance of the face detection service.
 * Ensures only one instance of the service exists throughout the application.
 *
 * @returns The singleton FaceDetectionService instance
 *
 * @example
 * const service = getFaceDetectionService();
 * await service.initialize();
 */
export const getFaceDetectionService = (): FaceDetectionService => {
  if (!instance) {
    instance = new FaceDetectionService();
  }
  return instance;
};
