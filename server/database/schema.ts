// ============================================================
// Database Schema - Re-export for backwards compatibility
// ============================================================
// Schema has been modularized into server/database/schema/
// This file maintains backwards compatibility for existing imports.
//
// Prefer importing from the specific module when possible:
//   import { users } from '../database/schema/users'
//   import { events, eventContent } from '../database/schema/events'
//
// Or import everything from the index:
//   import { users, events, ... } from '../database/schema'

export * from './schema/index'
