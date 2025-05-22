import { query } from "./_generated/server";
import { v } from "convex/values";

export const listByWalkthrough = query({
  args: { walkthroughId: v.id("walkthroughs") },
  returns: v.array(
    v.object({
      _id: v.id("walkthroughEntries"),
      _creationTime: v.float64(),
      walkthroughId: v.id("walkthroughs"),
      indicatorAcronym: v.string(),
      type: v.union(v.literal("reinforcement"), v.literal("refinement")),
      aiFeedback: v.optional(v.string()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("walkthroughEntries")
      .withIndex("by_walkthrough", (q) => q.eq("walkthroughId", args.walkthroughId))
      .collect();
  },
}); 