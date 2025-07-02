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
10. Appendix: Alternative Non-Organization MVP Approach

---

**1. Product Overview & Goals**
EdCoach AI is an AI-powered instructional coaching and feedback platform for K-12 schools, focused on frequent, informal classroom walkthroughs. The MVP delivers:
- Fast, AI-generated, rubric-aligned feedback for teachers
- Mobile-first, low-burden walkthrough capture
- Role-based dashboards and **basic analytics/metrics**
- **Coach-managed teacher groups (direct coach-teacher relationship, initiated through existing coach UI)**
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
    - Creates and manages their teacher group within EdCoach AI, with a direct coach-teacher relationship managed in the app database.
    - Invites teachers to their group (triggers an email invitation and local record creation).
    - Views analytics related to their coaching activity.
    - Requires a subscription.
- **Teacher:**
    - Joins a coach's group by accepting an email invitation from the coach.
    - Can view their own feedback.
    - No subscription required.

*For MVP, only these two roles are supported. Teachers are associated with their inviting coach through a direct relationship in the app database.*

---

**3. Onboarding, Role, and Subscription Flows**

**3.1 User Signup & Onboarding**
- User visits app and signs up/logs in with Clerk (email).
- **Initial Role Determination & Coach Onboarding:**
    - If a new user signs up directly (not via an organization invite):
        - They are provisionally considered a `coach`.
        - Must subscribe to the "Coach Plan" (via Clerk Billing) to activate coach features.
        - After subscribing, the coach can invite teachers and manage their group directly in the app.
        - Sees coach-specific onboarding tutorial.
- **Teacher Onboarding (via Invite):**
    - Teachers primarily join by accepting an email invitation sent by a coach (see 3.2 Invite Flow).
    - Upon accepting the invite and signing up/logging in, Clerk automatically assigns them to the coach's organization with a `teacher` role within that organization.
    - Sees teacher-specific onboarding tutorial.

**3.2 Invite Flow (Hybrid Approach)**
- **Coach Action:**
    - From their dashboard, coach uses the existing "Add Teacher" UI, providing the teacher's email and any other required local application details.
- **Backend Process (Convex Mutation):**
    1.  The system creates/updates a record for the teacher in the EdCoach AI `teachers` table (local application data).
    2.  The system then programmatically sends an invitation to the provided teacher's email address, linking them to the coach upon acceptance.
- **Teacher Action:**
    - Teacher receives an official invitation email from EdCoach AI to join the coach's group.
    - Teacher clicks the invite link, signs up or logs into EdCoach AI using Clerk.
    - They are automatically linked to the inviting coach in the app database.
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
- The `users` table (for coaches) will store their Clerk user ID and coach profile data.
- The `teachers` table links the local teacher profile to their Clerk `userId` once they accept an invitation and sign up. The primary association to a coach is through a direct coachId field.
- Role-based access enforced in backend, leveraging both local role flags and direct coach-teacher relationships.
- All rubric data loaded from Convex DB.
- Schema details available in `convex/schema.ts`.

---

**6. Application Flow & User Journeys**

**6.1 Coach**
- Signup → Subscribe to "Coach Plan" (if not active) → Onboarding → Dashboard.
- Use "Add Teacher" UI (triggers local record creation & email invite) → Conduct walkthrough for a teacher in their group → Generate/edit AI feedback → Submit.
- View basic analytics, manage their teacher group (view members, potentially re-send invites if needed via Clerk mechanisms or custom UI), manage subscription (via Clerk Account Portal).

**6.2 Teacher**
- Receives email invitation → Clicks link → Signup/Login via Clerk → Automatically joins coach's group → Onboarding → Dashboard.
- View feedback feed. (Defer "download reports" for MVP, focus on viewing).

**6.3 Walkthrough Workflow**
- Coach selects a teacher (from their managed group) → Selects 1 indicator for reinforcement, 1 for refinement → Records evidence → AI feedback generated → Review/edit → Submit.

---

**7. Implementation Timeline & Milestones**

**MVP Essential Tasks (~120-150 hours - adjust as needed for Org integration)**
- **Core AI & Mobile:** OpenAI integration, prompt templates, walkthrough UI, basic analytics display.
- **Onboarding, Role & Group Management:**
    - Coach signup, subscription, and onboarding.
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

---

**10. Appendix: Alternative Non-Organization MVP Approach**

### Alternative 2: A Simpler, Non-Organization Approach for MVP

This detailed overview outlines a more direct path for launching the EdCoach AI MVP by deferring the use of Clerk's organization management features. The focus is on speed and simplicity, allowing for quicker validation of the core product.

#### 1. Core Concept

The fundamental principle of this alternative is to manage the coach-teacher relationship directly within your application's database (Convex) rather than abstracting it into a Clerk Organization for each coach. User roles are determined by a custom field in their Clerk `publicMetadata`, and subscriptions are tied directly to the individual coach's user account.

---

#### 2. User Signup, Roles, and Onboarding

**2.1. User Signup & Initial Role Assignment**

*   **Unified Signup:** All users, whether they will become a coach or a teacher, use the same standard Clerk signup flow.
*   **Default Role:** Upon signing up directly (not through an invite), a new user has a `publicMetadata` field in their Clerk user object set to `{ "role": "provisional_coach" }`. This is a temporary status.
*   **Teacher Identification:** A user who signs up after clicking an invitation link will have their role updated to "teacher" post-signup, as detailed in the invite flow below.

**2.2. Coach Onboarding**

1.  A new user with the `provisional_coach` role is prompted to subscribe to the "Coach Plan."
2.  Access to all coaching features (e.g., creating walkthroughs, viewing analytics) is gated and requires an active subscription.
3.  Upon successful subscription, their `publicMetadata` is updated to `{ "role": "coach" }`.
4.  They are then guided through the coach-specific onboarding tutorial.

**2.3. Teacher Onboarding**

1.  A teacher's journey begins by receiving an invitation email (see invite flow below).
2.  After clicking the invite link, they complete the standard Clerk signup.
3.  The system identifies them as an invited user and sets their `publicMetadata` to `{ "role": "teacher" }`.
4.  They are immediately associated with the inviting coach in the Convex database.
5.  They are then shown the teacher-specific onboarding tutorial.

---

#### 3. Subscription and Billing Flow

This model uses Clerk's B2C (Business-to-Consumer) billing, which is simpler than their B2B organization-based billing.

*   **Individual Subscriptions:** The "Coach Plan" is a subscription tied directly to the individual coach's user account.
*   **Clerk Billing Integration:**
    *   You will use Clerk's pre-built billing components to create a pricing page and allow coaches to subscribe.
    *   Clerk handles the integration with Stripe, including the checkout process and managing the subscription lifecycle (renewals, cancellations).
*   **Access Control:**
    *   Your application will use Clerk's `has()` helper function to check for the "coach" role and an active subscription before granting access to paid features. For example: `if (user.publicMetadata.role === 'coach' && user.subscription.status === 'active') { ... }`

---

#### 4. Coach-Teacher Relationship & Invite Flow

This is the most significant departure from the original PRD.

*   **"Add Teacher" UI:** The coach enters the teacher's email address into a form in the EdCoach AI application.

*   **Backend Process (Convex Mutation):**
    1.  An `invitations` table in your Convex database stores a record with the inviting coach's `userId`, the invited teacher's email, and a unique invitation token.
    2.  Your backend triggers an email service (e.g., SendGrid, Resend) to send a custom-branded invitation email to the teacher. This email will contain a unique link to your application, including the invitation token (e.g., `https://edcoach.ai/invite?token=UNIQUE_TOKEN`).
    3. Use the Convex Resend Component (`https://github.com/get-convex/resend`)

*   **Teacher Acceptance:**
    1.  The teacher clicks the link in the email.
    2.  Your application's frontend reads the `token` from the URL.
    3.  The teacher signs up or logs in using Clerk.
    4.  After successful authentication, a Convex function is called with the `token`. This function verifies the token, retrieves the inviting coach's ID, and creates the formal link between the coach and the new teacher in your database.
    5.  The new user's `publicMetadata` is set to `{ "role": "teacher" }`.

---

#### 5. Database Structure (Convex)

Your schema would be simplified as follows, with no need to store a `clerkOrganizationId`.

*   **`users` (Represents Coaches):**
    *   `_id` (Convex document ID)
    *   `clerkUserId` (string, unique)
    *   `name` (string)
    *   `email` (string)
    *   *(Other coach-specific data)*

*   **`teachers` (Represents Teachers):**
    *   `_id` (Convex document ID)
    *   `clerkUserId` (string, unique, nullable until they sign up)
    *   `name` (string)
    *   `email` (string, unique)
    *   `coachId` (string, links to the `users` table's `clerkUserId`)
    *   *(Other teacher-specific data)*

*   **`invitations`:**
    *   `_id` (Convex document ID)
    *   `coachId` (string, links to the `users` table's `clerkUserId`)
    *   `teacherEmail` (string)
    *   `token` (string, unique)
    *   `status` (string: "pending", "accepted")
    *   `expiresAt` (timestamp)

*   **`walkthroughs`, `feedback`, etc.:** These tables would remain largely the same, linking back to `coachId` and `teacherId`.

This structure simplifies the relationship to a direct link within your database, which is easier to manage for the MVP.

---

#### 6. Pros and Cons

**Pros:**

*   **Maximum Simplicity and Speed:** This approach has fewer moving parts, reducing development and testing time. It directly addresses the core user needs for the MVP without the overhead of organization management.
*   **Reduced Complexity:** You avoid the complexities of managing Clerk Organizations, their lifecycle, and the potential for orphaned organizations if a coach churns.
*   **Lower Initial Cost:** While Clerk's pricing is based on Monthly Active Users (MAUs), simplifying the architecture can reduce development costs.
*   **Focused on Core Value:** It allows the development team to concentrate on the AI feedback generation and the core user experience, which are the primary value propositions of EdCoach AI.

**Cons:**

*   **Scalability for Teams:** This model does not naturally scale to a scenario where a school wants a single subscription for multiple coaches. Each coach is an independent, billable user.
*   **Future Migration Required:** As the platform grows to serve schools and districts, you will need to migrate to a multi-tenant model using something like Clerk Organizations. This will involve a data migration script to move from the simple `coachId` link to organization memberships.
*   **Ownership Transfer is Manual:** If a coach leaves a school, transferring their "seat" (and their group of teachers) to a new coach would require manual intervention in the database.