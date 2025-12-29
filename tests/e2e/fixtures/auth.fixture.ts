/**
 * Authentication Fixtures for Playwright E2E Tests
 *
 * Provides reusable fixtures for authenticated test scenarios:
 * - `authenticatedPage` - Page with regular user auth (test-user@hfy.test)
 * - `adminPage` - Page with admin auth (test-admin@hfy.test)
 *
 * Usage:
 *   import { test, expect } from '../fixtures'
 *
 *   test('member can view dashboard', async ({ authenticatedPage }) => {
 *     await authenticatedPage.goto('/member')
 *     // ...
 *   })
 *
 *   test('admin can edit posts', async ({ adminPage }) => {
 *     await adminPage.goto('/admin/posts')
 *     // ...
 *   })
 */

import { test as base, type Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Storage state directory (gitignored)
const AUTH_DIR = path.join(__dirname, '../.auth')
const USER_AUTH_FILE = path.join(AUTH_DIR, 'user.json')
const ADMIN_AUTH_FILE = path.join(AUTH_DIR, 'admin.json')

// Test user credentials (must match seed-test-users.ts)
export const TEST_USER = {
  email: 'test-user@hfy.test',
  password: 'TestUser123!',
} as const

export const TEST_ADMIN = {
  email: 'test-admin@hfy.test',
  password: 'TestAdmin123!',
} as const

// Type for our extended fixtures
type AuthFixtures = {
  authenticatedPage: Page
  adminPage: Page
}

type AuthWorkerFixtures = {
  userStorageState: string
  adminStorageState: string
}

/**
 * Helper to login and save storage state
 */
async function loginAndSaveState(
  browser: import('@playwright/test').Browser,
  credentials: { email: string; password: string },
  storageFile: string
): Promise<string> {
  // Ensure auth directory exists
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true })
  }

  // Create a fresh context for login
  const context = await browser.newContext({ storageState: undefined })
  const page = await context.newPage()

  try {
    // Navigate to login page
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Fill login form
    await page.locator('input#email').fill(credentials.email)
    await page.locator('input#password').fill(credentials.password)

    // Submit and wait for redirect
    await page.getByRole('button', { name: /Sign In/i }).click()

    // Wait for successful login (redirect away from /login)
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 })

    // Save storage state
    await context.storageState({ path: storageFile })

    return storageFile
  } finally {
    await context.close()
  }
}

/**
 * Extended test with authentication fixtures
 */
export const test = base.extend<AuthFixtures, AuthWorkerFixtures>({
  // Worker-scoped: Login as user once per worker, reuse auth state
  userStorageState: [
    async ({ browser }, use) => {
      // Check if we have cached auth state
      if (fs.existsSync(USER_AUTH_FILE)) {
        // Verify it's not stale (older than 1 hour)
        const stats = fs.statSync(USER_AUTH_FILE)
        const ageMs = Date.now() - stats.mtimeMs
        if (ageMs < 60 * 60 * 1000) {
          await use(USER_AUTH_FILE)
          return
        }
      }

      // Login and save state
      const statePath = await loginAndSaveState(browser, TEST_USER, USER_AUTH_FILE)
      await use(statePath)
    },
    { scope: 'worker' },
  ],

  // Worker-scoped: Login as admin once per worker, reuse auth state
  adminStorageState: [
    async ({ browser }, use) => {
      // Check if we have cached auth state
      if (fs.existsSync(ADMIN_AUTH_FILE)) {
        // Verify it's not stale (older than 1 hour)
        const stats = fs.statSync(ADMIN_AUTH_FILE)
        const ageMs = Date.now() - stats.mtimeMs
        if (ageMs < 60 * 60 * 1000) {
          await use(ADMIN_AUTH_FILE)
          return
        }
      }

      // Login and save state
      const statePath = await loginAndSaveState(browser, TEST_ADMIN, ADMIN_AUTH_FILE)
      await use(statePath)
    },
    { scope: 'worker' },
  ],

  // Per-test: Create a page with user authentication
  authenticatedPage: async ({ browser, userStorageState }, use) => {
    const context = await browser.newContext({ storageState: userStorageState })
    const page = await context.newPage()
    await use(page)
    await context.close()
  },

  // Per-test: Create a page with admin authentication
  adminPage: async ({ browser, adminStorageState }, use) => {
    const context = await browser.newContext({ storageState: adminStorageState })
    const page = await context.newPage()
    await use(page)
    await context.close()
  },
})

export { expect } from '@playwright/test'
