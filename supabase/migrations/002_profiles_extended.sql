-- ============================================================
-- Profiles Table Extensions
-- ============================================================
-- Adds new columns for account management:
-- - phone: Contact phone number
-- - newsletter_subscribed: Email subscription preference
-- - deleted_at: Soft-delete timestamp (user is banned in auth.users)
--
-- Soft-delete strategy (Option D):
-- - deletedAt marks profile as deleted
-- - Auth user is BANNED (not deleted) to preserve FK integrity
-- - Email remains intact (can't re-register with same email)
-- - Admin can restore by unbanning + clearing deletedAt
-- ============================================================

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS newsletter_subscribed BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- ============================================================
-- Update RLS policies for soft-delete
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Users can only view their own ACTIVE profile
CREATE POLICY "Users can view own active profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id AND deleted_at IS NULL);

-- Users can only update their own ACTIVE profile
CREATE POLICY "Users can update own active profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id AND deleted_at IS NULL)
  WITH CHECK (auth.uid() = id AND deleted_at IS NULL);

-- Service role still has full access (for soft-delete, admin operations)
-- This policy already exists from previous migration

-- ============================================================
-- Done!
-- ============================================================
