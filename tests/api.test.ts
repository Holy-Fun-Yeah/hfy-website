import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

/**
 * API Response Format Tests
 *
 * Verifies all API endpoints return the standardized response format:
 * - Success: { success: true, timestamp, data }
 * - Error: { success: false, timestamp, error: { status, code, message } }
 * - Paginated: { success: true, timestamp, data, pagination }
 */

describe('API Response Format', async () => {
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
    // Verify timestamp is valid ISO string
    const { timestamp } = response as { timestamp: string }
    expect(new Date(timestamp).toISOString()).toBe(timestamp)
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
  // Health Endpoint
  // ==========================================================================

  describe('GET /api/health', () => {
    it('returns success response with health data', async () => {
      const response = await $fetch('/api/health')

      expectSuccessResponse(response)
      expect((response as { data: unknown }).data).toMatchObject({
        status: 'ok',
        timestamp: expect.any(String),
        version: expect.any(String),
      })
    })
  })

  // ==========================================================================
  // Users List Endpoint
  // ==========================================================================

  describe('GET /api/users', () => {
    it('returns paginated response (even when empty)', async () => {
      // Note: Without DB, this will return error. Test the format.
      try {
        const response = await $fetch('/api/users')
        expectPaginatedResponse(response)
      } catch (error: unknown) {
        // DB unavailable - expect service unavailable error
        const err = error as { data: unknown }
        expectErrorResponse(err.data, 503, 'SERVICE_UNAVAILABLE')
      }
    })

    it('returns validation error for invalid pagination params', async () => {
      try {
        await $fetch('/api/users?page=-1')
        expect.fail('Should have thrown validation error')
      } catch (error: unknown) {
        const err = error as { data: unknown }
        expectErrorResponse(err.data, 422, 'VALIDATION_ERROR')
      }
    })

    it('returns validation error for page exceeding limit', async () => {
      try {
        await $fetch('/api/users?limit=999')
        expect.fail('Should have thrown validation error')
      } catch (error: unknown) {
        const err = error as { data: unknown }
        expectErrorResponse(err.data, 422, 'VALIDATION_ERROR')
      }
    })
  })

  // ==========================================================================
  // User by ID Endpoint
  // ==========================================================================

  describe('GET /api/users/:id', () => {
    it('returns error for invalid ID format', async () => {
      try {
        await $fetch('/api/users/invalid')
        expect.fail('Should have thrown bad request error')
      } catch (error: unknown) {
        const err = error as { data: unknown }
        expectErrorResponse(err.data, 400, 'BAD_REQUEST')
      }
    })

    it('returns error for negative ID', async () => {
      try {
        await $fetch('/api/users/-1')
        expect.fail('Should have thrown bad request error')
      } catch (error: unknown) {
        const err = error as { data: unknown }
        expectErrorResponse(err.data, 400, 'BAD_REQUEST')
      }
    })

    it('returns error for zero ID', async () => {
      try {
        await $fetch('/api/users/0')
        expect.fail('Should have thrown bad request error')
      } catch (error: unknown) {
        const err = error as { data: unknown }
        expectErrorResponse(err.data, 400, 'BAD_REQUEST')
      }
    })

    it('returns not found or service unavailable for valid ID', async () => {
      try {
        await $fetch('/api/users/1')
        expect.fail('Should have thrown error (no DB)')
      } catch (error: unknown) {
        const err = error as { data: unknown; status: number }
        // Either NOT_FOUND (if DB connected but user doesn't exist)
        // or SERVICE_UNAVAILABLE (if DB not connected)
        expect([404, 503]).toContain(err.status)
        if (err.status === 404) {
          expectErrorResponse(err.data, 404, 'NOT_FOUND')
        } else {
          expectErrorResponse(err.data, 503, 'SERVICE_UNAVAILABLE')
        }
      }
    })
  })

  // ==========================================================================
  // Create User Endpoint
  // ==========================================================================

  describe('POST /api/users', () => {
    it('returns validation error for empty body', async () => {
      try {
        await $fetch('/api/users', {
          method: 'POST',
          body: {},
        })
        expect.fail('Should have thrown validation error')
      } catch (error: unknown) {
        const err = error as { data: unknown }
        expectErrorResponse(err.data, 422, 'VALIDATION_ERROR')
      }
    })

    it('returns validation error for invalid email', async () => {
      try {
        await $fetch('/api/users', {
          method: 'POST',
          body: {
            email: 'not-an-email',
            name: 'Test User',
          },
        })
        expect.fail('Should have thrown validation error')
      } catch (error: unknown) {
        const err = error as { data: unknown }
        expectErrorResponse(err.data, 422, 'VALIDATION_ERROR')
      }
    })

    it('returns validation error for short name', async () => {
      try {
        await $fetch('/api/users', {
          method: 'POST',
          body: {
            email: 'test@example.com',
            name: 'A', // Too short (min 2 chars)
          },
        })
        expect.fail('Should have thrown validation error')
      } catch (error: unknown) {
        const err = error as { data: unknown }
        expectErrorResponse(err.data, 422, 'VALIDATION_ERROR')
      }
    })

    it('returns service unavailable or success for valid data', async () => {
      try {
        const response = await $fetch('/api/users', {
          method: 'POST',
          body: {
            email: 'test@example.com',
            name: 'Test User',
          },
        })
        // If DB connected, should return success
        expectSuccessResponse(response)
      } catch (error: unknown) {
        // If DB not connected, should return service unavailable
        const err = error as { data: unknown }
        expectErrorResponse(err.data, 503, 'SERVICE_UNAVAILABLE')
      }
    })
  })

  // ==========================================================================
  // Response Structure Invariants
  // ==========================================================================

  describe('Response Structure Invariants', () => {
    it('all success responses have success=true and timestamp', async () => {
      const response = await $fetch('/api/health')
      expect(response).toHaveProperty('success', true)
      expect(response).toHaveProperty('timestamp')
      expect(response).toHaveProperty('data')
    })

    it('all error responses have success=false, timestamp, and error object', async () => {
      try {
        await $fetch('/api/users/invalid')
      } catch (error: unknown) {
        const err = error as { data: Record<string, unknown> }
        expect(err.data).toHaveProperty('success', false)
        expect(err.data).toHaveProperty('timestamp')
        expect(err.data).toHaveProperty('error')
        expect(err.data.error).toHaveProperty('status')
        expect(err.data.error).toHaveProperty('code')
        expect(err.data.error).toHaveProperty('message')
      }
    })
  })
})
