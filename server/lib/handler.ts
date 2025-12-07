/**
 * Nitro Event Handler Utilities
 *
 * Wraps Nitro event handlers with standardized error handling and response formatting.
 * Adapted from Express controller pattern for Nuxt/Nitro.
 */

import type { EventHandler, EventHandlerRequest, H3Event } from 'h3'

import { AppError, Errors } from './error'
import type {
  AppAsyncPaginatedResponse,
  AppAsyncResponse,
  AppResponse,
  PaginatedResult,
  PaginationInfo,
} from './response'
import {
  createErrorResponse,
  createPaginatedSuccessResponse,
  createSuccessResponse,
} from './response'
import type { AsyncResult, ResultType } from './result'
import { Result } from './result'

// =============================================================================
// Handler Wrappers
// =============================================================================

/**
 * Wraps a handler that returns a Result<T, AppError> with standardized response handling.
 *
 * @example
 * export default defineResultHandler(async (event) => {
 *   const user = await userService.findById(id)
 *   if (!user) return Result.err(Errors.notFound('User not found'))
 *   return Result.ok(user)
 * })
 */
export function defineResultHandler<T>(
  handler: (event: H3Event<EventHandlerRequest>) => AsyncResult<T, AppError>
): EventHandler<EventHandlerRequest, AppAsyncResponse<T>> {
  return defineEventHandler(async (event) => {
    const result = await Result.tryCatch(async () => {
      const innerResult = await handler(event)
      if (!innerResult.ok) throw innerResult.error
      return innerResult.value
    })

    if (result.ok) {
      return createSuccessResponse(result.value)
    } else {
      setResponseStatus(event, result.error.status)
      return createErrorResponse(result.error.toResponse())
    }
  })
}

/**
 * Wraps a handler that returns a paginated Result with standardized response handling.
 *
 * @example
 * export default definePaginatedResultHandler(async (event) => {
 *   const { page, limit } = getQuery(event)
 *   const [users, pagination] = await userService.findAll({ page, limit })
 *   return Result.ok([users, pagination])
 * })
 */
export function definePaginatedResultHandler<T>(
  handler: (event: H3Event<EventHandlerRequest>) => AsyncResult<PaginatedResult<T>, AppError>
): EventHandler<EventHandlerRequest, AppAsyncPaginatedResponse<T>> {
  return defineEventHandler(async (event) => {
    const result = await Result.tryCatch(async () => {
      const innerResult = await handler(event)
      if (!innerResult.ok) throw innerResult.error
      return innerResult.value
    })

    if (result.ok) {
      const [data, pagination] = result.value
      return createPaginatedSuccessResponse(data, pagination)
    } else {
      setResponseStatus(event, result.error.status)
      return createErrorResponse(result.error.toResponse())
    }
  })
}

/**
 * Wraps a simple handler with standardized success/error response handling.
 * Use this for handlers that throw errors instead of returning Results.
 *
 * @example
 * export default defineApiHandler(async (event) => {
 *   const user = await userService.findById(id)
 *   if (!user) throw Errors.notFound('User not found')
 *   return user
 * })
 */
export function defineApiHandler<T>(
  handler: (event: H3Event<EventHandlerRequest>) => Promise<T>
): EventHandler<EventHandlerRequest, AppAsyncResponse<T>> {
  return defineEventHandler(async (event) => {
    try {
      const data = await handler(event)
      return createSuccessResponse(data)
    } catch (error) {
      if (error instanceof AppError) {
        setResponseStatus(event, error.status)
        return createErrorResponse(error.toResponse())
      }

      // Handle Zod validation errors
      if (error && typeof error === 'object' && 'issues' in error) {
        const zodError = error as { issues: Array<{ message: string }> }
        const message = zodError.issues.map((i) => i.message).join(', ')
        setResponseStatus(event, 422)
        return createErrorResponse(Errors.validation(message).toResponse())
      }

      // Unknown error
      const appError = Errors.internal(error instanceof Error ? error.message : 'Unknown error')
      setResponseStatus(event, 500)
      return createErrorResponse(appError.toResponse())
    }
  })
}

/**
 * Wraps a paginated handler with standardized response handling.
 *
 * @example
 * export default definePaginatedApiHandler(async (event) => {
 *   const { page, limit } = getQuery(event)
 *   return userService.findAllPaginated({ page, limit })
 * })
 */
export function definePaginatedApiHandler<T>(
  handler: (event: H3Event<EventHandlerRequest>) => Promise<PaginatedResult<T>>
): EventHandler<EventHandlerRequest, AppAsyncPaginatedResponse<T>> {
  return defineEventHandler(async (event) => {
    try {
      const [data, pagination] = await handler(event)
      return createPaginatedSuccessResponse(data, pagination)
    } catch (error) {
      if (error instanceof AppError) {
        setResponseStatus(event, error.status)
        return createErrorResponse(error.toResponse())
      }

      // Handle Zod validation errors
      if (error && typeof error === 'object' && 'issues' in error) {
        const zodError = error as { issues: Array<{ message: string }> }
        const message = zodError.issues.map((i) => i.message).join(', ')
        setResponseStatus(event, 422)
        return createErrorResponse(Errors.validation(message).toResponse())
      }

      const appError = Errors.internal(error instanceof Error ? error.message : 'Unknown error')
      setResponseStatus(event, 500)
      return createErrorResponse(appError.toResponse())
    }
  })
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Convert a Result to an API response.
 * Useful when you need to manually handle the response.
 */
export function resultToResponse<T>(
  event: H3Event,
  result: ResultType<T, AppError>
): AppResponse<T> {
  if (result.ok) {
    return createSuccessResponse(result.value)
  } else {
    setResponseStatus(event, result.error.status)
    return createErrorResponse(result.error.toResponse())
  }
}

/**
 * Create pagination info from count and query params.
 */
export function createPaginationInfo(
  totalItems: number,
  page: number,
  pageSize: number
): PaginationInfo {
  const totalPages = Math.ceil(totalItems / pageSize)
  return {
    total_items: totalItems,
    total_pages: totalPages,
    current_page: page,
    page_size: pageSize,
    has_more: page < totalPages,
  }
}
