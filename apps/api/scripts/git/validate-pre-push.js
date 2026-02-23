#!/usr/bin/env node

const fs = require('node:fs');

// Conventional prefixes (aligned with Conventional Commits / common practice)
const ALLOWED_PREFIXES =
  'feature|fix|chore|docs|refactor|test|build|ci|perf|style|revert|release|hotfix';
const BRANCH_PATTERN = new RegExp(`^(${ALLOWED_PREFIXES})\\/[a-z0-9._-]+$`);
const PROTECTED_BRANCHES = new Set(['main', 'develop', 'dev']);

const stdin = fs.readFileSync(0, 'utf8').trim();
const lines = stdin ? stdin.split(/\r?\n/) : [];
const errors = new Set();

for (const line of lines) {
  const [localRef, , remoteRef] = line.trim().split(/\s+/);

  if (!localRef || !remoteRef) {
    continue;
  }

  const localBranch = localRef.startsWith('refs/heads/')
    ? localRef.replace('refs/heads/', '')
    : null;
  const remoteBranch = remoteRef.startsWith('refs/heads/')
    ? remoteRef.replace('refs/heads/', '')
    : null;

  if (remoteBranch && PROTECTED_BRANCHES.has(remoteBranch)) {
    errors.add(
      `Direct pushes to '${remoteBranch}' are blocked. Open a Pull Request.`,
    );
  }

  if (
    localBranch &&
    !PROTECTED_BRANCHES.has(localBranch) &&
    !BRANCH_PATTERN.test(localBranch)
  ) {
    errors.add(
      `Branch '${localBranch}' is invalid. Use <prefix>/<name> where prefix is one of: ${ALLOWED_PREFIXES.replace(/\|/g, ', ')}.`,
    );
  }
}

if (errors.size > 0) {
  console.error('\nPush rejected by repository governance:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}
