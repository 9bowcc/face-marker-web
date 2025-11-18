import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AppError,
  FaceDetectionError,
  ImageProcessingError,
  VideoProcessingError,
  handleError,
  logInfo,
  logWarning,
  logError,
} from './errorHandler';

describe('errorHandler', () => {
  // Store original console methods
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Mock console methods
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    // Restore original console methods
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
    vi.clearAllMocks();
  });

  describe('AppError', () => {
    it('should create AppError with message and code', () => {
      const error = new AppError('Test error message', 'TEST_ERROR');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Test error message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('AppError');
      expect(error.userMessage).toBeUndefined();
    });

    it('should create AppError with user message', () => {
      const error = new AppError(
        'Technical error message',
        'TEST_ERROR',
        'User-friendly message'
      );

      expect(error.message).toBe('Technical error message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.userMessage).toBe('User-friendly message');
      expect(error.name).toBe('AppError');
    });

    it('should inherit from Error', () => {
      const error = new AppError('Test error', 'TEST_ERROR');

      expect(error instanceof Error).toBe(true);
      expect(error.stack).toBeDefined();
    });

    it('should have correct prototype chain', () => {
      const error = new AppError('Test error', 'TEST_ERROR');

      expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
      expect(Object.getPrototypeOf(Object.getPrototypeOf(error))).toBe(Error.prototype);
    });
  });

  describe('FaceDetectionError', () => {
    it('should create FaceDetectionError with correct properties', () => {
      const error = new FaceDetectionError('Face detection failed');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(FaceDetectionError);
      expect(error.message).toBe('Face detection failed');
      expect(error.code).toBe('FACE_DETECTION_ERROR');
      expect(error.name).toBe('FaceDetectionError');
    });

    it('should create FaceDetectionError with user message', () => {
      const error = new FaceDetectionError(
        'ML model failed to initialize',
        'Could not detect faces. Please try again.'
      );

      expect(error.message).toBe('ML model failed to initialize');
      expect(error.code).toBe('FACE_DETECTION_ERROR');
      expect(error.userMessage).toBe('Could not detect faces. Please try again.');
      expect(error.name).toBe('FaceDetectionError');
    });

    it('should have correct code constant', () => {
      const error = new FaceDetectionError('Test');
      expect(error.code).toBe('FACE_DETECTION_ERROR');
    });
  });

  describe('ImageProcessingError', () => {
    it('should create ImageProcessingError with correct properties', () => {
      const error = new ImageProcessingError('Image processing failed');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ImageProcessingError);
      expect(error.message).toBe('Image processing failed');
      expect(error.code).toBe('IMAGE_PROCESSING_ERROR');
      expect(error.name).toBe('ImageProcessingError');
    });

    it('should create ImageProcessingError with user message', () => {
      const error = new ImageProcessingError(
        'Canvas rendering failed',
        'Unable to process image. Please try a different file.'
      );

      expect(error.message).toBe('Canvas rendering failed');
      expect(error.code).toBe('IMAGE_PROCESSING_ERROR');
      expect(error.userMessage).toBe('Unable to process image. Please try a different file.');
      expect(error.name).toBe('ImageProcessingError');
    });

    it('should have correct code constant', () => {
      const error = new ImageProcessingError('Test');
      expect(error.code).toBe('IMAGE_PROCESSING_ERROR');
    });
  });

  describe('VideoProcessingError', () => {
    it('should create VideoProcessingError with correct properties', () => {
      const error = new VideoProcessingError('Video processing failed');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(VideoProcessingError);
      expect(error.message).toBe('Video processing failed');
      expect(error.code).toBe('VIDEO_PROCESSING_ERROR');
      expect(error.name).toBe('VideoProcessingError');
    });

    it('should create VideoProcessingError with user message', () => {
      const error = new VideoProcessingError(
        'Video codec not supported',
        'This video format is not supported. Please use MP4 or WebM.'
      );

      expect(error.message).toBe('Video codec not supported');
      expect(error.code).toBe('VIDEO_PROCESSING_ERROR');
      expect(error.userMessage).toBe('This video format is not supported. Please use MP4 or WebM.');
      expect(error.name).toBe('VideoProcessingError');
    });

    it('should have correct code constant', () => {
      const error = new VideoProcessingError('Test');
      expect(error.code).toBe('VIDEO_PROCESSING_ERROR');
    });
  });

  describe('handleError', () => {
    it('should handle AppError and return user message', () => {
      const error = new AppError(
        'Technical error',
        'TEST_ERROR',
        'User-friendly error'
      );

      const result = handleError(error);

      expect(result).toBe('User-friendly error');
      expect(console.error).toHaveBeenCalledWith('[TEST_ERROR] Technical error');
    });

    it('should handle AppError without user message and return technical message', () => {
      const error = new AppError('Technical error', 'TEST_ERROR');

      const result = handleError(error);

      expect(result).toBe('Technical error');
      expect(console.error).toHaveBeenCalledWith('[TEST_ERROR] Technical error');
    });

    it('should handle FaceDetectionError', () => {
      const error = new FaceDetectionError(
        'Detection model failed',
        'Unable to detect faces'
      );

      const result = handleError(error);

      expect(result).toBe('Unable to detect faces');
      expect(console.error).toHaveBeenCalledWith(
        '[FACE_DETECTION_ERROR] Detection model failed'
      );
    });

    it('should handle ImageProcessingError', () => {
      const error = new ImageProcessingError(
        'Canvas error',
        'Image processing failed'
      );

      const result = handleError(error);

      expect(result).toBe('Image processing failed');
      expect(console.error).toHaveBeenCalledWith(
        '[IMAGE_PROCESSING_ERROR] Canvas error'
      );
    });

    it('should handle VideoProcessingError', () => {
      const error = new VideoProcessingError(
        'Codec error',
        'Video processing failed'
      );

      const result = handleError(error);

      expect(result).toBe('Video processing failed');
      expect(console.error).toHaveBeenCalledWith(
        '[VIDEO_PROCESSING_ERROR] Codec error'
      );
    });

    it('should handle generic Error instances', () => {
      const error = new Error('Generic error message');

      const result = handleError(error);

      expect(result).toBe('An unexpected error occurred. Please try again.');
      expect(console.error).toHaveBeenCalledWith(
        'Unexpected error:',
        'Generic error message'
      );
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';

      const result = handleError(error);

      expect(result).toBe('An unknown error occurred. Please try again.');
      expect(console.error).toHaveBeenCalledWith('Unknown error:', 'String error');
    });

    it('should handle null error', () => {
      const result = handleError(null);

      expect(result).toBe('An unknown error occurred. Please try again.');
      expect(console.error).toHaveBeenCalledWith('Unknown error:', null);
    });

    it('should handle undefined error', () => {
      const result = handleError(undefined);

      expect(result).toBe('An unknown error occurred. Please try again.');
      expect(console.error).toHaveBeenCalledWith('Unknown error:', undefined);
    });

    it('should handle object without Error prototype', () => {
      const error = { message: 'Custom object error' };

      const result = handleError(error);

      expect(result).toBe('An unknown error occurred. Please try again.');
      expect(console.error).toHaveBeenCalledWith('Unknown error:', error);
    });

    it('should handle number error', () => {
      const error = 404;

      const result = handleError(error);

      expect(result).toBe('An unknown error occurred. Please try again.');
      expect(console.error).toHaveBeenCalledWith('Unknown error:', 404);
    });
  });

  describe('logInfo', () => {
    it('should log info message with prefix', () => {
      logInfo('Test info message');

      expect(console.log).toHaveBeenCalledWith('[INFO] Test info message');
    });

    it('should log info message with additional arguments', () => {
      const data = { key: 'value' };
      const number = 42;

      logInfo('Test with data', data, number);

      expect(console.log).toHaveBeenCalledWith(
        '[INFO] Test with data',
        data,
        number
      );
    });

    it('should handle empty additional arguments', () => {
      logInfo('Test message');

      expect(console.log).toHaveBeenCalledWith('[INFO] Test message');
    });

    it('should handle complex objects', () => {
      const complexObject = {
        nested: {
          array: [1, 2, 3],
          date: new Date(),
        },
      };

      logInfo('Complex object', complexObject);

      expect(console.log).toHaveBeenCalledWith('[INFO] Complex object', complexObject);
    });

    it('should handle multiple arguments of different types', () => {
      logInfo('Multiple types', 'string', 123, true, null, undefined, { obj: 'value' });

      expect(console.log).toHaveBeenCalledWith(
        '[INFO] Multiple types',
        'string',
        123,
        true,
        null,
        undefined,
        { obj: 'value' }
      );
    });
  });

  describe('logWarning', () => {
    it('should log warning message with prefix', () => {
      logWarning('Test warning message');

      expect(console.warn).toHaveBeenCalledWith('[WARNING] Test warning message');
    });

    it('should log warning message with additional arguments', () => {
      const data = { warning: 'data' };
      const code = 'WARN_001';

      logWarning('Test warning', data, code);

      expect(console.warn).toHaveBeenCalledWith(
        '[WARNING] Test warning',
        data,
        code
      );
    });

    it('should handle empty additional arguments', () => {
      logWarning('Warning message');

      expect(console.warn).toHaveBeenCalledWith('[WARNING] Warning message');
    });

    it('should handle complex objects', () => {
      const warningData = {
        level: 'medium',
        details: ['issue1', 'issue2'],
      };

      logWarning('Complex warning', warningData);

      expect(console.warn).toHaveBeenCalledWith('[WARNING] Complex warning', warningData);
    });

    it('should handle multiple arguments', () => {
      logWarning('Multiple args', 'arg1', 2, { obj: 'val' });

      expect(console.warn).toHaveBeenCalledWith(
        '[WARNING] Multiple args',
        'arg1',
        2,
        { obj: 'val' }
      );
    });
  });

  describe('logError', () => {
    it('should log error message with prefix', () => {
      logError('Test error message');

      expect(console.error).toHaveBeenCalledWith('[ERROR] Test error message', undefined);
    });

    it('should log error message with error object', () => {
      const error = new Error('Test error');

      logError('Error occurred', error);

      expect(console.error).toHaveBeenCalledWith('[ERROR] Error occurred', error);
    });

    it('should handle AppError instances', () => {
      const error = new AppError('App error', 'TEST_CODE');

      logError('Application error', error);

      expect(console.error).toHaveBeenCalledWith('[ERROR] Application error', error);
    });

    it('should handle FaceDetectionError instances', () => {
      const error = new FaceDetectionError('Face detection failed');

      logError('Detection error', error);

      expect(console.error).toHaveBeenCalledWith('[ERROR] Detection error', error);
    });

    it('should handle ImageProcessingError instances', () => {
      const error = new ImageProcessingError('Image error');

      logError('Image processing error', error);

      expect(console.error).toHaveBeenCalledWith('[ERROR] Image processing error', error);
    });

    it('should handle VideoProcessingError instances', () => {
      const error = new VideoProcessingError('Video error');

      logError('Video processing error', error);

      expect(console.error).toHaveBeenCalledWith('[ERROR] Video processing error', error);
    });

    it('should handle string errors', () => {
      const error = 'String error message';

      logError('Error occurred', error);

      expect(console.error).toHaveBeenCalledWith('[ERROR] Error occurred', error);
    });

    it('should handle null error', () => {
      logError('Error with null', null);

      expect(console.error).toHaveBeenCalledWith('[ERROR] Error with null', null);
    });

    it('should handle undefined error', () => {
      logError('Error without details');

      expect(console.error).toHaveBeenCalledWith('[ERROR] Error without details', undefined);
    });

    it('should handle object errors', () => {
      const error = { code: 500, message: 'Server error' };

      logError('Server error occurred', error);

      expect(console.error).toHaveBeenCalledWith('[ERROR] Server error occurred', error);
    });
  });

  describe('Error Inheritance Chain', () => {
    it('should maintain proper inheritance for all error types', () => {
      const faceError = new FaceDetectionError('test');
      const imageError = new ImageProcessingError('test');
      const videoError = new VideoProcessingError('test');

      expect(faceError instanceof FaceDetectionError).toBe(true);
      expect(faceError instanceof AppError).toBe(true);
      expect(faceError instanceof Error).toBe(true);

      expect(imageError instanceof ImageProcessingError).toBe(true);
      expect(imageError instanceof AppError).toBe(true);
      expect(imageError instanceof Error).toBe(true);

      expect(videoError instanceof VideoProcessingError).toBe(true);
      expect(videoError instanceof AppError).toBe(true);
      expect(videoError instanceof Error).toBe(true);
    });

    it('should differentiate between error types', () => {
      const faceError = new FaceDetectionError('test');
      const imageError = new ImageProcessingError('test');
      const videoError = new VideoProcessingError('test');

      expect(faceError instanceof ImageProcessingError).toBe(false);
      expect(faceError instanceof VideoProcessingError).toBe(false);

      expect(imageError instanceof FaceDetectionError).toBe(false);
      expect(imageError instanceof VideoProcessingError).toBe(false);

      expect(videoError instanceof FaceDetectionError).toBe(false);
      expect(videoError instanceof ImageProcessingError).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty error messages', () => {
      const error = new AppError('', 'EMPTY_ERROR');
      const result = handleError(error);

      expect(result).toBe('');
      expect(console.error).toHaveBeenCalledWith('[EMPTY_ERROR] ');
    });

    it('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(1000);
      const error = new AppError(longMessage, 'LONG_ERROR');
      const result = handleError(error);

      expect(result).toBe(longMessage);
      expect(console.error).toHaveBeenCalledWith(`[LONG_ERROR] ${longMessage}`);
    });

    it('should handle special characters in error messages', () => {
      const message = 'Error with special chars: @#$%^&*(){}[]<>?/\\|`~';
      const error = new AppError(message, 'SPECIAL_ERROR');
      const result = handleError(error);

      expect(result).toBe(message);
    });

    it('should handle unicode characters in error messages', () => {
      const message = 'Error with unicode: 你好 世界 🌍 💻';
      const error = new AppError(message, 'UNICODE_ERROR');
      const result = handleError(error);

      expect(result).toBe(message);
    });

    it('should handle newlines and tabs in error messages', () => {
      const message = 'Error\nwith\nmultiple\nlines\tand\ttabs';
      const error = new AppError(message, 'MULTILINE_ERROR');

      logError('Test', error);

      expect(console.error).toHaveBeenCalledWith('[ERROR] Test', error);
    });
  });

  describe('Type Safety', () => {
    it('should enforce correct error code types', () => {
      const error = new AppError('Test', 'CUSTOM_CODE');
      expect(error.code).toBe('CUSTOM_CODE');
    });

    it('should allow optional user message', () => {
      const error1 = new AppError('Test', 'CODE');
      const error2 = new AppError('Test', 'CODE', 'User message');

      expect(error1.userMessage).toBeUndefined();
      expect(error2.userMessage).toBe('User message');
    });

    it('should preserve error properties', () => {
      const error = new AppError('Technical', 'CODE', 'User-friendly');

      expect(error.message).toBe('Technical');
      expect(error.code).toBe('CODE');
      expect(error.userMessage).toBe('User-friendly');
      expect(error.name).toBe('AppError');
      expect(error.stack).toBeDefined();
    });
  });
});
