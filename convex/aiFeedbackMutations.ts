import { mutation, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Log token usage for AI feedback generation
export const logTokenUsage = internalMutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
    cost: v.number(),
    isCached: v.boolean(),
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("aiUsageLogs", args);
    return null;
  },
});

// Set a cost alert for a user
export const setCostAlert = mutation({
  args: {
    threshold: v.number(),
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.runQuery(internal.users.internalGetUserByClerkId, { clerkId: identity.subject });
    if (!user) throw new Error("User not found");
    const userId = user._id;
    await ctx.db.insert("aiUsageAlerts", {
      userId,
      threshold: args.threshold,
      period: args.period,
      isActive: true,
    });
    return null;
  },
});

// Check if a user's cost has exceeded their alert threshold
export const checkCostAlerts = internalMutation({
  args: {
    userId: v.id("users"),
    cost: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("aiUsageAlerts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    for (const alert of alerts) {
      if (args.cost >= alert.threshold) {
        // TODO: Notify user (e.g., email, in-app notification)
      }
    }
    return null;
  },
});

// Get usage stats for a user
export const getUsageStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const startDate = args.startDate ?? Date.now() - 30 * 24 * 60 * 60 * 1000;
    const endDate = args.endDate ?? Date.now();
    let queryBuilder = ctx.db
      .query("aiUsageLogs")
      .filter((q) => q.gte(q.field("timestamp"), startDate))
      .filter((q) => q.lte(q.field("timestamp"), endDate));
    if (args.userId) {
      queryBuilder = queryBuilder.filter((q) => q.eq(q.field("userId"), args.userId));
    }
    const usage = await queryBuilder.collect();
    const stats = usage.reduce((acc, log) => ({
      totalPromptTokens: acc.totalPromptTokens + log.promptTokens,
      totalCompletionTokens: acc.totalCompletionTokens + log.completionTokens,
      totalTokens: acc.totalTokens + log.totalTokens,
      totalCost: acc.totalCost + log.cost,
      cachedInputs: acc.cachedInputs + (log.isCached ? 1 : 0),
      totalRequests: acc.totalRequests + 1,
    }), {
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalTokens: 0,
      totalCost: 0,
      cachedInputs: 0,
      totalRequests: 0,
    });
    const averageTokensPerRequest = stats.totalTokens / (stats.totalRequests || 1);
    const averageCostPerRequest = stats.totalCost / (stats.totalRequests || 1);
    const cacheHitRate = stats.cachedInputs / (stats.totalRequests || 1);
    return { ...stats, averageTokensPerRequest, averageCostPerRequest, cacheHitRate };
  },
});

// Get optimization suggestions for a user
export const getOptimizationSuggestions = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let queryBuilder = ctx.db
      .query("aiUsageLogs")
      .filter((q) => q.gte(q.field("timestamp"), thirtyDaysAgo));
    if (args.userId) {
      queryBuilder = queryBuilder.filter((q) => q.eq(q.field("userId"), args.userId));
    }
    const usage = await queryBuilder.collect();
    const suggestions = [];
    const avgPromptTokens = usage.reduce((sum, log) => sum + log.promptTokens, 0) / (usage.length || 1);
    if (avgPromptTokens > 1000) {
      suggestions.push({
        type: "prompt_length",
        message: `Consider shortening your prompts. Current average length is ${Math.round(avgPromptTokens)} tokens.`,
        potentialSavings: `Could save ~$${((avgPromptTokens - 1000) * 0.00040 / 1000 * usage.length).toFixed(2)} per month`,
      });
    }
    const cacheHitRate = usage.filter(log => log.isCached).length / (usage.length || 1);
    if (cacheHitRate < 0.3) {
      suggestions.push({
        type: "caching",
        message: "Low cache hit rate. Consider implementing more aggressive caching.",
        potentialSavings: `Could save ~$${(usage.length * 0.00030 / 1000).toFixed(2)} per month`,
      });
    }
    return suggestions;
  },
}); 