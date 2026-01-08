# Implementation Plan: Browser Face Masker

**Branch**: `001-browser-face-masker` | **Date**: 2026-01-07 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-browser-face-masker/spec.md`

---

## Summary

웹 브라우저에서 완전히 동작하는 얼굴 마스킹 앱을 개발합니다. 사용자가 업로드한 이미지/영상에서 얼굴을 감지하고, 선택한 얼굴에 블러 또는 이모티콘 마스킹을 적용합니다. **모든 처리는 클라이언트 사이드에서 수행되며, 어떠한 데이터도 외부로 전송되지 않습니다.**

**기술 접근법**:
- React 18 + MUI v7 + Vite (사용자 요청)
- MediaPipe + face-api.js 멀티 모델 (2개 이상 요청)
- Canvas API + Web Worker (이미지 처리)
- GitHub Pages 배포 (사용자 요청)

---

## Technical Context

**Language/Version**: TypeScript 5.7+ / React 18.3  
**Primary Dependencies**: 
- UI: @mui/material ^7.2.0, @emotion/react ^11.13
- Detection: @mediapipe/tasks-vision ^0.10, face-api.js ^0.22
- Build: Vite ^7.0

**Storage**: N/A (모든 데이터는 브라우저 메모리/Blob URL)  
**Testing**: Vitest + React Testing Library  
**Target Platform**: 현대 웹 브라우저 (Chrome 90+, Firefox 90+, Safari 15+, Edge 90+)  
**Project Type**: Single SPA (Frontend only - no backend)  
**Performance Goals**: 
- 얼굴 감지: 10초 이내 (5-10명)
- 마스킹 미리보기: 1초 이내
- 이미지 처리: 30 FPS (실시간)

**Constraints**: 
- 완전 오프라인 동작 (앱 로드 후)
- 데이터 외부 전송 금지
- 50MB 이하 이미지 지원

**Scale/Scope**: 단일 페이지 앱, 6개 주요 컴포넌트

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

프로젝트에 정의된 constitution이 기본 템플릿 상태이므로, 일반적인 웹 앱 베스트 프랙티스를 따릅니다:

| Gate | Status | Notes |
|------|--------|-------|
| 단일 책임 원칙 | ✅ PASS | 서비스별 분리 (detection, processing, UI) |
| 타입 안전성 | ✅ PASS | TypeScript strict mode |
| 테스트 가능성 | ✅ PASS | 서비스 인터페이스 정의로 목킹 가능 |
| 개인정보 보호 | ✅ PASS | 모든 처리 클라이언트 사이드 |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-browser-face-masker/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Technical research
├── data-model.md        # Phase 1: Data entities
├── quickstart.md        # Phase 1: Dev setup guide
├── contracts/           # Phase 1: Service interfaces
│   └── services.md
├── checklists/          # Quality validation
│   └── requirements.md
└── tasks.md             # Phase 2 output (by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ImageUpload.tsx      # 파일 업로드 UI
│   ├── FaceCanvas.tsx       # 캔버스 + 얼굴 바운딩 박스
│   ├── MaskControls.tsx     # 마스킹 옵션 패널
│   ├── FaceList.tsx         # 감지된 얼굴 목록/선택
│   ├── DownloadButton.tsx   # 결과물 다운로드
│   └── ModelSelector.tsx    # 감지 모델 선택
├── hooks/
│   ├── useFaceDetection.ts  # 얼굴 감지 로직
│   ├── useImageProcessor.ts # 이미지 처리 로직
│   └── useMaskConfiguration.ts
├── services/
│   ├── mediaPipeService.ts  # MediaPipe 래퍼
│   ├── faceApiService.ts    # face-api.js 래퍼
│   └── detectorFactory.ts   # 감지기 팩토리
├── utils/
│   ├── imageUtils.ts        # 이미지 유틸리티
│   └── canvasUtils.ts       # 캔버스 조작
├── workers/
│   └── blurWorker.ts        # 블러 처리 워커
├── types/
│   └── index.ts             # 타입 정의
├── theme.ts                 # MUI 테마
├── App.tsx                  # 메인 앱
└── main.tsx                 # 진입점

public/
├── models/                  # face-api.js 모델 파일
│   └── tiny_face_detector/
└── favicon.ico

.github/
└── workflows/
    └── deploy.yml           # GitHub Pages 배포
```

**Structure Decision**: 단일 프론트엔드 프로젝트 (백엔드 없음). 모든 처리가 클라이언트에서 이루어지므로 서버 구조 불필요.

---

## Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| UI Framework | React + MUI | 사용자 요청 |
| Build Tool | Vite | 빠른 빌드, GitHub Pages 최적화 |
| Face Detection Primary | MediaPipe | 높은 정확도, WASM 지원, 활발한 유지보수 |
| Face Detection Fallback | face-api.js | 경량, 저사양 대응, 추가 기능 |
| Image Processing | Canvas API | 충분한 성능, 간단한 구현 |
| Deployment | GitHub Pages | 사용자 요청, 무료 |

---

## Complexity Tracking

> 특별한 복잡도 위반 없음

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| N/A | - | - |

---

## Related Artifacts

- [research.md](./research.md) - 기술 리서치 결과
- [data-model.md](./data-model.md) - 데이터 모델 정의
- [contracts/services.md](./contracts/services.md) - 서비스 인터페이스
- [quickstart.md](./quickstart.md) - 개발 환경 설정

---

## Next Steps

1. `/speckit.tasks` - 구현 작업 목록 생성
2. P1 User Stories 순차 구현
3. GitHub Pages 배포 설정
