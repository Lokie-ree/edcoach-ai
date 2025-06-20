import { internalMutation, internalQuery, query, QueryCtx, mutation } from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";

// Helper functions
async function userByClerkId(ctx: QueryCtx, clerkId: string) {
  return await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();
}

export async function getCurrentUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    return null;
  }
  return await userByClerkId(ctx, identity.subject);
}

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

// Public queries
export const current = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      clerkId: v.string(),
      name: v.string(),
      email: v.string(),
      role: v.union(v.literal("coach"), v.literal("teacher")),
      clerkOrganizationId: v.optional(v.string()),
      subscriptionPlan: v.optional(v.union(v.literal("free"), v.literal("pro"))),
      imageUrl: v.optional(v.string()),
      preferences: v.optional(v.any()),
      createdAt: v.number(),
      onboardingComplete: v.optional(v.boolean()),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      clerkId: v.string(),
      name: v.string(),
      email: v.string(),
      role: v.union(v.literal("coach"), v.literal("teacher")),
      clerkOrganizationId: v.optional(v.string()),
      subscriptionPlan: v.optional(v.union(v.literal("free"), v.literal("pro"))),
      imageUrl: v.optional(v.string()),
      preferences: v.optional(v.any()),
      createdAt: v.number(),
      onboardingComplete: v.optional(v.boolean()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    if (identity.subject !== args.clerkId) {
      throw new Error("Unauthorized: Can only access your own user data");
    }
    
    return await userByClerkId(ctx, args.clerkId);
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      clerkId: v.string(),
      name: v.string(),
      email: v.string(),
      role: v.union(v.literal("coach"), v.literal("teacher")),
      clerkOrganizationId: v.optional(v.string()),
      subscriptionPlan: v.optional(v.union(v.literal("free"), v.literal("pro"))),
      imageUrl: v.optional(v.string()),
      preferences: v.optional(v.any()),
      createdAt: v.number(),
      onboardingComplete: v.optional(v.boolean()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      return null;
    }
    
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }
    
    // Only allow access to users in the same organization
    if (currentUser.clerkOrganizationId !== user.clerkOrganizationId) {
      throw new Error("Unauthorized: Can only access users in your organization");
    }
    
    return user;
  },
});

// Internal queries
export const internalGetUserByClerkId = internalQuery({
  args: { clerkId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      clerkId: v.string(),
      name: v.string(),
      email: v.string(),
      role: v.union(v.literal("coach"), v.literal("teacher")),
      clerkOrganizationId: v.optional(v.string()),
      subscriptionPlan: v.optional(v.union(v.literal("free"), v.literal("pro"))),
      imageUrl: v.optional(v.string()),
      preferences: v.optional(v.any()),
      createdAt: v.number(),
      onboardingComplete: v.optional(v.boolean()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await userByClerkId(ctx, args.clerkId);
  },
});

// AI usage gating
export const checkAIUsageLimit = query({
  args: {},
  returns: v.object({
    canGenerate: v.boolean(),
    usageThisMonth: v.number(),
    limit: v.number(),
    subscriptionPlan: v.union(v.literal("free"), v.literal("pro"), v.literal("none")),
  }),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return { canGenerate: false, usageThisMonth: 0, limit: 0, subscriptionPlan: "none" as const };
    }

    const plan = user.subscriptionPlan || "free";
    const limit = plan === "pro" ? 999999 : 5; // 5 for free, unlimited for pro

    // Calculate current month usage
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    
    const usageLogs = await ctx.db
      .query("aiUsageLogs")
      .withIndex("by_user_and_month", (q) => 
        q.eq("userId", user._id).gte("timestamp", monthStart)
      )
      .collect();

    const usageThisMonth = usageLogs.length;
    const canGenerate = usageThisMonth < limit;

    return {
      canGenerate,
      usageThisMonth,
      limit,
      subscriptionPlan: plan,
    };
  },
});

// Webhook handlers
export const upsertFromClerk = internalMutation({
  args: { data: v.any() as Validator<UserJSON> },
  returns: v.null(),
  handler: async (ctx, { data }) => {
    const userAttributes = {
      clerkId: data.id,
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User',
      email: data.email_addresses[0]?.email_address || '',
      imageUrl: data.image_url,
      preferences: {},
      createdAt: Date.now(),
      onboardingComplete: false,
      role: "coach" as const, // Default role, will be updated in onboarding
    };

    const existingUser = await userByClerkId(ctx, data.id);
    if (existingUser === null) {
      await ctx.db.insert("users", userAttributes);
    } else {
      await ctx.db.patch(existingUser._id, {
        name: userAttributes.name,
        email: userAttributes.email,
        imageUrl: userAttributes.imageUrl,
      });
    }
    return null;
  },
});

export const deleteFromClerk = internalMutation({
  args: { clerkUserId: v.string() },
  returns: v.null(),
  handler: async (ctx, { clerkUserId }) => {
    const user = await userByClerkId(ctx, clerkUserId);
    if (user !== null) {
      await ctx.db.delete(user._id);
    } else {
      console.warn(`Can't delete user, there is none for Clerk user ID: ${clerkUserId}`);
    }
    return null;
  },
});

// Organization membership webhooks
export const handleOrgMembershipCreated = internalMutation({
  args: { data: v.any() },
  returns: v.null(),
  handler: async (ctx, { data }) => {
    const user = await userByClerkId(ctx, data.public_user_data.user_id);
    if (user) {
      await ctx.db.patch(user._id, {
        clerkOrganizationId: data.organization.id,
      });
      
      // If this is a teacher joining an org, activate their teacher record
      if (user.role === "teacher") {
        const teacherRecord = await ctx.db
          .query("teachers")
          .withIndex("by_email", (q) => q.eq("email", user.email))
          .first();
        
        if (teacherRecord && !teacherRecord.userId) {
          await ctx.db.patch(teacherRecord._id, {
            userId: user._id,
            status: "active",
          });
        }
      }
    }
    return null;
  },
});

export const handleOrgMembershipUpdated = internalMutation({
  args: { data: v.any() },
  returns: v.null(),
  handler: async (ctx, { data }) => {
    // Handle role changes if needed
    console.log("Organization membership updated:", data);
    return null;
  },
});

export const handleOrgMembershipDeleted = internalMutation({
  args: { data: v.any() },
  returns: v.null(),
  handler: async (ctx, { data }) => {
    const user = await userByClerkId(ctx, data.public_user_data.user_id);
    if (user) {
      await ctx.db.patch(user._id, {
        clerkOrganizationId: undefined,
      });
    }
    return null;
  },
});

// Billing webhooks
export const handleSubscriptionChange = internalMutation({
  args: { data: v.any() },
  returns: v.null(),
  handler: async (ctx, { data }) => {
    const user = await userByClerkId(ctx, data.user_id);
    if (user) {
      const plan = data.plan_name === "pro" ? "pro" : "free";
      await ctx.db.patch(user._id, {
        subscriptionPlan: plan,
      });
      
             // Schedule Clerk organization creation for new pro subscribers (coaches)
       if (plan === "pro" && user.role === "coach" && !user.clerkOrganizationId) {
         // This will be handled by a separate action
         console.log("Pro subscription activated - organization creation will be handled separately");
       }
    }
    return null;
  },
});

export const handleSubscriptionCancelled = internalMutation({
  args: { data: v.any() },
  returns: v.null(),
  handler: async (ctx, { data }) => {
    const user = await userByClerkId(ctx, data.user_id);
    if (user) {
      await ctx.db.patch(user._id, {
        subscriptionPlan: "free",
      });
    }
    return null;
  },
});

// Simplified onboarding with automatic Clerk org creation
export const completeSimplifiedOnboarding = mutation({
  args: {
    clerkOrganizationId: v.optional(v.string()),
  },
  returns: v.object({ 
    success: v.boolean(), 
    userId: v.id("users"),
    role: v.union(v.literal("coach"), v.literal("teacher"))
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userEmail = identity.email;
    if (!userEmail) {
      throw new Error("No email found in Clerk identity");
    }

    // Check if this user has a pending teacher record
    const teacherRecord = await ctx.db
      .query("teachers")
      .withIndex("by_email", (q) => q.eq("email", userEmail))
      .first();
    
    const role = teacherRecord ? ("teacher" as const) : ("coach" as const);
    
    const existingUser = await userByClerkId(ctx, identity.subject);
    
    if (existingUser) {
      const updateData: any = {
        name: identity.name || existingUser.name,
        email: userEmail,
        role: role,
        onboardingComplete: true,
      };
      
      if (args.clerkOrganizationId) {
        updateData.clerkOrganizationId = args.clerkOrganizationId;
      }
      
      await ctx.db.patch(existingUser._id, updateData);
      
      // Link teacher record if this is a teacher
      if (teacherRecord && !teacherRecord.userId) {
        await ctx.db.patch(teacherRecord._id, {
          userId: existingUser._id,
          status: "active",
        });
      }
      
      // Create Clerk organization for coaches (will be triggered after subscription)
      if (role === "coach" && !existingUser.clerkOrganizationId) {
        // This will be handled by subscription webhook
      }
      
      return { success: true, userId: existingUser._id, role: role };
    }
    
    // Create new user
    const userData: any = {
      clerkId: identity.subject,
      name: identity.name || "User",
      email: userEmail,
      role: role,
      onboardingComplete: true,
      imageUrl: identity.pictureUrl,
      preferences: {},
      createdAt: Date.now(),
      subscriptionPlan: role === "coach" ? "free" : undefined,
    };
    
    if (args.clerkOrganizationId) {
      userData.clerkOrganizationId = args.clerkOrganizationId;
    }
    
    const userId = await ctx.db.insert("users", userData);
    
    // Link teacher record if this is a teacher
    if (teacherRecord) {
      await ctx.db.patch(teacherRecord._id, {
        userId: userId,
        status: "active",
      });
    }
    
    return { success: true, userId: userId, role: role };
  },
});

// Clerk organization creation will be handled by frontend or separate action