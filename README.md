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
```

### Usage

1. Open the application in your web browser
2. Upload an image or video file
3. Wait for face detection to complete
4. Review detected faces and select which ones to blur
5. Adjust blur intensity if needed
6. Apply blur effect
7. Download the processed file

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
│   └── blur.ts               # Blur algorithms
├── types/             # TypeScript type definitions
│   └── index.ts
├── App.tsx            # Main application component
└── main.tsx           # Application entry point
```

## Future Enhancements

- [ ] Multiple detection models (face, person, object, license plate)
- [ ] Additional blur effects (pixelate, solid color, emoji)
- [ ] Batch processing for multiple files
- [ ] GPU-accelerated video encoding
- [ ] Progressive Web App (PWA) support
- [ ] Advanced face tracking algorithms
- [ ] Custom detection regions
- [ ] Watermarking options

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
