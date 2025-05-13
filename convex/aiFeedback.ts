"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";

// Helper stub for caching logic (replace with real implementation)
async function checkIfCached(prompt: string): Promise<boolean> {
  // TODO: Implement actual cache check
  return false;
}

export const generateFeedback = action({
  args: {
    evidence: v.string(),
    indicator: v.any(),
    promptType: v.union(v.literal("reinforcement"), v.literal("refinement")),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const indicator = args.indicator;
    if (!indicator) throw new Error("Rubric indicator not found");

    const prompt =
      args.promptType === "reinforcement"
        ? `
You are an instructional coach. Based on the classroom evidence and the rubric indicator below, generate a concise, positive reinforcement statement for the teacher. Reference the indicator language and be specific.

Rubric Indicator:
"${indicator.indicator_name}" (${indicator.indicator_code}): ${indicator.overview}

Classroom Evidence:
"${args.evidence}"

Instructions:
- Focus on what the teacher did well related to this indicator.
- Use positive, professional language.
- Limit to 1-2 sentences.
`
        : `
You are an instructional coach. Based on the classroom evidence and the rubric indicator below, generate a concise, actionable suggestion for the teacher's growth. Reference the indicator language and be specific.

Rubric Indicator:
"${indicator.indicator_name}" (${indicator.indicator_code}): ${indicator.overview}

Classroom Evidence:
"${args.evidence}"

Instructions:
- Focus on a specific area for growth related to this indicator.
- Suggest one concrete next step.
- Use supportive, professional language.
- Limit to 1-2 sentences.
`;

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini-2025-04-14",
      messages: [{ role: "system", content: prompt }],
      max_tokens: 200,
      temperature: 0.2,
      top_p: 1.0,
    });

    // Get userId from Clerk identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.runQuery(internal.users.internalGetUserByClerkId, { clerkId: identity.subject });
    if (!user) throw new Error("User not found");
    const userId = user._id;

    // Token/cost tracking
    const promptTokens = response.usage?.prompt_tokens ?? 0;
    const completionTokens = response.usage?.completion_tokens ?? 0;
    const totalTokens = response.usage?.total_tokens ?? 0;
    // Pricing as of 2024-06: Input $0.40/M, Cached $0.10/M, Output $1.60/M
    const PROMPT_COST_PER_1K = 0.00040;
    const CACHED_PROMPT_COST_PER_1K = 0.00010;
    const COMPLETION_COST_PER_1K = 0.00160;
    const isCached = await checkIfCached(prompt);
    const promptCost = isCached ? (promptTokens * CACHED_PROMPT_COST_PER_1K / 1000) : (promptTokens * PROMPT_COST_PER_1K / 1000);
    const completionCost = completionTokens * COMPLETION_COST_PER_1K / 1000;
    const totalCost = promptCost + completionCost;

    // Log usage
    await ctx.runMutation(internal.aiFeedback.logTokenUsage, {
      userId,
      action: "generateFeedback",
      model: "gpt-4.1-mini-2025-04-14",
      promptTokens,
      completionTokens,
      totalTokens,
      cost: totalCost,
      isCached,
      timestamp: Date.now(),
      metadata: {
        promptType: args.promptType,
        indicatorCode: indicator.indicator_code,
      },
    });

    // Check for cost alerts
    await ctx.runMutation(internal.aiFeedback.checkCostAlerts, {
      userId,
      cost: totalCost,
    });

    return response.choices[0].message.content ?? "";
  },
});

// Log token usage
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
  handler: async (ctx, args) => {
    await ctx.db.insert("aiUsageLogs", args);
  },
});

// Cost alert system
export const setCostAlert = mutation({
  args: {
    threshold: v.number(),
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
  },
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
  },
});

export const checkCostAlerts = internalMutation({
  args: {
    userId: v.id("users"),
    cost: v.number(),
  },
  handler: async (ctx, args) => {
    const alerts = await ctx.db
      .query("aiUsageAlerts")
      .withIndex("by_user", (q: any) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    for (const alert of alerts) {
      const periodStart = getPeriodStart(alert.period as "daily" | "weekly" | "monthly");
      const recentUsage = await ctx.db
        .query("aiUsageLogs")
        .filter((q: any) => q.eq(q.field("userId"), args.userId) && q.gte(q.field("timestamp"), periodStart))
        .collect();
      const totalCost = recentUsage.reduce((sum, log) => sum + log.cost, 0);
      if (totalCost >= alert.threshold) {
        // TODO: Implement notification system
        // await ctx.runMutation(internal.notifications.createNotification, { ... });
        await ctx.db.patch(alert._id, { lastTriggered: Date.now() });
      }
    }
  },
});

function getPeriodStart(period: "daily" | "weekly" | "monthly"): number {
  const now = Date.now();
  switch (period) {
    case "daily":
      return now - 24 * 60 * 60 * 1000;
    case "weekly":
      return now - 7 * 24 * 60 * 60 * 1000;
    case "monthly":
      return now - 30 * 24 * 60 * 60 * 1000;
  }
}

// Usage stats and optimization
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
      .filter((q: any) => q.gte(q.field("timestamp"), startDate).lte(q.field("timestamp"), endDate));
    if (args.userId) {
      queryBuilder = queryBuilder.filter((q: any) => q.eq(q.field("userId"), args.userId));
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

export const getOptimizationSuggestions = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let queryBuilder = ctx.db
      .query("aiUsageLogs")
      .filter((q: any) => q.gte(q.field("timestamp"), thirtyDaysAgo));
    if (args.userId) {
      queryBuilder = queryBuilder.filter((q: any) => q.eq(q.field("userId"), args.userId));
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