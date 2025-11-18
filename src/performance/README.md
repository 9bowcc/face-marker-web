# Performance Testing Suite

Comprehensive benchmarking and performance testing for Face Marker Web.

## Quick Start

```bash
# Run interactive performance tests
npm run perf

# Run quick tests
npm run perf:quick
```

## What's Tested

### Face Detection
- Performance across image sizes (480p to 4K)
- maxFaces parameter impact
- Memory usage tracking
- Backend comparison (WebGPU vs WebGL)

### Blur Algorithm
- Region size performance (100x100 to 800x600)
- Blur intensity impact (radius 5-50)
- Multiple face handling
- Pixel throughput

### Video Processing
- Frame processing rates
- Sustained performance over time
- Sample rate optimization
- Memory stability

### Backend Comparison
- WebGPU vs WebGL
- Initialization time
- Performance across different sizes
- Speedup calculations

## File Overview

- **index.ts** - Main entry point, orchestrates all tests
- **utils.ts** - Benchmark utilities, memory monitoring, helpers
- **faceDetectionBenchmark.ts** - Face detection performance tests
- **blurBenchmark.ts** - Blur algorithm benchmarks
- **videoBenchmark.ts** - Video processing performance
- **backendComparison.ts** - WebGPU vs WebGL comparison
- **runner.ts** - Standalone test runner

## Usage Examples

### Run All Tests

```typescript
import { runAllPerformanceTests } from './src/performance';

const results = await runAllPerformanceTests({
  iterations: 10,
  quick: false,
});
```

### Run Specific Category

```typescript
import { runSpecificTest } from './src/performance';

const results = await runSpecificTest('face-detection');
```

### Custom Benchmark

```typescript
import { SimpleBenchmark, MemoryMonitor } from './src/performance/utils';

const benchmark = new SimpleBenchmark();
const monitor = new MemoryMonitor();

monitor.start();
const result = await benchmark.run('My Test', async () => {
  // Your code here
}, 10);
const memory = monitor.stop();

console.log('Result:', result);
console.log('Memory:', monitor.getMemoryStats());
```

## Performance Metrics

Each benchmark tracks:
- **Mean**: Average execution time
- **Median**: Middle value
- **Min/Max**: Best and worst case
- **Standard Deviation**: Performance consistency
- **Ops/sec**: Throughput
- **Margin of Error**: Statistical confidence
- **Memory Usage**: Growth, peak, final

## Thresholds

All benchmarks validate against predefined thresholds:

```typescript
// Face Detection
Small (640x480):     < 100ms, > 10 fps
Medium (1280x720):   < 200ms, > 5 fps
Large (1920x1080):   < 400ms, > 2.5 fps

// Blur Algorithm
Small Region:   < 10ms, > 100 ops/sec
Medium Region:  < 30ms, > 30 ops/sec
Large Region:   < 100ms, > 10 ops/sec

// Video Processing
SD:        > 30 fps
HD:        > 24 fps
Full HD:   > 15 fps
4K:        > 10 fps
```

## Validation

Tests automatically validate results:
- ✅ PASSED - Performance meets thresholds
- ❌ FAILED - Performance below acceptable

## Reporting

Generate and export reports:

```typescript
import {
  downloadPerformanceReport,
  downloadDetailedResults,
} from './src/performance';

// Browser download
downloadPerformanceReport(results, 'report.json');
downloadDetailedResults(results, 'detailed.json');
```

## Best Practices

1. Run tests in consistent environment
2. Close unnecessary applications
3. Use multiple iterations (10+)
4. Monitor memory growth
5. Compare across browsers
6. Track results over time

## See Also

- [Full Documentation](../../docs/PERFORMANCE.md)
- [Main README](../../README.md)
