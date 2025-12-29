/**
 * tRPC Composable
 *
 * Provides type-safe access to tRPC client.
 * Auto-imported - use directly in components.
 *
 * @example
 * ```vue
 * <script setup>
 * const { $trpc } = useTrpc()
 *
 * // Query posts
 * const { data: posts } = await $trpc.posts.list.useQuery({ lang: 'en' })
 *
 * // Query single post
 * const { data: post } = await $trpc.posts.bySlug.useQuery({ slug: 'my-post' })
 * </script>
 * ```
 */
export function useTrpc() {
  const nuxtApp = useNuxtApp()
  return {
    $trpc: nuxtApp.$trpc,
  }
}
