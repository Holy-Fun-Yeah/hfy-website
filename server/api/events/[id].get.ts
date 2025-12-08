import { eq } from 'drizzle-orm'

import { db } from '../../database'
import { events } from '../../database/schema'
import { defineApiHandler, Errors } from '../../lib'

// UUID v4 regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export default defineApiHandler(async (event) => {
  const idOrSlug = getRouterParam(event, 'id')
  if (!idOrSlug) throw Errors.badRequest('Event ID or slug is required')

  if (!db) throw Errors.serviceUnavailable('Database not available')

  // Determine if param is UUID or slug
  const isUUID = UUID_REGEX.test(idOrSlug)

  // Query by id or slug, only published events
  const [result] = await db
    .select()
    .from(events)
    .where(isUUID ? eq(events.id, idOrSlug) : eq(events.slug, idOrSlug))
    .limit(1)

  if (!result) throw Errors.notFound('Event not found')

  // Only return published events (or allow draft preview with query param in the future)
  if (result.status !== 'published') {
    throw Errors.notFound('Event not found')
  }

  return result
})
