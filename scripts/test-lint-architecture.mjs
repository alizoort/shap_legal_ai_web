#!/usr/bin/env node

import path from 'node:path';
import { runArchitectureLint } from './lint-architecture.mjs';

const repoRoot = process.cwd();
const fixturesRoot = path.join(repoRoot, 'scripts', 'lint-fixtures');

const cases = [
  {
    name: 'page-ts-over-limit fails',
    fixture: 'page-ts-over-limit',
    expectHasViolations: true,
    expectBucket: 'Max-lines violations',
  },
  {
    name: 'ui-no-onpush fails',
    fixture: 'ui-no-onpush',
    expectHasViolations: true,
    expectBucket: 'Non-OnPush presentational ui/* component violations',
  },
  {
    name: 'ui-service-injection fails',
    fixture: 'ui-service-injection',
    expectHasViolations: true,
    expectBucket: 'Service injection in ui/* component violations',
  },
  {
    name: 'expired-allowlist fails',
    fixture: 'expired-allowlist',
    expectHasViolations: true,
    expectBucket: 'Allowlist expiry/config violations',
  },
  {
    name: 'allowlisted-oversize-pass succeeds',
    fixture: 'allowlisted-oversize-pass',
    expectHasViolations: false,
  },
];

function runCase(testCase) {
  const fixtureRoot = path.join(fixturesRoot, testCase.fixture);
  const result = runArchitectureLint({
    projectRoot: fixtureRoot,
    srcRoot: 'src/app',
    allowlist: 'scripts.lint-allowlist.json',
  });

  if (result.hasViolations !== testCase.expectHasViolations) {
    const debug = JSON.stringify(result.buckets, null, 2);
    throw new Error(
      `[${testCase.name}] expected hasViolations=${testCase.expectHasViolations}, got ${result.hasViolations}\n${debug}`
    );
  }

  if (testCase.expectBucket) {
    const entries = result.buckets[testCase.expectBucket] ?? [];
    if (entries.length === 0) {
      const debug = JSON.stringify(result.buckets, null, 2);
      throw new Error(`[${testCase.name}] expected non-empty bucket "${testCase.expectBucket}"\n${debug}`);
    }
  }
}

function main() {
  cases.forEach(runCase);
  console.log('Architecture lint regression fixtures passed.');
}

main();
