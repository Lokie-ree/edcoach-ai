# Development Workflow - EdCoach AI

## 🌿 Git Branching Strategy

```
main                    (production-ready code)
├── develop            (integration branch)  
    ├── feature/pgp-goal-wizard
    ├── feature/reflection-enhancements
    ├── feature/export-system
    └── hotfix/critical-fixes (if needed)
```

## 🔄 Development Workflow

### Starting New Feature Development

```bash
# Always start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Push branch to remote
git push -u origin feature/your-feature-name
```

### During Development

```bash
# Commit frequently (every 30-60 minutes)
git add .
git commit -m "wip(scope): brief description of progress"

# At end of development session
git add .
git commit -m "feat(scope): complete feature implementation

- Detailed bullet points of what was implemented
- Any important technical decisions
- Agent responsible for the work

Agent: [Agent Name]"

# Push to remote
git push origin feature/your-feature-name
```

### Completing Features

```bash
# When feature is complete, create PR to develop
# After PR approval and merge:

# Switch back to develop and clean up
git checkout develop
git pull origin develop
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## 📝 Commit Message Standards

```
<type>(<scope>): <description>

[optional body]

[optional footer with Agent info]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix  
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(backend): implement AI-assisted PGP goal generation
fix(frontend): resolve mobile navigation overflow  
docs(api): add walkthrough endpoint documentation
chore(deps): update convex to v1.26.0
```

## 👥 Agent Development Standards

### Product Manager Commits
```bash
git commit -m "feat(requirements): define PGP goal wizard specifications

- Create detailed user stories with acceptance criteria
- Define success metrics and KPIs
- Specify user journey and interaction patterns
- Document business logic requirements

Agent: Product Manager"
```

### System Architect Commits
```bash
git commit -m "feat(architecture): design PGP goal generation system

- Define API contracts for goal generation
- Specify data models and validation schemas
- Design AI integration architecture
- Document security and performance requirements

Agent: System Architect"
```

### UX/UI Designer Commits
```bash
git commit -m "feat(design): create PGP goal wizard interface design

- Design multi-step wizard flow with validation
- Create responsive layouts and components
- Ensure accessibility compliance (WCAG AA)
- Define interaction patterns and micro-animations

Agent: UX/UI Designer"
```

### Backend Engineer Commits
```bash
git commit -m "feat(backend): implement AI-assisted goal generation

- Add OpenAI integration for SMART goal creation
- Implement rubric indicator context processing
- Add usage tracking and plan limit enforcement
- Include comprehensive error handling

Agent: Senior Backend Engineer"
```

### Frontend Engineer Commits  
```bash
git commit -m "feat(frontend): build PGP goal wizard interface

- Create multi-step wizard with validation
- Implement responsive design patterns
- Add accessibility features (WCAG AA)
- Integrate with backend API endpoints

Agent: Senior Frontend Engineer"
```

## 🏗️ Project-Specific Development Guidelines

### Backend Development (Convex)
- **Use new function syntax** with comprehensive validators
- **Implement proper error handling** for all functions
- **Follow security best practices** for data access
- **Optimize queries** with proper indexing
- **Document all functions** with JSDoc comments

```typescript
// Example Convex function pattern
export const exampleFunction = mutation({
  args: {
    requiredField: v.string(),
    optionalField: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    data: v.any(),
  }),
  handler: async (ctx, args) => {
    // Implementation with proper error handling
    try {
      // Function logic here
      return { success: true, data: result };
    } catch (error) {
      console.error("Function failed:", error);
      throw new ConvexError("Detailed error message");
    }
  },
});
```

### Frontend Development (Next.js + React)
- **Use TypeScript** for all components with proper typing
- **Follow component structure** from .cursorrules
- **Use design tokens** from `lib/design-tokens.ts`
- **Implement accessibility** standards (WCAG AA)
- **Optimize for mobile-first** responsive design

```typescript
// Example component pattern
interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  // Feature-specific props with proper types
  data: ConvexType;
}

export function Component({ className, children, data }: ComponentProps) {
  return (
    <div className={cn("base-styles", className)}>
      {children}
    </div>
  );
}
```

### Design System Implementation
- **Always use design tokens** instead of hardcoded values
- **Follow established patterns** in `components/ui/`
- **Ensure consistency** across all components
- **Test accessibility** with screen readers
- **Maintain responsive behavior** on all devices

## 🔧 Development Environment Setup

### Prerequisites
```bash
# Node.js 18+ and pnpm
node --version  # Should be 18+
pnpm --version  # Should be 8+

# Git configuration
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Initial Setup
```bash
# Clone repository
git clone [repository-url]
cd edcoachai

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Add your Convex deployment URL and Clerk keys

# Start development
pnpm dev
```

### Development Commands
```bash
# Start both frontend and backend
pnpm dev

# Individual services
pnpm dev:frontend    # Next.js on :3000
pnpm dev:backend     # Convex development

# Build for production
pnpm build

# Lint code
pnpm lint

# Type checking
pnpm type-check
```

## 🧪 Testing & Quality Assurance

### Pre-commit Checklist
Before committing code, ensure:
- [ ] **TypeScript**: No type errors
- [ ] **Linting**: ESLint passes
- [ ] **Design Tokens**: Used instead of hardcoded values
- [ ] **Mobile Responsive**: Tested on mobile viewports
- [ ] **Accessibility**: WCAG AA compliance verified
- [ ] **Error Handling**: Proper error boundaries implemented
- [ ] **Performance**: No obvious performance issues
- [ ] **Tests**: Any new functionality tested

### Code Review Standards
- **Functionality**: Feature works as specified
- **Code Quality**: Follows project patterns and standards  
- **Performance**: No performance regressions
- **Security**: No security vulnerabilities introduced
- **Accessibility**: WCAG AA standards maintained
- **Design System**: Consistent with established patterns

## 🚀 Current Development Sprint Status

### Week 1: PGP Goal-Setting Wizard
**Branch**: `feature/pgp-goal-wizard`  
**Status**: Ready to begin  
**Team**: All agents coordinated by Orchestration Agent

**Sprint Tasks**:
- [ ] **Product Manager**: Define detailed requirements
- [ ] **System Architect**: Design technical specifications
- [ ] **UX/UI Designer**: Create wizard interface design
- [ ] **Backend Engineer**: Implement AI goal generation
- [ ] **Frontend Engineer**: Build wizard UI components
- [ ] **Integration**: End-to-end testing and refinement

**Success Criteria**:
- [ ] Coach can create PGP goals through guided wizard
- [ ] AI generates contextual SMART goals
- [ ] Mobile-responsive interface implemented
- [ ] All accessibility standards met
- [ ] Integration tests passing

### Week 2: Enhanced Reflection System (Planned)
**Branch**: `feature/reflection-enhancements`  
**Status**: Planning phase  
**Focus**: Advanced reflection analytics and sharing capabilities

## 📊 Development Progress Tracking

### Completed Features ✅
- [x] **User Authentication** (Clerk integration)
- [x] **Dashboard Layouts** (Coach and Teacher views)  
- [x] **Walkthrough System** (Evidence capture)
- [x] **AI Feedback Generation** (GPT-4 powered)
- [x] **Analytics Dashboard** (Comprehensive insights)
- [x] **Mobile Responsive Design** (All interfaces)

### In Progress 🔄
- [ ] **PGP Goal-Setting Wizard** (Week 1 Sprint)
  - [ ] Requirements definition
  - [ ] Technical architecture  
  - [ ] UI/UX design
  - [ ] Backend implementation
  - [ ] Frontend development

### Planned Features 📋
- [ ] **Enhanced Reflection System** (Week 2)
- [ ] **Export/Reporting Features** (Week 3)
- [ ] **Advanced Analytics** (Week 4)
- [ ] **Performance Optimizations** (Ongoing)

## 🐛 Bug Reporting & Hotfixes

### Bug Report Template
```
**Bug Title**: Brief description
**Priority**: Critical/High/Medium/Low
**Environment**: Development/Staging/Production
**Steps to Reproduce**: 
1. Step one
2. Step two
3. Issue occurs

**Expected Behavior**: What should happen
**Actual Behavior**: What actually happens
**Agent Responsible**: [Agent who can fix this]
```

### Hotfix Process
```bash
# For critical production issues
git checkout main
git checkout -b hotfix/critical-issue-name
# Fix the issue
git commit -m "hotfix: resolve critical issue description"
git push origin hotfix/critical-issue-name
# Create PR to main, merge immediately after review
```

## 📈 Performance & Monitoring

### Performance Standards
- **Page Load**: < 3 seconds on 3G connection
- **Lighthouse Score**: > 90 for Performance, Accessibility, Best Practices
- **Core Web Vitals**: All metrics in "Good" range
- **Mobile Performance**: Optimized for mobile-first experience

### Monitoring Checklist
- [ ] **Error Tracking**: No unhandled errors
- [ ] **Performance Metrics**: Load times within targets
- [ ] **User Analytics**: User flows working correctly
- [ ] **API Performance**: Response times < 500ms
- [ ] **Database Queries**: Optimized and indexed

## 🔐 Security & Best Practices

### Security Checklist
- [ ] **Authentication**: Properly implemented with Clerk
- [ ] **Authorization**: Role-based access control
- [ ] **Data Validation**: All inputs validated with Zod
- [ ] **Error Handling**: No sensitive data in error messages
- [ ] **API Security**: Proper rate limiting and validation

### Code Quality Standards
- **TypeScript**: 100% TypeScript coverage
- **ESLint**: All rules passing
- **Prettier**: Consistent code formatting
- **Component Structure**: Following established patterns
- **Design System**: Consistent token usage

---

## 🎯 Quick Reference Commands

```bash
# Start development
pnpm dev

# Create new feature branch
git checkout develop && git pull && git checkout -b feature/feature-name

# Commit with agent context
git commit -m "feat(scope): description

Agent: [Agent Name]"

# Push feature branch
git push origin feature/feature-name

# Clean up after merge
git checkout develop && git pull && git branch -d feature/feature-name
```

**Remember**: Commit early, commit often, and always include agent context in commit messages!

---

*This workflow ensures high-quality, coordinated development across all AI agents while maintaining clean Git history and proper project standards.*