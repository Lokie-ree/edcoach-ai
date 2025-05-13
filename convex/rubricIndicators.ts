import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const insert = mutation({
  args: {
    domain: v.string(),
    domain_weight: v.number(),
    indicator_code: v.string(),
    indicator_name: v.string(),
    overview: v.string(),
    content_connections: v.optional(v.string()),
    student_centered_evidence: v.optional(v.array(v.string())),
    key_terms: v.optional(v.any()),
    performance_levels: v.array(v.any()),
    suggested_coaching_questions: v.optional(v.array(v.string())),
    rubricName: v.string(),
    version: v.optional(v.string()),
    createdAt: v.number(),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rubricIndicators", args);
  },
});