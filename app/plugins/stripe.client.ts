/**
 * Stripe.js Client Plugin
 *
 * Initializes Stripe.js for client-side payment processing.
 * Only loads when Stripe public key is configured.
 */

import { loadStripe, type Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const stripePublicKey = config.public.stripePublicKey

  // Lazily load Stripe only when needed
  const getStripe = async (): Promise<Stripe | null> => {
    if (!stripePublicKey) {
      console.warn('[Stripe] No public key configured')
      return null
    }

    if (!stripePromise) {
      // Use stable API version to avoid compatibility issues
      stripePromise = loadStripe(stripePublicKey, {
        apiVersion: '2024-12-18.acacia',
      })
    }

    return stripePromise
  }

  return {
    provide: {
      stripe: {
        getStripe,
        isConfigured: !!stripePublicKey,
      },
    },
  }
})
