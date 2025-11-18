# Performance Testing Guide

This document describes the comprehensive performance testing and benchmarking system for the Face Marker Web project.

## Overview

The performance testing suite provides detailed benchmarks for all critical components of the application:

- **Face Detection**: Tests on various image sizes (480p to 4K)
- **Blur Algorithm**: Stack blur performance on different region sizes and intensities
- **Video Processing**: Frame processing rates and sustained performance
- **Backend Comparison**: WebGPU vs WebGL performance analysis
- **Memory Tracking**: Real-time memory usage monitoring

## Quick Start

### Running Performance Tests

```bash
# Run the interactive performance test UI
npm run perf

# Run quick tests (subset for CI/CD)
npm run perf:quick

# Generate performance report
npm run perf:report
```

### Browser-Based Testing

Open `performance.html` in your browser to access the interactive performance testing UI with:

- Individual test category execution
- Real-time console output
- Progress tracking
- Results download

## Test Categories

### 1. Face Detection Benchmarks

Tests face detection performance across different image sizes:

- **Small**: 640x480 (SD quality)
- **Medium**: 1280x720 (HD quality)
- **Large**: 1920x1080 (Full HD quality)
- **Extra Large**: 3840x2160 (4K quality)

**Metrics Tracked:**
- Mean detection time (ms)
- Operations per second
- Memory usage growth
- Margin of error

**Performance Thresholds:**
```typescript
Small (640x480):     < 100ms, > 10 fps
Medium (1280x720):   < 200ms, > 5 fps
Large (1920x1080):   < 400ms, > 2.5 fps
Extra Large (4K):    < 1000ms, > 1 fps
```

### 2. Blur Algorithm Benchmarks

Tests the stack blur algorithm performance:

**Region Size Tests:**
- Small Face: 100x100 pixels
- Medium Face: 200x200 pixels
- Large Face: 400x400 pixels
- Full Region: 800x600 pixels

**Intensity Tests:**
- Blur radius: 5, 10, 20, 30, 50

**Metrics Tracked:**
- Processing time per region
- Pixels processed per millisecond
- Memory consumption
- Throughput (pixels/ms)

**Performance Thresholds:**
```typescript
Small Region (100x100):   < 10ms, > 100 ops/sec
Medium Region (200x200):  < 30ms, > 30 ops/sec
Large Region (400x400):   < 100ms, > 10 ops/sec
Full Region (800x600):    < 300ms, > 3 ops/sec
```

### 3. Video Processing Benchmarks

Tests frame-by-frame video processing capabilities:

**Video Configurations:**
- SD (480p): 640x480 @ 30fps
- HD (720p): 1280x720 @ 30fps
- Full HD (1080p): 1920x1080 @ 30fps
- 4K (2160p): 3840x2160 @ 30fps

**Metrics Tracked:**
- Average frame processing time
- Min/Max frame time
- Estimated FPS
- Frames processed
- Memory growth during processing
- Sustainability score

**Performance Thresholds:**
```typescript
SD (480p):        > 30 fps, < 33ms per frame
HD (720p):        > 24 fps, < 42ms per frame
Full HD (1080p):  > 15 fps, < 67ms per frame
4K (2160p):       > 10 fps, < 100ms per frame
```

### 4. Backend Comparison

Compares WebGPU vs WebGL performance:

**Tests:**
- Initialization time comparison
- Detection performance across image sizes
- Memory usage comparison
- Overall speedup calculation

**Output:**
- Winner determination (WebGPU/WebGL/tie)
- Speedup factor
- Statistical significance
- Recommendations

## Using the Performance API

### Programmatic Usage

```typescript
import {
  runAllPerformanceTests,
  runQuickPerformanceTests,
  runSpecificTest,
} from './src/performance';

// Run all tests
const results = await runAllPerformanceTests({
  iterations: 10,
  quick: false,
});

// Run quick tests (for CI/CD)
const quickResults = await runQuickPerformanceTests();

// Run specific category
const faceResults = await runSpecificTest('face-detection');
const blurResults = await runSpecificTest('blur');
const videoResults = await runSpecificTest('video');
const backendResults = await runSpecificTest('backend-comparison');
```

### Individual Benchmarks

```typescript
import {
  runFaceDetectionBenchmarks,
  runBlurRegionSizeBenchmarks,
  runVideoProcessingBenchmarks,
  compareBackends,
} from './src/performance';

// Face detection benchmarks
const faceResults = await runFaceDetectionBenchmarks({
  iterations: 10,
  imageSizes: [
    { name: 'HD', width: 1280, height: 720 }
  ],
  useWebGPU: true,
});

// Blur benchmarks
const blurResults = await runBlurRegionSizeBenchmarks({
  iterations: 10,
  regionSizes: [
    { name: 'Medium', width: 200, height: 200 }
  ],
});

// Video benchmarks
const videoResults = await runVideoProcessingBenchmarks();

// Backend comparison
const comparison = await compareBackends(1280, 720, 10);
```

### Memory Monitoring

```typescript
import { MemoryMonitor } from './src/performance/utils';

const monitor = new MemoryMonitor();

// Start monitoring (samples every 100ms)
monitor.start(100);

// ... perform operations ...

// Stop and get results
const snapshots = monitor.stop();
const stats = monitor.getMemoryStats();

console.log('Initial:', monitor.formatBytes(stats.initial.usedJSHeapSize));
console.log('Peak:', monitor.formatBytes(stats.peak.usedJSHeapSize));
console.log('Final:', monitor.formatBytes(stats.final.usedJSHeapSize));
console.log('Growth:', monitor.formatBytes(stats.growth));
```

### Simple Benchmarking

```typescript
import { SimpleBenchmark } from './src/performance/utils';

const benchmark = new SimpleBenchmark();

const result = await benchmark.run(
  'My Operation',
  async () => {
    // Your code here
    await someAsyncOperation();
  },
  10 // iterations
);

console.log(`Mean: ${result.mean.toFixed(2)} ms`);
console.log(`Ops/sec: ${result.opsPerSecond.toFixed(2)}`);
```

## Performance Thresholds & Validation

All benchmarks include automatic validation against predefined performance thresholds. Tests will:

- ✅ **PASS**: Performance meets or exceeds thresholds
- ❌ **FAIL**: Performance below acceptable levels

Failed tests will display specific failures with recommendations.

## Reporting & Export

### Generate Reports

```typescript
import {
  generatePerformanceReport,
  exportReportAsJSON,
  downloadPerformanceReport,
  downloadDetailedResults,
} from './src/performance';

// Generate standard report
const report = generatePerformanceReport(benchmarks, memorySnapshots, metadata);

// Export as JSON
const json = exportReportAsJSON(report);

// Download reports (browser)
downloadPerformanceReport(results, 'perf-report.json');
downloadDetailedResults(results, 'perf-detailed.json');
```

### Report Structure

```typescript
interface PerformanceReport {
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
```

## Example Performance Results

### Face Detection (1280x720, WebGPU)

```
Mean:     145.32 ms
Median:   143.21 ms
Min:      138.45 ms
Max:      156.78 ms
Std Dev:  5.43 ms
Ops/sec:  6.88
Samples:  10
Margin:   ±3.37 ms (2.32%)
```

### Blur Algorithm (200x200, intensity 20)

```
Mean:     23.45 ms
Median:   23.12 ms
Min:      21.34 ms
Max:      26.78 ms
Std Dev:  1.67 ms
Ops/sec:  42.64
Pixels:   40,000
Throughput: 1,705 pixels/ms
```

### WebGPU vs WebGL (1280x720)

```
WebGPU Mean:  145.32 ms
WebGL Mean:   178.56 ms
Winner: WebGPU
Speedup: 1.23x
Difference: 18.63%
```

## CI/CD Integration

For continuous integration, use quick tests:

```bash
# In your CI pipeline
npm run perf:quick
```

This runs a subset of tests optimized for CI environments:
- Fewer iterations (5 instead of 10)
- Single representative image size
- Faster completion (~2-3 minutes)

## Interpreting Results

### Benchmark Statistics

- **Mean**: Average time across all iterations
- **Median**: Middle value (less affected by outliers)
- **Min/Max**: Best and worst case performance
- **Std Dev**: Consistency of performance (lower is better)
- **Ops/sec**: Throughput measurement
- **Margin of Error**: Statistical confidence (±ms)
- **Relative Margin**: Percentage variance

### Memory Metrics

- **Initial**: Memory at start
- **Peak**: Maximum memory used
- **Final**: Memory at end
- **Growth**: Net increase (indicates leaks if high)

### Performance Tips

1. **Lower is Better**: Mean, median, min, max times
2. **Higher is Better**: Ops/sec, throughput
3. **Watch Memory Growth**: Should be minimal for repeated operations
4. **Check Std Dev**: High values indicate inconsistent performance
5. **Margin of Error**: < 5% is excellent, 5-10% is good, > 10% needs investigation

## Troubleshooting

### Tests Running Slowly

- Check if WebGPU is available (faster than WebGL)
- Close other browser tabs
- Disable browser extensions
- Use Chrome/Edge for best WebGPU support

### High Memory Usage

- Clear browser cache
- Restart browser
- Check for memory leaks in application code
- Monitor memory growth over time

### Inconsistent Results

- Ensure stable system load
- Run multiple test iterations
- Check thermal throttling
- Close background applications

## File Structure

```
src/performance/
├── index.ts                    # Main entry point
├── utils.ts                    # Utilities and helpers
├── faceDetectionBenchmark.ts   # Face detection tests
├── blurBenchmark.ts            # Blur algorithm tests
├── videoBenchmark.ts           # Video processing tests
├── backendComparison.ts        # WebGPU vs WebGL tests
└── runner.ts                   # Standalone runner

performance.html                # Interactive UI
docs/PERFORMANCE.md            # This file
```

## Contributing

When adding new features, please:

1. Add corresponding performance tests
2. Define performance thresholds
3. Update this documentation
4. Run full test suite before committing

## Further Reading

- [TensorFlow.js Performance Guide](https://www.tensorflow.org/js/guide/platform_environment)
- [WebGPU Fundamentals](https://webgpufundamentals.org/)
- [Stack Blur Algorithm](http://incubator.quasimondo.com/processing/fast_blur_deluxe.php)
- [Web Performance APIs](https://developer.mozilla.org/en-US/docs/Web/API/Performance)
