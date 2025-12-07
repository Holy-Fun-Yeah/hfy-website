/**
 * Shared API Response Types
 *
 * These types mirror the server response types for type-safe API consumption.
 */

/** Error information from API responses. */
export interface ApiErrorInfo {
  status: number
  code: string
  message: string
}

/** Pagination information for list responses. */
export interface ApiPaginationInfo {
  total_items: number
  total_pages: number
  current_page: number
  page_size: number
  has_more: boolean
}

/** Base response type with common fields. */
export interface ApiBaseResponse {
  timestamp: string
  success: boolean
}

/** Error response type. */
export interface ApiErrorResponse extends ApiBaseResponse {
  success: false
  error: ApiErrorInfo
}

/** Success response type with data payload. */
export interface ApiSuccessResponse<T> extends ApiBaseResponse {
  success: true
  data: T
}

/** Union type for all possible responses. */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

/** Paginated success response type. */
export interface ApiPaginatedSuccessResponse<T> extends ApiBaseResponse {
  success: true
  data: T
  pagination: ApiPaginationInfo
}

/** Union type for paginated responses. */
export type ApiPaginatedResponse<T> = ApiPaginatedSuccessResponse<T> | ApiErrorResponse

// =============================================================================
// Type Guards
// =============================================================================

/** Check if response is successful. */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true
}

/** Check if response is an error. */
export function isApiError<T>(response: ApiResponse<T>): response is ApiErrorResponse {
  return response.success === false
}

/** Check if paginated response is successful. */
export function isPaginatedSuccess<T>(
  response: ApiPaginatedResponse<T>
): response is ApiPaginatedSuccessResponse<T> {
  return response.success === true
}
