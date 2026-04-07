#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

const protectedFiles = [
  'docs/architecture/component-decomposition-standard.md',
  'docs/architecture/templates/component-extraction-plan-template.md',
];

function git(args) {
  return spawnSync('git', args, { encoding: 'utf8' });
}

function resolveDiffBase() {
  const explicitBase = process.env.ARCH_OWNER_BASE_REF?.trim();
  if (explicitBase) return explicitBase;

  const hasOriginMain = git(['rev-parse', '--verify', 'origin/main']);
  if (hasOriginMain.status === 0) return 'origin/main';

  const hasHeadMinusOne = git(['rev-parse', '--verify', 'HEAD~1']);
  if (hasHeadMinusOne.status === 0) return 'HEAD~1';

  return '';
}

function changedFiles() {
  const files = new Set();
  const base = resolveDiffBase();
  if (base) {
    const diff = git(['diff', '--name-only', '--diff-filter=ACMR', `${base}...HEAD`]);
    if (diff.status === 0) {
      (diff.stdout || '').split('\n').map((line) => line.trim()).filter(Boolean).forEach((file) => files.add(file));
    }
  }

  const fallback = git(['diff', '--name-only', '--diff-filter=ACMR']);
  if (fallback.status === 0) {
    (fallback.stdout || '').split('\n').map((line) => line.trim()).filter(Boolean).forEach((file) => files.add(file));
  }

  const untracked = git(['ls-files', '--others', '--exclude-standard']);
  if (untracked.status === 0) {
    (untracked.stdout || '').split('\n').map((line) => line.trim()).filter(Boolean).forEach((file) => files.add(file));
  }

  return Array.from(files);
}

function main() {
  if (process.env.CI !== 'true') {
    console.log('Skipping architecture-owner check outside CI.');
    return;
  }

  const changed = changedFiles();
  const touchedProtected = changed.filter((file) => protectedFiles.includes(file));

  if (touchedProtected.length === 0) {
    console.log('Architecture-owner check passed (no protected decomposition files changed).');
    return;
  }

  if (process.env.ARCHITECTURE_OWNER_APPROVED === 'true') {
    console.log('Architecture-owner approval acknowledged for protected decomposition files.');
    return;
  }

  console.error('Architecture-owner approval is required for decomposition standard changes.');
  touchedProtected.forEach((file) => console.error(`- ${file}`));
  console.error('Set ARCHITECTURE_OWNER_APPROVED=true in CI after architecture-owner review.');
  process.exit(1);
}

main();
