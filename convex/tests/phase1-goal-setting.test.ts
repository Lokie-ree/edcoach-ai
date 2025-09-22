import { api } from "../_generated/api";
import { internal } from "../_generated/api";
import { afterEach, vi, beforeEach, describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";

/**
 * Phase 1: Set Goal (PGP Goal-Setting System) Tests
 * 
 * Tests for:
 * - US-001: Coach-Initiated PGP Goal Setting
 * - US-002: AI-Assisted Goal Generation
 * - US-003: Teacher Goal Ownership and Progress Tracking
 */

describe("Phase 1: Set Goal - PGP Goal-Setting System", () => {
  beforeEach(() => {
    // Mock external APIs if needed
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("US-001: Coach-Initiated PGP Goal Setting - Basic Workflow", async () => {
    const t = convexTest(schema);
    
    // Create coach user
    const coachResult = await t.mutation(api.users.createOrSyncFromClerk, {});
    expect(coachResult.success).toBe(true);
    expect(coachResult.userId).toBeDefined();
    
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

    // Test: Coach can set PGP goal for teacher
    const pgpResult = await t.mutation(api.teachers.setPgpGoal, {
      teacherId,
      text: "Improve student engagement through interactive activities",
      indicatorCode: "LER.1.1"
    });

    expect(pgpResult).toBeDefined();

    // Test: PGP goal is properly stored
    const pgpGoal = await t.query(api.teachers.getPgpGoal, {
      teacherId
    });

    expect(pgpGoal).toBeDefined();
    expect(pgpGoal?.text).toContain("student engagement");
    expect(pgpGoal?.indicatorCode).toBe("LER.1.1");
  });

  test("US-002: AI-Assisted Goal Generation - Basic Workflow", async () => {
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

    // Test: AI goal generation (mock for now)
    const aiGoals = await t.action(api.teachers.draftPgpGoal, {
      indicatorCode: "LER.1.1",
      teacherName: "Test Teacher",
      subject: ["Mathematics"],
      gradeBand: "9-12",
      indicatorName: "Student Engagement"
    });

    expect(aiGoals).toBeDefined();
  });

  test("US-003: Teacher Goal Ownership and Progress Tracking - Basic Workflow", async () => {
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

    // Test: Teacher can view their PGP goal
    const pgpGoal = await t.query(api.teachers.getPgpGoal, {
      teacherId
    });

    expect(pgpGoal).toBeDefined();
    expect(pgpGoal?.text).toContain("student engagement");

    // Test: Update PGP progress
    const progressResult = await t.mutation(api.teachers.updatePgpProgress, {
      teacherId,
      progress: 30
    });

    expect(progressResult).toBeDefined();
  });
});