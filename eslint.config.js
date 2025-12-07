import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import prettierConfig from '@vue/eslint-config-prettier'
import unusedImports from 'eslint-plugin-unused-imports'
import importX from 'eslint-plugin-import-x'
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  // Vue recommended rules
  ...pluginVue.configs['flat/recommended'],

  // TypeScript support for Vue
  ...vueTsEslintConfig(),

  // Prettier integration
  prettierConfig,

  // Import sorting and unused imports
  {
    plugins: {
      'unused-imports': unusedImports,
      'import-x': importX,
    },
    rules: {
      // Import sorting
      'import-x/order': [
        'warn',
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
        },
      ],

      // Unused imports cleanup
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      // Console/debugger warnings in production
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    },
  },

  // Nuxt pages and layouts (allow single-word names)
  {
    files: ['**/pages/**/*.vue', '**/layouts/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  // Vue-specific customizations
  {
    files: ['**/*.vue'],
    rules: {
      // Allow multiple template roots (Vue 3 feature)
      'vue/no-multiple-template-root': 'off',

      // Template formatting
      'vue/html-indent': ['warn', 2, { attribute: 1, baseIndent: 1 }],
      'vue/max-attributes-per-line': ['warn', { singleline: 3, multiline: { max: 1 } }],
      'vue/html-self-closing': [
        'warn',
        {
          html: { void: 'any', normal: 'always', component: 'always' },
          svg: 'any',
          math: 'any',
        },
      ],

      // Prefer Composition API style
      'vue/component-api-style': ['warn', ['script-setup', 'composition']],

      // Enforce component naming conventions
      'vue/component-name-in-template-casing': ['warn', 'PascalCase'],
    },
  },

  // TypeScript-specific rules
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off', // Handled by unused-imports
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // Ignore patterns
  {
    ignores: [
      '.nuxt/**',
      '.output/**',
      'dist/**',
      'node_modules/**',
      '*.config.js',
      '*.config.ts',
      '*.config.mjs',
    ],
  }
)
