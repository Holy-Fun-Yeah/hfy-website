<script setup lang="ts">
import { getErrorMessage } from '~/utils/parseApiError'

/**
 * My Account Page
 *
 * Protected page showing user account information:
 * - Basic info (email, name, phone)
 * - Newsletter subscription toggle
 * - Account deletion with double verification
 *
 * Query params:
 * - confirmed=true: Show success toast for email confirmation
 */

const { user, profile, profileLoading, fetchProfile, signOut } = useAuth()
const router = useRouter()
const route = useRoute()

// Email confirmation success toast
const showConfirmationSuccess = ref(false)

// Form state
const displayName = ref('')
const phone = ref('')
const newsletterSubscribed = ref(false)

// UI state
const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

// Delete account state
const showDeleteModal = ref(false)
const deleteStep = ref<1 | 2>(1)
const deleteConfirmation = ref('')
const deleting = ref(false)
const deleteError = ref('')

// Initialize form with profile data
watch(
  profile,
  (newProfile) => {
    if (newProfile) {
      displayName.value = newProfile.displayName || ''
      phone.value = (newProfile as { phone?: string }).phone || ''
      newsletterSubscribed.value =
        (newProfile as { newsletterSubscribed?: boolean }).newsletterSubscribed || false
    }
  },
  { immediate: true }
)

// Ensure profile is loaded and check for confirmation success
onMounted(async () => {
  if (!profile.value && user.value) {
    await fetchProfile()
  }

  // Check for email confirmation success
  if (route.query.confirmed === 'true') {
    showConfirmationSuccess.value = true
    // Clear the query param from URL without navigation
    router.replace({ query: {} })
    // Auto-hide after 5 seconds
    setTimeout(() => {
      showConfirmationSuccess.value = false
    }, 5000)
  }
})

// Save profile changes
async function handleSaveProfile() {
  saving.value = true
  saveSuccess.value = false
  saveError.value = ''

  try {
    await $fetch('/api/auth/profile', {
      method: 'PATCH',
      body: {
        displayName: displayName.value,
        phone: phone.value || null,
        newsletterSubscribed: newsletterSubscribed.value,
      },
    })
    saveSuccess.value = true
    await fetchProfile()
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  } catch (error) {
    saveError.value = getErrorMessage(error, 'Failed to save changes')
    console.error('[Account] Save profile failed:', error)
  } finally {
    saving.value = false
  }
}

// Toggle newsletter subscription
async function handleToggleNewsletter() {
  newsletterSubscribed.value = !newsletterSubscribed.value
  await handleSaveProfile()
}

// Delete account flow
function openDeleteModal() {
  showDeleteModal.value = true
  deleteStep.value = 1
  deleteConfirmation.value = ''
  deleteError.value = ''
}

function closeDeleteModal() {
  showDeleteModal.value = false
  deleteStep.value = 1
  deleteConfirmation.value = ''
  deleteError.value = ''
}

function proceedToStep2() {
  deleteStep.value = 2
}

async function handleDeleteAccount() {
  if (deleteConfirmation.value !== 'DELETE') {
    deleteError.value = 'Please type DELETE to confirm'
    return
  }

  deleting.value = true
  deleteError.value = ''

  try {
    await $fetch('/api/auth/account', {
      method: 'DELETE',
      body: {
        confirmationToken: deleteConfirmation.value,
      },
    })
    await signOut()
    router.push('/')
  } catch (error) {
    deleteError.value = getErrorMessage(error, 'Failed to delete account')
    console.error('[Account] Delete account failed:', error)
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <main class="bg-brand-background min-h-screen py-12">
    <div class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
      <!-- Email Confirmation Success Toast -->
      <Transition
        enter-active-class="transform ease-out duration-300 transition"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showConfirmationSuccess"
          class="bg-brand-accent/10 border-brand-accent/30 mb-6 flex items-center gap-3 rounded-xl border p-4"
        >
          <div class="text-brand-accent text-2xl">
            <span aria-hidden="true">&#10003;</span>
          </div>
          <div class="flex-1">
            <p class="text-brand-base font-medium">Email Confirmed!</p>
            <p class="text-brand-muted text-sm">Your account is now verified and ready to use.</p>
          </div>
          <button
            type="button"
            class="text-brand-muted hover:text-brand-base transition"
            aria-label="Dismiss"
            @click="showConfirmationSuccess = false"
          >
            <svg
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </Transition>

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-brand-base font-headers text-3xl font-bold">My Account</h1>
        <p class="text-brand-muted mt-2">Manage your account settings and preferences</p>
      </div>

      <!-- Loading state -->
      <div
        v-if="profileLoading"
        class="bg-brand-neutral flex items-center justify-center rounded-xl p-12 shadow-lg"
      >
        <div class="text-brand-muted animate-pulse">Loading...</div>
      </div>

      <!-- Account content -->
      <div
        v-else
        class="space-y-6"
      >
        <!-- Profile Information Card -->
        <div class="bg-brand-neutral rounded-xl p-6 shadow-lg">
          <h2 class="text-brand-base mb-6 text-xl font-semibold">Profile Information</h2>

          <div class="space-y-4">
            <!-- Email (read-only) -->
            <div>
              <label class="text-brand-muted mb-1 block text-sm font-medium">Email</label>
              <div
                class="bg-brand-background text-brand-base border-brand-base/10 rounded-lg border px-4 py-2.5"
              >
                {{ user?.email || 'Not set' }}
              </div>
              <p class="text-brand-muted mt-1 text-xs">Email cannot be changed from this page</p>
            </div>

            <!-- Display Name -->
            <div>
              <label
                for="displayName"
                class="text-brand-muted mb-1 block text-sm font-medium"
              >
                Display Name
              </label>
              <input
                id="displayName"
                v-model="displayName"
                type="text"
                class="bg-brand-neutral text-brand-base placeholder:text-brand-muted border-brand-base/20 focus:border-brand-accent focus:ring-brand-accent/20 w-full rounded-lg border px-4 py-2.5 transition outline-none focus:ring-2"
                placeholder="Your name"
              />
            </div>

            <!-- Phone -->
            <div>
              <label
                for="phone"
                class="text-brand-muted mb-1 block text-sm font-medium"
              >
                Phone Number
              </label>
              <input
                id="phone"
                v-model="phone"
                type="tel"
                class="bg-brand-neutral text-brand-base placeholder:text-brand-muted border-brand-base/20 focus:border-brand-accent focus:ring-brand-accent/20 w-full rounded-lg border px-4 py-2.5 transition outline-none focus:ring-2"
                placeholder="+1 (555) 000-0000"
              />
              <p class="text-brand-muted mt-1 text-xs">Used for appointment reminders</p>
            </div>

            <!-- Save button -->
            <div class="flex items-center gap-4 pt-2">
              <button
                type="button"
                :disabled="saving"
                class="bg-brand-accent hover:bg-brand-accent/90 text-brand-neutral rounded-lg px-6 py-2.5 font-medium transition disabled:opacity-50"
                @click="handleSaveProfile"
              >
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>
              <span
                v-if="saveSuccess"
                class="text-sm text-green-600"
              >
                Changes saved!
              </span>
              <span
                v-if="saveError"
                class="text-sm text-red-500"
              >
                {{ saveError }}
              </span>
            </div>
          </div>
        </div>

        <!-- Newsletter Subscription Card -->
        <div class="bg-brand-neutral rounded-xl p-6 shadow-lg">
          <h2 class="text-brand-base mb-4 text-xl font-semibold">Newsletter</h2>

          <div class="flex items-center justify-between">
            <div>
              <p class="text-brand-base font-medium">Email Newsletter</p>
              <p class="text-brand-muted text-sm">
                Receive updates about events, new content, and special offers
              </p>
            </div>
            <button
              type="button"
              :class="[
                'focus:ring-brand-accent relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-offset-2 focus:outline-none',
                newsletterSubscribed ? 'bg-brand-accent' : 'bg-brand-base/20',
              ]"
              role="switch"
              :aria-checked="newsletterSubscribed"
              @click="handleToggleNewsletter"
            >
              <span
                :class="[
                  'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                  newsletterSubscribed ? 'translate-x-5' : 'translate-x-0',
                ]"
              />
            </button>
          </div>
        </div>

        <!-- Account Created Card -->
        <div class="bg-brand-neutral rounded-xl p-6 shadow-lg">
          <h2 class="text-brand-base mb-4 text-xl font-semibold">Account Details</h2>

          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-brand-muted">Account created</span>
              <span class="text-brand-base">
                {{
                  profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'
                }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-brand-muted">Last updated</span>
              <span class="text-brand-base">
                {{
                  profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'Unknown'
                }}
              </span>
            </div>
          </div>
        </div>

        <!-- Danger Zone -->
        <div
          class="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/20"
        >
          <h2 class="mb-4 text-xl font-semibold text-red-700 dark:text-red-400">Danger Zone</h2>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-red-700 dark:text-red-400">Delete Account</p>
              <p class="text-sm text-red-600 dark:text-red-500">
                Permanently delete your account and all associated data. This action cannot be
                undone.
              </p>
            </div>
            <button
              type="button"
              class="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-700 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-950"
              @click="openDeleteModal"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Account Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="closeDeleteModal"
      >
        <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
          <!-- Step 1: Initial Warning -->
          <template v-if="deleteStep === 1">
            <div class="mb-4 flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50"
              >
                <svg
                  class="h-5 w-5 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Your Account?
              </h3>
            </div>

            <p class="mb-4 text-gray-600 dark:text-gray-400">
              Are you sure you want to delete your account? This will:
            </p>

            <ul class="mb-6 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li class="flex items-start gap-2">
                <span class="text-red-500">•</span>
                Delete all your personal information
              </li>
              <li class="flex items-start gap-2">
                <span class="text-red-500">•</span>
                Cancel any upcoming appointments
              </li>
              <li class="flex items-start gap-2">
                <span class="text-red-500">•</span>
                Remove your newsletter subscription
              </li>
              <li class="flex items-start gap-2">
                <span class="text-red-500">•</span>
                This action is <strong>permanent</strong> and cannot be undone
              </li>
            </ul>

            <div class="flex gap-3">
              <button
                type="button"
                class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeDeleteModal"
              >
                Cancel
              </button>
              <button
                type="button"
                class="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700"
                @click="proceedToStep2"
              >
                Continue
              </button>
            </div>
          </template>

          <!-- Step 2: Confirmation -->
          <template v-else>
            <div class="mb-4 flex items-center gap-3">
              <div
                class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50"
              >
                <svg
                  class="h-5 w-5 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                Final Confirmation
              </h3>
            </div>

            <p class="mb-4 text-gray-600 dark:text-gray-400">
              To confirm deletion, please type <strong class="text-red-600">DELETE</strong> below:
            </p>

            <input
              v-model="deleteConfirmation"
              type="text"
              placeholder="Type DELETE to confirm"
              class="mb-4 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              :class="{ 'border-red-500': deleteError }"
            />

            <p
              v-if="deleteError"
              class="mb-4 text-sm text-red-500"
            >
              {{ deleteError }}
            </p>

            <div class="flex gap-3">
              <button
                type="button"
                class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                @click="closeDeleteModal"
              >
                Cancel
              </button>
              <button
                type="button"
                :disabled="deleting || deleteConfirmation !== 'DELETE'"
                class="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                @click="handleDeleteAccount"
              >
                {{ deleting ? 'Deleting...' : 'Delete My Account' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </main>
</template>
