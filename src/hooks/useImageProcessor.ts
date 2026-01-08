import { useState, useCallback, useRef } from 'react';
import { DetectedFace, MaskConfiguration, ExportOptions, DEFAULT_EXPORT_OPTIONS } from '../types';
import { loadImageToCanvas } from '../utils/imageUtils';
import { applyBlur, applyEmoji, canvasToBlob, downloadBlob } from '../utils/canvasUtils';

interface UseImageProcessorResult {
  loadImage: (file: File, canvas: HTMLCanvasElement) => Promise<HTMLImageElement>;
  applyMask: (
    canvas: HTMLCanvasElement,
    faces: DetectedFace[],
    config: MaskConfiguration
  ) => Promise<void>;
  exportImage: (canvas: HTMLCanvasElement, options?: ExportOptions) => Promise<void>;
  isProcessing: boolean;
}

export function useImageProcessor(): UseImageProcessorResult {
  const [isProcessing, setIsProcessing] = useState(false);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  const loadImage = useCallback(
    async (file: File, canvas: HTMLCanvasElement): Promise<HTMLImageElement> => {
      setIsProcessing(true);
      try {
        const blobUrl = URL.createObjectURL(file);
        const img = await loadImageToCanvas(blobUrl, canvas);
        originalImageRef.current = img;
        return img;
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const applyMask = useCallback(
    async (
      canvas: HTMLCanvasElement,
      faces: DetectedFace[],
      config: MaskConfiguration
    ): Promise<void> => {
      setIsProcessing(true);
      try {
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        // Redraw original image first
        if (originalImageRef.current) {
          ctx.drawImage(originalImageRef.current, 0, 0);
        }

        // Apply mask to selected faces only
        const selectedFaces = faces.filter((f) => f.isSelected);

        for (const face of selectedFaces) {
          const region = {
            x: face.x,
            y: face.y,
            width: face.width,
            height: face.height,
          };

          if (config.type === 'blur') {
            applyBlur(ctx, region, config.blurIntensity);
          } else if (config.type === 'emoji') {
            applyEmoji(ctx, region, config.emoji);
          }
        }
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const exportImage = useCallback(
    async (
      canvas: HTMLCanvasElement,
      options: ExportOptions = DEFAULT_EXPORT_OPTIONS
    ): Promise<void> => {
      setIsProcessing(true);
      try {
        const blob = await canvasToBlob(canvas, options.format, options.quality);
        const extension = options.format === 'jpeg' ? 'jpg' : 'png';
        downloadBlob(blob, `${options.filename}.${extension}`);
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  return {
    loadImage,
    applyMask,
    exportImage,
    isProcessing,
  };
}
