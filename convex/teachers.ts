// convex/teachers.ts
import { v } from "convex/values";
import {
  internalMutation,
  query,
  mutation,
  internalQuery,
  action,
} from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { getCurrentUser, getCurrentUserOrThrow } from "./auth";
import { api, internal } from "./_generated/api";
import OpenAI from "openai";

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

export const getTeacherOverview = query({
  args: {},
  returns: v.object({
    total: v.number(),
    active: v.number(),
    needsDetails: v.number(),
    pending: v.number(),
    teachers: v.array(v.any()),
  }),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "coach") {
      return { total: 0, active: 0, needsDetails: 0, pending: 0, teachers: [] };
    }
    const teachers = await ctx.db
      .query("teachers")
      .withIndex("by_coach", (q) => q.eq("coachId", user._id))
      .collect();
    const total = teachers.length;
    const active = teachers.filter((t) => t.status === "active").length;
    const needsDetails = teachers.filter((t) => t.status === "needs_details").length;
    const pending = teachers.filter((t) => t.status === "pending").length;
    return { total, active, needsDetails, pending, teachers };
  },
});

/**
 * Set or update a teacher's PGP goal
 */
export const setPgpGoal = mutation({
  args: {
    teacherId: v.id("teachers"),
    text: v.string(),
    indicatorCode: v.string(),
    contextNotes: v.optional(v.string()),
    targetDate: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    if (user.role !== "coach") {
      throw new Error("Only coaches can set PGP goals");
    }

    // Verify the teacher belongs to this coach
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher || teacher.coachId !== user._id) {
      throw new Error("Teacher not found or not authorized");
    }

    await ctx.db.patch(args.teacherId, {
      pgpGoal: {
        text: args.text,
        indicatorCode: args.indicatorCode,
        contextNotes: args.contextNotes,
        setAt: Date.now(),
        targetDate: args.targetDate,
        progress: 0, // Start at 0% progress
      },
    });

    return null;
  },
});

/**
 * Get a teacher by ID (internal use)
 */
export const getTeacher = internalQuery({
  args: {
    teacherId: v.id("teachers"),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("teachers"),
      name: v.string(),
      email: v.string(),
      subject: v.array(v.string()),
      gradeBand: v.string(),
      status: v.union(v.literal("pending"), v.literal("active"), v.literal("needs_details")),
      coachId: v.id("users"),
      pgpGoal: v.optional(v.object({
        text: v.string(),
        indicatorCode: v.string(),
        contextNotes: v.optional(v.string()),
        setAt: v.number(),
        targetDate: v.optional(v.number()),
        progress: v.optional(v.number()),
      })),
    })
  ),
  handler: async (ctx, args) => {
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher) {
      return null;
    }

    // Ensure the returned object includes the pgpGoal field (even if undefined)
    return {
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject,
      gradeBand: teacher.gradeBand,
      status: teacher.status,
      coachId: teacher.coachId,
      pgpGoal: teacher.pgpGoal || undefined,
    };
  },
});

/**
 * Get a teacher by ID (public use)
 */
export const getTeacherById = query({
  args: {
    teacherId: v.id("teachers"),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("teachers"),
      name: v.string(),
      email: v.string(),
      subject: v.array(v.string()),
      gradeBand: v.string(),
      status: v.union(v.literal("pending"), v.literal("active"), v.literal("needs_details")),
      coachId: v.id("users"),
      pgpGoal: v.optional(v.object({
        text: v.string(),
        indicatorCode: v.string(),
        contextNotes: v.optional(v.string()),
        setAt: v.number(),
        targetDate: v.optional(v.number()),
        progress: v.optional(v.number()),
      })),
    })
  ),
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    if (user.role !== "coach") {
      throw new Error("Only coaches can view teacher details");
    }

    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher || teacher.coachId !== user._id) {
      throw new Error("Teacher not found or not authorized");
    }

    // Ensure the returned object includes the pgpGoal field (even if undefined)
    return {
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject,
      gradeBand: teacher.gradeBand,
      status: teacher.status,
      coachId: teacher.coachId,
      pgpGoal: teacher.pgpGoal || undefined,
    };
  },
});

/**
 * Get a teacher's PGP goal
 */
export const getPgpGoal = query({
  args: {
    teacherId: v.id("teachers"),
  },
  returns: v.union(
    v.null(),
    v.object({
      text: v.string(),
      indicatorCode: v.string(),
      contextNotes: v.optional(v.string()),
      setAt: v.number(),
      targetDate: v.optional(v.number()),
      progress: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    if (user.role !== "coach") {
      throw new Error("Only coaches can view PGP goals");
    }

    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher || teacher.coachId !== user._id) {
      throw new Error("Teacher not found or not authorized");
    }

    return teacher.pgpGoal || null;
  },
});

/**
 * Update PGP goal progress
 */
export const updatePgpProgress = mutation({
  args: {
    teacherId: v.id("teachers"),
    progress: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    if (user.role !== "coach") {
      throw new Error("Only coaches can update PGP progress");
    }

    if (args.progress < 0 || args.progress > 100) {
      throw new Error("Progress must be between 0 and 100");
    }

    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher || teacher.coachId !== user._id) {
      throw new Error("Teacher not found or not authorized");
    }

    if (!teacher.pgpGoal) {
      throw new Error("No PGP goal set for this teacher");
    }

    await ctx.db.patch(args.teacherId, {
      pgpGoal: {
        ...teacher.pgpGoal,
        progress: args.progress,
      },
    });

    return null;
  },
});

/**
 * AI-assisted PGP goal drafting
 */
export const draftPgpGoal = action({
  args: {
    indicatorCode: v.string(),
    contextNotes: v.optional(v.string()),
    teacherName: v.string(),
    subject: v.array(v.string()),
    gradeBand: v.string(),
    indicatorName: v.string(),
    indicatorDomain: v.optional(v.string()),
    indicatorOverview: v.optional(v.string()),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from database using runQuery
    const user = await ctx.runQuery(internal.users.internalGetUserByClerkId, {
      clerkId: identity.subject,
    });
    if (!user || user.role !== "coach") {
      throw new Error("Only coaches can draft PGP goals");
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are an expert educational coach helping to draft a Professional Growth Plan (PGP) goal for a teacher.

Teacher Context:
- Name: ${args.teacherName}
- Subject(s): ${args.subject.join(", ")}
- Grade Band: ${args.gradeBand}

Selected Indicator: ${args.indicatorName} (${args.indicatorCode})
Domain: ${args.indicatorDomain || "N/A"}
Overview: ${args.indicatorOverview || "N/A"}

${args.contextNotes ? `Coach's Context Notes: ${args.contextNotes}` : ""}

Please draft a clear, specific, and actionable PGP goal that:
1. Focuses on improving the selected indicator
2. Is specific to the teacher's subject and grade level
3. Includes measurable outcomes
4. Is written in professional, growth-oriented language
5. Is 2-3 sentences long

Return only the goal text, no additional formatting or explanations.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.3,
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No content in AI response");
      }

      // Log token usage
      const promptTokens = response.usage?.prompt_tokens ?? 0;
      const completionTokens = response.usage?.completion_tokens ?? 0;
      const totalTokens = response.usage?.total_tokens ?? 0;

      const PROMPT_COST_PER_1K = 0.00015;
      const COMPLETION_COST_PER_1K = 0.0006;
      const promptCost = (promptTokens * PROMPT_COST_PER_1K) / 1000;
      const completionCost = (completionTokens * COMPLETION_COST_PER_1K) / 1000;
      const totalCost = promptCost + completionCost;

      await ctx.runMutation(internal.aiFeedbackMutations.logTokenUsage, {
        userId: user._id,
        action: "draftPgpGoal",
        model: "gpt-4o-mini",
        promptTokens,
        completionTokens,
        totalTokens,
        cost: totalCost,
        isCached: false,
        timestamp: Date.now(),
        metadata: {
          indicatorCode: args.indicatorCode,
          teacherName: args.teacherName,
        },
      });

      return content.trim();
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate PGP goal draft");
    }
  },
});
