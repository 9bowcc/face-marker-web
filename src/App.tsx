import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { ImageUpload } from './components/ImageUpload';
import { FaceCanvas } from './components/FaceCanvas';
import { VideoCanvas } from './components/VideoCanvas';
import { MaskControls } from './components/MaskControls';
import { ModelSelector } from './components/ModelSelector';
import { DownloadButton } from './components/DownloadButton';
import { FaceList } from './components/FaceList';
import { SensitivitySelector } from './components/SensitivitySelector';
import { useFaceDetection } from './hooks/useFaceDetection';
import { useImageProcessor } from './hooks/useImageProcessor';
import { useMaskConfiguration } from './hooks/useMaskConfiguration';
import {
  DetectedFace,
  MaskConfiguration,
  MediaFile,
  ExportOptions,
  DEFAULT_EXPORT_OPTIONS,
  SensitivityLevel,
  SENSITIVITY_CONFIG,
} from './types';
import { fileToMediaFile, revokeBlobURL, validateFile } from './utils/imageUtils';

function App() {
  const [mediaFile, setMediaFile] = useState<MediaFile | null>(null);
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>('medium');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    detectFaces,
    isDetecting,
    error: detectionError,
    activeDetector,
    switchDetector,
    isReady,
  } = useFaceDetection({ detector: 'auto' });

  const { loadImage, applyMask, exportImage, isProcessing } = useImageProcessor();
  const { config, setMaskType, setBlurIntensity, setEmoji } = useMaskConfiguration();

  // Cleanup blob URL on unmount or file change
  useEffect(() => {
    return () => {
      if (mediaFile?.blobUrl) {
        revokeBlobURL(mediaFile.blobUrl);
      }
    };
  }, [mediaFile?.blobUrl]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      try {
        setError(null);
        setFaces([]);

        const validation = validateFile(file);
        if (!validation.valid) {
          setError(validation.error || 'Invalid file');
          return;
        }

        if (mediaFile?.blobUrl) {
          revokeBlobURL(mediaFile.blobUrl);
        }

        const newMediaFile = await fileToMediaFile(file);
        setMediaFile(newMediaFile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to process file');
      }
    },
    [mediaFile]
  );

  useEffect(() => {
    if (!mediaFile || mediaFile.type === 'video' || !canvasRef.current) {
      return;
    }

    const runDetection = async () => {
      try {
        const response = await fetch(mediaFile.blobUrl);
        const blob = await response.blob();
        const file = new File([blob], 'image', { type: mediaFile.mimeType });
        const img = await loadImage(file, canvasRef.current!);
        const detectedFaces = await detectFaces(img, {
          sourceCanvas: canvasRef.current || undefined,
          minConfidence: SENSITIVITY_CONFIG[sensitivity],
        });
        setFaces(detectedFaces);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to detect faces');
      }
    };

    runDetection();
  }, [mediaFile, loadImage, detectFaces, sensitivity]);

  const handleFaceClick = useCallback((faceId: string) => {
    setFaces((prev) =>
      prev.map((face) =>
        face.id === faceId ? { ...face, isSelected: !face.isSelected } : face
      )
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setFaces((prev) => prev.map((face) => ({ ...face, isSelected: true })));
  }, []);

  const handleDeselectAll = useCallback(() => {
    setFaces((prev) => prev.map((face) => ({ ...face, isSelected: false })));
  }, []);

  const handleConfigChange = useCallback((newConfig: MaskConfiguration) => {
    setMaskType(newConfig.type);
    setBlurIntensity(newConfig.blurIntensity);
    setEmoji(newConfig.emoji);
  }, [setMaskType, setBlurIntensity, setEmoji]);

  const handleDownload = useCallback(
    async (options: ExportOptions = DEFAULT_EXPORT_OPTIONS) => {
      if (!canvasRef.current || faces.length === 0) return;

      try {
        const selectedFaces = faces.filter((f) => f.isSelected);
        if (selectedFaces.length === 0) {
          setError('Please select at least one face to mask');
          return;
        }

        await applyMask(canvasRef.current, selectedFaces, config);
        await exportImage(canvasRef.current, options);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to export image');
      }
    },
    [faces, config, applyMask, exportImage]
  );

  const selectedCount = faces.filter((f) => f.isSelected).length;
  const displayError = error || detectionError;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Face Masker
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Upload an image, detect faces, and apply blur or emoji masks. All processing
        happens in your browser - no data is uploaded.
      </Typography>

      {displayError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {displayError}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Upload Section */}
        <Paper sx={{ p: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <ImageUpload onFileSelect={handleFileSelect} disabled={isDetecting} />
            </Box>
            <Stack direction="row" spacing={2}>
              <ModelSelector
                activeDetector={activeDetector}
                onSwitch={switchDetector}
                disabled={isDetecting || !isReady}
              />
              <SensitivitySelector
                sensitivity={sensitivity}
                onChange={setSensitivity}
                disabled={isDetecting || !isReady}
              />
            </Stack>
          </Stack>
        </Paper>

        {/* Main Content */}
        {mediaFile && (
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
            {/* Canvas Area */}
            <Paper sx={{ flex: 2, p: 2, position: 'relative' }}>
              {isDetecting && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(255,255,255,0.8)',
                    zIndex: 10,
                  }}
                >
                  <Stack alignItems="center" spacing={2}>
                    <CircularProgress />
                    <Typography>Detecting faces...</Typography>
                  </Stack>
                </Box>
              )}
              {mediaFile.type === 'video' ? (
                <VideoCanvas
                  videoSrc={mediaFile.blobUrl}
                  faces={faces}
                  maskConfig={config}
                  onFaceClick={handleFaceClick}
                  canvasRef={canvasRef}
                />
              ) : (
                <FaceCanvas
                  imageSrc={mediaFile.blobUrl}
                  faces={faces}
                  maskConfig={config}
                  onFaceClick={handleFaceClick}
                  canvasRef={canvasRef}
                />
              )}
              {faces.length === 0 && !isDetecting && (
                <Typography color="text.secondary" align="center" sx={{ mt: 2 }}>
                  No faces detected in this image
                </Typography>
              )}
              {faces.length > 0 && (
                <Typography align="center" sx={{ mt: 2 }}>
                  Detected {faces.length} face{faces.length !== 1 ? 's' : ''} •{' '}
                  {selectedCount} selected
                </Typography>
              )}
            </Paper>

            {/* Controls Panel */}
            <Paper sx={{ flex: 1, p: 2 }}>
              <Stack spacing={3}>
                <FaceList
                  faces={faces}
                  onFaceClick={handleFaceClick}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                />
                <MaskControls
                  config={config}
                  onChange={handleConfigChange}
                  selectedCount={selectedCount}
                  disabled={selectedCount === 0}
                />
                <DownloadButton
                  onDownload={handleDownload}
                  disabled={selectedCount === 0 || isProcessing}
                  isProcessing={isProcessing}
                />
              </Stack>
            </Paper>
          </Stack>
        )}
      </Stack>
    </Container>
  );
}

export default App;
