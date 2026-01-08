import * as faceapi from 'face-api.js';
import { DetectedFace, DetectionOptions } from '../types';
import { generateId } from '../utils/imageUtils';

let isInitialized = false;

const DEFAULT_OPTIONS: DetectionOptions = {
  minConfidence: 0.5,
  maxFaces: 20,
};

const MODEL_URL = '/face-marker-web/models';

export async function initializeFaceApi(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize face-api.js:', error);
    throw new Error('Failed to initialize face-api.js detector');
  }
}

export function isFaceApiReady(): boolean {
  return isInitialized;
}

export async function detectFacesWithFaceApi(
  image: HTMLImageElement | HTMLCanvasElement,
  options: Partial<DetectionOptions> = {}
): Promise<DetectedFace[]> {
  if (!isInitialized) {
    await initializeFaceApi();
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const detections = await faceapi.detectAllFaces(
      image,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: opts.minConfidence,
      })
    );

    return detections
      .slice(0, opts.maxFaces)
      .map((detection): DetectedFace => {
        const box = detection.box;
        return {
          id: generateId(),
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          confidence: detection.score,
          isSelected: true,
          detectedBy: 'faceapi',
        };
      });
  } catch (error) {
    console.error('face-api.js detection error:', error);
    throw new Error('Face detection failed');
  }
}

export function disposeFaceApi(): void {
  // face-api.js doesn't require explicit disposal
  isInitialized = false;
}
