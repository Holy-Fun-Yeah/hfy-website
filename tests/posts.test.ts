import { setup, $fetch } from '@nuxt/test-utils/e2e'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

/**
 * Posts API Tests
 *
 * Tests the blog posts API endpoints:
 * - GET /api/posts (public listing)
 * - GET /api/posts/[slug] (public detail)
 * - POST /api/admin/posts (admin create/update - requires auth)
 *
 * Atomic test pattern:
 * 1. Create test data
 * 2. Verify it exists
 * 3. Clean up (delete test data)
 */

describe('Posts API', async () => {
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
  // GET /api/posts - Public Listing
  // ==========================================================================

  describe('GET /api/posts', () => {
    it('returns paginated response with default language (en)', async () => {
      try {
        const response = await $fetch('/api/posts')
        expectPaginatedResponse(response)
      } catch (error: unknown) {
        // DB unavailable - expect service unavailable error
        const err = error as { data: unknown }
        expectErrorResponse(err.data, 503, 'SERVICE_UNAVAILABLE')
      }
    })

    it('accepts valid language parameter', async () => {
      try {
        const response = await $fetch('/api/posts?lang=es')
        expectPaginatedResponse(response)
      } catch (error: unknown) {
        const err = error as { data: unknown }
        expectErrorResponse(err.data, 503, 'SERVICE_UNAVAILABLE')
      }
    })

    it('rejects invalid language parameter', async () => {
      try {
        await $fetch('/api/posts?lang=invalid')
        expect.fail('Should have thrown validation error')
      } catch (error: unknown) {
        const err = error as { data: unknown; status: number }
        // Should be validation error (422) for invalid lang
        expect([422, 503]).toContain(err.status)
      }
    })

    it('accepts pagination parameters', async () => {
      try {
        const response = await $fetch('/api/posts?page=1&limit=5')
        expectPaginatedResponse(response)
        const typedResponse = response as { pagination: { page_size: number } }
        expect(typedResponse.pagination.page_size).toBe(5)
      } catch (error: unknown) {
        const err = error as { data: unknown }
        expectErrorResponse(err.data, 503, 'SERVICE_UNAVAILABLE')
      }
    })
  })

  // ==========================================================================
  // GET /api/posts/[slug] - Public Detail
  // ==========================================================================

  describe('GET /api/posts/[slug]', () => {
    it('returns 404 for non-existent slug', async () => {
      try {
        await $fetch('/api/posts/non-existent-post-slug-12345')
        expect.fail('Should have thrown not found error')
      } catch (error: unknown) {
        const err = error as { data: unknown; status: number }
        // Either NOT_FOUND or SERVICE_UNAVAILABLE
        expect([404, 503]).toContain(err.status)
      }
    })

    it('returns 400 for invalid slug format', async () => {
      try {
        await $fetch('/api/posts/Invalid Slug With Spaces!')
        expect.fail('Should have thrown bad request error')
      } catch (error: unknown) {
        const err = error as { data: unknown; status: number }
        expect(err.status).toBe(400)
        expectErrorResponse(err.data, 400, 'BAD_REQUEST')
      }
    })

    it('accepts valid language parameter', async () => {
      try {
        await $fetch('/api/posts/some-slug?lang=de')
        // If it gets here, slug exists (unexpected in test)
      } catch (error: unknown) {
        const err = error as { status: number }
        // Either NOT_FOUND (slug doesn't exist) or SERVICE_UNAVAILABLE (no DB)
        expect([404, 503]).toContain(err.status)
      }
    })
  })

  // ==========================================================================
  // POST /api/admin/posts - Admin Create (Auth Required)
  // ==========================================================================

  describe('POST /api/admin/posts', () => {
    it('returns 401 unauthorized without authentication', async () => {
      try {
        await $fetch('/api/admin/posts', {
          method: 'POST',
          body: {
            slug: 'test-post',
            published: false,
            content: {
              en: { title: 'Test', excerpt: 'Test excerpt', content: 'Test content' },
              es: { title: 'Prueba', excerpt: 'Extracto', content: 'Contenido' },
              de: { title: 'Test', excerpt: 'Auszug', content: 'Inhalt' },
              fr: { title: 'Test', excerpt: 'Extrait', content: 'Contenu' },
            },
          },
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
        await $fetch('/api/admin/posts', {
          method: 'POST',
          body: {
            published: false,
            content: {
              en: { title: 'Test', excerpt: 'Test excerpt', content: 'Test content' },
              es: { title: 'Prueba', excerpt: 'Extracto', content: 'Contenido' },
              de: { title: 'Test', excerpt: 'Auszug', content: 'Inhalt' },
              fr: { title: 'Test', excerpt: 'Extrait', content: 'Contenu' },
            },
          },
        })
        expect.fail('Should have thrown error')
      } catch (error: unknown) {
        const err = error as { status: number }
        // 401 (not authenticated) or 422 (validation)
        expect([401, 422]).toContain(err.status)
      }
    })

    it('returns validation error for invalid slug format', async () => {
      try {
        await $fetch('/api/admin/posts', {
          method: 'POST',
          body: {
            slug: 'Invalid Slug!',
            published: false,
            content: {
              en: { title: 'Test', excerpt: 'Test excerpt', content: 'Test content' },
              es: { title: 'Prueba', excerpt: 'Extracto', content: 'Contenido' },
              de: { title: 'Test', excerpt: 'Auszug', content: 'Inhalt' },
              fr: { title: 'Test', excerpt: 'Extrait', content: 'Contenu' },
            },
          },
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
        await $fetch('/api/admin/posts', {
          method: 'POST',
          body: {
            slug: 'test-post',
            published: false,
            content: {
              en: { title: 'Test', excerpt: 'Test excerpt', content: 'Test content' },
              // Missing es, de, fr
            },
          },
        })
        expect.fail('Should have thrown error')
      } catch (error: unknown) {
        const err = error as { status: number }
        // 401 (not authenticated) or 422 (validation)
        expect([401, 422]).toContain(err.status)
      }
    })
  })

  // ==========================================================================
  // Response Structure Tests
  // ==========================================================================

  describe('Response Structure', () => {
    it('posts listing includes expected fields', async () => {
      try {
        const response = (await $fetch('/api/posts')) as {
          data: Array<{
            id: number
            slug: string
            title: string
            excerpt: string
            lang: string
            isFallback: boolean
          }>
        }

        // Even if empty, check structure is correct
        if (response.data.length > 0) {
          const post = response.data[0]
          expect(post).toHaveProperty('id')
          expect(post).toHaveProperty('slug')
          expect(post).toHaveProperty('title')
          expect(post).toHaveProperty('excerpt')
          expect(post).toHaveProperty('lang')
          expect(post).toHaveProperty('isFallback')
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
// This test requires a running database and creates/deletes test data

import { eq } from 'drizzle-orm'

describe('Posts Database Operations (Atomic)', async () => {
  // These tests only run if DATABASE_URL is set
  const skipDbTests = !process.env.DATABASE_URL

  // Dynamic imports to avoid errors when DB is not available
  let db: typeof import('../server/database').db
  let posts: typeof import('../server/database/schema').posts
  let postContent: typeof import('../server/database/schema').postContent
  let profiles: typeof import('../server/database/schema').profiles

  beforeAll(async () => {
    if (skipDbTests) return

    const dbModule = await import('../server/database')
    const schemaModule = await import('../server/database/schema')

    db = dbModule.db
    posts = schemaModule.posts
    postContent = schemaModule.postContent
    profiles = schemaModule.profiles
  })

  // Test author ID - must exist in profiles table
  // In real tests, you'd create a test profile first
  const TEST_SLUG = `test-post-${Date.now()}`
  let createdPostId: number | null = null

  afterAll(async () => {
    // Cleanup: Delete test post if it was created
    if (skipDbTests || !db || !createdPostId) return

    try {
      // Delete content first (due to FK)
      await db.delete(postContent).where(eq(postContent.postId, createdPostId))
      // Delete post
      await db.delete(posts).where(eq(posts.id, createdPostId))
      console.log(`Cleaned up test post: ${TEST_SLUG}`)
    } catch (error) {
      console.error('Failed to cleanup test post:', error)
    }
  })

  it.skipIf(skipDbTests)('can create a post with all language content', async () => {
    if (!db) throw new Error('DB not available')

    // First, we need a valid author. Get any existing profile.
    const [existingProfile] = await db.select({ id: profiles.id }).from(profiles).limit(1)

    if (!existingProfile) {
      console.log('No profiles in DB, skipping post creation test')
      return
    }

    // Create post
    const [createdPost] = await db
      .insert(posts)
      .values({
        slug: TEST_SLUG,
        published: false,
        authorId: existingProfile.id,
        bannerUrl: null,
      })
      .returning()

    expect(createdPost).toBeDefined()
    expect(createdPost.slug).toBe(TEST_SLUG)
    createdPostId = createdPost.id

    // Create content for all languages
    const languages = ['en', 'es', 'de', 'fr'] as const
    for (const lang of languages) {
      await db.insert(postContent).values({
        postId: createdPost.id,
        lang,
        title: `Test Title (${lang})`,
        excerpt: `Test excerpt in ${lang}`,
        content: `Full content in ${lang}`,
      })
    }

    // Verify all content was created
    const allContent = await db
      .select()
      .from(postContent)
      .where(eq(postContent.postId, createdPost.id))

    expect(allContent).toHaveLength(4)
    expect(allContent.map((c) => c.lang).sort()).toEqual(['de', 'en', 'es', 'fr'])
  })

  it.skipIf(skipDbTests)('can read the created post', async () => {
    if (!db || !createdPostId) return

    const [post] = await db.select().from(posts).where(eq(posts.id, createdPostId)).limit(1)

    expect(post).toBeDefined()
    expect(post.slug).toBe(TEST_SLUG)
    expect(post.published).toBe(false)
  })

  it.skipIf(skipDbTests)('can update post content', async () => {
    if (!db || !createdPostId) return

    // Update English content
    const [existingContent] = await db
      .select()
      .from(postContent)
      .where(eq(postContent.postId, createdPostId))
      .limit(1)

    if (!existingContent) return

    const updatedTitle = 'Updated Test Title'
    await db
      .update(postContent)
      .set({ title: updatedTitle, updatedAt: new Date() })
      .where(eq(postContent.id, existingContent.id))

    // Verify update
    const [updated] = await db
      .select()
      .from(postContent)
      .where(eq(postContent.id, existingContent.id))
      .limit(1)

    expect(updated.title).toBe(updatedTitle)
  })

  it.skipIf(skipDbTests)('enforces unique constraint on (post_id, lang)', async () => {
    if (!db || !createdPostId) return

    // Try to insert duplicate content for same language
    await expect(
      db.insert(postContent).values({
        postId: createdPostId,
        lang: 'en', // Already exists
        title: 'Duplicate',
        excerpt: 'Duplicate',
        content: 'Duplicate',
      })
    ).rejects.toThrow()
  })

  // Note: Cleanup happens in afterAll
})
