import { decimal, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

import { services } from './services'

// ============================================================
// Constants
// ============================================================
export const appointmentStatus = ['pending', 'confirmed', 'cancelled', 'completed'] as const

// ============================================================
// Appointments Table
// ============================================================
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  serviceId: integer('service_id')
    .references(() => services.id)
    .notNull(),
  // Client info (may or may not be registered user)
  clientName: text('client_name').notNull(),
  clientEmail: text('client_email').notNull(),
  clientPhone: text('client_phone'),
  clientNotes: text('client_notes'), // Intention, birth info, etc.
  // Scheduling
  scheduledAt: timestamp('scheduled_at').notNull(),
  duration: integer('duration').notNull(), // Minutes (copied from service)
  timezone: text('timezone').default('UTC').notNull(),
  // Status & Payment
  status: text('status', { enum: appointmentStatus }).default('pending').notNull(),
  stripeSessionId: text('stripe_session_id'),
  paidAt: timestamp('paid_at'),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================================
// Zod Schemas
// ============================================================
export const selectAppointmentSchema = createSelectSchema(appointments)
export const insertAppointmentSchema = createInsertSchema(appointments, {
  serviceId: z.number().int().positive(),
  clientName: z.string().min(2, 'Name is required').max(100),
  clientEmail: z.string().email('Invalid email address'),
  clientPhone: z.string().max(20).optional().nullable(),
  clientNotes: z.string().max(1000).optional().nullable(),
  scheduledAt: z.coerce.date(),
  duration: z.number().int().positive(),
  timezone: z.string().default('UTC'),
  status: z.enum(appointmentStatus).default('pending'),
})

export const updateAppointmentSchema = insertAppointmentSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

// ============================================================
// Types
// ============================================================
export type Appointment = z.infer<typeof selectAppointmentSchema>
export type NewAppointment = z.infer<typeof insertAppointmentSchema>
export type UpdateAppointment = z.infer<typeof updateAppointmentSchema>
export type AppointmentStatus = (typeof appointmentStatus)[number]
