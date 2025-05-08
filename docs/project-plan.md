# EdCoach AI: Comprehensive Project Plan

## 1. Project Overview

EdCoach AI is an AI-powered instructional coaching and feedback platform designed to supplement formal teacher evaluations in K-12 schools. The system enhances the ongoing coaching workflow between school leaders, instructional coaches, and teachers by providing tools for frequent, informal classroom walkthroughs, generating timely, rubric-aligned feedback snippets, and tracking developmental trends at the school level.

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
  - File storage for document uploads
  - Function types: queries, mutations, actions
  - Scheduled tasks (crons)

#### Frontend
- **Framework:** Next.js with React and TypeScript
- **UI Component Libraries:**
  - React-bits UI (primary design system)
  - ShadCn components (supplementary)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion

#### Authentication
- **Provider:** [Clerk](https://clerk.dev/)
  - User authentication and session management
  - Role-based access control
  - OAuth providers (Google, Microsoft)
  - JWT integration with Convex

#### AI Integration
- OpenAI GPT-4 for feedback generation

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
│  User Mgmt    │     │  Storage      │     │  GPT-4        │
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
  role: v.string(),
  organization: v.string(),
  imageUrl: v.optional(v.string()),
  preferences: v.optional(v.any()),
  createdAt: v.number(),
  subscriptionStatus: v.optional(v.string()),
  subscriptionTier: v.optional(v.string()),
}
```
**Indexes:** `by_clerk_id`, `by_role`, `by_organization`

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
  reinforcementComment: v.optional(v.string()),
  refinementComment: v.optional(v.string()),
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

#### walkthroughEntries
```typescript
{
  observationId: v.id("observations"),
  indicatorAcronym: v.string(),
  type: v.union(v.literal("reinforcement"), v.literal("refinement")),
  comment: v.string(),
  createdAt: v.number(),
}
```
**Indexes:** `by_observation`

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
- **Principal Dashboard:** Overview of all school walkthroughs/observations with prominent "Start Informal Walkthrough" button
- **AP/Coach Dashboard:** Overview of personal walkthroughs/observations with prominent "Start Informal Walkthrough" button
- **Teacher Dashboard:** Feed of all feedback interactions, including frequent informal points and less frequent formal observations

#### Observation Workflow
- **Teacher/Template Selection:** Select teacher and observation template (informal walkthrough or formal observation)
- **Observation Form:**
  - Informal Walkthrough (Primary): Quickly choose 1-3 focus indicators from the LER, jot down brief evidence notes
  - Formal Observation (Secondary): Complete rubric with all domains/indicators
- **Draft Management:** Manage saved walkthrough/observation drafts
- **AI Feedback Generation:** Generate concise, targeted feedback suggestions aligned with evidence and selected indicators
- **Finalization & Submission:** Quickly review and finalize feedback before sharing

### 4.2 User Journeys

#### Principal Journey
```
Login → Onboarding → School Setup → Dashboard → 
[Create Informal Walkthrough, Create Formal Observation, View Analytics, Manage Users, View All Feedback]
```

#### AP/Coach Journey
```
Login → Onboarding → Dashboard → 
[Create Informal Walkthrough, Create Formal Observation, Manage Drafts, View Assigned Teacher Analytics]
```

#### Teacher Journey
```
Login → Onboarding → Dashboard → 
[View Feedback Feed, Access Growth Analytics, Download Reports]
```

#### Informal Walkthrough Journey (Primary)
```
Dashboard → Start Informal Walkthrough → Teacher Selection → 
Select 1-3 Focus Indicators → Record Brief Evidence → 
AI Feedback Generation → Quick Review/Edit → Finalize → Submit → Return to Dashboard
(Target completion time: < 10 minutes)
```

#### Formal Observation Journey (Secondary)
```
Dashboard → New Observation → Teacher Selection → Template Selection → 
Complete Full Rubric → Save Draft/Continue → AI Feedback Generation → 
Review/Edit Feedback → Finalize → Submit → Return to Dashboard
```

## 5. Implementation Plan

### 5.1 Implementation Phases

#### Phase 1: Project Setup & Core Infrastructure
- [x] Configure existing Next.js project
- [x] Set up Convex backend
- [x] Set up Clerk authentication
- [x] Configure Next.js with Convex and Clerk

#### Phase 2: Authentication & User/Org Management
- [x] Integrate Clerk authentication in Next.js
- [x] Implement Convex user table and schema
- [x] Implement Convex organization table and schema
- [x] Set up Clerk webhooks for user/org sync
- [x] Implement Convex user management functions
- [x] Enforce authentication and RBAC in Convex

#### Phase 3: Teacher, Rubric, and Observation Management
- [x] Implement teacher table and management
- [x] Implement rubric table and management
- [x] Implement observation table and management
- [x] Implement evidence and feedback tables

#### Phase 4: Informal Walkthrough & Mobile Optimization
- [ ] Design and implement Informal Walkthrough template (CRITICAL priority)
- [ ] Optimize mobile experience for quick classroom capture
- [ ] Implement offline functionality for walkthroughs
- [ ] Test and optimize for sub-10-minute workflow completion

#### Phase 5: AI Feedback Integration
- [ ] Integrate OpenAI API in Convex
- [ ] Design prompts optimized for concise feedback from brief evidence
- [ ] Implement feedback generation specifically for informal walkthroughs
- [ ] Store and display AI-generated feedback

#### Phase 6: Frontend Flows & UI
- [x] Build user dashboard and navigation
- [x] Revisit dashboard layout to prominently feature "Start Informal Walkthrough"
- [ ] Implement teacher and observation management UI
- [ ] Implement simplified rubric and evidence UI for informal walkthroughs
- [ ] Implement feedback review and editing UI optimized for quick turnaround

#### Phase 7: Formal Observation Workflow (Secondary Feature)
- [ ] Design and implement Formal Observation template (Medium priority)
- [ ] Adapt AI prompts for comprehensive formal observation feedback
- [ ] Implement integration between formal and informal feedback data

#### Phase 8: Analytics & Reports
- [ ] Implement walkthrough frequency tracking by teacher
- [ ] Build visualizations for frequency and focus areas of informal feedback
- [ ] Create trend analysis for teacher growth between formal evaluations
- [ ] Implement basic filtering and sorting of walkthrough data

#### Phase 9: Security, Compliance, and Audit
- [x] Enforce organization-level data isolation
- [ ] Implement audit logging (optional but recommended)
- [ ] Review FERPA compliance

#### Phase 10: Testing, Polish, and Launch Prep
- [ ] Write unit and integration tests
- [ ] Polish UI/UX and error handling
- [ ] Optimize for mobile performance
- [ ] Prepare documentation and onboarding
- [ ] Launch MVP and collect feedback

### 5.2 Current Progress & Priorities

#### Completed
- Project setup and infrastructure
- Authentication and user management
- Database schema implementation
- Basic UI components and layout
- Core backend functions

#### In Progress
- Form validation & submission
- Basic observation workflow UI
- Teacher management UI

#### Next Steps (Revised Priorities)
- Informal Walkthrough template design and implementation (CRITICAL)
- Mobile optimization for classroom use (HIGH)
- AI feedback integration for brief, actionable feedback (HIGH)
- Analytics focused on walkthrough frequency and developmental trends (MEDIUM)
- Formal Observation workflow as secondary feature (MEDIUM)

## 6. MVP Tasks & Priorities

### 6.1 Remaining MVP Tasks

- [ ] **Informal Walkthrough Implementation (CRITICAL)**
  - Design streamlined UI for selecting 1-3 focus indicators
  - Create simplified evidence capture form
  - Optimize for mobile use with touch-friendly controls
  - Implement quick submission flow
  - Target completion time under 10 minutes
  - Test with actual users in classroom environments

- [ ] **Mobile Optimization (HIGH)**
  - Ensure responsive design works on tablets and phones
  - Implement offline functionality for classroom use
  - Create touch-optimized interface
  - Optimize performance for slower connections
  - Add visual indicators for offline/online status

- [ ] **AI Integration for Concise Feedback (HIGH)**
  - Set up OpenAI API key in Convex environment
  - Create wrapper utility for OpenAI API calls
  - Design prompts specifically for generating concise, actionable feedback
  - Optimize for brief evidence notes from walkthroughs
  - Create streamlined feedback review interface
  - Implement quick feedback delivery to teachers

- [ ] **Walkthrough Analytics (MEDIUM)**
  - Track walkthrough frequency by teacher
  - Implement focus indicator tracking across walkthroughs
  - Create visualizations for feedback trends
  - Design dashboard showing walkthrough coverage
  - Add filtering by date, teacher, and indicator

- [ ] **Formal Observation Support (MEDIUM)**
  - Implement complete rubric template as secondary feature
  - Design comprehensive evidence collection interface
  - Create connection between formal and informal data
  - Build formal observation analytics views

### 6.2 Timeline

- **Phase 1-3:** Completed
- **Phase 4 (Informal Walkthrough):** 1-2 weeks (HIGHEST PRIORITY)
- **Phase 5 (AI Feedback):** 1-2 weeks
- **Phase 6 (Frontend Flows):** 1-2 weeks
- **Phase 7 (Formal Observations):** 1 week
- **Phase 8 (Analytics):** 1 week
- **Phase 9-10 (Security & Launch):** 1-2 weeks

**Total remaining time:** 5-10 weeks
**Current progress:** ~50% complete

## 7. Future Enhancements (Post-MVP)

1. **Advanced Analytics & Reporting**
   - Complex data visualizations connecting informal and formal feedback
   - Advanced export functionality
   - Custom report generation for teacher growth
   - Scheduled walkthrough summary reports

2. **Advanced Mobile Features**
   - Camera integration for classroom evidence
   - Voice-to-text for faster evidence capture
   - Advanced offline synchronization
   - Push notifications for feedback delivery

3. **Advanced AI Features**
   - Personalized feedback styles by teacher
   - Suggested next focus areas based on previous walkthroughs
   - Trend identification across multiple walkthroughs
   - Automated PD recommendations based on feedback patterns

4. **Expanded Collaboration Tools**
   - Teacher self-reflection additions to feedback
   - Peer observation capabilities
   - Coaching conversation tracking
   - Goal-setting and progress monitoring

5. **Integration with Formal Evaluation Systems**
   - Data export to state evaluation systems
   - Alignment with district observation protocols
   - Evidence aggregation for formal reviews
   - Integration with other school data systems

## 8. Implementation Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Mobile performance issues affecting walkthrough speed | Implement aggressive performance optimizations and offline capabilities. Test extensively on various devices. |
| AI feedback quality for brief evidence notes | Develop specialized prompts for concise, actionable feedback. Implement human review and editing capabilities. |
| User adoption - resistance to frequent walkthroughs | Design for minimal time investment. Emphasize coaching rather than evaluation. Create excellent onboarding. |
| Clerk-Convex-Next.js integration complexity | Follow established patterns and official documentation. Test early and often. |
| OpenAI API cost/rate limits | Implement rate limiting, caching, and fallback mechanisms. Monitor usage and costs. |
| Data isolation failures | Add extensive testing for cross-organization data access. Implement schema-level constraints. |
| Complex UI states and error handling | Design with error states in mind. Add comprehensive error boundaries and user feedback. |
| FERPA compliance | Follow established guidelines. Consult with compliance experts if needed. |
| Next.js version compatibility | Ensure all libraries are compatible with the Next.js version. Consider using stable router implementation. |

## 9. Success Criteria

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

## 10. UI/UX Implementation Details

### 10.1 Design System Guidelines
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

### 10.2 Filter & Sort Capabilities
- **Walkthrough/Observation Filters:** Teacher, Observer, Date Range, Observation Type (Informal/Formal), Focus Indicators, Status
- **Analytics Filters:** Teacher(s), Observer(s), Date Range, Indicators, Walkthrough Frequency
- **Sort Options:** Date, Teacher, Observer, Frequency, Completion
- **Implementation:** All list and analytics views should include filter/sort controls, with state persisted in the UI.

### 10.3 Mobile Considerations (HIGH PRIORITY)
- Responsive layouts with collapsible navigation
- Simplified walkthrough forms optimized for mobile
- Large touch targets and minimal typing requirements
- Offline form completion and sync
- Visual indicators for offline/online status
- Performance optimizations for slower connections

### 10.4 Notification System
- **In-App:**
  - Teachers: New feedback notifications
  - Observers: Walkthrough completion confirmations
  - Principals: Walkthrough frequency metrics
- **Email:**
  - New feedback digests, weekly summaries
  - Walkthrough completion notifications
- **Implementation:** Use Convex for notification data, UI for in-app display, and email service for outbound notifications.

## 11. Expanded Database & Authentication Details

### 11.1 Audit Logging
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

### 11.2 Data Relationships
- **User → Organization:** Users belong to a single organization
- **Organization → Admin:** Organizations have an admin user
- **Teacher → User:** Teachers are created by users
- **Observation → Teacher/User/Rubric:** Observations are for a teacher, created by a user, use a rubric
- **Evidence/Feedback → Observation:** Evidence and feedback belong to an observation
- **All Entities → Organization:** All entities are scoped to an organization

### 11.3 Key Files & Core Functions
- `convex/schema.ts`: Database schema
- `convex/auth.ts`: Auth logic, Clerk webhook handling
- `convex/users.ts`: User management (createOrGetUser, getCurrentUser, getUserByClerkId, listUsers, updateUser)
- `convex/organizations.ts`: Organization management
- `convex/teachers.ts`: Teacher management
- `convex/observations.ts`: Observation management (with new observationType field)
- `convex/feedback.ts`: Feedback management
- `convex/walkthroughs.ts`: New file specifically for informal walkthrough functions
- **Patterns:** Always check authentication, enforce RBAC, and scope queries by organizationId

## 12. Development Workflow & CI/CD

### 12.1 Environment Setup
- Use npm/yarn for package management
- Configure TypeScript, ESLint, Prettier
- Use Vite or Next.js dev server
- Store secrets in environment variables

### 12.2 Code Quality Standards
- Linting and formatting enforced via pre-commit hooks
- PR reviews required for all merges
- Use strict TypeScript settings

### 12.3 Testing Methodologies
- **Unit tests:** Core business logic (Convex functions)
- **Component tests:** UI components
- **Integration tests:** API contracts
- **E2E tests:** User flows (Cypress or Playwright)
- **Mobile tests:** Test on actual mobile devices
- **Performance tests:** Verify sub-10-minute walkthrough completion

### 12.4 Deployment Pipeline
- GitHub Actions for CI
- Build, lint, and test on every PR
- Deploy to Vercel (frontend) and Convex Cloud (backend)
- Manual promotion to production after staging verification

## 13. Documentation & Maintenance

### 13.1 API & Component Documentation
- Use JSDoc/TSDoc for backend and frontend code
- Storybook for UI component documentation
- Maintain up-to-date schema and function docs
- Create specific documentation for the informal walkthrough flow

### 13.2 Monitoring & Alerting
- Sentry for error tracking (frontend and backend)
- Vercel Analytics for performance
- Health checks for API endpoints
- Track walkthrough completion times

### 13.3 Maintenance Schedule
- Weekly dependency updates
- Bi-weekly feature releases
- Quarterly major version reviews
- Regular data backup and recovery plan 