<script setup lang="ts">
// Default layout with brand-aware styling
</script>

<template>
  <div class="bg-brand-background flex min-h-screen flex-col transition-colors duration-200">
    <AppHeader />

    <main class="flex-1">
      <slot />
    </main>

    <AppFooter />
  </div>
</template>
