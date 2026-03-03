module.exports = {
  'apps/api/**/*.{ts,tsx,js,jsx,mjs,cjs}': [
    'node ./node_modules/eslint/bin/eslint.js --config apps/api/eslint.config.mjs --ignore-pattern apps/api/eslint.config.mjs --ignore-pattern apps/api/validate-permission-constants.mjs --max-warnings=0 --fix --no-warn-ignored',
  ],
  'apps/web/**/*.{ts,tsx,js,jsx,mjs,cjs}': [
    'node ./node_modules/eslint/bin/eslint.js --config apps/web/eslint.config.js --ignore-pattern apps/web/eslint.config.js --max-warnings=0 --fix --no-warn-ignored',
  ],
  'packages/types/**/*.{ts,tsx,js,jsx,mjs,cjs}': [
    'node ./node_modules/eslint/bin/eslint.js --config packages/types/eslint.config.mjs --ignore-pattern packages/types/eslint.config.mjs --max-warnings=0 --fix --no-warn-ignored',
  ],
  '*.{json,md,yml,yaml}': ['node ./node_modules/prettier/bin/prettier.cjs --write'],
};
