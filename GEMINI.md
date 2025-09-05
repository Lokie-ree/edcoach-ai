# GEMINI.md

## Project Overview

This is a Next.js web application with a Convex backend. It appears to be an AI-powered instructional coaching and feedback platform for K-12 schools called "EdCoach AI".

The project uses the following technologies:

*   **Frontend:**
    *   Next.js (React framework)
    *   TypeScript
    *   Tailwind CSS for styling
    *   Radix UI for accessible UI components
    *   Shadcn UI for some UI components
*   **Backend:**
    *   Convex (serverless backend platform)
    *   TypeScript
*   **Authentication:**
    *   Clerk

The application features roles for "coach" and "teacher". The core functionality seems to revolve around "walkthroughs" (classroom observations), "reflections", and a "rubric system". The platform also includes AI-powered feedback and analytics.

## Building and Running

To run the project in a development environment, you need to run both the frontend and backend servers.

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development servers:**
    ```bash
    npm run dev
    ```
    This command will start the Next.js frontend development server and the Convex backend development server in parallel.

### Other available scripts:

*   `npm run dev:frontend`: Starts only the Next.js development server.
*   `npm run dev:backend`: Starts only the Convex development server.
*   `npm run build`: Creates a production build of the Next.js application.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Lints the codebase using Next.js's built-in ESLint configuration.

## Development Conventions

*   **Styling:** The project uses Tailwind CSS for utility-first styling.
*   **Components:** Reusable UI components are located in the `components` directory. The project uses a combination of custom components, Radix UI primitives, and some components from the Shadcn UI library.
*   **Data Model:** The backend data model is defined in `convex/schema.ts`. It uses the Convex framework's schema definition API.
*   **Authentication:** Authentication is handled by Clerk. Protected routes are defined in `middleware.ts`.
*   **State Management:** The project uses Convex for real-time data synchronization, which simplifies state management on the client.
