<script setup lang="ts">
/**
 * Blog Post Detail Page
 *
 * Displays full blog post with markdown content from DB.
 * Uses BaseMarkdown component for rendering.
 */
const route = useRoute()
const slug = route.params.slug as string

// Types
interface PostDetail {
  slug: string
  title: string
  excerpt: string
  content: string // Markdown content from DB
  category: string
  author: string
  authorBio?: string
  date: string
  readTime: string
  tags?: string[]
}

interface RelatedPost {
  slug: string
  title: string
  category: string
  date: string
}

// Simulated async data (replace with real API: $fetch(`/api/posts/${slug}`))
const {
  data: post,
  pending,
  error,
} = useLazyAsyncData<PostDetail | null>(
  `post-${slug}`,
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock post data with markdown content
    const posts: Record<string, PostDetail> = {
      'planetary-retrogrades': {
        slug: 'planetary-retrogrades',
        title: 'How planetary retrogrades actually help you grow',
        excerpt:
          'Retrograde seasons get a bad rap, but they offer profound opportunities for reflection and realignment.',
        content: `
Retrograde seasons are often met with dread. We blame Mercury retrograde for missed emails, tech glitches, and communication mishaps. But what if these cosmic pauses are actually invitations to slow down and look inward?

## What is a retrograde, really?

From our perspective on Earth, a planet appears to move backward in its orbit. It's an optical illusion, but astrology teaches us that these periods carry symbolic weight.

When a planet goes retrograde, its themes turn inward:

- **Mercury** retrograde asks us to review our communications and thought patterns
- **Venus** retrograde invites us to reassess our relationships and values
- **Mars** retrograde challenges us to examine how we assert ourselves

## The gift of the retrograde

Instead of fighting against retrograde energy, consider these practices:

### 1. Review, don't initiate

Retrograde periods are perfect for:
- Revisiting old projects
- Reconnecting with old friends
- Reflecting on past decisions

### 2. Embrace the slowdown

Our culture glorifies constant forward motion. Retrogrades remind us that rest and reflection are essential parts of any growth cycle.

> "The retrograde is not a punishment. It's a cosmic permission slip to pause."

### 3. Trust the timing

If things feel stuck during a retrograde, trust that the delay serves a purpose. What needs your attention right now?

## Working with the current energy

Here's a simple ritual for any retrograde season:

1. **Identify** what area of life the planet rules
2. **Reflect** on what needs revisiting in that area
3. **Release** what no longer serves you
4. **Realign** with your true intentions

---

Retrogrades are not cosmic punishments—they're opportunities. The next time a planet appears to move backward, ask yourself: *What is being brought back to my attention?*

The stars don't control us. They remind us of the rhythms we've forgotten.
        `.trim(),
        category: 'Astrology',
        author: 'AstraNova KaLeKa',
        authorBio:
          'Astrologer, energy healer, and founder of Holy Fuck Yeah! Guiding seekers through cosmic wisdom and sacred technology.',
        date: 'December 1, 2025',
        readTime: '5 min read',
        tags: ['Retrogrades', 'Mercury', 'Growth', 'Reflection'],
      },
      'mars-season-rituals': {
        slug: 'mars-season-rituals',
        title: 'Your daily rituals for Mars season',
        excerpt:
          'Mars brings fire, ambition, and drive. Here are practical rituals to channel this intense energy.',
        content: `
Mars season brings a surge of energy, motivation, and sometimes aggression. Rather than letting this fiery planet overwhelm you, here are daily rituals to harness its power.

## Morning: Ignite Your Intentions

Start each day during Mars season with movement. This doesn't have to be intense—even a 10-minute walk or stretch sequence activates Mars energy in a healthy way.

**Try this morning ritual:**
1. Upon waking, take three deep breaths
2. Set one clear intention for the day
3. Move your body for at least 10 minutes
4. Speak your intention aloud: "Today, I will..."

## Afternoon: Channel the Fire

The middle of the day is when Mars energy peaks. Use this time for:

- Tackling challenging tasks
- Having difficult conversations
- Making bold decisions
- Physical exercise

> "Mars doesn't ask us to be passive. It asks us to act with purpose."

## Evening: Cool the Flames

As the day winds down, Mars energy needs grounding. Without this, you may experience:
- Difficulty sleeping
- Irritability
- Racing thoughts

**Evening practices:**
- Take a cool shower or bath
- Practice legs-up-the-wall pose
- Write down what you accomplished
- Release any lingering frustration through journaling

## Weekly Mars Ritual

Once a week during Mars season, dedicate time to:

1. **Assess your progress** on current goals
2. **Adjust your approach** if something isn't working
3. **Celebrate your wins**, no matter how small
4. **Plan your next moves** with clarity

---

Mars season is not about burning out—it's about burning bright with intention. Use these rituals to stay energized without losing yourself in the fire.
        `.trim(),
        category: 'Rituals',
        author: 'Luna Reyes',
        authorBio: 'Ritual designer and ceremonial guide specializing in planetary alignments.',
        date: 'November 28, 2025',
        readTime: '4 min read',
        tags: ['Mars', 'Rituals', 'Daily Practice', 'Energy'],
      },
    }

    return posts[slug] || null
  },
  { server: false }
)

// Related posts (simulated)
const { data: relatedPosts } = useLazyAsyncData<RelatedPost[]>(
  `related-${slug}`,
  async () => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [
      {
        slug: 'moon-phases-guide',
        title: 'A complete guide to working with moon phases',
        category: 'Astrology',
        date: 'Nov 15',
      },
      {
        slug: 'saturn-return-survival',
        title: 'Surviving your Saturn Return',
        category: 'Transits',
        date: 'Nov 5',
      },
      {
        slug: 'morning-ritual-routine',
        title: 'Creating a sacred morning ritual',
        category: 'Rituals',
        date: 'Nov 10',
      },
    ]
  },
  { server: false }
)

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
            <span class="text-brand-base/70">{{ post.category }}</span>
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
            <p class="text-brand-secondary mb-3 text-sm font-medium tracking-wide uppercase">
              {{ post.category }}
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
              <span class="font-medium">{{ post.author }}</span>
              <span>·</span>
              <span>{{ post.date }}</span>
              <span>·</span>
              <span>{{ post.readTime }}</span>
            </div>
          </header>

          <!-- Article Body - Markdown rendered -->
          <div class="border-brand-base/10 border-t pt-8">
            <BaseMarkdown
              :content="post.content"
              size="lg"
            />
          </div>

          <!-- Tags -->
          <div
            v-if="post.tags?.length"
            class="border-brand-base/10 mt-8 border-t pt-6"
          >
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in post.tags"
                :key="tag"
                class="bg-brand-base/5 text-brand-base/60 rounded-full px-3 py-1 text-sm"
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Author Bio -->
          <div
            v-if="post.authorBio"
            class="border-brand-base/10 mt-8 border-t pt-6"
          >
            <BaseCard padding="lg">
              <div class="flex items-start gap-4">
                <div
                  class="bg-brand-accent/10 text-brand-accent flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
                >
                  {{ post.author.charAt(0) }}
                </div>
                <div>
                  <p class="text-brand-base font-medium">{{ post.author }}</p>
                  <p class="text-brand-base/60 mt-1 text-sm">
                    {{ post.authorBio }}
                  </p>
                </div>
              </div>
            </BaseCard>
          </div>
        </article>
      </PageSection>

      <!-- Related Posts -->
      <PageSection
        v-if="relatedPosts?.length"
        eyebrow="Keep reading"
        title="Related articles"
        divider
      >
        <div class="grid gap-4 md:grid-cols-3">
          <NuxtLink
            v-for="related in relatedPosts"
            :key="related.slug"
            :to="`/blog/${related.slug}`"
            class="group block"
          >
            <BaseCard
              hoverable
              padding="md"
            >
              <p class="text-brand-secondary mb-1 text-xs font-medium tracking-wide uppercase">
                {{ related.category }}
              </p>
              <h3
                class="font-headers text-brand-base group-hover:text-brand-accent font-semibold transition"
              >
                {{ related.title }}
              </h3>
              <p class="text-brand-base/40 mt-2 text-xs">{{ related.date }}</p>
            </BaseCard>
          </NuxtLink>
        </div>
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
