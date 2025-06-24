// convex/onboarding.ts
import { v } from "convex/values";
import { action, mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUserOrThrow } from "./auth";

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;

/**
 * Completes the onboarding process for a user.
 * Preserves their existing role and links any pending records.
 */
export const complete = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    role: v.optional(v.union(v.literal("teacher"), v.literal("coach"))),
    message: v.optional(v.string()),
  }),
  handler: async (ctx): Promise<{
    success: boolean;
    role?: "teacher" | "coach";
    message?: string;
  }> => {
    const user = await getCurrentUserOrThrow(ctx);
    if (user.onboardingComplete) {
      return { success: true, message: "Already complete." };
    }

    // If user is a teacher, try to link any pending teacher record
    if (user.role === "teacher") {
      await ctx.runMutation(internal.teachers.internalFindAndLinkTeacher, { userId: user._id });
    }

    // Preserve the user's existing role (assigned by Clerk or organization membership)
    await ctx.db.patch(user._id, {
      onboardingComplete: true,
    });

    return { success: true, role: user.role };
  },
});

/**
 * Updates a user with their organization ID and completes onboarding.
 * Called internally when a coach creates an organization.
 */
export const updateUserOrganization = internalMutation({
  args: {
    userId: v.id("users"),
    clerkOrganizationId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      clerkOrganizationId: args.clerkOrganizationId,
      onboardingComplete: true,
    });
    return null;
  },
});

/**
 * Creates a new organization in Clerk for a coach.
 * This is an action because it makes an external API call.
 */
export const createCoachOrganization = action({
  args: {
    organizationName: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    organizationId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    if (!CLERK_SECRET_KEY) throw new Error("CLERK_SECRET_KEY is not set.");

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.runQuery(internal.users.internalGetUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user || user.role !== "coach") {
      throw new Error("Only coaches can create organizations.");
    }
    if (user.clerkOrganizationId) {
      throw new Error("User already belongs to an organization.");
    }

    // Create organization via Clerk REST API
    const response = await fetch("https://api.clerk.com/v1/organizations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: args.organizationName,
        created_by: identity.subject, // This makes the user an admin
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create organization: ${errorText}`);
    }

    const clerkOrganization = await response.json();

    // Update the user with the organization ID immediately
    // The organizationMembership.created webhook will also fire, but this ensures immediate update
    await ctx.runMutation(internal.onboarding.updateUserOrganization, {
      userId: user._id,
      clerkOrganizationId: clerkOrganization.id,
    });

    return { success: true, organizationId: clerkOrganization.id };
  },
});

