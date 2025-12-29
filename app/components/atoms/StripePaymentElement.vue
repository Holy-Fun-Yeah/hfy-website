<script setup lang="ts">
/**
 * Stripe Payment Element
 *
 * Wraps Stripe's Payment Element for embedded payment collection.
 * Uses the brand design system for styling.
 *
 * IMPORTANT: Use a :key on this component to force recreation when clientSecret changes.
 */

interface BillingDetails {
  name?: string
  email?: string
  phone?: string
}

interface Props {
  clientSecret: string
  disabled?: boolean
  billingDetails?: BillingDetails
}

const props = defineProps<Props>()

const emit = defineEmits<{
  ready: []
  error: [error: string]
}>()

const { $stripe } = useNuxtApp()

// Use unique ID for each instance to avoid DOM conflicts
const elementId = `payment-element-${Math.random().toString(36).slice(2, 11)}`

const stripe = ref<any>(null)
const elements = ref<any>(null)
const paymentElement = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const mounted = ref(false)

async function initializeStripe() {
  if (mounted.value) return

  try {
    stripe.value = await $stripe.getStripe()

    if (!stripe.value) {
      error.value = 'Payment system not available'
      emit('error', error.value)
      return
    }

    if (!props.clientSecret) {
      error.value = 'Missing payment configuration'
      emit('error', error.value)
      return
    }

    elements.value = stripe.value.elements({
      clientSecret: props.clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#d81b60', // brand accent
          colorBackground: '#fdfaf6', // brand background
          colorText: '#1a1a2e', // brand base
          colorDanger: '#dc2626',
          fontFamily: 'Poppins, system-ui, sans-serif',
          borderRadius: '8px',
        },
        rules: {
          '.Input': {
            border: '1px solid rgba(26, 26, 46, 0.2)',
            boxShadow: 'none',
          },
          '.Input:focus': {
            border: '1px solid #d81b60',
            boxShadow: '0 0 0 2px rgba(216, 27, 96, 0.2)',
          },
          '.Label': {
            fontWeight: '500',
          },
        },
      },
    })

    // Create payment element with default values for billing details
    // Email is set to 'never' - uses default value, not editable
    const paymentElementOptions: Record<string, unknown> = {
      fields: {
        billingDetails: {
          email: 'never', // Don't show email field - use default value
        },
      },
    }

    if (props.billingDetails) {
      paymentElementOptions.defaultValues = {
        billingDetails: {
          name: props.billingDetails.name || '',
          email: props.billingDetails.email || '',
          phone: props.billingDetails.phone || '',
        },
      }
    }

    paymentElement.value = elements.value.create('payment', paymentElementOptions)

    // Wait for DOM element to be available
    await nextTick()

    const container = document.getElementById(elementId)
    if (!container) {
      error.value = 'Payment container not found'
      emit('error', error.value)
      return
    }

    paymentElement.value.mount(`#${elementId}`)
    mounted.value = true

    paymentElement.value.on('ready', () => {
      loading.value = false
      emit('ready')
    })

    paymentElement.value.on('loaderror', (event: any) => {
      error.value = event.error?.message || 'Failed to load payment form'
      loading.value = false
      emit('error', error.value)
      console.error('[StripePaymentElement] Load error:', event.error)
    })

    paymentElement.value.on('change', (event: any) => {
      if (event.error) {
        error.value = event.error.message
      } else {
        error.value = null
      }
    })
  } catch (err: any) {
    error.value = err.message || 'Failed to load payment form'
    loading.value = false
    emit('error', error.value)
    console.error('[StripePaymentElement]', err)
  }
}

function cleanup() {
  if (paymentElement.value) {
    try {
      paymentElement.value.unmount()
      paymentElement.value.destroy()
    } catch (e) {
      // Ignore cleanup errors
    }
    paymentElement.value = null
  }
  if (elements.value) {
    elements.value = null
  }
  mounted.value = false
}

onMounted(() => {
  initializeStripe()
})

onBeforeUnmount(() => {
  cleanup()
})

// Expose confirm method for parent component
async function confirmPayment(returnUrl: string) {
  if (!stripe.value || !elements.value) {
    throw new Error('Payment system not initialized')
  }

  const { error: confirmError } = await stripe.value.confirmPayment({
    elements: elements.value,
    confirmParams: {
      return_url: returnUrl,
    },
    redirect: 'if_required',
  })

  if (confirmError) {
    throw new Error(confirmError.message)
  }

  return { success: true }
}

defineExpose({ confirmPayment })
</script>

<template>
  <div class="stripe-payment-element">
    <!-- Loading skeleton -->
    <div
      v-if="loading && !error"
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

    <!-- Payment element container -->
    <div
      :id="elementId"
      :class="{ 'pointer-events-none opacity-50': disabled, hidden: loading && !error }"
    />

    <!-- Error message -->
    <p
      v-if="error"
      class="mt-2 text-sm text-red-600"
    >
      {{ error }}
    </p>
  </div>
</template>
