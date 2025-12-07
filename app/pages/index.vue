<script setup lang="ts">
/**
 * Home Page
 *
 * Landing page with hero, features, events preview, and blog preview.
 * Uses async loading patterns to ensure fast initial render.
 */
useSeoMeta({
  title: 'Home',
  description: 'Awaken your cosmic power with transformative experiences guided by modern astrology.',
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

// Static features data (no loading needed)
const features = [
  {
    title: 'Personalized Insights',
    description: 'Get clear direction through your unique birth chart and energy patterns.',
  },
  {
    title: 'Curated Experiences',
    description: 'Attend themed events that align with lunar and planetary cycles.',
  },
  {
    title: 'Holistic Balance',
    description: 'Combine astrology, movement, and reflection to recharge your creative energy.',
  },
]
</script>

<template>
  <div>
    <!-- Hero Section (static, renders immediately) -->
    <PageSection
      :title="brand.name"
      description="Astranova connects you with transformative experiences guided by modern astrology and ancient intuition."
      centered
      spacing="lg"
    >
      <template #default>
        <div class="flex flex-col items-center gap-6 md:flex-row md:items-start md:text-left">
          <div class="flex-1 space-y-4">
            <p class="text-brand-base/60">
              Discover curated sessions, workshops, and celestial events designed to help you realign
              with your inner rhythm.
            </p>
            <div class="flex flex-wrap justify-center gap-3 md:justify-start">
              <BaseButton to="/book">Book your session</BaseButton>
              <BaseButton
                variant="ghost"
                to="/about"
              >
                Learn more
              </BaseButton>
            </div>
          </div>
          <div class="flex-1">
            <BaseCard
              variant="outline"
              padding="lg"
            >
              <div class="text-brand-base/40 grid aspect-video place-items-center">
                Media placeholder
              </div>
            </BaseCard>
          </div>
        </div>
      </template>
    </PageSection>

    <!-- Why Astranova (static, renders immediately) -->
    <PageSection
      eyebrow="Why Astranova"
      title="Guidance for the modern seeker"
      description="Each experience blends mindful science, astrology, and art to bring balance to your everyday life."
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
      eyebrow="Upcoming events"
      title="Moments aligned with the cosmos"
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
          View all events →
        </NuxtLink>
      </div>
    </PageSection>

    <!-- From the Blog (async with loading state) -->
    <PageSection
      eyebrow="From the blog"
      title="Stories written in the sky"
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
          Read more articles →
        </NuxtLink>
      </div>
    </PageSection>

    <!-- CTA with Newsletter (static) -->
    <PageSection
      eyebrow="Stay connected"
      title="Begin your cosmic journey"
      description="Book a session or join our newsletter for celestial insights, exclusive events, and sacred wisdom delivered to your inbox."
      width="md"
      centered
    >
      <div class="flex flex-col items-center gap-6">
        <!-- Newsletter signup -->
        <form
          class="flex w-full max-w-md flex-col gap-3 sm:flex-row"
          @submit.prevent="() => {}"
        >
          <input
            type="email"
            placeholder="Enter your email"
            class="bg-brand-neutral border-brand-base/20 text-brand-base placeholder:text-brand-base/40 focus:border-brand-accent focus:ring-brand-accent/20 flex-1 rounded-lg border px-4 py-2.5 outline-none transition focus:ring-2"
            required
          />
          <BaseButton type="submit">
            Subscribe
          </BaseButton>
        </form>
        <p class="text-brand-base/50 text-xs">
          We respect your privacy. Unsubscribe anytime.
        </p>

        <!-- Or book CTA -->
        <div class="flex items-center gap-4">
          <span class="text-brand-base/30 text-sm">or</span>
        </div>
        <BaseButton
          variant="contrast"
          size="lg"
          to="/book"
        >
          Book your session
        </BaseButton>
      </div>
    </PageSection>
  </div>
</template>
