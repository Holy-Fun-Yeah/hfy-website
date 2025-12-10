<script setup lang="ts">
/**
 * Admin Editor Page
 *
 * Shows:
 * - Access denied message for non-admin users
 * - Editor placeholder for admins
 *
 * Note: Unauthenticated users are redirected to /login by admin middleware
 */

definePageMeta({
  middleware: 'admin',
  layout: 'admin',
})

const { user, isAdmin, signOut } = useAuth()

// Form state for sign out
const loading = ref(false)

// Handle sign out
async function handleSignOut() {
  loading.value = true
  try {
    await signOut()
    navigateTo('/login')
  } finally {
    loading.value = false
  }
}

useSeoMeta({
  title: 'Content Editor',
  robots: 'noindex, nofollow',
})
</script>

<template>
  <div class="flex min-h-[80vh] items-center justify-center px-4 py-16">
    <!-- Logged in but not admin: Access denied -->
    <div
      v-if="!isAdmin"
      class="w-full max-w-md text-center"
    >
      <BaseCard padding="lg">
        <div class="text-brand-accent/50 mb-4 text-5xl">
          <span aria-hidden="true">&#128274;</span>
        </div>
        <h1 class="font-headers text-brand-base mb-2 text-2xl font-bold">Access Denied</h1>
        <p class="text-brand-muted mb-6">This area is restricted to administrators.</p>
        <p class="text-brand-muted/70 mb-6 text-sm">Logged in as: {{ user?.email }}</p>
        <BaseButton
          variant="outline"
          :loading="loading"
          @click="handleSignOut"
        >
          Sign Out
        </BaseButton>
      </BaseCard>
    </div>

    <!-- Admin: Show editor placeholder -->
    <div
      v-else
      class="w-full max-w-4xl"
    >
      <div class="mb-6">
        <h1 class="font-headers text-brand-base text-2xl font-bold">Content Editor</h1>
        <p class="text-brand-muted text-sm">Logged in as: {{ user?.email }}</p>
      </div>

      <BaseCard padding="lg">
        <div
          class="text-brand-base/30 flex min-h-[400px] flex-col items-center justify-center text-center"
        >
          <div class="mb-4 text-6xl">
            <span aria-hidden="true">&#9998;</span>
          </div>
          <p class="text-lg">Editor workspace</p>
          <p class="text-brand-base/20 mt-2 text-sm">Coming soon</p>
        </div>
      </BaseCard>
    </div>
  </div>
</template>
