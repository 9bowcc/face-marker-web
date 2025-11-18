import { describe, it, expect, vi, beforeEach } from 'vitest';
import { imageProcessingService } from './imageProcessing';
import type { FaceDetection } from '../types';

// Mock face detection service
vi.mock('./faceDetection', () => ({
  getFaceDetectionService: () => ({
    detectFaces: vi.fn().mockResolvedValue([
      {
        id: 'face-1',
        box: {
          xMin: 10,
          yMin: 10,
          xMax: 50,
          yMax: 50,
          width: 40,
          height: 40,
        },
        score: 0.95,
      },
    ]),
  }),
}));

describe('ImageProcessingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('processImage', () => {
    it('should create a promise for image processing', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = imageProcessingService.processImage(mockFile);

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('applyBlur', () => {
    it('should apply blur to detected faces', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;

      const faces: FaceDetection[] = [
        {
          id: 'face-1',
          box: {
            xMin: 10,
            yMin: 10,
            xMax: 50,
            yMax: 50,
            width: 40,
            height: 40,
          },
          score: 0.95,
        },
      ];

      expect(() => {
        imageProcessingService.applyBlur(canvas, faces, 20);
      }).not.toThrow();
    });
  });

  describe('exportImage', () => {
    it('should export canvas as blob', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;

      const blob = await imageProcessingService.exportImage(canvas, 'png');
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
    });

    it('should export canvas as jpeg', async () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;

      const blob = await imageProcessingService.exportImage(canvas, 'jpeg', 0.8);
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe('downloadImage', () => {
    it('should trigger download', () => {
      const blob = new Blob(['test'], { type: 'image/png' });
      const createElementSpy = vi.spyOn(document, 'createElement');

      imageProcessingService.downloadImage(blob, 'test.png');

      expect(createElementSpy).toHaveBeenCalledWith('a');
    });
  });
});
