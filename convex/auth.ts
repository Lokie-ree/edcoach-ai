import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { api } from "./_generated/api";

// Check if a user exists and create one if they don't
export const createOrGetUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.string()), // If not provided, defaults to "school_leader"
  },
  handler: async (ctx, args) => {
    // First, check if the user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    // If the user exists, return it
    if (existingUser) {
      return {
        user: existingUser,
        created: false,
      };
    }

    // If the user doesn't exist, create one
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      role: args.role || "school_leader", // Default role
      createdAt: Date.now(),
    });

    const newUser = await ctx.db.get(userId);

    return {
      user: newUser,
      created: true,
    };
  },
});

// Get the current user from the auth context
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Find the user in our database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    return user;
  },
});

// Handle the Clerk webhook for user creation and updates
export const handleClerkWebhook = action({
  args: {
    payload: v.any(),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const { payload, type } = args;

    switch (type) {
      case "user.created":
        // Create a new user when Clerk notifies us
        await ctx.runMutation(api.auth.createOrGetUser, {
          clerkId: payload.data.id,
          email: payload.data.email_addresses[0]?.email_address || "",
          name: `${payload.data.first_name || ""} ${payload.data.last_name || ""}`.trim(),
          imageUrl: payload.data.image_url,
        });
        break;
        
      case "user.updated":
        // Find the user and update their info
        const user = await ctx.runQuery(api.users.getUserByClerkId, {
          clerkId: payload.data.id,
        });
        
        if (user) {
          await ctx.runMutation(api.users.updateUser, {
            userId: user._id,
            name: `${payload.data.first_name || ""} ${payload.data.last_name || ""}`.trim(),
            email: payload.data.email_addresses[0]?.email_address || user.email,
            imageUrl: payload.data.image_url,
          });
        }
        break;
        
      case "user.deleted":
        // We would handle user deletion here
        // For now, we'll just log it - in a real app you might want to anonymize data
        console.log(`User deleted: ${payload.data.id}`);
        break;
    }
  },
}); 