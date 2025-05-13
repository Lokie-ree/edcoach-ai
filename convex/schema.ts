import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// The schema is entirely optional.
// You can delete this file (schema.ts) and the
// app will continue to work.
// The schema provides more precise TypeScript types.
export default defineSchema({
  // Users table - stores user information including role
  users: defineTable({
    // User identity from Clerk
    clerkId: v.string(),
    // User's name
    name: v.string(),
    // User's email
    email: v.string(),
    // Organization the user belongs to
    organization: v.string(),
    // Optional profile image URL
    imageUrl: v.optional(v.string()),
    // User preferences and settings
    preferences: v.optional(v.any()),
    // When the user was created
    createdAt: v.number(),
    // Fields for subscription status
    subscriptionStatus: v.optional(v.string()),
    subscriptionTier: v.optional(v.string()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_organization", ["organization"]),

  // Schools/organizations table
  organizations: defineTable({
    // Organization name
    name: v.string(),
    // Admin user ID who created the organization
    adminId: v.id("users"),
    // Clerk organization ID (optional as it might not be available during initial creation)
    clerkOrgId: v.optional(v.string()),
    // Organization type (e.g., "public", "charter", "private")
    type: v.optional(v.string()),
    // Additional organization information
    additionalInfo: v.optional(v.string()),
    // Creation date
    createdAt: v.number(),
  }).index("by_admin", ["adminId"]),

  // Teachers table - for storing information about teachers being observed
  teachers: defineTable({
    // Teacher's name
    name: v.string(),
    // Teacher's email (optional)
    email: v.optional(v.string()),
    // Department or subject area
    department: v.optional(v.string()),
    // Grade level
    gradeLevel: v.optional(v.string()),
    // Created by user
    createdBy: v.id("users"),
    // Creation date
    createdAt: v.number(),
    // Teacher's status (active, pending, inactive)
    status: v.optional(v.string()),
    // Organization the teacher belongs to
    organization: v.optional(v.string()),
  })
    .index("by_creator", ["createdBy"])
    .index("by_organization", ["organization"]),

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
    createdAt: v.number(),
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
    // The observation this evidence is for
    observationId: v.id("observations"),
    // The rubric indicator this evidence is for
    indicatorId: v.string(),
    // The actual evidence text
    text: v.string(),
    // Rating assigned (if applicable)
    rating: v.optional(v.string()),
    // Tags for the evidence
    tags: v.optional(v.array(v.string())),
    // Creation date
    createdAt: v.number(),
    // Last updated timestamp
    updatedAt: v.number(),
  }).index("by_observation", ["observationId"]),

  // Feedback table - for storing AI-generated and edited feedback
  feedback: defineTable({
    // The observation this feedback is for
    observationId: v.id("observations"),
    // The generated feedback text
    text: v.string(),
    // The version of this feedback (for tracking edits)
    version: v.number(),
    // Whether this is the finalized version
    isFinalized: v.boolean(),
    // Whether this was AI-generated or manually edited
    isAIGenerated: v.boolean(),
    // Creation date
    createdAt: v.number(),
    // Last updated timestamp
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
    reinforcementIndicators: v.array(v.string()),
    refinementIndicators: v.array(v.string()),
    evidenceSummary: v.string(),
    additionalComments: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    organization: v.string(),
  })
    .index("by_observer", ["observerId"])
    .index("by_teacher", ["teacherId"])
    .index("by_organization", ["organization"])
    .index("by_status", ["status"]),

  walkthroughEntries: defineTable({
    walkthroughId: v.id("walkthroughs"),
    indicatorAcronym: v.string(),
    type: v.union(v.literal("reinforcement"), v.literal("refinement")),
    comment: v.string(),
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
});
