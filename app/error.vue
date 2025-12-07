<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="bg-brand-background flex min-h-screen flex-col">
    <div class="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <h1 class="text-brand-base/30 text-8xl font-bold">{{ error.statusCode }}</h1>

      <p class="text-brand-base/70 mt-4 text-xl">
        {{ error.statusCode === 404 ? 'Page not found' : 'An error occurred' }}
      </p>

      <p class="text-brand-base/50 mt-2 max-w-md text-center">
        {{
          error.statusCode === 404
            ? "The page you're looking for doesn't exist or has been moved."
            : error.message || 'Something went wrong. Please try again.'
        }}
      </p>

      <BaseButton
        class="mt-8"
        size="lg"
        @click="handleError"
      >
        Go Home
      </BaseButton>
    </div>
  </div>
</template>
