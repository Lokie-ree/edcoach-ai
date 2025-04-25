import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/*
 * NOTE: This file is simplified to use Clerk's user management.
 * Most user management should be done through Clerk's API.
 * This file contains minimal functionality for user data specific to our app.
 */

// Store additional user metadata
export const storeMetadata = mutation({
  args: {
    role: v.optional(v.string()),
    preferences: v.optional(v.any()),
    organization: v.string(),
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

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        role: args.role,
        preferences: args.preferences,
        organization: args.organization,
      });
      return { success: true, userId: existingUser._id };
    } else {
      // Create new user record
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        name: identity.name ?? "",
        email: identity.email ?? "",
        role: args.role ?? "user",
        organization: args.organization,
        preferences: args.preferences ?? {},
        createdAt: Date.now(),
      });
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
    role: v.string(),
    organization: v.string(),
    imageUrl: v.optional(v.string()),
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
      role: args.role,
      organization: args.organization,
      imageUrl: args.imageUrl,
      createdAt: Date.now(),
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

// List users with optional filtering by role
export const listUsers = query({
  args: {
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let users;
    if (args.role) {
      // Query with index if role is provided
      users = await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role!))
        .collect();
    } else {
      // Query all users if no role is specified
      users = await ctx.db.query("users").collect();
    }
    return users;
  },
});

// Update a user
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.string()),
    organization: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    // Define the type for the keys we expect in updates
    type UpdateKeys = keyof Omit<typeof args, 'userId'>;
    
    const filteredUpdates: Partial<typeof updates> = {};

    // Build updates object only with defined values
    (Object.keys(updates) as UpdateKeys[]).forEach((key) => {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Only update if there are changes
    if (Object.keys(filteredUpdates).length === 0) {
      return { success: false, message: "No updates provided" };
    }

    await ctx.db.patch(userId, filteredUpdates);
    return { success: true };
  },
});

// Update subscription information for a user
export const updateSubscription = mutation({
  args: {
    userId: v.id("users"),
    subscriptionStatus: v.string(),
    subscriptionTier: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      subscriptionStatus: args.subscriptionStatus,
      subscriptionTier: args.subscriptionTier,
    });
    
    return { success: true };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.string(),
    organization: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Check if user exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (user) {
      // Update existing user
      await ctx.db.patch(user._id, {
        name: args.name,
        email: args.email,
        role: args.role,
        organization: args.organization,
      });
      return { success: true };
    } else {
      // Create new user
      await ctx.db.insert("users", {
        clerkId: identity.subject,
        name: args.name,
        email: args.email,
        role: args.role,
        organization: args.organization,
        createdAt: Date.now(),
      });
      return { success: true };
    }
  },
}); 