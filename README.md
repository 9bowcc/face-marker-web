# Face Marker Web

A privacy-first web application for detecting and blurring faces in images and videos. All processing happens entirely in your browser - no server uploads, no data collection.

## Features

- **100% Client-Side Processing**: All face detection and blurring happens locally in your browser
- **Privacy Protected**: Your images and videos never leave your device
- **WebGPU Accelerated**: Uses WebGPU (when available) for faster processing
- **Image Support**: Process JPEG, PNG, and WebP images
- **Video Support**: Process MP4, WebM, and MOV videos
- **Face Tracking**: Automatically tracks faces across video frames
- **Selective Blurring**: Choose which faces to blur
- **Adjustable Intensity**: Control blur strength
- **Easy Export**: Download processed media to your device

## Technology Stack

- **React + TypeScript**: Modern UI framework with type safety
- **Material-UI (MUI)**: Beautiful, accessible UI components
- **TensorFlow.js**: Machine learning framework for JavaScript
- **MediaPipe Face Detection**: State-of-the-art face detection model
- **WebGPU/WebGL**: Hardware acceleration for better performance
- **Vite**: Fast build tool and dev server

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Modern web browser with WebGPU or WebGL support

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Usage

1. Open the application in your web browser
2. Upload an image or video file
3. Wait for face detection to complete
4. Review detected faces and select which ones to blur
5. Adjust blur intensity if needed
6. Apply blur effect
7. Download the processed file

## Testing

This project includes comprehensive testing at multiple levels to ensure quality and reliability.

### Unit Tests

Unit tests cover utility functions, services, and components using Vitest and React Testing Library.

## How It Works

### Face Detection

The application uses MediaPipe Face Detection model from TensorFlow.js to detect faces in images and videos. The model runs entirely in your browser using either:

- **WebGPU**: For modern browsers with GPU acceleration support
- **WebGL**: Fallback for broader browser compatibility

### Video Processing

For videos, the application:
1. Samples frames at regular intervals
2. Detects faces in each sampled frame
3. Groups faces across frames into "tracks"
4. Applies blur to selected face tracks
5. Re-encodes the video with blurred faces

### Privacy

- **No Server Communication**: After the ML models are downloaded (one-time), all processing is local
- **No Data Collection**: We don't collect, store, or transmit any of your media
- **Offline Capable**: Once models are cached, works without internet
- **Open Source**: All code is transparent and auditable

## Browser Compatibility

### Recommended Browsers

- Chrome/Edge 113+ (WebGPU support)
- Firefox 100+
- Safari 16+

### Minimum Requirements

- Modern browser with WebGL 2.0 support
- JavaScript enabled
- Sufficient RAM (4GB+ recommended for video processing)

## Performance Tips

1. **Use WebGPU-compatible browser** for best performance
2. **Close other tabs** when processing large videos
3. **Reduce video resolution** if processing is slow
4. **Process shorter clips** instead of full-length videos

## Architecture

```
src/
├── components/         # React UI components
│   ├── FileUploader.tsx       # File upload interface
│   ├── ImageProcessor.tsx     # Image processing UI
│   └── VideoProcessor.tsx     # Video processing UI
├── services/          # Core business logic
│   ├── faceDetection.ts       # Face detection service
│   ├── imageProcessing.ts     # Image processing
│   └── videoProcessing.ts     # Video processing with tracking
├── utils/             # Utility functions
│   ├── blur.ts               # Blur algorithms
│   ├── performance.ts        # Performance monitoring
│   └── errorHandler.ts       # Error handling
├── performance/       # Performance testing suite
│   ├── index.ts              # Main test runner
│   ├── utils.ts              # Benchmarking utilities
│   ├── faceDetectionBenchmark.ts  # Face detection tests
│   ├── blurBenchmark.ts      # Blur algorithm tests
│   ├── videoBenchmark.ts     # Video processing tests
│   └── backendComparison.ts  # WebGPU vs WebGL tests
├── types/             # TypeScript type definitions
│   └── index.ts
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## Testing

This project includes comprehensive testing at multiple levels to ensure quality and reliability.

### Unit Tests

Unit tests cover utility functions, services, and components using Vitest and React Testing Library.

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with interactive UI
npm run test:ui
```

### Performance Testing

Comprehensive performance benchmarking suite for all critical components:

```bash
# Run interactive performance tests
npm run perf

# Run quick tests (subset for CI/CD)
npm run perf:quick

# Generate performance report
npm run perf:report
```

**What's Benchmarked:**
- Face detection performance across image sizes (480p to 4K)
- Blur algorithm efficiency on different region sizes
- Video frame processing rates and throughput
- Memory usage and leak detection
- WebGPU vs WebGL backend comparison

**Key Metrics:**
- Mean/median processing time
- Operations per second
- Memory consumption and growth
- Frame processing rates
- Statistical confidence intervals

See [docs/PERFORMANCE.md](docs/PERFORMANCE.md) for detailed performance testing documentation.

### E2E Tests

End-to-end tests verify complete user workflows using Playwright. These tests cover:

- **Image Upload & Face Detection**: Testing image file upload and face detection workflow
- **Video Upload & Face Detection**: Testing video file upload and processing
- **Face Selection & Blur**: Testing face selection UI and blur application
- **Export Functionality**: Testing download and export features
- **Error Handling**: Testing error scenarios and edge cases

```bash
# Run E2E tests
npm run e2e

# Run E2E tests with UI mode (interactive)
npm run e2e:ui

# Run E2E tests in headed mode (see browser)
npm run e2e:headed

# Debug E2E tests
npm run e2e:debug

# View E2E test report
npm run e2e:report
```

### Visual Regression Tests

Visual regression tests detect unintended UI changes by comparing screenshots against baseline images. These tests cover:

- **Component Appearance**: FileUploader, ImageProcessor, VideoProcessor
- **UI States**: Loading, error, success, empty states
- **Face Selection**: Selected vs unselected face states
- **Responsive Design**: Mobile, tablet, desktop, and large desktop viewports
- **Browser Compatibility**: Chromium, Firefox, WebKit, mobile browsers

```bash
# Run visual regression tests
npm run visual

# Run with interactive UI
npm run visual:ui

# Update baselines after intentional UI changes
npm run visual:update

# View visual test report
npm run visual:report

# Test specific browser
npm run visual:chromium
npm run visual:firefox
npm run visual:webkit

# Test mobile viewports
npm run visual:mobile

# Debug visual tests
npm run visual:debug
```

**When to update baselines:**
- After intentional UI/styling changes
- When adding new UI components
- After layout modifications
- When updating colors, fonts, or spacing

See [VISUAL_TESTING.md](VISUAL_TESTING.md) for detailed documentation on visual regression testing workflow.

### Test Coverage

The project includes:
- **Unit tests** for utility functions (blur algorithms, error handling)
- **Service tests** for face detection and image/video processing
- **Component tests** for React components
- **E2E tests** for complete user workflows
- **Visual regression tests** for UI consistency

## CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- **Automated Testing**: All unit and E2E tests run on push and pull requests
- **Multi-version Testing**: Tests run on Node.js 18.x and 20.x
- **E2E Testing**: Playwright E2E tests verify complete user workflows
- **Visual Regression**: Automated visual testing across multiple browsers
- **Linting**: ESLint checks run automatically
- **Type Checking**: TypeScript compilation verification
- **Build Verification**: Production build tested on every commit
- **Bundle Analysis**: Automatic bundle size reporting

See [.github/workflows/ci.yml](.github/workflows/ci.yml) for CI configuration.

## Future Enhancements

- [ ] Multiple detection models (face, person, object, license plate)
- [ ] Additional blur effects (pixelate, solid color, emoji)
- [ ] Batch processing for multiple files
- [ ] GPU-accelerated video encoding
- [ ] Progressive Web App (PWA) support
- [ ] Advanced face tracking algorithms
- [ ] Custom detection regions
- [ ] Watermarking options
- [ ] Video preview with blur overlay
- [ ] Keyboard shortcuts for power users

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use this project for any purpose.

## Acknowledgments

- [TensorFlow.js](https://www.tensorflow.org/js) - Machine learning for JavaScript
- [MediaPipe](https://google.github.io/mediapipe/) - Face detection models
- [Material-UI](https://mui.com/) - React UI components
- [Vite](https://vitejs.dev/) - Build tool

## Disclaimer

This tool is provided as-is for legitimate privacy protection purposes. Users are responsible for complying with applicable laws and regulations regarding image and video processing.
