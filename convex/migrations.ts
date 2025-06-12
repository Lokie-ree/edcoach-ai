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

// Helper function to map grade levels to grade bands
function mapGradeLevelsToGradeBand(gradeLevels: string[]): string {
  const elementary = ["k", "1", "2", "3", "4", "5"];
  const middle = ["6", "7", "8"];
  const high = ["9", "10", "11", "12"];

  // Check which grade band the majority of grades fall into
  const counts = {
    elementary: gradeLevels.filter(g => elementary.includes(g)).length,
    middle: gradeLevels.filter(g => middle.includes(g)).length,
    high: gradeLevels.filter(g => high.includes(g)).length,
  };

  // Return the grade band with the highest count
  const maxCount = Math.max(...Object.values(counts));
  const gradeBand = Object.entries(counts).find(([_, count]) => count === maxCount)?.[0];
  
  return gradeBand || "elementary"; // Default to elementary if no match
}

export const migrateTeachersToGradeBands = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    migratedCount: v.number(),
  }),
  handler: async (ctx, args) => {
    // Get all teachers with the old gradeLevels field
    const teachers = await ctx.db.query("teachers").collect();
    let migratedCount = 0;

    for (const teacher of teachers) {
      // Check if teacher has the old gradeLevels field
      if ('gradeLevels' in teacher && Array.isArray((teacher as any).gradeLevels)) {
        const gradeLevels = (teacher as any).gradeLevels as string[];
        const gradeBand = mapGradeLevelsToGradeBand(gradeLevels);
        
        // Update the teacher record with the new gradeBand field
        await ctx.db.patch(teacher._id, {
          gradeBand,
        });
        
        migratedCount++;
      }
    }

    return {
      success: true,
      migratedCount,
    };
  },
});