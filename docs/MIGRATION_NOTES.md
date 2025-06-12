# Teacher Grade Band Migration

## Overview
This migration updates the teacher data structure from using individual grade levels to grade bands, making the form more mobile-friendly and better organized.

## Changes Made

### Database Schema Changes
- **Teachers table**: Changed `gradeLevels: v.array(v.string())` to `gradeBand: v.string()`
- **Observations table**: Kept `gradeLevels` as observations may target specific grade levels within a band

### Grade Band Structure
- **Early Childhood**: K-2
- **Elementary**: 3-5  
- **Middle School**: 6-8
- **High School**: 9-12

### Subject Organization
Subjects are now organized by grade band:
- **Early Childhood**: Reading, Math, Science, Social Studies, Art, Music, PE
- **Elementary**: Reading, Writing, Math, Science, Social Studies, Art, Music, PE
- **Middle**: English, Math, Science, Social Studies, Art, Music, PE, Spanish
- **High**: English, Math, Science, Social Studies, Art, Music, PE, Spanish, Computer Science

### Form Improvements
- Grade band selection uses a native select dropdown (mobile-friendly)
- Subject selection is dynamically filtered based on selected grade band
- Subjects are disabled until a grade band is selected
- Better organization reduces cognitive load

### Migration Process
1. Run the migration function: `migrateTeachersToGradeBands`
2. Existing teachers are automatically converted based on their grade levels
3. Grade band is determined by the majority of grade levels a teacher had

### Files Updated
- `convex/schema.ts` - Updated teachers table schema
- `convex/teachers.ts` - Updated all teacher functions
- `convex/migrations.ts` - Added migration function
- `components/forms/teachers-form.tsx` - Complete form redesign
- `app/teachers/page.tsx` - Updated display logic
- `app/walkthrough/[walkthroughId]/view/page.tsx` - Updated teacher info display

### Running the Migration
```bash
# Option 1: Use the Convex dashboard to run the migration function
# Option 2: Use the migration script (if Node.js client is set up)
node scripts/migrate-teachers.js
```

### Benefits
1. **Mobile-friendly**: Native select elements work better on mobile devices
2. **Better UX**: Two-step selection process (grade band → subjects) is more intuitive
3. **Organized subjects**: Subjects are relevant to the selected grade band
4. **Reduced complexity**: Fewer options to choose from at each step
5. **Future-proof**: Easier to add new subjects to specific grade bands

### Backward Compatibility
- Observations still use `gradeLevels` for specific observation data
- Migration automatically converts existing data
- No data loss during migration 