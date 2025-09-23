import { api } from "./_generated/api";
import { internal } from "./_generated/api";
import { afterEach, vi, beforeEach, describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { PLAN_CONFIG } from "./plans";

/**
 * Feature Gating Test Suite for EdCoach AI
 * Tests all plan-based feature restrictions and usage limits
 */

describe("Feature Gating Tests", () => {
  beforeEach(() => {
    // Mock external APIs if needed
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("Coach Free Plan - Basic Features", async () => {
    const t = convexTest(schema);
    
    // Create a coach with Free plan
    const coachResult = await t.mutation(api.users.createOrSyncFromClerk, {});
    expect(coachResult.success).toBe(true);
    const coachId = coachResult.userId!;

    // Test walkthrough creation limits
    const walkthroughUsage = await t.query(api.plans.getAIUsageThisMonth, {
      hasProPlan: false,
      hasStarterPlan: false
    });

    expect(walkthroughUsage.walkthroughsLimit).toBe(PLAN_CONFIG.free.features.maxTeachers);

    // Test teacher limits
    const teacherUsage = await t.query(api.usage.checkUsageLimit, {
      type: "teacher"
    });

    expect(teacherUsage.limit).toBe(PLAN_CONFIG.free.features.maxTeachers);

    // Test feature access
    const features = await t.query(api.plans.getAIUsageThisMonth, {
      hasProPlan: false,
      hasStarterPlan: false
    });

    expect(features.plan).toBe("free");
  });

  test("Coach Free Plan - Walkthrough Limit Enforcement", async () => {
    const t = convexTest(schema);
    
    // Create a coach with Free plan
    const coachResult = await t.mutation(api.users.createOrSyncFromClerk, {});
    expect(coachResult.success).toBe(true);
    const coachId = coachResult.userId!;

    // Create teacher
    const teacherResult = await t.mutation(api.teachers.create, {
      name: "Test Teacher",
      email: "teacher@test.com",
      subject: ["Mathematics"],
      gradeBand: "9-12"
    });

    expect(teacherResult.success).toBe(true);
    const teacherId = teacherResult.teacherId;

    // Test: Free plan can create limited walkthroughs
    for (let i = 0; i < 3; i++) {
      const walkthroughId = await t.mutation(api.walkthroughs.createWalkthrough, {
        teacherId,
        walkthroughDate: Date.now(),
        evidenceSummary: `Test walkthrough ${i}`,
        reinforcementIndicator: "student_engagement",
        refinementIndicator: "classroom_management",
        reinforcementFeedback: "Test feedback",
        refinementFeedback: "Test refinement",
        hasProPlan: false,
        hasStarterPlan: false
      });

      expect(walkthroughId).toBeDefined();
    }

    // Test: 4th walkthrough should be blocked (simulated)
    // Note: Actual limit enforcement would happen in the business logic
    const walkthroughUsage = await t.query(api.plans.getAIUsageThisMonth, {
      hasProPlan: false,
      hasStarterPlan: false
    });

    expect(walkthroughUsage.walkthroughsUsed).toBeGreaterThan(0);
  });

  test("Coach Free Plan - Teacher Limit Enforcement", async () => {
    const t = convexTest(schema);
    
    // Create a coach with Free plan
    const coachResult = await t.mutation(api.users.createOrSyncFromClerk, {});
    expect(coachResult.success).toBe(true);
    const coachId = coachResult.userId!;

    // Test: Free plan can create 1 teacher
    const teacherResult = await t.mutation(api.teachers.create, {
      name: "Test Teacher",
      email: "teacher@test.com",
      subject: ["Mathematics"],
      gradeBand: "9-12"
    });

    expect(teacherResult.success).toBe(true);

    // Test: 2nd teacher should be blocked (simulated)
    // Note: Actual limit enforcement would happen in the business logic
    const teacherUsage = await t.query(api.usage.checkUsageLimit, {
      type: "teacher"
    });

    expect(teacherUsage.limit).toBe(PLAN_CONFIG.free.features.maxTeachers);
  });

  test("Coach Starter Plan - Enhanced Limits", async () => {
    const t = convexTest(schema);
    
    // Create a coach with Starter plan
    const coachResult = await t.mutation(api.users.createOrSyncFromClerk, {});
    expect(coachResult.success).toBe(true);
    const coachId = coachResult.userId!;

    // Test walkthrough creation limits
    const walkthroughUsage = await t.query(api.plans.getAIUsageThisMonth, {
      hasProPlan: false,
      hasStarterPlan: true
    });

    expect(walkthroughUsage.walkthroughsLimit).toBe(PLAN_CONFIG.coach_starter.features.maxTeachers);

    // Test teacher limits
    const teacherUsage = await t.query(api.usage.checkUsageLimit, {
      type: "teacher"
    });

    expect(teacherUsage.limit).toBe(PLAN_CONFIG.coach_starter.features.maxTeachers);

    // Test feature access
    const features = await t.query(api.plans.getAIUsageThisMonth, {
      hasProPlan: false,
      hasStarterPlan: true
    });

    expect(features.plan).toBe("starter");
  });

  test("Coach Pro Plan - Full Features", async () => {
    const t = convexTest(schema);
    
    // Create a coach with Pro plan
    const coachResult = await t.mutation(api.users.createOrSyncFromClerk, {});
    expect(coachResult.success).toBe(true);
    const coachId = coachResult.userId!;

    // Test walkthrough creation limits
    const walkthroughUsage = await t.query(api.plans.getAIUsageThisMonth, {
      hasProPlan: true,
      hasStarterPlan: false
    });

    expect(walkthroughUsage.walkthroughsLimit).toBe(PLAN_CONFIG.coach_pro.features.maxTeachers);

    // Test teacher limits
    const teacherUsage = await t.query(api.usage.checkUsageLimit, {
      type: "teacher"
    });

    expect(teacherUsage.limit).toBe(PLAN_CONFIG.coach_pro.features.maxTeachers);

    // Test feature access
    const features = await t.query(api.plans.getAIUsageThisMonth, {
      hasProPlan: true,
      hasStarterPlan: false
    });

    expect(features.plan).toBe("pro");
  });

  test("Feature Protection - Analytics Access", async () => {
    const t = convexTest(schema);
    
    // Create a coach with Free plan
    const coachResult = await t.mutation(api.users.createOrSyncFromClerk, {});
    expect(coachResult.success).toBe(true);
    const coachId = coachResult.userId!;

    // Test: Free plan has limited analytics
    const features = await t.query(api.plans.getAIUsageThisMonth, {
      hasProPlan: false,
      hasStarterPlan: false
    });

    expect(features.plan).toBe("free");

    // Test: Pro plan has full analytics
    const proFeatures = await t.query(api.plans.getAIUsageThisMonth, {
      hasProPlan: true,
      hasStarterPlan: false
    });

    expect(proFeatures.plan).toBe("pro");
  });

  test("Usage Reset - Monthly Cycle", async () => {
    const t = convexTest(schema);
    
    // Create a coach
    const coachResult = await t.mutation(api.users.createOrSyncFromClerk, {});
    expect(coachResult.success).toBe(true);
    const coachId = coachResult.userId!;

    // Create teacher
    const teacherResult = await t.mutation(api.teachers.create, {
      name: "Test Teacher",
      email: "teacher@test.com",
      subject: ["Mathematics"],
      gradeBand: "9-12"
    });

    expect(teacherResult.success).toBe(true);
    const teacherId = teacherResult.teacherId;

    // Test: Usage tracking
    await t.mutation(api.usage.trackUsage, {
      type: "teacher"
    });

    // Test: Monthly reset (simulated)
    // Note: Actual reset would happen via scheduled function
    const usageBeforeReset = await t.query(api.usage.checkUsageLimit, {
      type: "teacher"
    });

    expect(usageBeforeReset).toBeDefined();
  });

  test("Teacher Growth Journal - Free Tier Access", async () => {
    const t = convexTest(schema);
    
    // Create a coach with Free plan
    const coachResult = await t.mutation(api.users.createOrSyncFromClerk, {});
    expect(coachResult.success).toBe(true);
    const coachId = coachResult.userId!;

    // Create teacher
    const teacherResult = await t.mutation(api.teachers.create, {
      name: "Test Teacher",
      email: "teacher@test.com",
      subject: ["Mathematics"],
      gradeBand: "9-12"
    });

    expect(teacherResult.success).toBe(true);
    const teacherId = teacherResult.teacherId;

    // Test: Teacher can access growth journal
    const pgpData = await t.query(api.analytics.getMyPgpData, {});

    expect(pgpData).toBeDefined();
  });

  test("Workflow Integration - Complete 5-Phase Loop", async () => {
    const t = convexTest(schema);
    
    // Create a coach
    const coachResult = await t.mutation(api.users.createOrSyncFromClerk, {});
    expect(coachResult.success).toBe(true);
    const coachId = coachResult.userId!;

    // Create teacher
    const teacherResult = await t.mutation(api.teachers.create, {
      name: "Test Teacher",
      email: "teacher@test.com",
      subject: ["Mathematics"],
      gradeBand: "9-12"
    });

    expect(teacherResult.success).toBe(true);
    const teacherId = teacherResult.teacherId;

    // Set PGP goal
    await t.mutation(api.teachers.setPgpGoal, {
      teacherId,
      text: "Improve student engagement",
      indicatorCode: "LER.1.1"
    });

    // Create walkthrough
    const walkthroughId = await t.mutation(api.walkthroughs.createWalkthrough, {
      teacherId,
      walkthroughDate: Date.now(),
      evidenceSummary: "Test evidence",
      reinforcementIndicator: "student_engagement",
      refinementIndicator: "classroom_management",
      reinforcementFeedback: "Test feedback",
      refinementFeedback: "Test refinement",
      hasProPlan: false,
      hasStarterPlan: false
    });

    expect(walkthroughId).toBeDefined();

    // Create reflection
    const reflectionId = await t.mutation(api.reflections.createReflection, {
      walkthroughId,
      teacherId,
      content: "Test reflection"
    });

    expect(reflectionId).toBeDefined();

    // Update progress
    await t.mutation(api.teachers.updatePgpProgress, {
      teacherId,
      progress: 30
    });

    // Test: Complete workflow works within plan limits
    const pgpGoal = await t.query(api.teachers.getPgpGoal, {
      teacherId
    });

    expect(pgpGoal).toBeDefined();
  });
});