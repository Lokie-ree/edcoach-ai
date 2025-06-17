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
    clerkOrganizationId: v.optional(v.string()),
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
      clerkOrganizationId: args.clerkOrganizationId,
      createdAt: Date.now(),
      role: "coach" as const,
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
    try {
      const identity = await ctx.auth.getUserIdentity();
      
      if (!identity) {
        // In development, return null instead of throwing
        if (process.env.NODE_ENV === "development") {
          console.warn("Development mode: No authenticated user, returning null");
          return null;
        }
        throw new Error("Not authenticated");
      }

      // Find the user in our database
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
      
      return user;
    } catch (error) {
      // In development, return null for any auth errors
      if (process.env.NODE_ENV === "development") {
        console.warn("Development mode: Auth error, returning null", error);
        return null;
      }
      throw error;
    }
  },
});

// Webhook handler for Clerk events
export const handleClerkWebhook = action({
  args: {
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const { payload } = args;

    // Handle different event types
    switch (payload.type) {
      case "user.created":
        // Only create user if not already present
        const existingUser = await ctx.runQuery(api.users.getUserByClerkId, {
          clerkId: payload.data.id,
        });
        if (!existingUser) {
          await ctx.runMutation(api.users.createUser, {
            clerkId: payload.data.id,
            email: payload.data.email_addresses[0]?.email_address || "",
            name: `${payload.data.first_name || ""} ${payload.data.last_name || ""}`.trim(),
            imageUrl: payload.data.image_url,
            role: "coach" as const,
          });
        }
        break;

      case "user.updated":
        // Update existing user
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
    }
  },
});
