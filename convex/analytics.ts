import { query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUserOrThrow, getCurrentUser } from "./auth";

export const observerAnalytics = query({
  args: {
    observerId: v.id("users"),
  },
  returns: v.object({
    totalWalkthroughs: v.number(),
    totalWalkthroughsThisMonth: v.number(),
    indicatorCounts: v.record(v.string(), v.number()),
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
    const walkthroughsThisMonth = walkthroughs.filter((w) => {
      const d = new Date(w.walkthroughDate);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const totalWalkthroughsThisMonth = walkthroughsThisMonth.length;

    // Feedback by indicator (reinforcement + refinement)
    const indicatorCounts: Record<string, number> = {};
    const teacherSet = new Set();

    for (const w of walkthroughs) {
      if (w.reinforcementIndicator) {
        indicatorCounts[w.reinforcementIndicator] =
          (indicatorCounts[w.reinforcementIndicator] || 0) + 1;
      }
      if (w.refinementIndicator) {
        indicatorCounts[w.refinementIndicator] =
          (indicatorCounts[w.refinementIndicator] || 0) + 1;
      }
      if (w.teacherId) {
        teacherSet.add(w.teacherId);
      }
    }

    return {
      totalWalkthroughs,
      totalWalkthroughsThisMonth,
      indicatorCounts,
      uniqueTeachersObserved: teacherSet.size,
    };
  },
});

export const getCoachAnalytics = query({
  args: {},
  returns: v.object({
    totalTeachers: v.number(),
    activeTeachers: v.number(),
    totalWalkthroughs: v.number(),
    totalFeedbackGenerated: v.number(),
    feedbackTrend: v.object({
      thisMonth: v.number(),
      lastMonth: v.number(),
      percentageChange: v.number(),
    }),
    priorities: v.object({
      walkthroughsDue: v.number(),
      reflectionsToReview: v.number(),
      teachersNeedingSupport: v.number(),
    }),
    recentActivity: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        teacherName: v.string(),
        timestamp: v.number(),
        status: v.string(),
        title: v.string(),
        href: v.string(),
      }),
    ),
    topStrengths: v.array(
      v.object({
        indicator: v.string(),
        indicatorName: v.string(),
        count: v.number(),
      })
    ),
    topGrowthAreas: v.array(
      v.object({
        indicator: v.string(),
        indicatorName: v.string(),
        count: v.number(),
      })
    ),
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

    const teacherIds = teachers.map((t) => t._id);
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter((t) => t.status === "active").length;

    // Get all walkthroughs for coach's teachers
    const coachWalkthroughs = teacherIds.length > 0 
      ? await ctx.db
          .query("walkthroughs")
          .filter((q) =>
            q.or(...teacherIds.map((id) => q.eq(q.field("teacherId"), id))),
          )
          .collect()
      : [];

    const totalWalkthroughs = coachWalkthroughs.length;
    const totalFeedbackGenerated = coachWalkthroughs.length; // Each walkthrough is completed feedback

    // Calculate feedback trend (this month vs last month)
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const thisMonthFeedback = coachWalkthroughs.filter((walkthrough) => {
      const walkDate = new Date(walkthrough.walkthroughDate);
      return (
        walkDate.getMonth() === thisMonth && walkDate.getFullYear() === thisYear
      );
    }).length;

    const lastMonthFeedback = coachWalkthroughs.filter((walkthrough) => {
      const walkDate = new Date(walkthrough.walkthroughDate);
      return (
        walkDate.getMonth() === lastMonth && walkDate.getFullYear() === lastMonthYear
      );
    }).length;

    const percentageChange = lastMonthFeedback === 0 
      ? (thisMonthFeedback > 0 ? 100 : 0)
      : ((thisMonthFeedback - lastMonthFeedback) / lastMonthFeedback) * 100;

    // Get recent activity (last 10 walkthroughs)
    const recentWalkthroughs = coachWalkthroughs
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 10);

    const recentActivity = [];
    
    for (const walkthrough of recentWalkthroughs) {
      const teacher = teachers.find(t => t._id === walkthrough.teacherId);
      recentActivity.push({
        id: walkthrough._id,
        type: "walkthrough",
        teacherName: teacher?.name || "Unknown Teacher",
        timestamp: walkthrough._creationTime,
        status: "completed",
        title: `Walkthrough observation completed`,
        href: `/walkthrough/${walkthrough._id}/view`,
      });
    }

    // Calculate priorities
    // For now, using placeholder logic - these can be refined based on business rules
    const walkthroughsDue = teachers.filter(t => t.status === "active").length; // Assume each active teacher needs a walkthrough
    
    // Count reflections that need review (recently created reflections)
    const recentReflections = teacherIds.length > 0 
      ? await ctx.db
          .query("reflections")
          .filter((q) => 
            q.and(
              q.gte(q.field("createdAt"), Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
              q.or(...teacherIds.map((id) => q.eq(q.field("teacherId"), id)))
            )
          )
          .collect()
      : [];
    const reflectionsToReview = recentReflections.length;
    
    // Teachers needing support (those with status "needs_details" or no recent activity)
    const teachersNeedingSupport = teachers.filter(t => 
      t.status === "needs_details" || t.status === "pending"
    ).length;

    // Get all indicators for name lookup
    const allIndicators = await ctx.db.query("rubricIndicators").collect();
    const indicatorMap = new Map(
      allIndicators.map(ind => [ind.indicator_code, ind.indicator_name])
    );

    // Count reinforcement and refinement indicators
    const reinforcementCounts: Record<string, number> = {};
    const refinementCounts: Record<string, number> = {};

    for (const walkthrough of coachWalkthroughs) {
      if (walkthrough.reinforcementIndicator) {
        reinforcementCounts[walkthrough.reinforcementIndicator] = 
          (reinforcementCounts[walkthrough.reinforcementIndicator] || 0) + 1;
      }
      if (walkthrough.refinementIndicator) {
        refinementCounts[walkthrough.refinementIndicator] = 
          (refinementCounts[walkthrough.refinementIndicator] || 0) + 1;
      }
    }

    // Get top strengths (reinforcement indicators)
    const topStrengths = Object.entries(reinforcementCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([indicator, count]) => ({
        indicator,
        indicatorName: indicatorMap.get(indicator) || indicator,
        count,
      }));

    // Get top growth areas (refinement indicators)
    const topGrowthAreas = Object.entries(refinementCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([indicator, count]) => ({
        indicator,
        indicatorName: indicatorMap.get(indicator) || indicator,
        count,
      }));

    return {
      totalTeachers,
      activeTeachers,
      totalWalkthroughs,
      totalFeedbackGenerated,
      feedbackTrend: {
        thisMonth: thisMonthFeedback,
        lastMonth: lastMonthFeedback,
        percentageChange: Math.round(percentageChange),
      },
      priorities: {
        walkthroughsDue,
        reflectionsToReview,
        teachersNeedingSupport,
      },
      recentActivity,
      topStrengths,
      topGrowthAreas,
    };
  },
});

export const getTeacherAnalytics = query({
  args: {},
  returns: v.array(
    v.object({
      teacherId: v.id("teachers"),
      teacherName: v.string(),
              status: v.union(v.literal("active"), v.literal("pending"), v.literal("needs_details")),
      walkthroughCount: v.number(),
      feedbackCount: v.number(),
      lastActivity: v.optional(v.number()),
        trend: v.union(
          v.literal("Needs Support"),
          v.literal("Engaged"),
          v.literal("Stable"),
        ),
    }),
  ),
  handler: async (ctx) => {
    const user = await getCurrentUserOrThrow(ctx);
    if (user.role !== "coach") {
      throw new Error("Only coaches can view teacher analytics");
    }

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

      const walkthroughCount = walkthroughs.length;
      const feedbackCount = walkthroughs.length; // Each walkthrough includes feedback

        // Find most recent activity (latest walkthrough)
      const lastActivity = walkthroughs.length > 0
        ? walkthroughs.sort((a, b) => b._creationTime - a._creationTime)[0]._creationTime
        : undefined;

      // PGP Progress Trend Calculation
      const recentWalkthroughs = walkthroughs
        .sort((a, b) => b.walkthroughDate - a.walkthroughDate)
        .slice(0, 5);

      let trend: "Needs Support" | "Engaged" | "Stable" = "Stable";
      if (recentWalkthroughs.length >= 3) {
        const refinementIndicators = recentWalkthroughs.map(w => w.refinementIndicator);
        const repeatedIndicator = refinementIndicators.find((indicator, index) =>
          refinementIndicators.indexOf(indicator) !== index
        );
        
        if (repeatedIndicator) {
          trend = "Needs Support";
        } else {
          trend = "Engaged";
        }
      }

      result.push({
        teacherId: teacher._id,
        teacherName: teacher.name,
        status: teacher.status,
        walkthroughCount,
        feedbackCount,
        lastActivity,
        trend,
      });
    }

    return result;
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
    recentWalkthroughs: v.array(
      v.object({
        _id: v.id("walkthroughs"),
        createdAt: v.number(),
        hasAiFeedback: v.boolean(),
      }),
    ),
  }),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    if (user.role !== "teacher") {
      throw new Error("Only teachers can view their analytics");
    }

    // Get teacher record
    const teacher = await ctx.db
      .query("teachers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // Get all walkthroughs for this teacher
    const walkthroughs = await ctx.db
      .query("walkthroughs")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacher._id))
      .collect();

    const totalWalkthroughs = walkthroughs.length;
    const totalFeedbackReceived = walkthroughs.length; // Each walkthrough includes feedback

    // Get recent walkthroughs (last 10)
    const recentWalkthroughs = walkthroughs
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 10)
      .map(walkthrough => ({
        _id: walkthrough._id,
        createdAt: walkthrough._creationTime,
        hasAiFeedback: true, // All walkthroughs now include feedback
      }));

    return {
      totalWalkthroughs,
      totalFeedbackReceived,
      recentWalkthroughs,
    };
  },
});

/**
 * Get comprehensive analytics for the current coach.
 */
export const getComprehensiveCoachAnalytics = query({
  args: {},
  returns: v.object({
    totalTeachers: v.number(),
    activeTeachers: v.number(),
    totalWalkthroughs: v.number(),
    completedWalkthroughs: v.number(),
    thisMonthWalkthroughs: v.number(),
    totalFeedbackInteractions: v.number(),
    totalReflections: v.number(),
    averageReflectionsPerWalkthrough: v.number(),
    totalAiFeedbackGenerated: v.number(),
    teachersWithRecentActivity: v.number(),
    reinforcementCount: v.number(),
    refinementCount: v.number(),
    topStrengths: v.array(
      v.object({
        indicator: v.string(),
        indicatorName: v.string(),
        count: v.number(),
      })
    ),
    topGrowthAreas: v.array(
      v.object({
        indicator: v.string(),
        indicatorName: v.string(),
        count: v.number(),
      })
    ),
    domainPerformance: v.array(
      v.object({
        domain: v.string(),
        reinforcementCount: v.number(),
        refinementCount: v.number(),
        totalCount: v.number(),
        strengthPercentage: v.number(),
      })
    ),
    teacherProgressMatrix: v.array(
      v.object({
        teacherId: v.string(),
        teacherName: v.string(),
        domainScores: v.array(
          v.object({
            domain: v.string(),
            status: v.union(
              v.literal("strength"),
              v.literal("developing"),
              v.literal("needs_focus")
            ),
            reinforcementCount: v.number(),
            refinementCount: v.number(),
          })
        ),
        lastObservation: v.optional(v.number()),
      })
    ),
    coachingInsights: v.array(
      v.object({
        type: v.string(),
        title: v.string(),
        description: v.string(),
        priority: v.union(
          v.literal("high"),
          v.literal("medium"),
          v.literal("low")
        ),
      })
    ),
    teacherProgress: v.array(
      v.object({
        teacherId: v.string(),
        teacherName: v.string(),
        totalWalkthroughs: v.number(),
        completedWalkthroughs: v.number(),
        lastObservation: v.optional(v.number()),
        completionRate: v.number(),
        recentFeedbackCount: v.number(),
      })
    ),
    monthlyTrends: v.array(
      v.object({
        month: v.string(),
        completed: v.number(),
  
        total: v.number(),
      }),
    ),
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

    const teacherIds = teachers.map((t) => t._id);
    const totalTeachers = teachers.length;
    const activeTeachers = teachers.filter((t) => t.status === "active").length;

    // Get all walkthroughs for coach's teachers
    const coachWalkthroughs = teacherIds.length > 0 
      ? await ctx.db
          .query("walkthroughs")
          .filter((q) =>
            q.or(...teacherIds.map((id) => q.eq(q.field("teacherId"), id))),
          )
          .collect()
      : [];

    const totalWalkthroughs = coachWalkthroughs.length;
    const completedWalkthroughs = coachWalkthroughs.length; // All are completed now

    // This month's walkthroughs
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const thisMonthWalkthroughs = coachWalkthroughs.filter((w) => {
      const walkDate = new Date(w.walkthroughDate);
      return (
        walkDate.getMonth() === thisMonth && walkDate.getFullYear() === thisYear
      );
    }).length;

    const totalFeedbackInteractions = coachWalkthroughs.length; // Each walkthrough includes feedback
    const totalAiFeedbackGenerated = coachWalkthroughs.length; // Each walkthrough includes AI feedback

    // Count reflections
    const allReflections = await ctx.db.query("reflections").collect();
    const coachReflections = allReflections.filter((reflection) =>
      coachWalkthroughs.some((w) => w._id === reflection.walkthroughId)
    );
    const totalReflections = coachReflections.length;
    const averageReflectionsPerWalkthrough = totalWalkthroughs > 0 
      ? totalReflections / totalWalkthroughs 
      : 0;

    // Teachers with recent activity (last 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const teachersWithRecentActivity = teachers.filter((teacher) => {
      const teacherWalkthroughs = coachWalkthroughs.filter(w => w.teacherId === teacher._id);
      return teacherWalkthroughs.some(w => w.walkthroughDate >= thirtyDaysAgo);
    }).length;

    // Get all indicators for name lookup
    const allIndicators = await ctx.db.query("rubricIndicators").collect();
    const indicatorMap = new Map(
      allIndicators.map(ind => [ind.indicator_code, ind.indicator_name])
    );

    // Count reinforcement and refinement indicators
    const reinforcementCounts: Record<string, number> = {};
    const refinementCounts: Record<string, number> = {};
    let totalReinforcementCount = 0;
    let totalRefinementCount = 0;

    for (const walkthrough of coachWalkthroughs) {
      if (walkthrough.reinforcementIndicator) {
        reinforcementCounts[walkthrough.reinforcementIndicator] = 
          (reinforcementCounts[walkthrough.reinforcementIndicator] || 0) + 1;
        totalReinforcementCount++;
      }
      if (walkthrough.refinementIndicator) {
        refinementCounts[walkthrough.refinementIndicator] = 
          (refinementCounts[walkthrough.refinementIndicator] || 0) + 1;
        totalRefinementCount++;
      }
    }

    // Get top strengths (reinforcement indicators)
    const topStrengths = Object.entries(reinforcementCounts)
      .map(([indicator, count]) => ({
        indicator,
        indicatorName: indicatorMap.get(indicator) || indicator,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get top growth areas (refinement indicators)
    const topGrowthAreas = Object.entries(refinementCounts)
      .map(([indicator, count]) => ({
        indicator,
        indicatorName: indicatorMap.get(indicator) || indicator,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Domain performance analysis
    const domainCounts: Record<string, { reinforcement: number; refinement: number }> = {};
    
    for (const indicator of allIndicators) {
      if (!domainCounts[indicator.domain]) {
        domainCounts[indicator.domain] = { reinforcement: 0, refinement: 0 };
      }
      
      const reinforcementCount = reinforcementCounts[indicator.indicator_code] || 0;
      const refinementCount = refinementCounts[indicator.indicator_code] || 0;
      
      domainCounts[indicator.domain].reinforcement += reinforcementCount;
      domainCounts[indicator.domain].refinement += refinementCount;
    }

    const domainPerformance = Object.entries(domainCounts).map(([domain, counts]) => {
      const totalCount = counts.reinforcement + counts.refinement;
      const strengthPercentage = totalCount > 0 ? (counts.reinforcement / totalCount) * 100 : 0;
      
      return {
        domain,
        reinforcementCount: counts.reinforcement,
        refinementCount: counts.refinement,
        totalCount,
        strengthPercentage: Math.round(strengthPercentage),
      };
    });

    // Teacher progress matrix
    const teacherProgressMatrix = teachers.map((teacher) => {
      const teacherWalkthroughs = coachWalkthroughs.filter(w => w.teacherId === teacher._id);
      const lastWalkthrough = teacherWalkthroughs.sort((a, b) => b.walkthroughDate - a.walkthroughDate)[0];
      
      // Get teacher's indicator counts by domain
      const teacherDomainCounts: Record<string, { reinforcement: number; refinement: number }> = {};
      
      for (const walkthrough of teacherWalkthroughs) {
        const reinforcementIndicator = allIndicators.find(ind => ind.indicator_code === walkthrough.reinforcementIndicator);
        const refinementIndicator = allIndicators.find(ind => ind.indicator_code === walkthrough.refinementIndicator);
        
        if (reinforcementIndicator) {
          if (!teacherDomainCounts[reinforcementIndicator.domain]) {
            teacherDomainCounts[reinforcementIndicator.domain] = { reinforcement: 0, refinement: 0 };
          }
          teacherDomainCounts[reinforcementIndicator.domain].reinforcement++;
        }
        
        if (refinementIndicator) {
          if (!teacherDomainCounts[refinementIndicator.domain]) {
            teacherDomainCounts[refinementIndicator.domain] = { reinforcement: 0, refinement: 0 };
          }
          teacherDomainCounts[refinementIndicator.domain].refinement++;
        }
      }
      
      const domainScores = Object.entries(teacherDomainCounts).map(([domain, counts]) => {
        const total = counts.reinforcement + counts.refinement;
        const reinforcementRatio = total > 0 ? counts.reinforcement / total : 0;
        
        let status: "strength" | "developing" | "needs_focus";
        if (reinforcementRatio >= 0.7) {
          status = "strength";
        } else if (reinforcementRatio >= 0.4) {
          status = "developing";
        } else {
          status = "needs_focus";
        }
        
        return {
          domain,
          status,
          reinforcementCount: counts.reinforcement,
          refinementCount: counts.refinement,
        };
      });
      
      return {
        teacherId: teacher._id,
        teacherName: teacher.name,
        domainScores,
        lastObservation: lastWalkthrough?.walkthroughDate,
      };
    });

    // Generate coaching insights
    const coachingInsights = [];
    
    // High-priority insight: Teachers needing support
    const teachersNeedingSupport = teachers.filter(t => t.status === "needs_details" || t.status === "pending").length;
    if (teachersNeedingSupport > 0) {
      coachingInsights.push({
        type: "teacher_support",
        title: "Teachers Need Onboarding Support",
        description: `${teachersNeedingSupport} teacher${teachersNeedingSupport > 1 ? 's' : ''} need${teachersNeedingSupport === 1 ? 's' : ''} help completing their profile setup.`,
        priority: "high" as const,
      });
    }
    
    // Medium-priority insight: Most common growth area
    if (topGrowthAreas.length > 0) {
      const topGrowthArea = topGrowthAreas[0];
      coachingInsights.push({
        type: "growth_focus",
        title: "Common Growth Area Identified",
        description: `${topGrowthArea.indicatorName} appears in ${topGrowthArea.count} walkthrough${topGrowthArea.count > 1 ? 's' : ''} as a refinement focus.`,
        priority: "medium" as const,
      });
    }
    
    // Low-priority insight: Team strength
    if (topStrengths.length > 0) {
      const topStrength = topStrengths[0];
      coachingInsights.push({
        type: "team_strength",
        title: "Team Strength Highlighted",
        description: `Your team shows consistent strength in ${topStrength.indicatorName}, reinforced ${topStrength.count} time${topStrength.count > 1 ? 's' : ''}.`,
        priority: "low" as const,
      });
    }

    // Teacher progress data
    const teacherProgress = teachers.map((teacher) => {
      const teacherWalkthroughs = coachWalkthroughs.filter(w => w.teacherId === teacher._id);
      const lastWalkthrough = teacherWalkthroughs.sort((a, b) => b.walkthroughDate - a.walkthroughDate)[0];
      
      // Recent feedback count (last 30 days)
      const recentFeedback = teacherWalkthroughs.filter(w => w.walkthroughDate >= thirtyDaysAgo);
      
      return {
        teacherId: teacher._id,
        teacherName: teacher.name,
        totalWalkthroughs: teacherWalkthroughs.length,
        completedWalkthroughs: teacherWalkthroughs.length,

        lastObservation: lastWalkthrough?.walkthroughDate,
        completionRate: 100, // All walkthroughs are completed
        recentFeedbackCount: recentFeedback.length,
      };
    });

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - i);
      const month = targetDate.getMonth();
      const year = targetDate.getFullYear();

      const monthWalkthroughs = coachWalkthroughs.filter((w) => {
        const walkDate = new Date(w.walkthroughDate);
        return walkDate.getMonth() === month && walkDate.getFullYear() === year;
      });

      monthlyTrends.push({
        month: targetDate.toLocaleDateString("en-US", { month: "short" }),
        completed: monthWalkthroughs.length,

        total: monthWalkthroughs.length,
      });
    }

    return {
      totalTeachers,
      activeTeachers,
      totalWalkthroughs,
      completedWalkthroughs,
      thisMonthWalkthroughs,
      totalFeedbackInteractions,
      totalReflections,
      averageReflectionsPerWalkthrough: Math.round(averageReflectionsPerWalkthrough * 100) / 100,
      totalAiFeedbackGenerated,
      teachersWithRecentActivity,
      reinforcementCount: totalReinforcementCount,
      refinementCount: totalRefinementCount,
      topStrengths,
      topGrowthAreas,
      domainPerformance,
      teacherProgressMatrix,
      coachingInsights,
      teacherProgress,
      monthlyTrends,
    };
  },
});

/**
 * Get PGP data for the current teacher's growth journal
 */
/**
 * Get PGP data for a specific teacher (for coaches to view)
 */
export const getTeacherPgpData = query({
  args: {
    teacherId: v.id("teachers"),
  },
  returns: v.object({
    pgpGoal: v.object({
      title: v.string(),
      description: v.string(),
      progress: v.number(),
      trend: v.union(
        v.literal("Engaged"),
        v.literal("Needs Support"),
        v.literal("Stable"),
      ),
      targetDate: v.optional(v.number()),
    }),
    refinementFocus: v.object({
      currentIndicator: v.string(),
      description: v.string(),
      progress: v.object({
        current: v.number(),
        target: v.number(),
        trend: v.string(),
      }),
      nextSteps: v.array(v.string()),
    }),
    reflectionPrompt: v.object({
      question: v.string(),
      lastAnswered: v.optional(v.number()),
      isOverdue: v.boolean(),
    }),
    recentWalkthroughs: v.array(
      v.object({
        id: v.string(),
        date: v.number(),
        indicators: v.array(v.string()),
        hasReflection: v.boolean(),
        title: v.string(),
        status: v.string(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    if (user.role !== "coach") {
      throw new Error("Only coaches can view teacher PGP data");
    }

    // Get teacher record
    const teacher = await ctx.db.get(args.teacherId);
    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // Get teacher's PGP goal (stored on teacher record)
    const pgpGoal = teacher.pgpGoal;

    // Get walkthroughs for this teacher
    const walkthroughs = await ctx.db
      .query("walkthroughs")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacher._id))
      .order("desc")
      .collect();

    // Get reflections
    const allReflections = await ctx.db.query("reflections").collect();
    const teacherReflections = allReflections.filter(r => 
      walkthroughs.some(w => w._id === r.walkthroughId)
    );

    // Calculate trend
    const recentWalkthroughs = walkthroughs.slice(0, 5);
    let trend: "Engaged" | "Needs Support" | "Stable" = "Stable";
    if (recentWalkthroughs.length >= 3) {
      const refinementIndicators = recentWalkthroughs.map(w => w.refinementIndicator);
      const repeatedIndicator = refinementIndicators.find((indicator, index) =>
        refinementIndicators.indexOf(indicator) !== index
      );
      
      if (repeatedIndicator) {
        trend = "Needs Support";
      } else {
        trend = "Engaged";
      }
    }

    // Get most recent refinement indicator for focus
    const mostRecentRefinement = recentWalkthroughs[0]?.refinementIndicator || "";

    // Map walkthroughs for timeline
    const timelineWalkthroughs = walkthroughs.slice(0, 10).map(walkthrough => ({
        id: walkthrough._id,
      date: walkthrough.walkthroughDate,
      indicators: [walkthrough.reinforcementIndicator, walkthrough.refinementIndicator],
      hasReflection: teacherReflections.some(r => r.walkthroughId === walkthrough._id),
      title: `Walkthrough ${new Date(walkthrough.walkthroughDate).toLocaleDateString()}`,
        status: walkthrough.status,
    }));

    return {
      pgpGoal: {
        title: pgpGoal?.text || "No PGP Goal Set",
        description: pgpGoal?.contextNotes || "Work with your coach to set a professional growth goal.",
        progress: pgpGoal?.progress || Math.min(100, (walkthroughs.length / 10) * 100), // Use stored progress or calculate
        trend,
        targetDate: pgpGoal?.targetDate || (pgpGoal ? Date.now() + (90 * 24 * 60 * 60 * 1000) : undefined),
      },
      refinementFocus: {
        currentIndicator: mostRecentRefinement || "No recent walkthroughs",
        description: mostRecentRefinement ? 
          `Focus area from most recent walkthrough feedback.` : 
          "Complete a walkthrough to see focus area.",
        progress: {
          current: Math.min(100, (walkthroughs.length / 5) * 100),
          target: 100,
          trend: trend === "Engaged" ? "improving" : trend === "Needs Support" ? "needs attention" : "stable",
        },
        nextSteps: [
          "Review feedback from latest walkthrough",
          "Practice implementing suggested strategies",
          "Discuss progress during next coaching session",
        ],
      },
      reflectionPrompt: {
        question: walkthroughs.length > 0 ? 
          "What strategies from recent feedback has this teacher tried implementing?" :
          "What professional growth goals should this teacher focus on?",
        lastAnswered: teacherReflections.length > 0 ? 
          teacherReflections.sort((a, b) => b.createdAt - a.createdAt)[0].createdAt : 
          undefined,
        isOverdue: teacherReflections.length === 0 || 
          (Date.now() - (teacherReflections[0]?.createdAt || 0)) > (7 * 24 * 60 * 60 * 1000), // 7 days
      },
      recentWalkthroughs: timelineWalkthroughs,
    };
  },
});

/**
 * Get PGP data for the current authenticated teacher
 */
export const getMyPgpData = query({
  args: {},
  returns: v.object({
    pgpGoal: v.object({
      title: v.string(),
      description: v.string(),
      progress: v.number(),
      trend: v.union(
        v.literal("Engaged"),
        v.literal("Needs Support"),
        v.literal("Stable"),
      ),
      targetDate: v.optional(v.number()),
    }),
    refinementFocus: v.object({
      currentIndicator: v.string(),
      description: v.string(),
      progress: v.object({
        current: v.number(),
        target: v.number(),
        trend: v.string(),
      }),
      nextSteps: v.array(v.string()),
    }),
    reflectionPrompt: v.object({
      question: v.string(),
      lastAnswered: v.optional(v.number()),
      isOverdue: v.boolean(),
    }),
    recentWalkthroughs: v.array(
      v.object({
        id: v.string(),
        date: v.number(),
        indicators: v.array(v.string()),
        hasReflection: v.boolean(),
        title: v.string(),
        status: v.string(),
      }),
    ),
  }),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }
    if (user.role !== "teacher") {
      throw new Error("Only teachers can view their PGP data");
    }

    // Get teacher record
    const teacher = await ctx.db
      .query("teachers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!teacher) {
      throw new Error("Teacher not found");
    }

    // Get teacher's PGP goal (stored on teacher record)
    const pgpGoal = teacher.pgpGoal;

    // Get walkthroughs for this teacher
    const walkthroughs = await ctx.db
      .query("walkthroughs")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacher._id))
      .order("desc")
      .collect();

    // Get reflections
    const allReflections = await ctx.db.query("reflections").collect();
    const teacherReflections = allReflections.filter(r => 
      walkthroughs.some(w => w._id === r.walkthroughId)
    );

    // Calculate trend
    const recentWalkthroughs = walkthroughs.slice(0, 5);
    let trend: "Engaged" | "Needs Support" | "Stable" = "Stable";
    if (recentWalkthroughs.length >= 3) {
      const refinementIndicators = recentWalkthroughs.map(w => w.refinementIndicator);
      const repeatedIndicator = refinementIndicators.find((indicator, index) =>
        refinementIndicators.indexOf(indicator) !== index
      );
      
      if (repeatedIndicator) {
        trend = "Needs Support";
      } else {
        trend = "Engaged";
      }
    }

    // Get most recent refinement indicator for focus
    const mostRecentRefinement = recentWalkthroughs[0]?.refinementIndicator || "";

    // Map walkthroughs for timeline
    const timelineWalkthroughs = walkthroughs.slice(0, 10).map(walkthrough => ({
        id: walkthrough._id,
      date: walkthrough.walkthroughDate,
      indicators: [walkthrough.reinforcementIndicator, walkthrough.refinementIndicator],
      hasReflection: teacherReflections.some(r => r.walkthroughId === walkthrough._id),
      title: `Walkthrough ${new Date(walkthrough.walkthroughDate).toLocaleDateString()}`,
        status: walkthrough.status,
    }));

    return {
      pgpGoal: {
        title: pgpGoal?.text || "No PGP Goal Set",
        description: pgpGoal?.contextNotes || "Work with your coach to set a professional growth goal.",
        progress: pgpGoal?.progress || Math.min(100, (walkthroughs.length / 10) * 100), // Use stored progress or calculate
        trend,
        targetDate: pgpGoal?.targetDate || (pgpGoal ? Date.now() + (90 * 24 * 60 * 60 * 1000) : undefined),
      },
      refinementFocus: {
        currentIndicator: mostRecentRefinement || "No recent walkthroughs",
        description: mostRecentRefinement ? 
          `Focus area from your most recent walkthrough feedback.` : 
          "Complete a walkthrough to see your focus area.",
        progress: {
          current: Math.min(100, (walkthroughs.length / 5) * 100),
          target: 100,
          trend: trend === "Engaged" ? "improving" : trend === "Needs Support" ? "needs attention" : "stable",
        },
        nextSteps: [
          "Review feedback from your latest walkthrough",
          "Practice implementing suggested strategies",
          "Discuss progress with your coach",
        ],
      },
      reflectionPrompt: {
        question: walkthroughs.length > 0 ? 
          "What strategies from your recent feedback have you tried implementing?" :
          "What professional growth goals would you like to focus on?",
        lastAnswered: teacherReflections.length > 0 ? 
          teacherReflections.sort((a, b) => b.createdAt - a.createdAt)[0].createdAt : 
          undefined,
        isOverdue: teacherReflections.length === 0 || 
          (Date.now() - (teacherReflections[0]?.createdAt || 0)) > (7 * 24 * 60 * 60 * 1000), // 7 days
      },
      recentWalkthroughs: timelineWalkthroughs,
    };
  },
});