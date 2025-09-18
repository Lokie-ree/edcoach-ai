# EdCoachAi - Complete Design System

**Last Updated:** September 4, 2025
**Document Owner:** UX/UI Designer
**Reviewers:** Senior Frontend Engineer, Product Manager

*This document is structured according to the principles outlined in the [Core Documentation for Project Success](../technical/foundational-documentation.md).*

---

## Table of Contents

1. [Overview](#overview)
2. [Design Guidelines](#design-guidelines)
3. [Component Library & Specifications](#component-library--specifications)
4. [Implementation Guidelines](#implementation-guidelines)

---

## Overview

This document provides comprehensive specifications for the EdCoachAi design system, including visual design language, interaction patterns, and reusable UI components. The goal is to create a professional, appealing, and consistent user experience that feels trustworthy and premium while ensuring consistency, accelerating development, and maintaining high-quality user experience.

---

## Design Guidelines

### Typography

The application uses a combination of fonts to create a clean, readable, and modern aesthetic.

*   **Primary Font (Headings):** "Cal Sans" - Used for all `h1`, `h2`, `h3`, etc.
*   **Secondary Font (Body):** "Inter" - Used for all paragraphs and standard text.
*   **Usage:** Font styles are managed via Tailwind CSS typography plugins and utility classes. Do not apply manual font styling.

*Note: Font pairings have been finalized and are actively used throughout the application.*

### Color Palette & Atmospheric Effects

Our color palette is designed to be professional, calming, and accessible. Colors are defined as CSS variables in `globals.css` and accessed via Tailwind CSS utility classes.

*   **Primary:** `primary` - Used for primary calls-to-action, active states, and key highlights.
*   **Secondary:** `secondary` - Used for secondary actions and less prominent elements.
*   **Destructive:** `destructive` - Used for actions that have negative consequences (e.g., delete).
*   **Background:** `background` - The primary background color of the application.
*   **Foreground:** `foreground` - The primary text color.
*   **Card:** `card` - The background color for card components.
*   **Muted:** `muted` - For supplementary text or disabled states.

**Atmospheric Effects:** Subtle mesh gradients and color overlays may be used on marketing pages to create visual interest. These should be used sparingly and should not interfere with content readability.

### Micro-animations & Hover States

Subtle animations are used to provide feedback and add a layer of polish to the user experience.

*   **Principle:** Animations should be quick (typically under 200ms) and purposeful. Avoid exaggerated or distracting effects.
*   **Hover States:** All interactive elements (buttons, links, cards) must have a clear hover state (e.g., a change in background color, a slight lift from a shadow).
*   **Implementation:** Use CSS transitions and Tailwind CSS utilities for animations. For more complex animations, a library like Framer Motion can be considered.

### Shadows, Glows & Depth Effects

Shadows are used to create a sense of depth and hierarchy on the page.

*   **Standard:** Use Tailwind's `shadow-sm`, `shadow-md`, and `shadow-lg` utilities for consistency.
*   **Interactive Elements:** Cards and other interactive elements can use a slightly larger shadow on hover to create a "lifting" effect.
*   **Glows:** Subtle glows can be used to draw attention to primary interactive elements, but should be used sparingly.

### Form Patterns

To ensure a consistent and user-friendly experience, all forms should adhere to the following patterns:

*   **Layout:** Labels should be placed above their corresponding input fields.
*   **Validation:** Validation errors should be displayed clearly below the input field, using a destructive color for the text.
*   **Buttons:** The primary action button (e.g., "Save", "Submit") should be placed at the end of the form, aligned to the right.

### Icon Usage

*   **Library:** "Lucide React" is the standard icon library for this project.
*   **Sizing:** Icons should be used with consistent sizing. The default size should be `h-4 w-4` or `h-5 w-5`.
*   **Color:** Use semantic color classes (`text-primary`, `text-destructive`) to color icons according to their context, rather than hardcoding color values.

### Accessibility Guidelines

To ensure the application is accessible to all users, follow these guidelines:

*   **WCAG AA Compliance:** All components must meet WCAG 2.1 AA standards for accessibility.
*   **Keyboard Navigation:** All interactive elements must be keyboard accessible with clear focus indicators.
*   **Screen Reader Support:** Use semantic HTML elements and proper ARIA labels for screen reader compatibility.
*   **Color Contrast:** Ensure minimum 4.5:1 contrast ratio for normal text and 3:1 for large text.
*   **Focus Management:** Implement proper focus management for modals, dropdowns, and dynamic content.

### Responsive Design Patterns

*   **Mobile-First Approach:** Design for mobile devices first, then enhance for larger screens.
*   **Breakpoints:** Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) for responsive behavior.
*   **Touch Targets:** Ensure minimum 44px touch targets for mobile interactions.
*   **Content Priority:** Prioritize essential content and actions for smaller screens.

---

## Component Library & Specifications

### Foundation: shadcn/ui

The component library is built on top of [shadcn/ui](https://ui.shadcn.com/). We do not import components directly from an installed library. Instead, `shadcn/ui` provides us with well-architected, accessible base components (using Radix UI primitives) that we can add directly to our codebase and modify as needed.

*   **Location of Base Components:** All base components are located in `components/ui`.
*   **Customization:** These components can be customized to fit the application's specific design needs.

### Custom Component Structure

Application-specific components that are composed of base UI elements are organized within the `components/` directory.

*   `/components/common`: For general-purpose components used across many different features (e.g., `PageHeader.tsx`).
*   `/components/dashboard`: For components specific to the main user dashboard (e.g., `WalkthroughCard.tsx`).
*   `/components/layout`: For major structural components like `Header.tsx` and `SidebarNav.tsx`.

When creating a new component, it should be placed in the most relevant subdirectory.

### Unified Loading Component System

To ensure a consistent user experience during data fetching and processing, we will adhere to the following patterns for loading states.

#### Skeleton Loaders
*   **When to Use:** Use skeleton loaders when loading content that has a predictable structure, such as cards, lists, or dashboard widgets. This provides a better perceptual experience as the user can anticipate the content that will appear.
*   **Implementation:** The `Skeleton` component from `components/ui/skeleton.tsx` should be used to build these loaders.
*   **Example:** When loading the list of walkthroughs on the dashboard, a skeleton version of the `WalkthroughCard` should be displayed.

#### Spinners / Processing Indicators
*   **When to Use:** Use spinners for actions or processes where the outcome is not a structured piece of content. This includes form submissions, AI generation, or background tasks.
*   **Implementation:** A standardized spinner component will be created and added to `components/common`.
*   **Example:** When the user clicks "[Generate AI Feedback]", a spinner should be displayed within the button or in a modal to indicate that the system is processing the request.

### Badge/Tag Component System

The `Badge` component in `components/ui/badge.tsx` should be used for displaying status, categories, or other small pieces of metadata.

#### Semantic Variants
Instead of using hardcoded colors, the `Badge` component uses semantic variants defined by its `variant` prop.

*   `default`: Neutral, for general information.
*   `destructive`: Red, for warnings or negative statuses.
*   `outline`: For secondary information.
*   `secondary`: For less prominent information.

**Guideline:** Always use a semantic variant that matches the meaning of the information being displayed. If a new semantic meaning is required (e.g., "success" or "in-progress"), a new variant should be added to the component's styles in `globals.css` and documented here.

### Journey-Specific Components

To support key moments in the user journey, the following specialized components must be implemented with consistent properties and states.

#### AchievementBadge
*   **Purpose:** To visually celebrate a teacher's progress and milestones (e.g., "5 Reflections Completed!").
*   **Properties:** `icon`, `title`, `description`.
*   **States:** `default`, `unlocked`.

#### PriorityIndicator
*   **Purpose:** To draw a coach's attention to time-sensitive tasks on their dashboard (e.g., a teacher needing a walkthrough).
*   **Properties:** `level` ('high', 'medium', 'low').
*   **Variants:** Should be color-coded based on the `level` property (e.g., red for 'high').

#### GrowthChart
*   **Purpose:** To visualize a teacher's or a team's progress over time on the analytics dashboards.
*   **Properties:** `data`, `timeRange`, `indicator`.
*   **States:** `loading`, `default`, `empty`.

---

## Implementation Guidelines

### Component Development Standards

When creating new components, follow these standards:

1. **TypeScript First:** All components must be written in TypeScript with proper type definitions
2. **Accessibility:** Ensure WCAG AA compliance from the start
3. **Responsive Design:** Mobile-first approach with proper breakpoints
4. **Consistent Styling:** Use design tokens and semantic variants
5. **Documentation:** Include JSDoc comments for props and usage examples

### Design Token Usage

Always use design tokens from `lib/design-tokens.ts` instead of hardcoded values:

```typescript
// ✅ Good - Using design tokens
className="bg-primary text-primary-foreground"

// ❌ Bad - Hardcoded values
className="bg-blue-500 text-white"
```

### Component Composition Patterns

Follow these patterns for component composition:

1. **Base Components:** Use shadcn/ui components as the foundation
2. **Custom Components:** Build application-specific components on top of base components
3. **Layout Components:** Create reusable layout patterns for common page structures
4. **Feature Components:** Build domain-specific components for specific features

### State Management in Components

Handle component states consistently:

1. **Loading States:** Use skeleton loaders for structured content, spinners for actions
2. **Error States:** Provide clear error messages with recovery actions
3. **Empty States:** Show helpful guidance when no data is available
4. **Success States:** Provide clear feedback for successful actions

### Testing Considerations

When implementing components, consider:

1. **Unit Tests:** Test component behavior and prop handling
2. **Accessibility Tests:** Verify keyboard navigation and screen reader support
3. **Visual Regression Tests:** Ensure consistent appearance across browsers
4. **Responsive Tests:** Verify behavior across different screen sizes

### Performance Guidelines

Optimize components for performance:

1. **Lazy Loading:** Implement lazy loading for heavy components
2. **Memoization:** Use React.memo for expensive components
3. **Bundle Size:** Keep component dependencies minimal
4. **Rendering:** Minimize unnecessary re-renders

---

## Version History
- **v1.0** (September 2025) - Initial comprehensive design system documentation
- **Next Review:** November 2025 (after user testing validation)

---

*This document is structured according to the principles outlined in the [Core Documentation for Project Success](../technical/foundational-documentation.md).*
