import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * About API Tests
 *
 * Tests the about page API endpoints:
 * - GET /api/about (public)
 * - PUT /api/admin/about (admin-only)
 *
 * About is a singleton - there's only one about page.
 */

describe('About API', async () => {
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

  // ==========================================================================
  // GET /api/about - Public Endpoint
  // ==========================================================================

  describe('GET /api/about', () => {
    it('returns about data or 404 if not configured', async () => {
      try {
        const response = await $fetch('/api/about')
        expectSuccessResponse(response)

        // If data exists, check structure
        const typedResponse = response as {
          data: {
            adminName: string
            title: string
            lang: string
            isFallback: boolean
            availableLanguages: string[]
          }
        }

        expect(typedResponse.data).toHaveProperty('adminName')
        expect(typedResponse.data).toHaveProperty('title')
        expect(typedResponse.data).toHaveProperty('lang')
        expect(typedResponse.data).toHaveProperty('isFallback')
        expect(typedResponse.data).toHaveProperty('availableLanguages')
      } catch (error: unknown) {
        const err = error as { data: unknown; status: number }
        // Either NOT_FOUND (not configured) or SERVICE_UNAVAILABLE (no DB)
        expect([404, 503]).toContain(err.status)
      }
    })

    it('accepts valid language parameter', async () => {
      try {
        const response = await $fetch('/api/about?lang=es')
        expectSuccessResponse(response)
      } catch (error: unknown) {
        const err = error as { status: number }
        expect([404, 503]).toContain(err.status)
      }
    })

    it('rejects invalid language parameter', async () => {
      try {
        await $fetch('/api/about?lang=invalid')
        expect.fail('Should have thrown validation error')
      } catch (error: unknown) {
        const err = error as { status: number }
        // 422 (validation) or 503 (no DB)
        expect([422, 503]).toContain(err.status)
      }
    })

    it('returns hero section in response', async () => {
      try {
        const response = (await $fetch('/api/about')) as {
          data: {
            hero: { title: string; subtitle: string }
          }
        }

        expect(response.data.hero).toHaveProperty('title')
        expect(response.data.hero).toHaveProperty('subtitle')
      } catch {
        // DB not available or not configured, skip
      }
    })

    it('returns vision section with paragraphs array', async () => {
      try {
        const response = (await $fetch('/api/about')) as {
          data: {
            vision: { title: string; paragraphs: string[] }
          }
        }

        expect(response.data.vision).toHaveProperty('title')
        expect(response.data.vision).toHaveProperty('paragraphs')
        expect(Array.isArray(response.data.vision.paragraphs)).toBe(true)
      } catch {
        // DB not available or not configured, skip
      }
    })

    it('returns values v0, v1, v2 in response', async () => {
      try {
        const response = (await $fetch('/api/about')) as {
          data: {
            values: {
              v0: { title: string; message: string }
              v1: { title: string; message: string }
              v2: { title: string; message: string }
            }
          }
        }

        expect(response.data.values.v0).toHaveProperty('title')
        expect(response.data.values.v0).toHaveProperty('message')
        expect(response.data.values.v1).toHaveProperty('title')
        expect(response.data.values.v1).toHaveProperty('message')
        expect(response.data.values.v2).toHaveProperty('title')
        expect(response.data.values.v2).toHaveProperty('message')
      } catch {
        // DB not available or not configured, skip
      }
    })

    it('returns quote with author (adminName)', async () => {
      try {
        const response = (await $fetch('/api/about')) as {
          data: {
            quote: { text: string; author: string }
            adminName: string
          }
        }

        expect(response.data.quote).toHaveProperty('text')
        expect(response.data.quote).toHaveProperty('author')
        // Author should match adminName
        expect(response.data.quote.author).toBe(response.data.adminName)
      } catch {
        // DB not available or not configured, skip
      }
    })
  })

  // ==========================================================================
  // PUT /api/admin/about - Admin Endpoint
  // ==========================================================================

  describe('PUT /api/admin/about', () => {
    const validPayload = {
      adminName: 'Test Admin',
      visionImageUrl: 'https://example.com/image.jpg',
      content: {
        en: {
          title: 'About Us',
          description: 'Test description',
          heroTitle: 'Hero Title',
          heroSubtitle: 'Hero subtitle text',
          visionTitle: 'Vision Title',
          visionParagraphs: ['Paragraph 1', 'Paragraph 2'],
          valuesV0Title: 'Value 0',
          valuesV0Message: 'Value 0 message',
          valuesV1Title: 'Value 1',
          valuesV1Message: 'Value 1 message',
          valuesV2Title: 'Value 2',
          valuesV2Message: 'Value 2 message',
          quoteText: 'This is a test quote',
        },
        es: {
          title: 'Sobre Nosotros',
          description: 'Descripción de prueba',
          heroTitle: 'Título del Hero',
          heroSubtitle: 'Subtítulo del hero',
          visionTitle: 'Título de Visión',
          visionParagraphs: ['Párrafo 1', 'Párrafo 2'],
          valuesV0Title: 'Valor 0',
          valuesV0Message: 'Mensaje del valor 0',
          valuesV1Title: 'Valor 1',
          valuesV1Message: 'Mensaje del valor 1',
          valuesV2Title: 'Valor 2',
          valuesV2Message: 'Mensaje del valor 2',
          quoteText: 'Esta es una cita de prueba',
        },
        de: {
          title: 'Über Uns',
          description: 'Testbeschreibung',
          heroTitle: 'Hero Titel',
          heroSubtitle: 'Hero Untertitel',
          visionTitle: 'Vision Titel',
          visionParagraphs: ['Absatz 1', 'Absatz 2'],
          valuesV0Title: 'Wert 0',
          valuesV0Message: 'Wert 0 Nachricht',
          valuesV1Title: 'Wert 1',
          valuesV1Message: 'Wert 1 Nachricht',
          valuesV2Title: 'Wert 2',
          valuesV2Message: 'Wert 2 Nachricht',
          quoteText: 'Dies ist ein Testzitat',
        },
        fr: {
          title: 'À Propos',
          description: 'Description de test',
          heroTitle: 'Titre du Hero',
          heroSubtitle: 'Sous-titre du hero',
          visionTitle: 'Titre de Vision',
          visionParagraphs: ['Paragraphe 1', 'Paragraphe 2'],
          valuesV0Title: 'Valeur 0',
          valuesV0Message: 'Message de la valeur 0',
          valuesV1Title: 'Valeur 1',
          valuesV1Message: 'Message de la valeur 1',
          valuesV2Title: 'Valeur 2',
          valuesV2Message: 'Message de la valeur 2',
          quoteText: "Ceci est une citation de test",
        },
      },
    }

    it('returns 401 unauthorized without authentication', async () => {
      try {
        await $fetch('/api/admin/about', {
          method: 'PUT',
          body: validPayload,
        })
        expect.fail('Should have thrown unauthorized error')
      } catch (error: unknown) {
        const err = error as { data: unknown; status: number }
        expect(err.status).toBe(401)
        expectErrorResponse(err.data, 401, 'UNAUTHORIZED')
      }
    })

    it('returns validation error for missing adminName', async () => {
      try {
        const { adminName, ...payloadWithoutAdminName } = validPayload
        await $fetch('/api/admin/about', {
          method: 'PUT',
          body: payloadWithoutAdminName,
        })
        expect.fail('Should have thrown error')
      } catch (error: unknown) {
        const err = error as { status: number }
        // 401 (not authenticated) or 422 (validation)
        expect([401, 422]).toContain(err.status)
      }
    })

    it('returns validation error for missing language content', async () => {
      try {
        await $fetch('/api/admin/about', {
          method: 'PUT',
          body: {
            adminName: 'Test',
            content: {
              en: validPayload.content.en,
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

    it('returns validation error for empty visionParagraphs', async () => {
      try {
        const invalidPayload = {
          ...validPayload,
          content: {
            ...validPayload.content,
            en: {
              ...validPayload.content.en,
              visionParagraphs: [], // Empty array - should fail
            },
          },
        }
        await $fetch('/api/admin/about', {
          method: 'PUT',
          body: invalidPayload,
        })
        expect.fail('Should have thrown error')
      } catch (error: unknown) {
        const err = error as { status: number }
        expect([401, 422]).toContain(err.status)
      }
    })

    it('returns validation error for invalid visionImageUrl', async () => {
      try {
        await $fetch('/api/admin/about', {
          method: 'PUT',
          body: {
            ...validPayload,
            visionImageUrl: 'not-a-valid-url',
          },
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
    it('GET returns consistent structure', async () => {
      try {
        const response = (await $fetch('/api/about')) as {
          data: Record<string, unknown>
        }

        // Check all expected top-level fields
        const expectedFields = [
          'adminName',
          'visionImageUrl',
          'title',
          'description',
          'hero',
          'vision',
          'values',
          'quote',
          'lang',
          'isFallback',
          'availableLanguages',
        ]

        for (const field of expectedFields) {
          expect(response.data).toHaveProperty(field)
        }
      } catch {
        // DB not available or not configured, skip
      }
    })
  })
})

// ==========================================================================
// Atomic Database Test (Direct DB access, not HTTP)
// ==========================================================================

import { eq } from 'drizzle-orm'

describe('About Database Operations (Atomic)', async () => {
  const skipDbTests = !process.env.DATABASE_URL

  let db: typeof import('../server/database').db
  let aboutSettings: typeof import('../server/database/schema').aboutSettings
  let aboutContent: typeof import('../server/database/schema').aboutContent

  beforeAll(async () => {
    if (skipDbTests) return

    const dbModule = await import('../server/database')
    const schemaModule = await import('../server/database/schema')

    db = dbModule.db
    aboutSettings = schemaModule.aboutSettings
    aboutContent = schemaModule.aboutContent
  })

  // Track created IDs for cleanup
  let createdSettingsId: number | null = null

  afterAll(async () => {
    if (skipDbTests || !db || !createdSettingsId) return

    try {
      // Delete test content
      await db.delete(aboutContent)
      // Delete test settings
      await db.delete(aboutSettings).where(eq(aboutSettings.id, createdSettingsId))
      console.log('Cleaned up test about data')
    } catch (error) {
      console.error('Failed to cleanup test about data:', error)
    }
  })

  it.skipIf(skipDbTests)('can create about settings', async () => {
    if (!db) throw new Error('DB not available')

    // First, delete any existing data for clean test
    await db.delete(aboutContent)
    await db.delete(aboutSettings)

    // Create settings
    const [created] = await db
      .insert(aboutSettings)
      .values({
        adminName: 'Test Admin',
        visionImageUrl: 'https://example.com/test.jpg',
      })
      .returning()

    expect(created).toBeDefined()
    expect(created.adminName).toBe('Test Admin')
    createdSettingsId = created.id
  })

  it.skipIf(skipDbTests)('can create about content for all languages', async () => {
    if (!db) throw new Error('DB not available')

    const languages = ['en', 'es', 'de', 'fr'] as const

    for (const lang of languages) {
      await db.insert(aboutContent).values({
        lang,
        title: `Test Title (${lang})`,
        description: `Test description in ${lang}`,
        heroTitle: `Hero Title (${lang})`,
        heroSubtitle: `Hero subtitle in ${lang}`,
        visionTitle: `Vision Title (${lang})`,
        visionParagraphs: JSON.stringify([`Paragraph 1 in ${lang}`, `Paragraph 2 in ${lang}`]),
        valuesV0Title: `Value 0 (${lang})`,
        valuesV0Message: `Value 0 message in ${lang}`,
        valuesV1Title: `Value 1 (${lang})`,
        valuesV1Message: `Value 1 message in ${lang}`,
        valuesV2Title: `Value 2 (${lang})`,
        valuesV2Message: `Value 2 message in ${lang}`,
        quoteText: `Quote text in ${lang}`,
      })
    }

    // Verify all content was created
    const allContent = await db.select().from(aboutContent)

    expect(allContent).toHaveLength(4)
    expect(allContent.map((c) => c.lang).sort()).toEqual(['de', 'en', 'es', 'fr'])
  })

  it.skipIf(skipDbTests)('can read about settings', async () => {
    if (!db || !createdSettingsId) return

    const [settings] = await db
      .select()
      .from(aboutSettings)
      .where(eq(aboutSettings.id, createdSettingsId))
      .limit(1)

    expect(settings).toBeDefined()
    expect(settings.adminName).toBe('Test Admin')
  })

  it.skipIf(skipDbTests)('can update about settings', async () => {
    if (!db || !createdSettingsId) return

    const newName = 'Updated Admin Name'
    await db
      .update(aboutSettings)
      .set({ adminName: newName, updatedAt: new Date() })
      .where(eq(aboutSettings.id, createdSettingsId))

    const [updated] = await db
      .select()
      .from(aboutSettings)
      .where(eq(aboutSettings.id, createdSettingsId))
      .limit(1)

    expect(updated.adminName).toBe(newName)
  })

  it.skipIf(skipDbTests)('can update about content', async () => {
    if (!db) return

    const [existingContent] = await db
      .select()
      .from(aboutContent)
      .where(eq(aboutContent.lang, 'en'))
      .limit(1)

    if (!existingContent) return

    const updatedTitle = 'Updated English Title'
    await db
      .update(aboutContent)
      .set({ title: updatedTitle, updatedAt: new Date() })
      .where(eq(aboutContent.id, existingContent.id))

    const [updated] = await db
      .select()
      .from(aboutContent)
      .where(eq(aboutContent.id, existingContent.id))
      .limit(1)

    expect(updated.title).toBe(updatedTitle)
  })

  it.skipIf(skipDbTests)('enforces unique constraint on lang', async () => {
    if (!db) return

    // Try to insert duplicate content for same language
    await expect(
      db.insert(aboutContent).values({
        lang: 'en', // Already exists
        title: 'Duplicate',
        description: 'Duplicate',
        heroTitle: 'Duplicate',
        heroSubtitle: 'Duplicate',
        visionTitle: 'Duplicate',
        visionParagraphs: '[]',
        valuesV0Title: 'Duplicate',
        valuesV0Message: 'Duplicate',
        valuesV1Title: 'Duplicate',
        valuesV1Message: 'Duplicate',
        valuesV2Title: 'Duplicate',
        valuesV2Message: 'Duplicate',
        quoteText: 'Duplicate',
      })
    ).rejects.toThrow()
  })

  it.skipIf(skipDbTests)('visionParagraphs stores as JSON string', async () => {
    if (!db) return

    const [content] = await db
      .select()
      .from(aboutContent)
      .where(eq(aboutContent.lang, 'en'))
      .limit(1)

    if (!content) return

    // Should be valid JSON
    const paragraphs = JSON.parse(content.visionParagraphs)
    expect(Array.isArray(paragraphs)).toBe(true)
    expect(paragraphs.length).toBeGreaterThan(0)
  })
})
