import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";

// Helper function to get current user with org context
async function getCurrentUserWithOrg(ctx: any): Promise<any> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
    
  if (!user) throw new Error("User not found");
  return user;
}

// Create a teacher and immediately send Clerk org invite
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.array(v.string()),
    gradeBand: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    teacherId: v.id("teachers"),
    inviteSent: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    
    // Only coaches can create teachers
    if (user.role !== "coach") {
      throw new Error("Only coaches can create teachers");
    }
    
    if (!user.clerkOrganizationId) {
      throw new Error("Coach must have an organization to invite teachers");
    }
    
    // Check if teacher already exists
    const existingTeacher = await ctx.db
      .query("teachers")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
      
    if (existingTeacher) {
      throw new Error("A teacher with this email already exists");
    }
    
    // Create teacher record
    const teacherId = await ctx.db.insert("teachers", {
      name: args.name,
      email: args.email,
      subject: args.subject,
      gradeBand: args.gradeBand,
      status: "pending",
      createdAt: Date.now(),
    });
    
    // Schedule Clerk organization invite immediately
    let inviteSent = false;
    try {
      await ctx.scheduler.runAfter(0, "teachers:sendClerkInvite" as any, {
        organizationId: user.clerkOrganizationId,
        email: args.email,
      });
      inviteSent = true;
      console.log(`Scheduled Clerk org invite to ${args.email}`);
    } catch (error) {
      console.error("Failed to schedule Clerk org invite:", error);
      // Don't fail the teacher creation if invite fails
    }
    
    return { success: true, teacherId, inviteSent };
  },
});

// List teachers for the current user's organization
export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("teachers"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.string(),
      subject: v.array(v.string()),
      gradeBand: v.string(),
      status: v.union(v.literal("pending"), v.literal("active")),
      userId: v.optional(v.id("users")),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx) => {
    const user = await getCurrentUserWithOrg(ctx);
    
    if (!user.clerkOrganizationId) {
      return [];
    }
    
    // Get all users in this organization
    const orgUsers = await ctx.db
      .query("users")
      .withIndex("by_organization", (q) => q.eq("clerkOrganizationId", user.clerkOrganizationId))
      .collect();
    
    const orgUserIds = orgUsers.map(u => u._id);
    
    // Get teachers associated with these users OR pending teachers from this coach
    const allTeachers = await ctx.db.query("teachers").collect();
    
    const orgTeachers = allTeachers.filter(teacher => {
      // Include if teacher is linked to an org user
      if (teacher.userId && orgUserIds.includes(teacher.userId)) {
        return true;
      }
      // Include if teacher is pending (no userId yet) - these are created by coaches
      if (teacher.status === "pending" && !teacher.userId) {
        return true;
      }
      return false;
    });
    
    return orgTeachers;
  },
});

// Update a teacher
export const update = mutation({
  args: {
    id: v.id("teachers"),
    name: v.string(),
    email: v.string(),
    subject: v.array(v.string()),
    gradeBand: v.string(),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    
    if (user.role !== "coach") {
      throw new Error("Only coaches can update teachers");
    }
    
    const teacher = await ctx.db.get(args.id);
    if (!teacher) throw new Error("Teacher not found");
    
    // Check if this teacher belongs to the coach's organization
    if (teacher.userId) {
      const teacherUser = await ctx.db.get(teacher.userId);
      if (!teacherUser || teacherUser.clerkOrganizationId !== user.clerkOrganizationId) {
        throw new Error("You can only update teachers in your organization");
      }
    }
    
    await ctx.db.patch(args.id, {
      name: args.name,
      email: args.email,
      subject: args.subject,
      gradeBand: args.gradeBand,
    });
    
    return { success: true };
  },
});

// Remove a teacher
export const remove = mutation({
  args: { 
    id: v.id("teachers"),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    
    if (user.role !== "coach") {
      throw new Error("Only coaches can remove teachers");
    }
    
    const teacher = await ctx.db.get(args.id);
    if (!teacher) throw new Error("Teacher not found");
    
    // Check if this teacher belongs to the coach's organization
    if (teacher.userId) {
      const teacherUser = await ctx.db.get(teacher.userId);
      if (!teacherUser || teacherUser.clerkOrganizationId !== user.clerkOrganizationId) {
        throw new Error("You can only remove teachers from your organization");
      }
    }
    
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Get teacher record by current user (for teachers viewing their own data)
export const getMyTeacherRecord = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("teachers"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.string(),
      subject: v.array(v.string()),
      gradeBand: v.string(),
      status: v.union(v.literal("pending"), v.literal("active")),
      userId: v.optional(v.id("users")),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    
    if (!user || user.role !== "teacher") return null;
    
    // Find teacher record by userId
    if (user._id) {
      const teacher = await ctx.db
        .query("teachers")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();
      if (teacher) return teacher;
    }
    
    // Fallback: find by email for pending teachers
    const teacherByEmail = await ctx.db
      .query("teachers")
      .withIndex("by_email", (q) => q.eq("email", user.email))
      .first();
    
    return teacherByEmail;
  },
});

// Get a teacher by ID (for coaches viewing teacher details)
export const getById = query({
  args: {
    teacherId: v.id("teachers"),
  },
  returns: v.union(
    v.object({
      _id: v.id("teachers"),
      _creationTime: v.number(),
      name: v.string(),
      email: v.string(),
      subject: v.array(v.string()),
      gradeBand: v.string(),
      status: v.union(v.literal("pending"), v.literal("active")),
      userId: v.optional(v.id("users")),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher) return null;
    
    // Check permission: either coach in same org or the teacher themselves
    if (user.role === "coach") {
      if (teacher.userId) {
        const teacherUser = await ctx.db.get(teacher.userId);
        if (!teacherUser || teacherUser.clerkOrganizationId !== user.clerkOrganizationId) {
          throw new Error("You can only view teachers in your organization");
        }
      }
      // Allow coaches to view pending teachers they created
    } else if (user.role === "teacher") {
      // Teachers can only view their own record
      if (teacher.userId !== user._id && teacher.email !== user.email) {
        throw new Error("You can only view your own teacher record");
      }
    }
    
    return teacher;
  },
});

// Internal action to send Clerk organization invite
export const sendClerkInvite = action({
  args: {
    organizationId: v.string(),
    email: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { createClerkClient } = await import("@clerk/backend");
    
    try {
      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      
      await clerk.organizations.createOrganizationInvitation({
        organizationId: args.organizationId,
        emailAddress: args.email,
        role: "org:member",
      });
      
      console.log(`Successfully sent Clerk org invite to ${args.email}`);
    } catch (error) {
      console.error("Failed to send Clerk org invite:", error);
      throw error;
    }
    return null;
  },
}); 