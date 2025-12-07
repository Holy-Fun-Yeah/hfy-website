/**
 * Server Library
 *
 * Internal framework utilities for the Nuxt server.
 * Single import point for all framework code.
 *
 * @example
 * import { Result, Errors, AppError, defineResultHandler } from '../lib'
 */

// Error handling
export type { ErrorInfo } from './error'
export { AppError, Errors } from './error'

// Result pattern
export type { AsyncResult, Err, Ok, ResultType } from './result'
export { Result } from './result'

// Response types and helpers
export type {
  AppAsyncPaginatedResponse,
  AppAsyncResponse,
  AppBaseResponse,
  AppErrorResponse,
  AppPaginatedResponse,
  AppPaginatedSuccessResponse,
  AppResponse,
  AppSuccessResponse,
  PaginatedResult,
  PaginationInfo,
} from './response'
export {
  createErrorResponse,
  createPaginatedSuccessResponse,
  createSuccessResponse,
  getPaginationInfo,
} from './response'

// Nitro handler utilities
export {
  createPaginationInfo,
  defineApiHandler,
  definePaginatedApiHandler,
  definePaginatedResultHandler,
  defineResultHandler,
  resultToResponse,
} from './handler'
