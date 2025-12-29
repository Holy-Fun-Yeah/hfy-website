/**
 * tRPC Server Setup
 *
 * Initializes tRPC with context and creates reusable procedure builders.
 */

import { TRPCError, initTRPC } from '@trpc/server'
import superjson from 'superjson'

import type { Context } from './context'

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Add custom error data if needed
        zodError: error.cause instanceof Error ? error.cause.message : null,
      },
    }
  },
})

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router
export const publicProcedure = t.procedure
export const middleware = t.middleware

/**
 * Protected procedure - requires authentication
 */
const isAuthed = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

export const protectedProcedure = publicProcedure.use(isAuthed)

/**
 * Admin procedure - requires admin role
 */
const isAdmin = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }

  // Check if user is admin (from profile)
  if (!ctx.db) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Database not available',
    })
  }

  const { profiles } = await import('../database/schema')
  const { eq } = await import('drizzle-orm')

  const [profile] = await ctx.db
    .select()
    .from(profiles)
    .where(eq(profiles.id, ctx.user.id))
    .limit(1)

  if (!profile?.isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin access required',
    })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      isAdmin: true,
    },
  })
})

export const adminProcedure = publicProcedure.use(isAdmin)
