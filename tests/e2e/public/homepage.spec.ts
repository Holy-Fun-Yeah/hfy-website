import { test, expect } from '@playwright/test'

/**
 * Public Homepage Tests
 *
 * Basic tests to verify the homepage loads and core elements are present.
 * These tests don't require authentication.
 */

test.describe('Homepage', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/HFY/)
  })

  test('has header with navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('banner')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
  })

  test('has main navigation links', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav a[href="/about"]')).toBeVisible()
    await expect(page.locator('nav a[href="/blog"]')).toBeVisible()
    await expect(page.locator('nav a[href="/events"]')).toBeVisible()
  })

  test('has login link', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('header a[href="/login"]')).toBeVisible()
  })
})

test.describe('Public Pages Load', () => {
  test('about page loads', async ({ page }) => {
    await page.goto('/about')
    await expect(page).toHaveURL('/about')
  })

  test('blog page loads', async ({ page }) => {
    await page.goto('/blog')
    await expect(page).toHaveURL('/blog')
  })

  test('events page loads', async ({ page }) => {
    await page.goto('/events')
    await expect(page).toHaveURL('/events')
  })

  test('login page loads', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL('/login')
    // Login form should be visible
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })
})
