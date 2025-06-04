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
    gradeLevels: v.array(v.string()),
    status: v.optional(v.string()),
    coachId: v.id("users"),
  },
  returns: v.object({
    success: v.boolean(),
    teacherId: v.id("teachers"),
  }),
  handler: async (ctx, args) => {
    // Only a coach can create a teacher
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    // Optionally, you could check the role of the user here
    const teacherId = await ctx.db.insert("teachers", {
      name: args.name,
      email: args.email,
      subject: args.subject,
      gradeLevels: args.gradeLevels,
      status: args.status || "pending",
      coachId: args.coachId,
      createdAt: Date.now(),
    });
    return { success: true, teacherId };
  },
});

// List all teachers for a coach
export const list = query({
  args: {
    coachId: v.id("users"),
  },
  returns: v.array(
    v.object({
      _id: v.id("teachers"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.optional(v.string()),
      subject: v.array(v.string()),
      gradeLevels: v.array(v.string()),
      status: v.optional(v.string()),
      coachId: v.id("users"),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teachers")
      .filter((q) => q.eq(q.field("coachId"), args.coachId))
      .collect();
  },
});

// Update a teacher
export const update = mutation({
  args: {
    id: v.id("teachers"),
    name: v.string(),
    email: v.optional(v.string()),
    subject: v.array(v.string()),
    gradeLevels: v.array(v.string()),
    status: v.optional(v.string()),
    coachId: v.id("users"),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const teacher = await ctx.db.get(args.id);
    if (!teacher) throw new Error("Teacher not found");
    if (teacher.coachId !== args.coachId) throw new Error("No permission");
    await ctx.db.patch(args.id, {
      name: args.name,
      email: args.email,
      subject: args.subject,
      gradeLevels: args.gradeLevels,
      status: args.status,
    });
    return { success: true };
  },
});

// Remove a teacher
export const remove = mutation({
  args: { id: v.id("teachers"), coachId: v.id("users") },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const teacher = await ctx.db.get(args.id);
    if (!teacher) throw new Error("Teacher not found");
    if (teacher.coachId !== args.coachId) throw new Error("No permission");
    await ctx.db.delete(args.id);
    return { success: true };
  },
}); 