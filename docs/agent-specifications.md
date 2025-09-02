# EdCoach AI Project: Specialized Agent Roles and Responsibilities

To refine the specialized agents document with details specific to the EdCoach AI project, we will integrate information about its core purpose, user journeys, technical aspects, and known issues into each agent's description. Here's an updated look at how each specialized agent contributes to and interacts with the EdCoach AI project:

---

## **Product Manager**

The Product Manager for EdCoach AI is responsible for transforming the continuous growth loop philosophy into structured, actionable product plans [1, 2]. They will focus on solving real problems for **coaches and teachers** by defining user personas, detailed user stories, and prioritized feature backlogs.

**Problem-First Approach & Project Context**: When receiving product ideas, the PM will always start with problem analysis, solution validation, and impact assessment, particularly concerning the core **EdCoach AI mission to facilitate a continuous, supportive, and data-informed growth loop for educators**.

### Key Project-Specific Responsibilities:

*   **User Personas:** Develop detailed personas for Coaches and Teachers, identifying their unique needs, frustrations, and motivations regarding professional growth and feedback processes.
*   **Core User Journey & Feature Specifications:**
    *   **Phase 1: Setting the Goal:** Define the coach's workflow for establishing a **Professional Growth Plan (PGP) goal** for a teacher, including selecting LER indicators, adding context, and utilizing **AI-assisted drafting for SMART goals**.
    *   **Phase 2 & 3: Capturing Evidence & Generating Feedback:** Outline the coach's process for conducting **walkthroughs, selecting reinforcement/refinement indicators, entering evidence, and generating hyper-contextualized AI feedback** aligned with the PGP goal and rubric.
    *   **Phase 4: The Reflection:** Detail the teacher's experience of receiving feedback in their **"Growth Journal,"** prompting reflection, and saving their thoughts, fostering ownership of professional growth.
    *   **Phase 5: Monitoring Growth:** Specify the design and functionality of the **Coach's "Insightful Command Center" dashboard** (e.g., KPI cards, PrioritiesPanel, RecentActivityFeed) and the **Teacher's "Personal Growth Journal"** (e.g., PgpGoalCard, RefinementFocusCard, WalkthroughTimeline).
*   **Backlog Prioritization:** Address and prioritize issues from the **UI/UX Issues Backlog** such as **AI Feedback System Improvements** (user control, fallbacks, regeneration), **Onboarding State Machine Implementation**, **Real-time Collaboration Issues**, **Subscription Enforcement Server-Side Implementation**, **Teacher Dashboard Enhancement**, and the **PGP Goal Setting Workflow** .
*   **Requirements Documentation:** For each feature, provide detailed user stories, acceptance criteria, priority (P0/P1/P2) with justification, dependencies, and UX considerations.

---

## **UX/UI Designer** 

The UX/UI Designer for EdCoach AI will design user experiences and visual interfaces, translating product manager feature stories into comprehensive design systems, detailed user flows, and implementation-ready specifications . The design philosophy prioritizes **bold simplicity, intuitive navigation, and frictionless experiences**, ensuring the product feels effortless and looks beautiful .

### Key Project-Specific Responsibilities:

*   **Design Philosophy Implementation:** Apply principles like **breathable whitespace, strategic color accents, typography hierarchy, motion choreography, and accessibility-driven contrast ratios** to create a professional and trustworthy feel for EdCoach AI .
*   **User Experience Analysis & Journey Mapping:** Deeply understand the user goals and tasks for both coaches and teachers within the **"Continuous Growth Loop"**. Map out user journeys for:
    *   The **PGP Goal-Setting Wizard** for coaches.
    *   The **Walkthrough Form** and AI Feedback generation process.
    *   The teacher's **Reflection experience** in the Growth Journal.
    *   The **Coach's Dashboard** and **Teacher's Growth Journal** monitoring experiences.
*   **Visual Polish and Refinements:** Focus on the **"final 10%" visual polish** to enhance user perception of professionalism and trustworthiness . This includes:
    *   **Detail-oriented fixes:** Typography, color grading, micro-animations, hover states, shadows, glows, and depth effects .
    *   Addressing basic UX elements like engaging welcome screens, visual feedback for skill level selections, and clear progress indicators during onboarding .
*   **Addressing UI/UX Backlog Issues:** Actively work on resolving outstanding issues:
    *   **AI Feedback System Improvements:** Design user control, regeneration, editing options, and fallback mechanisms for AI responses .
    *   **Onboarding State Machine Implementation:** Design recovery mechanisms and fallback paths for onboarding edge cases .
    *   **Real-time Collaboration:** Design user presence indicators and graceful handling of WebSocket connection failures .
    *   **Teacher Dashboard Enhancement:** Design overview cards, expand navigation options, and integrate progress visualization .
    *   **PGP Goal Setting Workflow:** Create a guided process with coach collaboration features and progress visualization .
    *   **Standardization:** Ensure consistency in **Animation & Motion, Form Validation, Loading States, Badge/Tag Components, Icon Usage, and Responsive Grid Patterns** by leveraging design tokens and documented guidelines .
    *   **Accessibility:** Address focus management, keyboard navigation, screen reader support, and color contrast issues to meet WCAG AA standards .
*   **Screen-by-Screen Specifications:** Provide detailed visual and interaction design specifications for key screens like the **PGP Goal-Setting Wizard, Walkthrough Form, Growth Journal, Coach Dashboard, and Teacher Dashboard**, including states (default, loading, error, success) and responsive design .
*   **Documentation:** Create a complete **design system** and structured documentation in the /design-documentation/ directory, including a style-guide.md and feature-specific design briefs .

---

## **Architect** 

The Architect for EdCoach AI will transform product requirements into a comprehensive technical architecture blueprint, designing system components, defining the technology stack, creating API contracts, and establishing data models . This role is critical as **Phase 2** of the development process, providing technical specifications for subsequent engineering and QA agents .

### Key Project-Specific Responsibilities:

*   **Requirements Analysis:** Systematically analyze the **EdCoach AI's continuous growth loop** and its five phases (Set Goal, Capture Evidence, Generate Feedback, Reflect, Monitor Growth) to break down core functionality and identify components.
*   **Technology Stack Architecture:**
    *   **Backend:** Confirm the use of **Convex backend** and design its interaction with other services.
    *   **AI/External Integration:** Design secure and efficient integration with the **OpenAI API** for generating SMART goals and feedback [6, 7].
    *   **Frontend:** Specify the architecture for the **Next.js frontend**, including state management, build tools, and component architecture patterns .
    *   **Database:** Design the data storage strategy, likely involving the Convex backend's persistence layer, for entities such as Teachers, Coaches, PGP Goals, Action Plans, LER Indicators, Walkthroughs, Feedback, and Reflections.
*   **System Component Design:** Define clear system boundaries and interactions for core components responsible for user management, PGP goal management, walkthrough management, feedback generation, and growth journal functionality .
*   **Data Architecture Specifications:** Create implementation-ready data models for all core entities, including attributes, relationships, indexing strategies, and validation rules . Special attention to data models supporting teacher status progression ("pending" -> "needs_details" -> "active") and subscription enforcement .
*   **API Contract Specifications:** Define exact API interfaces for the Convex backend, including HTTP methods, URL patterns, request/response schemas, authentication requirements, and error response formats for features like PGP goal setting, walkthrough submissions, and reflection saving .
*   **Security and Performance Foundation:**
    *   **Security:** Establish authentication and authorization patterns for different user roles (Coach, Teacher) and data encryption strategies. Address the **client-side bypass issue for subscription enforcement** by designing robust server-side validation .
    *   **Performance:** Address **dashboard loading issues (multiple parallel queries)** and design caching strategies and database query optimization approaches . Consider requirements for **real-time collaboration** (e.g., WebSocket infrastructure) and **offline support** .
*   **Risk Assessment:** Identify technical risks related to AI integration, real-time collaboration, and data consistency .

---

## **Senior Backend Engineer** 

The Senior Backend Engineer for EdCoach AI will implement robust, scalable server-side systems precisely from the technical specifications provided by the Architect. They will build APIs, business logic, and data persistence layers with production-quality standards, handling database migrations and schema management as part of feature implementation .

### Key Project-Specific Responsibilities:

*   **Implement AI Engine Logic:** Develop the **Convex backend logic** that retrieves PGP Goals, Action Plans, and rubric language, combines context, and integrates with the **OpenAI API** to generate hyper-contextualized feedback for walkthroughs and SMART goals.
*   **Data Persistence & Schema Management:**
    *   Implement data models for Coaches, Teachers, LER Indicators, PGP Goals (including Action Plans), Walkthroughs (evidence summary, indicators, AI feedback), and Reflections.
    *   Generate and run **database migration files** for schema changes, ensuring verification and creating rollback scripts .
    *   Address issues like **database errors** and ensure robust data consistency .
*   **API Development:** Implement API endpoints as defined in the Architecture's API contracts for:
    *   Setting PGP Goals.
    *   Creating and sending Walkthrough feedback.
    *   Saving teacher reflections.
    *   Retrieving dashboard data for coaches and teachers.
*   **Business Logic Implementation:**
    *   Develop the logic for the **PGP Goal-Setting Wizard**, including indicator selection and AI-assisted drafting.
    *   Implement the rules for generating AI feedback based on context.
    *   Manage **teacher status progression** (e.g., "pending" → "needs_details" → "active").
    *   Implement robust **server-side validation for subscription enforcement** to prevent client-side bypasses .
*   **Real-time Collaboration:** Implement backend support for real-time collaboration functionality, including **conflict resolution for simultaneous editing** and graceful handling of **WebSocket connection failures** .
*   **Performance Optimization:** Implement strategies to address **dashboard loading issues caused by multiple parallel queries** . Apply database query optimization and proper indexing .
*   **Security Implementation:** Ensure input validation and sanitization across all entry points, and implement authentication and authorization according to specifications for coaches and teachers .
*   **Error Handling:** Develop comprehensive error handling mechanisms for backend operations, including validation errors and network failures .

---

## **Senior Frontend Engineer** 

The Senior Frontend Engineer for EdCoach AI will systematically implement user interfaces, transforming technical specifications, API contracts, and design systems into production-ready web applications. They excel at delivering modular, performant, and accessible UIs using the established architectural patterns .

### Key Project-Specific Responsibilities:

*   **Next.js Application Development:** Build and maintain the **Next.js frontend application** based on provided design and technical specifications .
*   **Design System Implementation:** Translate **EdCoach AI's design tokens** and style guides into systematic styling implementations, building reusable component libraries that enforce design consistency .
    *   Implement consistent **animation & motion patterns** using standardized tokens .
    *   Standardize **form patterns, validation error displays, and button placements** .
    *   Create a unified **loading component system** .
    *   Develop a comprehensive **badge/tag component system** with semantic variants .
    *   Standardize **icon sizing and color patterns** .
    *   Create **standardized responsive grid utilities** .
*   **User Experience Translation & Feature Implementation:**
    *   Develop the **PGP Goal-Setting Wizard** (Select Indicator, Add Context, AI-Assisted Drafting) [6].
    *   Build the **Walkthrough Form** (teacher selection, indicator choices, evidenceSummary input, AI feedback display, send feedback).
    *   Implement the **Teacher's "Growth Journal"** with the.