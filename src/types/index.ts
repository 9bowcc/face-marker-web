/**
 * Core types for face detection and processing
 */

export interface FaceDetection {
  id: string;
  box: BoundingBox;
  keypoints?: Keypoint[];
  score: number;
  frameNumber?: number; // For video processing
}

export interface BoundingBox {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  width: number;
  height: number;
}

/**
 * Extended box type from MediaPipe that includes probability score
 * This extends the base Box type from @tensorflow-models/face-detection
 */
export interface MediaPipeBox extends BoundingBox {
  probability?: number;
}

export interface Keypoint {
  x: number;
  y: number;
  name?: string;
}

export interface FaceTrack {
  id: string;
  faces: FaceDetection[];
  thumbnail?: string; // Base64 encoded thumbnail
  selected: boolean;
}

export interface ProcessingOptions {
  blurIntensity: number;
  detectionConfidence: number;
  maxFaces?: number;
  useWebGPU?: boolean;
}

export interface MediaFile {
  file: File;
  type: 'image' | 'video';
  url: string;
  width: number;
  height: number;
  duration?: number; // For video
}

export interface ProcessingResult {
  faces: FaceDetection[];
  tracks?: FaceTrack[]; // For video
  processedUrl?: string;
}

export type ProcessingStatus = 'idle' | 'loading' | 'detecting' | 'processing' | 'complete' | 'error';

export interface AppState {
  status: ProcessingStatus;
  progress: number;
  error?: string;
}
