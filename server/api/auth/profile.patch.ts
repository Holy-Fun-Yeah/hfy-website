/**
 * PATCH /api/auth/profile
 *
 * Update the authenticated user's profile.
 * Only allows updating user-editable fields.
 */

import { eq } from 'drizzle-orm'

import { useDatabase } from '../../database'
import { profiles, profileUpdateApiSchema } from '../../database/schema'
import { defineApiHandler, Errors } from '../../lib'
import { requireAuth } from '../../utils/auth'

export default defineApiHandler(async (event) => {
  const db = useDatabase()

  // Get authenticated user
  const user = await requireAuth(event)

  // Parse and validate request body
  const body = await readBody(event)
  const parsed = profileUpdateApiSchema.safeParse(body)

  if (!parsed.success) {
    throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  }

  // Check profile exists
  const [existingProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1)

  if (!existingProfile) {
    throw Errors.notFound('Profile not found')
  }

  // Update profile
  const [updatedProfile] = await db
    .update(profiles)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, user.id))
    .returning()

  return {
    message: 'Profile updated successfully',
    profile: updatedProfile,
  }
})
