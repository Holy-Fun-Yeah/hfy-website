/**
 * Seed Test Users Script
 *
 * Creates hardcoded test users in Supabase for E2E testing.
 * These users are auto-confirmed (no email verification needed).
 *
 * Usage:
 *   yarn seed:test-users           # Create test users
 *   yarn seed:test-users:delete    # Remove test users
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'

// Load environment variables from .env
config()

// Test user definitions
const TEST_USERS = [
  {
    email: 'test-user@hfy.test',
    password: 'TestUser123!',
    displayName: 'Test User',
    phone: '+1234567890',
    isAdmin: false,
  },
  {
    email: 'test-admin@hfy.test',
    password: 'TestAdmin123!',
    displayName: 'Test Admin',
    phone: '+1234567891',
    isAdmin: true,
  },
] as const

// Load env vars
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY
const DATABASE_URL = process.env.DATABASE_URL

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY')
  process.exit(1)
}

if (!DATABASE_URL) {
  console.error('Missing DATABASE_URL')
  process.exit(1)
}

// Create Supabase admin client
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Create Postgres client
const sql = postgres(DATABASE_URL)

async function createTestUser(user: (typeof TEST_USERS)[number]): Promise<void> {
  console.log(`Creating user: ${user.email}`)

  // Check if user already exists
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
  const existing = existingUsers?.users.find(
    (u) => u.email?.toLowerCase() === user.email.toLowerCase()
  )

  if (existing) {
    console.log(`  User already exists (id: ${existing.id}), skipping...`)
    return
  }

  // Create user with auto-confirm
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      displayName: user.displayName,
    },
  })

  if (error) {
    console.error(`  Failed to create auth user: ${error.message}`)
    return
  }

  if (!data.user) {
    console.error('  No user returned from createUser')
    return
  }

  console.log(`  Auth user created (id: ${data.user.id})`)

  // Create profile in database
  try {
    await sql`
      INSERT INTO profiles (id, email, display_name, phone, is_admin, created_at, updated_at)
      VALUES (
        ${data.user.id},
        ${user.email.toLowerCase()},
        ${user.displayName},
        ${user.phone},
        ${user.isAdmin},
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        display_name = ${user.displayName},
        phone = ${user.phone},
        is_admin = ${user.isAdmin},
        updated_at = NOW()
    `
    console.log(`  Profile created/updated (isAdmin: ${user.isAdmin})`)
  } catch (err) {
    console.error(`  Failed to create profile: ${err}`)
  }
}

async function deleteTestUser(user: (typeof TEST_USERS)[number]): Promise<void> {
  console.log(`Deleting user: ${user.email}`)

  // Find user in Supabase Auth
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
  const existing = existingUsers?.users.find(
    (u) => u.email?.toLowerCase() === user.email.toLowerCase()
  )

  if (existing) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(existing.id)
    if (error) {
      console.error(`  Failed to delete auth user: ${error.message}`)
    } else {
      console.log('  Auth user deleted')
    }
  } else {
    console.log('  Auth user not found')
  }

  // Delete profile from database
  try {
    await sql`DELETE FROM profiles WHERE email = ${user.email.toLowerCase()}`
    console.log('  Profile deleted')
  } catch (err) {
    console.error(`  Failed to delete profile: ${err}`)
  }
}

async function main(): Promise<void> {
  const isDelete = process.argv.includes('--delete')

  console.log('')
  console.log(isDelete ? '=== Deleting Test Users ===' : '=== Seeding Test Users ===')
  console.log('')

  for (const user of TEST_USERS) {
    if (isDelete) {
      await deleteTestUser(user)
    } else {
      await createTestUser(user)
    }
    console.log('')
  }

  console.log('Done!')

  // Close connections
  await sql.end()
  process.exit(0)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
