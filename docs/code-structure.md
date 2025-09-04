# EdCoach AI - Code Structure & Organization

**Last Updated:** September 4, 2025
**Document Owner:** System Architect
**Reviewers:** Senior Backend Engineer, Senior Frontend Engineer

*This document is structured according to the principles outlined in the [Core Documentation for Project Success](./foundational-documentation.md).*

## 1. Overview

This document establishes the guidelines for code structure, file organization, and naming conventions within the EdCoach AI codebase. Adhering to these standards is crucial for maintainability, collaboration, and ensuring that AI development assistants can work effectively within the project.

## 2. Directory Structure

The project follows a hybrid structure based on Next.js and Convex conventions.

*   `/app`: Contains all frontend routes, pages, and layouts, following the Next.js App Router paradigm.
    *   `/app/(dashboard)`: Group for all authenticated user dashboard routes.
    *   `/app/(marketing)`: Group for all public-facing marketing pages.
    *   `/app/api`: For any Next.js API routes (server-side handlers).
*   `/components`: Home for all shared, reusable React components.
    *   `/components/ui`: Contains base UI components from shadcn/ui.
    *   `/components/common`: For general-purpose components used across the app (e.g., `Logo`).
    *   `/components/layout`: For major layout components like headers and sidebars.
*   `/convex`: Contains all backend logic, including database schema, functions, and authentication configuration.
*   `/hooks`: For shared React hooks (e.g., `use-mobile`).
*   `/lib`: For utility functions and shared libraries (e.g., `utils.ts`).
*   `/public`: For static assets like images and fonts.
*   `/docs`: All project documentation.

## 3. File Naming Conventions

To maintain consistency, please follow these naming conventions:

*   **Components & Hooks:** `PascalCase.tsx` (e.g., `WalkthroughCard.tsx`, `usePlanDetection.ts`).
*   **Pages & Layouts:** `lowercase.tsx` (e.g., `page.tsx`, `layout.tsx`).
*   **Backend Functions (Convex):** `camelCase.ts` (e.g., `aiFeedback.ts`, `walkthroughs.ts`).
*   **Utility & Library Files:** `camelCase.ts` or `PascalCase.ts` (e.g., `utils.ts`, `ErrorHandler.ts`).
*   **Styling Files:** `kebab-case.css` (e.g., `global.css`).

## 4. Project Context for AI (`gemini.md`)

As recommended in our foundational documentation, a `gemini.md` (or a similar AI context file) should be maintained at the root of the project.

*   **Purpose:** This file provides high-level context about the project's goals, tech stack, and architectural patterns to AI assistants. This improves the quality and relevance of AI-generated code and suggestions.
*   **Content:** It should include a summary of the project vision, a list of key technologies, and any non-obvious patterns or rules for the AI to follow.

## 5. Future Considerations

*   **Component Consolidation:** As the application grows, we should regularly audit the `/components` directory to identify opportunities to merge duplicate or similar components into a single, more robust component.
*   **AI Agent Rules (`.cursorrules`):** For more granular control over AI behavior in specific directories, `.cursorrules` files can be implemented. This could be useful in the `/convex` directory to enforce specific patterns for database queries or mutations.
