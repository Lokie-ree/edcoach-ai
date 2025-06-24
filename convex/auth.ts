// convex/auth.ts
import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/**
 * Get the user document for the currently authenticated user.
 * Returns null if the user is not authenticated.
 */
export async function getCurrentUser(ctx: QueryCtx): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

/**
 * Get the user document for the currently authenticated user.
 * Throws an error if the user is not authenticated or not found in the database.
 */
export async function getCurrentUserOrThrow(ctx: QueryCtx): Promise<Doc<"users">> {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("User not found or not authenticated");
  return userRecord;
}
