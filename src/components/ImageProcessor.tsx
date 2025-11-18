/**
 * Image processing component with face detection and blur
 */

import { useEffect, useState, useRef } from 'react';
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
  const [blurIntensity, setBlurIntensity] = useState(20);
  const [processed, setProcessed] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadAndDetect();
  }, [file]);

  const loadAndDetect = async () => {
    try {
      setLoading(true);
      setError(null);

      const options: Partial<ProcessingOptions> = {
        detectionConfidence: 0.5,
        blurIntensity: 20,
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
      console.error('Error processing image:', err);
      setError('Failed to process image. Please try again.');
      setLoading(false);
    }
  };

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
      console.error('Error applying blur:', err);
      setError('Failed to apply blur effect.');
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
      console.error('Error exporting image:', err);
      setError('Failed to export image.');
    }
  };

  const drawFaceBoxes = () => {
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

      ctx.strokeStyle = isSelected ? '#00ff00' : '#ff0000';
      ctx.lineWidth = 3;
      ctx.strokeRect(face.box.xMin, face.box.yMin, face.box.width, face.box.height);

      // Draw label
      ctx.fillStyle = isSelected ? '#00ff00' : '#ff0000';
      ctx.font = '16px Arial';
      ctx.fillText(
        isSelected ? '✓ Selected' : '✗ Not selected',
        face.box.xMin,
        face.box.yMin - 5
      );
    });
  };

  useEffect(() => {
    drawFaceBoxes();
  }, [faces, selectedFaces, processed]);

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
    <Box>
      <Typography variant="h5" gutterBottom>
        Image Processing
      </Typography>

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
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              {faces.map((face) => {
                const thumbnail = canvasRef.current
                  ? createFaceThumbnail(canvasRef.current, face.box)
                  : '';

                return (
                  <Card
                    key={face.id}
                    sx={{
                      cursor: 'pointer',
                      border: selectedFaces.has(face.id) ? '2px solid #00ff00' : '2px solid transparent',
                    }}
                    onClick={() => handleFaceToggle(face.id)}
                  >
                    {thumbnail && (
                      <img
                        src={thumbnail}
                        alt="Face"
                        style={{ width: '100%', height: 'auto' }}
                      />
                    )}
                    <CardContent sx={{ p: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox
                          checked={selectedFaces.has(face.id)}
                          size="small"
                        />
                        <Typography variant="caption">
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
            <Typography gutterBottom>
              Blur Intensity: {blurIntensity}
            </Typography>
            <Slider
              value={blurIntensity}
              onChange={(_, value) => setBlurIntensity(value as number)}
              min={5}
              max={50}
              disabled={processing}
            />
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={processing ? <CircularProgress size={20} /> : <BlurOnIcon />}
              onClick={handleApplyBlur}
              disabled={processing || selectedFaces.size === 0}
            >
              Apply Blur
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={!processed}
            >
              Export Image
            </Button>
            <Button variant="outlined" onClick={onBack}>
              Back
            </Button>
          </Box>
        </>
      )}

      <Paper sx={{ p: 2, overflow: 'auto', maxHeight: '70vh' }}>
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />
        <canvas
          ref={displayCanvasRef}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </Paper>
    </Box>
  );
};
