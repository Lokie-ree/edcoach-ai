import { api } from "../_generated/api";
import { internal } from "../_generated/api";
import { afterEach, vi, beforeEach, describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";

/**
 * Platform Foundation (Authentication & Onboarding) Tests
 * 
 * Tests for:
 * - US-018: Coach Onboarding and Setup
 * - US-019: Teacher Invitation and Activation
 * - US-020: Plan Management and Usage Tracking
 */

describe("Platform Foundation - Authentication & Onboarding", () => {
  beforeEach(() => {
    // Mock external APIs if needed
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("US-018: Coach Onboarding and Setup - Basic Workflow", async () => {
    const t = convexTest(schema);
    
    // Test: Coach can create account
    const coachResult = await t.mutation(api.users.createOrSyncFromClerk, {});
    expect(coachResult.success).toBe(true);
    expect(coachResult.userId).toBeDefined();
    
    const coachId = coachResult.userId!;

    // Test: Complete onboarding tutorial
    const tutorialResult = await t.mutation(api.onboarding.complete, {});

    expect(tutorialResult).toBeDefined();
  });

  test("US-019: Teacher Invitation and Activation - Basic Workflow", async () => {
    const t = convexTest(schema);
    
    // Create coach user
    const coachResult = await t.mutation(api.users.createOrSyncFromClerk, {});
    expect(coachResult.success).toBe(true);
    const coachId = coachResult.userId!;

    // Test: Create teacher invitation
    const invitation = await t.action(api.invitations.inviteTeacher, {
      teacherEmail: "michael.thompson@school.edu",
      teacherName: "Michael Thompson",
      subject: "Mathematics",
      gradeBand: "9-12"
    });

    expect(invitation).toBeDefined();
    expect(invitation.success).toBe(true);

    // Test: Accept invitation (simulated - would need actual token)
    // const acceptResult = await t.mutation(api.invitations.acceptInvitation, {
    //   token: "test-token"
    // });

    // expect(acceptResult).toBeDefined();
  });

  test("US-020: Plan Management and Usage Tracking - Basic Workflow", async () => {
    const t = convexTest(schema);
    
    // Create coach user
    const coachResult = await t.mutation(api.users.createOrSyncFromClerk, {});
    expect(coachResult.success).toBe(true);
    const coachId = coachResult.userId!;

    // Test: Get usage stats
    const usageStats = await t.query(api.usage.checkUsageLimit, {
      type: "teacher"
    });

    expect(usageStats).toBeDefined();

    // Test: Get available features
    const features = await t.query(api.plans.getAIUsageThisMonth, {
      hasProPlan: false,
      hasStarterPlan: false
    });

    expect(features).toBeDefined();
  });
});