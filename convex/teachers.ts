// convex/teachers.ts
import { v } from "convex/values";
import {
  internalMutation,
  query,
  mutation,
  internalQuery,
} from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { getCurrentUser, getCurrentUserOrThrow } from "./auth";
import { api } from "./_generated/api";

// Reusable authorization helper for mutations
async function _ensureIsCoachForTeacher(
  ctx: any,
  user: Doc<"users">,
  teacher: Doc<"teachers">,
) {
  if (user.role !== "coach") {
    throw new Error("Action requires coach permissions.");
  }
  if (teacher.coachId !== user._id) {
    throw new Error("You can only manage teachers assigned to you.");
  }
}

/**
 * List all teachers for the current coach.
 * NEW: Uses direct coach-teacher relationship instead of organization-based queries.
 */
export const list = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "coach") {
      return [];
    }

    // NEW: Get teachers directly assigned to this coach
    const teachers = await ctx.db
      .query("teachers")
      .withIndex("by_coach", (q) => q.eq("coachId", user._id))
      .collect();

    // Transform teachers to include user status for needs_details handling
    const result = await Promise.all(
      teachers.map(async (teacher) => {
        if (teacher.userId) {
          // Teacher has a linked user account
          return { ...teacher, isUserRecord: false };
        } else {
          // Teacher is still pending (no user account yet)
          return { ...teacher, isUserRecord: false };
        }
      }),
    );

    return result;
  },
});

/**
 * Get the current teacher's own record.
 */
export const getMyRecord = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("teachers"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.string(),
      subject: v.array(v.string()),
      gradeBand: v.string(),
      status: v.union(
        v.literal("active"),
        v.literal("pending"),
        v.literal("needs_details"),
      ),
      userId: v.optional(v.id("users")),
      createdAt: v.optional(v.number()),
      coachId: v.id("users"), // NEW: coachId instead of clerkOrganizationId
      clerkOrganizationId: v.optional(v.string()), // Keep for migration compatibility
    }),
  ),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "teacher") return null;

    return await ctx.db
      .query("teachers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
  },
});

/**
 * Create a "pending" teacher record. The user will be invited via the new invitation system.
 * NEW: Creates teacher record with coachId instead of clerkOrganizationId.
 */
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.array(v.string()),
    gradeBand: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    teacherId: v.id("teachers"),
  }),
  handler: async (ctx, args) => {
    const coachUser = await getCurrentUserOrThrow(ctx);
    if (coachUser?.role !== "coach") {
      throw new Error("Only coaches can create teachers.");
    }

    // Check teacher usage limit using the new system
    const teachers = await ctx.db
      .query("teachers")
      .withIndex("by_coach", (q) => q.eq("coachId", coachUser._id))
      .filter((q) => q.neq(q.field("status"), "pending"))
      .collect();

    // Basic limit check - assume free plan (1 teacher) for backend enforcement
    const basicLimit = 1; // Free plan limit
    if (teachers.length >= basicLimit) {
      throw new Error(
        `You have reached your teacher limit (${basicLimit}) for your plan. Upgrade for more.`,
      );
    }

    // NEW: Create teacher with direct coach relationship
    const teacherId = await ctx.db.insert("teachers", {
      ...args,
      status: "pending",
      coachId: coachUser._id, // NEW: Direct coach relationship
      createdAt: Date.now(),
    });
    // Note: No need to track usage in old system since we're using direct teacher counting now

    return { success: true, teacherId };
  },
});

/**
 * Create or update a teacher record for a user who has accepted an invitation.
 * NEW: Updated to work with the invitation-based flow.
 */
export const createFromUser = mutation({
  args: {
    userId: v.id("users"),
    subject: v.array(v.string()),
    gradeBand: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    teacherId: v.id("teachers"),
  }),
  handler: async (ctx, args) => {
    const coachUser = await getCurrentUserOrThrow(ctx);
    if (coachUser?.role !== "coach") {
      throw new Error("Only coaches can create teacher records.");
    }

    const teacherUser = await ctx.db.get(args.userId);
    if (!teacherUser) {
      throw new Error("User not found.");
    }
    if (teacherUser.role !== "teacher") {
      throw new Error("User does not have the teacher role.");
    }

    // Check if teacher record already exists for this user
    const existingTeacher = await ctx.db
      .query("teachers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // NEW: Verify that the teacher is assigned to this coach
    if (existingTeacher && existingTeacher.coachId !== coachUser._id) {
      throw new Error("This teacher is not assigned to you.");
    }

    if (existingTeacher) {
      // Update existing teacher record
      console.log(
        `Updating existing teacher record ${existingTeacher._id} for user ${args.userId}`,
      );
      await ctx.db.patch(existingTeacher._id, {
        subject: args.subject,
        gradeBand: args.gradeBand,
        status: "active",
      });
      return { success: true, teacherId: existingTeacher._id };
    } else {
      // Create new teacher record - this shouldn't happen in the new flow
      // but keeping for backwards compatibility
      console.log(`Creating new teacher record for user ${args.userId}`);
      const teacherId = await ctx.db.insert("teachers", {
        name: teacherUser.name,
        email: teacherUser.email || "",
        subject: args.subject,
        gradeBand: args.gradeBand,
        status: "active",
        userId: args.userId,
        coachId: coachUser._id, // NEW: Direct coach relationship
        createdAt: Date.now(),
      });
      return { success: true, teacherId };
    }
  },
});

/**
 * Update a teacher's details.
 */
export const update = mutation({
  args: {
    id: v.id("teachers"),
    name: v.string(),
    email: v.string(),
    subject: v.array(v.string()),
    gradeBand: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const teacher = await ctx.db.get(args.id);
    if (!teacher || !user) throw new Error("Teacher or current user not found");

    await _ensureIsCoachForTeacher(ctx, user, teacher); // NEW: Updated authorization

    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
    return { success: true };
  },
});

/**
 * Remove a teacher record.
 */
export const remove = mutation({
  args: { id: v.id("teachers") },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    const teacher = await ctx.db.get(args.id);
    if (!teacher || !user) throw new Error("Teacher or current user not found");

    await _ensureIsCoachForTeacher(ctx, user, teacher); // NEW: Updated authorization

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/**
 * INTERNAL: Find a teacher record for a user, used for linking after invitation acceptance.
 * NEW: Updated to work with coach-based relationships.
 */
export const internalFindAndLinkTeacher = internalMutation({
  args: { userId: v.id("users") },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("teachers"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.string(),
      subject: v.array(v.string()),
      gradeBand: v.string(),
      status: v.union(
        v.literal("active"),
        v.literal("pending"),
        v.literal("needs_details"),
      ),
      userId: v.optional(v.id("users")),
      createdAt: v.optional(v.number()),
      coachId: v.id("users"), // NEW: coachId instead of clerkOrganizationId
      clerkOrganizationId: v.optional(v.string()), // Keep for migration compatibility
    }),
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.email) {
      console.log(
        `internalFindAndLinkTeacher: User not found or no email for userId ${args.userId}`,
      );
      return null;
    }

    console.log(
      `internalFindAndLinkTeacher: Looking for teacher record with needs_details status for email ${user.email}`,
    );

    // NEW: Look for teacher records based on email and needs_details status (from invitation acceptance)
    const teacherRecord = await ctx.db
      .query("teachers")
      .withIndex("by_email", (q) => q.eq("email", user.email!))
      .filter((q) => q.eq(q.field("status"), "needs_details"))
      .first();

    if (teacherRecord) {
      console.log(
        `internalFindAndLinkTeacher: Found teacher record ${teacherRecord._id} with needs_details status, linking to user ${user._id}`,
      );
      await ctx.db.patch(teacherRecord._id, {
        userId: user._id,
        status: "active",
      });
      console.log(
        `internalFindAndLinkTeacher: Successfully linked and activated teacher record`,
      );
    } else {
      console.log(
        `internalFindAndLinkTeacher: No teacher record with needs_details status found for ${user.email}`,
      );
    }
    return teacherRecord;
  },
});

export const internalListByCoach = internalQuery({
  args: { coachId: v.id("users") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teachers")
      .withIndex("by_coach", (q) => q.eq("coachId", args.coachId))
      .collect();
  },
});
