import { v } from "convex/values";
import { query, mutation, internalQuery } from "./_generated/server";

/*
 * NOTE: This file is simplified to use Clerk's user management.
 * Most user management should be done through Clerk's API.
 * This file contains minimal functionality for user data specific to our app.
 */

// Store additional user metadata
export const storeMetadata = mutation({
  args: {
    preferences: v.optional(v.any()),
    role: v.union(v.literal("coach"), v.literal("teacher")),
    coachId: v.optional(v.id("users")),
    subscriptionStatus: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    subscriptionTier: v.optional(v.union(v.literal("basic"), v.literal("pro"))),
    imageUrl: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    // Check if user exists in our DB
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    const baseUser = {
      preferences: args.preferences ?? {},
      role: args.role,
      name: args.name ?? identity.name ?? "",
      email: args.email ?? identity.email ?? "",
      imageUrl: args.imageUrl ?? undefined,
      createdAt: Date.now(),
      organization: "", // Default value for schema compatibility
    };
    if (existingUser) {
      // Patch missing role/coachId for existing users (for testing before onboarding)
      let patchFields: any = { ...baseUser };
      if (!existingUser.role) {
        patchFields.role = "coach";
      }
      if (!existingUser.coachId) {
        patchFields.coachId = existingUser._id;
      }
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        ...patchFields,
        coachId: args.role === "teacher" ? args.coachId : patchFields.coachId,
        subscriptionStatus: args.role === "coach" ? args.subscriptionStatus : undefined,
        subscriptionTier: args.role === "coach" ? args.subscriptionTier : undefined,
      });
      return { success: true, userId: existingUser._id };
    } else {
      // Create new user record with default role/coachId for testing
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        ...baseUser,
        role: "coach",
        coachId: undefined, // will patch below
        subscriptionStatus: args.subscriptionStatus,
        subscriptionTier: args.subscriptionTier,
      });
      // Patch coachId to be their own userId
      await ctx.db.patch(userId, { coachId: userId });
      return { success: true, userId };
    }
  },
});

// Get the current authenticated user
export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

// Get a user by ID
export const getUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Create a new user in the system
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("coach"), v.literal("teacher")),
    coachId: v.optional(v.id("users")),
    subscriptionStatus: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    subscriptionTier: v.optional(v.union(v.literal("basic"), v.literal("pro"))),
    imageUrl: v.optional(v.string()),
    preferences: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (existingUser) {
      return { userId: existingUser._id, created: false };
    }
    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl ?? undefined,
      preferences: args.preferences ?? {},
      role: args.role,
      coachId: args.role === "teacher" ? args.coachId : undefined,
      subscriptionStatus: args.role === "coach" ? args.subscriptionStatus : undefined,
      subscriptionTier: args.role === "coach" ? args.subscriptionTier : undefined,
      createdAt: Date.now(),
      organization: "", // Default value for schema compatibility
    });
    return { userId, created: true };
  },
});

// Get a user by their Clerk ID
export const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    return user;
  },
});

// Update a user
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("coach"), v.literal("teacher"))),
    coachId: v.optional(v.id("users")),
    subscriptionStatus: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    subscriptionTier: v.optional(v.union(v.literal("basic"), v.literal("pro"))),
    imageUrl: v.optional(v.string()),
    preferences: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    type UpdateKeys = keyof Omit<typeof args, 'userId'>;
    // Add organization to the type
    type UpdatesWithOrg = Partial<typeof updates> & { organization?: string };
    const filteredUpdates: UpdatesWithOrg = {};
    (Object.keys(updates) as UpdateKeys[]).forEach((key) => {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    });
    if (filteredUpdates.organization === undefined) {
      filteredUpdates.organization = "";
    }
    await ctx.db.patch(userId, filteredUpdates);
    return { success: true };
  },
});

// Update subscription information for a user
export const updateSubscription = mutation({
  args: {
    userId: v.id("users"),
    subscriptionStatus: v.union(v.literal("active"), v.literal("inactive")),
    subscriptionTier: v.union(v.literal("basic"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      subscriptionStatus: args.subscriptionStatus,
      subscriptionTier: args.subscriptionTier,
      organization: "", // Default value for schema compatibility
    });
    return { success: true };
  },
});

export const internalGetUserByClerkId = internalQuery({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});


