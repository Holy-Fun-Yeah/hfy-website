/**
 * Create Payment Intent for Event Registration
 *
 * Creates a Stripe PaymentIntent for paid events.
 * For free events, creates a registration directly without Stripe.
 */

import Stripe from 'stripe'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { defineApiHandler, Errors } from '../../lib'
import { env } from '../../env'
import { useDatabase } from '../../database'
import { events, eventRegistrations } from '../../database/schema'
import { requireAuth } from '../../utils/auth'

const requestSchema = z.object({
  eventId: z.string().uuid(),
  attendeeName: z.string().min(1).max(100),
  attendeeEmail: z.string().email(),
  attendeePhone: z.string().max(20).optional(),
})

export default defineApiHandler(async (event) => {
  const db = useDatabase()

  // Require authenticated user
  const user = await requireAuth(event)

  // Parse request body
  const body = await readBody(event)
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    throw Errors.validation(parsed.error.issues.map((i) => i.message).join(', '))
  }

  const { eventId, attendeeName, attendeeEmail, attendeePhone } = parsed.data

  // Get event details
  const eventData = await db.query.events.findFirst({
    where: eq(events.id, eventId),
  })

  if (!eventData) {
    throw Errors.notFound('Event not found')
  }

  if (eventData.status !== 'published') {
    throw Errors.badRequest('Event is not available for registration')
  }

  // Check if event is in the past
  if (new Date(eventData.startsAt) < new Date()) {
    throw Errors.badRequest('Cannot register for past events')
  }

  // Check if user is already registered
  const existingRegistration = await db.query.eventRegistrations.findFirst({
    where: (reg, { and }) => and(eq(reg.eventId, eventId), eq(reg.userId, user.id)),
  })

  if (existingRegistration && existingRegistration.status === 'confirmed') {
    throw Errors.conflict('You are already registered for this event')
  }

  const amount = parseFloat(eventData.usdPrice || '0')
  const isFreeEvent = amount === 0

  // For free events, create registration directly
  if (isFreeEvent) {
    const [registration] = await db
      .insert(eventRegistrations)
      .values({
        eventId,
        userId: user.id,
        amount: '0',
        status: 'confirmed',
        attendeeName,
        attendeeEmail,
        attendeePhone: attendeePhone || null,
        confirmedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [eventRegistrations.eventId, eventRegistrations.userId],
        set: {
          status: 'confirmed',
          attendeeName,
          attendeeEmail,
          attendeePhone: attendeePhone || null,
          confirmedAt: new Date(),
        },
      })
      .returning()

    if (!registration) {
      throw Errors.internal('Failed to create registration')
    }

    return {
      type: 'free',
      registrationId: registration.id,
      status: 'confirmed',
    }
  }

  // For paid events, create PaymentIntent
  if (!env.STRIPE_SECRET_KEY) {
    throw Errors.serviceUnavailable('Payment processing is not configured')
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY)

  // Amount in cents for Stripe
  const amountInCents = Math.round(amount * 100)

  // Create or update pending registration
  const [registration] = await db
    .insert(eventRegistrations)
    .values({
      eventId,
      userId: user.id,
      amount: eventData.usdPrice,
      status: 'pending',
      attendeeName,
      attendeeEmail,
      attendeePhone: attendeePhone || null,
    })
    .onConflictDoUpdate({
      target: [eventRegistrations.eventId, eventRegistrations.userId],
      set: {
        status: 'pending',
        attendeeName,
        attendeeEmail,
        attendeePhone: attendeePhone || null,
      },
    })
    .returning()

  if (!registration) {
    throw Errors.internal('Failed to create registration')
  }

  // Create PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: 'usd',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      eventId,
      registrationId: registration.id,
      userId: user.id,
      attendeeEmail,
    },
  })

  // Update registration with PaymentIntent ID
  await db
    .update(eventRegistrations)
    .set({ stripePaymentIntentId: paymentIntent.id })
    .where(eq(eventRegistrations.id, registration.id))

  return {
    type: 'paid',
    clientSecret: paymentIntent.client_secret,
    registrationId: registration.id,
    amount: amount,
    amountInCents,
  }
})
