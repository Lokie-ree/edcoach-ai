# Clerk Billing Integration for EdCoach AI

## 1. Overview & Rationale

EdCoach AI uses Clerk Billing as the official subscription and payment provider for all coach accounts. Clerk Billing was chosen over Polar for its seamless integration with our existing Clerk authentication, unified user/session management, and superior developer experience. This approach reduces system complexity, improves user experience, and supports future scalability (multi-tenant, B2B, and B2C models).

## 2. High-Level Architecture

- **Frontend:** Next.js (React) with Clerk components for authentication and billing UI
- **Backend:** Convex for business logic, user/subscription state, and webhook handling
- **Clerk Billing:** Manages subscription products, checkout, and billing events

**Integration Points:**
- Onboarding flow (coach subscription required)
- Subscription gating (middleware, dashboard)
- Webhooks for subscription status updates
- Subscription management UI for coaches

## 3. Key Integration Points

- **Onboarding:** After auto-role detection, coaches are prompted to subscribe via Clerk Billing before accessing coach features.
- **Subscription Gating:** Middleware and dashboard components check subscription status (via Clerk session or Convex user record).
- **Webhooks:** Clerk Billing webhooks update subscription status/tier in Convex DB for each user.
- **Dashboard:** Coaches can view/manage their subscription from the dashboard.

## 4. B2C Pricing & Plan Management

Clerk Billing for B2C SaaS allows you to create and manage subscription plans for individual users. This is ideal for EdCoach AI, where each coach subscribes independently.

### 4.1. Setting Up B2C Pricing
- Navigate to the **Billing Settings** page in the Clerk Dashboard and enable billing for your application.
- Choose your payment gateway (Clerk development gateway for testing, or connect your own Stripe account for production).
- Go to the **Plans** page and select the **Plans for Users** tab. Click **Add Plan** to create new user subscription plans (e.g., "Starter", "Pro").
- Add features to each plan as needed (e.g., "Unlimited Sessions", "Priority Support").
- Optionally, set the **Publicly available** toggle to control plan visibility in Clerk UI components.

See: [Clerk B2C SaaS Billing Docs](https://clerk.com/docs/billing/b2c-saas?instant-redirect=true)

### 4.2. Creating a Pricing Page
You can display available plans and features using Clerk's `<PricingTable />` component. Example:

```tsx
import { PricingTable } from '@clerk/nextjs';

export default function PricingPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
      <PricingTable />
    </div>
  );
}
```

### 4.3. Access Control with Plans & Features
Clerk provides two main ways to gate access based on a user's plan or features:

#### Using the `has()` Method (Server-side)
```ts
import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  const { has } = await auth();
  const hasProPlan = has({ plan: 'pro' });
  if (!hasProPlan) return <h1>Only Pro subscribers can access this content.</h1>;
  return <h1>Pro Content</h1>;
}
```

#### Using the `<Protect>` Component (Client-side)
```tsx
import { Protect } from '@clerk/nextjs';

export default function ProtectPage({ children }) {
  return (
    <Protect plan="pro" fallback={<p>Only Pro subscribers can access this content.</p>}>
      {children}
    </Protect>
  );
}
```

You can also gate by feature:
```ts
const hasPremiumAccess = has({ feature: 'premium_access' });
```

### 4.4. Best Practices
- Always gate premium/coach features using Clerk's plan/feature checks.
- Use the PricingTable and UserProfile Clerk components for a seamless subscription management experience.
- Keep plan and feature names consistent between Clerk Dashboard and your codebase.

## 5. Implementation Steps & Timeline

1. **Set up Clerk Billing products and pricing in Clerk dashboard** (see B2C steps above)
2. **Integrate Clerk Billing components into onboarding and dashboard UIs**
3. **Implement subscription gating in middleware and backend logic using has()/Protect**
4. **Handle Clerk Billing webhooks to update Convex user records**
5. **Test end-to-end flows (signup, subscribe, cancel, renew, upgrade/downgrade)**
6. **Launch and monitor success metrics**

**Estimated Timeline:** 2-3 weeks for MVP integration

## 6. Migration Notes
- If migrating from another provider (e.g., Polar), ensure all active subscriptions are cancelled or migrated.
- Update all documentation and user communications to reference Clerk Billing.
- Remove any legacy billing code or references.

## 7. References
- [Clerk Billing Overview](https://clerk.com/docs/billing/overview)
- [Clerk Billing for B2C SaaS](https://clerk.com/docs/billing/b2c-saas?instant-redirect=true)
- [Clerk Billing for B2B SaaS](https://clerk.com/docs/billing/b2b-saas?instant-redirect=true)
- [Clerk Billing API Reference](https://clerk.com/docs/reference/backend/billing)
- [Clerk Webhooks](https://clerk.com/docs/reference/backend/webhooks)

## 8. Success Metrics
- 100% of new coach signups complete Clerk Billing subscription before accessing coach features
- Subscription status in Convex DB matches Clerk Billing for all users
- No failed or orphaned subscription states
- Positive user feedback on subscription UX
- <2% support tickets related to billing issues 