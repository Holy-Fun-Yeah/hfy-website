/**
 * Event Registrations tRPC Router
 *
 * Handles event registration queries.
 */

import { z } from 'zod'
import { eq, and, desc } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'

import { router, protectedProcedure, publicProcedure } from '../trpc'
import { eventRegistrations, events, eventContent } from '../../database/schema'

// Helper to ensure db is available
function requireDb(db: typeof import('../../database').db) {
  if (!db) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Database not available',
    })
  }
  return db
}

export const registrationsRouter = router({
  /**
   * Check if current user is registered for an event
   */
  checkRegistration: protectedProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = requireDb(ctx.db)
      const registration = await db.query.eventRegistrations.findFirst({
        where: and(
          eq(eventRegistrations.eventId, input.eventId),
          eq(eventRegistrations.userId, ctx.user.id)
        ),
      })

      if (!registration) {
        return { isRegistered: false, status: null }
      }

      return {
        isRegistered: registration.status === 'confirmed',
        status: registration.status,
        registrationId: registration.id,
        confirmedAt: registration.confirmedAt,
      }
    }),

  /**
   * Get all registrations for current user
   */
  myRegistrations: protectedProcedure
    .input(
      z.object({
        lang: z.enum(['en', 'es', 'de', 'fr']).default('en'),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = requireDb(ctx.db)
      const registrations = await db
        .select({
          registration: eventRegistrations,
          event: events,
        })
        .from(eventRegistrations)
        .innerJoin(events, eq(eventRegistrations.eventId, events.id))
        .where(eq(eventRegistrations.userId, ctx.user.id))
        .orderBy(desc(eventRegistrations.createdAt))

      // Get event content for each registration
      const result = await Promise.all(
        registrations.map(async ({ registration, event }) => {
          // Try to get content in requested language, fall back to English
          let content = await db.query.eventContent.findFirst({
            where: and(eq(eventContent.eventId, event.id), eq(eventContent.lang, input.lang)),
          })

          if (!content) {
            content = await db.query.eventContent.findFirst({
              where: and(eq(eventContent.eventId, event.id), eq(eventContent.lang, 'en')),
            })
          }

          return {
            ...registration,
            event: {
              ...event,
              title: content?.title ?? 'Untitled Event',
              description: content?.description ?? '',
            },
          }
        })
      )

      return result
    }),

  /**
   * Get registration count for an event (public)
   */
  eventRegistrationCount: publicProcedure
    .input(z.object({ eventId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const db = requireDb(ctx.db)
      const registrations = await db
        .select()
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, input.eventId),
            eq(eventRegistrations.status, 'confirmed')
          )
        )

      return { count: registrations.length }
    }),
})
