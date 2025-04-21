# EdCoach AI: Application Flow Document

This document outlines the user journey through the EdCoach AI platform, detailing screen functionality, navigation paths, and key action points.

## 1. User Roles

- **Principal:** School leader with access to all observations, analytics, and user management.
- **Assistant Principal/Coach:** Conducts observations and has access to analytics for assigned teachers.
- **Teacher:** Views personal observations and growth analytics.

## 2. Screen Functionality

### 2.1 Authentication & Onboarding

#### Login/Register
- **Functionality:** User authentication via email/password or SSO.
- **Actions:** Login, register, password reset.

#### Onboarding Tutorial
- **Functionality:** Role-specific tutorial explaining key features.
- **Actions:** View tutorial steps, skip tutorial.

#### School Setup (Principal Only)
- **Functionality:** Enter school information and observation requirements.
- **Actions:** Submit school details, invite staff members, configure observation settings.

### 2.2 Dashboards

#### Principal Dashboard
- **Functionality:** Overview of all school observations and analytics.
- **Actions:**
  - Start new observation
  - View all observations (with filters)
  - Access analytics dashboard
  - Manage users and school settings
  - View drafts and pending observations

#### AP/Coach Dashboard
- **Functionality:** Overview of personal observations and assigned teacher data.
- **Actions:**
  - Start new observation
  - View personal observation history
  - Access analytics for assigned teachers
  - Manage draft observations

#### Teacher Dashboard
- **Functionality:** Feed of personal observations and growth data.
- **Actions:**
  - View observation feed (with filters)
  - Access personal growth analytics
  - Download observation reports

### 2.3 Observation Workflow

#### Teacher/Template Selection
- **Functionality:** Select teacher and observation template.
- **Actions:** Choose teacher from list, select formal or informal template.

#### Observation Form
- **Functionality:**
  - Formal: Complete LER rubric with all domains/indicators
  - Informal: Select up to 3 focus indicators
- **Actions:**
  - Enter ratings and evidence
  - Save as draft
  - Navigate between sections
  - Track completion progress

#### Draft Management
- **Functionality:** Manage saved observation drafts.
- **Actions:** Resume, edit, or delete drafts with filter/sort options.

#### AI Feedback Generation
- **Functionality:** Generate contextual feedback based on observation notes.
- **Actions:** 
  - Generate AI feedback
  - Edit suggested feedback
  - Request alternative suggestions

#### Finalization & Submission
- **Functionality:** Review and finalize observation before sharing with teacher.
- **Actions:**
  - Review all sections
  - Make final edits
  - Submit completed observation
  - Return to dashboard

### 2.4 Observation Review

#### Observer History
- **Functionality:** View history of completed observations.
- **Actions:**
  - Filter by teacher, date, type, domain, rating
  - Sort by various criteria
  - View observation details
  - Download reports

#### Principal All-Observations View
- **Functionality:** Access and manage all school observations.
- **Actions:**
  - Advanced filtering (by observer, teacher, type, etc.)
  - View observation details
  - Download reports
  - Export data

#### Teacher Observation Feed
- **Functionality:** View all personal observation feedback.
- **Actions:**
  - Filter/sort observations
  - View detailed feedback
  - Download PDF reports

#### Observation Detail
- **Functionality:** View complete observation with ratings, evidence, and feedback.
- **Actions:**
  - Read full observation details
  - Download as PDF
  - Navigate back to feed/list

### 2.5 Analytics

#### School Analytics (Principal)
- **Functionality:** Visualizations of school-wide observation data.
- **Actions:**
  - Filter by date, teacher, observer, domain
  - Export reports
  - Drill down into specific metrics

#### Coach Analytics
- **Functionality:** Analytics for assigned teachers.
- **Actions:**
  - Filter by teacher, date, domain
  - Track teacher progress
  - Identify coaching priorities

#### Teacher Growth Analytics
- **Functionality:** Personal growth data over time.
- **Actions:**
  - Filter by domain, date, observation type
  - Track progress across domains
  - Identify growth areas

### 2.6 User & School Management

#### Invite Users (Principal)
- **Functionality:** Add new users to the system.
- **Actions:**
  - Send email invitations
  - Specify initial roles

#### Role Management (Principal)
- **Functionality:** Manage user roles and permissions.
- **Actions:**
  - Assign/modify roles
  - Manage coach-teacher assignments

#### School Setup Management (Principal)
- **Functionality:** Manage school information and settings.
- **Actions:**
  - Update school details
  - Modify observation requirements
  - Configure notification settings

### 2.7 Settings & Profile

#### Profile Management
- **Functionality:** Manage personal information.
- **Actions:**
  - Update profile information
  - Change password
  - Set notification preferences

### 2.8 Notifications & Exports

#### Notifications
- **Functionality:** Alert users of new activities.
- **Actions:**
  - View new feedback (teachers)
  - Receive draft reminders (observers)
  - Click to navigate to relevant screens

#### Exports
- **Functionality:** Generate downloadable reports.
- **Actions:**
  - Download observation PDFs
  - Export analytics as spreadsheets/charts

## 3. User Journeys

### 3.1 Principal Journey

```
Login → Onboarding → School Setup → Dashboard → 
[Create Observation, View Analytics, Manage Users, View All Observations]
```

#### Key Decision Points:
- Create new observation vs. review existing data
- Focus on individual teacher data vs. school-wide trends
- Manage users/roles vs. conduct observations

### 3.2 AP/Coach Journey

```
Login → Onboarding → Dashboard → 
[Create Observation, Manage Drafts, View Assigned Teacher Analytics]
```

#### Key Decision Points:
- Create new observation vs. complete draft
- Review personal observation history
- Analyze assigned teacher performance

### 3.3 Teacher Journey

```
Login → Onboarding → Dashboard → 
[View Observation Feed, Access Growth Analytics, Download Reports]
```

#### Key Decision Points:
- Review latest observations
- Analyze growth across domains
- Download observation feedback

### 3.4 Observation Creation Journey

```
Dashboard → New Observation → Teacher Selection → Template Selection → 
Observation Form → Save Draft/Continue → AI Feedback Generation → 
Review/Edit Feedback → Finalize → Submit → Return to Dashboard
```

#### Branch Points:
- Save as draft (returns to dashboard)
- Generate AI feedback (after completing form)
- Edit AI suggestions (before finalizing)

## 4. Filter & Sort Capabilities

### 4.1 Observation Filters
- **Teacher:** Filter by specific teacher(s)
- **Observer:** Filter by who conducted the observation (Principal only)
- **Date Range:** Custom date ranges
- **Observation Type:** Formal vs. Informal
- **Domain:** Filter by specific LER domains
- **Rating:** Filter by rating ranges
- **Status:** Draft vs. Completed

### 4.2 Analytics Filters
- **Teacher(s):** Multiple selection
- **Observer(s):** Multiple selection (Principal only)
- **Date Range:** Custom periods
- **Domain:** Specific LER domains
- **Observation Type:** Formal vs. Informal

### 4.3 Sort Options
- **Date:** Newest to oldest / oldest to newest
- **Teacher:** Alphabetical
- **Observer:** Alphabetical (Principal only)
- **Rating:** Highest to lowest / lowest to highest
- **Completion:** Percentage complete (for drafts)

## 5. Navigation Architecture

### 5.1 Primary Navigation
- Dashboard (Home)
- Observations
- Analytics
- User Management (Principal only)
- Settings

### 5.2 Secondary Navigation
- **Observations:**
  - New Observation
  - Drafts
  - History
  - All Observations (Principal only)
  
- **Analytics:**
  - School Overview (Principal)
  - Teacher Growth
  - Domain Analysis
  
- **User Management:**
  - Invite Users
  - Manage Roles
  - School Setup

### 5.3 Contextual Navigation
- Filter/Sort controls on all list views
- Breadcrumbs for deep navigation paths
- Back buttons on detail screens
- Direct links from notifications

## 6. Mobile Considerations

### 6.1 Responsive Adaptations
- Collapsible navigation menu
- Simplified observation forms
- Stacked layouts instead of side-by-side
- Touch-optimized controls for classroom use

### 6.2 Offline Capabilities
- Offline observation form completion
- Data synchronization when connection is restored
- Visual indicators for offline/online status

## 7. Notification System

### 7.1 In-App Notifications
- **Teachers:** New observation feedback
- **Observers:** Draft completion reminders
- **Principals:** New user registrations, school stats

### 7.2 Email Notifications
- New observation feedback (teachers)
- User invitations
- Weekly/monthly summary reports

## 8. Key Action Points Summary

### Principal Actions
- **School Setup:** During onboarding and in settings
- **User Management:** Dedicated admin screen
- **All-School Analytics:** Analytics dashboard
- **All Observations Access:** Observation management screen

### Observer Actions
- **Create Observations:** From dashboard
- **Generate AI Feedback:** During observation workflow
- **Manage Drafts:** From dashboard or observation list
- **View Personal History:** Observation history screen

### Teacher Actions
- **View Feedback:** Observation feed and detail screens
- **Track Growth:** Personal analytics dashboard
- **Download Reports:** Observation detail screen

## 9. Implementation Considerations

### 9.1 Technical Dependencies
- Clerk for authentication and role management
- Convex for database and backend
- OpenAI for AI feedback generation
- PDF generation for reports

### 9.2 Performance Optimizations
- Pagination for long observation lists
- Lazy loading for analytics visualizations
- Optimistic UI updates for form interactions
- Background syncing for offline changes

### 9.3 Security Considerations
- Role-based access controls for all screens
- School-level data isolation
- Secure handling of observation data
- Session timeouts for inactive users 