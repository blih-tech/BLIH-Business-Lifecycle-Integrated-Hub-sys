#!/usr/bin/env node

const fs = require('node:fs');

const PROTECTED_BRANCHES = new Set(['main', 'develop', 'dev']);

const stdin = fs.readFileSync(0, 'utf8').trim();
const lines = stdin ? stdin.split(/\r?\n/) : [];
const errors = new Set();

for (const line of lines) {
  const [localRef, , remoteRef] = line.trim().split(/\s+/);

  if (!localRef || !remoteRef) {
    continue;
  }

  const remoteBranch = remoteRef.startsWith('refs/heads/')
    ? remoteRef.replace('refs/heads/', '')
    : null;

  if (remoteBranch && PROTECTED_BRANCHES.has(remoteBranch)) {
    errors.add(
      `Direct pushes to '${remoteBranch}' are blocked. Open a Pull Request.`,
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
