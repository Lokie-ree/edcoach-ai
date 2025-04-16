# EdCoach AI

EdCoach AI is an instructional support platform designed for school leaders and instructional coaches to streamline classroom observations, provide evidence-based feedback to teachers, and track educational improvements. The platform leverages AI to assist in generating high-quality, rubric-aligned feedback while maintaining the human expertise in the observation process.

## Vision

EdCoach AI aims to transform the instructional coaching process by:
- Reducing the administrative burden of classroom observations
- Standardizing feedback based on established teaching frameworks (LEADS, LER, etc.)
- Providing data-driven insights to improve teaching and learning outcomes
- Creating a continuous improvement loop for educators

## Core Features

- **User Management**: Role-based access for administrators, school leaders, and instructional coaches
- **Observation System**: Create, conduct, and save classroom observations using customizable rubrics
- **Evidence Collection**: Record evidence for specific rubric indicators with tagging capabilities
- **AI-Assisted Feedback**: Generate and edit professional feedback based on observation evidence
- **Analytics Dashboard**: View observation trends, teacher performance data, and improvement metrics

## Technology Stack

- **Frontend**: Next.js 15, Tailwind CSS, ShadCN UI, MagicUI
- **Backend**: [Convex](https://convex.dev/) for database and server logic
- **Authentication**: [Clerk](https://clerk.com/) for user management and authentication
- **Payment Processing**: polar.sh for subscription management
- **AI**: LLM with support for educational context and narrow context windows

## Development Status

EdCoach AI is currently in active development as a solo developer project with a focus on delivering a high-quality MVP. The development roadmap is divided into three phases:

1. **Core Infrastructure**: User authentication, database schema, role-based access
2. **Observation & Feedback System**: Rubric management, observation forms, AI feedback generation
3. **Analytics & Finalization**: Reporting dashboards, multi-device optimization, final polishing

## Planned Features

After MVP launch, planned features include:
- Advanced analytics and reporting dashboards
- Teacher portal for feedback access and self-reflection
- Integration with school information systems
- Mobile app development
- Advanced AI features (resource suggestions, bias detection)
- Public API for integrations

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

- [Development Roadmap](development-roadmap.md): Detailed plan for EdCoach AI development
- [Convex Documentation](https://docs.convex.dev/): Learn about the backend platform
- [Clerk Documentation](https://clerk.dev/docs): Authentication system details

## Contact

For questions or inquiries about EdCoach AI, please reach out to me.
