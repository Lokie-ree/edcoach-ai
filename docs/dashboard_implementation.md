Excellent. A firm decision on architecture is the foundation for rapid progress. With this clarity, we can now generate the definitive, step-by-step plan for Cursor AI to execute.

This plan incorporates our final architectural decision: a unified dashboard layout for all authenticated routes. It's designed to be a clear, sequential guide, moving from foundational structure to UI implementation to live data integration.

---

### **Implementation Plan: The EdCoachAI Unified Dashboard**

**Primary Goal:** To refactor the application to use a single, consistent dashboard layout based on the ShadCN template for all authenticated routes, and to implement the new insightful, role-specific dashboard pages.

---

### **Stage 1: Foundational Layout & Unified Routing**

**Objective:** Establish the core architectural shell that all authenticated pages will share.

**Sub-step 1.1: Restructure Routes into a `(dashboard)` Group**
*   **Task**: Create a new directory `app/(dashboard)`. Move all existing top-level authenticated route folders (`analytics`, `billing`, `dashboard`, `my-progress`, `my-walkthroughs`, `teachers`, `walkthrough`) into this new `(dashboard)` directory.
*   **Rationale**: This uses Next.js Route Groups to apply a single layout to all nested routes without affecting the URL structure.
*   **Files to Move**: All feature folders currently in `/app`.

**Sub-step 1.2: Implement the Main Dashboard Layout**
*   **Task**: Create the shared layout file that will govern the entire authenticated experience.
*   **Implementation**:
    *   This layout will be based on the ShadCN template, containing the main flex container, the sidebar structure, and the header structure.
    *   It will fetch the current user's role to pass to the navigation components.
*   **File to Create**: `app/(dashboard)/layout.tsx`

**Sub-step 1.3: Create Role-Based Navigation Components**
*   **Task**: Build the navigation components that will be conditionally rendered by the main layout.
*   **Implementation**:
    *   **`<SidebarNav />`**: A component that accepts the `userRole` and renders either `<CoachNavItems />` or `<TeacherNavItems />`.
    *   **`<CoachNavItems />`**: The list of links and icons for the coach, including the `<UsageStats />` component at the bottom.
    *   **`<TeacherNavItems />`**: The simpler list of links and icons for the teacher.
*   **Files to Create**:
    *   `components/layout/SidebarNav.tsx`
    *   `components/layout/CoachNavItems.tsx`
    *   `components/layout/TeacherNavItems.tsx`
    *   `components/dashboard/UsageStats.tsx`

---

### **Stage 2: Static UI Implementation (The Showcase)**

**Objective:** Build the new dashboard pages visually using static, hardcoded data to perfect the UI/UX before connecting the backend.

**Sub-step 2.1: Create the Mock Data File**
*   **Task**: Create a single source of truth for all static data needed for this stage.
*   **Implementation**:
    *   Create a file that exports a `mockData` object containing nested objects for `coachDashboardData` and `teacherDashboardData`. Use the JSON structure we previously defined.
*   **File to Create**: `app/(dashboard)/mock-data.ts`

**Sub-step 2.2: Implement the Insightful Coach Dashboard Page**
*   **Task**: Build the main dashboard page content for the coach.
*   **File to Modify**: `app/(dashboard)/dashboard/page.tsx`
*   **Implementation**:
    1.  Import `coachDashboardData` from the mock data file.
    2.  Implement the 2-column grid layout.
    3.  Use the mock data to populate your existing UI components (`<KpiCard>`, `<PrioritiesPanel>`, `<RecentActivityFeed>`).

**Sub-step 2.3: Implement the Actionable Teacher Dashboard Page**
*   **Task**: Build the main dashboard page content for the teacher. This will become their PGP hub.
*   **File to Create/Modify**: `app/(dashboard)/my-pgp/page.tsx`
*   **Implementation**:
    1.  Import `teacherDashboardData` from the mock data file.
    2.  Implement the single-column "Growth Journal" layout.
    3.  Render your UI components in sequence, populating them with the mock data: `<PgpGoalCard>`, `<RefinementFocusCard>`, `<ReflectionPromptCard>`, `<WalkthroughTimeline>`.

---

### **Stage 3: Live Data Integration**

**Objective:** Replace the static mock data with live, real-time data from your Convex backend, bringing the dashboards to life.

**Sub-step 3.1: Enhance Backend Analytics Queries**
*   **Task**: Ensure your Convex analytics functions provide all the necessary data for the new dashboards, including the "PGP Progress Trend."
*   **File to Modify**: `convex/analytics.ts`
*   **Implementation**:
    1.  Verify or implement the `getMyPgpData` query. It must fetch the teacher's goal, their last 5 walkthroughs, associated reflections, and calculate the `pgpProgress` trend ("Needs Support", "Engaged", or "Stable").
    2.  Verify or implement the `getCoachAnalytics` query. It must efficiently calculate the data for the KPI cards and the "Priorities Panel" (walkthroughs due, reflections to review).

**Sub-step 3.2: Connect the Coach Dashboard to Convex**
*   **Task**: Wire up the coach's dashboard page to the live backend.
*   **File to Modify**: `app/(dashboard)/dashboard/page.tsx`
*   **Implementation**:
    1.  Remove the mock data import.
    2.  Call the `useQuery(api.analytics.getCoachAnalytics)` hook.
    3.  Implement loading states (e.g., render skeleton versions of the cards) while the query is running.
    4.  Pass the live data from the hook to your dashboard widgets.

**Sub-step 3.3: Connect the Teacher Dashboard to Convex**
*   **Task**: Wire up the teacher's PGP dashboard page to the live backend.
*   **File to Modify**: `app/(dashboard)/my-pgp/page.tsx`
*   **Implementation**:
    1.  Remove the mock data import.
    2.  Call the `useQuery(api.analytics.getMyPgpData)` hook.
    3.  Implement loading and empty states.
    4.  Pass the live data from the hook to your dashboard components.

This plan provides a complete, logical sequence to achieve your goal. By following these stages, you will systematically build a professional, consistent, and insightful user experience across your entire application.