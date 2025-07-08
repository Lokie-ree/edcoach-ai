import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { PLAN_CONFIG } from "./plans";
import { getCurrentUser } from "./auth";

export const trackUsage = mutation({
  args: {
    type: v.union(v.literal("walkthrough"), v.literal("teacher")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "coach")
      throw new Error("Only coaches can track usage");
    const now = new Date();
    let usage = user.monthlyUsage || {
      walkthroughs: 0,
      teachersActive: 0,
      resetDate: now.toISOString(),
    };
    // Reset if new month
    const resetDate = new Date(usage.resetDate);
    if (
      now.getMonth() !== resetDate.getMonth() ||
      now.getFullYear() !== resetDate.getFullYear()
    ) {
      usage = {
        walkthroughs: 0,
        teachersActive: 0,
        resetDate: now.toISOString(),
      };
    }
    if (args.type === "walkthrough") usage.walkthroughs++;
    if (args.type === "teacher") usage.teachersActive++;
    await ctx.db.patch(user._id, { monthlyUsage: usage });
  },
});

export const checkUsageLimit = query({
  args: {
    type: v.union(v.literal("walkthrough"), v.literal("teacher")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "coach")
      throw new Error("Only coaches can check usage limits");
    const plan = user.plan || "free";
    const limits = PLAN_CONFIG[plan].features;
    const usage = user.monthlyUsage || { walkthroughs: 0, teachersActive: 0 };
    const current =
      args.type === "walkthrough" ? usage.walkthroughs : usage.teachersActive;
    const limit =
      args.type === "walkthrough"
        ? Math.floor(limits.maxAIGenerations / 2)
        : limits.maxTeachers;
    return {
      canPerformAction: current < limit,
      currentUsage: current,
      limit,
      usagePercentage: Math.round((current / limit) * 100),
    };
  },
});

export const resetMonthlyUsage = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const now = new Date().toISOString();
    for (const user of users) {
      if (user.role === "coach") {
        await ctx.db.patch(user._id, {
          monthlyUsage: {
            walkthroughs: 0,
            teachersActive: 0,
            resetDate: now,
          },
        });
      }
    }
  },
});

export const cleanupExpiredData = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    for (const user of users) {
      if (user.role !== "coach") continue;
      const plan = user.plan || "free";
      const retentionDays = PLAN_CONFIG[plan].features.analyticsDepth;
      const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
      // Clean up old walkthroughs for this coach's teachers
      const teachers = await ctx.db
        .query("teachers")
        .withIndex("by_coach", (q) => q.eq("coachId", user._id))
        .collect();
      for (const teacher of teachers) {
        const expired = await ctx.db
          .query("walkthroughs")
          .withIndex("by_teacher", (q) => q.eq("teacherId", teacher._id))
          .filter((q) => q.lt(q.field("_creationTime"), cutoff))
          .collect();
        for (const walkthrough of expired) {
          await ctx.db.delete(walkthrough._id);
        }
      }
    }
  },
});
