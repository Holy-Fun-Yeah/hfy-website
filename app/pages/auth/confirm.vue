<script setup lang="ts">
/**
 * Email Confirmation Callback Page
 *
 * Supabase redirects here after email confirmation/password reset.
 * This page handles:
 * 1. Success: Redirect to /account with success message
 * 2. Error: Show error with option to resend confirmation
 * 3. Not authenticated: Redirect to /login
 *
 * Query params from Supabase:
 * - error: Error code (e.g., 'access_denied')
 * - error_code: Specific code (e.g., 'otp_expired')
 * - error_description: Human-readable message
 */

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const errorCode = ref<string | null>(null)
const resendLoading = ref(false)
const resendSuccess = ref(false)
const resendEmail = ref('')

// Check for errors in URL (can be in query or hash)
function parseErrors() {
  // Supabase puts errors in both query and hash fragment
  const queryError = route.query.error as string | undefined
  const queryErrorCode = route.query.error_code as string | undefined
  const queryErrorDesc = route.query.error_description as string | undefined

  // Also check hash fragment (Supabase sometimes puts it there)
  let hashError: string | undefined
  let hashErrorCode: string | undefined
  let hashErrorDesc: string | undefined

  if (import.meta.client && window.location.hash) {
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    hashError = hashParams.get('error') || undefined
    hashErrorCode = hashParams.get('error_code') || undefined
    hashErrorDesc = hashParams.get('error_description') || undefined
  }

  return {
    error: queryError || hashError,
    errorCode: queryErrorCode || hashErrorCode,
    errorDescription: queryErrorDesc || hashErrorDesc,
  }
}

// Handle the confirmation flow
async function handleConfirmation() {
  const errors = parseErrors()

  if (errors.error) {
    // There was an error with the confirmation
    errorCode.value = errors.errorCode || errors.error
    error.value = errors.errorDescription?.replace(/\+/g, ' ') || 'Email confirmation failed'
    loading.value = false
    return
  }

  // Wait a moment for Supabase to process the token
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Check if user is now authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.user) {
    // Success! User is confirmed and logged in
    // Redirect to account page
    navigateTo({ path: '/account', query: { confirmed: 'true' } }, { replace: true })
  } else {
    // No session - user needs to sign in
    navigateTo({ path: '/login', query: { message: 'email_confirmed' } }, { replace: true })
  }
}

// Resend confirmation email
async function resendConfirmation() {
  if (!resendEmail.value) return

  resendLoading.value = true
  resendSuccess.value = false

  try {
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: resendEmail.value,
    })

    if (resendError) throw resendError

    resendSuccess.value = true
  } catch (err) {
    console.error('Resend error:', err)
    error.value = err instanceof Error ? err.message : 'Failed to resend confirmation email'
  } finally {
    resendLoading.value = false
  }
}

// Run on mount
onMounted(() => {
  handleConfirmation()
})

// Watch for user changes (in case auth state updates)
watch(user, (newUser) => {
  if (newUser && !error.value) {
    navigateTo({ path: '/account', query: { confirmed: 'true' } }, { replace: true })
  }
})

useSeoMeta({
  title: 'Confirming Email',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="flex min-h-[70vh] items-center justify-center px-4 py-16">
    <div class="w-full max-w-md">
      <BaseCard padding="lg">
        <!-- Loading state -->
        <div
          v-if="loading && !error"
          class="text-center"
        >
          <div class="text-brand-accent mb-4 animate-pulse text-5xl">
            <span aria-hidden="true">&#10024;</span>
          </div>
          <h1 class="font-headers text-brand-base mb-2 text-2xl font-bold">
            Confirming your email...
          </h1>
          <p class="text-brand-muted">Please wait while we verify your account.</p>
        </div>

        <!-- Error state -->
        <div
          v-else-if="error"
          class="text-center"
        >
          <div class="mb-4 text-5xl text-red-500">
            <span aria-hidden="true">&#9888;</span>
          </div>
          <h1 class="font-headers text-brand-base mb-2 text-2xl font-bold">Confirmation Failed</h1>
          <p class="text-brand-muted mb-4">
            {{ error }}
          </p>

          <!-- OTP expired specific message -->
          <p
            v-if="errorCode === 'otp_expired'"
            class="text-brand-muted mb-6 text-sm"
          >
            The confirmation link has expired. Please request a new one below.
          </p>

          <!-- Resend confirmation form -->
          <div
            v-if="!resendSuccess"
            class="space-y-4"
          >
            <div>
              <label
                for="resendEmail"
                class="text-brand-base mb-1 block text-sm font-medium"
              >
                Email address
              </label>
              <input
                id="resendEmail"
                v-model="resendEmail"
                type="email"
                required
                autocomplete="email"
                class="bg-brand-neutral border-brand-base/20 text-brand-base placeholder:text-brand-muted focus:border-brand-accent focus:ring-brand-accent/20 w-full rounded-lg border px-4 py-2.5 transition outline-none focus:ring-2"
                placeholder="your@email.com"
              />
            </div>
            <BaseButton
              class="w-full"
              :loading="resendLoading"
              @click="resendConfirmation"
            >
              Resend Confirmation Email
            </BaseButton>
          </div>

          <!-- Resend success -->
          <div
            v-else
            class="rounded-lg bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-200"
          >
            <p class="font-medium">Confirmation email sent!</p>
            <p class="text-sm opacity-80">Please check your inbox and click the new link.</p>
          </div>

          <!-- Back to login link -->
          <div class="mt-6">
            <NuxtLink
              to="/login"
              class="text-brand-accent hover:text-brand-accent/80 text-sm font-medium transition"
            >
              ← Back to Sign In
            </NuxtLink>
          </div>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
