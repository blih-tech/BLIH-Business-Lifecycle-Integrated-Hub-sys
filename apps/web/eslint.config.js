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
});
