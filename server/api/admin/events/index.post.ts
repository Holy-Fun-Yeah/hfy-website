/**
 * POST /api/admin/events
 *
 * Create or update an event with all language content.
 * Admin-only endpoint.
 *
 * Upsert behavior:
 * - If `id` is provided: Update existing event
 * - If `id` is omitted: Create new event
 *
 * Request body must include content for ALL supported languages.
 * Frontend is responsible for translations before submission.
 *
 * Uses database transaction for atomicity:
 * 1. Upsert event record
 * 2. Upsert all 4 language content records
 */

import { and, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '../../../database'
import {
  eventContent,
  events,
  supportedLanguages,
  type SupportedLanguage,
} from '../../../database/schema'
import { defineApiHandler, Errors } from '../../../lib'
import { requireAdmin } from '../../../utils/auth'

// Content schema for a single language
const langContentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(500),
  detail: z.string().min(1, 'Detail is required'),
})

// Build content schema requiring all supported languages
const contentSchema = z.object(
  Object.fromEntries(supportedLanguages.map((lang) => [lang, langContentSchema])) as {
    [K in (typeof supportedLanguages)[number]]: typeof langContentSchema
  }
)

// Main request schema
const upsertEventSchema = z.object({
  id: z.string().uuid().optional(), // Omit for create, include for update
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  type: z.enum(['online', 'in_person']),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  host: z.string().min(1, 'Host is required').max(100),
  location: z.string().min(1, 'Location is required').max(200),
  address: z.string().max(300).optional().nullable(),
  googleMapsUrl: z.string().url().optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  usdPrice: z.string().default('0'),
  bannerUrl: z.string().url().optional().nullable(),
  content: contentSchema,
})

export default defineApiHandler(async (event) => {
  // Require admin access
  await requireAdmin(event)

  // Validate request body
  const body = await readBody(event)
  const parsed = upsertEventSchema.safeParse(body)

  if (!parsed.success) {
    throw Errors.validation(
      parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    )
  }

  const {
    id,
    slug,
    type,
    status,
    startsAt,
    endsAt,
    host,
    location,
    address,
    googleMapsUrl,
    capacity,
    usdPrice,
    bannerUrl,
    content,
  } = parsed.data

  // Validate dates
  if (endsAt <= startsAt) {
    throw Errors.validation('End date must be after start date')
  }

  if (!db) {
    throw Errors.serviceUnavailable('Database not available')
  }

  // Check for slug conflict (different event with same slug)
  const existingWithSlug = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.slug, slug))
    .limit(1)

  if (existingWithSlug.length > 0 && existingWithSlug[0]?.id !== id) {
    throw Errors.conflict(`An event with slug "${slug}" already exists`)
  }

  // If updating, verify event exists
  if (id) {
    const existing = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.id, id))
      .limit(1)

    if (existing.length === 0) {
      throw Errors.notFound(`Event with id ${id} not found`)
    }
  }

  // Execute upsert in a transaction
  const result = await db.transaction(async (tx) => {
    let eventId: string

    if (id) {
      // Update existing event
      const [updated] = await tx
        .update(events)
        .set({
          slug,
          type,
          status,
          startsAt,
          endsAt,
          host,
          location,
          address: address ?? null,
          googleMapsUrl: googleMapsUrl ?? null,
          capacity: capacity ?? null,
          usdPrice,
          bannerUrl: bannerUrl ?? null,
          updatedAt: new Date(),
        })
        .where(eq(events.id, id))
        .returning()

      if (!updated) {
        throw Errors.internal('Failed to update event')
      }

      eventId = updated.id
    } else {
      // Create new event
      const [created] = await tx
        .insert(events)
        .values({
          slug,
          type,
          status,
          startsAt,
          endsAt,
          host,
          location,
          address: address ?? null,
          googleMapsUrl: googleMapsUrl ?? null,
          capacity: capacity ?? null,
          usdPrice,
          bannerUrl: bannerUrl ?? null,
        })
        .returning()

      if (!created) {
        throw Errors.internal('Failed to create event')
      }

      eventId = created.id
    }

    // Upsert content for all languages
    const contentResults: Record<string, { title: string; description: string; isNew: boolean }> =
      {}

    for (const lang of supportedLanguages) {
      const langContent = content[lang]

      // Check if content exists for this specific language
      const [existingForThisLang] = await tx
        .select({ id: eventContent.id })
        .from(eventContent)
        .where(and(eq(eventContent.eventId, eventId), eq(eventContent.lang, lang)))
        .limit(1)

      if (existingForThisLang) {
        // Update existing
        await tx
          .update(eventContent)
          .set({
            title: langContent.title,
            description: langContent.description,
            detail: langContent.detail,
            updatedAt: new Date(),
          })
          .where(eq(eventContent.id, existingForThisLang.id))

        contentResults[lang] = {
          title: langContent.title,
          description: langContent.description,
          isNew: false,
        }
      } else {
        // Insert new
        await tx.insert(eventContent).values({
          eventId,
          lang: lang as SupportedLanguage,
          title: langContent.title,
          description: langContent.description,
          detail: langContent.detail,
        })

        contentResults[lang] = {
          title: langContent.title,
          description: langContent.description,
          isNew: true,
        }
      }
    }

    // Fetch the complete event with all content
    const [finalEvent] = await tx.select().from(events).where(eq(events.id, eventId)).limit(1)

    if (!finalEvent) {
      throw Errors.internal('Failed to fetch created event')
    }

    const finalContent = await tx
      .select()
      .from(eventContent)
      .where(eq(eventContent.eventId, eventId))

    return {
      event: finalEvent,
      content: finalContent,
      contentResults,
    }
  })

  // Format response
  const contentByLang = Object.fromEntries(
    result.content.map((c) => [
      c.lang,
      {
        title: c.title,
        description: c.description,
        detail: c.detail,
        isNew: result.contentResults[c.lang]?.isNew ?? false,
      },
    ])
  )

  return {
    message: id ? 'Event updated successfully' : 'Event created successfully',
    event: {
      id: result.event.id,
      slug: result.event.slug,
      type: result.event.type,
      status: result.event.status,
      startsAt: result.event.startsAt,
      endsAt: result.event.endsAt,
      host: result.event.host,
      location: result.event.location,
      address: result.event.address,
      googleMapsUrl: result.event.googleMapsUrl,
      capacity: result.event.capacity,
      usdPrice: result.event.usdPrice,
      bannerUrl: result.event.bannerUrl,
      createdAt: result.event.createdAt,
      updatedAt: result.event.updatedAt,
    },
    content: contentByLang,
  }
})
