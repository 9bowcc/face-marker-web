import { FaceDetector, FilesetResolver, Detection } from '@mediapipe/tasks-vision';
import { DetectedFace, DetectionOptions, BoundingBox } from '../types';
import { generateId } from '../utils/imageUtils';
import { extractFaceThumbnail } from '../utils/canvasUtils';

let detector: FaceDetector | null = null;
let isInitialized = false;

const DEFAULT_OPTIONS: DetectionOptions = {
  minConfidence: 0.3,
  maxFaces: 50,
};

export async function initializeMediaPipe(): Promise<void> {
  if (isInitialized && detector) {
    return;
  }

  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    detector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      minDetectionConfidence: DEFAULT_OPTIONS.minConfidence,
    });

    isInitialized = true;
  } catch (error) {
    console.error('Failed to initialize MediaPipe:', error);
    throw new Error('Failed to initialize MediaPipe face detector');
  }
}

export function isMediaPipeReady(): boolean {
  return isInitialized && detector !== null;
}

export async function detectFacesWithMediaPipe(
  image: HTMLImageElement | HTMLCanvasElement,
  options: Partial<DetectionOptions> & { sourceCanvas?: HTMLCanvasElement } = {}
): Promise<DetectedFace[]> {
  if (!detector) {
    await initializeMediaPipe();
  }

  if (!detector) {
    throw new Error('MediaPipe detector not initialized');
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const result = detector.detect(image);

    const faces: DetectedFace[] = result.detections
      .filter((d: Detection) => (d.categories?.[0]?.score ?? 0) >= opts.minConfidence)
      .slice(0, opts.maxFaces)
      .map((detection: Detection): DetectedFace => {
        const box = detection.boundingBox!;
        const face: DetectedFace = {
          id: generateId(),
          x: box.originX,
          y: box.originY,
          width: box.width,
          height: box.height,
          confidence: detection.categories?.[0]?.score ?? 0,
          isSelected: true,
          detectedBy: 'mediapipe',
        };

        if (opts.sourceCanvas) {
          const region: BoundingBox = {
            x: face.x,
            y: face.y,
            width: face.width,
            height: face.height,
          };
          face.thumbnail = extractFaceThumbnail(opts.sourceCanvas, region);
        }

        return face;
      });

    return faces;
  } catch (error) {
    console.error('MediaPipe detection error:', error);
    throw new Error('Face detection failed');
  }
}

export function disposeMediaPipe(): void {
  if (detector) {
    detector.close();
    detector = null;
    isInitialized = false;
  }
}
