import { test, expect } from '@playwright/test'

/**
 * Events Page UI Tests
 */

test.describe('Events Index Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/events')
  })

  test('page loads successfully', async ({ page }) => {
    await expect(page).toHaveURL('/events')
  })

  test('page has main heading', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('displays event cards or content area', async ({ page }) => {
    // Either shows event cards or content area
    const content = page.locator('main')
    await expect(content).toBeVisible()
  })

  test('page has header and footer', async ({ page }) => {
    await expect(page.locator('header.fixed')).toBeVisible()
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await expect(page.locator('footer').last()).toBeVisible()
  })
})

test.describe('Event Detail Page', () => {
  test('individual event page loads when event exists', async ({ page }) => {
    // First check if there are any events on the events index
    await page.goto('/events')

    const eventLink = page.locator('a[href^="/events/"]').first()
    if ((await eventLink.count()) > 0) {
      await eventLink.click()
      // Should navigate to an event URL
      await expect(page).toHaveURL(/\/events\/.+/)
      // Event should have a heading
      await expect(page.locator('h1').first()).toBeVisible()
    } else {
      // Skip if no events exist
      test.skip()
    }
  })

  test('non-existent event shows error or redirects', async ({ page }) => {
    const response = await page.goto('/events/this-event-definitely-does-not-exist-12345')

    // Should either return 404, show error, or redirect
    const is404 = response?.status() === 404
    // Check for various error messages including "Something went wrong"
    const hasErrorMessage =
      (await page.locator("text=/not found|404|error|went wrong|couldn't load/i").count()) > 0
    const redirected = !page.url().includes('this-event-definitely-does-not-exist')

    expect(is404 || hasErrorMessage || redirected).toBe(true)
  })
})
