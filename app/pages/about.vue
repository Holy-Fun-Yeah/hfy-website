<script setup lang="ts">
definePageMeta({
  title: 'About',
})

useHead({
  title: 'About',
})
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <h1 class="font-headers text-brand-base mb-6 text-4xl font-bold">About This Template</h1>

    <div class="prose prose-lg max-w-none">
      <p>
        This is a Nuxt site template designed for internal use on new projects. It includes a
        comprehensive brand system that makes theming trivial.
      </p>

      <h2>Features</h2>
      <ul>
        <li><strong>Nuxt 4</strong> - Latest version with future compatibility mode</li>
        <li>
          <strong>Brand System</strong> - Centralized colors and fonts in
          <code>app/config/brand.ts</code>
        </li>
        <li><strong>Dark/Light Mode</strong> - Theme toggle with localStorage persistence</li>
        <li><strong>Tailwind CSS v4</strong> - Modern utility-first CSS framework</li>
        <li><strong>Drizzle ORM</strong> - Type-safe PostgreSQL database integration</li>
        <li><strong>Zod</strong> - Runtime validation for API and forms</li>
        <li><strong>ESLint</strong> - With auto-sort imports and unused detection</li>
        <li><strong>Prettier</strong> - Code formatting with Tailwind plugin</li>
        <li><strong>Prose Styles</strong> - Brand-aware markdown rendering</li>
      </ul>

      <h2>Brand System</h2>
      <p>
        All colors and fonts are defined in a single source of truth. Components use semantic
        Tailwind classes like <code>bg-brand-accent</code> and <code>text-brand-base</code> that
        automatically adapt to the current theme.
      </p>

      <h2>Changing the Brand</h2>
      <p>To rebrand the entire app, edit only <code>app/config/brand.ts</code>:</p>

      <pre><code>export const brandConfig: BrandConfig = {
  name: 'Your Brand',
  light: {
    accent: '#ff0000',  // All buttons, links now red
    // ... other colors
  },
  typography: {
    logo: 'Orbitron',   // All logos now Orbitron
  },
}</code></pre>
    </div>

    <NuxtLink
      to="/"
      class="text-brand-accent mt-8 inline-block hover:underline"
    >
      &larr; Back to Home
    </NuxtLink>
  </div>
</template>
