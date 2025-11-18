/**
 * Application-wide constants and configuration values
 */

// Video Processing Constants
export const FRAME_RATE = 30;
export const SAMPLE_RATE = 5; // Process every 5th frame for performance
export const VIDEO_BITRATE = 5000000; // 5 Mbps
export const VIDEO_SEEK_DELAY = 100; // milliseconds

// Face Detection Constants
export const DEFAULT_MAX_FACES = 10;
export const DEFAULT_DETECTION_CONFIDENCE = 0.5;
export const DEFAULT_CONFIDENCE_SCORE = 1.0;

// Blur Constants
export const DEFAULT_BLUR_INTENSITY = 20;
export const MIN_BLUR_INTENSITY = 5;
export const MAX_BLUR_INTENSITY = 50;
export const BLUR_PADDING = 10;
export const MIN_BLUR_RADIUS = 1;

// Face Tracking Constants
export const FACE_TRACK_IOU_THRESHOLD = 0.3;

// Thumbnail Constants
export const THUMBNAIL_MAX_SIZE = 100;
export const THUMBNAIL_QUALITY = 0.8;

// Export Quality Constants
export const DEFAULT_EXPORT_QUALITY = 0.95;

// File Validation Constants
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB (not currently enforced, but available)

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const;

// UI Constants
export const FACE_BOX_LINE_WIDTH = 3;
export const FACE_BOX_SELECTED_COLOR = '#00ff00';
export const FACE_BOX_UNSELECTED_COLOR = '#ff0000';
