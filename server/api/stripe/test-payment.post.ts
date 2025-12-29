/**
 * Test Payment Intent Endpoint
 *
 * Creates a test payment intent for E2E testing.
 * Only available in development/test environments.
 */

import Stripe from 'stripe'
import { z } from 'zod'

import { defineApiHandler, Errors } from '../../lib'
import { env, isDev } from '../../env'

const requestSchema = z.object({
  amount: z.number().min(50).max(100000).default(1000), // Amount in cents (default $10)
  description: z.string().default('Test Payment'),
})

export default defineApiHandler(async (event) => {
  // Only allow in development
  if (!isDev) {
    throw Errors.forbidden('Test endpoint only available in development')
  }

  if (!env.STRIPE_SECRET_KEY) {
    throw Errors.serviceUnavailable('Stripe not configured')
  }

  const body = await readBody(event)
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  }

  const { amount, description } = parsed.data

  const stripe = new Stripe(env.STRIPE_SECRET_KEY)

  // Create a test payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    description,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      test: 'true',
      purpose: 'e2e-testing',
    },
  })

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount,
    currency: 'usd',
  }
})
