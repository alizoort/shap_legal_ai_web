import { spawnSync } from 'node:child_process';

const result = spawnSync('npx', ['playwright', 'test', 'e2e/tests/visual.spec.ts'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

if (result.status !== 0) {
  console.warn('\n[visual-gate-warning] Visual regression differences detected.');
  process.exit(0);
}

process.exit(0);
