/**
 * Property-Based Tests for Validation Schemas
 *
 * Uses fast-check to generate random inputs and verify validation behavior.
 * Add your validation schemas and property tests here.
 *
 * Run with: yarn test:run tests/validation.property.test.ts
 */

import { test, fc } from '@fast-check/vitest'
import { describe, expect } from 'vitest'

describe('Validation Properties', () => {
  // Example: Email validation properties
  describe('Email', () => {
    test.prop([fc.emailAddress()])('valid emails contain @ symbol', (email) => {
      expect(email).toContain('@')
    })

    test.prop([fc.string().filter((s) => !s.includes('@'))])(
      'strings without @ are invalid emails',
      (notEmail) => {
        // This is a sanity check - add your actual email schema validation here
        expect(notEmail).not.toContain('@')
      }
    )
  })

  // Example: Password validation properties
  describe('Password', () => {
    const validPasswordArb = fc
      .tuple(
        fc.stringOf(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), {
          minLength: 1,
          maxLength: 3,
        }),
        fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'), {
          minLength: 1,
          maxLength: 3,
        }),
        fc.stringOf(fc.constantFrom(...'0123456789'), { minLength: 1, maxLength: 2 }),
        fc.stringOf(fc.constantFrom(...'!@#$%^&*'), { minLength: 1, maxLength: 2 })
      )
      .map(([upper, lower, digit, special]) => upper + lower + digit + special)

    test.prop([validPasswordArb])(
      'valid passwords have uppercase, lowercase, and digits',
      (password) => {
        expect(password).toMatch(/[A-Z]/)
        expect(password).toMatch(/[a-z]/)
        expect(password).toMatch(/[0-9]/)
      }
    )

    test.prop([fc.string({ maxLength: 5 })])('short passwords are invalid', (shortPass) => {
      // Add your actual password length validation here
      expect(shortPass.length).toBeLessThanOrEqual(5)
    })
  })

  // Example: Pagination validation properties
  describe('Pagination', () => {
    test.prop([fc.integer({ min: 1, max: 1000 }), fc.integer({ min: 1, max: 100 })])(
      'valid pagination has positive page and reasonable limit',
      (page, limit) => {
        expect(page).toBeGreaterThanOrEqual(1)
        expect(limit).toBeGreaterThanOrEqual(1)
        expect(limit).toBeLessThanOrEqual(100)
      }
    )

    test.prop([fc.integer({ min: 1 }), fc.integer({ min: 1, max: 100 })])(
      'offset calculation is correct',
      (page, limit) => {
        const offset = (page - 1) * limit
        expect(offset).toBeGreaterThanOrEqual(0)
      }
    )
  })

  // Example: Slug validation properties
  describe('Slug', () => {
    const validSlugArb = fc
      .array(
        fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz0123456789'), {
          minLength: 1,
          maxLength: 10,
        }),
        {
          minLength: 1,
          maxLength: 5,
        }
      )
      .map((parts) => parts.join('-'))

    test.prop([validSlugArb])('valid slugs are lowercase alphanumeric with hyphens', (slug) => {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    })

    test.prop([fc.string().filter((s) => /[A-Z\s!@#$%]/.test(s))])(
      'strings with uppercase or special chars are invalid slugs',
      (invalidSlug) => {
        expect(invalidSlug).not.toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      }
    )
  })

  // Add more property tests for your validation schemas:
  // - Price validation (format, range)
  // - Phone number validation
  // - Date range validation
  // - Content length validation
})
