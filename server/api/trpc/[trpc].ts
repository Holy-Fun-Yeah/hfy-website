/**
 * tRPC HTTP Handler
 *
 * Handles all tRPC requests at /api/trpc/*
 * Includes response caching for improved performance.
 */

import { createTRPCNuxtHandler } from 'trpc-nuxt/server'

import { createContext } from '../../trpc/context'
import { appRouter } from '../../trpc/routers'

const ONE_HOUR_IN_SECONDS = 60 * 60

export default createTRPCNuxtHandler({
  endpoint: '/api/trpc',
  router: appRouter,
  createContext,
  /**
   * Response caching for public queries.
   * @see https://trpc.io/docs/caching#api-response-caching
   */
  responseMeta(opts) {
    const { ctx, type, errors } = opts

    // Only cache successful GET requests (queries)
    if (type !== 'query' || errors.length > 0) {
      return {}
    }

    // Don't cache authenticated requests
    if (ctx?.user) {
      return {}
    }

    // Cache public queries for 1 minute, revalidate in background for up to 1 hour
    return {
      headers: {
        'cache-control': `s-maxage=60, stale-while-revalidate=${ONE_HOUR_IN_SECONDS}`,
      },
    }
  },
})
