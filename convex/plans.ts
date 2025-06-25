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

/**
 * Get the user's current plan configuration
 * Safely defaults to coach_starter for existing coaches
 */
export const getCurrentPlan = query({
  args: {},
  returns: v.object({
    plan: v.union(v.literal("coach_starter"), v.literal("coach_pro")),
    name: v.string(),
    price: v.number(),
    description: v.string(),
    features: v.any(),
    isActive: v.boolean(),
  }),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    
    // Teachers don't have plans
    if (!user || user.role !== "coach") {
      throw new Error("Only coaches have subscription plans");
    }

    // Default to coach_starter for existing users
    const plan = user.subscriptionPlan || "coach_starter";
    const planConfig = PLAN_CONFIG[plan];
    
    // Check if subscription is active (coach_starter is always "active")
    const isActive = plan === "coach_starter" || user.subscriptionStatus === "active";
    
    return {
      plan,
      name: planConfig.name,
      price: planConfig.price,
      description: planConfig.description,
      features: planConfig.features,
      isActive,
    };
  },
});

/**
 * Get current month's AI usage for the user
 * Non-breaking: works with existing AI usage logs
 */
export const getAIUsageThisMonth = query({
  args: {},
  returns: v.object({
    count: v.number(),
    limit: v.number(),
    remaining: v.number(),
    plan: v.union(v.literal("coach_starter"), v.literal("coach_pro")),
    isOverLimit: v.boolean(),
    // Walkthrough counts (each walkthrough = 2 AI generations)
    walkthroughsUsed: v.number(),
    walkthroughsLimit: v.number(),
    walkthroughsRemaining: v.number(),
  }),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "coach") {
      throw new Error("Only coaches have AI usage tracking");
    }

    // Get plan (default to coach_starter)
    const plan = user.subscriptionPlan || "coach_starter";
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