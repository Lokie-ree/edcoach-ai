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
      role: "user", // Default role
      organization: "default", // Default organization
      createdAt: Date.now(),
    };

    // Use proper database operation
    const userId = await ctx.db.insert("users", newUser);
    return userId;
  } catch (error) {
    console.error("Error in getUserIdForMutation:", error);
    throw new Error("Failed to get or create user");
  }
}

export const create = mutation({
  args: {
    name: v.string(),
    email: v.optional(v.string()),
    department: v.optional(v.string()),
    gradeLevel: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    teacherId: v.id("teachers"),
  }),
  handler: async (ctx, args) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("Not authenticated");
      }

      // Create the teacher using proper database operation
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const teacherId = await ctx.db.insert("teachers", {
        name: args.name,
        email: args.email,
        department: args.department,
        gradeLevel: args.gradeLevel,
        status: args.status || "pending", // Default to pending if not provided
        createdBy: user._id,
        createdAt: Date.now(),
        organization: user.organization, // Set organization from user
      });
      return { success: true, teacherId };
    } catch (error) {
      console.error("Error in create function:", error);
      throw new Error("Failed to create teacher");
    }
  },
});

export const list = query({
  args: {},
  returns: v.union(
    v.array(
      v.object({
        _id: v.id("teachers"),
        _creationTime: v.number(),
        name: v.string(),
        email: v.optional(v.string()),
        department: v.optional(v.string()),
        gradeLevel: v.optional(v.string()),
        status: v.optional(v.string()),
        createdBy: v.id("users"),
        createdAt: v.number(),
        organization: v.optional(v.string()),
      })
    ),
    v.null()
  ),
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return [];
      }

      // Get the current user
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (!user) {
        return [];
      }

      // Get all teachers from the user's organization
      return await ctx.db
        .query("teachers")
        .filter((q) => 
          q.eq(q.field("createdBy"), user._id)
        )
        .collect();
    } catch (error) {
      console.error("Error in list function:", error);
      return [];
    }
  },
}); 