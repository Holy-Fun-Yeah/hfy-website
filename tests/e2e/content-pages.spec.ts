import { test, expect } from '@playwright/test'

/**
 * Content Pages E2E Tests
 *
 * Tests for blog and events pages that load content from API
 */

test.describe('Blog Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog')
    await page.waitForLoadState('networkidle')
  })

  test('blog page loads correctly', async ({ page }) => {
    await expect(page).toHaveURL('/blog')
    // Check for hero section
    await expect(page.locator('h1')).toBeVisible()
  })

  test('blog page shows loading state or content', async ({ page }) => {
    // Either shows skeleton loading or actual content
    const hasContent = await page.locator('[class*="grid"]').count()
    expect(hasContent).toBeGreaterThan(0)
  })

  test('blog page handles empty state gracefully', async ({ page }) => {
    // Page should not show error even if no posts
    const errorElement = page.locator('text=/error/i')
    const errorCount = await errorElement.count()
    // Should either have no errors or show a user-friendly empty state
    expect(errorCount).toBeLessThanOrEqual(1) // Allow for "error" in unrelated text
  })

  test('blog page has newsletter section', async ({ page }) => {
    // Check for newsletter CTA
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()
  })
})

test.describe('Events Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/events')
    await page.waitForLoadState('networkidle')
  })

  test('events page loads correctly', async ({ page }) => {
    await expect(page).toHaveURL('/events')
    // Check for hero section
    await expect(page.locator('h1')).toBeVisible()
  })

  test('events page has filter tabs', async ({ page }) => {
    // Check for upcoming/past filter buttons
    const upcomingButton = page.locator('button').filter({ hasText: /upcoming/i })
    const pastButton = page.locator('button').filter({ hasText: /past/i })

    await expect(upcomingButton).toBeVisible()
    await expect(pastButton).toBeVisible()
  })

  test('can switch between upcoming and past events', async ({ page }) => {
    // Click on past events tab
    const pastButton = page.locator('button').filter({ hasText: /past/i })
    await pastButton.click()

    // Past tab should now be active (has accent underline)
    await expect(pastButton).toHaveClass(/text-brand-accent/)
  })

  test('events page shows loading state or content', async ({ page }) => {
    // Either shows skeleton loading or actual content
    const hasContent = await page.locator('[class*="grid"]').count()
    expect(hasContent).toBeGreaterThan(0)
  })

  test('events page handles empty state gracefully', async ({ page }) => {
    // Page should not show error even if no events
    const errorElement = page.locator('text=/error/i')
    const errorCount = await errorElement.count()
    expect(errorCount).toBeLessThanOrEqual(1)
  })

  test('events page has CTA section', async ({ page }) => {
    // Check for book now CTA
    const ctaButton = page.locator('a[href="/book"]')
    const count = await ctaButton.count()
    expect(count).toBeGreaterThan(0)
  })
})
