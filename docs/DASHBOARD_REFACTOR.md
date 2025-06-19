Here's a high-level refactoring plan for both dashboards, aiming for better separation of concerns and integration with Clerk Organizations:

**Overarching Goals of the Refactor:**

1.  **Modularization:** Break down the monolithic `DashboardPage` into smaller, role-specific components and potentially feature-specific components.
2.  **Clerk Organization Integration:**
    *   Coaches manage teachers via Clerk Organization membership.
    *   Data fetching for coaches is scoped by their `organization.id`.
3.  **Clear Data Flow:** Make it easier to understand where data is fetched and how it's passed to display components.
4.  **Improved Readability & Maintainability.**

---

**High-Level Refactoring Plan**

**Phase 1: Setup & Core Logic Separation**

1.  **Create Role-Specific Dashboard Layouts/Pages:**
    *   Instead of one `DashboardPage` that conditionally renders, consider having distinct entry points or wrapper components.
    *   **Option A (Separate Page Files):**
        *   `app/(authenticated)/dashboard/coach/page.tsx`
        *   `app/(authenticated)/dashboard/teacher/page.tsx`
        *   A top-level `app/(authenticated)/dashboard/page.tsx` could do the role check and redirect, or your `useAuthRedirect` hook might handle this.
    *   **Option B (Conditional Rendering in a Wrapper):**
        *   Keep `app/(authenticated)/dashboard/page.tsx` but have it immediately render `<CoachDashboardPageContent />` or `<TeacherDashboardPageContent />` based on role. This is closer to what you have but the content components will be fully separate.

2.  **Centralize Auth & Basic User/Org Info:**
    *   The main `page.tsx` (or a layout component for `/dashboard`) will handle:
        *   `useUser()`, `useOrganization()` (if applicable at this level, or passed down).
        *   `useAuthRedirect()` for loading and auth state.
        *   Fetching the `convexUser` record to determine `role`.
    *   This basic info (`user`, `convexUser`, `organization`) will then be passed as props to the role-specific dashboard components.

**Phase 2: Coach Dashboard Refactor (`CoachDashboardPageContent.tsx`)**

*   **Component Structure (Conceptual):**
    ```
    <CoachDashboardPageContent user={...} convexUser={...} organization={...}>
      <PageHeader title="Coach Dashboard" description="..." rightContent={<CoachDashboardHeaderStats />} />
      
      <QuickActionsPanel organization={organization} /> 
          {/* Handles: Invite Teacher (Clerk Org), Link to Full Org Mngm, New Walkthrough, Link to Billing */}

      <TeacherStatusOverview organizationId={organization.id} /> 
          {/* Fetches teachers via orgId, displays status cards */}
          {/* This will replace direct fetching of 'teachers' in the main component */}

      <RecentFeedbackHighlights organizationId={organization.id} />
          {/* Fetches entries scoped by orgId */}

      {/* <TopIndicators organizationId={organization.id} /> (If kept for MVP) */}
      {/* <DraftsList organizationId={organization.id} /> (If kept for MVP) */}
    </CoachDashboardPageContent>
    ```

*   **Data Fetching Strategy for Coach Dashboard:**
    *   The `CoachDashboardPageContent` component might still fetch some top-level data if needed by multiple children (e.g., a list of all walkthroughs for the org if `RecentFeedbackHighlights` and `TeacherStatusOverview` both need it in different forms).
    *   **Crucially, child components like `TeacherStatusOverview` and `RecentFeedbackHighlights` will become responsible for fetching their own specific data, scoped by `organization.id`.**
        *   `TeacherStatusOverview`:
            *   `useQuery(api.users.getOrgMembers, { organizationId })` (New Convex function to get users who are members of the org, potentially fetching their `name` from your `users` table if not relying solely on Clerk's user object).
            *   `useQuery(api.walkthroughs.listByOrg, { organizationId })` to get walkthroughs for status calculation.
        *   `RecentFeedbackHighlights`:
            *   `useQuery(api.walkthroughEntries.listByOrg, { organizationId })`.
    *   **`QuickActionsPanel`:**
        *   Will use `useOrganization()` hook directly for actions like `organization.inviteMember()`.
        *   May not need much Convex data fetching itself, mostly performing Clerk actions or linking.

*   **Key Changes from Current Implementation:**
    *   **Teacher Listing:** Instead of `useQuery(api.teachers.list, { clerkOrganizationId })`, the `TeacherStatusOverview` will fetch members from the Clerk organization. You'll need a Convex function like `api.users.getOrgMembers` that can take an `organizationId` and return relevant user details (Clerk ID, name, email) for those members. Your existing `teachers` table might then be queried using these Clerk IDs if it stores additional app-specific teacher info.
    *   **"Manage Organization" Button:** The `isCoach` check (`user?.organizationMemberships?.some((m) => m.role === "org:admin")`) is good. The link to `/org` implies you'll build out an organization management page (likely using Clerk's SDK/components for custom styling as discussed).
    *   **Data Scoping:** All data queries (`walkthroughs`, `walkthroughEntries`) will consistently use `clerkOrganizationId`.

**Phase 3: Teacher Dashboard Refactor (`TeacherDashboardPageContent.tsx`)**

*   **Component Structure (Conceptual):**
    ```
    <TeacherDashboardPageContent user={...} convexUser={...} teacherRecord={...}>
      <PageHeader title="Teacher Dashboard" description="..." />
      
      <RecentWalkthroughsList teacherId={teacherRecord._id} />
          {/* Fetches and displays recent walkthroughs for this teacher */}

      {/* <MyProgressCards teacherId={teacherRecord._id} /> (If kept for MVP) */}
    </TeacherDashboardPageContent>
    ```

*   **Data Fetching Strategy for Teacher Dashboard:**
    *   The `TeacherDashboardPageContent` will receive `teacherRecord` (fetched in the parent based on `user.id` and `convexUser.role`).
    *   The `RecentWalkthroughsList` component will be responsible for fetching its own data:
        *   `useQuery(api.walkthroughs.listByTeacher, { teacherId: props.teacherId })`.
    *   This is already somewhat modular in your current `TeacherDashboard` component, but we're making it a more explicit child component.

*   **Key Changes from Current Implementation:**
    *   The existing `TeacherDashboard` component is already quite focused. The main change is to extract its content into `TeacherDashboardPageContent` and ensure its data dependencies (`walkthroughs`, `teacherRecord`) are clearly passed as props or fetched within its specific child components (like `RecentWalkthroughsList`).
    *   The `useQuery(api.users.getUserById, ...)` to get coach info seems like it might not be directly needed on the teacher dashboard for MVP if the focus is just on their walkthroughs. If it is, it can remain within the `TeacherDashboardPageContent` or a specific component that needs it.

**Phase 4: Create New Reusable Components**

*   Based on the breakdown, identify components that can be reused or are now self-contained:
    *   `PageHeader` (you already have this).
    *   `QuickActionsPanel` (Coach).
    *   `TeacherStatusOverviewCard` (Individual card for the coach's overview).
    *   `RecentFeedbackHighlightItem` (Individual feedback item).
    *   `WalkthroughListItem` (For teacher's list).
    *   `GridDistortion` (already a separate component).
    *   Loading states (`Skeleton` components for each new data-heavy component).

**Phase 5: Convex API Adjustments**

*   **New/Modified Convex Functions:**
    *   `api.users.getOrgMembers({ organizationId })`: To get a list of users (teachers) belonging to a coach's organization. This might involve querying your `users` table based on Clerk IDs fetched via Clerk Backend API for an organization's members, or directly if you sync org membership to Convex.
    *   Ensure all `listByOrg` functions (`walkthroughs.listByOrg`, `walkthroughEntries.listByOrg`) are robust and correctly use the `clerkOrganizationId`.
    *   Review if `api.teachers.list` is still needed in its current form or if teacher data is primarily accessed via `getOrgMembers` and then looking up details in your `users` or a simplified `teachers` table.
    *   Your `api.teachers.getByUserClerkId` is good for fetching the teacher's own record.

**Step-by-Step Refactoring (High Level):**

1.  **Skeleton First:** Create the new file structure (`CoachDashboardPageContent.tsx`, `TeacherDashboardPageContent.tsx`, and placeholder files for their child components like `QuickActionsPanel.tsx`, `TeacherStatusOverview.tsx`, `RecentWalkthroughsList.tsx`).
2.  **Move Existing Logic:**
    *   Copy the relevant rendering logic from your current `DashboardPage` into `CoachDashboardPageContent` and `TeacherDashboardPageContent`.
    *   Initially, pass down all necessary data as props from the main `page.tsx` (which still does all the `useQuery` calls).
3.  **Refactor Data Fetching (Iteratively):**
    *   **Coach Dashboard:**
        *   Start with `TeacherStatusOverview`. Modify it to take `organizationId` as a prop and fetch its own data (`getOrgMembers`, `walkthroughs.listByOrg`). Update `CoachDashboardPageContent` to pass the `organizationId`. Remove the corresponding `useQuery` calls from the main `page.tsx` if no longer needed there.
        *   Do the same for `RecentFeedbackHighlights`.
        *   Build/Refactor `QuickActionsPanel` to use `useOrganization()` for Clerk actions.
    *   **Teacher Dashboard:**
        *   Move the `walkthroughs` fetching logic into `RecentWalkthroughsList`, passing `teacherId`.
4.  **Create New Convex Functions:** Implement `api.users.getOrgMembers` and any other new backend functions needed.
5.  **Testing:** Test each dashboard thoroughly after each significant change.

This plan aims to break the large task into manageable pieces. The key is to shift data fetching responsibilities closer to the components that actually use the data, and to use the `organization.id` as the primary key for scoping data on the coach's side. This will naturally lead to a more modular and maintainable codebase.