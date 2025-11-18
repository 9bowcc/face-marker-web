/**
 * Face detection service using TensorFlow.js and MediaPipe
 * Supports WebGPU acceleration for better performance
 */

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgpu';
import * as faceDetection from '@tensorflow-models/face-detection';
import type { FaceDetection, BoundingBox, ProcessingOptions } from '../types';

export class FaceDetectionService {
  private detector: faceDetection.FaceDetector | null = null;
  private isInitialized = false;
  private useWebGPU = true;

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
        maxFaces: options.maxFaces || 10,
        modelType: 'short', // 'short' for faster detection, 'full' for better accuracy
      };

      this.detector = await faceDetection.createDetector(model, detectorConfig);
      this.isInitialized = true;
      console.log('Face detector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize face detector:', error);
      throw new Error('Failed to initialize face detection model');
    }
  }

  async detectFaces(
    input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
    options: Partial<ProcessingOptions> = {}
  ): Promise<FaceDetection[]> {
    if (!this.detector || !this.isInitialized) {
      throw new Error('Face detector not initialized');
    }

    try {
      const faces = await this.detector.estimateFaces(input, {
        flipHorizontal: false,
      });

      const detections: FaceDetection[] = faces
        .filter((face) => (face.box && (options.detectionConfidence === undefined ||
                         (face.box as any).probability >= options.detectionConfidence)))
        .map((face, index) => {
          const box = face.box;
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
            score: (box as any).probability || 1.0,
          };
        });

      return detections;
    } catch (error) {
      console.error('Error detecting faces:', error);
      return [];
    }
  }

  async dispose(): Promise<void> {
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
    }
    this.isInitialized = false;
  }

  isWebGPUEnabled(): boolean {
    return this.useWebGPU;
  }

  getBackend(): string {
    return tf.getBackend();
  }
}

// Singleton instance
let instance: FaceDetectionService | null = null;

export const getFaceDetectionService = (): FaceDetectionService => {
  if (!instance) {
    instance = new FaceDetectionService();
  }
  return instance;
};
