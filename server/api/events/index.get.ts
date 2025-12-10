/**
 * GET /api/events
 *
 * List published events with pagination and multilingual support.
 *
 * Query params:
 * - lang: Language code (en, es, de, fr) - defaults to 'en'
 * - filter: 'upcoming' | 'past' | 'all' - defaults to 'upcoming'
 * - page: Page number (default 1)
 * - limit: Items per page (default 20, max 100)
 *
 * Response includes:
 * - Event metadata (slug, type, dates, location, price, etc.)
 * - Translated content (title, description) in requested language
 * - isFallback: true if content fell back to English
 *
 * Uses COALESCE subqueries for language fallback:
 * 1. Try to get content in requested language
 * 2. Fall back to English if not available
 */

import { and, count, desc, eq, gt, lte, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../database'
import { events, supportedLanguages } from '../../database/schema'
import { createPaginationInfo, definePaginatedApiHandler, Errors } from '../../lib'
import { paginationSchema } from '../../utils/validation'

// Extended query schema with filter and language
const eventsQuerySchema = paginationSchema.extend({
  filter: z.enum(['upcoming', 'past', 'all']).default('upcoming'),
  lang: z.enum(supportedLanguages).default('en'),
})

// Default language for fallback
const DEFAULT_LANG = 'en'

export default definePaginatedApiHandler(async (event) => {
  const { page, limit, filter, lang } = eventsQuerySchema.parse(getQuery(event))

  if (!db) throw Errors.serviceUnavailable('Database not available')

  const offset = (page - 1) * limit
  const now = new Date()

  // Build where condition based on filter
  const baseCondition =
    filter === 'upcoming'
      ? and(eq(events.status, 'published'), gt(events.startsAt, now))
      : filter === 'past'
        ? and(eq(events.status, 'published'), lte(events.startsAt, now))
        : eq(events.status, 'published')

  // Query with COALESCE for language fallback
  // Note: Using raw SQL for subqueries because Drizzle doesn't interpolate column refs properly
  const result = await db
    .select({
      // Event fields
      id: events.id,
      slug: events.slug,
      type: events.type,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      host: events.host,
      location: events.location,
      bannerUrl: events.bannerUrl,
      usdPrice: events.usdPrice,
      capacity: events.capacity,
      // Content fields with fallback
      title: sql<string>`COALESCE(
        (SELECT title FROM event_content WHERE event_id = events.id AND lang = ${lang}),
        (SELECT title FROM event_content WHERE event_id = events.id AND lang = ${DEFAULT_LANG})
      )`.as('title'),
      description: sql<string>`COALESCE(
        (SELECT description FROM event_content WHERE event_id = events.id AND lang = ${lang}),
        (SELECT description FROM event_content WHERE event_id = events.id AND lang = ${DEFAULT_LANG})
      )`.as('description'),
      // Language info
      lang: sql<string>`COALESCE(
        (SELECT lang FROM event_content WHERE event_id = events.id AND lang = ${lang}),
        (SELECT lang FROM event_content WHERE event_id = events.id AND lang = ${DEFAULT_LANG})
      )`.as('content_lang'),
      // Fallback indicator
      isFallback: sql<boolean>`NOT EXISTS (
        SELECT 1 FROM event_content WHERE event_id = events.id AND lang = ${lang}
      )`.as('is_fallback'),
    })
    .from(events)
    .where(
      and(
        baseCondition,
        // Exclude events with no content at all
        sql`EXISTS (SELECT 1 FROM event_content WHERE event_id = events.id)`
      )
    )
    .orderBy(filter === 'past' ? desc(events.startsAt) : events.startsAt)
    .limit(limit)
    .offset(offset)

  // Count total for pagination (only events with content)
  const countResult = await db
    .select({ total: count() })
    .from(events)
    .where(and(baseCondition, sql`EXISTS (SELECT 1 FROM event_content WHERE event_id = events.id)`))

  const total = countResult[0]?.total ?? 0
  const pagination = createPaginationInfo(total, page, limit)

  // Transform result to match expected shape
  const eventsWithContent = result.map((row) => ({
    id: row.id,
    slug: row.slug,
    type: row.type,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    host: row.host,
    location: row.location,
    bannerUrl: row.bannerUrl,
    usdPrice: row.usdPrice,
    capacity: row.capacity,
    title: row.title,
    description: row.description,
    lang: row.lang,
    isFallback: row.isFallback,
  }))

  return [eventsWithContent, pagination]
})
