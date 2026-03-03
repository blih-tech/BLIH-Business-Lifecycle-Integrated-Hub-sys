// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'eslint.config.mjs',
      'validate-permission-constants.mjs',
      'src/platform/prisma/generated/**',
      'src/shared/demo-hr-types/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        sourceType: 'commonjs',
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'prettier/prettier': 'error',
      'comma-dangle': 'off',
    },
  },
  // Domain modules must not import from other domain modules (event-driven only)
  ...[
    [
      'src/domains/hr/**/*.ts',
      ['crm', 'finance', 'project', 'brain', 'chatbot', 'ai'],
    ],
    [
      'src/domains/crm/**/*.ts',
      ['hr', 'finance', 'project', 'brain', 'chatbot', 'ai'],
    ],
    [
      'src/domains/finance/**/*.ts',
      ['hr', 'crm', 'project', 'brain', 'chatbot', 'ai'],
    ],
    [
      'src/domains/project/**/*.ts',
      ['hr', 'crm', 'finance', 'brain', 'chatbot', 'ai'],
    ],
    [
      'src/domains/brain/**/*.ts',
      ['hr', 'crm', 'finance', 'project', 'brain', 'chatbot', 'ai'],
    ],
    [
      'src/domains/chatbot/**/*.ts',
      ['hr', 'crm', 'finance', 'project', 'brain', 'ai'],
    ],
    [
      'src/domains/ai/**/*.ts',
      ['hr', 'crm', 'finance', 'project', 'brain', 'chatbot'],
    ],
  ].map(([files, forbidden]) => ({
    files: [files],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: /** @type {string[]} */ (forbidden).map(
                (name) => `**/${name}/**`,
              ),
              message:
                'Domain modules must not import from other domain modules. Use EventBusService and blih.events. See docs/core/CORE_ARCHITECTURE.md.',
            },
          ],
        },
      ],
    },
  })),
];
