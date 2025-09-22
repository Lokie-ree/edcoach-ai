/**
 * EdCoach AI - Centralized Test Utilities
 * Shared helpers and utilities for all test suites
 */

import { convexTest } from "convex-test";
import { api } from "../../convex/_generated/api";
import { internal } from "../../convex/_generated/api";
import schema from "../../convex/schema";
import { TEST_CONFIG } from "../config/test-suite.config";
import { expect } from "vitest";

/**
 * Test data factory for creating consistent test data
 */
class TestDataFactory {
  /**
   * Create a test coach user
   */
  static createCoach(overrides: Partial<typeof TEST_CONFIG.fixtures.users.coach> = {}) {
    return {
      ...TEST_CONFIG.fixtures.users.coach,
      ...overrides,
    };
  }

  /**
   * Create a test teacher user
   */
  static createTeacher(overrides: Partial<typeof TEST_CONFIG.fixtures.users.teacher> = {}) {
    const baseTeacher = {
      ...TEST_CONFIG.fixtures.users.teacher,
      subject: [...TEST_CONFIG.fixtures.users.teacher.subject],
    };
    return {
      ...baseTeacher,
      ...overrides,
      subject: overrides.subject ? [...overrides.subject] : baseTeacher.subject,
    };
  }

  /**
   * Create a test walkthrough
   */
  static createWalkthrough(overrides: Partial<typeof TEST_CONFIG.fixtures.walkthroughs.sample> = {}) {
    return {
      ...TEST_CONFIG.fixtures.walkthroughs.sample,
      ...overrides,
    };
  }

  /**
   * Create a test PGP goal
   */
  static createPgpGoal(overrides: Partial<typeof TEST_CONFIG.fixtures.goals.sample> = {}) {
    return {
      ...TEST_CONFIG.fixtures.goals.sample,
      ...overrides,
    };
  }
}

/**
 * Convex test helper with common setup
 */
class ConvexTestHelper {
  private t: ReturnType<typeof convexTest>;

  constructor() {
    this.t = convexTest(schema);
  }

  /**
   * Get the Convex test instance
   */
  get instance() {
    return this.t;
  }

  /**
   * Create a coach user and return the ID
   */
  async createCoach(overrides: Partial<typeof TEST_CONFIG.fixtures.users.coach> = {}) {
    const coachData = TestDataFactory.createCoach(overrides);
    const result = await this.t.mutation(api.users.createOrSyncFromClerk, {});
    
    if (!result.success || !result.userId) {
      throw new Error('Failed to create coach user');
    }
    
    return result.userId;
  }

  /**
   * Create a teacher user and return the ID
   */
  async createTeacher(overrides: Partial<typeof TEST_CONFIG.fixtures.users.teacher> = {}) {
    const teacherData = TestDataFactory.createTeacher(overrides);
    const result = await this.t.mutation(api.teachers.create, teacherData);
    
    if (!result.success || !result.teacherId) {
      throw new Error('Failed to create teacher user');
    }
    
    return result.teacherId;
  }

  /**
   * Create a complete test setup with coach and teacher
   */
  async createTestSetup() {
    const coachId = await this.createCoach();
    const teacherId = await this.createTeacher();
    
    return { coachId, teacherId };
  }

  /**
   * Create a walkthrough with all required data
   */
  async createWalkthrough(teacherId: any, overrides: Partial<typeof TEST_CONFIG.fixtures.walkthroughs.sample> = {}) {
    const walkthroughData = TestDataFactory.createWalkthrough(overrides);
    
    const walkthroughId = await this.t.mutation(api.walkthroughs.createWalkthrough, {
      teacherId,
      walkthroughDate: Date.now(),
      evidenceSummary: walkthroughData.evidenceSummary,
      reinforcementIndicator: walkthroughData.reinforcementIndicator,
      refinementIndicator: walkthroughData.refinementIndicator,
      reinforcementFeedback: walkthroughData.reinforcementFeedback,
      refinementFeedback: walkthroughData.refinementFeedback,
      hasProPlan: false,
      hasStarterPlan: false,
    });
    
    return walkthroughId;
  }

  /**
   * Set up a PGP goal for a teacher
   */
  async setupPgpGoal(teacherId: any, overrides: Partial<typeof TEST_CONFIG.fixtures.goals.sample> = {}) {
    const goalData = TestDataFactory.createPgpGoal(overrides);
    
    await this.t.mutation(api.teachers.setPgpGoal, {
      teacherId,
      text: goalData.text,
      indicatorCode: goalData.indicatorCode,
    });
  }

  /**
   * Create a complete 5-phase test scenario
   */
  async createCompleteScenario() {
    const { coachId, teacherId } = await this.createTestSetup();
    
    // Phase 1: Set Goal
    await this.setupPgpGoal(teacherId);
    
    // Phase 2: Capture Evidence
    const walkthroughId = await this.createWalkthrough(teacherId);
    
    // Phase 3: Generate Feedback (mock)
    const feedback = await this.t.action(api.aiFeedback.generateFeedback, {
      evidenceSummary: TestDataFactory.createWalkthrough().evidenceSummary,
      reinforcementIndicator: TestDataFactory.createWalkthrough().reinforcementIndicator,
      refinementIndicator: TestDataFactory.createWalkthrough().refinementIndicator,
      hasProPlan: false,
      hasStarterPlan: false,
    });
    
    // Phase 4: Reflect
    const reflectionId = await this.t.mutation(api.reflections.createReflection, {
      walkthroughId,
      teacherId,
      content: "This was a great learning experience. I can see how the interactive activities engaged students.",
    });
    
    // Phase 5: Monitor Growth
    await this.t.mutation(api.teachers.updatePgpProgress, {
      teacherId,
      progress: 30,
    });
    
    return {
      coachId,
      teacherId,
      walkthroughId,
      reflectionId,
      feedback,
    };
  }
}

/**
 * Performance testing utilities
 */
class PerformanceTestHelper {
  /**
   * Measure execution time of a function
   */
  static async measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    return { result, duration };
  }

  /**
   * Check if performance meets benchmarks
   */
  static checkPerformance(duration: number, benchmark: number): boolean {
    return duration <= benchmark;
  }

  /**
   * Run load test with multiple concurrent operations
   */
  static async runLoadTest<T>(
    operation: () => Promise<T>,
    concurrency: number = 10,
    iterations: number = 100
  ): Promise<{ results: T[]; averageTime: number; successRate: number }> {
    const results: T[] = [];
    const times: number[] = [];
    let successes = 0;
    
    const promises = Array(concurrency).fill(null).map(async () => {
      for (let i = 0; i < iterations / concurrency; i++) {
        try {
          const { result, duration } = await this.measureTime(operation);
          results.push(result);
          times.push(duration);
          successes++;
        } catch (error) {
          console.error('Load test operation failed:', error);
        }
      }
    });
    
    await Promise.all(promises);
    
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const successRate = (successes / iterations) * 100;
    
    return { results, averageTime, successRate };
  }
}

/**
 * Mock utilities for external services
 */
class MockHelper {
  /**
   * Mock OpenAI API responses
   */
  static mockOpenAI() {
    return {
      reinforcementFeedback: TEST_CONFIG.mocks.openai.response.reinforcementFeedback,
      refinementFeedback: TEST_CONFIG.mocks.openai.response.refinementFeedback,
    };
  }

  /**
   * Mock Convex function responses
   */
  static mockConvexFunctions() {
    return {
      createUser: TEST_CONFIG.mocks.convex.functions.createUser,
      createTeacher: TEST_CONFIG.mocks.convex.functions.createTeacher,
      createWalkthrough: TEST_CONFIG.mocks.convex.functions.createWalkthrough,
    };
  }
}

/**
 * Assertion helpers for common test patterns
 */
class AssertionHelper {
  /**
   * Assert that a user story test passes
   */
  static assertUserStory(testName: string, result: any, expectedProperties: string[] = []) {
    expect(result).toBeDefined();
    
    expectedProperties.forEach(prop => {
      expect(result).toHaveProperty(prop);
    });
    
    console.log(`✅ ${testName} - User story test passed`);
  }

  /**
   * Assert performance meets benchmarks
   */
  static assertPerformance(duration: number, benchmark: number, operation: string) {
    expect(duration).toBeLessThanOrEqual(benchmark);
    console.log(`✅ ${operation} - Performance test passed (${duration}ms <= ${benchmark}ms)`);
  }

  /**
   * Assert API response structure
   */
  static assertApiResponse(response: any, expectedStructure: Record<string, any>) {
    expect(response).toBeDefined();
    
    Object.keys(expectedStructure).forEach(key => {
      expect(response).toHaveProperty(key);
      if (typeof expectedStructure[key] === 'object') {
        this.assertApiResponse(response[key], expectedStructure[key]);
      }
    });
  }
}

/**
 * Test environment setup and teardown
 */
class TestEnvironment {
  private static instances: ConvexTestHelper[] = [];

  /**
   * Create a new test environment
   */
  static create(): ConvexTestHelper {
    const helper = new ConvexTestHelper();
    this.instances.push(helper);
    return helper;
  }

  /**
   * Clean up all test environments
   */
  static async cleanup(): Promise<void> {
    // Clean up any test data or resources
    this.instances = [];
  }

  /**
   * Setup test environment with common configuration
   */
  static async setup(): Promise<void> {
    // Set up any global test configuration
    // NODE_ENV is set by the test runner
  }

  /**
   * Teardown test environment
   */
  static async teardown(): Promise<void> {
    await this.cleanup();
  }
}

/**
 * Export all utilities for easy importing
 */
export {
  TestDataFactory,
  ConvexTestHelper,
  PerformanceTestHelper,
  MockHelper,
  AssertionHelper,
  TestEnvironment,
};
