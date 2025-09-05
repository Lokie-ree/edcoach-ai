# EdCoach AI - Component Library & Specifications

**Last Updated:** September 4, 2025
**Document Owner:** UX/UI Designer
**Reviewers:** Senior Frontend Engineer, Product Manager

*This document is structured according to the principles outlined in the [Core Documentation for Project Success](./foundational-documentation.md).*

## 1. Overview

This document provides specifications for the reusable UI components that form the EdCoach AI application. Our component philosophy is to build upon a robust, accessible foundation, ensuring consistency, accelerating development, and maintaining a high-quality user experience.

## 2. Foundation: shadcn/ui

The component library is built on top of [shadcn/ui](https://ui.shadcn.com/). We do not import components directly from an installed library. Instead, `shadcn/ui` provides us with well-architected, accessible base components (using Radix UI primitives) that we can add directly to our codebase and modify as needed.

*   **Location of Base Components:** All base components are located in `components/ui`.
*   **Customization:** These components can be customized to fit the application's specific design needs.

## 3. Custom Component Structure

Application-specific components that are composed of base UI elements are organized within the `components/` directory.

*   `/components/common`: For general-purpose components used across many different features (e.g., `PageHeader.tsx`).
*   `/components/dashboard`: For components specific to the main user dashboard (e.g., `WalkthroughCard.tsx`).
*   `/components/layout`: For major structural components like `Header.tsx` and `SidebarNav.tsx`.

When creating a new component, it should be placed in the most relevant subdirectory.

## 4. Unified Loading Component System

To ensure a consistent user experience during data fetching and processing, we will adhere to the following patterns for loading states.

### 4.1. Skeleton Loaders
*   **When to Use:** Use skeleton loaders when loading content that has a predictable structure, such as cards, lists, or dashboard widgets. This provides a better perceptual experience as the user can anticipate the content that will appear.
*   **Implementation:** The `Skeleton` component from `components/ui/skeleton.tsx` should be used to build these loaders.
*   **Example:** When loading the list of walkthroughs on the dashboard, a skeleton version of the `WalkthroughCard` should be displayed.

### 4.2. Spinners / Processing Indicators
*   **When to Use:** Use spinners for actions or processes where the outcome is not a structured piece of content. This includes form submissions, AI generation, or background tasks.
*   **Implementation:** A standardized spinner component will be created and added to `components/common`.
*   **Example:** When the user clicks "[Generate AI Feedback]", a spinner should be displayed within the button or in a modal to indicate that the system is processing the request.

## 5. Badge/Tag Component System

The `Badge` component in `components/ui/badge.tsx` should be used for displaying status, categories, or other small pieces of metadata.

### Semantic Variants
Instead of using hardcoded colors, the `Badge` component uses semantic variants defined by its `variant` prop.

*   `default`: Neutral, for general information.
*   `destructive`: Red, for warnings or negative statuses.
*   `outline`: For secondary information.
*   `secondary`: For less prominent information.

**Guideline:** Always use a semantic variant that matches the meaning of the information being displayed. If a new semantic meaning is required (e.g., "success" or "in-progress"), a new variant should be added to the component's styles in `globals.css` and documented here.

## 6. Journey-Specific Components

To support key moments in the user journey, the following specialized components must be implemented with consistent properties and states.

### 6.1. AchievementBadge
*   **Purpose:** To visually celebrate a teacher's progress and milestones (e.g., "5 Reflections Completed!").
*   **Properties:** `icon`, `title`, `description`.
*   **States:** `default`, `unlocked`.

### 6.2. PriorityIndicator
*   **Purpose:** To draw a coach's attention to time-sensitive tasks on their dashboard (e.g., a teacher needing a walkthrough).
*   **Properties:** `level` ('high', 'medium', 'low').
*   **Variants:** Should be color-coded based on the `level` property (e.g., red for 'high').

### 6.3. GrowthChart
*   **Purpose:** To visualize a teacher's or a team's progress over time on the analytics dashboards.
*   **Properties:** `data`, `timeRange`, `indicator`.
*   **States:** `loading`, `default`, `empty`.
