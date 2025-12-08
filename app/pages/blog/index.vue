<script setup lang="ts">
/**
 * Blog Listing Page
 *
 * Displays blog posts with category filtering.
 * Uses async loading with skeleton states.
 */
useSeoMeta({
  title: 'Blog',
  description:
    'Fresh articles and reflections on astrology, self-development, and cosmic alignment.',
})

// Types
interface Post {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  date: string
  readTime: string
  featured?: boolean
}

// Filter state
const activeCategory = ref<string>('all')

// Simulated async data (replace with real API)
const {
  data: allPosts,
  pending,
  error,
} = useLazyAsyncData<Post[]>(
  'blog-posts',
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return [
      {
        slug: 'planetary-retrogrades',
        title: 'How planetary retrogrades actually help you grow',
        excerpt:
          'Retrograde seasons get a bad rap, but they offer profound opportunities for reflection and realignment. Learn to work with these cosmic pauses.',
        category: 'Astrology',
        author: 'AstraNova KaLeKa',
        date: 'Dec 1, 2025',
        readTime: '5 min read',
        featured: true,
      },
      {
        slug: 'mars-season-rituals',
        title: 'Your daily rituals for Mars season',
        excerpt:
          'Mars brings fire, ambition, and drive. Here are practical rituals to channel this intense energy without burning out.',
        category: 'Rituals',
        author: 'Luna Reyes',
        date: 'Nov 28, 2025',
        readTime: '4 min read',
      },
      {
        slug: 'venus-libra-connection',
        title: 'Why Venus in Libra inspires connection',
        excerpt:
          'When Venus dances through Libra, relationships bloom. Discover how to harness this harmonious transit for deeper bonds.',
        category: 'Transits',
        author: 'AstraNova KaLeKa',
        date: 'Nov 20, 2025',
        readTime: '6 min read',
      },
      {
        slug: 'moon-phases-guide',
        title: 'A complete guide to working with moon phases',
        excerpt:
          'From new moon intentions to full moon releases, learn the art of lunar living and how to sync your life with cosmic rhythms.',
        category: 'Astrology',
        author: 'Celestia Moon',
        date: 'Nov 15, 2025',
        readTime: '8 min read',
        featured: true,
      },
      {
        slug: 'morning-ritual-routine',
        title: 'Creating a sacred morning ritual',
        excerpt:
          'How the first hour of your day sets the tone for everything. Simple practices to start each morning with intention.',
        category: 'Rituals',
        author: 'Luna Reyes',
        date: 'Nov 10, 2025',
        readTime: '5 min read',
      },
      {
        slug: 'saturn-return-survival',
        title: 'Surviving (and thriving) through your Saturn Return',
        excerpt:
          'The Saturn Return is a cosmic rite of passage. Here\'s how to navigate this transformative period with grace.',
        category: 'Transits',
        author: 'AstraNova KaLeKa',
        date: 'Nov 5, 2025',
        readTime: '7 min read',
      },
    ]
  },
  { server: false }
)

// Get unique categories
const categories = computed(() => {
  if (!allPosts.value) return []
  const cats = [...new Set(allPosts.value.map((p) => p.category))]
  return ['all', ...cats]
})

// Filtered posts
const filteredPosts = computed(() => {
  if (!allPosts.value) return []
  if (activeCategory.value === 'all') return allPosts.value
  return allPosts.value.filter((p) => p.category === activeCategory.value)
})

// Featured post (first featured or first post)
const featuredPost = computed(() => {
  if (!allPosts.value) return null
  return allPosts.value.find((p) => p.featured) || allPosts.value[0]
})

// Regular posts (excluding featured)
const regularPosts = computed(() => {
  if (!filteredPosts.value || !featuredPost.value) return filteredPosts.value
  return filteredPosts.value.filter((p) => p.slug !== featuredPost.value?.slug)
})
</script>

<template>
  <div>
    <!-- Hero -->
    <PageSection
      spacing="lg"
      centered
    >
      <div class="mx-auto max-w-2xl">
        <p class="text-brand-accent mb-4 text-sm font-medium tracking-wider uppercase">Blog</p>
        <h1 class="font-headers text-brand-base mb-4 text-4xl font-bold md:text-5xl">
          Cosmic perspectives
        </h1>
        <p class="text-brand-base/70 text-lg">
          Fresh articles and reflections on astrology, self-development, and cosmic alignment.
          Stories written in the stars, for seekers like you.
        </p>
      </div>
    </PageSection>

    <!-- Category Filter -->
    <PageSection spacing="sm">
      <div class="mb-8 flex flex-wrap gap-2">
        <button
          v-for="category in categories"
          :key="category"
          :class="[
            'rounded-full px-4 py-1.5 text-sm font-medium transition',
            activeCategory === category
              ? 'bg-brand-accent text-brand-neutral'
              : 'bg-brand-base/5 text-brand-base/70 hover:bg-brand-base/10',
          ]"
          @click="activeCategory = category"
        >
          {{ category === 'all' ? 'All Posts' : category }}
        </button>
      </div>

      <AsyncContent
        :loading="pending"
        :error="error"
        :empty="filteredPosts.length === 0"
      >
        <!-- Featured Post (only show when viewing all) -->
        <NuxtLink
          v-if="featuredPost && activeCategory === 'all'"
          :to="`/blog/${featuredPost.slug}`"
          class="group mb-8 block"
        >
          <BaseCard
            hoverable
            padding="none"
            class="overflow-hidden"
          >
            <div class="grid md:grid-cols-2">
              <!-- Image placeholder -->
              <div class="bg-brand-base/5 relative aspect-[16/9] md:aspect-auto">
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-brand-base/20 text-6xl">✧</span>
                </div>
                <span
                  class="bg-brand-contrast text-brand-base absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-semibold"
                >
                  Featured
                </span>
              </div>

              <!-- Content -->
              <div class="flex flex-col justify-center p-6 md:p-8">
                <p class="text-brand-secondary mb-2 text-xs font-medium uppercase tracking-wide">
                  {{ featuredPost.category }}
                </p>
                <h2
                  class="font-headers text-brand-base group-hover:text-brand-accent mb-3 text-2xl font-bold transition md:text-3xl"
                >
                  {{ featuredPost.title }}
                </h2>
                <p class="text-brand-base/60 mb-4 line-clamp-3">
                  {{ featuredPost.excerpt }}
                </p>
                <div class="text-brand-base/40 flex items-center gap-3 text-sm">
                  <span>{{ featuredPost.author }}</span>
                  <span>·</span>
                  <span>{{ featuredPost.date }}</span>
                  <span>·</span>
                  <span>{{ featuredPost.readTime }}</span>
                </div>
              </div>
            </div>
          </BaseCard>
        </NuxtLink>

        <!-- Posts Grid -->
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="post in regularPosts"
            :key="post.slug"
            :to="`/blog/${post.slug}`"
            class="group block"
          >
            <BaseCard
              hoverable
              padding="none"
              class="h-full overflow-hidden"
            >
              <!-- Image placeholder -->
              <div class="bg-brand-base/5 relative aspect-[16/10]">
                <div class="absolute inset-0 flex items-center justify-center">
                  <span class="text-brand-base/20 text-4xl">✧</span>
                </div>
              </div>

              <!-- Content -->
              <div class="p-4">
                <p class="text-brand-secondary mb-1 text-xs font-medium uppercase tracking-wide">
                  {{ post.category }}
                </p>
                <h3
                  class="font-headers text-brand-base group-hover:text-brand-accent mb-2 font-semibold leading-snug transition"
                >
                  {{ post.title }}
                </h3>
                <p class="text-brand-base/60 mb-3 line-clamp-2 text-sm">
                  {{ post.excerpt }}
                </p>
                <div class="text-brand-base/40 flex items-center gap-2 text-xs">
                  <span>{{ post.date }}</span>
                  <span>·</span>
                  <span>{{ post.readTime }}</span>
                </div>
              </div>
            </BaseCard>
          </NuxtLink>
        </div>

        <!-- Loading skeletons -->
        <template #loading>
          <!-- Featured skeleton -->
          <BaseCard
            padding="none"
            class="mb-8 overflow-hidden"
          >
            <div class="grid md:grid-cols-2">
              <BaseSkeleton
                h="250px"
                w="100%"
              />
              <div class="space-y-4 p-6 md:p-8">
                <BaseSkeleton
                  h="0.75rem"
                  w="20%"
                />
                <BaseSkeleton
                  h="2rem"
                  w="90%"
                />
                <BaseSkeleton
                  h="1rem"
                  w="100%"
                />
                <BaseSkeleton
                  h="1rem"
                  w="70%"
                />
                <BaseSkeleton
                  h="0.75rem"
                  w="50%"
                />
              </div>
            </div>
          </BaseCard>

          <!-- Grid skeletons -->
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <BaseCard
              v-for="i in 6"
              :key="i"
              padding="none"
              class="overflow-hidden"
            >
              <BaseSkeleton
                h="160px"
                w="100%"
              />
              <div class="space-y-3 p-4">
                <BaseSkeleton
                  h="0.75rem"
                  w="25%"
                />
                <BaseSkeleton
                  h="1.25rem"
                  w="90%"
                />
                <BaseSkeleton
                  h="0.875rem"
                  w="100%"
                />
                <BaseSkeleton
                  h="0.75rem"
                  w="40%"
                />
              </div>
            </BaseCard>
          </div>
        </template>

        <!-- Empty state -->
        <template #empty>
          <EmptyState
            icon="✍️"
            title="No posts in this category"
            description="Try selecting a different category or check back soon for new content."
          />
        </template>
      </AsyncContent>
    </PageSection>

    <!-- Newsletter CTA -->
    <PageSection
      eyebrow="Stay updated"
      title="Get cosmic insights in your inbox"
      description="Subscribe to receive new articles, event announcements, and exclusive content."
      width="sm"
      centered
    >
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
        <BaseButton type="submit">Subscribe</BaseButton>
      </form>
    </PageSection>
  </div>
</template>
