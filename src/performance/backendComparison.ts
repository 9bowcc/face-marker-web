/**
 * WebGPU vs WebGL Backend Comparison Benchmarks
 * Compares performance between different TensorFlow.js backends
 */

import { FaceDetectionService } from '../services/faceDetection';
import {
  SimpleBenchmark,
  MemoryMonitor,
  createTestImage,
  formatBenchmarkResult,
  compareBenchmarks,
  type BenchmarkResult,
} from './utils';

export type Backend = 'webgpu' | 'webgl';

export interface BackendBenchmarkResult {
  backend: Backend;
  available: boolean;
  benchmark: BenchmarkResult | null;
  initTime: number;
  memoryUsage: {
    initial: number;
    peak: number;
    final: number;
    growth: number;
  } | null;
  imageSize: { width: number; height: number };
}

export interface BackendComparisonResult {
  webgpu: BackendBenchmarkResult;
  webgl: BackendBenchmarkResult;
  winner: Backend | 'tie';
  speedup: number;
  comparison: {
    percentDifference: number;
    faster: boolean;
    significant: boolean;
  } | null;
}

/**
 * Check if backend is available
 */
async function isBackendAvailable(backend: Backend): Promise<boolean> {
  if (backend === 'webgpu') {
    if (!navigator.gpu) {
      return false;
    }
    try {
      const adapter = await navigator.gpu.requestAdapter();
      return !!adapter;
    } catch {
      return false;
    }
  }
  // WebGL is generally always available
  return true;
}

/**
 * Benchmark a single backend
 */
async function benchmarkBackend(
  backend: Backend,
  width: number,
  height: number,
  iterations = 10
): Promise<BackendBenchmarkResult> {
  console.log(`\n🔧 Testing ${backend.toUpperCase()} backend...`);

  const available = await isBackendAvailable(backend);

  if (!available) {
    console.log(`⚠️  ${backend.toUpperCase()} not available`);
    return {
      backend,
      available: false,
      benchmark: null,
      initTime: 0,
      memoryUsage: null,
      imageSize: { width, height },
    };
  }

  const testImage = await createTestImage(width, height);
  const memoryMonitor = new MemoryMonitor();

  // Measure initialization time
  const initStart = performance.now();
  const faceDetectionService = new FaceDetectionService();
  await faceDetectionService.initialize({
    useWebGPU: backend === 'webgpu',
    maxFaces: 10,
  });
  const initTime = performance.now() - initStart;

  console.log(`Initialization time: ${initTime.toFixed(2)} ms`);
  console.log(`Actual backend: ${faceDetectionService.getBackend()}`);

  // Run benchmark
  const benchmark = new SimpleBenchmark();
  memoryMonitor.start(50);

  const benchmarkResult = await benchmark.run(
    `Face Detection - ${backend.toUpperCase()}`,
    async () => {
      await faceDetectionService.detectFaces(testImage);
    },
    iterations
  );

  memoryMonitor.stop();
  const memoryStats = memoryMonitor.getMemoryStats();

  // Cleanup
  await faceDetectionService.dispose();
  URL.revokeObjectURL(testImage.src);

  console.log(formatBenchmarkResult(benchmarkResult));
  console.log(`Memory Growth: ${memoryMonitor.formatBytes(memoryStats.growth)}`);

  return {
    backend,
    available: true,
    benchmark: benchmarkResult,
    initTime,
    memoryUsage: {
      initial: memoryStats.initial?.usedJSHeapSize || 0,
      peak: memoryStats.peak?.usedJSHeapSize || 0,
      final: memoryStats.final?.usedJSHeapSize || 0,
      growth: memoryStats.growth,
    },
    imageSize: { width, height },
  };
}

/**
 * Compare WebGPU vs WebGL performance
 */
export async function compareBackends(
  width = 1280,
  height = 720,
  iterations = 10
): Promise<BackendComparisonResult> {
  console.log('⚡ BACKEND COMPARISON: WebGPU vs WebGL');
  console.log(`Image size: ${width}x${height}`);
  console.log(`Iterations: ${iterations}`);

  // Benchmark both backends
  const webgpuResult = await benchmarkBackend('webgpu', width, height, iterations);
  const webglResult = await benchmarkBackend('webgl', width, height, iterations);

  let winner: Backend | 'tie' = 'tie';
  let speedup = 1;
  let comparison = null;

  if (webgpuResult.benchmark && webglResult.benchmark) {
    comparison = compareBenchmarks(webglResult.benchmark, webgpuResult.benchmark);

    if (comparison.significant) {
      winner = comparison.faster ? 'webgpu' : 'webgl';
      speedup = webglResult.benchmark.mean / webgpuResult.benchmark.mean;
    }

    console.log('\n🏆 COMPARISON RESULTS:');
    console.log(`Winner: ${winner === 'tie' ? 'No significant difference' : winner.toUpperCase()}`);

    if (winner !== 'tie') {
      console.log(`Speedup: ${speedup.toFixed(2)}x`);
      console.log(`Difference: ${Math.abs(comparison.percentDifference).toFixed(2)}%`);
    }
  } else if (webgpuResult.benchmark && !webglResult.benchmark) {
    winner = 'webgpu';
  } else if (!webgpuResult.benchmark && webglResult.benchmark) {
    winner = 'webgl';
  }

  return {
    webgpu: webgpuResult,
    webgl: webglResult,
    winner,
    speedup,
    comparison,
  };
}

/**
 * Compare backends across multiple image sizes
 */
export async function compareBackendsAcrossSizes(
  sizes: { width: number; height: number }[] = [
    { width: 640, height: 480 },
    { width: 1280, height: 720 },
    { width: 1920, height: 1080 },
  ],
  iterations = 10
): Promise<BackendComparisonResult[]> {
  console.log('📊 Comparing backends across multiple image sizes...\n');

  const results: BackendComparisonResult[] = [];

  for (const size of sizes) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing ${size.width}x${size.height}`);
    console.log('='.repeat(60));

    const result = await compareBackends(size.width, size.height, iterations);
    results.push(result);
  }

  return results;
}

/**
 * Benchmark backend initialization times
 */
export async function benchmarkInitializationTimes(
  iterations = 5
): Promise<{
  webgpu: { mean: number; samples: number[] };
  webgl: { mean: number; samples: number[] };
}> {
  console.log('\n🚀 Benchmarking Backend Initialization Times...');

  const webgpuTimes: number[] = [];
  const webglTimes: number[] = [];

  // Benchmark WebGPU initialization
  const webgpuAvailable = await isBackendAvailable('webgpu');
  if (webgpuAvailable) {
    console.log('Testing WebGPU initialization...');
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const service = new FaceDetectionService();
      await service.initialize({ useWebGPU: true });
      const end = performance.now();
      webgpuTimes.push(end - start);
      await service.dispose();
    }
  }

  // Benchmark WebGL initialization
  console.log('Testing WebGL initialization...');
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    const service = new FaceDetectionService();
    await service.initialize({ useWebGPU: false });
    const end = performance.now();
    webglTimes.push(end - start);
    await service.dispose();
  }

  const webgpuMean = webgpuTimes.length > 0
    ? webgpuTimes.reduce((a, b) => a + b, 0) / webgpuTimes.length
    : 0;

  const webglMean = webglTimes.reduce((a, b) => a + b, 0) / webglTimes.length;

  console.log(`\nWebGPU Init: ${webgpuMean.toFixed(2)} ms (${webgpuTimes.length} samples)`);
  console.log(`WebGL Init: ${webglMean.toFixed(2)} ms (${webglTimes.length} samples)`);

  return {
    webgpu: { mean: webgpuMean, samples: webgpuTimes },
    webgl: { mean: webglMean, samples: webglTimes },
  };
}

/**
 * Generate backend comparison summary
 */
export function generateBackendComparisonSummary(
  results: BackendComparisonResult[]
): string {
  let report = '\n⚡ BACKEND COMPARISON SUMMARY\n';
  report += '='.repeat(50) + '\n\n';

  results.forEach((result) => {
    const size = result.webgpu.imageSize;
    report += `Image Size: ${size.width}x${size.height}\n`;
    report += '-'.repeat(50) + '\n';

    if (result.webgpu.available && result.webgpu.benchmark) {
      report += `WebGPU:\n`;
      report += `  Mean: ${result.webgpu.benchmark.mean.toFixed(2)} ms\n`;
      report += `  Ops/sec: ${result.webgpu.benchmark.opsPerSecond.toFixed(2)}\n`;
      report += `  Init: ${result.webgpu.initTime.toFixed(2)} ms\n`;
    } else {
      report += `WebGPU: Not available\n`;
    }

    if (result.webgl.available && result.webgl.benchmark) {
      report += `WebGL:\n`;
      report += `  Mean: ${result.webgl.benchmark.mean.toFixed(2)} ms\n`;
      report += `  Ops/sec: ${result.webgl.benchmark.opsPerSecond.toFixed(2)}\n`;
      report += `  Init: ${result.webgl.initTime.toFixed(2)} ms\n`;
    } else {
      report += `WebGL: Not available\n`;
    }

    if (result.winner !== 'tie') {
      report += `\n🏆 Winner: ${result.winner.toUpperCase()}\n`;
      report += `Speedup: ${result.speedup.toFixed(2)}x\n`;
    } else {
      report += `\n🤝 No significant difference\n`;
    }

    report += '\n';
  });

  // Overall recommendation
  const webgpuWins = results.filter((r) => r.winner === 'webgpu').length;
  const webglWins = results.filter((r) => r.winner === 'webgl').length;

  report += '\n💡 RECOMMENDATION\n';
  report += '='.repeat(50) + '\n';

  if (webgpuWins > webglWins) {
    report += 'Use WebGPU when available for better performance\n';
  } else if (webglWins > webgpuWins) {
    report += 'Use WebGL for more consistent performance\n';
  } else {
    report += 'Both backends perform similarly - use WebGPU when available\n';
  }

  return report;
}

/**
 * Run comprehensive backend comparison
 */
export async function runComprehensiveBackendComparison(): Promise<{
  sizesComparison: BackendComparisonResult[];
  initTimes: {
    webgpu: { mean: number; samples: number[] };
    webgl: { mean: number; samples: number[] };
  };
  summary: string;
}> {
  console.log('🔬 COMPREHENSIVE BACKEND COMPARISON\n');

  // Compare across sizes
  const sizesComparison = await compareBackendsAcrossSizes();

  // Compare initialization times
  const initTimes = await benchmarkInitializationTimes();

  // Generate summary
  const summary = generateBackendComparisonSummary(sizesComparison);

  console.log(summary);

  return {
    sizesComparison,
    initTimes,
    summary,
  };
}
