/**
 * Performance Testing Examples
 * Demonstrates how to use the performance testing API
 */

import {
  runAllPerformanceTests,
  runQuickPerformanceTests,
  runSpecificTest,
  downloadPerformanceReport,
  downloadDetailedResults,
} from './index';

import {
  runFaceDetectionBenchmarks,
  benchmarkMaxFacesImpact,
  validateBenchmarkResults,
} from './faceDetectionBenchmark';

import {
  runBlurRegionSizeBenchmarks,
  runBlurIntensityBenchmarks,
  benchmarkMultipleFaces,
} from './blurBenchmark';

import {
  runVideoProcessingBenchmarks,
  benchmarkSustainedProcessing,
  benchmarkSampleRates,
} from './videoBenchmark';

import {
  compareBackends,
  compareBackendsAcrossSizes,
  benchmarkInitializationTimes,
} from './backendComparison';

import {
  SimpleBenchmark,
  MemoryMonitor,
  createTestImage,
  formatBenchmarkResult,
} from './utils';

/**
 * Example 1: Run all performance tests
 */
export async function example1_RunAllTests() {
  console.log('Example 1: Running all performance tests...\n');

  const results = await runAllPerformanceTests({
    iterations: 10,
    quick: false,
  });

  console.log('✅ All tests completed');
  console.log('Results:', results);

  // Download reports
  downloadPerformanceReport(results);
  downloadDetailedResults(results);
}

/**
 * Example 2: Run quick tests (for CI/CD)
 */
export async function example2_RunQuickTests() {
  console.log('Example 2: Running quick tests...\n');

  const results = await runQuickPerformanceTests();

  console.log('✅ Quick tests completed');
  console.log('Overall passed:', results.faceDetection?.validation.passed);
}

/**
 * Example 3: Run specific test category
 */
export async function example3_RunSpecificCategory() {
  console.log('Example 3: Running face detection tests only...\n');

  const results = await runSpecificTest('face-detection');

  console.log('✅ Face detection tests completed');
  console.log(results.faceDetection?.summary);
}

/**
 * Example 4: Custom face detection benchmark
 */
export async function example4_CustomFaceDetectionBenchmark() {
  console.log('Example 4: Custom face detection benchmark...\n');

  // Run with custom options
  const results = await runFaceDetectionBenchmarks({
    iterations: 5,
    imageSizes: [
      { name: 'HD', width: 1280, height: 720 },
      { name: 'Full HD', width: 1920, height: 1080 },
    ],
    useWebGPU: true,
    maxFaces: 10,
  });

  // Validate results
  const validation = validateBenchmarkResults(results);

  console.log('✅ Custom benchmark completed');
  console.log('Validation:', validation.passed ? 'PASSED' : 'FAILED');

  if (!validation.passed) {
    console.log('Failures:', validation.failures);
  }

  return results;
}

/**
 * Example 5: Benchmark different maxFaces settings
 */
export async function example5_BenchmarkMaxFaces() {
  console.log('Example 5: Benchmarking maxFaces parameter...\n');

  const results = await benchmarkMaxFacesImpact(5);

  console.log('✅ maxFaces benchmark completed');

  results.forEach(({ maxFaces, result }) => {
    console.log(`maxFaces=${maxFaces}: ${result.mean.toFixed(2)}ms`);
  });

  return results;
}

/**
 * Example 6: Blur algorithm benchmarks
 */
export async function example6_BlurBenchmarks() {
  console.log('Example 6: Running blur benchmarks...\n');

  // Test different region sizes
  const regionResults = await runBlurRegionSizeBenchmarks({
    iterations: 10,
  });

  // Test different blur intensities
  const intensityResults = await runBlurIntensityBenchmarks({
    iterations: 10,
  });

  console.log('✅ Blur benchmarks completed');
  console.log('Region tests:', regionResults.length);
  console.log('Intensity tests:', intensityResults.length);

  return { regionResults, intensityResults };
}

/**
 * Example 7: Benchmark multiple faces
 */
export async function example7_BenchmarkMultipleFaces() {
  console.log('Example 7: Benchmarking multiple faces...\n');

  const results = await benchmarkMultipleFaces([1, 3, 5, 10], 5);

  console.log('✅ Multiple faces benchmark completed');

  results.forEach(({ faceCount, result }) => {
    console.log(`${faceCount} faces: ${result.mean.toFixed(2)}ms`);
  });

  return results;
}

/**
 * Example 8: Video processing benchmarks
 */
export async function example8_VideoBenchmarks() {
  console.log('Example 8: Running video benchmarks...\n');

  const results = await runVideoProcessingBenchmarks();

  console.log('✅ Video benchmarks completed');

  results.forEach((result) => {
    console.log(
      `${result.videoConfig.name}: ${result.estimatedFPS.toFixed(2)} FPS`
    );
  });

  return results;
}

/**
 * Example 9: Sustained performance test
 */
export async function example9_SustainedPerformance() {
  console.log('Example 9: Testing sustained performance...\n');

  const { results, sustainabilityScore } = await benchmarkSustainedProcessing(10);

  console.log('✅ Sustained performance test completed');
  console.log('Sustainability score:', sustainabilityScore.toFixed(2));

  return { results, sustainabilityScore };
}

/**
 * Example 10: Backend comparison
 */
export async function example10_BackendComparison() {
  console.log('Example 10: Comparing WebGPU vs WebGL...\n');

  const comparison = await compareBackends(1280, 720, 10);

  console.log('✅ Backend comparison completed');
  console.log('Winner:', comparison.winner);
  console.log('Speedup:', comparison.speedup.toFixed(2) + 'x');

  return comparison;
}

/**
 * Example 11: Compare backends across multiple sizes
 */
export async function example11_BackendComparisonAcrossSizes() {
  console.log('Example 11: Comparing backends across sizes...\n');

  const results = await compareBackendsAcrossSizes(
    [
      { width: 1280, height: 720 },
      { width: 1920, height: 1080 },
    ],
    5
  );

  console.log('✅ Multi-size backend comparison completed');

  results.forEach((result) => {
    const size = result.webgpu.imageSize;
    console.log(`${size.width}x${size.height}: Winner = ${result.winner}`);
  });

  return results;
}

/**
 * Example 12: Using SimpleBenchmark for custom code
 */
export async function example12_CustomBenchmark() {
  console.log('Example 12: Custom benchmark with SimpleBenchmark...\n');

  const benchmark = new SimpleBenchmark();

  const result = await benchmark.run(
    'My Custom Operation',
    async () => {
      // Simulate some work
      const arr = new Array(1000000).fill(0).map((_, i) => i * 2);
      const sum = arr.reduce((a, b) => a + b, 0);
      return sum;
    },
    10
  );

  console.log('✅ Custom benchmark completed');
  console.log(formatBenchmarkResult(result));

  return result;
}

/**
 * Example 13: Memory monitoring
 */
export async function example13_MemoryMonitoring() {
  console.log('Example 13: Memory monitoring...\n');

  const monitor = new MemoryMonitor();

  // Start monitoring
  monitor.start(100); // Sample every 100ms

  // Simulate some work that uses memory
  const arrays: number[][] = [];
  for (let i = 0; i < 100; i++) {
    arrays.push(new Array(10000).fill(0).map((_, j) => i * j));
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  // Stop monitoring
  const snapshots = monitor.stop();
  const stats = monitor.getMemoryStats();

  console.log('✅ Memory monitoring completed');
  console.log('Snapshots:', snapshots.length);
  console.log('Initial:', monitor.formatBytes(stats.initial?.usedJSHeapSize || 0));
  console.log('Peak:', monitor.formatBytes(stats.peak?.usedJSHeapSize || 0));
  console.log('Final:', monitor.formatBytes(stats.final?.usedJSHeapSize || 0));
  console.log('Growth:', monitor.formatBytes(stats.growth));

  return stats;
}

/**
 * Example 14: Create test images
 */
export async function example14_CreateTestImages() {
  console.log('Example 14: Creating test images...\n');

  const images = await Promise.all([
    createTestImage(640, 480),
    createTestImage(1280, 720),
    createTestImage(1920, 1080),
  ]);

  console.log('✅ Test images created');
  console.log('Images:', images.length);

  images.forEach((img, i) => {
    console.log(`Image ${i + 1}: ${img.width}x${img.height}`);
  });

  return images;
}

/**
 * Example 15: Sample rate optimization
 */
export async function example15_SampleRateOptimization() {
  console.log('Example 15: Sample rate optimization...\n');

  const results = await benchmarkSampleRates([1, 2, 5, 10]);

  console.log('✅ Sample rate optimization completed');

  results.forEach((result) => {
    console.log(
      `Sample rate ${result.sampleRate}: ${result.framesProcessed} frames, ` +
      `${result.processingTime.toFixed(2)}ms total, ` +
      `${result.estimatedRealTime.toFixed(2)}ms estimated`
    );
  });

  return results;
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('🚀 RUNNING ALL PERFORMANCE TESTING EXAMPLES\n');
  console.log('='.repeat(60));

  const examples = [
    { name: 'Run All Tests', fn: example1_RunAllTests },
    { name: 'Quick Tests', fn: example2_RunQuickTests },
    { name: 'Specific Category', fn: example3_RunSpecificCategory },
    { name: 'Custom Face Detection', fn: example4_CustomFaceDetectionBenchmark },
    { name: 'maxFaces Benchmark', fn: example5_BenchmarkMaxFaces },
    { name: 'Blur Benchmarks', fn: example6_BlurBenchmarks },
    { name: 'Multiple Faces', fn: example7_BenchmarkMultipleFaces },
    { name: 'Video Benchmarks', fn: example8_VideoBenchmarks },
    { name: 'Sustained Performance', fn: example9_SustainedPerformance },
    { name: 'Backend Comparison', fn: example10_BackendComparison },
    { name: 'Multi-size Comparison', fn: example11_BackendComparisonAcrossSizes },
    { name: 'Custom Benchmark', fn: example12_CustomBenchmark },
    { name: 'Memory Monitoring', fn: example13_MemoryMonitoring },
    { name: 'Test Images', fn: example14_CreateTestImages },
    { name: 'Sample Rate', fn: example15_SampleRateOptimization },
  ];

  for (const { name, fn } of examples) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running: ${name}`);
    console.log('='.repeat(60));

    try {
      await fn();
    } catch (error) {
      console.error(`❌ Error in ${name}:`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 ALL EXAMPLES COMPLETED');
  console.log('='.repeat(60));
}

// Attach to window for browser console access
if (typeof window !== 'undefined') {
  (window as any).performanceExamples = {
    example1_RunAllTests,
    example2_RunQuickTests,
    example3_RunSpecificCategory,
    example4_CustomFaceDetectionBenchmark,
    example5_BenchmarkMaxFaces,
    example6_BlurBenchmarks,
    example7_BenchmarkMultipleFaces,
    example8_VideoBenchmarks,
    example9_SustainedPerformance,
    example10_BackendComparison,
    example11_BackendComparisonAcrossSizes,
    example12_CustomBenchmark,
    example13_MemoryMonitoring,
    example14_CreateTestImages,
    example15_SampleRateOptimization,
    runAllExamples,
  };

  console.log('💡 Performance examples available at window.performanceExamples');
}
