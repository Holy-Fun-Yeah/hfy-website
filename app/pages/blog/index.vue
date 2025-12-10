<script setup lang="ts">
/**
 * Blog Listing Page
 *
 * Displays blog posts fetched from the API.
 * Uses async loading with skeleton states.
 */
const { t, currentLocale } = useLocale()

useSeoMeta({
  title: () => t('blog.sectionLabel'),
  description: () => t('blog.hero.subtitle'),
})

// Types (matching API response)
interface Post {
  id: number
  slug: string
  bannerUrl: string | null
  publishedAt: string
  author: {
    id: string
    displayName: string | null
    avatarUrl: string | null
  } | null
  title: string
  excerpt: string
  lang: string
  isFallback: boolean
}

// Fetch posts from API
const {
  data: apiResponse,
  pending,
  error,
} = useLazyAsyncData(
  'blog-posts',
  () =>
    $fetch('/api/posts', {
      query: { lang: currentLocale.value, limit: 20 },
    }),
  { server: true, watch: [currentLocale] }
)

// Extract posts from API response (handle error case)
const allPosts = computed<Post[]>(() => {
  if (!apiResponse.value || !('data' in apiResponse.value)) return []
  return apiResponse.value.data as Post[]
})

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(currentLocale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Featured post (first post)
const featuredPost = computed(() => {
  if (!allPosts.value || allPosts.value.length === 0) return null
  return allPosts.value[0]
})

// Regular posts (excluding featured)
const regularPosts = computed(() => {
  if (!allPosts.value || allPosts.value.length <= 1) return []
  return allPosts.value.slice(1)
})
</script>

<template>
  <div>
    <!-- Hero -->
    <PageSection
      spacing="lg"
      centered
      decorations="hero"
    >
      <div class="mx-auto max-w-2xl">
        <p class="text-brand-accent mb-4 text-sm font-medium tracking-wider uppercase">
          {{ t('blog.hero.eyebrow') }}
        </p>
        <h1 class="font-headers text-brand-base mb-4 text-4xl font-bold md:text-5xl">
          {{ t('blog.hero.title') }}
        </h1>
        <p class="text-brand-base/70 text-lg">
          {{ t('blog.hero.subtitle') }}
        </p>
      </div>
    </PageSection>

    <!-- Posts Section -->
    <PageSection spacing="sm">
      <AsyncContent
        :loading="pending"
        :error="error"
        :empty="allPosts.length === 0"
      >
        <!-- Featured Post -->
        <NuxtLink
          v-if="featuredPost"
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
                <img
                  v-if="featuredPost.bannerUrl"
                  :src="featuredPost.bannerUrl"
                  :alt="featuredPost.title"
                  class="h-full w-full object-cover"
                />
                <div
                  v-else
                  class="absolute inset-0 flex items-center justify-center"
                >
                  <span class="text-brand-base/20 text-6xl">✧</span>
                </div>
                <span
                  class="bg-brand-contrast text-brand-base absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-semibold"
                >
                  {{ t('blog.featured') }}
                </span>
              </div>

              <!-- Content -->
              <div class="flex flex-col justify-center p-6 md:p-8">
                <h2
                  class="font-headers text-brand-base group-hover:text-brand-accent mb-3 text-2xl font-bold transition md:text-3xl"
                >
                  {{ featuredPost.title }}
                </h2>
                <p class="text-brand-base/60 mb-4 line-clamp-3">
                  {{ featuredPost.excerpt }}
                </p>
                <div class="text-brand-base/40 flex items-center gap-3 text-sm">
                  <span>{{ featuredPost.author?.displayName || 'HFY Team' }}</span>
                  <span>·</span>
                  <span>{{ formatDate(featuredPost.publishedAt) }}</span>
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
                <img
                  v-if="post.bannerUrl"
                  :src="post.bannerUrl"
                  :alt="post.title"
                  class="h-full w-full object-cover"
                />
                <div
                  v-else
                  class="absolute inset-0 flex items-center justify-center"
                >
                  <span class="text-brand-base/20 text-4xl">✧</span>
                </div>
              </div>

              <!-- Content -->
              <div class="p-4">
                <h3
                  class="font-headers text-brand-base group-hover:text-brand-accent mb-2 leading-snug font-semibold transition"
                >
                  {{ post.title }}
                </h3>
                <p class="text-brand-base/60 mb-3 line-clamp-2 text-sm">
                  {{ post.excerpt }}
                </p>
                <div class="text-brand-base/40 flex items-center gap-2 text-xs">
                  <span>{{ formatDate(post.publishedAt) }}</span>
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
            :title="t('blog.noPostsCategory.title')"
            :description="t('blog.noPostsCategory.description')"
          />
        </template>
      </AsyncContent>
    </PageSection>

    <!-- Newsletter CTA -->
    <PageSection
      :eyebrow="t('blog.newsletterCta.eyebrow')"
      :title="t('blog.newsletterCta.title')"
      :description="t('blog.newsletterCta.description')"
      width="sm"
      centered
    >
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
        <BaseButton type="submit">{{ t('common.subscribe') }}</BaseButton>
      </form>
    </PageSection>
  </div>
</template>
