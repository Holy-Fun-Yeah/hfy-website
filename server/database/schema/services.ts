import { boolean, decimal, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

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

// ============================================================
// Zod Schemas
// ============================================================
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

// ============================================================
// Types
// ============================================================
export type Service = z.infer<typeof selectServiceSchema>
export type NewService = z.infer<typeof insertServiceSchema>
export type UpdateService = z.infer<typeof updateServiceSchema>
