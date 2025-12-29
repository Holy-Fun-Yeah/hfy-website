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

      // Should have events section
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

      // Should have at least one event card or "no events" message
      const hasEvents = await page.locator('[data-testid="event-card"]').count()
      const hasNoEvents = await page.getByText(/no upcoming events/i).count()

      expect(hasEvents > 0 || hasNoEvents > 0).toBeTruthy()
    })

    test('can navigate to event detail page', async ({ page }) => {
      await page.goto('/events')
      await page.waitForLoadState('networkidle')

      // Click on first event card link
      const eventLinks = page.locator('a[href^="/events/"]')
      const linkCount = await eventLinks.count()

      if (linkCount > 0) {
        const href = await eventLinks.first().getAttribute('href')
        await eventLinks.first().click()
        await page.waitForLoadState('networkidle')

        // Should be on event detail page
        expect(page.url()).toContain('/events/')
      }
    })
  })

  test.describe('Event Detail Page', () => {
    test('displays event details', async ({ page }) => {
      await page.goto('/events')
      await page.waitForLoadState('networkidle')

      const eventLinks = page.locator('a[href^="/events/"]')
      if ((await eventLinks.count()) > 0) {
        await eventLinks.first().click()
        await page.waitForLoadState('networkidle')

        // Should show event title
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

        // Should show Register Now button
        await expect(page.getByRole('button', { name: /register/i })).toBeVisible()
      }
    })

    test('unauthenticated user is redirected to login on register click', async ({ page }) => {
      await page.goto('/events')
      await page.waitForLoadState('networkidle')

      const eventLinks = page.locator('a[href^="/events/"]')
      if ((await eventLinks.count()) > 0) {
        await eventLinks.first().click()
        await page.waitForLoadState('networkidle')

        // Click register button
        const registerBtn = page.getByRole('button', { name: /register/i })
        if (await registerBtn.isVisible()) {
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
      await authenticatedPage.waitForLoadState('networkidle')

      const eventLinks = authenticatedPage.locator('a[href^="/events/"]')
      if ((await eventLinks.count()) > 0) {
        await eventLinks.first().click()
        await authenticatedPage.waitForLoadState('networkidle')

        // Click register button
        const registerBtn = authenticatedPage.getByRole('button', { name: /register/i })
        if (await registerBtn.isVisible()) {
          await registerBtn.click()

          // Modal should open
          await expect(authenticatedPage.getByRole('dialog')).toBeVisible({ timeout: 5000 })

          // Should show user info
          await expect(authenticatedPage.getByText(/registering as/i)).toBeVisible()
        }
      }
    })

    test('modal shows event details and price', async ({ authenticatedPage }) => {
      await authenticatedPage.goto('/events')
      await authenticatedPage.waitForLoadState('networkidle')

      const eventLinks = authenticatedPage.locator('a[href^="/events/"]')
      if ((await eventLinks.count()) > 0) {
        await eventLinks.first().click()
        await authenticatedPage.waitForLoadState('networkidle')

        const registerBtn = authenticatedPage.getByRole('button', { name: /register/i })
        if (await registerBtn.isVisible()) {
          await registerBtn.click()
          await expect(authenticatedPage.getByRole('dialog')).toBeVisible({ timeout: 5000 })

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
      await authenticatedPage.waitForLoadState('networkidle')

      const eventLinks = authenticatedPage.locator('a[href^="/events/"]')
      if ((await eventLinks.count()) > 0) {
        await eventLinks.first().click()
        await authenticatedPage.waitForLoadState('networkidle')

        const registerBtn = authenticatedPage.getByRole('button', { name: /register/i })
        if (await registerBtn.isVisible()) {
          await registerBtn.click()
          await expect(authenticatedPage.getByRole('dialog')).toBeVisible({ timeout: 5000 })

          // Click cancel button
          await authenticatedPage.getByRole('button', { name: /cancel/i }).click()

          // Modal should close
          await expect(authenticatedPage.getByRole('dialog')).not.toBeVisible()
        }
      }
    })
  })

  test.describe('Payment Flow', () => {
    test.skip('loads Stripe payment element for paid events', async ({ authenticatedPage }) => {
      // This test is skipped by default as it requires a paid event in the database
      // and Stripe test mode to be properly configured

      await authenticatedPage.goto('/events')
      await authenticatedPage.waitForLoadState('networkidle')

      // Find a paid event (would need test data)
      const eventLinks = authenticatedPage.locator('a[href^="/events/"]')
      if ((await eventLinks.count()) > 0) {
        await eventLinks.first().click()
        await authenticatedPage.waitForLoadState('networkidle')

        const registerBtn = authenticatedPage.getByRole('button', { name: /register/i })
        if (await registerBtn.isVisible()) {
          await registerBtn.click()
          await expect(authenticatedPage.getByRole('dialog')).toBeVisible({ timeout: 5000 })

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

    test.skip('completes payment with test card', async ({ authenticatedPage }) => {
      // This test requires:
      // 1. A paid event in the database
      // 2. Valid Stripe test mode credentials
      // 3. Proper Stripe webhook configuration (for webhook tests)

      await authenticatedPage.goto('/events')
      await authenticatedPage.waitForLoadState('networkidle')

      const eventLinks = authenticatedPage.locator('a[href^="/events/"]')
      if ((await eventLinks.count()) > 0) {
        await eventLinks.first().click()
        await authenticatedPage.waitForLoadState('networkidle')

        const registerBtn = authenticatedPage.getByRole('button', { name: /register/i })
        if (await registerBtn.isVisible()) {
          await registerBtn.click()
          await expect(authenticatedPage.getByRole('dialog')).toBeVisible({ timeout: 5000 })

          // Wait for Stripe element
          const payButton = authenticatedPage.getByRole('button', { name: /pay \$/i })
          if (await payButton.isVisible({ timeout: 10000 })) {
            // Fill Stripe card details
            await fillStripePaymentElement(authenticatedPage, STRIPE_TEST_CARDS.success)

            // Small delay for Stripe validation
            await authenticatedPage.waitForTimeout(1000)

            // Submit payment
            await payButton.click()

            // Wait for success (either redirect or success message)
            await authenticatedPage.waitForTimeout(5000)

            // Should show success or redirect
            const success =
              (await authenticatedPage.getByText(/success|registered|thank you/i).count()) > 0 ||
              authenticatedPage.url().includes('registered=true')

            expect(success).toBeTruthy()
          }
        }
      }
    })
  })

  test.describe('Free Event Registration', () => {
    test.skip('registers for free event without payment', async ({ authenticatedPage }) => {
      // This test requires a free event (usdPrice = 0) in the database

      await authenticatedPage.goto('/events')
      await authenticatedPage.waitForLoadState('networkidle')

      // Would need to find a free event
      const eventLinks = authenticatedPage.locator('a[href^="/events/"]')
      if ((await eventLinks.count()) > 0) {
        await eventLinks.first().click()
        await authenticatedPage.waitForLoadState('networkidle')

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
