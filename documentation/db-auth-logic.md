# EdCoach AI: Database & Authentication Logic

## 1. Overview

This document provides a comprehensive guide to the database and authentication architecture of the EdCoach AI platform. It defines the data model, authentication flows, security considerations, and integration points between system components.

## 2. Architecture Pattern

EdCoach AI uses a dual-system approach to data and authentication:

- **Clerk** serves as the authentication and session provider, handling user identity, SSO, and security.
- **Convex** serves as the business data store and backend logic provider, including user roles, permissions, and all application data.

### 2.1 Architecture Diagram (Textual)

```
[User] 
   |
   v
[Clerk (Auth, SSO)] <----> [React Frontend] <----> [Convex (DB, Business Logic)]
                                              |
                                              v
                                         [OpenAI (AI Feedback)]
```

### 2.2 Component Responsibilities

- **Clerk:** Authentication, SSO, session management, and webhook events for user/org changes
- **Convex:** Business data storage, role-based access control, real-time data sync, and all application logic
- **Frontend:** Uses Clerk for auth/session and Convex for data operations
- **OpenAI:** AI-generated feedback based on observation data

## 3. Database Schema (Convex)

### 3.1 Core Tables

#### users
```typescript
{
  // User identity from Clerk
  clerkId: v.string(),
  // User's name
  name: v.string(),
  // User's email
  email: v.string(),
  // User's role: "admin", "school_leader", "instructional_coach"
  role: v.string(),
  // Organization the user belongs to
  organization: v.string(),
  // Optional profile image URL
  imageUrl: v.optional(v.string()),
  // User preferences and settings
  preferences: v.optional(v.any()),
  // When the user was created
  createdAt: v.number(),
  // Fields for subscription status
  subscriptionStatus: v.optional(v.string()),
  subscriptionTier: v.optional(v.string()),
}
```
**Indexes:** `by_clerk_id`, `by_role`, `by_organization`

#### organizations
```typescript
{
  // Organization name
  name: v.string(),
  // Admin user ID who created the organization
  adminId: v.id("users"),
  // Clerk organization ID (optional)
  clerkOrgId: v.optional(v.string()),
  // Organization type (e.g., "public", "charter", "private")
  type: v.optional(v.string()),
  // Additional organization information
  additionalInfo: v.optional(v.string()),
  // Creation date
  createdAt: v.number(),
}
```
**Indexes:** `by_admin`

#### teachers
```typescript
{
  // Teacher's name
  name: v.string(),
  // Teacher's email (optional)
  email: v.optional(v.string()),
  // Department or subject area
  department: v.optional(v.string()),
  // Grade level
  gradeLevel: v.optional(v.string()),
  // Created by user
  createdBy: v.id("users"),
  // Creation date
  createdAt: v.number(),
}
```
**Indexes:** `by_creator`

#### rubrics
```typescript
{
  // Rubric name (e.g., "LEADS", "LER")
  name: v.string(),
  // Description of the rubric
  description: v.optional(v.string()),
  // Version of the rubric
  version: v.optional(v.string()),
  // Whether this is a standard or custom rubric
  isStandard: v.boolean(),
  // The structure of the rubric (categories, indicators, rating scales)
  structure: v.any(),
  // Creator of the rubric (for custom rubrics)
  createdBy: v.optional(v.id("users")),
  // Creation date
  createdAt: v.number(),
  // Organization this rubric belongs to (for custom rubrics)
  organizationId: v.optional(v.id("organizations")),
}
```
**Indexes:** `by_organization`

#### observations
```typescript
{
  // The teacher being observed
  teacherId: v.id("teachers"),
  // The observer (school leader/coach)
  observerId: v.id("users"),
  // The rubric being used
  rubricId: v.id("rubrics"),
  // Date of observation
  observationDate: v.number(),
  // Class or subject observed
  classSubject: v.optional(v.string()),
  // Status of the observation ("draft", "completed", "feedback_generated")
  status: v.string(),
  // Creation date
  createdAt: v.number(),
  // Last updated timestamp
  updatedAt: v.number(),
  // Organization context
  organizationId: v.optional(v.id("organizations")),
}
```
**Indexes:** `by_observer`, `by_teacher`, `by_status`, `by_organization`

#### evidence
```typescript
{
  // The observation this evidence is for
  observationId: v.id("observations"),
  // The rubric indicator this evidence is for
  indicatorId: v.string(),
  // The actual evidence text
  text: v.string(),
  // Rating assigned (if applicable)
  rating: v.optional(v.string()),
  // Tags for the evidence
  tags: v.optional(v.array(v.string())),
  // Creation date
  createdAt: v.number(),
  // Last updated timestamp
  updatedAt: v.number(),
}
```
**Indexes:** `by_observation`

#### feedback
```typescript
{
  // The observation this feedback is for
  observationId: v.id("observations"),
  // The generated feedback text
  text: v.string(),
  // The version of this feedback (for tracking edits)
  version: v.number(),
  // Whether this is the finalized version
  isFinalized: v.boolean(),
  // Whether this was AI-generated or manually edited
  isAIGenerated: v.boolean(),
  // Creation date
  createdAt: v.number(),
  // Last updated timestamp
  updatedAt: v.number(),
}
```
**Indexes:** `by_observation`, `by_observation_and_version`

### 3.2 Optional Tables (Recommended)

#### audit_logs
```typescript
{
  // User who performed the action
  userId: v.id("users"),
  // Action type (e.g., "create", "update", "delete", "view")
  action: v.string(),
  // Entity type (e.g., "observation", "teacher", "user")
  entityType: v.string(),
  // ID of the affected entity
  entityId: v.string(),
  // Timestamp of the action
  timestamp: v.number(),
  // Additional details (JSON)
  details: v.optional(v.any()),
  // Organization context
  organizationId: v.id("organizations"),
}
```
**Indexes:** `by_user`, `by_entity`, `by_organization`, `by_timestamp`

### 3.3 Data Relationships

- **User → Organization:** Users belong to a single organization (school)
- **Organization → Admin:** Organizations have an admin user (principal)
- **Teacher → User:** Teachers are created by users
- **Observation → Teacher:** Observations are for a specific teacher
- **Observation → User:** Observations are created by an observer (user)
- **Observation → Rubric:** Observations use a specific rubric
- **Evidence → Observation:** Evidence belongs to an observation
- **Feedback → Observation:** Feedback belongs to an observation
- **All Entities → Organization:** All entities are scoped to an organization for data isolation

## 4. Authentication Flow

### 4.1 User Registration & Login

1. User registers/logs in using Clerk (email/password or SSO).
2. Upon successful authentication, Clerk issues a JWT and establishes a session.
3. When a user first accesses the app:
   - If the user is new, Clerk webhook creates a corresponding user in Convex.
   - If the user exists, the frontend retrieves their profile from Convex.
4. The user is directed to the appropriate dashboard based on their role.

### 4.2 Role-Based Access Control (RBAC)

- **Roles:**
  - `admin`: System administrator with full access
  - `school_leader`: Principal/administrator with access to all school data
  - `instructional_coach`: Observer with access to assigned teacher data
  - `teacher`: Access only to personal observation feedback

- **Role Enforcement:**
  - Stored in Convex `users` table
  - Enforced in all Convex query/mutation handlers
  - UI components conditionally rendered based on role
  - All business data scoped by organization and role

### 4.3 Auth Integration

- **JWT Verification:**
  - Convex verifies Clerk-issued JWTs on all requests.
  - JWT contains user identity and claims.

- **Syncing Clerk → Convex:**
  - Clerk webhooks notify Convex of user/org changes.
  - `convex/auth.ts` handles webhook events and updates Convex data.

## 5. Security & Compliance

### 5.1 Data Isolation

- **School-Level Isolation:**
  - All queries filter by organization ID.
  - Indexes support efficient organization-scoped queries.
  - No cross-school data access is possible.

### 5.2 Sensitive Data Protection

- **Password Security:**
  - Managed entirely by Clerk (never stored in Convex).
  - Industry-standard hashing and security.

- **PII Protection:**
  - Minimal personal data stored.
  - Access to teacher/user data restricted by role.

### 5.3 Compliance (FERPA)

- **Access Controls:**
  - Role-based, organization-scoped access to all data.

- **Audit Logging:**
  - (Recommended) Log all sensitive data access.
  - Track who viewed/modified observation data.

- **Data Retention:**
  - Define clear retention policies for observation data.

## 6. Implementation Details

### 6.1 Key Files

- `convex/schema.ts`: Database schema definition
- `convex/auth.ts`: Authentication logic and Clerk webhook handling
- `convex/users.ts`: User management functions
- `convex/organizations.ts`: Organization management functions
- `convex/teachers.ts`: Teacher management functions

### 6.2 Core Functions

#### Authentication
- `convex/auth.ts`: `createOrGetUser`, `getCurrentUser`, `handleClerkWebhook`

#### User Management
- `convex/users.ts`: `storeMetadata`, `getCurrentUser`, `getUser`, `createUser`, `getUserByClerkId`, `listUsers`, `updateUser`

#### Organization Management
- `convex/organizations.ts`: `storeMetadata`, `getMetadata`

#### Teacher Management
- `convex/teachers.ts`: `create`, `list`

### 6.3 Query/Mutation Patterns

1. **Authentication Check:**
   ```typescript
   const identity = await ctx.auth.getUserIdentity();
   if (!identity) {
     throw new Error("Not authenticated");
   }
   ```

2. **User Resolution:**
   ```typescript
   const user = await ctx.db
     .query("users")
     .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
     .unique();
   
   if (!user) {
     throw new Error("User not found");
   }
   ```

3. **Organization Scoping:**
   ```typescript
   // When querying data
   const results = await ctx.db
     .query("observations")
     .withIndex("by_organization", (q) => q.eq("organizationId", user.organization))
     .collect();
   ```

4. **Role Enforcement:**
   ```typescript
   // Check if user has required role
   if (user.role !== "school_leader" && user.role !== "admin") {
     throw new Error("Unauthorized");
   }
   ```

## 7. Implementation Roadmap

### Phase 1: Core Auth & User/Org Management
- Integrate Clerk for authentication and session
- Implement Convex user and organization tables
- Set up Clerk webhooks to sync users/orgs to Convex
- Enforce RBAC and school-level data isolation in Convex

### Phase 2: Teacher, Rubric, and Observation Management
- Implement teacher, rubric, and observation tables and logic
- Build observation creation, draft/finalization, and feedback flows
- Ensure all entities are linked to organizations for isolation

### Phase 3: AI Feedback, Evidence, and Analytics
- Integrate OpenAI for feedback generation
- Implement evidence and feedback tables
- Build analytics queries and dashboards (role-based)

### Phase 4: Security, Compliance, and Audit
- Add audit log table for sensitive actions (if required)
- Enforce encrypted storage, session timeouts, and brute-force protection
- Test FERPA compliance and privacy controls

### Phase 5: Testing, Optimization, and Launch
- Unit/integration/E2E testing
- Performance and load testing
- Finalize documentation and monitoring

## 8. Technical Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Role changes in Clerk not syncing to Convex | Use Clerk webhooks and periodic reconciliation jobs |
| Data leakage across schools | Enforce organizationId scoping in all Convex queries/mutations |
| Incomplete audit/compliance logging | Add audit log table and require logging for all sensitive actions |
| SSO/Clerk downtime | Graceful error handling and user messaging |
| AI feedback latency | Use async processing and user notifications for long-running tasks |

## 9. References

- [Clerk Documentation](https://clerk.dev/docs)
- [Convex Documentation](https://docs.convex.dev/)
- [FERPA Compliance Guidelines](https://studentprivacy.ed.gov/) 