import { useState, useCallback, useEffect } from 'react';
import { DetectedFace, DetectionOptions } from '../types';
import {
  initializeDetector,
  detectFaces as detectFacesService,
  isDetectorReady,
  getCurrentDetectorType,
  switchDetector as switchDetectorService,
} from '../services/detectorFactory';

interface UseFaceDetectionOptions {
  detector: 'mediapipe' | 'faceapi' | 'auto';
  minConfidence?: number;
}

interface UseFaceDetectionResult {
  detectFaces: (image: HTMLImageElement) => Promise<DetectedFace[]>;
  faces: DetectedFace[];
  isDetecting: boolean;
  error: string | null;
  activeDetector: 'mediapipe' | 'faceapi';
  isReady: boolean;
  switchDetector: (type: 'mediapipe' | 'faceapi') => Promise<void>;
}

export function useFaceDetection(
  options: UseFaceDetectionOptions
): UseFaceDetectionResult {
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDetector, setActiveDetector] = useState<'mediapipe' | 'faceapi'>('mediapipe');
  const [isReady, setIsReady] = useState(false);

  // Initialize detector on mount
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const type = await initializeDetector(options.detector);
        if (mounted) {
          setActiveDetector(type);
          setIsReady(true);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize detector');
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [options.detector]);

  const detectFaces = useCallback(
    async (image: HTMLImageElement): Promise<DetectedFace[]> => {
      setIsDetecting(true);
      setError(null);

      try {
        const detectionOptions: Partial<DetectionOptions> = {};
        if (options.minConfidence !== undefined) {
          detectionOptions.minConfidence = options.minConfidence;
        }

        const detected = await detectFacesService(image, detectionOptions);
        setFaces(detected);
        setActiveDetector(getCurrentDetectorType());
        return detected;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Face detection failed';
        setError(errorMessage);
        return [];
      } finally {
        setIsDetecting(false);
      }
    },
    [options.minConfidence]
  );

  const switchDetector = useCallback(async (type: 'mediapipe' | 'faceapi') => {
    try {
      setError(null);
      await switchDetectorService(type);
      setActiveDetector(type);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch detector');
    }
  }, []);

  return {
    detectFaces,
    faces,
    isDetecting,
    error,
    activeDetector,
    isReady: isReady && isDetectorReady(),
    switchDetector,
  };
}
