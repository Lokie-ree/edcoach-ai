import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./auth";

// Plan configuration - centralized and type-safe
export const PLAN_CONFIG = {
  coach_starter: {
    name: "Coach Starter",
    price: 0,
    description: "Perfect for individual coaches getting started",
    features: {
      maxAIGenerations: 30, // 15 walkthroughs per month
      maxOrganizations: 1,
      maxTeachers: 5,
      analyticsDepth: 30, // days
      exportEnabled: false,
      prioritySupport: false,
      earlyAccess: false,
    },
  },
  coach_pro: {
    name: "Coach Pro", 
    price: 39,
    description: "For coaches serious about scaling their impact",
    features: {
      maxAIGenerations: 200, // 100 walkthroughs per month
      maxOrganizations: 3,
      maxTeachers: 25,
      analyticsDepth: 180, // days
      exportEnabled: true,
      prioritySupport: true,
      earlyAccess: true,
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