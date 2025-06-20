import { mutation, query } from "./_generated/server";
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

// Create teacher details for an existing user (invited via Clerk)
export const createFromUser = mutation({
  args: {
    userId: v.id("users"),
    subject: v.array(v.string()),
    gradeBand: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    teacherId: v.id("teachers"),
  }),
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUserWithOrg(ctx);
    
    // Only coaches can create teacher records
    if (currentUser.role !== "coach") {
      throw new Error("Only coaches can create teacher records");
    }
    
    // Get the user we're creating a teacher record for
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Verify user is in the same organization
    if (user.clerkOrganizationId !== currentUser.clerkOrganizationId) {
      throw new Error("User is not in your organization");
    }
    
    // Verify user has teacher role
    if (user.role !== "teacher") {
      throw new Error("User is not a teacher");
    }
    
    // Check if teacher record already exists
    const existingTeacher = await ctx.db
      .query("teachers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
      
    if (existingTeacher) {
      throw new Error("Teacher record already exists for this user");
    }
    
    // Create teacher record
    const teacherId = await ctx.db.insert("teachers", {
      name: user.name,
      email: user.email || "",
      subject: args.subject,
      gradeBand: args.gradeBand,
      status: "active", // User is already in the org
      userId: args.userId,
      createdAt: Date.now(),
    });
    
    return { success: true, teacherId };
  },
});

// Create a teacher record (invites handled by Clerk OrganizationProfile)
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
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUserWithOrg(ctx);
    
    // Only coaches can create teachers
    if (user.role !== "coach") {
      throw new Error("Only coaches can create teachers");
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
    
    return { success: true, teacherId };
  },
});

// List teachers for the current user's organization
// This includes both teacher records and invited users who need teacher details added
export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.union(v.id("teachers"), v.id("users")), // Could be either table
      _creationTime: v.number(),
      name: v.string(),
      email: v.string(),
      subject: v.array(v.string()),
      gradeBand: v.string(),
      status: v.union(v.literal("pending"), v.literal("active"), v.literal("needs_details")),
      userId: v.optional(v.id("users")),
      createdAt: v.number(),
      isUserRecord: v.optional(v.boolean()), // Flag to identify if this is from users table
    })
  ),
  handler: async (ctx) => {
    const user = await getCurrentUserWithOrg(ctx);
    
    if (!user.clerkOrganizationId) {
      return [];
    }
    
    // Get all users in this organization with teacher role
    const orgTeacherUsers = await ctx.db
      .query("users")
      .withIndex("by_organization", (q) => q.eq("clerkOrganizationId", user.clerkOrganizationId))
      .filter((q) => q.eq(q.field("role"), "teacher"))
      .collect();
    
    // Get all teacher records
    const allTeachers = await ctx.db.query("teachers").collect();
    
    // Find teacher records associated with org users
    const orgTeachers = allTeachers.filter(teacher => {
      // Include if teacher is linked to an org user
      if (teacher.userId && orgTeacherUsers.some(u => u._id === teacher.userId)) {
        return true;
      }
      // Include if teacher is pending (no userId yet) - these are created by coaches
      if (teacher.status === "pending" && !teacher.userId) {
        return true;
      }
      return false;
    });
    
    // Find users who don't have teacher records yet (invited via Clerk but no details)
    const teacherUserIds = new Set(orgTeachers.map(t => t.userId).filter(Boolean));
    const usersWithoutTeacherRecords = orgTeacherUsers.filter(u => !teacherUserIds.has(u._id));
    
    // Combine both lists
    const result = [
      // Existing teacher records
      ...orgTeachers.map(t => ({
        _id: t._id as any,
        _creationTime: t._creationTime,
        name: t.name,
        email: t.email,
        subject: t.subject || [],
        gradeBand: t.gradeBand || "",
        status: t.status as any,
        userId: t.userId,
        createdAt: t.createdAt,
        isUserRecord: false,
      })),
      // Users who need teacher details added
      ...usersWithoutTeacherRecords.map(u => ({
        _id: u._id as any,
        _creationTime: u._creationTime,
        name: u.name,
        email: u.email || "",
        subject: [] as string[],
        gradeBand: "",
        status: "needs_details" as const,
        userId: u._id,
        createdAt: u.createdAt || Date.now(),
        isUserRecord: true,
      })),
    ];
    
    return result;
  },
});

// Update a teacher record
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

// Get teacher record by Clerk user ID (for linking user to teacher record)
export const getByUserClerkId = query({
  args: {
    clerkId: v.string(),
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
    // Get user by Clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    
    if (!user) return null;
    
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

 