import { api } from "../_generated/api";
import { internal } from "../_generated/api";
import { afterEach, vi, beforeEach, describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";

/**
 * Complete Growth Loop Integration Tests
 * 
 * Tests the complete 5-phase continuous growth loop methodology:
 * 1. Set Goal (PGP Goal-Setting System)
 * 2. Capture Evidence (Classroom Walkthrough System)
 * 3. Generate Feedback (AI-Enhanced Feedback System)
 * 4. Reflect (Teacher Growth Journal System)
 * 5. Monitor Growth (Analytics & Progress Tracking)
 */

describe("Complete Growth Loop Integration", () => {
  beforeEach(() => {
    // Mock external APIs
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

  test("Complete 5-Phase Growth Loop - Basic Workflow", async () => {
    const t = convexTest(schema);
    
    // === PHASE 1: SET GOAL ===
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

    // Set PGP goal
    await t.mutation(api.teachers.setPgpGoal, {
      teacherId,
      text: "Improve student engagement through interactive activities",
      indicatorCode: "LER.1.1"
    });

    // === PHASE 2: CAPTURE EVIDENCE ===
    // Create walkthrough
    const walkthroughId = await t.mutation(api.walkthroughs.createWalkthrough, {
      teacherId,
      walkthroughDate: Date.now(),
      evidenceSummary: "Teacher used think-pair-share activity effectively. Students were engaged and discussing algebra problems.",
      reinforcementIndicator: "student_engagement",
      refinementIndicator: "classroom_management",
      reinforcementFeedback: "Excellent use of collaborative learning strategies!",
      refinementFeedback: "Consider adding more wait time after posing questions.",
      hasProPlan: false,
      hasStarterPlan: false
    });

    expect(walkthroughId).toBeDefined();

    // === PHASE 3: GENERATE FEEDBACK ===
    // Generate AI feedback
    const aiFeedback = await t.action(api.aiFeedback.generateFeedback, {
      evidenceSummary: "Teacher used think-pair-share activity effectively. Students were engaged and discussing algebra problems.",
      reinforcementIndicator: "student_engagement",
      refinementIndicator: "classroom_management",
      hasProPlan: false,
      hasStarterPlan: false
    });

    expect(aiFeedback).toBeDefined();

    // === PHASE 4: REFLECT ===
    // Create reflection
    const reflectionId = await t.mutation(api.reflections.createReflection, {
      walkthroughId,
      teacherId,
      content: "I learned that interactive activities really engage students. I'll continue using them and work on smoother transitions between activities."
    });

    expect(reflectionId).toBeDefined();

    // === PHASE 5: MONITOR GROWTH ===
    // Update PGP progress
    await t.mutation(api.teachers.updatePgpProgress, {
      teacherId,
      progress: 30
    });

    // Test: Verify complete workflow
    const pgpGoal = await t.query(api.teachers.getPgpGoal, {
      teacherId
    });

    expect(pgpGoal).toBeDefined();
    expect(pgpGoal?.text).toContain("student engagement");
  });

  test("Performance: Growth Loop Speed", async () => {
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

    // Test: Complete workflow should be fast
    const startTime = Date.now();
    
    // Set PGP goal
    await t.mutation(api.teachers.setPgpGoal, {
      teacherId,
      text: "Test goal",
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

    // Create reflection
    await t.mutation(api.reflections.createReflection, {
      walkthroughId,
      teacherId,
      content: "Test reflection"
    });

    // Update progress
    await t.mutation(api.teachers.updatePgpProgress, {
      teacherId,
      progress: 20
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(duration).toBeLessThan(10000); // Under 10 seconds for complete workflow
  });
});