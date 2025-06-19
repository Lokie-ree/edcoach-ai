import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Get organization members with their app-specific teacher data
 * 
 * This function bridges Clerk organization members with app-specific teacher data.
 * It uses the existing schema and indexes to maintain compatibility.
 */
export const getOrgMembersWithTeacherData = query({
  args: { 
    clerkOrganizationId: v.string() 
  },
  returns: v.array(v.object({
    _id: v.id("users"),
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.string(),
    teacherId: v.optional(v.id("teachers")),
    teacherData: v.optional(v.object({
      name: v.string(),
      email: v.optional(v.string()),
      subject: v.array(v.string()),
      gradeBand: v.string(),
      status: v.optional(v.string()),
    })),
    createdAt: v.number(),
    orgRole: v.optional(v.string()),
  })),
  handler: async (ctx, args) => {
    // Get all users in this organization
    const users = await ctx.db
      .query("users")
      .withIndex("by_organization", (q) => q.eq("clerkOrganizationId", args.clerkOrganizationId))
      .collect();

    const results = [];
    
    for (const user of users) {
      // Try to find teacher data for this user
      const teacher = await ctx.db
        .query("teachers")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();

      results.push({
        _id: user._id,
        clerkId: user.clerkId,
        name: user.name,
        email: user.email,
        role: user.role,
        teacherId: teacher?._id,
        teacherData: teacher ? {
          name: teacher.name,
          email: teacher.email,
          subject: teacher.subject,
          gradeBand: teacher.gradeBand,
          status: teacher.status,
        } : undefined,
        createdAt: user.createdAt,
        orgRole: user.role === "coach" ? "org:admin" : "org:member",
      });
    }

    return results;
  },
}); 