# EdCoach AI Development Roadmap

## Overview

This roadmap outlines the development plan for EdCoach AI, an instructional support platform for school leaders, instructional coaches, and teachers. The MVP focuses on school-level workflows, with future expansion planned for district-level features.

## Key MVP Principles

- **Roles:** Teacher, Instructional Coach/Assistant Principal, Principal (district admin deferred)
- **Observation Templates:**
  - **Formal Observation:** All LER domains and indicators from rubric-content.json must be addressed. For each, observer provides a numeric rating (as defined in the rubric) and evidence text. All standards in rubric-content.json are met.
  - **Informal Walkthrough:** Observer selects up to 3 LER indicators. For each, provides area of reinforcement (required), area of refinement (optional), and specific, encouraging feedback (required). Required overall encouragement note. No numeric ratings or grading language. Feedback must be supportive and growth-focused.
- **Observation Status:** Observations can be saved as draft or finalized before sharing
- **Feedback:** One-way, AI-generated and editable by observer, delivered to teacher. For informal walkthrough, AI feedback is always supportive and non-evaluative.
- **Analytics:** Dashboards scoped to user's school
- **Role Management:** Roles and permissions managed in Convex DB for future flexibility (Clerk used for authentication)
- **Deferred Features:** Custom rubrics, district admin, advanced analytics, gamification, subscription management

## Timeline Overview

- **Phase 1:** Core Infrastructure (4 weeks)
- **Phase 2:** Observation & Feedback System (6 weeks)
- **Phase 3:** Analytics & Finalization (4 weeks)
- **Total MVP Development:** 14 weeks

## User Stories by Phase

### Phase 1: Core Infrastructure

- User registration and authentication (Clerk)
- Convex DB setup with user, school, and role tables
- Role assignment and permission checks in Convex

### Phase 2: Observation & Feedback System

#### Week 5: Observation Templates
- Implement Convex schema for observations (see PRD for fields)
- Build UI for Formal Observation (all LER indicators required, numeric rating and evidence for each)
- Build UI for Informal Walkthrough (select up to 3 indicators, area of reinforcement, area of refinement, specific encouraging feedback, overall encouragement note)
- Acceptance: User can save draft, edit, and finalize both templates. Formal requires all indicators; informal requires at least one area of reinforcement and overall encouragement.

#### Week 6: AI Feedback Integration
- Integrate OpenAI API for feedback generation
- For informal walkthrough, ensure AI prompt and output are always supportive, non-evaluative, and growth-focused
- Build feedback editing UI for observer
- Acceptance: Finalized observation triggers AI feedback, observer can edit before sharing

#### Week 7: Teacher Feedback Access
- Build teacher dashboard to view/download feedback
- Restrict access to finalized feedback only
- Acceptance: Teacher sees only their own finalized feedback

#### Week 8: Analytics Dashboard
- Build analytics queries in Convex (see PRD for metrics)
- Build dashboard UI for principal/coach/teacher
- Acceptance: All roles see correct analytics scoped to their school

#### UI/UX Tasks
- For informal walkthrough, use language like "What's going well?" and "What's a next step for growth?"
- Add helper text: "This feedback is for encouragement and professional growth, not evaluation."
- Ensure no numeric scores or evaluative language is shown to teacher in informal feedback
- Visual design for informal walkthrough should feel friendly and supportive

## Success Criteria

- All MVP user stories implemented and tested
- Observations and feedback workflow functional for all school-level roles
- Analytics dashboards scoped to school
- Role/permission logic managed in Convex DB

## Post-MVP Considerations

- Custom rubric support
- District admin features
- Advanced analytics and reporting
- Teacher response to feedback
- Gamification and subscription management

## Development Approach

- [x] **Solo Development**: All development work will be performed by a single developer
- [x] **Agile Methodology**: Using iterative development with weekly milestones
- [x] **MVP First**: Focus on delivering core features before any enhancements
- [ ] **Test-Driven**: Implementing automated testing where possible to ensure quality

## Technology Stack

- [x] **Frontend**: Next.js 15, Tailwind CSS, ShadCN UI, MagicUI, Shadcn Form Builder, React Bits animated components
- [x] **Backend**: Convex for database and backend logic
- [x] **Authentication**: Clerk
- [ ] **Payment Processing**: polar.sh
- [ ] **AI/ML**: LLM with support for narrow context (final selection pending)
- [x] **Deployment**: Vercel

## Risk Assessment & Mitigation

### Technical Risks
- [ ] **LLM Performance**: Selecting an LLM that properly handles narrow context (LEADS/LER frameworks)
  - **Mitigation**: Test multiple LLM options early, create fallback mechanisms
- [ ] **Solo Developer Bandwidth**: Managing the full stack as a single developer
  - **Mitigation**: Prioritize features rigorously, use well-tested libraries and frameworks
- [x] **Real-time Performance**: Ensuring responsive experience with Convex
  - **Mitigation**: Implement proper indexing, optimization, and caching strategies

### Business Risks
- [ ] **Payment Integration**: First-time integration with polar.sh
  - **Mitigation**: Build simple integration first, expand features later
- [ ] **User Adoption**: Ensuring the product meets real user needs
  - **Mitigation**: Get early feedback on core features, iterate based on user testing

## Conclusion

This roadmap provides a structured approach for solo development of the EdCoach AI platform, focusing on delivering a high-quality MVP within 14 weeks. By breaking down the work into manageable phases and user stories, the development process becomes more predictable while maintaining flexibility for adjustments based on testing and feedback. 