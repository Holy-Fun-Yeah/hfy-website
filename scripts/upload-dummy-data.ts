/**
 * Upload Dummy Data Script
 *
 * Uploads dummy posts and events to the database with auto-translation.
 * Uses Claude API (Anthropic) for translations to Spanish, German, and French.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... yarn tsx scripts/upload-dummy-data.ts
 *
 * Options:
 *   --posts-only     Only upload posts
 *   --events-only    Only upload events
 *   --delete         Delete existing dummy data instead of uploading
 */

import Anthropic from '@anthropic-ai/sdk'
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import { eq, like } from 'drizzle-orm'
import postgres from 'postgres'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// Load env from .env
config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Types
interface PostContent {
  title: string
  excerpt: string
  content: string
}

interface DummyPost {
  slug: string
  published: boolean
  bannerUrl: string | null
  content: {
    en: PostContent
  }
}

interface EventContent {
  title: string
  description: string
  detail: string
}

interface DummyEvent {
  slug: string
  type: 'online' | 'in_person'
  status: 'draft' | 'published' | 'cancelled' | 'completed'
  startsAt: string
  endsAt: string
  host: string
  location: string
  address: string | null
  usdPrice: string
  capacity: number | null
  bannerUrl: string | null
  content: {
    en: EventContent
  }
}

type SupportedLanguage = 'en' | 'es' | 'de' | 'fr'

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'es', 'de', 'fr']
const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Spanish',
  de: 'German',
  fr: 'French',
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Initialize database connection
const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not found in environment')
  process.exit(1)
}

const client = postgres(DATABASE_URL)
const db = drizzle(client)

/**
 * Translate content to a target language using Claude
 */
async function translateContent<T extends Record<string, string>>(
  content: T,
  targetLang: SupportedLanguage
): Promise<T> {
  if (targetLang === 'en') return content

  const targetLanguage = LANGUAGE_NAMES[targetLang]
  const fields = Object.entries(content)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n\n')

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Translate the following content to ${targetLanguage}. This is for a spiritual/astrology website called "Holy Fuck Yeah!" (HFY).

Keep the same tone - mystical, warm, and empowering. Preserve any markdown formatting.

Return ONLY a JSON object with the same keys but translated values. No explanation.

Content to translate:
${fields}

Return format: {"key1": "translated value", "key2": "translated value", ...}`,
        },
      ],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from Claude')
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = textBlock.text.trim()
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```(?:json)?\n?/g, '').trim()
    }

    return JSON.parse(jsonStr) as T
  } catch (error) {
    console.error(`  Translation error for ${targetLang}:`, error)
    // Return original content as fallback
    return content
  }
}

// Admin emails (same as app/config/admin.ts)
const ADMIN_EMAILS = ['hfy.world@outlook.com', 'danyiel5978@gmail.com']

/**
 * Upload posts to the database
 */
async function uploadPosts() {
  console.log('\n📝 Uploading Posts...\n')

  const postsData: DummyPost[] = JSON.parse(
    readFileSync(join(__dirname, 'data/dummy-posts.json'), 'utf-8')
  )

  // Get any user ID for authorId, or use first admin if available
  let authorResult = await client`
    SELECT id FROM profiles WHERE LOWER(email) = ANY(${ADMIN_EMAILS.map((e) => e.toLowerCase())}) LIMIT 1
  `

  // Fallback to any profile if no admin found
  if (authorResult.length === 0) {
    authorResult = await client`SELECT id FROM profiles LIMIT 1`
  }

  if (authorResult.length === 0) {
    console.error('ERROR: No profiles found. Create a user account first.')
    process.exit(1)
  }

  const authorId = authorResult[0].id
  console.log(`  Using author ID: ${authorId}`)

  for (const post of postsData) {
    console.log(`  Processing: ${post.slug}`)

    // Translate content to all languages
    const contentByLang: Record<SupportedLanguage, PostContent> = {
      en: post.content.en,
      es: post.content.en,
      de: post.content.en,
      fr: post.content.en,
    }

    for (const lang of SUPPORTED_LANGUAGES) {
      if (lang === 'en') continue
      console.log(`    Translating to ${LANGUAGE_NAMES[lang]}...`)
      contentByLang[lang] = await translateContent(post.content.en, lang)
    }

    // Check if post already exists
    const existing = await client`
      SELECT id FROM posts WHERE slug = ${post.slug}
    `

    let postId: number

    if (existing.length > 0) {
      postId = existing[0].id
      console.log(`    Updating existing post (id: ${postId})`)

      await client`
        UPDATE posts SET
          published = ${post.published},
          banner_url = ${post.bannerUrl},
          updated_at = NOW()
        WHERE id = ${postId}
      `
    } else {
      console.log(`    Creating new post`)

      const result = await client`
        INSERT INTO posts (slug, published, author_id, banner_url)
        VALUES (${post.slug}, ${post.published}, ${authorId}, ${post.bannerUrl})
        RETURNING id
      `
      postId = result[0].id
    }

    // Upsert content for each language
    for (const lang of SUPPORTED_LANGUAGES) {
      const content = contentByLang[lang]

      await client`
        INSERT INTO post_content (post_id, lang, title, excerpt, content)
        VALUES (${postId}, ${lang}, ${content.title}, ${content.excerpt}, ${content.content})
        ON CONFLICT (post_id, lang) DO UPDATE SET
          title = ${content.title},
          excerpt = ${content.excerpt},
          content = ${content.content},
          updated_at = NOW()
      `
    }

    console.log(`    ✅ Done\n`)
  }

  console.log(`✅ Uploaded ${postsData.length} posts\n`)
}

/**
 * Upload events to the database
 */
async function uploadEvents() {
  console.log('\n📅 Uploading Events...\n')

  const eventsData: DummyEvent[] = JSON.parse(
    readFileSync(join(__dirname, 'data/dummy-events.json'), 'utf-8')
  )

  for (const event of eventsData) {
    console.log(`  Processing: ${event.slug}`)

    // Translate content to all languages
    const contentByLang: Record<SupportedLanguage, EventContent> = {
      en: event.content.en,
      es: event.content.en,
      de: event.content.en,
      fr: event.content.en,
    }

    for (const lang of SUPPORTED_LANGUAGES) {
      if (lang === 'en') continue
      console.log(`    Translating to ${LANGUAGE_NAMES[lang]}...`)
      contentByLang[lang] = await translateContent(event.content.en, lang)
    }

    // Check if event already exists
    const existing = await client`
      SELECT id FROM events WHERE slug = ${event.slug}
    `

    let eventId: string

    if (existing.length > 0) {
      eventId = existing[0].id
      console.log(`    Updating existing event (id: ${eventId})`)

      await client`
        UPDATE events SET
          type = ${event.type},
          status = ${event.status},
          starts_at = ${event.startsAt},
          ends_at = ${event.endsAt},
          host = ${event.host},
          location = ${event.location},
          address = ${event.address},
          usd_price = ${event.usdPrice},
          capacity = ${event.capacity},
          banner_url = ${event.bannerUrl},
          updated_at = NOW()
        WHERE id = ${eventId}
      `
    } else {
      console.log(`    Creating new event`)

      const result = await client`
        INSERT INTO events (slug, type, status, starts_at, ends_at, host, location, address, usd_price, capacity, banner_url)
        VALUES (${event.slug}, ${event.type}, ${event.status}, ${event.startsAt}, ${event.endsAt}, ${event.host}, ${event.location}, ${event.address}, ${event.usdPrice}, ${event.capacity}, ${event.bannerUrl})
        RETURNING id
      `
      eventId = result[0].id
    }

    // Upsert content for each language
    for (const lang of SUPPORTED_LANGUAGES) {
      const content = contentByLang[lang]

      await client`
        INSERT INTO event_content (event_id, lang, title, description, detail)
        VALUES (${eventId}, ${lang}, ${content.title}, ${content.description}, ${content.detail})
        ON CONFLICT (event_id, lang) DO UPDATE SET
          title = ${content.title},
          description = ${content.description},
          detail = ${content.detail},
          updated_at = NOW()
      `
    }

    console.log(`    ✅ Done\n`)
  }

  console.log(`✅ Uploaded ${eventsData.length} events\n`)
}

/**
 * Delete all dummy data (posts and events with "dummy-" prefix)
 */
async function deleteDummyData() {
  console.log('\n🗑️  Deleting Dummy Data...\n')

  // Delete posts with dummy- prefix
  const deletedPosts = await client`
    DELETE FROM posts WHERE slug LIKE 'dummy-%' RETURNING slug
  `
  console.log(`  Deleted ${deletedPosts.length} posts`)

  // Delete events with dummy- prefix
  const deletedEvents = await client`
    DELETE FROM events WHERE slug LIKE 'dummy-%' RETURNING slug
  `
  console.log(`  Deleted ${deletedEvents.length} events`)

  console.log('\n✅ Dummy data deleted\n')
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2)
  const postsOnly = args.includes('--posts-only')
  const eventsOnly = args.includes('--events-only')
  const deleteMode = args.includes('--delete')

  console.log('🚀 HFY Dummy Data Upload Script')
  console.log('================================')

  if (deleteMode) {
    await deleteDummyData()
  } else {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('\nERROR: ANTHROPIC_API_KEY not set')
      console.error('Usage: ANTHROPIC_API_KEY=sk-... yarn tsx scripts/upload-dummy-data.ts')
      process.exit(1)
    }

    if (!postsOnly && !eventsOnly) {
      await uploadPosts()
      await uploadEvents()
    } else if (postsOnly) {
      await uploadPosts()
    } else if (eventsOnly) {
      await uploadEvents()
    }
  }

  // Close database connection
  await client.end()

  console.log('🎉 All done!')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
