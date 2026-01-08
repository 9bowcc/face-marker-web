# Tasks: Browser Face Masker

**Input**: Design documents from `/specs/001-browser-face-masker/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/services.md, quickstart.md

**Tests**: Not explicitly requested - tests are OPTIONAL in this implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, etc.)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Vite + React + TypeScript project with all dependencies

- [X] T001 Initialize Vite React-TS project with `npm create vite@latest . -- --template react-ts`
- [X] T002 Install MUI dependencies: `@mui/material @mui/icons-material @emotion/react @emotion/styled`
- [X] T003 Install face detection: `@mediapipe/tasks-vision face-api.js`
- [X] T004 [P] Create project folder structure: `src/{components,hooks,services,utils,types,workers}` and `public/models`
- [X] T005 [P] Configure vite.config.ts with GitHub Pages base path `/face-marker-web/`
- [X] T006 [P] Configure tsconfig.json with strict mode and path aliases
- [X] T007 [P] Create .github/workflows/deploy.yml for GitHub Pages deployment

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, theme, and base services that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 Define all TypeScript types in src/types/index.ts (MediaFile, DetectedFace, MaskConfiguration, EditorState, ExportOptions)
- [X] T009 [P] Create MUI theme configuration in src/theme.ts
- [X] T010 [P] Create image utility functions in src/utils/imageUtils.ts (createBlobURL, revokeBlobURL, loadImageToCanvas)
- [X] T011 [P] Create canvas utility functions in src/utils/canvasUtils.ts (applyBlur, applyEmoji, getImageData)
- [X] T012 Implement MediaPipe face detection service in src/services/mediaPipeService.ts
- [X] T013 Implement face-api.js detection service in src/services/faceApiService.ts
- [X] T014 Create detector factory in src/services/detectorFactory.ts (model switching logic)
- [X] T015 Setup main.tsx entry point with ThemeProvider in src/main.tsx
- [X] T016 Create base App.tsx shell with MUI Container in src/App.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Upload and Detect Faces (Priority: P1) 🎯 MVP

**Goal**: User uploads an image, system detects all faces and displays bounding boxes

**Independent Test**: Upload a photo with faces → see bounding boxes appear around each detected face with count displayed

### Implementation for User Story 1

- [X] T017 [P] [US1] Create useFaceDetection hook in src/hooks/useFaceDetection.ts
- [X] T018 [P] [US1] Create useImageProcessor hook in src/hooks/useImageProcessor.ts
- [X] T019 [US1] Create ImageUpload component with drag-drop in src/components/ImageUpload.tsx
- [X] T020 [US1] Create FaceCanvas component with bounding box overlay in src/components/FaceCanvas.tsx
- [X] T021 [US1] Create ModelSelector component for detector switching in src/components/ModelSelector.tsx
- [X] T022 [US1] Integrate ImageUpload + FaceCanvas + ModelSelector into App.tsx
- [X] T023 [US1] Add loading indicator during face detection in App.tsx
- [X] T024 [US1] Add "No faces detected" message handling in App.tsx
- [X] T025 [US1] Display detected face count in UI

**Checkpoint**: User Story 1 complete - can upload image and see detected faces with bounding boxes

---

## Phase 4: User Story 2 - Select Faces for Masking (Priority: P1)

**Goal**: User can click to select/deselect individual faces, with visual feedback

**Independent Test**: Click on detected face → see selection toggle with color change; use Select All/Deselect All buttons

### Implementation for User Story 2

- [X] T026 [US2] Add face click handler to FaceCanvas in src/components/FaceCanvas.tsx
- [X] T027 [US2] Implement selection state management (toggle, selectAll, deselectAll) in App.tsx
- [X] T028 [US2] Add visual distinction for selected faces (different border color) in src/components/FaceCanvas.tsx
- [X] T029 [US2] Create FaceList component showing thumbnails with selection in src/components/FaceList.tsx
- [X] T030 [US2] Add "Select All" and "Deselect All" buttons in App.tsx
- [X] T031 [US2] Display selected face count in UI

**Checkpoint**: User Story 2 complete - can select/deselect faces with visual feedback

---

## Phase 5: User Story 3 - Apply Masking (Priority: P1)

**Goal**: Apply blur or emoji mask to selected faces with real-time preview

**Independent Test**: Select faces → choose blur/emoji → see mask applied in preview instantly

### Implementation for User Story 3

- [X] T032 [P] [US3] Create useMaskConfiguration hook in src/hooks/useMaskConfiguration.ts
- [X] T033 [P] [US3] Create blur worker for performance in src/workers/blurWorker.ts
- [X] T034 [US3] Create MaskControls component with blur/emoji toggle in src/components/MaskControls.tsx
- [X] T035 [US3] Add blur intensity slider to MaskControls in src/components/MaskControls.tsx
- [X] T036 [US3] Implement blur mask rendering in FaceCanvas in src/components/FaceCanvas.tsx
- [X] T037 [US3] Implement emoji mask rendering in FaceCanvas in src/components/FaceCanvas.tsx
- [X] T038 [US3] Add real-time preview update on mask config change in src/components/FaceCanvas.tsx
- [X] T039 [US3] Integrate MaskControls into App.tsx with state binding

**Checkpoint**: User Story 3 complete - can apply blur or emoji masks to selected faces

---

## Phase 6: User Story 4 - Download Masked Image (Priority: P1)

**Goal**: Export masked image as JPG/PNG file to local device

**Independent Test**: Apply mask → click Download → file downloads with mask permanently applied

### Implementation for User Story 4

- [X] T040 [US4] Add exportImage function to useImageProcessor hook in src/hooks/useImageProcessor.ts
- [X] T041 [US4] Create DownloadButton component with format selection in src/components/DownloadButton.tsx
- [X] T042 [US4] Implement canvas-to-blob export with quality settings in src/utils/canvasUtils.ts
- [X] T043 [US4] Add filename input option to DownloadButton in src/components/DownloadButton.tsx
- [X] T044 [US4] Integrate DownloadButton into App.tsx
- [X] T045 [US4] Ensure downloaded image preserves original resolution

**Checkpoint**: User Story 4 complete - full MVP: upload → detect → select → mask → download

---

## Phase 7: User Story 5 - Video Processing (Priority: P2)

**Goal**: Process video files with frame-by-frame face detection and masking

**Independent Test**: Upload short video → see faces tracked and masked across frames → export masked video

### Implementation for User Story 5

- [X] T046 [P] [US5] Extend types for video support in src/types/index.ts
- [X] T047 [P] [US5] Add video file validation to imageUtils in src/utils/imageUtils.ts
- [X] T048 [US5] Update ImageUpload to accept video files in src/components/ImageUpload.tsx
- [X] T049 [US5] Create VideoCanvas component for video playback in src/components/VideoCanvas.tsx
- [X] T050 [US5] Implement frame-by-frame detection in useFaceDetection hook
- [X] T051 [US5] Add video playback controls (play/pause) in src/components/VideoCanvas.tsx
- [X] T052 [US5] Implement MediaRecorder for video export in src/utils/videoUtils.ts
- [X] T053 [US5] Add video download functionality to DownloadButton
- [X] T054 [US5] Integrate VideoCanvas into App.tsx with media type switching

**Checkpoint**: User Story 5 complete - video upload, real-time masking, and export working

---

## Phase 8: User Story 6 - Emoji Style Selection (Priority: P3)

**Goal**: Allow users to choose from multiple emoji options for masking

**Independent Test**: Select emoji mask → open picker → choose different emoji → see it applied

### Implementation for User Story 6

- [X] T055 [P] [US6] Define EMOJI_PRESETS constant in src/types/index.ts
- [X] T056 [US6] Create EmojiPicker component in src/components/EmojiPicker.tsx
- [X] T057 [US6] Integrate EmojiPicker into MaskControls in src/components/MaskControls.tsx
- [X] T058 [US6] Update emoji rendering to use selected emoji in FaceCanvas
- [X] T059 [US6] Add emoji size scaling based on face bounding box

**Checkpoint**: User Story 6 complete - full emoji customization available

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements across all user stories

- [X] T060 [P] Add responsive design for mobile devices in App.tsx and components
- [X] T061 [P] Add error boundary and global error handling in src/components/ErrorBoundary.tsx
- [X] T062 [P] Add loading states and skeleton UI for all async operations
- [X] T063 Implement WebGPU/WebGL fallback detection with user notification
- [X] T064 Add keyboard accessibility (tab navigation, keyboard shortcuts)
- [X] T065 Performance optimization: lazy load detection models
- [X] T066 Add PWA manifest for offline capability in public/manifest.json
- [X] T067 Final UI polish: consistent spacing, colors, typography
- [X] T068 Test GitHub Pages deployment end-to-end
- [X] T069 Verify no data leaves browser (privacy compliance check)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (BLOCKS ALL USER STORIES)
    ↓
┌───────────────────────────────────────────────────────────┐
│  User Stories can proceed in priority order or parallel   │
├───────────────────────────────────────────────────────────┤
│  Phase 3: US1 (P1) ─────────────┐                        │
│  Phase 4: US2 (P1) ─ depends on US1                      │
│  Phase 5: US3 (P1) ─ depends on US2                      │
│  Phase 6: US4 (P1) ─ depends on US3                      │
│  Phase 7: US5 (P2) ─ after P1 complete                   │
│  Phase 8: US6 (P3) ─ after US3 complete                  │
└───────────────────────────────────────────────────────────┘
    ↓
Phase 9: Polish (after desired stories complete)
```

### P1 User Story Chain (MVP)

```
US1 (Upload/Detect) → US2 (Select) → US3 (Mask) → US4 (Download)
```

All P1 stories form the complete MVP flow. Each builds on the previous.

### Parallel Opportunities

**Within Phase 1 (Setup)**:
- T004, T005, T006, T007 can run in parallel after T001-T003

**Within Phase 2 (Foundational)**:
- T009, T010, T011 can run in parallel (different files)
- T012, T013 can run in parallel (different detection services)

**Within Each User Story**:
- Tasks marked [P] can run in parallel within that story

**Across Stories** (with sufficient team):
- US5 (Video) can start after MVP is stable
- US6 (Emoji) can start after US3 is complete

---

## Parallel Example: Phase 2 Foundational

```bash
# Launch in parallel after T008 (types):
Task: T009 "Create MUI theme in src/theme.ts"
Task: T010 "Create imageUtils in src/utils/imageUtils.ts"
Task: T011 "Create canvasUtils in src/utils/canvasUtils.ts"

# Then in parallel:
Task: T012 "Implement MediaPipe service"
Task: T013 "Implement face-api.js service"
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. **Phase 1**: Setup project structure
2. **Phase 2**: Complete all foundational tasks
3. **Phase 3**: US1 - Image Upload + Detection
4. **Phase 4**: US2 - Face Selection
5. **Phase 5**: US3 - Masking Application
6. **Phase 6**: US4 - Download
7. **STOP & VALIDATE**: Test complete flow end-to-end
8. **Deploy**: Push to GitHub Pages

**MVP delivers**: Upload → Detect → Select → Mask → Download

### Post-MVP Enhancements

1. **Phase 7**: US5 - Video processing (P2)
2. **Phase 8**: US6 - Emoji selection (P3)
3. **Phase 9**: Polish and optimization

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| Phase 1 | T001-T007 | Setup |
| Phase 2 | T008-T016 | Foundational |
| Phase 3 (US1) | T017-T025 | Upload & Detect |
| Phase 4 (US2) | T026-T031 | Face Selection |
| Phase 5 (US3) | T032-T039 | Masking |
| Phase 6 (US4) | T040-T045 | Download |
| Phase 7 (US5) | T046-T054 | Video (P2) |
| Phase 8 (US6) | T055-T059 | Emoji (P3) |
| Phase 9 | T060-T069 | Polish |

**Total Tasks**: 69

| Priority | User Stories | Tasks |
|----------|--------------|-------|
| P1 (MVP) | US1, US2, US3, US4 | 29 tasks |
| P2 | US5 | 9 tasks |
| P3 | US6 | 5 tasks |
| Setup/Polish | - | 26 tasks |

---

## Notes

- All tasks include specific file paths
- [P] marks parallelizable tasks
- [Story] labels map to spec.md user stories
- Stop at any checkpoint to validate independently
- MVP is complete after Phase 6 (US4)
- Commit after each task or logical group
