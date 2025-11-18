/**
 * Video processing service with face tracking
 */

import type { FaceDetection, FaceTrack, ProcessingOptions, MediaFile } from '../types';
import { getFaceDetectionService } from './faceDetection';
import { applyBlurToRegions, createFaceThumbnail } from '../utils/blur';

export class VideoProcessingService {
  private frameRate = 30;
  private sampleRate = 5; // Process every 5th frame for performance

  async loadVideo(file: File): Promise<{ video: HTMLVideoElement; mediaFile: MediaFile }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const url = URL.createObjectURL(file);
      video.src = url;
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        const mediaFile: MediaFile = {
          file,
          type: 'video',
          url,
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
        };
        resolve({ video, mediaFile });
      };

      video.onerror = () => {
        reject(new Error('Failed to load video'));
      };
    });
  }

  async detectFacesInVideo(
    video: HTMLVideoElement,
    options: Partial<ProcessingOptions> = {},
    onProgress?: (progress: number) => void
  ): Promise<FaceTrack[]> {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    const faceDetectionService = getFaceDetectionService();
    const duration = video.duration;
    const totalFrames = Math.floor(duration * this.frameRate);
    const framesToProcess = Math.floor(totalFrames / this.sampleRate);

    const allDetections: FaceDetection[][] = [];

    // Process video frames
    for (let i = 0; i < framesToProcess; i++) {
      const frameNumber = i * this.sampleRate;
      const timestamp = frameNumber / this.frameRate;

      // Seek to frame
      await this.seekToTime(video, timestamp);

      // Draw frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Detect faces
      const faces = await faceDetectionService.detectFaces(canvas, options);
      faces.forEach((face) => {
        face.frameNumber = frameNumber;
      });

      allDetections.push(faces);

      // Report progress
      if (onProgress) {
        onProgress((i + 1) / framesToProcess);
      }
    }

    // Create face tracks by grouping nearby faces across frames
    const tracks = this.createFaceTracks(allDetections, canvas);

    return tracks;
  }

  private async seekToTime(video: HTMLVideoElement, time: number): Promise<void> {
    return new Promise((resolve) => {
      const onSeeked = () => {
        video.removeEventListener('seeked', onSeeked);
        resolve();
      };
      video.addEventListener('seeked', onSeeked);
      video.currentTime = time;
    });
  }

  private createFaceTracks(allDetections: FaceDetection[][], canvas: HTMLCanvasElement): FaceTrack[] {
    const tracks: FaceTrack[] = [];
    const trackThreshold = 0.3; // IoU threshold for same face

    allDetections.forEach((frameFaces) => {
      frameFaces.forEach((face) => {
        // Try to match with existing tracks
        let matched = false;

        for (const track of tracks) {
          const lastFace = track.faces[track.faces.length - 1];
          const iou = this.calculateIoU(face.box, lastFace.box);

          if (iou > trackThreshold) {
            track.faces.push(face);
            matched = true;
            break;
          }
        }

        // Create new track if no match
        if (!matched) {
          const thumbnail = createFaceThumbnail(canvas, face.box);
          tracks.push({
            id: `track-${tracks.length}`,
            faces: [face],
            thumbnail,
            selected: false,
          });
        }
      });
    });

    return tracks;
  }

  private calculateIoU(box1: any, box2: any): number {
    const x1 = Math.max(box1.xMin, box2.xMin);
    const y1 = Math.max(box1.yMin, box2.yMin);
    const x2 = Math.min(box1.xMax, box2.xMax);
    const y2 = Math.min(box1.yMax, box2.yMax);

    const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    const area1 = box1.width * box1.height;
    const area2 = box2.width * box2.height;
    const union = area1 + area2 - intersection;

    return intersection / union;
  }

  async processVideoWithBlur(
    video: HTMLVideoElement,
    tracks: FaceTrack[],
    blurIntensity: number,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Create a map of frame numbers to faces
    const selectedTracks = tracks.filter((t) => t.selected);
    const frameToFaces = new Map<number, FaceDetection[]>();

    selectedTracks.forEach((track) => {
      track.faces.forEach((face) => {
        const frameNum = face.frameNumber || 0;
        if (!frameToFaces.has(frameNum)) {
          frameToFaces.set(frameNum, []);
        }
        frameToFaces.get(frameNum)!.push(face);
      });
    });

    // Use MediaRecorder to encode video
    const stream = canvas.captureStream(this.frameRate);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9',
      videoBitsPerSecond: 5000000,
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    const recordingPromise = new Promise<Blob>((resolve) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };
    });

    mediaRecorder.start();

    // Process each frame
    const duration = video.duration;
    const totalFrames = Math.floor(duration * this.frameRate);

    video.currentTime = 0;
    await new Promise((resolve) => setTimeout(resolve, 100));

    for (let frameNum = 0; frameNum < totalFrames; frameNum++) {
      const timestamp = frameNum / this.frameRate;
      await this.seekToTime(video, timestamp);

      // Draw frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Apply blur if faces exist in this frame
      const facesInFrame = frameToFaces.get(frameNum);
      if (facesInFrame && facesInFrame.length > 0) {
        applyBlurToRegions(canvas, facesInFrame.map((f) => f.box), {
          intensity: blurIntensity,
          padding: 10,
        });
      }

      // Wait for next frame
      await new Promise((resolve) => setTimeout(resolve, 1000 / this.frameRate));

      if (onProgress) {
        onProgress((frameNum + 1) / totalFrames);
      }
    }

    mediaRecorder.stop();
    return recordingPromise;
  }

  downloadVideo(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const videoProcessingService = new VideoProcessingService();
