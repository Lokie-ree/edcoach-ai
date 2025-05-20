# EdCoach AI: Project Plan (MVP Focused on Informal Walkthroughs)

## 1. Project Overview

EdCoach AI is an AI-powered instructional coaching and feedback platform designed to supplement formal teacher evaluations in K-12 schools. The MVP focuses exclusively on enabling frequent, informal classroom walkthroughs, generating timely, rubric-aligned feedback snippets, and tracking developmental trends at the school level.

### 1.1 Project Goals

1. Enable school leaders and coaches to conduct frequent, informal classroom walkthroughs
2. Generate AI-powered concise, targeted feedback based on walkthrough data
3. Track teacher growth metrics between formal evaluation periods
4. Support differentiated user roles (admin, coach, teacher)
5. Provide a responsive, intuitive user interface optimized for mobile use

### 1.2 User Roles

- **Principal:** School leader who facilitates ongoing teacher development through frequent, targeted feedback derived from informal walkthroughs
- **Assistant Principal/Coach:** Efficiently conducts frequent informal walkthroughs and provides timely, targeted feedback to support teacher growth cycles
- **Teacher:** Receives regular, actionable feedback snippets throughout the year, enabling continuous professional growth between formal evaluation periods

## 2. Architecture & Technology Stack

### 2.1 Core Technology Stack

#### Backend
- **Primary Platform:** [Convex](https://convex.dev/)
  - Real-time database and function hosting
  - Schema-based data modeling
  - Function types: queries, mutations, actions
  - Scheduled tasks (crons)

#### Frontend
- **Framework:** Next.js with React and TypeScript
- **UI Component Libraries:**
  - **shadcn** (primary design system)
  - **React-bits** (supplementary components)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion

#### Authentication
- **Provider:** [Clerk](https://clerk.dev/)
  - User authentication and session management
  - Role-based access control
  - OAuth providers (Google, Microsoft)
  - JWT integration with Convex

#### AI Integration
- **OpenAI GPT-4.1 Mini** for feedback generation:
  - 1M token context window, strong instruction following, cost-effective
  - Reliable, high-quality outputs for user-facing educational feedback

### 2.2 System Architecture

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│  React        │     │  Convex       │     │  External     │
│  Frontend     │◄───►│  Backend      │◄───►│  Services     │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
       │                      │                     │
       │                      │                     │
       ▼                      ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│  Clerk Auth   │     │  Convex       │     │  OpenAI       │
│  User Mgmt    │     │  Functions    │     │  GPT-4        │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
```

## 3. Database, Authentication, and Core Features

### 3.1 Database Schema

See **Section 9: Expanded Database & Authentication Details** for the full schema, indexes, and data relationships. All entities are scoped to an organization and user roles. Key tables include users, organizations, teachers, rubrics, observations, evidence, feedback, rubricRatings, walkthroughs, walkthroughEntries, and auditLogs.

### 3.2 Authentication & RBAC

- **Authentication:** Clerk provides user authentication and session management. JWTs are used for secure API access.
- **Role-Based Access Control:**
  - `admin`: System administrator with full access
  - `school_leader`: Principal/administrator with access to all school data
  - `instructional_coach`: Observer with access to assigned teacher data
  - `teacher`: Access only to personal observation feedback
- **Authentication Flow:**
  1. User registers/logs in using Clerk (email/password or SSO)
  2. Clerk issues a JWT and establishes a session
  3. Clerk webhook creates or syncs user in Convex
  4. User is directed to the appropriate dashboard based on their role

### 3.3 Core Features Overview

- **User, Organization, Teacher, Rubric, Observation, Walkthrough CRUD:** All core entities have full create, read, update, and delete support, with audit logging for sensitive actions.
- **AI Feedback Integration:**
  - OpenAI GPT-4.1 Mini is used for generating brief, actionable feedback from walkthrough evidence.
  - Convex action handles OpenAI API calls with error handling.
  - Prompt templates are optimized for short, evidence-based input.
  - AI feedback is integrated into the walkthrough submission and review flow.
- **Analytics/Dashboard Views:**
  - Role-based dashboards for teachers, coaches, and principals showing feedback frequency, trends, and growth analytics
  - Visualizations for feedback and walkthrough trends
  - Filters for date, teacher, indicator, observer
  - Admin/leaderboard views for school leaders
- **Minimal 'Save as Draft':**
  - Walkthroughs/observations can be saved as draft for later completion (minimal implementation in MVP)
- **Mobile Optimization:**
  - Responsive layouts, large touch targets, minimal typing UI
  - Minimal 'Save as Draft' capability for in-classroom use
- **Notification System:**
  - In-app notifications for new feedback, walkthrough completions, and metrics
  - Email notifications for feedback digests and summaries (planned)
- **Audit Logging:**
  - All sensitive actions are logged with user, action, entity, timestamp, and details

## 4. Application Flow

### 4.1 Screen Functionality

- **Authentication & Onboarding:** Login/Register, onboarding tutorial, school setup (principal only)
- **Dashboards:** Principal, AP/Coach, and Teacher dashboards with role-specific data and actions
- **Informal Walkthrough Workflow:** Teacher selection, indicator selection, evidence capture, draft management, AI feedback generation, review/edit, finalization, and submission

### 4.2 User Journeys

- **Principal:** Login → Onboarding → School Setup → Dashboard → [Create Informal Walkthrough, Manage Users, View All Feedback]
- **AP/Coach:** Login → Onboarding → Dashboard → [Create Informal Walkthrough, Manage Drafts]
- **Teacher:** Login → Onboarding → Dashboard → [View Feedback Feed, Download Reports]
- **Informal Walkthrough:** Dashboard → Start Informal Walkthrough → Teacher Selection → Select 1-3 Focus Indicators → Record Brief Evidence → AI Feedback Generation → Quick Review/Edit → Finalize → Submit → Return to Dashboard

## 5. Implementation Plan & MVP Checklist

### 5.1 Implementation Phases & MVP Checklist

- **Phase 1:** Core authentication, Informal Walkthrough template, minimal 'Save as Draft'
  - Implements PRD US-001 (Principal registration and setup)
  - Implements PRD US-002 (Conducting informal walkthrough)
  - Key deliverables: User registration, role management, mobile-optimized walkthrough form, minimal 'Save as Draft'
- **Phase 2:** AI feedback generation, analytics/dashboard views
  - Implements PRD US-003 (Receiving and reviewing feedback)
  - Key deliverables: LLM integration for concise feedback, quick editing workflow, teacher access portal, analytics/dashboard views

### Post-MVP Features (Deferred)

- Advanced offline form completion and sync
- Exports and advanced reporting

## 6. UI/UX Implementation Details

- **Design System:** Typography, color palette, spacing, UI patterns, accessibility
- **Filter & Sort Capabilities:** Walkthrough/observation filters, analytics filters, sort options, state persistence
- **Mobile Considerations:** Responsive layouts, simplified forms, offline support, visual indicators, performance optimizations
- **Notification System:** In-app and email notifications, implementation details

## 7. Success Criteria

- Users can sign up/login with Clerk and are synced to Convex
  [Maps to PRD Section 7.1: User-centric metrics]
- School leaders can complete informal walkthroughs in less than 10 minutes
  [Maps to PRD Section 7.1: Average time target]
- AI generates concise, actionable feedback from brief evidence notes
- Teachers and coaches can access dashboards/analytics to track feedback and growth
- Each teacher receives at least 2 informal feedback interactions per month
  [Maps to PRD Section 7.1: Feedback frequency target]
- The app is fully functional on mobile devices for in-classroom use (with minimal 'Save as Draft')
- The platform complements rather than replaces formal evaluation systems
- Teacher satisfaction with frequency, timeliness, and actionability of feedback (survey score > 4/5)
- The app is robust, user-friendly, and ready for early adopters

## 8. Development Workflow & CI/CD

- **Environment Setup:** npm/yarn, TypeScript, ESLint, Prettier, Next.js, secrets in env vars
- **Code Quality:** Linting, formatting, PR reviews, strict TypeScript
- **Testing:** Unit, component, integration, E2E, mobile, performance
- **Deployment:** GitHub Actions, build/lint/test on PR, deploy to Vercel/Convex Cloud, manual promotion to production

## 9. Expanded Database & Authentication Details

### 9.1 Database Schema

**See this section for all table definitions, indexes, and data relationships.**

#### users
```typescript
{
  clerkId: v.string(),
  name: v.string(),
  email: v.string(),
  organization: v.string(),
  imageUrl: v.optional(v.string()),
  preferences: v.optional(v.any()),
  createdAt: v.number(),
  subscriptionStatus: v.optional(v.string()),
  subscriptionTier: v.optional(v.string()),
}
```
**Indexes:** `by_clerk_id`, `by_organization`

#### organizations
```typescript
{
  name: v.string(),
  adminId: v.id("users"),
  clerkOrgId: v.optional(v.string()),
  type: v.optional(v.string()),
  additionalInfo: v.optional(v.string()),
  createdAt: v.number(),
}
```
**Indexes:** `by_admin`

#### teachers
```typescript
{
  name: v.string(),
  email: v.optional(v.string()),
  department: v.optional(v.string()),
  gradeLevel: v.optional(v.string()),
  createdBy: v.id("users"),
  createdAt: v.number(),
  status: v.optional(v.string()),
  organization: v.optional(v.string()),
}
```
**Indexes:** `by_creator`, `by_organization`

#### rubrics
```typescript
{
  name: v.string(),
  description: v.optional(v.string()),
  version: v.optional(v.string()),
  isStandard: v.boolean(),
  structure: v.any(),
  createdBy: v.optional(v.id("users")),
  createdAt: v.number(),
  organizationId: v.optional(v.id("organizations")),
}
```
**Indexes:** `by_organization`

#### rubricIndicators
```typescript
{
  rubricId: v.id("rubrics"),
  acronym: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  domain: v.optional(v.string()),
  order: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
}
```
**Indexes:** `by_rubric`, `by_acronym`

#### rubricRatings
```typescript
{
  observationId: v.id("observations"),
  indicatorAcronym: v.string(),
  rating: v.number(),
  createdAt: v.number(),
}
```
**Indexes:** `by_observation`

#### evidence
```typescript
{
  observationId: v.id("observations"),
  indicatorId: v.string(),
  text: v.string(),
  rating: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  createdAt: v.number(),
  updatedAt: v.number(),
}
```
**Indexes:** `by_observation`

#### feedback
```typescript
{
  observationId: v.id("observations"),
  text: v.string(),
  version: v.number(),
  isFinalized: v.boolean(),
  isAIGenerated: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
}
```
**Indexes:** `by_observation`, `by_observation_and_version`

#### walkthroughs
```typescript
{
  teacherId: v.id("teachers"),
  observerId: v.id("users"),
  walkthroughDate: v.number(),
  status: v.union(v.literal("draft"), v.literal("completed")),
  reinforcementIndicator: v.string(),
  refinementIndicator: v.string(),
  evidenceSummary: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
}
```
**Indexes:** `by_observer`, `by_teacher`, `by_status`

#### walkthroughEntries
```typescript
{
  walkthroughId: v.id("walkthroughs"),
  indicatorAcronym: v.string(),
  type: v.union(v.literal("reinforcement"), v.literal("refinement")),
  aiFeedback: v.optional(v.string()),
  createdAt: v.number(),
}
```
**Indexes:** `by_walkthrough`

#### auditLogs
```typescript
{
  userId: v.optional(v.id("users")),
  action: v.string(),
  resourceType: v.optional(v.string()),
  resourceId: v.optional(v.string()),
  metadata: v.optional(v.any()),
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
  timestamp: v.number(),
}
```
**Indexes:** `by_user`, `by_action`, `by_timestamp`, `by_severity`, `by_resource`

#### aiUsageLogs
```typescript
{
  userId: v.optional(v.id("users")),
  action: v.string(),
  promptTokens: v.number(),
  completionTokens: v.number(),
  totalTokens: v.number(),
  model: v.string(),
  status: v.string(),
  error: v.optional(v.string()),
  createdAt: v.number(),
}
```
**Indexes:** `by_user`, `by_status`, `by_model`, `by_createdAt`

#### aiUsageAlerts
```typescript
{
  userId: v.optional(v.id("users")),
  alertType: v.string(),
  message: v.string(),
  resolved: v.boolean(),
  createdAt: v.number(),
  resolvedAt: v.optional(v.number()),
}
```
**Indexes:** `by_user`, `by_alertType`, `by_resolved`

#### observations
```typescript
{
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
}
```
**Indexes:** `by_observer`, `by_teacher`, `by_status`

### 9.2 Data Relationships

- **User → Organization:** Users belong to a single organization
- **Organization → Admin:** Organizations have an admin user
- **Teacher → User:** Teachers are created by users
- **Observation → Teacher/User/Rubric:** Observations are for a teacher, created by a user, use a rubric
- **Evidence/Feedback → Observation:** Evidence and feedback belong to an observation
- **All Entities → Organization:** All entities are scoped to an organization

### 9.3 Key Files & Core Functions

- `convex/schema.ts`: Database schema
- `convex/auth.ts`: Auth logic, Clerk webhook handling
- `convex/users.ts`: User management (createOrGetUser, getCurrentUser, getUserByClerkId, listUsers, updateUser)
- `convex/organizations.ts`: Organization management
- `convex/teachers.ts`: Teacher management
- `convex/observations.ts`: Observation management (with new observationType field)
- `convex/feedback.ts`: Feedback management
- `convex/walkthroughs.ts`: Informal walkthrough functions
- **Patterns:** Always check authentication, enforce RBAC, and scope queries by organizationId

## 10. Documentation & Maintenance

- **API & Component Documentation:** JSDoc/TSDoc, Storybook, up-to-date schema and function docs, walkthrough flow documentation
- **Monitoring & Alerting:** Sentry, Vercel Analytics, health checks, walkthrough completion times
- **Maintenance Schedule:** Weekly dependency updates, bi-weekly feature releases, quarterly major version reviews, regular data backup and recovery
- **Documentation Alignment:**
  - Keep PRD and project plan synchronized
  - Update both documents when requirements change
  - Maintain traceability between user stories and implementation

## Document References
- PRD: [Link to PRD]
- Project Plan: [Link to Project Plan]
- Last Synchronized: 2024-06-09

## Version History
- v1.1 (May 5, 2025): Initial synchronization
- v1.2 (2024-06-09): Updated to align PRD and project plan 