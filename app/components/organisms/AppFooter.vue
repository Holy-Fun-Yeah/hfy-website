<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-brand-base/10 bg-brand-neutral border-t">
    <div class="font-secondary text-brand-base/50 container mx-auto px-4 py-6 text-center text-sm">
      &copy; {{ year }} Nuxt Site. Built with Nuxt 4 + Tailwind CSS.
    </div>
  </footer>
</template>
