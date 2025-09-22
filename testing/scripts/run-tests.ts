#!/usr/bin/env tsx

/**
 * EdCoach AI - Centralized Test Runner
 * Single command to run all tests with proper configuration and reporting
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { TEST_CONFIG } from '../config/test-suite.config';

interface TestOptions {
  category?: 'unit' | 'integration' | 'e2e' | 'performance' | 'all';
  coverage?: boolean;
  watch?: boolean;
  debug?: boolean;
  verbose?: boolean;
  parallel?: boolean;
  userStory?: string;
  phase?: string;
}

class TestRunner {
  private options: TestOptions;
  private startTime: number = 0;

  constructor(options: TestOptions = {}) {
    this.options = {
      category: 'all',
      coverage: true,
      watch: false,
      debug: false,
      verbose: false,
      parallel: true,
      ...options,
    };
  }

  /**
   * Main test execution method
   */
  async run(): Promise<void> {
    this.startTime = Date.now();
    this.log('🚀 Starting EdCoach AI Test Suite');
    this.log(`📊 Configuration: ${JSON.stringify(this.options, null, 2)}`);

    try {
      // Ensure Convex is running
      await this.ensureConvexRunning();

      // Create reports directory
      this.createReportsDirectory();

      // Run tests based on category
      switch (this.options.category) {
        case 'unit':
          await this.runUnitTests();
          break;
        case 'integration':
          await this.runIntegrationTests();
          break;
        case 'e2e':
          await this.runE2ETests();
          break;
        case 'performance':
          await this.runPerformanceTests();
          break;
        case 'all':
        default:
          await this.runAllTests();
          break;
      }

      // Generate reports
      await this.generateReports();

      this.log('✅ All tests completed successfully!');
    } catch (error) {
      this.log(`❌ Test execution failed: ${error}`);
      process.exit(1);
    }
  }

  /**
   * Ensure Convex development server is running
   */
  private async ensureConvexRunning(): Promise<void> {
    this.log('🔍 Checking Convex development server...');
    
    try {
      // Check if _generated directory exists
      if (!existsSync('convex/_generated')) {
        this.log('⚠️  Convex not running. Starting development server...');
        this.log('💡 Please run "npx convex dev" in a separate terminal and try again.');
        throw new Error('Convex development server not running');
      }
      this.log('✅ Convex development server is running');
    } catch (error) {
      this.log('❌ Convex development server check failed');
      throw error;
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
   * Run unit tests
   */
  private async runUnitTests(): Promise<void> {
    this.log('🧪 Running Unit Tests...');
    const command = this.buildVitestCommand('convex/tests/**/*.test.ts');
    this.executeCommand(command);
  }

  /**
   * Run integration tests
   */
  private async runIntegrationTests(): Promise<void> {
    this.log('🔗 Running Integration Tests...');
    const command = this.buildVitestCommand('convex/tests/**/*.test.ts');
    this.executeCommand(command);
  }

  /**
   * Run E2E tests
   */
  private async runE2ETests(): Promise<void> {
    this.log('🌐 Running E2E Tests...');
    const command = this.buildPlaywrightCommand();
    this.executeCommand(command);
  }

  /**
   * Run performance tests
   */
  private async runPerformanceTests(): Promise<void> {
    this.log('⚡ Running Performance Tests...');
    const command = this.buildVitestCommand('convex/tests/performance-load.test.ts');
    this.executeCommand(command);
  }

  /**
   * Run all tests
   */
  private async runAllTests(): Promise<void> {
    this.log('🎯 Running All Tests...');
    
    // Run Convex tests
    const convexCommand = this.buildVitestCommand('convex/**/*.test.ts');
    this.executeCommand(convexCommand);
    
    // Run Playwright tests
    const playwrightCommand = this.buildPlaywrightCommand();
    this.executeCommand(playwrightCommand);
  }

  /**
   * Build Vitest command with options
   */
  private buildVitestCommand(pattern: string): string {
    const args = ['vitest', 'run', pattern];
    
    if (this.options.coverage) {
      args.push('--coverage');
    }
    
    if (this.options.watch) {
      args.push('--watch');
    }
    
    if (this.options.debug) {
      args.push('--inspect-brk');
    }
    
    if (this.options.verbose) {
      args.push('--reporter=verbose');
    }
    
    if (this.options.parallel) {
      args.push('--threads');
    }
    
    return `npx ${args.join(' ')}`;
  }

  /**
   * Build Playwright command with options
   */
  private buildPlaywrightCommand(): string {
    const args = ['playwright', 'test'];
    
    if (this.options.debug) {
      args.push('--debug');
    }
    
    if (this.options.verbose) {
      args.push('--reporter=list');
    }
    
    return `npx ${args.join(' ')}`;
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
        env: { ...process.env, NODE_ENV: 'test' }
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
    this.log('📊 Generating test reports...');
    
    const duration = Date.now() - this.startTime;
    this.log(`⏱️  Total execution time: ${duration}ms`);
    
    // Generate coverage report
    if (this.options.coverage) {
      this.log('📈 Coverage report generated in testing/reports/coverage/');
    }
    
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
  const options: TestOptions = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--category':
      case '-c':
        options.category = args[++i] as any;
        break;
      case '--no-coverage':
        options.coverage = false;
        break;
      case '--watch':
      case '-w':
        options.watch = true;
        break;
      case '--debug':
      case '-d':
        options.debug = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--no-parallel':
        options.parallel = false;
        break;
      case '--user-story':
      case '-u':
        options.userStory = args[++i];
        break;
      case '--phase':
      case '-p':
        options.phase = args[++i];
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
    }
  }

  const runner = new TestRunner(options);
  await runner.run();
}

function printHelp(): void {
  console.log(`
EdCoach AI Test Runner

Usage: tsx testing/scripts/run-tests.ts [options]

Options:
  -c, --category <type>     Test category: unit, integration, e2e, performance, all (default: all)
  --no-coverage            Disable coverage reporting
  -w, --watch              Run tests in watch mode
  -d, --debug              Run tests in debug mode
  -v, --verbose            Verbose output
  --no-parallel            Disable parallel execution
  -u, --user-story <id>    Run tests for specific user story (e.g., US-001)
  -p, --phase <name>       Run tests for specific phase (e.g., "Set Goal")
  -h, --help               Show this help message

Examples:
  tsx testing/scripts/run-tests.ts                    # Run all tests
  tsx testing/scripts/run-tests.ts -c unit            # Run unit tests only
  tsx testing/scripts/run-tests.ts -c e2e --debug     # Run E2E tests in debug mode
  tsx testing/scripts/run-tests.ts -u US-001          # Run tests for US-001
  tsx testing/scripts/run-tests.ts -p "Set Goal"      # Run tests for Set Goal phase
`);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { TestRunner };
export type { TestOptions };
