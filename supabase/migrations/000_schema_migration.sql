-- ============================================================
-- Schema Migration: Multilingual Support + Profiles
-- ============================================================
-- Run this in Supabase SQL Editor
-- This handles the full migration from old schema to new schema
-- ============================================================

-- ============================================================
-- 1. Create lang enum
-- ============================================================
DO $$ BEGIN
    CREATE TYPE lang AS ENUM ('en', 'es', 'de', 'fr');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- 2. Drop old users table and create profiles table
-- ============================================================
-- Drop old users table if it exists (backup data first if needed!)
DROP TABLE IF EXISTS users CASCADE;

-- Create new profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    email TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. Modify posts table for multilingual support
-- ============================================================
-- Drop old columns from posts (title, content moved to post_content)
ALTER TABLE posts DROP COLUMN IF EXISTS title;
ALTER TABLE posts DROP COLUMN IF EXISTS content;

-- Add banner_url if not exists
DO $$ BEGIN
    ALTER TABLE posts ADD COLUMN banner_url TEXT;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Change author_id from integer to UUID (references profiles)
-- First drop the old column and constraint
ALTER TABLE posts DROP COLUMN IF EXISTS author_id;

-- Add new UUID author_id column
ALTER TABLE posts ADD COLUMN author_id UUID REFERENCES profiles(id);

-- Add timezone to timestamps
ALTER TABLE posts
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';

-- ============================================================
-- 4. Create post_content table
-- ============================================================
CREATE TABLE IF NOT EXISTS post_content (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    lang lang NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique index on (post_id, lang)
CREATE UNIQUE INDEX IF NOT EXISTS post_content_post_lang_idx ON post_content(post_id, lang);

-- ============================================================
-- 5. Modify events table for multilingual support
-- ============================================================
-- Drop translatable columns (moved to event_content)
ALTER TABLE events DROP COLUMN IF EXISTS title;
ALTER TABLE events DROP COLUMN IF EXISTS description;
ALTER TABLE events DROP COLUMN IF EXISTS detail;

-- ============================================================
-- 6. Create event_content table
-- ============================================================
CREATE TABLE IF NOT EXISTS event_content (
    id SERIAL PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    lang lang NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    detail TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create unique index on (event_id, lang)
CREATE UNIQUE INDEX IF NOT EXISTS event_content_event_lang_idx ON event_content(event_id, lang);

-- ============================================================
-- 7. Profile auto-creation trigger
-- ============================================================
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
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 8. Row Level Security for profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role has full access" ON profiles;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role can do anything
CREATE POLICY "Service role has full access"
  ON profiles FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- 9. Grant permissions
-- ============================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;
GRANT ALL ON post_content TO authenticated;
GRANT ALL ON post_content TO service_role;
GRANT ALL ON event_content TO authenticated;
GRANT ALL ON event_content TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ============================================================
-- Done!
-- ============================================================
-- After running this, create profiles for existing auth users:
--
-- INSERT INTO profiles (id, email, display_name)
-- SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
-- FROM auth.users
-- ON CONFLICT (id) DO NOTHING;
-- ============================================================
