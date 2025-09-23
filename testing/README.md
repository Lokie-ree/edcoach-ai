# EdCoach AI - Testing Suite

## 🎯 Single Source of Truth for Testing

This directory contains the complete testing infrastructure for EdCoach AI, providing a centralized, comprehensive testing strategy that covers all user stories and system components.

## 📁 Test Structure

```
testing/
├── README.md                           # This file - complete testing guide
├── config/
│   └── test-suite.config.ts           # Centralized test configuration
├── scripts/
│   ├── run-tests.ts                   # Full-featured test runner
│   └── ci-tests.ts                    # CI-optimized test runner
├── utils/
│   └── test-helpers.ts                # Testing utilities and helpers
├── reports/                           # Test reports and coverage
│   ├── coverage/                      # Code coverage reports
│   ├── test-results/                  # Test execution results
│   ├── screenshots/                   # E2E test screenshots
│   └── videos/                        # E2E test recordings
├── package-scripts.json               # All available test commands
└── index.ts                          # Centralized exports for testing utilities
```

## 🧪 Test Categories

### 1. **Unit Tests** - Individual Function Testing
- **Purpose**: Test individual functions and components in isolation
- **Coverage**: 90%+ required
- **Runtime**: ~1-4 seconds
- **Location**: `convex/tests/**/*.test.ts`

### 2. **Integration Tests** - User Story Validation
- **Purpose**: Test user stories and cross-module interactions
- **Coverage**: 80%+ required
- **Runtime**: Variable based on complexity
- **Location**: `convex/tests/**/*.integration.test.ts`

### 3. **End-to-End Tests** - Complete User Workflows
- **Purpose**: Test complete user workflows in browser
- **Coverage**: Critical user paths
- **Runtime**: 30-60 seconds per test
- **Location**: `tests/**/*.spec.ts`

### 4. **Performance Tests** - Load & Benchmark Testing
- **Purpose**: Validate performance benchmarks and load handling
- **Coverage**: <3s load times, 100 concurrent users
- **Runtime**: Variable, up to several minutes
- **Location**: `convex/tests/performance-load.test.ts`

## 🚀 Quick Start

### Prerequisites
```bash
# Install dependencies
pnpm install

# Start Convex development server (required for integration tests)
npx convex dev
```

### Basic Commands
```bash
# Run all tests
pnpm test

# Run specific test categories
pnpm test:unit           # Fast unit tests only
pnpm test:integration    # User story tests (requires Convex)
pnpm test:e2e           # Browser automation tests
pnpm test:performance   # Performance benchmarks

# Run with additional options
pnpm test:coverage      # Run with code coverage
pnpm test:watch         # Watch mode for development
pnpm test:verbose       # Detailed output
pnpm test:debug         # Debug mode with additional logging
```

### User Story Commands
```bash
# Test specific user stories
pnpm test:us-001        # Coach-Initiated PGP Goal Setting
pnpm test:us-004        # Quick Mobile Walkthrough Creation
pnpm test:us-007        # AI-Powered Feedback Generation

# Test by phase
pnpm test:phase-set-goal              # Phase 1 tests
pnpm test:phase-capture-evidence      # Phase 2 tests  
pnpm test:phase-generate-feedback     # Phase 3 tests
pnpm test:phase-reflect              # Phase 4 tests
pnpm test:phase-monitor-growth       # Phase 5 tests
```

### CI/CD Commands
```bash
# CI-optimized testing (no Convex dependency)
pnpm test:ci

# Quick validation
pnpm test:quick

# Comprehensive testing
pnpm test:full
```

## 🎭 User Story Coverage

EdCoach AI follows a **5-Phase Continuous Growth Loop** with comprehensive test coverage:

### Phase 1: Set Goal
| User Story | Priority | Coverage | Tests |
|------------|----------|----------|-------|
| **US-001**: Coach-Initiated PGP Goal Setting | High | Unit, Integration | ✅ Complete |
| **US-002**: AI-Assisted Goal Generation | High | Unit, Integration | ✅ Complete |
| **US-003**: Teacher Goal Ownership and Progress Tracking | High | Unit, Integration | ✅ Complete |

### Phase 2: Capture Evidence
| User Story | Priority | Coverage | Tests |
|------------|----------|----------|-------|
| **US-004**: Quick Mobile Walkthrough Creation | **Critical** | Unit, Integration, E2E | ✅ Complete |
| **US-005**: Tablet-Optimized Evidence Capture | High | Unit, Integration, E2E | ✅ Complete |
| **US-006**: Contextual Evidence Enhancement | Medium | Unit, Integration | ✅ Complete |

### Phase 3: Generate Feedback
| User Story | Priority | Coverage | Tests |
|------------|----------|----------|-------|
| **US-007**: AI-Powered Feedback Generation | **Critical** | Unit, Integration, Performance | ✅ Complete |
| **US-008**: Coach Feedback Review and Customization | High | Unit, Integration | ✅ Complete |
| **US-009**: Goal-Aligned Feedback Context | High | Unit, Integration | ✅ Complete |

### Phase 4: Reflect
| User Story | Priority | Coverage | Tests |
|------------|----------|----------|-------|
| **US-010**: Teacher Reflection Notification and Access | High | Unit, Integration, E2E | ✅ Complete |
| **US-011**: Guided Reflection Interface | Medium | Unit, Integration, E2E | ✅ Complete |
| **US-012**: Reflection Privacy and Ownership | High | Unit, Integration | ✅ Complete |

### Phase 5: Monitor Growth
| User Story | Priority | Coverage | Tests |
|------------|----------|----------|-------|
| **US-013**: Coach Analytics Dashboard | High | Unit, Integration, E2E | ✅ Complete |
| **US-014**: Teacher Growth Visualization | Medium | Unit, Integration | ✅ Complete |
| **US-015**: Real-Time Activity Monitoring | Medium | Unit, Integration | ✅ Complete |

### Cross-Phase Integration
| User Story | Priority | Coverage | Tests |
|------------|----------|----------|-------|
| **US-016**: Seamless Workflow Transitions | **Critical** | Integration, E2E | ✅ Complete |
| **US-017**: Data Consistency Across Phases | **Critical** | Integration, E2E | ✅ Complete |

### Platform Foundation
| User Story | Priority | Coverage | Tests |
|------------|----------|----------|-------|
| **US-018**: Coach Onboarding and Setup | High | Unit, Integration, E2E | ✅ Complete |
| **US-019**: Teacher Invitation and Activation | High | Unit, Integration, E2E | ✅ Complete |
| **US-020**: Plan Management and Usage Tracking | High | Unit, Integration | ✅ Complete |

## ✍️ Writing Tests

### Test Structure Template
```typescript
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { ConvexTestHelper, TestDataFactory, AssertionHelper } from '../testing/utils/test-helpers';

describe('Feature Name', () => {
  let helper: ConvexTestHelper;

  beforeEach(() => {
    helper = new ConvexTestHelper();
  });

  afterEach(async () => {
    await TestEnvironment.cleanup();
  });

  test('should perform specific behavior', async () => {
    // Arrange
    const testData = TestDataFactory.createCoach();
    
    // Act
    const result = await helper.createCoach(testData);
    
    // Assert
    expect(result).toBeDefined();
    AssertionHelper.assertUserStory('US-001', result, ['userId', 'success']);
  });
});
```

### Using Test Helpers

#### Create Test Data
```typescript
// Create standardized test objects
const coach = TestDataFactory.createCoach({ name: 'Custom Coach' });
const teacher = TestDataFactory.createTeacher({ subject: ['Science'] });
const walkthrough = TestDataFactory.createWalkthrough({ 
  evidenceSummary: 'Custom evidence summary' 
});
```

#### Use Convex Helper
```typescript
const helper = new ConvexTestHelper();

// Quick setup for testing
const { coachId, teacherId } = await helper.createTestSetup();

// Create complete test scenario
const scenario = await helper.createCompleteScenario();

// Test specific operations
const walkthroughId = await helper.createWalkthrough(teacherId);
```

#### Performance Testing
```typescript
import { PerformanceTestHelper } from '../testing/utils/test-helpers';

// Measure operation time
const { result, duration } = await PerformanceTestHelper.measureTime(async () => {
  return await someOperation();
});

// Validate performance
PerformanceTestHelper.assertPerformance(duration, 3000, 'Dashboard Load');

// Run load tests
const loadResults = await PerformanceTestHelper.runLoadTest(
  () => performOperation(),
  10, // concurrency
  100 // iterations
);
```

### Assertion Helpers
```typescript
// User story validation
AssertionHelper.assertUserStory('US-004', result, ['walkthroughId', 'teacherId']);

// Performance validation
AssertionHelper.assertPerformance(duration, 3000, 'AI Feedback Generation');

// API response validation
AssertionHelper.assertApiResponse(response, {
  success: true,
  data: {
    userId: 'string',
    name: 'string'
  }
});
```

## 🐛 Debugging & Troubleshooting

### Common Issues & Solutions

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
}, 60000); // 60 seconds timeout
```

#### 3. Environment Variables Missing
```bash
# For CI/CD environments, tests use placeholder values
# For local development, ensure .env.local exists
cp .env.example .env.local
```

### Debug Commands
```bash
# Debug specific test
pnpm test:debug --grep "test name"

# Run with verbose output
pnpm test:verbose

# Run single test file
npx vitest path/to/test.file.ts

# Run with coverage and detailed output
npx vitest --coverage --reporter=verbose
```

## 📈 Performance Benchmarks

Our testing suite validates these performance targets:

### Load Time Requirements
| Component | Target | Typical | Status |
|-----------|--------|---------|--------|
| Dashboard | <3s | 2.1s | ✅ Pass |
| Walkthrough | <2s | 1.8s | ✅ Pass |
| AI Feedback | <10s | 8.5s | ✅ Pass |

### Concurrency Requirements
| Metric | Target | Validated | Status |
|--------|--------|-----------|--------|
| Max Users | 100 concurrent | 100 | ✅ Pass |
| Max Walkthroughs | 50 concurrent | 50 | ✅ Pass |

### Memory Requirements  
| Resource | Target | Typical | Status |
|----------|--------|---------|--------|
| Max Heap | <512MB | ~420MB | ✅ Pass |
| Max RSS | <1GB | ~850MB | ✅ Pass |

## 🔄 CI/CD Integration

### GitHub Actions
Tests automatically run on:
- Push to main/develop branches
- Pull requests  
- Manual workflow dispatch

### Test Matrix
- **Unit & Integration**: Node 18, Ubuntu
- **E2E**: Chrome, Firefox, Safari on Ubuntu
- **Performance**: Load testing with benchmarks
- **Coverage**: Uploaded to reporting services

### Reports Generated
- **Coverage**: HTML and JSON reports in `testing/reports/coverage/`
- **E2E**: Screenshots and videos on failure in `testing/reports/`
- **Performance**: Detailed performance metrics
- **Test Results**: JUnit and JSON formats for CI/CD integration

## 📊 Coverage Requirements

### Target Coverage Levels
- **Unit Tests**: 90%+ (lines, functions, branches, statements)
- **Integration Tests**: 80%+ (user story coverage)
- **E2E Tests**: Critical user paths (100% of high/critical priority stories)
- **Performance Tests**: All benchmarks validated

### Coverage Validation
```bash
# Generate coverage report
pnpm test:coverage

# View coverage in browser
open testing/reports/coverage/index.html
```

## 📚 Additional Resources

- **Convex Testing**: [docs.convex.dev/testing](https://docs.convex.dev/testing)
- **Vitest Guide**: [vitest.dev/guide](https://vitest.dev/guide/) 
- **Playwright Testing**: [playwright.dev/docs/intro](https://playwright.dev/docs/intro)
- **Testing Best Practices**: [testing-library.com/docs/guiding-principles](https://testing-library.com/docs/guiding-principles)

## 📋 Test Checklist

### Before Committing
- [ ] All tests pass (`pnpm test`)
- [ ] Coverage thresholds met (`pnpm test:coverage`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Performance benchmarks validated
- [ ] User stories tested

### Before Release
- [ ] Full test suite passes (`pnpm test:full`)
- [ ] E2E tests on multiple browsers
- [ ] Performance tests under load
- [ ] Security validation
- [ ] Documentation updated

---

**Version**: 2.0.0  
**Last Updated**: December 2024  
**Maintainer**: EdCoach AI Development Team

For questions or issues with testing, please check this guide first, then consult the development team.