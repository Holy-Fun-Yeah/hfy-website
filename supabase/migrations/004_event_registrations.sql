-- ============================================================
-- Event Registrations Table
-- ============================================================
-- Stores event registration and payment status.
-- Supports both free events (amount=0) and paid events with Stripe.
-- ============================================================

-- Create registration status enum
CREATE TYPE registration_status AS ENUM (
  'pending',    -- Payment initiated but not confirmed
  'confirmed',  -- Payment successful, registration complete
  'failed',     -- Payment failed
  'refunded',   -- Payment refunded
  'cancelled'   -- Cancelled by user or admin
);

-- Create event_registrations table
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Payment details
  stripe_payment_intent_id TEXT,  -- null for free events
  amount DECIMAL(10, 2) NOT NULL, -- 0 for free events
  status registration_status NOT NULL DEFAULT 'pending',

  -- Attendee info (stored for receipt/confirmation)
  attendee_name TEXT NOT NULL,
  attendee_email TEXT NOT NULL,
  attendee_phone TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Each user can only register once per event
CREATE UNIQUE INDEX event_registrations_event_user_idx
  ON event_registrations(event_id, user_id);

-- Index for querying user's registrations
CREATE INDEX event_registrations_user_idx
  ON event_registrations(user_id);

-- Index for querying event's registrations
CREATE INDEX event_registrations_event_idx
  ON event_registrations(event_id);

-- ============================================================
-- RLS Policies
-- ============================================================
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Users can view their own registrations
CREATE POLICY "Users can view own registrations"
  ON event_registrations FOR SELECT
  USING (auth.uid() = user_id);

-- Service role has full access (for webhooks, admin operations)
CREATE POLICY "Service role full access"
  ON event_registrations FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================================
-- Done!
-- ============================================================
