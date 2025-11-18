/**
 * Performance Testing Suite - Main Entry Point
 * Run comprehensive performance tests for Face Marker Web
 */

import {
  runFaceDetectionBenchmarks,
  benchmarkMaxFacesImpact,
  generateSummaryReport as generateFaceDetectionSummary,
  validateBenchmarkResults,
  type FaceDetectionBenchmarkResult,
} from './faceDetectionBenchmark';

import {
  runBlurRegionSizeBenchmarks,
  runBlurIntensityBenchmarks,
  benchmarkMultipleFaces,
  generateBlurSummary,
  validateBlurBenchmarks,
  type BlurBenchmarkResult,
} from './blurBenchmark';

import {
  runVideoProcessingBenchmarks,
  benchmarkSustainedProcessing,
  benchmarkSampleRates,
  generateVideoSummary,
  validateVideoBenchmarks,
  type VideoBenchmarkResult,
} from './videoBenchmark';

import {
  runComprehensiveBackendComparison,
  compareBackends,
  type BackendComparisonResult,
} from './backendComparison';

import {
  generatePerformanceReport,
  exportReportAsJSON,
  type PerformanceReport,
} from './utils';

export interface PerformanceTestSuiteOptions {
  runFaceDetection?: boolean;
  runBlur?: boolean;
  runVideo?: boolean;
  runBackendComparison?: boolean;
  iterations?: number;
  quick?: boolean; // Run quick tests only
}

export interface PerformanceTestSuiteResults {
  faceDetection?: {
    results: FaceDetectionBenchmarkResult[];
    summary: string;
    validation: { passed: boolean; failures: string[] };
  };
  blur?: {
    regionSizeResults: BlurBenchmarkResult[];
    intensityResults: BlurBenchmarkResult[];
    summary: string;
    validation: { passed: boolean; failures: string[] };
  };
  video?: {
    results: VideoBenchmarkResult[];
    summary: string;
    validation: { passed: boolean; failures: string[] };
  };
  backendComparison?: {
    results: BackendComparisonResult[];
    summary: string;
  };
  report: PerformanceReport;
  timestamp: string;
}

/**
 * Run all performance tests
 */
export async function runAllPerformanceTests(
  options: PerformanceTestSuiteOptions = {}
): Promise<PerformanceTestSuiteResults> {
  const {
    runFaceDetection = true,
    runBlur = true,
    runVideo = true,
    runBackendComparison = true,
    iterations = 10,
    quick = false,
  } = options;

  console.log('\n🚀 FACE MARKER WEB - PERFORMANCE TEST SUITE');
  console.log('='.repeat(60));
  console.log(`Mode: ${quick ? 'Quick' : 'Full'}`);
  console.log(`Iterations: ${iterations}`);
  console.log(`Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  const results: Partial<PerformanceTestSuiteResults> = {
    timestamp: new Date().toISOString(),
  };

  const allBenchmarks: any[] = [];

  // Face Detection Benchmarks
  if (runFaceDetection) {
    console.log('\n\n📸 FACE DETECTION BENCHMARKS');
    console.log('='.repeat(60));

    const faceDetectionResults = await runFaceDetectionBenchmarks({
      iterations,
      imageSizes: quick
        ? [{ name: 'Medium (1280x720)', width: 1280, height: 720 }]
        : undefined,
    });

    const validation = validateBenchmarkResults(faceDetectionResults);
    const summary = generateFaceDetectionSummary(faceDetectionResults);

    results.faceDetection = {
      results: faceDetectionResults,
      summary,
      validation,
    };

    allBenchmarks.push(
      ...faceDetectionResults.map((r) => r.benchmark)
    );

    console.log(summary);
  }

  // Blur Algorithm Benchmarks
  if (runBlur) {
    console.log('\n\n🎨 BLUR ALGORITHM BENCHMARKS');
    console.log('='.repeat(60));

    const regionSizeResults = await runBlurRegionSizeBenchmarks({
      iterations,
      regionSizes: quick
        ? [{ name: 'Medium Face (200x200)', width: 200, height: 200 }]
        : undefined,
    });

    const intensityResults = quick
      ? []
      : await runBlurIntensityBenchmarks({ iterations });

    const allBlurResults = [...regionSizeResults, ...intensityResults];
    const validation = validateBlurBenchmarks(allBlurResults);
    const summary = generateBlurSummary(allBlurResults);

    results.blur = {
      regionSizeResults,
      intensityResults,
      summary,
      validation,
    };

    allBenchmarks.push(
      ...allBlurResults.map((r) => r.benchmark)
    );

    console.log(summary);
  }

  // Video Processing Benchmarks
  if (runVideo) {
    console.log('\n\n🎬 VIDEO PROCESSING BENCHMARKS');
    console.log('='.repeat(60));

    const videoResults = await runVideoProcessingBenchmarks(
      quick
        ? [{ name: 'HD Video (720p)', width: 1280, height: 720, fps: 30, durationSeconds: 5 }]
        : undefined
    );

    const validation = validateVideoBenchmarks(videoResults);
    const summary = generateVideoSummary(videoResults);

    results.video = {
      results: videoResults,
      summary,
      validation,
    };

    allBenchmarks.push(
      ...videoResults.map((r) => r.benchmark)
    );

    console.log(summary);
  }

  // Backend Comparison
  if (runBackendComparison) {
    console.log('\n\n⚡ BACKEND COMPARISON');
    console.log('='.repeat(60));

    if (quick) {
      const comparisonResult = await compareBackends(1280, 720, iterations);
      results.backendComparison = {
        results: [comparisonResult],
        summary: `Winner: ${comparisonResult.winner}`,
      };
    } else {
      const comprehensive = await runComprehensiveBackendComparison();
      results.backendComparison = {
        results: comprehensive.sizesComparison,
        summary: comprehensive.summary,
      };
    }
  }

  // Generate final report
  const report = generatePerformanceReport(allBenchmarks, undefined, {
    testMode: quick ? 'quick' : 'full',
    iterations,
  });

  results.report = report;

  // Print final summary
  console.log('\n\n' + '='.repeat(60));
  console.log('🎉 PERFORMANCE TEST SUITE COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total Benchmarks: ${allBenchmarks.length}`);
  console.log(`Completed: ${new Date().toISOString()}`);

  // Overall validation
  const allValidations = [
    results.faceDetection?.validation,
    results.blur?.validation,
    results.video?.validation,
  ].filter(Boolean);

  const overallPassed = allValidations.every((v) => v?.passed);
  console.log(`\nOverall Status: ${overallPassed ? '✅ PASSED' : '❌ FAILED'}`);

  if (!overallPassed) {
    console.log('\nFailed Tests:');
    allValidations.forEach((v) => {
      if (v && !v.passed) {
        v.failures.forEach((f) => console.log(`  ❌ ${f}`));
      }
    });
  }

  return results as PerformanceTestSuiteResults;
}

/**
 * Run quick performance tests (subset of tests for CI/CD)
 */
export async function runQuickPerformanceTests(): Promise<PerformanceTestSuiteResults> {
  return runAllPerformanceTests({
    quick: true,
    iterations: 5,
  });
}

/**
 * Run specific test category
 */
export async function runSpecificTest(
  category: 'face-detection' | 'blur' | 'video' | 'backend-comparison'
): Promise<any> {
  const options: PerformanceTestSuiteOptions = {
    runFaceDetection: category === 'face-detection',
    runBlur: category === 'blur',
    runVideo: category === 'video',
    runBackendComparison: category === 'backend-comparison',
  };

  return runAllPerformanceTests(options);
}

/**
 * Save performance report to file (browser download)
 */
export function downloadPerformanceReport(
  results: PerformanceTestSuiteResults,
  filename = 'performance-report.json'
): void {
  const json = exportReportAsJSON(results.report);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Save detailed results including all summaries
 */
export function downloadDetailedResults(
  results: PerformanceTestSuiteResults,
  filename = 'performance-detailed.json'
): void {
  const json = JSON.stringify(results, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// Export all benchmark functions
export * from './faceDetectionBenchmark';
export * from './blurBenchmark';
export * from './videoBenchmark';
export * from './backendComparison';
export * from './utils';
