<script setup lang="ts">
/**
 * Registration Form
 *
 * Collects attendee info and handles payment for event registration.
 * Supports both free and paid events.
 */

interface Props {
  event: {
    id: string
    title: string
    startsAt: string
    usdPrice: string | null
  }
  initialName?: string
  initialEmail?: string
  initialPhone?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  success: [registrationId: string]
  cancel: []
}>()

// Note: t is available for future i18n but we use English for registration
const { t: _t } = useLocale()

// Form state
const attendeeName = ref(props.initialName || '')
const attendeeEmail = ref(props.initialEmail || '')
const attendeePhone = ref(props.initialPhone || '')

const loading = ref(false)
const error = ref<string | null>(null)
const clientSecret = ref<string | null>(null)
const registrationId = ref<string | null>(null)

const stripeElementRef = ref<{
  confirmPayment: (url: string) => Promise<{ success: boolean }>
} | null>(null)

// Computed
const price = computed(() => parseFloat(props.event.usdPrice || '0'))
const isFreeEvent = computed(() => price.value === 0)

const formattedPrice = computed(() => {
  if (isFreeEvent.value) return 'Free'
  return `$${price.value.toFixed(0)} USD`
})

const formattedDate = computed(() => {
  const date = new Date(props.event.startsAt)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
})

const isValid = computed(() => {
  return attendeeName.value.trim() && attendeeEmail.value.trim()
})

// Methods
async function initiatePayment() {
  if (!isValid.value) return

  loading.value = true
  error.value = null

  try {
    const response = await $fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      body: {
        eventId: props.event.id,
        attendeeName: attendeeName.value.trim(),
        attendeeEmail: attendeeEmail.value.trim(),
        attendeePhone: attendeePhone.value.trim() || undefined,
      },
    })

    // Extract data from response (may be wrapped in success envelope)
    const rawData = 'data' in response && response.success ? response.data : response
    const data = rawData as {
      type: 'free' | 'paid'
      registrationId: string
      clientSecret?: string
      status?: string
    }

    if (data.type === 'free') {
      // Free event - registration complete
      emit('success', data.registrationId)
      return
    }

    // Paid event - show payment form
    clientSecret.value = data.clientSecret || null
    registrationId.value = data.registrationId
  } catch (err: any) {
    error.value = err.data?.error?.message || err.message || 'Failed to initiate registration'
  } finally {
    loading.value = false
  }
}

async function confirmPayment() {
  if (!stripeElementRef.value || !clientSecret.value) return

  loading.value = true
  error.value = null

  try {
    const returnUrl = `${window.location.origin}/events/${props.event.id}?registered=true`
    await stripeElementRef.value.confirmPayment(returnUrl)

    // Payment succeeded
    if (registrationId.value) {
      emit('success', registrationId.value)
    }
  } catch (err: any) {
    error.value = err.message || 'Payment failed'
  } finally {
    loading.value = false
  }
}

function handleSubmit() {
  if (clientSecret.value) {
    confirmPayment()
  } else {
    initiatePayment()
  }
}
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="handleSubmit"
  >
    <!-- Event Summary -->
    <div class="bg-brand-neutral/50 rounded-lg p-4">
      <h3 class="font-headers text-brand-base font-semibold">
        {{ event.title }}
      </h3>
      <p class="text-brand-muted mt-1 text-sm">
        {{ formattedDate }}
      </p>
      <p class="text-brand-accent mt-2 text-lg font-bold">
        {{ formattedPrice }}
      </p>
    </div>

    <!-- Attendee Info (only show if not yet in payment step) -->
    <div
      v-if="!clientSecret"
      class="space-y-4"
    >
      <div>
        <label
          for="attendeeName"
          class="text-brand-base mb-1 block text-sm font-medium"
        >
          Full Name *
        </label>
        <input
          id="attendeeName"
          v-model="attendeeName"
          type="text"
          required
          class="bg-brand-neutral border-brand-base/20 text-brand-base placeholder:text-brand-muted focus:border-brand-accent focus:ring-brand-accent/20 w-full rounded-lg border px-4 py-2.5 transition outline-none focus:ring-2"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label
          for="attendeeEmail"
          class="text-brand-base mb-1 block text-sm font-medium"
        >
          Email *
        </label>
        <input
          id="attendeeEmail"
          v-model="attendeeEmail"
          type="email"
          required
          class="bg-brand-neutral border-brand-base/20 text-brand-base placeholder:text-brand-muted focus:border-brand-accent focus:ring-brand-accent/20 w-full rounded-lg border px-4 py-2.5 transition outline-none focus:ring-2"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label
          for="attendeePhone"
          class="text-brand-base mb-1 block text-sm font-medium"
        >
          Phone (optional)
        </label>
        <input
          id="attendeePhone"
          v-model="attendeePhone"
          type="tel"
          class="bg-brand-neutral border-brand-base/20 text-brand-base placeholder:text-brand-muted focus:border-brand-accent focus:ring-brand-accent/20 w-full rounded-lg border px-4 py-2.5 transition outline-none focus:ring-2"
          placeholder="+1 (555) 123-4567"
        />
      </div>
    </div>

    <!-- Payment Element (only for paid events after info submitted) -->
    <div v-if="clientSecret && !isFreeEvent">
      <p class="text-brand-muted mb-4 text-sm">
        Registering as <strong>{{ attendeeName }}</strong> ({{ attendeeEmail }})
      </p>

      <StripePaymentElement
        ref="stripeElementRef"
        :client-secret="clientSecret"
        :disabled="loading"
      />
    </div>

    <!-- Error Message -->
    <p
      v-if="error"
      class="rounded-lg bg-red-50 p-3 text-sm text-red-600"
    >
      {{ error }}
    </p>

    <!-- Actions -->
    <div class="flex gap-3">
      <BaseButton
        type="button"
        variant="ghost"
        class="flex-1"
        :disabled="loading"
        @click="emit('cancel')"
      >
        Cancel
      </BaseButton>

      <BaseButton
        type="submit"
        class="flex-1"
        :loading="loading"
        :disabled="!isValid || loading"
      >
        <template v-if="clientSecret"> Pay {{ formattedPrice }} </template>
        <template v-else-if="isFreeEvent"> Register Free </template>
        <template v-else> Continue to Payment </template>
      </BaseButton>
    </div>
  </form>
</template>
