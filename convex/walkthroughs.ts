import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

/**
 * Create a completed walkthrough - simplified single-step process
 */
export const createWalkthrough = mutation({
  args: {
    teacherId: v.id("teachers"),
    walkthroughDate: v.number(),
    evidenceSummary: v.string(),
    reinforcementIndicator: v.string(),
    refinementIndicator: v.string(),
    reinforcementFeedback: v.string(),
    refinementFeedback: v.string(),
    hasProPlan: v.optional(v.boolean()),
    hasStarterPlan: v.optional(v.boolean()),
  },
  returns: v.id("walkthroughs"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");
    
    // Get teacher
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher) throw new Error("Teacher not found");
    
    // Only coaches can create walkthroughs
    if (user.role !== "coach") {
      throw new Error("Only coaches can create walkthroughs");
    }
    
    // Check walkthrough usage limit using proper plan detection
    const usageCheck = await ctx.runQuery(api.plans.getAIUsageThisMonth, {
      hasProPlan: args.hasProPlan,
      hasStarterPlan: args.hasStarterPlan,
    });
    if (usageCheck.isOverLimit) {
      throw new Error(
        `You have reached your monthly walkthrough limit (${usageCheck.walkthroughsLimit}) for your plan. Upgrade for more.`,
      );
    }

    const now = Date.now();
    const walkthroughId = await ctx.db.insert("walkthroughs", {
      teacherId: args.teacherId,
      observerId: user._id,
      walkthroughDate: args.walkthroughDate,
      status: "completed",
      evidenceSummary: args.evidenceSummary,
      reinforcementIndicator: args.reinforcementIndicator,
      refinementIndicator: args.refinementIndicator,
      reinforcementFeedback: args.reinforcementFeedback,
      refinementFeedback: args.refinementFeedback,
      createdAt: now,
      updatedAt: now,
    });
    
    // Increment usage tracking
    await ctx.runMutation(api.usage.trackUsage, { type: "walkthrough" });

    // Update workflow state
    try {
      await ctx.runMutation(internal.workflowState.recordWalkthroughCompletionInternal, {
        teacherId: args.teacherId,
        walkthroughDate: args.walkthroughDate,
        evidenceQuality: Math.min(10, args.evidenceSummary.length / 20), // Simple quality metric
      });
    } catch (error) {
      // Don't fail walkthrough creation if workflow update fails
      console.warn("Failed to update workflow state for walkthrough:", error);
    }

    return walkthroughId;
  },
});

/**
 * Get walkthroughs for the current user (handles both coach and teacher cases)
 */
export const getMyWalkthroughs = query({
  args: {
    searchTerm: v.optional(v.string()),
    statusFilter: v.optional(v.string()),
    teacherId: v.optional(v.id("teachers")),
  },
  returns: v.object({
    walkthroughs: v.array(
      v.object({
        _id: v.id("walkthroughs"),
        _creationTime: v.float64(),
        teacherId: v.id("teachers"),
        observerId: v.id("users"),
        walkthroughDate: v.number(),
        status: v.literal("completed"),
        evidenceSummary: v.string(),
        reinforcementIndicator: v.string(),
        refinementIndicator: v.string(),
        reinforcementFeedback: v.string(),
        refinementFeedback: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
      }),
    ),
    isCoach: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const isCoach = user.role === "coach";
    let walkthroughs;

    if (isCoach) {
      if (args.teacherId) {
        // Coach viewing specific teacher's walkthroughs
        walkthroughs = await ctx.db
          .query("walkthroughs")
          .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId!))
          .order("desc")
          .collect();
      } else {
        // Coach viewing all their walkthroughs
        walkthroughs = await ctx.db
          .query("walkthroughs")
          .withIndex("by_observer", (q) => q.eq("observerId", user._id))
          .order("desc")
          .collect();
      }
    } else {
      // Teacher viewing their own walkthroughs
      const teacher = await ctx.db
        .query("teachers")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .unique();
      
      if (!teacher) {
        throw new Error("Teacher record not found");
      }

      walkthroughs = await ctx.db
        .query("walkthroughs")
        .withIndex("by_teacher", (q) => q.eq("teacherId", teacher._id))
        .order("desc")
        .collect();
    }

    // Apply filters if provided
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      walkthroughs = walkthroughs.filter(w => 
        w.evidenceSummary.toLowerCase().includes(searchLower) ||
        w.reinforcementIndicator.toLowerCase().includes(searchLower) ||
        w.refinementIndicator.toLowerCase().includes(searchLower)
      );
    }

    if (args.statusFilter && args.statusFilter !== "all") {
      walkthroughs = walkthroughs.filter(w => w.status === args.statusFilter);
    }

    return {
      walkthroughs,
      isCoach,
    };
  },
});

/**
 * List walkthroughs by observer (coach)
 */
export const listByObserver = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("walkthroughs"),
      _creationTime: v.float64(),
      teacherId: v.id("teachers"),
      observerId: v.id("users"),
      walkthroughDate: v.number(),
      status: v.literal("completed"),
      evidenceSummary: v.string(),
      reinforcementIndicator: v.string(),
      refinementIndicator: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    return await ctx.db
      .query("walkthroughs")
      .withIndex("by_observer", (q) => q.eq("observerId", user._id))
      .order("desc")
      .collect();
  },
});

/**
 * List walkthroughs by teacher
 */
export const listByTeacher = query({
  args: { teacherId: v.id("teachers") },
  returns: v.array(
    v.object({
      _id: v.id("walkthroughs"),
      _creationTime: v.float64(),
      teacherId: v.id("teachers"),
      observerId: v.id("users"),
      walkthroughDate: v.number(),
      status: v.literal("completed"),
      evidenceSummary: v.string(),
      reinforcementIndicator: v.string(),
      refinementIndicator: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    return await ctx.db
      .query("walkthroughs")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .order("desc")
      .collect();
  },
});

/**
 * Get a single walkthrough by ID
 */
export const getById = query({
  args: { walkthroughId: v.id("walkthroughs") },
  returns: v.union(
    v.object({
      _id: v.id("walkthroughs"),
      _creationTime: v.float64(),
      teacherId: v.id("teachers"),
      observerId: v.id("users"),
      walkthroughDate: v.number(),
      status: v.literal("completed"),
      evidenceSummary: v.string(),
      reinforcementIndicator: v.string(),
      refinementIndicator: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const walkthrough = await ctx.db.get(args.walkthroughId);
    if (!walkthrough) return null;

    // Check permissions - user must be the observer or the teacher
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    if (user.role === "coach" && walkthrough.observerId !== user._id) {
      throw new Error("You can only view your own walkthroughs");
    }

    if (user.role === "teacher") {
      const teacher = await ctx.db
        .query("teachers")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .unique();
      if (!teacher || walkthrough.teacherId !== teacher._id) {
        throw new Error("You can only view your own walkthroughs");
      }
    }

    return walkthrough;
  },
});

/**
 * Get comprehensive view details for a walkthrough (used by view page)
 */
export const getViewDetails = query({
  args: { walkthroughId: v.id("walkthroughs") },
  returns: v.object({
    walkthrough: v.union(
      v.object({
        _id: v.id("walkthroughs"),
        _creationTime: v.float64(),
        teacherId: v.id("teachers"),
        observerId: v.id("users"),
        walkthroughDate: v.number(),
        status: v.literal("completed"),
        evidenceSummary: v.string(),
        reinforcementIndicator: v.string(),
        refinementIndicator: v.string(),
        reinforcementFeedback: v.string(),
        refinementFeedback: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
      }),
      v.null(),
    ),
    teacher: v.union(
      v.object({
        _id: v.id("teachers"),
        name: v.string(),
        email: v.string(),
        subject: v.array(v.string()),
        gradeBand: v.string(),
      }),
      v.null(),
    ),
    entries: v.array(v.any()), // Legacy field for compatibility
    userRole: v.union(v.literal("coach"), v.literal("teacher")),
    indicatorNames: v.object({
      reinforcementIndicator: v.string(),
      refinementIndicator: v.string(),
    }),
    canView: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const walkthrough = await ctx.db.get(args.walkthroughId);
    if (!walkthrough) {
      return {
        walkthrough: null,
        teacher: null,
        entries: [],
        userRole: user.role,
        indicatorNames: { reinforcementIndicator: "", refinementIndicator: "" },
        canView: false,
      };
    }

    // Check permissions - user must be the observer or the teacher
    let canView = false;
    let teacher = null;

    if (user.role === "coach" && walkthrough.observerId === user._id) {
      canView = true;
    }

    if (user.role === "teacher") {
      const teacherRecord = await ctx.db
        .query("teachers")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .unique();
      if (teacherRecord && walkthrough.teacherId === teacherRecord._id) {
        canView = true;
      }
    }

    // Get teacher information
    teacher = await ctx.db.get(walkthrough.teacherId);

    // Get indicator names (you may want to add a helper function for this)
    const indicatorNames = {
      reinforcementIndicator: walkthrough.reinforcementIndicator,
      refinementIndicator: walkthrough.refinementIndicator,
    };

    return {
      walkthrough: canView ? walkthrough : null,
      teacher: canView && teacher ? {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        subject: teacher.subject,
        gradeBand: teacher.gradeBand,
      } : null,
      entries: [], // Legacy field - no longer used but kept for compatibility
      userRole: user.role,
      indicatorNames,
      canView,
    };
  },
});

/**
 * Delete a walkthrough
 */
export const deleteWalkthrough = mutation({
  args: { walkthroughId: v.id("walkthroughs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const walkthrough = await ctx.db.get(args.walkthroughId);
    if (!walkthrough) throw new Error("Walkthrough not found");

    // Only the observer (coach) can delete walkthroughs
    if (walkthrough.observerId !== user._id) {
      throw new Error("You can only delete your own walkthroughs");
    }

    await ctx.db.delete(args.walkthroughId);
    return null;
  },
});