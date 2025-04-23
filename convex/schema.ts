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
    // User's role: "admin", "school_leader", "instructional_coach"
    role: v.string(),
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
  }).index("by_clerk_id", ["clerkId"]).index("by_role", ["role"]).index("by_organization", ["organization"]),

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
  }).index("by_creator", ["createdBy"]),

  // Rubrics table - for storing evaluation frameworks
  rubrics: defineTable({
    // Rubric name (e.g., "LEADS", "LER")
    name: v.string(),
    // Description of the rubric
    description: v.optional(v.string()),
    // Version of the rubric
    version: v.optional(v.string()),
    // Whether this is a standard or custom rubric
    isStandard: v.boolean(),
    // The structure of the rubric (categories, indicators, rating scales)
    structure: v.any(),
    // Creator of the rubric (for custom rubrics)
    createdBy: v.optional(v.id("users")),
    // Creation date
    createdAt: v.number(),
    // Organization this rubric belongs to (for custom rubrics)
    organizationId: v.optional(v.id("organizations")),
  }).index("by_organization", ["organizationId"]),

  // Observations table - for recording classroom observations
  observations: defineTable({
    // The teacher being observed
    teacherId: v.id("teachers"),
    // The observer (school leader/coach)
    observerId: v.id("users"),
    // The rubric being used
    rubricId: v.id("rubrics"),
    // Date of observation
    observationDate: v.number(),
    // Class or subject observed
    classSubject: v.optional(v.string()),
    // Status of the observation ("draft", "completed", "feedback_generated")
    status: v.string(),
    // Creation date
    createdAt: v.number(),
    // Last updated timestamp
    updatedAt: v.number(),
    // Organization context
    organizationId: v.optional(v.id("organizations")),
  })
    .index("by_observer", ["observerId"])
    .index("by_teacher", ["teacherId"])
    .index("by_status", ["status"])
    .index("by_organization", ["organizationId"]),

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
  }).index("by_observation", ["observationId"]).index("by_observation_and_version", ["observationId", "version"]),
});
