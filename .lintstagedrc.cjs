module.exports = {
  'apps/api/**/*.{ts,tsx,js,jsx,mjs,cjs}': [
    'eslint --config apps/api/eslint.config.mjs --ignore-pattern apps/api/eslint.config.mjs --max-warnings=0 --fix --no-warn-ignored',
  ],
  'apps/web/**/*.{ts,tsx,js,jsx,mjs,cjs}': [
    'eslint --config apps/web/eslint.config.js --ignore-pattern apps/web/eslint.config.js --max-warnings=0 --fix --no-warn-ignored',
  ],
  'packages/types/**/*.{ts,tsx,js,jsx,mjs,cjs}': [
    'eslint --config packages/types/eslint.config.mjs --ignore-pattern packages/types/eslint.config.mjs --max-warnings=0 --fix --no-warn-ignored',
  ],
  'packages/types/**/*.{ts,tsx,js,jsx,mjs,cjs}': [
    'eslint --config packages/types/eslint.config.mjs --ignore-pattern packages/types/eslint.config.mjs --max-warnings=0 --fix --no-warn-ignored',
  ],
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
