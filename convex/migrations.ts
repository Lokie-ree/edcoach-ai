import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const insertRubric = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    version: v.optional(v.string()),
    isStandard: v.boolean(),
    structure: v.any(),
    createdAt: v.number(),
    // organizationId: v.optional(v.id("organizations")),
    // createdBy: v.optional(v.id("users")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("rubrics", args);
    return null;
  },
});

export const bulkInsertRubricIndicators = mutation({
  args: {
    indicators: v.array(
      v.object({
        domain: v.string(),
        domain_weight: v.number(),
        indicator_code: v.string(),
        indicator_name: v.string(),
        overview: v.optional(v.string()),
        content_connections: v.optional(v.string()),
        student_centered_evidence: v.optional(v.array(v.string())),
        key_terms: v.optional(v.any()),
        performance_levels: v.any(),
        suggested_coaching_questions: v.optional(v.array(v.string())),
        rubricName: v.optional(v.string()),
        version: v.optional(v.string()),
        createdAt: v.number(),
      })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    for (const indicator of args.indicators) {
      await ctx.db.insert("rubricIndicators", indicator);
    }
    return null;
  },
});