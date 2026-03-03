#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '../../../../');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const workspaceRoots = ['apps', 'packages'].map((segment) =>
  path.join(repoRoot, segment),
);

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

function runGit(args, allowEmpty = false, options = {}) {
  const result = spawnSync('git', args, {
    cwd: options.cwd ?? repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      ...(options.env ?? {}),
    },
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

function ensureDirectory(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function pathExists(targetPath) {
  try {
    fs.lstatSync(targetPath);
    return true;
  } catch {
    return false;
  }
}

function isWithin(parentPath, childPath) {
  const relativePath = path.relative(parentPath, childPath);
  return (
    relativePath.length > 0 &&
    !relativePath.startsWith('..') &&
    !path.isAbsolute(relativePath)
  );
}

function toGitPrefix(targetPath) {
  const normalized = targetPath.split(path.sep).join('/');
  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

function resolveSnapshotWorkspaceTarget(snapshotRoot, targetPath) {
  for (const workspaceRoot of workspaceRoots) {
    if (targetPath === workspaceRoot || isWithin(workspaceRoot, targetPath)) {
      return path.join(snapshotRoot, path.relative(repoRoot, targetPath));
    }
  }

  return null;
}

function linkIntoSnapshot(sourcePath, targetPath, kind) {
  ensureDirectory(path.dirname(targetPath));

  if (pathExists(targetPath)) {
    return;
  }

  const symlinkType =
    kind === 'dir' ? (process.platform === 'win32' ? 'junction' : 'dir') : 'file';

  fs.symlinkSync(sourcePath, targetPath, symlinkType);
}

function linkNodeModulesEntry(sourcePath, targetPath, snapshotRoot) {
  const stats = fs.lstatSync(sourcePath);

  if (stats.isSymbolicLink()) {
    const resolvedTarget = fs.realpathSync(sourcePath);
    const snapshotTarget = resolveSnapshotWorkspaceTarget(
      snapshotRoot,
      resolvedTarget,
    );

    linkIntoSnapshot(
      snapshotTarget ?? resolvedTarget,
      targetPath,
      fs.statSync(resolvedTarget).isDirectory() ? 'dir' : 'file',
    );
    return;
  }

  if (stats.isDirectory()) {
    linkIntoSnapshot(sourcePath, targetPath, 'dir');
    return;
  }

  linkIntoSnapshot(sourcePath, targetPath, 'file');
}

function hydrateNodeModules(snapshotRoot) {
  const sourceNodeModules = path.join(repoRoot, 'node_modules');
  if (!pathExists(sourceNodeModules)) {
    return;
  }

  const snapshotNodeModules = path.join(snapshotRoot, 'node_modules');
  ensureDirectory(snapshotNodeModules);

  for (const entry of fs.readdirSync(sourceNodeModules, { withFileTypes: true })) {
    linkNodeModulesEntry(
      path.join(sourceNodeModules, entry.name),
      path.join(snapshotNodeModules, entry.name),
      snapshotRoot,
    );
  }
}

function createIndexSnapshot() {
  const snapshotRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), 'blih-pre-commit-'),
  );

  runGit(['checkout-index', '--all', '--force', `--prefix=${toGitPrefix(snapshotRoot)}`]);
  hydrateNodeModules(snapshotRoot);

  return snapshotRoot;
}

function createTreeSnapshot(treeish, prefix = 'blih-pre-push-') {
  const snapshotRoot = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  const snapshotIndex = path.join(snapshotRoot, '.git-index');
  const snapshotEnv = {
    GIT_INDEX_FILE: snapshotIndex,
  };

  try {
    runGit(['read-tree', treeish], false, { env: snapshotEnv });
    runGit(
      ['checkout-index', '--all', '--force', `--prefix=${toGitPrefix(snapshotRoot)}`],
      false,
      { env: snapshotEnv },
    );
  } finally {
    fs.rmSync(snapshotIndex, { force: true });
  }

  hydrateNodeModules(snapshotRoot);

  return snapshotRoot;
}

function runNpm(args, cwd = repoRoot) {
  console.log(`> ${npmCommand} ${args.join(' ')}`);
  const result = spawnSync(npmCommand, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runChecks(scopes, cwd = repoRoot) {
  if (scopes.types) {
    runNpm(['run', 'lint', '--workspace', '@repo/types'], cwd);
    runNpm(['run', 'check-types', '--workspace', '@repo/types'], cwd);
  }

  if (scopes.web) {
    runNpm(['run', 'lint', '--workspace', 'web'], cwd);
    runNpm(['run', 'check-types', '--workspace', 'web'], cwd);
  }

  if (scopes.api) {
    runNpm(['run', 'lint:check', '--workspace', 'blih-system-backend'], cwd);
    runNpm(['run', 'check-types', '--workspace', 'blih-system-backend'], cwd);
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

  const snapshotRoot =
    mode === 'pre-commit' ? createIndexSnapshot() : createTreeSnapshot('HEAD');

  try {
    runChecks(scopes, snapshotRoot);
  } finally {
    fs.rmSync(snapshotRoot, { recursive: true, force: true });
  }
}

main();
