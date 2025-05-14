import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

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

export const listRubricWithIndicators = query({
  args: {},
  handler: async (ctx) => {
    // Get the first rubric (or implement logic for active/default rubric)
    const rubric = await ctx.db.query("rubrics").first();
    if (!rubric) return null;
    // Fetch all indicators for this rubric (by rubricName)
    const indicators = await ctx.db
      .query("rubricIndicators")
      .filter((q) => q.eq(q.field("rubricName"), rubric.name))
      .collect();
    // Group indicators by domain
    const domainsMap: Record<string, any> = {};
    for (const indicator of indicators) {
      if (!domainsMap[indicator.domain]) {
        domainsMap[indicator.domain] = {
          domain_name: indicator.domain,
          indicators: [],
        };
      }
      domainsMap[indicator.domain].indicators.push(indicator);
    }
    const domains = Object.values(domainsMap);
    return {
      rubric: {
        name: rubric.name,
        description: rubric.description,
        version: rubric.version,
        isStandard: rubric.isStandard,
      },
      domains,
    };
  },
});