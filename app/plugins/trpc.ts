/**
 * tRPC Client Plugin
 *
 * Provides type-safe tRPC client via `$trpc` or `useTrpc()`.
 * Uses superjson for proper Date/Map/Set serialization.
 */

import { createTRPCNuxtClient, httpBatchLink } from 'trpc-nuxt/client'
import superjson from 'superjson'

import type { AppRouter } from '../../server/trpc/routers'

export default defineNuxtPlugin(() => {
  const trpc = createTRPCNuxtClient<AppRouter>({
    links: [
      httpBatchLink({
        url: '/api/trpc',
        // Include credentials for authenticated requests
        headers() {
          return {}
        },
        transformer: superjson,
      }),
    ],
  })

  return {
    provide: {
      trpc,
    },
  }
})
