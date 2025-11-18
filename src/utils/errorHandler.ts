/**
 * Error handling utilities
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class FaceDetectionError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(message, 'FACE_DETECTION_ERROR', userMessage);
    this.name = 'FaceDetectionError';
  }
}

export class ImageProcessingError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(message, 'IMAGE_PROCESSING_ERROR', userMessage);
    this.name = 'ImageProcessingError';
  }
}

export class VideoProcessingError extends AppError {
  constructor(message: string, userMessage?: string) {
    super(message, 'VIDEO_PROCESSING_ERROR', userMessage);
    this.name = 'VideoProcessingError';
  }
}

export const handleError = (error: unknown): string => {
  if (error instanceof AppError) {
    console.error(`[${error.code}] ${error.message}`);
    return error.userMessage || error.message;
  }

  if (error instanceof Error) {
    console.error('Unexpected error:', error.message);
    return 'An unexpected error occurred. Please try again.';
  }

  console.error('Unknown error:', error);
  return 'An unknown error occurred. Please try again.';
};

export const logInfo = (message: string, ...args: unknown[]) => {
  console.log(`[INFO] ${message}`, ...args);
};

export const logWarning = (message: string, ...args: unknown[]) => {
  console.warn(`[WARNING] ${message}`, ...args);
};

export const logError = (message: string, error?: unknown) => {
  console.error(`[ERROR] ${message}`, error);
};
