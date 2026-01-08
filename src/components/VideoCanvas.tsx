import { useRef, useEffect, useState, useCallback } from 'react';
import { Box, IconButton, Stack, Slider, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { DetectedFace, MaskConfiguration } from '../types';
import { processVideoFrame } from '../utils/videoUtils';
import { drawBoundingBox } from '../utils/canvasUtils';

interface VideoCanvasProps {
  videoSrc: string | null;
  faces: DetectedFace[];
  maskConfig: MaskConfiguration;
  onFaceClick: (faceId: string) => void;
  onTimeUpdate?: (time: number) => void;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export function VideoCanvas({
  videoSrc,
  faces,
  maskConfig,
  onFaceClick,
  onTimeUpdate,
  canvasRef: externalCanvasRef,
}: VideoCanvasProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;
  const animationRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!videoSrc || !videoRef.current) return;

    const video = videoRef.current;
    video.src = videoSrc;

    video.onloadedmetadata = () => {
      setDuration(video.duration);
      if (canvasRef.current) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
      }
    };
  }, [videoSrc, canvasRef]);

  const renderFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    processVideoFrame(video, canvas, faces, maskConfig);

    for (const face of faces) {
      drawBoundingBox(ctx, face, { selected: face.isSelected });
    }

    setCurrentTime(video.currentTime);
    onTimeUpdate?.(video.currentTime);

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(renderFrame);
    }
  }, [faces, maskConfig, isPlaying, onTimeUpdate, canvasRef]);

  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(renderFrame);
    } else if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, renderFrame]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (_: Event, value: number | number[]) => {
    if (!videoRef.current) return;
    const time = value as number;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    renderFrame();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    for (const face of faces) {
      if (
        x >= face.x &&
        x <= face.x + face.width &&
        y >= face.y &&
        y <= face.y + face.height
      ) {
        onFaceClick(face.id);
        break;
      }
    }
  };

  return (
    <Box>
      <video ref={videoRef} style={{ display: 'none' }} />

      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '70vh',
          cursor: 'pointer',
        }}
      />

      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ mt: 2, px: 1 }}
      >
        <IconButton onClick={togglePlay}>
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
        <Typography variant="caption" sx={{ minWidth: 40 }}>
          {formatTime(currentTime)}
        </Typography>
        <Slider
          value={currentTime}
          min={0}
          max={duration || 100}
          onChange={handleSeek}
          size="small"
          sx={{ flex: 1 }}
        />
        <Typography variant="caption" sx={{ minWidth: 40 }}>
          {formatTime(duration)}
        </Typography>
      </Stack>
    </Box>
  );
}
