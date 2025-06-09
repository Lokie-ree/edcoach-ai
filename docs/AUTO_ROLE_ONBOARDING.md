# Auto-Role Assignment Onboarding

## Overview

EdCoach AI now features a streamlined onboarding system that automatically assigns user roles based on email lookup in the teachers table. This eliminates the need for manual role selection and creates a seamless experience for both coaches and teachers.

## How It Works

### Role Detection Logic

1. **Email Lookup**: When a user signs up, the system checks if their email exists in the `teachers` table
2. **Automatic Assignment**:
   - If email found in teachers table → Assign "teacher" role and link to coach
   - If email not found → Assign "coach" role

### User Flow

1. User signs in with Clerk
2. User is redirected to onboarding page
3. System shows welcome screen with auto-detection message
4. User clicks "Get Started"
5. System automatically:
   - Retrieves user data from Clerk
   - Checks email against teachers table
   - Assigns appropriate role
   - Creates/updates user record
   - Redirects to dashboard

## Technical Implementation

### Backend Function: `completeSimplifiedOnboarding`

```typescript
// Auto-role assignment onboarding - detects coach vs teacher based on email
export const completeSimplifiedOnboarding = mutation({
  args: {},
  returns: v.object({ 
    success: v.boolean(), 
    userId: v.id("users"),
    role: v.union(v.literal("coach"), v.literal("teacher"))
  }),
  handler: async (ctx, args) => {
    // 1. Get user identity from Clerk
    const identity = await ctx.auth.getUserIdentity();
    
    // 2. Check if email exists in teachers table
    const teacherRecord = await ctx.db
      .query("teachers")
      .filter((q) => q.eq(q.field("email"), userEmail))
      .first();

    // 3. Determine role and coachId
    const role = teacherRecord ? ("teacher" as const) : ("coach" as const);
    const coachId = teacherRecord ? teacherRecord.coachId : undefined;

    // 4. Create or update user record with role and coachId
    // ...
  },
});
```

### Frontend: Simplified Onboarding Page

- No form inputs required
- Uses Clerk data directly
- Shows welcome message with auto-detection explanation
- Single "Get Started" button
- Different success messages for coaches vs teachers

## Benefits

### For Users
- **Faster onboarding**: No forms to fill out
- **No confusion**: No need to choose role
- **Immediate access**: Direct path to dashboard

### For Development
- **Reduced complexity**: 75% fewer components
- **Better data consistency**: Single atomic operation
- **Easier maintenance**: Simpler state management

### For Operations
- **Automatic teacher linking**: Teachers automatically connected to their coach
- **No role errors**: Eliminates user role selection mistakes
- **Scalable**: Works for any number of pre-registered teachers

## Teacher Registration Workflow

1. **Coach creates teacher**: Uses teacher management interface
2. **Teacher record created**: Email stored in teachers table with coachId
3. **Teacher signs up**: Uses same email address
4. **Auto-detection**: System finds email, assigns teacher role, links to coach

## Error Handling

- **Missing Clerk data**: Clear error messages
- **Email not found**: Defaults to coach role
- **Database errors**: Graceful failure with retry option

## Future Enhancements

- **Invitation system**: Send email invites to teachers
- **Role confirmation**: Optional role verification step
- **Bulk teacher import**: CSV upload for multiple teachers
- **Role switching**: Admin ability to change roles post-signup 