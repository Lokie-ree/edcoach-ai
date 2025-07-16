# Implementation Plan for EdCoachAI v2.1: The Continuous Growth Loop

## 1. Feature Analysis

### Identified Features:

The focus of this implementation phase is to evolve the EdCoachAI MVP from a static feedback tool into a dynamic professional growth platform.

*   **Teacher Reflection System**: Allows teachers to document their thoughts and next steps in response to feedback, closing the core coaching loop.
*   **Actionable Teacher Dashboard**: Redesigns the teacher's home base to visualize their growth journey over time, making progress tangible.
*   **Insightful Coach Dashboard**: Redesigns the coach's home base to provide immediate, actionable priorities regarding their caseload and team-wide growth areas.

### Feature Categorization:

Based on our strategic pivot, the priorities are crystal clear.

*   **Must-Have Features:**
    *   Teacher Reflection System (US-012)
    *   Actionable Teacher Dashboard (Revised US-009)
    *   Insightful Coach Dashboard (Revised US-008)
*   **Should-Have Features:**
    *   Refined Architectural Structure (Colocation of components)
*   **Nice-to-Have Features:**
    *   Full `UI_UX_doc.md` (to be developed iteratively)
    *   Comprehensive E2E testing (beyond core flows)

---

## 2. Recommended Tech Stack

*This section documents our existing, validated stack.*

### Frontend:

*   **Framework**: Next.js (App Router) - Justification: Provides a robust full-stack framework with file-system-based routing, server-side rendering for marketing pages, and secure API routes for backend logic.
    *   **Documentation**: [Next.js Documentation](https://nextjs.org/docs)
*   **UI Library**: shadcn/ui on top of Radix UI & Tailwind CSS - Justification: Offers a highly composable, accessible set of unstyled components that we can own and customize, ensuring design consistency and development velocity.
    *   **Documentation**: [shadcn/ui Documentation](https://ui.shadcn.com/)

### Backend:

*   **Framework**: Convex - Justification: Provides a real-time database with integrated serverless functions (queries, mutations, actions), eliminating the need for a separate backend server and simplifying state management through its `useQuery` hook.
    *   **Documentation**: [Convex Documentation](https://docs.convex.dev/)

### Additional Tools:

*   **Authentication**: Clerk - Justification: A managed authentication service that handles user management, roles, and subscription logic, abstracting away massive security and infrastructure complexity.
    *   **Documentation**: [Clerk Documentation](https://clerk.com/docs)
*   **AI**: OpenAI API (GPT-4.1 Mini) - Justification: Provides powerful language models for our core AI feedback generation feature, accessed securely via Convex actions.
    *   **Documentation**: [OpenAI API Documentation](https://platform.openai.com/docs/introduction)

---

## 3. Implementation Stages

### Stage 1: Architectural Refinement & Foundation
*   **Duration**: ~2-3 days
*   **Dependencies**: None. This stage unblocks all future work and improves velocity.
*   **Required Resources**: Solo Developer
#### Sub-steps:
- [x] Create `components` directories within the relevant `/app` feature folders (e.g., `app/(dashboard)/teachers/components`).
- [x] Relocate feature-specific components (`walkthrough-form`, `teacher-invitation-form`, marketing `sections`) to their new colocated homes.
- [x] Update all import paths to reflect the new structure.
- [x] Create a root `/hooks` directory and move `lib/usePlanDetection.ts` into it.
- [x] Verify the application builds and all existing functionality works as expected after the refactor.

### Stage 2: Core Feature - The Closed Loop
*   **Duration**: ~1 Week
*   **Dependencies**: Stage 1 completion.
*   **Required Resources**: Solo Developer
#### Sub-steps:
- [x] **Backend**: Add the `reflections` table to `convex/schema.ts` with appropriate fields and indexes.
- [x] **Backend**: Create the `createReflection` and `updateReflection` mutations in a new `convex/reflections.ts` file.
- [x] **Backend**: Update `analytics` or `walkthroughs` queries to optionally join reflection data for the coach's view.
- [x] **Frontend**: Create a new, reusable `<ReflectionCard />` component that includes a form for submitting reflections.
- [x] **Frontend**: Integrate the `<ReflectionCard />` into the teacher's walkthrough detail view (`/app/(dashboard)/walkthrough/[walkthroughId]/view/`).
- [x] **Frontend**: Update the coach's view of the same page to display the teacher's submitted reflection.
- [x] **Testing**: Manually test the end-to-end reflection flow: teacher adds reflection -> coach can view it.

### Stage 3: The Insightful Dashboards
*   **Duration**: ~1.5 Weeks
*   **Dependencies**: Stage 2 completion.
*   **Required Resources**: Solo Developer
#### Sub-steps:
- [ ] **Backend**: Enhance the `getTeacherAnalytics` query in `convex/analytics.ts` to compute a simple progress trend for their PGP goal.
- [ ] **Frontend**: Redesign the Teacher Dashboard (`/app/(dashboard)/dashboard/`) to feature the "My Growth Story" timeline as its centerpiece.
- [ ] **Backend**: Enhance the `getCoachAnalytics` query to efficiently calculate the "Needs a Walkthrough" list and "Top 3 Team Growth Areas".
- [ ] **Frontend**: Redesign the Coach Dashboard to include the new "Priorities" panel with its two actionable widgets.
- [ ] **Testing**: Verify that the dashboard data is accurate and updates in real-time as new walkthroughs and reflections are added.

### Stage 4: Polish & Optimization
*   **Duration**: ~3-4 days
*   **Dependencies**: Stage 3 completion.
*   **Required Resources**: Solo Developer
#### Sub-steps:
- [ ] Add loading skeletons and empty states to the new dashboard widgets.
- [ ] Implement robust error handling for all new backend mutations and queries.
- [ ] Conduct comprehensive user flow testing for the new "Reflection -> Dashboard Insight" loop.
- [ ] Write end-to-end tests (e.g., using Playwright or Cypress) for the core reflection workflow.
- [ ] Review and prepare all new features for the upcoming launch.

---

### A Final Thought on Your Documentation Process

This plan is now your `Implementation.md`. As you proceed, you can create the other documents:

*   **`project_structure.md`**: Should be created *after* you complete Stage 1. It will be a formal record of the excellent colocated architecture you've established.
*   **`Bug_tracking.md` (or GitHub Issues)**: I strongly recommend using **GitHub Issues** instead of a markdown file for this. It's designed for bug tracking with labels, assignees, and status updates. It's more powerful and a standard industry practice.
*   **`UI_UX_doc.md`**: Treat this as a "living document." Start it with the basics from your PRD (color palette, typography) and add to it incrementally as you build and standardize new components.

