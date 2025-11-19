/**
 * Main application component
 */

import { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  Alert,
  Chip,
} from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';
import { FileUploader } from './components/FileUploader';
import { ImageProcessor } from './components/ImageProcessor';
import { VideoProcessor } from './components/VideoProcessor';
import { getFaceDetectionService } from './services/faceDetection';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

type AppMode = 'upload' | 'image' | 'video';

function App() {
  const [mode, setMode] = useState<AppMode>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [backendInfo, setBackendInfo] = useState<string>('');

  useEffect(() => {
    const initializeFaceDetection = async () => {
      try {
        setInitializing(true);
        const service = getFaceDetectionService();
        await service.initialize({ useWebGPU: true });

        const backend = service.getBackend();
        const webgpu = service.isWebGPUEnabled();
        setBackendInfo(`Backend: ${backend.toUpperCase()}${webgpu ? ' (GPU Accelerated)' : ''}`);

        setInitializing(false);
      } catch (error) {
        console.error('Failed to initialize:', error);
        setInitError('Failed to initialize face detection. Please refresh the page.');
        setInitializing(false);
      }
    };

    initializeFaceDetection();
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);

    // Determine mode based on file type
    if (file.type.startsWith('image/')) {
      setMode('image');
    } else if (file.type.startsWith('video/')) {
      setMode('video');
    }
  };

  const handleBack = () => {
    setMode('upload');
    setSelectedFile(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
        <AppBar position="static" component="header">
          <Toolbar>
            <FaceIcon sx={{ mr: 2 }} aria-hidden="true" />
            <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
              Face Marker Web - Privacy-First Face Blur Tool
            </Typography>
            {backendInfo && (
              <Chip
                label={backendInfo}
                color="secondary"
                size="small"
                aria-label={`Current backend: ${backendInfo}`}
              />
            )}
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ py: 4 }} component="main" aria-label="Main content">
          {initializing && (
            <Alert severity="info" sx={{ mb: 2 }} role="status">
              Initializing face detection model... This may take a moment.
            </Alert>
          )}

          {initError && (
            <Alert severity="error" sx={{ mb: 2 }} role="alert">
              {initError}
            </Alert>
          )}

          {!initializing && !initError && (
            <>
              <Paper sx={{ p: 3, mb: 3 }} component="section" aria-labelledby="welcome-heading">
                <Typography variant="h4" gutterBottom id="welcome-heading">
                  Welcome to Face Marker Web
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  A privacy-first tool for detecting and blurring faces in images and videos.
                  All processing happens locally in your browser - your media never leaves your device.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }} role="list" aria-label="Key features">
                  <Chip label="100% Client-Side" color="primary" size="small" role="listitem" />
                  <Chip label="No Server Upload" color="primary" size="small" role="listitem" />
                  <Chip label="WebGPU Accelerated" color="primary" size="small" role="listitem" />
                  <Chip label="Privacy Protected" color="primary" size="small" role="listitem" />
                </Box>
              </Paper>

              {mode === 'upload' && (
                <section aria-label="File upload section">
                  <FileUploader onFileSelect={handleFileSelect} disabled={initializing} />
                </section>
              )}

              {mode === 'image' && selectedFile && (
                <ImageProcessor file={selectedFile} onBack={handleBack} />
              )}

              {mode === 'video' && selectedFile && (
                <VideoProcessor file={selectedFile} onBack={handleBack} />
              )}
            </>
          )}

          <Paper sx={{ p: 2, mt: 4, backgroundColor: 'rgba(0,0,0,0.02)' }} component="aside" aria-label="Privacy notice">
            <Typography variant="body2" color="text.secondary" align="center">
              <strong>Privacy Notice:</strong> This application processes all media locally in your browser.
              No data is sent to any server. Models are downloaded once and cached for offline use.
            </Typography>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
