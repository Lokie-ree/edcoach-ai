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

// AI usage - simplified (no limits for now, let Clerk handle subscription logic)
export const checkAIUsageLimit = query({
  args: {},
  returns: v.object({
    canGenerate: v.boolean(),
    usageThisMonth: v.number(),
    limit: v.number(),
  }),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return { canGenerate: false, usageThisMonth: 0, limit: 0 };
    }

    // For now, allow unlimited AI usage - let Clerk handle subscription limits
    return {
      canGenerate: true,
      usageThisMonth: 0,
      limit: 999999,
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
      role: "coach" as const, // Default role, will be updated by org membership webhooks
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

// Modular organization membership handling
type ClerkOrgRole = string;
type AppRole = "coach" | "teacher";

interface OrgMembershipContext {
  user: any;
  clerkRole: ClerkOrgRole;
  organizationId: string;
  wasAlreadyInOrg: boolean;
}

// Role mapping configuration - easily extensible
const CLERK_TO_APP_ROLE_MAPPING: Record<string, AppRole> = {
  "org:admin": "coach",
  "org:member": "teacher",
  // Add more mappings as needed
} as const;

// Determine what app role a user should have based on their Clerk org role
function determineAppRole(context: OrgMembershipContext): AppRole {
  const { clerkRole } = context;
  
  // Use explicit mapping for clarity and extensibility
  const mappedRole = CLERK_TO_APP_ROLE_MAPPING[clerkRole];
  if (!mappedRole) {
    console.warn(`Unknown Clerk role: ${clerkRole}, defaulting to teacher`);
    return "teacher";
  }
  
  return mappedRole;
}

// Determine if we should preserve the existing role
function shouldPreserveExistingRole(context: OrgMembershipContext, targetRole: AppRole): boolean {
  const { user, wasAlreadyInOrg } = context;
  
  // Never preserve the default coach role for new organization members
  // Only preserve if they were already in the org AND already had the target role
  if (!wasAlreadyInOrg) {
    return false; // Always update role for new org members
  }
  
  // If they were already in the org, only preserve if roles match
  return user.role === targetRole;
}

// Handle linking teacher records to users
async function handleTeacherRecordLinking(ctx: any, user: any, newRole: AppRole) {
  if (newRole !== "teacher") return;
  
  const teacherRecord = await ctx.db
    .query("teachers")
    .withIndex("by_email", (q: any) => q.eq("email", user.email))
    .first();
  
  if (teacherRecord && !teacherRecord.userId) {
    console.log('Linking teacher record to user:', {
      teacherId: teacherRecord._id,
      userId: user._id,
      email: user.email
    });
    
    await ctx.db.patch(teacherRecord._id, {
      userId: user._id,
      status: "active",
    });
  }
}

// Main organization membership handler - now much cleaner and modular
export const handleOrgMembershipCreated = internalMutation({
  args: { data: v.any() },
  returns: v.null(),
  handler: async (ctx, { data }) => {
    const user = await userByClerkId(ctx, data.public_user_data.user_id);
    if (!user) {
      console.warn('User not found for organization membership:', data.public_user_data.user_id);
      return null;
    }

    const context: OrgMembershipContext = {
      user,
      clerkRole: data.role,
      organizationId: data.organization.id,
      wasAlreadyInOrg: user.clerkOrganizationId === data.organization.id,
    };

    console.log('Processing organization membership:', {
      userId: user._id,
      currentRole: user.role,
      clerkRole: context.clerkRole,
      organizationId: context.organizationId,
      wasAlreadyInOrg: context.wasAlreadyInOrg
    });

    // Always update organization ID
    await ctx.db.patch(user._id, {
      clerkOrganizationId: context.organizationId,
    });

    // Determine target role and whether to update
    const targetRole = determineAppRole(context);
    const shouldPreserve = shouldPreserveExistingRole(context, targetRole);

    if (!shouldPreserve) {
      console.log('Updating user role:', {
        userId: user._id,
        fromRole: user.role,
        toRole: targetRole,
        reason: 'clerk_org_role_mapping'
      });

      await ctx.db.patch(user._id, {
        role: targetRole,
      });

      // Handle teacher-specific logic
      await handleTeacherRecordLinking(ctx, user, targetRole);
    } else {
      console.log('Preserving existing role:', {
        userId: user._id,
        role: user.role,
        reason: 'was_already_in_org_with_same_role'
      });
    }

    return null;
  },
});

export const handleOrgMembershipUpdated = internalMutation({
  args: { data: v.any() },
  returns: v.null(),
  handler: async (ctx, { data }) => {
    const user = await userByClerkId(ctx, data.public_user_data.user_id);
    if (!user) {
      console.warn('User not found for organization membership update:', data.public_user_data.user_id);
      return null;
    }

    const context: OrgMembershipContext = {
      user,
      clerkRole: data.role,
      organizationId: data.organization?.id || user.clerkOrganizationId || '',
      wasAlreadyInOrg: true, // For updates, they're already in the org
    };

    console.log('Processing organization membership update:', {
      userId: user._id,
      currentRole: user.role,
      clerkRole: context.clerkRole,
      organizationId: context.organizationId
    });

    // Determine target role and whether to update
    const targetRole = determineAppRole(context);
    const shouldPreserve = shouldPreserveExistingRole(context, targetRole);

    // Only update if the role actually needs to change
    if (!shouldPreserve && user.role !== targetRole) {
      console.log('Updating user role due to organization role change:', {
        userId: user._id,
        fromRole: user.role,
        toRole: targetRole,
        reason: 'org_role_changed'
      });

      await ctx.db.patch(user._id, {
        role: targetRole,
      });

      // Handle teacher-specific logic
      await handleTeacherRecordLinking(ctx, user, targetRole);
    } else {
      console.log('No role update needed:', {
        userId: user._id,
        currentRole: user.role,
        targetRole,
        reason: shouldPreserve ? 'preserving_existing_role' : 'role_already_correct'
      });
    }

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
      const plan = data.plan_name === "coach_pro" ? "coach_pro" : "coach_starter";
              // Subscription plan now handled by Clerk
        console.log(`Subscription updated for user ${user._id}: ${plan}`);
      
             // Handle coach pro subscription
       if (plan === "coach_pro" && user.role === "coach" && !user.clerkOrganizationId) {
         // This will be handled by a separate action
         console.log("Coach Pro subscription activated - organization creation will be handled separately");
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
      // Subscription plans now handled by Clerk
      console.log(`Subscription cancelled for user ${user._id}`);
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
        // Subscription plans now handled by Clerk
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
      // Subscription plans now handled by Clerk
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

      console.log('Creating organization for user:', {
        userId: user?._id,
        clerkId: identity.subject,
        role: user?.role,
        organizationName: args.organizationName
      });

      if (!user) {
        console.log('User not found in database');
        throw new Error("User not found");
      }

      if (user.role === "teacher") {
        console.log('User is a teacher, not a coach:', {
          userRole: user.role
        });
        throw new Error("Only coaches can create organizations");
      }

      // Check if user already has an organization
      if (user.clerkOrganizationId) {
        return {
          success: false,
          error: "User already has an organization",
        };
      }

      console.log('Calling Clerk API to create organization...');

      // Create organization via Clerk REST API
      const response = await fetch("https://api.clerk.com/v1/organizations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: args.organizationName,
          created_by: identity.subject, // This should make the user an admin
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Clerk API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to create organization: ${response.statusText}`);
      }

      const clerkOrganization = await response.json();
      console.log('Organization created successfully:', {
        organizationId: clerkOrganization.id,
        name: clerkOrganization.name
      });

      // Update user record with the new organization ID and complete onboarding
      console.log('Updating user record with organization ID...');
      await ctx.runMutation(internal.users.updateUserOrganizationAndCompleteOnboarding, {
        clerkUserId: identity.subject,
        clerkOrganizationId: clerkOrganization.id,
      });

      console.log('Organization creation completed successfully');

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

// Internal mutation to update user organization and complete onboarding
export const updateUserOrganizationAndCompleteOnboarding = internalMutation({
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
        onboardingComplete: true,
        // Subscription plans now handled by Clerk
      });
    }
    return null;
  },
});

// Temporary debug functions to fix the current issue
export const debugUserInfo = query({
  args: { clerkId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      clerkId: v.string(),
      name: v.string(),
      email: v.string(),
      role: v.union(v.literal("coach"), v.literal("teacher")),
      clerkOrganizationId: v.optional(v.string()),
      onboardingComplete: v.optional(v.boolean()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await userByClerkId(ctx, args.clerkId);
    console.log('Debug user info requested:', {
      clerkId: args.clerkId,
      user: user
    });
    return user;
  },
});

// Manual fix function for the current issue
export const manuallyFixUserRole = internalMutation({
  args: { 
    clerkId: v.string(),
    newRole: v.union(v.literal("coach"), v.literal("teacher"))
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await userByClerkId(ctx, args.clerkId);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    console.log('Manually fixing user role:', {
      userId: user._id,
      fromRole: user.role,
      toRole: args.newRole,
      clerkId: args.clerkId
    });
    
    await ctx.db.patch(user._id, {
      role: args.newRole,
    });
    
    // If changing to teacher, try to link teacher record
    if (args.newRole === "teacher") {
      await handleTeacherRecordLinking(ctx, user, "teacher");
    }
    
    return { 
      success: true, 
      message: `Successfully updated role from ${user.role} to ${args.newRole}` 
    };
  },
});

// Action to manually fix user role (can be called from frontend)
export const fixUserRole = action({
  args: { 
    clerkId: v.string(),
    newRole: v.union(v.literal("coach"), v.literal("teacher"))
  },
  returns: v.object({
    success: v.boolean(),
    message: v.string(),
  }),
  handler: async (ctx, args): Promise<{ success: boolean; message: string }> => {
    return await ctx.runMutation(internal.users.manuallyFixUserRole, args);
  },
});

