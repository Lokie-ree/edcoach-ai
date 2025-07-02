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
*   **Reduced Complexity:** You avoid the complexities of managing organization structures, their lifecycle, and the potential for orphaned groups if a coach churns.
*   **Lower Initial Cost:** While Clerk's pricing is based on Monthly Active Users (MAUs), simplifying the architecture can reduce development costs.
*   **Focused on Core Value:** It allows the development team to concentrate on the AI feedback generation and the core user experience, which are the primary value propositions of EdCoach AI.

**Cons:**

*   **Scalability for Teams:** This model does not naturally scale to a scenario where a school wants a single subscription for multiple coaches. Each coach is an independent, billable user.
*   **Future Migration Required:** As the platform grows to serve schools and districts, you will need to migrate to a multi-tenant model. This will involve a data migration script to move from the simple `coachId` link to a more complex group or organization structure if needed.
*   **Ownership Transfer is Manual:** If a coach leaves a school, transferring their "seat" (and their group of teachers) to a new coach would require manual intervention in the database.