# EdCoach AI Subscription Plans & Pricing (MVP)

**Guiding Principles:**
- Coach-centric, simple, and fair
- All plans: up to 5 teachers per org
- Usage-based differentiation (AI feedback generations)
- Transparent, accessible pricing

---

### Subscription Tiers

| Feature / Entitlement         | Coach Starter (Free) | Coach Basic                | Coach Pro                  |
|------------------------------|----------------------|----------------------------|----------------------------|
| **Monthly Price**            | Free                 | $9 / month                 | $19 / month                |
| **Annual Price**             | N/A                  | $90 / year                 | $190 / year                |
| **Teachers per Org**         | Up to 5              | Up to 5                    | Up to 5                    |
| **AI Feedback Generations/mo** | 20                 | 100                        | 300                        |
| **Standard Rubrics**         | ✓                    | ✓                          | ✓                          |
| **AI Feedback Generation**   | ✓                    | ✓                          | ✓                          |
| **Observation Logs**         | ✓                    | ✓                          | ✓                          |
| **Basic Trend View**         | ✓                    | ✓                          | ✓                          |
| **Enhanced Analytics**       |                      | ✓                          | ✓                          |
| **Advanced Analytics**       |                      |                            | ✓ (group trends, comparisons) |
| **Priority Support**         |                      | ✓                          | ✓                          |
| **Early Access to Features** |                      |                            | ✓ (e.g., data export)       |
| **Trial Period**             | 14 days              |                            |                            |

---

### Rationale & Notes
- All plans are capped at 5 teachers per org (per Clerk B2B SaaS free org member limit).
- Usage limits (AI feedback generations) are the main differentiator.
- Pricing is designed to be accessible and fair, reflecting the low per-generation AI cost.
- Pro plan includes advanced analytics and early access to new features.
- No hidden fees, no surprise overages.

---

### Next Steps for Product/Engineering:

1.  **Validate AI Costs:** Get a more precise estimate of OpenAI GPT-4.1 Mini costs per feedback generation to ensure pricing is sustainable.
2.  **Define "Advanced Analytics" Scope:** Clarify what, if any, advanced analytics can be included in the Pro tier for MVP.
3.  **Implement Trial Management:** Ensure Clerk Billing is set up for time-limited trials that require payment details upfront for seamless conversion.
4.  **Usage Tracking:** Implement robust tracking of AI generations and managed teachers in Convex, to be checked against plan limits.
5.  **Upgrade/Downgrade Paths:** Plan how users will be prompted to upgrade if they hit limits and how downgrades are handled (e.g., what happens if a Pro user with 20 teachers downgrades to Basic with a 10-teacher limit?). For MVP, preventing downgrade if over limits is simplest.

This structure provides a solid starting point for EdCoach AI's monetization strategy, aligning with the technical capabilities and product vision outlined.