

**1. Clerk Organizations (<code>https://clerk.com/docs/organizations/overview</code>)**

*   **What it is for EdCoach AI:** This is the **foundational building block** for your "coach-managed teacher groups." Each coach who subscribes will essentially become the admin/owner of their own Clerk Organization. Teachers they invite will become members of that specific organization.
*   **How it Simplifies:**
    *   **Team Structure:** Clerk handles the logic of creating a distinct "space" or "team" (the Organization) for each coach.
    *   **Membership Management:** Clerk manages who belongs to which organization.
    *   **Invitations:** Clerk provides the mechanism (SDK functions, and optionally UI components) to invite users (teachers) to an organization and handles the email sending and acceptance flow.
    *   **Roles within Organizations:** You can define roles (e.g., 'admin' for the coach, 'member' or a custom 'teacher' role for teachers) within each organization. Clerk enforces these.
*   **Your Responsibilities (Simplified):**
    *   **Programmatic Creation:** When a coach successfully subscribes, your backend (Convex mutation triggered by a Clerk Billing webhook) will call `clerk.organizations.createOrganization()` to create their dedicated "team" and assign them as admin.
    *   **Triggering Invites:** Your "Add Teacher" UI in the coach's dashboard will trigger a Convex mutation that calls `clerk.organizations.createOrganizationInvitation()`.
    *   **Data Scoping:** Your Convex queries will use the `organizationMemberships` from Clerk (or the `clerkOrganizationId` stored on your local user/teacher records) to ensure users only see data relevant to their organization.
*   **Weighing Options:** This is **not optional** for your described B2B SaaS model. It's the core of how you'll separate one coach's team and data from another. The simplification comes from Clerk handling the underlying mechanics of what an "organization" or "team" is.

**2. Clerk Account Portal (<code>https://clerk.com/docs/account-portal/overview</code>)**

*   **What it is for EdCoach AI:** This is a **pre-built, Clerk-hosted UI** where your users (both coaches and teachers) can manage their own:
    *   Profile information (name, email, profile picture - synced from Clerk).
    *   Security settings (password, MFA, connected accounts, active devices).
    *   **Crucially for Coaches: Subscriptions (if using Clerk Billing).** They can view their current plan, cancel, update payment methods, and view invoice history.
*   **How it Simplifies:**
    *   **HUGE UI Savings:** You don't have to build any of the UI for profile management, security settings, or subscription self-service. This is a massive time saver.
    *   **Maintained by Clerk:** Security best practices, updates, and new features for these areas are handled by Clerk.
    *   **Seamless with Clerk Billing:** If a coach wants to cancel or change their payment method, they do it here, and Clerk Billing webhooks will inform your backend.
*   **Your Responsibilities (Simplified):**
    *   **Linking to it:** Provide a link in your application (e.g., in the user dropdown, often via Clerk's `<UserProfile />` component which has a "Manage Account" link that goes here).
    *   **Ensuring Clerk Billing is configured:** So the "Subscription" section appears for subscribed coaches.
*   **Weighing Options:** For subscription management and standard user self-service (profile, security), this is a **massive win for simplification.** You absolutely want to leverage this for coaches to manage their subscriptions. Teachers can also use it for their profile/security.

**3. Custom Onboarding Flow (Clerk's Recipe: <code>https://clerk.com/docs/references/nextjs/add-onboarding-flow</code>)**

*   **What it is for EdCoach AI:** This is **NOT a pre-built UI from Clerk for *your specific application onboarding*.** Instead, it's a Clerk **documentation recipe/pattern** showing how you can use Clerk's user object (specifically `publicMetadata` or `unsafeMetadata`) and Next.js routing/middleware to guide users through *your application's unique* multi-step onboarding process *after* they have completed Clerk's initial sign-up.
*   **How it Simplifies (the *pattern*, not a Clerk UI feature):**
    *   **State Management:** Provides a way to track an onboarding step (e.g., `onboardingStep: 'awaiting_subscription'` or `onboardingComplete: false`) on the Clerk user object.
    *   **Conditional Redirects:** Shows how to use Next.js middleware or client-side logic to redirect users to the appropriate onboarding step based on this metadata.
*   **Your Responsibilities (You build this UI, Clerk helps with state):**
    *   **Coach Onboarding:**
        1.  User signs up via Clerk.
        2.  Your app checks if they are a new user (e.g., `user.publicMetadata.onboardingComplete !== true`).
        3.  If new coach, you redirect them to *your custom-built* "Welcome Coach! Please subscribe to activate your account" page. This page will contain your "Subscribe" button that initiates the Clerk Billing checkout.
        4.  Once subscribed and their Clerk Organization is created (via webhook), you might update `user.publicMetadata.onboardingComplete = true` or `user.publicMetadata.coachSetupComplete = true` and redirect them to their dashboard or a "Here's how to add teachers" tutorial page (again, your UI).
    *   **Teacher Onboarding:**
        1.  Teacher accepts invite, signs up/logs in via Clerk.
        2.  Your app sees they are part of an organization and have a 'teacher' role.
        3.  You might redirect them to *your custom-built* "Welcome Teacher! Here's how to view feedback" page/tutorial.
        4.  You could set `user.publicMetadata.teacherOnboardingComplete = true`.
*   **Weighing Options:** You *will* have an application-specific onboarding flow. Clerk's recipe gives you a structured way to manage the state for this flow using Clerk's user metadata. The simplification here is in not having to devise your own state management for "has this user completed step X of our app's onboarding." **You are still building the actual onboarding screens and logic specific to EdCoach AI.**

**How They Fit Together for EdCoach AI (Simplified Flow):**

1.  **New User (Potential Coach) Signs Up:**
    *   Uses Clerk's `<SignUp/>`.
    *   **Your Custom Onboarding Logic (using Clerk metadata for state):**
        *   Your app detects they are new (e.g., `!user.publicMetadata.appOnboardingComplete`).
        *   You redirect them to `/onboarding/subscribe` (your page).
        *   This page says "Welcome! Subscribe to become a coach." It has a button that starts the **Clerk Billing** checkout.
2.  **Coach Subscribes:**
    *   Goes through Clerk Billing checkout.
    *   Webhook fires. Your Convex backend:
        *   Updates your local `users` table (`subscriptionStatus = 'active'`).
        *   Creates a **Clerk Organization** for them, makes them admin. Stores `clerkOrganizationId` on your local user.
        *   Optionally, updates `user.publicMetadata.appOnboardingComplete = true` (or a more specific flag) via Clerk backend SDK.
    *   User is redirected to their coach dashboard.
3.  **Coach Invites Teacher:**
    *   From your UI, coach adds teacher email.
    *   Your Convex backend calls `clerk.organizations.createOrganizationInvitation()` for their **Clerk Organization**.
4.  **Teacher Accepts Invite:**
    *   Clicks email link, uses Clerk's `<SignUp/>` or `<SignIn/>`.
    *   Clerk automatically adds them to the coach's **Clerk Organization** with the specified role.
    *   **Your Custom Onboarding Logic (for teachers):**
        *   Your app detects new teacher in an org.
        *   Redirects to `/onboarding/teacher-welcome` (your page) for a brief tutorial.
        *   Update `user.publicMetadata.teacherWelcomeComplete = true`.
5.  **Ongoing Management:**
    *   **Coach:** Manages their subscription (cancel, update payment) via a link to the **Clerk Account Portal**. Manages teachers (viewing members, re-sending invites if you build UI for it) via your UI, which interacts with their **Clerk Organization**.
    *   **Teacher:** Manages their profile/security via **Clerk Account Portal**. Views feedback in your app, scoped by their **Clerk Organization** membership.

**Recommendations for Simplicity (Focusing on Subscription & Management):**

1.  **Embrace Clerk Organizations Fully:** This IS your team/group management. Don't try to replicate its logic. Use its SDKs to create orgs and send invites programmatically.
2.  **Use Clerk Account Portal for Subscription Self-Service:** This is a huge win. Just link to it. Minimal effort, maximum value for coaches.
3.  **Build Your Thin Application Onboarding Layer:**
    *   For coaches, the main onboarding step *is subscribing*. Guide them to it.
    *   Use Clerk's `publicMetadata` (as shown in their "Custom Onboarding Flow" recipe) to track simple state like `isSubscribed` (though your backend webhook is the source of truth for this, metadata can help the frontend react quickly) or `hasSeenCoachTutorial`.
    *   Your "onboarding UI" will be minimal for the MVP: a page to prompt subscription, then maybe a welcome message or a pointer to "Add Teachers."

By focusing on this, you let Clerk handle:
*   The definition and mechanics of users and organizations.
*   The UI for auth, profile, security, and subscription management.
*   The invite email and acceptance flow.

Your Convex backend becomes the orchestrator (reacting to webhooks, calling Clerk SDKs) and the store for your *application-specific* data, tightly linked to Clerk IDs. Your Next.js frontend provides the *application-specific* UI and onboarding steps, using Clerk's frontend SDKs to understand who the user is and what organization context they are in.

**References to Clerk/Convex Integration**
**<code>https://clerk.com/docs/references/nextjs/add-onboarding-flow</code>)**
**<code>https://docs.convex.dev/auth/clerk#nextjs</code>)**