# Face Masker

Privacy-first face masking tool for images and videos - all processing happens in your browser.

🔒 **100% Privacy**: No data leaves your device  
🚀 **Fast**: GPU-accelerated face detection  
🎨 **Flexible**: Blur or emoji masking options  
📱 **Offline**: Works without internet after first load

## Features

- **Upload & Detect**: Automatically detect faces in images/videos
- **Select Faces**: Click to choose which faces to mask
- **Apply Masks**: Use blur or emoji effects
- **Download**: Export masked images in JPG/PNG format
- **Dual Detection**: MediaPipe + face-api.js for best accuracy

## Quick Start

1. Open [Face Masker](https://your-username.github.io/face-marker-web/)
2. Upload an image or video
3. Select faces to mask
4. Choose blur intensity or emoji
5. Download the result

## Technology Stack

- **Frontend**: React 18 + Material-UI v7 + TypeScript
- **Detection**: MediaPipe (primary) + face-api.js (fallback)
- **Build**: Vite
- **Deployment**: GitHub Pages

## Privacy

All image and video processing happens entirely in your browser. No data is ever sent to external servers.

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
