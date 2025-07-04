import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Core user management - Clerk integration
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("coach"), v.literal("teacher")),
    clerkOrganizationId: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    preferences: v.optional(v.any()),
    createdAt: v.number(),
    onboardingComplete: v.optional(v.boolean()),
    externalId: v.optional(v.string()),
    // Note: Subscription data is managed by Clerk Billing, no longer stored locally
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
    title: v.string(),
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
});