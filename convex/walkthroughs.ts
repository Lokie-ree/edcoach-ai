import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { getCurrentUser } from "./auth";

export const createWalkthroughAndEntries = mutation({
  args: {
    teacherId: v.id("teachers"),
    walkthroughDate: v.number(),
    status: v.union(v.literal("draft"), v.literal("completed")),
    evidenceSummary: v.string(),
    reinforcementIndicator: v.string(),
    refinementIndicator: v.string(),
    walkthroughEntries: v.array(
      v.object({
        indicatorAcronym: v.string(),
        type: v.union(v.literal("reinforcement"), v.literal("refinement")),
        aiFeedback: v.optional(v.string()),
      }),
    ),
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
    // Only the coach associated with this teacher can create walkthroughs
    // TODO: Add org-based permission check here if needed

    // ENFORCE WALKTHROUGH LIMITS
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
      status: args.status,
      evidenceSummary: args.evidenceSummary,
      reinforcementIndicator: args.reinforcementIndicator,
      refinementIndicator: args.refinementIndicator,
      createdAt: now,
      updatedAt: now,
    });
    // Increment usage after successful creation
    await ctx.runMutation(api.usage.trackUsage, { type: "walkthrough" });
    for (const entry of args.walkthroughEntries) {
      await ctx.db.insert("walkthroughEntries", {
        walkthroughId,
        indicatorAcronym: entry.indicatorAcronym,
        type: entry.type,
        aiFeedback: entry.aiFeedback,
        createdAt: now,
      });
    }
    return walkthroughId;
  },
});

export const updateWalkthroughAndEntries = mutation({
  args: {
    walkthroughId: v.id("walkthroughs"),
    teacherId: v.id("teachers"),
    walkthroughDate: v.number(),
    status: v.union(v.literal("draft"), v.literal("completed")),
    evidenceSummary: v.string(),
    reinforcementIndicator: v.string(),
    refinementIndicator: v.string(),
    walkthroughEntries: v.array(
      v.object({
        indicatorAcronym: v.string(),
        type: v.union(v.literal("reinforcement"), v.literal("refinement")),
        aiFeedback: v.optional(v.string()),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");
    // Check teacher
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher) throw new Error("Teacher not found");
    // Only the coach associated with this teacher can update walkthroughs
    // TODO: Add org-based permission check here if needed
    // Check walkthrough
    const walkthrough = await ctx.db.get(args.walkthroughId);
    if (!walkthrough) throw new Error("Walkthrough not found");
    if (walkthrough.observerId !== user._id) {
      throw new Error("You can only update your own walkthroughs");
    }
    const now = Date.now();
    await ctx.db.patch(args.walkthroughId, {
      teacherId: args.teacherId,
      walkthroughDate: args.walkthroughDate,
      status: args.status,
      evidenceSummary: args.evidenceSummary,
      reinforcementIndicator: args.reinforcementIndicator,
      refinementIndicator: args.refinementIndicator,
      updatedAt: now,
    });
    // Remove old entries
    const oldEntries = await ctx.db
      .query("walkthroughEntries")
      .withIndex("by_walkthrough", (q) =>
        q.eq("walkthroughId", args.walkthroughId),
      )
      .collect();
    for (const entry of oldEntries) {
      await ctx.db.delete(entry._id);
    }
    // Insert new entries
    for (const entry of args.walkthroughEntries) {
      await ctx.db.insert("walkthroughEntries", {
        walkthroughId: args.walkthroughId,
        indicatorAcronym: entry.indicatorAcronym,
        type: entry.type,
        aiFeedback: entry.aiFeedback,
        createdAt: now,
      });
    }
    return null;
  },
});

export const listDraftWalkthroughs = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("walkthroughs"),
      _creationTime: v.float64(),
      teacherId: v.id("teachers"),
      observerId: v.id("users"),
      walkthroughDate: v.number(),
      status: v.union(v.literal("draft"), v.literal("completed")),
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
    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");
    // List drafts for this observer
    const drafts = await ctx.db
      .query("walkthroughs")
      .withIndex("by_observer", (q) => q.eq("observerId", user._id))
      .filter((q) => q.eq(q.field("status"), "draft"))
      .order("desc")
      .collect();
    return drafts;
  },
});

// List all walkthroughs for a coach (by their teachers)
export const listByCoach = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("walkthroughs"),
      _creationTime: v.number(),
      teacherId: v.id("teachers"),
      observerId: v.id("users"),
      walkthroughDate: v.number(),
      status: v.union(v.literal("draft"), v.literal("completed")),
      evidenceSummary: v.string(),
      reinforcementIndicator: v.string(),
      refinementIndicator: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    // TODO: Filter by organization membership if needed
    return await ctx.db.query("walkthroughs").collect();
  },
});

// List all walkthroughs for a specific teacher
export const listByTeacher = query({
  args: {
    teacherId: v.id("teachers"),
  },
  returns: v.array(
    v.object({
      _id: v.id("walkthroughs"),
      _creationTime: v.number(),
      teacherId: v.id("teachers"),
      observerId: v.id("users"),
      walkthroughDate: v.number(),
      status: v.union(v.literal("draft"), v.literal("completed")),
      evidenceSummary: v.string(),
      reinforcementIndicator: v.string(),
      refinementIndicator: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("walkthroughs")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .collect();
  },
});

// Get a specific walkthrough by ID
export const getById = query({
  args: {
    walkthroughId: v.id("walkthroughs"),
  },
  returns: v.union(
    v.object({
      _id: v.id("walkthroughs"),
      _creationTime: v.number(),
      teacherId: v.id("teachers"),
      observerId: v.id("users"),
      walkthroughDate: v.number(),
      status: v.union(v.literal("draft"), v.literal("completed")),
      evidenceSummary: v.string(),
      reinforcementIndicator: v.string(),
      refinementIndicator: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.walkthroughId);
  },
});

export const listByOrg = query({
  args: { clerkOrganizationId: v.optional(v.string()) },
  returns: v.array(
    v.object({
      _id: v.id("walkthroughs"),
      _creationTime: v.number(),
      teacherId: v.id("teachers"),
      observerId: v.id("users"),
      walkthroughDate: v.number(),
      status: v.union(v.literal("draft"), v.literal("completed")),
      evidenceSummary: v.string(),
      reinforcementIndicator: v.string(),
      refinementIndicator: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    // If no organization ID provided, return empty array
    if (!args.clerkOrganizationId) {
      return [];
    }

    // Get all users in the org
    const users = await ctx.db
      .query("users")
      .withIndex("by_organization", (q) =>
        q.eq("clerkOrganizationId", args.clerkOrganizationId),
      )
      .collect();
    const userIds = users.map((u) => u._id);

    if (userIds.length === 0) {
      return [];
    }

    // Get all teachers for these users
    const teachers = await ctx.db
      .query("teachers")
      .filter((q) => q.or(...userIds.map((id) => q.eq(q.field("userId"), id))))
      .collect();
    const teacherIds = teachers.map((t) => t._id);

    if (teacherIds.length === 0) {
      return [];
    }

    // Get all walkthroughs for these teachers
    return await ctx.db
      .query("walkthroughs")
      .filter((q) =>
        q.or(...teacherIds.map((id) => q.eq(q.field("teacherId"), id))),
      )
      .collect();
  },
});

export const getViewDetails = query({
  args: { walkthroughId: v.id("walkthroughs") },
  returns: v.object({
    walkthrough: v.any(),
    teacher: v.any(),
    observer: v.any(),
    entries: v.array(v.any()),
    canView: v.boolean(),
    userRole: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { walkthrough: null, teacher: null, observer: null, entries: [], canView: false, userRole: "none" };
    const walkthrough = await ctx.db.get(args.walkthroughId);
    if (!walkthrough) return { walkthrough: null, teacher: null, observer: null, entries: [], canView: false, userRole: user.role };
    const teacher = await ctx.db.get(walkthrough.teacherId);
    const observer = await ctx.db.get(walkthrough.observerId);
    const entries = await ctx.db
      .query("walkthroughEntries")
      .withIndex("by_walkthrough", (q) => q.eq("walkthroughId", args.walkthroughId))
      .collect();
    // Permission logic: coach can view any, teacher can view their own
    let canView = false;
    if (user.role === "coach") {
      canView = true;
    } else if (user.role === "teacher" && teacher && teacher.userId && teacher.userId === user._id) {
      canView = true;
    }
    return {
      walkthrough,
      teacher,
      observer,
      entries,
      canView,
      userRole: user.role,
    };
  },
});

export const getMyWalkthroughs = query({
  args: {
    searchTerm: v.optional(v.string()),
    statusFilter: v.optional(v.string()),
  },
  returns: v.object({
    walkthroughs: v.array(v.any()),
    isCoach: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || (user.role !== "teacher" && user.role !== "coach")) {
      return { walkthroughs: [], isCoach: false };
    }
    let walkthroughs: any[] = [];
    let teachers: any[] = [];
    if (user.role === "teacher") {
      // Get teacher record
      const teacher = await ctx.db
        .query("teachers")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .first();
      if (!teacher) return { walkthroughs: [], isCoach: false };
      walkthroughs = await ctx.db
        .query("walkthroughs")
        .withIndex("by_teacher", (q) => q.eq("teacherId", teacher._id))
        .collect();
    } else if (user.role === "coach") {
      // Get all teachers for this coach
      teachers = await ctx.db
        .query("teachers")
        .withIndex("by_coach", (q) => q.eq("coachId", user._id))
        .collect();
      const teacherIds = teachers.map(t => t._id);
      walkthroughs = await ctx.db
        .query("walkthroughs")
        .filter((q) => q.or(...teacherIds.map(id => q.eq(q.field("teacherId"), id))))
        .collect();
    }
    // Attach teacher name for coaches
    if (user.role === "coach") {
      walkthroughs = walkthroughs.map(w => ({
        ...w,
        teacherName: teachers.find(t => t._id === w.teacherId)?.name || "Unknown Teacher",
      }));
    }
    // Filter by search term
    if (args.searchTerm) {
      const term = args.searchTerm.toLowerCase();
      walkthroughs = walkthroughs.filter(w =>
        w.evidenceSummary?.toLowerCase().includes(term) ||
        w.reinforcementIndicator?.toLowerCase().includes(term) ||
        w.refinementIndicator?.toLowerCase().includes(term) ||
        (user.role === "coach" && w.teacherName?.toLowerCase().includes(term))
      );
    }
    // Filter by status
    if (args.statusFilter && args.statusFilter !== "all") {
      walkthroughs = walkthroughs.filter(w => w.status === args.statusFilter);
    }
    // Sort by date (newest first)
    walkthroughs = walkthroughs.sort((a, b) => b.walkthroughDate - a.walkthroughDate);
    return { walkthroughs, isCoach: user.role === "coach" };
  },
});

export const getMyProgress = query({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      strengths: v.array(
        v.object({
          indicator: v.string(),
          indicatorName: v.string(),
          count: v.number(),
          percent: v.number(),
        })
      ),
      growthAreas: v.array(
        v.object({
          indicator: v.string(),
          indicatorName: v.string(),
          count: v.number(),
          percent: v.number(),
        })
      ),
      recentReinforcements: v.array(
        v.object({
          indicator: v.string(),
          indicatorName: v.string(),
          walkthroughDate: v.number(),
          aiFeedback: v.string(),
        })
      ),
      coach: v.union(
        v.null(),
        v.object({
          name: v.string(),
          email: v.string(),
        })
      ),
      coachingStats: v.object({
        totalWalkthroughs: v.number(),
        completedWalkthroughs: v.number(),
        draftWalkthroughs: v.number(),
        lastObservation: v.union(v.number(), v.null()),
        latestFeedback: v.union(v.string(), v.null()),
        latestIndicator: v.union(v.string(), v.null()),
      }),
    })
  ),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== "teacher") return null;
    // Get teacher record
    const teacher = await ctx.db
      .query("teachers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    if (!teacher) return null;
    // Get coach info
    const coach = teacher.coachId
      ? await ctx.db.get(teacher.coachId)
      : null;
    // Get all walkthroughs for this teacher
    const walkthroughs = await ctx.db
      .query("walkthroughs")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacher._id))
      .collect();
    // Get all walkthrough entries for this teacher
    const walkthroughIds = walkthroughs.map((w) => w._id);
    let walkthroughEntries: any[] = [];
    for (const walkthroughId of walkthroughIds) {
      const entries = await ctx.db
        .query("walkthroughEntries")
        .withIndex("by_walkthrough", (q) => q.eq("walkthroughId", walkthroughId))
        .collect();
      walkthroughEntries.push(...entries);
    }
    // Get all indicators for mapping
    const indicators = await ctx.db.query("rubricIndicators").collect();
    const indicatorMap = indicators.reduce((map, ind) => {
      map[ind.indicator_code] = ind.indicator_name;
      return map;
    }, {} as Record<string, string>);
    // Calculate strengths (reinforcement indicators)
    const reinforcementIndicators: Record<string, number> = {};
    const refinementIndicators: Record<string, number> = {};
    let completedWalkthroughs = 0;
    let draftWalkthroughs = 0;
    for (const w of walkthroughs) {
      if (w.status === "completed") {
        completedWalkthroughs++;
        if (w.reinforcementIndicator) {
          reinforcementIndicators[w.reinforcementIndicator] =
            (reinforcementIndicators[w.reinforcementIndicator] || 0) + 1;
        }
        if (w.refinementIndicator) {
          refinementIndicators[w.refinementIndicator] =
            (refinementIndicators[w.refinementIndicator] || 0) + 1;
        }
      } else if (w.status === "draft") {
        draftWalkthroughs++;
      }
    }
    // Top 3 strengths
    const topStrengths = Object.entries(reinforcementIndicators)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([indicator, count]) => ({
        indicator,
        indicatorName: indicatorMap[indicator] || indicator,
        count,
        percent:
          completedWalkthroughs > 0
            ? Math.round((count / completedWalkthroughs) * 100)
            : 0,
      }));
    // Top 3 growth areas
    const topGrowthAreas = Object.entries(refinementIndicators)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([indicator, count]) => ({
        indicator,
        indicatorName: indicatorMap[indicator] || indicator,
        count,
        percent:
          completedWalkthroughs > 0
            ? Math.round((count / completedWalkthroughs) * 100)
            : 0,
      }));
    // Recent reinforcements (last 8, sorted by walkthrough date)
    const reinforcements = walkthroughEntries
      .filter((entry) => entry.type === "reinforcement" && entry.aiFeedback)
      .map((entry) => {
        const walkthrough = walkthroughs.find((w) => w._id === entry.walkthroughId);
        return {
          indicator: entry.indicatorAcronym,
          indicatorName: indicatorMap[entry.indicatorAcronym] || entry.indicatorAcronym,
          walkthroughDate: walkthrough?.walkthroughDate || 0,
          aiFeedback: entry.aiFeedback,
        };
      })
      .sort((a, b) => b.walkthroughDate - a.walkthroughDate)
      .slice(0, 8);
    // Coaching stats
    const totalWalkthroughs = walkthroughs.length;
    const recentWalkthrough = walkthroughs.length > 0
      ? walkthroughs.slice().sort((a, b) => b.walkthroughDate - a.walkthroughDate)[0]
      : null;
    const lastObservation = recentWalkthrough?.walkthroughDate || null;
    const latestReinforcement = reinforcements.length > 0 ? reinforcements[0] : null;
    const coachingStats = {
      totalWalkthroughs,
      completedWalkthroughs,
      draftWalkthroughs,
      lastObservation,
      latestFeedback: latestReinforcement?.aiFeedback || null,
      latestIndicator: latestReinforcement?.indicatorName || null,
    };
    return {
      strengths: topStrengths,
      growthAreas: topGrowthAreas,
      recentReinforcements: reinforcements,
      coach: coach
        ? { name: coach.name, email: coach.email || "" }
        : null,
      coachingStats,
    };
  },
});
