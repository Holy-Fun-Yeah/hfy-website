/**
 * Profile tRPC Router
 *
 * Provides type-safe API for user profile management.
 * Consolidates auth/profile and profiles/* endpoints.
 */

import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { profiles, profileUpdateApiSchema } from '../../database/schema'
import { protectedProcedure, publicProcedure, router } from '../trpc'

// Input schemas
const getProfileByIdInput = z.object({
  id: z.string().uuid(),
})

export const profileRouter = router({
  /**
   * Get the current user's profile.
   * Requires authentication.
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx

    if (!db) {
      throw new Error('Database not available')
    }

    const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1)

    if (!profile) {
      return null
    }

    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      phone: profile.phone,
      bio: profile.bio,
      newsletterSubscribed: profile.newsletterSubscribed,
      isAdmin: profile.isAdmin,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    }
  }),

  /**
   * Update the current user's profile.
   * Requires authentication.
   */
  update: protectedProcedure.input(profileUpdateApiSchema).mutation(async ({ ctx, input }) => {
    const { db, user } = ctx

    if (!db) {
      throw new Error('Database not available')
    }

    // Check profile exists
    const [existingProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)

    if (!existingProfile) {
      throw new Error('Profile not found')
    }

    // Update profile
    const result = await db
      .update(profiles)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id))
      .returning()

    const updatedProfile = result[0]
    if (!updatedProfile) {
      throw new Error('Failed to update profile')
    }

    return {
      message: 'Profile updated successfully',
      profile: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        displayName: updatedProfile.displayName,
        avatarUrl: updatedProfile.avatarUrl,
        phone: updatedProfile.phone,
        bio: updatedProfile.bio,
        newsletterSubscribed: updatedProfile.newsletterSubscribed,
        isAdmin: updatedProfile.isAdmin,
        createdAt: updatedProfile.createdAt,
        updatedAt: updatedProfile.updatedAt,
      },
    }
  }),

  /**
   * Get a public profile by ID.
   * Returns limited public info.
   */
  byId: publicProcedure.input(getProfileByIdInput).query(async ({ ctx, input }) => {
    const { db } = ctx
    const { id } = input

    if (!db) {
      throw new Error('Database not available')
    }

    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1)

    if (!profile || profile.deletedAt) {
      return null
    }

    // Return only public fields
    return {
      id: profile.id,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      bio: profile.bio,
    }
  }),
})
