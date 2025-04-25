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

// Seed function to create test data
export const seed = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    try {
      // Create a test user
      const testUserId = await ctx.db.insert("users", {
        clerkId: "test_user_1",
        name: "Test User",
        email: "test@example.com",
        role: "school_leader",
        organization: "test_school",
        createdAt: Date.now(),
      });

      // Create some test teachers
      const teachers = [
        {
          name: "John Smith",
          email: "john@example.com",
          department: "Mathematics",
          gradeLevel: "9-12",
          status: "active",
          createdBy: testUserId,
          createdAt: Date.now(),
        },
        {
          name: "Jane Doe",
          email: "jane@example.com",
          department: "Science",
          gradeLevel: "6-8",
          status: "active",
          createdBy: testUserId,
          createdAt: Date.now(),
        },
        {
          name: "Mike Johnson",
          email: "mike@example.com",
          department: "English",
          gradeLevel: "9-12",
          status: "active",
          createdBy: testUserId,
          createdAt: Date.now(),
        },
      ];

      // Insert all test teachers
      for (const teacher of teachers) {
        await ctx.db.insert("teachers", teacher);
      }

      return { success: true, message: "Test data created successfully" };
    } catch (error) {
      console.error("Error in seed function:", error);
      throw new Error("Failed to create test data");
    }
  },
});

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
      const teacherId = await ctx.db.insert("teachers", {
        name: args.name,
        email: args.email,
        department: args.department,
        gradeLevel: args.gradeLevel,
        status: args.status || "pending", // Default to pending if not provided
        createdBy: await getUserIdForMutation(ctx, identity),
        createdAt: Date.now(),
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
      })
    ),
    v.null()
  ),
  handler: async (ctx) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return null;
      }

      const userId = await getUserIdForQuery(ctx, identity);
      
      // Use proper index for querying
      return await ctx.db
        .query("teachers")
        .withIndex("by_creator", (q) => q.eq("createdBy", userId))
        .collect();
    } catch (error) {
      console.error("Error in list function:", error);
      return null;
    }
  },
}); 