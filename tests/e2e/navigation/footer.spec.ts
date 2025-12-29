import { test, expect } from '@playwright/test'

/**
 * Footer Navigation Tests
 *
 * Verifies all footer links work and redirect to actual pages.
 */

test.describe('Footer Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('footer is visible on homepage', async ({ page }) => {
    // Scroll to bottom to reveal footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500) // Allow animations to settle
    await expect(page.locator('footer').last()).toBeVisible()
  })

  test('brand logo in footer links to homepage', async ({ page }) => {
    await page.goto('/about')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await page.locator('footer a[href="/"]').last().click()
    await expect(page).toHaveURL('/')
  })

  test.describe('Quick Links', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(500)
    })

    test('About link works', async ({ page }) => {
      await page.locator('footer a[href="/about"]').last().click()
      await expect(page).toHaveURL('/about')
    })

    test('Blog link works', async ({ page }) => {
      await page.locator('footer a[href="/blog"]').last().click()
      await expect(page).toHaveURL('/blog')
    })

    test('Events link works', async ({ page }) => {
      await page.locator('footer a[href="/events"]').last().click()
      await expect(page).toHaveURL('/events')
    })

    test.describe('Book link', () => {
      // Expected to fail - page not implemented yet
      test.fixme('Book link works', async ({ page }) => {
        await page.locator('footer a[href="/book"]').last().click()
        await expect(page).toHaveURL('/book')
      })
    })
  })

  test.describe('Legal Links', () => {
    // Expected to fail - pages not implemented yet
    test.fixme('Privacy link works', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.locator('footer a[href="/privacy"]').last().click()
      await expect(page).toHaveURL('/privacy')
    })

    test.fixme('Terms link works', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.locator('footer a[href="/terms"]').last().click()
      await expect(page).toHaveURL('/terms')
    })
  })

  test.describe('Social Links', () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(500)
    })

    test('social links are visible', async ({ page }) => {
      await expect(page.locator('footer a[aria-label="Instagram"]')).toBeVisible()
      await expect(page.locator('footer a[aria-label="TikTok"]')).toBeVisible()
      await expect(page.locator('footer a[aria-label="YouTube"]')).toBeVisible()
    })

    test('social links have correct attributes', async ({ page }) => {
      const instagramLink = page.locator('footer a[aria-label="Instagram"]')
      await expect(instagramLink).toHaveAttribute('target', '_blank')
      await expect(instagramLink).toHaveAttribute('rel', /noopener/)
    })
  })

  test.describe('Copyright', () => {
    test('copyright text is visible', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(500)
      const currentYear = new Date().getFullYear()
      await expect(page.locator('footer').last()).toContainText(String(currentYear))
    })
  })
})
