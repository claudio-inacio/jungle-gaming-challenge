import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import eslintConfigPrettier from 'eslint-config-prettier'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'src/app/routeTree.gen.ts', 'reports', 'public/mockServiceWorker.js']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
      eslintConfigPrettier,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/mocks', '@/mocks/*', '**/mocks/*'],
              message:
                'src/mocks é infraestrutura de simulação; não pode ser importado por código de negócio (app/pages/widgets/features/entities/shared).',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/main.tsx'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['src/shared/ui/**/*.{ts,tsx}', 'src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
      // Primitivos genéricos: a associação label/control acontece no local de uso.
      'jsx-a11y/label-has-associated-control': 'off',
    },
  },
])
