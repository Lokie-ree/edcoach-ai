# EdCoachAi - Master Context

**Last Updated:** September 21, 2025  
**Maintainers:** Product Manager (lead), System Architect, UX Designer, Senior Engineers  
**Purpose:** Single source of truth for all EdCoachAi project context

---

## 🎯 Project Foundation

### Mission Statement
**Transform classroom walkthroughs into a continuous, supportive, and data-informed growth loop for educators.**

### Core Philosophy: The Continuous Growth Loop
EdCoachAi is built around a five-phase continuous growth methodology that transforms traditional coaching from episodic events into an ongoing, supportive process:

1. **Set Goal** → PGP Goal-Setting System with AI assistance
2. **Capture Evidence** → 5-minute mobile walkthroughs with rubric indicators  
3. **Generate Feedback** → AI-powered, hyper-contextualized suggestions
4. **Reflect** → Teacher growth journal with guided prompts
5. **Monitor Growth** → Real-time dashboards and progress visualization

### Current Project Status
- **Completion**: 87% complete, focus on polish and mobile optimization
- **Key Achievement**: Core workflow operational (walkthrough → feedback → reflection)
- **Next Phase**: User experience polish and advanced features

---

## 👥 User Context

### Primary Persona: The Instructional Coach (Sarah Martinez)

**Demographics & Profile:**
- **Age**: 35-45, experienced educator (8-15 years), 3-5 years in coaching role
- **Technology**: Moderate to high comfort, uses iPad/tablet regularly for walkthroughs
- **Role**: Instructional coach, department head, or assistant principal

**Psychographics & Values:**
- **Core Values**: Teacher empowerment, data-driven decisions, authentic relationships, efficient time use
- **Personality**: Collaborative, detail-oriented but time-conscious, growth-mindset oriented
- **Decision Process**: 1) Does this help teachers grow? 2) Will this save time? 3) Can I test with small group? 4) Will whole team benefit?

**Goals & Motivations:**
- **Primary Goals**: Complete walkthroughs in <5 minutes, provide impactful feedback, build trust with teachers, track growth over time
- **Success Triggers**: Teachers actively engage with feedback, clear evidence of teaching improvement, reduced admin burden
- **Behavioral Patterns**: Morning dashboard review → 2-3 walkthroughs → afternoon feedback/follow-up → next day planning

**Pain Points & Frustrations:**
- **Current Problems**: "I spend more time on paperwork than coaching", "Generic feedback doesn't help teachers grow", "Can't track long-term progress", "Teachers see me as evaluator, not partner"
- **Dominant Emotions**: Fulfilled when teachers succeed, overwhelmed by admin tasks, frustrated by inefficient systems

**Buyer Sophistication:**
- **Awareness Level**: Most Aware (knows they need better coaching tools)
- **Experience Level**: High (has tried multiple platforms, knows what doesn't work)
- **Objections**: "Will AI feedback be as good as human insight?", "Will teachers actually use reflection features?"

### Secondary Persona: The Classroom Teacher (Michael Thompson)

**Demographics & Profile:**
- **Age**: 28-50, classroom teacher (3-20 years experience)
- **Technology**: Moderate comfort, uses smartphone and basic apps
- **Role**: K-12 classroom teacher seeking professional development

**Psychographics & Values:**
- **Core Values**: Student success, professional development, work-life balance, authentic feedback
- **Personality**: Reflective, growth-oriented, collaborative but protective of classroom time
- **Decision Process**: 1) Will this help me be better teacher? 2) How much time required? 3) Start small, build confidence 4) Integrate into regular practice

**Goals & Motivations:**
- **Primary Goals**: Improve teaching continuously, understand specific development areas, take ownership of growth, see progress over time
- **Success Triggers**: Specific actionable feedback, clear connection to student outcomes, evidence of growth, supportive coaching relationship

**Pain Points & Frustrations:**
- **Current Problems**: "Feedback too general to act on", "Don't know if I'm improving", "Don't have time for complex systems", "Feedback feels like judgment"
- **Dominant Emotions**: Energized by student success, anxious about evaluations, overwhelmed by competing priorities

**Buyer Sophistication:**
- **Awareness Level**: Problem Aware (knows they want to improve, may not know specific areas)
- **Experience Level**: Low to Medium (limited experience with coaching platforms, values simplicity)
- **Objections**: "Is this another evaluation system?", "Will I have time to engage regularly?", "How do I know data is secure?"

### Transformation Focus (What Users Are "Buying")

**For Coaches:**
- **From**: Time-consuming, inconsistent feedback processes
- **To**: Efficient, data-driven coaching with measurable impact
- **Key Transformation**: "I can focus on relationships and growth instead of paperwork"

**For Teachers:**
- **From**: Passive recipients of vague feedback
- **To**: Active participants in their professional growth journey
- **Key Transformation**: "I own my growth and can see clear progress"

**For Schools:**
- **From**: Fragmented professional development
- **To**: Continuous, aligned growth culture
- **Key Transformation**: "Our coaching creates measurable instructional improvement"

### Competitive Differentiation

**Unique Value Propositions:**
1. **PGP-Aligned AI Feedback**: Context-aware, goal-aligned suggestions (not just observation-based)
2. **Continuous Growth Loop**: Complete coaching methodology, not just tools
3. **Teacher-Centric Design**: Active teacher participation and ownership vs. passive feedback reception
4. **Louisiana Rubric Native**: Built specifically for LER indicators

**Competitive Advantages:**
- **Speed**: <5 minute walkthroughs vs. 15-20 minutes with competitors
- **Context**: AI understands long-term teacher goals, not just single observations
- **Engagement**: Teachers actively participate vs. passive feedback reception
- **Focus**: Laser focus on informal coaching vs. broad evaluation platforms

### Success Metrics & KPIs
- **User Experience**: 85%+ onboarding completion, >4.5/5 user satisfaction, <5% error rate
- **Business**: 15%+ free-to-paid conversion, <5% monthly churn, >60% daily coach usage
- **Product**: 90%+ walkthrough completion, 4.0/5+ AI feedback quality, 80%+ teacher reflection rate
- **Performance**: <5min walkthrough time, <10s AI generation, <3s dashboard loading

---

## 🏗️ Technical Context

### Technology Stack & Architecture

**Frontend Architecture:**
- **Framework**: Next.js 15.4.6 with App Router (SSR + client-side optimization)
- **Language**: TypeScript 5.9.2 (strict mode, 100% coverage required)
- **Styling**: Tailwind CSS 4.1.11 with centralized design tokens (`lib/design-tokens.ts`)
- **UI Components**: shadcn/ui (Radix UI primitives) + custom EdCoach extensions
- **State Management**: Convex real-time queries + React state for client-side
- **Performance**: Code splitting, lazy loading, image optimization, <3s load times

**Backend Architecture:**
- **Platform**: Convex (serverless functions + real-time database)
- **Pattern**: Event-driven microservices with real-time capabilities
- **Functions**: Queries (read), Mutations (write), Actions (external APIs), Internal (cross-module)
- **Validation**: Comprehensive Convex validators + Zod schemas
- **Real-time**: Built-in WebSocket connections for live collaboration

**AI Integration Architecture:**
- **Model**: OpenAI GPT-4.1-mini (cost efficiency + quality balance)
- **Context Management**: PGP goal + rubric + evidence aggregation
- **Caching Strategy**: Response caching to reduce duplicate API calls and costs
- **Fallback Systems**: Manual feedback entry when AI generation fails
- **Cost Monitoring**: Token usage tracking with alerts and optimization

**Complete Database Schema:**

**Core User Management:**
```typescript
users: {
  clerkId: string;
  name: string;
  email: string;
  role: "coach" | "teacher";
  plan: "free" | "coach_starter" | "coach_pro";
  subscriptionStatus: "active" | "past_due" | "canceled" | "incomplete" | "trialing" | "unpaid";
  monthlyUsage: { walkthroughs: number; teachersActive: number; resetDate: string };
  onboardingComplete: boolean;
  preferences?: any;
}
```

**Teacher Management System:**
```typescript
teachers: {
  userId?: Id<"users">; // null until invitation accepted
  name: string;
  email: string;
  subject: string[];
  gradeBand: string;
  status: "pending" | "active" | "needs_details";
  coachId: Id<"users">; // Direct coach-teacher relationship
  
  // PGP Goal Management (Phase 1 of coaching methodology)
  pgpGoal?: {
    text: string;
    indicatorCode: string;
    contextNotes?: string;
    setAt: number;
    targetDate?: number;
    progress?: number; // 0-100 percentage
  };
}

invitations: {
  coachId: Id<"users">;
  teacherEmail: string;
  token: string; // Unique invitation token
  status: "pending" | "accepted" | "expired";
  expiresAt: number;
  subject?: string; // Coach-suggested subject area
  gradeBand?: string; // Coach-suggested grade band
}
```

**Walkthrough & Feedback System:**
```typescript
walkthroughs: {
  teacherId: Id<"teachers">;
  observerId: Id<"users">;
  walkthroughDate: number;
  status: "completed";
  evidenceSummary: string;
  reinforcementIndicator: string; // What went well
  refinementIndicator: string;    // Area for growth
  reinforcementFeedback: string;
  refinementFeedback: string;
}

reflections: {
  walkthroughId: Id<"walkthroughs">;
  teacherId: Id<"teachers">;
  content: string;
  createdAt: number;
}

aiFeedback: {
  walkthroughId: Id<"walkthroughs">;
  feedback: string;
  createdAt: number;
}

aiFeedbackCache: {
  promptHash: string; // hash of the full prompt
  result: any;        // cached AI response
  createdAt: number;  // for TTL/expiry
}
```

**Louisiana Educator Rubric System:**
```typescript
rubrics: {
  name: string;
  description?: string;
  version?: string;
  isStandard: boolean;
  structure: any;
  createdBy?: Id<"users">;
}

rubricIndicators: {
  domain: string;
  domain_weight: number;
  indicator_code: string;
  indicator_name: string;
  overview?: string;
  content_connections?: string[];
  student_centered_evidence?: string[];
  key_terms?: any;
  performance_levels: any[];
  suggested_coaching_questions?: string[];
}
```

**Continuous Growth Loop Workflow Tracking:**
```typescript
workflowStates: {
  teacherId: Id<"teachers">;
  coachId: Id<"users">;
  currentStep: "setup" | "capture" | "analyze" | "refine" | "reflect" | "monitor";
  stepProgress: {
    setup: { pgpSet: boolean; goalIndicator?: string; completedAt?: number };
    capture: { walkthroughsCompleted: number; lastWalkthroughDate?: number };
    analyze: { patternsIdentified: string[]; insightsGenerated: number };
    refine: { strategiesAdjusted: number; lastRefinementDate?: number };
    reflect: { reflectionsCompleted: number; lastReflectionDate?: number };
    monitor: { progressMetrics: any[]; trendsIdentified: string[] };
  };
  cycleNumber: number; // Track multiple coaching cycles
}
```

**AI Usage & Cost Tracking:**
```typescript
aiUsageLogs: {
  userId: Id<"users">;
  action: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  timestamp: number;
  isCached: boolean;
  metadata?: any;
}

aiUsageAlerts: {
  userId: Id<"users">;
  threshold: number;
  period: string;
  lastTriggered?: number;
  isActive: boolean;
}
```

**Security & Compliance:**
```typescript
auditLogs: {
  userId?: Id<"users">;
  action: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  severity: "info" | "warning" | "critical";
  timestamp: number;
}
```

**Security & Compliance:**
- **Authentication**: Clerk integration with JWT tokens and role-based access control
- **Authorization**: Server-side permission validation for all operations
- **Data Protection**: Encryption at rest and in transit, FERPA compliance
- **Input Validation**: Comprehensive sanitization and validation at all entry points
- **Privacy**: Teacher reflections private to teacher and coach only

**Performance Architecture:**
- **Database Indexing**: Optimized for coach-teacher relationships, walkthrough queries
- **Caching Strategy**: Multi-level caching (AI responses, frequently accessed data, CDN)
- **Real-time Optimization**: Efficient WebSocket connections with automatic reconnection
- **Mobile Performance**: Progressive Web App capabilities, offline support

**Deployment & Infrastructure:**
- **Frontend Hosting**: Vercel with global CDN and edge functions
- **Backend Hosting**: Convex Cloud with automatic scaling
- **Environment Management**: Separate dev/prod environments with promotion process
- **Monitoring**: Real-time performance monitoring, error tracking, usage analytics

**Complete API Function Reference:**

**Authentication & User Management** (`users.ts`):
- `current()` - Get current authenticated user
- `createOrSyncFromClerk()` - Create/sync user from Clerk
- `getById(userId)` - Get user by ID
- `checkAIUsageLimit()` - Check AI usage limits for current user

**Teacher Management** (`teachers.ts`):
- `list()` - List all teachers for current coach
- `getMyRecord()` - Get teacher's own record
- `create(name, email, subject, gradeBand)` - Create new teacher
- `createFromUser(userId, subject, gradeBand)` - Convert user to teacher
- `update(teacherId, data)` - Update teacher information
- `remove(teacherId)` - Remove teacher
- `getTeacherOverview()` - Get teacher overview data
- `getTeacherById(teacherId)` - Get specific teacher details

**PGP Goal Management** (`teachers.ts`):
- `setPgpGoal(teacherId, text, indicatorCode, contextNotes)` - Set/update PGP goal
- `getPgpGoal(teacherId)` - Get teacher's PGP goal
- `updatePgpProgress(teacherId, progress)` - Update goal progress (0-100)
- `draftPgpGoal(indicatorCode, contextNotes, teacherName, subject, gradeBand)` - AI-assisted goal generation

**Invitation System** (`invitations.ts`):
- `inviteTeacher(teacherEmail, subject?, gradeBand?)` - Send teacher invitation
- `acceptInvitation(token)` - Accept teacher invitation
- `getInvitationByToken(token)` - Get invitation details
- `listMyInvitations()` - List coach's sent invitations

**Walkthrough System** (`walkthroughs.ts`):
- `createWalkthrough(...)` - Create new walkthrough with AI feedback
- `getMyWalkthroughs()` - Get current user's walkthroughs
- `listByObserver()` - List walkthroughs by observer (coach)
- `listByTeacher(teacherId)` - List walkthroughs for specific teacher
- `getById(walkthroughId)` - Get walkthrough details
- `getViewDetails(walkthroughId)` - Get walkthrough with teacher info
- `deleteWalkthrough(walkthroughId)` - Delete walkthrough

**AI Feedback System** (`aiFeedback.ts`):
- `generateAIFeedback(evidence, mode, reinforcementIndicator?, refinementIndicator?, teacherId?)` - Generate AI feedback with PGP context
- `generateFeedback(evidenceSummary, reinforcementIndicator, refinementIndicator)` - Simplified feedback generation

**Reflection System** (`reflections.ts`):
- `getReflectionByWalkthrough(walkthroughId)` - Get reflection for walkthrough
- `createReflection(walkthroughId, content)` - Create teacher reflection
- `updateReflection(reflectionId, content)` - Update existing reflection

**Continuous Growth Loop Workflow Management** (`workflowState.ts`):
- `initializeWorkflowState(teacherId, coachId)` - Initialize workflow for new teacher
- `updateWorkflowStep(teacherId, step, progressData)` - Update step progress
- `advanceWorkflowStep(teacherId)` - Move to next step
- `completePgpSetup(teacherId, goalIndicator)` - Complete PGP setup step
- `recordWalkthroughCompletion(teacherId, walkthroughId)` - Record walkthrough completion
- `getWorkflowState(teacherId)` - Get current workflow state
- `getCoachWorkflowStates()` - Get all workflow states for coach
- `getWorkflowStatesByStep(step)` - Get workflow states by current step
- `getWorkflowProgress(teacherId)` - Get detailed progress information

**Analytics & Reporting** (`analytics.ts`):
- `observerAnalytics(observerId)` - Basic observer analytics
- `getCoachAnalytics()` - Comprehensive coach analytics
- `getTeacherAnalytics()` - Teacher-specific analytics
- `getMyTeacherAnalytics()` - Current teacher's analytics
- `getComprehensiveCoachAnalytics()` - Advanced coach insights
- `getTeacherPgpData(teacherId)` - PGP data for specific teacher
- `getMyPgpData()` - Current teacher's PGP data

**Louisiana Educator Rubric** (`rubricIndicators.ts`, `rubrics.ts`):
- `getAllIndicators()` - Get all LER indicators
- `getByIndicatorCode(indicatorCode)` - Get indicator by code
- `getIndicatorByCode(indicatorCode)` - Get detailed indicator info
- `listRubricWithIndicators()` - Get rubric with all indicators
- `getRubricIndicator(indicatorId)` - Get specific indicator

**Usage & Plan Management** (`plans.ts`, `usage.ts`):
- `getAIUsageThisMonth(hasProPlan?, hasStarterPlan?)` - Check AI usage limits
- `getTeacherUsage()` - Get teacher usage stats
- `getPlanFeatures()` - Get current plan features
- `trackUsage(userId, feature, amount)` - Track feature usage
- `checkUsageLimit(userId, feature)` - Check usage against limits
- `resetMonthlyUsage()` - Reset monthly usage counters

### Integration Points & External Services

**OpenAI API Integration:**
- **Rate Limiting**: Intelligent rate limiting with usage tracking
- **Context Optimization**: Efficient prompt engineering with PGP goal context
- **Error Handling**: Robust retry mechanisms and fallback to manual feedback
- **Cost Management**: Token usage monitoring with budget alerts

**Clerk Authentication:**
- **User Lifecycle**: Automatic user creation via webhooks
- **Role Management**: Coach (default) vs Teacher (invitation-based)
- **Session Management**: Secure JWT tokens with proper expiration

**Email Integration (Resend API):**
- **Teacher Invitations**: Secure token-based invitation system
- **Feedback Notifications**: Automated teacher notifications for new feedback
- **Delivery Tracking**: Email delivery status monitoring

### Performance Requirements & Standards

**Critical Performance Metrics:**
- **Dashboard Loading**: <3 seconds with skeleton loaders and progressive enhancement
- **AI Feedback Generation**: <10 seconds with progress indicators and user control
- **Walkthrough Completion**: <5 minutes average (mobile-optimized for tablet workflows)
- **Concurrent Users**: Support 5-50 coaches, 50-500 teachers per school district
- **Mobile Performance**: Lighthouse scores >90 for tablet coaching workflows
- **System Uptime**: 99.9% availability with automatic failover

**Scalability Architecture:**
- **Database Scaling**: Convex automatic scaling with query optimization
- **API Rate Management**: Intelligent rate limiting for external services
- **Caching Strategy**: Redis-compatible caching for frequently accessed data
- **Load Testing**: Regular testing to identify bottlenecks before they impact users

**Error Handling Standards:**
- **Frontend**: React Error Boundaries at layout points, graceful degradation
- **Backend**: Comprehensive try/catch with structured error responses
- **AI Integration**: Fallback mechanisms when OpenAI API fails
- **User Experience**: Clear error messages with actionable recovery steps

---

## 🎨 Design Context

### Design Philosophy & Brand Identity
**"Bold simplicity, intuitive navigation, and frictionless experiences"** that feel professional, trustworthy, and premium while supporting the continuous growth loop methodology.

**Core Design Principles:**
1. **Breathable Whitespace**: Generous spacing (24px+ between major sections) for clarity and reduced cognitive load
2. **Strategic Color Accents**: Purposeful color to guide attention and convey meaning (primary for actions, semantic for status)
3. **Typography Hierarchy**: Clear information structure through font weights and sizes (Cal Sans headings + Inter body)
4. **Motion Choreography**: Subtle animations (200ms transitions) for feedback and user guidance, avoiding distracting effects
5. **Accessibility-Driven Contrast**: WCAG 2.1 AA standards (4.5:1 normal text, 3:1 large text) throughout

### Typography System
**Primary Font (Headings):** "Cal Sans" - Modern, approachable, professional
- **Usage**: All `h1`, `h2`, `h3` elements, key UI labels, button text
- **Weights**: Regular (400), Medium (500), Semibold (600)

**Secondary Font (Body):** "Inter" - Clean, readable, optimized for screens
- **Usage**: All paragraphs, form inputs, secondary text, data displays
- **Weights**: Regular (400), Medium (500), Semibold (600)

**Implementation**: Managed via Tailwind CSS typography plugins, never apply manual font styling

### Color System & Semantic Meaning
**Core Palette** (defined as CSS variables in `globals.css`):
- **Primary**: Main brand color for CTAs, active states, key highlights
- **Secondary**: Supporting actions, less prominent elements
- **Destructive**: Negative actions (delete, error states)
- **Success**: Positive feedback, completed actions
- **Warning**: Caution states, pending actions
- **Muted**: Supplementary text, disabled states

**Contextual Usage:**
- **Coach Actions**: Primary blue for main actions, secondary for supporting
- **Teacher Growth**: Success green for progress, primary for engagement
- **System Feedback**: Warning yellow for attention, destructive red for errors

### Component Architecture & Design System

**Foundation Layer**: shadcn/ui (Radix UI primitives)
- **Base Components**: Button, Input, Card, Dialog, Dropdown, etc.
- **Accessibility**: Built-in ARIA support, keyboard navigation, focus management
- **Customization**: Extended with EdCoach-specific variants and behaviors

**Design Token System** (`lib/design-tokens.ts`):
```typescript
// Example token structure
export const DESIGN_TOKENS = {
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    touchTarget: '44px' // Minimum touch target
  },
  colors: {
    primary: 'hsl(var(--primary))',
    success: 'hsl(var(--success))',
    // Semantic color system
  },
  animations: {
    fast: '150ms ease-out',
    normal: '200ms ease-out',
    slow: '300ms ease-out'
  }
}
```

**Component Hierarchy:**
- **Base UI** (`components/ui/`): shadcn/ui components
- **Common** (`components/common/`): Reusable across features (Logo, LoadingSpinner)
- **Layout** (`components/layout/`): Structural components (Header, Sidebar, Navigation)
- **Feature-Specific**: Domain components (WalkthroughCard, ReflectionPrompt)

### Responsive Design & Mobile-First Architecture

**Breakpoint Strategy:**
- **Mobile**: 0-640px (smartphone teachers)
- **Tablet**: 641-1024px (iPad coaching workflows - PRIMARY TARGET)
- **Desktop**: 1025px+ (administrative tasks)

**Touch-Friendly Design:**
- **Minimum Touch Targets**: 44px × 44px (Apple/Android guidelines)
- **Gesture Support**: Swipe navigation, pull-to-refresh, tap feedback
- **Tablet Optimization**: Larger buttons, optimized form layouts, easy one-handed use

### Key UI Patterns & User Flows

**Coach Dashboard: "Insightful Command Center"**
- **Layout**: 2-column grid (Priority Panel + Activity Feed)
- **Components**: KPI cards with trend indicators, action-oriented priority lists
- **Interactions**: Quick actions, drill-down capabilities, real-time updates
- **Mobile Adaptation**: Single column stack, collapsible sections

**Teacher Dashboard: "Personal Growth Journal"**
- **Layout**: Single-column narrative flow telling growth story
- **Order**: PGP Goal Card → Refinement Focus → Reflection Prompt → Timeline
- **Components**: Progress visualizations, achievement badges, growth milestones
- **Interactions**: Guided reflection prompts, progress celebrations

**Walkthrough Form: Mobile-First Wizard**
- **Pattern**: Multi-step wizard with progress indicators
- **Components**: Teacher selection, indicator choices, evidence capture, AI feedback
- **Interactions**: Touch-friendly inputs, voice-to-text support, auto-save drafts
- **Error Handling**: Inline validation, recovery mechanisms, clear next steps

**Growth Journal: Reflection Interface**
- **Pattern**: Focused, distraction-free reflection space
- **Components**: Feedback context, guided prompts, next steps planning
- **Interactions**: Rich text editing, draft saving, submission confirmation
- **Privacy**: Clear indicators that reflections are private to teacher and coach

### Accessibility Standards & Implementation

**WCAG 2.1 AA Compliance Requirements:**
- **Color Contrast**: 4.5:1 for normal text, 3:1 for large text, never rely on color alone
- **Keyboard Navigation**: All interactive elements accessible via keyboard, visible focus indicators
- **Screen Reader Support**: Semantic HTML, proper ARIA labels, descriptive alt text
- **Focus Management**: Logical tab order, focus trapping in modals, skip links

**Mobile Accessibility:**
- **Touch Targets**: Minimum 44px, adequate spacing between targets
- **Gesture Alternatives**: Every gesture has keyboard/tap alternative
- **Screen Reader**: VoiceOver (iOS) and TalkBack (Android) compatibility
- **Zoom Support**: Content readable at 200% zoom without horizontal scrolling

### Animation & Interaction Design

**Animation Principles:**
- **Purpose-Driven**: Every animation serves user understanding or feedback
- **Performance**: 60fps smooth animations, GPU-accelerated when possible
- **Accessibility**: Respect prefers-reduced-motion settings
- **Timing**: Fast (150ms) for feedback, normal (200ms) for transitions, slow (300ms) for complex

**Interaction Patterns:**
- **Hover States**: Subtle elevation, color changes, never dramatic
- **Loading States**: Skeleton loaders for structured content, spinners for actions
- **Success Feedback**: Green checkmarks, celebration micro-animations
- **Error States**: Red indicators, clear recovery actions, helpful messaging

### Visual Polish & Premium Feel

**Depth & Elevation:**
- **Shadows**: Subtle box-shadows for cards, elevated shadows for modals
- **Layering**: Clear z-index hierarchy, proper stacking context
- **Borders**: Subtle borders for definition, never harsh lines

**Micro-Interactions:**
- **Button Press**: Subtle scale animation (scale: 0.98) on active
- **Form Focus**: Border color changes, subtle glow effects
- **Success Actions**: Brief success animations, progress indicators

**Professional Aesthetics:**
- **Clean Layouts**: Consistent alignment, proper spacing rhythm
- **Quality Imagery**: High-resolution icons, consistent illustration style
- **Premium Typography**: Proper line-height, letter-spacing, hierarchy

---

## 🔄 Core Workflow: Continuous Growth Loop

The EdCoachAi continuous growth loop transforms traditional episodic coaching into an ongoing, supportive methodology. Each phase builds upon the previous, creating a comprehensive system for teacher professional development.

---

### Phase 1: Set Goal (PGP Goal-Setting System)

**User Story Foundation**: "As a coach, I want to collaborate with teachers to set meaningful, specific professional growth goals so that our coaching sessions are focused and aligned with their development needs."

**Entry Points:**
- Coach Dashboard → "Teachers" tab → Individual teacher profile → "[Set PGP Goal]" button
- New teacher onboarding flow → PGP goal setting step
- Existing teacher profile → "Update Goal" action

**Detailed Workflow:**
1. **Goal Context Gathering**: Coach reviews teacher background, teacher provides self-assessment, discussion of priorities
2. **LER Indicator Selection**: Browse Louisiana Educator Rubric domains, select 1-2 primary indicators for focused growth
3. **AI-Assisted Goal Generation**: System aggregates context and generates SMART goal suggestions with rationale
4. **Collaborative Refinement**: Coach and teacher review, edit, and personalize the goal together
5. **Goal Finalization**: Save goal, set milestones, generate coaching strategy, schedule first walkthrough

**Key Features:**
- Context-aware AI aligned with teacher's subject, grade level, and experience
- Collaborative process ensuring teacher ownership throughout
- Direct integration with Louisiana Educator Rubric indicators
- Built-in progress tracking and milestone framework

**Success Outcomes:**
- Teacher has clear, specific professional growth goal visible across all coaching interactions
- Foundation established for targeted feedback and reflection
- Coaching strategy aligned with teacher's development needs

---

### Phase 2: Capture Evidence (Classroom Walkthrough System)

**User Story Foundation**: "As a coach, I want to quickly capture meaningful evidence during classroom observations so that I can provide specific, actionable feedback tied to the teacher's professional growth goals."

**Entry Points:**
- Coach Dashboard → "[+ New Walkthrough]" prominent action button
- Teacher profile → "Conduct Walkthrough" quick action
- Mobile app → "Start Observation" from home screen

**Detailed Workflow:**
1. **Pre-Walkthrough Setup** (30 seconds): Select teacher, review PGP goal context, set observation focus
2. **Evidence Capture** (3-5 minutes): Large text area with voice-to-text, timestamp markers, photo attachments
3. **Indicator Selection**: Choose reinforcement ("what went well") and refinement ("growth area") indicators
4. **Context Enhancement**: Add lesson context, environmental factors, student response notes
5. **AI Processing**: System begins generating feedback while coach completes walkthrough

**Mobile Optimization:**
- Tablet-first design optimized for iPad/tablet coaching workflows
- Large touch targets for easy classroom navigation
- Voice-to-text capability for hands-free note-taking
- Offline capability with automatic sync when connected

**Success Outcomes:**
- High-quality evidence captured in under 5 minutes
- Clear connection between observations and teacher's growth goals
- Coach can focus on relationship building rather than paperwork

---

### Phase 3: Generate Feedback (AI-Enhanced Feedback System)

**User Story Foundation**: "As a coach, I want to provide personalized, specific feedback that connects classroom observations to the teacher's professional growth goals so that teachers receive actionable guidance for improvement."

**Automatic Processing:**
1. **Context Aggregation**: Teacher's PGP goal, selected indicators, evidence notes, teacher background
2. **AI Generation**: OpenAI creates reinforcement and refinement feedback with specific evidence connections
3. **Coach Review Interface**: Preview, edit, regenerate options, manual override capability
4. **Quality Control**: Specificity validation, tone consistency, bias detection

**Advanced Features:**
- Contextual personalization adapted to teacher's experience level
- Goal-aligned feedback connecting every observation to professional growth
- Progressive complexity matched to teacher's readiness
- Evidence integration with specific examples woven throughout

**Fallback Systems:**
- Structured templates when AI generation fails
- Offline mode with sync capability
- Usage tracking with plan limit alerts
- Quality assurance for inappropriate content

**Success Outcomes:**
- Personalized feedback generated in under 10 seconds
- Strong connection between observations and growth goals
- Actionable suggestions teachers can immediately implement

---

### Phase 4: Reflect (Teacher Growth Journal System)

**User Story Foundation**: "As a teacher, I want to reflect on the feedback I receive and take ownership of my professional growth so that I can continuously improve my practice and achieve my development goals."

**Notification & Access:**
- Email notification with feedback preview
- In-app notifications with direct links
- Mobile app push notifications
- Dashboard integration with recent feedback

**Reflection Interface:**
1. **Feedback Context Display**: PGP goal reminder, observation details, reinforcement and refinement sections
2. **Guided Reflection Prompts**: Success recognition, growth mindset questions, action planning, resource needs
3. **Capture Tools**: Rich text editor, voice-to-text, automatic draft saving, privacy controls

**Advanced Features:**
- Progress tracking integration with goal progress sliders
- Action planning tools with implementation timelines
- Resource recommendations based on reflection themes
- Celebration moments with progress badges and milestones

**Privacy & Security:**
- Teacher-owned reflections shared only with assigned coach
- Edit history with timestamps
- Export capabilities for teacher records
- Clear data retention and deletion policies

**Success Outcomes:**
- Teachers actively engage with feedback within 48 hours
- Deep reflection demonstrates ownership of professional growth
- Clear action plans emerge for implementation
- Strong foundation for follow-up coaching conversations

---

### Phase 5: Monitor Growth (Analytics & Progress Tracking)

**User Story Foundation**: "As a coach and teacher, I want to see clear evidence of professional growth over time so that I can celebrate progress, identify patterns, and make data-informed decisions about next steps."

**Coach Analytics Dashboard:**
- Team overview with engagement metrics and growth indicators
- Individual teacher insights with PGP progress and walkthrough history
- Coaching effectiveness metrics and relationship health indicators
- Advanced analytics (Pro): heat maps, trend analysis, predictive insights

**Teacher Personal Dashboard:**
- Growth journey visualization with PGP goal progress
- Achievement recognition with badges and milestone celebrations
- Self-assessment tools and confidence tracking
- Next goal planning capabilities

**Real-Time Monitoring:**
- Live activity feed with recent walkthroughs and pending reflections
- Engagement tracking with response times and reflection quality
- Pattern recognition identifying growth accelerators and challenges
- Recommendation engine for next steps and resources

**Success Outcomes:**
- Clear evidence of teacher professional growth over time
- Data-driven coaching decisions and strategy adjustments
- Early identification of teachers needing additional support
- Comprehensive documentation of coaching program effectiveness

---

### Cross-Phase Integration & Workflow Intelligence

**Seamless Transitions:**
- Automatic progression based on engagement and progress
- Contextual continuity with information flowing between phases
- Personalized pacing with appropriate support levels
- Intervention triggers when teachers need additional help

**Workflow State Management:**
- Detailed progress tracking through growth journey
- Recovery mechanisms for missed phases
- Cycle completion recognition and celebration
- Smooth transition to new growth goals and coaching cycles

This comprehensive continuous growth loop creates a supportive, data-informed coaching relationship that transforms both coach and teacher experience while driving measurable professional growth.

---

## 🚀 Strategic Priorities

### P0 - Critical (Current Sprint)
1. **AI Feedback System Reliability**
   - Problem: No fallback when AI generation fails
   - Solution: User control interfaces, regeneration options, robust error handling
   - Impact: Prevents users from getting stuck in workflow

2. **Mobile Optimization Implementation**  
   - Problem: Primary users (coaches) use tablets but experience isn't optimized
   - Solution: Touch-friendly interactions, responsive components, tablet-optimized forms
   - Impact: Core user workflow success

3. **Onboarding State Machine**
   - Problem: Design complete but implementation pending
   - Solution: Replace useEffect chains, add recovery mechanisms, clear error paths
   - Impact: User activation and retention

### P1 - Important (Next Quarter)
1. **Real-time Collaboration Features**
   - Multi-user conflict resolution, presence indicators, graceful WebSocket handling
2. **Advanced Analytics (Coach Pro)**
   - Heat maps, trend analysis, export functionality for premium tier
3. **Teacher Dashboard Enhancement**
   - Expanded navigation, overview cards, progress visualization, feature discovery

### P2 - Future (6+ Months)
1. **Multi-language Support** - Expand beyond English-speaking schools
2. **Advanced AI Features** - Predictive insights and recommendations  
3. **Native Mobile Apps** - iOS/Android after web mobile optimization complete

---

## 🔒 Business Model & Market Strategy

### Revenue Model & Pricing Strategy

**Option A: Conservative Pricing Strategy** - Balanced approach for sustainable growth

**⚠️ SINGLE SOURCE OF TRUTH FOR PRICING** - All pricing information is defined here and referenced by all other documents and code.

**Business Model Decision (September 2025):**
After comprehensive market research analysis comparing competitors (GoReact $70-95/year, Sibme $30/month, Edthena $3,450/school/year), we selected Option A for the following strategic reasons:

1. **Market Reality**: Competitors don't offer generous free tiers - our conservative approach aligns with market expectations
2. **Value Positioning**: AI-enhanced feedback justifies premium pricing above basic observation tools
3. **Conversion Strategy**: Limited free tier (1 teacher, 3 walkthroughs/month) creates natural upgrade pressure
4. **Sustainable Growth**: Conservative approach ensures business viability and clear upgrade path
5. **Competitive Advantage**: Priced below major competitors while offering superior AI-powered features

**Coach Free - User Acquisition:**
- **Limitations**: 1 teacher, 3 walkthroughs/month, basic AI feedback
- **Features**: Core continuous growth loop, teacher growth journal, email support
- **Purpose**: Demonstrate value, build user base, create natural upgrade pressure
- **Target Conversion**: 15% free-to-paid conversion rate

**Coach Starter ($19/month) - Growth Stage:**
- **Limitations**: 5 teachers, 15 walkthroughs/month
- **Features**: Enhanced AI feedback, bulk invitations, 90-day analytics
- **Advanced**: Basic team management, improved support
- **Target**: New coaches scaling from 1 to 5 teachers

**Coach Pro ($49/month) - Scale & Impact:**
- **Limitations**: 15 teachers, 50 walkthroughs/month
- **Advanced**: Team analytics dashboard, heat maps, trend analysis
- **Premium**: Export functionality (PDF/CSV), priority support (<2hr response)
- **Exclusive**: Advanced reporting features, custom rubric indicators
- **Target**: Serious coaches managing 5+ teachers, district instructional leaders

**District Enterprise ($500/month) - Scale & Integration:**
- **Unlimited**: Teachers, walkthroughs, AI feedback generation
- **Multi-School**: District-wide deployment with centralized management
- **Integration**: SIS/LMS connections, single sign-on, data synchronization
- **Support**: Dedicated success manager, custom training, compliance reporting
- **Analytics**: District-wide insights, comparative analytics, board reporting
- **Target**: School districts with 50+ coaches, enterprise-level needs

### Market Positioning & Competitive Strategy

**Core Market Position:**
"The only AI-powered coaching platform built specifically for the continuous growth loop methodology, transforming classroom walkthroughs from episodic events into ongoing, supportive professional development."

**Unique Value Propositions vs Competitors:**

| **EdCoachAi Advantage** | **Traditional Competitors** | **Our Differentiation** |
|--------------------------|----------------------------|-------------------------|
| **PGP-Aligned AI Feedback** | Generic observation templates | AI understands long-term teacher goals |
| **5-Minute Walkthroughs** | 15-20 minute formal observations | Mobile-first, efficiency-focused design |
| **Teacher Ownership** | Top-down evaluation systems | Teachers actively participate in growth |
| **Continuous Loop** | Episodic coaching events | Ongoing, supportive methodology |
| **Louisiana Native** | Generic, one-size-fits-all | Built specifically for LER indicators |

**Competitive Moats:**
1. **AI Context Advantage**: Our AI understands PGP goals, not just single observations
2. **Methodology Integration**: Complete continuous growth loop, not just tools
3. **User Experience**: Mobile-first design optimized for real coaching workflows
4. **Data Network Effects**: More usage improves AI feedback quality for all users

### Go-to-Market Strategy

**Primary Sales Motion: Land and Expand**
1. **Land**: Individual coaches adopt free tier for immediate value
2. **Expand**: Upgrade to Pro when managing more teachers or needing analytics
3. **Scale**: District adoption when multiple coaches show success

**Customer Acquisition Channels:**
- **Content Marketing**: Educational leadership blogs, coaching methodology content
- **Professional Networks**: LinkedIn groups, education conferences, peer referrals
- **Partnership Strategy**: Integration with existing SIS/LMS providers
- **Freemium Viral**: Coaches invite teachers, creating network effects

**Sales Process:**
- **Self-Service**: Free and Pro tiers with automated onboarding
- **Assisted Sales**: Enterprise tier with dedicated sales process
- **Customer Success**: Proactive support to drive adoption and retention

### Customer Success & Retention Strategy

**Onboarding Excellence:**
- **Time to Value**: First successful walkthrough within 24 hours
- **Success Milestones**: 5 walkthroughs completed, 3 teacher reflections received
- **Support Touchpoints**: Email sequences, in-app guidance, success manager contact

**Feature Adoption Drivers:**
- **Coach Starter Triggers**: Approaching 1-teacher or 3-walkthrough limit, wanting bulk invitations
- **Coach Pro Triggers**: Approaching 5-teacher or 15-walkthrough limit, requesting team analytics
- **Enterprise Triggers**: Multiple coaches in district, integration requests, unlimited needs
- **Retention Tactics**: Usage insights, best practice sharing, peer connections

**Success Metrics by Tier:**
- **Free Tier**: User activation (first walkthrough), feature adoption, upgrade signals (approaching limits)
- **Coach Starter**: Usage depth (5+ walkthroughs/month), teacher engagement, upgrade to Pro signals
- **Coach Pro**: Usage depth (15+ walkthroughs/month), analytics engagement, renewal likelihood
- **Enterprise**: Multi-school adoption, compliance usage, contract expansion

### Marketing Strategy & Messaging

**Core Marketing Principles:**
1. **Sell Transformation, Not Features**: Focus on "new version" of coaches and teachers
2. **Target by Awareness**: Meet users where they are in their coaching journey
3. **Enter Existing Conversation**: Hook into frustrations coaches already feel
4. **Specificity Sells**: "<5 minute walkthroughs" vs "faster observations"
5. **Proof > Promise**: Demonstrate value through tangible results

**Messaging Framework by Persona:**

**For Instructional Coaches (Primary):**
- **Hook**: "Stop spending more time on paperwork than actual coaching"
- **Promise**: "Turn 5-minute observations into game-changing teacher growth"
- **Proof**: "Coaches complete walkthroughs 75% faster with 90% teacher engagement"
- **Objection Handling**: AI quality, teacher adoption, system complexity

**For Teachers (Secondary):**
- **Hook**: "Finally, feedback that actually helps you grow"
- **Promise**: "Own your professional development with clear, actionable guidance"
- **Proof**: "80% of teachers complete reflections within 48 hours"
- **Objection Handling**: Privacy concerns, evaluation anxiety, time requirements

**For Administrators (Enterprise):**
- **Hook**: "Transform professional development from cost center to growth engine"
- **Promise**: "District-wide instructional improvement with measurable ROI"
- **Proof**: "Schools see 40% improvement in coaching effectiveness metrics"
- **Objection Handling**: Budget constraints, implementation complexity, change management

### Financial Projections & Unit Economics

**Revenue Targets (Option A - Conservative):**
- **Year 1**: $25K ARR (500 free users, 50 Starter, 25 Pro subscribers)
- **Year 2**: $250K ARR (5,000 free users, 400 Starter, 200 Pro, 10 Enterprise)
- **Year 3**: $1.2M ARR (25,000 free users, 2,000 Starter, 800 Pro, 50 Enterprise)

**Key Metrics:**
- **CAC (Customer Acquisition Cost)**: <$50 for Starter, <$150 for Pro, <$2,000 for Enterprise
- **LTV (Lifetime Value)**: $456 Starter (24 months), $1,176 Pro (24 months), $18,000 Enterprise (36 months)
- **LTV/CAC Ratio**: >9:1 Starter, >8:1 Pro, >9:1 Enterprise for sustainable growth
- **Monthly Churn**: <8% for Starter, <5% for Pro, <2% for Enterprise

**Pricing Rationale:**
- **Conservative Free Tier**: 1 teacher, 3 walkthroughs/month creates natural upgrade pressure
- **Clear Value Progression**: $19 → $49 → $500 creates obvious upgrade path
- **Market Competitive**: Priced below Sibme ($30/month) and GoReact ($70-95/year) while offering AI enhancement

### Compliance & Risk Management

**Educational Data Compliance:**
- **FERPA Compliance**: Educational data protection standards, audit trail
- **State Privacy Laws**: California Student Privacy Rights, state-specific requirements
- **International**: GDPR readiness for potential international expansion

**Security & Trust:**
- **SOC 2 Certification**: Security, availability, confidentiality standards
- **Data Encryption**: At rest and in transit, role-based access control
- **Privacy by Design**: Teacher reflections private, minimal data collection
- **Incident Response**: Breach notification procedures, recovery protocols

**Business Risk Mitigation:**
- **Competitive Risk**: Continuous innovation, user feedback loops, switching costs
- **Technology Risk**: Multi-cloud strategy, backup systems, disaster recovery
- **Market Risk**: Diversified customer base, multiple revenue streams
- **Regulatory Risk**: Proactive compliance, legal review processes

---

## 🎯 Success Framework

### Key Performance Indicators
- **User Experience**: 85%+ onboarding completion, <5% error rate
- **Business**: 15%+ free-to-paid conversion, <5% monthly churn
- **Product**: 90%+ walkthrough completion, 4.0/5+ feedback quality
- **Technical**: 99.9% uptime, <3s load times, 90+ Lighthouse scores

### Quality Standards
- **Code**: 100% TypeScript coverage, comprehensive error handling
- **Design**: WCAG AA compliance, mobile-first responsive design
- **Performance**: <3 second critical path loading, optimized bundle size
- **User Experience**: Intuitive navigation, clear feedback, graceful failure handling

---

## 📝 Maintenance Guidelines

### Context Updates
- **Business Changes**: Update User Context and Strategic Priorities sections
- **Technical Changes**: Update Technical Context and Architecture sections  
- **Design Changes**: Update Design Context and UI Patterns sections
- **Process Changes**: Update Core Workflow section

### Version Control
- **Major Updates**: Increment version number, document changes in git commit
- **Ownership**: Section owners responsible for keeping their areas current
- **Review Cycle**: Quarterly comprehensive review, monthly tactical updates

### Integration Points
- **Agent Instructions**: All agents reference this context, no duplication
- **Development Rules**: .cursorrules points to this file for detailed context
- **Brand System**: brand-guidelines.md provides visual identity and logo implementation
- **Documentation**: Archive docs available for historical reference

---

*Last Major Update: September 17, 2025 - Initial consolidation of all project context*
*Next Review: December 2025 - Post-P0 completion assessment*
