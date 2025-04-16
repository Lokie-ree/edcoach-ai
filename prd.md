# Product Requirements Document: EdCoach AI (MVP)

**Version:** 1.0
**Date:** April 11, 2025
**Author/Owner:** Randall LaPoint, Jr.
**Status:** In Progress

---

## 1. Introduction & Overview

### 1.1. Purpose
This document outlines the requirements for the Minimum Viable Product (MVP) of EdCoach AI. EdCoach AI is envisioned as a real-time, AI-powered instructional support platform designed to assist school leaders and instructional coaches in delivering actionable, rubric-aligned feedback to foster teacher growth.

### 1.2. Vision
To be the leading platform for streamlining instructional coaching, leveraging AI to save time, enhance feedback quality, track progress effectively, and ultimately improve teaching practice.

### 1.3. Scope
This PRD focuses specifically on the core features required for the initial MVP launch. Future enhancements and integrations are outlined in the Future Considerations section.

---

## 2. Goals & Objectives

*   **Automate Feedback:** Streamline the process of conducting walkthroughs and generating LEADS-aligned (or custom rubric-aligned) feedback using AI assistance.
*   **Track Growth:** Provide tools to monitor and visualize teacher performance trends over time based on observation data.
*   **Support Customization:** Allow schools/districts to utilize standard rubrics (LEADS, LER) or implement their own specific frameworks.
*   **Enhance User Experience:** Deliver a modern, intuitive, responsive, and accessible user interface across all common devices (desktop, tablet, mobile).
*   **(Optional MVP Goal):** Introduce a basic gamification layer to encourage teacher engagement with professional growth.
*   **Establish Core Infrastructure:** Implement foundational systems for authentication, database management, billing, and deployment.

---

## 3. Target Audience

*   **School Leaders:** (Principals, Assistant Principals) - Focus on efficiency, consistency, school-wide trends, accountability alignment.
*   **Instructional Coaches:** Focus on feedback quality, time savings, tracking individual teacher progress, rubric flexibility.
*   **District Administrators:** Focus on district-wide data, standardization, rubric management, scalability. (Primary users likely in post-MVP phases but system architecture should consider them).

---

## 4. Assumptions & Principles

*   Users require a significant improvement over manual processes or existing buggy/inflexible tools (like EdLink).
*   AI-generated feedback should be a starting point, always editable by the user.
*   Rubric flexibility is crucial for adoption.
*   Real-time data access and updates enhance the user experience.
*   A clean, intuitive UI/UX is a key differentiator.
*   Data security and privacy are paramount.
*   The platform must be reliable and performant.

---

## 5. Requirements

### 5.1. Functional Requirements (MVP Features)

| Feature ID | Feature Name                         | High-Level Description                                                                                                | Priority |
| :--------- | :----------------------------------- | :-------------------------------------------------------------------------------------------------------------------- | :------- |
| F-001      | Walkthrough Form & Rubric Mapping    | Allow users to conduct observations using a structured form and map evidence to specific indicators on a selected rubric. | Must Have  |
| F-002      | Custom Rubric Support              | Allow configuration and use of standard (LEADS, LER) and user-uploaded custom rubrics within the walkthrough form.      | Must Have  |
| F-003      | AI-Generated Feedback (Editable)   | Generate feedback suggestions based on observation notes and rubric alignment; allow users to edit/approve suggestions. | Must Have  |
| F-004      | Observation Logs Table             | Display a sortable/filterable table of completed observations with key details (teacher, date, observer, rubric).     | Must Have  |
| F-005      | Performance Trend Tracking (Basic) | Provide basic visualizations (e.g., charts) showing performance against rubric indicators over time for individuals/groups. | Must Have  |
| F-006      | Role-Based Access Control (RBAC)   | Implement distinct roles (e.g., Coach, Leader, Admin - initial focus on Coach/Leader) with appropriate permissions.      | Must Have  |
| F-007      | Authentication (Clerk)             | Secure user login, registration, and session management using Clerk.                                                  | Must Have  |
| F-008      | Tiered Subscription System (Core)  | Implement logic to support different feature access based on subscription tiers (details TBD, billing via polar.sh). | Must Have  |
| F-009      | Device & Platform Optimization     | Ensure the application is fully responsive and functional across major browsers on desktop, tablet, and mobile devices. | Must Have  |
| F-010      | Gamification Layer (Optional MVP)  | (If included in MVP) Implement basic XP points and badge earning based on observation completion/rubric mastery.       | Should Have|

### 5.2. Non-Functional Requirements

*   **Performance:** Real-time data updates (leveraging Convex) where appropriate (e.g., observation logs). Fast page loads and responsive UI interactions. AI generation should be reasonably fast.
*   **Usability:** Intuitive navigation, clear information hierarchy. Minimal clicks to complete core tasks (walkthrough, feedback generation). Consistent design language (ShadCN UI, MagicUI).
*   **Security:** Secure authentication and authorization (Clerk). Data encryption at rest and in transit (handled by Convex/Vercel). Protection against common web vulnerabilities. Role-based access enforced.
*   **Scalability:** Architecture should support adding users and schools/districts (Vercel serverless functions, Convex database scaling).
*   **Reliability:** High availability, minimal downtime (leveraging Vercel/Convex infrastructure). Graceful error handling.
*   **Maintainability:** Clean, well-documented code. Use of modern frameworks (Next.js 15). Type safety (Convex).
*   **Accessibility:** Adhere to WCAG 2.1 AA guidelines where feasible for core functionality.

---

## 6. Features (Detailed Breakdown - MVP)

### 6.1. Walkthrough Form & Rubric Mapping (F-001, F-002)
    *   User selects Teacher, Date, Rubric (Standard or Custom).
    *   Form displays rubric indicators/domains.
    *   Input fields (text areas) for capturing observation evidence/notes associated with each indicator.
    *   Ability to tag/rate indicators based on evidence (e.g., selecting performance levels if defined in rubric).
    *   Save/Submit functionality.

### 6.2. AI-Generated Feedback (F-003)
    *   Button/Action trigger post-observation submission ("Generate Feedback").
    *   Sends observation notes, selected rubric, and indicator ratings/tags to LLM API.
    *   Receives structured feedback suggestions (e.g., strengths, areas for growth, potential next steps) aligned with rubric language.
    *   Displays suggestions in an editable text area/interface.
    *   User can modify, add to, or delete suggestions before finalizing/saving/sharing (sharing mechanism TBD post-MVP).
    *   LLM selection will focus on models that support narrow context (e.g., LEADS/LER framework documents) for targeted feedback generation.

### 6.3. Observation Logs Table (F-004)
    *   Dashboard/dedicated page displaying a table of past observations.
    *   Columns: Teacher Name, Observer Name, Observation Date, Rubric Used, Status (e.g., Draft, Complete).
    *   Basic sorting (by date, teacher).
    *   Basic filtering (by teacher, date range).
    *   Link to view observation details/feedback.

### 6.4. Performance Trend Tracking (Basic) (F-005)
    *   Dashboard section displaying charts.
    *   Visualize average performance level per rubric indicator over time (for selected teacher or group).
    *   Visualize frequency of specific indicators being tagged over time.
    *   Data derived from completed observation logs.

### 6.5. Role-Based Access Control (RBAC) (F-006)
    *   Define roles: Admin (can manage users/settings), Leader (can observe, view school-wide data), Coach (can observe assigned teachers, view their data).
    *   Restrict access to features/data based on assigned role. (Initial MVP might simplify roles).

### 6.6. Authentication (F-007)
    *   User registration flow.
    *   Secure login (email/password, potentially SSO options via Clerk later).
    *   Password reset functionality.
    *   Session management.

### 6.7. Tiered Subscription System (Core) (F-008)
    *   Backend logic to associate users/organizations with subscription tiers (e.g., Coach, School, District).
    *   Feature flags or checks based on subscription level (e.g., custom rubrics only on School/District).
    *   Integration points for polar.sh payment processing. Actual payment flow might be basic in MVP.

### 6.8. Device & Platform Optimization (F-009)
    *   Responsive design implementation using Tailwind CSS.
    *   Testing across Chrome, Firefox, Safari on Desktop.
    *   Testing on representative iOS (Safari) and Android (Chrome) devices/emulators.

### 6.9. Gamification Layer (Optional MVP) (F-010)
    *   Backend logic to award XP for completing observations or achieving certain rubric scores.
    *   Simple display of user XP/Level.
    *   Basic badge system for predefined achievements (e.g., "Completed 10 Observations").

---

## 7. Design & UX Considerations

*   **Branding:** Adhere to EdCoach AI branding guidelines:
    *   **Colors:** Primary Blue (`#2952A3`), Accent Coral (`#FF725E`), Soft Slate (`#495057`), Background Gray (`#F5F7FA`), Success Green (`#30B76A`), Warning Gold (`#F6B840`). *(Note: User later specified website colors - `#0f172a`, `#3b82f6`, `#f8fafc`, `#FFFFFF`. **Confirm final palette**)*
    *   **Typography:** Inter Bold/Plus Jakarta Sans (Headlines), Inter Regular/Source Sans Pro (Body), Roboto Mono (Labels). *(Confirm final choices)*
    *   **Logo:** Minimalist vector style reflecting growth & AI insight. *(Use final approved logo)*
*   **UI Components:** Utilize ShadCN UI and MagicUI libraries for consistency and modern look/feel.
*   **User Flow:** Optimize for efficiency in core tasks (observation, feedback generation). Minimize friction.
*   **Information Architecture:** Clear navigation and logical grouping of features.

---

## 8. Release Criteria & Success Metrics (MVP)

### 8.1. Release Criteria
*   All "Must Have" functional requirements (F-001 to F-009) implemented and tested.
*   Core non-functional requirements (Performance, Security, Usability, Reliability) met at an acceptable level for initial users.
*   No critical or blocker bugs outstanding in core workflows.
*   Basic deployment pipeline operational on Vercel.
*   Basic user documentation or onboarding available.

### 8.2. Success Metrics (Post-Launch)
*   Number of waitlist signups converted to active users.
*   Number of successful observations completed per user/school.
*   Frequency of AI feedback generation usage.
*   User feedback scores (e.g., CSAT, qualitative feedback).
*   System uptime and performance metrics.

---

## 9. Future Considerations (Post-MVP)

*   Advanced Analytics & Reporting Dashboards.
*   Teacher Accounts/Portal for viewing feedback.
*   Goal Setting & Tracking features.
*   Direct Feedback Sharing/Workflow features.
*   Integrations: Google Classroom, Apple School Manager, Clever, SIS platforms.
*   Advanced AI Features (e.g., resource suggestions, bias detection - potentially using Ingest).
*   More sophisticated Gamification options.
*   Public API.
*   Enhanced Admin/District Management features.

---

## 10. Open Issues & Questions

*   Final confirmation of branding colors and typography.
*   Specific logic/algorithm for basic trend tracking visualization.
*   Detailed mapping requirements for LEADS/LER rubrics.
*   Specific LLM selection that supports narrow context for education rubrics.
*   Exact feature differentiation between subscription tiers.
*   Detailed error handling strategy for API calls (LLM, polar.sh, etc.).
*   Specific requirements for the (Optional) Gamification layer if included.

---