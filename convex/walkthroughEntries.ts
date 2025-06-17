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

export const listByTeacher = query({
  args: { teacherId: v.id("teachers") },
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
    // Get all walkthroughs for this teacher
    const walkthroughs = await ctx.db
      .query("walkthroughs")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .collect();
    
    const walkthroughIds = walkthroughs.map(w => w._id);
    
    // Get all entries for these walkthroughs
    const entries = [];
    for (const walkthroughId of walkthroughIds) {
      const walkthroughEntries = await ctx.db
        .query("walkthroughEntries")
        .withIndex("by_walkthrough", (q) => q.eq("walkthroughId", walkthroughId))
        .collect();
      entries.push(...walkthroughEntries);
    }
    
    return entries;
  },
});

export const listByCoach = query({
  args: { coachId: v.id("users") },
  returns: v.array(
    v.object({
      _id: v.id("walkthroughEntries"),
      _creationTime: v.float64(),
      walkthroughId: v.id("walkthroughs"),
      indicatorAcronym: v.string(),
      type: v.union(v.literal("reinforcement"), v.literal("refinement")),
      aiFeedback: v.optional(v.string()),
      createdAt: v.number(),
      teacherName: v.optional(v.string()),
      walkthroughDate: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    // First, get all walkthroughs for teachers under this coach
    const walkthroughs = await ctx.db
      .query("walkthroughs")
      .withIndex("by_observer", (q) => q.eq("observerId", args.coachId))
      .collect();

    if (walkthroughs.length === 0) {
      return [];
    }

    // Get all entries for these walkthroughs
    const allEntries = [];
    for (const walkthrough of walkthroughs) {
      const entries = await ctx.db
        .query("walkthroughEntries")
        .withIndex("by_walkthrough", (q) => q.eq("walkthroughId", walkthrough._id))
        .collect();

      // Get teacher info for context
      const teacher = await ctx.db.get(walkthrough.teacherId);
      
      // Add teacher and walkthrough context to entries
      const enrichedEntries = entries.map(entry => ({
        ...entry,
        teacherName: teacher?.name,
        walkthroughDate: walkthrough.walkthroughDate,
      }));

      allEntries.push(...enrichedEntries);
    }

    // Sort by creation time, most recent first
    return allEntries.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const listByOrg = query({
  args: { clerkOrganizationId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("walkthroughEntries"),
      _creationTime: v.float64(),
      walkthroughId: v.id("walkthroughs"),
      indicatorAcronym: v.string(),
      type: v.union(v.literal("reinforcement"), v.literal("refinement")),
      aiFeedback: v.optional(v.string()),
      createdAt: v.number(),
      teacherName: v.optional(v.string()),
      walkthroughDate: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    // Get all users in the org
    const users = await ctx.db
      .query("users")
      .withIndex("by_organization", (q) => q.eq("clerkOrganizationId", args.clerkOrganizationId))
      .collect();
    const userIds = users.map((u) => u._id);
    // Get all teachers for these users
    const teachers = await ctx.db
      .query("teachers")
      .filter((q) => q.or(...userIds.map((id) => q.eq(q.field("userId"), id))))
      .collect();
    const teacherIds = teachers.map((t) => t._id);
    // Get all walkthroughs for these teachers
    const walkthroughs = await ctx.db
      .query("walkthroughs")
      .filter((q) => q.or(...teacherIds.map((id) => q.eq(q.field("teacherId"), id))))
      .collect();
    if (walkthroughs.length === 0) {
      return [];
    }
    // Get all entries for these walkthroughs
    const allEntries = [];
    for (const walkthrough of walkthroughs) {
      const entries = await ctx.db
        .query("walkthroughEntries")
        .withIndex("by_walkthrough", (q) => q.eq("walkthroughId", walkthrough._id))
        .collect();
      // Get teacher info for context
      const teacher = teachers.find((t) => t._id === walkthrough.teacherId);
      // Add teacher and walkthrough context to entries
      const enrichedEntries = entries.map((entry) => ({
        ...entry,
        teacherName: teacher?.name,
        walkthroughDate: walkthrough.walkthroughDate,
      }));
      allEntries.push(...enrichedEntries);
    }
    // Sort by creation time, most recent first
    return allEntries.sort((a, b) => b.createdAt - a.createdAt);
  },
}); 