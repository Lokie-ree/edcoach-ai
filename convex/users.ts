import { internalMutation, internalQuery, query, QueryCtx, mutation, action } from "./_generated/server";
import { UserJSON } from "@clerk/backend";
import { v, Validator } from "convex/values";
import { internal } from "./_generated/api";

// Initialize Clerk client for server-side operations
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY environment variable is required");
}

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

// Action to create Clerk organization for coaches
export const createCoachOrganization = action({
  args: {
    organizationName: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    organizationId: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    try {
      // Get current user to verify they're a coach
      const user = await ctx.runQuery(internal.users.internalGetUserByClerkId, {
        clerkId: identity.subject,
      });

      if (!user || user.role !== "coach") {
        throw new Error("Only coaches can create organizations");
      }

      // Check if user already has an organization
      if (user.clerkOrganizationId) {
        return {
          success: false,
          error: "User already has an organization",
        };
      }

      // Create organization via Clerk REST API
      const response = await fetch("https://api.clerk.com/v1/organizations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: args.organizationName,
          created_by: identity.subject,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create organization: ${response.statusText}`);
      }

      const clerkOrganization = await response.json();

      // Update user record with the new organization ID
      await ctx.runMutation(internal.users.updateUserOrganization, {
        clerkUserId: identity.subject,
        clerkOrganizationId: clerkOrganization.id,
      });

      return {
        success: true,
        organizationId: clerkOrganization.id,
      };
    } catch (error) {
      console.error("Failed to create organization:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
});

// Internal mutation to update user organization
export const updateUserOrganization = internalMutation({
  args: {
    clerkUserId: v.string(),
    clerkOrganizationId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await userByClerkId(ctx, args.clerkUserId);
    if (user) {
      await ctx.db.patch(user._id, {
        clerkOrganizationId: args.clerkOrganizationId,
      });
    }
    return null;
  },
});

// Mutation to simulate subscription activation (for development/demo)
export const activateTrialSubscription = mutation({
  args: {},
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await userByClerkId(ctx, identity.subject);
    if (!user) {
      throw new Error("User not found");
    }

    // Simulate trial subscription activation
    await ctx.db.patch(user._id, {
      subscriptionPlan: "pro", // Set to pro for trial
    });

    return { success: true };
  },
});