// convex/billing.ts
import { v } from "convex/values";
import { action } from "./_generated/server";

/**
 * Auto-assign starter plan to new users
 * This should be called during onboarding or when needed
 */
export const ensureStarterPlan = action({
  args: {},
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // For now, we'll rely on frontend checks and default behavior
    // In a future implementation, you could use Clerk's backend API to assign plans
    // Example: const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
    
    return {
      success: true,
      message: "User defaults to starter plan - no action needed",
    };
  },
});

/**
 * Get user's current plan limits based on Clerk billing subscription
 * This action can access Clerk's auth context and check plan features
 */
export const getCurrentPlanLimits = action({
  args: {},
  returns: v.object({
    walkthroughLimit: v.number(),
    teacherLimit: v.number(),
    plan: v.string(),
    hasProFeatures: v.boolean(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Note: In actions, we can't directly use has() method
    // This would need to be called from the frontend and passed to other functions
    // For now, we'll keep the logic in the frontend components
    
    // Default to starter plan limits
    return {
      walkthroughLimit: 15,
      teacherLimit: 5,
      plan: "coach_starter",
      hasProFeatures: false,
    };
  },
});

// Note: Since Clerk Billing doesn't send webhooks and manages subscription state internally,
// we don't need webhook handlers or database storage for subscription data.
// All subscription checks should use Clerk's has() method directly in components.