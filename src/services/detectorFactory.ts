import {
  initializeMediaPipe,
  isMediaPipeReady,
  detectFacesWithMediaPipe,
  disposeMediaPipe,
} from './mediaPipeService';
import {
  initializeFaceApi,
  isFaceApiReady,
  detectFacesWithFaceApi,
  disposeFaceApi,
} from './faceApiService';
import { DetectedFace, DetectionOptions } from '../types';

export type DetectorType = 'mediapipe' | 'faceapi' | 'auto';

interface Detector {
  initialize: () => Promise<void>;
  isReady: () => boolean;
  detect: (
    image: HTMLImageElement | HTMLCanvasElement,
    options?: Partial<DetectionOptions>
  ) => Promise<DetectedFace[]>;
  dispose: () => void;
}

const detectors: Record<'mediapipe' | 'faceapi', Detector> = {
  mediapipe: {
    initialize: initializeMediaPipe,
    isReady: isMediaPipeReady,
    detect: detectFacesWithMediaPipe,
    dispose: disposeMediaPipe,
  },
  faceapi: {
    initialize: initializeFaceApi,
    isReady: isFaceApiReady,
    detect: detectFacesWithFaceApi,
    dispose: disposeFaceApi,
  },
};

let currentDetectorType: 'mediapipe' | 'faceapi' = 'mediapipe';

export async function initializeDetector(type: DetectorType = 'auto'): Promise<'mediapipe' | 'faceapi'> {
  if (type === 'auto') {
    try {
      await detectors.mediapipe.initialize();
      currentDetectorType = 'mediapipe';
      return 'mediapipe';
    } catch {
      console.warn('MediaPipe failed, falling back to face-api.js');
      await detectors.faceapi.initialize();
      currentDetectorType = 'faceapi';
      return 'faceapi';
    }
  }

  await detectors[type].initialize();
  currentDetectorType = type;
  return type;
}

export function isDetectorReady(): boolean {
  return detectors[currentDetectorType].isReady();
}

export async function detectFaces(
  image: HTMLImageElement | HTMLCanvasElement,
  options?: Partial<DetectionOptions>
): Promise<DetectedFace[]> {
  return detectors[currentDetectorType].detect(image, options);
}

export function getCurrentDetectorType(): 'mediapipe' | 'faceapi' {
  return currentDetectorType;
}

export async function switchDetector(type: 'mediapipe' | 'faceapi'): Promise<void> {
  if (type === currentDetectorType && detectors[type].isReady()) {
    return;
  }

  detectors[currentDetectorType].dispose();
  await detectors[type].initialize();
  currentDetectorType = type;
}

export function disposeDetector(): void {
  detectors[currentDetectorType].dispose();
}
