# EdCoach AI - Error Handling & Performance Guidelines

**Last Updated:** September 5, 2025
**Document Owner:** Senior Backend Engineer
**Reviewers:** System Architect, Senior Frontend Engineer

*This document is structured according to the principles outlined in the [Core Documentation for Project Success](./foundational-documentation.md).*

## 1. Overview

This document provides guidelines for handling errors and maintaining application performance. The goal is to ensure a robust, resilient, and fast user experience, where failures are handled gracefully and the application feels responsive.

## 2. Error Handling Strategy

### 2.1. Backend Error Handling (Convex)

*   **Principle:** Failures in Convex actions, especially those involving third-party APIs like OpenAI, must be caught and handled gracefully. An API failure should never result in a crashed process or lost data.
*   **Pattern for Actions with API Calls:**
    1.  Wrap all third-party API calls in a `try...catch` block.
    2.  In the `catch` block, log the specific error for debugging purposes.
    3.  The action should `throw` a new, structured error (e.g., `new Error("AI_GENERATION_FAILED")`) that the client can interpret. Do not expose raw API error messages to the client.
    4.  The calling mutation on the client-side should also wrap its call in a `try...catch` block to handle the thrown error.

### 2.2. Frontend Error Display

*   **Principle:** User-facing errors should be clear, concise, and non-technical. Users should be informed that something went wrong without being overwhelmed by technical jargon.
*   **Pattern for Displaying Errors:**
    1.  **Toasts for Actionable Errors:** When a user action fails (e.g., saving a form, generating feedback), a "Toast" notification should be used to display the error.
    2.  **Component:** Use the `useToast` hook and `Toast` component from the component library.
    3.  **Content:** The toast should have a `variant` of `destructive` and contain a simple, helpful message (e.g., "Failed to generate feedback. Please try again.").

### 2.3. Error Boundaries
*   **Implementation:** React Error Boundaries should be implemented at key layout points (e.g., in `layout.tsx` files) to catch and handle rendering errors within a specific part of the UI, preventing a full-page crash.

## 3. Performance Guidelines

### 3.1. Dashboard Loading
*   **Strategy:** To ensure dashboards load quickly, implement skeleton loaders (`components/ui/skeleton.tsx`) for all primary data-driven components. This provides an immediate visual response while data is being fetched from Convex in the background.

### 3.2. Bundle Size Reduction
*   **Strategy:** Regularly analyze the application's bundle size using tools like the Next.js Build Analyzer. Proactively identify and replace heavy libraries with lighter alternatives where possible. Implement code-splitting for large components that are not required on the initial page load.
