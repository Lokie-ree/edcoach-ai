import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

/**
 * Query: Get the reflection for a given walkthrough (if any).
 */
export const getReflectionByWalkthrough = query({
  args: { walkthroughId: v.id("walkthroughs") },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("reflections"),
      walkthroughId: v.id("walkthroughs"),
      teacherId: v.id("teachers"),
      content: v.string(),
      createdAt: v.float64(),
      updatedAt: v.optional(v.float64()),
      _creationTime: v.float64(),
    })
  ),
  handler: async (ctx, args) => {
    const reflection = await ctx.db
      .query("reflections")
      .withIndex("by_walkthrough", (q) => q.eq("walkthroughId", args.walkthroughId))
      .first();
    return reflection || null;
  },
});

/**
 * Create a new teacher reflection for a walkthrough.
 * This also integrates with the workflow state to track reflection completion.
 */
export const createReflection = mutation({
  args: {
    walkthroughId: v.id("walkthroughs"),
    teacherId: v.id("teachers"),
    content: v.string(),
  },
  returns: v.id("reflections"),
  handler: async (ctx, args) => {
    // Validate referenced walkthrough and teacher exist
    const walkthrough = await ctx.db.get(args.walkthroughId);
    if (!walkthrough) throw new Error("Walkthrough not found");
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher) throw new Error("Teacher not found");
    
    const now = Date.now();
    
    // Create the reflection
    const reflectionId = await ctx.db.insert("reflections", {
      walkthroughId: args.walkthroughId,
      teacherId: args.teacherId,
      content: args.content,
      createdAt: now,
      updatedAt: now,
    });

    // Update workflow state to record reflection completion
    // This helps track progress in the reflect step of the EdCoach methodology
    try {
      await ctx.runMutation(internal.workflowState.recordReflectionCompletion, {
        teacherId: args.teacherId,
        insightDepth: Math.floor(args.content.length / 50), // Simple insight quality metric
      });
    } catch (error) {
      // Don't fail reflection creation if workflow update fails
      console.warn("Failed to update workflow state for reflection:", error);
    }

    return reflectionId;
  },
});

/**
 * Update an existing teacher reflection.
 */
export const updateReflection = mutation({
  args: {
    reflectionId: v.id("reflections"),
    content: v.string(),
  },
  returns: v.id("reflections"),
  handler: async (ctx, args) => {
    const reflection = await ctx.db.get(args.reflectionId);
    if (!reflection) throw new Error("Reflection not found");
    await ctx.db.patch(args.reflectionId, {
      content: args.content,
      updatedAt: Date.now(),
    });
    return args.reflectionId;
  },
}); 