import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoProcessor } from './VideoProcessor';
import { videoProcessingService } from '../services/videoProcessing';
import type { FaceTrack } from '../types';

// Mock the video processing service
vi.mock('../services/videoProcessing', () => ({
  videoProcessingService: {
    loadVideo: vi.fn(),
    detectFacesInVideo: vi.fn(),
    processVideoWithBlur: vi.fn(),
    downloadVideo: vi.fn(),
  },
}));

describe('VideoProcessor', () => {
  const mockFile = new File(['video content'], 'test.mp4', { type: 'video/mp4' });
  const mockOnBack = vi.fn();

  const mockVideoElement = {
    videoWidth: 640,
    videoHeight: 480,
    duration: 10,
    currentTime: 0,
    src: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    pause: vi.fn(),
    load: vi.fn(),
    play: vi.fn(),
  } as unknown as HTMLVideoElement;

  const mockTracks: FaceTrack[] = [
    {
      id: 'track-1',
      faces: [
        {
          id: 'face-1',
          box: {
            xMin: 10,
            yMin: 10,
            xMax: 50,
            yMax: 50,
            width: 40,
            height: 40,
          },
          score: 0.95,
          frameNumber: 0,
        },
      ],
      thumbnail: 'data:image/png;base64,test',
      selected: true,
    },
    {
      id: 'track-2',
      faces: [
        {
          id: 'face-2',
          box: {
            xMin: 100,
            yMin: 100,
            xMax: 140,
            yMax: 140,
            width: 40,
            height: 40,
          },
          score: 0.92,
          frameNumber: 5,
        },
      ],
      thumbnail: 'data:image/png;base64,test2',
      selected: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  describe('Video Loading', () => {
    it('should display loading state initially', () => {
      vi.mocked(videoProcessingService.loadVideo).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      expect(screen.getByText(/Loading video/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should load video successfully', async () => {
      vi.mocked(videoProcessingService.loadVideo).mockResolvedValue({
        video: mockVideoElement,
        mediaFile: {
          file: mockFile,
          type: 'video',
          url: 'blob:mock-url',
          width: 640,
          height: 480,
          duration: 10,
        },
      });

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.queryByText(/Loading video/i)).not.toBeInTheDocument();
      });

      expect(videoProcessingService.loadVideo).toHaveBeenCalledWith(mockFile);
      expect(screen.getByText(/Video Processing/i)).toBeInTheDocument();
    });

    it('should handle video loading error', async () => {
      vi.mocked(videoProcessingService.loadVideo).mockRejectedValue(
        new Error('Failed to load')
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /Back/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Face Detection', () => {
    beforeEach(async () => {
      vi.mocked(videoProcessingService.loadVideo).mockResolvedValue({
        video: mockVideoElement,
        mediaFile: {
          file: mockFile,
          type: 'video',
          url: 'blob:mock-url',
          width: 640,
          height: 480,
          duration: 10,
        },
      });
    });

    it('should show detect faces button when no tracks exist', async () => {
      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      expect(detectButton).toBeEnabled();
    });

    it('should trigger face detection on button click', async () => {
      vi.mocked(videoProcessingService.detectFacesInVideo).mockResolvedValue(
        mockTracks
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(videoProcessingService.detectFacesInVideo).toHaveBeenCalledWith(
          mockVideoElement,
          expect.objectContaining({
            detectionConfidence: 0.5,
            useWebGPU: true,
          }),
          expect.any(Function)
        );
      });
    });

    it('should display progress during face detection', async () => {
      vi.mocked(videoProcessingService.detectFacesInVideo).mockImplementation(
        (video, options, onProgress) => {
          if (onProgress) {
            onProgress(0.5);
          }
          return new Promise(() => {}); // Never resolves to keep loading state
        }
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        const status = screen.getByRole('status', { name: /Face detection progress/i });
        expect(status).toBeInTheDocument();
        expect(status).toHaveTextContent(/50% complete/i);
      });
    });

    it('should display detected tracks after detection completes', async () => {
      vi.mocked(videoProcessingService.detectFacesInVideo).mockResolvedValue(
        mockTracks
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/Detected Face Tracks \(2\)/i)).toBeInTheDocument();
      });
    });

    it('should handle face detection error', async () => {
      vi.mocked(videoProcessingService.detectFacesInVideo).mockRejectedValue(
        new Error('Detection failed')
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument();
      });
    });
  });

  describe('Track Selection', () => {
    beforeEach(async () => {
      vi.mocked(videoProcessingService.loadVideo).mockResolvedValue({
        video: mockVideoElement,
        mediaFile: {
          file: mockFile,
          type: 'video',
          url: 'blob:mock-url',
          width: 640,
          height: 480,
          duration: 10,
        },
      });

      vi.mocked(videoProcessingService.detectFacesInVideo).mockResolvedValue(
        mockTracks
      );
    });

    it('should toggle track selection on click', async () => {
      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/Detected Face Tracks/i)).toBeInTheDocument();
      });

      const trackCards = screen.getAllByRole('img');
      expect(trackCards).toHaveLength(2);

      // Click first track to deselect
      fireEvent.click(trackCards[0].parentElement!);

      // Verify checkboxes updated
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0]).not.toBeChecked();
      expect(checkboxes[1]).toBeChecked();
    });

    it('should show number of frames per track', async () => {
      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        const frameLabels = screen.getAllByText(/1 frames/i);
        expect(frameLabels.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Blur Intensity Slider', () => {
    beforeEach(async () => {
      vi.mocked(videoProcessingService.loadVideo).mockResolvedValue({
        video: mockVideoElement,
        mediaFile: {
          file: mockFile,
          type: 'video',
          url: 'blob:mock-url',
          width: 640,
          height: 480,
          duration: 10,
        },
      });

      vi.mocked(videoProcessingService.detectFacesInVideo).mockResolvedValue(
        mockTracks
      );
    });

    it('should display blur intensity slider with default value', async () => {
      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/Blur Intensity: 20/i)).toBeInTheDocument();
      });
    });

    it('should update blur intensity on slider change', async () => {
      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/Blur Intensity: 20/i)).toBeInTheDocument();
      });

      const slider = screen.getByRole('slider');
      fireEvent.change(slider, { target: { value: 35 } });

      await waitFor(() => {
        expect(screen.getByText(/Blur Intensity: 35/i)).toBeInTheDocument();
      });
    });

    it('should disable slider during processing', async () => {
      vi.mocked(videoProcessingService.processVideoWithBlur).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/Process Video/i)).toBeInTheDocument();
      });

      const processButton = screen.getByRole('button', { name: /Process Video/i });
      fireEvent.click(processButton);

      await waitFor(() => {
        const slider = screen.getByRole('slider');
        expect(slider).toBeDisabled();
      });
    });
  });

  describe('Video Processing', () => {
    beforeEach(async () => {
      vi.mocked(videoProcessingService.loadVideo).mockResolvedValue({
        video: mockVideoElement,
        mediaFile: {
          file: mockFile,
          type: 'video',
          url: 'blob:mock-url',
          width: 640,
          height: 480,
          duration: 10,
        },
      });

      vi.mocked(videoProcessingService.detectFacesInVideo).mockResolvedValue(
        mockTracks
      );
    });

    it('should process video with blur on button click', async () => {
      const mockBlob = new Blob(['processed video'], { type: 'video/webm' });
      vi.mocked(videoProcessingService.processVideoWithBlur).mockResolvedValue(
        mockBlob
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/Process Video/i)).toBeInTheDocument();
      });

      const processButton = screen.getByRole('button', { name: /Process Video/i });
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(videoProcessingService.processVideoWithBlur).toHaveBeenCalledWith(
          mockVideoElement,
          expect.arrayContaining([
            expect.objectContaining({ id: 'track-1', selected: true }),
            expect.objectContaining({ id: 'track-2', selected: true }),
          ]),
          20,
          expect.any(Function)
        );
      });
    });

    it('should disable process button when no tracks are selected', async () => {
      vi.mocked(videoProcessingService.detectFacesInVideo).mockResolvedValue(
        mockTracks
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/Detected Face Tracks/i)).toBeInTheDocument();
      });

      // Deselect all tracks
      const trackCards = screen.getAllByRole('img');
      trackCards.forEach(card => {
        fireEvent.click(card.parentElement!);
      });

      await waitFor(() => {
        const processButton = screen.getByRole('button', { name: /Process Video/i });
        expect(processButton).toBeDisabled();
      });
    });

    it('should show progress during video processing', async () => {
      vi.mocked(videoProcessingService.processVideoWithBlur).mockImplementation(
        (video, tracks, intensity, onProgress) => {
          if (onProgress) {
            onProgress(0.75);
          }
          return new Promise(() => {}); // Never resolves
        }
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/Process Video/i)).toBeInTheDocument();
      });

      const processButton = screen.getByRole('button', { name: /Process Video/i });
      fireEvent.click(processButton);

      await waitFor(() => {
        const status = screen.getByRole('status', { name: /Video processing progress/i });
        expect(status).toBeInTheDocument();
        expect(status).toHaveTextContent(/75% complete/i);
      });
    });

    it('should show success message after processing completes', async () => {
      const mockBlob = new Blob(['processed video'], { type: 'video/webm' });
      vi.mocked(videoProcessingService.processVideoWithBlur).mockResolvedValue(
        mockBlob
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/Process Video/i)).toBeInTheDocument();
      });

      const processButton = screen.getByRole('button', { name: /Process Video/i });
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(screen.getByText(/Video processed successfully/i)).toBeInTheDocument();
      });
    });

    it('should handle video processing error', async () => {
      vi.mocked(videoProcessingService.processVideoWithBlur).mockRejectedValue(
        new Error('Processing failed')
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/Process Video/i)).toBeInTheDocument();
      });

      const processButton = screen.getByRole('button', { name: /Process Video/i });
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument();
      });
    });
  });

  describe('Export Functionality', () => {
    beforeEach(async () => {
      vi.mocked(videoProcessingService.loadVideo).mockResolvedValue({
        video: mockVideoElement,
        mediaFile: {
          file: mockFile,
          type: 'video',
          url: 'blob:mock-url',
          width: 640,
          height: 480,
          duration: 10,
        },
      });

      vi.mocked(videoProcessingService.detectFacesInVideo).mockResolvedValue(
        mockTracks
      );
    });

    it('should disable export button when no processed video exists', async () => {
      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/Detected Face Tracks/i)).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /Download processed video/i });
      expect(exportButton).toBeDisabled();
    });

    it('should enable export button after processing completes', async () => {
      const mockBlob = new Blob(['processed video'], { type: 'video/webm' });
      vi.mocked(videoProcessingService.processVideoWithBlur).mockResolvedValue(
        mockBlob
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/Detected Face Tracks/i)).toBeInTheDocument();
      });

      const processButton = screen.getByRole('button', { name: /Process Video/i });
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(screen.getByText(/Video processed successfully/i)).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /Download processed video/i });
      expect(exportButton).toBeEnabled();
    });

    it('should trigger download on export button click', async () => {
      const mockBlob = new Blob(['processed video'], { type: 'video/webm' });
      vi.mocked(videoProcessingService.processVideoWithBlur).mockResolvedValue(
        mockBlob
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/Detected Face Tracks/i)).toBeInTheDocument();
      });

      const processButton = screen.getByRole('button', { name: /Process Video/i });
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(screen.getByText(/Video processed successfully/i)).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /Download processed video/i });
      fireEvent.click(exportButton);

      expect(videoProcessingService.downloadVideo).toHaveBeenCalledWith(
        mockBlob,
        'blurred_test.webm'
      );
    });

    it('should generate correct filename for export', async () => {
      const mockBlob = new Blob(['processed video'], { type: 'video/webm' });
      vi.mocked(videoProcessingService.processVideoWithBlur).mockResolvedValue(
        mockBlob
      );

      const fileWithExtension = new File(['video'], 'my-video.mp4', { type: 'video/mp4' });

      render(<VideoProcessor file={fileWithExtension} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/Detected Face Tracks/i)).toBeInTheDocument();
      });

      const processButton = screen.getByRole('button', { name: /Process Video/i });
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(screen.getByText(/Video processed successfully/i)).toBeInTheDocument();
      });

      const exportButton = screen.getByRole('button', { name: /Download processed video/i });
      fireEvent.click(exportButton);

      expect(videoProcessingService.downloadVideo).toHaveBeenCalledWith(
        mockBlob,
        'blurred_my-video.webm'
      );
    });
  });

  describe('Error States', () => {
    it('should clear previous errors when retrying', async () => {
      vi.mocked(videoProcessingService.loadVideo)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce({
          video: mockVideoElement,
          mediaFile: {
            file: mockFile,
            type: 'video',
            url: 'blob:mock-url',
            width: 640,
            height: 480,
            duration: 10,
          },
        });

      const { rerender } = render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument();
      });

      // Simulate retry by re-rendering with same props
      rerender(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.queryByText(/An unexpected error occurred/i)).not.toBeInTheDocument();
      });
    });

    it('should show back button in error state', async () => {
      vi.mocked(videoProcessingService.loadVideo).mockRejectedValue(
        new Error('Load error')
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /Back/i });
      expect(backButton).toBeInTheDocument();
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator during video load', () => {
      vi.mocked(videoProcessingService.loadVideo).mockImplementation(
        () => new Promise(() => {})
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.getByText(/Loading video/i)).toBeInTheDocument();
    });

    it('should show detecting state with progress bar', async () => {
      vi.mocked(videoProcessingService.loadVideo).mockResolvedValue({
        video: mockVideoElement,
        mediaFile: {
          file: mockFile,
          type: 'video',
          url: 'blob:mock-url',
          width: 640,
          height: 480,
          duration: 10,
        },
      });

      vi.mocked(videoProcessingService.detectFacesInVideo).mockImplementation(
        (video, options, onProgress) => {
          if (onProgress) {
            onProgress(0.3);
          }
          return new Promise(() => {});
        }
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        const status = screen.getByRole('status', { name: /Face detection progress/i });
        expect(status).toBeInTheDocument();
        expect(status).toHaveTextContent(/30% complete/i);
      });
    });

    it('should show processing state with info alert', async () => {
      vi.mocked(videoProcessingService.loadVideo).mockResolvedValue({
        video: mockVideoElement,
        mediaFile: {
          file: mockFile,
          type: 'video',
          url: 'blob:mock-url',
          width: 640,
          height: 480,
          duration: 10,
        },
      });

      vi.mocked(videoProcessingService.detectFacesInVideo).mockResolvedValue(
        mockTracks
      );

      vi.mocked(videoProcessingService.processVideoWithBlur).mockImplementation(
        () => new Promise(() => {})
      );

      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getByText(/Process Video/i)).toBeInTheDocument();
      });

      const processButton = screen.getByRole('button', { name: /Process Video/i });
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(screen.getByText(/This process may take several minutes/i)).toBeInTheDocument();
      });
    });
  });

  describe('Back Button', () => {
    beforeEach(async () => {
      vi.mocked(videoProcessingService.loadVideo).mockResolvedValue({
        video: mockVideoElement,
        mediaFile: {
          file: mockFile,
          type: 'video',
          url: 'blob:mock-url',
          width: 640,
          height: 480,
          duration: 10,
        },
      });

      vi.mocked(videoProcessingService.detectFacesInVideo).mockResolvedValue(
        mockTracks
      );
    });

    it('should call onBack when back button is clicked', async () => {
      render(<VideoProcessor file={mockFile} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /detect.*faces/i })).toBeInTheDocument();
      });

      const detectButton = screen.getByRole('button', { name: /detect.*faces/i });
      fireEvent.click(detectButton);

      await waitFor(() => {
        expect(screen.getAllByRole('button', { name: /Back/i })).toHaveLength(1);
      });

      const backButton = screen.getByRole('button', { name: /Back/i });
      fireEvent.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });
});
