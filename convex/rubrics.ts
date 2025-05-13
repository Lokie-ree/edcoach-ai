import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const insert = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    version: v.optional(v.string()),
    isStandard: v.boolean(),
    structure: v.any(),
    createdAt: v.number(),
    organizationId: v.optional(v.id("organizations")),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rubrics", args);
  },
});