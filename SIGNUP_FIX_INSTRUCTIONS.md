# Fix for Signup Error: "null value in column 'name' violates not-null constraint"

## Problem
The signup process is failing because the database trigger function `handle_new_user()` doesn't properly extract the `name` field from Supabase Auth's user metadata, causing a NOT NULL constraint violation in the `users` table.

## Root Cause
The current trigger function only inserts `id` and `email` into the `users` table, but the `name` field is required (NOT NULL constraint) and isn't being populated from the user metadata passed during signup.

## Solution

### Step 1: Update the Database Trigger Function
You need to execute the SQL migration in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Execute the contents of `fix-user-trigger.sql` file

### Step 2: Verify the Fix
After applying the migration:

1. Try signing up with a new user
2. The `name` field should now be properly extracted from the signup form
3. If a name isn't provided, it will default to "Unknown User"

## What the Fix Does

### Before (Broken)
```sql
INSERT INTO public.users (id, email, created_at, updated_at)
VALUES (NEW.id, NEW.email, NOW(), NOW());
```

### After (Fixed)
```sql
INSERT INTO public.users (id, name, email, role, company, created_at, updated_at)
VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', 'Unknown User'),
    NEW.email, 
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'pelamar_kerja'),
    NEW.raw_user_meta_data->>'company',
    NOW(), 
    NOW()
);
```

## Key Changes
1. **Extracts name**: `NEW.raw_user_meta_data->>'name'` gets the name from signup metadata
2. **Provides fallback**: `COALESCE(..., 'Unknown User')` ensures name is never null
3. **Handles role**: Extracts user role from metadata with default fallback
4. **Handles company**: Extracts company information for employers

## Files Modified
- `supabase-schema.sql` - Updated trigger function
- `fix-user-trigger.sql` - Standalone migration file
- `SIGNUP_FIX_INSTRUCTIONS.md` - This instruction file

## Testing
After applying the fix:
1. Open http://localhost:3000/auth/signup
2. Fill out the signup form with name, email, password, and role
3. Submit the form
4. The signup should complete successfully without database errors

## Alternative Manual Fix
If you can't access Supabase dashboard, you can also:
1. Install Supabase CLI: `npm install -g supabase`
2. Run: `supabase db reset` to apply the updated schema

The development server is already running at http://localhost:3000