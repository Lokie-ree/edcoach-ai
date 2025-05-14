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
  - Chosen for its 1M token context window, strong instruction following, and cost-effectiveness.
  - Outperforms smaller models (e.g., Nano) in rubric-aligned, actionable feedback tasks.
  - Ensures reliable, high-quality outputs for user-facing educational feedback.

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

## 3. Database & Authentication

### 3.1 Architecture Pattern

EdCoach AI uses a dual-system approach:
- **Clerk** serves as the authentication and session provider
- **Convex** serves as the business data store and backend logic provider

### 3.2 Database Schema (Convex)

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

### 3.3 Authentication Flow

1. User registers/logs in using Clerk (email/password or SSO)
2. Upon successful authentication, Clerk issues a JWT and establishes a session
3. When a user first accesses the app:
   - If the user is new, Clerk webhook creates a corresponding user in Convex
   - If the user exists, the frontend retrieves their profile from Convex
4. The user is directed to the appropriate dashboard based on their role

### 3.4 Role-Based Access Control (RBAC)

- **Roles:**
  - `admin`: System administrator with full access
  - `school_leader`: Principal/administrator with access to all school data
  - `instructional_coach`: Observer with access to assigned teacher data
  - `teacher`: Access only to personal observation feedback

## 4. Application Flow

### 4.1 Screen Functionality

#### Authentication & Onboarding
- **Login/Register:** User authentication via email/password or SSO
- **Onboarding Tutorial:** Role-specific tutorial emphasizing the quick walkthrough workflow for frequent feedback
- **School Setup (Principal Only):** Enter school information and configuration

#### Dashboards
- **Principal Dashboard:** Overview of all school walkthroughs with prominent "Start Informal Walkthrough" button
- **AP/Coach Dashboard:** Overview of personal walkthroughs with prominent "Start Informal Walkthrough" button
- **Teacher Dashboard:** Feed of all feedback interactions from informal walkthroughs

#### Informal Walkthrough Workflow (MVP Only)
- **Teacher Selection:** Select teacher for walkthrough
- **Walkthrough Form:** Select exactly one focus indicator for reinforcement and one for refinement from the LER, jot down brief evidence notes (no per-indicator comments)
- **Draft Management:** Manage saved walkthrough drafts
- **AI Feedback Generation:** Generate concise, targeted feedback suggestions aligned with evidence and selected indicators
- **Finalization & Submission:** Quickly review and finalize feedback before sharing

### 4.2 User Journeys

#### Principal Journey
```
Login → Onboarding → School Setup → Dashboard → [Create Informal Walkthrough, View Analytics, Manage Users, View All Feedback]
```

#### AP/Coach Journey
```
Login → Onboarding → Dashboard → [Create Informal Walkthrough, Manage Drafts, View Assigned Teacher Analytics]
```

#### Teacher Journey
```
Login → Onboarding → Dashboard → [View Feedback Feed, Access Growth Analytics, Download Reports]
```

#### Informal Walkthrough Journey (MVP)
```
Dashboard → Start Informal Walkthrough → Teacher Selection → Select 1-3 Focus Indicators → Record Brief Evidence → AI Feedback Generation → Quick Review/Edit → Finalize → Submit → Return to Dashboard (Target completion time: < 10 minutes)
```

## 5. Implementation Plan

### 5.1 Implementation Phases

- [x] **Project setup and infrastructure**
  - [x] Initialize monorepo (frontend, backend)
  - [x] Configure TypeScript, ESLint, Prettier
  - [x] Set up Vite/Next.js dev server
  - [x] Configure environment variable management
  - [x] Set up GitHub Actions for CI/CD
  - [x] Configure deployment targets (Vercel, Convex Cloud)

- [x] **Authentication and user management**
  - [x] Integrate Clerk for authentication (email/password, SSO)
  - [x] Implement Clerk webhooks to sync users to Convex
  - [x] Create Convex user management functions (createOrGetUser, getCurrentUser, getUserByClerkId, listUsers, updateUser)
  - [x] Enforce RBAC in backend functions
  - [x] Implement role-based dashboard routing

- [x] **Database schema implementation**
  - [x] Implement all tables and indexes in `convex/schema.ts`
  - [ ] Add migration scripts or manual migration plan
  - [ ] Write unit tests for schema validation

- [x] **Basic UI components and layout**
  - [x] Set up global layout, navigation, and theming
  - [x] Implement design system (Typography, Color, Spacing, Buttons, Cards, Forms)
  - [x] Create reusable form components (inputs, selects, checkboxes)
  - [x] Implement error and loading states

- [x] **Core backend functions**
  - [x] Implement CRUD for users, organizations, teachers, rubrics, observations, walkthroughs
  - [x] Implement audit logging for sensitive actions
  - [ ] Write unit tests for all core functions

- [x] **Informal Walkthrough template design and implementation (CRITICAL)**
  - [x] Design walkthrough data model and UI flow
  - [x] Implement walkthrough creation form (teacher selection, indicator selection, evidence capture)
  - [x] Implement draft management (save, edit, delete drafts)
  - [x] Implement walkthrough submission and status tracking
  - [x] Integrate with feedback and analytics modules

- [x] **Mobile optimization for classroom use (HIGH)**
  - [x] Ensure all layouts are responsive (mobile/tablet/desktop)
  - [x] Implement large touch targets and minimal typing UI
  - [ ] Add offline form completion and sync
  - [ ] Add visual indicators for offline/online status
  - [ ] Optimize performance for slow connections

- [x] **AI feedback integration for brief, actionable feedback (HIGH)**
  - [x] Set up OpenAI API key in Convex environment
  - [x] Create Convex action for OpenAI API calls (with error handling)
  - [x] Design and test prompt templates for brief, actionable feedback
  - [x] Optimize for short, evidence-based input from walkthroughs
  - [x] Integrate AI feedback into walkthrough submission and review
  - [ ] Implement quick feedback delivery to teachers (in-app and email)
  - [ ] Add admin controls for feedback prompt tuning

- [ ] **Walkthrough Analytics (MEDIUM)**
  - [x] Track walkthrough frequency by teacher, observer, indicator (backend)
  - [ ] Implement focus indicator tracking and aggregation (UI/visualization)
  - [ ] Create visualizations for feedback and walkthrough trends (charts, tables)
  - [ ] Design analytics dashboard with filters (date, teacher, indicator, observer)
  - [ ] Add export/reporting functionality (CSV, PDF)
  - [ ] Add admin/leaderboard views for school leaders

- [x] **Other MVP Tasks**
  - [x] Implement notification system (in-app and email) (in-app: partial, email: not found)
  - [x] Add audit logging for all sensitive actions
  - [x] Finalize onboarding flows for all user roles (basic flows present)
  - [ ] Write and run E2E tests for all critical flows
  - [ ] Prepare documentation for early adopters

## 6. MVP Tasks & Priorities

- [x] **Informal Walkthrough Implementation (CRITICAL)**
  - [x] Design streamlined UI for selecting 1-3 focus indicators
  - [x] Implement teacher selection component with search/filter
  - [x] Create simplified evidence capture form (text, tags, quick rating)
  - [x] Add support for saving walkthroughs as drafts
  - [x] Implement quick submission flow with validation
  - [x] Integrate AI feedback generation into walkthrough flow (stubbed, not full OpenAI integration)
  - [x] Implement review/edit screen for feedback before finalizing
  - [x] Ensure all walkthroughs are scoped to organization and user roles
  - [ ] Target completion time under 10 minutes (usability test)
  - [ ] Test with actual users in classroom environments

- [x] **Mobile Optimization (HIGH)**
  - [x] Ensure all screens are responsive (mobile/tablet/desktop)
  - [x] Implement large touch targets and minimal typing UI
  - [ ] Add offline form completion and sync (Convex/Service Worker)
  - [ ] Add visual indicators for offline/online status
  - [ ] Optimize performance for slow connections (code splitting, lazy loading)
  - [ ] Test on a variety of devices and browsers

- [x] **AI Integration for Concise Feedback (HIGH)**
  - [x] Set up OpenAI API key in Convex environment
  - [x] Create Convex action for OpenAI API calls (with error handling)
  - [x] Design and test prompt templates for brief, actionable feedback
  - [x] Optimize for short, evidence-based input from walkthroughs
  - [x] Integrate AI feedback into walkthrough submission and review
  - [ ] Implement quick feedback delivery to teachers (in-app and email)
  - [ ] Add admin controls for feedback prompt tuning

- [ ] **Walkthrough Analytics (MEDIUM)**
  - [x] Track walkthrough frequency by teacher, observer, indicator (backend)
  - [ ] Implement focus indicator tracking and aggregation (UI/visualization)
  - [ ] Create visualizations for feedback and walkthrough trends (charts, tables)
  - [ ] Design analytics dashboard with filters (date, teacher, indicator, observer)
  - [ ] Add export/reporting functionality (CSV, PDF)
  - [ ] Add admin/leaderboard views for school leaders

- [x] **Other MVP Tasks**
  - [x] Implement notification system (in-app and email) (in-app: partial, email: not found)
  - [x] Add audit logging for all sensitive actions
  - [x] Finalize onboarding flows for all user roles (basic flows present)
  - [ ] Write and run E2E tests for all critical flows
  - [ ] Prepare documentation for early adopters

## 7. Success Criteria

The MVP will be considered successful when:
- Users can sign up/login with Clerk and are synced to Convex
- School leaders can complete informal walkthroughs in less than 10 minutes
- AI generates concise, actionable feedback from brief evidence notes
- Teachers receive timely feedback between formal evaluations
- Each teacher receives at least 2 informal feedback interactions per month
- The app is fully functional on mobile devices for in-classroom use
- The platform complements rather than replaces formal evaluation systems
- Teacher satisfaction with frequency, timeliness, and actionability of feedback (survey score > 4/5)
- The app is robust, user-friendly, and ready for early adopters 

## 8. UI/UX Implementation Details

### 8.1 Design System Guidelines
- **Typography:**
  - Primary font: Oswald (Google Fonts)
  - Type scale: text-xs to text-4xl for various UI elements
  - Font weights: Regular, Medium, Bold
- **Color Palette:**
  - Primary: Indigo (used for buttons, links, CTAs)
  - Semantic colors: background, foreground, card, popover, secondary, muted, accent, destructive, border, input, ring
  - Light/dark mode support
  - Gradients for CTAs and highlights
- **Spacing System:**
  - 4px base scale (Tailwind default)
  - Consistent use of padding, margin, and gap utilities
- **UI Patterns:**
  - Button variants (primary, secondary, outline, ghost, destructive, link)
  - Card components for grouped content
  - Section components for page structure
  - Form grouping, error states, required field indicators
  - Table/list row consistency, header styling, action alignment
  - Animations: Framer Motion for transitions, feedback, and hero sections
- **Accessibility:**
  - 4.5:1 contrast ratio minimum
  - Visible focus states
  - Semantic structure and ARIA attributes
  - Minimum touch target size: 44x44px for mobile optimization

### 8.2 Filter & Sort Capabilities
- **Walkthrough/Observation Filters:** Teacher, Observer, Date Range, Observation Type (Informal/Formal), Focus Indicators, Status
- **Analytics Filters:** Teacher(s), Observer(s), Date Range, Indicators, Walkthrough Frequency
- **Sort Options:** Date, Teacher, Observer, Frequency, Completion
- **Implementation:** All list and analytics views should include filter/sort controls, with state persisted in the UI.

### 8.3 Mobile Considerations (HIGH PRIORITY)
- Responsive layouts with collapsible navigation
- Simplified walkthrough forms optimized for mobile
- Large touch targets and minimal typing requirements
- Offline form completion and sync
- Visual indicators for offline/online status
- Performance optimizations for slower connections

### 8.4 Notification System
- **In-App:**
  - Teachers: New feedback notifications
  - Observers: Walkthrough completion confirmations
  - Principals: Walkthrough frequency metrics
- **Email:**
  - New feedback digests, weekly summaries
  - Walkthrough completion notifications
- **Implementation:** Use Convex for notification data, UI for in-app display, and email service for outbound notifications.

## 9. Expanded Database & Authentication Details

### 9.1 Audit Logging
- **audit_logs table:**
  ```typescript
  {
    userId: v.id("users"),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    timestamp: v.number(),
    details: v.optional(v.any()),
    organizationId: v.id("organizations"),
  }
  ```
  - Indexes: by_user, by_entity, by_organization, by_timestamp
  - Log all sensitive actions (create/update/delete/view)

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
- `convex/walkthroughs.ts`: New file specifically for informal walkthrough functions
- **Patterns:** Always check authentication, enforce RBAC, and scope queries by organizationId

## 10. Development Workflow & CI/CD

### 10.1 Environment Setup
- Use npm/yarn for package management
- Configure TypeScript, ESLint, Prettier
- Use Vite or Next.js dev server
- Store secrets in environment variables

### 10.2 Code Quality Standards
- Linting and formatting enforced via pre-commit hooks
- PR reviews required for all merges
- Use strict TypeScript settings

### 10.3 Testing Methodologies
- **Unit tests:** Core business logic (Convex functions)
- **Component tests:** UI components
- **Integration tests:** API contracts
- **E2E tests:** User flows (Cypress or Playwright)
- **Mobile tests:** Test on actual mobile devices
- **Performance tests:** Verify sub-10-minute walkthrough completion

### 10.4 Deployment Pipeline
- GitHub Actions for CI
- Build, lint, and test on every PR
- Deploy to Vercel (frontend) and Convex Cloud (backend)
- Manual promotion to production after staging verification

## 11. Documentation & Maintenance

### 11.1 API & Component Documentation
- Use JSDoc/TSDoc for backend and frontend code
- Storybook for UI component documentation
- Maintain up-to-date schema and function docs
- Create specific documentation for the informal walkthrough flow

### 11.2 Monitoring & Alerting
- Sentry for error tracking (frontend and backend)
- Vercel Analytics for performance
- Health checks for API endpoints
- Track walkthrough completion times

### 11.3 Maintenance Schedule
- Weekly dependency updates
- Bi-weekly feature releases
- Quarterly major version reviews
- Regular data backup and recovery plan 