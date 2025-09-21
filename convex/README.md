# EdCoachAi - Convex Backend

**⚡ Single Source of Truth:** All technical specifications, database schemas, and API documentation are maintained in [`../docs/CONTEXT.md`](../docs/CONTEXT.md)

## 🎯 Quick Reference

**For complete technical details, see:**
- **Database Schema**: [`CONTEXT.md - Technical Context`](../docs/CONTEXT.md#🏗️-technical-context)
- **API Functions**: [`CONTEXT.md - Complete API Function Reference`](../docs/CONTEXT.md#complete-api-function-reference)
- **Architecture**: [`CONTEXT.md - Technology Stack & Architecture`](../docs/CONTEXT.md#technology-stack--architecture)
- **Performance**: [`CONTEXT.md - Performance Requirements & Standards`](../docs/CONTEXT.md#performance-requirements--standards)

---

## 🚀 Development Quick Start

### Environment Setup
```bash
# Required Environment Variables
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

# Run database migrations
npx convex run migrations:insertRubric
npx convex run migrations:bulkInsertRubricIndicators
```

---

## 📁 File Organization

### Core Backend Modules
- **`users.ts`** - Authentication & user management
- **`teachers.ts`** - Teacher management & PGP goals
- **`invitations.ts`** - Teacher invitation system
- **`walkthroughs.ts`** - Walkthrough creation & management
- **`aiFeedback.ts`** - AI feedback generation with OpenAI
- **`reflections.ts`** - Teacher reflection system
- **`workflowState.ts`** - Continuous growth loop workflow tracking
- **`analytics.ts`** - Coach & teacher analytics
- **`rubrics.ts` & `rubricIndicators.ts`** - Louisiana Educator Rubric system
- **`plans.ts` & `usage.ts`** - Subscription & usage management
- **`billing.ts`** - Subscription billing integration
- **`onboarding.ts`** - User onboarding flow
- **`audit.ts`** - Security & compliance logging

### System Utilities
- **`schema.ts`** - Complete database schema definitions
- **`auth.config.ts` & `auth.ts`** - Clerk authentication configuration
- **`http.ts`** - HTTP endpoints and webhooks
- **`migrations.ts`** - Database migration utilities

---

## 🏗️ Architecture Overview

EdCoachAi implements a **continuous growth loop methodology** for educational coaching:

1. **Set Goal** → PGP Goal-Setting with AI assistance
2. **Capture Evidence** → Mobile-optimized classroom walkthroughs
3. **Generate Feedback** → AI-powered, context-aware feedback
4. **Reflect** → Teacher growth journal and self-reflection
5. **Monitor Growth** → Real-time analytics and progress tracking

### Key Features
- **Coach-Teacher Relationships**: Direct 1:many coaching model
- **AI-Enhanced Feedback**: OpenAI GPT-4.1-mini with PGP context
- **Real-time Collaboration**: Live updates via Convex subscriptions
- **Louisiana Rubric Native**: Built specifically for LER indicators
- **Usage-Based Billing**: Tiered plans with automatic usage tracking

---

## 🔧 Implementation Status

**Overall Backend Completion: 95%** ✅

### Production-Ready Systems
- ✅ User authentication & management (Clerk integration)
- ✅ Teacher-coach relationship management
- ✅ PGP goal system with AI assistance
- ✅ Walkthrough creation & management
- ✅ AI feedback generation (GPT-4.1 integration)
- ✅ Continuous growth loop workflow tracking
- ✅ Comprehensive analytics system
- ✅ Louisiana Educator Rubric integration
- ✅ Usage tracking & plan enforcement
- ✅ Teacher reflection system
- ✅ Security & audit logging

### Key Capabilities
- Real-time data synchronization across all clients
- Automatic workflow progression through growth loop phases
- AI cost optimization with intelligent caching
- Plan-based usage limits with automatic enforcement
- Comprehensive error handling and recovery
- Performance monitoring and optimization

---

## 📊 Monitoring & Operations

### Production Monitoring
- **Usage Alerts**: Automatic notifications for usage thresholds
- **Error Tracking**: Comprehensive error logging and monitoring
- **Performance Metrics**: Query performance and response time tracking
- **Cost Monitoring**: AI usage cost tracking and optimization

### Development Tools
- **Convex Dashboard**: Real-time database and function monitoring
- **Function Logs**: Detailed execution logs for debugging
- **Schema Validation**: Automatic schema validation and type checking
- **Performance Profiling**: Built-in performance monitoring tools

---

## 🎯 Next Steps

For detailed implementation guidance, architecture decisions, and API specifications, reference the **[Master Context Document](../docs/CONTEXT.md)**.

**Key Development Areas:**
- Mobile optimization for tablet coaching workflows
- Advanced analytics and reporting features
- Real-time collaboration enhancements
- Performance optimization and scaling

---

*This backend is specifically designed for educational coaching workflows and integrates deeply with the Louisiana Educator Rubric system. All AI feedback is contextualized to support teacher professional growth through the continuous growth loop methodology.*

**Last Updated**: September 21, 2025  
**Total Functions**: 74+ exported functions across 18 modules  
**Total Tables**: 15 optimized database tables with proper indexing