# Service Contracts: Browser Face Masker

이 앱은 완전히 클라이언트 사이드에서 동작하므로 REST API는 없습니다.
대신 내부 서비스 인터페이스(contracts)를 정의합니다.

---

## 1. FaceDetectionService

얼굴 감지 서비스 인터페이스.

```typescript
/**
 * 얼굴 감지 서비스 인터페이스
 */
interface FaceDetectionService {
  /**
   * 서비스 초기화 (모델 로딩)
   * @returns 초기화 성공 여부
   */
  initialize(): Promise<void>;

  /**
   * 초기화 완료 여부
   */
  isReady(): boolean;

  /**
   * 이미지에서 얼굴 감지
   * @param image - 분석할 이미지 요소
   * @returns 감지된 얼굴 목록
   */
  detectFaces(image: HTMLImageElement | HTMLCanvasElement): Promise<DetectedFace[]>;

  /**
   * 리소스 정리
   */
  dispose(): void;
}

/**
 * 감지 옵션
 */
interface DetectionOptions {
  /** 최소 신뢰도 임계값 (0.0 - 1.0) */
  minConfidence: number;
  
  /** 최대 감지 얼굴 수 */
  maxFaces: number;
}
```

### 구현체

```typescript
// MediaPipe 구현체
class MediaPipeFaceDetector implements FaceDetectionService { ... }

// face-api.js 구현체
class FaceApiDetector implements FaceDetectionService { ... }
```

---

## 2. ImageProcessorService

이미지 처리 서비스 인터페이스.

```typescript
/**
 * 이미지 처리 서비스 인터페이스
 */
interface ImageProcessorService {
  /**
   * 이미지 로드
   * @param file - 이미지 파일
   * @returns 로드된 이미지 정보
   */
  loadImage(file: File): Promise<MediaFile>;

  /**
   * 선택된 얼굴에 마스킹 적용
   * @param canvas - 대상 캔버스
   * @param faces - 마스킹할 얼굴 목록
   * @param config - 마스킹 설정
   */
  applyMask(
    canvas: HTMLCanvasElement,
    faces: DetectedFace[],
    config: MaskConfiguration
  ): void;

  /**
   * 블러 효과 적용
   * @param canvas - 대상 캔버스
   * @param region - 블러 영역
   * @param intensity - 블러 강도 (1-100)
   */
  applyBlur(
    canvas: HTMLCanvasElement,
    region: BoundingBox,
    intensity: number
  ): void;

  /**
   * 이모지 오버레이 적용
   * @param canvas - 대상 캔버스
   * @param region - 대상 영역
   * @param emoji - 이모지 문자
   */
  applyEmoji(
    canvas: HTMLCanvasElement,
    region: BoundingBox,
    emoji: string
  ): void;

  /**
   * 캔버스를 이미지 파일로 내보내기
   * @param canvas - 소스 캔버스
   * @param options - 내보내기 옵션
   * @returns Blob 객체
   */
  exportImage(
    canvas: HTMLCanvasElement,
    options: ExportOptions
  ): Promise<Blob>;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

---

## 3. React Hooks Contracts

### useFaceDetection

```typescript
interface UseFaceDetectionOptions {
  /** 사용할 감지 모델 */
  detector: 'mediapipe' | 'faceapi' | 'auto';
  
  /** 최소 신뢰도 */
  minConfidence?: number;
}

interface UseFaceDetectionResult {
  /** 얼굴 감지 함수 */
  detectFaces: (image: HTMLImageElement) => Promise<void>;
  
  /** 감지된 얼굴 목록 */
  faces: DetectedFace[];
  
  /** 감지 진행 중 여부 */
  isDetecting: boolean;
  
  /** 오류 메시지 */
  error: string | null;
  
  /** 현재 사용 중인 감지기 */
  activeDetector: 'mediapipe' | 'faceapi';
  
  /** 모델 로딩 완료 여부 */
  isReady: boolean;
}

function useFaceDetection(options: UseFaceDetectionOptions): UseFaceDetectionResult;
```

### useImageProcessor

```typescript
interface UseImageProcessorResult {
  /** 이미지 로드 */
  loadImage: (file: File) => Promise<MediaFile>;
  
  /** 마스킹 적용 */
  applyMask: (faces: DetectedFace[], config: MaskConfiguration) => void;
  
  /** 이미지 내보내기 */
  exportImage: (options: ExportOptions) => Promise<Blob>;
  
  /** 캔버스 참조 */
  canvasRef: React.RefObject<HTMLCanvasElement>;
  
  /** 로드된 미디어 파일 */
  mediaFile: MediaFile | null;
  
  /** 처리 중 여부 */
  isProcessing: boolean;
}

function useImageProcessor(): UseImageProcessorResult;
```

### useMaskConfiguration

```typescript
interface UseMaskConfigurationResult {
  /** 현재 설정 */
  config: MaskConfiguration;
  
  /** 마스킹 타입 변경 */
  setMaskType: (type: 'blur' | 'emoji' | 'none') => void;
  
  /** 블러 강도 변경 */
  setBlurIntensity: (intensity: number) => void;
  
  /** 이모지 변경 */
  setEmoji: (emoji: string) => void;
  
  /** 기본값으로 리셋 */
  reset: () => void;
}

function useMaskConfiguration(): UseMaskConfigurationResult;
```

---

## 4. Component Props Contracts

### ImageUpload

```typescript
interface ImageUploadProps {
  /** 파일 선택 시 콜백 */
  onFileSelect: (file: File) => void;
  
  /** 허용 파일 타입 */
  accept?: string;
  
  /** 비활성화 여부 */
  disabled?: boolean;
  
  /** 드래그 앤 드롭 지원 */
  enableDragDrop?: boolean;
}
```

### FaceCanvas

```typescript
interface FaceCanvasProps {
  /** 이미지 소스 URL */
  imageSrc: string | null;
  
  /** 감지된 얼굴 목록 */
  faces: DetectedFace[];
  
  /** 마스킹 설정 */
  maskConfig: MaskConfiguration;
  
  /** 얼굴 클릭 시 콜백 */
  onFaceClick: (faceId: string) => void;
  
  /** 줌 레벨 */
  zoomLevel?: number;
  
  /** 캔버스 참조 전달 */
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}
```

### MaskControls

```typescript
interface MaskControlsProps {
  /** 현재 마스킹 설정 */
  config: MaskConfiguration;
  
  /** 설정 변경 콜백 */
  onChange: (config: MaskConfiguration) => void;
  
  /** 선택된 얼굴 수 */
  selectedCount: number;
  
  /** 비활성화 여부 */
  disabled?: boolean;
}
```

### DownloadButton

```typescript
interface DownloadButtonProps {
  /** 다운로드 실행 함수 */
  onDownload: (options: ExportOptions) => void;
  
  /** 비활성화 여부 */
  disabled?: boolean;
  
  /** 처리 중 여부 */
  isProcessing?: boolean;
}
```

---

## 5. Event Contracts

앱 내 주요 이벤트:

```typescript
/** 이미지 로드 완료 */
interface ImageLoadedEvent {
  type: 'image:loaded';
  payload: MediaFile;
}

/** 얼굴 감지 완료 */
interface FacesDetectedEvent {
  type: 'faces:detected';
  payload: {
    faces: DetectedFace[];
    detector: 'mediapipe' | 'faceapi';
    duration: number; // ms
  };
}

/** 얼굴 선택 변경 */
interface FaceSelectionChangedEvent {
  type: 'face:selectionChanged';
  payload: {
    faceId: string;
    isSelected: boolean;
  };
}

/** 마스킹 설정 변경 */
interface MaskConfigChangedEvent {
  type: 'mask:configChanged';
  payload: MaskConfiguration;
}

/** 이미지 내보내기 완료 */
interface ImageExportedEvent {
  type: 'image:exported';
  payload: {
    blob: Blob;
    options: ExportOptions;
  };
}

type AppEvent = 
  | ImageLoadedEvent 
  | FacesDetectedEvent 
  | FaceSelectionChangedEvent 
  | MaskConfigChangedEvent 
  | ImageExportedEvent;
```
