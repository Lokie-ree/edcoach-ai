# EdCoach AI - Master Context

**Last Updated:** September 17, 2025  
**Maintainers:** Product Manager (lead), System Architect, UX Designer, Senior Engineers  
**Purpose:** Single source of truth for all EdCoach AI project context

---

## 🎯 Project Foundation

### Mission Statement
**Transform classroom walkthroughs into a continuous, supportive, and data-informed growth loop for educators.**

### Core Philosophy: The Continuous Growth Loop
EdCoach AI is built around a five-phase continuous growth methodology that transforms traditional coaching from episodic events into an ongoing, supportive process:

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

**Database Design:**
```typescript
// Core Data Models with Relationships
interface User {
  _id: Id<"users">;
  clerkId: string;
  role: "coach" | "teacher";
  plan: "free" | "coach_starter" | "coach_pro";
  subscriptionStatus: "active" | "past_due" | "canceled";
}

interface Teacher {
  _id: Id<"teachers">;
  userId: Id<"users">;
  coachId: Id<"users">;
  status: "pending" | "needs_details" | "active";
  pgpGoal?: {
    text: string;
    indicatorCode: string;
    progress: number;
  };
}

interface Walkthrough {
  _id: Id<"walkthroughs">;
  teacherId: Id<"teachers">;
  observerId: Id<"users">;
  reinforcementIndicator: string;
  refinementIndicator: string;
  evidenceSummary: string;
  aiFeedback: {
    reinforcement: string;
    refinement: string;
    generatedAt: number;
  };
  status: "draft" | "completed";
}

interface Reflection {
  _id: Id<"reflections">;
  walkthroughId: Id<"walkthroughs">;
  teacherId: Id<"teachers">;
  content: string;
  nextSteps: string[];
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

### Phase 1: Set Goal (PGP Goal-Setting)
**Entry Point**: Coach Dashboard → Teacher Profile → "[Set PGP Goal]"
**Process**: LER indicator selection → Context input → AI-assisted SMART goal generation → Review & save
**Outcome**: Teacher has defined PGP goal visible on profile and available for all future coaching

### Phase 2: Capture Evidence (Walkthrough)
**Entry Point**: Dashboard "[+ New Walkthrough]" or teacher profile
**Process**: Teacher selection → Indicator choices → Evidence summary → Mobile-friendly form completion
**Outcome**: Structured observation data ready for AI processing

### Phase 3: Generate Feedback (AI Integration)
**Process**: Context aggregation (PGP goal + rubric + evidence) → OpenAI API call → AI feedback generation
**Features**: User editing, regeneration options, fallback mechanisms for AI failures
**Outcome**: Hyper-contextualized, PGP-aligned feedback ready for delivery

### Phase 4: Reflect (Teacher Growth Journal)
**Entry Point**: Email notification → Growth Journal page
**Process**: Feedback review in PGP context → Guided reflection prompts → Next steps planning
**Outcome**: Teacher ownership of growth process, closed feedback loop

### Phase 5: Monitor Growth (Dashboard Analytics)
**Coach View**: Priority panel, activity feed, team analytics (Coach Pro)
**Teacher View**: Goal progress, refinement focus, reflection timeline
**Outcome**: Data-driven insights for continuous improvement

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

**Freemium Strategy**: Free tier drives adoption, paid tier captures value from serious users

**Coach Starter (Free) - User Acquisition:**
- **Limitations**: Up to 5 teachers, basic walkthrough functionality, standard AI feedback
- **Features**: Core continuous growth loop, teacher growth journal, email support
- **Purpose**: Demonstrate value, build user base, create upgrade pressure at scale
- **Target Conversion**: 15% free-to-paid conversion rate

**Coach Pro ($50/month) - Value Capture:**
- **Unlimited**: Teachers, walkthroughs, AI feedback generation
- **Advanced**: Team analytics dashboard, heat maps, trend analysis
- **Premium**: Export functionality (PDF/CSV), priority support (<2hr response)
- **Exclusive**: Custom rubric indicators, advanced reporting features
- **Target**: Serious coaches managing 10+ teachers, district instructional leaders

**District Enterprise ($500/month) - Scale & Integration:**
- **Multi-School**: District-wide deployment with centralized management
- **Integration**: SIS/LMS connections, single sign-on, data synchronization
- **Support**: Dedicated success manager, custom training, compliance reporting
- **Analytics**: District-wide insights, comparative analytics, board reporting
- **Target**: School districts with 50+ coaches, enterprise-level needs

### Market Positioning & Competitive Strategy

**Core Market Position:**
"The only AI-powered coaching platform built specifically for the continuous growth loop methodology, transforming classroom walkthroughs from episodic events into ongoing, supportive professional development."

**Unique Value Propositions vs Competitors:**

| **EdCoach AI Advantage** | **Traditional Competitors** | **Our Differentiation** |
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
- **Coach Pro Triggers**: Approaching 5-teacher limit, requesting team analytics
- **Enterprise Triggers**: Multiple coaches in district, integration requests
- **Retention Tactics**: Usage insights, best practice sharing, peer connections

**Success Metrics by Tier:**
- **Free Tier**: User activation (first walkthrough), feature adoption, upgrade signals
- **Coach Pro**: Usage depth (walkthroughs/month), analytics engagement, renewal likelihood
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

**Revenue Targets:**
- **Year 1**: $50K ARR (1,000 free users, 100 Pro subscribers)
- **Year 2**: $500K ARR (10,000 free users, 800 Pro, 20 Enterprise)
- **Year 3**: $2M ARR (50,000 free users, 3,000 Pro, 100 Enterprise)

**Key Metrics:**
- **CAC (Customer Acquisition Cost)**: <$100 for Pro, <$2,000 for Enterprise
- **LTV (Lifetime Value)**: $1,800 Pro, $18,000 Enterprise
- **LTV/CAC Ratio**: >18:1 for sustainable growth
- **Monthly Churn**: <5% for Pro, <2% for Enterprise

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
- **Documentation**: Other docs reference specific sections as needed

---

*Last Major Update: September 17, 2025 - Initial consolidation of all project context*
*Next Review: December 2025 - Post-P0 completion assessment*
