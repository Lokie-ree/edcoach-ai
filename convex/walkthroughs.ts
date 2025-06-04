import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createWalkthroughAndEntries = mutation({
  args: {
    teacherId: v.id("teachers"),
    walkthroughDate: v.number(),
    status: v.union(v.literal("draft"), v.literal("completed")),
    evidenceSummary: v.string(),
    reinforcementIndicator: v.string(),
    refinementIndicator: v.string(),
    walkthroughEntries: v.array(
      v.object({
        indicatorAcronym: v.string(),
        type: v.union(v.literal("reinforcement"), v.literal("refinement")),
        aiFeedback: v.optional(v.string()),
      })
    ),
  },
  returns: v.id("walkthroughs"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");
    // Get teacher
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher) throw new Error("Teacher not found");
    // Only the coach associated with this teacher can create walkthroughs
    if (teacher.coachId !== user._id) {
      throw new Error("You don't have permission to create walkthroughs for this teacher");
    }
    const now = Date.now();
    const walkthroughId = await ctx.db.insert("walkthroughs", {
      teacherId: args.teacherId,
      observerId: user._id,
      walkthroughDate: args.walkthroughDate,
      status: args.status,
      evidenceSummary: args.evidenceSummary,
      reinforcementIndicator: args.reinforcementIndicator,
      refinementIndicator: args.refinementIndicator,
      createdAt: now,
      updatedAt: now,
    });
    for (const entry of args.walkthroughEntries) {
      await ctx.db.insert("walkthroughEntries", {
        walkthroughId,
        indicatorAcronym: entry.indicatorAcronym,
        type: entry.type,
        aiFeedback: entry.aiFeedback,
        createdAt: now,
      });
    }
    return walkthroughId;
  },
});

export const updateWalkthroughAndEntries = mutation({
  args: {
    walkthroughId: v.id("walkthroughs"),
    teacherId: v.id("teachers"),
    walkthroughDate: v.number(),
    status: v.union(v.literal("draft"), v.literal("completed")),
    evidenceSummary: v.string(),
    reinforcementIndicator: v.string(),
    refinementIndicator: v.string(),
    walkthroughEntries: v.array(
      v.object({
        indicatorAcronym: v.string(),
        type: v.union(v.literal("reinforcement"), v.literal("refinement")),
        aiFeedback: v.optional(v.string()),
      })
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");
    // Check teacher
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher) throw new Error("Teacher not found");
    // Only the coach associated with this teacher can update walkthroughs
    if (teacher.coachId !== user._id) {
      throw new Error("You don't have permission to update walkthroughs for this teacher");
    }
    // Check walkthrough
    const walkthrough = await ctx.db.get(args.walkthroughId);
    if (!walkthrough) throw new Error("Walkthrough not found");
    if (walkthrough.observerId !== user._id) {
      throw new Error("You can only update your own walkthroughs");
    }
    const now = Date.now();
    await ctx.db.patch(args.walkthroughId, {
      teacherId: args.teacherId,
      walkthroughDate: args.walkthroughDate,
      status: args.status,
      evidenceSummary: args.evidenceSummary,
      reinforcementIndicator: args.reinforcementIndicator,
      refinementIndicator: args.refinementIndicator,
      updatedAt: now,
    });
    // Remove old entries
    const oldEntries = await ctx.db
      .query("walkthroughEntries")
      .withIndex("by_walkthrough", (q) => q.eq("walkthroughId", args.walkthroughId))
      .collect();
    for (const entry of oldEntries) {
      await ctx.db.delete(entry._id);
    }
    // Insert new entries
    for (const entry of args.walkthroughEntries) {
      await ctx.db.insert("walkthroughEntries", {
        walkthroughId: args.walkthroughId,
        indicatorAcronym: entry.indicatorAcronym,
        type: entry.type,
        aiFeedback: entry.aiFeedback,
        createdAt: now,
      });
    }
    return null;
  },
});

export const listDraftWalkthroughs = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("walkthroughs"),
      _creationTime: v.float64(),
      teacherId: v.id("teachers"),
      observerId: v.id("users"),
      walkthroughDate: v.number(),
      status: v.union(v.literal("draft"), v.literal("completed")),
      evidenceSummary: v.string(),
      reinforcementIndicator: v.string(),
      refinementIndicator: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");
    // List drafts for this observer
    const drafts = await ctx.db
      .query("walkthroughs")
      .withIndex("by_observer", (q) => q.eq("observerId", user._id))
      .filter((q) => q.eq(q.field("status"), "draft"))
      .order("desc")
      .collect();
    return drafts;
  },
});

// List all walkthroughs for a coach (by their teachers)
export const listByCoach = query({
  args: {
    coachId: v.id("users"),
  },
  returns: v.array(
    v.object({
      _id: v.id("walkthroughs"),
      _creationTime: v.number(),
      teacherId: v.id("teachers"),
      observerId: v.id("users"),
      walkthroughDate: v.number(),
      status: v.union(v.literal("draft"), v.literal("completed")),
      evidenceSummary: v.string(),
      reinforcementIndicator: v.string(),
      refinementIndicator: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    // Get all teachers for this coach
    const teachers = await ctx.db
      .query("teachers")
      .filter((q) => q.eq(q.field("coachId"), args.coachId))
      .collect();
    const teacherIds = teachers.map((t) => t._id);
    // Get all walkthroughs for these teachers
    return await ctx.db
      .query("walkthroughs")
      .filter((q) => q.or(...teacherIds.map(id => q.eq(q.field("teacherId"), id))))
      .collect();
  },
}); 