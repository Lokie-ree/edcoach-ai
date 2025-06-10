# EdCoach AI

EdCoach AI is an AI-powered instructional coaching and feedback platform for K-12 schools. It streamlines informal classroom walkthroughs, generates instant rubric-aligned feedback using AI, and tracks teacher growth at the school level.

## Overview

The platform is designed to supplement (not replace) formal teacher evaluations by making feedback more frequent, actionable, and less burdensome. It supports continuous professional development between formal observations with:

- **Mobile-first walkthrough system** using the Louisiana Educator Rubric (LER)
- **AI-assisted feedback generation** with OpenAI GPT-4.1 Mini
- **Role-based dashboards** for teachers, coaches, and administrators
- **Real-time analytics** and growth tracking
- **Secure teacher feedback portal** with download capabilities

## Technology Stack

- **Frontend:** Next.js 15, Tailwind CSS, shadcn UI, MagicUI
- **Backend:** Convex (database and server logic)
- **Authentication:** Clerk with role-based permissions
- **AI:** OpenAI GPT-4.1 Mini for rubric-aligned feedback generation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Clerk account
- Convex account
- OpenAI API key

### Installation

1. Clone this repository
   ```bash
   git clone https://github.com/yourusername/edcoach-ai.git
   cd edcoach-ai
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   - Copy `.env.example` to `.env.local`
   - Add your Clerk, Convex, and OpenAI credentials

4. Start the development server
   ```bash
   npm run dev
   ```

5. Configure integrations:
   - Follow the [Convex Clerk integration guide](https://docs.convex.dev/auth/clerk) to link your accounts
   - Set up the JWT template and issuer domain as described in the docs

## Development Status

EdCoach AI is in active MVP development, focusing on core walkthrough functionality, AI feedback generation, and role-based access.

## Documentation

- **[Product Overview & Technical Details](docs/PRODUCT.md)** - Complete MVP specification
- **[AI Feedback System](docs/AI_FEEDBACK_REVISION.md)** - AI integration and prompt engineering
- **[Auto-Role Onboarding](docs/AUTO_ROLE_ONBOARDING.md)** - User onboarding and role assignment
- **[AI Prompt Template](docs/PROMPTITERATION_V1.md)** - Current feedback generation prompt

## Project Structure

```
edcoach-ai/
├── app/                    # Next.js app directory
├── components/             # Reusable UI components
├── convex/                 # Convex backend functions and schema
├── docs/                   # Project documentation
├── lib/                    # Utility functions and configurations
└── public/                 # Static assets
```

## Learn More

- [Convex Documentation](https://docs.convex.dev/)
- [Clerk Documentation](https://clerk.dev/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## Contact

For questions or inquiries about EdCoach AI, please reach out to the development team.
