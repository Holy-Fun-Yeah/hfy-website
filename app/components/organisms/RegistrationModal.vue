<script setup lang="ts">
/**
 * Registration Modal
 *
 * Full-screen modal for event registration with Stripe payment.
 * Wraps the RegistrationForm molecule with modal UI.
 */

interface Props {
  event: {
    id: string
    title: string
    startsAt: string
    usdPrice: string | null
  }
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  success: [registrationId: string]
}>()

const { t } = useLocale()
const { profile, user } = useAuth()

// Autofill from profile (with user email as fallback)
const initialName = computed(() => profile.value?.displayName || '')
const initialEmail = computed(() => profile.value?.email || user.value?.email || '')
const initialPhone = computed(() => profile.value?.phone || '')

// Handle escape key to close modal
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

// Lock body scroll when open
watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeydown)
    } else {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeydown)
    }
  }
)

onUnmounted(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', handleKeydown)
})

function handleSuccess(registrationId: string) {
  emit('success', registrationId)
}

function handleCancel() {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        @click.self="emit('close')"
      >
        <Transition
          enter-active-class="duration-200 ease-out"
          enter-from-class="scale-95 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="duration-150 ease-in"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-95 opacity-0"
        >
          <div
            v-if="open"
            class="bg-brand-neutral relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
          >
            <!-- Close button -->
            <button
              type="button"
              class="text-brand-muted hover:text-brand-base absolute top-4 right-4 transition"
              :aria-label="t('a11y.closeMenu')"
              @click="emit('close')"
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

            <!-- Header -->
            <h2 class="font-headers text-brand-base mb-6 text-xl font-semibold">
              {{ t('events.detail.registerNow') }}
            </h2>

            <!-- Registration Form -->
            <RegistrationForm
              :event="event"
              :initial-name="initialName"
              :initial-email="initialEmail"
              :initial-phone="initialPhone"
              @success="handleSuccess"
              @cancel="handleCancel"
            />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
