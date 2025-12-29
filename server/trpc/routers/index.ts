/**
 * Main tRPC Router
 *
 * Combines all sub-routers into a single app router.
 * This is the root router that gets exported to the client.
 */

import { router } from '../trpc'
import { eventsRouter } from './events'
import { postsRouter } from './posts'
import { profileRouter } from './profile'

export const appRouter = router({
  posts: postsRouter,
  events: eventsRouter,
  profile: profileRouter,
})

// Export type for client usage
export type AppRouter = typeof appRouter
