import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the current user to filter by organization
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get observations for the user
    return await ctx.db
      .query("observations")
      .withIndex("by_observer", (q) => q.eq("observerId", user._id))
      .collect();
  },
});

export const createObservationAndResponses = mutation({
  args: {
    teacherId: v.id("teachers"),
    subject: v.string(),
    gradeLevels: v.array(v.string()),
    observationDate: v.number(),
    reinforcementComment: v.optional(v.string()),
    refinementComment: v.optional(v.string()),
    rubricResponses: v.optional(v.record(v.string(), v.number())),
    walkthroughEntries: v.optional(
      v.array(
        v.object({
          indicatorAcronym: v.string(),
          type: v.union(v.literal("reinforcement"), v.literal("refinement")),
          comment: v.string(),
        }),
      ),
    ),
  },
  returns: v.id("observations"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const observationId = await ctx.db.insert("observations", {
      teacherId: args.teacherId,
      observerId: user._id,
      subject: args.subject,
      gradeLevels: args.gradeLevels,
      observationDate: args.observationDate,
      status: "completed",
      reinforcementComment: args.reinforcementComment,
      refinementComment: args.refinementComment,
      createdAt: now,
      updatedAt: now,
    });

    if (args.rubricResponses) {
      for (const [indicatorAcronym, rating] of Object.entries(
        args.rubricResponses,
      )) {
        await ctx.db.insert("rubricRatings", {
          observationId,
          indicatorAcronym,
          rating,
          createdAt: now,
        });
      }
    }

    if (args.walkthroughEntries) {
      for (const entry of args.walkthroughEntries) {
        await ctx.db.insert("walkthroughEntries", {
          observationId,
          indicatorAcronym: entry.indicatorAcronym,
          type: entry.type,
          comment: entry.comment,
          createdAt: now,
        });
      }
    }

    return observationId;
  },
});
