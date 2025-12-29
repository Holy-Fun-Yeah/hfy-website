import { z } from 'zod'

/**
 * Locale Messages Schema
 *
 * This Zod schema defines the structure of all translation files.
 * All locale JSON files (en.json, es.json, etc.) MUST conform to this schema.
 *
 * Benefits:
 * - Compile-time TypeScript checking
 * - Runtime validation in development
 * - Auto-complete in IDE
 * - Ensures all languages have the same keys
 */

export const localeSchema = z.object({
  // Navigation
  nav: z.object({
    home: z.string(),
    about: z.string(),
    blog: z.string(),
    events: z.string(),
    book: z.string(),
  }),

  // Header/Hero
  hero: z.object({
    title: z.string(),
    subtitle: z.string(),
    cta: z.string(),
    secondaryCta: z.string(),
    coCreate: z.string(),
    scroll: z.string(),
  }),

  // About page
  about: z.object({
    sectionLabel: z.string(),
    title: z.string(),
    description: z.string(),
    // About page hero
    hero: z.object({
      eyebrow: z.string(),
      title: z.string(),
      subtitle: z.string(),
    }),
    // Vision section
    vision: z.object({
      eyebrow: z.string(),
      title: z.string(),
      paragraphs: z.array(z.string()),
      imagePlaceholder: z.string(),
    }),
    // Values section
    values: z.object({
      eyebrow: z.string(),
      title: z.string(),
      description: z.string(),
      authenticity: z.object({
        title: z.string(),
        description: z.string(),
      }),
      connection: z.object({
        title: z.string(),
        description: z.string(),
      }),
      expansion: z.object({
        title: z.string(),
        description: z.string(),
      }),
    }),
    // Offerings section
    offerings: z.object({
      eyebrow: z.string(),
      title: z.string(),
      consultations: z.object({
        title: z.string(),
        description: z.string(),
      }),
      workshops: z.object({
        title: z.string(),
        description: z.string(),
      }),
      digital: z.object({
        title: z.string(),
        description: z.string(),
      }),
    }),
    // Quote section
    quote: z.object({
      text: z.string(),
      author: z.string(),
    }),
    // CTA section
    cta: z.object({
      title: z.string(),
      description: z.string(),
      bookButton: z.string(),
      eventsButton: z.string(),
    }),
  }),

  // Features section (home page)
  features: z.object({
    sectionLabel: z.string(),
    title: z.string(),
    description: z.string(),
    items: z.object({
      insights: z.object({
        title: z.string(),
        description: z.string(),
      }),
      experiences: z.object({
        title: z.string(),
        description: z.string(),
      }),
      balance: z.object({
        title: z.string(),
        description: z.string(),
      }),
    }),
  }),

  // Events page
  events: z.object({
    sectionLabel: z.string(),
    title: z.string(),
    viewAll: z.string(),
    online: z.string(),
    inPerson: z.string(),
    virtual: z.string(),
    // Events page hero
    hero: z.object({
      eyebrow: z.string(),
      title: z.string(),
      subtitle: z.string(),
    }),
    // Filters
    upcoming: z.string(),
    past: z.string(),
    pastEvents: z.string(),
    // Empty states
    noUpcoming: z.object({
      title: z.string(),
      description: z.string(),
    }),
    noPast: z.object({
      title: z.string(),
      description: z.string(),
    }),
    featured: z.string(),
    // CTA section
    cta: z.object({
      title: z.string(),
      description: z.string(),
      button: z.string(),
    }),
    // Event detail page
    detail: z.object({
      price: z.string(),
      free: z.string(),
      duration: z.string(),
      hours: z.string(),
      hour: z.string(),
      minutes: z.string(),
      capacity: z.string(),
      spaces: z.string(),
      host: z.string(),
      registerNow: z.string(),
      eventEnded: z.string(),
      questions: z.string(),
      contactUs: z.string(),
      onlineEvent: z.string(),
      inPersonEvent: z.string(),
      viewOnGoogleMaps: z.string(),
      exploreMore: z.string(),
      viewAllEvents: z.string(),
      showingInEnglish: z.string(),
      registered: z.string(),
      seeYouThere: z.string(),
    }),
  }),

  // Blog page
  blog: z.object({
    sectionLabel: z.string(),
    title: z.string(),
    viewAll: z.string(),
    readMore: z.string(),
    minRead: z.string(),
    // Blog page hero
    hero: z.object({
      eyebrow: z.string(),
      title: z.string(),
      subtitle: z.string(),
    }),
    // Filters
    allPosts: z.string(),
    featured: z.string(),
    // Empty state
    noPostsCategory: z.object({
      title: z.string(),
      description: z.string(),
    }),
    // Newsletter CTA
    newsletterCta: z.object({
      eyebrow: z.string(),
      title: z.string(),
      description: z.string(),
    }),
  }),

  // Newsletter/CTA
  newsletter: z.object({
    title: z.string(),
    subtitle: z.string(),
    placeholder: z.string(),
    button: z.string(),
    privacy: z.string(),
    or: z.string(),
    bookSession: z.string(),
  }),

  // Footer
  footer: z.object({
    description: z.string(),
    explore: z.string(),
    legal: z.string(),
    privacy: z.string(),
    terms: z.string(),
    copyright: z.string(),
  }),

  // Common/Shared
  common: z.object({
    readMore: z.string(),
    learnMore: z.string(),
    bookNow: z.string(),
    subscribe: z.string(),
    loading: z.string(),
    error: z.string(),
    back: z.string(),
    next: z.string(),
    previous: z.string(),
  }),

  // Accessibility
  a11y: z.object({
    skipToContent: z.string(),
    openMenu: z.string(),
    closeMenu: z.string(),
    toggleTheme: z.string(),
    toggleLanguage: z.string(),
    fontSize: z.string(),
  }),

  // Meta/SEO
  meta: z.object({
    title: z.string(),
    description: z.string(),
    ogTitle: z.string(),
    ogDescription: z.string(),
  }),

  // Pronouns/Gender (inclusive options)
  pronouns: z.object({
    selectPronouns: z.string(),
    sheHer: z.string(),
    heHim: z.string(),
    theyThem: z.string(),
    sheThey: z.string(),
    heThey: z.string(),
    any: z.string(),
    preferNotToSay: z.string(),
  }),

  // Authentication
  auth: z.object({
    signIn: z.string(),
    signOut: z.string(),
    createAccount: z.string(),
    fullName: z.string(),
    fullNamePlaceholder: z.string(),
    email: z.string(),
    emailPlaceholder: z.string(),
    phone: z.string(),
    phonePlaceholder: z.string(),
    phoneOptional: z.string(),
    password: z.string(),
    passwordPlaceholder: z.string(),
    confirmPassword: z.string(),
    confirmPasswordPlaceholder: z.string(),
    newPassword: z.string(),
    newPasswordPlaceholder: z.string(),
    noAccount: z.string(),
    hasAccount: z.string(),
    accessDenied: z.string(),
    adminOnly: z.string(),
    adminAccess: z.string(),
    loggedInAs: z.string(),
    passwordMismatch: z.string(),
    passwordTooShort: z.string(),
    unknownError: z.string(),
    forgotPassword: z.string(),
    forgotPasswordDescription: z.string(),
    sendResetLink: z.string(),
    backToSignIn: z.string(),
    checkEmail: z.string(),
    confirmEmailSent: z.string(),
    resetEmailSent: z.string(),
    resetPassword: z.string(),
    resetPasswordDescription: z.string(),
    updatePassword: z.string(),
    passwordUpdated: z.string(),
    passwordUpdatedDescription: z.string(),
  }),

  // User menu (header navigation)
  userMenu: z.object({
    logIn: z.string(),
    account: z.string(),
    courses: z.string(),
    content: z.string(),
    editor: z.string(),
  }),

  // Member portal
  member: z.object({
    nav: z.object({
      dashboard: z.string(),
      courses: z.string(),
      appointments: z.string(),
      purchases: z.string(),
    }),
    dashboard: z.object({
      welcome: z.string(),
      welcomeBack: z.string(),
      quickStats: z.string(),
      coursesEnrolled: z.string(),
      upcomingAppointments: z.string(),
      nextAppointment: z.string(),
      noUpcomingAppointments: z.string(),
      continueLearning: z.string(),
      noCoursesYet: z.string(),
      browseStore: z.string(),
      recentPurchases: z.string(),
      noPurchasesYet: z.string(),
    }),
    courses: z.object({
      title: z.string(),
      enrolled: z.string(),
      progress: z.string(),
      continue: z.string(),
      completed: z.string(),
      lessons: z.string(),
      lesson: z.string(),
      duration: z.string(),
      markComplete: z.string(),
      nextLesson: z.string(),
      previousLesson: z.string(),
      courseComplete: z.string(),
      emptyCourses: z.string(),
    }),
    appointments: z.object({
      title: z.string(),
      upcoming: z.string(),
      past: z.string(),
      noUpcoming: z.string(),
      noPast: z.string(),
      joinMeeting: z.string(),
      status: z.object({
        pending: z.string(),
        confirmed: z.string(),
        completed: z.string(),
        cancelled: z.string(),
      }),
    }),
    purchases: z.object({
      title: z.string(),
      date: z.string(),
      item: z.string(),
      amount: z.string(),
      status: z.string(),
      receipt: z.string(),
      noPurchases: z.string(),
      viewReceipt: z.string(),
    }),
  }),
})

// TypeScript type derived from Zod schema
export type LocaleMessages = z.infer<typeof localeSchema>

// Supported locale codes
export type LocaleCode = 'en' | 'es' | 'de' | 'fr'

// Locale info (matches nuxt.config.ts)
export interface LocaleInfo {
  code: LocaleCode
  iso: string
  name: string
  flag: string
}

export const SUPPORTED_LOCALES: LocaleInfo[] = [
  { code: 'en', iso: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'es', iso: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'de', iso: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', iso: 'fr-FR', name: 'Français', flag: '🇫🇷' },
]

/**
 * Validate a locale JSON file against the schema
 * @param data - The parsed JSON data
 * @param locale - The locale code (for error messages)
 * @returns The validated data with proper types
 * @throws Error if validation fails
 */
export function validateLocale(data: unknown, locale: string): LocaleMessages {
  const result = localeSchema.safeParse(data)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new Error(`Locale validation failed for "${locale}":\n${issues}`)
  }
  return result.data
}

/**
 * Check if a locale code is supported
 */
export function isValidLocale(code: string): code is LocaleCode {
  return ['en', 'es', 'de', 'fr'].includes(code)
}
