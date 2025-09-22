import { api } from "../_generated/api";
import { internal } from "../_generated/api";
import { afterEach, vi, beforeEach, describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";

/**
 * Phase 4: Reflect (Teacher Growth Journal System) Tests
 * 
 * Tests for:
 * - US-010: Teacher Reflection Notification and Access
 * - US-011: Guided Reflection Interface
 * - US-012: Reflection Privacy and Ownership
 */

describe("Phase 4: Reflect - Teacher Growth Journal System", () => {
  beforeEach(() => {
    // Mock external APIs if needed
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("US-010: Teacher Reflection Notification and Access - Basic Workflow", async () => {
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

    // Create walkthrough
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

    // Test: Teacher can access reflection interface
    const reflection = await t.query(api.reflections.getReflectionByWalkthrough, {
      walkthroughId
    });

    expect(reflection).toBeDefined();
  });

  test("US-011: Guided Reflection Interface - Basic Workflow", async () => {
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

    // Test: Teacher can create reflection
    const reflectionId = await t.mutation(api.reflections.createReflection, {
      walkthroughId,
      teacherId,
      content: "I learned that interactive activities really engage students. I'll continue using them and work on smoother transitions."
    });

    expect(reflectionId).toBeDefined();
  });

  test("US-012: Reflection Privacy and Ownership - Basic Workflow", async () => {
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
      content: "Private reflection content"
    });

    expect(reflectionId).toBeDefined();

    // Test: Reflection privacy info
    const reflection = await t.query(api.reflections.getReflectionByWalkthrough, {
      walkthroughId
    });

    expect(reflection).toBeDefined();
  });
});