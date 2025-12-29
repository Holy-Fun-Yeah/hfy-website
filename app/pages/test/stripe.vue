<script setup lang="ts">
/**
 * Stripe Component Test Page
 *
 * Development-only page for testing the Stripe Payment Element.
 * Navigate to /test/stripe to test.
 *
 * Test cards:
 * - Success: 4242 4242 4242 4242
 * - Decline: 4000 0000 0000 0002
 */

// Only allow in development
const config = useRuntimeConfig()
if (config.public.appEnv === 'production') {
  throw createError({ statusCode: 404, message: 'Page not found' })
}

const loading = ref(false)
const error = ref<string | null>(null)
const clientSecret = ref<string | null>(null)
const paymentIntentId = ref<string | null>(null)
const result = ref<string | null>(null)

const stripeElementRef = ref<{
  confirmPayment: (url: string) => Promise<{ success: boolean }>
} | null>(null)

const testAmount = ref(1000) // $10.00 in cents

async function createTestPayment() {
  loading.value = true
  error.value = null
  result.value = null

  try {
    const response = await $fetch('/api/stripe/test-payment', {
      method: 'POST',
      body: { amount: testAmount.value, description: 'Stripe Component Test' },
    })

    const data = 'data' in response && response.success ? response.data : response
    clientSecret.value = (data as any).clientSecret
    paymentIntentId.value = (data as any).paymentIntentId
  } catch (err: any) {
    error.value = err.data?.error?.message || err.message || 'Failed to create payment'
    console.error('[TestStripe]', err)
  } finally {
    loading.value = false
  }
}

async function submitPayment() {
  if (!stripeElementRef.value || !clientSecret.value) {
    error.value = 'Payment element not ready'
    return
  }

  loading.value = true
  error.value = null

  try {
    const returnUrl = `${window.location.origin}/test/stripe?success=true`
    await stripeElementRef.value.confirmPayment(returnUrl)
    result.value = 'Payment successful!'
  } catch (err: any) {
    error.value = err.message || 'Payment failed'
  } finally {
    loading.value = false
  }
}

function reset() {
  clientSecret.value = null
  paymentIntentId.value = null
  error.value = null
  result.value = null
}

// Check for success redirect
onMounted(() => {
  const route = useRoute()
  if (route.query.success === 'true') {
    result.value = 'Payment completed successfully!'
  }
})
</script>

<template>
  <div class="mx-auto max-w-md p-8">
    <h1 class="font-headers text-brand-base mb-6 text-2xl font-bold">Stripe Component Test</h1>

    <div class="bg-brand-neutral mb-6 rounded-xl border border-amber-500 p-4">
      <p class="text-sm font-medium text-amber-700">Development Only</p>
      <p class="text-brand-muted mt-1 text-xs">This page is only available in development mode.</p>
    </div>

    <!-- Test Cards Info -->
    <div class="bg-brand-neutral/50 mb-6 rounded-lg p-4 text-sm">
      <p class="text-brand-base mb-2 font-medium">Test Card Numbers:</p>
      <ul class="text-brand-muted space-y-1">
        <li><code class="bg-brand-neutral rounded px-1">4242 4242 4242 4242</code> - Success</li>
        <li><code class="bg-brand-neutral rounded px-1">4000 0000 0000 0002</code> - Decline</li>
        <li>Any future expiry, any 3-digit CVC</li>
      </ul>
    </div>

    <!-- Step 1: Create Payment Intent -->
    <div
      v-if="!clientSecret"
      class="space-y-4"
    >
      <div>
        <label class="text-brand-base mb-1 block text-sm font-medium"> Amount (cents) </label>
        <input
          v-model.number="testAmount"
          type="number"
          min="50"
          max="100000"
          class="bg-brand-neutral border-brand-base/20 text-brand-base w-full rounded-lg border px-4 py-2.5"
        />
        <p class="text-brand-muted mt-1 text-xs">= ${{ (testAmount / 100).toFixed(2) }}</p>
      </div>

      <BaseButton
        :loading="loading"
        class="w-full"
        @click="createTestPayment"
      >
        Create Test Payment Intent
      </BaseButton>
    </div>

    <!-- Step 2: Stripe Payment Element -->
    <div
      v-else
      class="space-y-4"
    >
      <div class="bg-brand-neutral/50 rounded-lg p-4">
        <p class="text-brand-muted text-sm">
          Payment Intent: <code class="text-brand-base">{{ paymentIntentId }}</code>
        </p>
        <p class="text-brand-accent mt-2 font-bold">${{ (testAmount / 100).toFixed(2) }}</p>
      </div>

      <!-- Stripe Element -->
      <StripePaymentElement
        :key="clientSecret"
        ref="stripeElementRef"
        :client-secret="clientSecret"
        :disabled="loading"
      />

      <div class="flex gap-3">
        <BaseButton
          variant="ghost"
          class="flex-1"
          :disabled="loading"
          @click="reset"
        >
          Cancel
        </BaseButton>
        <BaseButton
          class="flex-1"
          :loading="loading"
          @click="submitPayment"
        >
          Pay ${{ (testAmount / 100).toFixed(2) }}
        </BaseButton>
      </div>
    </div>

    <!-- Error Message -->
    <p
      v-if="error"
      class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
    >
      {{ error }}
    </p>

    <!-- Success Message -->
    <p
      v-if="result"
      class="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-600"
    >
      {{ result }}
    </p>
  </div>
</template>
