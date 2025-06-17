import { query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const observerAnalytics = query({
  args: {
    observerId: v.id("users"),
  },
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

export const coachAnalytics = query({
  args: {
    clerkOrganizationId: v.string(),
  },
  returns: v.object({
    // Overview metrics
    totalTeachers: v.number(),
    activeTeachers: v.number(),
    totalWalkthroughs: v.number(),
    thisMonthWalkthroughs: v.number(),
    completedWalkthroughs: v.number(),
    draftWalkthroughs: v.number(),
    completionRate: v.number(),
    
    // Feedback metrics
    totalFeedbackInteractions: v.number(),
    avgFeedbackPerTeacherPerMonth: v.number(),
    reinforcementCount: v.number(),
    refinementCount: v.number(),
    
    // Indicator analysis
    topReinforcementIndicators: v.array(v.object({
      indicator: v.string(),
      count: v.number(),
    })),
    topRefinementIndicators: v.array(v.object({
      indicator: v.string(),
      count: v.number(),
    })),
    
    // Teacher progress data
    teacherProgress: v.array(v.object({
      teacherId: v.id("teachers"),
      teacherName: v.string(),
      totalWalkthroughs: v.number(),
      completedWalkthroughs: v.number(),
      draftWalkthroughs: v.number(),
      lastObservation: v.optional(v.number()),
      completionRate: v.number(),
      recentFeedbackCount: v.number(),
    })),
    
    // Monthly trends
    monthlyTrends: v.array(v.object({
      month: v.string(),
      completed: v.number(),
      draft: v.number(),
      total: v.number(),
    })),
    
    // Action items
    actionItems: v.array(v.object({
      type: v.string(),
      priority: v.string(),
      title: v.string(),
      description: v.string(),
      teacherId: v.optional(v.id("teachers")),
      teacherName: v.optional(v.string()),
    })),
  }),
  handler: async (ctx, args) => {
    // Filter users by organization
    const users = await ctx.db
      .query("users")
      .withIndex("by_organization", (q) => q.eq("clerkOrganizationId", args.clerkOrganizationId))
      .collect();
    const userIds = users.map((u) => u._id);
    // Filter teachers by org
    const teachers = await ctx.db
      .query("teachers")
      .filter((q) => q.or(...userIds.map((id) => q.eq(q.field("userId"), id))))
      .collect();
    const totalTeachers = teachers.length;
    const teacherIds = teachers.map(t => t._id);

    // Get all walkthroughs for these teachers
    const allWalkthroughs = await ctx.db
      .query("walkthroughs")
      .filter((q) => q.or(...teacherIds.map(id => q.eq(q.field("teacherId"), id))))
      .collect();

    // Basic metrics
    const totalWalkthroughs = allWalkthroughs.length;
    const completedWalkthroughs = allWalkthroughs.filter(w => w.status === "completed").length;
    const draftWalkthroughs = allWalkthroughs.filter(w => w.status === "draft").length;
    const completionRate = totalWalkthroughs > 0 ? Math.round((completedWalkthroughs / totalWalkthroughs) * 100) : 0;

    // This month walkthroughs
    const now = Date.now();
    const currentDate = new Date(now);
    const thisMonth = currentDate.getMonth();
    const thisYear = currentDate.getFullYear();
    const thisMonthWalkthroughs = allWalkthroughs.filter(w => {
      const d = new Date(w.walkthroughDate);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    // Get walkthrough entries for feedback analysis
    const allEntries: any[] = [];
    for (const walkthrough of allWalkthroughs) {
      const entries = await ctx.db
        .query("walkthroughEntries")
        .withIndex("by_walkthrough", (q) => q.eq("walkthroughId", walkthrough._id))
        .collect();
      allEntries.push(...entries);
    }

    const totalFeedbackInteractions = allEntries.length;
    const avgFeedbackPerTeacherPerMonth = totalTeachers > 0 ? Math.round(totalFeedbackInteractions / totalTeachers) : 0;

    // Indicator analysis
    const reinforcementIndicators: Record<string, number> = {};
    const refinementIndicators: Record<string, number> = {};
    let reinforcementCount = 0;
    let refinementCount = 0;

    allWalkthroughs.forEach(w => {
      if (w.reinforcementIndicator) {
        reinforcementIndicators[w.reinforcementIndicator] = (reinforcementIndicators[w.reinforcementIndicator] || 0) + 1;
        reinforcementCount++;
      }
      if (w.refinementIndicator) {
        refinementIndicators[w.refinementIndicator] = (refinementIndicators[w.refinementIndicator] || 0) + 1;
        refinementCount++;
      }
    });

    const topReinforcementIndicators = Object.entries(reinforcementIndicators)
      .sort(([, a]: [string, number], [, b]: [string, number]) => b - a)
      .slice(0, 5)
      .map(([indicator, count]) => ({ indicator, count: Number(count) }));

    const topRefinementIndicators = Object.entries(refinementIndicators)
      .sort(([, a]: [string, number], [, b]: [string, number]) => b - a)
      .slice(0, 5)
      .map(([indicator, count]) => ({ indicator, count: Number(count) }));

    // Teacher progress analysis
    const teacherProgress = await Promise.all(teachers.map(async (teacher) => {
      const teacherWalkthroughs = allWalkthroughs.filter(w => w.teacherId === teacher._id);
      const teacherCompleted = teacherWalkthroughs.filter(w => w.status === "completed").length;
      const teacherDrafts = teacherWalkthroughs.filter(w => w.status === "draft").length;
      const lastObservation = teacherWalkthroughs.length > 0 
        ? Math.max(...teacherWalkthroughs.map(w => w.walkthroughDate)) 
        : undefined;
      // Get recent feedback count (last 30 days)
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
      const recentEntries = allEntries.filter(entry => {
        const entryWalkthrough = allWalkthroughs.find(w => w._id === entry.walkthroughId);
        return entryWalkthrough?.teacherId === teacher._id && entry.createdAt >= thirtyDaysAgo;
      });
      return {
        teacherId: teacher._id,
        teacherName: teacher.name,
        totalWalkthroughs: teacherWalkthroughs.length,
        completedWalkthroughs: teacherCompleted,
        draftWalkthroughs: teacherDrafts,
        lastObservation,
        completionRate: teacherWalkthroughs.length > 0 ? Math.round((teacherCompleted / teacherWalkthroughs.length) * 100) : 0,
        recentFeedbackCount: recentEntries.length,
      };
    }));

    // Calculate active teachers (those with walkthroughs in last 60 days)
    const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);
    const activeTeachers = teacherProgress.filter(tp => 
      tp.lastObservation && tp.lastObservation >= sixtyDaysAgo
    ).length;

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(thisYear, thisMonth - i, 1);
      const monthWalkthroughs = allWalkthroughs.filter(w => {
        const d = new Date(w.walkthroughDate);
        return d.getMonth() === targetDate.getMonth() && d.getFullYear() === targetDate.getFullYear();
      });
      monthlyTrends.push({
        month: targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        completed: monthWalkthroughs.filter(w => w.status === "completed").length,
        draft: monthWalkthroughs.filter(w => w.status === "draft").length,
        total: monthWalkthroughs.length,
      });
    }

    // Generate action items
    const actionItems: {
      type: string;
      priority: string;
      title: string;
      description: string;
      teacherId?: Id<"teachers">;
      teacherName?: string;
    }[] = [];
    // Teachers with no recent observations
    const staleTeachers = teacherProgress.filter(tp => 
      !tp.lastObservation || tp.lastObservation < (now - (30 * 24 * 60 * 60 * 1000))
    );
    staleTeachers.forEach(teacher => {
      actionItems.push({
        type: "overdue_observation",
        priority: "high",
        title: "Schedule Observation",
        description: `${teacher.teacherName} hasn't been observed in over 30 days`,
        teacherId: teacher.teacherId as Id<"teachers">,
        teacherName: teacher.teacherName,
      });
    });
    // Teachers with pending drafts
    const teachersWithDrafts = teacherProgress.filter(tp => tp.draftWalkthroughs > 0);
    teachersWithDrafts.forEach(teacher => {
      actionItems.push({
        type: "pending_draft",
        priority: "medium",
        title: "Complete Draft Walkthroughs",
        description: `${teacher.teacherName} has ${teacher.draftWalkthroughs} draft walkthrough${teacher.draftWalkthroughs === 1 ? '' : 's'} pending`,
        teacherId: teacher.teacherId as Id<"teachers">,
        teacherName: teacher.teacherName,
      });
    });
    // Low feedback activity
    const lowFeedbackTeachers = teacherProgress.filter(tp => tp.recentFeedbackCount < 2);
    lowFeedbackTeachers.forEach(teacher => {
      actionItems.push({
        type: "low_feedback",
        priority: "low",
        title: "Increase Feedback Frequency",
        description: `${teacher.teacherName} has received minimal feedback this month`,
        teacherId: teacher.teacherId as Id<"teachers">,
        teacherName: teacher.teacherName,
      });
    });

    return {
      totalTeachers,
      activeTeachers,
      totalWalkthroughs,
      thisMonthWalkthroughs,
      completedWalkthroughs,
      draftWalkthroughs,
      completionRate,
      totalFeedbackInteractions,
      avgFeedbackPerTeacherPerMonth,
      reinforcementCount,
      refinementCount,
      topReinforcementIndicators,
      topRefinementIndicators,
      teacherProgress,
      monthlyTrends,
      actionItems,
    };
  },
}); 