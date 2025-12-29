import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration
 *
 * Projects are organized by auth requirements:
 * - public: No auth required (/, /about, /blog, /events, /store)
 * - auth-flows: Auth page tests (login, register, reset)
 * - member: Requires user auth (/member/*)
 * - admin: Requires admin auth (/admin/*)
 * - store: Mixed auth (catalog public, checkout requires auth)
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [['html'], ['list'], process.env.CI ? ['github'] : ['line']],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    // Public pages - no auth required
    {
      name: 'public',
      testMatch: /public\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Auth flow tests - no auth required (testing login/register/reset)
    {
      name: 'auth-flows',
      testMatch: /auth\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Member portal tests - requires user auth
    {
      name: 'member',
      testMatch: /member\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Auth state will be set up by fixtures
      },
    },

    // Admin tests - requires admin auth
    {
      name: 'admin',
      testMatch: /admin\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Auth state will be set up by fixtures
      },
    },

    // Store tests - mixed auth (catalog public, checkout auth)
    {
      name: 'store',
      testMatch: /store\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Navigation tests - header/footer navigation
    {
      name: 'navigation',
      testMatch: /navigation\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Page tests - per-page UI testing
    {
      name: 'pages',
      testMatch: /pages\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Accessibility tests
    {
      name: 'accessibility',
      testMatch: /accessibility\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Responsive tests - mobile viewport
    {
      name: 'mobile',
      testMatch: /responsive\/.*\.spec\.ts/,
      use: { ...devices['iPhone 13'] },
    },

    // Legacy tests (existing specs not yet migrated to subfolders)
    {
      name: 'legacy',
      testMatch: ['navigation.spec.ts', 'auth.spec.ts', 'content-pages.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Dev server - start automatically for tests
  webServer: {
    command: 'yarn dev',
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
})
