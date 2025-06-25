// convex/teachers.ts
import { v } from "convex/values";
import { internalMutation, query, mutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { getCurrentUser, getCurrentUserOrThrow } from "./auth";

// Reusable authorization helper for mutations
async function _ensureIsCoachInOrg(ctx: any, user: Doc<"users">, teacher: Doc<"teachers">) {
  if (user.role !== "coach") {
    throw new Error("Action requires coach permissions.");
  }
  if (teacher.clerkOrganizationId !== user.clerkOrganizationId) {
    throw new Error("You can only manage teachers in your own organization.");
  }
}

/**
 * List all teachers for the current user's organization.
 * This is now highly performant thanks to the `by_organization` index.
 * It also finds users with the 'teacher' role who don't have a teacher record yet.
 */
export const list = query({
  args: {},
  returns: v.array(v.any()),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "coach" || !user.clerkOrganizationId) {
      return [];
    }

    // 1. Efficiently get all users with 'teacher' role in the org
    const orgTeacherUsers = await ctx.db
      .query("users")
      .withIndex("by_organization", (q) => q.eq("clerkOrganizationId", user.clerkOrganizationId!))
      .filter((q) => q.eq(q.field("role"), "teacher"))
      .collect();

    // 2. Efficiently get all teacher records in the org
    const orgTeachers = await ctx.db
      .query("teachers")
      .withIndex("by_organization", (q) => q.eq("clerkOrganizationId", user.clerkOrganizationId!))
      .collect();

    // 3. Create a map for quick lookups
    const teacherMap = new Map(orgTeachers.map(t => [t.userId, t]));

    // 4. Merge the two lists
    const result = orgTeacherUsers.map(u => {
      const teacherRecord = teacherMap.get(u._id);
      if (teacherRecord) {
        // User has a full teacher record
        return { ...teacherRecord, isUserRecord: false };
      } else {
        // User exists but needs teacher details filled out
        return {
          _id: u._id,
          _creationTime: u._creationTime,
          name: u.name,
          email: u.email || "",
          subject: [],
          gradeBand: "",
          status: "needs_details" as const,
          userId: u._id,
          isUserRecord: true,
        };
      }
    });

    // Add pending teachers who don't have a user record yet
    const pendingTeachers = orgTeachers.filter(t => t.status === 'pending' && !t.userId);
    result.push(...pendingTeachers.map(t => ({...t, isUserRecord: false})));

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
      status: v.union(v.literal("active"), v.literal("pending"), v.literal("needs_details")),
      userId: v.optional(v.id("users")),
      createdAt: v.optional(v.number()),
      clerkOrganizationId: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "teacher") return null;

    return await ctx.db
      .query("teachers")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .first();
  },
});

/**
 * Create a "pending" teacher record. The user will be invited via Clerk.
 * This teacher is not yet linked to a user account.
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
    if (coachUser?.role !== "coach" || !coachUser.clerkOrganizationId) {
      throw new Error("Only coaches in an organization can create teachers.");
    }

    const teacherId = await ctx.db.insert("teachers", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
      clerkOrganizationId: coachUser.clerkOrganizationId, // <-- Add org ID
    });

    return { success: true, teacherId };
  },
});

/**
 * Create or update a teacher record for a user who is already in the organization.
 * This will update an existing auto-created teacher record if one exists,
 * or create a new one if none exists.
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
    if (coachUser?.role !== "coach" || !coachUser.clerkOrganizationId) {
      throw new Error("Only coaches can create teacher records.");
    }

    const teacherUser = await ctx.db.get(args.userId);
    if (!teacherUser || teacherUser.clerkOrganizationId !== coachUser.clerkOrganizationId) {
      throw new Error("User not found or not in your organization.");
    }
    if (teacherUser.role !== "teacher") {
        throw new Error("User does not have the teacher role.");
    }

    // Check if teacher record already exists for this user
    const existingTeacher = await ctx.db
      .query("teachers")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .first();

    if (existingTeacher) {
      // Update existing teacher record
      console.log(`Updating existing teacher record ${existingTeacher._id} for user ${args.userId}`);
      await ctx.db.patch(existingTeacher._id, {
        subject: args.subject,
        gradeBand: args.gradeBand,
        status: "active",
      });
      return { success: true, teacherId: existingTeacher._id };
    } else {
      // Create new teacher record
      console.log(`Creating new teacher record for user ${args.userId}`);
      const teacherId = await ctx.db.insert("teachers", {
        name: teacherUser.name,
        email: teacherUser.email || "",
        subject: args.subject,
        gradeBand: args.gradeBand,
        status: "active",
        userId: args.userId,
        createdAt: Date.now(),
        clerkOrganizationId: coachUser.clerkOrganizationId,
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

    await _ensureIsCoachInOrg(ctx, user, teacher);

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

    await _ensureIsCoachInOrg(ctx, user, teacher);

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/**
 * INTERNAL: Find a teacher record for a user, used for linking.
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
        status: v.union(v.literal("active"), v.literal("pending"), v.literal("needs_details")),
        userId: v.optional(v.id("users")),
        createdAt: v.optional(v.number()),
        clerkOrganizationId: v.optional(v.string()),
      })
    ),
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user || !user.email) {
            console.log(`internalFindAndLinkTeacher: User not found or no email for userId ${args.userId}`);
            return null;
        }

        console.log(`internalFindAndLinkTeacher: Looking for pending teacher record for email ${user.email}`);
        
        const teacherRecord = await ctx.db
            .query("teachers")
            .withIndex("by_email", (q) => q.eq("email", user.email!))
            .filter(q => q.eq(q.field("status"), "pending"))
            .first();

        if (teacherRecord) {
            console.log(`internalFindAndLinkTeacher: Found pending teacher record ${teacherRecord._id}, linking to user ${user._id}`);
            await ctx.db.patch(teacherRecord._id, {
                userId: user._id,
                status: "active",
                clerkOrganizationId: user.clerkOrganizationId,
            });
            console.log(`internalFindAndLinkTeacher: Successfully linked and activated teacher record`);
        } else {
            console.log(`internalFindAndLinkTeacher: No pending teacher record found for ${user.email}`);
        }
        return teacherRecord;
    }
});