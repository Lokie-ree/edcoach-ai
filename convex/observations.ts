import { query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the current user to filter by organization
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get observations for the user's organization
    return await ctx.db
      .query("observations")
      .withIndex("by_organization", (q) => q.eq("organizationId", user.organization as Id<"organizations">))
      .collect();
  },
}); 