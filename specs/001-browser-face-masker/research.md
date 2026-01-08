# Research: Browser Face Masker

**Feature Branch**: `001-browser-face-masker`  
**Date**: 2026-01-07  
**Status**: Complete

## Executive Summary

브라우저 기반 얼굴 마스킹 앱을 위한 기술 스택 조사 결과:
- **UI Framework**: React 18 + MUI v7 + Vite
- **Face Detection**: MediaPipe + face-api.js (멀티 모델)
- **Image Processing**: Canvas API + WASM (성능 최적화)
- **Deployment**: GitHub Pages + GitHub Actions

---

## 1. Face Detection Libraries

### 비교 분석표

| 특성 | MediaPipe | face-api.js | OpenCV.js | BlazeFace |
|------|-----------|-------------|-----------|-----------|
| **WASM 지원** | ✅ 완전 지원 | ⚠️ TF.js WASM | ✅ 완전 지원 | ⚠️ TF.js WASM |
| **WebGL 지원** | ✅ | ✅ | ✅ | ✅ |
| **번들 크기** | ~1-2 MB | ~190 KB (Tiny) | ~6-8 MB | ~100-200 KB |
| **정확도** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **속도 (FPS)** | 30-60 | 15-60 | 10-25 | 60+ |
| **NPM 패키지** | `@mediapipe/tasks-vision` | `face-api.js` | CDN | `@tensorflow-models/blazeface` |
| **라이선스** | Apache 2.0 | MIT | Apache 2.0 | Apache 2.0 |
| **유지보수** | ✅ 활발 | ⚠️ 제한적 | ✅ 활발 | ⚠️ Deprecated |

### Decision: MediaPipe + face-api.js (Tiny)

**Rationale**:
1. **MediaPipe** (주력 모델)
   - Google 공식 지원으로 안정성 높음
   - WASM 기반 빠른 실행 속도 (30-60 FPS)
   - 작은 번들 크기 (~1-2 MB)
   - 저품질 이미지에서도 강건한 성능

2. **face-api.js Tiny** (보조 모델)
   - 초경량 (190 KB)
   - 저사양 기기 fallback
   - 표정 인식 등 추가 기능 가능
   - MIT 라이선스 (가장 관대함)

**Alternatives Rejected**:
- **OpenCV.js**: 번들 크기 과대 (6-8 MB), 설정 복잡
- **BlazeFace 단독**: Deprecated, 작은 얼굴 감지 성능 낮음

### 사용 예시: MediaPipe

```typescript
import { FilesetResolver, FaceDetector } from '@mediapipe/tasks-vision';

async function initMediaPipe() {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
  );
  
  return await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "blaze_face_short_range.tflite"
    },
    runningMode: "IMAGE",
    minDetectionConfidence: 0.5
  });
}
```

### 사용 예시: face-api.js

```typescript
import * as faceapi from 'face-api.js';

async function initFaceApi() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  
  return (image: HTMLImageElement) => 
    faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.5
    }));
}
```

---

## 2. React + MUI + GitHub Pages

### Decision: Vite + React 18 + MUI v7

**Rationale**:
- Vite: 빠른 빌드, GitHub Pages 배포 용이
- MUI v7: 최신 컴포넌트, 강력한 테마 시스템
- TypeScript: 타입 안전성

### Vite 설정 (GitHub Pages)

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/face-marker-web/', // GitHub Pages 경로
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material']
        }
      }
    }
  }
})
```

### GitHub Actions 배포

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### 권장 Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@mui/material": "^7.2.0",
    "@mui/icons-material": "^7.2.0",
    "@emotion/react": "^11.13.3",
    "@emotion/styled": "^11.13.0",
    "@mediapipe/tasks-vision": "^0.10.0",
    "face-api.js": "^0.22.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^7.0.0",
    "typescript": "^5.7.2"
  }
}
```

---

## 3. Image Processing & WASM

### Canvas API Blur (기본 방식)

Canvas 2D `filter` 속성으로 간단한 블러 적용:

```typescript
function applyBlur(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, 
  width: number, height: number,
  blurAmount: number
) {
  // 영역 저장
  const imageData = ctx.getImageData(x, y, width, height);
  
  // 블러 필터 적용
  ctx.filter = `blur(${blurAmount}px)`;
  ctx.putImageData(imageData, x, y);
  ctx.drawImage(ctx.canvas, x, y, width, height, x, y, width, height);
  
  // 필터 리셋
  ctx.filter = 'none';
}
```

### WASM 고려사항

**장점**:
- Canvas API 대비 2-10배 빠른 처리
- CPU 집약적 작업에 유리

**단점**:
- 초기 로딩 시간 증가
- 번들 크기 증가
- 복잡한 메모리 관리

**Decision**: Canvas API 우선, 필요시 WASM 최적화

**Rationale**:
- MVP에서는 Canvas API `filter`로 충분
- 대용량 이미지 처리 시 OffscreenCanvas + Web Worker 활용
- 성능 병목 발생 시 WASM 도입 검토

### OffscreenCanvas + Web Worker

```typescript
// src/workers/blurWorker.ts
self.onmessage = async (e: MessageEvent) => {
  const { imageData, blurRadius } = e.data;
  
  const offscreen = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = offscreen.getContext('2d')!;
  
  ctx.putImageData(imageData, 0, 0);
  ctx.filter = `blur(${blurRadius}px)`;
  ctx.drawImage(offscreen, 0, 0);
  
  const result = ctx.getImageData(0, 0, imageData.width, imageData.height);
  self.postMessage({ imageData: result }, [result.data.buffer]);
};
```

---

## 4. Project Structure

```
face-marker-web/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── public/
│   ├── models/                # face-api.js 모델 파일
│   │   └── tiny_face_detector/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ImageUpload.tsx
│   │   ├── FaceCanvas.tsx
│   │   ├── MaskControls.tsx
│   │   └── DownloadButton.tsx
│   ├── hooks/
│   │   ├── useFaceDetection.ts
│   │   └── useImageProcessor.ts
│   ├── services/
│   │   ├── mediaPipeService.ts
│   │   └── faceApiService.ts
│   ├── workers/
│   │   └── blurWorker.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── imageUtils.ts
│   ├── theme.ts
│   ├── App.tsx
│   └── main.tsx
├── specs/                     # Feature specifications
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 5. Technical Decisions Summary

| Area | Decision | Rationale |
|------|----------|-----------|
| **UI Framework** | React 18 + MUI v7 | 사용자 요청, 강력한 컴포넌트 라이브러리 |
| **Build Tool** | Vite | 빠른 빌드, GitHub Pages 최적화 |
| **Face Detection (Primary)** | MediaPipe | 높은 정확도, WASM 지원, 활발한 유지보수 |
| **Face Detection (Fallback)** | face-api.js Tiny | 경량, 저사양 기기 대응 |
| **Image Blur** | Canvas API filter | 간단한 구현, 충분한 성능 |
| **Deployment** | GitHub Pages | 사용자 요청, 무료 호스팅 |
| **Language** | TypeScript | 타입 안전성, 더 나은 DX |

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| MediaPipe WASM 로딩 느림 | 사용자 경험 저하 | Lazy loading, 로딩 인디케이터 |
| WebGPU 미지원 브라우저 | 기능 제한 | WebGL fallback 자동 전환 |
| 대용량 이미지 처리 | 브라우저 멈춤 | Web Worker + OffscreenCanvas |
| 모바일 성능 이슈 | 느린 처리 | face-api.js Tiny로 전환 옵션 |

---

## References

- [MediaPipe Face Detection](https://developers.google.com/mediapipe/solutions/vision/face_detector)
- [face-api.js](https://github.com/justadudewhohacks/face-api.js)
- [MUI Documentation](https://mui.com/)
- [Vite Guide](https://vitejs.dev/guide/)
- [GitHub Pages Deployment](https://vitejs.dev/guide/static-deploy.html#github-pages)
