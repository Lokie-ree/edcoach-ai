# EdCoach AI - Instructional Coaching Platform

AI-powered instructional coaching and feedback platform for K-12 schools using Next.js 15, Convex, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers (frontend + backend)
pnpm dev

# Access the application
# Frontend: http://localhost:3000
# Convex Dashboard: https://dashboard.convex.dev
```

## 📋 Project Status

**Overall Completion: 82%** - Ready for production-focused development

- **Backend**: 85% complete (71 Convex functions)  
- **Frontend**: 70% complete (working dashboards)
- **AI Integration**: Production ready
- **Mobile Design**: Complete

See [DEVELOPMENT.md](./DEVELOPMENT.md) for detailed development workflow.

## 🔄 Continuous Growth Loop

Supporting educator growth through 5 phases:
1. **Set Goal** → PGP Goal-Setting System  
2. **Capture Evidence** → Walkthrough Data Collection
3. **Generate Feedback** → AI-Powered Insights
4. **Reflect** → Growth Journal Experience  
5. **Monitor Growth** → Analytics Dashboard

## 📚 Documentation

- [Business Context](./docs/business/) - Vision, personas, user journeys
- [Technical Architecture](./docs/technical/) - System design, code structure  
- [Design System](./docs/design/) - UI components, guidelines
- [Agent Instructions](./agents/) - AI agent coordination system

## 🛠️ Technology Stack

- **Frontend**: Next.js 15.4.6, React 19, TypeScript 5.9.2
- **Backend**: Convex with real-time subscriptions
- **Styling**: Tailwind CSS with design tokens
- **Auth**: Clerk Authentication
- **AI**: OpenAI GPT-4 integration
- **Components**: Radix UI primitives

## 🏗️ Current Architecture

### Backend Status (85% Complete)
- ✅ **71 Convex functions** across 18 files
- ✅ **Complete schema** with 8 core tables
- ✅ **User management** and authentication
- ✅ **AI feedback system** with GPT-4 integration
- ✅ **Analytics system** (1080+ lines of analytics code)
- ✅ **Walkthrough system** with mobile-optimized forms

### Frontend Status (70% Complete)  
- ✅ **Complete dashboard layouts** for coach and teacher roles
- ✅ **Mobile-responsive design** with design tokens
- ✅ **Working authentication** and route protection
- ✅ **Component library** using Radix UI + Tailwind
- 🔧 **Missing**: PGP Goal-Setting Wizard UI

### Continuous Growth Loop Implementation
- **Phase 1 (Set Goal)**: 75% - Need AI-assisted goal wizard
- **Phase 2 (Capture Evidence)**: 90% - Walkthrough system operational  
- **Phase 3 (Generate Feedback)**: 85% - AI integration working
- **Phase 4 (Reflect)**: 80% - Growth journal functional
- **Phase 5 (Monitor Growth)**: 95% - Analytics comprehensive

## 🚀 Getting Started for Development

1. **Clone and setup**:
   ```bash
   git clone [repository-url]
   cd edcoachai
   pnpm install
   ```

2. **Environment setup**:
   ```bash
   # Copy environment template
   cp .env.example .env.local
   # Add your Convex and Clerk keys
   ```

3. **Start development**:
   ```bash
   pnpm dev
   # Opens frontend (localhost:3000) and Convex dashboard
   ```

4. **Follow Git workflow** in [DEVELOPMENT.md](./DEVELOPMENT.md)

## 📝 Contributing

This project uses an **AI Agent Orchestration System** for development:

1. **Product Manager** - Defines requirements and user stories
2. **System Architect** - Creates technical specifications  
3. **Senior Backend Engineer** - Implements Convex backend
4. **Senior Frontend Engineer** - Builds React/Next.js UI
5. **UX/UI Designer** - Creates design system and interfaces
6. **Orchestration Agent** - Coordinates all agents

See [agents/](./agents/) directory for detailed agent instructions.

## 📊 Development Priorities

### **Week 1: PGP Goal-Setting Wizard** 🎯
- **Status**: Ready to begin
- **Completion**: Will bring Phase 1 to 100%
- **Impact**: Completes core coaching workflow

### **Week 2: Enhanced Reflection System** ✨  
- **Status**: Planned
- **Focus**: Advanced analytics and sharing features
- **Impact**: Enhances Phase 4 teacher engagement

## 🔗 Quick Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [docs/](./docs/)
- **API Reference**: [Convex Functions](./convex/)
- **Component Storybook**: [Coming Soon]
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

Built with ❤️ for educators everywhere by the AI Agent Development Team.