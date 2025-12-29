/**
 * Stripe Webhook Handler
 *
 * Processes Stripe webhook events for payment confirmations.
 * Verifies webhook signatures to ensure authenticity.
 */

import Stripe from 'stripe'
import { eq } from 'drizzle-orm'

import { env } from '../../env'
import { useDatabase } from '../../database'
import { eventRegistrations } from '../../database/schema'

export default defineEventHandler(async (event) => {
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    setResponseStatus(event, 503)
    return { error: 'Webhook not configured' }
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  })

  // Get raw body for signature verification
  const body = await readRawBody(event)
  if (!body) {
    setResponseStatus(event, 400)
    return { error: 'Missing request body' }
  }

  // Get Stripe signature header
  const signature = getHeader(event, 'stripe-signature')
  if (!signature) {
    setResponseStatus(event, 400)
    return { error: 'Missing stripe-signature header' }
  }

  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    setResponseStatus(event, 400)
    return { error: 'Invalid signature' }
  }

  // Handle the event
  switch (stripeEvent.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent
      await handlePaymentSuccess(paymentIntent)
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent
      await handlePaymentFailure(paymentIntent)
      break
    }

    default:
      console.log(`[Stripe Webhook] Unhandled event type: ${stripeEvent.type}`)
  }

  return { received: true }
})

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const db = useDatabase()
  const registrationId = paymentIntent.metadata?.registrationId

  if (!registrationId) {
    console.error('[Stripe Webhook] Missing registrationId in metadata:', paymentIntent.id)
    return
  }

  console.log(`[Stripe Webhook] Payment succeeded for registration: ${registrationId}`)

  await db
    .update(eventRegistrations)
    .set({
      status: 'confirmed',
      confirmedAt: new Date(),
    })
    .where(eq(eventRegistrations.id, registrationId))
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const db = useDatabase()
  const registrationId = paymentIntent.metadata?.registrationId

  if (!registrationId) {
    console.error('[Stripe Webhook] Missing registrationId in metadata:', paymentIntent.id)
    return
  }

  console.log(`[Stripe Webhook] Payment failed for registration: ${registrationId}`)

  await db
    .update(eventRegistrations)
    .set({
      status: 'failed',
    })
    .where(eq(eventRegistrations.id, registrationId))
}
