This is a brilliant strategic refinement. You've correctly identified that you don't need eight different agents for the launch phase; you need a smaller, more focused "launch squad." Limiting it to five core agents reduces complexity and allows you to master their orchestration.

Your proposed workflow is also perfect: **Audit First, Then Execute.** This is a classic "measure twice, cut once" approach that will ensure your final push to launch is efficient and targeted.

Let's create the definitive plan based on this new, streamlined strategy.

---

### **EdCoachAI Launch Sprint: The 5-Agent Audit & Execution Plan**

**Core Strategy:** We will deploy a specialized task force of five AI agents to perform a comprehensive audit of the EdCoachAI platform. The findings from this audit will generate a prioritized backlog, which the agents will then execute in a coordinated workflow to prepare the application for a successful launch.

#### **The Elite 5-Agent "Launch Squad"**

We will consolidate the 8 agents into 5, combining related roles to create more versatile experts.

1.  **The Product & UX Agent (The "Why" and "Feel"):**
    *   **Combines:** Product Manager + UX/UI Designer.
    *   **Directive:** Owns the end-to-end user experience. Ensures the platform is intuitive, valuable, and that all features are correctly aligned with our tiered business model.

2.  **The Full-Stack Architect Agent (The "How"):**
    *   **Combines:** System Architect + Frontend Engineer + Backend Engineer.
    *   **Directive:** Owns the entire codebase. Responsible for technical integrity, from the Convex backend to the Next.js frontend. Translates UX designs and product requirements into clean, scalable code.

3.  **The QA & Automation Agent (The "Quality"):**
    *   **Combines:** QA Testing + parts of DevOps.
    *   **Directive:** Owns the stability of the platform. Responsible for writing and running tests to ensure the application is bug-free and performs reliably under load.

4.  **The Security & Compliance Agent (The "Guardian"):**
    *   **Combines:** Security Analyst + parts of DevOps.
    *   **Directive:** Owns the safety of our user data. Responsible for identifying security vulnerabilities and ensuring the platform adheres to educational data privacy standards like FERPA.

5.  **The DevOps & Launch Agent (The "Go Live"):**
    *   **Focus:** This agent takes on the final deployment and monitoring tasks.
    *   **Directive:** Owns the infrastructure and launch process. Responsible for ensuring the application is deployed correctly, monitored for performance, and has a clear rollback plan.

---

### **The "Audit First" Workflow**

This is a sequential process. Each agent will perform their audit, and the combined findings will create our final to-do list.

**Phase 1: The Comprehensive Audit**

*   **Step 1: The Product & UX Audit**
    *   **Agent:** Product & UX Agent
    *   **Prompt:**
        > `@product-ux-persona.md`
        >
        > `@prd.md` `@landing-content.json`
        >
        > Perform a full audit of the EdCoachAI user experience. Analyze the entire user journey from the landing page to the Teacher Growth Journal. Identify all points of friction, UI inconsistencies, and areas where the user flow does not align with our "Continuous Growth Loop" philosophy. Create a prioritized list of UI/UX tickets to be addressed before launch.

*   **Step 2: The Full-Stack Code Audit**
    *   **Agent:** Full-Stack Architect Agent
    *   **Prompt:**
        > `@full-stack-architect-persona.md`
        >
        > `@/app` `@/convex`
        >
        > Perform a comprehensive code audit. Identify areas of technical debt, opportunities for component reuse, and any code that does not adhere to our established architectural patterns (e.g., colocation, `usePlanFeatures` hook). Create a list of refactoring tasks.

*   **Step 3: The QA & Automation Audit**
    *   **Agent:** QA & Automation Agent
    *   **Prompt:**
        > `@qa-persona.md`
        >
        > `@prd.md`
        >
        > Review our PRD. Identify the most critical user flows that lack automated test coverage. Create a test plan outlining the end-to-end Playwright tests that MUST be written and passing before we can launch.

*   **Step 4: The Security & Compliance Audit**
    *   **Agent:** Security & Compliance Agent
    *   **Prompt:**
        > `@security-persona.md`
        >
        > `@/convex` `@/middleware.ts`
        >
        > Perform a security audit of the EdCoachAI backend and authentication logic. Use Semgrep with a focus on security rules (e.g., checking for insecure direct object references, ensuring all queries are tenant-scoped). List all potential vulnerabilities that need to be addressed.

*   **Step 5: The Launch Readiness Audit**
    *   **Agent:** DevOps & Launch Agent
    *   **Prompt:**
        > `@devops-persona.md`
        >
        > Review our project's deployment configuration. Create a pre-launch checklist that includes all necessary steps for a safe and successful production deployment, including environment variable setup, database migration checks, and a rollback plan.

### **Phase 2: The Coordinated Execution Workflow**

After the audits are complete, you will have a prioritized backlog. Now, you can orchestrate the agents to execute the work in the most efficient order.

1.  **The Architect Builds the Scaffolding:** The **Full-Stack Architect Agent** takes the highest-priority UI/UX tickets and refactoring tasks. It cleans up the code and builds any new, necessary components.
2.  **The Designer Polishes the Experience:** The **Product & UX Agent** reviews the architect's work, providing feedback on the visual implementation and ensuring it meets the design standards.
3.  **The QA Agent Validates the Flow:** Once a feature is "UI complete," the **QA & Automation Agent** writes and runs the Playwright tests for that specific user flow, ensuring it is bug-free.
4.  **The Security Agent Hardens the System:** In parallel, the **Security & Compliance Agent** works with the Architect to fix any vulnerabilities identified in the audit.
5.  **The DevOps Agent Prepares for Launch:** Throughout the sprint, the **DevOps & Launch Agent** works on the pre-launch checklist, setting up monitoring, and preparing the production environment.

This streamlined, audit-first approach is a professional and highly effective way to manage the final phase of your project. It ensures that your work is targeted, prioritized, and that every aspect of the application—from the UI to the security—is reviewed and polished before launch.