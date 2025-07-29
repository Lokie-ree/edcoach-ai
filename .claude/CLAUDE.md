# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start both frontend (Next.js) and backend (Convex) development servers in parallel
- `npm run dev:frontend` - Start only the Next.js frontend development server
- `npm run dev:backend` - Start only the Convex backend development server
- `npm run build` - Build the Next.js application for production
- `npm run lint` - Run ESLint checks on the codebase

### Convex Backend Operations
- `npx convex dev` - Start Convex development environment and database
- `npx convex deploy` - Deploy Convex backend to production
- `npx convex dashboard` - Open the Convex database dashboard

## Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Convex (real-time database and serverless functions)
- **Authentication**: Clerk with role-based permissions (coach/teacher roles)
- **AI Integration**: OpenAI GPT-4.1 Mini for feedback generation
- **UI Components**: Radix UI primitives with custom styling

### Project Structure
- `app/` - Next.js app router with route groups for different user flows:
  - `(dashboard)/` - Main application dashboard for coaches and teachers
  - `(marketing)/` - Landing page and marketing content
  - `(setup)/` - Onboarding and invitation flows
- `components/` - Reusable UI components organized by category:
  - `ui/` - Basic UI primitives (shadcn/ui components)
  - `common/` - Shared application components
  - `dashboard/` - Dashboard-specific components
  - `layout/` - Navigation and layout components
- `convex/` - Backend functions and database schema
- `lib/` - Utility functions and configurations
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions

### Database Schema Architecture

The application uses Convex with role-based access control:

**User Roles**: `coach` and `teacher` with distinct permissions and workflows

**Key Tables**:
- **users** - Core user data with Clerk integration, subscription management, and usage tracking
- **teachers** - Teacher profiles managed by coaches, includes PGP goal tracking
- **invitations** - Teacher invitation system with token-based acceptance
- **walkthroughs** - Classroom observation records with evidence and feedback
- **walkthroughEntries** - Structured feedback tied to specific rubric indicators
- **reflections** - Teacher reflections on walkthrough feedback
- **rubricIndicators** - Louisiana Educator Rubric (LER) data structure
- **aiFeedback** - AI-generated coaching feedback with caching system
- **auditLogs** - Security and compliance tracking

### Authentication & Authorization
- Clerk handles authentication with JWT tokens
- Role-based access: coaches manage teachers, teachers view their own data
- Direct coach-teacher relationships (not organization-based)
- Invitation system for teacher onboarding

### AI Integration Patterns
- OpenAI GPT-4.1 Mini for rubric-aligned feedback generation
- AI feedback caching to reduce API costs and improve performance
- Usage tracking and billing enforcement based on subscription plans
- Context-aware prompts using Louisiana Educator Rubric indicators

## Development Guidelines

### Convex Function Patterns
Always use modern Convex function syntax with proper validators:
```typescript
export const functionName = query({
  args: { param: v.string() },
  returns: v.object({ result: v.string() }),
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

### Component Patterns
- Use Next.js App Router with proper route grouping
- Dashboard-based navigation with role-specific views
- Modal overlays for detailed editing workflows
- Real-time data updates using Convex queries/mutations
- Responsive design with mobile-first approach

### Data Access Patterns
- Coach functions: Access teachers via `by_coach` index
- Teacher functions: Filter by userId for data isolation
- Use proper Convex indexes for efficient queries
- Implement caching for expensive AI operations

### Testing & Quality
- Run `npm run lint` before committing (includes ESLint checks)
- Follow existing component patterns and naming conventions
- Use proper TypeScript types from `convex/_generated/dataModel`
- Maintain audit trail for all data modifications

## Special Considerations

### Walkthrough Data Structure
Walkthroughs follow the Louisiana Educator Rubric (LER) framework:
- **Evidence Summary**: Objective observation notes
- **Reinforcement Indicator**: Strengths aligned to specific LER indicators
- **Refinement Indicator**: Growth areas with specific coaching focus
- **AI Feedback**: Generated coaching questions and suggestions

### Subscription & Usage Management
- Free tier: Limited walkthroughs and teachers
- Paid tiers: Coach Starter and Coach Pro with different limits
- Usage tracking with monthly reset cycles
- Billing integration via Clerk webhooks

### Security & Compliance
- Audit logging for all user actions
- Role-based data access controls
- Secure teacher invitation system with expiring tokens
- Data isolation between different coach organizations