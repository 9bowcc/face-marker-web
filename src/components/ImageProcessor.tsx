/**
 * Image processing component with face detection and blur
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Slider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Checkbox,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import type { FaceDetection, ProcessingOptions } from '../types';
import { imageProcessingService } from '../services/imageProcessing';
import { createFaceThumbnail } from '../utils/blur';
import { handleError } from '../utils/errorHandler';
import {
  DEFAULT_BLUR_INTENSITY,
  DEFAULT_DETECTION_CONFIDENCE,
  MIN_BLUR_INTENSITY,
  MAX_BLUR_INTENSITY,
  FACE_BOX_SELECTED_COLOR,
  FACE_BOX_UNSELECTED_COLOR,
  FACE_BOX_LINE_WIDTH,
} from '../constants';

interface ImageProcessorProps {
  file: File;
  onBack: () => void;
}

export const ImageProcessor: React.FC<ImageProcessorProps> = ({ file, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faces, setFaces] = useState<FaceDetection[]>([]);
  const [selectedFaces, setSelectedFaces] = useState<Set<string>>(new Set());
  const [blurIntensity, setBlurIntensity] = useState(DEFAULT_BLUR_INTENSITY);
  const [processed, setProcessed] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const thumbnailUrlsRef = useRef<string[]>([]);
  const [thumbnails, setThumbnails] = useState<Map<string, string>>(new Map());

  const loadAndDetect = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const options: Partial<ProcessingOptions> = {
        detectionConfidence: DEFAULT_DETECTION_CONFIDENCE,
        blurIntensity: DEFAULT_BLUR_INTENSITY,
        useWebGPU: true,
      };

      const result = await imageProcessingService.processImage(file, options);

      // Store original canvas
      originalCanvasRef.current = result.canvas;

      // Clone canvas for display
      if (canvasRef.current) {
        canvasRef.current.width = result.canvas.width;
        canvasRef.current.height = result.canvas.height;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.drawImage(result.canvas, 0, 0);
        }
      }

      setFaces(result.faces);

      // Select all faces by default
      const allFaceIds = new Set(result.faces.map(f => f.id));
      setSelectedFaces(allFaceIds);

      setLoading(false);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      setLoading(false);
    }
  }, [file]);

  useEffect(() => {
    // Capture ref values at the start of the effect
    const canvas = canvasRef.current;
    const originalCanvas = originalCanvasRef.current;
    const displayCanvas = displayCanvasRef.current;

    // Load and detect faces on mount - legitimate use of setState in effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAndDetect();

    // Cleanup function
    return () => {
      // Revoke all thumbnail URLs
      thumbnailUrlsRef.current.forEach(url => {
        if (url.startsWith('data:')) return; // Skip data URLs
        URL.revokeObjectURL(url);
      });
      thumbnailUrlsRef.current = [];

      // Clean up canvas contexts using captured values
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        canvas.width = 0;
        canvas.height = 0;
      }

      if (originalCanvas) {
        const ctx = originalCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
        }
        originalCanvas.width = 0;
        originalCanvas.height = 0;
      }

      if (displayCanvas) {
        const ctx = displayCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
        }
        displayCanvas.width = 0;
        displayCanvas.height = 0;
      }
    };
  }, [loadAndDetect]);

  const handleFaceToggle = (faceId: string) => {
    setSelectedFaces((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(faceId)) {
        newSet.delete(faceId);
      } else {
        newSet.add(faceId);
      }
      return newSet;
    });
  };

  const handleApplyBlur = async () => {
    if (!originalCanvasRef.current || !canvasRef.current) return;

    try {
      setProcessing(true);

      // Reset canvas to original
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(originalCanvasRef.current, 0, 0);
      }

      // Apply blur to selected faces
      const selectedFaceList = faces.filter((f) => selectedFaces.has(f.id));
      if (selectedFaceList.length > 0) {
        imageProcessingService.applyBlur(canvasRef.current, selectedFaceList, blurIntensity);
      }

      setProcessed(true);
      setProcessing(false);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      setProcessing(false);
    }
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;

    try {
      const blob = await imageProcessingService.exportImage(canvasRef.current, 'png');
      const filename = `blurred_${file.name.replace(/\.[^/.]+$/, '')}.png`;
      imageProcessingService.downloadImage(blob, filename);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
    }
  };

  const drawFaceBoxes = useCallback(() => {
    if (!canvasRef.current || !displayCanvasRef.current) return;

    const canvas = displayCanvasRef.current;
    const sourceCanvas = canvasRef.current;

    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the source image
    ctx.drawImage(sourceCanvas, 0, 0);

    // Draw face boxes
    faces.forEach((face) => {
      const isSelected = selectedFaces.has(face.id);

      ctx.strokeStyle = isSelected ? FACE_BOX_SELECTED_COLOR : FACE_BOX_UNSELECTED_COLOR;
      ctx.lineWidth = FACE_BOX_LINE_WIDTH;
      ctx.strokeRect(face.box.xMin, face.box.yMin, face.box.width, face.box.height);

      // Draw label
      ctx.fillStyle = isSelected ? FACE_BOX_SELECTED_COLOR : FACE_BOX_UNSELECTED_COLOR;
      ctx.font = '16px Arial';
      ctx.fillText(
        isSelected ? '✓ Selected' : '✗ Not selected',
        face.box.xMin,
        face.box.yMin - 5
      );
    });
  }, [faces, selectedFaces]);

  useEffect(() => {
    drawFaceBoxes();
  }, [drawFaceBoxes, processed]);

  // Generate thumbnails when faces are detected
  // Deriving thumbnail state from faces - legitimate use of setState in effect
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!canvasRef.current || faces.length === 0) {
      setThumbnails(new Map<string, string>());
      return;
    }

    const newThumbnails = new Map<string, string>();
    faces.forEach((face) => {
      const thumbnail = createFaceThumbnail(canvasRef.current!, face.box);
      if (thumbnail) {
        newThumbnails.set(face.id, thumbnail);
      }
    });
    setThumbnails(newThumbnails);
  }, [faces]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Detecting faces...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box role="region" aria-label="Image processing interface">
      <Typography variant="h5" gutterBottom>
        Image Processing
      </Typography>

      {/* Live region for processing status */}
      <Box
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        sx={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        {processing && 'Processing image, please wait...'}
        {processed && !processing && 'Image processing complete'}
        {loading && 'Detecting faces in image...'}
      </Box>

      {faces.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          No faces detected in this image.
        </Alert>
      )}

      {faces.length > 0 && (
        <>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detected Faces ({faces.length})
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }} role="list" aria-label="Detected faces">
              {faces.map((face, index) => {
                const thumbnail = thumbnails.get(face.id) || '';

                return (
                  <Card
                    key={face.id}
                    sx={{
                      cursor: 'pointer',
                      border: selectedFaces.has(face.id) ? `2px solid ${FACE_BOX_SELECTED_COLOR}` : '2px solid transparent',
                    }}
                    onClick={() => handleFaceToggle(face.id)}
                    role="listitem"
                  >
                    {thumbnail && (
                      <img
                        src={thumbnail}
                        alt={`Detected face ${index + 1}`}
                        style={{ width: '100%', height: 'auto' }}
                      />
                    )}
                    <CardContent sx={{ p: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox
                          checked={selectedFaces.has(face.id)}
                          size="small"
                          aria-label={`Face ${index + 1}, ${selectedFaces.has(face.id) ? 'selected' : 'not selected'}`}
                          inputProps={{
                            'aria-describedby': `face-${face.id}-label`,
                          }}
                        />
                        <Typography variant="caption" id={`face-${face.id}-label`}>
                          {selectedFaces.has(face.id) ? 'Selected' : 'Click to select'}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography id="blur-intensity-label" gutterBottom>
              Blur Intensity: {blurIntensity}
            </Typography>
            <Slider
              value={blurIntensity}
              onChange={(_, value) => setBlurIntensity(value as number)}
              min={MIN_BLUR_INTENSITY}
              max={MAX_BLUR_INTENSITY}
              disabled={processing}
              aria-labelledby="blur-intensity-label"
              aria-valuemin={MIN_BLUR_INTENSITY}
              aria-valuemax={MAX_BLUR_INTENSITY}
              aria-valuenow={blurIntensity}
              aria-valuetext={`Blur intensity ${blurIntensity}`}
            />
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={processing ? <CircularProgress size={20} /> : <BlurOnIcon />}
              onClick={handleApplyBlur}
              disabled={processing || selectedFaces.size === 0}
              aria-label={processing ? 'Applying blur effect' : 'Apply blur to selected faces'}
            >
              Apply Blur
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={!processed}
              aria-label="Download processed image"
            >
              Export Image
            </Button>
            <Button variant="outlined" onClick={onBack} aria-label="Go back to file upload">
              Back
            </Button>
          </Box>
        </>
      )}

      <Paper sx={{ p: 2, overflow: 'auto', maxHeight: '70vh' }} role="img" aria-label="Image preview with face detection boxes">
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
        <canvas
          ref={displayCanvasRef}
          style={{ maxWidth: '100%', height: 'auto' }}
          aria-label="Processed image with detected faces highlighted"
        />
      </Paper>
    </Box>
  );
};
