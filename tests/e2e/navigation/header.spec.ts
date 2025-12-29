import { test, expect } from '@playwright/test'

/**
 * Header Navigation Tests
 *
 * Verifies all header links work and redirect to actual pages.
 */

test.describe('Header Navigation', () => {
  // Use specific selector for main navigation header (has fixed positioning)
  const mainHeader = 'header.fixed'

  test.beforeEach(async ({ page }) => {
    // Wait for network idle to ensure Vue has fully hydrated
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page.locator(mainHeader)).toBeVisible()
    // Small delay to ensure Vue reactivity is ready
    await page.waitForTimeout(500)
  })

  test('logo links to homepage', async ({ page }) => {
    // Navigate away first
    await page.goto('/about')
    await expect(page).toHaveURL('/about')

    // Click logo to return home
    await page.locator(`${mainHeader} a[href="/"]`).first().click()
    await expect(page).toHaveURL('/')
  })

  test.describe('Desktop Navigation Links', () => {
    test('Home link works', async ({ page }) => {
      await page.goto('/about')
      // Use text-based selector to get the "Home" link specifically (not the logo)
      await page.locator(`${mainHeader} nav`).getByRole('link', { name: 'Home' }).click()
      await expect(page).toHaveURL('/')
    })

    test('About link works', async ({ page }) => {
      await page.locator('nav a[href="/about"]').click()
      await expect(page).toHaveURL('/about')
      await expect(page.locator('h1').first()).toBeVisible()
    })

    test('Blog link works', async ({ page }) => {
      await page.locator('nav a[href="/blog"]').click()
      await expect(page).toHaveURL('/blog')
      await expect(page.locator('h1').first()).toBeVisible()
    })

    test('Events link works', async ({ page }) => {
      await page.locator('nav a[href="/events"]').click()
      await expect(page).toHaveURL('/events')
      await expect(page.locator('h1').first()).toBeVisible()
    })

    test.describe('Book link', () => {
      // Expected to fail - page not implemented yet
      test.fixme('Book link works', async ({ page }) => {
        await page.locator('nav a[href="/book"]').click()
        await expect(page).toHaveURL('/book')
        await expect(page.locator('h1').first()).toBeVisible()
      })
    })
  })

  test.describe('Auth Links (Unauthenticated)', () => {
    test('Login link is visible', async ({ page }) => {
      await expect(page.locator(`${mainHeader} a[href="/login"]`).first()).toBeVisible()
    })

    test('Login link works', async ({ page }) => {
      await page.locator(`${mainHeader} a[href="/login"]`).first().click()
      await expect(page).toHaveURL('/login')
      await expect(page.locator('input[type="email"]')).toBeVisible()
    })
  })

  test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('mobile menu button is visible', async ({ page }) => {
      await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible()
    })

    test('mobile menu opens and shows links', async ({ page }) => {
      const menuToggle = page.locator('[data-testid="mobile-menu-toggle"]')
      await expect(menuToggle).toBeVisible()

      // Click and wait for menu to appear
      await menuToggle.click()

      // Wait for the menu with extended timeout (motion animations can be slow)
      const mobileMenu = page.locator('[data-testid="mobile-menu"]')
      await expect(mobileMenu).toBeVisible({ timeout: 10000 })

      // Check nav links are visible in mobile menu
      await expect(mobileMenu.locator('a[href="/about"]')).toBeVisible({ timeout: 3000 })
      await expect(mobileMenu.locator('a[href="/blog"]')).toBeVisible({ timeout: 3000 })
    })

    test('mobile menu links work', async ({ page }) => {
      const menuToggle = page.locator('[data-testid="mobile-menu-toggle"]')
      await expect(menuToggle).toBeVisible()
      await menuToggle.click()

      // Wait for menu to appear
      const mobileMenu = page.locator('[data-testid="mobile-menu"]')
      await expect(mobileMenu).toBeVisible({ timeout: 10000 })

      // Click about link
      await mobileMenu.locator('a[href="/about"]').click()
      await expect(page).toHaveURL('/about')
    })
  })

  test.describe('Theme Toggle', () => {
    test('theme toggle button is visible', async ({ page }) => {
      await expect(page.locator('[data-testid="theme-toggle"]')).toBeVisible()
    })

    test('theme toggle changes theme', async ({ page }) => {
      const html = page.locator('html')
      const themeToggle = page.locator('[data-testid="theme-toggle"]')
      await expect(themeToggle).toBeVisible()

      // Get initial state via aria-label (more reliable than class)
      const initialLabel = await themeToggle.getAttribute('aria-label')
      const wasLightMode = initialLabel?.includes('dark mode') // "Switch to dark mode" = currently light

      // Click to toggle
      await themeToggle.click()

      // Wait for theme to change and check the aria-label changed
      await page.waitForTimeout(500)
      const newLabel = await themeToggle.getAttribute('aria-label')

      // The label should have changed (if was "Switch to dark mode", now "Switch to light mode")
      expect(newLabel).not.toBe(initialLabel)

      // Also verify the html class changed accordingly
      if (wasLightMode) {
        await expect(html).toHaveClass(/dark/)
      } else {
        // Was dark, now should be light (no dark class)
        const htmlClass = await html.getAttribute('class')
        expect(htmlClass?.includes('dark')).toBe(false)
      }
    })
  })

  test.describe('Language Switcher', () => {
    test('language menu is accessible', async ({ page }) => {
      await expect(page.locator('[data-testid="lang-switcher"]')).toBeVisible()
    })

    test('language menu opens on click', async ({ page }) => {
      const langSwitcher = page.locator('[data-testid="lang-switcher"]')
      await expect(langSwitcher).toBeVisible()
      await langSwitcher.click()

      // Wait for dropdown to appear
      const langDropdown = page.locator('[data-testid="lang-dropdown"]')
      await expect(langDropdown).toBeVisible({ timeout: 3000 })

      // Verify dropdown contains language options
      await expect(langDropdown.locator('button').first()).toBeVisible()
    })
  })
})
