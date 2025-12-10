<script setup lang="ts">
/**
 * Home Page
 *
 * Landing page with hero, features, events preview, and blog preview.
 * Uses async loading patterns to ensure fast initial render.
 */
const { t } = useLocale()

useSeoMeta({
  title: t('nav.home'),
  description: t('meta.description'),
})

const { brand } = useBrand()

// Type definitions for future API integration
interface Event {
  id: string
  title: string
  date: string
  location: string
}

interface Post {
  slug: string
  title: string
  excerpt: string
  category: string
}

// Simulated async data fetching (replace with real API calls later)
// Using useLazyAsyncData to not block page render
const {
  data: events,
  pending: eventsPending,
  error: eventsError,
} = useLazyAsyncData<Event[]>(
  'home-events',
  async () => {
    // Simulate network delay - replace with: return $fetch('/api/events?limit=3')
    await new Promise((resolve) => setTimeout(resolve, 800))
    return [
      { id: '1', title: 'New Moon Meditation', date: 'Dec 3, 2025', location: 'Online' },
      { id: '2', title: 'Planetary Reset Workshop', date: 'Dec 15, 2025', location: 'Mexico City' },
      { id: '3', title: 'The Energy Map 2026 Preview', date: 'Jan 4, 2026', location: 'Virtual' },
    ]
  },
  { server: false } // Client-side only to show loading state
)

const {
  data: posts,
  pending: postsPending,
  error: postsError,
} = useLazyAsyncData<Post[]>(
  'home-posts',
  async () => {
    // Simulate network delay - replace with: return $fetch('/api/posts?limit=3')
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return [
      {
        slug: 'retrogrades',
        title: 'How planetary retrogrades actually help you grow',
        excerpt: 'Understanding the deeper purpose behind retrograde seasons and how to use them.',
        category: 'Astrology',
      },
      {
        slug: 'mars-rituals',
        title: 'Your daily rituals for Mars season',
        excerpt: 'Harness the fiery energy of Mars with these simple daily practices.',
        category: 'Rituals',
      },
      {
        slug: 'venus-libra',
        title: 'Why Venus in Libra inspires connection',
        excerpt: 'The cosmic invitation to deepen relationships during this transit.',
        category: 'Transits',
      },
    ]
  },
  { server: false }
)

// Static features data with translations
const features = computed(() => [
  {
    title: t('features.items.insights.title'),
    description: t('features.items.insights.description'),
  },
  {
    title: t('features.items.experiences.title'),
    description: t('features.items.experiences.description'),
  },
  {
    title: t('features.items.balance.title'),
    description: t('features.items.balance.description'),
  },
])
</script>

<template>
  <div>
    <!-- Hero Section with ethereal decorations -->
    <HeroSection
      :title="brand.name"
      :description="t('hero.subtitle')"
      :cta-text="t('hero.cta')"
      cta-link="/book"
      :tertiary-cta-text="t('hero.coCreate')"
      tertiary-cta-link="/book?type=collaborate"
      :secondary-cta-text="t('common.learnMore')"
      secondary-cta-link="/about"
    />

    <!-- Why Astranova (static, renders immediately) -->
    <PageSection
      :eyebrow="t('features.sectionLabel')"
      :title="t('features.title')"
      :description="t('features.description')"
      divider
    >
      <div class="grid gap-4 md:grid-cols-3">
        <BaseCard
          v-for="feature in features"
          :key="feature.title"
        >
          <h3 class="text-brand-base mb-1 font-medium">{{ feature.title }}</h3>
          <p class="text-brand-base/60">
            {{ feature.description }}
          </p>
        </BaseCard>
      </div>
    </PageSection>

    <!-- Upcoming Events (async with loading state) -->
    <PageSection
      :eyebrow="t('events.sectionLabel')"
      :title="t('events.title')"
      divider
    >
      <AsyncContent
        :loading="eventsPending"
        :error="eventsError"
        :empty="!events?.length"
      >
        <div class="grid gap-4 md:grid-cols-3">
          <EventCard
            v-for="event in events"
            :key="event.id"
            :title="event.title"
            :date="event.date"
            :location="event.location"
            :to="`/events/${event.id}`"
          />
        </div>

        <template #loading>
          <div class="grid gap-4 md:grid-cols-3">
            <EventCard
              v-for="i in 3"
              :key="i"
              loading
            />
          </div>
        </template>

        <template #empty>
          <EmptyState
            icon="📅"
            title="No upcoming events"
            description="Check back soon for new cosmic gatherings."
          />
        </template>
      </AsyncContent>

      <!-- View all link -->
      <div class="mt-6 text-center">
        <NuxtLink
          to="/events"
          class="text-brand-accent hover:text-brand-accent/80 text-sm font-medium transition"
        >
          {{ t('events.viewAll') }} →
        </NuxtLink>
      </div>
    </PageSection>

    <!-- From the Blog (async with loading state) -->
    <PageSection
      :eyebrow="t('blog.sectionLabel')"
      :title="t('blog.title')"
      divider
    >
      <AsyncContent
        :loading="postsPending"
        :error="postsError"
        :empty="!posts?.length"
      >
        <div class="grid gap-4 md:grid-cols-3">
          <PostCard
            v-for="post in posts"
            :key="post.slug"
            :title="post.title"
            :excerpt="post.excerpt"
            :category="post.category"
            :to="`/blog/${post.slug}`"
          />
        </div>

        <template #loading>
          <div class="grid gap-4 md:grid-cols-3">
            <PostCard
              v-for="i in 3"
              :key="i"
              loading
            />
          </div>
        </template>

        <template #empty>
          <EmptyState
            icon="✍️"
            title="No posts yet"
            description="Our cosmic scribes are writing new stories for you."
          />
        </template>
      </AsyncContent>

      <!-- View all link -->
      <div class="mt-6 text-center">
        <NuxtLink
          to="/blog"
          class="text-brand-accent hover:text-brand-accent/80 text-sm font-medium transition"
        >
          {{ t('blog.viewAll') }} →
        </NuxtLink>
      </div>
    </PageSection>

    <!-- CTA with Newsletter (static) -->
    <PageSection
      :title="t('newsletter.title')"
      :description="t('newsletter.subtitle')"
      width="md"
      centered
      gradient-title
    >
      <div class="flex flex-col items-center gap-6">
        <!-- Newsletter signup -->
        <form
          class="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          @submit.prevent="() => {}"
        >
          <input
            type="email"
            :placeholder="t('newsletter.placeholder')"
            class="bg-brand-neutral border-brand-base/20 text-brand-base placeholder:text-brand-muted focus:border-brand-accent focus:ring-brand-accent/20 flex-1 rounded-lg border px-4 py-2.5 transition outline-none focus:ring-2"
            required
          />
          <BaseButton type="submit">{{ t('newsletter.button') }}</BaseButton>
        </form>
        <p class="text-brand-base/50 text-xs">{{ t('newsletter.privacy') }}</p>
      </div>
    </PageSection>
  </div>
</template>
