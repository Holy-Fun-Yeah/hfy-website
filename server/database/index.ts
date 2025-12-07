import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '../env'
import * as schema from './schema'

// Create database connection from centralized env
const connectionString = env.DATABASE_URL

if (!connectionString) {
  console.warn('DATABASE_URL is not set. Database features will not work.')
}

// For query purposes
const queryClient = connectionString ? postgres(connectionString) : null

// Export the drizzle database instance
export const db = queryClient ? drizzle(queryClient, { schema }) : null

// Export schema for convenience
export { schema }

// Helper to ensure db is available
export function useDatabase() {
  if (!db) {
    throw new Error('Database connection not available. Please set DATABASE_URL.')
  }
  return db
}
