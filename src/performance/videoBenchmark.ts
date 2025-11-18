/**
 * Video Processing Performance Benchmarks
 * Tests video frame processing performance and frame rates
 */

import {
  SimpleBenchmark,
  MemoryMonitor,
  formatBenchmarkResult,
  type BenchmarkResult,
} from './utils';

export interface VideoConfig {
  name: string;
  width: number;
  height: number;
  fps: number;
  durationSeconds: number;
}

export const VIDEO_CONFIGS: VideoConfig[] = [
  { name: 'SD Video (480p)', width: 640, height: 480, fps: 30, durationSeconds: 5 },
  { name: 'HD Video (720p)', width: 1280, height: 720, fps: 30, durationSeconds: 5 },
  { name: 'Full HD (1080p)', width: 1920, height: 1080, fps: 30, durationSeconds: 5 },
  { name: '4K Video (2160p)', width: 3840, height: 2160, fps: 30, durationSeconds: 5 },
];

export interface VideoBenchmarkResult {
  benchmark: BenchmarkResult;
  videoConfig: VideoConfig;
  framesProcessed: number;
  averageFrameTime: number;
  maxFrameTime: number;
  minFrameTime: number;
  estimatedFPS: number;
  memoryUsage: {
    initial: number;
    peak: number;
    final: number;
    growth: number;
  };
}

/**
 * Create a test video element with synthetic frames
 */
async function createTestVideoCanvas(config: VideoConfig): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = config.width;
  canvas.height = config.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Draw a test pattern
  const gradient = ctx.createLinearGradient(0, 0, config.width, config.height);
  gradient.addColorStop(0, '#FF6B6B');
  gradient.addColorStop(0.5, '#4ECDC4');
  gradient.addColorStop(1, '#45B7D1');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, config.width, config.height);

  // Add some moving elements to simulate video content
  for (let i = 0; i < 20; i++) {
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
    ctx.beginPath();
    ctx.arc(
      Math.random() * config.width,
      Math.random() * config.height,
      Math.random() * 50 + 10,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  return canvas;
}

/**
 * Simulate frame processing (read pixels, process, write back)
 */
function processVideoFrame(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  // Read frame data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  // Simulate some processing (simple grayscale conversion)
  for (let i = 0; i < pixels.length; i += 4) {
    const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    pixels[i] = pixels[i + 1] = pixels[i + 2] = avg;
  }

  // Write back (in real scenario, this would be blur or other processing)
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Benchmark video frame processing rate
 */
export async function benchmarkFrameProcessingRate(
  config: VideoConfig,
  iterations = 10
): Promise<VideoBenchmarkResult> {
  console.log(`\n🎬 Benchmarking ${config.name}...`);

  const canvas = await createTestVideoCanvas(config);
  const totalFrames = config.fps * config.durationSeconds;
  const frameTimes: number[] = [];

  const memoryMonitor = new MemoryMonitor();
  const benchmark = new SimpleBenchmark();

  memoryMonitor.start(50);

  const benchmarkResult = await benchmark.run(
    `Video Frame Processing - ${config.name}`,
    () => {
      const frameStart = performance.now();
      processVideoFrame(canvas);
      const frameEnd = performance.now();
      frameTimes.push(frameEnd - frameStart);
    },
    totalFrames
  );

  const memorySnapshots = memoryMonitor.stop();
  const memoryStats = memoryMonitor.getMemoryStats();

  const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
  const maxFrameTime = Math.max(...frameTimes);
  const minFrameTime = Math.min(...frameTimes);
  const estimatedFPS = 1000 / averageFrameTime;

  const result: VideoBenchmarkResult = {
    benchmark: benchmarkResult,
    videoConfig: config,
    framesProcessed: totalFrames,
    averageFrameTime,
    maxFrameTime,
    minFrameTime,
    estimatedFPS,
    memoryUsage: {
      initial: memoryStats.initial?.usedJSHeapSize || 0,
      peak: memoryStats.peak?.usedJSHeapSize || 0,
      final: memoryStats.final?.usedJSHeapSize || 0,
      growth: memoryStats.growth,
    },
  };

  console.log(formatBenchmarkResult(benchmarkResult));
  console.log(`Average Frame Time: ${averageFrameTime.toFixed(2)} ms`);
  console.log(`Estimated FPS: ${estimatedFPS.toFixed(2)}`);
  console.log(`Frames Processed: ${totalFrames}`);

  return result;
}

/**
 * Run video processing benchmarks for all configs
 */
export async function runVideoProcessingBenchmarks(
  configs: VideoConfig[] = VIDEO_CONFIGS
): Promise<VideoBenchmarkResult[]> {
  console.log('🎬 Starting Video Processing Benchmarks...');

  const results: VideoBenchmarkResult[] = [];

  for (const config of configs) {
    const result = await benchmarkFrameProcessingRate(config);
    results.push(result);
  }

  return results;
}

/**
 * Benchmark sustained video processing (longer duration)
 */
export async function benchmarkSustainedProcessing(
  durationSeconds = 10
): Promise<{
  results: VideoBenchmarkResult[];
  sustainabilityScore: number;
}> {
  console.log(`\n⏱️ Benchmarking Sustained Processing (${durationSeconds}s)...`);

  const config: VideoConfig = {
    name: 'HD Sustained Test',
    width: 1280,
    height: 720,
    fps: 30,
    durationSeconds,
  };

  const result = await benchmarkFrameProcessingRate(config);

  // Calculate sustainability score (0-100)
  // Based on frame time consistency and memory stability
  const frameTimeVariance =
    (result.maxFrameTime - result.minFrameTime) / result.averageFrameTime;
  const memoryGrowthPerFrame =
    result.memoryUsage.growth / result.framesProcessed;

  const consistencyScore = Math.max(0, 100 - frameTimeVariance * 100);
  const memoryScore = memoryGrowthPerFrame < 1000 ? 100 : Math.max(0, 100 - memoryGrowthPerFrame / 100);

  const sustainabilityScore = (consistencyScore + memoryScore) / 2;

  console.log(`\nSustainability Score: ${sustainabilityScore.toFixed(2)}/100`);
  console.log(`Frame Time Variance: ${(frameTimeVariance * 100).toFixed(2)}%`);
  console.log(`Memory Growth/Frame: ${memoryGrowthPerFrame.toFixed(0)} bytes`);

  return {
    results: [result],
    sustainabilityScore,
  };
}

/**
 * Benchmark different sample rates for video processing
 */
export async function benchmarkSampleRates(
  sampleRates: number[] = [1, 2, 5, 10, 15]
): Promise<{
  sampleRate: number;
  processingTime: number;
  framesProcessed: number;
  estimatedRealTime: number;
}[]> {
  console.log('\n🎯 Benchmarking Sample Rates...');

  const results: {
    sampleRate: number;
    processingTime: number;
    framesProcessed: number;
    estimatedRealTime: number;
  }[] = [];

  const config: VideoConfig = {
    name: 'Sample Rate Test',
    width: 1280,
    height: 720,
    fps: 30,
    durationSeconds: 10,
  };

  const totalFrames = config.fps * config.durationSeconds;

  for (const sampleRate of sampleRates) {
    const framesToProcess = Math.floor(totalFrames / sampleRate);
    const canvas = await createTestVideoCanvas(config);

    const start = performance.now();

    for (let i = 0; i < framesToProcess; i++) {
      processVideoFrame(canvas);
    }

    const end = performance.now();
    const processingTime = end - start;
    const estimatedRealTime = (processingTime / framesToProcess) * totalFrames;

    results.push({
      sampleRate,
      processingTime,
      framesProcessed: framesToProcess,
      estimatedRealTime,
    });

    console.log(`Sample Rate ${sampleRate}:`);
    console.log(`  Frames: ${framesToProcess}/${totalFrames}`);
    console.log(`  Time: ${processingTime.toFixed(2)} ms`);
    console.log(`  Est. Real-time: ${estimatedRealTime.toFixed(2)} ms`);
  }

  return results;
}

/**
 * Performance thresholds for video processing
 */
export const VIDEO_PERFORMANCE_THRESHOLDS = {
  sd: {
    minFPS: 30, // Should maintain 30 FPS
    maxFrameTime: 33, // 33ms per frame for 30 FPS
  },
  hd: {
    minFPS: 24, // Should maintain 24 FPS
    maxFrameTime: 42, // 42ms per frame for 24 FPS
  },
  fullHD: {
    minFPS: 15, // Should maintain 15 FPS
    maxFrameTime: 67, // 67ms per frame for 15 FPS
  },
  fourK: {
    minFPS: 10, // Should maintain 10 FPS
    maxFrameTime: 100, // 100ms per frame for 10 FPS
  },
};

/**
 * Validate video benchmark results
 */
export function validateVideoBenchmarks(
  results: VideoBenchmarkResult[]
): {
  passed: boolean;
  failures: string[];
} {
  const failures: string[] = [];

  results.forEach((result) => {
    const configName = result.videoConfig.name.toLowerCase();
    let threshold;

    if (configName.includes('480')) threshold = VIDEO_PERFORMANCE_THRESHOLDS.sd;
    else if (configName.includes('720')) threshold = VIDEO_PERFORMANCE_THRESHOLDS.hd;
    else if (configName.includes('1080')) threshold = VIDEO_PERFORMANCE_THRESHOLDS.fullHD;
    else threshold = VIDEO_PERFORMANCE_THRESHOLDS.fourK;

    if (result.estimatedFPS < threshold.minFPS) {
      failures.push(
        `${result.videoConfig.name}: FPS ${result.estimatedFPS.toFixed(2)} below target ${threshold.minFPS}`
      );
    }

    if (result.averageFrameTime > threshold.maxFrameTime) {
      failures.push(
        `${result.videoConfig.name}: Avg frame time ${result.averageFrameTime.toFixed(2)}ms exceeds ${threshold.maxFrameTime}ms`
      );
    }
  });

  return {
    passed: failures.length === 0,
    failures,
  };
}

/**
 * Generate video benchmark summary
 */
export function generateVideoSummary(results: VideoBenchmarkResult[]): string {
  let report = '\n🎬 VIDEO PROCESSING PERFORMANCE SUMMARY\n';
  report += '='.repeat(50) + '\n\n';

  results.forEach((result) => {
    report += `${result.videoConfig.name} (${result.videoConfig.width}x${result.videoConfig.height} @ ${result.videoConfig.fps}fps)\n`;
    report += `  Avg Frame Time: ${result.averageFrameTime.toFixed(2)} ms\n`;
    report += `  Min/Max: ${result.minFrameTime.toFixed(2)}/${result.maxFrameTime.toFixed(2)} ms\n`;
    report += `  Estimated FPS: ${result.estimatedFPS.toFixed(2)}\n`;
    report += `  Frames: ${result.framesProcessed}\n`;
    report += `  Memory Growth: ${new MemoryMonitor().formatBytes(result.memoryUsage.growth)}\n\n`;
  });

  const validation = validateVideoBenchmarks(results);
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
