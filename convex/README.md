# EdCoach AI - Convex Backend

This directory contains the Convex backend functions for EdCoach AI, an educational coaching platform that helps instructional coaches provide AI-powered feedback to teachers based on classroom walkthroughs.

## 🏗️ Architecture Overview

EdCoach AI follows a **coach-teacher relationship model** where:
- **Coaches** create accounts and invite teachers to their coaching teams
- **Teachers** accept invitations and receive feedback on their classroom practices
- **AI-powered feedback** is generated based on Louisiana Educator Rubric indicators
- **Workflow tracking** follows a 6-step coaching methodology

## 📁 File Structure

### Core Authentication & User Management
- **`auth.ts`** - Authentication helpers and user context
- **`auth.config.ts`** - Clerk authentication configuration
- **`users.ts`** - User management and profile operations
- **`clerk.ts`** - Clerk webhook handlers for user lifecycle events

### Teacher & Coach Management
- **`teachers.ts`** - Teacher records, PGP goals, and coach-teacher relationships
- **`invitations.ts`** - Teacher invitation system with email notifications
- **`onboarding.ts`** - User onboarding completion tracking

### Walkthrough & Feedback System
- **`walkthroughs.ts`** - Classroom walkthrough creation and management
- **`aiFeedback.ts`** - AI-powered feedback generation using OpenAI GPT-4
- **`aiFeedbackMutations.ts`** - AI usage tracking and cost management
- **`reflections.ts`** - Teacher reflection system for walkthroughs

### Rubric & Analytics
- **`rubrics.ts`** - Louisiana Educator Rubric management
- **`rubricIndicators.ts`** - Individual rubric indicator queries
- **`analytics.ts`** - Comprehensive analytics for coaches and teachers
- **`indicatorQueries.ts`** - Rubric indicator lookup functions

### Workflow & Progress Tracking
- **`workflowState.ts`** - 6-step coaching methodology workflow management
- **`usage.ts`** - Usage tracking and plan limits enforcement

### Business Logic & Plans
- **`plans.ts`** - Subscription plan configuration and feature limits
- **`billing.ts`** - Clerk Billing integration and webhook handling

### System & Utilities
- **`audit.ts`** - Security audit logging
- **`migrations.ts`** - Database migration utilities
- **`http.ts`** - HTTP endpoints and webhook routing
- **`validation/walkthroughFinalSchema.ts`** - Zod validation schemas

## 🔑 Key Features

### 1. **AI-Powered Feedback Generation**
```typescript
// Generate contextual feedback based on rubric indicators
export const generateAIFeedback = action({
  args: {
    evidence: v.string(),
    mode: v.union(v.literal("reinforcement"), v.literal("refinement"), v.literal("both")),
    reinforcementIndicator: v.optional(indicatorValidator),
    refinementIndicator: v.optional(indicatorValidator),
    teacherId: v.optional(v.id("teachers")), // For PGP context
  },
  // Returns structured feedback with reinforcement and refinement suggestions
});
```

### 2. **6-Step Coaching Workflow**
The system tracks progress through:
1. **Setup** - PGP goal setting
2. **Capture** - Classroom walkthroughs
3. **Analyze** - Pattern identification
4. **Refine** - Strategy adjustment
5. **Reflect** - Teacher self-reflection
6. **Monitor** - Progress tracking

### 3. **Plan-Based Usage Limits**
```typescript
// Three subscription tiers with different limits
const PLAN_CONFIG = {
  free: { maxAIGenerations: 10, maxTeachers: 1 },
  coach_starter: { maxAIGenerations: 30, maxTeachers: 5 },
  coach_pro: { maxAIGenerations: 100, maxTeachers: 15 }
};
```

### 4. **Comprehensive Analytics**
- Teacher progress tracking
- Domain performance analysis
- Coaching insights generation
- Monthly trend analysis

## 🗄️ Database Schema

### Core Tables
- **`users`** - Coach and teacher user accounts
- **`teachers`** - Teacher-specific data and PGP goals
- **`invitations`** - Teacher invitation system
- **`walkthroughs`** - Classroom observation records
- **`reflections`** - Teacher self-reflections
- **`workflowStates`** - 6-step methodology progress

### Rubric System
- **`rubrics`** - Louisiana Educator Rubric definitions
- **`rubricIndicators`** - Individual performance indicators

### AI & Usage Tracking
- **`aiUsageLogs`** - Token usage and cost tracking
- **`aiUsageAlerts`** - Usage threshold notifications
- **`aiFeedbackCache`** - Cached AI responses for cost optimization

### Security & Compliance
- **`auditLogs`** - Security and compliance logging

## 🔐 Authentication & Authorization

### Clerk Integration
- **User Management**: Automatic user creation/updates via webhooks
- **Role Assignment**: Coaches (default) vs Teachers (via invitation)
- **Organization-Free**: Direct coach-teacher relationships

### Permission Model
```typescript
// Coaches can only manage their assigned teachers
if (teacher.coachId !== user._id) {
  throw new Error("You can only manage teachers assigned to you.");
}
```

## 🤖 AI Integration

### OpenAI GPT-4 Integration
- **Model**: GPT-4.1-mini for cost efficiency
- **Context**: Includes teacher PGP goals for personalized feedback
- **Caching**: Reduces duplicate API calls and costs
- **Usage Tracking**: Comprehensive token and cost monitoring

### Feedback Generation
```typescript
// Contextual prompt building with PGP integration
const buildPrompt = () => {
  const basePrompt = `You are an expert educational coach...`;
  if (args.teacherId) {
    const pgpContext = `\n\nTeacher's Professional Growth Goal: "${teacher.pgpGoal.text}"`;
    return basePrompt + pgpContext;
  }
  return basePrompt;
};
```

## 📊 Analytics & Reporting

### Coach Analytics
- Teacher progress matrices
- Domain performance analysis
- Coaching insights and recommendations
- Monthly trend tracking

### Teacher Analytics
- Personal growth tracking
- Reflection completion rates
- PGP goal progress monitoring

## 🔄 Workflow Management

### Automatic Step Progression
```typescript
// Auto-advance workflow based on completion criteria
if (currentWalkthroughs + 1 >= 2 && workflowState.currentStep === "capture") {
  await ctx.db.patch(workflowState._id, {
    currentStep: "analyze",
    updatedAt: now,
  });
}
```

### Progress Calculation
- **Overall Progress**: Weighted calculation across all 6 steps
- **Step Progress**: Individual step completion percentages
- **Next Steps**: Contextual recommendations for each step

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Convex CLI
- OpenAI API key
- Clerk authentication setup

### Environment Variables
```bash
OPENAI_API_KEY=your_openai_key
CLERK_WEBHOOK_SECRET=your_webhook_secret
RESEND_API_KEY=your_email_key
NEXT_PUBLIC_APP_URL=your_app_url
```

### Development Commands
```bash
# Start Convex development server
npx convex dev

# Deploy to production
npx convex deploy

# View Convex dashboard
npx convex dashboard
```

## 📝 Function Examples

### Creating a Walkthrough
```typescript
const walkthroughId = await createWalkthrough({
  teacherId: "teacher_123",
  walkthroughDate: Date.now(),
  evidenceSummary: "Teacher used effective questioning techniques...",
  reinforcementIndicator: "I-A-1",
  refinementIndicator: "I-B-2",
  reinforcementFeedback: "Great use of open-ended questions...",
  refinementFeedback: "Consider providing more wait time...",
});
```

### Generating AI Feedback
```typescript
const feedback = await generateAIFeedback({
  evidence: "Classroom observation evidence...",
  mode: "both",
  reinforcementIndicator: indicatorData,
  refinementIndicator: indicatorData,
  teacherId: "teacher_123", // For PGP context
});
```

### Querying Analytics
```typescript
const analytics = await getComprehensiveCoachAnalytics();
// Returns: teacher progress, domain performance, insights, trends
```

## 🔧 Maintenance & Monitoring

### Usage Monitoring
- Real-time AI usage tracking
- Cost alerts and thresholds
- Plan limit enforcement

### Data Management
- Automatic cleanup of expired data
- Monthly usage resets
- Audit trail maintenance

### Performance Optimization
- AI response caching
- Efficient database queries with proper indexing
- Background workflow processing

## 📚 Additional Resources

- [Convex Documentation](https://docs.convex.dev/)
- [Clerk Authentication](https://clerk.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Louisiana Educator Rubric](https://www.louisianabelieves.com/)

---

**Note**: This backend is designed specifically for educational coaching workflows and integrates deeply with the Louisiana Educator Rubric system. All AI feedback is contextualized to support teacher professional growth and development.
