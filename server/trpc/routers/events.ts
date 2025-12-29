/**
 * Events tRPC Router
 *
 * Provides type-safe API for events with caching.
 */

import { and, count, desc, eq, gt, lte, sql } from 'drizzle-orm'
import { z } from 'zod'

import { events, supportedLanguages } from '../../database/schema'
import { createPaginationInfo } from '../../lib'
import { publicProcedure, router } from '../trpc'

const DEFAULT_LANG = 'en'

// Input schemas
const listEventsInput = z.object({
  filter: z.enum(['upcoming', 'past', 'all']).default('upcoming'),
  lang: z.enum(supportedLanguages).default('en'),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
})

const getEventInput = z.object({
  slug: z.string().min(1),
  lang: z.enum(supportedLanguages).default('en'),
})

export const eventsRouter = router({
  /**
   * List published events with pagination, filtering, and multilingual support.
   */
  list: publicProcedure.input(listEventsInput).query(async ({ ctx, input }) => {
    const { filter, lang, page, limit } = input
    const { db } = ctx

    if (!db) {
      throw new Error('Database not available')
    }

    const offset = (page - 1) * limit
    const now = new Date()

    // Build where condition based on filter
    const baseCondition =
      filter === 'upcoming'
        ? and(eq(events.status, 'published'), gt(events.startsAt, now))
        : filter === 'past'
          ? and(eq(events.status, 'published'), lte(events.startsAt, now))
          : eq(events.status, 'published')

    const result = await db
      .select({
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
        title: sql<string>`COALESCE(
          (SELECT title FROM event_content WHERE event_id = events.id AND lang = ${lang}),
          (SELECT title FROM event_content WHERE event_id = events.id AND lang = ${DEFAULT_LANG})
        )`.as('title'),
        description: sql<string>`COALESCE(
          (SELECT description FROM event_content WHERE event_id = events.id AND lang = ${lang}),
          (SELECT description FROM event_content WHERE event_id = events.id AND lang = ${DEFAULT_LANG})
        )`.as('description'),
        lang: sql<string>`COALESCE(
          (SELECT lang FROM event_content WHERE event_id = events.id AND lang = ${lang}),
          (SELECT lang FROM event_content WHERE event_id = events.id AND lang = ${DEFAULT_LANG})
        )`.as('content_lang'),
        isFallback: sql<boolean>`NOT EXISTS (
          SELECT 1 FROM event_content WHERE event_id = events.id AND lang = ${lang}
        )`.as('is_fallback'),
      })
      .from(events)
      .where(
        and(baseCondition, sql`EXISTS (SELECT 1 FROM event_content WHERE event_id = events.id)`)
      )
      .orderBy(filter === 'past' ? desc(events.startsAt) : events.startsAt)
      .limit(limit)
      .offset(offset)

    // Count total
    const countResult = await db
      .select({ total: count() })
      .from(events)
      .where(
        and(baseCondition, sql`EXISTS (SELECT 1 FROM event_content WHERE event_id = events.id)`)
      )

    const total = countResult[0]?.total ?? 0
    const pagination = createPaginationInfo(total, page, limit)

    return {
      data: result.map((row) => ({
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
      })),
      pagination,
    }
  }),

  /**
   * Get a single event by slug with full content.
   */
  bySlug: publicProcedure.input(getEventInput).query(async ({ ctx, input }) => {
    const { slug, lang } = input
    const { db } = ctx

    if (!db) {
      throw new Error('Database not available')
    }

    const result = await db
      .select({
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
        title: sql<string>`COALESCE(
          (SELECT title FROM event_content WHERE event_id = events.id AND lang = ${lang}),
          (SELECT title FROM event_content WHERE event_id = events.id AND lang = ${DEFAULT_LANG})
        )`.as('title'),
        description: sql<string>`COALESCE(
          (SELECT description FROM event_content WHERE event_id = events.id AND lang = ${lang}),
          (SELECT description FROM event_content WHERE event_id = events.id AND lang = ${DEFAULT_LANG})
        )`.as('description'),
        lang: sql<string>`COALESCE(
          (SELECT lang FROM event_content WHERE event_id = events.id AND lang = ${lang}),
          (SELECT lang FROM event_content WHERE event_id = events.id AND lang = ${DEFAULT_LANG})
        )`.as('content_lang'),
        isFallback: sql<boolean>`NOT EXISTS (
          SELECT 1 FROM event_content WHERE event_id = events.id AND lang = ${lang}
        )`.as('is_fallback'),
      })
      .from(events)
      .where(and(eq(events.slug, slug), eq(events.status, 'published')))
      .limit(1)

    if (!result[0]) {
      return null
    }

    return {
      id: result[0].id,
      slug: result[0].slug,
      type: result[0].type,
      startsAt: result[0].startsAt,
      endsAt: result[0].endsAt,
      host: result[0].host,
      location: result[0].location,
      bannerUrl: result[0].bannerUrl,
      usdPrice: result[0].usdPrice,
      capacity: result[0].capacity,
      title: result[0].title,
      description: result[0].description,
      lang: result[0].lang,
      isFallback: result[0].isFallback,
    }
  }),
})
