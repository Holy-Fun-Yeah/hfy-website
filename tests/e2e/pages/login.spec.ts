import { test, expect } from '@playwright/test'

/**
 * Login Page UI Tests
 */

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('page loads successfully', async ({ page }) => {
    await expect(page).toHaveURL('/login')
  })

  test('has email input field', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('has password input field', async ({ page }) => {
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('has submit button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /sign in|login|submit/i })).toBeVisible()
  })

  test('has link to sign up', async ({ page }) => {
    // Should have a way to switch to sign up mode or link
    const signUpLink = page.locator('text=/sign up|create account|register/i')
    await expect(signUpLink.first()).toBeVisible()
  })

  test('has forgot password link', async ({ page }) => {
    await expect(page.locator('text=/forgot|reset password/i').first()).toBeVisible()
  })

  test.describe('Form Validation', () => {
    test('shows error for empty submission', async ({ page }) => {
      await page.getByRole('button', { name: /sign in|login|submit/i }).click()

      // Should show validation error (either native HTML5 or custom)
      const emailInput = page.locator('input[type="email"]')
      const isInvalid =
        (await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)) ||
        (await page.locator('text=/required|invalid|enter/i').count()) > 0

      expect(isInvalid).toBe(true)
    })

    test('shows error for invalid email format', async ({ page }) => {
      await page.fill('input[type="email"]', 'not-an-email')
      await page.fill('input[type="password"]', 'password123')
      await page.getByRole('button', { name: /sign in|login|submit/i }).click()

      // Should show validation error
      const emailInput = page.locator('input[type="email"]')
      const isInvalid =
        (await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)) ||
        (await page.locator('text=/invalid|email/i').count()) > 0

      expect(isInvalid).toBe(true)
    })
  })

  test.describe('Sign Up Mode', () => {
    test('can switch to sign up mode', async ({ page }) => {
      await page.locator('text=/sign up|create account|register/i').first().click()

      // Should show sign up form elements
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
    })
  })

  test.describe('Forgot Password Mode', () => {
    test('can switch to forgot password mode', async ({ page }) => {
      await page.locator('text=/forgot|reset password/i').first().click()

      // Should show email input for password reset
      await expect(page.locator('input[type="email"]')).toBeVisible()
    })
  })
})

test.describe('Login Flow', () => {
  test('invalid credentials show feedback', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'wrong@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.getByRole('button', { name: /sign in|login|submit/i }).click()

    // Should either show error message, loading state, or stay on login page
    // Wait for potential async operation
    await page.waitForTimeout(3000)

    // Check that we're still on login or showing feedback
    const stillOnLogin = page.url().includes('/login')
    const hasErrorOrLoading =
      (await page.locator('text=/invalid|incorrect|failed|error|loading/i').count()) > 0
    const hasFormVisible = await page.locator('input[type="email"]').isVisible()

    expect(stillOnLogin || hasErrorOrLoading || hasFormVisible).toBe(true)
  })
})
