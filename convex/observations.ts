import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get the current user to filter by organization
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    // Get observations for the user
    return await ctx.db
      .query("observations")
      .withIndex("by_observer", (q) => q.eq("observerId", user._id))
      .collect();
  },
});

export const createObservationAndResponses = mutation({
  args: {
    teacherId: v.id("teachers"),
    subject: v.string(),
    gradeLevels: v.array(v.string()),
    observationDate: v.number(),
    rubricResponses: v.optional(v.record(v.string(), v.number())),
    walkthroughEntries: v.optional(
      v.array(
        v.object({
          indicatorAcronym: v.string(),
          type: v.union(v.literal("reinforcement"), v.literal("refinement")),
          comment: v.string(),
        }),
      ),
    ),
  },
  returns: v.id("observations"),
  handler: async (ctx, args) => {
    // Authentication check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Log access denied event
      await ctx.runMutation(internal.audit.createAuditLog, {
        action: "access_denied",
        resourceType: "observations",
        metadata: { reason: "Not authenticated" },
        severity: "warning",
      });
      
      throw new Error("Not authenticated");
    }

    // Get user with role information
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      // Log access denied event
      await ctx.runMutation(internal.audit.createAuditLog, {
        action: "access_denied",
        resourceType: "observations",
        metadata: { reason: "User not found", clerkId: identity.subject },
        severity: "warning",
      });
      
      throw new Error("User not found");
    }

    // Role-based access control
    const role = (identity as any).role || (identity as any).token?.role;
    const allowedRoles = ["admin", "school_leader", "instructional_coach"];
    if (!allowedRoles.includes(role)) {
      // Log access denied event
      await ctx.runMutation(internal.audit.createAuditLog, {
        userId: user._id,
        action: "access_denied",
        resourceType: "observations",
        metadata: { reason: "Insufficient permissions", role },
        severity: "warning",
      });
      
      throw new Error("You don't have permission to create observations");
    }

    // Verify user has access to the teacher's organization
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher) {
      // Log error event
      await ctx.runMutation(internal.audit.createAuditLog, {
        userId: user._id,
        action: "observation_create",
        resourceType: "observations",
        metadata: { error: "Teacher not found", teacherId: args.teacherId },
        severity: "warning",
      });
      
      throw new Error("Teacher not found");
    }

    // Get the teacher's creator to check their organization
    const teacherCreator = await ctx.db.get(teacher.createdBy);
    if (!teacherCreator) {
      // Log error event
      await ctx.runMutation(internal.audit.createAuditLog, {
        userId: user._id,
        action: "observation_create",
        resourceType: "observations",
        metadata: { error: "Teacher's organization could not be determined", teacherId: args.teacherId },
        severity: "warning",
      });
      
      throw new Error("Teacher's organization could not be determined");
    }

    // Check if user is in the same organization
    if (user.organization !== teacherCreator.organization && role !== "admin") {
      // Log access denied event
      await ctx.runMutation(internal.audit.createAuditLog, {
        userId: user._id,
        action: "access_denied",
        resourceType: "observations",
        metadata: { 
          reason: "Cross-organization access attempt", 
          userOrg: user.organization,
          teacherOrg: teacherCreator.organization,
          teacherId: args.teacherId
        },
        severity: "critical",
      });
      
      throw new Error("You don't have permission to create observations for this teacher");
    }

    // Implement rate limiting (simple version)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentObservations = await ctx.db
      .query("observations")
      .withIndex("by_observer", (q) => q.eq("observerId", user._id))
      .filter((q) => q.gt(q.field("createdAt"), oneHourAgo))
      .collect();

    // Limit to 10 observations per hour
    if (recentObservations.length >= 10) {
      // Log rate limit event
      await ctx.runMutation(internal.audit.createAuditLog, {
        userId: user._id,
        action: "rate_limit_exceeded",
        resourceType: "observations",
        metadata: { 
          recentObservationCount: recentObservations.length,
          timeWindow: "1 hour"
        },
        severity: "warning",
      });
      
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    const now = Date.now();
    const observationId = await ctx.db.insert("observations", {
      teacherId: args.teacherId,
      observerId: user._id,
      subject: args.subject,
      gradeLevels: args.gradeLevels,
      observationDate: args.observationDate,
      status: "completed",
      createdAt: now,
      updatedAt: now,
    });

    if (args.rubricResponses) {
      console.log("rubricResponses received:", args.rubricResponses);
      for (const [indicatorAcronym, rating] of Object.entries(
        args.rubricResponses,
      )) {
        await ctx.db.insert("rubricRatings", {
          observationId,
          indicatorAcronym,
          rating,
          createdAt: now,
        });
      }
    }

    if (args.walkthroughEntries) {
      // Removed: walkthroughEntries are now handled in walkthroughs.ts, not observations.ts
    }

    // Log successful observation creation
    await ctx.runMutation(internal.audit.createAuditLog, {
      userId: user._id,
      action: "observation_create",
      resourceType: "observations",
      resourceId: observationId,
      metadata: { 
        teacherId: args.teacherId,
        observationDate: args.observationDate,
        hasRubricResponses: !!args.rubricResponses,
        hasWalkthroughEntries: !!args.walkthroughEntries
      },
      severity: "info",
    });

    return observationId;
  },
});


