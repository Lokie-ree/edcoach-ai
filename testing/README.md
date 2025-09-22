# EdCoach AI - Testing Suite

## 🎯 Single Source of Truth for Testing

This directory contains the complete testing infrastructure for EdCoach AI, providing a centralized, comprehensive testing strategy that covers all user stories and system components.

## 📁 Test Structure

```
testing/
├── README.md                           # This file - complete testing guide
├── config/
│   ├── vitest.config.mts              # Vitest configuration
│   ├── playwright.config.ts           # Playwright E2E configuration
│   └── convex-test.config.ts          # Convex testing configuration
├── suites/
│   ├── unit/                          # Unit tests for individual functions
│   ├── integration/                   # Integration tests for user stories
│   ├── e2e/                          # End-to-end browser tests
│   └── performance/                   # Performance and load tests
├── fixtures/                          # Test data and mock fixtures
├── utils/                            # Testing utilities and helpers
└── reports/                          # Test reports and coverage
```

## 🧪 Test Categories

### 1. **Unit Tests** (`suites/unit/`)
- Individual function testing
- Component isolation
- Business logic validation
- Error handling verification

### 2. **Integration Tests** (`suites/integration/`)
- User story validation
- API endpoint testing
- Database interaction testing
- Cross-module communication

### 3. **End-to-End Tests** (`suites/e2e/`)
- Complete user workflows
- Browser automation
- UI interaction testing
- Cross-browser compatibility

### 4. **Performance Tests** (`suites/performance/`)
- Load testing
- Response time validation
- Memory usage monitoring
- Scalability verification

## 🎭 User Story Coverage

### Phase 1: Set Goal
- **US-001**: Coach-Initiated PGP Goal Setting
- **US-002**: AI-Assisted Goal Generation
- **US-003**: Teacher Goal Ownership and Progress Tracking

### Phase 2: Capture Evidence
- **US-004**: Quick Mobile Walkthrough Creation
- **US-005**: Tablet-Optimized Evidence Capture
- **US-006**: Contextual Evidence Enhancement

### Phase 3: Generate Feedback
- **US-007**: AI-Powered Feedback Generation
- **US-008**: Coach Feedback Review and Customization
- **US-009**: Goal-Aligned Feedback Context

### Phase 4: Reflect
- **US-010**: Teacher Reflection Notification and Access
- **US-011**: Guided Reflection Interface
- **US-012**: Reflection Privacy and Ownership

### Phase 5: Monitor Growth
- **US-013**: Coach Analytics Dashboard
- **US-014**: Teacher Growth Visualization
- **US-015**: Real-Time Activity Monitoring

### Cross-Phase Integration
- **US-016**: Seamless Workflow Transitions
- **US-017**: Data Consistency Across Phases

### Platform Foundation
- **US-018**: Coach Onboarding and Setup
- **US-019**: Teacher Invitation and Activation
- **US-020**: Plan Management and Usage Tracking

## 🚀 Quick Start

### Prerequisites
```bash
# Install dependencies
pnpm install

# Start Convex development server
npx convex dev
```

### Running Tests

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

## 📊 Test Configuration

### Vitest Configuration
- **Environment**: Edge Runtime
- **Coverage**: 80% threshold
- **Timeout**: 30 seconds
- **Parallel**: Enabled

### Playwright Configuration
- **Browsers**: Chromium, Firefox, WebKit
- **Viewport**: Mobile-first responsive
- **Screenshots**: On failure
- **Video**: On failure

### Convex Testing
- **Schema**: Full database schema
- **Mocks**: External API mocking
- **Isolation**: Per-test database state
- **Authentication**: Role-based testing

## 🔧 Testing Patterns

### Convex Function Testing
```typescript
import { convexTest } from "convex-test";
import { api } from "../_generated/api";
import schema from "../schema";

describe("Feature Tests", () => {
  test("should work correctly", async () => {
    const t = convexTest(schema);
    
    // Test implementation
    const result = await t.mutation(api.users.create, {
      // test data
    });
    
    expect(result).toBeDefined();
  });
});
```

### E2E Testing
```typescript
import { test, expect } from '@playwright/test';

test('Complete user workflow', async ({ page }) => {
  await page.goto('/dashboard');
  // Test implementation
});
```

## 📈 Coverage Requirements

- **Unit Tests**: 90%+ coverage
- **Integration Tests**: 80%+ coverage
- **E2E Tests**: Critical user paths
- **Performance Tests**: <3s load times

## 🐛 Debugging Tests

### Common Issues
1. **Convex not running**: Start with `npx convex dev`
2. **Missing dependencies**: Run `pnpm install`
3. **Type errors**: Check API function signatures
4. **Timeout errors**: Increase test timeout

### Debug Commands
```bash
# Debug specific test
pnpm test:debug --grep "test name"

# Run with verbose output
pnpm test --reporter=verbose

# Run single test file
pnpm test path/to/test.file.ts
```

## 📋 Test Checklist

### Before Committing
- [ ] All tests pass
- [ ] Coverage thresholds met
- [ ] No linting errors
- [ ] Performance benchmarks met
- [ ] Documentation updated

### Before Release
- [ ] Full test suite passes
- [ ] E2E tests on multiple browsers
- [ ] Performance tests under load
- [ ] Security tests completed
- [ ] Accessibility tests passed

## 🔄 Continuous Integration

### GitHub Actions
- **Trigger**: On push/PR
- **Matrix**: Node 18, 20
- **Browsers**: Chrome, Firefox, Safari
- **Coverage**: Upload to Codecov
- **Reports**: Test results and artifacts

### Test Reports
- **Coverage**: HTML and JSON reports
- **Performance**: Lighthouse CI reports
- **E2E**: Screenshots and videos on failure
- **Unit**: Detailed test results

## 📚 Additional Resources

- [Convex Testing Guide](https://docs.convex.dev/testing)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Testing](https://playwright.dev/)
- [Testing Best Practices](https://testing-library.com/docs/guiding-principles)

## 🤝 Contributing

When adding new tests:
1. Follow existing patterns
2. Update this README if needed
3. Ensure proper coverage
4. Add appropriate documentation
5. Test on multiple environments

---

**Last Updated**: $(date)
**Version**: 1.0.0
**Maintainer**: EdCoach AI Development Team
