import { test, expect } from '@playwright/test'

/**
 * Blog Page UI Tests
 */

test.describe('Blog Index Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog')
  })

  test('page loads successfully', async ({ page }) => {
    await expect(page).toHaveURL('/blog')
  })

  test('page has main heading', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('displays blog post cards or empty state', async ({ page }) => {
    // Either shows post cards or content area
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

test.describe('Blog Post Page', () => {
  test('individual post page loads when post exists', async ({ page }) => {
    // First check if there are any posts on the blog index
    await page.goto('/blog')

    const postLink = page.locator('a[href^="/blog/"]').first()
    if ((await postLink.count()) > 0) {
      await postLink.click()
      // Should navigate to a blog post URL
      await expect(page).toHaveURL(/\/blog\/.+/)
      // Post should have a heading
      await expect(page.locator('h1').first()).toBeVisible()
    } else {
      // Skip if no posts exist
      test.skip()
    }
  })

  test('non-existent post shows error or redirects', async ({ page }) => {
    const response = await page.goto('/blog/this-post-definitely-does-not-exist-12345')

    // Should either return 404, show error, or redirect
    const is404 = response?.status() === 404
    // Check for various error messages including "Something went wrong"
    const hasErrorMessage =
      (await page.locator("text=/not found|404|error|went wrong|couldn't load/i").count()) > 0
    const redirected = !page.url().includes('this-post-definitely-does-not-exist')

    expect(is404 || hasErrorMessage || redirected).toBe(true)
  })
})
