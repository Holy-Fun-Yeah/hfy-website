/**
 * Composable for loading markdown content from files or URLs.
 * Auto-imported in Nuxt - no import needed.
 *
 * @example Loading from a URL
 * ```vue
 * <script setup>
 * const { content, loading, error, load } = useMarkdown()
 * load('/api/posts/my-post')
 * </script>
 *
 * <template>
 *   <div v-if="loading">Loading...</div>
 *   <div v-else-if="error">{{ error }}</div>
 *   <BaseMarkdown v-else :content="content" />
 * </template>
 * ```
 *
 * @example Loading from static file
 * ```vue
 * <script setup>
 * const { content, load } = useMarkdown()
 * // Load from public folder
 * load('/content/about.md')
 * </script>
 * ```
 *
 * @example With initial content
 * ```vue
 * <script setup>
 * const { content } = useMarkdown('# Hello World')
 * </script>
 * ```
 */
export function useMarkdown(initialContent = '') {
  const content = ref<string>(initialContent)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  /**
   * Load markdown content from a URL or file path.
   * Files in the `public/` folder can be loaded by path (e.g., `/content/readme.md`).
   */
  async function load(url: string): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<string>(url, {
        responseType: 'text',
      })
      content.value = response
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error loading markdown'
      content.value = ''
    } finally {
      loading.value = false
    }
  }

  /**
   * Set markdown content directly (for content from props, stores, etc.)
   */
  function setContent(markdown: string): void {
    content.value = markdown
    error.value = null
  }

  /**
   * Clear the current content
   */
  function clear(): void {
    content.value = ''
    error.value = null
  }

  return {
    /** Current markdown content */
    content,
    /** Whether content is being loaded */
    loading,
    /** Error message if loading failed */
    error,
    /** Load markdown from a URL or file path */
    load,
    /** Set content directly */
    setContent,
    /** Clear content */
    clear,
  }
}
