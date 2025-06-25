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
 * Called when a user is created or updated in Clerk.
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
      // For new user creation, we need to determine if this is an organization invitation
      // Since organization invitations should create teachers, we default to "teacher"
      // Only organization creators (who create the org) should be coaches
      let defaultRole: "coach" | "teacher" = "teacher";
      
      // Check if this is an organization creator (they would have public metadata indicating this)
      // Organization creators typically get processed through organizationCreated webhook separately
      const isOrgCreator = data.public_metadata?.organizationCreator === true;
      
      if (isOrgCreator) {
        defaultRole = "coach";
        console.log(`✅ upsertUser: Setting role to coach for organization creator: ${data.email_addresses[0]?.email_address}`);
      } else {
        console.log(`✅ upsertUser: Setting role to teacher for invited user: ${data.email_addresses[0]?.email_address}`);
      }

      const userId = await ctx.db.insert("users", {
        ...userAttributes,
        role: defaultRole,
        preferences: {},
        createdAt: Date.now(),
        onboardingComplete: false,
        // Don't set clerkOrganizationId here - let handleOrgMembership do it
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

/**
 * Handles organization membership creation and updates from Clerk webhooks.
 * This is the central logic for assigning roles and linking users to organizations.
 */
export const handleOrgMembership = internalMutation({
  args: { data: orgMembershipWebhookPayload },
  handler: async (ctx, { data }) => {
    console.log(`🔍 handleOrgMembership: Received full payload:`, JSON.stringify(data, null, 2));
    
    // Log each field we're trying to extract
    console.log(`🔍 handleOrgMembership: user_id=${data?.public_user_data?.user_id}`);
    console.log(`🔍 handleOrgMembership: org_id=${data?.organization?.id}`);
    console.log(`🔍 handleOrgMembership: role=${data?.role}`);
    
    // Safely extract fields we need from the webhook payload
    if (!data?.public_user_data?.user_id || !data?.organization?.id || !data?.role) {
      console.error("❌ handleOrgMembership: Invalid org membership webhook payload:", data);
      return;
    }

    console.log(`✅ handleOrgMembership: Processing org membership webhook for user ${data.public_user_data.user_id}, org ${data.organization.id}, role ${data.role}`);

    const user = await ctx.runQuery(internal.users.internalGetUserByClerkId, {
      clerkId: data.public_user_data.user_id,
    });
    if (!user) {
      console.log(`⏳ handleOrgMembership: User ${data.public_user_data.user_id} not found yet, scheduling retry in 2 seconds...`);
      // User doesn't exist yet (user.created webhook hasn't fired), schedule a retry
      await ctx.scheduler.runAfter(2000, internal.clerk.handleOrgMembership, { data });
      return;
    }

    const clerkRole = data.role;
    const organizationId = data.organization.id;

    // Map Clerk role to application role
    const CLERK_TO_APP_ROLE_MAPPING: Record<string, AppRole> = {
      "org:admin": "coach",
      "org:member": "teacher",
    };
    const targetRole = CLERK_TO_APP_ROLE_MAPPING[clerkRole] || "teacher";
    
    console.log(`Processing org membership for ${user.email}: Clerk role=${clerkRole} → App role=${targetRole}`);

    // Update user with org ID and new role
    await ctx.db.patch(user._id, {
      clerkOrganizationId: organizationId,
      role: targetRole,
    });

    // If the user is now a teacher, handle teacher record creation/linking
    if (targetRole === "teacher") {
      console.log(`User ${user.email} has teacher role, checking for existing teacher record...`);
      
      // First try to link any existing pending teacher record
      const linkedTeacher = await ctx.runMutation(internal.teachers.internalFindAndLinkTeacher, { userId: user._id });
      
      if (linkedTeacher) {
        console.log(`Linked existing pending teacher record for ${user.email}`);
      } else {
        console.log(`No pending teacher record found for ${user.email}, creating new teacher record...`);
        
        try {
          const teacherId = await ctx.db.insert("teachers", {
            name: user.name,
            email: user.email,
            subject: [], // Empty - coach can fill later
            gradeBand: "", // Empty - coach can fill later
            status: "needs_details",
            userId: user._id,
            createdAt: Date.now(),
            clerkOrganizationId: organizationId,
          });
          console.log(`✅ Successfully auto-created teacher record ${teacherId} for ${user.email} with status "needs_details"`);
        } catch (error) {
          console.error(`❌ Failed to create teacher record for ${user.email}:`, error);
        }
      }
    } else {
      console.log(`User ${user.email} has role ${targetRole}, skipping teacher record creation`);
    }
  },
});

/**
 * Handles organization membership deletion from Clerk webhooks.
 * Removes the organization link from the user.
 */
export const handleOrgMembershipDeleted = internalMutation({
  args: { data: v.any() },
  handler: async (ctx, { data }) => {
    // Safely extract fields we need from the webhook payload
    if (!data?.public_user_data?.user_id) {
      console.error("Invalid org membership deleted webhook payload:", data);
      return;
    }

    const user = await ctx.runQuery(internal.users.internalGetUserByClerkId, {
      clerkId: data.public_user_data.user_id,
    });
    if (user) {
      await ctx.db.patch(user._id, {
        clerkOrganizationId: undefined,
      });
    }
  },
});

/**
 * Handles organization creation from Clerk webhooks.
 * Sets the organization creator as the admin and completes their onboarding.
 */
export const handleOrganizationCreated = internalMutation({
  args: { data: organizationWebhookPayload },
  handler: async (ctx, { data }) => {
    // Safely extract fields we need from the webhook payload
    if (!data?.id || !data?.created_by) {
      console.log("Organization created without creator or missing ID, skipping:", data?.id);
      return;
    }
    
    const user = await ctx.runQuery(internal.users.internalGetUserByClerkId, {
      clerkId: data.created_by,
    });
    
    if (user && !user.clerkOrganizationId) {
      // Update user with organization ID and ensure they're a coach
      await ctx.db.patch(user._id, {
        clerkOrganizationId: data.id,
        role: "coach", // Organization creators are always coaches
        onboardingComplete: true,
      });
      console.log(`Set organization creator ${user.email} as coach for org ${data.id}`);
    }
  },
});