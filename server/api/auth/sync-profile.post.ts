/**
 * POST /api/auth/sync-profile
 *
 * Ensures the authenticated user has a profile in our database.
 * Creates one if it doesn't exist (useful for OAuth users or migration).
 *
 * This endpoint requires authentication and uses the user's auth data
 * to create/update their profile.
 */

import { eq } from 'drizzle-orm'

import { useDatabase } from '../../database'
import { profiles } from '../../database/schema'
import { defineApiHandler } from '../../lib'
import { requireAuth } from '../../utils/auth'

export default defineApiHandler(async (event) => {
  const db = useDatabase()

  // Get authenticated user
  const user = await requireAuth(event)

  // Check if profile already exists
  const existingProfile = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1)

  if (existingProfile.length > 0) {
    // Profile exists, return it
    return {
      message: 'Profile already exists',
      profile: existingProfile[0],
      created: false,
    }
  }

  // Extract display name from user metadata or email
  const userMetadata = user.userMetadata || {}
  const displayName =
    (userMetadata.display_name as string) ||
    (userMetadata.displayName as string) ||
    (userMetadata.full_name as string) ||
    (userMetadata.name as string) ||
    user.email?.split('@')[0] ||
    'User'

  // Create new profile
  const [newProfile] = await db
    .insert(profiles)
    .values({
      id: user.id,
      email: user.email?.toLowerCase() || '',
      displayName,
      bio: null,
      avatarUrl: (userMetadata.avatar_url as string) || null,
    })
    .returning()

  return {
    message: 'Profile created successfully',
    profile: newProfile,
    created: true,
  }
})
