// convex/users.ts
import { v } from "convex/values";
import { query, internalQuery, mutation } from "./_generated/server";
import { getCurrentUser } from "./auth";


// Reusable validator for the user object to avoid repetition
export const vUser = v.object({
  _id: v.id("users"),
  _creationTime: v.number(),
  clerkId: v.string(),
  name: v.string(),
  email: v.string(),
  role: v.union(v.literal("coach"), v.literal("teacher")),
  clerkOrganizationId: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  preferences: v.optional(v.any()),
  createdAt: v.number(),
  onboardingComplete: v.optional(v.boolean()),
  plan: v.union(v.literal("coach_starter"), v.literal("coach_pro")),
  subscriptionStatus: v.union(
    v.literal("active"),
    v.literal("past_due"),
    v.literal("canceled"),
    v.literal("incomplete"),
    v.literal("trialing"),
    v.literal("unpaid")
  ),
  subscriptionId: v.optional(v.string()),
  subscriptionStartedAt: v.optional(v.number()),
  subscriptionEndedAt: v.optional(v.number()),
});

/**
 * Get the currently authenticated user's full record.
 */
export const current = query({
  args: {},
  returns: v.union(vUser, v.null()),
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

/**
 * DEBUG: Create or sync user from Clerk (for testing)
 */
export const createOrSyncFromClerk = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    userId: v.optional(v.id("users")),
    message: v.string(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { success: false, message: "Not authenticated" };
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existingUser) {
      return { 
        success: true, 
        userId: existingUser._id,
        message: "User already exists" 
      };
    }

    // Create user with basic info from Clerk
    const userId = await ctx.db.insert("users", {
      clerkId: identity.subject,
      name: identity.name || "User",
      email: identity.email || "",
      role: "coach", // Default role
      imageUrl: identity.pictureUrl,
      preferences: {},
      createdAt: Date.now(),
      onboardingComplete: false,
      plan: "coach_starter",
      subscriptionStatus: "active",
      subscriptionId: undefined,
      subscriptionStartedAt: Date.now(),
      subscriptionEndedAt: undefined,
    });

    return { 
      success: true, 
      userId,
      message: "User created successfully" 
    };
  },
});

/**
 * Get a user by their Convex document ID.
 * Enforces permissions:
 * - Coaches can view any user within their organization.
 * - Teachers can view their own profile and their coach's profile.
 */
export const getById = query({
  args: { userId: v.id("users") },
  returns: v.union(vUser, v.null()),
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      // Should be caught by authenticatedQuery, but as a safeguard
      throw new Error("Not authenticated");
    }

    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      return null;
    }

    // Define authorization conditions for clarity
    const isRequestingSelf = currentUser._id === targetUser._id;
    const isCoachViewingOrgMember =
      currentUser.role === "coach" &&
      currentUser.clerkOrganizationId === targetUser.clerkOrganizationId;
    const isTeacherViewingOrgMember =
      currentUser.role === "teacher" &&
      currentUser.clerkOrganizationId === targetUser.clerkOrganizationId;

    // Allow access if any condition is met
    if (isRequestingSelf || isCoachViewingOrgMember || isTeacherViewingOrgMember) {
      return targetUser;
    }

    // If no "allow" conditions are met, deny access
    throw new Error("Unauthorized: You do not have permission to view this user's data.");
  },
});

/**
 * INTERNAL: Get a user by their Clerk ID. Unauthenticated.
 * For use in other backend functions (like webhooks) only.
 */
export const internalGetUserByClerkId = internalQuery({
  args: { clerkId: v.string() },
  returns: v.union(vUser, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

/**
 * Placeholder for checking AI usage.
 * In a real app, this would query aiUsageLogs.
 */
export const checkAIUsageLimit = query({
  args: {},
  returns: v.object({
    canGenerate: v.boolean(),
    usageThisMonth: v.number(),
    limit: v.number(),
  }),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return { canGenerate: false, usageThisMonth: 0, limit: 0 };
    }
    // For now, allow unlimited AI usage.
    return {
      canGenerate: true,
      usageThisMonth: 0,
      limit: 999999,
    };
  },
});