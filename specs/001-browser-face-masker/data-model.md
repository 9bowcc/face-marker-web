# Data Model: Browser Face Masker

**Feature Branch**: `001-browser-face-masker`  
**Date**: 2026-01-07  
**Spec Reference**: [spec.md](./spec.md)

---

## Core Entities

### 1. MediaFile

사용자가 업로드한 이미지 또는 영상 파일을 나타냅니다.

```typescript
interface MediaFile {
  /** 고유 식별자 (UUID) */
  id: string;
  
  /** 원본 파일명 */
  name: string;
  
  /** MIME 타입 (image/jpeg, image/png, image/webp, video/mp4, video/webm) */
  mimeType: string;
  
  /** 파일 크기 (bytes) */
  size: number;
  
  /** 이미지/영상 너비 (pixels) */
  width: number;
  
  /** 이미지/영상 높이 (pixels) */
  height: number;
  
  /** Blob URL (메모리 내 참조) */
  blobUrl: string;
  
  /** 업로드 시간 */
  uploadedAt: Date;
  
  /** 미디어 타입 */
  type: 'image' | 'video';
}
```

**Validation Rules**:
- `mimeType`: 지원 형식만 허용 (`image/jpeg`, `image/png`, `image/webp`, `video/mp4`, `video/webm`)
- `size`: 최대 50MB
- `width`, `height`: 최소 10px, 최대 10000px

---

### 2. DetectedFace

이미지에서 감지된 개별 얼굴 영역을 나타냅니다.

```typescript
interface DetectedFace {
  /** 고유 식별자 */
  id: string;
  
  /** 바운딩 박스 - 좌상단 X 좌표 (pixels) */
  x: number;
  
  /** 바운딩 박스 - 좌상단 Y 좌표 (pixels) */
  y: number;
  
  /** 바운딩 박스 너비 (pixels) */
  width: number;
  
  /** 바운딩 박스 높이 (pixels) */
  height: number;
  
  /** 감지 신뢰도 (0.0 - 1.0) */
  confidence: number;
  
  /** 마스킹 대상으로 선택되었는지 여부 */
  isSelected: boolean;
  
  /** 감지에 사용된 모델 */
  detectedBy: 'mediapipe' | 'faceapi';
}
```

**Validation Rules**:
- `x`, `y`: 0 이상, 이미지 크기 이내
- `width`, `height`: 1 이상
- `confidence`: 0.0 ~ 1.0 범위

---

### 3. MaskConfiguration

마스킹 설정을 나타냅니다.

```typescript
interface MaskConfiguration {
  /** 마스킹 방식 */
  type: 'blur' | 'emoji' | 'none';
  
  /** 블러 강도 (1-100), type이 'blur'일 때만 유효 */
  blurIntensity: number;
  
  /** 선택된 이모티콘, type이 'emoji'일 때만 유효 */
  emoji: string;
}
```

**Validation Rules**:
- `blurIntensity`: 1 ~ 100 범위
- `emoji`: 유효한 이모지 문자열 (예: "😀", "😎", "🙈")

**Default Values**:
- `type`: 'blur'
- `blurIntensity`: 50
- `emoji`: '😊'

---

### 4. EditorState

전체 에디터의 현재 상태를 나타냅니다.

```typescript
interface EditorState {
  /** 현재 로드된 미디어 파일 */
  mediaFile: MediaFile | null;
  
  /** 감지된 모든 얼굴 목록 */
  detectedFaces: DetectedFace[];
  
  /** 현재 마스킹 설정 */
  maskConfig: MaskConfiguration;
  
  /** 얼굴 감지 진행 상태 */
  detectionStatus: 'idle' | 'detecting' | 'complete' | 'error';
  
  /** 오류 메시지 (detectionStatus가 'error'일 때) */
  errorMessage: string | null;
  
  /** 현재 사용 중인 감지 모델 */
  activeDetector: 'mediapipe' | 'faceapi';
  
  /** 줌 레벨 (1.0 = 100%) */
  zoomLevel: number;
}
```

---

### 5. ExportOptions

내보내기 옵션을 나타냅니다.

```typescript
interface ExportOptions {
  /** 출력 파일 형식 */
  format: 'jpeg' | 'png';
  
  /** JPEG 품질 (1-100), format이 'jpeg'일 때만 유효 */
  quality: number;
  
  /** 출력 파일명 (확장자 제외) */
  filename: string;
}
```

**Validation Rules**:
- `quality`: 1 ~ 100 범위
- `filename`: 1 ~ 255자, 파일 시스템에서 허용되지 않는 문자 제외

**Default Values**:
- `format`: 'jpeg'
- `quality`: 90
- `filename`: 'masked_image'

---

## Entity Relationships

```
┌─────────────────┐
│   MediaFile     │
│                 │
│  - id           │
│  - name         │
│  - mimeType     │
│  - dimensions   │
└────────┬────────┘
         │
         │ 1:N (has many)
         ▼
┌─────────────────┐      ┌─────────────────┐
│  DetectedFace   │      │MaskConfiguration│
│                 │      │                 │
│  - id           │      │  - type         │
│  - boundingBox  │◄─────│  - blurIntensity│
│  - isSelected   │apply │  - emoji        │
│  - confidence   │      │                 │
└─────────────────┘      └─────────────────┘
         │
         │ N:1 (belongs to)
         ▼
┌─────────────────┐
│   EditorState   │
│                 │
│  - mediaFile    │
│  - faces[]      │
│  - maskConfig   │
│  - status       │
└─────────────────┘
         │
         │ exports to
         ▼
┌─────────────────┐
│  ExportOptions  │
│                 │
│  - format       │
│  - quality      │
│  - filename     │
└─────────────────┘
```

---

## State Transitions

### EditorState.detectionStatus

```
     ┌─────────────────────────────────────────┐
     │                                         │
     ▼                                         │
  ┌──────┐   upload    ┌───────────┐  success  ┌──────────┐
  │ idle │────────────►│ detecting │──────────►│ complete │
  └──────┘             └───────────┘           └──────────┘
     ▲                      │                       │
     │                      │ error                 │
     │                      ▼                       │
     │                 ┌─────────┐                  │
     └─────────────────│  error  │◄─────────────────┘
        reset/retry    └─────────┘      new upload
```

### DetectedFace.isSelected

```
  ┌────────────┐   click/toggle   ┌──────────────┐
  │ isSelected │◄────────────────►│ !isSelected  │
  │   false    │                  │    true      │
  └────────────┘                  └──────────────┘
        │                               │
        │         selectAll             │
        └───────────────────────────────┘
                      │
                      ▼
                  all true
        
        ┌───────────────────────────────┐
        │         deselectAll           │
        └───────────────────────────────┘
                      │
                      ▼
                  all false
```

---

## Emoji Presets

사용 가능한 이모티콘 프리셋:

```typescript
const EMOJI_PRESETS: readonly string[] = [
  '😊', '😀', '😎', '🙈', '🙂', '😺',
  '🌟', '⭐', '❤️', '💙', '🔵', '🟢',
  '🎭', '🤖', '👻', '💀', '🎃', '👽'
] as const;
```

---

## Supported File Types

### Images (P1)
| Extension | MIME Type | Notes |
|-----------|-----------|-------|
| .jpg, .jpeg | image/jpeg | 가장 일반적 |
| .png | image/png | 투명도 지원 |
| .webp | image/webp | 최신 포맷 |

### Videos (P2)
| Extension | MIME Type | Notes |
|-----------|-----------|-------|
| .mp4 | video/mp4 | H.264 코덱 권장 |
| .webm | video/webm | VP8/VP9 코덱 |
