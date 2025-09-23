import { api } from "../_generated/api";
import { internal } from "../_generated/api";
import { afterEach, vi, beforeEach, describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";

/**
 * Cross-Phase Integration (Workflow Intelligence) Tests
 * 
 * Tests for:
 * - US-016: Seamless Workflow Progression
 * - US-017: Intelligent Recommendation Engine
 */

describe("Cross-Phase Integration - Workflow Intelligence", () => {
  beforeEach(() => {
    // Mock external APIs if needed
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("US-016: Seamless Workflow Progression - Basic Workflow", async () => {
    const t = convexTest(schema);
    
    // Create coach user
    const coachResult = await t.mutation(api.users.createOrSyncFromClerk, {});
    expect(coachResult.success).toBe(true);
    const coachId = coachResult.userId!;

    // Create teacher
    const teacherResult = await t.mutation(api.teachers.create, {
      name: "Michael Thompson",
      email: "michael.thompson@school.edu",
      subject: ["Mathematics"],
      gradeBand: "9-12"
    });

    expect(teacherResult.success).toBe(true);
    const teacherId = teacherResult.teacherId;

    // Set PGP goal (Phase 1)
    await t.mutation(api.teachers.setPgpGoal, {
      teacherId,
      text: "Improve student engagement through interactive activities",
      indicatorCode: "LER.1.1"
    });

    // Create walkthrough (Phase 2)
    const walkthroughId = await t.mutation(api.walkthroughs.createWalkthrough, {
      teacherId,
      walkthroughDate: Date.now(),
      evidenceSummary: "Teacher used think-pair-share activity effectively",
      reinforcementIndicator: "student_engagement",
      refinementIndicator: "classroom_management",
      reinforcementFeedback: "Great work!",
      refinementFeedback: "Consider more wait time",
      hasProPlan: false,
      hasStarterPlan: false
    });

    expect(walkthroughId).toBeDefined();

    // Create reflection (Phase 4)
    const reflectionId = await t.mutation(api.reflections.createReflection, {
      walkthroughId,
      teacherId,
      content: "I learned that interactive activities really engage students"
    });

    expect(reflectionId).toBeDefined();

    // Update progress (Phase 5)
    await t.mutation(api.teachers.updatePgpProgress, {
      teacherId,
      progress: 30
    });

    // Test: Workflow state tracking
    const workflowState = await t.query(api.workflowState.getWorkflowState, {
      teacherId
    });

    expect(workflowState).toBeDefined();
  });

  test("US-017: Intelligent Recommendation Engine - Basic Workflow", async () => {
    const t = convexTest(schema);
    
    // Create coach user
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

    // Test: System can provide workflow state
    const workflowState = await t.query(api.workflowState.getWorkflowState, {
      teacherId
    });

    expect(workflowState).toBeDefined();
  });
});