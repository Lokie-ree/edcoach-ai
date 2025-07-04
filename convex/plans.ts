import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./auth";

// Plan configuration - centralized and type-safe
export const PLAN_CONFIG = {
  coach_starter: {
    name: "Coach Starter",
    description: "Perfect for new coaches getting started",
    features: {
      maxAIGenerations: 20, // 10 walkthroughs per month
      maxTeachers: 3,
      analyticsDepth: 30,
      exportEnabled: false,
      bulkInvitationsEnabled: false,
      prioritySupport: false,
      advancedAnalytics: false,
    },
  },
  coach_pro: {
    name: "Coach Pro", 
    description: "For coaches ready to scale their impact",
    features: {
      maxAIGenerations: 100, // 50 walkthroughs per month
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
export type PlanFeatures = typeof PLAN_CONFIG[PlanType]['features'];

// Note: getCurrentPlan removed - use Clerk's has() method in components instead

/**
 * Get current month's AI usage for the user
 * Now takes plan info from frontend (from Clerk's has() method)
 */
export const getAIUsageThisMonth = query({
  args: {
    hasProPlan: v.optional(v.boolean()),
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
    const plan = args.hasProPlan ? "coach_pro" : "coach_starter";
    const limit = PLAN_CONFIG[plan].features.maxAIGenerations;
    
    // Get current month's AI generations
    const now = Date.now();
    const startOfMonth = new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1).getTime();
    
    const generations = await ctx.db
      .query("aiUsageLogs")
      .withIndex("by_user_and_month", (q) => 
        q.eq("userId", user._id).gte("timestamp", startOfMonth)
      )
      .collect();
    
    const count = generations.length;
    const remaining = Math.max(0, limit - count);
    
    // Calculate walkthrough equivalents (2 AI generations = 1 walkthrough)
    const walkthroughsUsed = Math.floor(count / 2);
    const walkthroughsLimit = Math.floor(limit / 2);
    const walkthroughsRemaining = Math.floor(remaining / 2);
    
    return {
      count,
      limit,
      remaining,
      plan,
      isOverLimit: count >= limit,
      walkthroughsUsed,
      walkthroughsLimit,
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
    const plan = args.hasProPlan ? "coach_pro" : "coach_starter";
    const limit = PLAN_CONFIG[plan].features.maxTeachers;
    
    // Get current teacher count
    const teachers = await ctx.db
      .query("teachers")
      .withIndex("by_coach", (q) => q.eq("coachId", user._id))
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
    const plan = args.hasProPlan ? "coach_pro" : "coach_starter";
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