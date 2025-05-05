# PRD: EdCoach AI

## 1. Product overview
### 1.1 Document title and version
- PRD: EdCoach AI
- Version: 1.1
- Date: May 5, 2025
- Author/Owner: Randall LaPoint, Jr.
- Status: In Progress


### 1.2 Product summary
EdCoach AI is an AI-powered instructional coaching and feedback platform designed to supplement formal teacher evaluations in K-12 schools. The system enhances the ongoing coaching workflow between school leaders, instructional coaches, and teachers by providing tools for frequent, informal classroom walkthroughs, generating timely, rubric-aligned feedback snippets, and tracking developmental trends at the school level.

The platform specifically addresses the need for continuous support and growth in the intervals between mandated formal observations, making feedback more frequent, actionable, and less burdensome. While it also supports formal observation workflows, its primary focus is facilitating the high-frequency, low-burden feedback that drives ongoing teacher development.

## 2. Goals
### 2.1 Business goals
- Reduce the time required for leaders/coaches to conduct informal walkthroughs and deliver associated feedback by 40%
- Improve consistency and frequency of informal teacher feedback across different observers
- Create a scalable platform that can expand to serve multiple schools and districts
- Establish a foundation for future feature expansion (custom rubrics, district-level analytics)
- Build a sustainable business model through school/district subscriptions

### 2.2 User goals
- **School Leaders:** Facilitate ongoing teacher development through frequent, targeted feedback derived from informal walkthroughs; efficiently identify specific coaching opportunities and track developmental trends
- **Instructional Coaches:** Efficiently conduct frequent informal walkthroughs and provide timely, targeted, high-quality feedback to support teacher growth cycles
- **Teachers:** Receive regular, actionable feedback snippets aligned with professional teaching standards throughout the year, enabling continuous professional growth between formal evaluation periods

### 2.3 Non-goals
- Replacing or serving as the sole system for official, state-mandated teacher evaluations (e.g., LEADS). EdCoach AI is a supplementary coaching tool
- Support for custom rubrics beyond LER in the MVP phase
- District-level user roles and analytics in the MVP phase
- Teacher response/feedback loop on observations
- Integration with third-party teacher evaluation systems
- Student assessment or performance tracking
- Parent/guardian access to observation data

## 3. User personas
### 3.1 Key user types
- School Principals
- Assistant Principals
- Instructional Coaches
- Classroom Teachers

### 3.2 Basic persona details
- **Principals:** School leaders who facilitate ongoing teacher development through frequent, targeted feedback and monitor developmental trends at the school level
- **Assistant Principals/Instructional Coaches:** Educational leaders who conduct regular informal walkthroughs and provide timely, targeted coaching to teachers
- **Teachers:** Classroom instructors who receive regular, actionable feedback snippets throughout the year to support continuous professional growth

### 3.3 Role-based access
- **Principals:** Can conduct walkthroughs/observations, view all staff data/analytics, and access comprehensive school dashboards showing feedback frequency and trends
- **Assistant Principals/Instructional Coaches:** Can conduct walkthroughs/observations, access assigned teacher data, and view limited analytics
- **Teachers:** Can view/download all their feedback interactions (both informal and formal), access personal growth analytics

## 4. Functional requirements
- **Observation Templates (LER-Based)** (Priority: High)
  - **Informal Walkthrough Template** (Priority: Critical)
    - Streamlined interface for selecting 1-3 focus indicators
    - Simplified evidence capture optimized for quick completion
    - Target completion time under 10 minutes
  - **Formal Observation Template** (Priority: Medium)
    - Comprehensive digital form with all LER domains and indicators
    - Ability to input ratings and evidence for each indicator
  
- **Draft/Finalized Status** (Priority: High)
  - Allow walkthroughs/observations to be saved as draft for later completion
  - Provide streamlined finalization workflow before sharing with teachers
  
- **AI-Generated Feedback** (Priority: High)
  - Generate concise, actionable feedback from both detailed formal notes and brief informal walkthrough evidence
  - Allow observers to quickly edit AI suggestions before finalizing
  
- **Teacher Feedback Access** (Priority: High)
  - Secure portal for teachers to view all their feedback interactions
  - Feed-style interface showing both informal and formal feedback
  - Ability to download feedback reports
  
- **Analytics Dashboard** (Priority: Medium)
  - Role-based dashboards emphasizing visualizations related to the frequency and focus areas of informal feedback
  - Track developmental trends between formal evaluations
  
- **Authentication and Role Management** (Priority: High)
  - Secure login, registration, and session management via Clerk
  - Role and permission management in Convex DB
  
- **Device Optimization** (Priority: High)
  - Mobile-first design optimized for classroom walkthrough capture
  - Offline capabilities for in-classroom use
  - Touch-optimized interface

## 5. User experience
### 5.1. Entry points & first-time user flow
- Users register with their school email and are assigned appropriate roles
- First-time login presents a brief onboarding tutorial emphasizing the quick walkthrough workflow for frequent feedback
- Role-specific dashboards serve as the landing page after login
- Prominent "Start Informal Walkthrough" button for coaches and administrators

### 5.2. Core experience
- **Conducting an Informal Walkthrough:** Observers select a teacher, quickly choose 1-3 focus indicators from the LER, jot down brief evidence notes, and optionally add reinforcement/refinement comments. The process is designed for completion in minutes.
  - Streamlined, mobile-optimized interface with minimal typing requirements
  - Progress indicators show completion status
  
- **Generating feedback:** After completing walkthrough notes, AI generates concise, targeted feedback suggestions aligned with the evidence and selected indicators. Observers quickly review/edit before sharing. The system also supports generating comprehensive feedback for optional formal observations.
  - Quick review interface optimized for rapid approval/editing
  - System ensures feedback is actionable and growth-oriented
  
- **Reviewing feedback:** Teachers access a feed of all feedback interactions, including frequent informal points and less frequent formal observations
  - Clean, distraction-free reading experience with option to download
  - Historical view allows tracking growth over time

### 5.3. Advanced features & edge cases
- Handling incomplete walkthroughs with draft status
- Managing feedback for underperforming indicators with constructive language
- Supporting offline completion when internet connectivity is limited
- Linking informal feedback points to formal observation goals
- Aggregating informal feedback trends to inform formal evaluations

### 5.4. UI/UX highlights
- Single-page walkthrough form with logical flow for rapid completion
- Mobile-optimized touch targets and minimal typing requirements
- Offline mode indicators and sync status visualizations
- Feed-style interface for reviewing all feedback interactions
- Accessible design supporting screen readers and keyboard navigation

## 6. Narrative
Principal Maria feels the pressure of the state's formal evaluation system (LEADS), which requires comprehensive observations but only happens a few times a year. She worries that teachers aren't getting enough timely support to make meaningful adjustments between these high-stakes events. Discovering EdCoach AI, she sees it not as a replacement for LEADS, but as the perfect complement. Now, Maria and her AP use their tablets during daily classroom pop-ins (5-10 minutes) to capture quick notes using EdCoach AI's Informal Walkthrough template, focusing on just one or two skills. The AI helps draft brief, targeted feedback ("Great job checking for understanding with thumbs-up/down today!" or "Consider trying strategy X for smoother transitions next time"). Teachers receive these small, actionable insights almost immediately via the platform. While they still prepare for formal LEADS observations, the frequent, low-stakes feedback from EdCoach AI fosters a culture of continuous improvement and makes the formal evaluations less daunting. Maria uses the dashboard to see which skills are being coached most frequently across the school, informing her broader PD planning.

## 7. Success metrics
### 7.1. User-centric metrics
- Average time to complete and deliver feedback for an Informal Walkthrough (target: < 10 minutes)
- Average number of informal feedback interactions recorded per teacher per month (target: > 2)
- Teacher satisfaction with frequency, timeliness, and actionability of feedback (survey score > 4/5)
- Percentage of teachers actively accessing their feedback (target: >80%)

### 7.2. Business metrics
- User adoption and retention rates (target: >85% retention)
- Number of schools onboarded (first-year target: 50 schools)
- Platform usage statistics (target: >75% of users active weekly)
- Customer satisfaction and Net Promoter Score (target: NPS >40)

### 7.3. Technical metrics
- System uptime (target: 99.9%)
- Average mobile page load time (target: <1.5 seconds)
- API response time (target: <300ms)
- Offline sync success rate (target: >99%)
- Error rate (target: <0.1%)

## 8. Technical considerations
### 8.1. Integration points
- Clerk for authentication and user management
- Convex for database and backend functionality
- OpenAI or equivalent LLM for concise feedback generation
- Export functionality to PDF and common spreadsheet formats

### 8.2. Data storage & privacy
- Role-based access controls for all observation data
- School-level data isolation to prevent cross-school data access
- Encrypted storage of all observation content
- Compliance with FERPA and education data privacy requirements
- Data retention policies aligned with educational record requirements

### 8.3. Scalability & performance
- Mobile-optimized database queries and UI rendering
- Offline-first architecture with sync capabilities
- Caching strategies for frequently accessed rubric content
- Asynchronous processing for AI feedback generation
- Performance optimizations for classroom environments with poor connectivity

### 8.4. Potential challenges
- Ensuring consistent, high-quality AI feedback from brief evidence notes
- Managing user adoption and change management (shifting from formal to frequent informal feedback)
- Balancing simplicity of walkthrough form with capturing meaningful evidence
- Handling offline synchronization edge cases
- Supporting diverse school observation policies and practices

## 9. Milestones & sequencing
### 9.1. Project estimate
- Medium: 2-3 months for MVP development

### 9.2. Team size & composition
- Medium Team: 4-5 total people
  - 1 product manager, 2-3 engineers, 1 designer

### 9.3. Suggested phases
- **Phase 1:** Core authentication, Informal Walkthrough template development, basic teacher access portal (3 weeks)
  - Key deliverables: User registration, role management, mobile-optimized walkthrough form

- **Phase 2:** AI feedback generation optimized for informal feedback, draft management, Formal Observation template as secondary feature (3 weeks)
  - Key deliverables: LLM integration for concise feedback, quick editing workflow, teacher access portal

- **Phase 3:** Analytics dashboards emphasizing informal trends, mobile optimization refinement (2 weeks)
  - Key deliverables: Role-based dashboards showing feedback frequency and trends, responsive design

- **Phase 4:** Testing, refinement, and launch preparation (2 weeks)
  - Key deliverables: Quality assurance, performance optimization, launch documentation

## 10. User stories
### 10.1. Principal registration and setup
- **ID:** US-001
- **Description:** As a school principal, I want to register and set up my school in the system so that my team can begin using the platform for frequent walkthroughs and feedback.
- **Acceptance criteria:**
  - Principal can register with school email and basic school information
  - Principal can invite assistant principals and instructional coaches
  - Principal can verify school details and instructional focus areas
  - System provisions appropriate role-based access for the principal

### 10.2. Conducting a formal observation
- **ID:** US-002
- **Description:** As an instructional coach, I want to complete a formal observation using the LER rubric so that I can provide comprehensive feedback to a teacher.
- **Note:** This is a secondary workflow, available for users who wish to consolidate all observation types, but not the core focus of the platform.
- **Acceptance criteria:**
  - Coach can select a teacher and initiate a formal observation
  - All LER domains and indicators are available for rating
  - Each indicator has fields for numeric rating and evidence
  - Observation can be saved as draft and resumed later
  - System validates that all required fields are completed before finalization

### 10.3. Conducting an informal walkthrough
- **ID:** US-003
- **Description:** As an assistant principal, I want to complete a quick informal walkthrough so that I can provide timely, focused feedback without a full evaluation.
- **Note:** This is the primary, most critical user flow for observers.
- **Acceptance criteria:**
  - AP can select a teacher and initiate an informal walkthrough
  - AP can quickly select 1-3 LER indicators observed during the walkthrough
  - System provides simplified fields for brief evidence notes
  - The entire process can be completed in under 10 minutes
  - No numeric ratings are required for informal walkthroughs
  - Walkthrough can be completed on mobile devices in classroom settings
  - Walkthrough can be saved as draft and resumed later

### 10.4. Generating AI feedback
- **ID:** US-004
- **Description:** As an observer, I want the system to generate AI feedback based on my observation notes so that I can save time while providing quality feedback.
- **Acceptance criteria:**
  - System generates concise, actionable feedback from brief evidence notes typical of informal walkthroughs
  - System also supports generating comprehensive feedback for formal observations
  - AI feedback is aligned with the LER rubric standards
  - Feedback distinguishes between areas of strength and growth
  - Observer can quickly edit or replace any AI-generated content
  - Generation occurs within 30 seconds of request

### 10.5. Reviewing personal feedback
- **ID:** US-005
- **Description:** As a teacher, I want to access and review all my feedback interactions so that I can understand my strengths and areas for growth.
- **Acceptance criteria:**
  - Teacher can see a feed of all completed walkthroughs and observations
  - Feed shows both informal feedback snippets and formal observations
  - Teacher can view full details of each feedback interaction
  - Feedback is presented in a clear, organized format
  - Teacher can download feedback reports as PDF
  - System notifies teacher when new feedback is available

### 10.6. Viewing school-wide analytics
- **ID:** US-006
- **Description:** As a principal, I want to access analytics about walkthrough patterns and feedback across my school so that I can identify trends and plan professional development.
- **Acceptance criteria:**
  - Principal can view dashboard showing walkthrough frequency by teacher
  - Dashboard highlights which indicators are receiving the most feedback
  - Principal can track developmental trends between formal evaluations
  - Dashboard includes filters for date ranges and observation types
  - Data visualizations clearly highlight trends and patterns
  - Principal can export reports for external use

### 10.7. Managing draft walkthroughs and observations
- **ID:** US-007
- **Description:** As an observer, I want to manage my draft walkthroughs and observations so that I can complete them when I have time.
- **Acceptance criteria:**
  - Observer can see a list of all draft walkthroughs and observations
  - System shows the completion status of each draft
  - Observer can resume editing any draft
  - System automatically saves changes while editing
  - Observer can delete drafts if needed

### 10.8. Secure authentication
- **ID:** US-008
- **Description:** As a user, I want secure authentication so that observation data remains private and secure.
- **Acceptance criteria:**
  - Users can login with email/password or SSO options
  - Password requirements follow security best practices
  - System enforces role-based access controls
  - Session timeouts occur after period of inactivity
  - Failed login attempts are limited to prevent brute force attacks

### 10.9. Mobile walkthrough completion
- **ID:** US-009
- **Description:** As an observer, I want to complete informal walkthroughs on my mobile device while in the classroom so that I can capture real-time notes and provide immediate feedback.
- **Note:** This feature is critical for the primary use case of frequent, on-the-go informal walkthroughs.
- **Acceptance criteria:**
  - Walkthrough forms are fully functional on mobile devices
  - Touch interfaces are optimized with large targets for in-classroom use
  - Forms adapt to different screen sizes without loss of functionality
  - Minimal typing is required with smart defaults and quick selection options
  - Offline mode allows completion when internet connection is unstable
  - Data syncs automatically when connection is restored

### 10.10. Comparing teacher growth over time
- **ID:** US-010
- **Description:** As an instructional coach, I want to compare a teacher's growth trends over time so that I can track their professional development.
- **Acceptance criteria:**
  - Coach can select a specific teacher to view longitudinal data
  - System visualizes trends based on the accumulation of frequent informal feedback points over time, potentially alongside formal observation data
  - Visualization highlights changes in specific domains and indicators
  - Coach can filter by observation type or date range
  - Growth patterns are clearly identified and highlighted