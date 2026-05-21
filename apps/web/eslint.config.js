import { nextJsConfig } from '@repo/eslint-config/next-js';
import tseslint from 'typescript-eslint';

/** @type {import("eslint").Linter.Config[]} */
export default tseslint.config(...nextJsConfig, {
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    // This project uses the Next.js App Router (apps/web/src/app), so the legacy
    // pages directory does not exist.
    '@next/next/no-html-link-for-pages': 'off',
  },
});
