import { DetectedFace, MaskConfiguration } from '../types';
import { applyBlur, applyEmoji } from './canvasUtils';

export async function processVideoFrame(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  faces: DetectedFace[],
  config: MaskConfiguration
): Promise<void> {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

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
}

export function createVideoRecorder(
  canvas: HTMLCanvasElement,
  mimeType = 'video/webm'
): { recorder: MediaRecorder; chunks: Blob[] } {
  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return { recorder, chunks };
}

export async function exportVideo(chunks: Blob[], filename: string): Promise<void> {
  const blob = new Blob(chunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.webm`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getVideoMetadata(
  video: HTMLVideoElement
): { width: number; height: number; duration: number } {
  return {
    width: video.videoWidth,
    height: video.videoHeight,
    duration: video.duration,
  };
}
