import { test, expect } from '@playwright/test'

/**
 * About Page UI Tests
 */

test.describe('About Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about')
  })

  test('page loads successfully', async ({ page }) => {
    await expect(page).toHaveURL('/about')
  })

  test('page has main heading', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('page has descriptive content', async ({ page }) => {
    // Page should have paragraphs of content
    const paragraphs = page.locator('p')
    expect(await paragraphs.count()).toBeGreaterThan(0)
  })

  test('page has header and footer', async ({ page }) => {
    await expect(page.locator('header.fixed')).toBeVisible()
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)
    await expect(page.locator('footer').last()).toBeVisible()
  })

  test('navigation links work from about page', async ({ page }) => {
    // Can navigate to other pages from about
    await page.locator('nav a[href="/blog"]').click()
    await expect(page).toHaveURL('/blog')
  })
})
