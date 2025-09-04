# EdCoach AI - Design Guidelines

**Last Updated:** September 4, 2025
**Document Owner:** UX/UI Designer
**Reviewers:** Senior Frontend Engineer, Product Manager

*This document is structured according to the principles outlined in the [Core Documentation for Project Success](./foundational-documentation.md).*

## 1. Overview

This document outlines the visual design language and interaction patterns for EdCoach AI. The goal is to create a professional, appealing, and consistent user experience that feels trustworthy and premium.

## 2. Typography

The application uses a combination of fonts to create a clean, readable, and modern aesthetic.

*   **Primary Font (Headings):** [Font Family Name] - Used for all `h1`, `h2`, `h3`, etc.
*   **Secondary Font (Body):** [Font Family Name] - Used for all paragraphs and standard text.
*   **Usage:** Font styles are managed via Tailwind CSS typography plugins and utility classes. Do not apply manual font styling.

*(Note: Specific font pairings to be finalized and added here.)*

## 3. Color Palette & Atmospheric Effects

Our color palette is designed to be professional, calming, and accessible. Colors are defined as CSS variables in `globals.css` and accessed via Tailwind CSS utility classes.

*   **Primary:** `primary` - Used for primary calls-to-action, active states, and key highlights.
*   **Secondary:** `secondary` - Used for secondary actions and less prominent elements.
*   **Destructive:** `destructive` - Used for actions that have negative consequences (e.g., delete).
*   **Background:** `background` - The primary background color of the application.
*   **Foreground:** `foreground` - The primary text color.
*   **Card:** `card` - The background color for card components.
*   **Muted:** `muted` - For supplementary text or disabled states.

**Atmospheric Effects:** Subtle mesh gradients and color overlays may be used on marketing pages to create visual interest. These should be used sparingly and should not interfere with content readability.

## 4. Micro-animations & Hover States

Subtle animations are used to provide feedback and add a layer of polish to the user experience.

*   **Principle:** Animations should be quick (typically under 200ms) and purposeful. Avoid exaggerated or distracting effects.
*   **Hover States:** All interactive elements (buttons, links, cards) must have a clear hover state (e.g., a change in background color, a slight lift from a shadow).
*   **Implementation:** Use CSS transitions and Tailwind CSS utilities for animations. For more complex animations, a library like Framer Motion can be considered.

## 5. Shadows, Glows & Depth Effects

Shadows are used to create a sense of depth and hierarchy on the page.

*   **Standard:** Use Tailwind's `shadow-sm`, `shadow-md`, and `shadow-lg` utilities for consistency.
*   **Interactive Elements:** Cards and other interactive elements can use a slightly larger shadow on hover to create a "lifting" effect.
*   **Glows:** Subtle glows can be used to draw attention to primary interactive elements, but should be used sparingly.

## 6. Form Patterns

To ensure a consistent and user-friendly experience, all forms should adhere to the following patterns:

*   **Layout:** Labels should be placed above their corresponding input fields.
*   **Validation:** Validation errors should be displayed clearly below the input field, using a destructive color for the text.
*   **Buttons:** The primary action button (e.g., "Save", "Submit") should be placed at the end of the form, aligned to the right.

## 7. Icon Usage

*   **Library:** [Name of Icon Library, e.g., Lucide React] is the standard icon library for this project.
*   **Sizing:** Icons should be used with consistent sizing. The default size should be `h-4 w-4` or `h-5 w-5`.
*   **Color:** Use semantic color classes (`text-primary`, `text-destructive`) to color icons according to their context, rather than hardcoding color values.
