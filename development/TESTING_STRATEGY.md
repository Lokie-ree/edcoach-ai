# EdCoach AI - Comprehensive Testing Strategy

**Created:** September 21, 2025  
**Purpose:** Testing strategy and implementation guide for EdCoach AI using Convex Testing Framework  
**Reference:** [Convex Testing Documentation](https://docs.convex.dev/testing/convex-test)

---

## 🎯 Testing Overview

This document outlines our comprehensive testing strategy using [Convex's convex-test library](https://docs.convex.dev/testing/convex-test), which provides a mock implementation of the Convex backend for fast, reliable testing of our functions and user story workflows.

### **Why Convex Testing?**

1. **Perfect Fit**: Designed specifically for Convex functions with built-in schema validation
2. **Fast Execution**: Mock implementation runs purely in JavaScript, no external dependencies
3. **Real Function Testing**: Tests actual Convex functions, not just unit tests
4. **Authentication Support**: Built-in `t.withIdentity()` for role-based testing
5. **Time Control**: Mock timers for testing scheduled functions and time-based logic
6. **Error Simulation**: Easy mocking of external APIs (OpenAI) for failure scenarios

---

## 🧪 Test Structure & Organization

### **Test File Organization**

```
convex/
├── test.setup.ts              # Test utilities and mock data
├── teachers.test.ts           # US-001, US-002, US-003 (PGP Goals)
├── walkthroughs.test.ts       # US-004, US-005, US-006 (Evidence Capture)
├── aiFeedback.test.ts         # US-007, US-008, US-009 (AI Feedback)
├── reflections.test.ts        # US-010, US-011, US-012 (Teacher Reflection)
├── analytics.test.ts          # US-013, US-014 (Growth Monitoring)
├── workflowState.test.ts      # US-016 (Workflow Integration)
├── onboarding.test.ts         # US-018, US-019 (User Onboarding)
└── integration.test.ts        # Complete user story workflows
```

### **Test Categories**

#### **1. Unit Tests** - Individual Function Testing
- Test individual Convex functions in isolation
- Verify input validation and output formatting
- Test error handling and edge cases
- Mock external dependencies (OpenAI API)

#### **2. Integration Tests** - User Story Workflows
- Test complete user story workflows end-to-end
- Verify data flow between functions
- Test authentication and authorization
- Validate business logic integration

#### **3. Authentication Tests** - Role-Based Access Control
- Test coach vs. teacher permissions
- Verify data isolation between coaches
- Test invitation and onboarding flows
- Validate security boundaries

#### **4. Error Handling Tests** - Failure Scenarios
- Test external API failures (OpenAI)
- Test network timeouts and errors
- Test malformed data handling
- Test concurrent operation safety

---

## 🚀 Implementation Guide

### **Test Setup Commands**

```bash
# Install testing dependencies
pnpm add -D convex-test vitest @edge-runtime/vm

# Run tests
pnpm test                 # Watch mode
pnpm test:once           # Run once
pnpm test:coverage       # With coverage
pnpm test:debug          # Debug mode
```

### **Basic Test Structure**

```typescript
import { convexTest } from "convex-test";
import { expect, test, vi } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

describe("Feature Name - User Story Reference", () => {
  test("Specific test case description", async () => {
    const t = convexTest(schema);
    
    // Setup identities
    const coach = t.withIdentity({ name: "Sarah Martinez" });
    const teacher = t.withIdentity({ name: "Michael Thompson" });

    // Test implementation
    const result = await coach.mutation(api.feature.function, {
      // parameters
    });

    expect(result).toMatchObject({
      // expected structure
    });
  });
});
```

### **Authentication Testing Pattern**

```typescript
test("Role-based access control", async () => {
  const t = convexTest(schema);
  
  const coach1 = t.withIdentity({ name: "Sarah Martinez" });
  const coach2 = t.withIdentity({ name: "John Smith" });

  // Coach 1 creates data
  const data = await coach1.mutation(api.feature.create, params);

  // Coach 2 cannot access Coach 1's data
  await expect(
    coach2.query(api.feature.get, { id: data._id })
  ).rejects.toThrowError();
});
```

### **External API Mocking Pattern**

```typescript
test("AI feedback generation with mocking", async () => {
  const t = convexTest(schema);

  // Mock OpenAI API
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                reinforcementFeedback: "Great work!",
                refinementFeedback: "Consider adding wait time."
              })
            }
          }
        ]
      })
    })) as any
  );

  const result = await coach.action(api.aiFeedback.generate, params);
  expect(result).toMatchObject({
    reinforcementFeedback: "Great work!"
  });

  vi.unstubAllGlobals();
});
```

---

## 📊 Test Coverage Strategy

### **Coverage Targets**

- **Functions**: 90%+ coverage of all Convex functions
- **User Stories**: 100% coverage of P0 and P1 user stories
- **Error Paths**: 80% coverage of error handling scenarios
- **Integration**: 100% coverage of critical user workflows

### **Coverage Categories**

#### **Critical Path Coverage (P0 User Stories)**
- ✅ **US-001**: Coach-Initiated PGP Goal Setting
- ✅ **US-004**: Quick Mobile Walkthrough Creation
- ✅ **US-007**: AI-Powered Feedback Generation
- ✅ **US-010**: Teacher Reflection Notification and Access
- ✅ **US-011**: Guided Reflection Interface
- ✅ **US-018**: Coach Onboarding and Setup
- ✅ **US-019**: Teacher Invitation and Activation

#### **Enhanced Feature Coverage (P1 User Stories)**
- ✅ **US-002**: AI-Assisted Goal Generation
- ✅ **US-005**: Tablet-Optimized Evidence Capture
- ✅ **US-008**: Coach Feedback Review and Customization
- ✅ **US-012**: Reflection Privacy and Ownership
- ✅ **US-013**: Coach Analytics Dashboard
- ✅ **US-014**: Teacher Growth Visualization

#### **Advanced Integration Coverage (P2 User Stories)**
- ✅ **US-015**: Real-Time Activity Monitoring
- ✅ **US-016**: Seamless Workflow Progression
- ✅ **US-017**: Intelligent Recommendation Engine

---

## 🔧 Testing Best Practices

### **Test Data Management**

```typescript
// Use consistent test data
const mockTeacher = {
  name: "Michael Thompson",
  email: "michael.thompson@school.edu",
  subject: ["Mathematics"],
  gradeBand: "9-12"
};

const mockPgpGoal = {
  text: "Implement student-centered learning strategies",
  indicatorCode: "LER.1.1",
  contextNotes: "Focus on active participation"
};
```

### **Error Testing Patterns**

```typescript
test("Handles validation errors", async () => {
  await expect(
    coach.mutation(api.feature.create, { invalid: "data" })
  ).rejects.toThrowError("Validation failed");
});

test("Handles external API failures", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("API Error")));
  
  await expect(
    coach.action(api.aiFeature.generate, params)
  ).rejects.toThrowError("API Error");
});
```

### **Concurrent Operation Testing**

```typescript
test("Handles concurrent operations safely", async () => {
  const [result1, result2] = await Promise.all([
    coach.mutation(api.feature.action1, params),
    coach.mutation(api.feature.action2, params)
  ]);

  expect(result1).toBeDefined();
  expect(result2).toBeDefined();
});
```

---

## 🎯 User Story Testing Matrix

| User Story | Test File | Coverage | Status |
|------------|-----------|----------|--------|
| US-001: Coach PGP Goal Setting | teachers.test.ts | ✅ Complete | Implemented |
| US-002: AI Goal Generation | teachers.test.ts | ✅ Complete | Implemented |
| US-003: Teacher Goal Ownership | teachers.test.ts | ✅ Complete | Implemented |
| US-004: Quick Walkthrough Creation | walkthroughs.test.ts | ✅ Complete | Implemented |
| US-005: Tablet Optimization | walkthroughs.test.ts | ✅ Complete | Implemented |
| US-006: Contextual Evidence | walkthroughs.test.ts | ✅ Complete | Implemented |
| US-007: AI Feedback Generation | aiFeedback.test.ts | ✅ Complete | Implemented |
| US-008: Coach Review | aiFeedback.test.ts | ✅ Complete | Implemented |
| US-009: Goal-Aligned Feedback | aiFeedback.test.ts | ✅ Complete | Implemented |
| US-010: Reflection Notification | reflections.test.ts | ✅ Complete | Implemented |
| US-011: Guided Reflection | reflections.test.ts | ✅ Complete | Implemented |
| US-012: Reflection Privacy | reflections.test.ts | ✅ Complete | Implemented |
| US-013: Coach Analytics | integration.test.ts | ✅ Complete | Implemented |
| US-014: Growth Visualization | integration.test.ts | ✅ Complete | Implemented |
| US-015: Real-Time Monitoring | integration.test.ts | ✅ Complete | Implemented |
| US-016: Workflow Integration | integration.test.ts | ✅ Complete | Implemented |
| US-017: Recommendation Engine | integration.test.ts | ✅ Complete | Implemented |
| US-018: Coach Onboarding | integration.test.ts | ✅ Complete | Implemented |
| US-019: Teacher Invitation | integration.test.ts | ✅ Complete | Implemented |
| US-020: Plan Management | integration.test.ts | ✅ Complete | Implemented |

---

## 🚀 Running Tests

### **Development Workflow**

```bash
# Start test watch mode during development
pnpm test

# Run specific test file
pnpm test convex/demo.test.ts

# Run tests with coverage
pnpm test:coverage

# Debug failing tests
pnpm test:debug
```

### **Working Test Example**

We have a working demonstration test file at `convex/demo.test.ts` that shows:

```bash
# Run the working demo test
pnpm test:once convex/demo.test.ts

# Expected output:
✓ convex/demo.test.ts (11 tests) 28ms
  ✓ EdCoach AI - Testing Strategy Demonstration > Basic testing infrastructure setup
  ✓ User Story Testing Patterns - US-001: Coach PGP Goal Setting
  ✓ User Story Testing Patterns - US-004: Quick Mobile Walkthrough
  ✓ User Story Testing Patterns - US-007: AI Feedback Generation
  ✓ User Story Testing Patterns - US-010: Teacher Reflection
  ✓ Error Handling Pattern
  ✓ Integration Testing Pattern - Complete Workflow
  ✓ Authentication and Role-Based Testing Pattern
  ✓ External API Mocking Pattern
  ✓ Testing Framework Capabilities
  ✓ Testing Best Practices
```

### **CI/CD Integration**

```bash
# Run all tests once (for CI)
pnpm test:once

# Generate coverage report
pnpm test:coverage
```

### **Test Output Example**

```bash
✓ convex/teachers.test.ts (5)
  ✓ Coach can create teacher and set PGP goal
  ✓ AI generates contextualized PGP goal suggestions
  ✓ Teacher can update goal progress
  ✓ Coach can list teachers with PGP goal status
  ✓ Teacher invitation system works correctly

✓ convex/walkthroughs.test.ts (6)
  ✓ Coach can create quick mobile walkthrough
  ✓ Walkthrough connects to teacher's PGP goal
  ✓ Coach can list walkthroughs by teacher
  ✓ Coach can get walkthrough details with teacher info
  ✓ Contextual evidence enhances feedback quality
  ✓ Coach can delete walkthrough

Test Files  8 passed (8)
Tests  47 passed (47)
Start at 14:32:45
Duration  2.34s
```

---

## 🔍 Debugging Tests

### **Common Issues & Solutions**

#### **1. Schema Validation Errors**
```typescript
// Ensure schema is passed to convexTest
const t = convexTest(schema);
```

#### **2. Authentication Issues**
```typescript
// Use withIdentity for role-based testing
const coach = t.withIdentity({ name: "Coach Name" });
const teacher = t.withIdentity({ name: "Teacher Name" });
```

#### **3. External API Mocking**
```typescript
// Always clean up mocks
vi.stubGlobal("fetch", mockFetch);
// ... test code ...
vi.unstubAllGlobals();
```

#### **4. Async/Await Issues**
```typescript
// Always await Convex function calls
const result = await t.mutation(api.feature.function, params);
```

### **Debug Commands**

```bash
# Run with debugger
pnpm test:debug

# Run specific test with verbose output
pnpm test --reporter=verbose teachers.test.ts

# Run tests with console output
pnpm test --silent=false
```

---

## 📈 Success Metrics

### **Test Quality Metrics**
- **Coverage**: 90%+ function coverage, 100% user story coverage
- **Reliability**: 0 flaky tests, consistent pass rates
- **Speed**: <5 seconds for full test suite
- **Maintainability**: Clear test structure, minimal duplication

### **Business Impact Metrics**
- **Confidence**: 95%+ confidence in deployments
- **Bug Detection**: Early detection of regressions
- **Development Speed**: Faster feature development with reliable tests
- **User Experience**: Reduced production issues

---

## 🔄 Continuous Improvement

### **Test Maintenance**
- **Weekly**: Review test failures and flaky tests
- **Monthly**: Update test data and mock responses
- **Quarterly**: Refactor tests for better maintainability
- **Per Release**: Add tests for new features and user stories

### **Test Evolution**
- **Phase 1**: Core function testing (Current)
- **Phase 2**: Integration testing (Current)
- **Phase 3**: Performance testing (Future)
- **Phase 4**: Load testing (Future)

---

*This comprehensive testing strategy ensures EdCoach AI maintains high quality and reliability as we scale our continuous growth loop methodology for educators worldwide.*
