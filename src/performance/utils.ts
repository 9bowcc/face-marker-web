/**
 * Performance testing utilities and helpers
 */

export interface BenchmarkResult {
  name: string;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  samples: number;
  opsPerSecond: number;
  marginOfError: number;
  relativeMarginOfError: number;
}

export interface MemorySnapshot {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

export interface PerformanceReport {
  timestamp: string;
  platform: {
    userAgent: string;
    hardwareConcurrency: number;
    deviceMemory?: number;
  };
  benchmarks: BenchmarkResult[];
  memorySnapshots?: MemorySnapshot[];
  metadata?: Record<string, any>;
}

/**
 * Memory monitoring class
 */
export class MemoryMonitor {
  private snapshots: MemorySnapshot[] = [];
  private intervalId: number | null = null;

  start(intervalMs = 100): void {
    this.snapshots = [];
    this.intervalId = window.setInterval(() => {
      this.takeSnapshot();
    }, intervalMs);
  }

  stop(): MemorySnapshot[] {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    return this.snapshots;
  }

  takeSnapshot(): MemorySnapshot | null {
    if ('memory' in performance && (performance as any).memory) {
      const mem = (performance as any).memory;
      const snapshot: MemorySnapshot = {
        usedJSHeapSize: mem.usedJSHeapSize,
        totalJSHeapSize: mem.totalJSHeapSize,
        jsHeapSizeLimit: mem.jsHeapSizeLimit,
        timestamp: Date.now(),
      };
      this.snapshots.push(snapshot);
      return snapshot;
    }
    return null;
  }

  getMemoryStats(): {
    initial: MemorySnapshot | null;
    peak: MemorySnapshot | null;
    final: MemorySnapshot | null;
    growth: number;
  } {
    if (this.snapshots.length === 0) {
      return { initial: null, peak: null, final: null, growth: 0 };
    }

    const initial = this.snapshots[0];
    const final = this.snapshots[this.snapshots.length - 1];
    const peak = this.snapshots.reduce((max, snap) =>
      snap.usedJSHeapSize > max.usedJSHeapSize ? snap : max
    );

    return {
      initial,
      peak,
      final,
      growth: final.usedJSHeapSize - initial.usedJSHeapSize,
    };
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

/**
 * Simple benchmark runner using performance.now()
 */
export class SimpleBenchmark {
  private results: number[] = [];

  async run(
    name: string,
    fn: () => Promise<void> | void,
    iterations = 10
  ): Promise<BenchmarkResult> {
    this.results = [];

    // Warmup
    await fn();

    // Run benchmark
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await fn();
      const end = performance.now();
      this.results.push(end - start);
    }

    return this.calculateStats(name);
  }

  private calculateStats(name: string): BenchmarkResult {
    const sorted = [...this.results].sort((a, b) => a - b);
    const mean = this.results.reduce((a, b) => a + b, 0) / this.results.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    // Calculate standard deviation
    const variance = this.results.reduce((sum, val) => {
      return sum + Math.pow(val - mean, 2);
    }, 0) / this.results.length;
    const stdDev = Math.sqrt(variance);

    // Calculate operations per second
    const opsPerSecond = 1000 / mean;

    // Calculate margin of error (95% confidence interval)
    const standardError = stdDev / Math.sqrt(this.results.length);
    const marginOfError = 1.96 * standardError;
    const relativeMarginOfError = (marginOfError / mean) * 100;

    return {
      name,
      mean,
      median,
      min,
      max,
      stdDev,
      samples: this.results.length,
      opsPerSecond,
      marginOfError,
      relativeMarginOfError,
    };
  }
}

/**
 * Create test images of various sizes
 */
export function createTestImage(width: number, height: number): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    // Draw a simple test pattern
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#FF6B6B');
    gradient.addColorStop(0.5, '#4ECDC4');
    gradient.addColorStop(1, '#45B7D1');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add some noise/detail
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
      ctx.fillRect(
        Math.random() * width,
        Math.random() * height,
        Math.random() * 50,
        Math.random() * 50
      );
    }

    // Convert to image
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Could not create image blob'));
        return;
      }

      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Could not load image'));
      img.src = URL.createObjectURL(blob);
    });
  });
}

/**
 * Create a test canvas
 */
export function createTestCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Fill with test pattern
    const imageData = ctx.createImageData(width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = Math.random() * 255;     // R
      imageData.data[i + 1] = Math.random() * 255; // G
      imageData.data[i + 2] = Math.random() * 255; // B
      imageData.data[i + 3] = 255;                 // A
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return canvas;
}

/**
 * Format benchmark result for display
 */
export function formatBenchmarkResult(result: BenchmarkResult): string {
  return `
${result.name}
${'='.repeat(result.name.length)}
Mean:     ${result.mean.toFixed(2)} ms
Median:   ${result.median.toFixed(2)} ms
Min:      ${result.min.toFixed(2)} ms
Max:      ${result.max.toFixed(2)} ms
Std Dev:  ${result.stdDev.toFixed(2)} ms
Ops/sec:  ${result.opsPerSecond.toFixed(2)}
Samples:  ${result.samples}
Margin:   ±${result.marginOfError.toFixed(2)} ms (${result.relativeMarginOfError.toFixed(2)}%)
  `.trim();
}

/**
 * Generate performance report
 */
export function generatePerformanceReport(
  benchmarks: BenchmarkResult[],
  memorySnapshots?: MemorySnapshot[],
  metadata?: Record<string, any>
): PerformanceReport {
  return {
    timestamp: new Date().toISOString(),
    platform: {
      userAgent: navigator.userAgent,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
    },
    benchmarks,
    memorySnapshots,
    metadata,
  };
}

/**
 * Export report as JSON
 */
export function exportReportAsJSON(report: PerformanceReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Compare two benchmark results
 */
export function compareBenchmarks(
  baseline: BenchmarkResult,
  current: BenchmarkResult
): {
  percentDifference: number;
  faster: boolean;
  significant: boolean;
} {
  const percentDifference = ((current.mean - baseline.mean) / baseline.mean) * 100;
  const faster = percentDifference < 0;

  // Consider significant if difference is > 5% and outside margin of error
  const significant = Math.abs(percentDifference) > 5 &&
    Math.abs(current.mean - baseline.mean) > (baseline.marginOfError + current.marginOfError);

  return {
    percentDifference,
    faster,
    significant,
  };
}
