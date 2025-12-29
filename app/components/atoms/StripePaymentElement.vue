<script setup lang="ts">
/**
 * Stripe Payment Element
 *
 * Wraps Stripe's Payment Element for embedded payment collection.
 * Uses the brand design system for styling.
 */

interface Props {
  clientSecret: string
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  ready: []
  error: [error: string]
}>()

const { $stripe } = useNuxtApp()

const stripe = ref<any>(null)
const elements = ref<any>(null)
const paymentElement = ref<any>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    stripe.value = await $stripe.getStripe()

    if (!stripe.value) {
      error.value = 'Payment system not available'
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

    paymentElement.value = elements.value.create('payment')
    paymentElement.value.mount('#payment-element')

    paymentElement.value.on('ready', () => {
      loading.value = false
      emit('ready')
    })

    paymentElement.value.on('change', (event: any) => {
      if (event.error) {
        error.value = event.error.message
      } else {
        error.value = null
      }
    })
  } catch (err) {
    error.value = 'Failed to load payment form'
    emit('error', error.value)
    console.error('[StripePaymentElement]', err)
  }
})

onUnmounted(() => {
  if (paymentElement.value) {
    paymentElement.value.unmount()
  }
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
      v-if="loading"
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
      id="payment-element"
      :class="{ 'pointer-events-none opacity-50': disabled }"
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
