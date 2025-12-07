/**
 * API Composables
 *
 * Type-safe API fetching with standardized response handling.
 */

import type { ApiPaginatedResponse, ApiPaginationInfo, ApiResponse } from '~/types/api'

// Re-export types for convenience
export type {
  ApiErrorInfo,
  ApiPaginationInfo,
  ApiResponse,
  ApiPaginatedResponse,
} from '~/types/api'
export { isApiError, isApiSuccess, isPaginatedSuccess } from '~/types/api'

/**
 * Fetch API data with type-safe response handling.
 *
 * @example
 * const { data, isSuccess, responseData, responseError } = await useApi<User>('/api/users/1')
 */
export function useApi<T>(url: string) {
  return useFetch<ApiResponse<T>>(url)
}

/**
 * Fetch paginated API data.
 *
 * @example
 * const { data } = await usePaginatedApi<User[]>('/api/users')
 * if (data.value?.success) {
 *   console.log(data.value.data, data.value.pagination)
 * }
 */
export function usePaginatedApi<T>(url: string) {
  return useFetch<ApiPaginatedResponse<T>>(url)
}

/**
 * POST request helper.
 */
export function useApiPost<T>(url: string, body: Record<string, unknown>) {
  return useFetch<ApiResponse<T>>(url, {
    method: 'POST',
    body,
  })
}

/**
 * PUT request helper.
 */
export function useApiPut<T>(url: string, body: Record<string, unknown>) {
  return useFetch<ApiResponse<T>>(url, {
    method: 'PUT',
    body,
  })
}

/**
 * DELETE request helper.
 */
export function useApiDelete<T>(url: string) {
  return useFetch<ApiResponse<T>>(url, {
    method: 'DELETE',
  })
}

/**
 * Helper to extract data from a successful response.
 */
export function unwrapApiResponse<T>(response: ApiResponse<T> | null): T | null {
  if (response?.success) {
    return response.data
  }
  return null
}

/**
 * Helper to extract pagination from a paginated response.
 */
export function unwrapPaginatedResponse<T>(
  response: ApiPaginatedResponse<T> | null
): { data: T; pagination: ApiPaginationInfo } | null {
  if (response?.success) {
    return { data: response.data, pagination: response.pagination }
  }
  return null
}
