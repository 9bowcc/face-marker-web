export interface MediaFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  blobUrl: string;
  uploadedAt: Date;
  type: 'image' | 'video';
}

export interface DetectedFace {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  isSelected: boolean;
  detectedBy: 'mediapipe' | 'faceapi';
  thumbnail?: string;
}

export interface MaskConfiguration {
  type: 'blur' | 'mosaic' | 'emoji' | 'none';
  blurIntensity: number;
  emoji: string;
}

export interface EditorState {
  mediaFile: MediaFile | null;
  detectedFaces: DetectedFace[];
  maskConfig: MaskConfiguration;
  detectionStatus: 'idle' | 'detecting' | 'complete' | 'error';
  errorMessage: string | null;
  activeDetector: 'mediapipe' | 'faceapi';
  zoomLevel: number;
}

export interface ExportOptions {
  format: 'jpeg' | 'png';
  quality: number;
  filename: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DetectionOptions {
  minConfidence: number;
  maxFaces: number;
}

export type SensitivityLevel = 'low' | 'medium' | 'high';

export const SENSITIVITY_CONFIG: Record<SensitivityLevel, number> = {
  low: 0.1,
  medium: 0.25,
  high: 0.5,
};

export const SENSITIVITY_LABELS: Record<SensitivityLevel, string> = {
  low: 'Low (Strict - 90%+)',
  medium: 'Medium - 75%+',
  high: 'High (Permissive - 50%+)',
};

export const EMOJI_PRESETS = [
  '😊', '😀', '😎', '🙈', '🙂', '😺',
  '🌟', '⭐', '❤️', '💙', '🔵', '🟢',
  '🎭', '🤖', '👻', '💀', '🎃', '👽'
] as const;

export const DEFAULT_MASK_CONFIG: MaskConfiguration = {
  type: 'blur',
  blurIntensity: 20,
  emoji: '😊',
};

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'jpeg',
  quality: 90,
  filename: 'masked_image'
};

export interface VideoFrame {
  timestamp: number;
  faces: DetectedFace[];
}

export interface VideoProcessingState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  frames: VideoFrame[];
}

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
export const MAX_FILE_SIZE_MB = 50;
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
