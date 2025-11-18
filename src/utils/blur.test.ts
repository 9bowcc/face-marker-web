import { describe, it, expect, beforeEach } from 'vitest';
import { applyBlurToRegions, createFaceThumbnail } from './blur';
import type { BoundingBox } from '../types';

describe('blur utilities', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
  });

  describe('applyBlurToRegions', () => {
    it('should apply blur to specified regions', () => {
      const regions: BoundingBox[] = [
        {
          xMin: 10,
          yMin: 10,
          xMax: 30,
          yMax: 30,
          width: 20,
          height: 20,
        },
      ];

      expect(() => {
        applyBlurToRegions(canvas, regions, { intensity: 10 });
      }).not.toThrow();
    });

    it('should handle multiple regions', () => {
      const regions: BoundingBox[] = [
        {
          xMin: 10,
          yMin: 10,
          xMax: 30,
          yMax: 30,
          width: 20,
          height: 20,
        },
        {
          xMin: 40,
          yMin: 40,
          xMax: 60,
          yMax: 60,
          width: 20,
          height: 20,
        },
      ];

      expect(() => {
        applyBlurToRegions(canvas, regions, { intensity: 15, padding: 5 });
      }).not.toThrow();
    });

    it('should handle edge cases with regions at canvas boundaries', () => {
      const regions: BoundingBox[] = [
        {
          xMin: 0,
          yMin: 0,
          xMax: 20,
          yMax: 20,
          width: 20,
          height: 20,
        },
        {
          xMin: 80,
          yMin: 80,
          xMax: 100,
          yMax: 100,
          width: 20,
          height: 20,
        },
      ];

      expect(() => {
        applyBlurToRegions(canvas, regions, { intensity: 10 });
      }).not.toThrow();
    });

    it('should handle empty regions array', () => {
      expect(() => {
        applyBlurToRegions(canvas, [], { intensity: 10 });
      }).not.toThrow();
    });

    it('should throw error if canvas context is unavailable', () => {
      const mockCanvas = {
        getContext: () => null,
        width: 100,
        height: 100,
      } as unknown as HTMLCanvasElement;

      const regions: BoundingBox[] = [
        {
          xMin: 10,
          yMin: 10,
          xMax: 30,
          yMax: 30,
          width: 20,
          height: 20,
        },
      ];

      expect(() => {
        applyBlurToRegions(mockCanvas, regions, { intensity: 10 });
      }).toThrow('Could not get canvas context');
    });
  });

  describe('createFaceThumbnail', () => {
    it('should create thumbnail from face region', () => {
      const box: BoundingBox = {
        xMin: 10,
        yMin: 10,
        xMax: 30,
        yMax: 30,
        width: 20,
        height: 20,
      };

      const thumbnail = createFaceThumbnail(canvas, box, 50);
      expect(thumbnail).toBeTruthy();
      expect(thumbnail).toContain('data:image/');
    });

    it('should scale thumbnail to max size', () => {
      const box: BoundingBox = {
        xMin: 0,
        yMin: 0,
        xMax: 50,
        yMax: 50,
        width: 50,
        height: 50,
      };

      const thumbnail = createFaceThumbnail(canvas, box, 25);
      expect(thumbnail).toBeTruthy();
    });

    it('should return empty string if context is unavailable', () => {
      const mockCanvas = document.createElement('canvas');
      mockCanvas.getContext = () => null;

      const box: BoundingBox = {
        xMin: 10,
        yMin: 10,
        xMax: 30,
        yMax: 30,
        width: 20,
        height: 20,
      };

      const thumbnail = createFaceThumbnail(mockCanvas, box);
      expect(thumbnail).toBe('');
    });
  });
});
