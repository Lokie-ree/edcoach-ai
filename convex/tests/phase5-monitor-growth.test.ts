import { api } from "../_generated/api";
import { internal } from "../_generated/api";
import { afterEach, vi, beforeEach, describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";

/**
 * Phase 5: Monitor Growth (Analytics & Progress Tracking) Tests
 * 
 * Tests for:
 * - US-013: Coach Analytics Dashboard
 * - US-014: Teacher Growth Visualization
 * - US-015: Real-Time Activity Monitoring
 */

describe("Phase 5: Monitor Growth - Analytics & Progress Tracking", () => {
  beforeEach(() => {
    // Mock external APIs if needed
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("US-013: Coach Analytics Dashboard - Basic Workflow", async () => {
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
      evidenceSummary: "Teacher used interactive activities effectively",
      reinforcementIndicator: "student_engagement",
      refinementIndicator: "classroom_management",
      reinforcementFeedback: "Great work!",
      refinementFeedback: "Consider more wait time",
      hasProPlan: false,
      hasStarterPlan: false
    });

    expect(walkthroughId).toBeDefined();

    // Test: Coach analytics dashboard
    const analytics = await t.query(api.analytics.getCoachAnalytics, {});

    expect(analytics).toBeDefined();
  });

  test("US-014: Teacher Growth Visualization - Basic Workflow", async () => {
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

    // Update progress
    await t.mutation(api.teachers.updatePgpProgress, {
      teacherId,
      progress: 30
    });

    // Test: Teacher growth visualization
    const pgpData = await t.query(api.analytics.getMyPgpData, {});

    expect(pgpData).toBeDefined();
    expect(pgpData.pgpGoal).toBeDefined();
  });

  test("US-015: Real-Time Activity Monitoring - Basic Workflow", async () => {
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

    // Test: Activity feed
    const analytics = await t.query(api.analytics.getCoachAnalytics, {});

    expect(analytics).toBeDefined();
  });
});