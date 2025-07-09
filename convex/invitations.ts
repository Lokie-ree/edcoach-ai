import { v } from "convex/values";
import {
  query,
  mutation,
  action,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { getCurrentUserOrThrow } from "./auth";
import { api, internal } from "./_generated/api";

// SINGLE function to handle invitations
export const inviteTeacher = action({
  args: {
    teacherEmail: v.string(),
    teacherName: v.string(),
    subject: v.optional(v.string()),
    gradeBand: v.optional(v.string()),
    hasProPlan: v.optional(v.boolean()),
    hasStarterPlan: v.optional(v.boolean()),
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (
    ctx,
    args: {
      teacherEmail: string;
      teacherName: string;
      subject?: string;
      gradeBand?: string;
      hasProPlan?: boolean;
      hasStarterPlan?: boolean;
    },
  ): Promise<{ success: boolean; message: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get coach from users table
    const coach = await ctx.runQuery(internal.users.internalGetUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!coach || coach.role !== "coach") {
      return { success: false, message: "Only coaches can send invitations" };
    }

    // Check if invitation already exists
    const existingInvite = await ctx.runQuery(internal.invitations.getByEmail, {
      email: args.teacherEmail,
      coachId: coach._id,
    });

    if (existingInvite) {
      return {
        success: false,
        message: "Invitation already sent to this email",
      };
    }

    // Check teacher usage limit using proper plan detection
    const teacherUsage = await ctx.runQuery(api.plans.getTeacherUsage, {
      hasProPlan: args.hasProPlan,
      hasStarterPlan: args.hasStarterPlan,
    });

    if (teacherUsage.isOverLimit) {
      return {
        success: false,
        message: `You have reached your teacher limit (${teacherUsage.teacherLimit}) for your plan. Upgrade for more.`,
      };
    }

    // Create invitation with simple token
    const token = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    await ctx.runMutation(internal.invitations.create, {
      coachId: coach._id,
      teacherEmail: args.teacherEmail,
      token,
      expiresAt,
      subject: args.subject,
      gradeBand: args.gradeBand,
    });
    // Note: No need to track usage in old system since we're using direct teacher counting now

    // Send email using simple fetch (no Resend component needed)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${appUrl}/invite?token=${token}`;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_SENDER_EMAIL,
          to: args.teacherEmail,
          subject: `${coach.name} has invited you to join EdCoach`,
          html: `
            <h2>You've been invited to EdCoach!</h2>
            <p>Hello ${args.teacherName},</p>
            <p><b>${coach.name}</b> has invited you to join their coaching team.</p>
            <p><a href="${inviteUrl}">Accept Invitation</a></p>
            <p>This link expires in 7 days.</p>
          `,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send email: ${response.statusText}`);
      }

      return { success: true, message: "Invitation sent successfully!" };
    } catch (error) {
      console.error("Email sending failed:", error);
      return { success: false, message: "Failed to send invitation email" };
    }
  },
});

// SINGLE function to accept invitations
export const acceptInvitation = mutation({
  args: { token: v.string() },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    // Get identity from Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, message: "Not authenticated" };
    }

    // Check if user exists in database, create if not
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      // Create user since they don't exist yet
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        name: identity.name || "User",
        email: identity.email || "",
        role: "teacher", // They're accepting a teacher invitation
        imageUrl: identity.pictureUrl,
        preferences: {},
        createdAt: Date.now(),
        onboardingComplete: false,
        plan: "free", // Teachers don't need paid plans
        subscriptionStatus: "active",
        subscriptionId: undefined,
        subscriptionStartedAt: Date.now(),
        subscriptionEndedAt: undefined,
      });

      // Get the newly created user
      user = await ctx.db.get(userId);
      if (!user) {
        return { success: false, message: "Failed to create user record" };
      }
    }

    // Get invitation
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (!invitation) {
      return { success: false, message: "Invalid or expired invitation" };
    }

    if (invitation.expiresAt < Date.now()) {
      await ctx.db.patch(invitation._id, { status: "expired" });
      return { success: false, message: "Invitation has expired" };
    }

    // Email validation
    if (user.email.toLowerCase() !== invitation.teacherEmail.toLowerCase()) {
      return {
        success: false,
        message: "Please sign in with the email that received the invitation",
      };
    }

    // Get coach
    const coach = await ctx.db.get(invitation.coachId);
    if (!coach) {
      return { success: false, message: "Coach not found" };
    }

    // Update user role to teacher (if not already)
    await ctx.db.patch(user._id, { role: "teacher" });

    // Check if teacher record already exists
    let teacherRecord = await ctx.db
      .query("teachers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!teacherRecord) {
      // Check if there's a pending teacher record by email (from old system)
      const pendingTeacher = await ctx.db
        .query("teachers")
        .withIndex("by_email", (q) => q.eq("email", user.email))
        .filter((q) => q.eq(q.field("status"), "pending"))
        .first();

      if (pendingTeacher) {
        // Link existing pending teacher record
        await ctx.db.patch(pendingTeacher._id, {
          userId: user._id,
          status: "needs_details", // Will be updated during onboarding
        });
      } else {
        // Create new teacher record with needs_details status (matches onboarding expectation)
        await ctx.db.insert("teachers", {
          userId: user._id,
          name: user.name,
          email: user.email,
          subject: invitation.subject ? [invitation.subject] : [],
          gradeBand: invitation.gradeBand || "",
          status: "needs_details", // Changed from "active" to "needs_details"
          coachId: invitation.coachId,
          createdAt: Date.now(),
        });
      }
    }

    // Mark invitation as accepted
    await ctx.db.patch(invitation._id, {
      status: "accepted",
      acceptedAt: Date.now(),
    });

    // Set onboardingComplete to false so they go through onboarding
    await ctx.db.patch(user._id, { onboardingComplete: false });

    return { success: true, message: "Welcome to the team!" };
  },
});

// Simplified queries
export const getInvitationByToken = query({
  args: { token: v.string() },
  returns: v.union(
    v.object({
      teacherEmail: v.string(),
      coachName: v.string(),
      status: v.string(),
      isExpired: v.boolean(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!invitation) return null;

    const coach = await ctx.db.get(invitation.coachId);
    if (!coach) return null;

    return {
      teacherEmail: invitation.teacherEmail,
      coachName: coach.name,
      status: invitation.status,
      isExpired: invitation.expiresAt < Date.now(),
    };
  },
});

export const listMyInvitations = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("invitations"),
      teacherEmail: v.string(),
      status: v.string(),
      createdAt: v.number(),
      acceptedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    if (user.role !== "coach") {
      throw new Error("Only coaches can view invitations");
    }

    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_coach", (q) => q.eq("coachId", user._id))
      .order("desc")
      .collect();

    // Map to only return the fields specified in the validator
    return invitations.map((invitation) => ({
      _id: invitation._id,
      teacherEmail: invitation.teacherEmail,
      status: invitation.status,
      createdAt: invitation.createdAt,
      acceptedAt: invitation.acceptedAt,
    }));
  },
});

// Internal functions
export const create = internalMutation({
  args: {
    coachId: v.id("users"),
    teacherEmail: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    subject: v.optional(v.string()),
    gradeBand: v.optional(v.string()),
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
      subject: args.subject,
      gradeBand: args.gradeBand,
    });
  },
});

// FIX: Map the returned object to match the validator
export const getByEmail = internalQuery({
  args: {
    email: v.string(),
    coachId: v.id("users"),
  },
  returns: v.union(
    v.object({
      _id: v.id("invitations"),
      status: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("teacherEmail", args.email))
      .filter((q) => q.eq(q.field("coachId"), args.coachId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    // Return null if no invitation found
    if (!invitation) {
      return null;
    }

    // Map to only return the fields specified in the validator
    return {
      _id: invitation._id,
      status: invitation.status,
    };
  },
});
