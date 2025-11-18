/**
 * Blur Algorithm Performance Benchmarks
 * Tests blur performance on different region sizes and blur intensities
 */

import { applyBlurToRegions } from '../utils/blur';
import type { BoundingBox } from '../types';
import {
  SimpleBenchmark,
  MemoryMonitor,
  createTestCanvas,
  formatBenchmarkResult,
  type BenchmarkResult,
} from './utils';

export interface BlurRegionConfig {
  name: string;
  width: number;
  height: number;
}

export const BLUR_REGION_SIZES: BlurRegionConfig[] = [
  { name: 'Small Face (100x100)', width: 100, height: 100 },
  { name: 'Medium Face (200x200)', width: 200, height: 200 },
  { name: 'Large Face (400x400)', width: 400, height: 400 },
  { name: 'Full Region (800x600)', width: 800, height: 600 },
];

export const BLUR_INTENSITIES = [5, 10, 20, 30, 50];

export interface BlurBenchmarkOptions {
  iterations?: number;
  regionSizes?: BlurRegionConfig[];
  blurIntensities?: number[];
  canvasSize?: { width: number; height: number };
}

export interface BlurBenchmarkResult {
  benchmark: BenchmarkResult;
  regionConfig: BlurRegionConfig;
  blurIntensity: number;
  memoryUsage: {
    initial: number;
    peak: number;
    final: number;
    growth: number;
  };
  pixelsProcessed: number;
}

/**
 * Create test bounding boxes for blur regions
 */
function createTestRegions(
  canvasWidth: number,
  canvasHeight: number,
  regionConfig: BlurRegionConfig,
  count = 1
): BoundingBox[] {
  const regions: BoundingBox[] = [];

  for (let i = 0; i < count; i++) {
    const xMin = Math.random() * (canvasWidth - regionConfig.width);
    const yMin = Math.random() * (canvasHeight - regionConfig.height);

    regions.push({
      xMin,
      yMin,
      xMax: xMin + regionConfig.width,
      yMax: yMin + regionConfig.height,
      width: regionConfig.width,
      height: regionConfig.height,
    });
  }

  return regions;
}

/**
 * Run blur benchmarks on various region sizes
 */
export async function runBlurRegionSizeBenchmarks(
  options: BlurBenchmarkOptions = {}
): Promise<BlurBenchmarkResult[]> {
  const {
    iterations = 10,
    regionSizes = BLUR_REGION_SIZES,
    canvasSize = { width: 1920, height: 1080 },
  } = options;

  const results: BlurBenchmarkResult[] = [];
  const blurIntensity = 20; // Fixed intensity for region size tests

  console.log('🎨 Starting Blur Region Size Benchmarks...');
  console.log(`Canvas size: ${canvasSize.width}x${canvasSize.height}`);
  console.log(`Blur intensity: ${blurIntensity}`);

  for (const regionConfig of regionSizes) {
    console.log(`\n📊 Testing ${regionConfig.name}...`);

    const memoryMonitor = new MemoryMonitor();
    const benchmark = new SimpleBenchmark();

    memoryMonitor.start(50);

    const benchmarkResult = await benchmark.run(
      `Blur - ${regionConfig.name} - intensity ${blurIntensity}`,
      () => {
        const canvas = createTestCanvas(canvasSize.width, canvasSize.height);
        const regions = createTestRegions(
          canvasSize.width,
          canvasSize.height,
          regionConfig,
          1
        );

        applyBlurToRegions(canvas, regions, {
          intensity: blurIntensity,
          padding: 10,
        });
      },
      iterations
    );

    memoryMonitor.stop();
    const memoryStats = memoryMonitor.getMemoryStats();

    const result: BlurBenchmarkResult = {
      benchmark: benchmarkResult,
      regionConfig,
      blurIntensity,
      memoryUsage: {
        initial: memoryStats.initial?.usedJSHeapSize || 0,
        peak: memoryStats.peak?.usedJSHeapSize || 0,
        final: memoryStats.final?.usedJSHeapSize || 0,
        growth: memoryStats.growth,
      },
      pixelsProcessed: regionConfig.width * regionConfig.height,
    };

    results.push(result);

    console.log(formatBenchmarkResult(benchmarkResult));
    console.log(`Pixels: ${result.pixelsProcessed.toLocaleString()}`);
    console.log(`Pixels/ms: ${(result.pixelsProcessed / benchmarkResult.mean).toFixed(0)}`);
  }

  return results;
}

/**
 * Run blur benchmarks with different intensities
 */
export async function runBlurIntensityBenchmarks(
  options: BlurBenchmarkOptions = {}
): Promise<BlurBenchmarkResult[]> {
  const {
    iterations = 10,
    blurIntensities = BLUR_INTENSITIES,
    canvasSize = { width: 1920, height: 1080 },
  } = options;

  const results: BlurBenchmarkResult[] = [];
  const regionConfig = { name: 'Medium Face (200x200)', width: 200, height: 200 };

  console.log('\n🔥 Starting Blur Intensity Benchmarks...');
  console.log(`Region size: ${regionConfig.width}x${regionConfig.height}`);

  for (const intensity of blurIntensities) {
    console.log(`\n📊 Testing intensity ${intensity}...`);

    const memoryMonitor = new MemoryMonitor();
    const benchmark = new SimpleBenchmark();

    memoryMonitor.start(50);

    const benchmarkResult = await benchmark.run(
      `Blur - intensity ${intensity}`,
      () => {
        const canvas = createTestCanvas(canvasSize.width, canvasSize.height);
        const regions = createTestRegions(
          canvasSize.width,
          canvasSize.height,
          regionConfig,
          1
        );

        applyBlurToRegions(canvas, regions, {
          intensity,
          padding: 10,
        });
      },
      iterations
    );

    memoryMonitor.stop();
    const memoryStats = memoryMonitor.getMemoryStats();

    const result: BlurBenchmarkResult = {
      benchmark: benchmarkResult,
      regionConfig,
      blurIntensity: intensity,
      memoryUsage: {
        initial: memoryStats.initial?.usedJSHeapSize || 0,
        peak: memoryStats.peak?.usedJSHeapSize || 0,
        final: memoryStats.final?.usedJSHeapSize || 0,
        growth: memoryStats.growth,
      },
      pixelsProcessed: regionConfig.width * regionConfig.height,
    };

    results.push(result);

    console.log(formatBenchmarkResult(benchmarkResult));
  }

  return results;
}

/**
 * Benchmark multiple faces being blurred simultaneously
 */
export async function benchmarkMultipleFaces(
  faceCount: number[] = [1, 3, 5, 10],
  iterations = 10
): Promise<{ faceCount: number; result: BenchmarkResult }[]> {
  const results: { faceCount: number; result: BenchmarkResult }[] = [];
  const canvasSize = { width: 1920, height: 1080 };
  const regionConfig = { name: 'Face', width: 200, height: 200 };
  const blurIntensity = 20;

  console.log('\n👥 Benchmarking Multiple Faces...');

  for (const count of faceCount) {
    console.log(`\n📊 Testing ${count} faces...`);

    const benchmark = new SimpleBenchmark();
    const result = await benchmark.run(
      `Blur ${count} faces`,
      () => {
        const canvas = createTestCanvas(canvasSize.width, canvasSize.height);
        const regions = createTestRegions(
          canvasSize.width,
          canvasSize.height,
          regionConfig,
          count
        );

        applyBlurToRegions(canvas, regions, {
          intensity: blurIntensity,
          padding: 10,
        });
      },
      iterations
    );

    results.push({ faceCount: count, result });
    console.log(formatBenchmarkResult(result));
  }

  return results;
}

/**
 * Performance baseline thresholds for blur operations
 */
export const BLUR_PERFORMANCE_THRESHOLDS = {
  smallRegion: {
    maxMean: 10, // 10ms for 100x100
    targetOps: 100, // 100 ops/sec
  },
  mediumRegion: {
    maxMean: 30, // 30ms for 200x200
    targetOps: 30, // 30 ops/sec
  },
  largeRegion: {
    maxMean: 100, // 100ms for 400x400
    targetOps: 10, // 10 ops/sec
  },
  fullRegion: {
    maxMean: 300, // 300ms for 800x600
    targetOps: 3, // 3 ops/sec
  },
};

/**
 * Validate blur benchmark results
 */
export function validateBlurBenchmarks(
  results: BlurBenchmarkResult[]
): {
  passed: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  results.forEach((result) => {
    const sizeName = result.regionConfig.name.toLowerCase();
    let threshold;

    if (sizeName.includes('small')) threshold = BLUR_PERFORMANCE_THRESHOLDS.smallRegion;
    else if (sizeName.includes('medium')) threshold = BLUR_PERFORMANCE_THRESHOLDS.mediumRegion;
    else if (sizeName.includes('large')) threshold = BLUR_PERFORMANCE_THRESHOLDS.largeRegion;
    else threshold = BLUR_PERFORMANCE_THRESHOLDS.fullRegion;

    if (result.benchmark.mean > threshold.maxMean) {
      failures.push(
        `${result.regionConfig.name} @ intensity ${result.blurIntensity}: Mean ${result.benchmark.mean.toFixed(2)}ms exceeds threshold ${threshold.maxMean}ms`
      );
    }

    if (result.benchmark.opsPerSecond < threshold.targetOps) {
      failures.push(
        `${result.regionConfig.name} @ intensity ${result.blurIntensity}: Ops/sec ${result.benchmark.opsPerSecond.toFixed(2)} below target ${threshold.targetOps}`
      );
    }
  });

  return {
    passed: failures.length === 0,
    failures,
  };
}

/**
 * Generate blur benchmark summary
 */
export function generateBlurSummary(results: BlurBenchmarkResult[]): string {
  let report = '\n🎨 BLUR ALGORITHM PERFORMANCE SUMMARY\n';
  report += '='.repeat(50) + '\n\n';

  results.forEach((result) => {
    const pixelsPerMs = result.pixelsProcessed / result.benchmark.mean;

    report += `${result.regionConfig.name} - Intensity ${result.blurIntensity}\n`;
    report += `  Mean: ${result.benchmark.mean.toFixed(2)} ms\n`;
    report += `  Ops/sec: ${result.benchmark.opsPerSecond.toFixed(2)}\n`;
    report += `  Pixels: ${result.pixelsProcessed.toLocaleString()}\n`;
    report += `  Throughput: ${pixelsPerMs.toFixed(0)} pixels/ms\n`;
    report += `  Memory Growth: ${new MemoryMonitor().formatBytes(result.memoryUsage.growth)}\n\n`;
  });

  const validation = validateBlurBenchmarks(results);
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
