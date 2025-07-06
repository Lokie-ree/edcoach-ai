# EdCoach AI: Technical PRD & Implementation Guide
**Version**: 2.0 (Consolidated)  
**Status**: MVP Implementation Complete, Future Feature Planning  
**Target Launch**: July 28th, 2025  
**Last Updated**: July 2, 2025

---

## 1. Product Overview & Current State

### 1.1 Product Summary
EdCoach AI is an AI-powered instructional coaching platform for K-12 schools focusing on frequent, informal classroom walkthroughs. The platform generates rubric-aligned feedback through mobile-first capture and establishes direct coach-teacher relationships for personalized professional development.

### 1.2 Current Implementation Status
- **Authentication & Onboarding**: ✅ Complete - Clerk integration with role-based flows
- **Subscription Management**: ✅ Complete - Two-plan system (Coach Starter $7/mo, Coach Pro $15/mo, managed via Clerk Billing)
- **Teacher Invitation System**: ✅ Complete - Email-based invitations with direct relationship
- **Walkthrough Capture**: ✅ Complete - Mobile-first with indicator selection
- **AI Feedback Generation**: ✅ Complete - OpenAI integration with LER rubric alignment
- **Dashboard & Analytics**: ✅ Complete - Role-based dashboards with usage tracking
- **Teacher Management**: ✅ Complete - Coach-managed teacher groups

### 1.3 Architecture & Technology Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, MagicUI
- **Backend**: Convex (real-time database, functions, schema)
- **Authentication**: Clerk (user management, role-based access)
- **AI Integration**: OpenAI GPT-4.1 Mini (feedback generation)
- **Billing**: Clerk Billing (subscription management, feature flags)
- **Email**: Convex Resend Component (invitation system)

---

## 2. User Personas & Roles

### 2.1 Coach (Primary User)
- **Role**: `coach` in user.role field
- **Subscription**: Required (Coach Starter $7/mo or Coach Pro $15/mo)
- **Capabilities**: 
  - Manage direct teacher relationships
  - Conduct walkthroughs with indicator selection
  - Generate/edit AI feedback
  - View analytics and usage tracking
  - Manage subscription through Clerk Billing

### 2.2 Teacher (Secondary User)
- **Role**: `teacher` in user.role field
- **Subscription**: None required
- **Capabilities**:
  - View received feedback
  - Access personal dashboard
  - Review feedback history
  - Download/export feedback (pro feature)

---

## 3. Technical Architecture

### 3.1 Database Schema (Convex)
```typescript
// Current implementation - Direct coach-teacher relationship
users: {
  clerkId: string,
  role: "coach" | "teacher",
  onboardingComplete: boolean,
  // No subscription data stored - managed by Clerk Billing
}

teachers: {
  coachId: Id<"users">, // Direct relationship
  userId: Id<"users">, // Populated after invitation acceptance
  email: string,
  status: "pending" | "active" | "needs_details",
}

invitations: {
  coachId: Id<"users">,
  teacherEmail: string,
  token: string,
  status: "pending" | "accepted" | "expired",
}

walkthroughs: {
  teacherId: Id<"teachers">,
  observerId: Id<"users">,
  reinforcementIndicator: string,
  refinementIndicator: string,
  evidenceSummary: string,
  status: "draft" | "completed",
}
```

### 3.2 Subscription Plans (Current Implementation)

> **Note:** Pricing and feature flags are managed in Clerk Billing. Usage limits and feature gating are enforced in-app, not via Clerk.

| Plan           | Price      | Teachers | Walkthroughs/mo | Analytics         | Retention | Bulk Invites | Export | Priority Support |
|----------------|------------|----------|-----------------|-------------------|-----------|--------------|--------|------------------|
| Coach Starter  | $7/month   | 3        | 10              | Basic             | 30 days   | No           | No     | No               |
| Coach Pro      | $15/month  | 15       | 50              | Advanced (charts) | 90 days   | Yes          | Yes    | Yes              |

- All plans are managed via Clerk Billing. Pricing is not stored in code.
- Feature flags (e.g., `advanced_analytics`, `bulk_invitations`, `feedback_export`, `priority_support`) are set in Clerk and checked in-app.
- Usage limits (teachers, walkthroughs) are enforced in Convex and the frontend.

### 3.3 AI Integration Architecture
**Current Prompt Structure** (from PROMPTITERATION_V1.md):

You are EdCoach AI, an expert instructional coaching assistant. Your mission is to generate concise, actionable, and rubric-aligned feedback for K-12 teachers in Louisiana, based on brief informal classroom walkthroughs. The feedback must be deeply rooted in the provided Louisiana Educator Rubric (LER) indicators, their detailed explanations, key terms, evidence of student-centered learning, and the observer's notes. Maintain a supportive, encouraging, and growth-oriented coaching tone. The output should be 3-4 sentences total.

**Enhanced Context Integration** (from AI_FEEDBACK_REVISION.md):
- LER indicator details with full descriptions
- Key terms from LER Handbook
- Evidence of effective practice explanations
- Student-centered learning behaviors
- Observer's notes integration

### 3.4 Usage Tracking & Limits
- **Coach Starter**: 3 teachers, 10 walkthroughs/month, 30-day analytics retention
- **Coach Pro**: 15 teachers, 50 walkthroughs/month, 90-day analytics retention, bulk invites, export, priority support
- All usage limits are enforced in-app (Convex/backend + frontend), not by Clerk
- Feature flags are checked via Clerk's `has({ feature: ... })` or plan in-app

---

## 4. Core Features & User Stories

### 4.1 Authentication & Onboarding

**US-001: Coach Account Creation**
- **Description**: As a new coach, I want to sign up and access coaching features
- **Current Implementation**: 
  - Clerk authentication with role detection
  - Automatic assignment to coach_starter plan
  - Role-specific onboarding tutorial
  - Subscription upgrade flow to coach_pro
- **Acceptance Criteria**: ✅ Complete
  - User signs up via Clerk
  - Role set to "coach" in publicMetadata
  - Onboarding tutorial displays
  - Plan limits applied immediately

**US-002: Teacher Invitation Acceptance**
- **Description**: As a teacher, I want to accept a coach's invitation to join their group
- **Current Implementation**:
  - Email invitation with unique token
  - Automatic account creation on acceptance
  - Direct relationship establishment (coachId field)
  - Teacher-specific onboarding
- **Acceptance Criteria**: ✅ Complete
  - Teacher clicks invitation link
  - Account created with "teacher" role
  - Linked to inviting coach in database
  - Teacher dashboard access granted

### 4.2 Teacher Management

**US-003: Teacher Invitation System**
- **Description**: As a coach, I want to invite teachers to my group
- **Current Implementation**:
  - "Add Teacher" form in dashboard
  - Email validation and invitation creation
  - Convex Resend integration for email delivery
  - Status tracking (pending/accepted/expired)
- **Acceptance Criteria**: ✅ Complete
  - Coach enters teacher email
  - Invitation record created with unique token
  - Branded email sent via Resend
  - Status visible in coach dashboard

**US-004: Teacher Group Management**
- **Description**: As a coach, I want to manage my teacher group
- **Current Implementation**:
  - Teacher list in dashboard
  - Status indicators (pending/active)
  - Basic teacher information display
  - Plan-based limits enforcement
- **Acceptance Criteria**: ✅ Complete
  - View all invited teachers
  - See invitation status
  - Respect plan limits (5 for starter, 25 for pro)

### 4.3 Walkthrough System

**US-005: Walkthrough Creation**
- **Description**: As a coach, I want to conduct classroom walkthroughs
- **Current Implementation**:
  - Mobile-first interface
  - Teacher selection from coach's group
  - Indicator selection (1 reinforcement, 1 refinement)
  - Evidence capture (text/voice)
  - Draft/complete status management
- **Acceptance Criteria**: ✅ Complete
  - Select teacher from dropdown
  - Choose exactly 1 reinforcement & 1 refinement indicator
  - Record evidence in text form
  - Save as draft or complete

**US-006: AI Feedback Generation**
- **Description**: As a coach, I want AI to generate rubric-aligned feedback
- **Current Implementation**:
  - OpenAI GPT-4.1 Mini integration
  - LER rubric data integration
  - Prompt engineering for consistency
  - Usage tracking and limit enforcement
- **Acceptance Criteria**: ✅ Complete
  - Generate feedback for both indicators
  - Include rubric alignment
  - Complete within 30 seconds
  - Respect monthly AI usage limits

**US-007: Feedback Review & Editing**
- **Description**: As a coach, I want to review and edit AI feedback before delivery
- **Current Implementation**:
  - Editable feedback interface
  - Preview mode for teacher view
  - Save/submit functionality
  - Version tracking
- **Acceptance Criteria**: ✅ Complete
  - Edit AI-generated feedback
  - Preview teacher experience
  - Cannot edit after submission
  - Audit trail maintained

### 4.4 Dashboard & Analytics

**US-008: Coach Dashboard**
- **Description**: As a coach, I want to view my coaching activity and analytics
- **Current Implementation**:
  - Activity overview (walkthroughs, feedback)
  - AI usage tracking and limits
  - Teacher management interface
  - Quick action buttons
  - Plan usage visualization
- **Acceptance Criteria**: ✅ Complete
  - Summary of recent activity
  - AI usage progress bars
  - Teacher list with status
  - Plan upgrade prompts

**US-009: Teacher Dashboard**
- **Description**: As a teacher, I want to view my feedback and progress
- **Current Implementation**:
  - Feedback feed (chronological)
  - Feedback detail view
  - Coach contact information
  - Mobile-responsive design
- **Acceptance Criteria**: ✅ Complete
  - List all received feedback
  - View feedback details
  - See walkthrough context
  - Access coach information

### 4.5 Subscription & Billing

**US-010: Subscription Management**
- **Description**: As a coach, I want to manage my subscription
- **Current Implementation**:
  - Clerk Billing integration
  - Plan comparison interface
  - Upgrade/downgrade flows
  - Usage-based recommendations
- **Acceptance Criteria**: ✅ Complete
  - View current plan and usage
  - Upgrade to pro plan
  - Manage payment methods
  - View billing history

**US-011: Usage Enforcement**
- **Description**: As a coach, I want clear visibility into plan limits
- **Current Implementation**:
  - Real-time usage tracking
  - Progress bars and warnings
  - Soft limits with upgrade prompts
  - Monthly reset notifications
- **Acceptance Criteria**: ✅ Complete
  - Display current usage vs limits
  - Warning at 80% usage
  - Upgrade prompts at limits
  - Monthly usage reset

---

## 5. Future Feature Planning

### 5.1 Short-term Enhancements (Next 30 days)
- **Bulk Teacher Invitations**: Import CSV, send multiple invites
- **Advanced Analytics**: Trend analysis, comparative metrics
- **Feedback Export**: PDF generation for teacher records
- **Mobile App**: PWA optimization for offline capability

### 5.2 Medium-term Features (Next 90 days)
- **District-level Organizations**: Multi-coach management
- **Custom Rubrics**: Upload and manage custom evaluation criteria
- **Integration APIs**: Google Classroom, Clever, SIS systems
- **Advanced Reporting**: Principal/admin dashboards

### 5.3 Long-term Vision (Next 6 months)
- **AI-Powered Insights**: Predictive analytics for teacher growth
- **Video Integration**: Walkthrough video capture and analysis
- **Collaborative Features**: Peer coaching and observation
- **Advanced Billing**: Usage-based pricing, enterprise plans

---

## 6. Business Model & Monetization

### 6.1 Current Plan Structure
| Plan           | Price      | Teachers | Walkthroughs/mo | Analytics         | Retention | Bulk Invites | Export | Priority Support |
|----------------|------------|----------|-----------------|-------------------|-----------|--------------|--------|------------------|
| Coach Starter  | $7/month   | 3        | 10              | Basic             | 30 days   | No           | No     | No               |
| Coach Pro      | $15/month  | 15       | 50              | Advanced (charts) | 90 days   | Yes          | Yes    | Yes              |

- All plans are managed via Clerk Billing. Pricing is not stored in code.
- Feature flags (e.g., `advanced_analytics`, `bulk_invitations`, `feedback_export`, `priority_support`) are set in Clerk and checked in-app.
- Usage limits (teachers, walkthroughs) are enforced in Convex and the frontend.

### 6.2 Future Plan Considerations
**Enterprise/District Plans**
- Custom pricing for 100+ teachers
- Advanced analytics and reporting
- Integration support
- Dedicated customer success
- Custom rubric development

### 6.3 Revenue Projections
- **Target**: 1,000 active coaches by end of year
- **Average Plan Mix**: 60% Starter ($7), 40% Pro ($15)
- **Weighted Average Revenue**: $10.20/month per coach
- **Projected ARR**: $122,400 by year-end

---

## 7. Design System & Consistency Guidelines

### 7.1 UI/UX Standards
- **Design System**: shadcn/ui components with consistent theming
- **Color Palette**: Primary (blue), secondary (purple), accent colors
- **Typography**: Inter font family, consistent hierarchy
- **Spacing**: 4px grid system, consistent padding/margins
- **Responsive**: Mobile-first approach, breakpoints at 640px, 768px, 1024px

### 7.2 Component Architecture
- **Layout**: MaxWidthWrapper for content containment
- **Navigation**: Role-based navigation with consistent patterns
- **Forms**: Consistent validation and error handling
- **Loading States**: Standardized skeleton and spinner components
- **Feedback**: Toast notifications for user feedback

### 7.3 Performance Standards
- **Page Load**: <3 seconds initial load
- **AI Generation**: <30 seconds for feedback
- **Database Queries**: <200ms response time
- **Mobile Performance**: 90+ Lighthouse score

---

## 8. Technical Debt & Refactoring Opportunities

### 8.1 Current Technical Debt
- **Authentication**: Clerk Organizations migration path needed for future district features
- **Database**: Some legacy fields (clerkOrganizationId) to be cleaned up
- **API**: Standardize error handling across all Convex functions
- **Testing**: Need comprehensive E2E test coverage

### 8.2 Refactoring Priorities
1. **Subscription Logic**: Consolidate plan checking across components
2. **Type Safety**: Improve TypeScript coverage for Convex functions
3. **Component Library**: Extract common patterns into reusable components
4. **Performance**: Optimize database queries and implement caching

### 8.3 Scalability Considerations
- **Database**: Current schema supports 10K+ users
- **AI Usage**: Rate limiting and caching strategies
- **File Storage**: Convex file storage for future video features
- **Monitoring**: Implement comprehensive logging and alerting

---

## 9. AI Feedback System Enhancement

### 9.1 Current Implementation
**Basic Prompt Structure**: 3-4 sentence feedback with reinforcement and refinement
**Rubric Integration**: LER indicator alignment with basic context

### 9.2 Enhanced Context Integration (Implementation Ready)
Based on AI_FEEDBACK_REVISION.md

### 9.3 Implementation Benefits
- **Deeper AI Understanding**: More nuanced rubric comprehension
- **Precise Feedback**: Targeted suggestions based on handbook context
- **Rubric-Aligned Language**: Professional terminology integration
- **Actionable Strategies**: Evidence-based improvement recommendations

### 9.4 Technical Requirements
- **Database Enhancement**: Store rich LER indicator data
- **Prompt Engineering**: Test and refine enhanced prompts
- **Context Management**: Optimize for GPT-4.1 Mini's 1M token limit
- **Performance**: Maintain <30 second generation time

---

## 10. Email Integration System

### 10.1 Current Implementation (Convex Resend Component)
**Features**:
- Queueing: Reliable email delivery
- Batching: Efficient large group handling
- Durable execution: Guaranteed delivery
- Idempotency: Prevent duplicate sends
- Rate limiting: Respect API limits

### 10.2 Usage in EdCoach AI
```typescript
// Teacher invitation email
await resend.sendEmail(
  ctx,
  "Coach <coach@school.edu>",
  "teacher@school.edu",
  "Invitation to Join EdCoach AI",
  "Join my coaching group for personalized feedback..."
);
```

### 10.3 Webhook Integration
- **Endpoint**: `/resend-webhook` for delivery status
- **Events**: Email delivery, bounces, complaints
- **Handling**: Status updates and error management
- **Security**: Webhook signature verification

---

## 11. Security & Compliance

### 11.1 Data Protection
- **FERPA Compliance**: Educational data privacy requirements
- **Encryption**: Data at rest and in transit
- **Access Controls**: Role-based permissions and audit logging
- **Backup & Recovery**: Automated backup and disaster recovery

### 11.2 Security Monitoring
- **Audit Logs**: Comprehensive activity tracking
- **Intrusion Detection**: Monitoring for suspicious activity
- **Vulnerability Management**: Regular security assessments
- **Incident Response**: Security incident response procedures

---

## 12. Success Metrics & KPIs

### 12.1 User Engagement
- **Active Coaches**: Monthly active users conducting walkthroughs
- **Teacher Adoption**: Percentage of invited teachers who accept
- **Feedback Frequency**: Average feedback per teacher per month
- **Session Duration**: Time spent in application per session

### 12.2 Business Metrics
- **Subscription Conversion**: Free-to-paid conversion rate
- **Churn Rate**: Monthly subscription cancellation rate
- **Revenue Growth**: Monthly recurring revenue growth
- **Customer Satisfaction**: NPS scores and support ticket volume

### 12.3 Technical Performance
- **System Uptime**: 99.9% availability target
- **Response Times**: API response time monitoring
- **Error Rates**: Application error tracking and resolution
- **AI Performance**: Feedback generation success rate

---

## 13. Launch Readiness Checklist

### 13.1 MVP Features ✅
- [x] User authentication and onboarding
- [x] Subscription management (2 plans: Coach Starter $7/mo, Coach Pro $15/mo)
- [x] Teacher invitation system
- [x] Walkthrough capture and management
- [x] AI feedback generation
- [x] Role-based dashboards
- [x] Usage tracking and limits
- [x] Mobile-responsive design

### 13.2 Pre-Launch Requirements
- [ ] Comprehensive E2E testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation finalization
- [ ] User acceptance testing
- [ ] Marketing materials
- [ ] Support documentation
- [ ] Monitoring and alerting setup

### 13.3 Launch Day Preparation
- [ ] Production environment validation
- [ ] Database backup procedures
- [ ] Error monitoring activation
- [ ] Support team training
- [ ] Emergency rollback plan
- [ ] Performance baselines established

---

## 14. Contact & Support

### 14.1 Technical Support
- **Documentation**: Comprehensive user guides and API docs
- **Help Center**: Searchable knowledge base
- **Support Tickets**: Priority-based support system
- **Community**: User forums and discussion groups

### 14.2 Development Team
- **Product Manager**: Feature planning and user experience
- **Engineers**: Technical implementation and maintenance
- **Designer**: UI/UX design and consistency
- **QA**: Testing and quality assurance

---

**Document Status**: This is the definitive technical specification for EdCoach AI. All future development should reference this document as the single source of truth.