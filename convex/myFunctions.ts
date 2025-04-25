import { query } from "./_generated/server";

// Get summary data for the dashboard
export const getDashboardSummary = query({
  args: {},
  handler: async (ctx) => {
    // Get the currently authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return { isAuthenticated: false };
    }

    // Get counts of various entities
    const userCount = await ctx.db.query("users").collect().then(users => users.length);
    const organizationCount = await ctx.db.query("organizations").collect().then(orgs => orgs.length);
    const teacherCount = await ctx.db.query("teachers").collect().then(teachers => teachers.length);
    const observationCount = await ctx.db.query("observations").collect().then(observations => observations.length);
    
    // Get counts by status
    const draftObservations = await ctx.db
      .query("observations")
      .withIndex("by_status", q => q.eq("status", "draft"))
      .collect()
      .then(observations => observations.length);
    
    const completedObservations = await ctx.db
      .query("observations")
      .withIndex("by_status", q => q.eq("status", "completed"))
      .collect()
      .then(observations => observations.length);
    
    const feedbackGeneratedObservations = await ctx.db
      .query("observations")
      .withIndex("by_status", q => q.eq("status", "feedback_generated"))
      .collect()
      .then(observations => observations.length);
    
    return {
      isAuthenticated: true,
      userInfo: {
        name: identity.name,
        email: identity.email,
      },
      counts: {
        users: userCount,
        organizations: organizationCount,
        teachers: teacherCount,
        observations: {
          total: observationCount,
          draft: draftObservations,
          completed: completedObservations,
          feedbackGenerated: feedbackGeneratedObservations,
        }
      }
    };
  },
});
