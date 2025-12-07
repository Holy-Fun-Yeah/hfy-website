import { pgTable, serial, text, timestamp, boolean, integer, decimal } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// ============================================================
// Users Table
// ============================================================
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Zod schemas derived from Drizzle table
export const selectUserSchema = createSelectSchema(users)
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  avatarUrl: z.string().url().optional().nullable(),
})

// Partial schema for updates (all fields optional)
export const updateUserSchema = insertUserSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

// Type exports derived from Zod schemas
export type User = z.infer<typeof selectUserSchema>
export type NewUser = z.infer<typeof insertUserSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>

// ============================================================
// Posts Table
// ============================================================
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  slug: text('slug').notNull().unique(),
  published: boolean('published').default(false).notNull(),
  authorId: integer('author_id')
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Zod schemas derived from Drizzle table
export const selectPostSchema = createSelectSchema(posts)
export const insertPostSchema = createInsertSchema(posts, {
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  authorId: z.number().int().positive(),
})

// Partial schema for updates
export const updatePostSchema = insertPostSchema.partial().omit({
  id: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
})

// Type exports derived from Zod schemas
export type Post = z.infer<typeof selectPostSchema>
export type NewPost = z.infer<typeof insertPostSchema>
export type UpdatePost = z.infer<typeof updatePostSchema>

// ============================================================
// Events Table
// ============================================================
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  location: text('location'), // Physical location or "Online"
  imageUrl: text('image_url'),
  startsAt: timestamp('starts_at').notNull(),
  endsAt: timestamp('ends_at'),
  capacity: integer('capacity'), // null = unlimited
  price: decimal('price', { precision: 10, scale: 2 }), // null = free
  published: boolean('published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const selectEventSchema = createSelectSchema(events)
export const insertEventSchema = createInsertSchema(events, {
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  location: z.string().max(200).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  price: z.string().optional().nullable(), // Decimal comes as string
})

export const updateEventSchema = insertEventSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type Event = z.infer<typeof selectEventSchema>
export type NewEvent = z.infer<typeof insertEventSchema>
export type UpdateEvent = z.infer<typeof updateEventSchema>

// ============================================================
// Services Table (Bookable offerings)
// ============================================================
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  duration: integer('duration').notNull(), // Minutes
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const selectServiceSchema = createSelectSchema(services)
export const insertServiceSchema = createInsertSchema(services, {
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required'),
  duration: z.number().int().positive().min(15, 'Minimum 15 minutes'),
  price: z.string(), // Decimal comes as string
  imageUrl: z.string().url().optional().nullable(),
})

export const updateServiceSchema = insertServiceSchema.partial().omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type Service = z.infer<typeof selectServiceSchema>
export type NewService = z.infer<typeof insertServiceSchema>
export type UpdateService = z.infer<typeof updateServiceSchema>

// ============================================================
// Appointments Table
// ============================================================
export const appointmentStatus = ['pending', 'confirmed', 'cancelled', 'completed'] as const

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

export type Appointment = z.infer<typeof selectAppointmentSchema>
export type NewAppointment = z.infer<typeof insertAppointmentSchema>
export type UpdateAppointment = z.infer<typeof updateAppointmentSchema>
export type AppointmentStatus = (typeof appointmentStatus)[number]
