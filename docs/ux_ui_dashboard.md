Of course. It's the perfect time to pull up the design blueprint as you prepare to implement the new backend logic. Having the UI/UX document handy ensures that the data you're preparing in Convex will map directly to the beautiful, insightful components you're about to build.

Here is the `UI_UX_doc.md` we drafted. It provides the core principles, design system, and specific wireframes for the "Insightful" and "Actionable" dashboards.

---

# UI/UX Documentation for EdCoachAI v2.1

**Purpose**: This document establishes the design principles, user experience standards, and component guidelines for the EdCoachAI platform. Its primary goal is to solve the "busy dashboard" problem by creating a user interface that is **clear, actionable, and insightful**, directly supporting our core "Continuous Growth Loop" vision.

---

### 1. Core Design Philosophy: Clarity Over Clutter

Every UI decision must be filtered through this primary principle. We are moving from a platform that simply *displays data* to one that *surfaces insights*.

*   **Action-Oriented Design**: Every element on the screen, especially on a dashboard, should help a user answer the question, **"What should I do next?"** If a component doesn't guide the user toward a meaningful action, it's clutter.
*   **Strong Visual Hierarchy**: We will use size, color, and whitespace to guide the user's eye to the most important information first. Not all data is created equal.
*   **Progressive Disclosure**: Show the most critical information upfront. Provide clear, intuitive ways for users to "click in" for more details. A user should never be overwhelmed by data they didn't ask for.
*   **Consistency is Key**: A user should never have to guess what an icon means or how a component works. Patterns must be reused consistently across the application.

---

### 2. Design System Specifications

This formalizes our visual language, building upon the excellent foundation of `shadcn/ui` and `Tailwind CSS`.

*   **Color Palette**:
    *   **Primary (Action)**: `Blue` - Used for primary buttons, active links, and key calls-to-action. (e.g., `bg-blue-600`, `text-blue-500`)
    *   **Secondary (Context)**: `Slate/Gray` - Used for backgrounds, card borders, and secondary text. Provides a neutral canvas. (e.g., `bg-slate-100`, `border-slate-200`, `text-slate-500`)
    *   **Accent (Highlight)**: `Purple` - Used sparingly for highlights, such as on the active PGP goal or a new feature announcement. (e.g., `bg-purple-500`, `ring-purple-300`)
    *   **Semantic Colors**:
        *   `Green` (Success): For positive trends (`Engaged`), completed tasks.
        *   `Yellow` (Warning): For items needing attention (`Needs Support`), upcoming deadlines.
        *   `Gray` (Neutral): For neutral trends (`Stable`).

*   **Typography (using Inter font)**:
    *   **Page Headers (`<h1>`)**: `font-bold text-2xl` or `text-3xl`.
    *   **Card/Widget Titles (`<h2>`)**: `font-semibold text-lg`.
    *   **Body Text (`<p>`)**: `text-base text-slate-700`.
    *   **Secondary/Muted Text**: `text-sm text-slate-500`.

*   **Layout & Spacing**:
    *   **Grid System**: We will use Tailwind's 4px grid system (`p-4`, `gap-6`, etc.) for all spacing to ensure mathematical consistency.
    *   **Content Wrapper**: All main page content will be wrapped in the existing `<MaxWidthWrapper />` component to maintain a consistent, readable width on larger screens.

*   **Iconography**:
    *   We will standardize on **Lucide React** for all icons. It's the default for `shadcn/ui` and offers a comprehensive, clean, and consistent set.

---

### 3. Component Library & Usage

This section defines how we use our components to build the UI.

*   **Base UI (`/components/ui`)**: This folder is reserved for the raw, un-styled primitives from `shadcn/ui`. We do not add custom application logic here.
*   **Shared Components (`/components/shared`)**: This is for composed components used across multiple, unrelated features.
    *   **NEW: `<InsightCard />`**: This will be our most important shared component for building dashboards. It standardizes the "Progressive Disclosure" principle.
        *   **Structure**: It's a `Card` component with a clear `<CardHeader>` (title, optional icon) and `<CardContent>`.
        *   **Function**: It displays summary information by default and can include a `<CardFooter>` with a "View Details" link to navigate to a more detailed page.

---

### 4. Key User Flows & Page Layouts

This is the practical application of our principles to solve the "busy dashboard" problem.

#### **Flow 1: The Insightful Coach Dashboard**

*   **User Goal**: "In 30 seconds, I need to know who needs my help and what my team is struggling with."
*   **Layout**: A 2-column grid is ideal. The left column is for high-priority actions, and the right is for secondary information.

**Wireframe (`/app/(dashboard)/dashboard/page.tsx` for a Coach):**

```
[ <PageHeader title="Coach Dashboard" subtitle="Welcome back, Coach Smith!"> ]
[ <QuickActionsPanel> // Big, clear buttons: [Start New Walkthrough] [View All Teachers] ]

-------------------------------------------------------------------------------------
| LEFT COLUMN (Primary Focus)                               | RIGHT COLUMN (Secondary Info)        |
|-----------------------------------------------------------|--------------------------------------|
| [ <InsightCard title="Action Priorities"> ]               | [ <InsightCard title="My Usage"> ]   |
|   - **Needs a Walkthrough:**                              |   - Walkthroughs: [ 12 / 50 ]        |
|     - Jane Doe (21 days ago) [Go >]                       |   - Teachers: [ 8 / 15 ]             |
|     - John Appleseed (18 days ago) [Go >]                 |   - [Upgrade to Pro]                 |
|   - **Reflections to Review:**                            |                                      |
|     - Sarah Connor (on 'Questioning') [View >]            | [ <InsightCard title="Recent Activity"> ] |
|                                                           |   - Walkthrough for J. Doe [View]    |
| [ <InsightCard title="Top Team Growth Areas"> ]           |   - Invite accepted by S. Connor     |
|   1. Questioning (QU) - Seen in 8 walkthroughs            |   - ...                              |
|   2. Academic Feedback (FEED) - Seen in 5 walkthroughs    |                                      |
|   3. Pacing (LS) - Seen in 2 walkthroughs                 |                                      |
|   [Plan a PLC Meeting >]                                  |                                      |
-------------------------------------------------------------------------------------
```

#### **Flow 2: The Actionable Teacher Dashboard**

*   **User Goal**: "How did my last lesson go, what should I work on next, and am I making progress?"
*   **Layout**: A single, focused column. The teacher's experience should feel like a guided journal, not a control panel.

**Wireframe (`/app/(dashboard)/my-pgp/page.tsx` for a Teacher):**

```
[ <PageHeader title="My Growth Dashboard" subtitle="Your journey of continuous improvement."> ]

-------------------------------------------------------------------------------------
| [ <InsightCard title="My Next Step: Reflection on Your Last Walkthrough"> ]      |
|   - **Date:** July 2, 2025                                                      |
|   - **Coach's Feedback:** "Great use of wait time... To get to a deeper         |
|     level next time, try using more follow-up questions..." [View Full Report >] |
|   - **<ReflectionForm />** // The new feature from Stage 2                      |
|     [ What did you notice? What will you try next? ] [ Save Reflection ]         |
-------------------------------------------------------------------------------------

[ <InsightCard title="My Growth Story: Walkthrough Timeline"> ]
|   - [ July 2: Pacing ] --- [ June 25: Questioning ] --- [ June 18: Feedback ]   |
|   (Each point is clickable to view the report)                                 |
-------------------------------------------------------------------------------------

[ <InsightCard title="My Current PGP Goal"> ]
|   - **Goal:** To improve my questioning techniques by asking more analysis-level |
|     questions.                                                                 |
|   - **Trend:** Engaged ✅                                                     |
-------------------------------------------------------------------------------------
```