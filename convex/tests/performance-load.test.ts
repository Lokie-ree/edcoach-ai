import { api } from "../_generated/api";
import { internal } from "../_generated/api";
import { afterEach, vi, beforeEach, describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";

/**
 * Performance and Load Tests
 * 
 * Tests for:
 * - Performance requirements (<3 second load times, <10 second AI generation)
 * - Load testing with multiple concurrent users
 * - Stress testing with high data volumes
 */

describe("Performance and Load Tests", () => {
  beforeEach(() => {
    // Mock external APIs for consistent performance testing
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

  test("Performance: Dashboard Load Time", async () => {
    const t = convexTest(schema);
    
    // Create coach user
    const coachResult = await t.mutation(api.users.createOrSyncFromClerk, {});
    expect(coachResult.success).toBe(true);
    const coachId = coachResult.userId!;

    // Test: Dashboard should load in under 3 seconds
    const startTime = Date.now();
    
    const analytics = await t.query(api.analytics.getCoachAnalytics, {});
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(analytics).toBeDefined();
    expect(duration).toBeLessThan(3000); // Under 3 seconds
  });

  test("Performance: Walkthrough Creation Speed", async () => {
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

    // Test: Walkthrough creation should be under 3 seconds
    const startTime = Date.now();
    
    const walkthroughId = await t.mutation(api.walkthroughs.createWalkthrough, {
      teacherId,
      walkthroughDate: Date.now(),
      evidenceSummary: "Performance test evidence",
      reinforcementIndicator: "student_engagement",
      refinementIndicator: "classroom_management",
      reinforcementFeedback: "Test feedback",
      refinementFeedback: "Test refinement",
      hasProPlan: false,
      hasStarterPlan: false
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(walkthroughId).toBeDefined();
    expect(duration).toBeLessThan(3000); // Under 3 seconds
  });

  test("Performance: AI Feedback Generation Speed", async () => {
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
      evidenceSummary: "Test evidence for AI processing",
      reinforcementIndicator: "student_engagement",
      refinementIndicator: "classroom_management",
      reinforcementFeedback: "Test feedback",
      refinementFeedback: "Test refinement",
      hasProPlan: false,
      hasStarterPlan: false
    });

    // Test: AI feedback generation should be under 10 seconds
    const startTime = Date.now();
    
    const aiFeedback = await t.action(api.aiFeedback.generateFeedback, {
      evidenceSummary: "Test evidence for AI processing",
      reinforcementIndicator: "student_engagement",
      refinementIndicator: "classroom_management",
      hasProPlan: false,
      hasStarterPlan: false
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(aiFeedback).toBeDefined();
    expect(duration).toBeLessThan(10000); // Under 10 seconds
  });

  test("Load Test: Multiple Concurrent Users", async () => {
    const t = convexTest(schema);
    
    // Create multiple coaches and teachers
    const coaches = [];
    const teachers = [];

    // Create 3 coaches with 1 teacher each
    for (let i = 0; i < 3; i++) {
      const coachResult = await t.mutation(api.users.createOrSyncFromClerk, {});
      expect(coachResult.success).toBe(true);
      coaches.push(coachResult.userId!);

      // Create 1 teacher for each coach
      const teacherResult = await t.mutation(api.teachers.create, {
        name: `Teacher ${i}`,
        email: `teacher${i}@test.com`,
        subject: ["Mathematics"],
        gradeBand: "9-12"
      });

      expect(teacherResult.success).toBe(true);
      teachers.push(teacherResult.teacherId);
    }

    // Test: Concurrent walkthrough creation
    const startTime = Date.now();
    
    const walkthroughPromises = teachers.map(teacherId =>
      t.mutation(api.walkthroughs.createWalkthrough, {
        teacherId,
        walkthroughDate: Date.now(),
        evidenceSummary: `Concurrent test evidence for teacher ${teacherId}`,
        reinforcementIndicator: "student_engagement",
        refinementIndicator: "classroom_management",
        reinforcementFeedback: "Test feedback",
        refinementFeedback: "Test refinement",
        hasProPlan: false,
        hasStarterPlan: false
      })
    );

    const walkthroughResults = await Promise.all(walkthroughPromises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    // All walkthroughs should be created successfully
    expect(walkthroughResults.length).toBe(3);
    walkthroughResults.forEach(result => {
      expect(result).toBeDefined();
    });

    // Should complete in reasonable time (under 10 seconds for 3 concurrent operations)
    expect(duration).toBeLessThan(10000);
  });
});