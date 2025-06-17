Okay, this is a great step. Adopting Clerk Organizations will streamline several aspects of your MVP. Here's a migration document outlining the conceptual shift and the steps involved.

---

**Migration Document: Adopting Clerk Organizations for EdCoach AI MVP**

**Date:** [Insert Date Here]
**Version:** 1.0
**Status:** Proposed

**1. Introduction & Purpose**

This document outlines the migration from a direct coach-to-teacher invitation system (likely managed via custom database tables and logic) to utilizing Clerk's built-in "Organizations" feature for the EdCoach AI MVP. The primary goal is to leverage Clerk's robust infrastructure for managing user groups (teachers associated with a coach), invitations, and roles, thereby simplifying development and aligning with the "up to 5 teachers per org" model mentioned in `SUBSCRIPTION_TIERS.md`.

Each "Coach" user will effectively become the owner/admin of their own Clerk Organization, to which they will invite "Teacher" users as members.

**2. Current State (Pre-Migration Summary)**

*   **User Roles:** `coach`, `teacher`.
*   **Onboarding (`AUTO_ROLE_ONBOARDING.md`):**
    *   New user signs up.
    *   Email is checked against a `teachers` table.
    *   If found, user is `teacher` and linked to `coachId` from the `teachers` table.
    *   If not found, user is `coach`.
*   **Teacher Invitation (`PRODUCT.md`):**
    *   Coach invites teachers one at a time by email.
    *   This likely involves creating a record in the `teachers` table with the teacher's email and the inviting `coachId`.
*   **Data Model (Convex - inferred):**
    *   `users` table (stores both coaches and teachers).
    *   `teachers` table (stores teacher-specific info, including `email` and `coachId` to link to the inviting coach).
*   **Subscription:** Coaches subscribe; teachers do not.

**3. Target State (Post-Migration with Clerk Organizations)**

*   **User Roles (Clerk Level):**
    *   Users sign up to EdCoach AI.
    *   A `coach` user will create and own a Clerk Organization (e.g., "[Coach's Name]'s Team").
    *   Within their Organization, the Coach will have an `admin` (or custom "coach") role.
    *   `teacher` users will be invited by a Coach to join *their* Organization and will have a `member` (or custom "teacher") role within that specific Organization.
*   **Onboarding & Invitation:**
    *   **Coach Signup:**
        1.  User signs up.
        2.  System identifies them as a potential coach (e.g., new user not coming via an org invite).
        3.  Coach subscribes (as per existing plan).
        4.  Post-subscription, coach creates their Clerk Organization (can be a simple form or automated). The `organizationId` is associated with the coach user in Convex.
    *   **Teacher Invitation & Signup:**
        1.  Coach, from their dashboard, invites a teacher to their Organization using Clerk's invitation system.
        2.  Teacher receives an email invite from Clerk.
        3.  Teacher clicks invite link, signs up/logs in via Clerk.
        4.  Clerk automatically adds them to the Coach's Organization with the designated member role.
        5.  Your Convex backend, on user creation/update via webhook or session check, identifies the user as a teacher based on their Organization membership and role.
*   **Data Model (Convex - revised):**
    *   `users` table: Stores all users. For coaches, it might store their `clerkOrganizationId` (the ID of the organization they own/administer).
    *   `teachers` table: This table's role may change.
        *   **Option A (Simplified):** It might become redundant for storing the coach-teacher relationship, as Clerk Organizations now manage this. You would rely on Clerk session data (`session.orgId`, `session.orgRole`) for checks. App-specific teacher data (not stored in Clerk user profiles) could still reside here, linked by `userId`.
        *   **Option B (Supplemental):** It could still store teacher-specific application data, linked by `userId`. The `coachId` field would be deprecated.
    *   The primary source of truth for "who belongs to which coach's group" becomes Clerk Organizations.
*   **Subscription:** Still tied to the individual Coach user. Their subscription status gates their ability to create/manage an Organization and invite members.

**4. Key Migration Steps & Development Tasks**

**Phase 1: Clerk Configuration & Backend Adjustments**

1.  **Enable Organizations in Clerk Dashboard:**
    *   Navigate to your Clerk application settings and enable Organizations.
    *   Define Organization roles (e.g., `org_admin_coach`, `org_member_teacher`). Keep it simple for MVP.
2.  **Modify Coach Onboarding Logic (Backend - Convex):**
    *   Update the `completeSimplifiedOnboarding` mutation (or create a new flow for coaches).
    *   After a new user is identified as a coach and successfully subscribes:
        *   Programmatically create a Clerk Organization for this coach using the Clerk Backend API. (Alternatively, direct them to a page with a Clerk component to create it).
        *   Store the returned `organizationId` in the coach's record in your Convex `users` table.
3.  **Modify Teacher Identification Logic (Backend - Convex):**
    *   When a user signs up or logs in, check their Clerk session/identity:
        *   If `auth.orgId` and `auth.orgRole` (or `auth.orgPermissions`) indicate they are a member of an organization with a "teacher" role, identify them as a teacher.
        *   The `AUTO_ROLE_ONBOARDING.md` logic of checking email against a `teachers` table for initial role assignment will be superseded by the Clerk Organization invitation flow for teachers.
4.  **Update Convex Schema:**
    *   `users` table: Add optional `clerkOrganizationId: v.string()` (for coaches who own an org).
    *   `teachers` table: Re-evaluate its necessity. If kept for app-specific data, remove `coachId`. Ensure it's linked via `userId`.
5.  **Permissions & Data Access Logic (Backend - Convex):**
    *   All backend functions that deal with teacher data, walkthroughs, feedback, etc., must be updated to check permissions based on Clerk Organization membership.
    *   A coach should only be able to access/manage data related to teachers who are members of *their* specific `clerkOrganizationId`.
    *   A teacher should only be able to see their own data within the context of the organization they belong to.

**Phase 2: Frontend Adjustments**

1.  **Coach Dashboard - Organization Management:**
    *   Provide UI for coaches to invite teachers to their Organization. Leverage Clerk's `<OrganizationProfile />` (for managing members, invites) or build a custom flow using Clerk's APIs/hooks (`useOrganization`, `organization.inviteMember()`).
    *   Display the coach's teachers based on membership in their Clerk Organization.
2.  **Teacher Onboarding Experience:**
    *   Teachers will now primarily onboard via an invitation link. The UI should welcome them and confirm their association with the inviting coach's group/organization.
3.  **Remove Old Invite Flows:** Decommission any custom UI/logic for the previous email-based invite system.

**Phase 3: Testing & Documentation**

1.  **End-to-End Testing:**
    *   Coach signup → Subscription → Organization creation.
    *   Coach invites teacher.
    *   Teacher accepts invite → Signs up → Is correctly associated with the coach's org.
    *   Data visibility: Coach sees only their teachers; teacher sees only their feedback.
    *   Role enforcement.
2.  **Update All Relevant Documentation:**
    *   `PRODUCT.md`: Reflect Organization-based teacher management.
    *   `AUTO_ROLE_ONBOARDING.md`: This document will need significant revision or replacement to describe the new Organization-based flow for teachers and the modified coach flow.
    *   `CLERK_BILLING_INTEGRATION.md`: Ensure it still aligns (B2C user subscription for coaches is compatible with them owning an org).
    *   Any technical diagrams or schema definitions.

**5. Impact on Existing Features/Data**

*   **`AUTO_ROLE_ONBOARDING.md`:** The described flow will fundamentally change. Email lookup for role assignment will be less central for teachers.
*   **Teacher Data:** If you have existing teacher data linked via `coachId`, you'll need a strategy if this were a live system (not applicable for a fresh MVP, but good to note). For MVP, you start fresh with the new model.
*   **Invite Flow:** The custom invite flow is replaced by Clerk's.

**6. Data Migration (Not applicable for a new MVP, but for future reference)**

If this were a live system with existing users:
*   A script would be needed to create Clerk Organizations for existing coaches.
*   Existing teachers would need to be programmatically invited to and associated with their respective coach's new Clerk Organization.

**7. Risks & Mitigation**

*   **Complexity:** Introducing Organizations adds a layer, but Clerk handles much of it. Mitigation: Keep the MVP implementation simple (one org per coach, basic roles).
*   **Learning Curve:** Team needs to understand Clerk Organizations API/concepts. Mitigation: Utilize Clerk's documentation and examples.

**8. Conclusion**

Migrating to Clerk Organizations for MVP offers significant benefits in terms of leveraging pre-built, robust functionality for user grouping and invitations. This will simplify development of these aspects, allowing the team to focus on the core EdCoach AI features, and aligns with the planned subscription model leveraging Clerk's B2B free tier for org members.

---

This document should provide a solid starting point for planning and executing the migration. Remember to adapt it as you delve into the specifics of your implementation.

# Clerk Organizations Migration Checklist

## 1. Clerk Dashboard & Configuration

- [ ] Enable Organizations in Clerk dashboard
- [ ] Define Organization Roles (e.g., `org_admin_coach`, `org_member_teacher`)
- [ ] Configure invitation settings (customize invite emails, etc.)
- [ ] Review Clerk's Organization API & documentation

---

## 2. Convex Schema & Data Model Updates

- [ ] Update `users` table:
  - [ ] Add optional `clerkOrganizationId: v.string()` field for coaches
- [ ] Refactor or remove `teachers` table:
  - [ ] If keeping, remove `coachId` field
  - [ ] Ensure it's linked by `userId` only
  - [ ] Migrate any teacher-specific app data as needed
- [ ] Audit all other tables for references to the old coach-teacher relationship

---

## 3. Backend (Convex) Logic Refactor

- [ ] Coach onboarding:
  - [ ] After signup and subscription, create a Clerk Organization for the coach (via API or UI)
  - [ ] Store the returned `organizationId` in the coach's Convex user record
- [ ] Teacher identification:
  - [ ] On user login/signup, check Clerk session for `orgId` and `orgRole`
  - [ ] Assign teacher/coach roles in your app based on Clerk org membership/role
- [ ] Permissions & access control:
  - [ ] Update all queries/mutations to check Clerk org membership and role
  - [ ] Ensure coaches can only access data for teachers in their org
  - [ ] Ensure teachers can only access their own data within their org
- [ ] Remove old invite/role assignment logic:
  - [ ] Delete or refactor any code that checks the `teachers` table for onboarding/role assignment
  - [ ] Remove custom invite logic

---

## 4. Frontend Refactor

- [ ] Coach dashboard:
  - [ ] Integrate Clerk's `<OrganizationProfile />` or custom org management UI
  - [ ] Add UI for inviting teachers via Clerk (using Clerk's invite flow)
  - [ ] Display teachers based on Clerk org membership
- [ ] Teacher onboarding:
  - [ ] Update onboarding to welcome teachers via Clerk invite link
  - [ ] Confirm org association in UI
- [ ] Remove old flows:
  - [ ] Remove any custom invite/role assignment UI
  - [ ] Remove any UI that references the old `coachId` relationship

---

## 5. Testing

- [ ] Unit test new backend logic for org/role checks
- [ ] End-to-end test the following flows:
  - [ ] Coach signup → Subscription → Organization creation
  - [ ] Coach invites teacher
  - [ ] Teacher accepts invite → Signs up → Is associated with correct org
  - [ ] Data visibility: Coach sees only their teachers; teacher sees only their own data
  - [ ] Role enforcement: Only coaches can invite/manage teachers
- [ ] Test error cases (e.g., invalid invites, role mismatches, orgless users)

---

## 6. Documentation & Cleanup

- [ ] Update technical docs:
  - [ ] `PRODUCT.md` to reflect org-based management
  - [ ] `AUTO_ROLE_ONBOARDING.md` to describe new onboarding
  - [ ] Any diagrams or schema docs
- [ ] Remove/archive old docs that reference the pre-migration system
- [ ] Document any migration scripts (if needed for existing data)

---

## 7. (Optional) Data Migration

- [ ] If you have existing data:
  - [ ] Write a script to create Clerk Organizations for existing coaches
  - [ ] Invite existing teachers to the correct orgs
  - [ ] Migrate any teacher-specific data to new structure

---

## 8. Go-Live & Monitoring

- [ ] Deploy new system to staging
- [ ] Monitor onboarding/invite flows for issues
- [ ] Gather feedback from test users
- [ ] Deploy to production

---