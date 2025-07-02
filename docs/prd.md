# PRD: EdCoach AI

## 1. Product overview
### 1.1 Document title and version
- PRD: EdCoach AI
- Version: 1.0

### 1.2 Product summary
EdCoach AI is an AI-powered instructional coaching and feedback platform designed specifically for K-12 schools. The platform focuses on frequent, informal classroom walkthroughs, enabling coaches to conduct efficient observations and generate high-quality, rubric-aligned feedback for teachers.

The system delivers fast, AI-generated feedback through a mobile-first, low-burden walkthrough capture process. Built around a coach-managed teacher group model, the platform establishes direct coach-teacher relationships within the application, allowing coaches to invite and manage their teachers while providing subscription-based access for premium features.

The MVP emphasizes simplicity and speed to market, focusing on core value propositions of reducing walkthrough time, improving feedback frequency and consistency, and building a scalable subscription-based platform for educational coaching.

## 2. Goals
### 2.1 Business goals
- Reduce time for walkthroughs and feedback generation by 40%
- Build a scalable, subscription-based platform with sustainable revenue model
- Achieve coach subscription conversion rate of >70%
- Establish market presence in K-12 instructional coaching technology
- Create a foundation for future expansion to district-wide implementations

### 2.2 User goals
- **Coach goals:** Conduct efficient walkthroughs, manage teacher groups directly, access basic analytics for coaching activity, and maintain active subscriptions
- **Teacher goals:** Receive timely, actionable feedback and easily review feedback history
- Improve feedback frequency to >2 interactions per teacher per month
- Achieve >70% dashboard and basic analytics usage by coaches
- Maintain teacher satisfaction rating >4/5 for received feedback

### 2.3 Non-goals
- Formal observation support (deferred post-MVP)
- Bulk teacher invitation capabilities (deferred post-MVP)
- Advanced offline capabilities (deferred post-MVP)
- Comprehensive file exports and reporting features (deferred post-MVP)
- District-wide organization management (deferred post-MVP)
- Multi-coach team management within single organizations

## 3. User personas
### 3.1 Key user types
- Instructional coaches
- K-12 teachers
- Educational administrators (future consideration)

### 3.2 Basic persona details
- **Instructional Coaches**: Educational professionals responsible for supporting teacher development through classroom observations and feedback, seeking efficient tools to manage their coaching responsibilities
- **K-12 Teachers**: Classroom educators who receive coaching support and feedback, wanting accessible and actionable insights to improve their teaching practice

### 3.3 Role-based access
- **Coach**: Can create and manage teacher groups, invite teachers, conduct walkthroughs, generate AI feedback, view analytics for their coaching activity, and manage subscriptions
- **Teacher**: Can view received feedback, review feedback history, and access their personal dashboard (no subscription required)

## 4. Functional requirements
- **User Authentication and Onboarding** (Priority: High)
  - Clerk-based authentication for both coaches and teachers
  - Role-specific onboarding tutorials
  - Coach subscription verification and activation

- **Subscription Management** (Priority: High)
  - Clerk Billing integration for Coach Plan subscriptions
  - Feature gating for non-subscribed users
  - Self-service subscription management portal

- **Teacher Invitation System** (Priority: High)
  - Coach-initiated teacher invitations via email
  - Automated teacher account creation upon invite acceptance
  - Direct coach-teacher relationship establishment

- **Walkthrough Capture** (Priority: High)
  - Mobile-first walkthrough interface
  - Indicator selection (1 reinforcement, 1 refinement)
  - Evidence recording capabilities

- **AI Feedback Generation** (Priority: High)
  - OpenAI GPT-4 integration for feedback creation
  - Rubric-aligned feedback templates
  - Coach review and editing capabilities before submission

- **Dashboard and Analytics** (Priority: Medium)
  - Role-based dashboards for coaches and teachers
  - Basic coaching activity analytics
  - Teacher feedback history display

- **Teacher Management** (Priority: Medium)
  - Coach ability to view and manage their teacher group
  - Teacher profile management
  - Invitation status tracking

## 5. User experience
### 5.1. Entry points & first-time user flow
- Direct signup for coaches through marketing website
- Teacher entry via email invitation from coaches
- Clear role identification during signup process
- Subscription requirement verification for coach features

### 5.2. Core experience
- **Coach signup and activation**: New coaches sign up directly, subscribe to Coach Plan, and complete onboarding tutorial
  - Streamlined subscription flow with clear value proposition and immediate access post-payment
- **Teacher invitation process**: Coaches use intuitive "Add Teacher" interface to send email invitations
  - Simple form with email input and automated invitation delivery with branded emails
- **Walkthrough execution**: Coaches select teachers, choose indicators, record evidence, and generate AI feedback
  - Mobile-optimized interface with quick indicator selection and voice/text evidence capture
- **Feedback review and delivery**: AI-generated feedback is reviewed by coaches before delivery to teachers
  - Clear editing interface with rubric alignment indicators and preview capabilities

### 5.3. Advanced features & edge cases
- Subscription renewal and payment failure handling
- Teacher invitation expiration and re-invitation capabilities
- Coach account suspension for non-payment scenarios
- Teacher access to feedback when coach subscription lapses

### 5.4. UI/UX highlights
- Mobile-first design optimized for quick walkthrough capture
- Clean, intuitive dashboard interfaces for both user roles
- Seamless subscription flow integration with Clerk Billing
- Responsive design ensuring functionality across all device types

## 6. Narrative
Sarah is an instructional coach who wants to provide more frequent, high-quality feedback to her teachers because she believes consistent coaching improves student outcomes. She finds EdCoach AI and realizes it can help her conduct walkthroughs in under 10 minutes while generating professional, rubric-aligned feedback. After subscribing to the Coach Plan, Sarah invites her teachers to the platform and begins conducting more frequent classroom visits. The AI-powered feedback saves her hours of writing time while ensuring consistency across all her coaching interactions, allowing her to support more teachers effectively and ultimately improve instruction quality throughout her school.

## 7. Success metrics
### 7.1. User-centric metrics
- Walkthrough completion time averaging under 10 minutes
- Teacher satisfaction rating >4/5 for received feedback
- Successful teacher invitation and onboarding rate >85%
- Dashboard usage by coaches >70%
- Feedback frequency >2 interactions per teacher per month

### 7.2. Business metrics
- Coach subscription conversion rate >70%
- Monthly recurring revenue growth
- Customer lifetime value
- Churn rate for coach subscriptions <10% monthly
- Trial-to-paid conversion rate (if trial offered)

### 7.3. Technical metrics
- Platform uptime >99.5%
- AI feedback generation time <30 seconds
- Mobile app performance scores >90
- Email delivery success rate >95%
- Database query response times <200ms

## 8. Technical considerations
### 8.1. Integration points
- Clerk authentication and billing system integration
- OpenAI GPT-4 API for feedback generation
- Email service integration for teacher invitations
- Convex real-time database and functions
- Stripe payment processing through Clerk Billing

### 8.2. Data storage & privacy
- Secure storage of educational observation data in Convex
- FERPA compliance for student-related information
- User data protection following educational privacy standards
- Secure handling of AI-generated feedback content
- Audit logging for all coaching activities

### 8.3. Scalability & performance
- Convex real-time database architecture for automatic scaling
- Efficient AI feedback generation with response time optimization
- Mobile-optimized performance for field usage
- Subscription-based resource allocation and usage monitoring

### 8.4. Potential challenges
- AI feedback quality consistency and accuracy
- Mobile connectivity issues during classroom walkthroughs
- Coach subscription renewal and payment processing
- Teacher adoption and engagement rates
- Integration complexity with existing school systems

## 9. Milestones & sequencing
### 9.1. Project estimate
- Medium: 3-4 months for MVP completion

### 9.2. Team size & composition
- Medium Team: 4-5 total people
  - 1 Product manager, 2-3 Engineers, 1 Designer, 1 QA specialist

### 9.3. Suggested phases
- **Phase 1**: Core authentication, subscription, and invitation system (4-6 weeks)
  - Key deliverables: User signup, Clerk integration, subscription flow, teacher invitation system
- **Phase 2**: Walkthrough capture and AI feedback generation (4-6 weeks)
  - Key deliverables: Mobile walkthrough interface, OpenAI integration, feedback review system
- **Phase 3**: Dashboards, analytics, and platform polish (2-3 weeks)
  - Key deliverables: Role-based dashboards, basic analytics, final testing and launch preparation

## 10. User stories
### 10.1. Coach account creation and subscription
- **ID**: US-001
- **Description**: As a potential coach, I want to sign up for EdCoach AI and subscribe to the Coach Plan so that I can access coaching features and manage my teachers.
- **Acceptance criteria**:
  - Users can sign up using email through Clerk authentication
  - New users are identified as provisional coaches in the system
  - Subscription flow is integrated and functional with Clerk Billing
  - Upon successful subscription, user role is updated to "coach"
  - Coach-specific onboarding tutorial is displayed after subscription

### 10.2. Coach teacher invitation
- **ID**: US-002
- **Description**: As a coach, I want to invite teachers to my group so that I can conduct walkthroughs and provide feedback to them.
- **Acceptance criteria**:
  - Coach can access "Add Teacher" interface from dashboard
  - System creates invitation record in database with unique token
  - Branded invitation email is sent to teacher's email address
  - Invitation includes secure link to join coach's group
  - System tracks invitation status (pending, accepted, expired)

### 10.3. Teacher invitation acceptance
- **ID**: US-003
- **Description**: As a teacher, I want to accept a coach's invitation so that I can join their group and receive feedback.
- **Acceptance criteria**:
  - Teacher can click invitation link and be directed to signup/login
  - System verifies invitation token and links teacher to coach
  - Teacher's role is automatically set to "teacher" upon acceptance
  - Teacher is shown teacher-specific onboarding tutorial
  - Direct relationship between coach and teacher is established in database

### 10.4. Walkthrough creation and execution
- **ID**: US-004
- **Description**: As a coach, I want to conduct a classroom walkthrough so that I can gather evidence for teacher feedback.
- **Acceptance criteria**:
  - Coach can select a teacher from their managed group
  - Interface allows selection of exactly 1 indicator for reinforcement and 1 for refinement
  - Evidence can be recorded via text input or voice notes
  - Walkthrough data is saved and can be resumed if interrupted
  - Mobile interface is optimized for field use

### 10.5. AI feedback generation
- **ID**: US-005
- **Description**: As a coach, I want the system to generate AI-powered feedback based on my walkthrough evidence so that I can provide consistent, high-quality feedback to teachers.
- **Acceptance criteria**:
  - System integrates with OpenAI GPT-4 for feedback generation
  - Generated feedback is rubric-aligned and professional
  - Feedback includes both reinforcement and refinement sections
  - Generation process completes within 30 seconds
  - AI usage is logged for billing and analytics purposes

### 10.6. Feedback review and editing
- **ID**: US-006
- **Description**: As a coach, I want to review and edit AI-generated feedback before sending it to teachers so that I can ensure accuracy and personalization.
- **Acceptance criteria**:
  - Coach can view AI-generated feedback in editable format
  - Text editing capabilities are available for all feedback sections
  - Preview mode shows how feedback will appear to teacher
  - Coach can save edits and revert to original AI-generated version
  - Feedback cannot be sent until coach explicitly approves it

### 10.7. Feedback submission and delivery
- **ID**: US-007
- **Description**: As a coach, I want to submit finalized feedback to teachers so that they can receive and act on the coaching insights.
- **Acceptance criteria**:
  - Coach can submit approved feedback with single action
  - Feedback is immediately available in teacher's dashboard
  - System creates audit log of feedback submission
  - Feedback cannot be edited after submission
  - Teacher receives notification of new feedback availability

### 10.8. Teacher feedback viewing
- **ID**: US-008
- **Description**: As a teacher, I want to view feedback from my coach so that I can understand areas for improvement and reinforcement.
- **Acceptance criteria**:
  - Teacher can access all their received feedback from dashboard
  - Feedback is displayed in chronological order with dates
  - Each feedback item shows clear reinforcement and refinement sections
  - Teacher can view feedback details and associated walkthrough information
  - Interface is mobile-responsive for convenient access

### 10.9. Coach dashboard and analytics
- **ID**: US-009
- **Description**: As a coach, I want to view my coaching activity dashboard so that I can track my progress and manage my teacher group.
- **Acceptance criteria**:
  - Dashboard displays summary of recent walkthrough activity
  - Basic analytics show number of walkthroughs conducted and feedback given
  - Teacher group management interface shows all invited teachers and their status
  - Coach can view their subscription status and billing information
  - Quick action buttons for common tasks are prominently displayed

### 10.10. Teacher dashboard
- **ID**: US-010
- **Description**: As a teacher, I want to access my personal dashboard so that I can review my feedback history and coaching progress.
- **Acceptance criteria**:
  - Dashboard shows overview of recent feedback received
  - Teacher can access complete feedback history
  - Interface displays feedback trends and areas of focus
  - Dashboard is accessible from any device with responsive design
  - Teacher can view coach contact information and support resources

### 10.11. Subscription management
- **ID**: US-011
- **Description**: As a coach, I want to manage my subscription so that I can maintain access to coaching features and update payment information.
- **Acceptance criteria**:
  - Coach can access Clerk Account Portal for subscription management
  - Payment method updates are processed securely
  - Subscription status changes are reflected immediately in the application
  - Coach receives notifications about upcoming renewals and payment issues
  - Feature access is automatically gated based on subscription status

### 10.12. Secure access and authentication
- **ID**: US-012
- **Description**: As a user, I want secure access to the platform so that my educational data and coaching information are protected.
- **Acceptance criteria**:
  - All users must authenticate through Clerk before accessing any features
  - Session management maintains security while providing convenient access
  - Role-based access controls prevent unauthorized feature usage
  - Educational data is encrypted and stored securely
  - Audit logs track all significant user actions for compliance purposes 