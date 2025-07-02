import { query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getCurrentUserOrThrow, getCurrentUser } from "./auth";

// Helper function to get current user
async function getCurrentUserWithOrg(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
    .unique();
    
  if (!user) throw new Error("User not found");
  return user;
}

export const observerAnalytics = query({
  args: {
    observerId: v.id("users"),
  },
  returns: v.object({
    totalWalkthroughs: v.number(),
    totalWalkthroughsThisMonth: v.number(),
    indicatorCounts: v.record(v.string(), v.number()),
    reinforcementCount: v.number(),
    refinementCount: v.number(),
    uniqueTeachersObserved: v.number(),
  }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const date = new Date(now);
    const thisMonth = date.getMonth();
    const thisYear = date.getFullYear();

    // Fetch all walkthroughs for this observer
    const walkthroughs = await ctx.db
      .query("walkthroughs")
      .withIndex("by_observer", (q) => q.eq("observerId", args.observerId))
      .collect();

    // All-time total
    const totalWalkthroughs = walkthroughs.length;

    // This month total
    const walkthroughsThisMonth = walkthroughs.filter(w => {
      const d = new Date(w.walkthroughDate);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const totalWalkthroughsThisMonth = walkthroughsThisMonth.length;

    // Feedback by indicator (reinforcement + refinement)
    const indicatorCounts: Record<string, number> = {};
    let reinforcementCount = 0;
    let refinementCount = 0;
    const teacherSet = new Set();

    for (const w of walkthroughs) {
      if (w.reinforcementIndicator) {
        indicatorCounts[w.reinforcementIndicator] = (indicatorCounts[w.reinforcementIndicator] || 0) + 1;
        reinforcementCount++;
      }
      if (w.refinementIndicator) {
        indicatorCounts[w.refinementIndicator] = (indicatorCounts[w.refinementIndicator] || 0) + 1;
        refinementCount++;
      }
      if (w.teacherId) {
        teacherSet.add(w.teacherId);
      }
    }

    return {
      totalWalkthroughs,
      totalWalkthroughsThisMonth,
      indicatorCounts,
      reinforcementCount,
      refinementCount,
      uniqueTeachersObserved: teacherSet.size,
    };
  },
});

/**
 * Get aggregated analytics for the current coach.
 * NEW: Uses coach-based queries instead of organization-based queries.
 */
export const getCoachAnalytics = query({
  args: {},
  returns: v.object({
    totalTeachers: v.number(),
    activeTeachers: v.number(),
    totalWalkthroughs: v.number(),
    totalFeedbackGenerated: v.number(),
    recentWalkthroughs: v.array(v.object({
      _id: v.id("walkthroughs"),
      title: v.string(),
      createdAt: v.number(),
      teacherName: v.string(),
      hasAiFeedback: v.boolean(),
    })),
  }),
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    if (user.role !== "coach") {
      throw new Error("Only coaches can view analytics");
    }
    
    // NEW: Get teachers assigned to this specific coach
    const teachers = await ctx.db
      .query("teachers")
      .withIndex("by_coach", (q) => q.eq("coachId", user._id))
      .collect();
    
    const teacherIds = teachers.map(t => t._id);
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.status === "active").length;

    // Get all walkthroughs created by this coach's teachers
    let totalWalkthroughs = 0;
    let totalFeedbackGenerated = 0;
    const recentWalkthroughs = [];

    if (teacherIds.length > 0) {
    // Get all walkthroughs for these teachers
    const allWalkthroughs = await ctx.db
      .query("walkthroughs")
      .collect();

      // Filter walkthroughs for coach's teachers
      const coachWalkthroughs = allWalkthroughs.filter(w => 
        teacherIds.includes(w.teacherId)
      );
      
      totalWalkthroughs = coachWalkthroughs.length;

      // Get recent walkthroughs (last 10)
      const sortedWalkthroughs = coachWalkthroughs
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 10);
      
      for (const walkthrough of sortedWalkthroughs) {
        const teacher = teachers.find(t => t._id === walkthrough.teacherId);
        
        // Check if this walkthrough has AI feedback
        const aiFeedback = await ctx.db
          .query("aiFeedback")
        .withIndex("by_walkthrough", (q) => q.eq("walkthroughId", walkthrough._id))
          .first();
        
        if (aiFeedback) {
          totalFeedbackGenerated++;
        }
        
        recentWalkthroughs.push({
          _id: walkthrough._id,
          title: walkthrough.title,
          createdAt: walkthrough.createdAt,
          teacherName: teacher?.name || "Unknown Teacher",
          hasAiFeedback: !!aiFeedback,
        });
      }

      // Count total feedback for all coach's walkthroughs
      const allFeedback = await ctx.db
        .query("aiFeedback")
        .collect();
      
      totalFeedbackGenerated = allFeedback.filter(feedback => 
        coachWalkthroughs.some(w => w._id === feedback.walkthroughId)
      ).length;
    }

    return {
      totalTeachers,
      activeTeachers,
      totalWalkthroughs,
      totalFeedbackGenerated,
      recentWalkthroughs,
    };
  },
});

/**
 * Get detailed teacher analytics for a specific coach.
 * NEW: Uses coach-based relationships instead of organization queries.
 */
export const getTeacherAnalytics = query({
  args: {},
  returns: v.array(v.object({
    teacherId: v.id("teachers"),
    teacherName: v.string(),
    walkthroughCount: v.number(),
    feedbackCount: v.number(),
    lastActivity: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("pending"), v.literal("needs_details")),
  })),
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    
    if (user.role !== "coach") {
      throw new Error("Only coaches can view teacher analytics");
    }

    // NEW: Get teachers assigned to this specific coach
    const teachers = await ctx.db
      .query("teachers")
      .withIndex("by_coach", (q) => q.eq("coachId", user._id))
      .collect();

    const result = [];

    for (const teacher of teachers) {
      // Get walkthroughs for this teacher
      const walkthroughs = await ctx.db
        .query("walkthroughs")
        .withIndex("by_teacher", (q) => q.eq("teacherId", teacher._id))
        .collect();
      
      // Get feedback count for this teacher's walkthroughs
      let feedbackCount = 0;
      let lastActivity = undefined;
      
      if (walkthroughs.length > 0) {
        const walkthroughIds = walkthroughs.map(w => w._id);
        
        // Get all feedback for this teacher's walkthroughs
        const allFeedback = await ctx.db
          .query("aiFeedback")
          .collect();
        
        const teacherFeedback = allFeedback.filter(feedback => 
          walkthroughIds.includes(feedback.walkthroughId)
        );
        
        feedbackCount = teacherFeedback.length;
        
        // Find most recent activity (latest walkthrough)
        const latestWalkthrough = walkthroughs
          .sort((a, b) => b.createdAt - a.createdAt)[0];
        lastActivity = latestWalkthrough?.createdAt;
      }

      result.push({
        teacherId: teacher._id,
        teacherName: teacher.name,
        walkthroughCount: walkthroughs.length,
        feedbackCount,
        lastActivity,
        status: teacher.status,
      });
    }

    return result.sort((a, b) => b.walkthroughCount - a.walkthroughCount);
  },
});

/**
 * Get analytics specific to a teacher (for teacher dashboard).
 */
export const getMyTeacherAnalytics = query({
  args: {},
  returns: v.object({
    totalWalkthroughs: v.number(),
    totalFeedbackReceived: v.number(),
    recentWalkthroughs: v.array(v.object({
      _id: v.id("walkthroughs"),
      title: v.string(),
      createdAt: v.number(),
      hasAiFeedback: v.boolean(),
    })),
  }),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    
    if (!user || user.role !== "teacher") {
      return {
        totalWalkthroughs: 0,
        totalFeedbackReceived: 0,
        recentWalkthroughs: [],
      };
    }

    // Get teacher record for this user
    const teacher = await ctx.db
      .query("teachers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();
    
    if (!teacher) {
      return {
        totalWalkthroughs: 0,
        totalFeedbackReceived: 0,
        recentWalkthroughs: [],
      };
    }

    // Get walkthroughs for this teacher
    const walkthroughs = await ctx.db
      .query("walkthroughs")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacher._id))
      .collect();

    // Get feedback count
    let totalFeedbackReceived = 0;
    const recentWalkthroughs = [];
    
    const sortedWalkthroughs = walkthroughs
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);
    
    for (const walkthrough of sortedWalkthroughs) {
      // Check if this walkthrough has AI feedback
      const aiFeedback = await ctx.db
        .query("aiFeedback")
        .withIndex("by_walkthrough", (q) => q.eq("walkthroughId", walkthrough._id))
        .first();
      
      if (aiFeedback) {
        totalFeedbackReceived++;
      }
      
      recentWalkthroughs.push({
        _id: walkthrough._id,
        title: walkthrough.title,
        createdAt: walkthrough.createdAt,
        hasAiFeedback: !!aiFeedback,
      });
    }

    return {
      totalWalkthroughs: walkthroughs.length,
      totalFeedbackReceived,
      recentWalkthroughs,
    };
  },
});

// ===== LEGACY ORGANIZATION-BASED ANALYTICS (Deprecated) =====

/**
 * LEGACY: Get organization analytics.
 * DEPRECATED: Use getCoachAnalytics instead for NON_ORG_APPROACH.
 */
export const getOrganizationAnalytics = query({
  args: {},
  returns: v.object({
    totalTeachers: v.number(),
    activeTeachers: v.number(),
    totalWalkthroughs: v.number(),
    totalFeedbackGenerated: v.number(),
    recentWalkthroughs: v.array(v.object({
      _id: v.id("walkthroughs"),
      title: v.string(),
      createdAt: v.number(),
      teacherName: v.string(),
      hasAiFeedback: v.boolean(),
    })),
  }),
  handler: async (ctx) => {
    console.log("⚠️ getOrganizationAnalytics: DEPRECATED - Use getCoachAnalytics instead");
    
    // Return empty data for deprecated organization-based approach
    return {
      totalTeachers: 0,
      activeTeachers: 0,
      totalWalkthroughs: 0,
      totalFeedbackGenerated: 0,
      recentWalkthroughs: [],
    };
  },
}); 