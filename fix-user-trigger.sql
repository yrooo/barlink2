-- Fix for handle_new_user trigger function
-- This migration updates the trigger to properly handle user metadata from Supabase Auth

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the updated function that handles user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    
    INSERT INTO public.user_profiles (user_id, created_at, updated_at)
    VALUES (NEW.id, NOW(), NOW());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Optional: Update existing users that might have null names
UPDATE public.users 
SET name = 'Unknown User' 
WHERE name IS NULL;

COMMIT;