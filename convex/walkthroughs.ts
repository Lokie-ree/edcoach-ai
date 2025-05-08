import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const createWalkthroughAndEntries = mutation({
  args: {
    teacherId: v.id("teachers"),
    walkthroughDate: v.number(),
    status: v.union(v.literal("draft"), v.literal("completed")),
    reinforcementIndicators: v.array(v.string()),
    refinementIndicators: v.array(v.string()),
    reinforcementComments: v.array(v.object({ indicator: v.string(), comment: v.string() })),
    refinementComments: v.array(v.object({ indicator: v.string(), comment: v.string() })),
    additionalComments: v.optional(v.string()),
    organization: v.string(),
    walkthroughEntries: v.optional(
      v.array(
        v.object({
          indicatorAcronym: v.string(),
          type: v.union(v.literal("reinforcement"), v.literal("refinement")),
          comment: v.string(),
        })
      )
    ),
  },
  returns: v.id("walkthroughs"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Get role from Clerk JWT
    const role = (identity as any).role || (identity as any).token?.role;
    const allowedRoles = ["admin", "school_leader", "instructional_coach"];
    if (!allowedRoles.includes(role)) {
      throw new Error("You don't have permission to create walkthroughs");
    }

    // Get user (for organization and _id)
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // Check teacher
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher) throw new Error("Teacher not found");
    const teacherOrg = teacher.organization || "";
    if (user.organization !== teacherOrg && role !== "admin") {
      throw new Error("You don't have permission to create walkthroughs for this teacher");
    }

    const now = Date.now();
    const walkthroughId = await ctx.db.insert("walkthroughs", {
      teacherId: args.teacherId,
      observerId: user._id,
      walkthroughDate: args.walkthroughDate,
      status: args.status,
      reinforcementIndicators: args.reinforcementIndicators,
      refinementIndicators: args.refinementIndicators,
      reinforcementComments: args.reinforcementComments,
      refinementComments: args.refinementComments,
      additionalComments: args.additionalComments,
      createdAt: now,
      updatedAt: now,
      organization: user.organization,
    });

    if (args.walkthroughEntries) {
      for (const entry of args.walkthroughEntries) {
        await ctx.db.insert("walkthroughEntries", {
          walkthroughId,
          indicatorAcronym: entry.indicatorAcronym,
          type: entry.type,
          comment: entry.comment,
          createdAt: now,
        });
      }
    }

    return walkthroughId;
  },
}); 