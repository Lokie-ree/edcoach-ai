# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EdCoach AI is an AI-powered instructional coaching and feedback platform for K-12 schools. The application helps coaches provide rubric-aligned feedback to teachers through walkthrough observations, with a focus on Professional Growth Plan (PGP) goals and evidence-based coaching.

### Core Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Convex (realtime database with serverless functions)
- **Auth**: Clerk (authentication and user management)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: Convex queries/mutations (realtime)

## Development Commands

### Primary Development

```bash
# Start both frontend and backend in parallel
pnpm run dev

# Individual services
pnpm run dev:frontend  # Next.js dev server
pnpm run dev:backend   # Convex dev server

# Build and deployment
pnpm run build         # Build for production
pnpm run start         # Start production server
pnpm run lint          # ESLint checking
```

### Convex-Specific Commands

```bash
npx convex dev        # Start Convex development server
npx convex dashboard  # Open Convex dashboard
npx convex deploy     # Deploy Convex functions
```

## Architecture & Project Structure

### App Router Structure (Role-Based Routes)

```
app/
├── (dashboard)/          # Authenticated dashboard routes
│   ├── (coach)/         # Coach-specific routes
│   │   ├── analytics/   # Usage analytics and metrics
│   │   ├── dashboard/   # Main coach dashboard
│   │   └── teachers/    # Teacher management
│   ├── (teacher)/       # Teacher-specific routes
│   │   └── growth-journal/ # Teacher reflection/journal
│   ├── layout.tsx       # Dashboard layout wrapper
│   ├── settings/        # User settings (billing, profile)
│   └── walkthrough/     # Walkthrough creation and viewing
├── (marketing)/         # Public marketing pages
├── (setup)/            # Onboarding and invitations
└── layout.tsx          # Root layout
```

### Convex Backend Organization

```
convex/
├── schema.ts           # Database schema definition
├── users.ts           # User management functions
├── teachers.ts         # Teacher CRUD operations
├── walkthroughs.ts     # Walkthrough observation functions
├── aiFeedback.ts       # AI feedback generation
├── analytics.ts        # Usage analytics queries
├── billing.ts          # Subscription/billing functions
└── http.ts            # HTTP endpoints for webhooks
```

### Key Components Structure

```
components/
├── common/            # Shared utility components
├── dashboard/         # Dashboard-specific components
├── layout/           # Layout and navigation components
├── providers/        # Context providers
└── ui/              # shadcn/ui components
```

## Database Schema Key Concepts

### User Management

- **users**: Core user records (linked to Clerk) with roles (coach/teacher)
- **teachers**: Teacher-specific data with PGP goals and coach assignments
- **invitations**: Teacher invitation system with token-based flow

### Core Workflow

- **walkthroughs**: Observation sessions with evidence and feedback
- **reflections**: Teacher reflections on walkthroughs
- **aiFeedback**: AI-generated coaching suggestions
- **workflowStates**: 6-step EdCoach methodology tracking

### Business Logic

- **Subscription tiers**: free, coach_starter, coach_pro
- **Usage tracking**: AI calls, teacher limits, monthly quotas
- **Tenant scoping**: All data properly scoped by coach/organization

## Important Development Patterns

### Convex Function Patterns

Always use the new Convex function syntax with validators:

```typescript
export const exampleQuery = query({
  args: { userId: v.id("users") },
  returns: v.array(v.object({ ... })),
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

### Authentication & Authorization

- All protected routes use Clerk middleware
- User roles enforced at database level
- Tenant scoping mandatory for all queries

### AI Integration

- OpenAI API calls handled in Convex actions
- Feedback caching to reduce API costs
- Usage tracking for subscription limits

### Subscription & Feature Gating

- Feature access controlled by subscription tier
- Usage enforcement at UI and API levels
- Billing managed through Clerk subscriptions

## Key Files and Their Purposes

- `middleware.ts`: Route protection and role-based access
- `convex/schema.ts`: Complete database schema with indexes
- `app/layout.tsx`: Root layout with providers and metadata
- `components/layout/AppLayout.tsx`: Conditional layout routing
- `hooks/usePlanDetection.ts`: Subscription tier detection
- `hooks/usageEnforcer.ts`: Usage limit enforcement

## Business Context

### Target Users

1. **Instructional Coaches**: Primary users who manage teachers and provide feedback
2. **Teachers**: Receive coaching, set PGP goals, complete reflections

### Core User Journey

1. Coach invites teachers and sets PGP goals
2. Coach conducts walkthrough observations
3. AI generates rubric-aligned feedback suggestions
4. Teacher reviews feedback and completes reflections
5. Coach monitors progress through analytics dashboard

### Subscription Tiers

- **Free**: 1 teacher, 2 walkthroughs/month, basic features
- **Coach Starter**: 5 teachers, 10 walkthroughs/month, enhanced features
- **Coach Pro**: Unlimited teachers/walkthroughs, premium features

## Development Guidelines

### Code Quality

- Follow existing TypeScript patterns and naming conventions
- Use shadcn/ui components consistently
- Implement proper error handling and loading states
- Maintain proper tenant scoping in all database queries

### Testing Approach

- No specific test framework configured yet
- Manual testing through Convex dashboard
- End-to-end testing should focus on core user journeys

### Security Considerations

- All sensitive data properly scoped by user/organization
- AI feedback cached with secure hashing
- Audit logging for compliance (FERPA considerations)
