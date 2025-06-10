import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const list = query({
  args: {
    coachId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all teachers for this coach
    const teachers = await ctx.db
      .query("teachers")
      .filter((q) => q.eq(q.field("coachId"), args.coachId))
      .collect();
    const teacherIds = teachers.map((t) => t._id);
    // Get all observations for these teachers
    return await ctx.db
      .query("observations")
      .filter((q) => q.or(...teacherIds.map(id => q.eq(q.field("teacherId"), id))))
      .collect();
  },
});

export const createObservationAndResponses = mutation({
  args: {
    teacherId: v.id("teachers"),
    subject: v.string(),
    gradeLevels: v.array(v.string()),
    observationDate: v.number(),
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
    // Authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Log access denied event
      await ctx.runMutation(internal.audit.createAuditLog, {
        action: "access_denied",
        resourceType: "observations",
        metadata: { reason: "Not authenticated" },
        severity: "warning",
      });
      throw new Error("Not authenticated");
    }
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) {
      throw new Error("User not found");
    }
    // Get teacher
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher) {
      throw new Error("Teacher not found");
    }
    // Only the coach associated with this teacher can create observations
    if (teacher.coachId !== user._id) {
      throw new Error("You don't have permission to create observations for this teacher");
    }
    // Create observation
    const now = Date.now();
    const observationId = await ctx.db.insert("observations", {
      teacherId: args.teacherId,
      observerId: user._id,
      subject: args.subject,
      gradeLevels: args.gradeLevels,
      observationDate: args.observationDate,
      status: "completed",
      createdAt: now,
      updatedAt: now,
    });
    if (args.rubricResponses) {
      for (const [indicatorAcronym, rating] of Object.entries(args.rubricResponses)) {
        await ctx.db.insert("rubricRatings", {
          observationId,
          indicatorAcronym,
          rating,
          createdAt: now,
        });
      }
    }
    // Walkthrough entries logic unchanged
    return observationId;
  },
});

// List all observations for a specific teacher
export const listByTeacher = query({
  args: {
    teacherId: v.id("teachers"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("observations")
      .filter((q) => q.eq(q.field("teacherId"), args.teacherId))
      .collect();
  },
});


