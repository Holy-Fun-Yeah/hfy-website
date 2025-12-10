/**
 * GET /api/events/[id]
 *
 * Get a single event by ID or slug with full content.
 *
 * Query params:
 * - lang: Language code (en, es, de, fr) - defaults to 'en'
 *
 * Response includes:
 * - Full event metadata
 * - Full translated content (title, description, detail) in requested language
 * - isFallback: true if content fell back to English
 * - availableLanguages: array of languages this event has content in
 *
 * Uses language fallback: tries requested lang, falls back to English.
 */

import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../database'
import { eventContent, events, supportedLanguages } from '../../database/schema'
import { defineApiHandler, Errors } from '../../lib'

// UUID v4 regex pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Slug validation
const slugSchema = z.string().min(1, 'ID or slug is required').max(200)

const querySchema = z.object({
  lang: z.enum(supportedLanguages).default('en'),
})

// Default language for fallback
const DEFAULT_LANG = 'en'

export default defineApiHandler(async (event) => {
  const idOrSlug = getRouterParam(event, 'id')
  const parsedIdOrSlug = slugSchema.safeParse(idOrSlug)
  if (!parsedIdOrSlug.success) {
    throw Errors.badRequest('Event ID or slug is required')
  }

  const { lang } = querySchema.parse(getQuery(event))

  if (!db) throw Errors.serviceUnavailable('Database not available')

  // Determine if param is UUID or slug
  const isUUID = UUID_REGEX.test(parsedIdOrSlug.data)

  // Get the event
  const [eventResult] = await db
    .select({
      id: events.id,
      slug: events.slug,
      type: events.type,
      status: events.status,
      startsAt: events.startsAt,
      endsAt: events.endsAt,
      host: events.host,
      location: events.location,
      address: events.address,
      googleMapsUrl: events.googleMapsUrl,
      capacity: events.capacity,
      usdPrice: events.usdPrice,
      bannerUrl: events.bannerUrl,
      createdAt: events.createdAt,
      updatedAt: events.updatedAt,
    })
    .from(events)
    .where(isUUID ? eq(events.id, parsedIdOrSlug.data) : eq(events.slug, parsedIdOrSlug.data))
    .limit(1)

  if (!eventResult) {
    throw Errors.notFound('Event not found')
  }

  // Only return published events (or allow draft preview for admins in the future)
  if (eventResult.status !== 'published') {
    throw Errors.notFound('Event not found')
  }

  // Get content in requested language
  const [requestedContent] = await db
    .select({
      title: eventContent.title,
      description: eventContent.description,
      detail: eventContent.detail,
      lang: eventContent.lang,
    })
    .from(eventContent)
    .where(and(eq(eventContent.eventId, eventResult.id), eq(eventContent.lang, lang)))
    .limit(1)

  // If not found in requested language, try fallback
  let content = requestedContent
  let isFallback = false

  if (!content && lang !== DEFAULT_LANG) {
    const [fallbackContentResult] = await db
      .select({
        title: eventContent.title,
        description: eventContent.description,
        detail: eventContent.detail,
        lang: eventContent.lang,
      })
      .from(eventContent)
      .where(and(eq(eventContent.eventId, eventResult.id), eq(eventContent.lang, DEFAULT_LANG)))
      .limit(1)

    content = fallbackContentResult
    isFallback = true
  }

  // If no content at all, event is incomplete
  if (!content) {
    throw Errors.notFound('Event content not available')
  }

  // Get all available languages for this event (for language switcher UI)
  const availableLangsResult = await db
    .select({ lang: eventContent.lang })
    .from(eventContent)
    .where(eq(eventContent.eventId, eventResult.id))

  const availableLanguages = availableLangsResult.map((r) => r.lang)

  return {
    // Event metadata
    id: eventResult.id,
    slug: eventResult.slug,
    type: eventResult.type,
    status: eventResult.status,
    startsAt: eventResult.startsAt,
    endsAt: eventResult.endsAt,
    host: eventResult.host,
    location: eventResult.location,
    address: eventResult.address,
    googleMapsUrl: eventResult.googleMapsUrl,
    capacity: eventResult.capacity,
    usdPrice: eventResult.usdPrice,
    bannerUrl: eventResult.bannerUrl,
    createdAt: eventResult.createdAt,
    updatedAt: eventResult.updatedAt,
    // Content
    title: content.title,
    description: content.description,
    detail: content.detail,
    // Language info
    lang: content.lang,
    isFallback,
    availableLanguages,
  }
})
