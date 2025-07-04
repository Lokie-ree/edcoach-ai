// convex/onboarding.ts
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getCurrentUserOrThrow } from "./auth";

/**
 * Completes the onboarding process for a user.
 * Preserves their existing role and links any pending records.
 */
export const complete = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
    role: v.optional(v.union(v.literal("teacher"), v.literal("coach"))),
    message: v.optional(v.string()),
  }),
  handler: async (ctx): Promise<{
    success: boolean;
    role?: "teacher" | "coach";
    message?: string;
  }> => {
    const user = await getCurrentUserOrThrow(ctx);
    if (user.onboardingComplete) {
      return { success: true, message: "Already complete." };
    }

    // If user is a teacher, try to link any pending teacher record
    if (user.role === "teacher") {
      await ctx.runMutation(internal.teachers.internalFindAndLinkTeacher, { userId: user._id });
    }

    // Preserve the user's existing role (assigned by Clerk or invitation)
    await ctx.db.patch(user._id, {
      onboardingComplete: true,
    });

    return { success: true, role: user.role };
  },
});

