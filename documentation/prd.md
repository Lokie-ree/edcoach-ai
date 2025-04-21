# PRD: EdCoach AI

## 1. Product overview
### 1.1 Document title and version
- PRD: EdCoach AI
- Version: 1.0
- Date: April 11, 2025
- Author/Owner: Randall LaPoint, Jr.
- Status: In Progress


### 1.2 Product summary
EdCoach AI is an AI-powered instructional support platform designed to streamline the classroom observation process in K-12 schools. The system automates and enhances the workflow between school leaders, instructional coaches, and teachers by digitizing observation forms, generating instant rubric-aligned feedback, and tracking teacher growth at the school level.

The platform addresses the critical pain point of time-consuming, inconsistent classroom observations by providing structured templates based on the Learning Environment Rubric (LER), AI-assisted feedback generation, and role-based dashboards for monitoring professional growth.

## 2. Goals
### 2.1 Business goals
- Reduce the administrative burden of classroom observations by 50%
- Improve consistency of teacher feedback across different observers
- Create a scalable platform that can expand to serve multiple schools and districts
- Establish a foundation for future feature expansion (custom rubrics, district-level analytics)
- Build a sustainable business model through school/district subscriptions

### 2.2 User goals
- **School Leaders:** Efficiently monitor teaching quality across their school and identify trends for professional development
- **Instructional Coaches:** Complete observations quickly with high-quality, consistent feedback
- **Teachers:** Receive timely, actionable feedback aligned with professional teaching standards

### 2.3 Non-goals
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
- **Principals:** School leaders responsible for overall instructional quality, teacher evaluation, and school improvement
- **Assistant Principals/Instructional Coaches:** Educational leaders who conduct regular observations and provide coaching to teachers
- **Teachers:** Classroom instructors who receive observation feedback and work on professional growth

### 3.3 Role-based access
- **Principals:** Can conduct observations, view all staff data/analytics, and access comprehensive school dashboards
- **Assistant Principals/Instructional Coaches:** Can conduct observations, access assigned teacher data, and view limited analytics
- **Teachers:** Can view/download their own observation results and feedback, access personal growth analytics

## 4. Functional requirements
- **Observation Form (LER)** (Priority: High)
  - Support for two observation templates: Formal Observation and Informal Walkthrough
  - Digital form with all LER domains and indicators
  - Ability to input ratings and evidence for each indicator
  
- **Draft/Finalized Status** (Priority: High)
  - Allow observations to be saved as draft for later completion
  - Provide finalization workflow before sharing with teachers
  
- **AI-Generated Feedback** (Priority: High)
  - Generate contextual, rubric-aligned feedback from observation notes
  - Allow observers to edit AI suggestions before finalizing
  
- **Teacher Feedback Access** (Priority: High)
  - Secure portal for teachers to view their observation results
  - Ability to download observation reports
  
- **Analytics Dashboard** (Priority: Medium)
  - Role-based dashboards scoped to the user's school
  - Visualization of observation frequency, ratings, and trends
  
- **Authentication and Role Management** (Priority: High)
  - Secure login, registration, and session management via Clerk
  - Role and permission management in Convex DB
  
- **Device Optimization** (Priority: Medium)
  - Responsive design for desktop, tablet, and mobile use

## 5. User experience
### 5.1. Entry points & first-time user flow
- Users register with their school email and are assigned appropriate roles
- First-time login presents a brief onboarding tutorial explaining key features
- Role-specific dashboards serve as the landing page after login
- Prominent "New Observation" button for coaches and administrators

### 5.2. Core experience
- **Creating an observation:** Observers select a teacher and observation template, then complete the form
  - Clear, structured interface with help text explaining rubric components
  - Progress indicators show completion status for each section
  
- **Generating feedback:** After completing observation notes, AI generates feedback suggestions
  - Observers can edit, refine, or replace AI suggestions before finalizing
  - System ensures feedback aligns with entered ratings and evidence
  
- **Reviewing observations:** Teachers access a feed of their completed observations
  - Clean, distraction-free reading experience with option to download
  - Historical view allows tracking growth over time

### 5.3. Advanced features & edge cases
- Handling incomplete observations with draft status
- Managing feedback for underperforming indicators with constructive language
- Supporting offline completion of observations when internet connectivity is limited
- Bulk export of observation data for external reporting requirements

### 5.4. UI/UX highlights
- Color-coded rubric indicators for quick visual reference of ratings
- Split-screen view showing evidence and feedback side-by-side
- Mobile-optimized forms for on-the-go classroom observations
- Accessible design supporting screen readers and keyboard navigation

## 6. Narrative
Principal Maria is struggling to keep up with teacher observations at her K-8 school. With 35 teachers requiring both formal and informal observations throughout the year, she and her two APs are spending countless hours writing up feedback, often days after the actual classroom visit. She discovers EdCoach AI and is immediately drawn to its streamlined observation process. Now, Maria completes observations on her tablet during classroom visits, and the AI helps generate high-quality feedback that she can quickly review and customize. Teachers receive timely, consistent feedback, and Maria can actually see school-wide instructional trends through the analytics dashboard.

## 7. Success metrics
### 7.1. User-centric metrics
- Average time to complete an observation reduced by 40%
- Teacher satisfaction with feedback quality (survey score >4/5)
- Frequency of observation completion (target: 95% of required observations)
- Percentage of teachers actively accessing their feedback (target: >80%)

### 7.2. Business metrics
- User adoption and retention rates (target: >85% retention)
- Number of schools onboarded (first-year target: 50 schools)
- Platform usage statistics (target: >75% of users active weekly)
- Customer satisfaction and Net Promoter Score (target: NPS >40)

### 7.3. Technical metrics
- System uptime (target: 99.9%)
- Average page load time (target: <2 seconds)
- API response time (target: <500ms)
- Error rate (target: <0.1%)

## 8. Technical considerations
### 8.1. Integration points
- Clerk for authentication and user management
- Convex for database and backend functionality
- OpenAI or equivalent LLM for feedback generation
- Export functionality to PDF and common spreadsheet formats

### 8.2. Data storage & privacy
- Role-based access controls for all observation data
- School-level data isolation to prevent cross-school data access
- Encrypted storage of all observation content
- Compliance with FERPA and education data privacy requirements
- Data retention policies aligned with educational record requirements

### 8.3. Scalability & performance
- Database design optimized for school-level queries
- Caching strategies for frequently accessed rubric content
- Asynchronous processing for AI feedback generation
- Performance monitoring for LLM API calls
- Load testing for concurrent observation submissions

### 8.4. Potential challenges
- Ensuring consistent, high-quality AI feedback across different teaching contexts
- Managing user expectations around AI capabilities
- Balancing granular permission controls with ease of administration
- Handling peak usage periods (e.g., end of grading periods)
- Supporting diverse school observation policies and practices

## 9. Milestones & sequencing
### 9.1. Project estimate
- Medium: 2-3 months for MVP development

### 9.2. Team size & composition
- Medium Team: 4-5 total people
  - 1 product manager, 2-3 engineers, 1 designer

### 9.3. Suggested phases
- **Phase 1:** Core authentication and observation form development (3 weeks)
  - Key deliverables: User registration, role management, basic observation forms

- **Phase 2:** AI feedback generation and teacher portal (3 weeks)
  - Key deliverables: LLM integration, feedback editing workflow, teacher access portal

- **Phase 3:** Analytics dashboards and mobile optimization (2 weeks)
  - Key deliverables: Role-based dashboards, data visualization, responsive design

- **Phase 4:** Testing, refinement, and launch preparation (2 weeks)
  - Key deliverables: Quality assurance, performance optimization, launch documentation

## 10. User stories
### 10.1. Principal registration and setup
- **ID:** US-001
- **Description:** As a school principal, I want to register and set up my school in the system so that my team can begin using the platform for observations.
- **Acceptance criteria:**
  - Principal can register with school email and basic school information
  - Principal can invite assistant principals and instructional coaches
  - Principal can verify school details and observation requirements
  - System provisions appropriate role-based access for the principal

### 10.2. Conducting a formal observation
- **ID:** US-002
- **Description:** As an instructional coach, I want to complete a formal observation using the LER rubric so that I can provide comprehensive feedback to a teacher.
- **Acceptance criteria:**
  - Coach can select a teacher and initiate a formal observation
  - All LER domains and indicators are available for rating
  - Each indicator has fields for numeric rating and evidence
  - Observation can be saved as draft and resumed later
  - System validates that all required fields are completed before finalization

### 10.3. Conducting an informal walkthrough
- **ID:** US-003
- **Description:** As an assistant principal, I want to complete a quick informal walkthrough so that I can provide timely, focused feedback without a full evaluation.
- **Acceptance criteria:**
  - AP can select a teacher and initiate an informal walkthrough
  - AP can select up to 3 LER indicators observed during the walkthrough
  - System provides fields for reinforcement, refinement, and specific feedback
  - No numeric ratings are required for informal walkthroughs
  - Observation can be saved as draft and resumed later

### 10.4. Generating AI feedback
- **ID:** US-004
- **Description:** As an observer, I want the system to generate AI feedback based on my observation notes so that I can save time while providing quality feedback.
- **Acceptance criteria:**
  - System generates contextual feedback based on ratings and evidence
  - AI feedback is aligned with the LER rubric standards
  - Feedback distinguishes between areas of strength and growth
  - Observer can edit or replace any AI-generated content
  - Generation occurs within 30 seconds of request

### 10.5. Reviewing personal observation feedback
- **ID:** US-005
- **Description:** As a teacher, I want to access and review my observation feedback so that I can understand my strengths and areas for growth.
- **Acceptance criteria:**
  - Teacher can see a list of all completed observations
  - Teacher can view full details of each observation
  - Feedback is presented in a clear, organized format
  - Teacher can download observation reports as PDF
  - System notifies teacher when new feedback is available

### 10.6. Viewing school-wide analytics
- **ID:** US-006
- **Description:** As a principal, I want to access analytics about observation patterns and ratings across my school so that I can identify trends and plan professional development.
- **Acceptance criteria:**
  - Principal can view dashboard showing observation frequency by teacher
  - Principal can see average ratings by domain across the school
  - Dashboard includes filters for date ranges and observation types
  - Data visualizations clearly highlight trends and patterns
  - Principal can export reports for external use

### 10.7. Managing draft observations
- **ID:** US-007
- **Description:** As an observer, I want to manage my draft observations so that I can complete them when I have time.
- **Acceptance criteria:**
  - Observer can see a list of all draft observations
  - System shows the completion status of each draft
  - Observer can resume editing any draft observation
  - System automatically saves changes while editing
  - Observer can delete draft observations if needed

### 10.8. Secure authentication
- **ID:** US-008
- **Description:** As a user, I want secure authentication so that observation data remains private and secure.
- **Acceptance criteria:**
  - Users can login with email/password or SSO options
  - Password requirements follow security best practices
  - System enforces role-based access controls
  - Session timeouts occur after period of inactivity
  - Failed login attempts are limited to prevent brute force attacks

### 10.9. Mobile observation completion
- **ID:** US-009
- **Description:** As an observer, I want to complete observations on my mobile device while in the classroom so that I can capture real-time notes and feedback.
- **Acceptance criteria:**
  - Observation forms are fully functional on mobile devices
  - Touch interfaces are optimized for in-classroom use
  - Forms adapt to different screen sizes without loss of functionality
  - Offline mode allows completion when internet connection is unstable
  - Data syncs automatically when connection is restored

### 10.10. Comparing teacher growth over time
- **ID:** US-010
- **Description:** As an instructional coach, I want to compare a teacher's observation results over time so that I can track their professional growth.
- **Acceptance criteria:**
  - Coach can select a specific teacher to view longitudinal data
  - System displays observation ratings across multiple time periods
  - Visualization highlights changes in specific domains and indicators
  - Coach can filter by observation type or date range
  - Growth patterns are clearly identified and highlighted