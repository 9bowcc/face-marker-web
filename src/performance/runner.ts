/**
 * Performance Test Runner
 * Standalone script to run performance tests
 */

import {
  runAllPerformanceTests,
  runQuickPerformanceTests,
  runSpecificTest,
  downloadPerformanceReport,
  downloadDetailedResults,
} from './index';

// Parse command line arguments (when running in Node.js environment)
function parseArgs(): {
  mode: 'all' | 'quick' | 'specific';
  category?: string;
  iterations?: number;
  saveReport?: boolean;
} {
  const args = typeof process !== 'undefined' ? process.argv.slice(2) : [];

  const mode = args.includes('--quick') ? 'quick' : args.includes('--specific') ? 'specific' : 'all';

  const iterationsArg = args.find((arg) => arg.startsWith('--iterations='));
  const iterations = iterationsArg ? parseInt(iterationsArg.split('=')[1], 10) : 10;

  const categoryArg = args.find((arg) => arg.startsWith('--category='));
  const category = categoryArg ? categoryArg.split('=')[1] : undefined;

  const saveReport = args.includes('--save');

  return { mode, category, iterations, saveReport };
}

/**
 * Main runner function
 */
export async function runPerformanceTests(): Promise<void> {
  const args = parseArgs();

  console.log('🎯 Performance Test Runner');
  console.log(`Mode: ${args.mode}`);

  if (args.iterations) {
    console.log(`Iterations: ${args.iterations}`);
  }

  let results;

  try {
    if (args.mode === 'quick') {
      results = await runQuickPerformanceTests();
    } else if (args.mode === 'specific' && args.category) {
      results = await runSpecificTest(
        args.category as 'face-detection' | 'blur' | 'video' | 'backend-comparison'
      );
    } else {
      results = await runAllPerformanceTests({
        iterations: args.iterations,
      });
    }

    if (args.saveReport && results) {
      downloadPerformanceReport(results);
      downloadDetailedResults(results);
      console.log('\n✅ Reports saved');
    }

    console.log('\n✅ All tests completed successfully');
  } catch (error) {
    console.error('\n❌ Error running performance tests:', error);
    throw error;
  }
}

// Auto-run if this is the main module
if (typeof window !== 'undefined') {
  // Browser environment - attach to window for manual execution
  interface WindowWithPerformance extends Window {
    runPerformanceTests: () => Promise<void>;
    performanceTestSuite: {
      runAll: typeof runAllPerformanceTests;
      runQuick: typeof runQuickPerformanceTests;
      runSpecific: typeof runSpecificTest;
    };
  }
  const extendedWindow = window as unknown as WindowWithPerformance;
  extendedWindow.runPerformanceTests = runPerformanceTests;
  extendedWindow.performanceTestSuite = {
    runAll: runAllPerformanceTests,
    runQuick: runQuickPerformanceTests,
    runSpecific: runSpecificTest,
  };
}
