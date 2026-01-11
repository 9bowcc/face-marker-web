import * as faceapi from 'face-api.js';
import { DetectedFace, DetectionOptions, BoundingBox } from '../types';
import { generateId } from '../utils/imageUtils';
import { extractFaceThumbnail } from '../utils/canvasUtils';

let isInitialized = false;

const DEFAULT_OPTIONS: DetectionOptions = {
  minConfidence: 0.3,
  maxFaces: 50,
};

const MODEL_URL = '/face-marker-web/models';

type FaceDetection = faceapi.FaceDetection;

function getIoU(box1: faceapi.Box, box2: faceapi.Box): number {
  const x1 = Math.max(box1.x, box2.x);
  const y1 = Math.max(box1.y, box2.y);
  const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
  const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);
  
  if (x2 <= x1 || y2 <= y1) return 0;
  
  const intersection = (x2 - x1) * (y2 - y1);
  const area1 = box1.width * box1.height;
  const area2 = box2.width * box2.height;
  return intersection / (area1 + area2 - intersection);
}

function removeDuplicateDetections(detections: FaceDetection[]): FaceDetection[] {
  const sorted = [...detections].sort((a, b) => b.score - a.score);
  const kept: FaceDetection[] = [];
  
  for (const det of sorted) {
    const isDuplicate = kept.some(k => getIoU(k.box, det.box) > 0.5);
    if (!isDuplicate) {
      kept.push(det);
    }
  }
  return kept;
}

export async function initializeFaceApi(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    ]);
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
  options: Partial<DetectionOptions> & { sourceCanvas?: HTMLCanvasElement } = {}
): Promise<DetectedFace[]> {
  if (!isInitialized) {
    await initializeFaceApi();
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const ssdDetections = await faceapi.detectAllFaces(
      image,
      new faceapi.SsdMobilenetv1Options({
        minConfidence: opts.minConfidence,
      })
    );

    const tinyDetections = await faceapi.detectAllFaces(
      image,
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 608,
        scoreThreshold: opts.minConfidence,
      })
    );

    const allDetections = [...ssdDetections, ...tinyDetections];
    const uniqueDetections = removeDuplicateDetections(allDetections);

    const faces: DetectedFace[] = uniqueDetections
      .slice(0, opts.maxFaces)
      .map((detection): DetectedFace => {
        const box = detection.box;
        const face: DetectedFace = {
          id: generateId(),
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          confidence: detection.score,
          isSelected: true,
          detectedBy: 'faceapi',
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
    console.error('face-api.js detection error:', error);
    throw new Error('Face detection failed');
  }
}

export function disposeFaceApi(): void {
  // face-api.js doesn't require explicit disposal
  isInitialized = false;
}
