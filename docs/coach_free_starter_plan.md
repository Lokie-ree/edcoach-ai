# EdCoach AI: Coach Free + Coach Starter Implementation Plan

**Implementation Period**: July 8 - July 28, 2025 (20 days)  
**Launch Date**: July 28, 2025  
**Scope**: Two-tier freemium model with clear upgrade path

---

## Executive Summary

Transform EdCoach AI from a paid-only platform to a freemium model by introducing a Coach Free tier alongside the existing Coach Starter plan. This creates a lower barrier to entry while maintaining clear upgrade incentives.

### Goals
- Reduce signup friction with free tier
- Increase user acquisition by 300%
- Establish freemium conversion funnel
- Maintain existing Coach Starter value proposition

---

## Subscription Tiers (Final)

### Coach Free ($0/month)
- **Teachers**: 1 active teacher
- **Walkthroughs**: 3 per month
- **Analytics**: Basic feedback list view only
- **Retention**: 14 days
- **Support**: Email only (72-hour response)
- **Features**: Core walkthrough + AI feedback

### Coach Starter ($7/month) - *Enhanced*
- **Teachers**: 5 active teachers (increased from 3)
- **Walkthroughs**: 15 per month (increased from 10)
- **Analytics**: Basic dashboard with usage charts
- **Retention**: 90 days (increased from 30)
- **Support**: Email support (24-hour response)
- **Features**: All free features + enhanced analytics + bulk invitations

---

## Implementation Timeline

### Week 1: Backend Foundation (July 8-14)

#### Days 1-2: Database Schema Updates
```typescript
// Add to existing users table
users: {
  // existing fields...
  subscriptionPlan: "free" | "starter" | "pro", // Update enum
  monthlyUsage: {
    walkthroughs: number,
    teachersActive: number,
    resetDate: string
  },
  freeTrialStarted: string, // Track when free usage began
}

// Plan limits configuration
const PLAN_LIMITS = {
  free: { teachers: 1, walkthroughs: 3, retentionDays: 14 },
  starter: { teachers: 5, walkthroughs: 15, retentionDays: 90 },
  pro: { teachers: 15, walkthroughs: 50, retentionDays: 90 }
}
```

#### Days 3-4: Usage Tracking System
**New Convex Functions:**
- `trackUsage()` - Increment usage counters
- `checkUsageLimit()` - Validate before actions
- `resetMonthlyUsage()` - Monthly reset job
- `cleanupExpiredData()` - Remove old data per retention policy

#### Days 5-7: Usage Enforcement
**Update Existing Functions:**
- `inviteTeacher()` - Check teacher limit
- `createWalkthrough()` - Check walkthrough limit
- `getTeacherWalkthroughs()` - Apply retention filtering

### Week 2: Frontend Implementation (July 15-21)

#### Days 8-10: Usage Components
**New Components:**
- `UsageProgressBar.tsx` - Visual usage indicators
- `PlanUpgradePrompt.tsx` - Contextual upgrade prompts
- `UsageLimitModal.tsx` - Limit reached notifications

#### Days 11-12: Dashboard Updates
**Coach Dashboard Enhancements:**
- Usage visualization (progress bars)
- Plan comparison cards
- Upgrade prompts at 80% usage
- Free tier limitations messaging

**Teacher Dashboard:**
- Retention-aware feedback display
- Coach plan indication

#### Days 13-14: Plan Selection Flow
**New Pages:**
- `/pricing` - Plan comparison page
- `/upgrade` - Upgrade flow
- Updated onboarding to include plan selection

### Week 3: Testing & Polish (July 22-28)

#### Days 15-17: Comprehensive Testing
- **Usage Limits**: Test all limit enforcement
- **Data Retention**: Verify cleanup works correctly
- **Plan Upgrades**: Test Clerk Billing integration
- **Mobile Experience**: Ensure mobile responsiveness

#### Days 18-19: Conversion Optimization
- **Upgrade Prompts**: Test timing and messaging
- **Free Onboarding**: Optimize for engagement
- **Value Communication**: Clear starter benefits

#### Days 20-21: Launch Preparation
- **Production Deployment**: Deploy all changes
- **Marketing Materials**: Update website/landing page
- **Support Documentation**: Create FAQ and guides

---

## Technical Implementation Details

### Backend Changes (Convex)

#### Usage Tracking Functions
```typescript
// convex/usage.ts
export const trackUsage = mutation({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("walkthrough"), v.literal("teacher"))
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    const currentUsage = user?.monthlyUsage || { walkthroughs: 0, teachersActive: 0, resetDate: new Date().toISOString() };
    
    // Check if we need to reset (monthly)
    const resetDate = new Date(currentUsage.resetDate);
    const now = new Date();
    const shouldReset = now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear();
    
    if (shouldReset) {
      currentUsage.walkthroughs = 0;
      currentUsage.teachersActive = 0;
      currentUsage.resetDate = now.toISOString();
    }
    
    // Increment usage
    if (args.type === "walkthrough") {
      currentUsage.walkthroughs++;
    } else if (args.type === "teacher") {
      currentUsage.teachersActive++;
    }
    
    await ctx.db.patch(args.userId, { monthlyUsage: currentUsage });
  }
});

export const checkUsageLimit = query({
  args: {
    userId: v.id("users"),
    type: v.union(v.literal("walkthrough"), v.literal("teacher"))
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    const plan = user?.subscriptionPlan || "free";
    const limits = PLAN_LIMITS[plan];
    const usage = user?.monthlyUsage || { walkthroughs: 0, teachersActive: 0 };
    
    const currentUsage = args.type === "walkthrough" ? usage.walkthroughs : usage.teachersActive;
    const limit = args.type === "walkthrough" ? limits.walkthroughs : limits.teachers;
    
    return {
      canPerformAction: currentUsage < limit,
      currentUsage,
      limit,
      usagePercentage: Math.round((currentUsage / limit) * 100)
    };
  }
});
```

#### Data Retention Functions
```typescript
// convex/retention.ts
export const cleanupExpiredData = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    for (const user of users) {
      const plan = user.subscriptionPlan || "free";
      const retentionDays = PLAN_LIMITS[plan].retentionDays;
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
      
      // Find teachers for this coach
      const teachers = await ctx.db
        .query("teachers")
        .filter(q => q.eq(q.field("coachId"), user._id))
        .collect();
      
      // Clean up old walkthroughs
      for (const teacher of teachers) {
        const expiredWalkthroughs = await ctx.db
          .query("walkthroughs")
          .filter(q => q.and(
            q.eq(q.field("teacherId"), teacher._id),
            q.lt(q.field("_creationTime"), cutoffDate.getTime())
          ))
          .collect();
        
        for (const walkthrough of expiredWalkthroughs) {
          await ctx.db.delete(walkthrough._id);
        }
      }
    }
  }
});
```

### Frontend Changes

#### Usage Progress Component
```typescript
// components/UsageProgressBar.tsx
interface UsageProgressBarProps {
  used: number;
  limit: number;
  type: 'teachers' | 'walkthroughs';
  plan: string;
}

export function UsageProgressBar({ used, limit, type, plan }: UsageProgressBarProps) {
  const percentage = Math.round((used / limit) * 100);
  const isNearLimit = percentage >= 80;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="capitalize">{type}</span>
        <span className={isNearLimit ? "text-amber-600" : "text-gray-600"}>
          {used}/{limit}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all ${
            percentage >= 100 ? 'bg-red-500' : 
            percentage >= 80 ? 'bg-amber-500' : 
            'bg-blue-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {isNearLimit && plan === 'free' && (
        <UpgradePrompt type={type} />
      )}
    </div>
  );
}
```

#### Plan Upgrade Prompt
```typescript
// components/PlanUpgradePrompt.tsx
interface UpgradePromptProps {
  type: 'teachers' | 'walkthroughs';
  inline?: boolean;
}

export function UpgradePrompt({ type, inline = false }: UpgradePromptProps) {
  const benefits = {
    teachers: "5 active teachers",
    walkthroughs: "15 walkthroughs per month"
  };
  
  if (inline) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <p className="text-blue-800">
          Need more {type}? Upgrade to Coach Starter for {benefits[type]} and more!
        </p>
        <Button size="sm" className="mt-2">
          Upgrade Now - $7/month
        </Button>
      </div>
    );
  }
  
  // Modal version for limit reached
  return (
    <Modal>
      <div className="text-center p-6">
        <h3 className="text-lg font-semibold mb-2">
          You've reached your {type} limit
        </h3>
        <p className="text-gray-600 mb-4">
          Upgrade to Coach Starter to get {benefits[type]} and unlock more features.
        </p>
        <Button>Upgrade to Coach Starter - $7/month</Button>
      </div>
    </Modal>
  );
}
```

### Clerk Integration Updates

#### Plan Management
```typescript
// lib/plans.ts
export const PLAN_FEATURES = {
  free: {
    teachers: 1,
    walkthroughs: 3,
    analytics: 'basic',
    retention: 14,
    support: 'email',
    bulkInvitations: false
  },
  starter: {
    teachers: 5,
    walkthroughs: 15,
    analytics: 'enhanced',
    retention: 90,
    support: 'priority',
    bulkInvitations: true
  }
};

export function canAccessFeature(plan: string, feature: string): boolean {
  return PLAN_FEATURES[plan]?.[feature] || false;
}
```

---

## User Experience Flow

### New User Onboarding
1. **Sign Up** → Role selection (Coach/Teacher)
2. **Plan Selection** → Choose Free or Starter
3. **Onboarding Tutorial** → Plan-specific feature tour
4. **First Actions** → Guided walkthrough creation

### Free User Conversion Flow
1. **Usage Awareness** → Progress bars show limits
2. **Soft Prompts** → Upgrade suggestions at 80% usage
3. **Limit Reached** → Modal with upgrade option
4. **Value Demonstration** → Show what they'd gain

### Existing User Migration
- Current Coach Starter users remain unchanged
- Current Coach Pro users keep all features
- No action required from existing users

---

## Success Metrics & KPIs

### Primary Metrics
- **Free Signups**: Target 100+ in first month
- **Free → Starter Conversion**: Target 8-12%
- **Time to First Walkthrough**: Target <30 minutes
- **Free User Engagement**: Target 70% complete 2+ walkthroughs

### Secondary Metrics
- **Support Ticket Volume**: Monitor capacity
- **Feature Discovery**: Track which features drive upgrades
- **Retention**: 7-day and 30-day retention rates
- **Churn Prevention**: Monitor plan downgrades

---

## Risk Management

### Technical Risks
- **Usage Tracking Accuracy**: Comprehensive testing required
- **Data Retention Compliance**: Automated cleanup critical
- **Performance Impact**: Monitor query performance with usage checks

### Business Risks
- **Free Tier Too Generous**: Monitor conversion rates
- **Support Overwhelm**: Prepare self-service resources
- **Revenue Impact**: Track existing user behavior

### Mitigation Strategies
- Staged rollout starting with new users
- Comprehensive testing before full launch
- Clear upgrade messaging and smooth billing flow
- Responsive support team scaling

---

## Launch Strategy

### Pre-Launch (Days 18-19)
- Update landing page with new pricing
- Create demo videos showing free vs starter features
- Prepare FAQ and support documentation
- Set up analytics tracking

### Launch Day (Day 20)
- Deploy to production
- Announce via social media and email
- Monitor signup flow and conversion
- Provide immediate user support

### Post-Launch (Days 21-28)
- Daily metrics monitoring
- User feedback collection
- Quick iteration on conversion optimization
- Plan next feature development

---

## Resource Requirements

### Development Time
- **Backend**: 10-12 hours
- **Frontend**: 12-15 hours
- **Testing**: 8-10 hours
- **Total**: 30-37 hours over 20 days

### Success Criteria
- All existing functionality preserved
- Free tier limits properly enforced
- Smooth upgrade flow to Coach Starter
- No impact on existing paying users
- Clean, intuitive user experience

---

## Next Steps

1. **Begin Backend Development** (July 8)
2. **Set Up Analytics Tracking** (July 9)
3. **Create Usage Enforcement System** (July 10-11)
4. **Build Frontend Components** (July 15-17)
5. **Comprehensive Testing** (July 22-24)
6. **Launch Preparation** (July 25-27)
7. **Public Launch** (July 28)

This focused implementation creates a solid foundation for freemium growth while maintaining the existing value proposition and preparing for future expansion to additional tiers.