# EdCoach AI - Comprehensive Testing Guide

## 🎯 Overview

This guide provides a complete reference for the EdCoach AI testing suite, ensuring consistent, reliable, and comprehensive testing across all user stories and system components.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Test Architecture](#test-architecture)
3. [User Story Coverage](#user-story-coverage)
4. [Test Categories](#test-categories)
5. [Running Tests](#running-tests)
6. [Writing Tests](#writing-tests)
7. [Debugging](#debugging)
8. [CI/CD Integration](#cicd-integration)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites
```bash
# Install dependencies
pnpm install

# Start Convex development server
npx convex dev
```

### Basic Commands
```bash
# Run all tests
pnpm test

# Run specific test categories
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm test:performance

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

## 🏗️ Test Architecture

### Directory Structure
```
testing/
├── README.md                    # Main testing documentation
├── TESTING_GUIDE.md            # This comprehensive guide
├── config/
│   └── test-suite.config.ts    # Centralized configuration
├── scripts/
│   └── run-tests.ts            # Test runner script
├── utils/
│   └── test-helpers.ts         # Shared utilities
├── fixtures/                   # Test data and mocks
├── reports/                    # Test reports and coverage
└── index.ts                    # Centralized exports
```

### Test Flow
1. **Setup**: Initialize test environment and data
2. **Execute**: Run test scenarios
3. **Assert**: Validate results and behavior
4. **Cleanup**: Reset state for next test
5. **Report**: Generate coverage and results

## 📊 User Story Coverage

### Phase 1: Set Goal
| User Story | Test File | Coverage | Priority |
|------------|-----------|----------|----------|
| US-001 | phase1-goal-setting.test.ts | Unit, Integration | High |
| US-002 | phase1-goal-setting.test.ts | Unit, Integration | High |
| US-003 | phase1-goal-setting.test.ts | Unit, Integration | High |

### Phase 2: Capture Evidence
| User Story | Test File | Coverage | Priority |
|------------|-----------|----------|----------|
| US-004 | phase2-capture-evidence.test.ts | Unit, Integration, E2E | Critical |
| US-005 | phase2-capture-evidence.test.ts | Unit, Integration, E2E | High |
| US-006 | phase2-capture-evidence.test.ts | Unit, Integration | Medium |

### Phase 3: Generate Feedback
| User Story | Test File | Coverage | Priority |
|------------|-----------|----------|----------|
| US-007 | phase3-generate-feedback.test.ts | Unit, Integration, Performance | Critical |
| US-008 | phase3-generate-feedback.test.ts | Unit, Integration | High |
| US-009 | phase3-generate-feedback.test.ts | Unit, Integration | High |

### Phase 4: Reflect
| User Story | Test File | Coverage | Priority |
|------------|-----------|----------|----------|
| US-010 | phase4-reflect.test.ts | Unit, Integration, E2E | High |
| US-011 | phase4-reflect.test.ts | Unit, Integration, E2E | Medium |
| US-012 | phase4-reflect.test.ts | Unit, Integration | High |

### Phase 5: Monitor Growth
| User Story | Test File | Coverage | Priority |
|------------|-----------|----------|----------|
| US-013 | phase5-monitor-growth.test.ts | Unit, Integration, E2E | High |
| US-014 | phase5-monitor-growth.test.ts | Unit, Integration | Medium |
| US-015 | phase5-monitor-growth.test.ts | Unit, Integration | Medium |

### Cross-Phase Integration
| User Story | Test File | Coverage | Priority |
|------------|-----------|----------|----------|
| US-016 | cross-phase-integration.test.ts | Integration, E2E | Critical |
| US-017 | cross-phase-integration.test.ts | Integration, E2E | Critical |

### Platform Foundation
| User Story | Test File | Coverage | Priority |
|------------|-----------|----------|----------|
| US-018 | platform-foundation.test.ts | Unit, Integration, E2E | High |
| US-019 | platform-foundation.test.ts | Unit, Integration, E2E | High |
| US-020 | platform-foundation.test.ts | Unit, Integration | High |

## 🧪 Test Categories

### 1. Unit Tests
**Purpose**: Test individual functions and components in isolation
**Location**: `convex/tests/**/*.test.ts`
**Coverage**: 90%+ required

```typescript
import { describe, test, expect } from 'vitest';
import { ConvexTestHelper } from '../../testing/utils/test-helpers';

describe('User Management', () => {
  test('should create user successfully', async () => {
    const helper = new ConvexTestHelper();
    const userId = await helper.createCoach();
    expect(userId).toBeDefined();
  });
});
```

### 2. Integration Tests
**Purpose**: Test user stories and cross-module interactions
**Location**: `convex/tests/**/*.test.ts`
**Coverage**: 80%+ required

```typescript
import { describe, test, expect } from 'vitest';
import { ConvexTestHelper } from '../../testing/utils/test-helpers';

describe('US-004: Quick Mobile Walkthrough Creation', () => {
  test('should create walkthrough with one tap', async () => {
    const helper = new ConvexTestHelper();
    const { teacherId } = await helper.createTestSetup();
    
    const walkthroughId = await helper.createWalkthrough(teacherId);
    expect(walkthroughId).toBeDefined();
  });
});
```

### 3. End-to-End Tests
**Purpose**: Test complete user workflows in browser
**Location**: `tests/**/*.spec.ts`
**Coverage**: Critical user paths

```typescript
import { test, expect } from '@playwright/test';

test('Complete 5-Phase Growth Loop', async ({ page }) => {
  await page.goto('/dashboard');
  // Test complete user workflow
});
```

### 4. Performance Tests
**Purpose**: Validate performance benchmarks and load handling
**Location**: `convex/tests/performance-load.test.ts`
**Coverage**: <3s load times, 100 concurrent users

```typescript
import { describe, test, expect } from 'vitest';
import { PerformanceTestHelper } from '../../testing/utils/test-helpers';

describe('Performance Tests', () => {
  test('should load dashboard in under 3 seconds', async () => {
    const { duration } = await PerformanceTestHelper.measureTime(async () => {
      // Load dashboard
    });
    
    expect(duration).toBeLessThan(3000);
  });
});
```

## 🏃‍♂️ Running Tests

### Basic Commands
```bash
# Run all tests
pnpm test

# Run specific categories
pnpm test:unit
pnpm test:integration
pnpm test:e2e
pnpm test:performance

# Run with options
pnpm test:watch          # Watch mode
pnpm test:debug          # Debug mode
pnpm test:verbose        # Verbose output
pnpm test:coverage       # With coverage
```

### User Story Commands
```bash
# Run specific user story
pnpm test:us-001
pnpm test:us-004
pnpm test:us-007

# Run phase tests
pnpm test:phase-set-goal
pnpm test:phase-capture-evidence
pnpm test:phase-generate-feedback
```

### Advanced Commands
```bash
# CI/CD testing
pnpm test:ci

# Local development
pnpm test:local

# Quick testing
pnpm test:quick

# Full testing with debug
pnpm test:full
```

## ✍️ Writing Tests

### Test Structure
```typescript
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { ConvexTestHelper, TestDataFactory } from '../../testing/utils/test-helpers';

describe('Feature Name', () => {
  let helper: ConvexTestHelper;

  beforeEach(() => {
    helper = new ConvexTestHelper();
  });

  afterEach(async () => {
    await TestEnvironment.cleanup();
  });

  test('should do something specific', async () => {
    // Arrange
    const testData = TestDataFactory.createCoach();
    
    // Act
    const result = await helper.createCoach(testData);
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

### Using Test Helpers
```typescript
// Create test data
const coach = TestDataFactory.createCoach({ name: 'Custom Coach' });
const teacher = TestDataFactory.createTeacher({ subject: ['Science'] });

// Use Convex helper
const helper = new ConvexTestHelper();
const { coachId, teacherId } = await helper.createTestSetup();

// Create complete scenario
const scenario = await helper.createCompleteScenario();

// Performance testing
const { duration } = await PerformanceTestHelper.measureTime(async () => {
  // Your operation
});
```

### Assertion Helpers
```typescript
import { AssertionHelper } from '../../testing/utils/test-helpers';

// User story assertions
AssertionHelper.assertUserStory('US-001', result, ['userId', 'success']);

// Performance assertions
AssertionHelper.assertPerformance(duration, 3000, 'Dashboard Load');

// API response assertions
AssertionHelper.assertApiResponse(response, {
  success: true,
  data: {
    userId: 'string',
    name: 'string'
  }
});
```

## 🐛 Debugging

### Common Issues

#### 1. Convex Not Running
```bash
# Error: Could not find the "_generated" directory
# Solution: Start Convex development server
npx convex dev
```

#### 2. Test Timeouts
```typescript
// Increase timeout for specific test
test('slow operation', async () => {
  // Test implementation
}, 60000); // 60 seconds
```

#### 3. Mock Issues
```typescript
// Mock external APIs
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mock response' } }]
        })
      }
    }
  }))
}));
```

### Debug Commands
```bash
# Debug specific test
pnpm test:debug --grep "test name"

# Run with verbose output
pnpm test:verbose

# Run single test file
pnpm test path/to/test.file.ts
```

## 🔄 CI/CD Integration

### GitHub Actions
The test suite is automatically run on:
- Push to main/develop branches
- Pull requests
- Manual workflow dispatch

### Test Matrix
- **Unit & Integration**: Node 18, Ubuntu
- **E2E**: Multiple browsers (Chrome, Firefox, Safari)
- **Performance**: Load testing with benchmarks
- **User Stories**: Individual validation
- **Phases**: Complete phase testing

### Reports
- **Coverage**: Uploaded to Codecov
- **E2E**: Screenshots and videos on failure
- **Performance**: Detailed performance reports
- **Test Results**: JUnit and JSON formats

## 📈 Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests independent and isolated

### 2. Data Management
- Use TestDataFactory for consistent data
- Clean up after each test
- Avoid hardcoded test data
- Use meaningful test data

### 3. Performance
- Set appropriate timeouts
- Use performance benchmarks
- Test under load
- Monitor memory usage

### 4. Coverage
- Aim for high coverage but focus on quality
- Test edge cases and error conditions
- Validate user stories thoroughly
- Include integration scenarios

### 5. Maintenance
- Keep tests up to date with code changes
- Refactor tests when needed
- Document complex test scenarios
- Regular test suite reviews

## 🔧 Troubleshooting

### Common Solutions

#### Tests Failing
1. Check Convex is running: `npx convex dev`
2. Verify dependencies: `pnpm install`
3. Check test data: Ensure fixtures are correct
4. Review error messages: Look for specific failures

#### Performance Issues
1. Check benchmarks: Verify against requirements
2. Monitor resources: CPU, memory usage
3. Optimize test data: Reduce unnecessary data
4. Use parallel execution: Enable when possible

#### Coverage Issues
1. Review coverage reports: Identify gaps
2. Add missing tests: Focus on critical paths
3. Check test quality: Ensure meaningful assertions
4. Update thresholds: Adjust if needed

### Getting Help
1. Check this guide first
2. Review test examples in the codebase
3. Check GitHub Actions logs
4. Ask the development team

## 📚 Additional Resources

- [Convex Testing Documentation](https://docs.convex.dev/testing)
- [Vitest Guide](https://vitest.dev/guide/)
- [Playwright Testing](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://testing-library.com/docs/guiding-principles)

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Maintainer**: EdCoach AI Development Team
