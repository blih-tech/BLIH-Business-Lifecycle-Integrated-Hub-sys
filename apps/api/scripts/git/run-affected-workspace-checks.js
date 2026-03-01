#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '../../../../');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function parseArgs(argv) {
  const result = {
    mode: 'pre-commit',
    refsFile: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--mode') {
      result.mode = argv[index + 1] ?? result.mode;
      index += 1;
      continue;
    }

    if (arg === '--refs-file') {
      result.refsFile = argv[index + 1] ?? null;
      index += 1;
    }
  }

  return result;
}

function runGit(args, allowEmpty = false) {
  const result = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    if (allowEmpty) {
      return '';
    }

    const stderr = result.stderr?.trim();
    const stdout = result.stdout?.trim();
    const message = stderr || stdout || `git ${args.join(' ')} failed`;
    throw new Error(message);
  }

  return result.stdout.trim();
}

function listChangedFilesFromRange(range) {
  const output = runGit(
    ['diff', '--name-only', '--diff-filter=ACMR', range],
    true,
  );

  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function resolveDefaultBaseRef() {
  const candidates = ['origin/main', 'origin/develop', 'origin/dev'];

  for (const candidate of candidates) {
    const result = spawnSync('git', ['rev-parse', '--verify', candidate], {
      cwd: repoRoot,
      encoding: 'utf8',
    });

    if (result.status === 0) {
      return candidate;
    }
  }

  return 'HEAD~1';
}

function getPreCommitFiles() {
  const output = runGit(
    ['diff', '--cached', '--name-only', '--diff-filter=ACMR'],
    true,
  );

  return output ? output.split(/\r?\n/).filter(Boolean) : [];
}

function isZeroSha(sha) {
  return /^0+$/.test(sha);
}

function getPrePushFiles(refsFile) {
  if (!refsFile) {
    throw new Error('Missing --refs-file for pre-push mode');
  }

  const refsContent = fs.readFileSync(refsFile, 'utf8').trim();

  if (!refsContent) {
    return [];
  }

  const files = new Set();

  for (const line of refsContent.split(/\r?\n/)) {
    const [localRef, localSha, remoteRef, remoteSha] = line.trim().split(/\s+/);

    if (
      !localRef ||
      !localSha ||
      !remoteRef ||
      !remoteSha ||
      isZeroSha(localSha)
    ) {
      continue;
    }

    if (!isZeroSha(remoteSha)) {
      for (const file of listChangedFilesFromRange(
        `${remoteSha}..${localSha}`,
      )) {
        files.add(file);
      }
      continue;
    }

    const defaultBaseRef = resolveDefaultBaseRef();
    let mergeBase = '';

    try {
      mergeBase = runGit(['merge-base', localSha, defaultBaseRef], true);
    } catch {
      mergeBase = '';
    }

    const range = mergeBase ? `${mergeBase}..${localSha}` : localSha;
    for (const file of listChangedFilesFromRange(range)) {
      files.add(file);
    }
  }

  return [...files];
}

function classifyWorkspaces(files) {
  const scopes = {
    api: false,
    types: false,
    web: false,
  };

  for (const file of files) {
    if (
      file === 'package.json' ||
      file === 'package-lock.json' ||
      file === 'turbo.json'
    ) {
      scopes.api = true;
      scopes.types = true;
      scopes.web = true;
      continue;
    }

    if (file.startsWith('apps/api/')) {
      scopes.api = true;
      continue;
    }

    if (file.startsWith('apps/web/')) {
      scopes.web = true;
      continue;
    }

    if (file.startsWith('packages/types/')) {
      scopes.api = true;
      scopes.types = true;
      continue;
    }

    if (
      file.startsWith('packages/eslint-config/') ||
      file.startsWith('packages/typescript-config/')
    ) {
      scopes.types = true;
      scopes.web = true;
    }
  }

  return scopes;
}

function runNpm(args) {
  console.log(`> ${npmCommand} ${args.join(' ')}`);
  const result = spawnSync(npmCommand, args, {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runChecks(scopes) {
  if (scopes.types) {
    runNpm(['run', 'lint', '--workspace', '@blih/types']);
    runNpm(['run', 'check-types', '--workspace', '@blih/types']);
  }

  if (scopes.web) {
    runNpm(['run', 'lint', '--workspace', 'web']);
    runNpm(['run', 'check-types', '--workspace', 'web']);
  }

  if (scopes.api) {
    runNpm(['run', 'lint:check', '--workspace', 'blih-system-backend']);
    runNpm(['run', 'check-types', '--workspace', 'blih-system-backend']);
  }
}

function main() {
  const { mode, refsFile } = parseArgs(process.argv.slice(2));
  const files =
    mode === 'pre-push' ? getPrePushFiles(refsFile) : getPreCommitFiles();
  const scopes = classifyWorkspaces(files);

  if (!scopes.api && !scopes.types && !scopes.web) {
    console.log(
      'No affected workspaces detected; skipping scoped verification.',
    );
    return;
  }

  runChecks(scopes);
}

main();
