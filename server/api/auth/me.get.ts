/**
 * GET /api/auth/me
 *
 * Get the current authenticated user's profile.
 * Returns both Supabase auth data and our profile data.
 */

import { eq } from 'drizzle-orm'

import { db } from '../../database'
import { profiles } from '../../database/schema'
import { defineApiHandler, Errors } from '../../lib'
import { requireAuth } from '../../utils/auth'

export default defineApiHandler(async (event) => {
  // Get authenticated user
  const user = await requireAuth(event)

  if (!db) {
    throw Errors.serviceUnavailable('Database not available')
  }

  // Get profile from our database
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1)

  return {
    // Auth info from Supabase
    auth: {
      id: user.id,
      email: user.email,
      emailConfirmed: !!user.email_confirmed_at,
      lastSignIn: user.last_sign_in_at,
    },
    // Profile from our database (may be null if not synced)
    profile: profile || null,
    // Indicates if profile needs to be created
    needsProfileSync: !profile,
  }
})
