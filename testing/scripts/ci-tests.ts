#!/usr/bin/env tsx

/**
 * EdCoach AI - CI Test Runner
 * Simplified test runner for CI environments without Convex dependency
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface CITestOptions {
  category?: 'unit' | 'e2e' | 'all';
  verbose?: boolean;
}

class CITestRunner {
  private options: CITestOptions;
  private startTime: number = 0;

  constructor(options: CITestOptions = {}) {
    this.options = {
      category: 'all',
      verbose: false,
      ...options,
    };
  }

  /**
   * Main test execution method for CI
   */
  async run(): Promise<void> {
    this.startTime = Date.now();
    this.log('🚀 Starting EdCoach AI CI Test Suite');
    this.log(`📊 Configuration: ${JSON.stringify(this.options, null, 2)}`);

    try {
      // Create reports directory
      this.createReportsDirectory();

      // Run tests based on category
      switch (this.options.category) {
        case 'unit':
          await this.runUnitTests();
          break;
        case 'e2e':
          await this.runE2ETests();
          break;
        case 'all':
        default:
          await this.runAllTests();
          break;
      }

      // Generate reports
      await this.generateReports();

      this.log('✅ All CI tests completed successfully!');
    } catch (error) {
      this.log(`❌ CI test execution failed: ${error}`);
      process.exit(1);
    }
  }

  /**
   * Create reports directory structure
   */
  private createReportsDirectory(): void {
    const reportsDir = 'testing/reports';
    const subdirs = ['coverage', 'screenshots', 'videos', 'test-results'];
    
    if (!existsSync(reportsDir)) {
      mkdirSync(reportsDir, { recursive: true });
    }
    
    subdirs.forEach(subdir => {
      const path = join(reportsDir, subdir);
      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
      }
    });
  }

  /**
   * Run unit tests (vitest only, no Convex dependency)
   */
  private async runUnitTests(): Promise<void> {
    this.log('🧪 Running Unit Tests (CI Mode)...');
    
    // Run only vitest tests that don't require Convex
    const command = 'npx vitest run --config vitest.ci.config.mts --reporter=verbose --coverage';
    this.executeCommand(command);
  }

  /**
   * Run E2E tests
   */
  private async runE2ETests(): Promise<void> {
    this.log('🌐 Running E2E Tests...');
    
    // Install Playwright browsers first
    this.executeCommand('npx playwright install --with-deps');
    
    // Run Playwright tests with CI config
    const command = 'npx playwright test --config playwright.ci.config.ts';
    this.executeCommand(command);
  }

  /**
   * Run all tests
   */
  private async runAllTests(): Promise<void> {
    this.log('🎯 Running All CI Tests...');
    
    // Run unit tests
    await this.runUnitTests();
    
    // Run E2E tests
    await this.runE2ETests();
  }

  /**
   * Execute command and handle output
   */
  private executeCommand(command: string): void {
    this.log(`🔧 Executing: ${command}`);
    
    try {
      const output = execSync(command, { 
        stdio: 'inherit',
        cwd: process.cwd(),
        env: { 
          ...process.env, 
          NODE_ENV: 'test',
          CI: 'true',
          // Provide placeholder environment variables for testing
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_Y2ktdGVzdC1lbnZpcm9ubWVudC5jbGVyay5hY2NvdW50cy5kZXYk',
          CLERK_SECRET_KEY: 'sk_test_placeholder_for_ci_testing_environment_only',
          NEXT_PUBLIC_CONVEX_URL: 'https://placeholder-for-ci.convex.cloud',
          // Mock Convex environment variables
          CONVEX_DEPLOYMENT: 'test',
          CONVEX_URL: 'https://test.convex.cloud',
        }
      });
      
      this.log('✅ Command completed successfully');
    } catch (error) {
      this.log(`❌ Command failed: ${error}`);
      throw error;
    }
  }

  /**
   * Generate test reports
   */
  private async generateReports(): Promise<void> {
    this.log('📊 Generating CI test reports...');
    
    const duration = Date.now() - this.startTime;
    this.log(`⏱️  Total execution time: ${duration}ms`);
    
    // Generate coverage report
    this.log('📈 Coverage report generated in testing/reports/coverage/');
    
    // Generate test results report
    this.log('📋 Test results available in testing/reports/test-results/');
  }

  /**
   * Log with timestamp
   */
  private log(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const options: CITestOptions = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--category':
      case '-c':
        options.category = args[++i] as any;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
    }
  }

  const runner = new CITestRunner(options);
  await runner.run();
}

function printHelp(): void {
  console.log(`
EdCoach AI CI Test Runner

Usage: tsx testing/scripts/ci-tests.ts [options]

Options:
  -c, --category <type>     Test category: unit, e2e, all (default: all)
  -v, --verbose             Verbose output
  -h, --help                Show this help message

Examples:
  tsx testing/scripts/ci-tests.ts                    # Run all CI tests
  tsx testing/scripts/ci-tests.ts -c unit            # Run unit tests only
  tsx testing/scripts/ci-tests.ts -c e2e             # Run E2E tests only
`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { CITestRunner };
export type { CITestOptions };
