# EdCoach AI: MVP Development Plan

## Overview
EdCoach AI is an AI-powered instructional support platform designed to streamline the classroom observation process in K-12 schools. The MVP focuses on core functionality that delivers immediate value: digitizing observation forms, generating instant rubric-aligned feedback, and tracking basic teacher growth metrics.

## MVP Goals
1. Enable school leaders and coaches to conduct and document classroom observations
2. Generate AI-powered feedback based on observation data
3. Track basic teacher growth metrics
4. Support essential user roles (admin, coach, teacher)
5. Provide a responsive, intuitive user interface

## 1. Project Setup & Infrastructure
- [x] **Initialize Project Repository**
  - Set up Git repository with proper branching strategy
  - Configure ESLint and Prettier for code quality
  - Add TypeScript configurations and tsconfig.json
  - Set up VSCode workspace settings

- [x] **Next.js Project Setup**
  - Initialize Next.js with TypeScript
  - Configure Tailwind CSS
  - Set up project folder structure (pages, components, styles)
  - Configure environment variables (.env files)

- [x] **Convex Backend Setup**
  - Install Convex SDK
  - Configure Convex project settings
  - Set up schema folder structure
  - Initialize connection between Next.js and Convex

- [x] **Design System Setup**
  - Install React-bits UI and ShadCn components
  - Configure Tailwind CSS theme variables
  - Set up typography system with Oswald font
  - Configure color palette in globals.css
  - Set up spacing and layout utilities

## 2. Database Schema & Authentication
- [x] **Convex Schema Implementation**
  - Implement `users` table with proper indexes
  - Implement `organizations` table with proper indexes
  - Implement `teachers` table with proper indexes
  - Implement `observations` table with proper indexes
  - Implement `feedback` table with proper indexes

- [x] **Authentication Integration**
  - Implement Clerk authentication in Next.js components
  - Set up protected routes using Clerk middleware
  - Configure Clerk JWT integration with Convex
  - Implement user synchronization between Clerk and Convex

- [ ] **Basic Role-Based Access Control**
  - Implement three basic roles: admin, coach, teacher
  - Set up organization-scoped data access
  - Create basic permission checks

## 3. Core Backend Functions
- [x] **User Management Functions**
  - Implement `createOrGetUser` function
  - Implement `getCurrentUser` function
  - Implement `getUserByClerkId` function
  - Implement `listUsers` function (with filtering)
  - Implement `updateUser` function

- [x] **Organization Management Functions**
  - Implement `createOrganization` function
  - Implement `getOrganization` function
  - Implement `updateOrganization` function
  - Implement `listOrganizations` function

- [x] **Teacher Management Functions**
  - Implement `createTeacher` function
  - Implement `getTeacher` function
  - Implement `updateTeacher` function
  - Implement `listTeachers` function (with filtering)

- [x] **Observation Management Functions**
  - Implement `createObservation` function
  - Implement `getObservation` function
  - Implement `updateObservation` function
  - Implement `listObservations` function (with filtering)
  - Implement basic draft management

## 4. AI Integration
- [ ] **OpenAI Integration Setup**
  - Set up OpenAI API key in Convex environment
  - Create wrapper utility for OpenAI API calls
  - Implement basic error handling
  - Test basic prompt completions

- [ ] **Basic AI Feedback Generation**
  - Design prompts for generating feedback based on observation data
  - Implement function to generate feedback based on evidence and ratings
  - Add basic context loading for AI responses

## 5. Frontend Foundation
- [x] **Layout Components**
  - Create main layout structure
  - Implement responsive sidebar navigation
  - Create header component with user profile
  - Implement footer component
  - Add authentication wrapper layout

- [x] **Common UI Components**
  - Build button component variants
  - Create card components
  - Implement form input components
  - Build table and list components
  - Create modal and dialog components
  - Implement toast notification system

## 6. Observation Workflow UI
- [x] **Teacher Selection UI**
  - Create teacher list component
  - Implement basic teacher search
  - Add teacher selection for observations

- [x] **Basic Observation Form**
  - Build main observation form structure
  - Implement domain and indicator components
  - Create rating selector components
  - Build evidence input fields
  - Implement basic form validation
  - Add autosave functionality

- [x] **Observation Type Selection**
  - Implement formal vs. informal template selection
  - Create type selection interface
  - Add observation initialization flow

- [x] **Observation Details**
  - Create details input form
  - Implement date and time selection
  - Add location and context fields
  - Build basic validation

- [x] **Rubric Integration**
  - Implement rubric selection
  - Create rating interface
  - Build evidence collection
  - Add basic validation

- [x] **Walkthrough Form**
  - Create informal walkthrough interface
  - Implement quick feedback collection
  - Build basic validation
  - Add autosave functionality

- [ ] **Basic Feedback Interface**
  - Create AI feedback generation interface
  - Implement feedback loading states
  - Build basic feedback editing interface
  - Add feedback finalization flow

## 7. Basic Analytics
- [ ] **Simple Analytics Functions**
  - Implement basic observation frequency tracking
  - Create simple rating aggregation
  - Build basic teacher growth tracking

- [ ] **Basic Dashboard**
  - Create simple dashboard layout
  - Implement basic observation counts
  - Build simple rating averages
  - Add basic filtering

## Future Enhancements (Post-MVP)
1. **Advanced Analytics & Reporting**
   - Complex data visualizations
   - Advanced export functionality
   - Custom report generation
   - Scheduled reports

2. **Advanced Mobile Features**
   - Offline functionality
   - Camera integration
   - Advanced touch gestures
   - Mobile-specific optimizations

3. **Advanced Testing & Security**
   - Comprehensive security audit
   - Advanced performance optimization
   - Complex monitoring systems
   - Advanced logging

4. **Advanced User Management**
   - Complex role management
   - Advanced invitation system
   - Detailed audit logging
   - Complex permission systems

5. **Advanced AI Features**
   - Feedback versioning
   - Advanced caching
   - Background processing
   - Fallback mechanisms

## MVP Timeline
- [x] **Phase 1 (Project Setup & Database):** 1-2 weeks
  - Project infrastructure completed
  - Database schema implemented
  - Authentication system in place

- [x] **Phase 2 (Core Backend Functions):** 1-2 weeks
  - User management functions completed
  - Organization management functions completed
  - Teacher management functions completed
  - Observation management functions completed

- [x] **Phase 3 (Frontend Foundation):** 1-2 weeks
  - Layout components completed
  - Common UI components completed
  - Basic responsive design implemented

- [x] **Phase 4 (Observation Workflow):** 2-3 weeks
  - Teacher selection UI completed
  - Observation form completed
  - Type selection completed
  - Details form completed
  - Rubric integration completed
  - Walkthrough form completed

- [ ] **Phase 5 (Form Validation & Submission):** 1 week
  - Implement comprehensive form validation
  - Test all required fields
  - Validate data types and formats
  - Test form submission to backend
  - Handle submission errors
  - Test draft saving functionality
  - Verify data persistence
  - Test form recovery from drafts

- [ ] **Phase 6 (AI Integration):** 1-2 weeks
  - OpenAI integration setup
  - Basic AI feedback generation
  - Feedback interface implementation

- [ ] **Phase 7 (Basic Analytics):** 1 week
  - Simple analytics functions
  - Basic dashboard implementation

Total MVP estimated time: 8-13 weeks
Current progress: ~55% complete
Remaining time: 3-4 weeks 