# Product Requirements Document: EdCoach AI (MVP)

**Version:** 1.0
**Date:** April 11, 2025
**Author/Owner:** Randall LaPoint, Jr.
**Status:** In Progress

---

## 1. Introduction & Overview

EdCoach AI is an AI-powered instructional support platform for school leaders, instructional coaches, and teachers. The MVP focuses on streamlining classroom observations, providing instant, rubric-aligned feedback, and tracking teacher growth at the school level.

---

## 2. Goals & Objectives

- Enable school leaders and coaches to quickly complete observations using the LER rubric
- Provide teachers with immediate, AI-generated, editable feedback
- Offer dashboards and analytics scoped to each school
- Support two observation templates: Formal Observation and Informal Walkthrough
- Allow observations to be saved as draft or finalized
- Manage roles and permissions in Convex DB for future scalability

---

## 3. Target Audience

- **Teachers:** View/download observation results and feedback
- **Instructional Coaches/Assistant Principals:** Conduct observations, upload notes, receive AI feedback, access assigned teacher data
- **Principals:** Conduct observations and view all staff data/analytics

---

## 4. Assumptions & Principles

- Only the LER rubric (see data/rubric-content.json) is supported in MVP
- Observations can be saved as draft or finalized
- Two observation templates (Formal/Informal) are available
- Analytics and data access are scoped to the user's school
- Role/permission logic is managed in Convex DB, not solely via Clerk

---

## 5. Requirements

### 5.1. Functional Requirements

| Feature ID | Feature Name                         | Description                                                                                  | Priority |
| :--------- | :----------------------------------- | :------------------------------------------------------------------------------------------- | :------- |
| F-001      | Observation Form (LER)               | Coaches/APs and principals complete observations using Formal or Informal templates          | Must Have |
| F-002      | Draft/Finalized Status               | Observations can be saved as draft or finalized before sharing                              | Must Have |
| F-003      | AI-Generated Feedback (Editable)     | Generate feedback suggestions from observation notes; allow editing before sharing           | Must Have |
| F-004      | Teacher Feedback Access              | Teachers can view and download observation results and feedback                              | Must Have |
| F-005      | Analytics Dashboard                  | Dashboards for all roles, scoped to user's school                                            | Must Have |
| F-006      | Role-Based Dashboards                | Distinct dashboards for teachers, coaches/APs, and principals                               | Must Have |
| F-007      | Authentication (Clerk)               | Secure login, registration, and session management                                           | Must Have |
| F-008      | Role/Permission Management           | Roles and permissions managed in Convex DB                                                   | Must Have |
| F-009      | Device Optimization                  | Responsive design for desktop, tablet, and mobile                                            | Must Have |

### 5.2. Non-Functional Requirements

- Performance, usability, security, scalability, reliability, accessibility as previously specified

---

## 6. Features (Detailed Breakdown - MVP)

### 6.1. Observation Templates

#### Formal Observation
- **Required:** All LER domains and indicators from rubric-content.json must be addressed.
- For each indicator:
  - Observer provides a numeric rating (as defined in the rubric: e.g., 1-Unsatisfactory, 3-Proficient, 5-Exemplary)
  - Observer provides evidence text supporting the rating
- All domains and indicators must be completed for the observation to be finalized.
- Workflow: Save as draft → Edit → Finalize → AI feedback generated → Observer edits feedback → Feedback shared with teacher
- Acceptance Criteria:
  - All indicators/domains are present and required
  - Ratings and evidence are validated per rubric
  - Teachers receive comprehensive, rubric-aligned feedback

#### Informal Walkthrough
- **Required:** Observer selects up to 3 LER indicators observed
- For each selected indicator:
  - Area of Reinforcement (what the teacher is doing well, required)
  - Area of Refinement (growth opportunity, optional)
  - Specific, encouraging feedback (required)
- Overall Encouragement/Positive Note (required)
- No numeric ratings or grading language; feedback must be supportive and growth-focused
- Workflow: Save as draft → Edit → Finalize → AI feedback generated (supportive, non-evaluative) → Observer edits feedback → Feedback shared with teacher
- Acceptance Criteria:
  - At least one area of reinforcement and overall encouragement are required
  - No numeric scores or evaluative language is shown to teacher
  - All feedback is phrased positively and constructively

### 6.2. Analytics Dashboard

- For Principals/Coaches:
  - Table: All observations in school (filter by date, teacher, template, status)
  - Chart: Number of observations per teacher (last 30 days)
  - Chart: Average indicator scores by domain (last 90 days, formal only)
- For Teachers:
  - List: All personal observations (with status, date, observer)
  - Chart: Personal indicator scores over time (formal only)

### 6.3. Roles & Permissions

| Role         | Can Submit Observations | Can View All School Data | Can View Own Feedback | Can Edit Feedback | Can Access Analytics |
|--------------|------------------------|-------------------------|----------------------|-------------------|---------------------|
| Teacher      | No                     | No                      | Yes                  | No                | Yes (own only)      |
| Coach/AP     | Yes                    | Assigned teachers only  | Yes                  | Yes               | Yes                 |
| Principal    | Yes                    | Yes                     | Yes                  | Yes               | Yes                 |

### 6.4. Data Model

#### FormalObservation
- id: string
- template: 'formal'
- status: 'draft' | 'finalized'
- teacherId: string
- observerId: string
- schoolId: string
- date: ISO string
- indicators: Array<{ domain: string, indicatorCode: string, rating: number, evidence: string }>
- aiFeedback: string
- finalizedAt: ISO string | null

#### InformalWalkthroughFeedback
- id: string
- observationId: string
- indicatorCode: string
- areaOfReinforcement: string
- areaOfRefinement: string | null
- specificFeedback: string
- createdAt: ISO string

#### InformalWalkthroughObservation
- id: string
- template: 'informal'
- status: 'draft' | 'finalized'
- teacherId: string
- observerId: string
- schoolId: string
- date: ISO string
- indicators: Array<indicatorCode>
- feedback: Array<InformalWalkthroughFeedback>
- overallEncouragement: string
- aiFeedback: string
- finalizedAt: ISO string | null

---

## 7. Design & UX Considerations

- Role-based navigation and access
- Template-driven observation forms
- For informal walkthrough, use language like "What's going well?" and "What's a next step for growth?"
- Add helper text: "This feedback is for encouragement and professional growth, not evaluation."
- Responsive, accessible UI

---

## 8. Release Criteria & Success Metrics

- All MVP features implemented and tested
- Observations and feedback workflow functional for all school-level roles
- Analytics dashboards scoped to school
- Role/permission logic managed in Convex DB

---

## 9. Future Considerations

- Custom rubric support, district admin, advanced analytics, teacher response, gamification, subscription management

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