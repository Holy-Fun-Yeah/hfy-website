/**
 * PATCH /api/profiles/[id]
 *
 * Update a user's profile. Accessible by:
 * - The profile owner (for their own profile)
 * - Admins (for any profile)
 *
 * Updatable fields:
 * - displayName
 * - phone
 * - bio
 * - newsletterSubscribed
 */

import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../database'
import { profiles, profileUpdateApiSchema } from '../../database/schema'
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
  const { user, isAdmin } = await requireOwnerOrAdmin(event, parsedId.data)

  // Validate request body
  const body = await readBody(event)
  const parsed = profileUpdateApiSchema.safeParse(body)
  if (!parsed.success) {
    throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  }

  if (!db) {
    throw Errors.serviceUnavailable('Database not available')
  }

  // Check profile exists and is not deleted
  const [existingProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, parsedId.data))
    .limit(1)

  if (!existingProfile) {
    throw Errors.notFound('Profile not found')
  }

  if (existingProfile.deletedAt) {
    throw Errors.badRequest('Cannot update a deleted profile')
  }

  // Build update object (only include provided fields)
  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  }

  if (parsed.data.displayName !== undefined) {
    updateData.displayName = parsed.data.displayName
  }
  if (parsed.data.phone !== undefined) {
    updateData.phone = parsed.data.phone
  }
  if (parsed.data.bio !== undefined) {
    updateData.bio = parsed.data.bio
  }
  if (parsed.data.newsletterSubscribed !== undefined) {
    updateData.newsletterSubscribed = parsed.data.newsletterSubscribed
  }

  // Update profile
  const [updatedProfile] = await db
    .update(profiles)
    .set(updateData)
    .where(eq(profiles.id, parsedId.data))
    .returning()

  return {
    profile: updatedProfile,
    updatedBy: isAdmin && user.id !== parsedId.data ? 'admin' : 'owner',
  }
})
