// convex/clerk.ts
import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

type AppRole = "coach" | "teacher";

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
    if (!data?.id || !data?.image_url || !Array.isArray(data?.email_addresses)) {
      console.error("Invalid user webhook payload:", data);
      return;
    }

    console.log(`🔍 upsertUser: Processing user ${data.id} with email ${data.email_addresses[0]?.email_address}`);

    const existingUser = await ctx.runQuery(internal.users.internalGetUserByClerkId, {
      clerkId: data.id,
    });

    const userAttributes = {
      clerkId: data.id,
      name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
      email: data.email_addresses[0]?.email_address || "",
      imageUrl: data.image_url,
    };

    if (existingUser === null) {
      // NEW: NON_ORG_APPROACH - Default to "coach" for direct signups
      // Teacher role will be set during invitation acceptance process
      const defaultRole: "coach" = "coach";
      
      console.log(`✅ upsertUser: Setting role to coach for direct signup: ${data.email_addresses[0]?.email_address}`);

      const userId = await ctx.db.insert("users", {
        ...userAttributes,
        role: defaultRole,
        preferences: {},
        createdAt: Date.now(),
        onboardingComplete: false,
        // Remove clerkOrganizationId for NON_ORG_APPROACH
      });
      console.log(`✅ upsertUser: Created user ${userId} with role ${defaultRole}`);
    } else {
      await ctx.db.patch(existingUser._id, userAttributes);
      console.log(`✅ upsertUser: Updated existing user ${existingUser._id}`);
    }
  },
});

/**
 * Deletes a user from a Clerk webhook.
 */
export const deleteUser = internalMutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, { clerkUserId }) => {
    const user = await ctx.runQuery(internal.users.internalGetUserByClerkId, {
      clerkId: clerkUserId,
    });
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
    console.log(`⚠️ handleOrgMembership: Organization-based logic not used in NON_ORG_APPROACH`);
    console.log(`📋 Received org membership webhook but ignoring for NON_ORG_APPROACH`);
    
    // For backwards compatibility, we'll still log the event but take no action
    if (data?.public_user_data?.user_id && data?.organization?.id) {
      console.log(`📋 Would have processed: user ${data.public_user_data.user_id}, org ${data.organization.id}, role ${data.role}`);
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
    console.log(`⚠️ handleOrgMembershipDeleted: Organization-based logic not used in NON_ORG_APPROACH`);
    
    // No action taken in NON_ORG_APPROACH
    if (data?.public_user_data?.user_id) {
      console.log(`📋 Would have removed org membership for user: ${data.public_user_data.user_id}`);
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
    console.log(`⚠️ handleOrganizationCreated: Organization-based logic not used in NON_ORG_APPROACH`);
    
    // No action taken in NON_ORG_APPROACH
    if (data?.id && data?.created_by) {
      console.log(`📋 Would have processed org creation: ${data.id} by ${data.created_by}`);
    }
  },
});