#!/usr/bin/env node

import { accessSync, constants, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const isWsl = Boolean(process.env.WSL_DISTRO_NAME);
const expectedNvmPrefix = '/home/canvasuser/.nvm/versions/node/';
const defaultPlaywrightPath = process.env.PLAYWRIGHT_BROWSERS_PATH || '/tmp/ms-playwright';

const issues = [];
const warnings = [];
const infos = [];

function isExecutable(filePath) {
  if (!filePath) return false;
  try {
    accessSync(filePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function resolveBinary(binary) {
  const result = spawnSync('bash', ['-lc', `command -v ${binary}`], {
    encoding: 'utf8',
  });
  if (result.status !== 0) return '';
  return (result.stdout || '').trim();
}

function checkNodeRuntime() {
  const nodePath = resolveBinary('node');
  const npmPath = resolveBinary('npm');
  const npxPath = resolveBinary('npx');

  if (!nodePath || !npmPath || !npxPath) {
    issues.push('Node/NPM/NPX binaries are not all resolvable in PATH.');
    return;
  }

  infos.push(`node: ${nodePath}`);
  infos.push(`npm: ${npmPath}`);
  infos.push(`npx: ${npxPath}`);

  if (isWsl) {
    const allUseNvm = [nodePath, npmPath, npxPath].every((filePath) => (
      filePath.startsWith(expectedNvmPrefix)
    ));

    if (!allUseNvm) {
      issues.push(
        `WSL runtime is not using Linux NVM binaries (${expectedNvmPrefix}). Run: source ~/.profile && hash -r`
      );
    }
  }
}

async function resolvePlaywrightExecutable() {
  const moduleNames = ['@playwright/test', 'playwright'];
  for (const moduleName of moduleNames) {
    try {
      const module = await import(moduleName);
      const executablePath = module.chromium?.executablePath?.();
      if (executablePath) {
        return executablePath;
      }
    } catch {
      continue;
    }
  }
  return '';
}

function resolveFromPlaywrightCache() {
  if (!existsSync(defaultPlaywrightPath)) {
    return '';
  }

  const executableCandidates = [
    ['chrome-linux', 'chrome'],
    ['chrome-linux64', 'chrome'],
    ['chrome-headless-shell-linux', 'chrome-headless-shell'],
    ['chrome-headless-shell-linux64', 'chrome-headless-shell'],
  ];

  const browserDirs = readdirSync(defaultPlaywrightPath, { withFileTypes: true }).filter((entry) => (
    entry.isDirectory()
    && (entry.name.startsWith('chromium-') || entry.name.startsWith('chromium_headless_shell-'))
  ));

  for (const browserDir of browserDirs) {
    for (const segments of executableCandidates) {
      const candidate = [defaultPlaywrightPath, browserDir.name, ...segments].join('/');
      if (isExecutable(candidate)) {
        return candidate;
      }
    }
  }

  return '';
}

async function checkChromeAvailability() {
  const systemCandidates = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];

  const configured = (process.env.CHROME_BIN || '').trim();
  if (configured) {
    if (/\.exe$/i.test(configured) && isWsl) {
      issues.push(`CHROME_BIN points to Windows executable in WSL: ${configured}`);
    } else if (!isExecutable(configured)) {
      issues.push(`CHROME_BIN is configured but not executable: ${configured}`);
    } else {
      infos.push(`CHROME_BIN: ${configured}`);
      return;
    }
  }

  const systemChrome = systemCandidates.find((filePath) => isExecutable(filePath));
  if (systemChrome) {
    infos.push(`System Chrome/Chromium: ${systemChrome}`);
    return;
  }

  const playwrightChrome = await resolvePlaywrightExecutable();
  if (playwrightChrome && isExecutable(playwrightChrome)) {
    if (isWsl && /\.exe$/i.test(playwrightChrome)) {
      issues.push(`Playwright resolved a Windows browser executable in WSL: ${playwrightChrome}`);
      return;
    }
    infos.push(`Playwright Chromium: ${playwrightChrome}`);
    return;
  }

  const playwrightCacheChrome = resolveFromPlaywrightCache();
  if (playwrightCacheChrome) {
    infos.push(`Playwright cache Chromium: ${playwrightCacheChrome}`);
    return;
  }

  if (existsSync(defaultPlaywrightPath)) {
    warnings.push(
      `Playwright cache exists at ${defaultPlaywrightPath} but no executable Chromium was resolved.`
    );
  } else {
    warnings.push(`Playwright cache path does not exist: ${defaultPlaywrightPath}`);
  }

  issues.push(
    'No Linux Chrome/Chromium executable found. Install Chromium in WSL or run: npm run e2e:install'
  );
}

async function main() {
  if (process.platform !== 'linux') {
    warnings.push(`Detected platform ${process.platform}; CI/runtime baseline is Linux.`);
  }

  checkNodeRuntime();
  await checkChromeAvailability();

  console.log('=== shap_legal_ai_web test environment doctor ===');
  if (infos.length) {
    console.log('\nEnvironment details:');
    infos.forEach((line) => console.log(`- ${line}`));
  }

  if (warnings.length) {
    console.log('\nWarnings:');
    warnings.forEach((line) => console.log(`- ${line}`));
  }

  if (issues.length) {
    console.log('\nBlocking issues:');
    issues.forEach((line) => console.log(`- ${line}`));
    process.exit(1);
  }

  console.log('\nNo blocking issues detected.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
