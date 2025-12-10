<script setup lang="ts">
/**
 * Blog Post Detail Page
 *
 * Displays full blog post with markdown content from API.
 * Uses BaseMarkdown component for rendering.
 */
const route = useRoute()
const slug = route.params.slug as string
const { t, currentLocale } = useLocale()

// Types matching API response
interface PostDetail {
  id: number
  slug: string
  bannerUrl: string | null
  publishedAt: string
  updatedAt: string
  author: {
    id: string
    displayName: string | null
    avatarUrl: string | null
  } | null
  title: string
  excerpt: string
  content: string
  lang: string
  isFallback: boolean
  availableLanguages: string[]
}

// API response wrapper type
interface ApiResponse {
  success: boolean
  data?: PostDetail
  error?: unknown
}

// Fetch post from API
const {
  data: apiResponse,
  pending,
  error,
} = useLazyAsyncData<ApiResponse | null>(
  `post-${slug}-${currentLocale.value}`,
  async () => {
    const result = await $fetch<ApiResponse>(`/api/posts/${slug}`, {
      query: { lang: currentLocale.value },
    })
    return result
  },
  { server: true, watch: [currentLocale] }
)

// Extract post from API response
const post = computed<PostDetail | null>(() => {
  if (!apiResponse.value || !apiResponse.value.success || !apiResponse.value.data) return null
  return apiResponse.value.data
})

// Calculate read time (rough estimate: 200 words per minute)
function calculateReadTime(content: string): string {
  const words = content.split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return `${minutes} min read`
}

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(currentLocale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Dynamic SEO
useSeoMeta({
  title: () => post.value?.title ?? 'Blog Post',
  description: () => post.value?.excerpt ?? 'Read this article on Holy Fuck Yeah!',
})
</script>

<template>
  <div>
    <!-- Loading State -->
    <template v-if="pending">
      <PageSection spacing="lg">
        <div class="mx-auto max-w-3xl">
          <BaseSkeleton
            h="1rem"
            w="15%"
            class="mb-4"
          />
          <BaseSkeleton
            h="3rem"
            w="90%"
            class="mb-4"
          />
          <BaseSkeleton
            h="1rem"
            w="40%"
            class="mb-8"
          />
          <div class="space-y-4">
            <BaseSkeleton
              v-for="i in 8"
              :key="i"
              h="1rem"
              :w="i % 3 === 0 ? '90%' : '100%'"
            />
          </div>
        </div>
      </PageSection>
    </template>

    <!-- Error State -->
    <template v-else-if="error">
      <PageSection
        spacing="lg"
        centered
      >
        <EmptyState
          icon="⚠️"
          title="Something went wrong"
          description="We couldn't load this article. Please try again."
        >
          <BaseButton to="/blog">Back to Blog</BaseButton>
        </EmptyState>
      </PageSection>
    </template>

    <!-- Not Found State -->
    <template v-else-if="!post">
      <PageSection
        spacing="lg"
        centered
      >
        <EmptyState
          icon="📄"
          title="Article not found"
          description="This article may have been removed or the link is incorrect."
        >
          <BaseButton to="/blog">Browse Articles</BaseButton>
        </EmptyState>
      </PageSection>
    </template>

    <!-- Post Content -->
    <template v-else>
      <!-- Breadcrumb -->
      <div class="bg-brand-neutral/50 border-brand-base/10 border-b">
        <div class="mx-auto max-w-3xl px-4 py-3">
          <nav class="text-sm">
            <NuxtLink
              to="/blog"
              class="text-brand-base/50 hover:text-brand-accent transition"
            >
              Blog
            </NuxtLink>
            <span class="text-brand-base/30 mx-2">/</span>
            <span class="text-brand-base/70">{{ post.title }}</span>
          </nav>
        </div>
      </div>

      <!-- Article Header -->
      <PageSection
        spacing="lg"
        decorations="subtle"
      >
        <article class="mx-auto max-w-3xl">
          <header class="mb-8 text-center">
            <!-- Fallback language notice -->
            <p
              v-if="post.isFallback"
              class="bg-brand-accent/10 text-brand-accent mx-auto mb-4 inline-block rounded-full px-3 py-1 text-xs"
            >
              {{ t('common.showingInEnglish') || 'Showing in English' }}
            </p>
            <h1
              class="font-headers text-brand-base mb-4 text-3xl leading-tight font-bold md:text-4xl lg:text-5xl"
            >
              {{ post.title }}
            </h1>
            <p class="text-brand-base/60 mb-6 text-lg">
              {{ post.excerpt }}
            </p>
            <div
              class="text-brand-base/50 flex flex-wrap items-center justify-center gap-3 text-sm"
            >
              <span class="font-medium">{{ post.author?.displayName || 'HFY Team' }}</span>
              <span>·</span>
              <span>{{ formatDate(post.publishedAt) }}</span>
              <span>·</span>
              <span>{{ calculateReadTime(post.content) }}</span>
            </div>
          </header>

          <!-- Banner Image -->
          <div
            v-if="post.bannerUrl"
            class="mb-8 overflow-hidden rounded-lg"
          >
            <img
              :src="post.bannerUrl"
              :alt="post.title"
              class="h-auto w-full object-cover"
            />
          </div>

          <!-- Article Body - Markdown rendered -->
          <div class="border-brand-base/10 border-t pt-8">
            <BaseMarkdown
              :content="post.content"
              size="lg"
            />
          </div>

          <!-- Author Bio -->
          <div
            v-if="post.author"
            class="border-brand-base/10 mt-8 border-t pt-6"
          >
            <BaseCard padding="lg">
              <div class="flex items-start gap-4">
                <div
                  v-if="post.author.avatarUrl"
                  class="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full"
                >
                  <img
                    :src="post.author.avatarUrl"
                    :alt="post.author.displayName || 'Author'"
                    class="h-full w-full object-cover"
                  />
                </div>
                <div
                  v-else
                  class="bg-brand-accent/10 text-brand-accent flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
                >
                  {{ (post.author.displayName || 'H').charAt(0) }}
                </div>
                <div>
                  <p class="text-brand-base font-medium">
                    {{ post.author.displayName || 'HFY Team' }}
                  </p>
                  <p class="text-brand-base/60 mt-1 text-sm">Author at Holy Fuck Yeah!</p>
                </div>
              </div>
            </BaseCard>
          </div>
        </article>
      </PageSection>

      <!-- Back to Blog -->
      <PageSection
        centered
        width="sm"
      >
        <BaseButton
          variant="outline"
          to="/blog"
        >
          ← Back to all articles
        </BaseButton>
      </PageSection>
    </template>
  </div>
</template>
