# Face Masker

Privacy-first face masking tool for images and videos - all processing happens in your browser.

🔒 **100% Privacy**: No data leaves your device
🚀 **Fast**: GPU-accelerated face detection
🎨 **Flexible**: Blur, mosaic, or emoji masking options
🎯 **Precise**: Adjustable detection sensitivity levels
📱 **Offline**: Works without internet after first load

## Features

- **Upload & Detect**: Automatically detect faces in images/videos with face thumbnails
- **Select Faces**: Click to choose which faces to mask from the list
- **Apply Masks**: Use blur, mosaic, or emoji effects
  - **Blur**: Smooth blur with subtle pixelation for privacy
  - **Mosaic**: Clear pixelated block effect
  - **Emoji**: Overlay with fun emoji characters
- **Sensitivity Control**: Adjust detection precision (Low/Medium/High)
- **WebGPU Support**: Automatic GPU acceleration detection and display
- **Download**: Export masked images in JPG/PNG format
- **Dual Detection**: MediaPipe (WebGPU) + face-api.js (CPU fallback) for best accuracy

## Quick Start

1. Open [Face Masker](https://9bowcc.github.io/face-marker-web/)
2. Upload an image or video
3. Check detected faces with thumbnails in the list
4. Select faces to mask
5. Choose mask type:
   - **Blur**: Smooth privacy protection
   - **Mosaic**: Pixelated effect
   - **Emoji**: Fun overlay
6. Adjust intensity (blur/mosaic) or detection sensitivity
7. Download the result

## Technology Stack

- **Frontend**: React 18 + Material-UI v7 + TypeScript
- **Detection**: MediaPipe (WebGPU-accelerated) + face-api.js (fallback)
- **Build**: Vite
- **Deployment**: GitHub Pages

## Privacy

All image and video processing happens entirely in your browser using WebGPU acceleration when available. No data is ever sent to external servers.

### Detection Sensitivity

- **Low (Strict)**: Only high-confidence faces (50%+) are detected
- **Medium (Default)**: Balanced detection (75%+) for most scenarios
- **High (Permissive)**: Maximum face detection (90%+) catches more faces

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## License

MIT License

---

Created with ❤️ for privacy-conscious users

