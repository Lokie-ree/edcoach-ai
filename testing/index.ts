/**
 * EdCoach AI - Testing Suite Index
 * Centralized exports for all testing utilities and configurations
 */

// Configuration
export { TEST_CONFIG } from './config/test-suite.config';
export type { TestConfig, UserStory, TestCategory, TestPhase } from './config/test-suite.config';

// Test Runner
export { TestRunner } from './scripts/run-tests';
export type { TestOptions } from './scripts/run-tests';

// Utilities
export {
  TestDataFactory,
  ConvexTestHelper,
  PerformanceTestHelper,
  MockHelper,
  AssertionHelper,
  TestEnvironment,
} from './utils/test-helpers';

// Re-export common testing libraries for convenience
export { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
export { convexTest } from 'convex-test';

// Test data and fixtures
export const TEST_FIXTURES = {
  users: {
    coach: {
      name: 'Test Coach',
      email: 'coach@test.com',
      role: 'coach' as const,
      plan: 'free' as const,
    },
    teacher: {
      name: 'Test Teacher',
      email: 'teacher@test.com',
      subject: ['Mathematics'] as string[],
      gradeBand: '9-12' as string,
    },
  },
  walkthroughs: {
    sample: {
      evidenceSummary: 'Teacher used think-pair-share activity effectively. Students were engaged and discussing algebra problems.',
      reinforcementIndicator: 'student_engagement',
      refinementIndicator: 'classroom_management',
      reinforcementFeedback: 'Excellent use of collaborative learning strategies!',
      refinementFeedback: 'Consider adding more wait time after posing questions.',
    },
  },
  goals: {
    sample: {
      text: 'Improve student engagement through interactive activities',
      indicatorCode: 'LER.1.1',
      progress: 30,
    },
  },
} as const;

// User story test mappings
export const USER_STORY_TESTS = {
  'US-001': 'Coach-Initiated PGP Goal Setting',
  'US-002': 'AI-Assisted Goal Generation',
  'US-003': 'Teacher Goal Ownership and Progress Tracking',
  'US-004': 'Quick Mobile Walkthrough Creation',
  'US-005': 'Tablet-Optimized Evidence Capture',
  'US-006': 'Contextual Evidence Enhancement',
  'US-007': 'AI-Powered Feedback Generation',
  'US-008': 'Coach Feedback Review and Customization',
  'US-009': 'Goal-Aligned Feedback Context',
  'US-010': 'Teacher Reflection Notification and Access',
  'US-011': 'Guided Reflection Interface',
  'US-012': 'Reflection Privacy and Ownership',
  'US-013': 'Coach Analytics Dashboard',
  'US-014': 'Teacher Growth Visualization',
  'US-015': 'Real-Time Activity Monitoring',
  'US-016': 'Seamless Workflow Transitions',
  'US-017': 'Data Consistency Across Phases',
  'US-018': 'Coach Onboarding and Setup',
  'US-019': 'Teacher Invitation and Activation',
  'US-020': 'Plan Management and Usage Tracking',
} as const;

// Phase test mappings
export const PHASE_TESTS = {
  'Set Goal': ['US-001', 'US-002', 'US-003'],
  'Capture Evidence': ['US-004', 'US-005', 'US-006'],
  'Generate Feedback': ['US-007', 'US-008', 'US-009'],
  'Reflect': ['US-010', 'US-011', 'US-012'],
  'Monitor Growth': ['US-013', 'US-014', 'US-015'],
  'Cross-Phase Integration': ['US-016', 'US-017'],
  'Platform Foundation': ['US-018', 'US-019', 'US-020'],
} as const;

// Test categories
export const TEST_CATEGORIES = {
  unit: 'Unit tests for individual functions',
  integration: 'Integration tests for user stories',
  e2e: 'End-to-end browser tests',
  performance: 'Performance and load tests',
} as const;

// Performance benchmarks
export const PERFORMANCE_BENCHMARKS = {
  loadTime: {
    dashboard: 3000, // 3 seconds
    walkthrough: 2000, // 2 seconds
    feedback: 10000, // 10 seconds (AI generation)
  },
  memory: {
    maxHeapUsed: 512 * 1024 * 1024, // 512MB
    maxRSS: 1024 * 1024 * 1024, // 1GB
  },
  concurrent: {
    maxUsers: 100,
    maxWalkthroughs: 50,
  },
} as const;

// Coverage requirements
export const COVERAGE_REQUIREMENTS = {
  unit: {
    threshold: 90,
    branches: 85,
    functions: 90,
    lines: 90,
    statements: 90,
  },
  integration: {
    threshold: 80,
    branches: 75,
    functions: 80,
    lines: 80,
    statements: 80,
  },
  e2e: {
    threshold: 70,
    branches: 65,
    functions: 70,
    lines: 70,
    statements: 70,
  },
} as const;

// Quick test helpers
export const quickTest = {
  /**
   * Run a single user story test
   */
  userStory: (userStory: keyof typeof USER_STORY_TESTS) => {
    console.log(`Running test for ${userStory}: ${USER_STORY_TESTS[userStory]}`);
    // Implementation would run the specific test
  },

  /**
   * Run tests for a specific phase
   */
  phase: (phase: keyof typeof PHASE_TESTS) => {
    console.log(`Running tests for phase: ${phase}`);
    console.log(`User stories: ${PHASE_TESTS[phase].join(', ')}`);
    // Implementation would run the phase tests
  },

  /**
   * Run all tests
   */
  all: () => {
    console.log('Running all tests...');
    // Implementation would run all tests
  },
};

// All exports are available as named exports above
// Use: import { TEST_CONFIG, TEST_FIXTURES, ... } from './testing'
