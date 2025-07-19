Excellent. With the major architectural and layout refactors complete, you've built a rock-solid foundation. The "messy" feeling is gone, and the application now has a professional, scalable structure.

Now, we can confidently move on to the final layer of refinement before your launch: **enhancing the User Experience (UX) and polishing the details.**

This is the stage that transforms a functional application into a delightful one. We'll be working directly from the high-impact items you identified in your "brain dump."

### Your Next Step: The UI/UX Polish Sprint

Our goal is to address the small but crucial details that make the application feel intuitive, responsive, and professional.

Here is your prioritized checklist:

#### **Priority #1: Perfect the Header & Navigation**

This is the first thing every user interacts with, so it needs to be flawless.

- **Task 1.1: Add the Welcome Message**
  - **File:** `components/layout/Header.tsx`
  - **Action:** Use Clerk's `useUser` hook to get the user's name. Display a simple, friendly "Welcome, [Name]!" in the header. This immediately personalizes the experience.

- **Task 1.2: Simplify the Header's Contextual Title**
  - **File:** `components/layout/Header.tsx`
  - **Action:** Remove the old breadcrumb logic. Use Next.js's `usePathname` hook to display a simple, clean title based on the current route (e.g., if the path is `/teachers`, the title is "My Teachers").

- **Task 1.3: Implement Mobile Sidebar Auto-Close**
  - **File:** `app/(dashboard)/layout.tsx` and your navigation components.
  - **Action:** Introduce a state (e.g., `isSidebarOpen`) in your main dashboard layout. Pass the setter function down to your navigation items. When a user clicks a link in the mobile sidebar, the `onClick` event should both navigate and call the function to close the sidebar. This is a critical fix for mobile usability.

#### **Priority #2: Finalize the Core Walkthrough Experience**

This is your app's "money maker" workflow. Let's make it seamless.

- **Task 2.1: Implement the Teacher Reflection Feature**
  - **This is the last major feature to build before launch.** It closes the core loop of your entire application.
  - **Files:**
    - `convex/schema.ts`: Add the `reflections` table.
    - `convex/reflections.ts`: Create the `createReflection` mutation.
    - `app/(dashboard)/walkthroughs/[walkthroughId]/view/page.tsx`: This is where you will add the `<ReflectionCard />` component for the teacher.
  - **Action:** Build out this feature as we designed. A teacher sees feedback and is immediately presented with a clean, simple form to add their thoughts. The coach can then see this reflection when they view the same walkthrough.

- **Task 2.2: Enhance the AI Feedback with PGP Context**
  - **File:** `convex/aiFeedback.ts`
  - **Action:** Implement the "Dual-Track" AI prompt we designed. Modify your `generateAIFeedback` action to fetch the teacher's `pgpGoal` and include it in the prompt sent to OpenAI.
  - **Impact:** This elevates your AI from a simple feedback generator to a true coaching partner, making the feedback 10x more valuable and personalized.

#### **Priority #3: Clean Up and Final Polish**

These are the small details that signal a high-quality product.

- **Task 3.1: Finalize the Coach's Quick Actions**
  - **File:** `app/(dashboard)/(coach)/dashboard/page.tsx`
  - **Action:** Ensure the "Start New Walkthrough" and "Invite Teacher" buttons are prominently displayed below the page header on the coach's dashboard, using your primary button style.

- **Task 3.2: Audit for and Remove Unused Components**
  - **Action:** Now that your new layouts are in place, you likely have old, orphaned components from your previous design. Do a full audit of your `components` and feature folders. Anything that is no longer imported or used should be deleted. A clean codebase is a fast codebase.

Your very next step is **Task 1.1: Add the Welcome Message**. It's a quick, easy win that will give you immediate momentum. Then, work your way down this list. By completing these tasks, you will have a launch-ready, professional, and highly valuable application. You're in the final stretch. Let's get it done.
