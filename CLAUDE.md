# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Core Development:**

- `pnpm run dev` - Starts both frontend (Next.js) and backend (Convex) in parallel
- `pnpm run dev:frontend` - Next.js development server only
- `pnpm run dev:backend` - Convex development server only
- `pnpm run build` - Build the Next.js application
- `pnpm run lint` - Run ESLint for code quality checks

**Database & Backend:**

- `npx convex dev` - Start Convex development environment
- `npx convex dashboard` - Open Convex database dashboard
- `npx convex docs` - Open Convex documentation

## Architecture Overview

**Tech Stack:**

- Frontend: Next.js 15 with React 19, TypeScript, Tailwind CSS
- Backend: Convex (real-time database with serverless functions)
- Authentication: Clerk with organization support
- UI Components: Radix UI, shadcn/ui, Framer Motion
- AI Integration: OpenAI API for feedback generation

**Key Architectural Patterns:**

**1. Role-Based Access Control:**

- Two primary user roles: `coach` and `teacher`
- Route protection via middleware (middleware.ts) with role-specific redirects
- Coach routes: `/dashboard`, `/analytics`, `/teachers`, `/walkthrough`
- Teacher routes: `/growth-journal`

**2. Database Schema (Convex):**

- `users` - Core user data with Clerk integration, subscription management
- `teachers` - Teacher profiles linked to coaches (many-to-one relationship)
- `invitations` - Token-based teacher invitation system
- `walkthroughs` - Classroom observation records
- `rubricIndicators` - Louisiana State rubric indicators for feedback alignment
- `aiFeedback` & `aiFeedbackCache` - AI-generated feedback with caching for cost optimization

**3. Authentication Flow:**

- Clerk handles authentication with organization support
- Direct coach-teacher relationships (not organization-based)
- Invitation system for teachers to join specific coaches
- Post-invite user creation flow for teachers

**4. AI Feedback System:**

- OpenAI integration for generating rubric-aligned feedback
- Evidence summarization for walkthrough observations
- Caching system (aiFeedbackCache) to reduce API costs
- Usage tracking and billing enforcement

**5. Subscription & Billing:**

- Three tiers: free, coach_starter, coach_pro
- Usage limits enforced client-side with server-side validation
- Monthly usage tracking for walkthroughs and active teachers
- Clerk Billing integration for subscription management

**Layout Structure:**

```
app/
├── (marketing)/     # Public landing pages
├── (setup)/         # Onboarding and invitations
└── (dashboard)/     # Protected application
    ├── (coach)/     # Coach-specific routes
    └── (teacher)/   # Teacher-specific routes
```

**Component Organization:**

- `components/ui/` - Base UI components (shadcn/ui)
- `components/common/` - Shared application components
- `components/layout/` - Navigation and layout components
- `components/dashboard/` - Domain-specific dashboard components

**State Management:**

- Convex provides real-time reactive queries and mutations
- React Hook Form for form state management
- Theme state via next-themes

**Key Business Logic:**

- PGP (Professional Growth Plan) goal setting and tracking
- Walkthrough observation workflow with evidence collection
- AI-powered feedback generation based on Louisiana State rubric
- Teacher invitation and onboarding flow
- Usage monitoring and subscription enforcement

**Performance Considerations:**

- AI feedback caching to reduce OpenAI costs
- Real-time updates via Convex subscriptions
- Route-based code splitting via Next.js App Router
- Image optimization via Next.js built-in features

**Security Features:**

- Authentication middleware with route protection
- Audit logging (auditLogs table)
- AI usage monitoring and alerts
- Secure invitation token system
