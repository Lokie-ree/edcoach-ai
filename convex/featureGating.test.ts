import { test, expect } from "convex/test";
import { api } from "./_generated/api";
import { internal } from "./_generated/api";
import { PLAN_CONFIG } from "./plans";

// Feature Gating Test Suite for EdCoach AI
// Tests all plan-based feature restrictions and usage limits

test("Coach Free Plan - Basic Features", async (ctx) => {
  // Create a coach with Free plan
  const coachId = await ctx.runMutation(internal.users.createUser, {
    email: "coach@test.com",
    name: "Test Coach",
    role: "coach",
    plan: "free"
  });

  // Test walkthrough creation limits
  const walkthroughUsage = await ctx.runQuery(api.plans.getAIUsageThisMonth, {
    hasProPlan: false,
    hasStarterPlan: false
  });

  expect(walkthroughUsage.walkthroughsLimit).toBe(PLAN_CONFIG.free.walkthroughsPerMonth);
  expect(walkthroughUsage.walkthroughsUsed).toBe(0);
  expect(walkthroughUsage.isOverLimit).toBe(false);

  // Test teacher invitation limits
  const teacherUsage = await ctx.runQuery(api.plans.getTeacherUsage, {
    hasProPlan: false,
    hasStarterPlan: false
  });

  expect(teacherUsage.teacherLimit).toBe(PLAN_CONFIG.free.teachersMax);
  expect(teacherUsage.teacherCount).toBe(0);
  expect(teacherUsage.isOverLimit).toBe(false);

  // Test feature access
  const features = await ctx.runQuery(api.plans.getAvailableFeatures, {
    hasProPlan: false,
    hasStarterPlan: false
  });

  expect(features.enhancedAnalytics).toBe(false);
  expect(features.exportCapabilities).toBe(false);
  expect(features.prioritySupport).toBe(false);
  expect(features.earlyAccess).toBe(false);
});

test("Coach Free Plan - Walkthrough Limit Enforcement", async (ctx) => {
  const coachId = await ctx.runMutation(internal.users.createUser, {
    email: "coach@test.com",
    name: "Test Coach",
    role: "coach",
    plan: "free"
  });

  // Create a teacher
  const teacherId = await ctx.runMutation(internal.teachers.createTeacher, {
    coachId,
    email: "teacher@test.com",
    name: "Test Teacher"
  });

  // Create 3 walkthroughs (Free plan limit)
  for (let i = 0; i < 3; i++) {
    await ctx.runMutation(api.walkthroughs.createWalkthrough, {
      teacherId,
      walkthroughDate: Date.now(),
      evidenceSummary: `Test evidence ${i}`,
      reinforcementIndicator: "classroom_management",
      refinementIndicator: "student_engagement",
      reinforcementFeedback: `Reinforcement feedback ${i}`,
      refinementFeedback: `Refinement feedback ${i}`,
      hasProPlan: false,
      hasStarterPlan: false
    });
  }

  // Check usage after 3 walkthroughs
  const usage = await ctx.runQuery(api.plans.getAIUsageThisMonth, {
    hasProPlan: false,
    hasStarterPlan: false
  });

  expect(usage.walkthroughsUsed).toBe(3);
  expect(usage.isOverLimit).toBe(true);

  // Attempt to create 4th walkthrough should fail
  await expect(
    ctx.runMutation(api.walkthroughs.createWalkthrough, {
      teacherId,
      walkthroughDate: Date.now(),
      evidenceSummary: "Test evidence 4",
      reinforcementIndicator: "classroom_management",
      refinementIndicator: "student_engagement",
      reinforcementFeedback: "Reinforcement feedback 4",
      refinementFeedback: "Refinement feedback 4",
      hasProPlan: false,
      hasStarterPlan: false
    })
  ).rejects.toThrow("Walkthrough limit reached");
});

test("Coach Free Plan - Teacher Limit Enforcement", async (ctx) => {
  const coachId = await ctx.runMutation(internal.users.createUser, {
    email: "coach@test.com",
    name: "Test Coach",
    role: "coach",
    plan: "free"
  });

  // Create 1 teacher (Free plan limit)
  await ctx.runMutation(internal.teachers.createTeacher, {
    coachId,
    email: "teacher1@test.com",
    name: "Test Teacher 1"
  });

  // Check usage after 1 teacher
  const usage = await ctx.runQuery(api.plans.getTeacherUsage, {
    hasProPlan: false,
    hasStarterPlan: false
  });

  expect(usage.teacherCount).toBe(1);
  expect(usage.isOverLimit).toBe(true);

  // Attempt to create 2nd teacher should fail
  await expect(
    ctx.runMutation(internal.teachers.createTeacher, {
      coachId,
      email: "teacher2@test.com",
      name: "Test Teacher 2"
    })
  ).rejects.toThrow("Teacher limit reached");
});

test("Coach Starter Plan - Enhanced Limits", async (ctx) => {
  const coachId = await ctx.runMutation(internal.users.createUser, {
    email: "coach@test.com",
    name: "Test Coach",
    role: "coach",
    plan: "coach_starter"
  });

  // Test walkthrough limits
  const walkthroughUsage = await ctx.runQuery(api.plans.getAIUsageThisMonth, {
    hasProPlan: false,
    hasStarterPlan: true
  });

  expect(walkthroughUsage.walkthroughsLimit).toBe(PLAN_CONFIG.coach_starter.walkthroughsPerMonth);
  expect(walkthroughUsage.walkthroughsUsed).toBe(0);
  expect(walkthroughUsage.isOverLimit).toBe(false);

  // Test teacher limits
  const teacherUsage = await ctx.runQuery(api.plans.getTeacherUsage, {
    hasProPlan: false,
    hasStarterPlan: true
  });

  expect(teacherUsage.teacherLimit).toBe(PLAN_CONFIG.coach_starter.teachersMax);
  expect(teacherUsage.teacherCount).toBe(0);
  expect(teacherUsage.isOverLimit).toBe(false);

  // Test feature access
  const features = await ctx.runQuery(api.plans.getAvailableFeatures, {
    hasProPlan: false,
    hasStarterPlan: true
  });

  expect(features.enhancedAnalytics).toBe(false);
  expect(features.exportCapabilities).toBe(false);
  expect(features.prioritySupport).toBe(false);
  expect(features.earlyAccess).toBe(false);
});

test("Coach Pro Plan - Full Features", async (ctx) => {
  const coachId = await ctx.runMutation(internal.users.createUser, {
    email: "coach@test.com",
    name: "Test Coach",
    role: "coach",
    plan: "coach_pro"
  });

  // Test walkthrough limits
  const walkthroughUsage = await ctx.runQuery(api.plans.getAIUsageThisMonth, {
    hasProPlan: true,
    hasStarterPlan: false
  });

  expect(walkthroughUsage.walkthroughsLimit).toBe(PLAN_CONFIG.coach_pro.walkthroughsPerMonth);
  expect(walkthroughUsage.walkthroughsUsed).toBe(0);
  expect(walkthroughUsage.isOverLimit).toBe(false);

  // Test teacher limits
  const teacherUsage = await ctx.runQuery(api.plans.getTeacherUsage, {
    hasProPlan: true,
    hasStarterPlan: false
  });

  expect(teacherUsage.teacherLimit).toBe(PLAN_CONFIG.coach_pro.teachersMax);
  expect(teacherUsage.teacherCount).toBe(0);
  expect(teacherUsage.isOverLimit).toBe(false);

  // Test feature access
  const features = await ctx.runQuery(api.plans.getAvailableFeatures, {
    hasProPlan: true,
    hasStarterPlan: false
  });

  expect(features.enhancedAnalytics).toBe(true);
  expect(features.exportCapabilities).toBe(true);
  expect(features.prioritySupport).toBe(true);
  expect(features.earlyAccess).toBe(true);
});

test("Feature Protection - Analytics Access", async (ctx) => {
  const coachId = await ctx.runMutation(internal.users.createUser, {
    email: "coach@test.com",
    name: "Test Coach",
    role: "coach",
    plan: "free"
  });

  // Free plan should not have access to enhanced analytics
  const features = await ctx.runQuery(api.plans.getAvailableFeatures, {
    hasProPlan: false,
    hasStarterPlan: false
  });

  expect(features.enhancedAnalytics).toBe(false);

  // Upgrade to Pro
  await ctx.runMutation(internal.users.updateUser, {
    userId: coachId,
    updates: { plan: "coach_pro" }
  });

  // Pro plan should have access to enhanced analytics
  const proFeatures = await ctx.runQuery(api.plans.getAvailableFeatures, {
    hasProPlan: true,
    hasStarterPlan: false
  });

  expect(proFeatures.enhancedAnalytics).toBe(true);
});

test("Usage Reset - Monthly Cycle", async (ctx) => {
  const coachId = await ctx.runMutation(internal.users.createUser, {
    email: "coach@test.com",
    name: "Test Coach",
    role: "coach",
    plan: "free"
  });

  // Create a teacher
  const teacherId = await ctx.runMutation(internal.teachers.createTeacher, {
    coachId,
    email: "teacher@test.com",
    name: "Test Teacher"
  });

  // Create 3 walkthroughs (Free plan limit)
  for (let i = 0; i < 3; i++) {
    await ctx.runMutation(api.walkthroughs.createWalkthrough, {
      teacherId,
      walkthroughDate: Date.now(),
      evidenceSummary: `Test evidence ${i}`,
      reinforcementIndicator: "classroom_management",
      refinementIndicator: "student_engagement",
      reinforcementFeedback: `Reinforcement feedback ${i}`,
      refinementFeedback: `Refinement feedback ${i}`,
      hasProPlan: false,
      hasStarterPlan: false
    });
  }

  // Verify limit reached
  let usage = await ctx.runQuery(api.plans.getAIUsageThisMonth, {
    hasProPlan: false,
    hasStarterPlan: false
  });

  expect(usage.walkthroughsUsed).toBe(3);
  expect(usage.isOverLimit).toBe(true);

  // Simulate monthly reset (this would be handled by a cron job in production)
  await ctx.runMutation(internal.usage.resetMonthlyUsage);

  // Verify usage reset
  usage = await ctx.runQuery(api.plans.getAIUsageThisMonth, {
    hasProPlan: false,
    hasStarterPlan: false
  });

  expect(usage.walkthroughsUsed).toBe(0);
  expect(usage.isOverLimit).toBe(false);
});

test("Teacher Growth Journal - Free Tier Access", async (ctx) => {
  const coachId = await ctx.runMutation(internal.users.createUser, {
    email: "coach@test.com",
    name: "Test Coach",
    role: "coach",
    plan: "free"
  });

  const teacherId = await ctx.runMutation(internal.teachers.createTeacher, {
    coachId,
    email: "teacher@test.com",
    name: "Test Teacher"
  });

  // Create a walkthrough
  const walkthroughId = await ctx.runMutation(api.walkthroughs.createWalkthrough, {
    teacherId,
    walkthroughDate: Date.now(),
    evidenceSummary: "Test evidence",
    reinforcementIndicator: "classroom_management",
    refinementIndicator: "student_engagement",
    reinforcementFeedback: "Reinforcement feedback",
    refinementFeedback: "Refinement feedback",
    hasProPlan: false,
    hasStarterPlan: false
  });

  // Teacher should be able to access growth journal
  const pgpData = await ctx.runQuery(api.analytics.getMyPgpData, {
    teacherId
  });

  expect(pgpData).toBeDefined();
  expect(pgpData.pgpGoal).toBeDefined();
  expect(pgpData.refinementFocus).toBeDefined();
  expect(pgpData.reflectionPrompt).toBeDefined();
  expect(pgpData.recentWalkthroughs).toBeDefined();
});

test("Workflow Integration - Complete 5-Phase Loop", async (ctx) => {
  const coachId = await ctx.runMutation(internal.users.createUser, {
    email: "coach@test.com",
    name: "Test Coach",
    role: "coach",
    plan: "free"
  });

  const teacherId = await ctx.runMutation(internal.teachers.createTeacher, {
    coachId,
    email: "teacher@test.com",
    name: "Test Teacher"
  });

  // Phase 1: Set Goal (PGP Goal)
  const pgpGoal = await ctx.runMutation(api.teachers.updatePgpGoal, {
    teacherId,
    goal: "Improve student engagement through interactive activities",
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime()
  });

  expect(pgpGoal).toBeDefined();

  // Phase 2: Capture (Walkthrough)
  const walkthroughId = await ctx.runMutation(api.walkthroughs.createWalkthrough, {
    teacherId,
    walkthroughDate: Date.now(),
    evidenceSummary: "Observed teacher using interactive activities effectively",
    reinforcementIndicator: "student_engagement",
    refinementIndicator: "classroom_management",
    reinforcementFeedback: "Great use of interactive activities!",
    refinementFeedback: "Consider adding more structure to transitions",
    hasProPlan: false,
    hasStarterPlan: false
  });

  expect(walkthroughId).toBeDefined();

  // Phase 3: Generate (AI Feedback)
  const feedback = await ctx.runQuery(api.aiFeedback.getFeedbackForWalkthrough, {
    walkthroughId
  });

  expect(feedback).toBeDefined();
  expect(feedback.reinforcementFeedback).toBeDefined();
  expect(feedback.refinementFeedback).toBeDefined();

  // Phase 4: Reflect (Teacher Reflection)
  const reflectionId = await ctx.runMutation(api.reflections.createReflection, {
    walkthroughId,
    teacherId,
    content: "I learned that interactive activities really engage students. I'll continue using them and work on smoother transitions."
  });

  expect(reflectionId).toBeDefined();

  // Phase 5: Monitor (Analytics)
  const analytics = await ctx.runQuery(api.analytics.getMyPgpData, {
    teacherId
  });

  expect(analytics).toBeDefined();
  expect(analytics.pgpGoal).toBeDefined();
  expect(analytics.refinementFocus).toBeDefined();
  expect(analytics.reflectionPrompt).toBeDefined();
  expect(analytics.recentWalkthroughs).toBeDefined();
  expect(analytics.recentWalkthroughs.length).toBeGreaterThan(0);
});
