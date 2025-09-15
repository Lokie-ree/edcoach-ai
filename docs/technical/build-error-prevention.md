# Build Error Prevention Checklist

## Overview
This document outlines common build errors and how to prevent them after making major changes to the codebase.

## Pre-Deployment Checklist

### 1. Run Build Check
Always run the build command before committing major changes:
```bash
pnpm run build
```

### 2. Common Build Errors to Watch For

#### Unused Imports
**Error Pattern:** `'SPACING' is defined but never used`
**Common Culprits:**
- `SPACING` from design tokens
- `LoadingState` components
- `Form` components (`Form`, `FormSection`, `FormWrapper`)
- `CheckCircle`, `Sparkles` from lucide-react
- `FORM_PATTERNS`, `ACCESSIBILITY` from design tokens
- `RESPONSIVE_PATTERNS` from design tokens

**Fix:** Remove unused imports from the import statement

#### Unescaped Entities in JSX
**Error Pattern:** `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`
**Common Locations:**
- Text content with apostrophes
- Dynamic content with user names

**Fix:** Replace with HTML entities:
- `'` → `&apos;`
- `"` → `&quot;`
- `"` → `&ldquo;` and `&rdquo;`

#### TypeScript `any` Types
**Error Pattern:** `Unexpected any. Specify a different type`
**Common Locations:**
- Form components
- Generic component props

**Fix:** Use proper generic types:
```typescript
// Instead of:
control: any;
form: any;

// Use:
control: Control<TFieldValues>;
form: UseFormReturn<TFieldValues>;
```

#### Incorrect Property Access
**Error Pattern:** `Property 'duration' does not exist on type`
**Common Issues:**
- `ANIMATIONS.duration.fast` → `ANIMATIONS.durations.fast`
- `ANIMATIONS.duration.normal` → `ANIMATIONS.durations.normal`

**Fix:** Check design token structure and use correct property names

### 3. Design Token Structure Reference

```typescript
// ANIMATIONS
ANIMATIONS.durations.fast    // ✅ Correct
ANIMATIONS.duration.fast     // ❌ Incorrect

// SPACING
SPACING.component.md         // ✅ Correct
SPACING.md                   // ❌ Incorrect

// STATUS_COLORS
STATUS_COLORS.success.text   // ✅ Correct
STATUS_COLORS.success        // ❌ Incorrect
```

### 4. Automated Checks

#### ESLint Rules
The project uses strict ESLint rules:
- `@typescript-eslint/no-unused-vars`
- `@typescript-eslint/no-explicit-any`
- `react/no-unescaped-entities`

#### TypeScript Strict Mode
- All `any` types must be replaced with proper types
- Generic components must be properly typed

### 5. Quick Fix Commands

```bash
# Check for linting errors
pnpm run lint

# Check TypeScript errors
pnpm run type-check

# Full build check
pnpm run build
```

### 6. Prevention Strategies

1. **Import Management**
   - Only import what you use
   - Use IDE features to auto-remove unused imports
   - Group imports logically

2. **Type Safety**
   - Always define proper interfaces
   - Use generic types for reusable components
   - Avoid `any` types

3. **JSX Best Practices**
   - Use HTML entities for special characters
   - Test dynamic content rendering

4. **Design Token Usage**
   - Reference the actual token structure
   - Use IDE autocomplete for token properties
   - Keep design-tokens.ts updated

### 7. Emergency Fixes

If build fails in production:
1. Check the specific error message
2. Locate the file and line number
3. Apply the appropriate fix from this checklist
4. Test locally before redeploying

## File Locations for Common Issues

- **Form Components:** `components/forms/`
- **Design Tokens:** `lib/design-tokens.ts`
- **Grid Components:** `app/(dashboard)/(coach)/*/components/GridDistortion.tsx`
- **Loading Components:** `components/common/LoadingState.tsx`, `LoadingSpinner.tsx`

## Remember
Always run `pnpm run build` before committing major changes to catch these issues early!
