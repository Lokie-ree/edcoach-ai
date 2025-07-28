import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./auth";

// Plan configuration - centralized and type-safe
export const PLAN_CONFIG = {
  free: {
    name: "Coach Free",
    description: "Get started with EdCoach AI for free",
    features: {
      maxAIGenerations: 8, // 4 walkthroughs total (2 AI generations each)
      maxTeachers: 2,
      analyticsDepth: 14, // days
      exportEnabled: false,
      bulkInvitationsEnabled: false,
      prioritySupport: false,
      advancedAnalytics: false,
    },
  },
  coach_starter: {
    name: "Coach Starter",
    description: "Perfect for new coaches getting started",
    features: {
      maxAIGenerations: 30, // 15 walkthroughs per month (2 AI generations each)
      maxTeachers: 5,
      analyticsDepth: 90, // days
      exportEnabled: false,
      bulkInvitationsEnabled: true,
      prioritySupport: false,
      advancedAnalytics: false,
    },
  },
  coach_pro: {
    name: "Coach Pro",
    description: "For coaches ready to scale their impact",
    features: {
      maxAIGenerations: 100, // 50 walkthroughs per month (2 AI generations each)
      maxTeachers: 15,
      analyticsDepth: 90, // days
      exportEnabled: true,
      bulkInvitationsEnabled: true,
      prioritySupport: true,
      advancedAnalytics: true, // Enable advanced analytics for Pro
    },
  },
} as const;

export type PlanType = keyof typeof PLAN_CONFIG;
export type PlanFeatures = (typeof PLAN_CONFIG)[PlanType]["features"];

// Note: getCurrentPlan removed - use Clerk's has() method in components instead

/**
 * Get current month's AI usage for the user
 * Now takes plan info from frontend (from Clerk's has() method)
 */
export const getAIUsageThisMonth = query({
  args: {
    hasProPlan: v.optional(v.boolean()),
    hasStarterPlan: v.optional(v.boolean()),
  },
  returns: v.object({
    count: v.number(),
    limit: v.number(),
    remaining: v.number(),
    plan: v.string(),
    isOverLimit: v.boolean(),
    // Walkthrough counts (each walkthrough = 2 AI generations)
    walkthroughsUsed: v.number(),
    walkthroughsLimit: v.number(),
    walkthroughsRemaining: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "coach") {
      throw new Error("Only coaches have AI usage tracking");
    }

    // Determine plan from frontend Clerk check
    const plan = args.hasProPlan
      ? "coach_pro"
      : args.hasStarterPlan
        ? "coach_starter"
        : "free";
    const aiGenerationLimit = PLAN_CONFIG[plan].features.maxAIGenerations;
    const walkthroughLimit = Math.floor(aiGenerationLimit / 2);

    // Get walkthrough usage from the user's monthlyUsage field (old system)
    const usage = user.monthlyUsage || { walkthroughs: 0, teachersActive: 0 };

    // Reset usage if it's a new month
    const now = new Date();
    const resetDate = (usage as any).resetDate
      ? new Date((usage as any).resetDate)
      : new Date();
    const isNewMonth =
      now.getMonth() !== resetDate.getMonth() ||
      now.getFullYear() !== resetDate.getFullYear();

    const walkthroughsUsed = isNewMonth ? 0 : usage.walkthroughs;
    const walkthroughsRemaining = Math.max(
      0,
      walkthroughLimit - walkthroughsUsed,
    );

    // Convert to AI generation equivalents for backward compatibility
    const count = walkthroughsUsed * 2;
    const remaining = walkthroughsRemaining * 2;

    return {
      count,
      limit: aiGenerationLimit,
      remaining,
      plan,
      isOverLimit: walkthroughsUsed >= walkthroughLimit,
      walkthroughsUsed,
      walkthroughsLimit: walkthroughLimit,
      walkthroughsRemaining,
    };
  },
});

/**
 * Get current teacher usage and limits for the user
 */
export const getTeacherUsage = query({
  args: {
    hasProPlan: v.optional(v.boolean()),
    hasStarterPlan: v.optional(v.boolean()),
  },
  returns: v.object({
    teacherCount: v.number(),
    teacherLimit: v.number(),
    teachersRemaining: v.number(),
    isOverLimit: v.boolean(),
    plan: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "coach") {
      throw new Error("Only coaches can check teacher limits");
    }

    // Determine plan from frontend Clerk check
    const plan = args.hasProPlan
      ? "coach_pro"
      : args.hasStarterPlan
        ? "coach_starter"
        : "free";
    const limit = PLAN_CONFIG[plan].features.maxTeachers;

    // Get current teacher count - only count teachers who have accepted invitations
    // "pending" teachers are just placeholders and shouldn't count toward limits
    const teachers = await ctx.db
      .query("teachers")
      .withIndex("by_coach", (q) => q.eq("coachId", user._id))
      .filter((q) => q.neq(q.field("status"), "pending"))
      .collect();

    const teacherCount = teachers.length;
    const teachersRemaining = Math.max(0, limit - teacherCount);

    return {
      teacherCount,
      teacherLimit: limit,
      teachersRemaining,
      isOverLimit: teacherCount >= limit,
      plan,
    };
  },
});

/**
 * Get plan features for the current user
 */
export const getPlanFeatures = query({
  args: {
    hasProPlan: v.optional(v.boolean()),
    hasStarterPlan: v.optional(v.boolean()),
  },
  returns: v.object({
    plan: v.string(),
    exportEnabled: v.boolean(),
    bulkInvitationsEnabled: v.boolean(),
    prioritySupport: v.boolean(),
    advancedAnalytics: v.boolean(),
    analyticsDepth: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "coach") {
      throw new Error("Only coaches can check plan features");
    }

    // Determine plan from frontend Clerk check
    const plan = args.hasProPlan
      ? "coach_pro"
      : args.hasStarterPlan
        ? "coach_starter"
        : "free";
    const features = PLAN_CONFIG[plan].features;

    return {
      plan,
      exportEnabled: features.exportEnabled,
      bulkInvitationsEnabled: features.bulkInvitationsEnabled,
      prioritySupport: features.prioritySupport,
      advancedAnalytics: features.advancedAnalytics,
      analyticsDepth: features.analyticsDepth,
    };
  },
});
