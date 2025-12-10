import {
  decimal,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { langEnum, supportedLanguages } from './common'

// ============================================================
// Enums
// ============================================================
export const eventTypeEnum = pgEnum('event_type', ['online', 'in_person'])
export const eventStatusEnum = pgEnum('event_status', [
  'draft',
  'published',
  'cancelled',
  'completed',
])

// ============================================================
// Events Table (language-agnostic fields)
// ============================================================
export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  // Slug: URL-friendly identifier (e.g., "summer-solstice-2025")
  // Stays consistent across languages for shareable URLs
  slug: text('slug').notNull().unique(),
  type: eventTypeEnum('type').notNull(),
  status: eventStatusEnum('status').default('draft').notNull(),
  // Scheduling (stored in UTC, frontend converts to user timezone)
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  // Location
  host: text('host').notNull(), // Who's leading the event
  location: text('location').notNull(), // City name or "Online"
  address: text('address'), // Specific venue address (in-person only)
  googleMapsUrl: text('google_maps_url'), // Optional maps link
  // Capacity & Pricing
  capacity: integer('capacity'), // null = unlimited
  usdPrice: decimal('usd_price', { precision: 10, scale: 2 }).default('0').notNull(), // 0 = free
  // Media
  bannerUrl: text('banner_url'), // Event card/header image (Supabase storage)
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================================
// Event Content Table (translatable fields)
// ============================================================
export const eventContent = pgTable(
  'event_content',
  {
    id: serial('id').primaryKey(),
    eventId: uuid('event_id')
      .references(() => events.id, { onDelete: 'cascade' })
      .notNull(),
    lang: langEnum('lang').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(), // Brief text for event cards
    detail: text('detail').notNull(), // Markdown content for full event page
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('event_content_event_lang_idx').on(table.eventId, table.lang)]
)

// ============================================================
// Zod Schemas
// ============================================================

// Event schemas
export const selectEventSchema = createSelectSchema(events)
export const insertEventSchema = createInsertSchema(events, {
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  type: z.enum(['online', 'in_person']),
  status: z.enum(['draft', 'published', 'cancelled', 'completed']).default('draft'),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  host: z.string().min(1, 'Host is required').max(100),
  location: z.string().min(1, 'Location is required').max(200),
  address: z.string().max(300).optional().nullable(),
  googleMapsUrl: z.string().url().optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  usdPrice: z.string().default('0'),
  bannerUrl: z.string().url().optional().nullable(),
})

export const updateEventSchema = insertEventSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

// Event content schemas
export const selectEventContentSchema = createSelectSchema(eventContent)
export const insertEventContentSchema = createInsertSchema(eventContent, {
  eventId: z.string().uuid(),
  lang: z.enum(supportedLanguages),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(500),
  detail: z.string().min(1, 'Detail is required'),
})

export const updateEventContentSchema = insertEventContentSchema.partial().omit({
  id: true,
  eventId: true,
  lang: true,
  createdAt: true,
  updatedAt: true,
})

// ============================================================
// Types
// ============================================================
export type Event = z.infer<typeof selectEventSchema>
export type NewEvent = z.infer<typeof insertEventSchema>
export type UpdateEvent = z.infer<typeof updateEventSchema>
export type EventContent = z.infer<typeof selectEventContentSchema>
export type NewEventContent = z.infer<typeof insertEventContentSchema>
export type UpdateEventContent = z.infer<typeof updateEventContentSchema>
export type EventType = 'online' | 'in_person'
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed'

// Combined event with content (for API responses)
export type EventWithContent = Event & {
  content: EventContent
}
