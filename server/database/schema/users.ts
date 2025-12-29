import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// ============================================================
// Profiles Table (linked to Supabase auth.users)
// ============================================================
// This table extends Supabase Auth with app-specific user data.
// The `id` column references `auth.users.id` (UUID) with ON DELETE CASCADE.
//
// Soft-delete strategy (Option D):
// - When user deletes account, we set deletedAt timestamp
// - Auth user is BANNED (not deleted) to preserve FK integrity
// - Profile record retained for purchase history / audit trail
// - Email remains locked (can't re-register with same email)
// - Admin can restore by unbanning auth user + clearing deletedAt

// Valid pronouns values (inclusive options)
export const PRONOUNS_OPTIONS = [
  'she/her',
  'he/him',
  'they/them',
  'she/they',
  'he/they',
  'any',
  'prefer_not_to_say',
] as const

export type Pronouns = (typeof PRONOUNS_OPTIONS)[number]

export const profiles = pgTable('profiles', {
  // UUID from Supabase auth.users - NOT auto-generated
  id: uuid('id').primaryKey(),
  // Display name (can differ from auth email)
  displayName: text('display_name').notNull(),
  // Pronouns (inclusive options)
  pronouns: text('pronouns').$type<Pronouns>(),
  // Email (denormalized from auth.users for convenience)
  email: text('email').notNull(),
  // Contact info
  phone: text('phone'),
  // App-specific profile data
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  // Preferences - default to true for newsletter
  newsletterSubscribed: boolean('newsletter_subscribed').default(true).notNull(),
  // Admin flag (managed via Supabase dashboard or admin API)
  isAdmin: boolean('is_admin').default(false).notNull(),
  // Soft-delete: null = active, timestamp = deleted (user is banned in auth.users)
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ============================================================
// Zod Schemas
// ============================================================

// Zod enum for pronouns validation
export const pronounsSchema = z.enum(PRONOUNS_OPTIONS)

export const selectProfileSchema = createSelectSchema(profiles)
export const insertProfileSchema = createInsertSchema(profiles, {
  id: z.string().uuid(),
  displayName: z.string().min(1, 'Display name is required').max(100),
  pronouns: pronounsSchema.optional().nullable(),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(20).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  newsletterSubscribed: z.boolean().default(true),
  isAdmin: z.boolean().default(false),
})

export const updateProfileSchema = insertProfileSchema.partial().omit({
  id: true,
  email: true, // Email managed by Supabase Auth
  deletedAt: true, // Managed by delete endpoint
  createdAt: true,
  updatedAt: true,
})

// Schema for profile update API (user-editable fields only)
export const profileUpdateApiSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  pronouns: pronounsSchema.optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  newsletterSubscribed: z.boolean().optional(),
})

// ============================================================
// Types
// ============================================================
export type Profile = z.infer<typeof selectProfileSchema>
export type NewProfile = z.infer<typeof insertProfileSchema>
export type UpdateProfile = z.infer<typeof updateProfileSchema>

// Backwards compatibility aliases (deprecated, use Profile instead)
/** @deprecated Use Profile instead */
export type User = Profile
/** @deprecated Use NewProfile instead */
export type NewUser = NewProfile
/** @deprecated Use UpdateProfile instead */
export type UpdateUser = UpdateProfile
/** @deprecated Use profiles instead */
export const users = profiles
/** @deprecated Use selectProfileSchema instead */
export const selectUserSchema = selectProfileSchema
/** @deprecated Use insertProfileSchema instead */
export const insertUserSchema = insertProfileSchema
/** @deprecated Use updateProfileSchema instead */
export const updateUserSchema = updateProfileSchema
