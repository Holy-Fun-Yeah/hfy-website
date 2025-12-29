/**
 * Accessibility Tests
 *
 * Uses axe-core to check for WCAG violations.
 * Add pages to PAGES_TO_TEST as you build them.
 *
 * Run with: yarn test:e2e --project=accessibility
 */

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

// Add pages to test as they're built
const PAGES_TO_TEST = [
  '/',
  '/about',
  '/blog',
  '/events',
  '/login',
  // Add more pages here:
  // '/store',
  // '/member',
  // '/admin',
]

test.describe('Accessibility', () => {
  for (const pagePath of PAGES_TO_TEST) {
    test(`${pagePath} has no critical a11y violations`, async ({ page }) => {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

      // Filter for critical and serious violations only
      const criticalViolations = accessibilityScanResults.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      )

      // Log violations for debugging
      if (criticalViolations.length > 0) {
        console.log(`A11y violations on ${pagePath}:`)
        for (const violation of criticalViolations) {
          console.log(`  - ${violation.id}: ${violation.description} (${violation.impact})`)
          for (const node of violation.nodes) {
            console.log(`    Target: ${node.target.join(', ')}`)
          }
        }
      }

      expect(criticalViolations).toEqual([])
    })
  }

  test('keyboard navigation works for main menu', async ({ page }) => {
    await page.goto('/')

    // Tab to first focusable element
    await page.keyboard.press('Tab')

    // Check that something is focused (skip link or first nav item)
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName
    })

    expect(focusedElement).toBeTruthy()
    expect(['A', 'BUTTON']).toContain(focusedElement)
  })
})
