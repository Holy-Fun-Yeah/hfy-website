import { test, expect } from '@playwright/test'

/**
 * Navigation E2E Tests
 *
 * Tests for header navigation links and routing
 */

test.describe('Header Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
  })

  test('homepage loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/HFY/)
    // Check navigation header is visible (use role=banner which is the main header)
    await expect(page.getByRole('banner')).toBeVisible()
  })

  test('navigation links are visible', async ({ page }) => {
    // Check main nav links exist (use first() since logo also links to /)
    await expect(page.locator('nav a[href="/"]').first()).toBeVisible()
    await expect(page.locator('nav a[href="/about"]')).toBeVisible()
    await expect(page.locator('nav a[href="/blog"]')).toBeVisible()
    await expect(page.locator('nav a[href="/events"]')).toBeVisible()
  })

  test('can navigate to About page', async ({ page }) => {
    await page.click('nav a[href="/about"]')
    await expect(page).toHaveURL('/about')
  })

  test('can navigate to Blog page', async ({ page }) => {
    await page.click('nav a[href="/blog"]')
    await expect(page).toHaveURL('/blog')
  })

  test('can navigate to Events page', async ({ page }) => {
    await page.click('nav a[href="/events"]')
    await expect(page).toHaveURL('/events')
  })
})

test.describe('Login Button', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('login link exists in header', async ({ page }) => {
    // Look for the login link - should be an <a> tag with href="/login"
    const loginLink = page.locator('header a[href="/login"]')
    await expect(loginLink).toBeVisible()
  })

  test('login link has text content', async ({ page }) => {
    const loginLink = page.locator('header a[href="/login"]')
    const text = await loginLink.textContent()
    console.log('Login link text:', text)
    expect(text?.trim()).toBeTruthy()
  })

  test('login link renders as anchor tag', async ({ page }) => {
    const loginLink = page.locator('header a[href="/login"]')
    const tagName = await loginLink.evaluate((el) => el.tagName.toLowerCase())
    console.log('Login link tag name:', tagName)
    expect(tagName).toBe('a')
  })

  test('clicking login link navigates to /login', async ({ page }) => {
    const loginLink = page.locator('header a[href="/login"]')

    // Debug: Get info about the element before clicking
    const href = await loginLink.getAttribute('href')
    const isVisible = await loginLink.isVisible()
    const boundingBox = await loginLink.boundingBox()

    console.log('Login link debug:')
    console.log('  href:', href)
    console.log('  isVisible:', isVisible)
    console.log('  boundingBox:', boundingBox)

    // Click and wait for navigation
    await loginLink.click()
    await page.waitForURL('**/login')

    expect(page.url()).toContain('/login')
  })

  test('login page loads and shows form', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Check we're on the login page
    expect(page.url()).toContain('/login')

    // Check for form elements
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    // Submit button is a BaseButton component - check for button with Sign In text
    await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible()
  })
})

test.describe('Login Page Direct Access', () => {
  test('can access /login directly', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/login')
  })

  test('login page has sign in form', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Check form fields exist
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    const submitButton = page.getByRole('button', { name: /Sign In/i })

    await expect(emailInput).toBeVisible()
    await expect(passwordInput).toBeVisible()
    await expect(submitButton).toBeVisible()
  })

  test('can toggle between sign in and sign up', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Find the "Create Account" link/button
    const createAccountLink = page.getByText('Create Account', { exact: false })
    await expect(createAccountLink).toBeVisible()

    // Click it
    await createAccountLink.click()

    // Should now show confirm password field
    const confirmPasswordInput = page.locator('input#confirmPassword')
    await expect(confirmPasswordInput).toBeVisible()
  })

  test('sign up form shows name and phone fields', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // Click Create Account to switch to sign up mode
    await page.getByText('Create Account', { exact: false }).click()

    // Verify name field is visible
    const fullNameInput = page.locator('input#fullName')
    await expect(fullNameInput).toBeVisible()

    // Verify phone field is visible (vue-tel-input component)
    const phoneInput = page.locator('.vue-tel-input input')
    await expect(phoneInput).toBeVisible()

    // Verify email and password are still there
    await expect(page.locator('input#email')).toBeVisible()
    await expect(page.locator('input#password')).toBeVisible()
    await expect(page.locator('input#confirmPassword')).toBeVisible()
  })

  test('has forgot password link', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const forgotPasswordLink = page.getByText('Forgot', { exact: false })
    await expect(forgotPasswordLink).toBeVisible()
  })
})

test.describe('Header Login Button Debug', () => {
  test('inspect all header links', async ({ page }) => {
    // Capture console errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    page.on('pageerror', (err) => {
      consoleErrors.push(`Page Error: ${err.message}`)
    })

    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Wait for Vue app to render (look for header instead of networkidle)
    await page.waitForSelector('header', { timeout: 30000 })

    // Log any console errors
    if (consoleErrors.length > 0) {
      console.log('\n=== Console Errors ===')
      consoleErrors.forEach((e) => console.log(`  ${e}`))
    }

    // Get all links in header
    const headerLinks = await page.locator('header a').all()

    console.log('\n=== Header Links ===')
    for (const link of headerLinks) {
      const href = await link.getAttribute('href')
      const text = await link.textContent()
      const isVisible = await link.isVisible()
      console.log(`  href: ${href}, text: "${text?.trim()}", visible: ${isVisible}`)
    }

    // Specifically look for /login
    const loginLinks = await page.locator('a[href="/login"]').all()
    console.log(`\n=== Links with href="/login": ${loginLinks.length} ===`)
    for (const link of loginLinks) {
      const parent = await link.evaluate((el) => el.parentElement?.className)
      const classes = await link.getAttribute('class')
      const text = await link.textContent()
      const isVisible = await link.isVisible()
      console.log(`  text: "${text?.trim()}", visible: ${isVisible}`)
      console.log(`  classes: ${classes}`)
      console.log(`  parent classes: ${parent}`)
    }
  })

  test('check if NuxtLink renders as anchor', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Take a screenshot for debugging
    await page.screenshot({ path: 'tests/e2e/screenshots/header-debug.png', fullPage: false })

    // Check what's in the user menu area
    const userMenuArea = page.locator('header').locator('.relative.hidden.sm\\:block').first()
    const innerHTML = await userMenuArea.innerHTML()
    console.log('\n=== User Menu Area HTML ===')
    console.log(innerHTML)
  })
})
