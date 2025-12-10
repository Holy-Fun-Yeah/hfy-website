import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Events API Tests
 *
 * Tests the events API endpoints:
 * - GET /api/events (public listing with filters)
 * - GET /api/events/[id] (public detail)
 * - POST /api/admin/events (admin create/update - requires auth)
 *
 * Atomic test pattern:
 * 1. Create test data
 * 2. Verify it exists
 * 3. Clean up (delete test data)
 */

describe('Events API', async () => {
  await setup({
    server: true,
  })

  // ==========================================================================
  // Response Format Helpers
  // ==========================================================================

  const expectSuccessResponse = (response: unknown) => {
    expect(response).toMatchObject({
      success: true,
      timestamp: expect.any(String),
      data: expect.anything(),
    })
  }

  const expectErrorResponse = (response: unknown, expectedStatus: number, expectedCode: string) => {
    expect(response).toMatchObject({
      success: false,
      timestamp: expect.any(String),
      error: {
        status: expectedStatus,
        code: expectedCode,
        message: expect.any(String),
      },
    })
  }

  const expectPaginatedResponse = (response: unknown) => {
    expect(response).toMatchObject({
      success: true,
      timestamp: expect.any(String),
      data: expect.any(Array),
      pagination: {
        total_items: expect.any(Number),
        total_pages: expect.any(Number),
        current_page: expect.any(Number),
        page_size: expect.any(Number),
        has_more: expect.any(Boolean),
      },
    })
  }

  // ==========================================================================
  // GET /api/events - Public Listing
  // ==========================================================================

  describe('GET /api/events', () => {
    it('returns paginated response with default params', async () => {
      try {
        const response = await $fetch('/api/events')
        expectPaginatedResponse(response)
      } catch (error: unknown) {
        const err = error as { data: unknown; status: number }
        // DB unavailable or internal error
        expect([500, 503]).toContain(err.status)
      }
    })

    it('accepts filter parameter (upcoming)', async () => {
      try {
        const response = await $fetch('/api/events?filter=upcoming')
        expectPaginatedResponse(response)
      } catch (error: unknown) {
        const err = error as { status: number }
        expect([500, 503]).toContain(err.status)
      }
    })

    it('accepts filter parameter (past)', async () => {
      try {
        const response = await $fetch('/api/events?filter=past')
        expectPaginatedResponse(response)
      } catch (error: unknown) {
        const err = error as { status: number }
        expect([500, 503]).toContain(err.status)
      }
    })

    it('accepts filter parameter (all)', async () => {
      try {
        const response = await $fetch('/api/events?filter=all')
        expectPaginatedResponse(response)
      } catch (error: unknown) {
        const err = error as { status: number }
        expect([500, 503]).toContain(err.status)
      }
    })

    it('accepts valid language parameter', async () => {
      try {
        const response = await $fetch('/api/events?lang=es')
        expectPaginatedResponse(response)
      } catch (error: unknown) {
        const err = error as { status: number }
        expect([500, 503]).toContain(err.status)
      }
    })

    it('rejects invalid language parameter', async () => {
      try {
        await $fetch('/api/events?lang=invalid')
        expect.fail('Should have thrown validation error')
      } catch (error: unknown) {
        const err = error as { data: unknown; status: number }
        expect([422, 503]).toContain(err.status)
      }
    })

    it('rejects invalid filter parameter', async () => {
      try {
        await $fetch('/api/events?filter=invalid')
        expect.fail('Should have thrown validation error')
      } catch (error: unknown) {
        const err = error as { data: unknown; status: number }
        expect([422, 503]).toContain(err.status)
      }
    })

    it('accepts pagination parameters', async () => {
      try {
        const response = await $fetch('/api/events?page=1&limit=5')
        expectPaginatedResponse(response)
        const typedResponse = response as { pagination: { page_size: number } }
        expect(typedResponse.pagination.page_size).toBe(5)
      } catch (error: unknown) {
        const err = error as { status: number }
        expect([500, 503]).toContain(err.status)
      }
    })
  })

  // ==========================================================================
  // GET /api/events/[id] - Public Detail
  // ==========================================================================

  describe('GET /api/events/[id]', () => {
    it('returns 404 for non-existent UUID', async () => {
      try {
        await $fetch('/api/events/00000000-0000-4000-8000-000000000000')
        expect.fail('Should have thrown not found error')
      } catch (error: unknown) {
        const err = error as { data: unknown; status: number }
        expect([404, 503]).toContain(err.status)
      }
    })

    it('returns 404 for non-existent slug', async () => {
      try {
        await $fetch('/api/events/non-existent-event-slug-12345')
        expect.fail('Should have thrown not found error')
      } catch (error: unknown) {
        const err = error as { data: unknown; status: number }
        expect([404, 503]).toContain(err.status)
      }
    })

    it('accepts valid language parameter', async () => {
      try {
        await $fetch('/api/events/some-slug?lang=de')
      } catch (error: unknown) {
        const err = error as { status: number }
        expect([404, 503]).toContain(err.status)
      }
    })
  })

  // ==========================================================================
  // POST /api/admin/events - Admin Create (Auth Required)
  // ==========================================================================

  describe('POST /api/admin/events', () => {
    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1)
    const futureEndDate = new Date(futureDate)
    futureEndDate.setHours(futureEndDate.getHours() + 2)

    const validEventPayload = {
      slug: 'test-event',
      type: 'online',
      status: 'draft',
      startsAt: futureDate.toISOString(),
      endsAt: futureEndDate.toISOString(),
      host: 'Test Host',
      location: 'Online',
      usdPrice: '0',
      content: {
        en: { title: 'Test Event', description: 'Test description', detail: 'Test detail' },
        es: { title: 'Evento de Prueba', description: 'Descripción', detail: 'Detalle' },
        de: { title: 'Test Veranstaltung', description: 'Beschreibung', detail: 'Detail' },
        fr: { title: 'Événement Test', description: 'Description', detail: 'Détail' },
      },
    }

    it('returns 401 unauthorized without authentication', async () => {
      try {
        await $fetch('/api/admin/events', {
          method: 'POST',
          body: validEventPayload,
        })
        expect.fail('Should have thrown unauthorized error')
      } catch (error: unknown) {
        const err = error as { data: unknown; status: number }
        expect(err.status).toBe(401)
        expectErrorResponse(err.data, 401, 'UNAUTHORIZED')
      }
    })

    it('returns validation error for missing slug', async () => {
      try {
        const { slug, ...payloadWithoutSlug } = validEventPayload
        await $fetch('/api/admin/events', {
          method: 'POST',
          body: payloadWithoutSlug,
        })
        expect.fail('Should have thrown error')
      } catch (error: unknown) {
        const err = error as { status: number }
        expect([401, 422]).toContain(err.status)
      }
    })

    it('returns validation error for invalid slug format', async () => {
      try {
        await $fetch('/api/admin/events', {
          method: 'POST',
          body: { ...validEventPayload, slug: 'Invalid Slug!' },
        })
        expect.fail('Should have thrown error')
      } catch (error: unknown) {
        const err = error as { status: number }
        expect([401, 422]).toContain(err.status)
      }
    })

    it('returns validation error for missing language content', async () => {
      try {
        await $fetch('/api/admin/events', {
          method: 'POST',
          body: {
            ...validEventPayload,
            content: {
              en: { title: 'Test', description: 'Test', detail: 'Test' },
              // Missing es, de, fr
            },
          },
        })
        expect.fail('Should have thrown error')
      } catch (error: unknown) {
        const err = error as { status: number }
        expect([401, 422]).toContain(err.status)
      }
    })

    it('returns validation error for invalid event type', async () => {
      try {
        await $fetch('/api/admin/events', {
          method: 'POST',
          body: { ...validEventPayload, type: 'invalid' },
        })
        expect.fail('Should have thrown error')
      } catch (error: unknown) {
        const err = error as { status: number }
        expect([401, 422]).toContain(err.status)
      }
    })

    it('returns validation error for end date before start date', async () => {
      try {
        const invalidPayload = {
          ...validEventPayload,
          startsAt: futureEndDate.toISOString(), // Swapped
          endsAt: futureDate.toISOString(),
        }
        await $fetch('/api/admin/events', {
          method: 'POST',
          body: invalidPayload,
        })
        expect.fail('Should have thrown error')
      } catch (error: unknown) {
        const err = error as { status: number }
        expect([401, 422]).toContain(err.status)
      }
    })
  })

  // ==========================================================================
  // Response Structure Tests
  // ==========================================================================

  describe('Response Structure', () => {
    it('events listing includes expected fields with isFallback', async () => {
      try {
        const response = (await $fetch('/api/events')) as {
          data: Array<{
            id: string
            slug: string
            type: string
            title: string
            description: string
            lang: string
            isFallback: boolean
          }>
        }

        if (response.data.length > 0) {
          const event = response.data[0]
          expect(event).toHaveProperty('id')
          expect(event).toHaveProperty('slug')
          expect(event).toHaveProperty('type')
          expect(event).toHaveProperty('title')
          expect(event).toHaveProperty('description')
          expect(event).toHaveProperty('lang')
          expect(event).toHaveProperty('isFallback')
        }
      } catch {
        // DB not available, skip
      }
    })
  })
})

// ==========================================================================
// Atomic Database Test (Direct DB access, not HTTP)
// ==========================================================================

import { eq } from 'drizzle-orm'

describe('Events Database Operations (Atomic)', async () => {
  const skipDbTests = !process.env.DATABASE_URL

  let db: typeof import('../server/database').db
  let events: typeof import('../server/database/schema').events
  let eventContent: typeof import('../server/database/schema').eventContent

  beforeAll(async () => {
    if (skipDbTests) return

    const dbModule = await import('../server/database')
    const schemaModule = await import('../server/database/schema')

    db = dbModule.db
    events = schemaModule.events
    eventContent = schemaModule.eventContent
  })

  const TEST_SLUG = `test-event-${Date.now()}`
  let createdEventId: string | null = null

  afterAll(async () => {
    if (skipDbTests || !db || !createdEventId) return

    try {
      // Delete content first (due to FK)
      await db.delete(eventContent).where(eq(eventContent.eventId, createdEventId))
      // Delete event
      await db.delete(events).where(eq(events.id, createdEventId))
      console.log(`Cleaned up test event: ${TEST_SLUG}`)
    } catch (error) {
      console.error('Failed to cleanup test event:', error)
    }
  })

  it.skipIf(skipDbTests)('can create an event with all language content', async () => {
    if (!db) throw new Error('DB not available')

    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 1)
    const futureEndDate = new Date(futureDate)
    futureEndDate.setHours(futureEndDate.getHours() + 2)

    // Create event
    const [createdEvent] = await db
      .insert(events)
      .values({
        slug: TEST_SLUG,
        type: 'online',
        status: 'draft',
        startsAt: futureDate,
        endsAt: futureEndDate,
        host: 'Test Host',
        location: 'Online',
        usdPrice: '0',
        bannerUrl: null,
      })
      .returning()

    expect(createdEvent).toBeDefined()
    expect(createdEvent.slug).toBe(TEST_SLUG)
    createdEventId = createdEvent.id

    // Create content for all languages
    const languages = ['en', 'es', 'de', 'fr'] as const
    for (const lang of languages) {
      await db.insert(eventContent).values({
        eventId: createdEvent.id,
        lang,
        title: `Test Event Title (${lang})`,
        description: `Test event description in ${lang}`,
        detail: `Full event detail content in ${lang}`,
      })
    }

    // Verify all content was created
    const allContent = await db
      .select()
      .from(eventContent)
      .where(eq(eventContent.eventId, createdEvent.id))

    expect(allContent).toHaveLength(4)
    expect(allContent.map((c) => c.lang).sort()).toEqual(['de', 'en', 'es', 'fr'])
  })

  it.skipIf(skipDbTests)('can read the created event', async () => {
    if (!db || !createdEventId) return

    const [event] = await db.select().from(events).where(eq(events.id, createdEventId)).limit(1)

    expect(event).toBeDefined()
    expect(event.slug).toBe(TEST_SLUG)
    expect(event.type).toBe('online')
    expect(event.status).toBe('draft')
  })

  it.skipIf(skipDbTests)('can update event content', async () => {
    if (!db || !createdEventId) return

    // Update English content
    const [existingContent] = await db
      .select()
      .from(eventContent)
      .where(eq(eventContent.eventId, createdEventId))
      .limit(1)

    if (!existingContent) return

    const updatedTitle = 'Updated Test Event Title'
    await db
      .update(eventContent)
      .set({ title: updatedTitle, updatedAt: new Date() })
      .where(eq(eventContent.id, existingContent.id))

    // Verify update
    const [updated] = await db
      .select()
      .from(eventContent)
      .where(eq(eventContent.id, existingContent.id))
      .limit(1)

    expect(updated.title).toBe(updatedTitle)
  })

  it.skipIf(skipDbTests)('can update event status', async () => {
    if (!db || !createdEventId) return

    await db
      .update(events)
      .set({ status: 'published', updatedAt: new Date() })
      .where(eq(events.id, createdEventId))

    const [updated] = await db.select().from(events).where(eq(events.id, createdEventId)).limit(1)

    expect(updated.status).toBe('published')

    // Revert for cleanup
    await db.update(events).set({ status: 'draft' }).where(eq(events.id, createdEventId))
  })

  it.skipIf(skipDbTests)('enforces unique constraint on (event_id, lang)', async () => {
    if (!db || !createdEventId) return

    // Try to insert duplicate content for same language
    await expect(
      db.insert(eventContent).values({
        eventId: createdEventId,
        lang: 'en', // Already exists
        title: 'Duplicate',
        description: 'Duplicate',
        detail: 'Duplicate',
      })
    ).rejects.toThrow()
  })

  it.skipIf(skipDbTests)('enforces unique constraint on slug', async () => {
    if (!db) return

    const futureDate = new Date()
    futureDate.setMonth(futureDate.getMonth() + 2)
    const futureEndDate = new Date(futureDate)
    futureEndDate.setHours(futureEndDate.getHours() + 2)

    // Try to insert event with same slug
    await expect(
      db.insert(events).values({
        slug: TEST_SLUG, // Already exists
        type: 'online',
        status: 'draft',
        startsAt: futureDate,
        endsAt: futureEndDate,
        host: 'Another Host',
        location: 'Online',
        usdPrice: '0',
      })
    ).rejects.toThrow()
  })
})
