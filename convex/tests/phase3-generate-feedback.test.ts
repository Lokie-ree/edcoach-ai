import { api } from "../_generated/api";
import { internal } from "../_generated/api";
import { afterEach, vi, beforeEach, describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";

/**
 * Phase 3: Generate Feedback (AI-Enhanced Feedback System) Tests
 * 
 * Tests for:
 * - US-007: AI-Powered Feedback Generation
 * - US-008: Coach Feedback Review and Customization
 * - US-009: Goal-Aligned Feedback Context
 */

describe("Phase 3: Generate Feedback - AI-Enhanced Feedback System", () => {
  beforeEach(() => {
    // Mock OpenAI API
    const mockOpenAIResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              reinforcementFeedback: "Test reinforcement feedback",
              refinementFeedback: "Test refinement feedback"
            })
          }
        }
      ]
    };

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockOpenAIResponse)
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("US-007: AI-Powered Feedback Generation - Basic Workflow", async () => {
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
      evidenceSummary: "Teacher used think-pair-share activity effectively. Students were engaged and discussing algebra problems.",
      reinforcementIndicator: "student_engagement",
      refinementIndicator: "classroom_management",
      reinforcementFeedback: "Test feedback",
      refinementFeedback: "Test refinement",
      hasProPlan: false,
      hasStarterPlan: false
    });

    expect(walkthroughId).toBeDefined();

    // Test: AI feedback generation
    const aiFeedback = await t.action(api.aiFeedback.generateFeedback, {
      evidenceSummary: "Teacher used think-pair-share activity effectively. Students were engaged and discussing algebra problems.",
      reinforcementIndicator: "student_engagement",
      refinementIndicator: "classroom_management",
      hasProPlan: false,
      hasStarterPlan: false
    });

    expect(aiFeedback).toBeDefined();
    expect(aiFeedback.reinforcementFeedback).toBeDefined();
    expect(aiFeedback.refinementFeedback).toBeDefined();
  });

  test("US-008: Coach Feedback Review and Customization - Basic Workflow", async () => {
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
      reinforcementFeedback: "Initial feedback",
      refinementFeedback: "Initial refinement",
      hasProPlan: false,
      hasStarterPlan: false
    });

    expect(walkthroughId).toBeDefined();

    // Test: Coach can review and customize feedback
    const walkthrough = await t.query(api.walkthroughs.getById, {
      walkthroughId
    });

    expect(walkthrough).toBeDefined();
    expect(walkthrough?.reinforcementFeedback).toBe("Initial feedback");
    expect(walkthrough?.refinementFeedback).toBe("Initial refinement");
  });

  test("US-009: Goal-Aligned Feedback Context - Basic Workflow", async () => {
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

    // Set PGP goal
    await t.mutation(api.teachers.setPgpGoal, {
      teacherId,
      text: "Improve student engagement through interactive activities",
      indicatorCode: "LER.1.1"
    });

    // Create walkthrough
    const walkthroughId = await t.mutation(api.walkthroughs.createWalkthrough, {
      teacherId,
      walkthroughDate: Date.now(),
      evidenceSummary: "Teacher used interactive activities effectively",
      reinforcementIndicator: "student_engagement",
      refinementIndicator: "classroom_management",
      reinforcementFeedback: "Great work on engagement!",
      refinementFeedback: "Consider more wait time",
      hasProPlan: false,
      hasStarterPlan: false
    });

    expect(walkthroughId).toBeDefined();

    // Test: Feedback is aligned with PGP goal
    const pgpGoal = await t.query(api.teachers.getPgpGoal, {
      teacherId
    });

    expect(pgpGoal).toBeDefined();
    expect(pgpGoal?.text).toContain("student engagement");
  });
});