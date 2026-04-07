#!/usr/bin/env node

import { accessSync, constants, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const IS_WSL = Boolean(process.env.WSL_DISTRO_NAME);
const PLAYWRIGHT_BROWSERS_PATH = process.env.PLAYWRIGHT_BROWSERS_PATH || '/tmp/ms-playwright';
const SAFE_TMP_DIR = '/tmp';

process.env.PLAYWRIGHT_BROWSERS_PATH = PLAYWRIGHT_BROWSERS_PATH;

if (IS_WSL) {
  process.env.TMPDIR = SAFE_TMP_DIR;
  process.env.TMP = SAFE_TMP_DIR;
  process.env.TEMP = SAFE_TMP_DIR;
}

function isExecutable(filePath) {
  if (!filePath) {
    return false;
  }

  try {
    accessSync(filePath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function isWindowsExecutable(filePath) {
  return /\.exe$/i.test(filePath ?? '');
}

function resolveFromSystem() {
  const candidates = [
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ];

  for (const candidate of candidates) {
    if (isExecutable(candidate)) {
      return candidate;
    }
  }

  return null;
}

async function resolveFromPlaywright() {
  const moduleNames = ['playwright', '@playwright/test'];

  for (const moduleName of moduleNames) {
    try {
      const playwrightModule = await import(moduleName);
      const chromium = playwrightModule.chromium;
      const executablePath = chromium?.executablePath?.();

      if (
        executablePath &&
        existsSync(executablePath) &&
        isExecutable(executablePath) &&
        !(IS_WSL && isWindowsExecutable(executablePath))
      ) {
        return executablePath;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function resolveFromPlaywrightCache() {
  const root = PLAYWRIGHT_BROWSERS_PATH;
  if (!existsSync(root)) {
    return null;
  }

  const executableCandidates = [
    ['chrome-linux', 'chrome'],
    ['chrome-linux64', 'chrome'],
    ['chrome-headless-shell-linux', 'chrome-headless-shell'],
    ['chrome-headless-shell-linux64', 'chrome-headless-shell']
  ];

  const browserDirs = readdirSync(root, { withFileTypes: true }).filter((entry) => (
    entry.isDirectory()
    && (entry.name.startsWith('chromium-') || entry.name.startsWith('chromium_headless_shell-'))
  ));

  for (const browserDir of browserDirs) {
    for (const segments of executableCandidates) {
      const candidate = path.join(root, browserDir.name, ...segments);
      if (isExecutable(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

function installPlaywrightChromium() {
  try {
    const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const result = spawnSync(npxCommand, ['playwright', 'install', 'chromium'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        PLAYWRIGHT_BROWSERS_PATH,
        TMPDIR: process.env.TMPDIR,
        TMP: process.env.TMP,
        TEMP: process.env.TEMP
      }
    });

    return result.status === 0;
  } catch {
    return false;
  }
}

async function resolveChromeBin() {
  const configuredChromeBin = process.env.CHROME_BIN?.trim();

  if (
    configuredChromeBin &&
    isExecutable(configuredChromeBin) &&
    !(IS_WSL && isWindowsExecutable(configuredChromeBin))
  ) {
    return configuredChromeBin;
  }

  const systemChrome = resolveFromSystem();
  if (systemChrome) {
    return systemChrome;
  }

  const playwrightChrome = await resolveFromPlaywright();
  if (playwrightChrome) {
    return playwrightChrome;
  }

  const playwrightCacheChrome = resolveFromPlaywrightCache();
  if (playwrightCacheChrome) {
    return playwrightCacheChrome;
  }

  if (installPlaywrightChromium()) {
    return (await resolveFromPlaywright()) || resolveFromPlaywrightCache();
  }

  return null;
}

async function run() {
  const configuredChromeBin = process.env.CHROME_BIN?.trim();
  const chromeBin = await resolveChromeBin();

  if (!chromeBin) {
    console.error('Unable to locate a Linux Chrome/Chromium binary for Karma.');
    console.error('If you are on WSL, do not set CHROME_BIN to a Windows .exe path.');
    console.error('Install Chromium in WSL or run: npm run e2e:install');
    process.exit(1);
  }

  if (IS_WSL && configuredChromeBin && isWindowsExecutable(configuredChromeBin)) {
    console.warn(
      `Ignoring CHROME_BIN=${configuredChromeBin} inside WSL and using ${chromeBin} instead.`
    );
  }

  const ngCliPath = path.resolve('node_modules', '@angular', 'cli', 'bin', 'ng.js');
  const cliArgs = [
    ngCliPath,
    'test',
    '--watch=false',
    '--browsers=ChromeHeadlessCI',
    ...process.argv.slice(2)
  ];
  const result = spawnSync(process.execPath, cliArgs, {
    stdio: 'inherit',
    env: {
      ...process.env,
      CHROME_BIN: chromeBin
    }
  });

  process.exit(result.status ?? 1);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
