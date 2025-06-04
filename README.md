# EdCoach AI

EdCoach AI is an AI-powered instructional coaching and feedback platform for K-12 schools. It is designed to supplement (not replace) formal teacher evaluations by streamlining informal classroom walkthroughs, generating instant, rubric-aligned feedback, and tracking teacher growth at the school level. The platform focuses on making feedback more frequent, actionable, and less burdensome, supporting continuous professional development between formal observations.

## Core MVP Features

- **Role-Based Dashboards:** Tailored for teachers, instructional coaches/assistant principals, and principals, showing feedback frequency, trends, and growth analytics
- **LER-Based Informal Walkthrough System:** Streamlined, mobile-first form for selecting one focus indicator for reinforcement and one for refinement, with quick evidence capture using the Louisiana Educator Rubric (LER)
- **Draft/Finalized Workflow:** Walkthroughs can be saved as draft or finalized before sharing
- **AI-Assisted Feedback:** Instantly generate and edit professional, rubric-aligned feedback using OpenAI GPT-4.1 Mini, optimized for educational context
- **Teacher Feedback Access:** Secure portal for teachers to view and download all informal feedback interactions
- **Analytics Dashboard:** Visualize walkthrough trends and teacher performance, scoped to school and role
- **Authentication & Role Management:** Secure login and registration with Clerk; roles and permissions managed in Convex DB
- **Mobile-First, Responsive Design:** Optimized for classroom use on any device, with touch-friendly UI and minimal typing

## Technology Stack

- **Frontend:** Next.js 15, Tailwind CSS, shadcn UI, MagicUI
- **Backend:** Convex for database and server logic
- **Authentication:** Clerk (Convex DB for roles/permissions)
- **AI:** OpenAI GPT-4.1 Mini for feedback generation (chosen for cost, speed, and rubric alignment)

## Development Status

EdCoach AI is in active MVP development, focusing on:
- Informal walkthroughs with LER-based templates
- AI-generated, actionable feedback
- Draft/finalized workflow
- Role-based dashboards and analytics
- Secure teacher feedback access

## Planned Features (Post-MVP)

- Custom rubric support
- District admin roles and analytics
- Advanced analytics and reporting
- Teacher response/feedback loop on walkthroughs
- Advanced offline form completion and sync
- Exports and advanced reporting
- Gamification and subscription management

## Getting Started

### Prerequisites

- Node.js
- npm or pnpm
- Clerk account
- Convex account

### Installation

1. Clone this repository
   ```
   git clone https://github.com/yourusername/edcoach-ai.git
   cd edcoach-ai
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env.local` and fill in required values for Clerk and Convex integration

4. Start the development server
   ```
   npm run dev
   ```

5. Configure Clerk/Convex integration:
   - Open your app. There should be a "Claim your application" button from Clerk in the bottom right of your app.
   - Follow the steps to claim your application and link it to this app.
   - Follow step 3 in the [Convex Clerk onboarding guide](https://docs.convex.dev/auth/clerk#get-started) to create a Convex JWT template.
   - Paste the Issuer URL as `CLERK_JWT_ISSUER_DOMAIN` to your dev deployment environment variable settings on the Convex dashboard (see [docs](https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances))

## Learn More

- [Product Requirements Document](docs/prd.md)
- [Development Roadmap](documentation/development-roadmap.md)
- [Testing Plan](documentation/testing-plan.md)
- [Convex Documentation](https://docs.convex.dev/)
- [Clerk Documentation](https://clerk.dev/docs)

## Contact

For questions or inquiries about EdCoach AI, please reach out to me.
