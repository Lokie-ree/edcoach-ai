import { query } from "./_generated/server";
import { v } from "convex/values";

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