// convex/clerk.ts
import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

// --- TYPE-SAFE WEBHOOK VALIDATORS ---

// Minimal user webhook payload - only validate fields we actually use
const userWebhookPayload = v.any();

// Minimal org membership webhook payload - only validate fields we actually use
const orgMembershipWebhookPayload = v.any();

// Minimal organization webhook payload - only validate fields we actually use
const organizationWebhookPayload = v.any();

// --- WEBHOOK HANDLERS ---

/**
 * Upserts a user from a Clerk webhook.
 * NEW: Simplified for NON_ORG_APPROACH - defaults to "coach" for direct signups.
 */
export const upsertUser = internalMutation({
  args: { data: userWebhookPayload },
  handler: async (ctx, { data }) => {
    // Safely extract fields we need from the webhook payload
    if (
      !data?.id ||
      !data?.image_url ||
      !Array.isArray(data?.email_addresses)
    ) {
      console.error("Invalid user webhook payload:", data);
      return;
    }

    const email = data.email_addresses[0]?.email_address;
    console.log(
      `🔍 upsertUser: Processing user ${data.id} with email ${email}`,
    );

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", data.id))
      .unique();

    const userAttributes = {
      clerkId: data.id,
      name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
      email: email || "",
      imageUrl: data.image_url,
    };

    if (existingUser === null) {
      // NEW: Check for pending invitation to determine role
      let defaultRole: "coach" | "teacher" = "coach";
      let pendingInvitation: any = null;

      if (email) {
        // Check if there's a pending invitation for this email
        pendingInvitation = await ctx.db
          .query("invitations")
          .withIndex("by_email", (q) => q.eq("teacherEmail", email))
          .filter((q) => q.eq(q.field("status"), "pending"))
          .first();

        if (pendingInvitation) {
          defaultRole = "teacher";
          console.log(
            `✅ upsertUser: Found pending invitation ${pendingInvitation._id}, setting role to teacher for: ${email}`,
          );
        } else {
          console.log(
            `✅ upsertUser: No pending invitation found, setting role to coach for: ${email}`,
          );
        }
      }

      const userId = await ctx.db.insert("users", {
        ...userAttributes,
        role: defaultRole,
        preferences: {},
        createdAt: Date.now(),
        onboardingComplete: false,
        plan: "free", // New coaches start on the free plan
        subscriptionStatus: "active",
        subscriptionId: undefined,
        subscriptionStartedAt: Date.now(),
        subscriptionEndedAt: undefined,
      });
      console.log(
        `✅ upsertUser: Created user ${userId} with role ${defaultRole}, email: ${email}`,
      );

      // If this is a teacher with a pending invitation, automatically accept it
      if (defaultRole === "teacher" && pendingInvitation) {
        console.log(
          `🔗 upsertUser: Automatically accepting invitation ${pendingInvitation._id} for teacher ${email}`,
        );

        // Create teacher record with needs_details status (matches invitation acceptance flow)
        await ctx.db.insert("teachers", {
          userId: userId,
          name: userAttributes.name,
          email: userAttributes.email,
          subject: pendingInvitation.subject ? [pendingInvitation.subject] : [],
          gradeBand: pendingInvitation.gradeBand || "",
          status: "needs_details",
          coachId: pendingInvitation.coachId,
          createdAt: Date.now(),
        });

        // Mark invitation as accepted
        await ctx.db.patch(pendingInvitation._id, {
          status: "accepted",
          acceptedAt: Date.now(),
        });

        console.log(
          `✅ upsertUser: Automatically accepted invitation and created teacher record for ${email}`,
        );
      }
    } else {
      await ctx.db.patch(existingUser._id, userAttributes);
      console.log(
        `✅ upsertUser: Updated existing user ${existingUser._id}, email: ${email}`,
      );
    }
  },
});

/**
 * Deletes a user from a Clerk webhook.
 */
export const deleteUser = internalMutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
      .unique();
    if (user !== null) {
      await ctx.db.delete(user._id);
    }
  },
});

// ===== LEGACY ORGANIZATION HANDLERS (Keep for backwards compatibility) =====
// These handlers are kept for existing organization-based data but won't be used in NON_ORG_APPROACH

/**
 * LEGACY: Handles organization membership creation and updates from Clerk webhooks.
 * NOTE: Not used in NON_ORG_APPROACH but kept for backwards compatibility.
 */
export const handleOrgMembership = internalMutation({
  args: { data: orgMembershipWebhookPayload },
  handler: async (ctx, { data }) => {
    console.log(
      `⚠️ handleOrgMembership: Organization-based logic not used in NON_ORG_APPROACH`,
    );
    console.log(
      `📋 Received org membership webhook but ignoring for NON_ORG_APPROACH`,
    );

    // For backwards compatibility, we'll still log the event but take no action
    if (data?.public_user_data?.user_id && data?.organization?.id) {
      console.log(
        `📋 Would have processed: user ${data.public_user_data.user_id}, org ${data.organization.id}, role ${data.role}`,
      );
    }

    // No action taken - teacher roles are managed through invitation system
  },
});

/**
 * LEGACY: Handles organization membership deletion from Clerk webhooks.
 * NOTE: Not used in NON_ORG_APPROACH but kept for backwards compatibility.
 */
export const handleOrgMembershipDeleted = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    console.log(
      `⚠️ handleOrgMembershipDeleted: Organization-based logic not used in NON_ORG_APPROACH`,
    );

    // No action taken in NON_ORG_APPROACH
    if (data?.public_user_data?.user_id) {
      console.log(
        `📋 Would have removed org membership for user: ${data.public_user_data.user_id}`,
      );
    }
  },
});

/**
 * LEGACY: Handles organization creation from Clerk webhooks.
 * NOTE: Not used in NON_ORG_APPROACH but kept for backwards compatibility.
 */
export const handleOrganizationCreated = internalMutation({
  args: { data: organizationWebhookPayload },
  handler: async (ctx, { data }) => {
    console.log(
      `⚠️ handleOrganizationCreated: Organization-based logic not used in NON_ORG_APPROACH`,
    );

    // No action taken in NON_ORG_APPROACH
    if (data?.id && data?.created_by) {
      console.log(
        `📋 Would have processed org creation: ${data.id} by ${data.created_by}`,
      );
    }
  },
});


