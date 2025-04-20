# EdCoach AI Testing Plan

## Overview
This document outlines a structured approach to testing the current features of EdCoach AI to ensure they're working as expected. Each test includes steps to follow, expected outcomes, and potential issues to watch for.

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

## 2. Organization Functionality

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

## 4. Database Schema Validation

### 4.1 Schema Integrity
**Steps:**
1. Check all tables defined in schema.ts
2. Verify required fields and indexes
3. Test field types and constraints

**Expected Outcome:**
- Tables match schema definition
- Indexes are properly created
- Data types are enforced

**Verification Method:**
```bash
# Open Convex dashboard to view tables
npx convex dashboard
```

### 4.2 Data Relationships
**Steps:**
1. Create related records (user->organization, etc.)
2. Query related data
3. Verify integrity constraints

**Expected Outcome:**
- Foreign key relationships work correctly
- Queries across relationships return expected data

**Verification Method:**
```bash
# Check teacher data with creator relationship
npx convex run teachers:listTeachers
```

## 5. UI Components and Navigation

### 5.1 ShadCN Components
**Steps:**
1. Navigate through all implemented pages
2. Test each ShadCN component:
   - Forms
   - Buttons
   - Dialogs
   - Tables
   - Cards

**Expected Outcome:**
- Components render correctly
- Components are functional
- Components follow design system

### 5.2 Responsive Design
**Steps:**
1. Test each page at different viewport sizes:
   - Desktop (1920px+)
   - Laptop (1366px)
   - Tablet (768px)
   - Mobile (375px)
2. Test orientation changes on mobile/tablet

**Expected Outcome:**
- UI adapts to different screen sizes
- Content remains accessible
- No layout issues or overflow

### 5.3 Navigation Flow
**Steps:**
1. Test main navigation links
2. Test breadcrumbs if implemented
3. Verify page transitions

**Expected Outcome:**
- All links lead to correct destinations
- Navigation state is preserved
- User location is clear

## 6. API Functionality

### 6.1 Convex Mutations
**Steps:**
1. Test create operations
2. Test update operations
3. Test delete operations

**Expected Outcome:**
- Operations succeed with valid data
- Operations fail with invalid data
- Data is persisted correctly

**Verification Method:**
```bash
# Test user creation
npx convex run users:createUser --clerkId="test123" --name="Test User" --email="test@example.com" --role="school_leader" --organization="Test School"

# Test user update
npx convex run users:updateUser --userId="{user_id}" --name="Updated Name"
```

### 6.2 Convex Queries
**Steps:**
1. Test list queries
2. Test detail queries
3. Test filtered queries

**Expected Outcome:**
- Queries return expected data
- Filters work correctly
- Data is formatted as expected

**Verification Method:**
```bash
# Test user listing
npx convex run users:listUsers

# Test filtered user listing
npx convex run users:listUsers --role="school_leader"
```

### 6.3 Webhook Handling
**Steps:**
1. Test Clerk webhooks
2. Verify database updates

**Expected Outcome:**
- Webhooks are processed correctly
- Database is updated based on webhook events

**Verification Method:**
```bash
# Simulate webhook
curl -X POST http://localhost:3000/api/clerk-webhook -H "Content-Type: application/json" -d '{"type":"user.created","data":{"id":"test123","email_addresses":[{"email_address":"test@example.com"}],"first_name":"Test","last_name":"User","organization":"Test Org"}}'
```

## 7. Issue Tracking

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

After completing these tests, update the development roadmap to accurately reflect the status of implemented features. Mark features as:

- ✅ **Complete:** Feature works as expected with no issues
- 🟡 **Partial:** Feature works but has minor issues
- 🔴 **Incomplete:** Feature doesn't work or has major issues 