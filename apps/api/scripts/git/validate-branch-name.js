#!/usr/bin/env node

const { execSync } = require('node:child_process');

// Conventional prefixes (aligned with Conventional Commits / common practice)
const ALLOWED_PREFIXES =
  'feature|fix|chore|docs|refactor|test|build|ci|perf|style|revert|release|hotfix';
const BRANCH_PATTERN = new RegExp(`^(${ALLOWED_PREFIXES})\\/[a-z0-9._-]+$`);
const ALLOWED_PROTECTED_BRANCHES = new Set(['main', 'develop', 'dev']);

function resolveBranchName() {
  const argBranch = process.argv[2];
  if (argBranch) {
    return argBranch;
  }

  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return branch;
  } catch {
    return '';
  }
}

const branch = resolveBranchName();

if (!branch || branch === 'HEAD') {
  console.error('Unable to determine current branch name.');
  process.exit(1);
}

if (ALLOWED_PROTECTED_BRANCHES.has(branch)) {
  process.exit(0);
}

if (!BRANCH_PATTERN.test(branch)) {
  console.error(
    `Invalid branch '${branch}'. Use <prefix>/<name> where prefix is one of: ${ALLOWED_PREFIXES.replace(/\|/g, ', ')}.`,
  );
  process.exit(1);
}
