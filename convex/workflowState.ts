import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

// Initialize workflow state for a new teacher (both public and internal versions)
export const initializeWorkflowState = mutation({
  args: {
    teacherId: v.id("teachers"),
    coachId: v.id("users"),
  },
  returns: v.id("workflowStates"),
  handler: async (ctx, { teacherId, coachId }): Promise<Id<"workflowStates">> => {
    return await ctx.runMutation(internal.workflowState.initializeWorkflowStateInternal, {
      teacherId,
      coachId,
    });
  },
});

// Internal version for cross-mutation calls
export const initializeWorkflowStateInternal = internalMutation({
  args: {
    teacherId: v.id("teachers"),
    coachId: v.id("users"),
  },
  returns: v.id("workflowStates"),
  handler: async (ctx, { teacherId, coachId }) => {
    const now = Date.now();

    // Check if workflow state already exists
    const existing = await ctx.db
      .query("workflowStates")
      .withIndex("by_teacher_cycle", (q) =>
        q.eq("teacherId", teacherId).eq("cycleNumber", 1),
      )
      .first();

    if (existing) {
      return existing._id;
    }

    // Create initial workflow state
    const workflowStateId = await ctx.db.insert("workflowStates", {
      teacherId,
      coachId,
      currentStep: "setup",
      stepProgress: {
        setup: {
          pgpSet: false,
        },
        capture: {
          walkthroughsCompleted: 0,
        },
        analyze: {
          patternsIdentified: [],
          insightsGenerated: 0,
        },
        refine: {
          strategiesAdjusted: 0,
        },
        reflect: {
          reflectionsCompleted: 0,
        },
        monitor: {
          progressMetrics: [],
          trendsIdentified: [],
        },
      },
      cycleNumber: 1,
      createdAt: now,
      updatedAt: now,
    });

    return workflowStateId;
  },
});

// Update workflow step progress
export const updateWorkflowStep = mutation({
  args: {
    teacherId: v.id("teachers"),
    step: v.union(
      v.literal("setup"),
      v.literal("capture"),
      v.literal("analyze"),
      v.literal("refine"),
      v.literal("reflect"),
      v.literal("monitor"),
    ),
    updates: v.any(),
    cycleNumber: v.optional(v.number()),
  },
  returns: v.id("workflowStates"),
  handler: async (ctx, { teacherId, step, updates, cycleNumber = 1 }) => {
    const workflowState = await ctx.db
      .query("workflowStates")
      .withIndex("by_teacher_cycle", (q) =>
        q.eq("teacherId", teacherId).eq("cycleNumber", cycleNumber),
      )
      .first();

    if (!workflowState) {
      throw new Error("Workflow state not found");
    }

    const now = Date.now();
    const updatedProgress = {
      ...workflowState.stepProgress,
      [step]: {
        ...workflowState.stepProgress[step],
        ...updates,
        ...(updates.completedAt !== undefined ? { completedAt: now } : {}),
      },
    };

    await ctx.db.patch(workflowState._id, {
      stepProgress: updatedProgress,
      updatedAt: now,
    });

    return workflowState._id;
  },
});

// Move to next workflow step
export const advanceWorkflowStep = mutation({
  args: {
    teacherId: v.id("teachers"),
    cycleNumber: v.optional(v.number()),
  },
  returns: v.string(),
  handler: async (ctx, { teacherId, cycleNumber = 1 }) => {
    const workflowState = await ctx.db
      .query("workflowStates")
      .withIndex("by_teacher_cycle", (q) =>
        q.eq("teacherId", teacherId).eq("cycleNumber", cycleNumber),
      )
      .first();

    if (!workflowState) {
      throw new Error("Workflow state not found");
    }

    const stepOrder = [
      "setup",
      "capture",
      "analyze",
      "refine",
      "reflect",
      "monitor",
    ] as const;
    const currentIndex = stepOrder.indexOf(workflowState.currentStep);
    const nextIndex = (currentIndex + 1) % stepOrder.length;
    const nextStep = stepOrder[nextIndex];

    // If we're completing the monitor step, start a new cycle
    if (workflowState.currentStep === "monitor" && nextStep === "setup") {
      await ctx.db.insert("workflowStates", {
        teacherId,
        coachId: workflowState.coachId,
        currentStep: "setup",
        stepProgress: {
          setup: { pgpSet: false },
          capture: { walkthroughsCompleted: 0 },
          analyze: { patternsIdentified: [], insightsGenerated: 0 },
          refine: { strategiesAdjusted: 0 },
          reflect: { reflectionsCompleted: 0 },
          monitor: { progressMetrics: [], trendsIdentified: [] },
        },
        cycleNumber: cycleNumber + 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(workflowState._id, {
        currentStep: nextStep,
        updatedAt: Date.now(),
      });
    }

    return nextStep;
  },
});

// Complete PGP setup step
export const completePgpSetup = mutation({
  args: {
    teacherId: v.id("teachers"),
    goalIndicator: v.string(),
  },
  returns: v.string(),
  handler: async (ctx, { teacherId, goalIndicator }) => {
    const workflowState = await ctx.db
      .query("workflowStates")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
      .order("desc")
      .first();

    if (!workflowState) {
      throw new Error("Workflow state not found");
    }

    const now = Date.now();

    // Update the setup step
    const updatedProgress = {
      ...workflowState.stepProgress,
      setup: {
        ...workflowState.stepProgress.setup,
        pgpSet: true,
        goalIndicator,
        completedAt: now,
      },
    };

    await ctx.db.patch(workflowState._id, {
      stepProgress: updatedProgress,
      updatedAt: now,
    });

    // Auto-advance to capture step
    const stepOrder = [
      "setup",
      "capture",
      "analyze",
      "refine",
      "reflect",
      "monitor",
    ] as const;
    const currentIndex = stepOrder.indexOf(workflowState.currentStep);
    const nextIndex = (currentIndex + 1) % stepOrder.length;
    const nextStep = stepOrder[nextIndex];

    await ctx.db.patch(workflowState._id, {
      currentStep: nextStep,
      updatedAt: now,
    });

    return nextStep;
  },
});

// Record walkthrough completion (public for UI components)
export const recordWalkthroughCompletion = mutation({
  args: {
    teacherId: v.id("teachers"),
    walkthroughDate: v.number(),
    evidenceQuality: v.optional(v.number()),
  },
  returns: v.id("workflowStates"),
  handler: async (ctx, args): Promise<Id<"workflowStates">> => {
    return await ctx.runMutation(internal.workflowState.recordWalkthroughCompletionInternal, args);
  },
});

// Record walkthrough completion (internal for workflow integration)
export const recordWalkthroughCompletionInternal = internalMutation({
  args: {
    teacherId: v.id("teachers"),
    walkthroughDate: v.number(),
    evidenceQuality: v.optional(v.number()),
  },
  returns: v.id("workflowStates"),
  handler: async (ctx, { teacherId, walkthroughDate, evidenceQuality }): Promise<Id<"workflowStates">> => {
    const workflowState = await ctx.db
      .query("workflowStates")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
      .order("desc")
      .first();

    if (!workflowState) {
      // If no workflow state exists, initialize one
      const teacher = await ctx.db.get(teacherId);
      if (!teacher) throw new Error("Teacher not found");
      
      return await ctx.runMutation(internal.workflowState.initializeWorkflowStateInternal, {
        teacherId,
        coachId: teacher.coachId,
      });
    }

    const currentWalkthroughs =
      workflowState.stepProgress.capture.walkthroughsCompleted;
    const now = Date.now();

    const updatedProgress = {
      ...workflowState.stepProgress,
      capture: {
        ...workflowState.stepProgress.capture,
        walkthroughsCompleted: currentWalkthroughs + 1,
        lastWalkthroughDate: walkthroughDate,
        ...(evidenceQuality && { evidenceQuality }),
        completedAt: now, // Mark this step as having activity
      },
    };

    await ctx.db.patch(workflowState._id, {
      stepProgress: updatedProgress,
      updatedAt: now,
    });

    // Check if we should advance to the next step
    // If we have 2+ walkthroughs and we're in capture phase, advance to analyze
    if (currentWalkthroughs + 1 >= 2 && workflowState.currentStep === "capture") {
      const stepOrder = [
        "setup",
        "capture", 
        "analyze",
        "refine",
        "reflect",
        "monitor",
      ] as const;
      const currentIndex = stepOrder.indexOf(workflowState.currentStep);
      const nextIndex = (currentIndex + 1) % stepOrder.length;
      const nextStep = stepOrder[nextIndex];

      await ctx.db.patch(workflowState._id, {
        currentStep: nextStep,
        updatedAt: now,
      });
    }

    return workflowState._id;
  },
});

// Record reflection completion (internal for workflow integration)
export const recordReflectionCompletion = internalMutation({
  args: {
    teacherId: v.id("teachers"),
    insightDepth: v.optional(v.number()),
  },
  returns: v.id("workflowStates"),
  handler: async (ctx, { teacherId, insightDepth }) => {
    const workflowState = await ctx.db
      .query("workflowStates")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
      .order("desc")
      .first();

    if (!workflowState) {
      throw new Error("Workflow state not found");
    }

    const currentReflections =
      workflowState.stepProgress.reflect.reflectionsCompleted;
    const now = Date.now();

    const updatedProgress = {
      ...workflowState.stepProgress,
      reflect: {
        ...workflowState.stepProgress.reflect,
        reflectionsCompleted: currentReflections + 1,
        lastReflectionDate: now,
        ...(insightDepth && { insightDepth }),
        completedAt: now, // Mark this step as having activity
      },
    };

    await ctx.db.patch(workflowState._id, {
      stepProgress: updatedProgress,
      updatedAt: now,
    });

    // Check if we have enough reflections to potentially advance the workflow
    // If this is the 2nd reflection (minimum threshold), consider advancing to monitor step
    if (currentReflections + 1 >= 2 && workflowState.currentStep === "reflect") {
      const stepOrder = [
        "setup",
        "capture", 
        "analyze",
        "refine",
        "reflect",
        "monitor",
      ] as const;
      const currentIndex = stepOrder.indexOf(workflowState.currentStep);
      const nextIndex = (currentIndex + 1) % stepOrder.length;
      const nextStep = stepOrder[nextIndex];

      await ctx.db.patch(workflowState._id, {
        currentStep: nextStep,
        updatedAt: now,
      });
    }

    return workflowState._id;
  },
});

// Query functions for workflow state retrieval
export const getWorkflowState = query({
  args: {
    teacherId: v.id("teachers"),
    cycleNumber: v.optional(v.number()),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("workflowStates"),
      _creationTime: v.number(),
      teacherId: v.id("teachers"),
      coachId: v.id("users"),
      currentStep: v.union(
        v.literal("setup"),
        v.literal("capture"),
        v.literal("analyze"),
        v.literal("refine"),
        v.literal("reflect"),
        v.literal("monitor"),
      ),
      stepProgress: v.any(),
      cycleNumber: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, { teacherId, cycleNumber }) => {
    if (cycleNumber) {
      return await ctx.db
        .query("workflowStates")
        .withIndex("by_teacher_cycle", (q) =>
          q.eq("teacherId", teacherId).eq("cycleNumber", cycleNumber),
        )
        .first();
    }

    // Get latest workflow state
    return await ctx.db
      .query("workflowStates")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
      .order("desc")
      .first();
  },
});

export const getCoachWorkflowStates = query({
  args: {
    coachId: v.id("users"),
  },
  returns: v.array(
    v.object({
      _id: v.id("workflowStates"),
      _creationTime: v.number(),
      teacherId: v.id("teachers"),
      coachId: v.id("users"),
      currentStep: v.union(
        v.literal("setup"),
        v.literal("capture"),
        v.literal("analyze"),
        v.literal("refine"),
        v.literal("reflect"),
        v.literal("monitor"),
      ),
      stepProgress: v.any(),
      cycleNumber: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, { coachId }) => {
    return await ctx.db
      .query("workflowStates")
      .withIndex("by_coach", (q) => q.eq("coachId", coachId))
      .collect();
  },
});

export const getWorkflowStatesByStep = query({
  args: {
    coachId: v.id("users"),
    step: v.union(
      v.literal("setup"),
      v.literal("capture"),
      v.literal("analyze"),
      v.literal("refine"),
      v.literal("reflect"),
      v.literal("monitor"),
    ),
  },
  returns: v.array(
    v.object({
      _id: v.id("workflowStates"),
      _creationTime: v.number(),
      teacherId: v.id("teachers"),
      coachId: v.id("users"),
      currentStep: v.union(
        v.literal("setup"),
        v.literal("capture"),
        v.literal("analyze"),
        v.literal("refine"),
        v.literal("reflect"),
        v.literal("monitor"),
      ),
      stepProgress: v.any(),
      cycleNumber: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, { coachId, step }) => {
    const allStates = await ctx.db
      .query("workflowStates")
      .withIndex("by_coach", (q) => q.eq("coachId", coachId))
      .collect();

    return allStates.filter((state) => state.currentStep === step);
  },
});

export const getWorkflowProgress = query({
  args: {
    teacherId: v.id("teachers"),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("workflowStates"),
      _creationTime: v.number(),
      teacherId: v.id("teachers"),
      coachId: v.id("users"),
      currentStep: v.union(
        v.literal("setup"),
        v.literal("capture"),
        v.literal("analyze"),
        v.literal("refine"),
        v.literal("reflect"),
        v.literal("monitor"),
      ),
      stepProgress: v.any(),
      cycleNumber: v.number(),
      createdAt: v.number(),
      updatedAt: v.number(),
      overallProgress: v.number(),
      currentStepProgress: v.number(),
      nextSteps: v.array(v.string()),
    }),
  ),
  handler: async (ctx, { teacherId }) => {
    const workflowState = await ctx.db
      .query("workflowStates")
      .withIndex("by_teacher", (q) => q.eq("teacherId", teacherId))
      .order("desc")
      .first();

    if (!workflowState) {
      return null;
    }

    // Calculate overall progress percentage
    const stepWeights = {
      setup: 20,
      capture: 20,
      analyze: 15,
      refine: 15,
      reflect: 15,
      monitor: 15,
    };

    const stepOrder = [
      "setup",
      "capture",
      "analyze",
      "refine",
      "reflect",
      "monitor",
    ] as const;
    const currentStepIndex = stepOrder.indexOf(workflowState.currentStep);

    let totalProgress = 0;

    // Add progress for completed steps
    for (let i = 0; i < currentStepIndex; i++) {
      totalProgress += stepWeights[stepOrder[i]];
    }

    // Add partial progress for current step
    const currentStepProgress = calculateStepProgress(
      workflowState,
      workflowState.currentStep,
    );
    totalProgress +=
      (stepWeights[workflowState.currentStep] * currentStepProgress) / 100;

    return {
      ...workflowState,
      overallProgress: Math.round(totalProgress),
      currentStepProgress: Math.round(currentStepProgress),
      nextSteps: getNextSteps(workflowState),
    };
  },
});

// Helper function to calculate individual step progress
function calculateStepProgress(
  workflowState: Doc<"workflowStates">,
  step: string,
): number {
  const stepProgress = workflowState.stepProgress;

  switch (step) {
    case "setup":
      return stepProgress.setup.pgpSet ? 100 : 0;
    case "capture":
      return Math.min(
        100,
        (stepProgress.capture.walkthroughsCompleted / 3) * 100,
      ); // Assume 3 walkthroughs per cycle
    case "analyze":
      return Math.min(100, (stepProgress.analyze.insightsGenerated / 2) * 100); // Assume 2 insights minimum
    case "refine":
      return Math.min(100, (stepProgress.refine.strategiesAdjusted / 1) * 100); // At least 1 strategy adjustment
    case "reflect":
      return Math.min(
        100,
        (stepProgress.reflect.reflectionsCompleted / 2) * 100,
      ); // Assume 2 reflections minimum
    case "monitor":
      return stepProgress.monitor.progressMetrics.length > 0 ? 100 : 0;
    default:
      return 0;
  }
}

// Helper function to suggest next steps
function getNextSteps(workflowState: Doc<"workflowStates">): string[] {
  const { currentStep, stepProgress } = workflowState;

  switch (currentStep) {
    case "setup":
      if (!stepProgress.setup.pgpSet) {
        return ["Set Professional Growth Plan goal", "Select target indicator"];
      }
      return ["Begin classroom observations"];
    case "capture":
      return [
        "Complete walkthrough observations",
        "Collect evidence for target indicator",
        "Document reinforcement and refinement areas",
      ];
    case "analyze":
      return [
        "Review walkthrough patterns",
        "Generate insights from evidence",
        "Identify teaching strengths and growth areas",
      ];
    case "refine":
      return [
        "Adjust coaching strategies based on analysis",
        "Plan targeted interventions",
        "Update professional development focus",
      ];
    case "reflect":
      return [
        "Complete reflection activities",
        "Document learning insights",
        "Plan application of new strategies",
      ];
    case "monitor":
      return [
        "Track progress metrics",
        "Evaluate goal achievement",
        "Plan next coaching cycle",
      ];
    default:
      return [];
  }
}
