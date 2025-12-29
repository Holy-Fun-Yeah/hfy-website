import { test, expect, type APIRequestContext } from '@playwright/test'

/**
 * Authentication E2E Tests
 *
 * Tests for user registration and sign-in flows.
 * Uses atomic cleanup to remove test users after each test.
 *
 * NOTE: Tests that require database access will be skipped if Supabase is not configured.
 */

// Test user credentials (unique per test run to avoid conflicts)
const TEST_EMAIL = `e2e.test.${Date.now()}@example.com`
const TEST_PASSWORD = 'TestPassword123!'
const TEST_NAME = 'E2E Test User'

/**
 * Check if Supabase is configured by trying to access a test endpoint
 */
async function isSupabaseConfigured(request: APIRequestContext): Promise<boolean> {
  try {
    const response = await request.get(`/api/test/verify-user?email=test@test.com`)
    const data = await response.json()
    // If we get a "not configured" error, Supabase is not set up
    if (
      data.error?.message?.includes('not configured') ||
      data.error?.message?.includes('not available')
    ) {
      return false
    }
    return true
  } catch {
    return false
  }
}

/**
 * Helper to cleanup test user via API
 */
async function cleanupTestUser(request: APIRequestContext, email: string) {
  try {
    await request.delete('/api/test/cleanup-user', {
      data: { email },
    })
  } catch (e) {
    // Ignore cleanup errors - user may not exist
    console.log(`Cleanup for ${email}:`, e)
  }
}

/**
 * Helper to verify user exists in database
 */
async function verifyUserExists(request: APIRequestContext, email: string) {
  const response = await request.get(`/api/test/verify-user?email=${encodeURIComponent(email)}`)
  return response.json()
}

test.describe('User Registration', () => {
  // Cleanup before and after each test to ensure atomic tests
  test.beforeEach(async ({ request }) => {
    await cleanupTestUser(request, TEST_EMAIL)
  })

  test.afterEach(async ({ request }) => {
    await cleanupTestUser(request, TEST_EMAIL)
  })

  test('can register new user via form', async ({ page, request }) => {
    // Skip if Supabase is not configured
    const supabaseReady = await isSupabaseConfigured(request)
    test.skip(!supabaseReady, 'Supabase is not configured - skipping registration test')

    // Navigate to login page
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Switch to sign up mode
    await page.getByText('Create Account', { exact: false }).click()

    // Wait for form fields to appear
    await expect(page.locator('input#fullName')).toBeVisible()

    // Fill in the registration form
    await page.locator('input#fullName').fill(TEST_NAME)
    await page.locator('input#email').fill(TEST_EMAIL)

    // Fill phone (vue-tel-input component)
    const phoneInput = page.locator('.vue-tel-input input')
    await phoneInput.click()
    await phoneInput.fill('1234567890')

    await page.locator('input#password').fill(TEST_PASSWORD)
    await page.locator('input#confirmPassword').fill(TEST_PASSWORD)

    // Submit the form
    await page.getByRole('button', { name: /Create Account/i }).click()

    // Should show email confirmation message
    await expect(page.getByText(/check your inbox/i)).toBeVisible({ timeout: 10000 })

    // Verify user was created in database
    const verification = await verifyUserExists(request, TEST_EMAIL)
    const data = verification.data || verification

    expect(data.existsInAuth).toBe(true)
    expect(data.existsInProfiles).toBe(true)
    expect(data.authUser?.email).toBe(TEST_EMAIL)
    expect(data.profile?.displayName).toBe(TEST_NAME)
  })

  test('registration creates user in auth.users and public.profiles', async ({ page, request }) => {
    // Skip if Supabase is not configured
    const supabaseReady = await isSupabaseConfigured(request)
    test.skip(!supabaseReady, 'Supabase is not configured - skipping registration test')

    // Navigate to login and switch to sign up
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByText('Create Account', { exact: false }).click()
    await expect(page.locator('input#fullName')).toBeVisible()

    // Fill minimal required fields
    await page.locator('input#fullName').fill(TEST_NAME)
    await page.locator('input#email').fill(TEST_EMAIL)
    await page.locator('input#password').fill(TEST_PASSWORD)
    await page.locator('input#confirmPassword').fill(TEST_PASSWORD)

    // Submit
    await page.getByRole('button', { name: /Create Account/i }).click()

    // Wait for success
    await expect(page.getByText(/check your inbox/i)).toBeVisible({ timeout: 10000 })

    // Verify both tables have the user
    const verification = await verifyUserExists(request, TEST_EMAIL)
    const data = verification.data || verification

    // Check auth.users
    expect(data.existsInAuth).toBe(true)
    expect(data.authUser).toBeTruthy()
    expect(data.authUser.email).toBe(TEST_EMAIL)
    expect(data.authUser.userMetadata?.display_name).toBe(TEST_NAME)

    // Check public.profiles
    expect(data.existsInProfiles).toBe(true)
    expect(data.profile).toBeTruthy()
    expect(data.profile.email).toBe(TEST_EMAIL.toLowerCase())
    expect(data.profile.displayName).toBe(TEST_NAME)

    // Both should share the same ID (UUID)
    expect(data.authUser.id).toBe(data.profile.id)
  })

  test('shows validation errors for invalid input', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByText('Create Account', { exact: false }).click()
    await expect(page.locator('input#fullName')).toBeVisible()

    // Fill with invalid data (short name) and move to next field to trigger blur
    await page.locator('input#fullName').fill('A') // Too short
    await page.locator('input#email').click() // Click next field to trigger blur on fullName

    // Should show name validation error
    await expect(page.getByText(/at least 2 characters/i)).toBeVisible()

    // Invalid email - fill and move to next field
    await page.locator('input#email').fill('notanemail')
    await page.locator('input#password').click() // Click next field to trigger blur on email

    // Should show email validation error
    await expect(page.getByText(/valid email/i)).toBeVisible()
  })

  test('shows error for password mismatch', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByText('Create Account', { exact: false }).click()
    await expect(page.locator('input#fullName')).toBeVisible()

    // Fill form with mismatched passwords
    await page.locator('input#fullName').fill(TEST_NAME)
    await page.locator('input#email').fill(TEST_EMAIL)
    await page.locator('input#password').fill(TEST_PASSWORD)
    await page.locator('input#confirmPassword').fill('DifferentPassword123!')

    // Blur confirm password to trigger validation
    await page.locator('input#confirmPassword').blur()

    // Should show password mismatch error
    await expect(page.getByText(/Passwords do not match/i)).toBeVisible()
  })

  test('prevents duplicate registration', async ({ page, request }) => {
    // Skip if Supabase is not configured
    const supabaseReady = await isSupabaseConfigured(request)
    test.skip(!supabaseReady, 'Supabase is not configured - skipping registration test')

    // First registration
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByText('Create Account', { exact: false }).click()
    await expect(page.locator('input#fullName')).toBeVisible()

    await page.locator('input#fullName').fill(TEST_NAME)
    await page.locator('input#email').fill(TEST_EMAIL)
    await page.locator('input#password').fill(TEST_PASSWORD)
    await page.locator('input#confirmPassword').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /Create Account/i }).click()
    await expect(page.getByText(/check your inbox/i)).toBeVisible({ timeout: 10000 })

    // Go back and try to register again with same email
    await page.getByText(/Back to Sign In/i).click()
    await page.getByText('Create Account', { exact: false }).click()
    await expect(page.locator('input#fullName')).toBeVisible()

    await page.locator('input#fullName').fill('Another User')
    await page.locator('input#email').fill(TEST_EMAIL)
    await page.locator('input#password').fill(TEST_PASSWORD)
    await page.locator('input#confirmPassword').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /Create Account/i }).click()

    // Should show error about existing account
    await expect(page.getByText(/already exists/i)).toBeVisible({ timeout: 10000 })
  })
})

test.describe('User Sign In', () => {
  test('sign in form is displayed correctly', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Check form elements
    await expect(page.locator('input#email')).toBeVisible()
    await expect(page.locator('input#password')).toBeVisible()
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible()
    await expect(page.getByText(/Forgot/i)).toBeVisible()
    await expect(page.getByText(/Create Account/i)).toBeVisible()
  })

  test('shows validation errors for empty sign in', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Focus and blur email field without entering anything
    await page.locator('input#email').click()
    await page.locator('input#email').blur()

    // Should show email required error
    await expect(page.getByText(/Email is required/i)).toBeVisible()

    // Focus and blur password field without entering anything
    await page.locator('input#password').click()
    await page.locator('input#password').blur()

    // Should show password required error
    await expect(page.getByText(/Password is required/i)).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page, request }) => {
    // Skip if Supabase is not configured
    const supabaseReady = await isSupabaseConfigured(request)
    test.skip(!supabaseReady, 'Supabase is not configured - skipping sign in test')

    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Try to sign in with wrong password
    await page.locator('input#email').fill('nonexistent@example.com')
    await page.locator('input#password').fill('wrongpassword')
    await page.getByRole('button', { name: /Sign In/i }).click()

    // Should show error message
    await expect(page.getByText(/Invalid email or password/i)).toBeVisible({ timeout: 10000 })
  })

  test('can navigate to forgot password', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Click forgot password
    await page.getByText(/Forgot/i).click()

    // Should show forgot password form
    await expect(page.getByText(/send.*reset.*link/i)).toBeVisible()
    await expect(page.locator('input#email')).toBeVisible()
    // Password field should be hidden
    await expect(page.locator('input#password')).not.toBeVisible()
  })
})

test.describe('Auth Flow Integration', () => {
  const FLOW_TEST_EMAIL = `e2e.flow.${Date.now()}@example.com`

  test.afterEach(async ({ request }) => {
    await cleanupTestUser(request, FLOW_TEST_EMAIL)
  })

  test('complete registration flow creates consistent data', async ({ page, request }) => {
    // Skip if Supabase is not configured
    const supabaseReady = await isSupabaseConfigured(request)
    test.skip(!supabaseReady, 'Supabase is not configured - skipping flow test')

    // Register
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    await page.getByText('Create Account', { exact: false }).click()
    await expect(page.locator('input#fullName')).toBeVisible()

    await page.locator('input#fullName').fill(TEST_NAME)
    await page.locator('input#email').fill(FLOW_TEST_EMAIL)
    await page.locator('input#password').fill(TEST_PASSWORD)
    await page.locator('input#confirmPassword').fill(TEST_PASSWORD)
    await page.getByRole('button', { name: /Create Account/i }).click()

    // Wait for success
    await expect(page.getByText(/check your inbox/i)).toBeVisible({ timeout: 10000 })

    // Verify data consistency
    const verification = await verifyUserExists(request, FLOW_TEST_EMAIL)
    const data = verification.data || verification

    // IDs should match between auth and profile
    expect(data.authUser?.id).toBe(data.profile?.id)

    // Email should be stored lowercase in profile
    expect(data.profile?.email).toBe(FLOW_TEST_EMAIL.toLowerCase())

    // Display name should match what was entered
    expect(data.profile?.displayName).toBe(TEST_NAME)

    // Auth metadata should have the display name
    expect(data.authUser?.userMetadata?.display_name).toBe(TEST_NAME)
  })
})
