import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Core user management - Clerk integration
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("coach"), v.literal("teacher")),
    imageUrl: v.optional(v.string()),
    preferences: v.optional(v.any()),
    createdAt: v.number(),
    clerkOrganizationId: v.optional(v.string()),
    onboardingComplete: v.optional(v.boolean()),
    // Subscription fields (synced from Clerk Billing webhooks)
    plan: v.union(v.literal("free"), v.literal("coach_starter"), v.literal("coach_pro")),
    subscriptionStatus: v.union(
      v.literal("active"),
      v.literal("past_due"),
      v.literal("canceled"),
      v.literal("incomplete"),
      v.literal("trialing"),
      v.literal("unpaid")
    ),
    subscriptionId: v.optional(v.string()),
    subscriptionStartedAt: v.optional(v.number()),
    subscriptionEndedAt: v.optional(v.number()),
    // Note: Subscription data is managed by Clerk Billing, no longer stored locally
    monthlyUsage: v.optional(v.object({
      walkthroughs: v.number(),
      teachersActive: v.number(),
      resetDate: v.string(), // ISO string
    })),
    freeTrialStarted: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_organization", ["clerkOrganizationId"]),

  // NEW: Invitation system for teacher invites
  invitations: defineTable({
    coachId: v.id("users"), // The coach who sent the invite
    teacherEmail: v.string(),
    token: v.string(), // Unique invitation token
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("expired")),
    expiresAt: v.number(),
    createdAt: v.number(),
    acceptedAt: v.optional(v.number()),
    subject: v.optional(v.string()), // Coach-suggested subject area
    gradeBand: v.optional(v.string()), // Coach-suggested grade band
  })
    .index("by_coach", ["coachId"])
    .index("by_email", ["teacherEmail"])
    .index("by_token", ["token"])
    .index("by_status", ["status"]),

  // Teacher records (app-specific data, linked to users via email/userId)
  teachers: defineTable({
    userId: v.optional(v.id("users")), // null until they accept invite
    name: v.string(),
    email: v.string(),
    subject: v.array(v.string()),
    gradeBand: v.string(),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("needs_details")),
    createdAt: v.number(),
    // NEW: Direct coach-teacher relationship
    coachId: v.id("users"), // The coach who manages this teacher
    // Keep clerkOrganizationId for backwards compatibility during migration
    clerkOrganizationId: v.optional(v.string()),
    // NEW: PGP Goal Management
    pgpGoal: v.optional(v.object({
      text: v.string(),
      indicatorCode: v.string(),
      contextNotes: v.optional(v.string()),
      setAt: v.number(),
      targetDate: v.optional(v.number()),
      progress: v.optional(v.number()), // 0-100 percentage
    })),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_coach", ["coachId"]) // NEW: Efficient coach-based queries
    .index("by_organization", ["clerkOrganizationId"]), // Keep for migration

  // Core walkthrough functionality
  walkthroughs: defineTable({
    teacherId: v.id("teachers"),
    observerId: v.id("users"),
    walkthroughDate: v.number(),
    status: v.union(v.literal("draft"), v.literal("completed")),
    evidenceSummary: v.string(),
    reinforcementIndicator: v.string(),
    refinementIndicator: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_observer", ["observerId"])
    .index("by_teacher", ["teacherId"])
    .index("by_status", ["status"])
    .index("by_date", ["walkthroughDate"]),

  walkthroughEntries: defineTable({
    walkthroughId: v.id("walkthroughs"),
    indicatorAcronym: v.string(),
    type: v.union(v.literal("reinforcement"), v.literal("refinement")),
    aiFeedback: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_walkthrough", ["walkthroughId"]),

  // Reflections: Teacher reflections on walkthroughs
  reflections: defineTable({
    walkthroughId: v.id("walkthroughs"),
    teacherId: v.id("teachers"),
    content: v.string(),
    createdAt: v.float64(),
    updatedAt: v.optional(v.float64()),
  }).index("by_walkthrough", ["walkthroughId"]),

  // Rubric system
  rubrics: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    version: v.optional(v.string()),
    isStandard: v.boolean(),
    structure: v.any(), // Note: Could be typed further for more safety
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
  }),

  rubricIndicators: defineTable({
    domain: v.string(),
    domain_weight: v.number(),
    indicator_code: v.string(),
    indicator_name: v.string(),
    overview: v.optional(v.string()),
    content_connections: v.optional(v.string()),
    student_centered_evidence: v.optional(v.array(v.string())),
    key_terms: v.optional(v.any()),
    performance_levels: v.array(v.any()),
    suggested_coaching_questions: v.optional(v.array(v.string())),
    rubricName: v.optional(v.string()),
    version: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  })
    .index("by_indicator_code", ["indicator_code"])
    .index("by_domain", ["domain"]),

  // AI usage tracking and limits
  aiUsageLogs: defineTable({
    userId: v.id("users"),
    action: v.string(),
    model: v.string(),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
    cost: v.number(),
    timestamp: v.number(),
    isCached: v.boolean(),
    metadata: v.optional(v.any()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_month", ["userId", "timestamp"]),

  aiUsageAlerts: defineTable({
    userId: v.id("users"),
    threshold: v.number(),
    period: v.string(),
    lastTriggered: v.optional(v.number()),
    isActive: v.boolean(),
  }).index("by_user", ["userId"]),

  // Audit logs (security & compliance)
  auditLogs: defineTable({
    userId: v.optional(v.id("users")),
    action: v.string(),
    resourceType: v.optional(v.string()),
    resourceId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_action", ["action"])
    .index("by_timestamp", ["timestamp"])
    .index("by_severity", ["severity"])
    .index("by_resource", ["resourceType", "resourceId"]),

  aiFeedback: defineTable({
    walkthroughId: v.id("walkthroughs"),
    feedback: v.string(),
    createdAt: v.number(),
    // Add more fields as needed
  }).index("by_walkthrough", ["walkthroughId"]),

  // Caches AI feedback results to reduce duplicate OpenAI calls and save costs
  aiFeedbackCache: defineTable({
    promptHash: v.string(), // hash of the full prompt (evidence + indicators)
    result: v.any(),        // the AI feedback result (object or string)
    createdAt: v.number(),  // timestamp for TTL/expiry
  }).index("by_promptHash", ["promptHash"]),

  // Workflow state management for 6-step EdCoach methodology
  workflowStates: defineTable({
    teacherId: v.id("teachers"),
    coachId: v.id("users"),
    currentStep: v.union(
      v.literal("setup"),
      v.literal("capture"),
      v.literal("analyze"), 
      v.literal("refine"),
      v.literal("reflect"),
      v.literal("monitor")
    ),
    stepProgress: v.object({
      setup: v.object({
        pgpSet: v.boolean(),
        goalIndicator: v.optional(v.string()),
        completedAt: v.optional(v.number())
      }),
      capture: v.object({
        walkthroughsCompleted: v.number(),
        lastWalkthroughDate: v.optional(v.number()),
        evidenceQuality: v.optional(v.number()) // 1-5 rating
      }),
      analyze: v.object({
        patternsIdentified: v.array(v.string()),
        insightsGenerated: v.number(),
        lastAnalysisDate: v.optional(v.number())
      }),
      refine: v.object({
        strategiesAdjusted: v.number(),
        lastRefinementDate: v.optional(v.number()),
        refinementType: v.optional(v.string())
      }),
      reflect: v.object({
        reflectionsCompleted: v.number(),
        lastReflectionDate: v.optional(v.number()),
        insightDepth: v.optional(v.number()) // 1-5 rating
      }),
      monitor: v.object({
        progressMetrics: v.array(v.any()),
        trendsIdentified: v.array(v.string()),
        lastMonitoringDate: v.optional(v.number())
      })
    }),
    cycleNumber: v.number(), // Track multiple coaching cycles
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index("by_teacher", ["teacherId"])
    .index("by_coach", ["coachId"])
    .index("by_current_step", ["currentStep"])
    .index("by_cycle", ["cycleNumber"])
    .index("by_teacher_cycle", ["teacherId", "cycleNumber"]),
});