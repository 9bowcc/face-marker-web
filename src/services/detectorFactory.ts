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

const loadMediaPipeService = async () => {
  const module = await import('./mediaPipeService');
  return {
    initialize: module.initializeMediaPipe,
    isReady: module.isMediaPipeReady,
    detect: module.detectFacesWithMediaPipe,
    dispose: module.disposeMediaPipe,
  };
};

const loadFaceApiService = async () => {
  const module = await import('./faceApiService');
  return {
    initialize: module.initializeFaceApi,
    isReady: module.isFaceApiReady,
    detect: module.detectFacesWithFaceApi,
    dispose: module.disposeFaceApi,
  };
};

let detectors: Record<'mediapipe' | 'faceapi', Detector> | null = null;
let currentDetectorType: 'mediapipe' | 'faceapi' = 'mediapipe';

async function ensureDetectorsLoaded(): Promise<Record<'mediapipe' | 'faceapi', Detector>> {
  if (!detectors) {
    const [mediapipe, faceapi] = await Promise.all([
      loadMediaPipeService(),
      loadFaceApiService(),
    ]);
    detectors = { mediapipe, faceapi };
  }
  return detectors;
}

export async function initializeDetector(type: DetectorType = 'auto'): Promise<'mediapipe' | 'faceapi'> {
  const loadedDetectors = await ensureDetectorsLoaded();
  
  if (type === 'auto') {
    try {
      await loadedDetectors.mediapipe.initialize();
      currentDetectorType = 'mediapipe';
      return 'mediapipe';
    } catch {
      console.warn('MediaPipe failed, falling back to face-api.js');
      await loadedDetectors.faceapi.initialize();
      currentDetectorType = 'faceapi';
      return 'faceapi';
    }
  }

  await loadedDetectors[type].initialize();
  currentDetectorType = type;
  return type;
}

export async function isDetectorReady(): Promise<boolean> {
  if (!detectors) return false;
  return detectors[currentDetectorType].isReady();
}

const MIN_FACES_FOR_AUTO_FALLBACK = 3;

export async function detectFaces(
  image: HTMLImageElement | HTMLCanvasElement,
  options?: Partial<DetectionOptions> & { sourceCanvas?: HTMLCanvasElement }
): Promise<DetectedFace[]> {
  const loadedDetectors = await ensureDetectorsLoaded();
  const faces = await loadedDetectors[currentDetectorType].detect(image, options);

  if (currentDetectorType === 'mediapipe' && faces.length <= MIN_FACES_FOR_AUTO_FALLBACK) {
    try {
      if (!loadedDetectors.faceapi.isReady()) {
        await loadedDetectors.faceapi.initialize();
      }
      const faceApiFaces = await loadedDetectors.faceapi.detect(image, options);
      if (faceApiFaces.length > faces.length) {
        return faceApiFaces;
      }
    } catch {
      return faces;
    }
  }

  return faces;
}

export function getCurrentDetectorType(): 'mediapipe' | 'faceapi' {
  return currentDetectorType;
}

export async function switchDetector(type: 'mediapipe' | 'faceapi'): Promise<void> {
  const loadedDetectors = await ensureDetectorsLoaded();
  
  if (type === currentDetectorType && loadedDetectors[type].isReady()) {
    return;
  }

  loadedDetectors[currentDetectorType].dispose();
  await loadedDetectors[type].initialize();
  currentDetectorType = type;
}

export async function disposeDetector(): Promise<void> {
  if (!detectors) return;
  detectors[currentDetectorType].dispose();
}
