# Quickstart: Browser Face Masker

**Branch**: `001-browser-face-masker`  
**Date**: 2026-01-07

이 문서는 개발 환경 설정부터 첫 번째 기능 구현까지의 빠른 시작 가이드입니다.

---

## Prerequisites

- Node.js 20.x 이상
- npm 또는 pnpm
- 현대적인 웹 브라우저 (Chrome 권장)

---

## 1. 프로젝트 초기화

```bash
# Vite + React + TypeScript 프로젝트 생성
npm create vite@latest . -- --template react-ts

# 또는 이미 프로젝트가 있다면 의존성 설치
npm install
```

---

## 2. 핵심 의존성 설치

```bash
# MUI (Material UI)
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled

# Face Detection
npm install @mediapipe/tasks-vision face-api.js

# Types
npm install -D @types/node
```

---

## 3. Vite 설정 (GitHub Pages)

`vite.config.ts` 수정:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/face-marker-web/', // GitHub 저장소 이름
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          detection: ['@mediapipe/tasks-vision', 'face-api.js']
        }
      }
    }
  }
})
```

---

## 4. 프로젝트 구조 생성

```bash
mkdir -p src/{components,hooks,services,utils,types,workers}
mkdir -p public/models
```

예상 구조:
```
src/
├── components/
│   ├── ImageUpload.tsx
│   ├── FaceCanvas.tsx
│   ├── MaskControls.tsx
│   └── DownloadButton.tsx
├── hooks/
│   ├── useFaceDetection.ts
│   ├── useImageProcessor.ts
│   └── useMaskConfiguration.ts
├── services/
│   ├── mediaPipeService.ts
│   └── faceApiService.ts
├── utils/
│   └── imageUtils.ts
├── types/
│   └── index.ts
├── theme.ts
├── App.tsx
└── main.tsx
```

---

## 5. 기본 타입 정의

`src/types/index.ts`:

```typescript
export interface MediaFile {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  blobUrl: string;
  uploadedAt: Date;
  type: 'image' | 'video';
}

export interface DetectedFace {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  isSelected: boolean;
  detectedBy: 'mediapipe' | 'faceapi';
}

export interface MaskConfiguration {
  type: 'blur' | 'emoji' | 'none';
  blurIntensity: number;
  emoji: string;
}

export interface ExportOptions {
  format: 'jpeg' | 'png';
  quality: number;
  filename: string;
}
```

---

## 6. MUI 테마 설정

`src/theme.ts`:

```typescript
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});
```

---

## 7. 앱 진입점

`src/App.tsx`:

```typescript
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography, Box } from '@mui/material';
import { theme } from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Face Masker
          </Typography>
          {/* 컴포넌트들이 여기에 추가됩니다 */}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
```

---

## 8. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

---

## 9. GitHub Pages 배포

### GitHub Actions 설정

`.github/workflows/deploy.yml`:

```yaml
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

### GitHub Pages 활성화

1. GitHub 저장소 → Settings → Pages
2. Source: GitHub Actions 선택
3. main 브랜치에 push하면 자동 배포

---

## 10. face-api.js 모델 파일 준비

face-api.js 사용 시 모델 파일이 필요합니다:

```bash
# 모델 파일 다운로드 (public/models 폴더에)
# https://github.com/justadudewhohacks/face-api.js/tree/master/weights

# 필요한 모델:
# - tiny_face_detector_model-weights_manifest.json
# - tiny_face_detector_model-shard1
```

---

## 다음 단계

1. `/speckit.tasks` - 작업 목록 생성
2. 각 User Story별 구현 시작 (P1부터)

---

## 유용한 명령어

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린트
npm run lint
```
