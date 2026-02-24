/**
 * Conventional Commits enforcement for the BLIH monorepo.
 * Format: type(scope?): subject
 * Optional: body and footer (e.g. BREAKING CHANGE:, Fixes #123).
 *
 * @see https://www.conventionalcommits.org/
 * @see https://commitlint.js.org/reference/rules.html
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],

  rules: {
    // --- Allowed types (full conventional set) ---
    'type-enum': [
      2,
      'always',
      [
        'build', // build system, deps, tooling
        'chore', // maintenance, no prod code change
        'ci', // CI config, workflows, scripts
        'docs', // documentation only
        'feat', // new feature
        'fix', // bug fix
        'perf', // performance improvement
        'refactor', // code change that neither fixes a bug nor adds a feature
        'revert', // revert a previous commit
        'style', // formatting, missing semicolons, etc.
        'test', // adding or updating tests
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // --- Header: type(scope?): subject ---
    'header-max-length': [2, 'always', 72],
    'header-full-stop': [2, 'never', '.'],
    'scope-case': [2, 'always', 'lower-case'],
    'scope-empty': [0], // scope optional
    'subject-case': [0], // disabled: allow proper nouns (e.g. Keycloak, API)
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],

    // --- Body (optional); max 120 chars per line ---
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 120],
    'body-full-stop': [0], // disabled: allow body lines to end with a period

    // --- Footer (optional; e.g. BREAKING CHANGE:, Fixes #123); max 120 chars per line ---
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [2, 'always', 120],
  },
};
