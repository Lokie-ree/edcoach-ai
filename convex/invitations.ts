// Remove 'use node'; and all Node.js/Resend logic from this file
// Only keep queries, mutations, and internal functions here
// Import sendTeacherInvitation from './invitationActions' and re-export it

import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { getCurrentUserOrThrow } from "./auth";

/**
 * Accept a teacher invitation
 */
export const acceptInvitation = mutation({
  args: {
    token: v.string(),
  },
  returns: v.object({
    success: v.optional(v.boolean()),
    message: v.optional(v.string()),
    coachName: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    // Find the invitation by token
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (!invitation) {
      return {
        success: false,
        message: "Invalid or expired invitation",
      };
    }

    // Check if invitation has expired
    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(invitation._id, { status: "expired" });
      return {
        success: false,
        message: "This invitation has expired",
      };
    }

    // Get the coach who sent the invitation
    const coach = await ctx.db.get(invitation.coachId);
    if (!coach) {
      return {
        success: false,
        message: "Coach not found",
      };
    }

    // Update user role to teacher if not already
    if (user.role !== "teacher") {
      await ctx.db.patch(user._id, { role: "teacher" });
    }

    // Create teacher record
    await ctx.db.insert("teachers", {
      userId: user._id,
      name: user.name,
      email: user.email,
      subject: [], // Will be filled out during onboarding
      gradeBand: "", // Will be filled out during onboarding
      status: "needs_details",
      coachId: invitation.coachId,
      createdAt: Date.now(),
    });

    // Mark invitation as accepted
    await ctx.db.patch(invitation._id, {
      status: "accepted",
      acceptedAt: Date.now(),
    });

    return {
      success: true,
      message: "Welcome to the team!",
      coachName: coach.name,
    };
  },
});

/**
 * List invitations sent by the current coach
 */
export const listMyInvitations = query({
  args: {},
  returns: v.array(v.object({
    _id: v.optional(v.id("invitations")),
    _creationTime: v.optional(v.float64()),
    teacherEmail: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired"))),
    createdAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    acceptedAt: v.optional(v.number()),
    coachId: v.optional(v.id("users")),
    token: v.optional(v.string()),
  })),
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    if (user.role !== "coach") {
      throw new Error("Only coaches can view invitations");
    }

    return await ctx.db
      .query("invitations")
      .withIndex("by_coach", (q) => q.eq("coachId", user._id))
      .order("desc")
      .collect();
  },
});

/**
 * Get invitation details by token (for the invite acceptance page)
 */
export const getInvitationByToken = query({
  args: { token: v.string() },
  returns: v.union(
    v.object({
      _id: v.optional(v.id("invitations")),
      teacherEmail: v.optional(v.string()),
      coachName: v.optional(v.string()),
      status: v.optional(v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired"))),
      isExpired: v.optional(v.boolean()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) {
      return null;
    }

    const coach = await ctx.db.get(invitation.coachId);
    if (!coach) {
      return null;
    }

    const isExpired = invitation.expiresAt < Date.now();

    return {
      _id: invitation._id,
      teacherEmail: invitation.teacherEmail,
      coachName: coach.name,
      status: invitation.status,
      isExpired,
    };
  },
});

// ===== INTERNAL FUNCTIONS =====

export const internalCreateInvitation = internalMutation({
  args: {
    coachId: v.id("users"),
    teacherEmail: v.string(),
    token: v.string(),
    expiresAt: v.number(),
  },
  returns: v.id("invitations"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("invitations", {
      coachId: args.coachId,
      teacherEmail: args.teacherEmail,
      token: args.token,
      status: "pending",
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });
  },
});

export const internalGetPendingInviteByEmail = internalQuery({
  args: {
    coachId: v.id("users"),
    teacherEmail: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("invitations"),
      status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired")),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("teacherEmail", args.teacherEmail))
      .filter((q) => q.eq(q.field("coachId"), args.coachId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();
  },
});

export const internalUpdateInvitationStatus = internalMutation({
  args: {
    invitationId: v.id("invitations"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.invitationId, { status: args.status });
    return null;
  },
});

export { sendTeacherInvitation } from "./invitationActions"; 