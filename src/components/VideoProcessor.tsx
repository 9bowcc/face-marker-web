/**
 * Video processing component with face tracking and blur
 */

import { useEffect, useState } from 'react';
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
  LinearProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import type { FaceTrack, ProcessingOptions } from '../types';
import { videoProcessingService } from '../services/videoProcessing';

interface VideoProcessorProps {
  file: File;
  onBack: () => void;
}

export const VideoProcessor: React.FC<VideoProcessorProps> = ({ file, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracks, setTracks] = useState<FaceTrack[]>([]);
  const [blurIntensity, setBlurIntensity] = useState(20);
  const [progress, setProgress] = useState(0);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);

  useEffect(() => {
    loadVideo();
  }, [file]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      const { video } = await videoProcessingService.loadVideo(file);
      setVideoElement(video);

      setLoading(false);
    } catch (err) {
      console.error('Error loading video:', err);
      setError('Failed to load video. Please try again.');
      setLoading(false);
    }
  };

  const handleDetectFaces = async () => {
    if (!videoElement) return;

    try {
      setDetecting(true);
      setError(null);
      setProgress(0);

      const options: Partial<ProcessingOptions> = {
        detectionConfidence: 0.5,
        useWebGPU: true,
      };

      const detectedTracks = await videoProcessingService.detectFacesInVideo(
        videoElement,
        options,
        (p) => setProgress(p * 100)
      );

      setTracks(detectedTracks);

      // Select all tracks by default
      setTracks((prev) =>
        prev.map((track) => ({ ...track, selected: true }))
      );

      setDetecting(false);
    } catch (err) {
      console.error('Error detecting faces:', err);
      setError('Failed to detect faces. Please try again.');
      setDetecting(false);
    }
  };

  const handleTrackToggle = (trackId: string) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, selected: !track.selected } : track
      )
    );
  };

  const handleProcessVideo = async () => {
    if (!videoElement) return;

    try {
      setProcessing(true);
      setError(null);
      setProgress(0);

      const blob = await videoProcessingService.processVideoWithBlur(
        videoElement,
        tracks,
        blurIntensity,
        (p) => setProgress(p * 100)
      );

      setProcessedBlob(blob);
      setProcessing(false);
    } catch (err) {
      console.error('Error processing video:', err);
      setError('Failed to process video. Please try again.');
      setProcessing(false);
    }
  };

  const handleExport = () => {
    if (!processedBlob) return;

    const filename = `blurred_${file.name.replace(/\.[^/.]+$/, '')}.webm`;
    videoProcessingService.downloadVideo(processedBlob, filename);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading video...
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
        Video Processing
      </Typography>

      {videoElement && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <video
            src={URL.createObjectURL(file)}
            controls
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </Paper>
      )}

      {tracks.length === 0 && !detecting && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Click "Detect Faces" to start analyzing the video. This may take a few moments.
          </Alert>
          <Button
            variant="contained"
            onClick={handleDetectFaces}
            disabled={detecting}
            fullWidth
          >
            Detect Faces
          </Button>
        </Box>
      )}

      {detecting && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography gutterBottom>Detecting faces in video...</Typography>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            {Math.round(progress)}% complete
          </Typography>
        </Paper>
      )}

      {tracks.length > 0 && !detecting && (
        <>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Detected Face Tracks ({tracks.length})
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Each track represents a unique face found in the video. Select the faces you want to blur.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mt: 1 }}>
              {tracks.map((track) => (
                <Card
                  key={track.id}
                  sx={{
                    cursor: 'pointer',
                    border: track.selected ? '2px solid #00ff00' : '2px solid transparent',
                  }}
                  onClick={() => handleTrackToggle(track.id)}
                >
                  {track.thumbnail && (
                    <img
                      src={track.thumbnail}
                      alt="Face Track"
                      style={{ width: '100%', height: 'auto' }}
                    />
                  )}
                  <CardContent sx={{ p: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox checked={track.selected} size="small" />
                      <Typography variant="caption">
                        {track.faces.length} frames
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography gutterBottom>Blur Intensity: {blurIntensity}</Typography>
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
              startIcon={<BlurOnIcon />}
              onClick={handleProcessVideo}
              disabled={processing || tracks.filter((t) => t.selected).length === 0}
            >
              Process Video
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={!processedBlob}
            >
              Export Video
            </Button>
            <Button variant="outlined" onClick={onBack}>
              Back
            </Button>
          </Box>

          {processing && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography gutterBottom>Processing video with blur...</Typography>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {Math.round(progress)}% complete
              </Typography>
              <Alert severity="info" sx={{ mt: 2 }}>
                This process may take several minutes depending on video length. Please be patient.
              </Alert>
            </Paper>
          )}

          {processedBlob && !processing && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Video processed successfully! Click "Export Video" to download.
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};
