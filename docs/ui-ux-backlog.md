# EdCoach AI - UI/UX Issues Backlog

**Date Created:** August 2, 2025  
**Last Updated:** August 2, 2025  
**Status:** Active backlog for future development cycles

## Recently Resolved Issues ✅

### High Priority - Completed
- ✅ Onboarding flow race conditions and complex state management
- ✅ Teacher status progression confusion ("pending" → "needs_details" → "active")
- ✅ Mobile walkthrough wizard navigation overlap and touch targets
- ✅ Container component inconsistencies (MaxWidthWrapper vs Section)
- ✅ Auto-save frequency issues (30s → 60s)
- ✅ localStorage quota limit handling

## Outstanding Issues Requiring Future Attention

### High Priority 🔴

#### 1. AI Feedback System Improvements
**Issue:** AI feedback generation lacks user control and fallback mechanisms
**Location:** `app/(dashboard)/walkthrough/new/components/wizard-steps/AIFeedbackStep.tsx`
**Problems:**
- No fallback when AI feedback generation fails
- Users can get stuck waiting for AI responses
- No ability to regenerate or edit AI feedback
- Caching system may serve stale feedback
**Impact:** Critical user experience issue that can block workflow completion
**Estimated Effort:** 2-3 sprints

#### 2. Onboarding State Machine Implementation
**Issue:** While designed, the simplified state machine hasn't been implemented yet
**Location:** `app/(setup)/onboarding/page.tsx`
**Current State:** Design complete, implementation pending
**Required Work:**
- Replace current useEffect chains with state machine
- Implement recovery mechanisms
- Add fallback paths for edge cases
**Impact:** Users still experiencing onboarding issues
**Estimated Effort:** 1-2 sprints

#### 3. Real-time Collaboration Issues
**Issue:** Limited real-time collaboration functionality
**Problems:**
- No conflict resolution for simultaneous editing
- No user presence indicators during collaboration
- WebSocket connection failures not handled gracefully
**Impact:** Multi-user editing scenarios fail
**Estimated Effort:** 3-4 sprints

### Medium Priority 🟡

#### 4. Subscription Enforcement Server-Side Implementation
**Issue:** Client-side enforcement can be bypassed
**Location:** `hooks/usageEnforcer.ts` and mutation functions
**Current State:** Design complete, server-side validation pending
**Required Work:**
- Implement server-side validation for all limits
- Add graceful degradation patterns
- Create usage warning system
**Impact:** Business-critical but not user-blocking
**Estimated Effort:** 1-2 sprints

#### 5. Teacher Dashboard Enhancement
**Issue:** Limited functionality awareness for teachers
**Location:** `components/layout/TeacherNavItems.tsx`
**Problems:**
- Only 2 main navigation items feels limiting
- No clear indication of available features
- No path for feature requests or coach collaboration
**Required Work:**
- Add overview cards showing coaching progress
- Expand navigation options
- Add progress visualization
**Impact:** Teacher engagement and retention
**Estimated Effort:** 1 sprint

#### 6. PGP Goal Setting Workflow
**Issue:** Professional Growth Plan functionality lacks clear workflow
**Location:** `app/(dashboard)/(teacher)/growth-journal/page.tsx`
**Problems:**
- Goals can be set but progress tracking unclear
- No connection between goals and walkthrough feedback
- Can't see overall progress across coaching cycles
**Required Work:**
- Create guided goal-setting process
- Add coach collaboration features
- Implement progress visualization
**Impact:** Core feature effectiveness
**Estimated Effort:** 2 sprints

#### 7. Animation & Motion Standardization
**Issue:** Inconsistent animation patterns throughout app
**Current State:** Design tokens created but not fully implemented
**Problems:**
- Various duration values (0.5s, 0.3s, 200ms, 500ms)
- Mixed animation libraries (Framer Motion + CSS)
- Hardcoded animation values
**Required Work:**
- Replace hardcoded animations with design tokens
- Standardize on single animation library
- Document animation guidelines
**Impact:** Polish and professional feel
**Estimated Effort:** 1 sprint

#### 8. Form Validation Consistency
**Issue:** Mixed form patterns and validation approaches
**Problems:**
- Different spacing and layout approaches
- Inconsistent validation error display
- Mixed button placement patterns (center vs left vs right)
**Required Work:**
- Standardize form layouts
- Create consistent validation components
- Document form patterns
**Impact:** User experience consistency
**Estimated Effort:** 1 sprint

### Low Priority 🟢

#### 9. Loading State Standardization
**Issue:** Mixed loading patterns across components
**Problems:**
- Some use skeleton loaders, others use spinners
- Inconsistent loading state durations
- No centralized loading management
**Required Work:**
- Create unified loading component system
- Standardize loading patterns
- Implement loading state management
**Impact:** Visual polish
**Estimated Effort:** 0.5 sprint

#### 10. Badge/Tag Component System
**Issue:** Color hardcoding instead of semantic variants
**Location:** Various badge usages throughout app
**Current Example:**
```typescript
<span className="bg-green-50 text-green-700 dark:bg-green-950/20">
<span className="bg-blue-50 text-blue-700 dark:bg-blue-950/20">
```
**Required Work:**
- Convert hardcoded colors to semantic variants
- Create comprehensive badge component
- Update all badge usages
**Impact:** Design system consistency
**Estimated Effort:** 0.5 sprint

#### 11. Icon Usage Standardization
**Issue:** Inconsistent icon sizing and color patterns
**Current State:** Partially addressed with design tokens
**Problems:**
- Mix of `h-4 w-4`, `h-5 w-5`, `size-4` patterns
- Direct color classes vs semantic classes
**Required Work:**
- Audit all icon usages
- Apply standardized sizing classes
- Use semantic color classes
**Impact:** Visual consistency
**Estimated Effort:** 0.5 sprint

#### 12. Responsive Grid Patterns
**Issue:** Inconsistent responsive grid implementations
**Current Examples:**
- `OverviewMetrics`: `grid-cols-2 lg:grid-cols-4 xl:grid-cols-5`
- `TeacherStatsCard`: `sm:grid-cols-3`
**Required Work:**
- Create standardized responsive grid utilities
- Document grid patterns
- Update inconsistent implementations
**Impact:** Layout consistency
**Estimated Effort:** 0.5 sprint

## Technical Debt & Quality Issues

### Accessibility Improvements Needed
- **Focus Management:** Modal dialogs don't trap focus properly
- **Keyboard Navigation:** Some components not fully keyboard accessible
- **Screen Reader Support:** Missing ARIA labels on dynamic content
- **Color Contrast:** Some UI elements don't meet WCAG guidelines

### Performance Optimizations
- **Bundle Size:** Large bundle from unused components
- **Dashboard Loading:** Multiple parallel queries causing slow loads
- **Auto-save Conflicts:** Manual saves conflicting with auto-saves
- **Offline Support:** No offline capability for critical features

### Error Handling Gaps
- **Network Failures:** Not handled gracefully across all components
- **Form Validation:** Error messages not clearly displayed in all cases
- **Component Failures:** Missing error boundaries in key areas

## Cleanup Tasks

### Code Organization
- **Remove Unused Components:** Clean up `components/_unused/` directory (if still exists)
- **File Naming:** Standardize PascalCase vs kebab-case inconsistencies
- **Component Consolidation:** Further opportunities for duplicate functionality merge

### Documentation Needs
- **Component Library:** Create Storybook or similar documentation
- **Design Guidelines:** Document responsive patterns and animation standards
- **Accessibility Guide:** WCAG compliance checklist and testing procedures

## Future Enhancement Opportunities

### Advanced Features (Long-term)
1. **Advanced Collaboration:** Real-time co-editing with operational transforms
2. **Analytics Dashboard:** Usage patterns and success metrics visualization
3. **White-labeling:** Customizable branding for schools/districts
4. **Integration APIs:** Connect with other educational tools
5. **Offline Mode:** Full offline capability with sync when connected
6. **Mobile App:** Native mobile application for field observations

### User Experience Innovations
1. **Voice Input:** Voice-to-text for walkthrough observations
2. **Smart Suggestions:** AI-powered suggestions for goal setting
3. **Gamification:** Achievement system for teacher growth
4. **Social Features:** Teacher peer collaboration and sharing
5. **Advanced Analytics:** Predictive insights for coaching effectiveness

## Monitoring & Success Metrics

### UX Metrics to Track
- **Onboarding Completion Rate:** Target >85%
- **Feature Adoption Rate:** Track usage of new features
- **User Satisfaction Score:** Regular user feedback surveys
- **Task Completion Time:** Measure efficiency improvements
- **Error Rate:** Monitor and reduce user-reported issues

### Technical Metrics
- **Page Load Times:** Maintain <3s for all critical pages
- **Mobile Performance:** Lighthouse scores >90
- **Accessibility Score:** WCAG AA compliance >95%
- **Bundle Size:** Monitor and optimize JavaScript payload

---

## Usage Instructions

This backlog should be:
1. **Reviewed monthly** during sprint planning
2. **Updated** when new issues are discovered
3. **Prioritized** based on user feedback and business needs
4. **Referenced** when planning feature development

When resolving items:
1. Move completed items to "Recently Resolved" section
2. Update the "Last Updated" date
3. Add any new issues discovered during development
4. Link to relevant pull requests or commits

*This document serves as the single source of truth for outstanding UI/UX work in the EdCoach AI application.*