/**
 * Face Detection Performance Benchmarks
 * Tests face detection performance on various image sizes
 */

import { FaceDetectionService } from '../services/faceDetection';
import {
  SimpleBenchmark,
  MemoryMonitor,
  createTestImage,
  formatBenchmarkResult,
  type BenchmarkResult,
} from './utils';

export interface ImageSizeConfig {
  name: string;
  width: number;
  height: number;
}

export const IMAGE_SIZES: ImageSizeConfig[] = [
  { name: 'Small (640x480)', width: 640, height: 480 },
  { name: 'Medium (1280x720)', width: 1280, height: 720 },
  { name: 'Large (1920x1080)', width: 1920, height: 1080 },
  { name: 'Extra Large (3840x2160)', width: 3840, height: 2160 },
];

export interface FaceDetectionBenchmarkOptions {
  iterations?: number;
  imageSizes?: ImageSizeConfig[];
  useWebGPU?: boolean;
  maxFaces?: number;
}

export interface FaceDetectionBenchmarkResult {
  benchmark: BenchmarkResult;
  imageSize: ImageSizeConfig;
  memoryUsage: {
    initial: number;
    peak: number;
    final: number;
    growth: number;
  };
  backend: string;
}

/**
 * Run face detection benchmarks on various image sizes
 */
export async function runFaceDetectionBenchmarks(
  options: FaceDetectionBenchmarkOptions = {}
): Promise<FaceDetectionBenchmarkResult[]> {
  const {
    iterations = 10,
    imageSizes = IMAGE_SIZES,
    useWebGPU = true,
    maxFaces = 10,
  } = options;

  const results: FaceDetectionBenchmarkResult[] = [];
  const faceDetectionService = new FaceDetectionService();

  console.log('🚀 Starting Face Detection Benchmarks...');
  console.log(`Iterations per test: ${iterations}`);
  console.log(`Image sizes: ${imageSizes.length}`);

  // Initialize face detection service
  await faceDetectionService.initialize({ useWebGPU, maxFaces });
  const backend = faceDetectionService.getBackend();
  console.log(`Using backend: ${backend}`);

  for (const sizeConfig of imageSizes) {
    console.log(`\n📊 Testing ${sizeConfig.name}...`);

    // Create test image
    const testImage = await createTestImage(sizeConfig.width, sizeConfig.height);

    // Setup memory monitoring
    const memoryMonitor = new MemoryMonitor();

    // Run benchmark
    const benchmark = new SimpleBenchmark();

    memoryMonitor.start(50);

    const benchmarkResult = await benchmark.run(
      `Face Detection - ${sizeConfig.name}`,
      async () => {
        await faceDetectionService.detectFaces(testImage, { maxFaces });
      },
      iterations
    );

    memoryMonitor.stop();
    const memoryStats = memoryMonitor.getMemoryStats();

    // Clean up
    URL.revokeObjectURL(testImage.src);

    const result: FaceDetectionBenchmarkResult = {
      benchmark: benchmarkResult,
      imageSize: sizeConfig,
      memoryUsage: {
        initial: memoryStats.initial?.usedJSHeapSize || 0,
        peak: memoryStats.peak?.usedJSHeapSize || 0,
        final: memoryStats.final?.usedJSHeapSize || 0,
        growth: memoryStats.growth,
      },
      backend,
    };

    results.push(result);

    // Display results
    console.log(formatBenchmarkResult(benchmarkResult));
    console.log(`Memory: ${memoryMonitor.formatBytes(memoryStats.growth)} growth`);
  }

  // Cleanup
  await faceDetectionService.dispose();

  return results;
}

/**
 * Run face detection benchmarks with different maxFaces settings
 */
export async function benchmarkMaxFacesImpact(
  iterations = 10
): Promise<{ maxFaces: number; result: BenchmarkResult }[]> {
  const maxFacesValues = [1, 5, 10, 20, 50];
  const results: { maxFaces: number; result: BenchmarkResult }[] = [];

  console.log('\n🎯 Benchmarking maxFaces Impact...');

  const testImage = await createTestImage(1280, 720);

  for (const maxFaces of maxFacesValues) {
    const faceDetectionService = new FaceDetectionService();
    await faceDetectionService.initialize({ maxFaces });

    const benchmark = new SimpleBenchmark();
    const result = await benchmark.run(
      `Face Detection - maxFaces=${maxFaces}`,
      async () => {
        await faceDetectionService.detectFaces(testImage, { maxFaces });
      },
      iterations
    );

    results.push({ maxFaces, result });

    console.log(formatBenchmarkResult(result));

    await faceDetectionService.dispose();
  }

  URL.revokeObjectURL(testImage.src);

  return results;
}

/**
 * Performance baseline thresholds
 * These represent acceptable performance targets
 */
export const PERFORMANCE_THRESHOLDS = {
  small: {
    maxMean: 100, // 100ms for 640x480
    targetOps: 10, // 10 fps minimum
  },
  medium: {
    maxMean: 200, // 200ms for 1280x720
    targetOps: 5, // 5 fps minimum
  },
  large: {
    maxMean: 400, // 400ms for 1920x1080
    targetOps: 2.5, // 2.5 fps minimum
  },
  extraLarge: {
    maxMean: 1000, // 1000ms for 3840x2160
    targetOps: 1, // 1 fps minimum
  },
};

/**
 * Validate benchmark results against thresholds
 */
export function validateBenchmarkResults(
  results: FaceDetectionBenchmarkResult[]
): {
  passed: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  results.forEach((result) => {
    const sizeName = result.imageSize.name.toLowerCase();
    let threshold;

    if (sizeName.includes('small')) threshold = PERFORMANCE_THRESHOLDS.small;
    else if (sizeName.includes('medium')) threshold = PERFORMANCE_THRESHOLDS.medium;
    else if (sizeName.includes('large') && !sizeName.includes('extra'))
      threshold = PERFORMANCE_THRESHOLDS.large;
    else threshold = PERFORMANCE_THRESHOLDS.extraLarge;

    if (result.benchmark.mean > threshold.maxMean) {
      failures.push(
        `${result.imageSize.name}: Mean time ${result.benchmark.mean.toFixed(2)}ms exceeds threshold ${threshold.maxMean}ms`
      );
    }

    if (result.benchmark.opsPerSecond < threshold.targetOps) {
      failures.push(
        `${result.imageSize.name}: Ops/sec ${result.benchmark.opsPerSecond.toFixed(2)} below target ${threshold.targetOps}`
      );
    }
  });

  return {
    passed: failures.length === 0,
    failures,
  };
}

/**
 * Generate summary report
 */
export function generateSummaryReport(results: FaceDetectionBenchmarkResult[]): string {
  let report = '\n📈 FACE DETECTION PERFORMANCE SUMMARY\n';
  report += '='.repeat(50) + '\n\n';

  results.forEach((result) => {
    report += `${result.imageSize.name} (${result.imageSize.width}x${result.imageSize.height})\n`;
    report += `  Mean: ${result.benchmark.mean.toFixed(2)} ms\n`;
    report += `  Ops/sec: ${result.benchmark.opsPerSecond.toFixed(2)}\n`;
    report += `  Memory Growth: ${new MemoryMonitor().formatBytes(result.memoryUsage.growth)}\n`;
    report += `  Backend: ${result.backend}\n\n`;
  });

  const validation = validateBenchmarkResults(results);
  report += '\n📊 VALIDATION\n';
  report += '='.repeat(50) + '\n';
  report += `Status: ${validation.passed ? '✅ PASSED' : '❌ FAILED'}\n`;

  if (validation.failures.length > 0) {
    report += '\nFailures:\n';
    validation.failures.forEach((failure) => {
      report += `  ❌ ${failure}\n`;
    });
  }

  return report;
}
