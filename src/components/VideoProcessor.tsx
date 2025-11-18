/**
 * Video processing component with face tracking and blur
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
  LinearProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import type { FaceTrack, ProcessingOptions } from '../types';
import { videoProcessingService } from '../services/videoProcessing';
import { handleError } from '../utils/errorHandler';
import {
  DEFAULT_BLUR_INTENSITY,
  DEFAULT_DETECTION_CONFIDENCE,
  MIN_BLUR_INTENSITY,
  MAX_BLUR_INTENSITY,
  FACE_BOX_SELECTED_COLOR,
} from '../constants';

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
  const [blurIntensity, setBlurIntensity] = useState(DEFAULT_BLUR_INTENSITY);
  const [progress, setProgress] = useState(0);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const videoUrlRef = useRef<string | null>(null);
  const processedBlobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    loadVideo();

    // Cleanup function
    return () => {
      // Revoke video URL
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
        videoUrlRef.current = null;
      }

      // Revoke processed blob URL
      if (processedBlobUrlRef.current) {
        URL.revokeObjectURL(processedBlobUrlRef.current);
        processedBlobUrlRef.current = null;
      }

      // Clean up video element
      if (videoElement) {
        videoElement.pause();
        videoElement.src = '';
        videoElement.load();
      }
    };
  }, [file, videoElement]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError(null);

      const { video } = await videoProcessingService.loadVideo(file);
      setVideoElement(video);

      setLoading(false);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
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
        detectionConfidence: DEFAULT_DETECTION_CONFIDENCE,
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
      const errorMessage = handleError(err);
      setError(errorMessage);
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
      const errorMessage = handleError(err);
      setError(errorMessage);
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
    <Box role="region" aria-label="Video processing interface">
      <Typography variant="h5" gutterBottom>
        Video Processing
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
        {detecting && `Detecting faces in video, ${Math.round(progress)}% complete`}
        {processing && `Processing video with blur, ${Math.round(progress)}% complete`}
        {processedBlob && !processing && 'Video processing complete, ready to export'}
      </Box>

      {videoElement && (
        <Paper sx={{ p: 2, mb: 2 }}>
          <video
            src={(() => {
              if (!videoUrlRef.current) {
                videoUrlRef.current = URL.createObjectURL(file);
              }
              return videoUrlRef.current;
            })()}
            controls
            style={{ maxWidth: '100%', height: 'auto' }}
            aria-label="Video preview player"
          >
            <track kind="captions" />
          </video>
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
            aria-label="Start detecting faces in video"
          >
            Detect Faces
          </Button>
        </Box>
      )}

      {detecting && (
        <Paper sx={{ p: 2, mb: 2 }} role="status" aria-label="Face detection progress">
          <Typography gutterBottom>Detecting faces in video...</Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            aria-label="Detection progress"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
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
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mt: 1 }} role="list" aria-label="Detected face tracks">
              {tracks.map((track, index) => (
                <Card
                  key={track.id}
                  sx={{
                    cursor: 'pointer',
                    border: track.selected ? `2px solid ${FACE_BOX_SELECTED_COLOR}` : '2px solid transparent',
                  }}
                  onClick={() => handleTrackToggle(track.id)}
                  role="listitem"
                >
                  {track.thumbnail && (
                    <img
                      src={track.thumbnail}
                      alt={`Face track ${index + 1}, appears in ${track.faces.length} frames`}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  )}
                  <CardContent sx={{ p: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox
                        checked={track.selected}
                        size="small"
                        aria-label={`Face track ${index + 1}, appears in ${track.faces.length} frames, ${track.selected ? 'selected' : 'not selected'}`}
                        inputProps={{
                          'aria-describedby': `track-${track.id}-label`,
                        }}
                      />
                      <Typography variant="caption" id={`track-${track.id}-label`}>
                        {track.faces.length} frames
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography id="video-blur-intensity-label" gutterBottom>
              Blur Intensity: {blurIntensity}
            </Typography>
            <Slider
              value={blurIntensity}
              onChange={(_, value) => setBlurIntensity(value as number)}
              min={MIN_BLUR_INTENSITY}
              max={MAX_BLUR_INTENSITY}
              disabled={processing}
              aria-labelledby="video-blur-intensity-label"
              aria-valuemin={MIN_BLUR_INTENSITY}
              aria-valuemax={MAX_BLUR_INTENSITY}
              aria-valuenow={blurIntensity}
              aria-valuetext={`Blur intensity ${blurIntensity}`}
            />
          </Paper>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<BlurOnIcon />}
              onClick={handleProcessVideo}
              disabled={processing || tracks.filter((t) => t.selected).length === 0}
              aria-label={processing ? 'Processing video' : 'Process video with blur on selected faces'}
            >
              Process Video
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={!processedBlob}
              aria-label="Download processed video"
            >
              Export Video
            </Button>
            <Button variant="outlined" onClick={onBack} aria-label="Go back to file upload">
              Back
            </Button>
          </Box>

          {processing && (
            <Paper sx={{ p: 2, mb: 2 }} role="status" aria-label="Video processing progress">
              <Typography gutterBottom>Processing video with blur...</Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                aria-label="Processing progress"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
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
