-- ============================================================
-- Profiles Table Setup for Supabase
-- ============================================================
-- This migration sets up the profiles table and its relationship
-- with Supabase auth.users.
--
-- Run this in the Supabase SQL Editor after running drizzle-kit push.
-- ============================================================

-- 1. Add foreign key constraint to link profiles.id with auth.users.id
-- This ensures referential integrity between our profiles and Supabase auth
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Create trigger function to auto-create profile on user signup
-- This serves as a fallback in case the API registration fails
-- or for OAuth signups that bypass our register endpoint
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, created_at, updated_at)
  VALUES (
    new.id,
    LOWER(new.email),
    COALESCE(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Skip if profile already exists (created via API)
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger to call the function after user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Enable Row Level Security (RLS) on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can do anything (for our API endpoints)
CREATE POLICY "Service role has full access"
  ON public.profiles
  USING (auth.role() = 'service_role');

-- 6. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- ============================================================
-- Notes:
-- ============================================================
--
-- The trigger will auto-create profiles for:
-- - OAuth signups (Google, GitHub, etc.)
-- - Direct Supabase dashboard user creation
-- - Any signup that bypasses our /api/auth/register endpoint
--
-- Our API register endpoint creates profiles explicitly, so the
-- trigger uses ON CONFLICT DO NOTHING to avoid duplicates.
--
-- RLS policies ensure:
-- - Users can only see/edit their own profile
-- - Our server API (using service_role key) has full access
-- ============================================================
