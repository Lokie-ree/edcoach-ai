Okay, this is a great foundation! Based on the `PRODUCT.MD` and `CLERK_BILLING_INTEGRATION.MD`, here's a proposal for subscription plans, entitlements, and pricing for EdCoach AI, keeping the MVP scope in mind.

## EdCoach AI Subscription Plans & Pricing (MVP)

**Guiding Principles:**

1.  **Coach-Centric:** Coaches are the paying users.
2.  **Value-Driven:** Tiers should reflect increasing value (more teachers, more usage, more features).
3.  **Simplicity for MVP:** Start with a straightforward structure.
4.  **Scalability:** Design with future growth (org/district plans, advanced features) in mind.
5.  **Cost Coverage:** AI usage (GPT-4.1 Mini) is a direct cost, so plans need to account for this.

---

### Proposed Subscription Tiers

As hinted in `PRODUCT.MD`, we'll go with "Coach Basic" and "Coach Pro." A trial period is also highly recommended to meet the "100% of new coach signups complete Clerk Billing subscription before accessing coach features" metric while still allowing product evaluation.

| Feature / Entitlement         | Coach Trial (e.g., 14-day) | Coach Basic                     | Coach Pro                       |
| :---------------------------- | :------------------------- | :------------------------------ | :------------------------------ |
| **Pricing (Monthly)**         | Free (Time-limited)        | **$29 / month**                 | **$59 / month**                 |
| **Pricing (Annually)**        | N/A                        | **$290 / year** (Save ~16%)     | **$590 / year** (Save ~16%)     |
| **Primary Goal**              | Evaluate Core Functionality| Individual Coach / Small Team   | Active Coach / Growing Team     |
| ---                           | ---                        | ---                             | ---                             |
| **Managed Teachers**          | Up to 3                    | Up to **10**                    | Up to **30**                    |
| **Walkthroughs / AI Feedback Generations (per month)** | Up to 10                   | Up to **50**                    | Up to **150**                   |
| **AI-Powered Feedback**       | ✓ (GPT-4.1 Mini)           | ✓ (GPT-4.1 Mini)                | ✓ (GPT-4.1 Mini)                |
| **Rubric-Aligned Feedback**   | ✓                          | ✓                               | ✓                               |
| **Mobile-First Capture**      | ✓                          | ✓                               | ✓                               |
| **Invite Teachers**           | ✓ (One at a time)          | ✓ (One at a time)               | ✓ (One at a time)               |
| **Coach Dashboard**           | ✓                          | ✓                               | ✓                               |
| **Teacher Dashboards**        | ✓                          | ✓                               | ✓                               |
| **Basic Analytics**           | ✓                          | ✓                               | ✓                               |
| **Advanced Analytics**        |                            |                                 | ✓ (e.g., group trends, comparative data - if MVP allows) |
| **Data Export (e.g., CSV)**   |                            |                                 | Planned (Post-MVP, but Pro users get early access) |
| **Standard Support**          | ✓                          | ✓                               | ✓                               |
| **Priority Support**          |                            |                                 | ✓                               |
| **Clerk Billing Management**  | (Transitions to paid plan) | ✓                               | ✓                               |

---

### Rationale & Notes:

1.  **Trial Period:**
    *   Crucial for user acquisition and to meet the "subscribe before accessing coach features" goal. Clerk Billing can manage trial periods that convert to paid subscriptions.
    *   Limits are set to allow meaningful evaluation without significant cost exposure.

2.  **"Coach Basic":**
    *   **Target:** Individual instructional coaches or those with a small, focused group of teachers.
    *   **Limits:** Designed for regular but not extremely high-volume use. 50 walkthroughs/month is roughly 2-3 per day.
    *   **Pricing:** Aims to be accessible for individual professionals or small department budgets.

3.  **"Coach Pro":**
    *   **Target:** More active coaches, those managing larger groups, or those who want deeper insights.
    *   **Limits:** Accommodates higher usage, suitable for coaches conducting multiple walkthroughs daily across a larger team.
    *   **Value Adds:** More teachers, significantly more walkthroughs, potential for advanced analytics (if scope permits in MVP, otherwise a clear future benefit), priority support. Early access to features like data export makes it attractive.
    *   **Pricing:** Reflects the increased capacity and value.

4.  **Walkthroughs / AI Feedback Generations:**
    *   This is a key cost driver (OpenAI API). It's essential to have limits.
    *   The term "AI Feedback Generations" is more precise, as a coach might start a walkthrough but not complete the AI generation, or might regenerate feedback. For MVP, assume 1 generation per completed walkthrough.
    *   Consider how to handle overages (e.g., option to buy top-up packs, or a hard limit with an upgrade prompt). For MVP, a hard limit with an upgrade prompt is simpler.

5.  **Teacher Limits:**
    *   A natural way to segment plans. Coaches with more teachers will likely conduct more walkthroughs.

6.  **Analytics:**
    *   `PRODUCT.MD` mentions "Role-based dashboards and analytics."
    *   **Basic Analytics (All Tiers):** Individual teacher progress, walkthrough counts, feedback summaries.
    *   **Advanced Analytics (Pro Tier):** Could include group trends, comparison across indicators, or specific rubric element performance over time. If not in MVP, this is a strong differentiator for Pro in the near future.

7.  **Deferred Features as Upsells:**
    *   Bulk invites, org/district support, advanced offline, formal observation support are explicitly post-MVP. These will form the basis for higher-tier plans (e.g., "Team" or "District" plans) or add-ons later. The "Coach Pro" plan can hint at these by getting early access to some (like basic exports).

8.  **Pricing Justification:**
    *   The proposed prices are placeholders and should be validated against:
        *   Estimated OpenAI API costs per feedback generation.
        *   Perceived value by coaches (time saved, impact on teaching).
        *   Competitive landscape (if any direct competitors exist).
    *   The annual discount incentivizes longer-term commitment and improves cash flow.

9.  **Clerk Billing Implementation:**
    *   These plans and entitlements need to be configured as "products" and "prices" within the Clerk Billing dashboard.
    *   Webhooks will be crucial for syncing subscription status (Basic, Pro, Trial) and current usage (e.g., walkthrough count reset monthly) to the Convex backend.
    *   The frontend will gate features/limits based on the user's active subscription tier fetched from Clerk session or Convex.

### Next Steps for Product/Engineering:

1.  **Validate AI Costs:** Get a more precise estimate of OpenAI GPT-4.1 Mini costs per feedback generation to ensure pricing is sustainable.
2.  **Define "Advanced Analytics" Scope:** Clarify what, if any, advanced analytics can be included in the Pro tier for MVP.
3.  **Implement Trial Management:** Ensure Clerk Billing is set up for time-limited trials that require payment details upfront for seamless conversion.
4.  **Usage Tracking:** Implement robust tracking of AI generations and managed teachers in Convex, to be checked against plan limits.
5.  **Upgrade/Downgrade Paths:** Plan how users will be prompted to upgrade if they hit limits and how downgrades are handled (e.g., what happens if a Pro user with 20 teachers downgrades to Basic with a 10-teacher limit?). For MVP, preventing downgrade if over limits is simplest.

This structure provides a solid starting point for EdCoach AI's monetization strategy, aligning with the technical capabilities and product vision outlined.