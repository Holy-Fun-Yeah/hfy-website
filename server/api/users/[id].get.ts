import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../database'
import { profiles } from '../../database/schema'
import { defineApiHandler, Errors } from '../../lib'

// UUID validation schema
const uuidSchema = z.string().uuid()

export default defineApiHandler(async (event) => {
  // Validate UUID format
  const id = getRouterParam(event, 'id')
  const parsed = uuidSchema.safeParse(id)
  if (!parsed.success) throw Errors.badRequest('Invalid profile ID (must be UUID)')

  // Then check DB
  if (!db) throw Errors.serviceUnavailable('Database not available')

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, parsed.data)).limit(1)
  if (!profile) throw Errors.notFound('Profile not found')

  return profile
})
