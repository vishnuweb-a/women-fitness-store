import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'public/**', '.agents/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // `jsx-uses-vars` teaches no-unused-vars that a capitalised identifier
      // referenced in JSX counts as used; `jsx-uses-react` is unnecessary
      // under the automatic JSX runtime but harmless to omit.
      'react/jsx-uses-vars': 'error',
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // `varsIgnorePattern` also covers component-shaped names destructured
      // from props (e.g. `icon: Icon = Default`), which are used in JSX.
      'no-unused-vars': [
        'error',
        {
          varsIgnorePattern: '^[A-Z_]',
          argsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      // Server-only secrets must never be read from browser code.
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "MemberExpression[object.object.name='import'][object.property.name='meta'][property.name=/SERVICE_ROLE|API_SECRET|SECRET/i]",
          message:
            'Secrets must never be read in browser code. Keep them server-side.',
        },
      ],
    },
  },
  {
    // shadcn/ui components are generated: they colocate `cva` variant
    // definitions with the component, which is the upstream convention.
    files: ['src/components/ui/**/*.jsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // Node context for config files.
    files: ['*.config.js', 'eslint.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    // `scripts/` holds server-side Node tooling (the Cloudinary uploader).
    // It never ships to the browser, so it gets Node globals rather than DOM
    // ones — and it is allowed to read secrets, which browser code is not.
    files: ['scripts/**/*.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
]
