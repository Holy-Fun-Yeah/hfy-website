/**
 * GET /api/profiles/[id]
 *
 * Get a user's profile. Accessible by:
 * - The profile owner (for their own profile)
 * - Admins (for any profile, including deleted ones)
 */

import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../database'
import { profiles } from '../../database/schema'
import { defineApiHandler, Errors } from '../../lib'
import { requireOwnerOrAdmin } from '../../utils/auth'

// UUID validation
const uuidSchema = z.string().uuid()

export default defineApiHandler(async (event) => {
  // Validate profile ID
  const profileId = getRouterParam(event, 'id')
  const parsedId = uuidSchema.safeParse(profileId)
  if (!parsedId.success) {
    throw Errors.badRequest('Invalid profile ID (must be UUID)')
  }

  // Check authorization (must be owner or admin)
  const { isAdmin } = await requireOwnerOrAdmin(event, parsedId.data)

  if (!db) {
    throw Errors.serviceUnavailable('Database not available')
  }

  // Get profile
  const [profile] = await db.select().from(profiles).where(eq(profiles.id, parsedId.data)).limit(1)

  if (!profile) {
    throw Errors.notFound('Profile not found')
  }

  // Non-admins cannot view deleted profiles
  if (profile.deletedAt && !isAdmin) {
    throw Errors.notFound('Profile not found')
  }

  return {
    profile,
    isDeleted: !!profile.deletedAt,
  }
})
