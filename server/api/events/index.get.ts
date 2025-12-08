import { and, count, desc, eq, gt, lte } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../database'
import { events } from '../../database/schema'
import { createPaginationInfo, definePaginatedApiHandler, Errors } from '../../lib'
import { paginationSchema } from '../../utils/validation'

// Extended query schema with filter
const eventsQuerySchema = paginationSchema.extend({
  filter: z.enum(['upcoming', 'past', 'all']).default('upcoming'),
})

export default definePaginatedApiHandler(async (event) => {
  const { page, limit, filter } = eventsQuerySchema.parse(getQuery(event))

  if (!db) throw Errors.serviceUnavailable('Database not available')

  const offset = (page - 1) * limit
  const now = new Date()

  // Build where condition based on filter
  const whereCondition =
    filter === 'upcoming'
      ? and(eq(events.status, 'published'), gt(events.startsAt, now))
      : filter === 'past'
        ? and(eq(events.status, 'published'), lte(events.startsAt, now))
        : eq(events.status, 'published')

  // Query with only card-relevant fields
  const result = await db
    .select({
      id: events.id,
      slug: events.slug,
      title: events.title,
      description: events.description,
      type: events.type,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      location: events.location,
      bannerUrl: events.bannerUrl,
      usdPrice: events.usdPrice,
      capacity: events.capacity,
    })
    .from(events)
    .where(whereCondition)
    .orderBy(filter === 'past' ? desc(events.startsAt) : events.startsAt)
    .limit(limit)
    .offset(offset)

  // Count total for pagination
  const countResult = await db.select({ total: count() }).from(events).where(whereCondition)

  const total = countResult[0]?.total ?? 0
  const pagination = createPaginationInfo(total, page, limit)

  return [result, pagination]
})
