-- ============================================================
-- Profiles Table: Add Pronouns Column
-- ============================================================
-- Adds inclusive pronouns field to support diverse gender identities.
-- Values: she/her, he/him, they/them, she/they, he/they, any, prefer_not_to_say
-- ============================================================

-- Add pronouns column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pronouns TEXT;

-- ============================================================
-- Done!
-- ============================================================
