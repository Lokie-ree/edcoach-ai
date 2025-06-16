# EdCoach AI: MVP Simplification Refinements

**Date:** [Insert Date Here]
**Status:** Approved / Proposed (Choose one)
**Authors:** [Your Name/Team]

## 1. Purpose & Guiding Principle

This document outlines key refinements to the EdCoach AI MVP scope, based on an analysis of the initial product specifications (`PRODUCT.md`, `SUBSCRIPTION_TIERS.md`, `AUTO_ROLE_ONBOARDING.md`, `CLERK_BILLING_INTEGRATION.md`). The goal of these refinements is to:

*   **Accelerate Time-to-Market:** Launch a valuable core product faster.
*   **Reduce Initial Complexity:** Minimize development effort and potential points of failure.
*   **Focus on Core Value:** Deliver the essential user experience for coaches and teachers.
*   **Enable Faster Learning:** Gather user feedback on the core offering before expanding.

**Overarching MVP Principle:** *What is the absolute minimum needed for a coach to conduct a walkthrough, get AI-generated, rubric-aligned feedback, and for a teacher to see that feedback, with the coach successfully subscribing to and paying for the service?*

## 2. Approved MVP Simplifications

The following simplifications will be adopted for the MVP:

### 2.1. Drastically Simplified Subscription Model

*   **Current Complexity (as per `SUBSCRIPTION_TIERS.md` and `PRODUCT.md`):**
    *   Multiple tiers planned: "Coach Starter (Free)," "Coach Basic," "Coach Pro."
    *   Different AI generation limits, analytics levels, and features per tier.
    *   Trial period for the free tier.
*   **MVP Simplification:**
    *   **Offer ONE Paid Plan:** Name TBD (e.g., "EdCoach Pro Plan" or simply "Coach Plan").
    *   **Single, Clear Limits:** This plan will have a single, clearly defined limit for AI feedback generations per month (e.g., 100-150) and a limit on the number of managed teachers (e.g., up to 5-15).
    *   **No Free Tier:** To reduce complexity in feature flagging, UI variations, and user management.
    *   **Optional Time-Limited Trial:** Implement a 14-day or 30-day trial *of the single paid plan*. This leverages Clerk Billing's trial capabilities and ensures all users on trial experience the full feature set.
*   **Rationale:**
    *   Massively reduces development effort for feature gating, complex upgrade/downgrade logic, and managing different user states associated with multiple free/paid tiers.
    *   Simplifies the value proposition for initial users.
    *   Allows for focused feedback on a single, comprehensive offering.
*   **Action Items:**
    *   Update `SUBSCRIPTION_TIERS.md`: Reflect one paid plan with its features, limits, and pricing. Detail the trial mechanism.
    *   Update `PRODUCT.md` (Section 3.3): Align with the single paid plan and trial model.
    *   Configure Clerk Billing: Set up one primary product/plan with an optional trial period.

### 2.2. Simplified Analytics

*   **Current Complexity (as per `SUBSCRIPTION_TIERS.md`):**
    *   Mentions "Basic Trend View," "Enhanced Analytics," and "Advanced Analytics (group trends, comparisons)."
*   **MVP Simplification:**
    *   **Coach Dashboard:** Focus on the coach's *own* activity. Display:
        *   Number of walkthroughs conducted.
        *   Volume of feedback provided.
        *   Basic trends for indicators *they have selected* across *their own* walkthroughs.
    *   **Teacher Dashboard:** Focus on receiving feedback. Display:
        *   A clear list/feed of their received feedback.
    *   **Defer:** All "group trends," "comparisons" between teachers/coaches, and any other advanced cross-sectional analytics.
*   **Rationale:**
    *   Advanced analytics are complex and time-consuming to design, implement, and test.
    *   The core value for MVP is the feedback loop, not deep data analysis. Basic usage statistics are sufficient.
*   **Action Items:**
    *   Update `PRODUCT.md` (Section 1 - Product Overview, Section 6.1 - Coach Journey, Section 8 - Success Metrics): Reflect the simplified scope of analytics.
    *   Update `SUBSCRIPTION_TIERS.md`: Ensure analytics features for the single plan are basic and clearly defined.
    *   Design UI: Focus on simple, clear presentation of the core metrics.

### 2.3. Reinforce Streamlined Onboarding & Role Assignment

*   **Current State:**
    *   `AUTO_ROLE_ONBOARDING.md`: Describes an excellent simplified flow with automatic role assignment based on email lookup in the `teachers` table.
    *   `PRODUCT.md` (Section 3.1): Still mentions manual role selection ("Selects role: `coach` or `teacher`").
*   **MVP Simplification (Reinforcement):**
    *   **Prioritize Auto-Role Assignment:** The flow described in `AUTO_ROLE_ONBOARDING.md` will be the primary (ideally sole) onboarding path.
        *   If a user's email is NOT found in the `teachers` table, they are assigned the `coach` role and directed to the subscription flow.
        *   If a user's email IS found in the `teachers` table (due to a coach's invitation), they are assigned the `teacher` role and automatically linked to their inviting coach.
*   **Rationale:**
    *   Removes a step and potential confusion for users.
    *   Aligns with the "low-burden" product goal.
    *   Reduces frontend and backend logic for handling manual selection.
*   **Action Items:**
    *   Update `PRODUCT.md` (Section 3.1): Remove manual role selection. Clearly state that role assignment is automatic based on the logic in `AUTO_ROLE_ONBOARDING.md`.
    *   Ensure backend (`completeSimplifiedOnboarding` function) and frontend onboarding components strictly follow this auto-assignment logic.

### 2.4. Defer Non-Essential Micro-Features within Core Loop

*   **Walkthrough Workflow (`PRODUCT.md` 6.3):** The current flow ("Coach selects teacher → Selects 1 indicator for reinforcement, 1 for refinement → Records evidence → AI feedback generated → Review/edit → Submit") is core and remains.
*   **AI Feedback System / Prompt Template:** Keep these as simple as possible for MVP. The current focus on rubric-alignment is good. Avoid adding excessive configurability to AI generation initially.
*   **Reporting (`PRODUCT.md` 6.2):**
    *   "Download reports" for teachers will be simplified to "View feedback" directly on the platform.
    *   Actual file downloads or comprehensive export features are deferred post-MVP (aligns with "Post-MVP (Deferred)" in `PRODUCT.md` Section 7).
*   **Rationale:**
    *   Maintains focus on making the core walkthrough and feedback generation process smooth, reliable, and valuable.
    *   Reduces scope by deferring features that are "nice-to-have" but not critical for the initial feedback loop.
*   **Action Items:**
    *   Ensure `PRODUCT.md` (Section 6.2 - Teacher Journey, Section 7 - Implementation Timeline) consistently reflects the deferral of file exports/advanced reporting.
    *   Development focus should be on the reliability and usability of the core AI feedback generation and viewing.

### 2.5. Maintain Strict "No Org/District" Scope for MVP

*   **Current State (`PRODUCT.md` Section 1 & 5):** "Coach-managed teacher groups (no org/district for MVP)." Teachers are associated directly with their inviting coach.
*   **MVP Simplification (Confirmation):**
    *   This boundary will be strictly maintained. A coach *only* sees and manages teachers they have personally invited.
    *   There will be no higher-level organizational structures, administrative roles beyond "Coach," or data aggregation/visibility across different coaches for the MVP.
    *   This aligns with the B2C subscription model for individual coaches outlined in `CLERK_BILLING_INTEGRATION.MD`.
*   **Rationale:**
    *   Organizational structures, multi-tenancy, and complex permissions add significant development and testing overhead.
    *   The B2C model is simpler to implement for MVP.
*   **Action Items:**
    *   No changes to documents needed, but development and testing must strictly adhere to this individual coach scope.

## 3. Summary of Benefits from Simplification

*   **Reduced Development Time & Cost:** Less complex logic for subscriptions, analytics, and feature variations.
*   **Faster Path to Launch & User Feedback:** Enables quicker validation of the core product idea.
*   **Simplified User Experience:** Fewer choices and a clearer value proposition for early adopters.
*   **Lower Initial Maintenance Burden:** Less code and fewer systems to manage.
*   **Clearer Iteration Path:** Allows for focused improvements based on feedback on the core offering before layering on additional complexity.

## 4. Next Steps

1.  **Team Review & Approval:** Ensure all team members understand and agree with these simplifications.
2.  **Update Referenced Documents:** Implement the "Action Items" listed above to ensure all project documentation is consistent.
3.  **Adjust Development Backlog:** Prioritize tasks according to this refined MVP scope.
4.  **Communicate Changes:** If necessary, inform any stakeholders of these scope adjustments.

---