# Project Overview

This is a Next.js application with a Convex backend. It is an AI-powered instructional coaching and feedback platform for K-12 schools. The app uses Clerk for authentication, Radix UI for components, and Tailwind CSS for styling.

## Key Technologies

*   **Frontend:** Next.js, React, TypeScript
*   **Backend:** Convex
*   **Authentication:** Clerk
*   **Styling:** Tailwind CSS, Radix UI
*   **Database:** Convex
*   **Deployment:** Vercel (assumed, based on Next.js)

## Architecture

The application follows a typical client-server architecture. The Next.js frontend communicates with the Convex backend for data persistence and business logic. Clerk is used for user authentication and management.

# Building and Running

## Development

To run the application in development mode, use the following command:

```bash
npm run dev
```

This will start both the Next.js frontend and the Convex backend in parallel.

## Building for Production

To build the application for production, use the following command:

```bash
npm run build
```

This will create an optimized production build of the Next.js application.

## Starting the Production Server

To start the production server, use the following command:

```bash
npm run start
```

# Development Conventions

## Linting

The project uses ESLint for linting. To run the linter, use the following command:

```bash
npm run lint
```

## Data Modeling

The data model is defined in `convex/schema.ts`. It uses the `defineSchema` and `defineTable` functions from the `convex/server` library to define the tables and their schemas.

## Authentication

Authentication is handled by Clerk. The `middleware.ts` file uses `clerkMiddleware` to protect routes and manage user sessions.

## Routing

The application uses Next.js for routing. The `middleware.ts` file defines protected and public routes.
