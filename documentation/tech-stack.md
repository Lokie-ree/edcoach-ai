# EdCoach AI: Technical Stack Document

## 1. Overview

This document defines the technical architecture and stack choices for the EdCoach AI platform, an AI-powered instructional support system for K-12 schools. It outlines the technologies, libraries, and services used to build and maintain the application.

## 2. Core Technology Stack

### 2.1 Backend

- **Primary Platform:** [Convex](https://convex.dev/)
  - Real-time database and function hosting
  - Schema-based data modeling
  - File storage (document uploads)
  - Function types: queries, mutations, actions
  - Scheduled tasks (crons)

- **AI/ML Integration:**
  - OpenAI GPT-4 for feedback generation
  - Document parsing for file uploads

### 2.2 Frontend

- **Framework:** React with TypeScript
- **UI Component Libraries:**
  - React-bits UI (primary design system)
  - ShadCn components (supplementary)
- **Styling:**
  - Tailwind CSS
  - PostCSS
- **Animation:** Framer Motion
- **State Management:**
  - Convex React client hooks
  - React Context API (as needed)

### 2.3 Authentication

- **Provider:** [Clerk](https://clerk.dev/)
  - User authentication and session management
  - Role-based access control
  - OAuth providers (Google, Microsoft)
  - Secure JWT integration with Convex

### 2.4 File Handling

- **Storage:** Convex Storage
- **Document Processing:**
  - PDF parsing: `pdf-parse` library
  - DOCX parsing: `mammoth` or `docx` library
  - TXT parsing: Native JS
- **Supported File Types:** PDF, DOCX, TXT (extensible)

### 2.5 Deployment & DevOps

- **Frontend Hosting:** Vercel
- **Backend Hosting:** Convex Cloud
- **CI/CD:** GitHub Actions
- **Monitoring:**
  - Sentry for error tracking
  - Vercel Analytics for performance

## 3. Architecture & Data Flow

### 3.1 System Architecture

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│  React        │     │  Convex       │     │  External     │
│  Frontend     │◄───►│  Backend      │◄───►│  Services     │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
       │                      │                     │
       │                      │                     │
       ▼                      ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│  Clerk Auth   │     │  Convex       │     │  OpenAI       │
│  User Mgmt    │     │  Storage      │     │  GPT-4        │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
```

### 3.2 Data Model

- **Core Tables:**
  - `users`: User profiles and role information
  - `schools`: School configuration and settings
  - `teachers`: Teacher profiles and assignments
  - `observations`: Classroom observation data
  - `rubrics`: LER domains and indicators
  - `files`: Document upload metadata

### 3.3 API Structure

- **Public Functions:**
  - Queries: Data retrieval with permissions
  - Mutations: Data modifications with validations
  - Actions: External services integration (OpenAI, etc.)

- **Internal Functions:**
  - Background processing
  - Complex workflows
  - Data migration/maintenance

## 4. Frontend Architecture

### 4.1 Component Structure

- **Core Components:**
  - Layout components (Sidebar, Header, etc.)
  - Authentication wrapper components
  - Dashboard components (by role)
  - Observation form components
  - Analytics visualization components
  - File upload and management components

### 4.2 State Management

- **Data State:** Convex useQuery hooks for real-time data
- **UI State:** React Context API for UI state (theme, sidebar, etc.)
- **Form State:** Form libraries for complex forms

### 4.3 Animation & Interaction

- **Framer Motion:** Page transitions, micro-interactions
- **Loading States:** Skeletons, spinners, progress indicators
- **Feedback:** Toast notifications, alerts

### 4.4 Frontend Design System Guidelines

#### 4.4.1 Typography System

- **Primary Font:** [Oswald](https://fonts.google.com/specimen/Oswald) (Google Fonts)
  - **Usage:** Headings, body text, UI elements
  - **Weights:** 400 (Regular), 500 (Medium), 600 (SemiBold)
  - **Implementation:** Imported via Next.js Font API in `app/layout.tsx`
  - **CSS Variable:** `--font-oswald`

- **Type Scale:**
  - **Micro:** `text-xs` (0.75rem/12px) - Small labels, captions, metadata
  - **Small:** `text-sm` (0.875rem/14px) - Secondary text, descriptions
  - **Base:** `text-base` (1rem/16px) - Body text, form inputs
  - **Medium:** `text-lg` (1.125rem/18px) - Section headings, emphasized text
  - **Large:** `text-xl` (1.25rem/20px) - Subsection headings
  - **X-Large:** `text-2xl` (1.5rem/24px) - Major section headings
  - **XX-Large:** `text-3xl` (1.875rem/30px) - Page titles
  - **XXX-Large:** `text-4xl` (2.25rem/36px) - Hero content, major headlines

- **Font Weights:**
  - **Regular:** `font-normal` - Body text, descriptions
  - **Medium:** `font-medium` - Section headings, buttons, interactive elements
  - **Bold:** `font-bold` - Page titles, emphasis, key metrics

#### 4.4.2 Color Palette

- **Primary Colors:**
  - **Primary:** `hsl(var(--primary))` - Indigo (239, 62%, 53%)
    - Used for: Buttons, links, focus states, primary actions
    - Foreground: `hsl(var(--primary-foreground))`

- **Semantic Colors:**
  - **Background:** `hsl(var(--background))` - Page background
  - **Foreground:** `hsl(var(--foreground))` - Primary text
  - **Card:** `hsl(var(--card))` - Card backgrounds
  - **Card Foreground:** `hsl(var(--card-foreground))` - Text on cards
  - **Popover:** `hsl(var(--popover))` - Modal/popover backgrounds
  - **Popover Foreground:** `hsl(var(--popover-foreground))` - Text on modals/popovers
  - **Secondary:** `hsl(var(--secondary))` - Secondary UI elements
  - **Secondary Foreground:** `hsl(var(--secondary-foreground))` - Text on secondary elements
  - **Muted:** `hsl(var(--muted))` - Muted backgrounds
  - **Muted Foreground:** `hsl(var(--muted-foreground))` - Subtle text, disabled states
  - **Accent:** `hsl(var(--accent))` - Accent UI elements
  - **Accent Foreground:** `hsl(var(--accent-foreground))` - Text on accent elements
  - **Destructive:** `hsl(var(--destructive))` - Error states, destructive actions
  - **Destructive Foreground:** `hsl(var(--destructive-foreground))` - Text on destructive elements
  - **Border:** `hsl(var(--border))` - Border color
  - **Input:** `hsl(var(--input))` - Form input elements
  - **Ring:** `hsl(var(--ring))` - Focus rings

- **Theme Support:**
  - Light and dark mode color variables are defined in `app/globals.css`
  - Colors automatically respond to system preferences or user selection

- **Gradients:**
  - **Indigo to Purple:** `from-indigo-500 to-purple-500` - CTA buttons, highlights
  - **Purple to Pink:** `from-purple-500 to-pink-500` - Accent elements, graphics
  - **Blue to Indigo:** `from-blue-500 to-indigo-500` - Visual elements, backgrounds

#### 4.4.3 Spacing System

- **Base Scale:** 4px increments (Tailwind default)
  - **0.5:** `p-0.5`, `m-0.5`, `gap-0.5` - 2px (1/2 of base unit)
  - **1:** `p-1`, `m-1`, `gap-1` - 4px
  - **2:** `p-2`, `m-2`, `gap-2` - 8px
  - **3:** `p-3`, `m-3`, `gap-3` - 12px
  - **4:** `p-4`, `m-4`, `gap-4` - 16px
  - **5:** `p-5`, `m-5`, `gap-5` - 20px
  - **6:** `p-6`, `m-6`, `gap-6` - 24px
  - **8:** `p-8`, `m-8`, `gap-8` - 32px
  - **10:** `p-10`, `m-10`, `gap-10` - 40px
  - **12:** `p-12`, `m-12`, `gap-12` - 48px
  - **16:** `p-16`, `m-16`, `gap-16` - 64px

- **Usage Patterns:**
  - **Component Internal Spacing:** `p-3`, `p-4`, `p-6` for card/container padding
  - **Between Elements:** `gap-2`, `gap-3`, `gap-4` for flex/grid layouts
  - **Layout Spacing:** `my-8`, `my-12`, `my-16` for vertical section spacing
  - **Form Controls:** `py-2 px-4` for inputs and buttons

- **Section Spacing:**
  - **Default:** Regular spacing between sections
  - **Compact:** Reduced spacing for dense UIs
  - **Spacious:** Expanded spacing for focused content

#### 4.4.4 UI Patterns

- **Buttons:**
  - **Primary:** `variant="default"` - Main CTAs, principal actions
  - **Secondary:** `variant="secondary"` - Alternative actions
  - **Outline:** `variant="outline"` - Less emphasized actions
  - **Ghost:** `variant="ghost"` - Subtle actions, often in toolbars
  - **Destructive:** `variant="destructive"` - Dangerous actions
  - **Link:** `variant="link"` - Text-like button
  - **Sizes:** `size="sm"`, `size="default"`, `size="lg"`, `size="icon"`
  - **With Icons:** Icons should be positioned at start or end (not center unless `size="icon"`)

- **Cards:**
  - Use for grouped content, often with a heading and body
  - Border and elevation should be consistent across the application
  - May contain title, content, actions, metadata
  - Variants: Default, NeonGradientCard (for emphasis)

- **Sections:**
  - Use the `Section` component for page structure
  - Content should be vertically aligned and consistently spaced
  - Support `variant`, `spacing`, and `background` props

- **Forms:**
  - Group related inputs with consistent spacing
  - Labels should be positioned above inputs
  - Error states should be clearly visible
  - Required fields should be marked with an asterisk

- **Tables & Lists:**
  - Consistent row height and padding
  - Clear header styling
  - Alternating row colors in dense tables
  - Action buttons aligned right

- **Animations:**
  - Use `AnimatedGradientText` for hero sections and important titles
  - `BorderBeam` for cards that need visual emphasis
  - Page transitions with Framer Motion
  - Subtle feedback animations for interactive elements

#### 4.4.5 Icons & Visual Elements

- **Icon System:**
  - **Library:** [Lucide](https://lucide.dev/) React components
  - **Default Size:** 24px (`h-6 w-6`) for UI elements
  - **Size Variants:**
    - **Small:** 16px (`h-4 w-4`) - Compact UI, inline with text
    - **Medium:** 24px (`h-6 w-6`) - Standard UI elements
    - **Large:** 32px (`h-8 w-8`) - Feature icons, marketing

- **Icon Color:**
  - Match text color by default (inherits from parent)
  - Use semantic colors for meaning (e.g., `text-destructive` for errors)
  - Use primary/accent colors for active states

- **Icon Usage:**
  - Import directly from `lucide-react`
  - Add semantic class names for consistent styling
  - Include appropriate aria-label for standalone icons
  - Use the iconMap pattern for dynamic icon references

- **Images & Graphics:**
  - Maintain consistent aspect ratios
  - Use Next.js Image component for optimization
  - Always include alt text
  - Consider dark mode compatibility

#### 4.4.6 Accessibility Guidelines

- **Color Contrast:**
  - Maintain 4.5:1 contrast ratio for normal text (WCAG AA)
  - Maintain 3:1 contrast ratio for large text
  - Test contrast in both light and dark modes

- **Focus States:**
  - All interactive elements must have visible focus states
  - Use `focus-visible:ring` for consistent focus styling
  - Don't remove outlines without providing alternatives

- **Semantic Structure:**
  - Use appropriate heading levels (h1-h6)
  - Maintain logical tab order
  - Landmark regions for screen readers
  - Proper button and link usage (not divs with click handlers)

- **Interactive Elements:**
  - Minimum touch target size: 44x44px
  - Proper ARIA attributes where needed
  - Support keyboard interaction for all interactive elements

## 5. Security & Privacy

### 5.1 Authentication

- **JWT & Session Management:** Handled by Clerk
- **Role-Based Access:** Enforced at database and UI levels
- **API Security:** All endpoints authenticated

### 5.2 Data Security

- **Database Security:** Convex permissions and access rules
- **File Security:** Signed URLs, scoped access
- **Sensitive Data:** Environment variables for API keys/secrets

### 5.3 Privacy Compliance

- **FERPA Compliance:** Educational data privacy
- **Data Isolation:** School-level data partitioning
- **Audit Logging:** Track access to sensitive information

## 6. Performance Considerations

### 6.1 Frontend Optimization

- **Code Splitting:** Dynamic imports for route-based code splitting
- **Asset Optimization:** Image compression, lazy loading
- **Caching Strategy:** Static assets, API responses

### 6.2 Backend Optimization

- **Indexing:** Strategic database indexes for query performance
- **Pagination:** Efficient data retrieval for large datasets
- **Background Processing:** Offload intensive tasks (file parsing, AI)

## 7. Development Workflow

### 7.1 Tools & Environment

- **Package Manager:** npm/yarn
- **Development Server:** Vite (frontend)
- **TypeScript:** Static typing
- **Code Quality:** ESLint, Prettier
- **Version Control:** Git (GitHub)

### 7.2 Testing Strategy

- **Unit Testing:** Core business logic
- **Component Testing:** UI components
- **Integration Testing:** API contracts
- **E2E Testing:** Critical user flows

### 7.3 Deployment Pipeline

1. Code commit to GitHub
2. CI runs tests and builds
3. Successful builds deploy to staging
4. Manual promotion to production

## 8. Scale & Future Considerations

### 8.1 Scalability Planning

- **Multi-School Support:** Data isolation and access control
- **Resource Scaling:** Convex auto-scaling for backend
- **Storage Growth:** File optimization and retention policies

### 8.2 Feature Roadmap Technical Implications

- **Custom Rubrics:** Flexible schema design to support extensions
- **District-Level Analytics:** Multi-school data aggregation
- **Mobile App:** React Native with shared logic

### 8.3 Infrastructure Expansion

- **CDN Integration:** For global file distribution
- **Multi-Region Deployment:** For improved latency
- **Backup Strategy:** Regular data exports and recovery plans

## 9. Documentation & Maintenance

### 9.1 Code Documentation

- **API Documentation:** Function contracts and examples
- **Component Documentation:** Storybook for UI components
- **Schema Documentation:** Database model with relationships

### 9.2 Monitoring & Alerting

- **Error Tracking:** Sentry for frontend and backend errors
- **Performance Monitoring:** Vercel Analytics
- **Health Checks:** API endpoint status

### 9.3 Maintenance Schedule

- **Dependency Updates:** Weekly security patches
- **Feature Deployments:** Bi-weekly feature releases
- **Major Version Updates:** Quarterly planning 