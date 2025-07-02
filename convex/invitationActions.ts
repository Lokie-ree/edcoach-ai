"use node";

import { v } from "convex/values";
import { action, ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { sendEmail } from "./sendEmails";

// Helper to generate a unique invitation token (copied from invitations.ts)
function generateInviteToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    Date.now().toString(36)
  );
}

type SendTeacherInvitationArgs = {
  teacherEmail: string;
  teacherName: string;
};

type SendTeacherInvitationResult = {
  success: boolean;
  invitationId?: Id<"invitations">;
  message: string;
};

export const sendTeacherInvitation = action({
  args: {
    teacherEmail: v.string(),
    teacherName: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    invitationId: v.optional(v.id("invitations")),
    message: v.string(),
  }),
  handler: async (
    ctx: ActionCtx,
    args: SendTeacherInvitationArgs
  ): Promise<SendTeacherInvitationResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const coach: { _id: Id<"users">; role: string; name: string } | null =
      await ctx.runQuery(internal.users.internalGetUserByClerkId, {
        clerkId: identity.subject,
      });

    if (!coach || coach.role !== "coach") {
      throw new Error("Only coaches can send invitations");
    }

    // ENFORCE TEACHER LIMITS
    // Count current teachers for this coach
    const teachers = await ctx.runQuery(internal.teachers.internalListByCoach, { coachId: coach._id });
    // Get plan (use aiUsage for consistency)
    const aiUsage = await ctx.runQuery("plans:getAIUsageThisMonth" as any, { hasProPlan: undefined });
    const isProPlan = aiUsage.plan === "coach_pro";
    const maxTeachers = isProPlan ? 25 : 5;
    if (teachers.length >= maxTeachers) {
      return {
        success: false,
        message: `You have reached your teacher limit (${maxTeachers}) for the ${isProPlan ? "Coach Pro" : "Starter"} plan. Upgrade to Coach Pro for more.`,
      };
    }

    // Check if there's already a pending invitation for this email from this coach
    const existingInvite = await ctx.runQuery(
      internal.invitations.internalGetPendingInviteByEmail,
      {
        coachId: coach._id,
        teacherEmail: args.teacherEmail,
      }
    );

    if (existingInvite) {
      return {
        success: false,
        message: "An invitation has already been sent to this email address",
      };
    }

    // Generate unique token and expiration (7 days)
    const token = generateInviteToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    // Create invitation record
    const invitationId: Id<"invitations"> = await ctx.runMutation(
      internal.invitations.internalCreateInvitation,
      {
        coachId: coach._id,
        teacherEmail: args.teacherEmail,
        token,
        expiresAt,
      }
    );

    // Send email via Convex Resend component
    const senderEmail = process.env.RESEND_SENDER_EMAIL;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${appUrl}/invite?token=${token}`;

    if (!senderEmail) {
      console.error("Sender email not set in environment variables");
      return {
        success: false,
        invitationId,
        message: "Email sending is not configured. Please contact support.",
      };
    }

    try {
      await sendEmail(
        ctx,
        senderEmail,
        args.teacherEmail,
        `${coach.name} has invited you to join EdCoach as a teacher`,
        `
          <h2>You've been invited to EdCoach!</h2>
          <p>Hello ${args.teacherName},</p>
          <p><b>${coach.name}</b> has invited you to join their coaching team on EdCoach.</p>
          <p>Click the link below to accept your invitation and get started:</p>
          <p><a href="${inviteUrl}">${inviteUrl}</a></p>
          <p>This link will expire in 7 days.</p>
          <br />
          <p>If you have any questions, just reply to this email.</p>
          <p>— The EdCoach Team</p>
        `
      );
    } catch (error) {
      console.error(
        "Failed to send invitation email via Convex Resend component:",
        error
      );
      return {
        success: false,
        invitationId,
        message: "Failed to send invitation email. Please try again.",
      };
    }

    return {
      success: true,
      invitationId,
      message: "Invitation created and email sent successfully.",
    };
  },
}); 