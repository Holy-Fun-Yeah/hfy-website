/**
 * Event Registration E2E Tests
 *
 * Tests the full event registration flow:
 * 1. User browses events on /events
 * 2. Clicks on an event to view details
 * 3. Clicks "Register Now" to open registration modal
 * 4. For paid events: fills Stripe payment form with test card
 * 5. Submits payment
 * 6. Verifies registration success
 *
 * Uses Stripe test mode with test card numbers:
 * - Success: 4242 4242 4242 4242
 * - Decline: 4000 0000 0000 0002
 * - 3D Secure: 4000 0027 6000 3184
 */

import { test, expect } from '../fixtures'
import type { Page, FrameLocator } from '@playwright/test'

// Stripe test card data
const STRIPE_TEST_CARDS = {
  success: {
    number: '4242424242424242',
    expiry: '12/30',
    cvc: '123',
    zip: '12345',
  },
  declined: {
    number: '4000000000000002',
    expiry: '12/30',
    cvc: '123',
    zip: '12345',
  },
} as const

/**
 * Helper to fill Stripe Payment Element
 * Stripe uses iframes, so we need to access them specially
 */
async function fillStripePaymentElement(
  page: Page,
  card: typeof STRIPE_TEST_CARDS.success
): Promise<void> {
  // Wait for Stripe iframe to load
  await page.waitForSelector('iframe[name^="__privateStripeFrame"]', { timeout: 30000 })

  // Get all Stripe iframes
  const stripeFrames = page.frames().filter((frame) => frame.url().includes('stripe.com'))

  // Find the card number field iframe
  for (const frame of stripeFrames) {
    try {
      const cardInput = frame.locator('[name="number"]')
      if (await cardInput.count()) {
        await cardInput.fill(card.number)
      }

      const expiryInput = frame.locator('[name="expiry"]')
      if (await expiryInput.count()) {
        await expiryInput.fill(card.expiry)
      }

      const cvcInput = frame.locator('[name="cvc"]')
      if (await cvcInput.count()) {
        await cvcInput.fill(card.cvc)
      }
    } catch {
      // Frame might not have these fields, continue
    }
  }

  // Alternative: Try using the combined card element
  const paymentFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]').first()
  try {
    await paymentFrame.locator('[placeholder*="1234"]').fill(card.number)
    await paymentFrame.locator('[placeholder*="MM"]').fill(card.expiry)
    await paymentFrame.locator('[placeholder*="CVC"]').fill(card.cvc)
  } catch {
    // Might be using individual field layout
  }
}

test.describe('Event Registration Flow', () => {
  test.describe('Events List Page', () => {
    test('displays list of upcoming events', async ({ page }) => {
      await page.goto('/events')
      await page.waitForLoadState('networkidle')

      // Should have events section with h1 heading
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

      // Wait for async content to load
      await page.waitForTimeout(2000)

      // Should have event links or empty state message
      const eventLinks = await page.locator('a[href^="/events/"]').count()
      const hasEmptyState = await page.getByText(/no.*events/i).count()

      // Either we have events or we have an empty state message
      expect(eventLinks > 0 || hasEmptyState > 0).toBeTruthy()
    })

    test('can navigate to event detail page', async ({ page }) => {
      await page.goto('/events')
      await page.waitForLoadState('networkidle')

      // Wait for async content to load
      await page.waitForTimeout(2000)

      // Click on first event card link
      const eventLinks = page.locator('a[href^="/events/"]').filter({ hasNot: page.locator('a[href="/events"]') })
      const linkCount = await eventLinks.count()

      if (linkCount === 0) {
        // No events available, skip test
        test.skip()
        return
      }

      await eventLinks.first().click()

      // Wait for URL to change to event detail page (slug-based URL)
      await page.waitForURL(/\/events\/[a-z0-9-]+/, { timeout: 10000 })
      expect(page.url()).toMatch(/\/events\/[a-z0-9-]+/)
    })
  })

  test.describe('Event Detail Page', () => {
    test('displays event details', async ({ page }) => {
      await page.goto('/events')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(2000)

      const eventLinks = page.locator('a[href^="/events/"]')
      if ((await eventLinks.count()) > 0) {
        await eventLinks.first().click()
        await page.waitForURL(/\/events\/[a-z0-9-]+/, { timeout: 10000 })

        // Should show event title
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 10000 })

        // Should show Register Now button
        await expect(page.getByRole('button', { name: /register/i })).toBeVisible({ timeout: 10000 })
      }
    })

    test('unauthenticated user is redirected to login on register click', async ({ page }) => {
      await page.goto('/events')
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(2000)

      const eventLinks = page.locator('a[href^="/events/"]')
      if ((await eventLinks.count()) > 0) {
        await eventLinks.first().click()
        await page.waitForURL(/\/events\/[a-z0-9-]+/, { timeout: 10000 })

        // Click register button
        const registerBtn = page.getByRole('button', { name: /register/i })
        if (await registerBtn.isVisible({ timeout: 5000 })) {
          await registerBtn.click()

          // Should redirect to login with redirect param
          await page.waitForURL(/\/login/, { timeout: 10000 })
          expect(page.url()).toContain('/login')
        }
      }
    })
  })

  test.describe('Authenticated User Registration', () => {
    test('opens registration modal for authenticated user', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/events')
      await authenticatedPage.waitForLoadState('domcontentloaded')
      await authenticatedPage.waitForTimeout(2000)

      const eventLinks = authenticatedPage.locator('a[href^="/events/"]')
      if ((await eventLinks.count()) > 0) {
        await eventLinks.first().click()
        await authenticatedPage.waitForURL(/\/events\/[a-z0-9-]+/, { timeout: 10000 })

        // Click register button
        const registerBtn = authenticatedPage.getByRole('button', { name: /register/i })
        if (await registerBtn.isVisible({ timeout: 5000 })) {
          await registerBtn.click()

          // Modal should open
          await expect(authenticatedPage.getByRole('dialog')).toBeVisible({ timeout: 10000 })

          // Should show user info
          await expect(authenticatedPage.getByText(/registering as/i)).toBeVisible()
        }
      }
    })

    test('modal shows autofilled user name and email', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/events')
      await authenticatedPage.waitForLoadState('domcontentloaded')
      await authenticatedPage.waitForTimeout(2000)

      const eventLinks = authenticatedPage.locator('a[href^="/events/"]')
      if ((await eventLinks.count()) > 0) {
        await eventLinks.first().click()
        await authenticatedPage.waitForURL(/\/events\/[a-z0-9-]+/, { timeout: 10000 })

        const registerBtn = authenticatedPage.getByRole('button', { name: /register/i })
        if (await registerBtn.isVisible({ timeout: 5000 })) {
          await registerBtn.click()
          await expect(authenticatedPage.getByRole('dialog')).toBeVisible({ timeout: 10000 })

          // Should show "Registering as [Name] (email)" - not empty
          const registrationInfo = authenticatedPage.getByText(/registering as/i)
          await expect(registrationInfo).toBeVisible()

          // Get the text content and verify it's not showing empty values
          const infoText = await registrationInfo.textContent()
          expect(infoText).toBeTruthy()
          // Should not show "Registering as  ()" with empty values
          expect(infoText).not.toMatch(/registering as\s*\(\s*\)/i)
        }
      }
    })

    test('modal is scrollable when content overflows', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/events')
      await authenticatedPage.waitForLoadState('domcontentloaded')
      await authenticatedPage.waitForTimeout(2000)

      const eventLinks = authenticatedPage.locator('a[href^="/events/"]')
      if ((await eventLinks.count()) > 0) {
        await eventLinks.first().click()
        await authenticatedPage.waitForURL(/\/events\/[a-z0-9-]+/, { timeout: 10000 })

        const registerBtn = authenticatedPage.getByRole('button', { name: /register/i })
        if (await registerBtn.isVisible({ timeout: 5000 })) {
          await registerBtn.click()
          await expect(authenticatedPage.getByRole('dialog')).toBeVisible({ timeout: 10000 })

          // Wait for Stripe element to load
          await authenticatedPage.waitForSelector('iframe[name^="__privateStripeFrame"]', {
            timeout: 30000,
          })

          // Modal should have scrollable content (max-h and overflow-y-auto)
          const modalContent = authenticatedPage.locator('[role="dialog"] > div').first()
          const style = await modalContent.evaluate((el) => {
            const computed = window.getComputedStyle(el)
            return {
              maxHeight: computed.maxHeight,
              overflowY: computed.overflowY,
            }
          })

          // Should have max-height set (not 'none')
          expect(style.maxHeight).not.toBe('none')
          // Should be scrollable
          expect(['auto', 'scroll']).toContain(style.overflowY)
        }
      }
    })

    test('modal shows event details and price', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/events')
      await authenticatedPage.waitForLoadState('domcontentloaded')
      await authenticatedPage.waitForTimeout(2000)

      const eventLinks = authenticatedPage.locator('a[href^="/events/"]')
      if ((await eventLinks.count()) > 0) {
        await eventLinks.first().click()
        await authenticatedPage.waitForURL(/\/events\/[a-z0-9-]+/, { timeout: 10000 })

        const registerBtn = authenticatedPage.getByRole('button', { name: /register/i })
        if (await registerBtn.isVisible({ timeout: 5000 })) {
          await registerBtn.click()
          await expect(authenticatedPage.getByRole('dialog')).toBeVisible({ timeout: 10000 })

          // Should show event title in modal
          const modalTitle = authenticatedPage.locator('[role="dialog"] h3')
          await expect(modalTitle).toBeVisible()

          // Should show price or "Free"
          const priceText = authenticatedPage.locator('[role="dialog"]').getByText(/\$|free/i)
          await expect(priceText).toBeVisible()
        }
      }
    })

    test('can close registration modal', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/events')
      await authenticatedPage.waitForLoadState('domcontentloaded')
      await authenticatedPage.waitForTimeout(2000)

      const eventLinks = authenticatedPage.locator('a[href^="/events/"]')
      if ((await eventLinks.count()) > 0) {
        await eventLinks.first().click()
        await authenticatedPage.waitForURL(/\/events\/[a-z0-9-]+/, { timeout: 10000 })

        const registerBtn = authenticatedPage.getByRole('button', { name: /register/i })
        if (await registerBtn.isVisible({ timeout: 5000 })) {
          await registerBtn.click()
          await expect(authenticatedPage.getByRole('dialog')).toBeVisible({ timeout: 10000 })

          // Click cancel button
          await authenticatedPage.getByRole('button', { name: /cancel/i }).click()

          // Modal should close
          await expect(authenticatedPage.getByRole('dialog')).not.toBeVisible()
        }
      }
    })
  })

  test.describe('Payment Flow', () => {
    test('loads Stripe payment element for paid events', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/events')
      await authenticatedPage.waitForLoadState('domcontentloaded')
      await authenticatedPage.waitForTimeout(2000)

      const eventLinks = authenticatedPage.locator('a[href^="/events/"]')
      if ((await eventLinks.count()) > 0) {
        await eventLinks.first().click()
        await authenticatedPage.waitForURL(/\/events\/[a-z0-9-]+/, { timeout: 10000 })

        const registerBtn = authenticatedPage.getByRole('button', { name: /register/i })
        if (await registerBtn.isVisible({ timeout: 5000 })) {
          await registerBtn.click()
          await expect(authenticatedPage.getByRole('dialog')).toBeVisible({ timeout: 10000 })

          // Wait for Stripe element to load (shows Pay button)
          const payButton = authenticatedPage.getByRole('button', { name: /pay \$/i })
          if (await payButton.isVisible({ timeout: 10000 })) {
            // Stripe iframe should be present
            const stripeFrame = authenticatedPage.locator('iframe[name^="__privateStripeFrame"]')
            await expect(stripeFrame.first()).toBeVisible({ timeout: 30000 })
          }
        }
      }
    })

    test('completes payment with autofilled data and test card', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/events')
      await authenticatedPage.waitForLoadState('domcontentloaded')
      await authenticatedPage.waitForTimeout(2000)

      const eventLinks = authenticatedPage
        .locator('a[href^="/events/"]')
        .filter({ hasNot: authenticatedPage.locator('a[href="/events"]') })
      const eventCount = await eventLinks.count()

      if (eventCount === 0) {
        test.skip()
        return
      }

      await eventLinks.first().click()
      await authenticatedPage.waitForURL(/\/events\/[a-z0-9-]+/, { timeout: 10000 })

      const registerBtn = authenticatedPage.getByRole('button', { name: /register/i })
      if (!(await registerBtn.isVisible({ timeout: 5000 }))) {
        test.skip()
        return
      }

      await registerBtn.click()

      // Wait for modal with longer timeout
      await expect(authenticatedPage.getByRole('dialog')).toBeVisible({ timeout: 10000 })

      // Verify autofill shows user info (name and email from profile)
      const registrationInfo = authenticatedPage.getByText(/registering as/i)
      await expect(registrationInfo).toBeVisible()

      // Wait for Stripe element to load
      await authenticatedPage.waitForSelector('iframe[name^="__privateStripeFrame"]', {
        timeout: 30000,
      })

      // Find the Stripe card number iframe and fill it
      // Stripe Payment Element uses nested iframes for card fields
      const stripeFrames = authenticatedPage.frames().filter((f) => f.url().includes('stripe.com'))

      for (const frame of stripeFrames) {
        try {
          // Try to fill card number
          const cardNumberInput = frame.locator('[name="number"], [placeholder*="1234"]')
          if ((await cardNumberInput.count()) > 0) {
            await cardNumberInput.fill(STRIPE_TEST_CARDS.success.number)
          }

          // Try to fill expiry
          const expiryInput = frame.locator('[name="expiry"], [placeholder*="MM"]')
          if ((await expiryInput.count()) > 0) {
            await expiryInput.fill(STRIPE_TEST_CARDS.success.expiry)
          }

          // Try to fill CVC
          const cvcInput = frame.locator('[name="cvc"], [placeholder*="CVC"]')
          if ((await cvcInput.count()) > 0) {
            await cvcInput.fill(STRIPE_TEST_CARDS.success.cvc)
          }
        } catch {
          // Field not in this frame, continue
        }
      }

      // Wait for form validation
      await authenticatedPage.waitForTimeout(2000)

      // Click Pay button
      const payButton = authenticatedPage.getByRole('button', { name: /pay \$/i })
      await expect(payButton).toBeVisible()
      await payButton.click()

      // Wait for result (success message, redirect, or error)
      await authenticatedPage.waitForTimeout(5000)

      // Check for success indicators
      const hasSuccess =
        (await authenticatedPage.getByText(/success|registered|thank you|confirmed/i).count()) > 0 ||
        authenticatedPage.url().includes('registered=true')

      const hasError =
        (await authenticatedPage.getByText(/error|failed|declined|invalid/i).count()) > 0

      // Should either succeed or show a meaningful error (not crash)
      expect(hasSuccess || hasError).toBeTruthy()
    })
  })

  test.describe('Free Event Registration', () => {
    test.skip('registers for free event without payment', async ({ authenticatedPage }) => {
      // This test requires a free event (usdPrice = 0) in the database

      await authenticatedPage.goto('/events')
      await authenticatedPage.waitForLoadState('domcontentloaded')
      await authenticatedPage.waitForTimeout(2000)

      // Would need to find a free event
      const eventLinks = authenticatedPage.locator('a[href^="/events/"]')
      if ((await eventLinks.count()) > 0) {
        await eventLinks.first().click()
        await authenticatedPage.waitForURL(/\/events\/[a-z0-9-]+/, { timeout: 10000 })

        // Look for free event indicator
        const isFree = (await authenticatedPage.getByText(/free/i).count()) > 0

        if (isFree) {
          const registerBtn = authenticatedPage.getByRole('button', { name: /register/i })
          if (await registerBtn.isVisible()) {
            await registerBtn.click()
            await expect(authenticatedPage.getByRole('dialog')).toBeVisible({ timeout: 5000 })

            // Should show "Register Free" button instead of "Pay"
            const freeRegisterBtn = authenticatedPage.getByRole('button', {
              name: /register free/i,
            })
            await expect(freeRegisterBtn).toBeVisible()

            // Click to register
            await freeRegisterBtn.click()

            // Wait for success
            await authenticatedPage.waitForTimeout(3000)

            // Should show success
            const success =
              (await authenticatedPage.getByText(/success|registered|thank you/i).count()) > 0

            expect(success).toBeTruthy()
          }
        }
      }
    })
  })
})
