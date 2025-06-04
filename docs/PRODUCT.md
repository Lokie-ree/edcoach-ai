# EdCoach AI: Product & Technical Overview (MVP)

## Table of Contents
1. Product Overview & Goals
2. User Personas & Roles
3. Onboarding, Role, and Subscription Flows
4. Architecture & Technology Stack
5. Database & Core Features (with links to technical docs)
6. Application Flow & User Journeys
7. Implementation Timeline & Milestones
8. Success Metrics
9. Documentation & References

---

## 1. Product Overview & Goals
EdCoach AI is an AI-powered instructional coaching and feedback platform for K-12 schools, focused on frequent, informal classroom walkthroughs. The MVP delivers:
- Fast, AI-generated, rubric-aligned feedback for teachers
- Mobile-first, low-burden walkthrough capture
- Role-based dashboards and analytics
- Coach-managed teacher groups (no org/district for MVP)
- Subscription-based access for coaches (via Polar)

### Business Goals
- Reduce time for walkthroughs/feedback by 40%
- Improve feedback frequency and consistency
- Build a scalable, subscription-based platform

### User Goals
- **Coach:** Conduct walkthroughs, manage teachers, view analytics
- **Teacher:** Receive and review actionable feedback

---

## 2. User Personas & Roles
- **Coach** (admin): Can invite teachers, view analytics, manage group, requires subscription
- **Teacher:** Can view their own feedback, no subscription required

*For MVP, only these two roles are supported. Teachers are associated directly with their inviting coach.*

---

## 3. Onboarding, Role, and Subscription Flows

### 3.1 User Signup & Onboarding
- User visits app and signs up with email
- Selects role: `coach` or `teacher`
- **Coach:**
  - Must subscribe (via Polar) before accessing coach features
  - Sees role-specific onboarding tutorial
- **Teacher:**
  - Can only sign up via invite link from a coach
  - Sees role-specific onboarding tutorial

### 3.2 Invite Flow
- Coach invites teachers one at a time by email
- Teacher receives invite link, signs up, is auto-assigned `teacher` role and associated with coach

### 3.3 Subscription Management
- Only coaches require a subscription
- Two products at launch (e.g., "Coach Basic" and "Coach Pro"), each with monthly/yearly pricing
- Polar integration for checkout, subscription gating, and management

---

## 4. Architecture & Technology Stack
- **Frontend:** Next.js (React, TypeScript), shadcn, Tailwind CSS, Framer Motion
- **Backend:** Convex (real-time DB, functions, schema)
- **Authentication:** Clerk (user/session management, RBAC)
- **AI Integration:** OpenAI GPT-4.1 Mini (feedback generation)
- **Payments:** Polar (subscription management for coaches)

---

## 5. Database & Core Features
- See [Technical Schema Documentation](./schema.md) for full details
- Key tables: users, teachers, walkthroughs, feedback, auditLogs, aiUsageLogs
- Teachers are associated with a coach (not org/district) for MVP
- Role-based access enforced in backend
- All rubric data loaded from Convex DB

---

## 6. Application Flow & User Journeys

### 6.1 Coach
- Signup → Subscribe (if not active) → Onboarding → Dashboard
- Invite teacher → Conduct walkthrough → Generate/edit AI feedback → Submit
- View analytics, manage teachers, manage subscription

### 6.2 Teacher
- Receives invite → Signup → Onboarding → Dashboard
- View feedback feed, download reports

### 6.3 Walkthrough Workflow
- Coach selects teacher → Selects 1 indicator for reinforcement, 1 for refinement → Records evidence → AI feedback generated → Review/edit → Submit

---

## 7. Implementation Timeline & Milestones

### MVP Essential Tasks (~120 hours)
- Core AI & Mobile: OpenAI integration, prompt templates, walkthrough UI, analytics
- Onboarding & Role Management: Self-signup, invite flow, role-specific onboarding
- Subscription Gating: Polar integration, coach gating, product/pricing setup
- Testing & Launch: E2E tests, mobile testing, documentation, onboarding materials

### Post-MVP (Deferred)
- Bulk invites, org/district support, advanced offline, exports/reporting, formal observation support

---

## 8. Success Metrics
- Walkthroughs completed in <10 minutes
- >2 feedback interactions/teacher/month
- >80% dashboard/analytics usage
- Coach subscription conversion rate
- Teacher satisfaction (survey >4/5)

---

## 9. Documentation & References
- [Technical Schema Documentation](./schema.md)
- [Prompt Engineering Notes](./prompt-iteration1.md)
- [AI Feedback Revision Rationale](./ai-feedback-revision.md)
- [Development Timeline Archive](./development-timeline.md)
- [Legacy PRD/Project Plan](./prd.md), [project-plan.md] (for historical reference)

---

*This document is the single source of truth for EdCoach AI MVP. All onboarding, role, and subscription flows are up-to-date as of June 4, 2025. For deep technical details, see linked docs above.* 