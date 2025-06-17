import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { MutationCtx, QueryCtx } from "./_generated/server";

// Helper function to get user ID from Clerk identity (for queries)
async function getUserIdForQuery(ctx: QueryCtx, identity: any) {
  try {
    // Check if user exists in our database using proper index
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    return user._id;
  } catch (error) {
    console.error("Error in getUserIdForQuery:", error);
    throw new Error("Failed to get user");
  }
}

// Helper function to get or create user ID from Clerk identity (for mutations)
async function getUserIdForMutation(ctx: MutationCtx, identity: any) {
  try {
    // Check if user exists in our database using proper index
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (user) {
      return user._id;
    }

    // If user doesn't exist, create a basic user entry
    const newUser = {
      clerkId: identity.subject,
      name: identity.name ?? "",
      email: identity.email ?? "",
      organization: "", // Default for schema compatibility
      createdAt: Date.now(),
      role: "coach" as const, // Default to coach for this context
      imageUrl: undefined,
      preferences: {},
      subscriptionStatus: undefined,
      subscriptionTier: undefined,
      coachId: undefined,
    };

    // Use proper database operation
    const userId = await ctx.db.insert("users", newUser);
    return userId;
  } catch (error) {
    console.error("Error in getUserIdForMutation:", error);
    throw new Error("Failed to get or create user");
  }
}

// Create a teacher (must be called by a coach)
export const create = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    subject: v.array(v.string()),
    gradeBand: v.string(),
    status: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    clerkOrganizationId: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    teacherId: v.id("teachers"),
  }),
  handler: async (ctx, args) => {
    // Only a coach can create a teacher (TODO: check org membership)
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Create a placeholder user if no userId provided
    let userId = args.userId;
    if (!userId && args.email) {
      // Create a placeholder user for the teacher
      userId = await ctx.db.insert("users", {
        clerkId: `pending_${Date.now()}_${Math.random()}`, // Temporary placeholder
        name: args.name,
        email: args.email,
        clerkOrganizationId: args.clerkOrganizationId,
        role: "teacher",
        createdAt: Date.now(),
        onboardingComplete: false,
      });
    }
    
    if (!userId) {
      throw new Error("Either userId or email must be provided");
    }
    
    const teacherId = await ctx.db.insert("teachers", {
      name: args.name,
      email: args.email,
      subject: args.subject,
      gradeBand: args.gradeBand,
      status: args.status || "pending",
      userId: userId,
      createdAt: Date.now(),
    });
    return { success: true, teacherId };
  },
});

// List all teachers for a coach
export const list = query({
  args: {
    clerkOrganizationId: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("teachers"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.optional(v.string()),
      subject: v.array(v.string()),
      gradeBand: v.string(),
      status: v.optional(v.string()),
      userId: v.id("users"),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    if (args.clerkOrganizationId) {
      // Get all users in this org
      const users = await ctx.db
        .query("users")
        .withIndex("by_organization", (q) => q.eq("clerkOrganizationId", args.clerkOrganizationId))
        .collect();
      const userIds = users.map((u) => u._id);
      // Return teachers whose userId is in userIds
      return await ctx.db
        .query("teachers")
        .filter((q) => q.or(...userIds.map((id) => q.eq(q.field("userId"), id))))
        .collect();
    }
    // No org filter, return all teachers
    return await ctx.db.query("teachers").collect();
  },
});

// Update a teacher
export const update = mutation({
  args: {
    id: v.id("teachers"),
    name: v.string(),
    email: v.optional(v.string()),
    subject: v.array(v.string()),
    gradeBand: v.string(),
    status: v.optional(v.string()),
    clerkOrganizationId: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const teacher = await ctx.db.get(args.id);
    if (!teacher) throw new Error("Teacher not found");
    await ctx.db.patch(args.id, {
      name: args.name,
      email: args.email,
      subject: args.subject,
      gradeBand: args.gradeBand,
      status: args.status,
    });
    return { success: true };
  },
});

// Remove a teacher
export const remove = mutation({
  args: { 
    id: v.id("teachers"),
    clerkOrganizationId: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const teacher = await ctx.db.get(args.id);
    if (!teacher) throw new Error("Teacher not found");
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Get teacher record by user's clerk ID (for teachers who are also users)
export const getByUserClerkId = query({
  args: {
    clerkId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("teachers"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.optional(v.string()),
      subject: v.array(v.string()),
      gradeBand: v.string(),
      status: v.optional(v.string()),
      userId: v.id("users"),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    // First get the user record by clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    
    if (!user) return null;
    
    // Now find the teacher record where the user's email matches the teacher's email
    // This assumes teachers have the same email in both users and teachers tables
    const teacher = await ctx.db
      .query("teachers")
      .filter((q) => q.eq(q.field("email"), user.email))
      .unique();
    
    return teacher;
  },
});

// Get a teacher by ID
export const getById = query({
  args: {
    teacherId: v.id("teachers"),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.teacherId);
  },
}); 