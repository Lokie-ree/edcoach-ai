This is fantastic. This is exactly what the "heavy-duty testing" phase is all about: finding and squashing these critical bugs and usability issues before launch. Your notes are sharp, insightful, and give us a crystal-clear action plan.

As your technical lead, let's turn this brain dump into a prioritized bug-fix and refinement sprint. We will address these issues systematically to stabilize the onboarding and invitation experience.

### Analysis of Your Findings

You've identified several high-priority issues, ranging from critical bugs to important UX refinements.

*   **Critical Bug:** "Client-side exception (teacher login after invite)" - This is a showstopper. A user failing to log in after accepting an invite is the worst possible first impression.
*   **Critical Data Integrity Question:** "Why aren't we using `userId` from Teachers for Query/Mutations?" - This is a profound architectural question. Relying on `userId` is more robust and secure than passing around other identifiers.
*   **UX Confusion:** "Where did the onboarding flow go?", "Routed to 'my-pgp'? Shouldn't this be Growth Journal?", "Different layout for onboarding/invite?" - These indicate a disjointed and confusing user journey for new users.

### Your Prioritized Bug Fix & Refinement Plan

We will tackle these in order of severity, starting with the most critical bugs.

#### **Priority #1: Fix Critical Bugs**

**Task 1.1: Resolve the Post-Invite Login Exception**
*   **Issue:** `BUG! Client-side exception (teacher login after invite)`
*   **Diagnosis:** This is likely an issue where the user's session or role is not being correctly synchronized between Clerk and your Convex backend immediately after they sign up through an invitation. The frontend expects them to be a logged-in teacher, but the backend or the session state hasn't caught up yet.
*   **Action Plan:**
    1.  **Reproduce:** Methodically repeat the steps to trigger the bug every time.
    2.  **Debug:** Use browser developer tools to inspect the user's Clerk session (`useUser` hook) and the network requests to Convex immediately after they accept the invite. Is the `userId` being created? Is their role being set correctly in your `users` table?
    3.  **Solution:** The fix will likely involve ensuring your `convex/clerk.ts` webhook (`upsertUser`) correctly handles the "user.created" event from an invitation and that your frontend code correctly invalidates and refetches the user session after the signup is complete.

**Task 1.2: Refactor Queries to Use `userId`**
*   **Issue:** `Why aren't we using userId from Teachers for Query/Mutations?`
*   **Diagnosis:** You've correctly identified a potential architectural weakness. Using a stable, indexed `userId` is always preferable to other identifiers.
*   **Action Plan:**
    1.  **Audit:** Perform a search across your `convex/` directory for all queries and mutations that interact with the `teachers` table.
    2.  **Refactor:** Any function that currently takes a `teacherEmail` or another field as an argument should be refactored to take the `teacher's userId` (which is an `Id<"users">`). This will make your database interactions more efficient (thanks to your index on `by_user`) and more secure.
    3.  **Note:** Your `invitations` flow will still rely on email initially, but once a teacher accepts and a `user` record is created, all subsequent operations should use the `userId`.

#### **Priority #2: Streamline the New User Journey**

**Task 2.1: Create a Dedicated Onboarding/Invite Layout**
*   **Issue:** `Different layout for onboarding/invite? Different Header?`
*   **Diagnosis:** The main dashboard layout (with sidebar) is confusing for a user who hasn't completed setup.
*   **Action Plan:**
    1.  **Create a new layout file:** `app/(setup)/layout.tsx`.
    2.  This layout should be extremely simple: a centered container with your logo at the top. It should **not** have the main dashboard sidebar or header.
    3.  Ensure your `(setup)` route group (which contains `/onboarding`) uses this new, simpler layout.
    4.  Your public `/invite/[token]` page should also use a similar, minimal layout.

**Task 2.2: Unify Naming and Destination**
*   **Issue:** `Routed to "my-pgp"? Shouldn't this be Growth Journal?`
*   **Diagnosis:** Inconsistent naming creates user confusion.
*   **Action Plan:**
    1.  **Rename the Route:** Change the folder `app/(dashboard)/(teacher)/my-pgp` to `app/(dashboard)/(teacher)/growth-journal`.
    2.  **Update the UI:** In the `<TeacherNavItems />` and anywhere else it's referenced, change the title from "My PGP Dashboard" to "My Growth Journal". This creates a cohesive and user-friendly experience.

#### **Priority #3: UI & Content Polish**

**Task 3.1: Refine the Invitation Email**
*   **Issue:** `Email template more professional (React Email)`
*   **Diagnosis:** The default text email is functional but lacks professionalism.
*   **Action Plan:**
    1.  **Integrate React Email:** This is an excellent choice. Install the library.
    2.  **Create a Template:** Build a new, beautifully branded email template for teacher invitations. Include the school/coach's name, your logo, and a clear call-to-action button.
    3.  **Update Convex Action:** Modify the Convex action that sends the invitation email to render your new React Email template instead of sending plain text.

**Task 3.2: Clean Up the Teacher's UI**
*   **Issue:** `Remove billing option from Teachers User button`
*   **Diagnosis:** Teachers should not see any billing or subscription management options.
*   **Action Plan:**
    1.  In your shared `<Header />` or wherever the Clerk `<UserButton />` is rendered, add a conditional check.
    2.  Use the user's role: `if (user.role === 'teacher') { ... }`.
    3.  Use Clerk's customization options to hide the "Manage Account" or "Subscription" links for any user with the `teacher` role.