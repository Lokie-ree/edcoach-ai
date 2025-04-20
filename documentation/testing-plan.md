# EdCoach AI Testing Plan

## Overview
This document outlines a structured approach to testing EdCoach AI's MVP features, including detailed requirements for observation templates, draft/finalized status, school-scoped analytics, Convex-based role management, and supportive, growth-focused feedback.

## 1. Authentication Testing

### 1.1 User Registration
**Steps:**
1. Navigate to registration page
2. Complete registration form with valid data
3. Submit the form

**Expected Outcome:**
- User account is created in Clerk
- User record is created in Convex database
- User is redirected to dashboard or organization selection

**Verification Method:**
```bash
# Check user in Convex database
npx convex run users:getUserByClerkId --clerkId="{clerk_id}"
```

### 1.2 User Login
**Steps:**
1. Navigate to login page
2. Enter valid credentials
3. Submit the form

**Expected Outcome:**
- User is authenticated
- User is redirected to dashboard
- Auth session is created

**Verification Method:**
```bash
# Check current user
npx convex run auth:getCurrentUser
```

### 1.3 Password Reset
**Steps:**
1. Navigate to login page
2. Click "Forgot Password"
3. Enter email address
4. Complete password reset flow

**Expected Outcome:**
- Reset email is sent
- User can set new password
- User can log in with new password

## 2. Organization & School Context

### 2.1 Organization Creation
**Steps:**
1. Log in as a new user
2. Navigate to organization creation
3. Enter organization details
4. Submit the form

**Expected Outcome:**
- Organization is created in Clerk
- Organization record is created in Convex
- User is associated with organization

**Verification Method:**
```bash
# Check organization in database
npx convex run organizations:getMetadata --clerkOrgId="{clerk_org_id}"
```

### 2.2 Organization Context
**Steps:**
1. Log in as a user with an organization
2. Navigate to any page that uses the organization context

**Expected Outcome:**
- OrganizationContext provides correct organization data
- Role flags (isDistrictAdmin, isSchoolLeader, etc.) are accurate
- UI elements adapt based on role

**Verification Method:**
- Check React DevTools Components tab
- Verify context values match expected roles

### 2.3 Verify user and observation records are associated with correct schoolId
- Confirm all analytics and data access are scoped to user's school

## 3. Role-Based Access Control

### 3.1 Role Assignment
**Steps:**
1. Create users with different roles:
   - District Administrator
   - School Leader
   - Instructional Coach
   - Teacher
2. Verify each user's role in database

**Expected Outcome:**
- Users have correct roles assigned
- Roles persist across sessions

**Verification Method:**
```bash
# Check user role
npx convex run users:getUser --userId="{user_id}"
```

### 3.2 Permission Enforcement
**Steps:**
1. Log in as users with different roles
2. Attempt to access pages intended for each role
3. Attempt to access pages restricted for each role

**Expected Outcome:**
- Users can access appropriate pages
- Users are denied access to restricted pages
- API calls respect permissions

**Verification Method:**
- Manually test navigation
- Check for proper redirects on restricted pages

### 3.3 Test Convex DB as source of truth for roles/permissions
- Verify that only users with appropriate roles (coach/AP, principal) can submit observations
- Confirm teachers can only view their own feedback

## 4. Observation Templates

### 4.1 Formal Observation (LER Rubric)
**Steps:**
1. As a coach/AP or principal, start a new formal observation for a teacher.
2. For each LER domain and indicator (per rubric-content.json):
   - Enter a numeric rating (per rubric: e.g., 1, 3, 5)
   - Enter evidence text supporting the rating
3. Attempt to finalize the observation with incomplete indicators or missing evidence.
4. Save as draft, edit, and finalize when all required fields are complete.

**Expected Outcome:**
- All LER domains and indicators are present and required.
- Cannot finalize unless all indicators have a rating and evidence.
- Ratings and evidence are validated per rubric.
- Teachers receive comprehensive, rubric-aligned feedback.

**Verification Method:**
```bash
# Check observation completeness and status
npx convex run observations:listObservations
```

### 4.2 Informal Walkthrough (Encouragement & Growth Focus)
**Steps:**
1. As a coach/AP or principal, start a new informal walkthrough for a teacher.
2. Select up to 3 LER indicators observed.
3. For each selected indicator:
   - Enter area of reinforcement (required)
   - Enter area of refinement (optional)
   - Enter specific, encouraging feedback (required)
4. Enter an overall encouragement/positive note (required).
5. Attempt to submit with missing required fields or more than 3 indicators.
6. Attempt to enter numeric ratings or grading language (should not be allowed).
7. Save as draft, edit, and finalize.
8. Trigger AI feedback and review output for supportive, non-evaluative tone.

**Expected Outcome:**
- Cannot select more than 3 indicators.
- Area of reinforcement and specific feedback are required for each indicator.
- Overall encouragement note is required.
- No numeric ratings or grading language are present or accepted.
- All feedback is phrased positively and constructively.
- AI feedback is always supportive and non-evaluative.
- UI/UX uses positive, growth-oriented language and helper text (e.g., "What's going well?", "This feedback is for encouragement and professional growth, not evaluation.")

**Verification Method:**
```bash
# Check observation fields and status
npx convex run observations:listObservations
# Review UI for language and helper text
# Review AI feedback output for tone
```

**Acceptance Criteria (Both Forms):**
- Formal: All indicators/domains must be completed with rating and evidence to finalize.
- Informal: At least one area of reinforcement and overall encouragement are required; no numeric ratings or grading language; feedback is supportive and growth-focused.
- Both: Observations can be saved as draft, edited, and finalized; finalized feedback is visible to teacher.

## 5. Observation Status

### 5.1 Test saving, editing, and finalizing observations
**Steps:**
1. Edit and finalize an observation
2. Save as draft and edit again
3. Finalize the observation

**Expected Outcome:**
- Observation status is updated correctly
- Observation can be saved as draft and edited
- Observation can be finalized

**Verification Method:**
```bash
# Check observation status
npx convex run observations:listObservations
```

### 5.2 Ensure only finalized observations are shared with teachers
**Steps:**
1. Submit an observation
2. Verify it is visible to teachers
3. Verify it is not visible to unauthorized users

**Expected Outcome:**
- Observation is visible to teachers
- Observation is not visible to unauthorized users

**Verification Method:**
```bash
# Check observation visibility
npx convex run observations:listObservations
```

## 6. AI Feedback

### 6.1 Formal Observation
- Test AI feedback generation and editing for rubric-aligned, comprehensive feedback.

### 6.2 Informal Walkthrough
- Test AI feedback generation and editing for supportive, non-evaluative, growth-focused feedback.
- Attempt to generate feedback with negative or evaluative prompts; verify output remains positive and growth-oriented.

**Expected Outcome:**
- AI feedback for informal walkthrough is always supportive and non-evaluative.
- AI feedback for formal observation is rubric-aligned and comprehensive.

## 7. Analytics

### 7.1 Test dashboards for all roles
**Steps:**
1. Log in as different roles
2. Verify access to relevant dashboards

**Expected Outcome:**
- Users can access relevant dashboards
- Dashboards provide accurate analytics

**Verification Method:**
```bash
# Check dashboard access
npx convex run organizations:getMetadata --clerkOrgId="{clerk_org_id}"
```

### 7.2 Confirm all analytics are scoped to user's school
**Steps:**
1. Log in as different roles
2. Verify analytics are scoped to user's school

**Expected Outcome:**
- Analytics are scoped to user's school
- Analytics are accurate and relevant

**Verification Method:**
```bash
# Check analytics
npx convex run organizations:getMetadata --clerkOrgId="{clerk_org_id}"
```

### 7.3 Test filtering and aggregation by template, date, teacher
**Steps:**
1. Log in as different roles
2. Filter and aggregate analytics by template, date, and teacher

**Expected Outcome:**
- Analytics are filtered and aggregated correctly
- Analytics are accurate and relevant

**Verification Method:**
```bash
# Check analytics
npx convex run organizations:getMetadata --clerkOrgId="{clerk_org_id}"
```

## 8. UI Components and Navigation

### 8.1 Informal Walkthrough UI/UX Checks
- Verify all form labels, helper text, and prompts use positive, growth-oriented language.
- Confirm presence of helper text: "This feedback is for encouragement and professional growth, not evaluation."
- Confirm no numeric ratings or grading language are present in the UI.

### 8.2 All Other UI/UX
- Verify all other UI components and navigation elements are functional and follow design system.

## 9. API Functionality

### 9.1 Test Convex mutations/queries for observation creation, update, status change, and feedback
**Steps:**
1. Create a new observation
2. Update the observation
3. Change the observation status
4. Verify feedback is generated

**Expected Outcome:**
- Observation is created correctly
- Observation is updated correctly
- Observation status is changed correctly
- Feedback is generated correctly

**Verification Method:**
```bash
# Test observation creation
npx convex run observations:createObservation --title="Test Observation" --description="This is a test observation" --template="Formal" --teacherId="{teacher_id}" --schoolId="{school_id}"

# Test observation update
npx convex run observations:updateObservation --observationId="{observation_id}" --title="Updated Observation Title"

# Test observation status change
npx convex run observations:updateObservationStatus --observationId="{observation_id}" --status="Finalized"

# Test feedback generation
npx convex run observations:listObservations
```

### 9.2 Test Convex queries for analytics, ensuring school scoping
**Steps:**
1. Log in as different roles
2. Verify access to relevant analytics

**Expected Outcome:**
- Users can access relevant analytics
- Analytics are scoped to user's school

**Verification Method:**
```bash
# Check analytics
npx convex run organizations:getMetadata --clerkOrgId="{clerk_org_id}"
```

## 10. Issue Tracking

For each test, record any issues found using the following format:

### Issue Template
- **Feature/Test:** [Name of feature or test]
- **Description:** [Clear description of the issue]
- **Steps to Reproduce:** [Numbered steps]
- **Expected Behavior:** [What should happen]
- **Actual Behavior:** [What actually happens]
- **Screenshots/Logs:** [If applicable]
- **Priority:** [High/Medium/Low]

## Conclusion

- All MVP features must pass tests for both observation templates, draft/finalized status, school scoping, Convex-based role management, and supportive, growth-focused feedback.

After completing these tests, update the development roadmap to accurately reflect the status of implemented features. Mark features as:

- ✅ **Complete:** Feature works as expected with no issues
- 🟡 **Partial:** Feature works but has minor issues
- 🔴 **Incomplete:** Feature doesn't work or has major issues 