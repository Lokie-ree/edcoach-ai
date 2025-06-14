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

## 4. Implementation Steps & Timeline

1. **Set up Clerk Billing products and pricing in Clerk dashboard**
2. **Integrate Clerk Billing components into onboarding and dashboard UIs**
3. **Implement subscription gating in middleware and backend logic**
4. **Handle Clerk Billing webhooks to update Convex user records**
5. **Test end-to-end flows (signup, subscribe, cancel, renew, upgrade/downgrade)**
6. **Launch and monitor success metrics**

**Estimated Timeline:** 2-3 weeks for MVP integration

## 5. Migration Notes
- If migrating from another provider (e.g., Polar), ensure all active subscriptions are cancelled or migrated.
- Update all documentation and user communications to reference Clerk Billing.
- Remove any legacy billing code or references.

## 6. References
- [Clerk Billing Overview](https://clerk.com/docs/billing/overview)
- [Clerk Billing API Reference](https://clerk.com/docs/reference/backend/billing)
- [Clerk Webhooks](https://clerk.com/docs/reference/backend/webhooks)

## 7. Success Metrics
- 100% of new coach signups complete Clerk Billing subscription before accessing coach features
- Subscription status in Convex DB matches Clerk Billing for all users
- No failed or orphaned subscription states
- Positive user feedback on subscription UX
- <2% support tickets related to billing issues 