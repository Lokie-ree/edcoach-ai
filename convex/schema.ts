import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  // Core user management - Clerk integration
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("coach"), v.literal("teacher")),
    clerkOrganizationId: v.optional(v.string()),
    subscriptionPlan: v.optional(v.union(v.literal("free"), v.literal("pro"))),
    imageUrl: v.optional(v.string()),
    preferences: v.optional(v.any()),
    createdAt: v.number(),
    onboardingComplete: v.optional(v.boolean()),
    // Legacy field for migration compatibility
    externalId: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_organization", ["clerkOrganizationId"]),

  // Teacher records (for pending invites + app-specific data)
  teachers: defineTable({
    userId: v.optional(v.id("users")), // null until they accept invite
    name: v.string(),
    email: v.string(),
    subject: v.array(v.string()),
    gradeBand: v.string(),
    status: v.union(v.literal("pending"), v.literal("active")),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

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

  // Rubric system (kept for business logic)
  rubrics: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    version: v.optional(v.string()),
    isStandard: v.boolean(),
    structure: v.any(),
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
});
