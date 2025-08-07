Of course. This is the perfect time to synthesize all our architectural and UI/UX decisions into a single, comprehensive description of the core user journey. This document will serve as the definitive guide for final implementation, testing, and even for creating marketing materials.

It traces the entire "Golden Path" from a coach's first login to a teacher's moment of reflection, detailing exactly what each user sees and does at every step.

---

### **EdCoachAI: The Core User Journey & Dashboard Experience**

#### **The Guiding Philosophy: The Continuous Growth Loop**

The entire EdCoachAI experience is designed to facilitate a continuous, supportive, and data-informed growth loop for educators. It transforms isolated observations into an ongoing professional conversation. This journey consists of five key phases: **Set Goal → Capture Evidence → Generate Feedback → Reflect → Monitor Growth.**

---

### **Phase 1: Setting the Goal (The North Star)**

**The User:** A Coach.
**The Goal:** To establish a clear, year-long Professional Growth Plan (PGP) goal for a teacher, creating the context for all future coaching.

1.  **The Entry Point:** The coach navigates to the "My Teachers" page (`/teachers`) and clicks on a specific teacher.
2.  **The Action:** On the teacher's detail page (`/teachers/[teacherId]`), the coach clicks the prominent **"[Set PGP Goal]"** button.
3.  **The Workflow (The PGP Goal-Setting Wizard):**
    *   **Step 1: Select Indicator:** The coach is presented with a clean, searchable list of all LER indicators. They select the teacher's official refinement area from their previous year's evaluation.
    *   **Step 2: Add Context:** The coach adds specific, actionable strategies and focus points to a text field, creating the teacher's "Action Plan."
    *   **Step 3: AI-Assisted Drafting:** The coach clicks "[Draft with AI]," and the system generates a well-formed SMART goal based on the selected indicator and context notes. The coach reviews, edits if necessary, and saves the final goal.
4.  **The Outcome:** The teacher's detail page now prominently displays their official PGP Goal and Action Plan. This becomes the single source of truth for the entire coaching year.

---

### **Phase 2 & 3: Capturing Evidence & Generating Feedback**

**The User:** A Coach.
**The Goal:** To conduct a quick, informal walkthrough and generate hyper-contextualized, PGP-aware feedback.

1.  **The Entry Point:** From their dashboard or the teacher's detail page, the coach clicks **"[+ New Walkthrough]"**.
2.  **The Workflow (The Walkthrough Form):**
    *   The coach selects the teacher.
    *   They choose one Reinforcement and one Refinement indicator relevant to the observation.
    *   They enter their objective, anecdotal evidence into the `evidenceSummary` field.
    *   They click **"[Generate AI Feedback]"**.
3.  **The Magic Moment (The AI Engine):** In the background, the Convex backend performs the following:
    *   It retrieves the teacher's saved **PGP Goal and Action Plan**.
    *   It retrieves the full rubric language for the selected Reinforcement and Refinement indicators.
    *   It combines this rich context with the coach's evidence.
    *   It sends a single, hyper-contextualized prompt to the OpenAI API.
4.  **The Outcome:** The coach is presented with an editable text box containing the AI-generated feedback, which is already aligned to the rubric, the evidence, and the teacher's long-term goal. The coach makes any final edits and clicks **"[Send Feedback]"**.

---

### **Phase 4: The Reflection (Closing the Loop)**

**The User:** A Teacher.
**The Goal:** To engage with the feedback in a meaningful way and take ownership of their professional growth.

1.  **The Entry Point:** The teacher receives an email notification and logs in. They are taken directly to their **"Growth Journal"** dashboard (`/growth-journal`).
2.  **The Experience:** The page is a single, focused column designed to feel like a supportive journal, not a report card. At the very top is the **`<ReflectionPromptCard />`**.
    *   It displays a snippet of the new feedback from their coach.
    *   It provides a clean, simple `<textarea>` and a "[Save Reflection]" button.
3.  **The Action:** The teacher reads the feedback, considers it in the context of their PGP goal (which is also displayed on the page), and writes their thoughts, questions, or next steps.
4.  **The Outcome:** Upon saving, a toast notification confirms "Reflection Saved." The page updates to show their saved reflection. The loop is now closed.

---

### **Phase 5: Monitoring Growth (The Dashboard Experience)**

This is the ongoing phase where both users can visualize the results of their collaborative work.

#### **The Coach's "Insightful Command Center" (`/dashboard`)**

*   **The Layout:** A clean, 2-column grid.
*   **The Experience:**
    *   **Top KPI Cards:** A quick, 5-second overview of their coaching activity.
    *   **Left Column (Priorities):** The most important part of the page. The **`<PrioritiesPanel />`** tells the coach exactly what to do next:
        *   "Teachers Needing a Walkthrough" (links to the teacher's page).
        *   "New Reflections to Review" (links directly to the walkthrough).
    *   **Right Column (Context):** A `<RecentActivityFeed />` provides a log of recent events.
*   **The Feeling:** The coach feels organized, efficient, and in control. They know exactly where to focus their limited time.

#### **The Teacher's "Personal Growth Journal" (`/growth-journal`)**

*   **The Layout:** A single, focused column that tells a story.
*   **The Experience (The order is critical):**
    1.  **`<PgpGoalCard />` (The Why):** Their annual goal is always at the top, framing the entire experience.
    2.  **`<RefinementFocusCard />` (The What):** An AI-powered insight showing the skill they've been working on most recently (e.g., "Needs Support on Questioning").
    3.  **`<ReflectionPromptCard />` (The Now):** The prompt to reflect on their *latest* piece of feedback.
    4.  **`<WalkthroughTimeline />` (The How Far):** A visual history of all their past walkthroughs and reflections, showing their journey over time.
*   **The Feeling:** The teacher feels supported and empowered. They have a private, safe space to see their progress, understand their current focus, and own their professional development narrative.