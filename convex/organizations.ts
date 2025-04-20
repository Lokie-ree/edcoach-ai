import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

/*
 * NOTE: This file is simplified to use Clerk's organization functionality.
 * Most organization management should be done through Clerk's API.
 * This file contains minimal functionality for organization data specific to our app.
 */

// Store additional metadata about an organization
export const storeMetadata = mutation({
  args: {
    clerkOrgId: v.string(),
    name: v.string(),
    type: v.optional(v.string()),
    additionalInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the user's ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if organization exists in our DB
    const existingOrg = await ctx.db
      .query("organizations")
      .filter((q) => q.eq(q.field("clerkOrgId"), args.clerkOrgId))
      .unique();

    if (existingOrg) {
      // Update existing org
      await ctx.db.patch(existingOrg._id, {
        name: args.name,
        type: args.type,
        additionalInfo: args.additionalInfo,
      });
    } else {
      // Create new org record
      await ctx.db.insert("organizations", {
        name: args.name,
        adminId: user._id,
        clerkOrgId: args.clerkOrgId,
        type: args.type,
        additionalInfo: args.additionalInfo,
        createdAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Get organization metadata
export const getMetadata = query({
  args: {
    clerkOrgId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizations")
      .filter((q) => q.eq(q.field("clerkOrgId"), args.clerkOrgId))
      .unique();
  },
}); 