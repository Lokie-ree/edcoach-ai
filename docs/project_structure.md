# Project Structure Documentation for EdCoachAI

## Overview

This document describes the architectural structure and organization of the EdCoachAI codebase as of v2.1. It is intended to help current and future contributors understand the rationale behind our file layout, colocation strategy, and best practices for maintaining a scalable, maintainable, and collaborative codebase.

---

## High-Level Directory Layout

```
edcoachai/
  app/                # Next.js App Router feature folders (colocated pages & components)
  components/         # Shared/global UI components and forms
  hooks/              # Global React hooks
  convex/             # Convex backend (schema, queries, mutations, actions)
  data/               # Static data and content
  docs/               # Project documentation
  lib/                # Utility functions and helpers
  public/             # Static assets (images, etc.)
  ...                 # Config, build, and meta files
```

---

## Colocation Strategy

### Feature Folders (`/app`)
- **Purpose:** Each major feature or route in the application has its own folder under `app/`, following the Next.js App Router convention.
- **Colocated Components:** Feature-specific UI components are placed in a `components/` subfolder within their respective feature directory (e.g., `app/(auth)/dashboard/components/`).
- **Benefits:**
  - Improves discoverability and maintainability of feature code
  - Reduces cross-feature coupling
  - Makes it easier to onboard new contributors

#### Examples:
- `app/(marketing)/components/` – All marketing/landing page sections (Hero, Features, Faq, etc.)
- `app/onboarding/components/` – Onboarding-specific UI (tutorials, etc.)
- `app/(auth)/dashboard/components/` – Dashboard widgets and panels

### Shared/Global Components (`/components`)
- **Purpose:** Components used across multiple features, such as UI primitives, forms, and layout elements, are kept global for reusability.
- **Structure:**
  - `components/forms/` – All major forms (e.g., WalkthroughForm, TeacherInvitationForm, ReflectionForm)
  - `components/ui/` – UI primitives (Button, Input, Badge, etc.)
  - `components/common/` – Layout and navigation (Header, AppLayout, etc.)
  - `components/providers/` – Context and provider components
  - `components/walkthrough/` – Shared walkthrough-related UI
  - `components/magicui/`, `components/mage-ui/` – Specialized UI effects
- **Rationale:** Forms are intentionally kept global due to their cross-feature usage and to avoid duplication.

### Hooks (`/hooks`)
- **Purpose:** All custom React hooks are placed in the root `/hooks` directory for easy discovery and import.
- **Examples:** `usePlanDetection.ts`, `usageEnforcer.ts`

### Backend (`/convex`)
- **Purpose:** Contains all Convex backend logic, including schema, queries, mutations, actions, and validation.
- **Structure:**
  - `convex/schema.ts` – Database schema definition
  - `convex/*.ts` – Feature-specific backend logic (e.g., `aiFeedback.ts`, `analytics.ts`, `walkthroughs.ts`)
  - `convex/validation/` – Zod schemas for data validation
  - `convex/_generated/` – Auto-generated Convex files (do not edit manually)

### Utilities (`/lib`)
- **Purpose:** General-purpose utility functions and helpers used throughout the codebase.

### Static Data & Assets
- `data/` – JSON files for static content (handbook, landing page, etc.)
- `public/` – Images and other static assets

### Documentation
- `docs/` – Implementation plans, product requirements, and technical documentation

---

## Conventions & Best Practices

- **Colocate feature-specific components** within their respective feature folders under `app/`.
- **Keep shared/global components** (UI primitives, forms, layout) in `/components`.
- **Place all custom hooks** in `/hooks`.
- **Organize backend logic** by feature in `/convex`, with a single source of truth for schema in `convex/schema.ts`.
- **Use clear, descriptive names** for all files and folders.
- **Avoid deep nesting**; prefer flat structures within each feature or component folder.
- **Update import paths** when moving files to maintain consistency and avoid broken references.
- **Document new patterns** or exceptions in this file as the project evolves.

---

## Intentional Exceptions

- **Forms:** All major forms are kept in `components/forms/` for cross-feature reuse.
- **Walkthrough/Teachers:** As of this version, walkthrough and teacher features do not have colocated components folders; their UI is inlined or global. If these features grow, consider extracting repeated UI into colocated `components/` folders.

---

## Future Contributors

- Follow the colocation and naming conventions outlined here.
- When adding a new feature, create a dedicated folder under `app/` and colocate its components.
- When creating a new shared component or hook, place it in `/components` or `/hooks` respectively.
- Update this document if you introduce a new pattern or make a significant structural change.

---

**This document is a living reference. Please keep it up to date as the project evolves!** 