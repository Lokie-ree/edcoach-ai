import { query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getCurrentUserOrThrow, getCurrentUser } from "./auth";


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
 * Coach-centric: All queries are based on direct coach-teacher relationships.
 */
export const getCoachAnalytics = query({
  args: {},
  returns: v.object({
    totalTeachers: v.number(),
    activeTeachers: v.number(),
    totalWalkthroughs: v.number(),
    totalFeedbackGenerated: v.number(),
    totalReflections: v.number(), // NEW
    recentWalkthroughs: v.array(v.object({
      _id: v.id("walkthroughs"),
      createdAt: v.number(),
      teacherName: v.string(),
      hasAiFeedback: v.boolean(),
      hasReflection: v.boolean(), // NEW
    })),
  }),
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    if (user.role !== "coach") {
      throw new Error("Only coaches can view analytics");
    }
    // Get teachers assigned to this specific coach
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
    let totalReflections = 0;
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
        // Check if this walkthrough has a reflection
        const reflection = await ctx.db
          .query("reflections")
          .withIndex("by_walkthrough", (q) => q.eq("walkthroughId", walkthrough._id))
          .first();
        recentWalkthroughs.push({
          _id: walkthrough._id,
          createdAt: walkthrough.createdAt,
          teacherName: teacher?.name || "Unknown Teacher",
          hasAiFeedback: !!aiFeedback,
          hasReflection: !!reflection,
        });
      }
      // Count total feedback for all coach's walkthroughs
      const allFeedback = await ctx.db
        .query("aiFeedback")
        .collect();
      totalFeedbackGenerated = allFeedback.filter(feedback => 
        coachWalkthroughs.some(w => w._id === feedback.walkthroughId)
      ).length;
      // Count total reflections for all coach's walkthroughs
      const allReflections = await ctx.db
        .query("reflections")
        .collect();
      totalReflections = allReflections.filter(reflection => 
        coachWalkthroughs.some(w => w._id === reflection.walkthroughId)
      ).length;
    }
    return {
      totalTeachers,
      activeTeachers,
      totalWalkthroughs,
      totalFeedbackGenerated,
      totalReflections,
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

/**
 * Get comprehensive analytics for the current coach.
 * Returns all data needed by the analytics dashboard frontend.
 */
export const getComprehensiveCoachAnalytics = query({
  args: {},
  returns: v.object({
    // Overview metrics
    totalTeachers: v.number(),
    activeTeachers: v.number(),
    totalWalkthroughs: v.number(),
    thisMonthWalkthroughs: v.number(),
    completedWalkthroughs: v.number(),
    draftWalkthroughs: v.number(),
    totalAiFeedbackGenerated: v.number(),
    totalReflections: v.number(), // NEW
    
    // Feedback metrics
    totalFeedbackInteractions: v.number(),
    teachersWithRecentActivity: v.number(),
    reinforcementCount: v.number(),
    refinementCount: v.number(),
    
    // Quick insights for basic plan
    topStrengths: v.array(v.object({
      indicator: v.string(),
      indicatorName: v.string(),
      count: v.number(),
    })),
    topGrowthAreas: v.array(v.object({
      indicator: v.string(),
      indicatorName: v.string(),
      count: v.number(),
    })),
    
    // Pro analytics features
    domainPerformance: v.array(v.object({
      domain: v.string(),
      reinforcementCount: v.number(),
      refinementCount: v.number(),
      totalCount: v.number(),
      strengthPercentage: v.number(),
    })),
    teacherProgressMatrix: v.array(v.object({
      teacherId: v.string(),
      teacherName: v.string(),
      domainScores: v.array(v.object({
        domain: v.string(),
        status: v.union(v.literal("strength"), v.literal("developing"), v.literal("needs_focus")),
        reinforcementCount: v.number(),
        refinementCount: v.number(),
      })),
      lastObservation: v.optional(v.number()),
    })),
    coachingInsights: v.array(v.object({
      type: v.string(),
      title: v.string(),
      description: v.string(),
      priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    })),
    
    // Teacher progress data
    teacherProgress: v.array(v.object({
      teacherId: v.string(),
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
    

  }),
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    if (user.role !== "coach") {
      throw new Error("Only coaches can view analytics");
    }

    // Get teachers assigned to this specific coach
    const teachers = await ctx.db
      .query("teachers")
      .withIndex("by_coach", (q) => q.eq("coachId", user._id))
      .collect();
    
    const teacherIds = teachers.map(t => t._id);
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter(t => t.status === "active").length;

    // Get all walkthroughs for coach's teachers
    const allWalkthroughs = await ctx.db
      .query("walkthroughs")
      .collect();
    
    const coachWalkthroughs = allWalkthroughs.filter(w => 
      teacherIds.includes(w.teacherId)
    );

    // Basic walkthrough metrics
    const totalWalkthroughs = coachWalkthroughs.length;
    const completedWalkthroughs = coachWalkthroughs.filter(w => w.status === "completed").length;
    const draftWalkthroughs = coachWalkthroughs.filter(w => w.status === "draft").length;

    // This month's walkthroughs
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const thisMonthWalkthroughs = coachWalkthroughs.filter(w => {
      const walkDate = new Date(w.walkthroughDate);
      return walkDate.getMonth() === thisMonth && walkDate.getFullYear() === thisYear;
    }).length;

    // Get all AI feedback for coach's walkthroughs
    const allAiFeedback = await ctx.db
      .query("aiFeedback")
      .collect();
    
    const coachFeedback = allAiFeedback.filter(feedback => 
      coachWalkthroughs.some(w => w._id === feedback.walkthroughId)
    );

    const totalFeedbackInteractions = coachFeedback.length;
    const totalAiFeedbackGenerated = totalFeedbackInteractions;
    
    // Count total reflections for all coach's walkthroughs
    const allReflections = await ctx.db
      .query("reflections")
      .collect();
    const totalReflections = allReflections.filter(reflection => 
      coachWalkthroughs.some(w => w._id === reflection.walkthroughId)
    ).length;

    // Calculate teachers with recent activity (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const teachersWithRecentActivity = teachers.filter(teacher => {
      const teacherWalkthroughs = coachWalkthroughs.filter(w => w.teacherId === teacher._id);
      return teacherWalkthroughs.some(w => w.createdAt > thirtyDaysAgo);
    }).length;

    // Get all indicators to map codes to names and domains
    const allIndicators = await ctx.db.query("rubricIndicators").collect();
    const indicatorMap = allIndicators.reduce((map, ind) => {
      map[ind.indicator_code] = {
        name: ind.indicator_name,
        domain: ind.domain
      };
      return map;
    }, {} as Record<string, { name: string; domain: string }>);

    // Indicator analysis
    const reinforcementCounts: Record<string, number> = {};
    const refinementCounts: Record<string, number> = {};
    let reinforcementCount = 0;
    let refinementCount = 0;

    coachWalkthroughs.forEach(w => {
      if (w.reinforcementIndicator) {
        reinforcementCounts[w.reinforcementIndicator] = (reinforcementCounts[w.reinforcementIndicator] || 0) + 1;
        reinforcementCount++;
      }
      if (w.refinementIndicator) {
        refinementCounts[w.refinementIndicator] = (refinementCounts[w.refinementIndicator] || 0) + 1;
        refinementCount++;
      }
    });

    // Quick insights for basic plan
    const topStrengths = Object.entries(reinforcementCounts)
      .map(([indicator, count]) => ({
        indicator,
        indicatorName: indicatorMap[indicator]?.name || indicator,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const topGrowthAreas = Object.entries(refinementCounts)
      .map(([indicator, count]) => ({
        indicator,
        indicatorName: indicatorMap[indicator]?.name || indicator,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    // Domain performance analysis
    const domainCounts: Record<string, { reinforcement: number; refinement: number }> = {};
    
    // Initialize domain counts (use ALL CAPS to match database values)
    const domains = ["INSTRUCTION", "PLANNING", "ENVIRONMENT", "PROFESSIONALISM"];
    domains.forEach(domain => {
      domainCounts[domain] = { reinforcement: 0, refinement: 0 };
    });

    // Count by domain
    coachWalkthroughs.forEach(w => {
      if (w.reinforcementIndicator && indicatorMap[w.reinforcementIndicator]) {
        const domain = indicatorMap[w.reinforcementIndicator].domain;
        domainCounts[domain].reinforcement++;
      }
      if (w.refinementIndicator && indicatorMap[w.refinementIndicator]) {
        const domain = indicatorMap[w.refinementIndicator].domain;
        domainCounts[domain].refinement++;
      }
    });

    const domainPerformance = domains.map(domain => {
      const reinforcementCount = domainCounts[domain].reinforcement;
      const refinementCount = domainCounts[domain].refinement;
      const totalCount = reinforcementCount + refinementCount;
      const strengthPercentage = totalCount > 0 ? Math.round((reinforcementCount / totalCount) * 100) : 0;
      
      return {
        domain,
        reinforcementCount,
        refinementCount,
        totalCount,
        strengthPercentage,
      };
    });

    // Teacher progress matrix for heatmap
    const teacherProgressMatrix = teachers.map(teacher => {
      const teacherWalkthroughs = coachWalkthroughs.filter(w => w.teacherId === teacher._id);
      const lastObservation = teacherWalkthroughs.length > 0 ? 
        Math.max(...teacherWalkthroughs.map(w => w.createdAt)) : undefined;

      // Calculate domain scores for this teacher
      const teacherDomainCounts: Record<string, { reinforcement: number; refinement: number }> = {};
      domains.forEach(domain => {
        teacherDomainCounts[domain] = { reinforcement: 0, refinement: 0 };
      });

      teacherWalkthroughs.forEach(w => {
        if (w.reinforcementIndicator && indicatorMap[w.reinforcementIndicator]) {
          const domain = indicatorMap[w.reinforcementIndicator].domain;
          teacherDomainCounts[domain].reinforcement++;
        }
        if (w.refinementIndicator && indicatorMap[w.refinementIndicator]) {
          const domain = indicatorMap[w.refinementIndicator].domain;
          teacherDomainCounts[domain].refinement++;
        }
      });

      const domainScores = domains.map(domain => {
        const reinforcementCount = teacherDomainCounts[domain].reinforcement;
        const refinementCount = teacherDomainCounts[domain].refinement;
        const total = reinforcementCount + refinementCount;
        
        let status: "strength" | "developing" | "needs_focus";
        if (total === 0) {
          status = "developing"; // No data yet
        } else if (reinforcementCount > refinementCount) {
          status = "strength";
        } else if (reinforcementCount === refinementCount) {
          status = "developing";
        } else {
          status = "needs_focus";
        }

        return {
          domain,
          status,
          reinforcementCount,
          refinementCount,
        };
      });

      return {
        teacherId: teacher._id,
        teacherName: teacher.name,
        domainScores,
        lastObservation,
      };
    });

    // Coaching insights
    const coachingInsights = [];
    
    // Identify team-wide domain weaknesses
    const weakDomains = domainPerformance
      .filter(dp => dp.totalCount > 0 && dp.strengthPercentage < 40)
      .sort((a, b) => a.strengthPercentage - b.strengthPercentage);

    if (weakDomains.length > 0) {
      coachingInsights.push({
        type: "team_weakness",
        title: `Team Focus Area: ${weakDomains[0].domain}`,
        description: `Only ${weakDomains[0].strengthPercentage}% of feedback in ${weakDomains[0].domain} shows strengths. Consider team PD.`,
        priority: "high" as const,
      });
    }

    // Identify teachers needing attention
    const inactiveTeachers = teacherProgressMatrix.filter(tp => 
      !tp.lastObservation || tp.lastObservation < (Date.now() - 21 * 24 * 60 * 60 * 1000)
    );

    if (inactiveTeachers.length > 0) {
      coachingInsights.push({
        type: "inactive_teachers",
        title: "Schedule Follow-up Observations",
        description: `${inactiveTeachers.length} teacher${inactiveTeachers.length > 1 ? 's have' : ' has'} not been observed recently.`,
        priority: "medium" as const,
      });
    }

    // Success pattern analysis
    const strongDomains = domainPerformance
      .filter(dp => dp.totalCount > 0 && dp.strengthPercentage > 70)
      .sort((a, b) => b.strengthPercentage - a.strengthPercentage);

    if (strongDomains.length > 0) {
      coachingInsights.push({
        type: "team_strength",
        title: `Team Strength: ${strongDomains[0].domain}`,
        description: `${strongDomains[0].strengthPercentage}% strength rate. Consider peer mentoring opportunities.`,
        priority: "low" as const,
      });
    }

    // Teacher progress data
    const teacherProgress = [];
    for (const teacher of teachers) {
      const teacherWalkthroughs = coachWalkthroughs.filter(w => w.teacherId === teacher._id);
      const teacherCompleted = teacherWalkthroughs.filter(w => w.status === "completed").length;
      const teacherDraft = teacherWalkthroughs.filter(w => w.status === "draft").length;
      const teacherCompletionRate = teacherWalkthroughs.length > 0 ? 
        Math.round((teacherCompleted / teacherWalkthroughs.length) * 100) : 0;
      
      const lastObservation = teacherWalkthroughs.length > 0 ? 
        Math.max(...teacherWalkthroughs.map(w => w.createdAt)) : undefined;
      
      const teacherFeedbackCount = coachFeedback.filter(feedback => 
        teacherWalkthroughs.some(w => w._id === feedback.walkthroughId)
      ).length;

      teacherProgress.push({
        teacherId: teacher._id,
        teacherName: teacher.name,
        totalWalkthroughs: teacherWalkthroughs.length,
        completedWalkthroughs: teacherCompleted,
        draftWalkthroughs: teacherDraft,
        lastObservation,
        completionRate: teacherCompletionRate,
        recentFeedbackCount: teacherFeedbackCount,
      });
    }

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const monthNumber = date.getMonth();
      const year = date.getFullYear();
      
      const monthWalkthroughs = coachWalkthroughs.filter(w => {
        const walkDate = new Date(w.walkthroughDate);
        return walkDate.getMonth() === monthNumber && walkDate.getFullYear() === year;
      });
      
      const completed = monthWalkthroughs.filter(w => w.status === "completed").length;
      const draft = monthWalkthroughs.filter(w => w.status === "draft").length;
      
      monthlyTrends.push({
        month,
        completed,
        draft,
        total: completed + draft,
      });
    }



          return {
        // Overview metrics
        totalTeachers,
        activeTeachers,
        totalWalkthroughs,
        thisMonthWalkthroughs,
        completedWalkthroughs,
        draftWalkthroughs,
        totalAiFeedbackGenerated,
        totalReflections, // NEW
        
        // Feedback metrics
        totalFeedbackInteractions,
        teachersWithRecentActivity,
        reinforcementCount,
        refinementCount,
        
        // Quick insights for basic plan
        topStrengths,
        topGrowthAreas,
        
        // Pro analytics features
        domainPerformance,
        teacherProgressMatrix,
        coachingInsights,
        
        // Teacher progress data
        teacherProgress,
        
        // Monthly trends
        monthlyTrends,
      };
  },
});