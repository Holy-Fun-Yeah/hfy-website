<script setup lang="ts">
/**
 * Reset Password Page
 *
 * Users land here after clicking the password reset link in their email.
 * Allows them to set a new password.
 */

const { t } = useLocale()
const supabase = useSupabaseClient()

// Form state
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const success = ref(false)

// Handle password update
async function handleUpdatePassword() {
  errorMessage.value = ''
  loading.value = true

  try {
    if (newPassword.value !== confirmPassword.value) {
      throw new Error(t('auth.passwordMismatch'))
    }
    if (newPassword.value.length < 6) {
      throw new Error(t('auth.passwordTooShort'))
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword.value,
    })

    if (error) throw error

    success.value = true
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t('auth.unknownError')
  } finally {
    loading.value = false
  }
}

useSeoMeta({
  title: () => t('auth.resetPassword'),
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="flex min-h-[70vh] items-center justify-center px-4 py-16">
    <div class="w-full max-w-md">
      <BaseCard padding="lg">
        <!-- Success state -->
        <div
          v-if="success"
          class="text-center"
        >
          <div class="text-brand-accent mb-4 text-5xl">
            <span aria-hidden="true">&#10003;</span>
          </div>
          <h1 class="font-headers text-brand-base mb-2 text-2xl font-bold">
            {{ t('auth.passwordUpdated') }}
          </h1>
          <p class="text-brand-muted mb-6">
            {{ t('auth.passwordUpdatedDescription') }}
          </p>
          <BaseButton @click="navigateTo('/login')">
            {{ t('auth.signIn') }}
          </BaseButton>
        </div>

        <!-- Reset form -->
        <template v-else>
          <div class="mb-6 text-center">
            <h1 class="font-headers text-brand-base mb-2 text-2xl font-bold">
              {{ t('auth.resetPassword') }}
            </h1>
            <p class="text-brand-muted text-sm">
              {{ t('auth.resetPasswordDescription') }}
            </p>
          </div>

          <form
            class="space-y-4"
            @submit.prevent="handleUpdatePassword"
          >
            <!-- New Password -->
            <div>
              <label
                for="newPassword"
                class="text-brand-base mb-1 block text-sm font-medium"
              >
                {{ t('auth.newPassword') }}
              </label>
              <input
                id="newPassword"
                v-model="newPassword"
                type="password"
                required
                autocomplete="new-password"
                class="bg-brand-neutral border-brand-base/20 text-brand-base placeholder:text-brand-muted focus:border-brand-accent focus:ring-brand-accent/20 w-full rounded-lg border px-4 py-2.5 transition outline-none focus:ring-2"
                :placeholder="t('auth.newPasswordPlaceholder')"
              />
            </div>

            <!-- Confirm Password -->
            <div>
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
                class="bg-brand-neutral border-brand-base/20 text-brand-base placeholder:text-brand-muted focus:border-brand-accent focus:ring-brand-accent/20 w-full rounded-lg border px-4 py-2.5 transition outline-none focus:ring-2"
                :placeholder="t('auth.confirmPasswordPlaceholder')"
              />
            </div>

            <!-- Error message -->
            <p
              v-if="errorMessage"
              class="text-sm text-red-500"
            >
              {{ errorMessage }}
            </p>

            <!-- Submit button -->
            <BaseButton
              type="submit"
              class="w-full"
              :loading="loading"
            >
              {{ t('auth.updatePassword') }}
            </BaseButton>
          </form>
        </template>
      </BaseCard>
    </div>
  </div>
</template>
