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
    subscriptionStatus: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    subscriptionTier: v.optional(v.union(v.literal("basic"), v.literal("pro"))),
    imageUrl: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    clerkOrganizationId: v.optional(v.string()),
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
      clerkOrganizationId: args.clerkOrganizationId,
    };
    if (existingUser) {
      // Patch missing role for existing users (for testing before onboarding)
      let patchFields: any = { ...baseUser };
      if (!existingUser.role) {
        patchFields.role = "coach";
      }
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        ...patchFields,
        subscriptionStatus: args.role === "coach" ? args.subscriptionStatus : undefined,
        subscriptionTier: args.role === "coach" ? args.subscriptionTier : undefined,
      });
      return { success: true, userId: existingUser._id };
    } else {
      // Create new user record
      const userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        ...baseUser,
        role: "coach",
        subscriptionStatus: args.subscriptionStatus,
        subscriptionTier: args.subscriptionTier,
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

// Get a user by ID (alternative naming for consistency)
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  returns: v.any(),
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
      subscriptionStatus: args.subscriptionStatus,
      subscriptionTier: args.subscriptionTier,
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

// Update a user
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("coach"), v.literal("teacher"))),
    subscriptionStatus: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    subscriptionTier: v.optional(v.union(v.literal("basic"), v.literal("pro"))),
    imageUrl: v.optional(v.string()),
    preferences: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    type UpdateKeys = keyof Omit<typeof args, 'userId'>;
    const filteredUpdates: Partial<typeof updates> = {};
    (Object.keys(updates) as UpdateKeys[]).forEach((key) => {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    });
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

// Legacy onboarding functions - kept for backward compatibility during migration
export const upsertUserOnboarding = mutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("coach"), v.literal("teacher")),
  },
  handler: async (ctx, args) => {
    // Redirect to simplified onboarding
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        role: "coach", // Always default to coach
        subscriptionTier: "basic",
        subscriptionStatus: "inactive",
        onboardingComplete: true,
      });
      return { userId: existingUser._id, created: false };
    } else {
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        name: args.name,
        email: args.email,
        role: "coach",
        subscriptionTier: "basic",
        subscriptionStatus: "inactive",
        onboardingComplete: true,
        imageUrl: identity.pictureUrl,
        preferences: {},
        createdAt: Date.now(),
      });
      return { userId, created: true };
    }
  },
});

export const completeOnboarding = mutation({
  args: {
    clerkId: v.string(),
    subscriptionTier: v.optional(v.union(v.literal("basic"), v.literal("pro"))),
  },
  handler: async (ctx, args) => {
    // Redirect to simplified onboarding completion
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) throw new Error("User not found");
    
    await ctx.db.patch(user._id, {
      role: "coach",
      subscriptionTier: args.subscriptionTier || "basic",
      subscriptionStatus: "inactive",
      onboardingComplete: true,
    });
    return { success: true };
  },
});

// Auto-role assignment onboarding - detects coach vs teacher based on email
export const completeSimplifiedOnboarding = mutation({
  args: {
    clerkOrganizationId: v.optional(v.string()),
  },
  returns: v.object({ 
    success: v.boolean(), 
    userId: v.id("users"),
    role: v.union(v.literal("coach"), v.literal("teacher"))
  }),
  handler: async (ctx, args) => {
    console.log("completeSimplifiedOnboarding called");
    const identity = await ctx.auth.getUserIdentity();
    console.log("Identity retrieved:", identity ? "Found" : "None");
    if (!identity) {
      console.log("No authentication identity found");
      throw new Error("Not authenticated");
    }
    console.log("Clerk ID:", identity.subject);
    console.log("Clerk name:", identity.name);
    console.log("Clerk email:", identity.email);
    const userEmail = identity.email;
    if (!userEmail) {
      throw new Error("No email found in Clerk identity");
    }
    // Check if this email exists as a teacher
    const teacherRecord = await ctx.db
      .query("teachers")
      .filter((q) => q.eq(q.field("email"), userEmail))
      .first();
    // Determine role
    const role = teacherRecord ? ("teacher" as const) : ("coach" as const);
    // Check if user already exists in users table
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    console.log("Existing user found:", existingUser ? "Yes" : "No");
    if (existingUser) {
      console.log("Updating existing user:", existingUser._id);
      // Update existing user with complete onboarding
      const updateData: any = {
        name: identity.name || existingUser.name,
        email: userEmail,
        role: role,
        onboardingComplete: true,
      };
      if (args.clerkOrganizationId) {
        updateData.clerkOrganizationId = args.clerkOrganizationId;
      }
      console.log("About to update user with data:", updateData);
      await ctx.db.patch(existingUser._id, updateData);
      console.log("User updated successfully");
      // If this is a teacher, update their status to active
      if (teacherRecord) {
        console.log("Updating teacher status to active for teacher:", teacherRecord._id);
        await ctx.db.patch(teacherRecord._id, {
          status: "active",
        });
        console.log("Teacher status updated to active");
      }
      // Verify the user was updated with all fields
      const updatedUser = await ctx.db.get(existingUser._id);
      console.log("Updated user verification:", updatedUser);
      return { success: true, userId: existingUser._id, role: role };
    }
    console.log("Creating new user");
    // Create new user with complete onboarding
    const userData: any = {
      clerkId: identity.subject,
      name: identity.name || "User",
      email: userEmail,
      role: role,
      onboardingComplete: true,
      imageUrl: identity.pictureUrl,
      preferences: {},
      createdAt: Date.now(),
    };
    if (args.clerkOrganizationId) {
      userData.clerkOrganizationId = args.clerkOrganizationId;
    }
    console.log("About to insert user data:", userData);
    const userId = await ctx.db.insert("users", userData);
    console.log("New user created with ID:", userId);
    // If this is a teacher, update their status to active
    if (teacherRecord) {
      console.log("Updating teacher status to active for teacher:", teacherRecord._id);
      await ctx.db.patch(teacherRecord._id, {
        status: "active",
      });
      console.log("Teacher status updated to active");
    }
    // Verify the user was created with all fields
    const createdUser = await ctx.db.get(userId);
    console.log("Created user verification:", createdUser);
    return { success: true, userId, role: role };
  },
});


