import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  // Users table - stores user information including role
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    organization: v.string(),
    imageUrl: v.optional(v.string()),
    preferences: v.optional(v.any()),
    createdAt: v.number(),
    subscriptionStatus: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    subscriptionTier: v.optional(v.union(v.literal("basic"), v.literal("pro"))),
    role: v.union(v.literal("coach"), v.literal("teacher")),
    coachId: v.optional(v.id("users")),
    onboardingComplete: v.optional(v.boolean()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_organization", ["organization"]),

  invites: defineTable({
    email: v.string(),
    coachId: v.id("users"),
    token: v.string(),
    accepted: v.boolean(),
    createdAt: v.number(),
  }).index("by_token", ["token"]),

  // Schools/organizations table
  organizations: defineTable({
    name: v.string(),
    adminId: v.id("users"),
    clerkOrgId: v.optional(v.string()),
    type: v.optional(v.string()),
    additionalInfo: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_admin", ["adminId"]),

  // Teachers table - for storing information about teachers being observed
  teachers: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    subject: v.array(v.string()),
    gradeBand: v.string(),
    coachId: v.id("users"),
    createdAt: v.number(),
    status: v.optional(v.string()),
  })
    .index("by_coach", ["coachId"]),

  // Rubrics table - for storing evaluation frameworks (metadata and full structure)
  rubrics: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    version: v.optional(v.string()),
    isStandard: v.boolean(),
    structure: v.any(), // The full rubric as an array of indicator objects
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
    organizationId: v.optional(v.id("organizations")),
  }).index("by_organization", ["organizationId"]),

  // RubricIndicators table - for granular access to each indicator
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
    organizationId: v.optional(v.id("organizations")),
  })
    .index("by_indicator_code", ["indicator_code"])
    .index("by_domain", ["domain"]),

  // Observations table - for recording classroom observations
  observations: defineTable({
    teacherId: v.id("teachers"),
    observerId: v.id("users"),
    subject: v.string(),
    gradeLevels: v.array(v.string()),
    observationDate: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("completed"),
      v.literal("feedback_generated"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_observer", ["observerId"])
    .index("by_teacher", ["teacherId"])
    .index("by_status", ["status"]),

  // Evidence table - for storing specific evidence tied to rubric indicators
  evidence: defineTable({
    observationId: v.id("observations"),
    indicatorId: v.string(),
    text: v.string(),
    rating: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_observation", ["observationId"]),

  // Feedback table - for storing AI-generated and edited feedback
  feedback: defineTable({
    observationId: v.id("observations"),
    text: v.string(),
    version: v.number(),
    isFinalized: v.boolean(),
    isAIGenerated: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_observation", ["observationId"])
    .index("by_observation_and_version", ["observationId", "version"]),

  rubricRatings: defineTable({
    observationId: v.id("observations"),
    indicatorAcronym: v.string(),
    rating: v.number(),
    createdAt: v.number(),
  }).index("by_observation", ["observationId"]),

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
    .index("by_observer_and_status", ["observerId", "status"])
    .index("by_teacher_and_status", ["teacherId", "status"])
    .index("by_date", ["walkthroughDate"]),

  walkthroughEntries: defineTable({
    walkthroughId: v.id("walkthroughs"),
    indicatorAcronym: v.string(),
    type: v.union(v.literal("reinforcement"), v.literal("refinement")),
    aiFeedback: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_walkthrough", ["walkthroughId"]),

  // Audit logs for security and compliance
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

  // AI Usage Logs - for tracking OpenAI token usage and cost
  aiUsageLogs: defineTable({
    userId: v.id("users"),
    action: v.string(), // e.g., "generateFeedback"
    model: v.string(), // e.g., "gpt-4.1-mini-2025-04-14"
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
    cost: v.number(), // in USD
    timestamp: v.number(),
    isCached: v.boolean(), // Track if input was cached
    metadata: v.optional(v.any()), // for additional context
  })
    .index("by_user", ["userId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_user_and_timestamp", ["userId", "timestamp"]),

  // AI Usage Alerts - for cost alerting
  aiUsageAlerts: defineTable({
    userId: v.id("users"),
    threshold: v.number(), // Cost threshold in USD
    period: v.string(), // e.g., "daily", "weekly", "monthly"
    lastTriggered: v.optional(v.number()),
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"]),
});
