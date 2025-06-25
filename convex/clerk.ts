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
      // Check if this email has a pending teacher record to determine the correct role
      const email = data.email_addresses[0]?.email_address;
      let defaultRole: "coach" | "teacher" = "coach";
      
      if (email) {
        const pendingTeacher = await ctx.db
          .query("teachers")
          .withIndex("by_email", (q) => q.eq("email", email))
          .filter(q => q.eq(q.field("status"), "pending"))
          .first();
        
        if (pendingTeacher) {
          defaultRole = "teacher";
          console.log(`Setting role to teacher for ${email} due to pending teacher record`);
        }
      }

      await ctx.db.insert("users", {
        ...userAttributes,
        role: defaultRole, // Use determined role based on pending teacher record
        preferences: {},
        createdAt: Date.now(),
        onboardingComplete: false,
      });
    } else {
      await ctx.db.patch(existingUser._id, userAttributes);
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
    // Safely extract fields we need from the webhook payload
    if (!data?.public_user_data?.user_id || !data?.organization?.id || !data?.role) {
      console.error("Invalid org membership webhook payload:", data);
      return;
    }

    const user = await ctx.runQuery(internal.users.internalGetUserByClerkId, {
      clerkId: data.public_user_data.user_id,
    });
    if (!user) return;

    const clerkRole = data.role;
    const organizationId = data.organization.id;

    // Map Clerk role to application role
    const CLERK_TO_APP_ROLE_MAPPING: Record<string, AppRole> = {
      "org:admin": "coach",
      "org:member": "teacher",
    };
    let targetRole = CLERK_TO_APP_ROLE_MAPPING[clerkRole] || "teacher";

    // Safety check: If there's a pending teacher record for this user,
    // they should be a teacher regardless of their Clerk role
    if (user.email) {
      const pendingTeacher = await ctx.db
        .query("teachers")
        .withIndex("by_email", (q) => q.eq("email", user.email))
        .filter(q => q.eq(q.field("status"), "pending"))
        .first();
      
      if (pendingTeacher) {
        targetRole = "teacher";
        console.log(`Overriding role for ${user.email} to teacher due to pending teacher record`);
      }
    }

    // Update user with org ID and new role
    await ctx.db.patch(user._id, {
      clerkOrganizationId: organizationId,
      role: targetRole,
    });

    // If the user is now a teacher, try to link their pending teacher record
    if (targetRole === "teacher") {
      await ctx.runMutation(internal.teachers.internalFindAndLinkTeacher, { userId: user._id });
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
        role: "coach",
        onboardingComplete: true,
      });
    }
  },
});