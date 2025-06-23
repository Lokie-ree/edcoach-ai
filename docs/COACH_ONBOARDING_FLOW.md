# Coach Onboarding Flow Implementation

## Overview

This document describes the complete coach signup and onboarding flow implemented for EdCoach AI, following the specifications in `PRODUCT.md`.

## Flow Summary

1. **User Signup/Login** → 2. **Role Detection** → 3. **Subscription Setup** → 4. **Organization Creation** → 5. **Tutorial** → 6. **Dashboard**

## Detailed Implementation

### 1. User Signup & Authentication
- **File**: Clerk authentication handles user signup/login
- **Process**: User signs up or logs in via Clerk
- **Webhook**: `convex/http.ts` handles user creation webhook from Clerk
- **Default Role**: New users are automatically assigned "coach" role unless they have a pending teacher record

### 2. Onboarding Flow (`/onboarding`)
- **File**: `app/onboarding/page.tsx`
- **Components**: Multi-step onboarding with progress indicator
- **Steps**:
  - **Role Detection**: Shows coach capabilities and features
  - **Subscription**: Presents Coach Plan ($29/month) with 14-day trial
  - **Organization Creation**: Creates Clerk organization via API
  - **Completion**: Finalizes setup and redirects to dashboard

### 3. Backend Functions
- **File**: `convex/users.ts`
- **Key Functions**:
  - `createCoachOrganization`: Creates Clerk organization via REST API
  - `updateUserOrganization`: Links organization ID to user record
  - `completeSimplifiedOnboarding`: Marks onboarding as complete

### 4. Organization Creation
- **API**: Uses Clerk REST API to create organizations
- **Naming**: Organization named "[Coach's Name]'s Team"
- **Permissions**: Coach becomes organization administrator
- **Database**: Updates user record with `clerkOrganizationId`

### 5. Coach Tutorial
- **File**: `components/onboarding/coach-tutorial.tsx`
- **Trigger**: Shows for new coaches (created within 5 minutes)
- **Content**: 4-step tutorial covering:
  - Welcome and setup confirmation
  - Teacher invitation process
  - Walkthrough creation
  - Analytics and progress tracking

### 6. Dashboard Redirection
- **File**: `app/dashboard/page.tsx`
- **Logic**: Checks `onboardingComplete` status
- **Redirect**: Sends incomplete users to `/onboarding`
- **Protection**: Ensures only onboarded users access dashboard

## Key Components

### Frontend Components
```
app/onboarding/page.tsx          # Main onboarding flow
app/dashboard/page.tsx           # Dashboard with onboarding check
components/onboarding/coach-tutorial.tsx  # Post-onboarding tutorial
app/dashboard/components/CoachDashboardPageContent.tsx  # Tutorial integration
```

### Backend Functions
```
convex/users.ts:
  - createCoachOrganization()     # Organization creation action
  - updateUserOrganization()      # Internal organization linking
  - completeSimplifiedOnboarding()  # Onboarding completion
```

### Database Schema
```
users table:
  - role: "coach" | "teacher"
  - onboardingComplete: boolean
  - clerkOrganizationId: string (optional)
  - subscriptionPlan: "free" | "pro" (optional)
```

## Environment Requirements

Required environment variables:
- `CLERK_SECRET_KEY`: For creating organizations via Clerk API
- `CLERK_JWT_ISSUER_DOMAIN`: For authentication
- `CLERK_WEBHOOK_SECRET`: For webhook verification

## User Experience Flow

1. **New User Signs Up**
   - Redirected to `/onboarding` (via dashboard check)
   - Sees role confirmation as coach

2. **Subscription Setup**
   - Presented with Coach Plan details
   - Can start 14-day free trial
   - Subscription handled by Clerk Billing (simulated for now)

3. **Organization Creation**
   - Automatic organization creation with personalized name
   - Coach becomes organization administrator
   - Backend links organization to user record

4. **Tutorial (Optional)**
   - Interactive 4-step tutorial
   - Can be skipped or completed
   - Shown only once per user

5. **Dashboard Access**
   - Full access to coach features
   - Can invite teachers to organization
   - Can create walkthroughs and view analytics

## Security & Permissions

- **Authentication**: Clerk handles all user authentication
- **Authorization**: Role-based access control in Convex functions
- **Organization**: Clerk organizations provide isolated workspaces
- **API Security**: Clerk secret key required for organization creation

## Next Steps

To complete the implementation:

1. **Clerk Billing Integration**: Replace simulated subscription with real Clerk Billing
2. **Environment Setup**: Configure `CLERK_SECRET_KEY` in Convex deployment
3. **Error Handling**: Add comprehensive error handling for API failures
4. **Testing**: End-to-end testing of complete onboarding flow
5. **Monitoring**: Add analytics for onboarding completion rates

## Usage

Once a coach completes onboarding:
- They can access `/teachers` to invite teachers
- They can create walkthroughs at `/walkthrough/new`
- They can view analytics at `/analytics`
- Teachers they invite will join their organization automatically

This flow ensures coaches have a guided, comprehensive setup experience that gets them ready to effectively use EdCoach AI to support their teachers. 