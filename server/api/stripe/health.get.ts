import Stripe from 'stripe'

import { defineApiHandler, Errors } from '../../lib'
import { env } from '../../env'

export default defineApiHandler(async () => {
  if (!env.STRIPE_SECRET_KEY) {
    throw Errors.serviceUnavailable('STRIPE_SECRET_KEY not configured')
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  })

  // Test API connectivity by fetching account info
  const account = await stripe.accounts.retrieve()

  return {
    status: 'connected',
    accountId: account.id,
    webhookConfigured: !!env.STRIPE_WEBHOOK_SECRET,
  }
})
