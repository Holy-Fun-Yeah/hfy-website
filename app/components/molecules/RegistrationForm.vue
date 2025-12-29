<script setup lang="ts">
import { VueTelInput } from 'vue-tel-input'
import 'vue-tel-input/vue-tel-input.css'

/**
 * Registration Form
 *
 * Single-step event registration with Stripe payment.
 * Shows user info (name/email read-only, phone editable) + payment element.
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

// Attendee info (name/email from profile, phone editable)
const attendeeName = computed(() => props.initialName || '')
const attendeeEmail = computed(() => props.initialEmail || '')
const attendeePhone = ref(props.initialPhone || '')

// Update phone when profile loads
watch(
  () => props.initialPhone,
  (newVal) => {
    if (newVal && !attendeePhone.value) attendeePhone.value = newVal
  }
)

const loading = ref(false)
const initializing = ref(true)
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

// Phone input handler
function handlePhoneUpdate(
  _nationalNumber: string,
  phoneObject: { number?: string; valid?: boolean }
) {
  attendeePhone.value = phoneObject.number || ''
}

// Initialize payment intent on mount (single-step flow)
onMounted(async () => {
  // Wait for profile data to be available
  await nextTick()

  // Small delay to ensure props are populated
  setTimeout(() => {
    if (attendeeName.value && attendeeEmail.value) {
      initiatePayment()
    } else {
      initializing.value = false
    }
  }, 100)
})

// Methods
async function initiatePayment() {
  if (!isValid.value) {
    initializing.value = false
    return
  }

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
    initializing.value = false
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

async function handleSubmit() {
  if (isFreeEvent.value) {
    // Free event - just register
    await initiatePayment()
  } else if (clientSecret.value) {
    // Paid event with payment intent ready - confirm payment
    await confirmPayment()
  } else {
    // No payment intent yet - create one first
    await initiatePayment()
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

    <!-- Attendee Info (read-only name/email, editable phone) -->
    <div class="space-y-4">
      <!-- Name & Email (read-only display) -->
      <div class="text-brand-muted text-sm">
        Registering as <strong class="text-brand-base">{{ attendeeName }}</strong>
        ({{ attendeeEmail }})
      </div>

      <!-- Phone (editable) -->
      <div>
        <label
          for="attendeePhone"
          class="text-brand-base mb-1 block text-sm font-medium"
        >
          Phone (optional)
        </label>
        <ClientOnly>
          <VueTelInput
            :model-value="attendeePhone"
            mode="national"
            :input-options="{
              placeholder: '+1 (555) 123-4567',
              id: 'attendeePhone',
              styleClasses: 'phone-input',
            }"
            :dropdown-options="{
              showDialCodeInSelection: true,
              showFlags: true,
              showSearchBox: true,
            }"
            default-country="US"
            class="phone-input-wrapper"
            @on-input="handlePhoneUpdate"
          />
        </ClientOnly>
      </div>
    </div>

    <!-- Loading state while initializing payment -->
    <div
      v-if="initializing"
      class="space-y-3"
    >
      <BaseSkeleton
        h="2.5rem"
        w="100%"
      />
      <BaseSkeleton
        h="2.5rem"
        w="100%"
      />
    </div>

    <!-- Payment Element (for paid events) -->
    <div v-else-if="clientSecret && !isFreeEvent">
      <StripePaymentElement
        :key="clientSecret"
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
        :loading="loading || initializing"
        :disabled="!isValid || loading || initializing"
      >
        <template v-if="isFreeEvent"> Register Free </template>
        <template v-else> Pay {{ formattedPrice }} </template>
      </BaseButton>
    </div>
  </form>
</template>

<style scoped>
/* Phone input styling to match brand */
:deep(.phone-input-wrapper) {
  width: 100%;
}

:deep(.phone-input-wrapper .vue-tel-input) {
  border: 1px solid var(--color-brand-base-20, rgba(0, 0, 0, 0.2));
  border-radius: 0.5rem;
  background: var(--color-brand-neutral);
}

:deep(.phone-input-wrapper .vue-tel-input:focus-within) {
  border-color: var(--color-brand-accent);
  box-shadow: 0 0 0 2px var(--color-brand-accent-20, rgba(216, 27, 96, 0.2));
}

:deep(.phone-input-wrapper .vti__input) {
  background: transparent;
  color: var(--color-brand-base);
  padding: 0.625rem 1rem;
}

:deep(.phone-input-wrapper .vti__input::placeholder) {
  color: var(--color-brand-muted);
}

:deep(.phone-input-wrapper .vti__dropdown) {
  background: var(--color-brand-neutral);
  border-right: 1px solid var(--color-brand-base-20, rgba(0, 0, 0, 0.2));
}

:deep(.phone-input-wrapper .vti__dropdown-list) {
  background: var(--color-brand-neutral);
  border: 1px solid var(--color-brand-base-20, rgba(0, 0, 0, 0.2));
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

:deep(.phone-input-wrapper .vti__dropdown-item) {
  color: var(--color-brand-base);
}

:deep(.phone-input-wrapper .vti__dropdown-item:hover) {
  background: var(--color-brand-accent-10, rgba(216, 27, 96, 0.1));
}

:deep(.phone-input-wrapper .vti__dropdown-item.highlighted) {
  background: var(--color-brand-accent);
  color: white;
}

:deep(.phone-input-wrapper .vti__search_box) {
  background: var(--color-brand-neutral);
  border: 1px solid var(--color-brand-base-20, rgba(0, 0, 0, 0.2));
  border-radius: 0.375rem;
  color: var(--color-brand-base);
  margin: 0.5rem;
  padding: 0.5rem;
}
</style>
