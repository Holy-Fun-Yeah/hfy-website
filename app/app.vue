<script setup lang="ts">
// Initialize brand system - injects CSS variables into :root
// This must be called at app root to ensure all components have access
const { brand } = useBrand()

useHead({
  titleTemplate: (title) => (title ? `${title} | HFY!` : brand.value.name),
  htmlAttrs: { lang: 'en' },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: 'A Nuxt site template with brand system' },
  ],
  link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
