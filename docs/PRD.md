# **EdCoachAI: Product Requirements Document v3.0 (Launch Version)**

**Version**: 3.0  
**Status**: Launch Candidate  
**Target Launch**: July 28th, 2025

## 1. Product Vision & Strategy

### 1.1. Mission

To transform instructional coaching by making frequent, high-quality, and personalized feedback an integral part of every teacher's professional growth journey.

### 1.2. The Problem

Instructional coaching is essential but often inefficient. Coaches spend hours writing reports, feedback can feel disconnected from a teacher's long-term goals, and teachers lack a clear way to track and reflect on their progress between formal evaluations.

### 1.3. The Solution

EdCoachAI is an AI-powered coaching partner. It streamlines the informal walkthrough process and creates a **Continuous Growth Loop** by:

1.  **Capturing** evidence quickly.
2.  Generating **hyper-contextualized AI feedback** that is uniquely tied to the teacher's official Professional Growth Plan (PGP).
3.  Enabling a two-way dialogue through a **Teacher Reflection** system.
4.  Visualizing progress on **insightful, role-specific dashboards**.

## 2. User Roles & Tiered Feature Access

This section defines the core user personas and the specific features they can access at each subscription level. Feature gating must be strictly enforced based on these tiers.

| Feature                                | Free Trial                 | Coach Starter ($19/mo)           | Coach Pro ($49/mo)             |
| -------------------------------------- | -------------------------- | -------------------------------- | ------------------------------ |
| **Teacher Management**                 | 2 Teachers                 | 15 Teachers                      | 50 Teachers                    |
| **Walkthroughs**                       | 4 (Total Lifetime)         | 50 / month                       | Unlimited                      |
| **AI Feedback Generation**             | Basic                      | **PGP-Aware & Contextualized**   | PGP-Aware & Contextualized     |
| **PGP Goal-Setting Wizard**            | ❌ No                      | ✅ Yes                           | ✅ Yes                         |
| **Teacher Reflection Loop**            | ❌ No (Read-only feedback) | ✅ Yes (Full two-way dialogue)   | ✅ Yes (Full two-way dialogue) |
| **Coach Dashboard**                    | Basic Log View             | ✅ **Insightful Command Center** | ✅ Insightful Command Center   |
| **Teacher Dashboard**                  | Shows Last Report Only     | ✅ **Personal Growth Journal**   | ✅ Personal Growth Journal     |
| **Team Analytics (Heat Maps, Trends)** | ❌ No                      | ❌ No                            | ✅ Yes                         |
| **Bulk Teacher Invites**               | ❌ No                      | ❌ No                            | ✅ Yes                         |
| **Export to PDF**                      | ❌ No                      | ❌ No                            | ✅ Yes                         |
| **Data Retention**                     | 7 Days                     | 90 Days                          | 3 Years                        |

## 3. The Core User Journey: The Continuous Growth Loop

This is the central workflow of the application and must be tested end-to-end.

1.  **Setup (One-Time):** The Coach uses the **PGP Goal-Setting Wizard** to establish a teacher's annual PGP goal, selecting the official refinement indicator from the previous year and adding contextual action plan notes.
2.  **Capture:** The Coach conducts a quick, informal walkthrough, selecting reinforcement/refinement indicators and capturing evidence.
3.  **Analyze (AI):** The Coach triggers the AI. The backend fetches the teacher's PGP goal and action plan, combines it with the walkthrough data and rubric, and generates **hyper-contextualized feedback**.
4.  **Refine (Coach):** The Coach reviews, edits if necessary, and sends the feedback to the teacher.
5.  **Reflect (Teacher):** The Teacher receives the feedback on their "Growth Journal" dashboard and is prompted to submit a **reflection**, closing the loop.
6.  **Monitor:** Both the Coach and Teacher see the completed interaction (feedback + reflection) on their respective dashboards, contributing to the teacher's "Growth Story" timeline and the coach's "Priorities Panel".

## 4. Feature Specifications & User Stories

### 4.1. PGP Management (Starter Tier)

- **US-PGP-01: PGP Goal-Setting Wizard**
  - **As a coach**, I want a guided workflow to set a teacher's annual PGP goal by selecting their official refinement indicator and adding action plan notes, so that all future AI feedback is intelligently aligned.
  - **Acceptance Criteria:**
    - The workflow is accessible from the teacher detail page (`/teachers/[teacherId]`).
    - It includes steps for selecting an LER indicator, adding context, and using an AI-assist to draft the final goal.
    - The final goal object (text, indicatorCode, contextNotes) is saved to the `teachers` table.

### 4.2. Walkthrough System (All Tiers)

- **US-WT-01: PGP-Aware AI Feedback**
  - **As a coach**, I want the AI to automatically use the teacher's PGP goal and action plan as context when generating feedback, so the feedback is deeply personalized and relevant.
  - **Acceptance Criteria:**
    - The `generateAIFeedback` Convex action fetches the teacher's `pgpGoal` object.
    - The OpenAI prompt includes the PGP goal, action plan notes, and walkthrough data.
    - The generated feedback explicitly references the PGP goal.
    - This enhanced context is only applied for **Starter Tier** and above. Free Trial users get the basic, non-PGP-aware feedback.

### 4.3. Reflection System (Starter Tier)

- **US-REF-01: Teacher Reflection**
  - **As a teacher**, I want to be able to write and save my reflections on the feedback I receive, so I can process the coaching and document my growth.
  - **Acceptance Criteria:**
    - A reflection form is present on the walkthrough view page for Starter/Pro tier teachers.
    - Submitting the form saves the reflection to the new `reflections` table in Convex.
    - The coach can view the submitted reflection on the same page.
    - This feature is disabled for Free Trial users.

### 4.4. Dashboards (Tiered Implementation)

- **US-DASH-01: Insightful Coach Dashboard (Starter Tier)**
  - **As a coach**, I need a dashboard that shows me my key metrics and instantly tells me which teachers need my attention, so I can prioritize my time effectively.
  - **Acceptance Criteria:**
    - The layout is a 2-column grid.
    - It includes KPI Cards, a "Priorities Panel" (Walkthroughs Due, Reflections to Review), and a Recent Activity feed.
    - All data is live from Convex.

- **US-DASH-02: Actionable Teacher Dashboard (Starter Tier)**
  - **As a teacher**, I need a single, focused dashboard that shows my PGP goal, my recent feedback and reflection, and my growth over time, so I feel empowered and motivated.
  - **Acceptance Criteria:**
    - The layout is a single, focused column.
    - It displays the PGP Goal, the Current "Sprint" Focus, the Reflection Prompt, and the "Growth Story" Timeline.
    - All data is live from Convex.

- **US-DASH-03: Advanced Analytics (Pro Tier)**
  - **As a coach on the Pro plan**, I want to see team-wide analytics like an LER indicator heat map and trend reports, so I can make strategic decisions about group professional development.
  - **Acceptance Criteria:**
    - A new `/analytics` page is accessible to Pro users.
    - It contains the Heat Map and Trend Chart components.
    - The page is gated and shows an upgrade prompt for Starter/Free users.

## 5. Technical Architecture & Schema

- **Stack**: Next.js 15 (App Router), Convex, Clerk, OpenAI, Tailwind CSS.
- **Core Schema Additions**:

  ```typescript
  // convex/schema.ts
  teachers: defineTable({
    // ... existing fields
    pgpGoal: v.optional(v.object({
      text: v.string(),
      indicatorCode: v.string(),
      contextNotes: v.optional(v.string()),
      setAt: v.number(),
    })),
  }),

  reflections: defineTable({
    walkthroughId: v.id("walkthroughs"),
    teacherId: v.id("users"),
    coachId: v.id("users"),
    text: v.string(),
    createdAt: v.number(),
  }).index("by_walkthrough", ["walkthroughId"]),
  ```

## 6. Launch Readiness & Testing Priorities

### 6.1. Definition of "Done" for Launch

The application is ready to launch when all **Free Trial** and **Coach Starter** features are implemented, stable, and have passed testing. The **Coach Pro** features must be properly gated with a clear upgrade path.

### 6.2. Critical Testing Flows

1.  **The Golden Path:**
    - Coach signs up (lands on Starter plan).
    - Coach invites a Teacher.
    - Teacher accepts and onboards.
    - Coach sets the Teacher's PGP goal using the wizard.
    - Coach completes a walkthrough for the Teacher.
    - Verify the AI feedback is PGP-aware.
    - Teacher receives feedback and submits a reflection.
    - Verify both dashboards update correctly with the new data and trends.
2.  **Feature Gating and Subscription Logic:**
    - Sign up as a Free Trial user. Confirm all Starter/Pro features (PGP Goal Setting, Reflection, Insightful Dashboards) are disabled or show upgrade prompts.
    - As a Starter user, confirm Pro features (Analytics page, Bulk Invite, PDF Export) are gated.
    - Test the upgrade flow from Starter to Pro via the Clerk Billing Portal. Verify Pro features are unlocked after a successful upgrade.
