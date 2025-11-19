/**
 * Video processing service with face tracking
 */

import type { FaceDetection, FaceTrack, ProcessingOptions, MediaFile, BoundingBox } from '../types';
import { getFaceDetectionService } from './faceDetection';
import { applyBlurToRegions, createFaceThumbnail } from '../utils/blur';
import { VideoProcessingError } from '../utils/errorHandler';
import { cleanupCanvas } from '../utils/canvas';
import {
  FRAME_RATE,
  SAMPLE_RATE,
  FACE_TRACK_IOU_THRESHOLD,
  VIDEO_BITRATE,
  BLUR_PADDING,
  VIDEO_SEEK_DELAY,
} from '../constants';

/**
 * Service for processing videos with face detection, tracking, and blur effects.
 * Handles video loading, face tracking across frames, and video export with blur applied.
 *
 * @example
 * const service = new VideoProcessingService();
 * const { video, mediaFile } = await service.loadVideo(videoFile);
 * const tracks = await service.detectFacesInVideo(video);
 */
export class VideoProcessingService {
  private frameRate = FRAME_RATE;
  private sampleRate = SAMPLE_RATE; // Process every 5th frame for performance

  /**
   * Loads a video file and extracts its metadata.
   * Creates a video element and waits for metadata to be loaded.
   *
   * @param file - Video file to load (MP4, WebM, etc.)
   * @returns Promise resolving to object containing video element and media file metadata
   * @throws VideoProcessingError if video fails to load or is in an unsupported format
   *
   * @example
   * const { video, mediaFile } = await service.loadVideo(file);
   * console.log(`Video dimensions: ${mediaFile.width}x${mediaFile.height}`);
   */
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
        // Revoke URL after video metadata is loaded
        URL.revokeObjectURL(url);
        resolve({ video, mediaFile });
      };

      video.onerror = () => {
        // Clean up URL on error
        URL.revokeObjectURL(url);
        reject(new VideoProcessingError(
          'Failed to load video file',
          'Failed to load video. The file may be corrupted or in an unsupported format.'
        ));
      };
    });
  }

  /**
   * Detects faces throughout a video and creates face tracks.
   * Samples frames at regular intervals for performance, detects faces in each frame,
   * and groups detections across frames into coherent tracks.
   *
   * @param video - Video element to analyze
   * @param options - Face detection configuration options
   * @param options.maxFaces - Maximum number of faces to detect per frame
   * @param options.detectionConfidence - Minimum confidence threshold for detections
   * @param onProgress - Optional callback to report progress (0-1)
   * @returns Promise resolving to array of face tracks, each containing detections across multiple frames
   * @throws VideoProcessingError if canvas context cannot be created
   *
   * @example
   * const tracks = await service.detectFacesInVideo(video, {}, (progress) => {
   *   console.log(`Progress: ${Math.round(progress * 100)}%`);
   * });
   */
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
      throw new VideoProcessingError(
        'Could not get canvas 2d context for face detection',
        'Failed to initialize video processing. Your browser may not support this feature.'
      );
    }

    const faceDetectionService = getFaceDetectionService();
    const duration = video.duration;
    const totalFrames = Math.floor(duration * this.frameRate);
    const framesToProcess = Math.floor(totalFrames / this.sampleRate);

    const allDetections: FaceDetection[][] = [];

    try {
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
    } finally {
      // Clean up canvas
      cleanupCanvas(canvas);
    }
  }

  /**
   * Seeks the video to a specific time and waits for the seek operation to complete.
   * Uses the 'seeked' event to ensure the video has finished seeking before resolving.
   *
   * @param video - Video element to seek
   * @param time - Target time in seconds
   * @returns Promise that resolves when seek operation is complete
   */
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

  /**
   * Creates face tracks by grouping face detections across frames using IoU matching.
   *
   * This algorithm implements a simple yet effective face tracking approach:
   *
   * 1. **Initialization**: Start with an empty array of tracks
   *
   * 2. **Frame-by-frame Processing**: For each frame's face detections:
   *    - Iterate through each detected face
   *    - Try to match it with existing tracks using IoU (Intersection over Union)
   *
   * 3. **Matching Strategy**:
   *    - Compare the face's bounding box with the last detection in each existing track
   *    - Calculate IoU score (overlap ratio) between bounding boxes
   *    - If IoU > threshold (0.3), the face belongs to that track
   *    - A face is matched to the first track that exceeds the threshold
   *
   * 4. **Track Creation**:
   *    - If no matching track is found (IoU below threshold for all tracks),
   *      create a new track with the current face as its first detection
   *    - Generate a thumbnail for visual identification
   *
   * 5. **IoU Calculation**:
   *    - Measures overlap between bounding boxes
   *    - Formula: intersection_area / union_area
   *    - Higher values indicate better match (same person across frames)
   *
   * This approach assumes:
   * - Faces don't move drastically between sampled frames
   * - The first matching track with sufficient IoU is the correct one
   * - A threshold of 0.3 balances between false positives and track fragmentation
   *
   * Limitations:
   * - May create duplicate tracks if faces move quickly
   * - Doesn't handle occlusion or re-identification after disappearance
   * - Simple greedy matching (no global optimization)
   *
   * @param allDetections - Array of face detections for each processed frame
   * @param canvas - Canvas element used to extract face thumbnails
   * @returns Array of face tracks, each containing detections of the same face across frames
   */
  private createFaceTracks(allDetections: FaceDetection[][], canvas: HTMLCanvasElement): FaceTrack[] {
    const tracks: FaceTrack[] = [];
    const trackThreshold = FACE_TRACK_IOU_THRESHOLD; // IoU threshold for same face

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

  /**
   * Calculates Intersection over Union (IoU) between two bounding boxes.
   * IoU is a measure of overlap between two rectangles, ranging from 0 (no overlap) to 1 (perfect match).
   * Used for matching face detections across frames to create coherent tracks.
   *
   * @param box1 - First bounding box
   * @param box2 - Second bounding box
   * @returns IoU score between 0 and 1
   */
  private calculateIoU(box1: BoundingBox, box2: BoundingBox): number {
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

  /**
   * Processes a video by applying blur to selected face tracks and exports the result.
   * Creates a new video with blur applied to faces in the selected tracks across all frames.
   *
   * @param video - Source video element
   * @param tracks - Array of face tracks (only tracks with selected=true will be blurred)
   * @param blurIntensity - Blur radius intensity (higher values = more blur)
   * @param onProgress - Optional callback to report progress (0-1)
   * @returns Promise resolving to video blob in WebM format
   * @throws VideoProcessingError if canvas context cannot be created
   *
   * @example
   * const blob = await service.processVideoWithBlur(video, tracks, 20, (progress) => {
   *   console.log(`Encoding: ${Math.round(progress * 100)}%`);
   * });
   */
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
      throw new VideoProcessingError(
        'Could not get canvas 2d context for video processing',
        'Failed to process video. Your browser may not support this feature.'
      );
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
      videoBitsPerSecond: VIDEO_BITRATE,
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

    try {
      // Process each frame
      const duration = video.duration;
      const totalFrames = Math.floor(duration * this.frameRate);

      video.currentTime = 0;
      await new Promise((resolve) => setTimeout(resolve, VIDEO_SEEK_DELAY));

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
            padding: BLUR_PADDING,
          });
        }

        // Wait for next frame
        await new Promise((resolve) => setTimeout(resolve, 1000 / this.frameRate));

        if (onProgress) {
          onProgress((frameNum + 1) / totalFrames);
        }
      }

      mediaRecorder.stop();
      const blob = await recordingPromise;

      return blob;
    } finally {
      // Clean up canvas
      cleanupCanvas(canvas);
    }
  }

  /**
   * Triggers a download of a video blob to the user's device.
   * Creates a temporary anchor element to initiate the browser download.
   *
   * @param blob - Video blob to download
   * @param filename - Desired filename for the downloaded file
   *
   * @example
   * const blob = await service.processVideoWithBlur(video, tracks, 20);
   * service.downloadVideo(blob, 'blurred-video.webm');
   */
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
