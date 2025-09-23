/**
 * EdCoach AI - Centralized Test Configuration
 * Single source of truth for all testing parameters and settings
 */

export const TEST_CONFIG = {
  // Test Environment Settings
  environment: {
    nodeVersion: '18',
    timeout: 30000, // 30 seconds
    retries: 2,
    parallel: true,
    maxConcurrency: 4,
  },

  // Coverage Requirements
  coverage: {
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
  },

  // Performance Benchmarks
  performance: {
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
  },

  // User Story Test Mapping
  userStories: {
    'US-001': {
      name: 'Coach-Initiated PGP Goal Setting',
      phase: 'Set Goal',
      priority: 'high',
      testFiles: ['phase1-goal-setting.test.ts'],
      coverage: ['unit', 'integration'],
    },
    'US-002': {
      name: 'AI-Assisted Goal Generation',
      phase: 'Set Goal',
      priority: 'high',
      testFiles: ['phase1-goal-setting.test.ts'],
      coverage: ['unit', 'integration'],
    },
    'US-003': {
      name: 'Teacher Goal Ownership and Progress Tracking',
      phase: 'Set Goal',
      priority: 'high',
      testFiles: ['phase1-goal-setting.test.ts'],
      coverage: ['unit', 'integration'],
    },
    'US-004': {
      name: 'Quick Mobile Walkthrough Creation',
      phase: 'Capture Evidence',
      priority: 'critical',
      testFiles: ['phase2-capture-evidence.test.ts'],
      coverage: ['unit', 'integration', 'e2e'],
    },
    'US-005': {
      name: 'Tablet-Optimized Evidence Capture',
      phase: 'Capture Evidence',
      priority: 'high',
      testFiles: ['phase2-capture-evidence.test.ts'],
      coverage: ['unit', 'integration', 'e2e'],
    },
    'US-006': {
      name: 'Contextual Evidence Enhancement',
      phase: 'Capture Evidence',
      priority: 'medium',
      testFiles: ['phase2-capture-evidence.test.ts'],
      coverage: ['unit', 'integration'],
    },
    'US-007': {
      name: 'AI-Powered Feedback Generation',
      phase: 'Generate Feedback',
      priority: 'critical',
      testFiles: ['phase3-generate-feedback.test.ts'],
      coverage: ['unit', 'integration', 'performance'],
    },
    'US-008': {
      name: 'Coach Feedback Review and Customization',
      phase: 'Generate Feedback',
      priority: 'high',
      testFiles: ['phase3-generate-feedback.test.ts'],
      coverage: ['unit', 'integration'],
    },
    'US-009': {
      name: 'Goal-Aligned Feedback Context',
      phase: 'Generate Feedback',
      priority: 'high',
      testFiles: ['phase3-generate-feedback.test.ts'],
      coverage: ['unit', 'integration'],
    },
    'US-010': {
      name: 'Teacher Reflection Notification and Access',
      phase: 'Reflect',
      priority: 'high',
      testFiles: ['phase4-reflect.test.ts'],
      coverage: ['unit', 'integration', 'e2e'],
    },
    'US-011': {
      name: 'Guided Reflection Interface',
      phase: 'Reflect',
      priority: 'medium',
      testFiles: ['phase4-reflect.test.ts'],
      coverage: ['unit', 'integration', 'e2e'],
    },
    'US-012': {
      name: 'Reflection Privacy and Ownership',
      phase: 'Reflect',
      priority: 'high',
      testFiles: ['phase4-reflect.test.ts'],
      coverage: ['unit', 'integration'],
    },
    'US-013': {
      name: 'Coach Analytics Dashboard',
      phase: 'Monitor Growth',
      priority: 'high',
      testFiles: ['phase5-monitor-growth.test.ts'],
      coverage: ['unit', 'integration', 'e2e'],
    },
    'US-014': {
      name: 'Teacher Growth Visualization',
      phase: 'Monitor Growth',
      priority: 'medium',
      testFiles: ['phase5-monitor-growth.test.ts'],
      coverage: ['unit', 'integration'],
    },
    'US-015': {
      name: 'Real-Time Activity Monitoring',
      phase: 'Monitor Growth',
      priority: 'medium',
      testFiles: ['phase5-monitor-growth.test.ts'],
      coverage: ['unit', 'integration'],
    },
    'US-016': {
      name: 'Seamless Workflow Transitions',
      phase: 'Cross-Phase Integration',
      priority: 'critical',
      testFiles: ['cross-phase-integration.test.ts'],
      coverage: ['integration', 'e2e'],
    },
    'US-017': {
      name: 'Data Consistency Across Phases',
      phase: 'Cross-Phase Integration',
      priority: 'critical',
      testFiles: ['cross-phase-integration.test.ts'],
      coverage: ['integration', 'e2e'],
    },
    'US-018': {
      name: 'Coach Onboarding and Setup',
      phase: 'Platform Foundation',
      priority: 'high',
      testFiles: ['platform-foundation.test.ts'],
      coverage: ['unit', 'integration', 'e2e'],
    },
    'US-019': {
      name: 'Teacher Invitation and Activation',
      phase: 'Platform Foundation',
      priority: 'high',
      testFiles: ['platform-foundation.test.ts'],
      coverage: ['unit', 'integration', 'e2e'],
    },
    'US-020': {
      name: 'Plan Management and Usage Tracking',
      phase: 'Platform Foundation',
      priority: 'high',
      testFiles: ['platform-foundation.test.ts'],
      coverage: ['unit', 'integration'],
    },
  },

  // Test Data and Fixtures
  fixtures: {
    users: {
      coach: {
        name: 'Test Coach',
        email: 'coach@test.com',
        role: 'coach',
        plan: 'free',
      },
      teacher: {
        name: 'Test Teacher',
        email: 'teacher@test.com',
        subject: ['Mathematics'],
        gradeBand: '9-12',
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
  },

  // Mock Data
  mocks: {
    openai: {
      response: {
        reinforcementFeedback: 'Great job using interactive activities!',
        refinementFeedback: 'Consider adding more wait time for student responses.',
      },
    },
    convex: {
      functions: {
        createUser: { success: true, userId: 'user_123' },
        createTeacher: { success: true, teacherId: 'teacher_123' },
        createWalkthrough: 'walkthrough_123',
      },
    },
  },

  // Browser Testing
  browsers: {
    chromium: true,
    firefox: true,
    webkit: true,
  },

  // Viewport Settings
  viewports: {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 },
  },

  // Test Categories
  categories: {
    unit: {
      pattern: '**/*.unit.test.ts',
      description: 'Unit tests for individual functions',
    },
    integration: {
      pattern: '**/*.integration.test.ts',
      description: 'Integration tests for user stories',
    },
    e2e: {
      pattern: '**/*.e2e.spec.ts',
      description: 'End-to-end browser tests',
    },
    performance: {
      pattern: '**/*.performance.test.ts',
      description: 'Performance and load tests',
    },
  },

  // Reporting
  reporting: {
    coverage: {
      html: true,
      json: true,
      text: true,
      lcov: true,
    },
    testResults: {
      junit: true,
      json: true,
      html: true,
    },
    screenshots: {
      onFailure: true,
      path: 'testing/reports/screenshots',
    },
    videos: {
      onFailure: true,
      path: 'testing/reports/videos',
    },
  },
} as const;

// Type definitions for better IDE support
export type TestConfig = typeof TEST_CONFIG;
export type UserStory = keyof typeof TEST_CONFIG.userStories;
export type TestCategory = keyof typeof TEST_CONFIG.categories;
export type TestPhase = 'Set Goal' | 'Capture Evidence' | 'Generate Feedback' | 'Reflect' | 'Monitor Growth' | 'Cross-Phase Integration' | 'Platform Foundation';
