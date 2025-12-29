import { decimal, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { events } from './events'
import { users } from './users'

// ============================================================
// Enums
// ============================================================
export const registrationStatusEnum = pgEnum('registration_status', [
  'pending', // Payment initiated but not confirmed
  'confirmed', // Payment successful, registration complete
  'failed', // Payment failed
  'refunded', // Payment refunded
  'cancelled', // Cancelled by user or admin
])

// ============================================================
// Event Registrations Table
// ============================================================
export const eventRegistrations = pgTable(
  'event_registrations',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // References
    eventId: uuid('event_id')
      .references(() => events.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),

    // Payment details
    stripePaymentIntentId: text('stripe_payment_intent_id'), // null for free events
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(), // 0 for free events
    status: registrationStatusEnum('status').default('pending').notNull(),

    // Attendee info (stored separately for receipt/confirmation purposes)
    attendeeName: text('attendee_name').notNull(),
    attendeeEmail: text('attendee_email').notNull(),
    attendeePhone: text('attendee_phone'),

    // Timestamps
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  },
  (table) => [
    // Each user can only register once per event
    uniqueIndex('event_registrations_event_user_idx').on(table.eventId, table.userId),
  ]
)

// ============================================================
// Zod Schemas
// ============================================================
export const selectEventRegistrationSchema = createSelectSchema(eventRegistrations)

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations, {
  eventId: z.string().uuid(),
  userId: z.string().uuid(),
  stripePaymentIntentId: z.string().optional().nullable(),
  amount: z.string(),
  status: z.enum(['pending', 'confirmed', 'failed', 'refunded', 'cancelled']).default('pending'),
  attendeeName: z.string().min(1, 'Name is required').max(100),
  attendeeEmail: z.string().email('Valid email is required'),
  attendeePhone: z.string().max(20).optional().nullable(),
})

export const updateEventRegistrationSchema = insertEventRegistrationSchema.partial().omit({
  id: true,
  eventId: true,
  userId: true,
  createdAt: true,
})

// ============================================================
// Types
// ============================================================
export type EventRegistration = z.infer<typeof selectEventRegistrationSchema>
export type NewEventRegistration = z.infer<typeof insertEventRegistrationSchema>
export type UpdateEventRegistration = z.infer<typeof updateEventRegistrationSchema>
export type RegistrationStatus = 'pending' | 'confirmed' | 'failed' | 'refunded' | 'cancelled'
