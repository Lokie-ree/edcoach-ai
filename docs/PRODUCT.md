**EdCoach AI: Product & Technical Overview (MVP) - Revised**

**Table of Contents**
1.  Product Overview & Goals
2.  User Personas & Roles
3.  Onboarding, Role, and Subscription Flows
4.  Architecture & Technology Stack
5.  Database & Core Features
6.  Application Flow & User Journeys
7.  Implementation Timeline & Milestones
8.  Success Metrics
9.  Documentation & References

---

**1. Product Overview & Goals**
EdCoach AI is an AI-powered instructional coaching and feedback platform for K-12 schools, focused on frequent, informal classroom walkthroughs. The MVP delivers:
- Fast, AI-generated, rubric-aligned feedback for teachers
- Mobile-first, low-burden walkthrough capture
- Role-based dashboards and **basic analytics/metrics**
- **Coach-managed teacher groups (formalized via Clerk Organizations, initiated through existing coach UI)**
- Subscription-based access for coaches (via Clerk Billing)

**Business Goals**
- Reduce time for walkthroughs/feedback by 40%
- Improve feedback frequency and consistency
- Build a scalable, subscription-based platform

**User Goals**
- **Coach:** Conduct walkthroughs, manage their teacher group, view basic analytics/metrics for their activity, and manage their subscription.
- **Teacher:** Receive and review actionable feedback and view their feedback history.

---

**2. User Personas & Roles**
- **Coach** (admin of their own group):
    - Creates and manages their teacher group within EdCoach AI, which is technically represented as their own Clerk Organization.
    - Invites teachers to their group (triggering a Clerk Organization invitation).
    - Views analytics related to their coaching activity.
    - Requires a subscription.
- **Teacher:**
    - Joins a coach's group by accepting a Clerk Organization invitation.
    - Can view their own feedback.
    - No subscription required.

*For MVP, only these two roles are supported. Teachers are associated with their inviting coach through membership in the coach's Clerk Organization.*

---

**3. Onboarding, Role, and Subscription Flows**

**3.1 User Signup & Onboarding**
- User visits app and signs up/logs in with Clerk (email).
- **Initial Role Determination & Coach Onboarding:**
    - If a new user signs up directly (not via an organization invite):
        - They are provisionally considered a `coach`.
        - Must subscribe to the "Coach Plan" (via Clerk Billing) to activate coach features.
        - Post-subscription, their dedicated Clerk Organization is created (e.g., "[Coach's Name]'s Team"), and they become its administrator.
        - Sees coach-specific onboarding tutorial.
- **Teacher Onboarding (via Invite):**
    - Teachers primarily join by accepting a Clerk Organization invitation sent by a coach (see 3.2 Invite Flow).
    - Upon accepting the invite and signing up/logging in, Clerk automatically assigns them to the coach's organization with a `teacher` role within that organization.
    - Sees teacher-specific onboarding tutorial.

**3.2 Invite Flow (Hybrid Approach)**
- **Coach Action:**
    - From their dashboard, coach uses the existing "Add Teacher" UI, providing the teacher's email and any other required local application details.
- **Backend Process (Convex Mutation):**
    1.  The system creates/updates a record for the teacher in the EdCoach AI `teachers` table (local application data).
    2.  The system then programmatically sends an invitation to the provided teacher's email address to join the coach's Clerk Organization, assigning them a "teacher" role within that organization.
- **Teacher Action:**
    - Teacher receives an official invitation email from Clerk to join the coach's organization on EdCoach AI.
    - Teacher clicks the invite link, signs up or logs into EdCoach AI using Clerk.
    - They are automatically added as a member to the coach's Clerk Organization.
    - Their EdCoach AI user account is recognized as a `teacher` linked to that coach's group.

**3.3 Subscription Management**
- Only coaches require a subscription.
- **One primary paid plan at launch (e.g., "Coach Plan")** with monthly/yearly pricing options. This plan will have defined limits (e.g., number of active teachers, AI feedback generations).
    - *A 14-day or 30-day trial of this plan may be offered.*
- Clerk Billing integration for checkout, subscription gating, and user self-service subscription management via Clerk's Account Portal.

---

**4. Architecture & Technology Stack**
- **Frontend:** Next.js (React, TypeScript), shadcn, Tailwind CSS, Framer Motion
- **Backend:** Convex (real-time DB, functions, schema)
- **Authentication & Group Management:** Clerk (user/session management, RBAC, **Organizations for coach-teacher groups**)
- **AI Integration:** OpenAI GPT-4.1 Mini (feedback generation)
- **Payments:** Clerk Billing (subscription management for coaches)

---

**5. Database & Core Features**
- Key tables in Convex: `users`, `teachers` (stores app-specific teacher data, linked to Clerk user), `walkthroughs`, `feedback`, `auditLogs`, `aiUsageLogs`.
- The `users` table (for coaches) will store their associated `clerkOrganizationId`.
- The `teachers` table links the local teacher profile to their Clerk `userId` once they accept an invitation and sign up. The primary association to a coach is through Clerk Organization membership.
- Role-based access enforced in backend, leveraging both local role flags and Clerk Organization membership/roles.
- All rubric data loaded from Convex DB.
- Schema details available in `convex/schema.ts`.

---

**6. Application Flow & User Journeys**

**6.1 Coach**
- Signup → Subscribe to "Coach Plan" (if not active) → Clerk Organization automatically created/assigned → Onboarding → Dashboard.
- Use "Add Teacher" UI (triggers local record creation & Clerk Organization invite) → Conduct walkthrough for a teacher in their group → Generate/edit AI feedback → Submit.
- View basic analytics, manage their teacher group (view members, potentially re-send invites if needed via Clerk mechanisms or custom UI), manage subscription (via Clerk Account Portal).

**6.2 Teacher**
- Receives Clerk Organization invitation email → Clicks link → Signup/Login via Clerk → Automatically joins coach's group → Onboarding → Dashboard.
- View feedback feed. (Defer "download reports" for MVP, focus on viewing).

**6.3 Walkthrough Workflow**
- Coach selects a teacher (from their managed group) → Selects 1 indicator for reinforcement, 1 for refinement → Records evidence → AI feedback generated → Review/edit → Submit.

---

**7. Implementation Timeline & Milestones**

**MVP Essential Tasks (~120-150 hours - adjust as needed for Org integration)**
- **Core AI & Mobile:** OpenAI integration, prompt templates, walkthrough UI, basic analytics display.
- **Onboarding, Role & Group Management:**
    - Coach signup, subscription, and automatic Clerk Organization creation.
    - Teacher invitation flow (existing coach UI triggering backend Clerk Org invite).
    - Teacher onboarding via Clerk Org invite acceptance.
    - Linking Clerk users to local `teachers` records (via webhook or initial login logic).
- **Subscription Gating:** Clerk Billing integration for the single "Coach Plan," coach feature gating, trial management (if applicable).
- **Testing & Launch:** E2E tests (including invite flow), mobile testing, documentation, onboarding materials.

**Post-MVP (Deferred)**
- Bulk teacher invites.
- Broader org/district support (beyond individual coach "teams").
- Advanced offline capabilities.
- File exports/reporting.
- Formal observation support.
- More complex analytics.

---

**8. Success Metrics**
- Walkthroughs completed in <10 minutes.
- >2 feedback interactions/teacher/month.
- >70% dashboard/basic analytics usage by coaches.
- Coach subscription conversion rate (and trial conversion, if applicable).
- Teacher satisfaction (survey >4/5 with the feedback received).
- Successful teacher invitation and onboarding rate.