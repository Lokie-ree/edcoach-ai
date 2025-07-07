// convex/billing.ts
import { v } from "convex/values";
import { action, internalMutation } from "./_generated/server";

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

/**
 * Handles Clerk billing/subscription webhook events.
 * TODO: Implement plan/feature updates based on eventType and data.
 */
export const handleSubscriptionEvent = internalMutation({
  args: { eventType: v.string(), data: v.any() },
  handler: async (ctx, { eventType, data }) => {
    console.log(`[Billing] Received event: ${eventType}`);
    console.log(`[Billing] Event data:`, JSON.stringify(data));

    // Extract Clerk user ID and subscription info from event data
    // Clerk billing events typically include a user or customer ID
    const clerkUserId = data?.user?.id || data?.userId || data?.customer_id || data?.customerId;
    if (!clerkUserId) {
      console.warn(`[Billing] No Clerk user ID found in event data, skipping.`);
      return;
    }
    // Find the user in Convex
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkUserId))
      .first();
    if (!user) {
      console.warn(`[Billing] No user found for Clerk ID ${clerkUserId}, skipping.`);
      return;
    }

    // Helper to update user fields
    const updateUser = async (fields: Record<string, any>) => {
      await ctx.db.patch(user._id, fields);
    };

    // Map event types to plan/status updates
    switch (eventType) {
      case "subscription.created":
      case "subscription.updated":
      case "subscription.active": {
        // Determine plan from event data (assume plan/product name is present)
        const planName = data?.plan?.name || data?.plan || data?.product?.name || data?.product || "coach_starter";
        const plan = planName.includes("pro") ? "coach_pro" : "coach_starter";
        const status = data?.status || "active";
        await updateUser({
          plan,
          subscriptionStatus: status,
          subscriptionId: data?.id || data?.subscription_id || null,
          subscriptionStartedAt: data?.start_date ? Date.parse(data.start_date) : Date.now(),
          subscriptionEndedAt: null,
        });
        break;
      }
      case "subscription.past_due": {
        await updateUser({
          subscriptionStatus: "past_due",
        });
        break;
      }
      case "subscription.canceled": {
        await updateUser({
          subscriptionStatus: "canceled",
          subscriptionEndedAt: Date.now(),
        });
        break;
      }
      // Add more event types as needed
      default:
        console.log(`[Billing] Unhandled event type: ${eventType}`);
        break;
    }
  },
});

// Note: Since Clerk Billing doesn't send webhooks and manages subscription state internally,
// we don't need webhook handlers or database storage for subscription data.
// All subscription checks should use Clerk's has() method directly in components.