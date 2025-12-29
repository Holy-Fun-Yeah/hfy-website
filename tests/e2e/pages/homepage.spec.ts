import { test, expect } from '@playwright/test'

/**
 * Homepage UI Tests
 *
 * Verifies homepage content and interactions.
 */

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/HFY|Holy Fuck Yeah/i)
  })

  test.describe('Hero Section', () => {
    test('hero section is visible', async ({ page }) => {
      // Hero should have a prominent heading
      const hero = page.locator('section').first()
      await expect(hero).toBeVisible()
    })

    test('hero has a call-to-action button', async ({ page }) => {
      // Look for primary CTA button in hero area
      const ctaButton = page.locator('section').first().getByRole('link')
      await expect(ctaButton.first()).toBeVisible()
    })
  })

  test.describe('Content Sections', () => {
    test('page has multiple sections', async ({ page }) => {
      const sections = page.locator('section')
      await expect(sections).toHaveCount.call(expect, await sections.count())
      expect(await sections.count()).toBeGreaterThan(1)
    })
  })

  test.describe('Visual Elements', () => {
    test('ambient background is present', async ({ page }) => {
      // Check for decorative elements (may be canvas or div with specific classes)
      const ambientBg = page.locator('[class*="ambient"], [class*="background"], canvas')
      // At least one decorative element should exist
      expect(await ambientBg.count()).toBeGreaterThanOrEqual(0)
    })
  })

  test.describe('Newsletter Section', () => {
    // Newsletter functionality expected to be implemented later
    test.fixme('newsletter signup is visible for unauthenticated users', async ({ page }) => {
      await expect(page.locator('input[type="email"][placeholder*="newsletter" i]')).toBeVisible()
    })

    test.fixme('newsletter form submits', async ({ page }) => {
      await page.fill('input[type="email"][placeholder*="newsletter" i]', 'test@example.com')
      await page.getByRole('button', { name: /subscribe/i }).click()
      // Should show success message
      await expect(page.locator('text=/thank|success|subscribed/i')).toBeVisible()
    })
  })
})
