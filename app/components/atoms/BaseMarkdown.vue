<script setup lang="ts">
import { marked } from 'marked'

/**
 * BaseMarkdown - Renders markdown content with brand-aware styling
 *
 * Applies the `.prose` class which styles all markdown elements
 * using brand tokens from the design system.
 *
 * @example
 * ```vue
 * <BaseMarkdown :content="markdownString" />
 * <BaseMarkdown content="# Hello\n\nThis is **bold**" />
 * ```
 *
 * @example With size variants
 * ```vue
 * <BaseMarkdown content="..." size="sm" />
 * <BaseMarkdown content="..." size="lg" />
 * ```
 */

export type MarkdownSize = 'sm' | 'base' | 'lg'

interface Props {
  /** Markdown content string to render */
  content: string
  /** Text size variant */
  size?: MarkdownSize
}

const props = withDefaults(defineProps<Props>(), {
  size: 'base',
})

// Configure marked for security and features
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
})

const renderedHtml = computed(() => {
  if (!props.content) return ''
  return marked.parse(props.content) as string
})

const sizeClasses: Record<MarkdownSize, string> = {
  sm: 'prose-sm',
  base: 'prose-base',
  lg: 'prose-lg',
}
</script>

<template>
  <div
    class="prose"
    :class="sizeClasses[size]"
    v-html="renderedHtml"
  />
</template>
