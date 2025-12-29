<script setup lang="ts">
import { z } from 'zod'
import { VueTelInput } from 'vue-tel-input'
import 'vue-tel-input/vue-tel-input.css'
import { getErrorMessage } from '~/utils/parseApiError'

/**
 * Login Page
 *
 * General user login page with:
 * - Sign in with email/password
 * - Create account (with name and phone) via /api/auth/register
 * - Forgot password flow
 * - Uses default layout (normal header/footer)
 */

const { t } = useLocale()
const supabase = useSupabaseClient()
const { user, isAdmin, signIn, register } = useAuth()
const route = useRoute()
const router = useRouter()

// Check for email confirmation success message
const showEmailConfirmedMessage = ref(false)

// Check for auth error from redirect (e.g., expired link)
const authErrorMessage = ref<string | null>(null)
const authErrorCode = ref<string | null>(null)

onMounted(() => {
  if (route.query.message === 'email_confirmed') {
    showEmailConfirmedMessage.value = true
    // Clear the query param from URL
    router.replace({ query: {} })
  }

  // Handle auth errors redirected from plugin
  if (route.query.auth_error) {
    authErrorMessage.value = route.query.auth_error as string
    authErrorCode.value = (route.query.error_code as string) || null
    // Clear the query params from URL
    router.replace({ query: {} })
  }
})

// Form modes
type FormMode = 'signIn' | 'signUp' | 'forgotPassword' | 'resendVerification' | 'emailSent'
const mode = ref<FormMode>('signIn')

// Track which flow triggered the email sent screen
type EmailSentSource = 'signUp' | 'forgotPassword' | 'resendVerification'
const emailSentSource = ref<EmailSentSource>('forgotPassword')

// Form state
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const fullName = ref('')
const pronouns = ref<string | null>(null)
const phoneNumber = ref('')
const phoneCountryCode = ref('')
const loading = ref(false)
const errorMessage = ref('')

// Detect if error is about email verification
const isVerificationError = computed(() => {
  const msg = errorMessage.value.toLowerCase()
  return msg.includes('verify') || msg.includes('confirm') || msg.includes('email')
})

// Field-level validation errors
const fieldErrors = ref<Record<string, string>>({})

// Track touched fields for showing errors only after interaction
const touchedFields = ref<Set<string>>(new Set())

// Zod validation schemas
const signInSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    phone: z.string().optional(),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(72, 'Password must be less than 72 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
})

// Get current form data based on mode
function getFormData() {
  if (mode.value === 'signIn') {
    return { email: email.value, password: password.value }
  } else if (mode.value === 'signUp') {
    return {
      fullName: fullName.value,
      pronouns: pronouns.value,
      email: email.value,
      phoneCountryCode: phoneCountryCode.value,
      phoneNumber: phoneNumber.value,
      password: password.value,
      confirmPassword: confirmPassword.value,
    }
  } else {
    return { email: email.value }
  }
}

// Get current schema based on mode
function getCurrentSchema() {
  if (mode.value === 'signIn') return signInSchema
  if (mode.value === 'signUp') return signUpSchema
  return forgotPasswordSchema
}

// Get the base object schema (unwrap ZodEffects if needed)
function getBaseSchema(schema: z.ZodTypeAny): z.AnyZodObject | null {
  if (schema instanceof z.ZodObject) {
    return schema
  }
  // Handle ZodEffects (from .refine())
  if (schema instanceof z.ZodEffects) {
    return getBaseSchema(schema._def.schema)
  }
  return null
}

// Validate a single field
function validateField(fieldName: string) {
  const schema = getCurrentSchema()
  const data = getFormData()

  // Clear error for this field first
  delete fieldErrors.value[fieldName]

  // For confirmPassword, we need to validate the whole schema to check refinement
  if (fieldName === 'confirmPassword' && mode.value === 'signUp') {
    const result = signUpSchema.safeParse(data)
    if (!result.success) {
      const fieldError = result.error.errors.find((e) => e.path.includes('confirmPassword'))
      if (fieldError) {
        fieldErrors.value.confirmPassword = fieldError.message
      }
    }
    return
  }

  // For other fields, validate just that field
  const baseSchema = getBaseSchema(schema)
  const fieldSchema = baseSchema?.shape?.[fieldName]
  if (fieldSchema) {
    const result = fieldSchema.safeParse((data as Record<string, unknown>)[fieldName])
    if (!result.success) {
      fieldErrors.value[fieldName] = result.error.errors[0].message
    }
  }
}

// Mark field as touched and validate
function handleBlur(fieldName: string) {
  touchedFields.value.add(fieldName)
  validateField(fieldName)
}

// Validate entire form
function validateForm(): boolean {
  const schema = getCurrentSchema()
  const data = getFormData()

  fieldErrors.value = {}
  const result = schema.safeParse(data)

  if (!result.success) {
    for (const error of result.error.errors) {
      const fieldName = error.path[0] as string
      if (!fieldErrors.value[fieldName]) {
        fieldErrors.value[fieldName] = error.message
      }
    }
    return false
  }

  return true
}

// Check if field has error and should show it
function shouldShowError(fieldName: string): boolean {
  return touchedFields.value.has(fieldName) && !!fieldErrors.value[fieldName]
}

// Get error class for input
function getInputClass(fieldName: string): string {
  const baseClass =
    'bg-brand-neutral text-brand-base placeholder:text-brand-muted w-full rounded-lg border px-4 py-2.5 transition outline-none focus:ring-2'
  if (shouldShowError(fieldName)) {
    return `${baseClass} border-red-500 focus:border-red-500 focus:ring-red-500/20`
  }
  return `${baseClass} border-brand-base/20 focus:border-brand-accent focus:ring-brand-accent/20`
}

// Phone input handler - receives phone object with full details
// We store the country code and phone number separately
function handlePhoneUpdate(
  _nationalNumber: string,
  phoneObject: { number?: string; valid?: boolean; country?: { dialCode?: string } }
) {
  // Extract country code and national number
  const dialCode = phoneObject.country?.dialCode || ''
  phoneCountryCode.value = dialCode.replace('+', '') // Remove + prefix if present

  // Get national number (without country code)
  // phoneObject.number is E.164 format (e.g., +528118471700)
  // We extract just the number portion after the dial code
  const fullNumber = phoneObject.number || ''
  if (fullNumber.startsWith('+') && dialCode) {
    // Remove + and country code to get national number
    const prefix = '+' + phoneCountryCode.value
    phoneNumber.value = fullNumber.slice(prefix.length)
  } else {
    phoneNumber.value = fullNumber
  }

  if (touchedFields.value.has('phone')) {
    validateField('phone')
  }
}

// Get redirect URL from query params
const redirectUrl = computed(() => {
  const redirect = route.query.redirect as string | undefined
  if (redirect && redirect.startsWith('/')) {
    return redirect
  }
  return null
})

// Redirect logged-in users
watch(
  user,
  (newUser) => {
    if (newUser) {
      // Check for redirect query param first
      if (redirectUrl.value) {
        navigateTo(redirectUrl.value)
        return
      }
      // Admins go to editor, regular users go home
      if (isAdmin.value) {
        navigateTo('/admin/editor')
      } else {
        navigateTo('/')
      }
    }
  },
  { immediate: true }
)

// Handle sign in
async function handleSignIn() {
  // Mark all fields as touched for validation display
  touchedFields.value.add('email')
  touchedFields.value.add('password')

  if (!validateForm()) {
    return
  }

  errorMessage.value = ''
  loading.value = true

  try {
    await signIn(email.value, password.value)
  } catch (error) {
    errorMessage.value = getErrorMessage(error, t('auth.unknownError'))
    console.error('[Login] Sign in failed:', error)
  } finally {
    loading.value = false
  }
}

// Handle sign up
async function handleSignUp() {
  // Mark all fields as touched for validation display
  touchedFields.value.add('fullName')
  touchedFields.value.add('email')
  touchedFields.value.add('phone')
  touchedFields.value.add('password')
  touchedFields.value.add('confirmPassword')

  if (!validateForm()) {
    return
  }

  errorMessage.value = ''
  loading.value = true

  try {
    // Register via our API (creates auth user + profile atomically)
    await register({
      email: email.value,
      password: password.value,
      displayName: fullName.value,
      pronouns: pronouns.value || undefined,
      phoneCountryCode: phoneCountryCode.value || undefined,
      phoneNumber: phoneNumber.value || undefined,
    })

    // Show success message - user needs to verify email
    emailSentSource.value = 'signUp'
    mode.value = 'emailSent'
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = getErrorMessage(error, t('auth.unknownError'))
    console.error('[Login] Registration failed:', error)
  } finally {
    loading.value = false
  }
}

// Handle forgot password
async function handleForgotPassword() {
  // Mark email as touched for validation display
  touchedFields.value.add('email')

  if (!validateForm()) {
    return
  }

  errorMessage.value = ''
  loading.value = true

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) throw error
    emailSentSource.value = 'forgotPassword'
    mode.value = 'emailSent'
  } catch (error) {
    errorMessage.value = getErrorMessage(error, t('auth.unknownError'))
    console.error('[Login] Password reset failed:', error)
  } finally {
    loading.value = false
  }
}

// Handle resend verification email
async function handleResendVerification() {
  // Mark email as touched for validation display
  touchedFields.value.add('email')

  if (!validateForm()) {
    return
  }

  errorMessage.value = ''
  loading.value = true

  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.value,
    })
    if (error) throw error
    emailSentSource.value = 'resendVerification'
    mode.value = 'emailSent'
    // Clear any auth error since user is taking action
    authErrorMessage.value = null
  } catch (error) {
    errorMessage.value = getErrorMessage(error, t('auth.unknownError'))
    console.error('[Login] Resend verification failed:', error)
  } finally {
    loading.value = false
  }
}

// Handle form submission based on mode
function handleSubmit() {
  if (mode.value === 'signIn') {
    handleSignIn()
  } else if (mode.value === 'signUp') {
    handleSignUp()
  } else if (mode.value === 'forgotPassword') {
    handleForgotPassword()
  } else if (mode.value === 'resendVerification') {
    handleResendVerification()
  }
}

// Switch mode and clear errors
function switchMode(newMode: FormMode) {
  mode.value = newMode
  errorMessage.value = ''
  password.value = ''
  confirmPassword.value = ''
  // Clear validation state
  fieldErrors.value = {}
  touchedFields.value.clear()
  if (newMode !== 'signUp') {
    fullName.value = ''
    pronouns.value = null
    phoneCountryCode.value = ''
    phoneNumber.value = ''
  }
}

useSeoMeta({
  title: () => t('auth.signIn'),
})
</script>

<template>
  <div class="flex min-h-[70vh] items-center justify-center px-4 py-16">
    <div class="w-full max-w-md">
      <!-- Email confirmed success banner -->
      <div
        v-if="showEmailConfirmedMessage"
        class="bg-brand-accent/10 border-brand-accent/30 mb-4 flex items-center gap-3 rounded-xl border p-4"
      >
        <div class="text-brand-accent text-2xl">
          <span aria-hidden="true">&#10003;</span>
        </div>
        <div>
          <p class="text-brand-base font-medium">Email Confirmed!</p>
          <p class="text-brand-muted text-sm">You can now sign in to your account.</p>
        </div>
      </div>

      <!-- Auth error banner (e.g., expired link) -->
      <div
        v-if="authErrorMessage"
        class="mb-4 flex items-start gap-3 rounded-xl border border-red-400 bg-red-50 p-4 dark:border-red-700 dark:bg-red-950"
      >
        <div class="text-2xl text-red-600 dark:text-red-400">
          <span aria-hidden="true">&#9888;</span>
        </div>
        <div>
          <p class="font-medium text-red-900 dark:text-red-100">Authentication Error</p>
          <p class="text-sm text-red-800 dark:text-red-200">{{ authErrorMessage }}</p>
          <button
            v-if="authErrorCode === 'otp_expired'"
            type="button"
            class="text-brand-accent hover:text-brand-accent/80 mt-2 text-sm font-medium underline"
            @click="switchMode('resendVerification')"
          >
            Resend verification email
          </button>
        </div>
        <button
          type="button"
          class="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
          aria-label="Dismiss"
          @click="authErrorMessage = null"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <BaseCard padding="lg">
        <!-- Email sent confirmation (sign up or forgot password) -->
        <div
          v-if="mode === 'emailSent'"
          class="text-center"
        >
          <div class="text-brand-accent mb-4 text-5xl">
            <span aria-hidden="true">&#9993;</span>
          </div>
          <h1 class="font-headers text-brand-base mb-2 text-2xl font-bold">
            {{ t('auth.checkEmail') }}
          </h1>
          <p class="text-brand-muted mb-6">
            {{
              emailSentSource === 'signUp' || emailSentSource === 'resendVerification'
                ? t('auth.confirmEmailSent')
                : t('auth.resetEmailSent')
            }}
          </p>
          <BaseButton
            variant="outline"
            @click="switchMode('signIn')"
          >
            {{ t('auth.backToSignIn') }}
          </BaseButton>
        </div>

        <!-- Sign In / Sign Up / Forgot Password forms -->
        <template v-else>
          <div class="mb-6 text-center">
            <h1 class="font-headers text-brand-base mb-2 text-2xl font-bold">
              {{
                mode === 'signIn'
                  ? t('auth.signIn')
                  : mode === 'signUp'
                    ? t('auth.createAccount')
                    : mode === 'resendVerification'
                      ? 'Resend Verification'
                      : t('auth.forgotPassword')
              }}
            </h1>
            <p
              v-if="mode === 'forgotPassword'"
              class="text-brand-muted text-sm"
            >
              {{ t('auth.forgotPasswordDescription') }}
            </p>
            <p
              v-if="mode === 'resendVerification'"
              class="text-brand-muted text-sm"
            >
              Enter your email to receive a new verification link.
            </p>
          </div>

          <form
            class="space-y-4"
            @submit.prevent="handleSubmit"
          >
            <!-- Pronouns and Full Name (sign up only, same row) -->
            <div
              v-if="mode === 'signUp'"
              class="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              <!-- Pronouns -->
              <div>
                <label class="text-brand-base mb-1 block text-sm font-medium">
                  {{ t('pronouns.selectPronouns') }}
                </label>
                <PronounsSelect v-model="pronouns" />
              </div>

              <!-- Full Name -->
              <div class="sm:col-span-2">
                <label
                  for="fullName"
                  class="text-brand-base mb-1 block text-sm font-medium"
                >
                  {{ t('auth.fullName') }}
                </label>
                <input
                  id="fullName"
                  v-model="fullName"
                  type="text"
                  required
                  autocomplete="name"
                  :class="getInputClass('fullName')"
                  :placeholder="t('auth.fullNamePlaceholder')"
                  @blur="handleBlur('fullName')"
                />
                <p
                  v-if="shouldShowError('fullName')"
                  class="mt-1 text-sm text-red-500"
                >
                  {{ fieldErrors.fullName }}
                </p>
              </div>
            </div>

            <!-- Email -->
            <div>
              <label
                for="email"
                class="text-brand-base mb-1 block text-sm font-medium"
              >
                {{ t('auth.email') }}
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                autocomplete="email"
                :class="getInputClass('email')"
                :placeholder="t('auth.emailPlaceholder')"
                @blur="handleBlur('email')"
              />
              <p
                v-if="shouldShowError('email')"
                class="mt-1 text-sm text-red-500"
              >
                {{ fieldErrors.email }}
              </p>
            </div>

            <!-- Phone (sign up only) -->
            <div v-if="mode === 'signUp'">
              <label
                for="phoneNumber"
                class="text-brand-base mb-1 block text-sm font-medium"
              >
                {{ t('auth.phone') }}
              </label>
              <ClientOnly>
                <VueTelInput
                  mode="national"
                  :input-options="{
                    placeholder: t('auth.phonePlaceholder'),
                    id: 'phoneNumber',
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
              <p class="text-brand-muted mt-1 text-xs">
                {{ t('auth.phoneOptional') }}
              </p>
            </div>

            <!-- Password (not shown for forgot password or resend verification) -->
            <div v-if="mode !== 'forgotPassword' && mode !== 'resendVerification'">
              <label
                for="password"
                class="text-brand-base mb-1 block text-sm font-medium"
              >
                {{ t('auth.password') }}
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                :autocomplete="mode === 'signUp' ? 'new-password' : 'current-password'"
                :class="getInputClass('password')"
                :placeholder="t('auth.passwordPlaceholder')"
                @blur="handleBlur('password')"
              />
              <p
                v-if="shouldShowError('password')"
                class="mt-1 text-sm text-red-500"
              >
                {{ fieldErrors.password }}
              </p>
            </div>

            <!-- Confirm Password (sign up only) -->
            <div v-if="mode === 'signUp'">
              <label
                for="confirmPassword"
                class="text-brand-base mb-1 block text-sm font-medium"
              >
                {{ t('auth.confirmPassword') }}
              </label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                required
                autocomplete="new-password"
                :class="getInputClass('confirmPassword')"
                :placeholder="t('auth.confirmPasswordPlaceholder')"
                @blur="handleBlur('confirmPassword')"
              />
              <p
                v-if="shouldShowError('confirmPassword')"
                class="mt-1 text-sm text-red-500"
              >
                {{ fieldErrors.confirmPassword }}
              </p>
            </div>

            <!-- Forgot password link (sign in only) -->
            <div
              v-if="mode === 'signIn'"
              class="text-right"
            >
              <button
                type="button"
                class="text-brand-accent hover:text-brand-accent/80 text-sm transition"
                @click="switchMode('forgotPassword')"
              >
                {{ t('auth.forgotPassword') }}
              </button>
            </div>

            <!-- Error message -->
            <div v-if="errorMessage">
              <p class="text-sm text-red-500">
                {{ errorMessage }}
              </p>
              <button
                v-if="isVerificationError && mode === 'signIn'"
                type="button"
                class="mt-1 text-sm font-medium text-red-600 underline hover:text-red-800"
                @click="switchMode('resendVerification')"
              >
                Resend verification email
              </button>
            </div>

            <!-- Submit button -->
            <BaseButton
              type="submit"
              class="w-full"
              :loading="loading"
            >
              {{
                mode === 'signIn'
                  ? t('auth.signIn')
                  : mode === 'signUp'
                    ? t('auth.createAccount')
                    : mode === 'resendVerification'
                      ? 'Resend Verification Email'
                      : t('auth.sendResetLink')
              }}
            </BaseButton>
          </form>

          <!-- Toggle between modes -->
          <div class="mt-6 text-center">
            <template v-if="mode === 'signIn'">
              <p class="text-brand-muted text-sm">
                {{ t('auth.noAccount') }}
                <button
                  type="button"
                  class="text-brand-accent hover:text-brand-accent/80 font-medium transition"
                  @click="switchMode('signUp')"
                >
                  {{ t('auth.createAccount') }}
                </button>
              </p>
            </template>
            <template v-else-if="mode === 'signUp'">
              <p class="text-brand-muted text-sm">
                {{ t('auth.hasAccount') }}
                <button
                  type="button"
                  class="text-brand-accent hover:text-brand-accent/80 font-medium transition"
                  @click="switchMode('signIn')"
                >
                  {{ t('auth.signIn') }}
                </button>
              </p>
            </template>
            <template v-else-if="mode === 'forgotPassword'">
              <p class="text-brand-muted text-sm">
                <button
                  type="button"
                  class="text-brand-accent hover:text-brand-accent/80 font-medium transition"
                  @click="switchMode('signIn')"
                >
                  {{ t('auth.backToSignIn') }}
                </button>
              </p>
            </template>
            <template v-else-if="mode === 'resendVerification'">
              <p class="text-brand-muted text-sm">
                <button
                  type="button"
                  class="text-brand-accent hover:text-brand-accent/80 font-medium transition"
                  @click="switchMode('signIn')"
                >
                  {{ t('auth.backToSignIn') }}
                </button>
              </p>
            </template>
          </div>
        </template>
      </BaseCard>
    </div>
  </div>
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
